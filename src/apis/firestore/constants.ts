import type {
  ChatChannelType,
  ChatV2ChannelType,
  DailyCountChannelType
} from "@/types/chat";

type ChatChannelCollectionConfig<T extends ChatChannelType> = {
  channelType: ChatV2ChannelType;
  sourceCollection: string;
  userChannelCollection: string;
  pushMessageType: string;
  listCategory: "MODEL" | "CONSULTATION" | "JOB" | "REVIEW_SPECIAL";
} & (T extends DailyCountChannelType ? { dailyCount: string } : object);

/** 관리자 route 타입과 채팅 v2 Firestore 계약의 단일 매핑. */
export const CHAT_V2_SERVICES = {
  "model-matching": {
    channelType: "modelMatching",
    sourceCollection: "modelMatchingChatChannels",
    userChannelCollection: "userModelMatchingChatChannels",
    pushMessageType: "MODEL_MATCHING",
    listCategory: "MODEL",
    dailyCount: "modelMatchingDailyCount"
  },
  "hair-consultation": {
    channelType: "hairConsultation",
    sourceCollection: "hairConsultationChatChannels",
    userChannelCollection: "userHairConsultationChatChannels",
    pushMessageType: "HAIR_CONSULTING",
    listCategory: "CONSULTATION",
    dailyCount: "hairConsultationDailyCount"
  },
  "job-posting": {
    channelType: "jobPosting",
    sourceCollection: "jobPostingChatChannels",
    userChannelCollection: "userJobPostingChatChannels",
    pushMessageType: "JOB",
    listCategory: "JOB",
    dailyCount: "jobPostingDailyCount"
  },
  "review-special": {
    channelType: "reviewSpecial",
    sourceCollection: "reviewSpecialChatChannels",
    userChannelCollection: "userReviewSpecialChatChannels",
    pushMessageType: "REVIEW_SPECIAL",
    listCategory: "REVIEW_SPECIAL"
  }
} as const satisfies {
  [T in ChatChannelType]: ChatChannelCollectionConfig<T>;
};

export const CHAT_V2_SCHEMA_VERSION = 2 as const;
export const CHAT_LIST_ITEMS_COLLECTION = "chatListItems";
export const CHAT_ADMIN_LIST_RESULT_LIMIT = 100;
export const FIRESTORE_SCAN_PAGE_SIZE = 100;
export const DAILY_COUNT_SCAN_PAGE_SIZE = 20;
export const DAILY_COUNT_REFRESH_DATE_LIMIT = 30;

export const CHAT_TYPE_BY_V2_CHANNEL_TYPE = {
  modelMatching: "model-matching",
  hairConsultation: "hair-consultation",
  jobPosting: "job-posting",
  reviewSpecial: "review-special"
} as const satisfies Record<ChatV2ChannelType, ChatChannelType>;

export function chatTypeFromV2ChannelType(
  channelType: ChatV2ChannelType
): ChatChannelType {
  return CHAT_TYPE_BY_V2_CHANNEL_TYPE[channelType];
}

export function isChatV2ChannelType(
  value: unknown
): value is ChatV2ChannelType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CHAT_TYPE_BY_V2_CHANNEL_TYPE, value)
  );
}

export function isChatChannelType(value: string): value is ChatChannelType {
  return Object.prototype.hasOwnProperty.call(CHAT_V2_SERVICES, value);
}
