import { apiFetch } from "./fetch";

export enum ChatMessageType {
  SYSTEM = "SYSTEM"
}

export const sendPushNotification = async (
  userId: string,
  message: string,
  chatMessageType: ChatMessageType
) => {
  try {
    if (!userId || !message) {
      throw new Error("userId와 message는 필수 항목입니다");
    }

    return await apiFetch("/api/v1/push/chat-messages", "POST", {
      userId,
      message,
      chatMessageType
    });
  } catch (error) {
    console.error("[sendPushNotification] failed", error);
    return { success: false, error: error || "푸시 알림 전송에 실패했습니다" };
  }
};
