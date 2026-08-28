import { apiFetch } from "@/apis/fetch";

/** 앱이 꺼진 동안 표시되는 Node 푸시 배지용 총 미읽음 수를 1 증가시킨다. */
export async function incrementChatUnreadCount(userId: string): Promise<void> {
  const numericUserId = Number(userId);
  if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) {
    throw new Error(`올바르지 않은 채팅 수신자 ID입니다: ${userId}`);
  }
  await apiFetch("/api/v1/chatting-unread-counts", "POST", {
    userId: numericUserId,
    unreadCount: 1
  });
}
