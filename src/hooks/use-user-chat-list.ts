import { useQuery } from "@tanstack/react-query";

import {
  fetchUserChatListItems,
  fetchUserV2ChatCount
} from "@/apis/firestore/fetch-user-chat-list-items";
import { getUser } from "@/apis/users/get-user";

export function useUserChatList(userId: string | undefined) {
  return useQuery({
    queryKey: ["userV2ChatList", userId],
    queryFn: async () => {
      if (!userId) throw new Error("사용자 ID가 없습니다.");
      const numericUserId = Number(userId);
      if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) {
        throw new Error("사용자 ID가 올바르지 않습니다.");
      }
      const [currentUser, items, totalCount] = await Promise.all([
        getUser(numericUserId),
        fetchUserChatListItems(userId),
        fetchUserV2ChatCount(userId)
      ]);
      return { currentUser, items, totalCount };
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false
  });
}
