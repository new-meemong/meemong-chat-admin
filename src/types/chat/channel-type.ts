/**
 * 채팅 채널 타입
 */
export type ChatChannelType =
  | "model-matching"
  | "hair-consultation"
  | "job-posting"
  | "review-special";

/** Firestore v2 채널 문서의 channelType wire value. */
export type ChatV2ChannelType =
  | "modelMatching"
  | "hairConsultation"
  | "jobPosting"
  | "reviewSpecial";

export type ChatV2PostType =
  | "MODEL_ANNOUNCEMENT"
  | "QUICK_MATCHING_PREMIUM"
  | "QUICK_MATCHING_GENERAL"
  | "EXPERIENCE_GROUP"
  | "CHAT"
  | "HAIR_CONSULTATION"
  | "REVIEW_SPECIAL"
  | "JOB_POSTING"
  | "RESUME";

/** Flutter ChatOriginEntrySource와 공유하는 채팅 생성 진입경로 wire value. */
export type ChatV2OriginEntrySource =
  | "MODEL_ANNOUNCEMENT_DETAIL_APPLY_CHAT"
  | "QUICK_MATCHING_GENERAL_DETAIL_CHAT"
  | "QUICK_MATCHING_PREMIUM_DETAIL_CHAT"
  | "EXPERIENCE_GROUP_DETAIL_CHAT"
  | "HAIR_CONSULTATION_POST_COMMENT_DIRECT_CHAT"
  | "HAIR_CONSULTATION_POST_COMMENT_DESIGNER_PROFILE_MENU_INQUIRY"
  | "HAIR_CONSULTATION_RESPONSE_DETAIL_DIRECT_CHAT"
  | "HAIR_CONSULTATION_RESPONSE_DETAIL_DESIGNER_PROFILE_MENU_INQUIRY"
  | "REVIEW_SPECIAL_RESERVATION_ACCEPT_CHAT"
  | "JOB_POSTING_DETAIL_APPLY_CHAT"
  | "RESUME_DETAIL_OFFER_CHAT"
  | "MODEL_PROFILE_DIRECT_CHAT"
  | "DESIGNER_PROFILE_MENU_INQUIRY"
  | "QUICK_MATCHING_GENERAL_DESIGNER_PROFILE_MENU_INQUIRY"
  | "QUICK_MATCHING_PREMIUM_DESIGNER_PROFILE_MENU_INQUIRY"
  | "RECENT_ACCESS_RECOMMENDED_MODEL_PROFILE_CHAT"
  | "NEW_MODEL_PROFILE_CHAT"
  | "RECENT_FEMALE_MODEL_PROFILE_CHAT"
  | "RECENT_MALE_MODEL_PROFILE_CHAT"
  | "NEARBY_MODEL_PROFILE_CHAT"
  | "BEAUTY_MODEL_PROFILE_CHAT"
  | "ACTIVE_MODEL_PROFILE_CHAT"
  | "FAVORITE_MODEL_PROFILE_CHAT"
  | "QUICK_MATCHING_GENERAL_MODEL_PROFILE_CHAT"
  | "QUICK_MATCHING_PREMIUM_MODEL_PROFILE_CHAT"
  | "TOP_ADVISOR_DESIGNER_PROFILE_MENU_INQUIRY"
  | "RECOMMENDER_DESIGNER_PROFILE_MENU_INQUIRY"
  | "NO_FACE_SHOOTING_DESIGNER_PROFILE_MENU_INQUIRY"
  | "SEARCH_MAP_DESIGNER_PROFILE_MENU_INQUIRY"
  | "FAVORITE_NOTIFICATION_MODEL_PROFILE_CHAT"
  | "HAIR_CONSULTATION_ANSWER_NOTIFICATION_MODEL_PROFILE_CHAT"
  | "STORELINK_NOTIFICATION_MODEL_PROFILE_CHAT"
  | "INSTAGRAM_NOTIFICATION_MODEL_PROFILE_CHAT";

/** CHAT 생성 당시 과금 정책을 고른 화면 문맥 wire value. */
export type ChatV2OriginPricingType =
  | "pay"
  | "new"
  | "recent_male"
  | "recent_female"
  | "longTime"
  | "beauty"
  | "favorite"
  | "thunder_default"
  | "favorite_notification_designer"
  | "view_hair_consultation_answer_notification_designer"
  | "view_storelink_notification_designer"
  | "view_instagram_notification_designer";

/**
 * 일일 통계 컬렉션이 존재하는 채팅 채널 타입
 */
export type DailyCountChannelType = Exclude<
  ChatChannelType,
  "review-special"
>;
