import { postSystemMessageToChannel } from "@/apis/firestore/model-matching/post-system-message-to-channel";
// hooks/use-send-system-message.ts
import { useMutation } from "@tanstack/react-query";

export function useSendSystemMessage() {
  return useMutation({
    mutationFn: ({
      channelId,
      message
    }: {
      channelId: string;
      message: string;
    }) => postSystemMessageToChannel(channelId, message)
  });
}
