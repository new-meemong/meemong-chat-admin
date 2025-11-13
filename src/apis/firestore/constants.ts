import { ChatChannelType } from "@/types/chat";

/**
 * 채널 타입별 Firestore 컬렉션명 매핑
 */
export const CHAT_CHANNEL_COLLECTIONS: Record<
  ChatChannelType,
  {
    channels: string;
    userChannels: string;
    dailyCount: string;
  }
> = {
  "model-matching": {
    channels: "modelMatchingChatChannels",
    userChannels: "userModelMatchingChatChannels",
    dailyCount: "modelMatchingDailyCount"
  },
  "hair-consultation": {
    channels: "hairConsultationChatChannels",
    userChannels: "userHairConsultationChatChannels",
    dailyCount: "hairConsultationDailyCount"
  }
} as const;

