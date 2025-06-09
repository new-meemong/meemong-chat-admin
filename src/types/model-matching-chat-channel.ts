import { ModelMatchingChatMessage } from "./model-matching-chat-message";
import { Timestamp } from "firebase/firestore";
import { User } from "./user";

export interface ModelMatchingChatChannel {
  id: string; // 채널 문서 ID (Firestore 문서 ID)
  channelKey: string; // `${channelType}_${참여자ID들.정렬().join('_')}`
  participantsIds: number[]; // 참여자 ID 목록 (정렬된 상태)
  channelOpenUserId: number; // 채널을 연 사용자 ID
  createdAt: Timestamp; // 생성 시간
  updatedAt: Timestamp; // 마지막 업데이트 시간
  // 이하 하위 컬렉션(messages) 등 다른 필드 생략

  users: User[];
  lastMessage: ModelMatchingChatMessage | null;
  messageCount: number;
}
