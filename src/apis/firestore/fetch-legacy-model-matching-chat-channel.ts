import { doc, getDoc } from "firebase/firestore";

import { isAuthTokenError } from "@/apis/fetch";
import { getUser } from "@/apis/users/get-user";
import { db } from "@/lib/firebase";
import { LegacyModelMatchingChatChannel } from "@/types/chat";
import { User } from "@/types/user";
import { CHAT_V2_SERVICES } from "./constants";
import { sanitizeChatParticipantIds } from "./normalize-chat-participant-ids";

export async function fetchLegacyModelMatchingChatChannel(
  channelId: string
): Promise<LegacyModelMatchingChatChannel | null> {
  if (!channelId) return null;

  const { sourceCollection } = CHAT_V2_SERVICES["model-matching"];
  const channelSnapshot = await getDoc(
    doc(db, sourceCollection, channelId)
  );
  if (!channelSnapshot.exists()) return null;

  const data = channelSnapshot.data();
  if (data.schemaVersion === 2) {
    throw new Error("v2 채널은 레거시 조회 경로로 열 수 없습니다.");
  }

  const participantIds = sanitizeChatParticipantIds(
    Array.isArray(data.participantsIds) ? data.participantsIds : []
  ).map(Number);
  const users = (
    await Promise.all(
      participantIds.map(async (userId) => {
        try {
          return await getUser(userId);
        } catch (error) {
          if (isAuthTokenError(error)) throw error;
          console.warn(
            `[fetchLegacyModelMatchingChatChannel] getUser failed: ${userId}`,
            error
          );
          return null;
        }
      })
    )
  ).filter((user): user is User => user !== null);
  const storedChannelOpenUserId = Number(data.channelOpenUserId);
  const rightAlignedUserId = participantIds.includes(storedChannelOpenUserId)
    ? storedChannelOpenUserId
    : participantIds[0] ?? 0;

  return {
    id: channelSnapshot.id,
    participantIds,
    rightAlignedUserId,
    users
  };
}
