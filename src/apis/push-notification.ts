import { apiFetch } from "./fetch";
import { CHAT_V2_SCHEMA_VERSION, CHAT_V2_SERVICES } from "./firestore/constants";
import { ChatChannelType } from "@/types/chat";

export interface ChatV2PushRequest {
  userId: string;
  message: string;
  channelId: string;
  channelType: ChatChannelType;
}

export async function sendPushNotification(request: ChatV2PushRequest) {
  const { userId, message, channelId, channelType } = request;
  if (!userId || !message || !channelId) {
    throw new Error("v2 채팅 푸시의 사용자, 메시지, 채널 ID는 필수입니다.");
  }
  const config = CHAT_V2_SERVICES[channelType];
  return apiFetch("/api/v1/push/chat-messages", "POST", {
    userId,
    message,
    chatMessageType: config.pushMessageType,
    chatChannelId: channelId,
    sourceCollection: config.sourceCollection,
    schemaVersion: CHAT_V2_SCHEMA_VERSION
  });
}
