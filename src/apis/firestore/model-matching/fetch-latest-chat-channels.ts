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
import { db } from "@/lib/firebase";

export interface ModelMatchingChatMessage {
  id: string;
  message: string;
  messageType: string;
  senderId: string;
  createdAt: Timestamp;
}

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

      const lastMessage: ModelMatchingChatMessage | null = msgSnap.empty
        ? null
        : {
            id: msgSnap.docs[0].id,
            message: msgSnap.docs[0].data().message,
            messageType: msgSnap.docs[0].data().messageType,
            senderId: msgSnap.docs[0].data().senderId,
            createdAt: msgSnap.docs[0].data().createdAt as Timestamp
          };
      // ─────────────────────────────────────────────────────────

      return {
        id: channelId,
        channelKey: data.channelKey,
        participantsIds: data.participantsIds,
        channelOpenUserId: data.channelOpenUserId,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        // 필요하다면 추가 필드(unreadCount, otherUser 등)를 여기에 포함
        lastMessage
      };
    })
  );

  return channelsWithLastMsg;
}
