import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * 주어진 기간(YYYY-MM-DD ~ YYYY-MM-DD)의 modelMatchingDailyCount 문서를 baseDate 오름차순으로 모두 가져옵니다.
 * @param startDate 예: "2025-06-01"
 * @param endDate 예: "2025-06-10"
 */
export async function getDailyCountsByPeriod(
  startDate: string,
  endDate: string
): Promise<{ id: string; dailyTotalCount: number; baseDate: string }[]> {
  // baseDate 기준 범위 쿼리 및 오름차순 정렬
  const dailyCountCol = collection(db, "modelMatchingDailyCount");
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
    baseDate: doc.data().baseDate
  }));
}
