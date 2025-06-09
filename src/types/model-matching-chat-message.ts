import { Timestamp } from "firebase/firestore";
import { User } from "./user";

export interface ModelMatchingChatMessage {
  id: string;
  message: string;
  messageType: string;
  senderId: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: User | null;
}
