import { postSystemMessageToChannel } from "@/apis/firestore/post-system-message-to-channel";
import { ChatChannelType } from "@/types/chat";
import { useMutation } from "@tanstack/react-query";

export function useSendSystemMessage() {
  return useMutation({
    mutationFn: ({
      channelId,
      message,
      type,
      channelType = 'model-matching' as ChatChannelType
    }: {
      channelId: string;
      message: string;
      type: string;
      channelType?: ChatChannelType;
    }) => postSystemMessageToChannel(channelId, message, type, channelType)
  });
}
