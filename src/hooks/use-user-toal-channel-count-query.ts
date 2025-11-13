import { fetchUserTotalChannelCount } from "@/apis/firestore/fetch-user-total-channel-count";
import { ChatChannelType } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";

interface UseUserTotalChannelCountResult {
  data: number | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 특정 userId의 전체 채널 개수를 가져오는 TanStack Query 훅
 * @param userId 유저 ID
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export function useUserTotalChannelCount(
  userId: string | undefined,
  channelType: ChatChannelType = 'model-matching'
): UseUserTotalChannelCountResult {
  const query = useQuery<number, Error>({
    queryKey: ["userTotalChannelCount", channelType, userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(0);
      return fetchUserTotalChannelCount(userId, channelType);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null
  };
}
