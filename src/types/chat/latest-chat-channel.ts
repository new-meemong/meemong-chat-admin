import type { ChatChannel } from "./chat-channel";
import type { ChatV2ParticipantOpening } from "./chat-v2-opening";

/** 최신 채널 관리 목록에 필요한 참가자별 개봉 정보가 결합된 채널. */
export interface LatestChatChannel extends ChatChannel {
  participantOpenings: ChatV2ParticipantOpening[];
}
