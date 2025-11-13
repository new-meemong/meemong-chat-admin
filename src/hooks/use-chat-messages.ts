import { ChatMessage, ChatChannelType } from "@/types/chat";
import { User } from "@/types/user";
import { fetchChatMessages } from "@/apis/firestore/fetch-chat-messages";
import { useQuery } from "@tanstack/react-query";

interface UseChatMessagesResult {
  data: ChatMessage[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * 채널 ID와 사용자 목록을 인자로 받아 해당 채팅방의 모든 메시지를 가져오는 훅
 *
 * @param channelId  가져오려는 채팅방 ID
 * @param users      채팅방 참여자(또는 전체 유저) 배열 (senderId → User 매핑용)
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export function useChatMessages(
  channelId: string,
  users: User[],
  channelType: ChatChannelType = 'model-matching'
): UseChatMessagesResult {
  const queryResult = useQuery<ChatMessage[], Error>({
    queryKey: ["chatMessages", channelType, channelId],
    queryFn: () => fetchChatMessages(channelId, users, channelType),
    staleTime: 1000 * 60 * 1, // 1분 동안 데이터를 신선한 것으로 간주
    gcTime: 1000 * 60 * 5, // 캐시를 5분 동안 유지
    refetchOnWindowFocus: false, // 포커스 복귀 시 자동 refetch 방지
    enabled: Boolean(channelId) // channelId가 있을 때만 동작
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error ?? null
  };
}
