import type {
  ChatChannelType,
  ChatV2ChannelType,
  ChatV2OriginEntrySource,
  ChatV2OriginPricingType,
  ChatV2PostType
} from "@/types/chat";
import { CHAT_V2_SCHEMA_VERSION, CHAT_V2_SERVICES } from "./constants.ts";

const POST_TYPES_BY_CHANNEL: Record<
  ChatV2ChannelType,
  ReadonlySet<ChatV2PostType>
> = {
  modelMatching: new Set([
    "MODEL_ANNOUNCEMENT",
    "QUICK_MATCHING_PREMIUM",
    "QUICK_MATCHING_GENERAL",
    "EXPERIENCE_GROUP",
    "CHAT"
  ]),
  hairConsultation: new Set(["HAIR_CONSULTATION"]),
  reviewSpecial: new Set(["REVIEW_SPECIAL"]),
  jobPosting: new Set(["JOB_POSTING", "RESUME"])
};

const ORIGIN_ENTRY_SOURCES = new Set<ChatV2OriginEntrySource>([
  "MODEL_ANNOUNCEMENT_DETAIL_APPLY_CHAT",
  "QUICK_MATCHING_GENERAL_DETAIL_CHAT",
  "QUICK_MATCHING_PREMIUM_DETAIL_CHAT",
  "EXPERIENCE_GROUP_DETAIL_CHAT",
  "HAIR_CONSULTATION_POST_COMMENT_DIRECT_CHAT",
  "HAIR_CONSULTATION_POST_COMMENT_DESIGNER_PROFILE_MENU_INQUIRY",
  "HAIR_CONSULTATION_RESPONSE_DETAIL_DIRECT_CHAT",
  "HAIR_CONSULTATION_RESPONSE_DETAIL_DESIGNER_PROFILE_MENU_INQUIRY",
  "REVIEW_SPECIAL_RESERVATION_ACCEPT_CHAT",
  "JOB_POSTING_DETAIL_APPLY_CHAT",
  "RESUME_DETAIL_OFFER_CHAT",
  "MODEL_PROFILE_DIRECT_CHAT",
  "DESIGNER_PROFILE_MENU_INQUIRY",
  "QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY",
  "QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY",
  "RECENT_ACCESS_RECOMMENDED_MODEL_PROFILE_CHAT",
  "NEW_MODEL_PROFILE_CHAT",
  "RECENT_FEMALE_MODEL_PROFILE_CHAT",
  "RECENT_MALE_MODEL_PROFILE_CHAT",
  "NEARBY_MODEL_PROFILE_CHAT",
  "BEAUTY_MODEL_PROFILE_CHAT",
  "ACTIVE_MODEL_PROFILE_CHAT",
  "FAVORITE_MODEL_PROFILE_CHAT",
  "QUICK_MATCHING_GENERAL_MODEL_PROFILE_CHAT",
  "QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT",
  "TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY",
  "RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY",
  "NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY",
  "SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY",
  "FAVORITE_NOTIFICATION_MODEL_PROFILE_CHAT",
  "HAIR_CONSULTATION_ANSWER_NOTIFICATION_MODEL_PROFILE_CHAT",
  "STORELINK_NOTIFICATION_MODEL_PROFILE_CHAT",
  "INSTAGRAM_NOTIFICATION_MODEL_PROFILE_CHAT"
]);

const ORIGIN_PRICING_TYPES = new Set<ChatV2OriginPricingType>([
  "pay",
  "new",
  "recent_male",
  "recent_female",
  "longTime",
  "beauty",
  "favorite",
  "thunder_default",
  "favorite_notification_designer",
  "view_hair_consultation_answer_notification_designer",
  "view_storelink_notification_designer",
  "view_instagram_notification_designer"
]);

export function isChatV2PostTypeForChannel(
  channelType: ChatV2ChannelType,
  value: unknown
): value is ChatV2PostType {
  return (
    typeof value === "string" &&
    POST_TYPES_BY_CHANNEL[channelType].has(value as ChatV2PostType)
  );
}

export interface ChatV2ChannelIdentityData {
  schemaVersion: 2;
  channelType: ChatV2ChannelType;
  postType: ChatV2PostType;
  postId: string;
  answerId: string | null;
  roomInstanceId: string;
  participantIds: number[];
  activeParticipantIds: number[];
  channelOpenUserId: number;
}

export interface ChatV2ChannelInsightData {
  originEntrySource: ChatV2OriginEntrySource;
  originPricingType: ChatV2OriginPricingType | null;
  hasFirstReply: boolean;
}

function objectData(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`v2 채널의 ${fieldName} 값이 올바르지 않습니다.`);
  }
  return value;
}

function canonicalPositiveUserIds(
  value: unknown,
  fieldName: string
): number[] {
  if (!Array.isArray(value)) {
    throw new Error(`v2 채널의 ${fieldName} 값이 배열이 아닙니다.`);
  }
  const ids = value.map((rawId) => {
    if (typeof rawId !== "string") {
      throw new Error(`v2 채널의 ${fieldName} 사용자 ID는 문자열이어야 합니다.`);
    }
    const stringId = rawId;
    const numericId = Number(stringId);
    if (
      !Number.isSafeInteger(numericId) ||
      numericId <= 0 ||
      String(numericId) !== stringId
    ) {
      throw new Error(`v2 채널의 ${fieldName}에 잘못된 사용자 ID가 있습니다.`);
    }
    return numericId;
  });
  if (new Set(ids).size !== ids.length) {
    throw new Error(`v2 채널의 ${fieldName}에 중복 사용자 ID가 있습니다.`);
  }
  return ids;
}

export function isV2Document(data: unknown): boolean {
  return objectData(data)?.schemaVersion === CHAT_V2_SCHEMA_VERSION;
}

/**
 * 관리자 읽기 경계에서 v2 불변 identity를 검증한다.
 * 레거시 추정이나 channelKey 파싱은 의도적으로 지원하지 않는다.
 */
export function parseChatV2ChannelIdentity({
  documentId,
  chatType,
  rawData
}: {
  documentId: string;
  chatType: ChatChannelType;
  rawData: unknown;
}): ChatV2ChannelIdentityData {
  const data = objectData(rawData);
  if (!data || data.schemaVersion !== CHAT_V2_SCHEMA_VERSION) {
    throw new Error(`${documentId}은(는) v2 채널이 아닙니다.`);
  }

  const config = CHAT_V2_SERVICES[chatType];
  if (data.channelType !== config.channelType) {
    throw new Error(`${documentId}의 channelType이 컬렉션과 일치하지 않습니다.`);
  }
  const channelType = data.channelType as ChatV2ChannelType;
  const rawPostType = requiredString(data.postType, "postType");
  if (!isChatV2PostTypeForChannel(channelType, rawPostType)) {
    throw new Error(`${documentId}의 postType이 channelType과 맞지 않습니다.`);
  }
  const postType = rawPostType;

  const storedChannelId = requiredString(data.channelId, "channelId");
  if (storedChannelId !== documentId) {
    throw new Error(`${documentId}의 저장된 channelId가 문서 ID와 다릅니다.`);
  }

  const postId = requiredString(data.postId, "postId");
  const answerId =
    data.answerId == null ? null : requiredString(data.answerId, "answerId");
  if (channelType === "hairConsultation" && answerId == null) {
    throw new Error(`${documentId}의 answerId가 없습니다.`);
  }

  const participantIds = canonicalPositiveUserIds(
    data.participantIds,
    "participantIds"
  );
  if (participantIds.length !== 2) {
    throw new Error(`${documentId}의 불변 참여자는 정확히 2명이어야 합니다.`);
  }
  const sortedParticipantIds = [...participantIds].sort((a, b) => a - b);
  if (participantIds.some((id, index) => id !== sortedParticipantIds[index])) {
    throw new Error(`${documentId}의 participantIds가 오름차순이 아닙니다.`);
  }

  const activeParticipantIds = canonicalPositiveUserIds(
    data.participantsIds,
    "participantsIds"
  );
  if (
    activeParticipantIds.length > 2 ||
    activeParticipantIds.some((id) => !participantIds.includes(id))
  ) {
    throw new Error(`${documentId}의 활성 참여자가 불변 참여자 집합과 다릅니다.`);
  }

  const channelOpenUserId = Number(data.channelOpenUserId);
  if (!participantIds.includes(channelOpenUserId)) {
    throw new Error(`${documentId}의 channelOpenUserId가 참여자가 아닙니다.`);
  }

  const roomInstanceId = requiredString(data.roomInstanceId, "roomInstanceId");
  // 순번 도입 전 생성된 난수형 v2 방도 원본 ID를 변경하지 않는 정식 v2
  // 데이터다. 신규 순번형 값과 기존 난수형 값을 모두 저장 identity 그대로 검증한다.

  const roomIdentityId =
    channelType === "hairConsultation" ? answerId! : postId;
  const expectedChannelId = [
    "v2",
    channelType,
    postType,
    roomIdentityId,
    ...participantIds.map(String),
    roomInstanceId
  ].join("_");
  if (documentId !== expectedChannelId) {
    throw new Error(`${documentId}가 저장된 v2 identity와 일치하지 않습니다.`);
  }

  return {
    schemaVersion: CHAT_V2_SCHEMA_VERSION,
    channelType,
    postType,
    postId,
    answerId,
    roomInstanceId,
    participantIds,
    activeParticipantIds,
    channelOpenUserId
  };
}

/** 생성 경로와 대화 전환 상태를 v2 메인 채널의 정본 필드에서 읽는다. */
export function parseChatV2ChannelInsights(
  rawData: unknown,
  postType: ChatV2PostType
): ChatV2ChannelInsightData {
  const data = objectData(rawData);
  if (!data || data.schemaVersion !== CHAT_V2_SCHEMA_VERSION) {
    throw new Error("v2 채널 인사이트를 읽을 수 없습니다.");
  }
  if (!ORIGIN_ENTRY_SOURCES.has(data.originEntrySource as ChatV2OriginEntrySource)) {
    throw new Error("v2 채널의 originEntrySource가 올바르지 않습니다.");
  }

  const rawPricingType = data.originPricingType;
  const originPricingType =
    rawPricingType == null
      ? null
      : ORIGIN_PRICING_TYPES.has(rawPricingType as ChatV2OriginPricingType)
        ? (rawPricingType as ChatV2OriginPricingType)
        : null;
  if (rawPricingType != null && originPricingType == null) {
    throw new Error("v2 채널의 originPricingType이 올바르지 않습니다.");
  }
  if (postType !== "CHAT" && originPricingType != null) {
    throw new Error("CHAT 이외의 v2 채널에는 originPricingType이 없어야 합니다.");
  }
  if (typeof data.hasFirstReply !== "boolean") {
    throw new Error("v2 채널의 hasFirstReply가 boolean이 아닙니다.");
  }

  return {
    originEntrySource: data.originEntrySource as ChatV2OriginEntrySource,
    originPricingType,
    hasFirstReply: data.hasFirstReply
  };
}
