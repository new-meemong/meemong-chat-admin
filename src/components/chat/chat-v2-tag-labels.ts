import type {
  ChatV2Opening,
  ChatV2OriginEntrySource,
  ChatV2OriginPricingType,
  ChatV2PostType
} from "@/types/chat";

const POST_TYPE_LABELS = {
  MODEL_ANNOUNCEMENT: "모델시술",
  QUICK_MATCHING_PREMIUM: "빠른매칭",
  QUICK_MATCHING_GENERAL: "빠른매칭",
  EXPERIENCE_GROUP: "체험단",
  CHAT: null,
  HAIR_CONSULTATION: "컨설팅",
  REVIEW_SPECIAL: "리뷰특가",
  JOB_POSTING: "일자리",
  RESUME: "일자리"
} as const satisfies Record<ChatV2PostType, string | null>;

const ORIGIN_ENTRY_SOURCE_LABELS = {
  MODEL_ANNOUNCEMENT_DETAIL_APPLY_CHAT: "모델시술 공고 지원",
  QUICK_MATCHING_GENERAL_DETAIL_CHAT: "일반 빠른매칭 상세",
  QUICK_MATCHING_PREMIUM_DETAIL_CHAT: "프리미엄 빠른매칭 상세",
  EXPERIENCE_GROUP_DETAIL_CHAT: "체험단 상세",
  HAIR_CONSULTATION_POST_COMMENT_DIRECT_CHAT: "컨설팅 댓글에서 직접채팅",
  HAIR_CONSULTATION_POST_COMMENT_DESIGNER_PROFILE_MENU_INQUIRY:
    "컨설팅 댓글 작성자 프로필 문의",
  HAIR_CONSULTATION_RESPONSE_DETAIL_DIRECT_CHAT: "컨설팅 답변에서 직접채팅",
  HAIR_CONSULTATION_RESPONSE_DETAIL_DESIGNER_PROFILE_MENU_INQUIRY:
    "컨설팅 답변자 프로필 문의",
  REVIEW_SPECIAL_RESERVATION_ACCEPT_CHAT: "리뷰특가 예약 수락",
  JOB_POSTING_DETAIL_APPLY_CHAT: "채용공고 지원",
  RESUME_DETAIL_OFFER_CHAT: "이력서 제안",
  MODEL_PROFILE_DIRECT_CHAT: "모델 프로필 직접채팅",
  DESIGNER_PROFILE_MENU_INQUIRY: "디자이너 프로필 문의",
  QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY:
    "일반 빠른매칭 디자이너 프로필 문의",
  QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY:
    "프리미엄 빠른매칭 디자이너 프로필 문의",
  RECENT_ACCESS_RECOMMENDED_MODEL_PROFILE_CHAT: "최근 접속 추천 모델 프로필",
  NEW_MODEL_PROFILE_CHAT: "신규 모델 프로필",
  RECENT_FEMALE_MODEL_PROFILE_CHAT: "최근 접속 여성 모델 프로필",
  RECENT_MALE_MODEL_PROFILE_CHAT: "최근 접속 남성 모델 프로필",
  NEARBY_MODEL_PROFILE_CHAT: "내 주변 모델 프로필",
  BEAUTY_MODEL_PROFILE_CHAT: "뷰티 모델 프로필",
  ACTIVE_MODEL_PROFILE_CHAT: "활동 모델 프로필",
  FAVORITE_MODEL_PROFILE_CHAT: "관심 모델 프로필",
  QUICK_MATCHING_GENERAL_MODEL_PROFILE_CHAT: "일반 빠른매칭 모델 프로필",
  QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT: "프리미엄 빠른매칭 모델 프로필",
  TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY: "상담왕 디자이너 프로필 문의",
  RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY: "추천 디자이너 프로필 문의",
  NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY:
    "얼굴촬영 없는 디자이너 프로필 문의",
  SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY: "지도 검색 디자이너 프로필 문의",
  FAVORITE_NOTIFICATION_MODEL_PROFILE_CHAT: "관심표현 알림의 모델 프로필",
  HAIR_CONSULTATION_ANSWER_NOTIFICATION_MODEL_PROFILE_CHAT:
    "컨설팅 답변 알림의 모델 프로필",
  STORELINK_NOTIFICATION_MODEL_PROFILE_CHAT: "스토어 링크 알림의 모델 프로필",
  INSTAGRAM_NOTIFICATION_MODEL_PROFILE_CHAT: "인스타그램 알림의 모델 프로필"
} as const satisfies Record<ChatV2OriginEntrySource, string>;

const ORIGIN_PRICING_TYPE_LABELS = {
  pay: "추천 모델",
  new: "신규 모델",
  recent_male: "최근 접속 남성 모델",
  recent_female: "최근 접속 여성 모델",
  longTime: "내 주변 모델",
  beauty: "뷰티 모델",
  favorite: "관심 모델",
  thunder_default: "일반 빠른매칭",
  favorite_notification_designer: "관심표현 알림",
  view_hair_consultation_answer_notification_designer: "컨설팅 답변 알림",
  view_storelink_notification_designer: "스토어 링크 알림",
  view_instagram_notification_designer: "인스타그램 알림"
} as const satisfies Record<ChatV2OriginPricingType, string>;

type NormalizedChatEntrySource =
  | "thunderDefault"
  | "thunderPremium"
  | "topAdvisor"
  | "recommenderDesigner"
  | "noFaceShooting"
  | "searchMap";

/** Flutter ChatEntrySource.fromRaw의 레거시·v2 정확 일치 계약. */
const CHAT_ENTRY_SOURCE_BY_WIRE_VALUE = {
  THUNDER_DEFAULT: "thunderDefault",
  QUICK_MATCHING_GENERAL_DETAIL_CHAT: "thunderDefault",
  QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY: "thunderDefault",
  THUNDER_PREMIUM: "thunderPremium",
  QUICK_MATCHING_PREMIUM_DETAIL_CHAT: "thunderPremium",
  QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY: "thunderPremium",
  TOP_ADVISOR: "topAdvisor",
  TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY: "topAdvisor",
  RECOMMENDER_DESIGNER: "recommenderDesigner",
  RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY: "recommenderDesigner",
  NO_FACE_SHOOTING: "noFaceShooting",
  NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY: "noFaceShooting",
  SEARCH_MAP: "searchMap",
  SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY: "searchMap"
} as const satisfies Record<string, NormalizedChatEntrySource>;

export function normalizeChatEntrySource(
  entrySource: string | null
): NormalizedChatEntrySource | null {
  const normalizedWireValue = entrySource?.trim().toUpperCase() ?? "";
  return Object.prototype.hasOwnProperty.call(
    CHAT_ENTRY_SOURCE_BY_WIRE_VALUE,
    normalizedWireValue
  )
    ? CHAT_ENTRY_SOURCE_BY_WIRE_VALUE[
        normalizedWireValue as keyof typeof CHAT_ENTRY_SOURCE_BY_WIRE_VALUE
      ]
    : null;
}

/** Flutter ChatListRouteTag와 동일한 한글 게시글 유형 표기. */
export function getChatV2PostTypeLabel(
  postType: ChatV2PostType
): string | null {
  return POST_TYPE_LABELS[postType];
}

export function getChatV2OriginEntrySourceLabel(
  entrySource: string | null
): string | null {
  if (entrySource == null) return null;
  return Object.prototype.hasOwnProperty.call(
    ORIGIN_ENTRY_SOURCE_LABELS,
    entrySource
  )
    ? ORIGIN_ENTRY_SOURCE_LABELS[
        entrySource as keyof typeof ORIGIN_ENTRY_SOURCE_LABELS
      ]
    : `알 수 없는 경로 (${entrySource})`;
}

export function getChatV2OriginPricingTypeLabel(
  pricingType: string | null
): string | null {
  if (pricingType == null) return null;
  return Object.prototype.hasOwnProperty.call(
    ORIGIN_PRICING_TYPE_LABELS,
    pricingType
  )
    ? ORIGIN_PRICING_TYPE_LABELS[
        pricingType as keyof typeof ORIGIN_PRICING_TYPE_LABELS
      ]
    : `알 수 없는 정책 (${pricingType})`;
}

/** 숫자 순번 도입 전에 생성된 v2 방인지 관리자 표시용으로 판별한다. */
export function isPreSequenceV2RoomInstanceId(
  roomInstanceId: string
): boolean {
  const roomInstanceNumber = Number(roomInstanceId);
  return !(
    Number.isSafeInteger(roomInstanceNumber) &&
    roomInstanceNumber > 0 &&
    String(roomInstanceNumber) === roomInstanceId
  );
}

function freePolicyReason(
  postType: ChatV2PostType,
  entrySource: string | null
): string {
  const normalizedSource = normalizeChatEntrySource(entrySource);
  if (
    postType === "QUICK_MATCHING_PREMIUM" ||
    normalizedSource === "thunderPremium"
  ) {
    return "프리미엄 빠른매칭";
  }
  if (normalizedSource === "topAdvisor") return "상담왕";
  if (normalizedSource === "noFaceShooting") {
    return "얼굴촬영 없는 지원";
  }
  // 추천 디자이너·지도 검색은 앱에서도 진입경로일 뿐 무료 정책이 아니다.
  // FREE_POLICY의 실제 원인이 0몽 프리셋 등으로 더 세분화되어 저장되지 않은
  // 경우에는 경로명으로 추정하지 않는다.
  return "무료 정책";
}

/** 저장된 개봉 방법을 운영자가 바로 이해할 수 있는 비용 태그로 바꾼다. */
export function getChatV2OpeningLabel(
  opening: ChatV2Opening,
  postType: ChatV2PostType
): string {
  if (opening.isRefundRecipient) {
    return opening.method === "MONG" && opening.openedMongAmount != null
      ? `유료[${opening.openedMongAmount}몽·환불]`
      : "환불 완료";
  }
  if (opening.method === "MONG") {
    return opening.openedMongAmount == null
      ? "유료[금액 확인중]"
      : `유료[${opening.openedMongAmount}몽]`;
  }
  if (opening.state === "NOT_OPENED") return "미개봉";

  switch (opening.method) {
    case "AD":
      return "무료[광고]";
    case "GROWTH_PASS":
      return "무료[성장패스]";
    case "MEEMONG_PASS":
      return "무료[미몽패스]";
    case "FREE_POLICY":
      return `무료[${freePolicyReason(postType, opening.entrySource)}]`;
    case "NONE":
      return "무료[기본]";
  }
}
