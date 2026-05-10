import { ChatChannel, ChatChannelType } from "@/types/chat";
import { fetchChatChannel } from "@/apis/firestore/fetch-chat-channel";
import { useQuery } from "@tanstack/react-query";

export function useChatChannel(
  channelId: string,
  channelType: ChatChannelType = "model-matching"
) {
  return useQuery<ChatChannel | null, Error>({
    queryKey: ["chatChannel", channelType, channelId],
    queryFn: () => fetchChatChannel(channelId, channelType),
    enabled: Boolean(channelId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false
  });
}
