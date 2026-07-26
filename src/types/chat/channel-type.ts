/**
 * 채팅 채널 타입
 */
export type ChatChannelType =
  | "model-matching"
  | "hair-consultation"
  | "job-posting"
  | "review-special";

/**
 * 일일 통계 컬렉션이 존재하는 채팅 채널 타입
 */
export type DailyCountChannelType = Exclude<
  ChatChannelType,
  "review-special"
>;
