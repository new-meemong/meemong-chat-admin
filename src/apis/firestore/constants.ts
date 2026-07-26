import {
  ChatChannelType,
  DailyCountChannelType
} from "@/types/chat";

type ChatChannelCollectionConfig<T extends ChatChannelType> = {
  channels: string;
  userChannels: string;
} & (T extends DailyCountChannelType ? { dailyCount: string } : object);

/**
 * 채널 타입별 Firestore 컬렉션명 매핑
 */
export const CHAT_CHANNEL_COLLECTIONS = {
  "model-matching": {
    channels: "modelMatchingChatChannels",
    userChannels: "userModelMatchingChatChannels",
    dailyCount: "modelMatchingDailyCount"
  },
  "hair-consultation": {
    channels: "hairConsultationChatChannels",
    userChannels: "userHairConsultationChatChannels",
    dailyCount: "hairConsultationDailyCount"
  },
  "job-posting": {
    channels: "jobPostingChatChannels",
    userChannels: "userJobPostingChatChannels",
    dailyCount: "jobPostingDailyCount"
  },
  "review-special": {
    channels: "reviewSpecialChatChannels",
    userChannels: "userReviewSpecialChatChannels"
  }
} as const satisfies {
  [T in ChatChannelType]: ChatChannelCollectionConfig<T>;
};
