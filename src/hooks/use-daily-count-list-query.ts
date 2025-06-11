import { getDailyCountsByPeriod } from "@/apis/firestore/model-matching/get-daily-counts";
import { useQuery } from "@tanstack/react-query";

interface DailyCountItem {
  id: string;
  dailyTotalCount: number;
  baseDate: string;
  dailyTotalActiveCount: number;
}

interface UseDailyCountListQueryResult {
  data: DailyCountItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 주어진 기간(YYYY-MM-DD ~ YYYY-MM-DD)의 daily count 리스트를 가져오는 TanStack Query 훅
 * @param startDate 예: "2025-06-01"
 * @param endDate 예: "2025-06-10"
 */
export function useDailyCountListQuery(
  startDate: string,
  endDate: string
): UseDailyCountListQueryResult {
  const query = useQuery<DailyCountItem[], Error>({
    queryKey: ["dailyCountList", startDate, endDate],
    queryFn: () => getDailyCountsByPeriod(startDate, endDate),
    enabled: !!startDate && !!endDate,
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
