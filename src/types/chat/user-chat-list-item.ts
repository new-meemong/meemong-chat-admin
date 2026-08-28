import { Timestamp } from "firebase/firestore";
import {
  ChatChannelType,
  ChatV2ChannelType,
  ChatV2PostType
} from "./channel-type";
import { ChatV2Opening } from "./chat-v2-opening";

export interface UserChatListOtherUser {
  displayName: string;
  profileImageUrl: string | null;
  role: string;
  deactivated: boolean;
}

/** users/{userId}/chatListItems의 v2 관리자 읽기 모델. */
export interface UserChatListItem {
  schemaVersion: 2;
  channelId: string;
  type: ChatChannelType;
  channelType: ChatV2ChannelType;
  postType: ChatV2PostType;
  postId: string;
  entrySource: string | null;
  otherUserId: string;
  otherUser: UserChatListOtherUser;
  lastMessagePreview: string | null;
  lastMessageType: string | null;
  lastMessageAt: Timestamp | null;
  lastActivityAt: Timestamp;
  unreadCount: number;
  isPinned: boolean;
  sortAt: Timestamp;
  otherUserLeft: boolean;
  awaitingReply: boolean;
  awaitingReplyStartedAt: Timestamp | null;
  opening: ChatV2Opening | null;
  openingIssueReason: string | null;
}
