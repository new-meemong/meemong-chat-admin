import { User } from "@/types/user";

/** 신고 상세에서만 임시로 조회하는 v1 모델 매칭 채널 정보. */
export interface LegacyModelMatchingChatChannel {
  id: string;
  participantIds: number[];
  rightAlignedUserId: number;
  users: User[];
}
