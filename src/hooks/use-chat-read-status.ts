"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Timestamp, doc, onSnapshot } from "firebase/firestore";

import { CHAT_V2_SERVICES } from "@/apis/firestore/constants";
import { ChatChannelType } from "@/types/chat";
import { db } from "@/lib/firebase";
import { normalizeChatParticipantIds } from "@/apis/firestore/normalize-chat-participant-ids";

type ReadStatusAvailability =
  | "ready"
  | "missing"
  | "unreadable"
  | "timeout"
  | "error";

export interface ChatReadStatusSummary {
  isLoading: boolean;
  hasError: boolean;
  hasMissingRecord: boolean;
  hasUnreadableValue: boolean;
  hasTimedOut: boolean;
  hasStaleValue: boolean;
  hasInvalidParticipantCount: boolean;
}

interface UserReadStatus {
  lastReadAt: Timestamp | null;
  availability: ReadStatusAvailability;
  isStale: boolean;
}

type ReadStatusByUserId = Record<string, UserReadStatus>;

interface ReadState {
  key: string;
  readStatusByUserId: ReadStatusByUserId;
}

const EMPTY_STATE: ReadState = {
  key: "",
  readStatusByUserId: {}
};

const MAX_RETRY_COUNT = 3;
const RETRY_WINDOW_MS = 60_000;
const RESPONSE_TIMEOUT_MS = 10_000;
const TIMEOUT_RETRY_DELAY_MS = 30_000;
const RETRYABLE_ERROR_CODES = new Set([
  "aborted",
  "cancelled",
  "deadline-exceeded",
  "internal",
  "resource-exhausted",
  "unavailable",
  "unknown"
]);

function isRetryableError(error: { code?: string }) {
  return Boolean(error.code && RETRYABLE_ERROR_CODES.has(error.code));
}

/**
 * Firestore Timestamp가 아닌 값(plain map, serverTimestamp sentinel 등)이 저장돼 있어도
 * 렌더 도중 throw 하지 않도록 방어한다.
 */
function toMillis(value: unknown): number | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("toMillis" in value) ||
    typeof value.toMillis !== "function"
  ) {
    return null;
  }

  return value.toMillis();
}

function setUserReadStatus(
  current: ReadState,
  userId: string,
  nextStatus: UserReadStatus
) {
  const previous = current.readStatusByUserId[userId];
  if (
    previous?.availability === nextStatus.availability &&
    previous.isStale === nextStatus.isStale &&
    toMillis(previous.lastReadAt) === toMillis(nextStatus.lastReadAt)
  ) {
    return current;
  }

  return {
    ...current,
    readStatusByUserId: {
      ...current.readStatusByUserId,
      [userId]: nextStatus
    }
  };
}

function clearUserReadStatus(current: ReadState, userId: string) {
  if (!current.readStatusByUserId[userId]) return current;

  const nextReadStatusByUserId = { ...current.readStatusByUserId };
  delete nextReadStatusByUserId[userId];
  return { ...current, readStatusByUserId: nextReadStatusByUserId };
}

export function useChatReadStatus(
  channelId: string,
  channelType: ChatChannelType,
  participantIds: Array<number | string>
) {
  const participantKey = useMemo(
    () => normalizeChatParticipantIds(participantIds).join(","),
    [participantIds]
  );
  const userIds = useMemo(
    () => (participantKey ? participantKey.split(",") : []),
    [participantKey]
  );
  const stateKey = `${channelType}/${channelId}/${participantKey}`;
  const [readState, setReadState] = useState<ReadState>(EMPTY_STATE);
  // 채널이 바뀌면 이전 채널의 읽음 상태로 판정하지 않도록 렌더 시점에 무효화한다.
  const { readStatusByUserId } =
    readState.key === stateKey ? readState : EMPTY_STATE;
  const readStatus: ChatReadStatusSummary = {
    isLoading:
      Boolean(channelId) &&
      userIds.length === 2 &&
      userIds.some((userId) => !readStatusByUserId[userId]),
    hasError: userIds.some(
      (userId) => readStatusByUserId[userId]?.availability === "error"
    ),
    hasMissingRecord: userIds.some(
      (userId) => readStatusByUserId[userId]?.availability === "missing"
    ),
    hasUnreadableValue: userIds.some(
      (userId) => readStatusByUserId[userId]?.availability === "unreadable"
    ),
    hasTimedOut: userIds.some(
      (userId) => readStatusByUserId[userId]?.availability === "timeout"
    ),
    hasStaleValue: userIds.some(
      (userId) => readStatusByUserId[userId]?.isStale === true
    ),
    // 현재 채팅 도메인은 2인 채널만 지원한다.
    hasInvalidParticipantCount: userIds.length !== 2
  };

  useEffect(() => {
    if (!channelId || userIds.length !== 2) return;

    let isActive = true;
    const { userChannelCollection } = CHAT_V2_SERVICES[channelType];
    const unsubscribesByUserId: Record<string, () => void> = {};
    const retryTimeoutsByUserId: Record<
      string,
      ReturnType<typeof setTimeout>
    > = {};
    const timeoutRetryTimeoutsByUserId: Record<
      string,
      ReturnType<typeof setTimeout>
    > = {};
    const responseTimeoutsByUserId: Record<
      string,
      ReturnType<typeof setTimeout>
    > = {};
    const retryTimestampsByUserId: Record<string, number[]> = {};
    const hasServerResponseByUserId: Record<string, boolean> = {};
    const hasScheduledTimeoutRetryByUserId: Record<string, boolean> = {};
    const updateState = (update: (current: ReadState) => ReadState) =>
      setReadState((current) =>
        update(
          current.key === stateKey ? current : { ...EMPTY_STATE, key: stateKey }
        )
      );

    function armResponseTimeout(userId: string) {
      clearTimeout(responseTimeoutsByUserId[userId]);
      responseTimeoutsByUserId[userId] = setTimeout(() => {
        if (!isActive) return;

        updateState((current) =>
          setUserReadStatus(current, userId, {
            lastReadAt: null,
            availability: "timeout",
            isStale: false
          })
        );

        if (
          !hasScheduledTimeoutRetryByUserId[userId] &&
          !timeoutRetryTimeoutsByUserId[userId]
        ) {
          hasScheduledTimeoutRetryByUserId[userId] = true;
          timeoutRetryTimeoutsByUserId[userId] = setTimeout(() => {
            delete timeoutRetryTimeoutsByUserId[userId];
            if (!isActive) return;

            subscribe(userId);
          }, TIMEOUT_RETRY_DELAY_MS);
        }
      }, RESPONSE_TIMEOUT_MS);
    }

    function subscribe(userId: string) {
      unsubscribesByUserId[userId]?.();
      hasServerResponseByUserId[userId] = false;
      armResponseTimeout(userId);
      unsubscribesByUserId[userId] = onSnapshot(
        doc(db, "users", userId, userChannelCollection, channelId),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (!isActive) return;

          if (snapshot.metadata.fromCache) {
            // 서버에서 확인했던 값은 유지하되, 최신 상태가 아닐 수 있음을
            // 별도로 표시한다. 최초 캐시 응답은 서버 확인 전이므로 사용하지 않는다.
            if (hasServerResponseByUserId[userId]) {
              hasServerResponseByUserId[userId] = false;
              updateState((current) => {
                const previous = current.readStatusByUserId[userId];
                return previous
                  ? setUserReadStatus(current, userId, {
                      ...previous,
                      isStale: true
                    })
                  : current;
              });
            }
            return;
          }

          clearTimeout(responseTimeoutsByUserId[userId]);
          clearTimeout(timeoutRetryTimeoutsByUserId[userId]);
          delete timeoutRetryTimeoutsByUserId[userId];
          hasServerResponseByUserId[userId] = true;

          if (!snapshot.exists()) {
            updateState((current) =>
              setUserReadStatus(current, userId, {
                lastReadAt: null,
                availability: "missing",
                isStale: false
              })
            );
            return;
          }

          const rawLastReadAt: unknown = snapshot.data().lastReadAt;
          const isUnreadable =
            rawLastReadAt != null && toMillis(rawLastReadAt) === null;

          updateState((current) =>
            setUserReadStatus(current, userId, {
              lastReadAt: isUnreadable
                ? null
                : ((rawLastReadAt as Timestamp | null | undefined) ?? null),
              availability: isUnreadable ? "unreadable" : "ready",
              isStale: false
            })
          );
        },
        (error) => {
          if (!isActive) return;

          clearTimeout(responseTimeoutsByUserId[userId]);
          clearTimeout(timeoutRetryTimeoutsByUserId[userId]);
          delete timeoutRetryTimeoutsByUserId[userId];
          console.warn(
            `[useChatReadStatus] ${userId} 사용자의 읽음 상태를 불러오지 못했습니다.`,
            error
          );

          const now = Date.now();
          const recentRetryTimestamps = (
            retryTimestampsByUserId[userId] ?? []
          ).filter((timestamp) => now - timestamp < RETRY_WINDOW_MS);
          retryTimestampsByUserId[userId] = recentRetryTimestamps;

          if (
            isRetryableError(error) &&
            recentRetryTimestamps.length < MAX_RETRY_COUNT
          ) {
            updateState((current) => clearUserReadStatus(current, userId));
            retryTimestampsByUserId[userId] = [
              ...recentRetryTimestamps,
              now
            ];
            const retryDelay = Math.min(
              1000 * 2 ** recentRetryTimestamps.length,
              8000
            );
            retryTimeoutsByUserId[userId] = setTimeout(() => {
              if (isActive) subscribe(userId);
            }, retryDelay);
            return;
          }

          updateState((current) =>
            setUserReadStatus(current, userId, {
              lastReadAt: null,
              availability: "error",
              isStale: false
            })
          );
        }
      );
    }

    userIds.forEach(subscribe);

    return () => {
      isActive = false;
      Object.values(retryTimeoutsByUserId).forEach(clearTimeout);
      Object.values(timeoutRetryTimeoutsByUserId).forEach(clearTimeout);
      Object.values(responseTimeoutsByUserId).forEach(clearTimeout);
      Object.values(unsubscribesByUserId).forEach((unsubscribe) =>
        unsubscribe()
      );
    };
  }, [channelId, channelType, stateKey, userIds]);

  const readWatermarkBySenderId = useMemo(() => {
    if (userIds.length !== 2) return {};

    const [firstUserId, secondUserId] = userIds;
    return {
      [firstUserId]: toMillis(
        readStatusByUserId[secondUserId]?.lastReadAt
      ),
      [secondUserId]: toMillis(readStatusByUserId[firstUserId]?.lastReadAt)
    };
  }, [readStatusByUserId, userIds]);

  const isMessageRead = useCallback(
    (senderId: number | string, messageCreatedAt: Timestamp | null) => {
      // 로딩/timeout은 초기 확인이 끝나지 않은 상태라 부분 결과를 모두 숨긴다.
      // 명시적 error는 사용자별 실패이므로, 정상 수신자의 watermark 방향은
      // 경고 배너와 함께 계속 제공한다.
      if (readStatus.isLoading || readStatus.hasTimedOut) return false;

      const createdAtMillis = toMillis(messageCreatedAt);
      if (createdAtMillis === null) return false;

      const numericSenderId = Number(senderId);
      if (!Number.isFinite(numericSenderId) || numericSenderId <= 0) {
        return false;
      }

      const senderKey = String(numericSenderId);
      const readWatermark = readWatermarkBySenderId[senderKey];

      return readWatermark != null && createdAtMillis <= readWatermark;
    },
    [readStatus.hasTimedOut, readStatus.isLoading, readWatermarkBySenderId]
  );

  return { isMessageRead, readStatus };
}
