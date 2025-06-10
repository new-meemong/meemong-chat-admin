import { countChatChannels } from "@/apis/firestore/model-matching/post-daily-count";
import { useMutation } from "@tanstack/react-query";

/**
 * modelMatchingDailyCount의 baseDate 이후 ~ 어제까지의 daily count를 갱신하는 훅
 */
export function useCountChatChannels() {
  const mutation = useMutation<void, Error>({
    mutationFn: countChatChannels
  });

  return mutation;
}
