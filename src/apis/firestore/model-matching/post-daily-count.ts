import {
  Timestamp,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * 주어진 날짜(YYYY-MM-DD)에 생성된 채팅방의 수를 반환합니다.
 * @param dateString 예: "2025-06-01"
 */
export async function countChatChannelsByDate(
  dateString: string
): Promise<number> {
  // 입력받은 날짜의 00:00:00 ~ 23:59:59 범위 계산
  const start = new Date(dateString + "T00:00:00.000Z");
  const end = new Date(dateString + "T23:59:59.999Z");

  // Firestore Timestamp로 변환
  const startTimestamp = Timestamp.fromDate(start);
  const endTimestamp = Timestamp.fromDate(end);

  // 쿼리 생성: createdAt >= start AND createdAt <= end
  const chatChannelsCol = collection(db, "modelMatchingChatChannels");
  const q = query(
    chatChannelsCol,
    where("createdAt", ">=", startTimestamp),
    where("createdAt", "<=", endTimestamp)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}
