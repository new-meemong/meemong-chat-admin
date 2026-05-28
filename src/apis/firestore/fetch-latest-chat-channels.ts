import { ChatChannel, ChatChannelType, ChatMessage } from "@/types/chat";
import {
  DocumentData,
  Timestamp,
  collection,
  getDocs,
  limit,
  orderBy,
  query
} from "firebase/firestore";

import { CHAT_CHANNEL_COLLECTIONS } from "./constants";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";
import { isAuthTokenError } from "@/apis/fetch";
import { User } from "@/types/user";

const getParticipantIds = (participantsIds: unknown): number[] => {
  if (!Array.isArray(participantsIds)) return [];

  return participantsIds
    .map((userId) => Number(userId))
    .filter((userId) => Number.isFinite(userId));
};

const isUser = (user: User | undefined): user is User => user !== undefined;

/**
 * 최신 채팅방(채널) 100개를 가져오고, 각 채널의 마지막 메시지도 함께 조회하는 함수
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function fetchLatestChatChannels(
  channelType: ChatChannelType = "model-matching"
): Promise<ChatChannel[]> {
  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];

  // 1) 컬렉션 참조 생성
  const chatChannelsCol = collection(db, collections.channels);

  // 2) 쿼리: updatedAt 내림차순, 최대 100개
  const q = query(chatChannelsCol, orderBy("updatedAt", "desc"), limit(100));

  // 3) 쿼리 실행 (getDocs)
  const snapshot = await getDocs(q);

  const channelDocs = snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;

    return {
      data,
      channelId: doc.id,
      participantsIds: getParticipantIds(data.participantsIds)
    };
  });

  const userIds = Array.from(
    new Set(channelDocs.flatMap((channel) => channel.participantsIds))
  );
  const usersById = new Map<number, User>();

  const loadUser = async (userId: number) => {
    try {
      const user = await getUser(userId);
      usersById.set(userId, user);
    } catch (error) {
      if (isAuthTokenError(error)) {
        throw error;
      }

      console.warn(
        `[fetchLatestChatChannels] getUser failed for ${userId}`,
        error
      );
    }
  };

  await Promise.all(userIds.map(loadUser));

  // 4) 문서 스냅샷을 비동기로 순회하며, lastMessage도 함께 조회
  const channelsWithLastMsg = await Promise.all(
    channelDocs.map(async ({ data, channelId, participantsIds }) => {
      const users = participantsIds
        .map((userId) => usersById.get(userId))
        .filter(isUser);

      // ─── 추가: messages 서브컬렉션에서 마지막 메시지 조회 ───
      const messagesCol = collection(
        db,
        collections.channels,
        channelId,
        "messages"
      );
      const msgQuery = query(
        messagesCol,
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const msgSnap = await getDocs(msgQuery);

      // 전체 메시지 개수 카운트
      const allMsgsSnap = await getDocs(messagesCol);
      const messageCount = allMsgsSnap.size;

      let lastMessage: ChatMessage | null = null;
      if (!msgSnap.empty) {
        const msgData = msgSnap.docs[0].data();
        const senderId = msgData.senderId;
        // users 배열에서 senderUser 찾기
        const senderUser = users.find((user) => user?.id === senderId) || null;
        lastMessage = {
          id: msgSnap.docs[0].id,
          message: msgData.message,
          messageType: msgData.messageType,
          metaPathList: msgData.metaPathList || [],
          senderId: senderId,
          createdAt: msgData.createdAt as Timestamp,
          updatedAt: msgData.updatedAt as Timestamp,
          user: senderUser
        };
      }
      // ─────────────────────────────────────────────────────────

      return {
        id: channelId,
        type: channelType,
        channelKey: data.channelKey,
        participantsIds,
        channelOpenUserId: Number(data.channelOpenUserId),
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        lastMessage,
        users,
        messageCount
      };
    })
  );

  return channelsWithLastMsg;
}
