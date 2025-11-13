import { countDailyNewChatChannels } from "@/apis/firestore/post-new-channel-daily-count";
import { useMutation } from "@tanstack/react-query";

/**
 * modelMatchingDailyCount의 baseDate 이후 ~ 어제까지의 daily count를 갱신하는 훅
 */
export function useCountDailyNewChatChannels() {
  const mutation = useMutation<void, Error>({
    mutationFn: countDailyNewChatChannels
  });

  return mutation;
}
