import { ChatChannel, ChatChannelType, ChatMessage } from "@/types/chat";
import {
  DocumentData,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
} from "firebase/firestore";

import { CHAT_CHANNEL_COLLECTIONS } from "./constants";
import { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";

export async function fetchChatChannel(
  channelId: string,
  channelType: ChatChannelType = "model-matching"
): Promise<ChatChannel | null> {
  if (!channelId) return null;

  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];
  const channelRef = doc(db, collections.channels, channelId);
  const channelSnap = await getDoc(channelRef);

  if (!channelSnap.exists()) return null;

  const data = channelSnap.data() as DocumentData;
  const participantsIds = ((data.participantsIds ?? []) as Array<
    number | string
  >)
    .filter((userId) => String(userId) !== "system")
    .map((userId) => Number(userId))
    .filter((userId) => Number.isFinite(userId));

  const users = (
    await Promise.all(
      participantsIds.map(async (userId) => {
        try {
          return await getUser(userId);
        } catch (error) {
          console.warn(`[fetchChatChannel] getUser failed for ${userId}`, error);
          return null;
        }
      })
    )
  ).filter((user): user is User => user !== null);

  const messagesCol = collection(
    db,
    collections.channels,
    channelId,
    "messages"
  );
  const lastMessageQuery = query(
    messagesCol,
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const [lastMessageSnap, countSnap] = await Promise.all([
    getDocs(lastMessageQuery),
    getCountFromServer(messagesCol)
  ]);

  let lastMessage: ChatMessage | null = null;
  if (!lastMessageSnap.empty) {
    const messageDoc = lastMessageSnap.docs[0];
    const messageData = messageDoc.data();
    const senderId = Number(messageData.senderId);

    lastMessage = {
      id: messageDoc.id,
      message: messageData.message,
      messageType: messageData.messageType,
      metaPathList: messageData.metaPathList || [],
      senderId,
      createdAt: messageData.createdAt as Timestamp,
      updatedAt: messageData.updatedAt as Timestamp,
      user: users.find((user) => user.id === senderId) || null
    };
  }

  return {
    id: channelSnap.id,
    type: channelType,
    channelKey: data.channelKey,
    participantsIds,
    channelOpenUserId: Number(data.channelOpenUserId),
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    users,
    lastMessage,
    messageCount: countSnap.data().count
  };
}
