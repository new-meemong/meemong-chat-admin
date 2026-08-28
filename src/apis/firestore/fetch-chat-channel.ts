import { ChatChannel, ChatChannelType, ChatMessage } from "@/types/chat";
import {
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

import { CHAT_V2_SERVICES } from "./constants";
import { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";
import { isAuthTokenError } from "@/apis/fetch";
import {
  parseChatV2ChannelIdentity,
  parseChatV2ChannelInsights
} from "./chat-v2-contract";

function requiredTimestamp(value: unknown, fieldName: string): Timestamp {
  if (!(value instanceof Timestamp)) {
    throw new Error(`v2 채널의 ${fieldName} 값이 Timestamp가 아닙니다.`);
  }
  return value;
}

export async function fetchChatChannel(
  channelId: string,
  channelType: ChatChannelType = "model-matching"
): Promise<ChatChannel | null> {
  if (!channelId) return null;

  const { sourceCollection } = CHAT_V2_SERVICES[channelType];
  const channelSnapshot = await getDoc(doc(db, sourceCollection, channelId));
  if (!channelSnapshot.exists()) return null;

  const data = channelSnapshot.data();
  const identity = parseChatV2ChannelIdentity({
    documentId: channelSnapshot.id,
    chatType: channelType,
    rawData: data
  });
  const insights = parseChatV2ChannelInsights(data, identity.postType);
  const users = (
    await Promise.all(
      identity.participantIds.map(async (userId) => {
        try {
          return await getUser(userId);
        } catch (error) {
          if (isAuthTokenError(error)) throw error;
          console.warn(`[fetchChatChannel] getUser failed: ${userId}`, error);
          return null;
        }
      })
    )
  ).filter((user): user is User => user !== null);

  const messages = collection(db, sourceCollection, channelId, "messages");
  const [lastMessageSnapshot, countSnapshot] = await Promise.all([
    getDocs(query(messages, orderBy("createdAt", "desc"), limit(1))),
    getCountFromServer(messages)
  ]);

  let lastMessage: ChatMessage | null = null;
  if (!lastMessageSnapshot.empty) {
    const messageDocument = lastMessageSnapshot.docs[0];
    const messageData = messageDocument.data();
    const senderId = Number(messageData.senderId);
    lastMessage = {
      id: messageDocument.id,
      message: String(messageData.message ?? ""),
      messageType: String(messageData.messageType ?? ""),
      metaPathList: Array.isArray(messageData.metaPathList)
        ? messageData.metaPathList
        : [],
      senderId,
      createdAt: requiredTimestamp(messageData.createdAt, "message.createdAt"),
      updatedAt: requiredTimestamp(messageData.updatedAt, "message.updatedAt"),
      user: users.find((user) => user.id === senderId) ?? null
    };
  }

  return {
    id: channelSnapshot.id,
    type: channelType,
    ...identity,
    ...insights,
    createdAt: requiredTimestamp(data.createdAt, "createdAt"),
    updatedAt: requiredTimestamp(data.updatedAt, "updatedAt"),
    users,
    lastMessage,
    messageCount: countSnapshot.data().count
  };
}
