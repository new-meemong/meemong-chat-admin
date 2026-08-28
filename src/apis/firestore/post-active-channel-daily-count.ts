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
import { DailyCountChannelType } from "@/types/chat";
import { CHAT_V2_SCHEMA_VERSION, CHAT_V2_SERVICES } from "./constants";
import { isV2Document, parseChatV2ChannelIdentity } from "./chat-v2-contract";
import { kstDayRange } from "./daily-count-date";
import type { DailyChannelCountResult } from "./daily-count-contract";

/**
 * 특정 날짜에 메시지가 1개 이상 존재하는 채널 수 조회
 * @param dateString "YYYY-MM-DD" 포맷의 날짜 문자열
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function countDailyActiveChatChannelsByDate(
  dateString: string,
  channelType: DailyCountChannelType = 'model-matching'
): Promise<DailyChannelCountResult> {
  const config = CHAT_V2_SERVICES[channelType];
  const { start, end } = kstDayRange(dateString);

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
    const channelReference = doc.ref.parent.parent;
    if (channelReference?.parent.id === config.sourceCollection) {
      channelIdSet.add(channelReference.id);
    }
  });

  const validationResults =
    await Promise.all(
      [...channelIdSet].map(async (channelId) => {
        const snapshot = await getDoc(
          doc(db, config.sourceCollection, channelId)
        );
        if (!snapshot.exists() || !isV2Document(snapshot.data())) return null;
        try {
          parseChatV2ChannelIdentity({
            documentId: snapshot.id,
            chatType: channelType,
            rawData: snapshot.data()
          });
          return "valid" as const;
        } catch (error) {
          console.warn(
            `[countDailyActiveChatChannelsByDate] invalid v2 channel: ${channelId}`,
            error
          );
          return "invalid" as const;
        }
      })
    );
  const count = validationResults.filter((result) => result === "valid").length;
  const invalidDocumentCount = validationResults.filter(
    (result) => result === "invalid"
  ).length;

  // 단독 활성 집계와 신규→활성 갱신이 같은 문서 shape을 만들도록 merge한다.
  const dailyDocRef = doc(db, config.dailyCount, dateString);
  await setDoc(
    dailyDocRef,
    {
      schemaVersion: CHAT_V2_SCHEMA_VERSION,
      dailyTotalActiveCount: count,
      dailyInvalidActiveChannelCount: invalidDocumentCount,
      updatedAt: Timestamp.now(),
      baseDate: dateString
    },
    { merge: true }
  );

  return { count, invalidDocumentCount };
}
