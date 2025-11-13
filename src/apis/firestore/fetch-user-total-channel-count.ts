import { collection, getCountFromServer } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { ChatChannelType } from "@/types/chat";
import { CHAT_CHANNEL_COLLECTIONS } from "./constants";

/**
 * 특정 userId의 전체 채널 개수를 반환합니다.
 * @param userId 유저의 Firestore userId (string)
 * @param channelType 채널 타입 (기본값: 'model-matching')
 * @returns 채널 개수 (number)
 */
export async function fetchUserTotalChannelCount(
  userId: string,
  channelType: ChatChannelType = 'model-matching'
): Promise<number> {
  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];
  const userChannelsRef = collection(
    db,
    "users",
    userId,
    collections.userChannels
  );
  // getCountFromServer는 Firestore에서 문서 개수만 빠르게 가져옵니다.
  const snapshot = await getCountFromServer(userChannelsRef);
  return snapshot.data().count;
}
