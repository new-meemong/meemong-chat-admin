"use client";

import { useEffect, useMemo } from "react";

import { getReadStatusParticipantIds } from "@/apis/firestore/get-read-status-participant-ids";
import type { ReadStatusChannelSource } from "@/apis/firestore/get-read-status-participant-ids";
import { ChatChannelType } from "@/types/chat";

export type ReadStatusParticipantIssue =
  | "resolution-failed"
  | "channel-fetch-failed"
  | "channel-missing"
  | null;

interface ReadStatusParticipantSourceState {
  isLoading: boolean;
  isError: boolean;
}

const EMPTY_RESULT = {
  participantIds: [] as Array<number | string>,
  channelKeyWarning: null as string | null,
  hasParticipantResolutionError: false
};

export function useReadStatusParticipants(
  channel: ReadStatusChannelSource | null | undefined,
  channelType: ChatChannelType,
  sourceState: ReadStatusParticipantSourceState
) {
  const result = useMemo(
    () =>
      channel
        ? getReadStatusParticipantIds(channel, channelType)
        : EMPTY_RESULT,
    [channel, channelType]
  );

  useEffect(() => {
    if (!channel || !result.channelKeyWarning) return;

    console.warn(
      `[useReadStatusParticipants] ${channel.id}: ${result.channelKeyWarning}`,
      { channelKey: channel.channelKey, channelType }
    );
  }, [channel, channelType, result.channelKeyWarning]);

  const participantIssue: ReadStatusParticipantIssue = sourceState.isError
    ? "channel-fetch-failed"
    : !sourceState.isLoading && !channel
    ? "channel-missing"
    : result.hasParticipantResolutionError
    ? "resolution-failed"
    : null;

  return {
    ...result,
    participantIssue,
    isParticipantResolutionLoading: sourceState.isLoading
  };
}
