import { UserModelMatchingChatChannel } from "@/types/user-model-matching-chat-channels";
import { fetchUserLatestChatChannels } from "@/apis/firestore/model-matching/fetch-user-latest-chat-channels";
import { useQuery } from "@tanstack/react-query";

interface UseUserLatestChatChannelsResult {
  data: UserModelMatchingChatChannel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 특정 userId의 최신 채팅방 100개를 가져오는 TanStack Query 훅
 * @param userId 유저 ID
 */
export function useUserLatestChatChannels(
  userId: string | undefined
): UseUserLatestChatChannelsResult {
  const query = useQuery<UserModelMatchingChatChannel[], Error>({
    queryKey: ["userLatestChatChannels", userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchUserLatestChatChannels(userId);
    },
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
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
