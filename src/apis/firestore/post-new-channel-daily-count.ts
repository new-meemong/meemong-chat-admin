import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where
} from "firebase/firestore";

import { countDailyActiveChatChannelsByDate } from "./post-active-channel-daily-count";
import { db } from "@/lib/firebase";
import { DailyCountChannelType } from "@/types/chat";
import {
  CHAT_V2_SCHEMA_VERSION,
  CHAT_V2_SERVICES,
  DAILY_COUNT_REFRESH_DATE_LIMIT,
  DAILY_COUNT_SCAN_PAGE_SIZE,
  FIRESTORE_SCAN_PAGE_SIZE
} from "./constants";
import { isV2Document, parseChatV2ChannelIdentity } from "./chat-v2-contract";
import {
  isCompleteV2DailyCountDocument
} from "./daily-count-contract";
import type { DailyChannelCountResult } from "./daily-count-contract";
import {
  addDateStringDays,
  buildPendingDailyCountDateBatch,
  kstDateString,
  kstDayRange,
  yesterdayKstDateString
} from "./daily-count-date";

export interface DailyCountRefreshSummary {
  processedDateCount: number;
  remainingDateCount: number;
  invalidNewChannelCount: number;
  invalidActiveChannelCount: number;
}

async function findLatestCompleteV2DailyCountDate(
  channelType: DailyCountChannelType
): Promise<string | null> {
  const { dailyCount } = CHAT_V2_SERVICES[channelType];
  const dailyCounts = collection(db, dailyCount);
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

  while (true) {
    const page: QuerySnapshot<DocumentData> = await getDocs(
      cursor
        ? query(
            dailyCounts,
            orderBy("baseDate", "desc"),
            startAfter(cursor),
            limit(DAILY_COUNT_SCAN_PAGE_SIZE)
          )
        : query(
            dailyCounts,
            orderBy("baseDate", "desc"),
            limit(DAILY_COUNT_SCAN_PAGE_SIZE)
          )
    );
    if (page.empty) return null;
    const completeDocument = page.docs.find((document) =>
      isCompleteV2DailyCountDocument(document.data())
    );
    if (completeDocument) return completeDocument.data().baseDate as string;
    cursor = page.docs.at(-1) ?? null;
    if (page.size < DAILY_COUNT_SCAN_PAGE_SIZE) return null;
  }
}

async function findEarliestV2ChannelDate(
  channelType: DailyCountChannelType
): Promise<string | null> {
  const config = CHAT_V2_SERVICES[channelType];
  const channels = collection(db, config.sourceCollection);
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

  while (true) {
    const page: QuerySnapshot<DocumentData> = await getDocs(
      cursor
        ? query(
            channels,
            orderBy("createdAt", "asc"),
            startAfter(cursor),
            limit(FIRESTORE_SCAN_PAGE_SIZE)
          )
        : query(
            channels,
            orderBy("createdAt", "asc"),
            limit(FIRESTORE_SCAN_PAGE_SIZE)
          )
    );
    if (page.empty) return null;
    for (const document of page.docs) {
      if (!isV2Document(document.data())) continue;
      try {
        parseChatV2ChannelIdentity({
          documentId: document.id,
          chatType: channelType,
          rawData: document.data()
        });
        const createdAt = document.data().createdAt;
        if (!(createdAt instanceof Timestamp)) {
          throw new Error(`${document.id}의 createdAt이 Timestamp가 아닙니다.`);
        }
        return kstDateString(createdAt.toDate());
      } catch (error) {
        console.warn(
          `[findEarliestV2ChannelDate] invalid v2 channel: ${document.id}`,
          error
        );
      }
    }
    cursor = page.docs.at(-1) ?? null;
    if (page.size < FIRESTORE_SCAN_PAGE_SIZE) return null;
  }
}

/**
 * 주어진 날짜(YYYY-MM-DD)에 생성된 채팅방의 수를 반환합니다.
 * @param dateString 예: "2025-06-01"
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function countDailyNewChatChannelsByDate(
  dateString: string,
  channelType: DailyCountChannelType = 'model-matching'
): Promise<DailyChannelCountResult> {
  const config = CHAT_V2_SERVICES[channelType];
  const { start, end } = kstDayRange(dateString);

  // Firestore Timestamp로 변환
  const startTimestamp = Timestamp.fromDate(start);
  const endTimestamp = Timestamp.fromDate(end);

  // 쿼리 생성: createdAt >= start AND createdAt <= end
  const chatChannelsCol = collection(db, config.sourceCollection);
  const q = query(
    chatChannelsCol,
    where("createdAt", ">=", startTimestamp),
    where("createdAt", "<=", endTimestamp)
  );

  const snapshot = await getDocs(q);
  let count = 0;
  let invalidDocumentCount = 0;
  for (const document of snapshot.docs) {
    if (!isV2Document(document.data())) continue;
    try {
      parseChatV2ChannelIdentity({
        documentId: document.id,
        chatType: channelType,
        rawData: document.data()
      });
      count += 1;
    } catch (error) {
      invalidDocumentCount += 1;
      console.warn(
        `[countDailyNewChatChannelsByDate] invalid v2 channel: ${document.id}`,
        error
      );
    }
  }

  // dailyCreatedChannels 문서 생성/업데이트
  const dailyDocRef = doc(db, config.dailyCount, dateString);
  await setDoc(
    dailyDocRef,
    {
      schemaVersion: CHAT_V2_SCHEMA_VERSION,
      dailyTotalCount: count,
      dailyInvalidNewChannelCount: invalidDocumentCount,
      updatedAt: Timestamp.now(),
      baseDate: dateString
    },
    { merge: true }
  );

  return { count, invalidDocumentCount };
}

/**
 * dailyCount의 baseDate가 가장 최신인 데이터를 찾고,
 * 그 다음날부터 어제까지의 각 날짜별로 countChatChannelsByDate를 호출해 setDoc을 생성합니다.
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function countDailyNewChatChannels(
  channelType: DailyCountChannelType = 'model-matching'
): Promise<DailyCountRefreshSummary> {
  // 최신 v2 집계 문서가 없으면 최초 v2 채널 생성일부터 집계를 시작한다.
  let latestBaseDate = await findLatestCompleteV2DailyCountDate(channelType);
  if (!latestBaseDate) {
    const earliestV2Date = await findEarliestV2ChannelDate(channelType);
    if (!earliestV2Date) {
      return {
        processedDateCount: 0,
        remainingDateCount: 0,
        invalidNewChannelCount: 0,
        invalidActiveChannelCount: 0
      };
    }
    latestBaseDate = addDateStringDays(earliestV2Date, -1);
  }

  // 브라우저 mutation 한 번에 최대 30일만 처리하고 다음 클릭에서 이어간다.
  const yesterday = yesterdayKstDateString();
  const { dates, remainingDateCount } = buildPendingDailyCountDateBatch({
    afterDate: latestBaseDate,
    throughDate: yesterday,
    limit: DAILY_COUNT_REFRESH_DATE_LIMIT
  });

  let invalidNewChannelCount = 0;
  let invalidActiveChannelCount = 0;
  for (const dateString of dates) {
    const newChannels = await countDailyNewChatChannelsByDate(
      dateString,
      channelType
    );
    const activeChannels = await countDailyActiveChatChannelsByDate(
      dateString,
      channelType
    );
    invalidNewChannelCount += newChannels.invalidDocumentCount;
    invalidActiveChannelCount += activeChannels.invalidDocumentCount;
  }
  return {
    processedDateCount: dates.length,
    remainingDateCount,
    invalidNewChannelCount,
    invalidActiveChannelCount
  };
}
