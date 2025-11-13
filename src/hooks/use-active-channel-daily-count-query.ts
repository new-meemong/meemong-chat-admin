import { countDailyActiveChatChannelsByDate } from "@/apis/firestore/post-active-channel-daily-count";
import { ChatChannelType } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";

interface UseDailyCountResult {
  data: number | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 주어진 날짜(YYYY-MM-DD)에 활성 채널 수를 가져오는 TanStack Query 훅
 * @param dateString 예: "2025-06-01"
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export function useDailyActiveChatChannelsCountQuery(
  dateString: string,
  channelType: ChatChannelType = 'model-matching'
): UseDailyCountResult {
  const query = useQuery<number, Error>({
    queryKey: ["activeChannelDailyCount", channelType, dateString],
    queryFn: () => countDailyActiveChatChannelsByDate(dateString, channelType),
    enabled: !!dateString,
    staleTime: 0,
    gcTime: 0,
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
