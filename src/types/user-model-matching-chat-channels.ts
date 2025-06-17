import { Timestamp } from "firebase/firestore";

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
  Sex: string;
  UserID: string;
  id: number;
  profileUrl: string;
}
