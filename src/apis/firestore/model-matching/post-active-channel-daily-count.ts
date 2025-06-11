import {
  Timestamp,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * 특정 날짜에 메시지가 1개 이상 존재하는 채널 수 조회
 * @param dateString "YYYY-MM-DD" 포맷의 날짜 문자열
 */
export async function countDailyActiveChatChannelsByDate(
  dateString: string
): Promise<number> {
  // 1) 날짜 범위 계산
  const [year, month, day] = dateString.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  // 2) collectionGroup 쿼리
  const q = query(
    collectionGroup(db, "messages"),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end))
  );

  const snap = await getDocs(q);

  // 3) 부모 채널 ID만 추출해 Set으로 중복 제거
  const channelIdSet = new Set<string>();
  snap.docs.forEach((doc) => {
    // 메시지 문서 경로: modelMatchingChatChannels/{channelId}/messages/{messageId}
    const channelId = doc.ref.parent.parent?.id;
    if (channelId) channelIdSet.add(channelId);
  });

  // 4) modelMatchingDailyCount 문서에 dailyTotalActiveCount 저장
  const dailyDocRef = doc(db, "modelMatchingDailyCount", dateString);
  const dailyDocSnap = await getDoc(dailyDocRef);
  if (!dailyDocSnap.exists()) {
    await setDoc(dailyDocRef, {
      dailyTotalActiveCount: channelIdSet.size,
      createdAt: Timestamp.now(),
      baseDate: dateString
    });
  } else {
    await setDoc(
      dailyDocRef,
      {
        dailyTotalActiveCount: channelIdSet.size
      },
      { merge: true }
    );
  }

  return channelIdSet.size;
}
