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

    return await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as UserModelMatchingChatChannel;
        const channelId = doc.id;

        // messages 서브컬렉션 전체 메시지 개수 구하기
        const messagesColRef = collection(
          db,
          "modelMatchingChatChannels",
          channelId,
          "messages"
        );
        const allMsgsSnap = await getDocs(messagesColRef);
        const messageCount = allMsgsSnap.size;

        // 첫 번째 메시지(senderId) 구하기 (createdAt 오름차순)
        let openUserId: number | null = null;
        if (!allMsgsSnap.empty) {
          // createdAt 오름차순 정렬
          const sortedDocs = allMsgsSnap.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis?.() ?? 0;
            const bTime = b.data().createdAt?.toMillis?.() ?? 0;
            return aTime - bTime;
          });
          const firstMsg = sortedDocs[0];
          openUserId = Number(firstMsg.data().senderId);
        }

        return {
          ...data,
          channelId,
          currentUser,
          messageCount,
          openUserId
        };
      })
    );
  } catch (error) {
    console.error("fetchUserLatestChatChannelsByUserModel 에러:", error);
    throw error;
  }
}
