import { Timestamp } from "firebase/firestore";
import { User } from "../user";

/**
 * 공통 채팅 메시지 타입
 */
export interface ChatMessage {
  id: string;
  message: string;
  messageType: string;
  senderId: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: User | null;
  metaPathList?: string[];
}


