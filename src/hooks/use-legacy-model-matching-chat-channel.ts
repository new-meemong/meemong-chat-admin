import { useQuery } from "@tanstack/react-query";

import { fetchLegacyModelMatchingChatChannel } from "@/apis/firestore/fetch-legacy-model-matching-chat-channel";
import { LegacyModelMatchingChatChannel } from "@/types/chat";

export function useLegacyModelMatchingChatChannel(channelId: string) {
  return useQuery<LegacyModelMatchingChatChannel | null, Error>({
    queryKey: ["legacyModelMatchingChatChannel", channelId],
    queryFn: () => fetchLegacyModelMatchingChatChannel(channelId),
    enabled: Boolean(channelId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false
  });
}
