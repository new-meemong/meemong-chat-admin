import { CHAT_CHANNEL_COLLECTIONS } from "./constants";
import { ChatChannelType } from "@/types/chat";
import { normalizeChatParticipantIds } from "./normalize-chat-participant-ids";

export interface ReadStatusChannelSource {
  id: string;
  channelKey: string;
  participantsIds: readonly unknown[];
  channelOpenUserId?: number | string;
}

interface ReadStatusParticipantIdsResult {
  participantIds: Array<number | string>;
  channelKeyWarning: string | null;
  hasParticipantResolutionError: boolean;
}

function getFallbackParticipantIds(channel: ReadStatusChannelSource) {
  const currentParticipantIds = normalizeChatParticipantIds(
    channel.participantsIds ?? []
  );

  if (currentParticipantIds.length === 2) return currentParticipantIds;
  if (currentParticipantIds.length > 2) return [];

  const openUserId = Number(channel.channelOpenUserId);
  if (
    Number.isFinite(openUserId) &&
    openUserId > 0 &&
    !currentParticipantIds.includes(String(openUserId))
  ) {
    return normalizeChatParticipantIds([
      ...currentParticipantIds,
      openUserId
    ]);
  }

  return currentParticipantIds;
}

function isTwoValidParticipants(participantIds: string[]) {
  return (
    participantIds.length === 2 &&
    normalizeChatParticipantIds(participantIds).length === 2
  );
}

/**
 * 읽음 상태는 채널 생성 당시의 2인을 기준으로 판단한다.
 * channelKey를 해석할 수 없을 때만 현재 참여자와 개설자 정보로 폴백한다.
 */
export function getReadStatusParticipantIds(
  channel: ReadStatusChannelSource,
  channelType: ChatChannelType
): ReadStatusParticipantIdsResult {
  const channelKeyPrefix = `${
    CHAT_CHANNEL_COLLECTIONS[channelType].channels
  }_`;
  const channelKey = channel.channelKey;

  if (
    typeof channelKey !== "string" ||
    !channelKey.startsWith(channelKeyPrefix)
  ) {
    const fallbackParticipantIds = getFallbackParticipantIds(channel);
    return {
      participantIds: fallbackParticipantIds,
      channelKeyWarning: "channelKey prefix가 예상 형식과 다릅니다.",
      hasParticipantResolutionError: fallbackParticipantIds.length !== 2
    };
  }

  const channelKeyParts = channelKey
    .slice(channelKeyPrefix.length)
    .split("_");

  // 실제 구인 채널 키의 마지막 두 값은 jobPostingId와 resumeId다.
  const participantCandidates =
    channelType === "job-posting"
      ? [channelKeyParts.slice(0, -2), channelKeyParts]
      : [channelKeyParts];
  const originalParticipantIds = participantCandidates.find(
    isTwoValidParticipants
  );
  const currentParticipantIds = normalizeChatParticipantIds(
    channel.participantsIds ?? []
  );
  const hasCurrentParticipantIntersection =
    currentParticipantIds.length === 0 ||
    Boolean(
      originalParticipantIds?.some((participantId) =>
        currentParticipantIds.includes(String(Number(participantId)))
      )
    );

  if (!originalParticipantIds || !hasCurrentParticipantIntersection) {
    const fallbackParticipantIds = getFallbackParticipantIds(channel);
    return {
      participantIds: fallbackParticipantIds,
      channelKeyWarning: originalParticipantIds
        ? "channelKey 참여자와 현재 참여자가 일치하지 않습니다."
        : "channelKey에서 최초 참여자 2명을 복원하지 못했습니다.",
      hasParticipantResolutionError: fallbackParticipantIds.length !== 2
    };
  }

  return {
    participantIds: originalParticipantIds,
    channelKeyWarning: null,
    hasParticipantResolutionError: false
  };
}
