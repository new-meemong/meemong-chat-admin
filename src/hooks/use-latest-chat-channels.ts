import { ModelMatchingChatChannel } from "@/types/model-matching-chat-channel";
import { fetchLatestChatChannels } from "@/apis/firestore/model-matching/fetch-latest-chat-channels";
import { useQuery } from "@tanstack/react-query";

interface UseLatestChatChannelsResult {
  data: ModelMatchingChatChannel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 최신 채팅방 100개를 가져오는 TanStack Query 훅
 * 반환값: { data, isLoading, isError, error }
 */
export function useLatestChatChannels(): UseLatestChatChannelsResult {
  const query = useQuery<ModelMatchingChatChannel[], Error>({
    queryKey: ["latestChatChannels"],
    queryFn: fetchLatestChatChannels,
    staleTime: 1000 * 60 * 5, // 5분 동안은 "신선"하다고 간주 (추가 요청 X)
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지 (v5부터 cacheTime → gcTime)
    refetchOnWindowFocus: false // 포커스를 잃었다 돌아올 때 재요청 방지
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null
  };
}
