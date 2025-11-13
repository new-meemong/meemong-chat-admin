import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { ChatChannelType } from "@/types/chat";
import { CHAT_CHANNEL_COLLECTIONS } from "./constants";

/**
 * 주어진 기간(YYYY-MM-DD ~ YYYY-MM-DD)의 dailyCount 문서를 baseDate 오름차순으로 모두 가져옵니다.
 * @param startDate 예: "2025-06-01"
 * @param endDate 예: "2025-06-10"
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function getDailyCountsByPeriod(
  startDate: string,
  endDate: string,
  channelType: ChatChannelType = 'model-matching'
): Promise<
  {
    id: string;
    dailyTotalCount: number;
    dailyTotalActiveCount: number;
    baseDate: string;
  }[]
> {
  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];
  // baseDate 기준 범위 쿼리 및 오름차순 정렬
  const dailyCountCol = collection(db, collections.dailyCount);
  const q = query(
    dailyCountCol,
    where("baseDate", ">=", startDate),
    where("baseDate", "<=", endDate),
    orderBy("baseDate", "asc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    dailyTotalCount: doc.data().dailyTotalCount ?? 0,
    dailyTotalActiveCount: doc.data().dailyTotalActiveCount ?? 0,
    baseDate: doc.data().baseDate
  }));
}
