import { Timestamp } from "firebase/firestore";
import { User } from "./user";

export interface ModelMatchingChatMessage {
  id: string;
  message: string;
  messageType: string;
  senderId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: User | null;
}
