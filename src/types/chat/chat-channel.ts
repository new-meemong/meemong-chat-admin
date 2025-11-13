import { Timestamp } from "firebase/firestore";
import { User } from "../user";
import { ChatChannelType } from "./channel-type";
import { ChatMessage } from "./chat-message";

/**
 * 공통 채팅 채널 타입
 */
export interface ChatChannel {
  id: string; // 채널 문서 ID (Firestore 문서 ID)
  type: ChatChannelType; // 채널 타입 구분자
  channelKey: string; // `${channelType}_${참여자ID들.정렬().join('_')}`
  participantsIds: number[]; // 참여자 ID 목록 (정렬된 상태)
  channelOpenUserId: number; // 채널을 연 사용자 ID
  createdAt: Timestamp; // 생성 시간
  updatedAt: Timestamp; // 마지막 업데이트 시간

  users: User[];
  lastMessage: ChatMessage | null;
  messageCount: number;
}


