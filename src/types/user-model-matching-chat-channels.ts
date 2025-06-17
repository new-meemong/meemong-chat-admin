import { Timestamp } from "firebase/firestore";
import { User } from "./user";

export interface UserModelMatchingChatChannel {
  channelId: string;
  createdAt: Timestamp;
  deletedAt: Timestamp | null;
  isBlockChannel: boolean;
  isPinned: boolean;
  lastMessage: LastMessage;
  metaPathList: string[];
  lastReadAt: Timestamp | null;
  otherUser: OtherUser;
  pinnedAt: Timestamp | null;
  unreadCount: number;
  updatedAt: Timestamp;
  userId: string;
  currentUser: User;
  messageCount: number;
  openUserId: number | null;
}

export interface LastMessage {
  createdAt: Timestamp;
  id: string;
  message: string;
  messageType: string;
  metaPathList: string[];
  senderId: string;
  updatedAt: Timestamp;
}

export interface OtherUser {
  DisplayName: string;
  Email: string | null;
  FcmToken: string;
  Korean: string;
  ProfilePictureURL: string;
  Role: number;
  role?: number;
  Sex: string;
  sex?: string;
  UserID: string;
  id: number;
  profileUrl: string;
}
