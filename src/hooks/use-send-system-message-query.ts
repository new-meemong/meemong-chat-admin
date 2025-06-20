import { postSystemMessageToChannel } from "@/apis/firestore/model-matching/post-system-message-to-channel";
// hooks/use-send-system-message.ts
import { useMutation } from "@tanstack/react-query";

export function useSendSystemMessage() {
  return useMutation({
    mutationFn: ({
      channelId,
      message,
      type,
      user1Id,
      user2Id
    }: {
      channelId: string;
      message: string;
      type: string;
      user1Id: string;
      user2Id: string;
    }) => postSystemMessageToChannel(channelId, message, type, user1Id, user2Id)
  });
}
