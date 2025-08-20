import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { countDailyActiveChatChannelsByDate } from "./post-active-channel-daily-count";
import { db } from "@/lib/firebase";

/**
 * 주어진 날짜(YYYY-MM-DD)에 생성된 채팅방의 수를 반환합니다.
 * @param dateString 예: "2025-06-01"
 */
export async function countDailyNewChatChannelsByDate(
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

  // 문서 내용 없이 개수만 가져오기 (성능 최적화)
  const snapshot = await getCountFromServer(q);
  const count = snapshot.data().count;

  // dailyCreatedChannels 문서 생성/업데이트
  const dailyDocRef = doc(db, "modelMatchingDailyCount", dateString);
  const dailyDocSnap = await getDoc(dailyDocRef);
  if (!dailyDocSnap.exists()) {
    await setDoc(dailyDocRef, {
      dailyTotalCount: count,
      createdAt: Timestamp.now(),
      baseDate: dateString
    });
  }

  return count;
}

/**
 * modelMatchingDailyCount의 baseDate가 가장 최신인 데이터를 찾고,
 * 그 다음날부터 어제까지의 각 날짜별로 countChatChannelsByDate를 호출해 setDoc을 생성합니다.
 */
export async function countDailyNewChatChannels(): Promise<void> {
  // 1. 최신 baseDate 구하기 (내림차순 정렬, 1개 limit)
  const dailyCountCol = collection(db, "modelMatchingDailyCount");
  const q = query(dailyCountCol, orderBy("baseDate", "desc"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error(
      "modelMatchingDailyCount에 데이터가 없습니다. 최소 1개는 필요합니다."
    );
  }
  const latestDoc = snapshot.docs[0];
  const latestBaseDate = latestDoc.data().baseDate; // 예: "2025-06-05"

  // 2. 어제 날짜 구하기 (UTC 기준)
  const today = new Date();
  const yesterday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - 1
    )
  );

  // 3. 최신 baseDate 다음날부터 어제까지의 날짜 리스트 생성
  const dates: string[] = [];
  const d = new Date(latestBaseDate + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + 1); // 다음날부터 시작
  while (d <= yesterday) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // 4. 각 날짜별로 countChatChannelsByDate 호출
  for (const dateString of dates) {
    await countDailyNewChatChannelsByDate(dateString);
    await countDailyActiveChatChannelsByDate(dateString);
  }
}
