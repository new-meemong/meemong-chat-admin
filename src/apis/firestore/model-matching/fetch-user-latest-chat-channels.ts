import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

import { UserModelMatchingChatChannel } from "@/types/user-model-matching-chat-channels";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";

/**
 * 특정 userId의 userModelMatchingChatChannel 컬렉션에서
 * updatedAt 기준으로 최신 100개 채팅방을 가져오는 함수
 */
export async function fetchUserLatestChatChannels(
  userId: string
): Promise<UserModelMatchingChatChannel[]> {
  try {
    const userChannelsRef = collection(
      db,
      "users",
      userId,
      "userModelMatchingChatChannels"
    );
    const q = query(userChannelsRef, orderBy("updatedAt", "desc"), limit(100));
    const snapshot = await getDocs(q);

    // userId로 currentUser 정보 패치
    const currentUser = await getUser(Number(userId));

    return snapshot.docs.map((doc) => {
      const data = doc.data() as UserModelMatchingChatChannel;
      return {
        ...data,
        channelId: doc.id, // doc.id가 channelId와 일치한다고 가정
        currentUser
      };
    });
  } catch (error) {
    console.error("fetchUserLatestChatChannelsByUserModel 에러:", error);
    throw error;
  }
}
