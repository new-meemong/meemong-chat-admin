import { fetchUserTotalChannelCount } from "@/apis/firestore/model-matching/fetch-user-total-channel-count";
import { useQuery } from "@tanstack/react-query";

interface UseUserTotalChannelCountResult {
  data: number | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 특정 userId의 전체 modelMatching 채널 개수를 가져오는 TanStack Query 훅
 * @param userId 유저 ID
 */
export function useUserTotalChannelCount(
  userId: string | undefined
): UseUserTotalChannelCountResult {
  const query = useQuery<number, Error>({
    queryKey: ["userTotalChannelCount", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(0);
      return fetchUserTotalChannelCount(userId);
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
