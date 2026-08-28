import {
  ChatChannelType,
  ChatMessage,
  ChatV2DocumentIssue,
  captureChatV2DocumentValidation,
  chatV2DocumentIssue,
  isChatV2DocumentIssue,
  LatestChatChannel
} from "@/types/chat";
import {
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter
} from "firebase/firestore";

import {
  CHAT_ADMIN_LIST_RESULT_LIMIT,
  CHAT_V2_SERVICES,
  FIRESTORE_SCAN_PAGE_SIZE
} from "./constants";
import { db } from "@/lib/firebase";
import { getUser } from "@/apis/users/get-user";
import { isAuthTokenError } from "@/apis/fetch";
import {
  isV2Document,
  parseChatV2ChannelIdentity,
  parseChatV2ChannelInsights
} from "./chat-v2-contract";
import { User } from "@/types/user";
import { parseChatV2Opening } from "./chat-v2-opening-contract";
import type { ChatV2ParticipantOpening } from "@/types/chat";

function requiredTimestamp(value: unknown, fieldName: string): Timestamp {
  if (!(value instanceof Timestamp)) {
    throw new Error(`v2 채널의 ${fieldName} 값이 Timestamp가 아닙니다.`);
  }
  return value;
}

function isUser(user: User | undefined): user is User {
  return user !== undefined;
}

function errorReason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 메인 채널에는 참가자별 개봉 방법·금액·환불 상태가 없다. projection은 이 값을
 * 목록 표시용으로 정규화하므로 운영 원본인 사용자 채널 메타를 직접 읽는다.
 */
async function fetchParticipantOpening({
  userId,
  channelId,
  userChannelCollection
}: {
  userId: number;
  channelId: string;
  userChannelCollection: string;
}): Promise<ChatV2ParticipantOpening> {
  try {
    const snapshot = await getDoc(
      doc(
        db,
        "users",
        String(userId),
        userChannelCollection,
        channelId
      )
    );
    if (!snapshot.exists()) {
      return {
        userId,
        opening: null,
        issueReason: "v2 사용자 채널 메타 문서가 없습니다."
      };
    }
    return {
      userId,
      opening: parseChatV2Opening(snapshot.data(), {
        userId: String(userId),
        channelId
      }),
      issueReason: null
    };
  } catch (error) {
    console.warn(
      `[fetchLatestChatChannels] participant opening read failed: ${channelId}/${userId}`,
      error
    );
    return { userId, opening: null, issueReason: errorReason(error) };
  }
}

/**
 * 인덱스 추가 배포 없이 레거시 문서를 완전히 제외하기 위해 updatedAt 순서로
 * 페이지를 진행하며 schemaVersion 2 문서만 최대 100개 모은다.
 */
async function fetchLatestV2DocumentSnapshots(channelType: ChatChannelType) {
  const { sourceCollection } = CHAT_V2_SERVICES[channelType];
  const channels = collection(db, sourceCollection);
  const result: QueryDocumentSnapshot<DocumentData>[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

  while (result.length < CHAT_ADMIN_LIST_RESULT_LIMIT) {
    const pageQuery: Query<DocumentData> = cursor
      ? query(
          channels,
          orderBy("updatedAt", "desc"),
          startAfter(cursor),
          limit(FIRESTORE_SCAN_PAGE_SIZE)
        )
      : query(
          channels,
          orderBy("updatedAt", "desc"),
          limit(FIRESTORE_SCAN_PAGE_SIZE)
        );
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(pageQuery);
    if (snapshot.empty) break;

    for (const document of snapshot.docs) {
      if (isV2Document(document.data())) result.push(document);
      if (result.length === CHAT_ADMIN_LIST_RESULT_LIMIT) break;
    }

    cursor = snapshot.docs.at(-1) ?? null;
    if (snapshot.size < FIRESTORE_SCAN_PAGE_SIZE) break;
  }

  return result;
}

/** 최신 v2 채팅방 100개와 각 채널의 마지막 메시지를 조회한다. */
export async function fetchLatestChatChannels(
  channelType: ChatChannelType = "model-matching"
): Promise<Array<LatestChatChannel | ChatV2DocumentIssue>> {
  const { sourceCollection, userChannelCollection } =
    CHAT_V2_SERVICES[channelType];
  const snapshots = await fetchLatestV2DocumentSnapshots(channelType);
  const channelDocuments = snapshots.map((snapshot) => {
    const result = captureChatV2DocumentValidation(snapshot.id, () => {
      const data = snapshot.data();
      const identity = parseChatV2ChannelIdentity({
        documentId: snapshot.id,
        chatType: channelType,
        rawData: data
      });
      return {
        snapshot,
        data,
        identity,
        insights: parseChatV2ChannelInsights(data, identity.postType)
      };
    });
    if (isChatV2DocumentIssue(result)) {
      console.warn(
        `[fetchLatestChatChannels] invalid v2 channel: ${snapshot.id}`,
        result.reason
      );
    }
    return result;
  });

  const userIds = Array.from(
    new Set(
      channelDocuments.flatMap((document) =>
        isChatV2DocumentIssue(document)
          ? []
          : document.identity.participantIds
      )
    )
  );
  const usersById = new Map<number, User>();
  await Promise.all(
    userIds.map(async (userId) => {
      try {
        usersById.set(userId, await getUser(userId));
      } catch (error) {
        if (isAuthTokenError(error)) throw error;
        console.warn(`[fetchLatestChatChannels] getUser failed: ${userId}`, error);
      }
    })
  );

  return Promise.all(
    channelDocuments.map(async (entry) => {
      if (isChatV2DocumentIssue(entry)) return entry;
      const { snapshot, data, identity, insights } = entry;
      const users = identity.participantIds
        .map((userId) => usersById.get(userId))
        .filter(isUser);
      const messages = collection(
        db,
        sourceCollection,
        snapshot.id,
        "messages"
      );
      let lastMessageSnapshot: QuerySnapshot<DocumentData>;
      let messageCountSnapshot: Awaited<ReturnType<typeof getCountFromServer>>;
      let participantOpenings: ChatV2ParticipantOpening[];
      try {
        [lastMessageSnapshot, messageCountSnapshot, participantOpenings] =
          await Promise.all([
            getDocs(query(messages, orderBy("createdAt", "desc"), limit(1))),
            getCountFromServer(messages),
            Promise.all(
              identity.participantIds.map((userId) =>
                fetchParticipantOpening({
                  userId,
                  channelId: snapshot.id,
                  userChannelCollection
                })
              )
            )
          ]);
      } catch (error) {
        console.warn(
          `[fetchLatestChatChannels] channel data read failed: ${snapshot.id}`,
          error
        );
        return chatV2DocumentIssue(snapshot.id, error, "related-read");
      }

      const result = captureChatV2DocumentValidation(snapshot.id, () => {
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
            createdAt: requiredTimestamp(
              messageData.createdAt,
              "message.createdAt"
            ),
            updatedAt: requiredTimestamp(
              messageData.updatedAt,
              "message.updatedAt"
            ),
            user: users.find((user) => user.id === senderId) ?? null
          };
        }

        return {
          id: snapshot.id,
          type: channelType,
          ...identity,
          ...insights,
          createdAt: requiredTimestamp(data.createdAt, "createdAt"),
          updatedAt: requiredTimestamp(data.updatedAt, "updatedAt"),
          participantOpenings,
          users,
          lastMessage,
          messageCount: messageCountSnapshot.data().count
        };
      });
      if (isChatV2DocumentIssue(result)) {
        console.warn(
          `[fetchLatestChatChannels] invalid v2 channel data: ${snapshot.id}`,
          result.reason
        );
      }
      return result;
    })
  );
}
