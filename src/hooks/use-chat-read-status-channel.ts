"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchChatReadStatusChannel } from "@/apis/firestore/fetch-chat-read-status-channel";
import { ChatChannelType } from "@/types/chat";

export function useChatReadStatusChannel(
  channelId: string,
  channelType: ChatChannelType
) {
  return useQuery({
    queryKey: ["chatReadStatusChannel", channelType, channelId],
    queryFn: () => fetchChatReadStatusChannel(channelId, channelType),
    enabled: Boolean(channelId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false
  });
}
