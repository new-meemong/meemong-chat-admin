import { collection, getCountFromServer } from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * 특정 userId의 전체 modelMatching 채널 개수를 반환합니다.
 * @param userId 유저의 Firestore userId (string)
 * @returns 채널 개수 (number)
 */
export async function fetchUserTotalChannelCount(
  userId: string
): Promise<number> {
  const userChannelsRef = collection(
    db,
    "users",
    userId,
    "userModelMatchingChatChannels"
  );
  // getCountFromServer는 Firestore에서 문서 개수만 빠르게 가져옵니다.
  const snapshot = await getCountFromServer(userChannelsRef);
  return snapshot.data().count;
}
