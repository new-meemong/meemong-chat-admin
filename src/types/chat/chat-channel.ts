import { Timestamp } from "firebase/firestore";
import { User } from "../user";
import {
  ChatChannelType,
  ChatV2ChannelType,
  ChatV2PostType
} from "./channel-type";
import { ChatMessage } from "./chat-message";

/**
 * 공통 채팅 채널 타입
 */
export interface ChatChannel {
  id: string; // 채널 문서 ID (Firestore 문서 ID)
  type: ChatChannelType; // 채널 타입 구분자
  schemaVersion: 2;
  channelType: ChatV2ChannelType;
  postType: ChatV2PostType;
  postId: string;
  answerId: string | null;
  roomInstanceId: string;
  originEntrySource: string;
  originPricingType: string | null;
  participantIds: number[]; // 생성 당시의 불변 참여자 쌍
  activeParticipantIds: number[]; // 현재 채널에 남아 있는 참여자
  channelOpenUserId: number; // 채널을 연 사용자 ID
  hasFirstReply: boolean;
  createdAt: Timestamp; // 생성 시간
  updatedAt: Timestamp; // 마지막 업데이트 시간

  users: User[];
  lastMessage: ChatMessage | null;
  messageCount: number;
}
