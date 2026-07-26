import { doc, getDoc } from "firebase/firestore";

import { CHAT_CHANNEL_COLLECTIONS } from "./constants";
import { ChatChannelType } from "@/types/chat";
import { db } from "@/lib/firebase";
import type { ReadStatusChannelSource } from "./get-read-status-participant-ids";

export async function fetchChatReadStatusChannel(
  channelId: string,
  channelType: ChatChannelType
): Promise<ReadStatusChannelSource | null> {
  if (!channelId) return null;

  const { channels } = CHAT_CHANNEL_COLLECTIONS[channelType];
  const snapshot = await getDoc(doc(db, channels, channelId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const numericOpenUserId = Number(data.channelOpenUserId);

  return {
    id: snapshot.id,
    channelKey: typeof data.channelKey === "string" ? data.channelKey : "",
    participantsIds: Array.isArray(data.participantsIds)
      ? data.participantsIds
      : [],
    channelOpenUserId:
      Number.isFinite(numericOpenUserId) && numericOpenUserId > 0
        ? String(numericOpenUserId)
        : undefined
  };
}
