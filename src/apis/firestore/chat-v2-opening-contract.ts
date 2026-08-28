import type {
  ChatV2Opening,
  ChatV2OpenMethod,
  ChatV2OpenState
} from "@/types/chat";
import { Timestamp } from "firebase/firestore";

const OPEN_STATES = new Set<ChatV2OpenState>(["NOT_OPENED", "OPENED"]);
const OPEN_METHODS = new Set<ChatV2OpenMethod>([
  "MONG",
  "GROWTH_PASS",
  "MEEMONG_PASS",
  "FREE_POLICY",
  "AD",
  "NONE"
]);

function objectData(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : null;
}

function nullableTimestamp(value: unknown, fieldName: string): Timestamp | null {
  if (value == null) return null;
  if (!(value instanceof Timestamp)) {
    throw new Error(`${fieldName}는 Timestamp이거나 null이어야 합니다.`);
  }
  return value;
}

/** Flutter의 ChatV2Opening 저장 계약을 관리자 읽기 경계에서 검증한다. */
export function parseChatV2Opening(
  rawData: unknown,
  expectedIdentity?: { userId: string; channelId: string }
): ChatV2Opening {
  const data = objectData(rawData);
  if (!data) throw new Error("v2 사용자 채널 메타가 객체가 아닙니다.");

  if (expectedIdentity) {
    if (data.userId !== expectedIdentity.userId) {
      throw new Error("v2 사용자 채널 메타의 userId가 경로와 다릅니다.");
    }
    if (data.channelId !== expectedIdentity.channelId) {
      throw new Error("v2 사용자 채널 메타의 channelId가 경로와 다릅니다.");
    }
  }

  if (!OPEN_STATES.has(data.openState as ChatV2OpenState)) {
    throw new Error("v2 사용자 채널 메타의 openState가 올바르지 않습니다.");
  }
  if (!OPEN_METHODS.has(data.openMethod as ChatV2OpenMethod)) {
    throw new Error("v2 사용자 채널 메타의 openMethod가 올바르지 않습니다.");
  }

  const state = data.openState as ChatV2OpenState;
  const storedMethod = data.openMethod as ChatV2OpenMethod;
  if (state === "NOT_OPENED" && storedMethod !== "NONE") {
    throw new Error("미개봉 v2 채널의 openMethod는 NONE이어야 합니다.");
  }

  const rawAmount = data.openedMongAmount;
  const openedMongAmount =
    typeof rawAmount === "number" &&
    Number.isSafeInteger(rawAmount) &&
    rawAmount > 0
      ? rawAmount
      : null;
  if (rawAmount != null && openedMongAmount == null) {
    throw new Error("openedMongAmount는 양수 정수이거나 null이어야 합니다.");
  }

  // isRefunded는 환불 종료 시 양쪽 참가자 문서에 기록되지만 deleteReason은
  // 실제 환불받은 참가자에게만 기록된다. 두 의미를 관리자 모델에서 분리한다.
  const isChannelRefunded = data.isRefunded === true;
  const isRefundRecipient =
    isChannelRefunded && data.deleteReason === "REFUND_AFTER_NO_REPLY";
  const openedAt = nullableTimestamp(data.openedAt, "openedAt");
  const awaitingReply = data.awaitingReply === true;
  const awaitingReplyStartedAt = nullableTimestamp(
    data.awaitingReplyStartedAt,
    "awaitingReplyStartedAt"
  );
  if (awaitingReply && awaitingReplyStartedAt == null) {
    throw new Error("답장 대기 중인 v2 채널에는 시작 시각이 필요합니다.");
  }
  // Node 결제 성공이 OPENED 저장보다 먼저 도착할 수 있어 앱 projection과 같은
  // 호환 증거를 인정한다. 방의 환불 종료 증거는 이 승격보다 항상 우선한다.
  const hasPaidCompatibilityMarker =
    !isChannelRefunded &&
    (data.isPaid === true || data.isOpenUsingMong === true);
  const method = hasPaidCompatibilityMarker ? "MONG" : storedMethod;

  if (storedMethod === "MONG") {
    if (state !== "OPENED" || openedMongAmount == null) {
      throw new Error("MONG 개봉에는 양수 openedMongAmount가 필요합니다.");
    }
  } else if (method !== "MONG" && rawAmount != null) {
    throw new Error("MONG 이외의 개봉에는 openedMongAmount가 없어야 합니다.");
  }

  return {
    state,
    method,
    openedMongAmount,
    openedAt,
    entrySource:
      nullableString(data.entrySource) ?? nullableString(data.originEntrySource),
    awaitingReply,
    awaitingReplyStartedAt,
    isChannelRefunded,
    isRefundRecipient
  };
}
