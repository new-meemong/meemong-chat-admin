import { postSystemMessageToChannel } from "@/apis/firestore/post-system-message-to-channel";
import { ChatChannelType } from "@/types/chat";
import { useMutation } from "@tanstack/react-query";

export function useSendSystemMessage() {
  return useMutation({
    mutationFn: ({
      channelId,
      message,
      type,
      user1Id,
      user2Id,
      channelType = 'model-matching' as ChatChannelType
    }: {
      channelId: string;
      message: string;
      type: string;
      user1Id: string;
      user2Id: string;
      channelType?: ChatChannelType;
    }) => postSystemMessageToChannel(channelId, message, type, user1Id, user2Id, channelType)
  });
}
