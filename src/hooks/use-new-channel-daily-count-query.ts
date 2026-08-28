import { countDailyNewChatChannelsByDate } from "@/apis/firestore/post-new-channel-daily-count";
import { DailyCountChannelType } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";
import type { DailyChannelCountResult } from "@/apis/firestore/daily-count-contract";

interface UseDailyCountResult {
  data: DailyChannelCountResult | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 주어진 날짜(YYYY-MM-DD)에 생성된 채팅방 수를 가져오는 TanStack Query 훅
 * @param dateString 예: "2025-06-01"
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export function useNewChannelDailyCountQuery(
  dateString: string,
  channelType: DailyCountChannelType = 'model-matching'
): UseDailyCountResult {
  const query = useQuery<DailyChannelCountResult, Error>({
    queryKey: ["dailyCount", channelType, dateString],
    queryFn: () => countDailyNewChatChannelsByDate(dateString, channelType),
    enabled: !!dateString,
    // staleTime: Infinity,
    // gcTime: Infinity,
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
