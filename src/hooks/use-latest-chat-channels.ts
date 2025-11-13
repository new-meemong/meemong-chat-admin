import { ChatChannel, ChatChannelType } from "@/types/chat";
import { fetchLatestChatChannels } from "@/apis/firestore/fetch-latest-chat-channels";
import { useQuery } from "@tanstack/react-query";

interface UseLatestChatChannelsResult {
  data: ChatChannel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 최신 채팅방 100개를 가져오는 TanStack Query 훅
 * @param channelType 채널 타입 (기본값: 'model-matching')
 * 반환값: { data, isLoading, isError, error }
 */
export function useLatestChatChannels(
  channelType: ChatChannelType = 'model-matching'
): UseLatestChatChannelsResult {
  const query = useQuery<ChatChannel[], Error>({
    queryKey: ["latestChatChannels", channelType],
    queryFn: () => fetchLatestChatChannels(channelType),
    staleTime: 1000 * 60 * 10, // 10분 동안은 추가 요청 X
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지 (v5부터 cacheTime → gcTime)
    refetchOnWindowFocus: false, // 포커스를 잃었다 돌아올 때 재요청 방지
    retry: false
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null
  };
}
