export type ChatV2OpenState = "NOT_OPENED" | "OPENED";

export type ChatV2OpenMethod =
  | "MONG"
  | "GROWTH_PASS"
  | "MEEMONG_PASS"
  | "FREE_POLICY"
  | "AD"
  | "NONE";

/** 사용자별 v2 채팅 개봉 상태와 실제 개봉 방법. */
export interface ChatV2Opening {
  state: ChatV2OpenState;
  method: ChatV2OpenMethod;
  openedMongAmount: number | null;
  openedAt: Timestamp | null;
  entrySource: string | null;
  awaitingReply: boolean;
  awaitingReplyStartedAt: Timestamp | null;
  /** 환불 종료 시 양쪽 참가자 메타에 복제되는 방 단위 상태. */
  isChannelRefunded: boolean;
  /** REFUND_AFTER_NO_REPLY로 실제 환불받은 참가자인지 여부. */
  isRefundRecipient: boolean;
}

/** 최신 채널 목록에서 참가자별 개봉 상태를 독립적으로 표시하기 위한 모델. */
export interface ChatV2ParticipantOpening {
  userId: number;
  opening: ChatV2Opening | null;
  issueReason: string | null;
}
import type { Timestamp } from "firebase/firestore";
