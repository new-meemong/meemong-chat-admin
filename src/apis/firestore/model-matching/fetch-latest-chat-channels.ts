import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query
} from "firebase/firestore";

import { ModelMatchingChatChannel } from "@/types/model-matching-chat-channel";
import { ModelMatchingChatMessage } from "@/types/model-matching-chat-message";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";

/**
 * 최신 채팅방(채널) 100개를 가져오고, 각 채널의 마지막 메시지도 함께 조회하는 함수
 */
export async function fetchLatestChatChannels(): Promise<
  (ModelMatchingChatChannel & {
    lastMessage: ModelMatchingChatMessage | null;
  })[]
> {
  // 1) 컬렉션 참조 생성
  const chatChannelsCol = collection(db, "modelMatchingChatChannels");

  // 2) 쿼리: updatedAt 내림차순, 최대 100개
  const q = query(chatChannelsCol, orderBy("updatedAt", "desc"), limit(100));

  // 3) 쿼리 실행 (getDocs)
  const snapshot = await getDocs(q);

  // 4) 문서 스냅샷을 비동기로 순회하며, lastMessage도 함께 조회
  const channelsWithLastMsg = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data() as DocumentData;
      const channelId = doc.id;
      const participantsIds: number[] = data.participantsIds;

      // participantsIds에서 'system' 제외
      const filteredParticipantsIds = participantsIds.filter(
        (userId) => String(userId) !== "system"
      );
      // filteredParticipantsIds로 users 정보 모두 가져오기
      let users = await Promise.all(
        filteredParticipantsIds.map(async (userId: number) => {
          try {
            return await getUser(userId);
          } catch (e) {
            console.warn(
              `[fetchLatestChatChannels] getUser failed for ${userId}`,
              e
            );
            return null;
          }
        })
      );
      // users에서 null 값 제거
      users = users.filter((user) => user !== null);

      // ─── 추가: messages 서브컬렉션에서 마지막 메시지 조회 ───
      const messagesCol = collection(
        db,
        "modelMatchingChatChannels",
        channelId,
        "messages"
      );
      const msgQuery = query(
        messagesCol,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const msgSnap = await getDocs(msgQuery);

      // 전체 메시지 개수 카운트
      const allMsgsSnap = await getDocs(messagesCol);
      const messageCount = allMsgsSnap.size;

      let lastMessage: ModelMatchingChatMessage | null = null;
      if (!msgSnap.empty) {
        const msgData = msgSnap.docs[0].data();
        const senderId = msgData.senderId;
        // users 배열에서 senderUser 찾기
        const senderUser = users.find((user) => user?.id === senderId) || null;
        lastMessage = {
          id: msgSnap.docs[0].id,
          message: msgData.message,
          messageType: msgData.messageType,
          senderId: senderId,
          createdAt: msgData.createdAt as Timestamp,
          updatedAt: msgData.updatedAt as Timestamp,
          user: senderUser
        };
      }
      // ─────────────────────────────────────────────────────────

      return {
        id: channelId,
        channelKey: data.channelKey,
        participantsIds: filteredParticipantsIds,
        channelOpenUserId: Number(data.channelOpenUserId),
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        // 필요하다면 추가 필드(unreadCount, otherUser 등)를 여기에 포함
        lastMessage,
        users,
        messageCount
      };
    })
  );

  return channelsWithLastMsg;
}
