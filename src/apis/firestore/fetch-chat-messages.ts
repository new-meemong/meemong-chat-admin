import { ChatChannelType, ChatMessage } from "@/types/chat";
import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query
} from "firebase/firestore";

import { CHAT_CHANNEL_COLLECTIONS } from "./constants";
import { ChatMessageTypeEnum } from "@/types/enums";
import { User } from "@/types/user";
import { db } from "@/lib/firebase";

/**
 * 특정 채널의 모든 메시지를 가져오는 함수
 * @param channelId 채널 ID
 * @param users 사용자 목록 (senderId 매핑용)
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function fetchChatMessages(
  channelId: string,
  users: User[],
  channelType: ChatChannelType = "model-matching"
): Promise<ChatMessage[]> {
  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];

  // 1. 해당 채널의 messages 서브컬렉션 참조 생성
  const messagesColRef = collection(
    db,
    collections.channels,
    channelId,
    "messages"
  );

  // 2. 쿼리: createdAt 오름차순 정렬 (가장 오래된 순 → 최신 순)
  const q = query(messagesColRef, orderBy("createdAt", "asc"));

  // 3. 쿼리 실행
  const snapshot = await getDocs(q);

  // 4. 스냅샷 문서를 ChatMessage 형태로 매핑
  const messages: ChatMessage[] = snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;

    return {
      id: doc.id,
      message: data.message,
      messageType: data.messageType as ChatMessageTypeEnum,
      metaPathList: data.metaPathList || [],
      senderId: Number(data.senderId),
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
      user: users.find((user) => user.id === Number(data.senderId)) || null
    };
  });

  return messages;
}
