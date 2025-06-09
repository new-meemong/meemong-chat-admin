import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query
} from "firebase/firestore";

import { ChatMessageTypeEnum } from "@/types/enums";
import { ModelMatchingChatMessage } from "@/types/model-matching-chat-message";
import { User } from "@/types/user";
// src/apis/chatMessages/fetchChatMessages.ts
import { db } from "@/lib/firebase";

// └─ 메시지 인터페이스가 정의된 파일 경로에 맞게 수정하세요.

// 예시로, ModelMatchingChatMessageType 은 아래와 같은 형태라고 가정합니다.
// export interface ModelMatchingChatMessageType {
//   id: string;
//   message: string;
//   messageType: ModelMatchingChatMessageTypeEnum;
//   metaPathList: MetaPathType[];
//   senderId: string;
//   createdAt: Timestamp;
//   updatedAt: Timestamp;
// }

export async function fetchChatMessages(
  channelId: string,
  users: User[]
): Promise<ModelMatchingChatMessage[]> {
  // 1. 해당 채널의 messages 서브컬렉션 참조 생성
  const messagesColRef = collection(
    db,
    "modelMatchingChatChannels",
    channelId,
    "messages"
  );

  // 2. 쿼리: createdAt 오름차순 정렬 (가장 오래된 순 → 최신 순)
  const q = query(messagesColRef, orderBy("createdAt", "asc"));

  // 3. 쿼리 실행
  const snapshot = await getDocs(q);

  // 4. 스냅샷 문서를 ModelMatchingChatMessageType 형태로 매핑
  const messages: ModelMatchingChatMessage[] = snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;

    return {
      id: doc.id,
      message: data.message,
      messageType: data.messageType as ChatMessageTypeEnum,
      metaPathList: data.metaPathList || [],
      senderId: data.senderId,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
      user: users.find((user) => user.id === data.senderId) || null
    };
  });

  return messages;
}
