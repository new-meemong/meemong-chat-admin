import {
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from "firebase/firestore";

import {
  ChatV2DocumentIssue,
  UserChatListItem,
  UserChatListOtherUser,
  captureChatV2DocumentValidation,
  isChatV2DocumentIssue
} from "@/types/chat";
import {
  CHAT_ADMIN_LIST_RESULT_LIMIT,
  CHAT_LIST_ITEMS_COLLECTION,
  CHAT_V2_SCHEMA_VERSION,
  CHAT_V2_SERVICES,
  FIRESTORE_SCAN_PAGE_SIZE,
  chatTypeFromV2ChannelType,
  isChatV2ChannelType
} from "./constants";
import { db } from "@/lib/firebase";
import { isChatV2PostTypeForChannel, isV2Document } from "./chat-v2-contract";
import { parseChatV2Opening } from "./chat-v2-opening-contract";

function objectData(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function requiredString(value: unknown, fieldName: string): string {
  const normalized = nullableString(value);
  if (normalized == null) {
    throw new Error(`chatListItems의 ${fieldName} 값이 올바르지 않습니다.`);
  }
  return normalized;
}

function requiredUserId(value: unknown, fieldName: string): string {
  const stringId = requiredString(value, fieldName);
  const numericId = Number(stringId);
  if (
    !Number.isSafeInteger(numericId) ||
    numericId <= 0 ||
    String(numericId) !== stringId
  ) {
    throw new Error(`chatListItems의 ${fieldName} 값이 올바르지 않습니다.`);
  }
  return stringId;
}

function requiredTimestamp(value: unknown, fieldName: string): Timestamp {
  if (!(value instanceof Timestamp)) {
    throw new Error(`chatListItems의 ${fieldName} 값이 Timestamp가 아닙니다.`);
  }
  return value;
}

function parseOtherUser(value: unknown): UserChatListOtherUser {
  const data = objectData(value);
  if (!data) throw new Error("chatListItems의 otherUserSnapshot이 없습니다.");
  return {
    displayName: nullableString(data.displayName) ?? "",
    profileImageUrl: nullableString(data.profileImageUrl),
    role: nullableString(data.role) ?? "",
    deactivated: data.deactivated === true
  };
}

type UserChatListItemWithoutOpening = Omit<
  UserChatListItem,
  "opening" | "openingIssueReason"
>;

function parseUserChatListItem(
  snapshot: QueryDocumentSnapshot<DocumentData>
): UserChatListItemWithoutOpening {
  const data = snapshot.data();
  if (data.schemaVersion !== CHAT_V2_SCHEMA_VERSION) {
    throw new Error(`${snapshot.id}은(는) v2 목록 문서가 아닙니다.`);
  }
  if (data.channelId !== snapshot.id) {
    throw new Error(`${snapshot.id}의 channelId가 문서 ID와 다릅니다.`);
  }
  if (!isChatV2ChannelType(data.channelType)) {
    throw new Error(`${snapshot.id}의 channelType이 올바르지 않습니다.`);
  }
  const channelType = data.channelType;
  const type = chatTypeFromV2ChannelType(channelType);
  const config = CHAT_V2_SERVICES[type];
  if (!isChatV2PostTypeForChannel(channelType, data.postType)) {
    throw new Error(`${snapshot.id}의 postType이 올바르지 않습니다.`);
  }
  if (
    data.sourceCollection !== config.sourceCollection ||
    data.listCategory !== config.listCategory ||
    data.legacyCategory != null
  ) {
    throw new Error(`${snapshot.id}의 v2 목록 분류가 올바르지 않습니다.`);
  }
  const unreadCount = Number(data.unreadCount);
  if (!Number.isSafeInteger(unreadCount) || unreadCount < 0) {
    throw new Error(`${snapshot.id}의 unreadCount가 올바르지 않습니다.`);
  }
  if (data.hasUnread !== (unreadCount > 0)) {
    throw new Error(`${snapshot.id}의 hasUnread가 unreadCount와 다릅니다.`);
  }

  return {
    schemaVersion: CHAT_V2_SCHEMA_VERSION,
    channelId: snapshot.id,
    type,
    channelType,
    postType: data.postType,
    postId: requiredString(data.postId, "postId"),
    entrySource: nullableString(data.entrySource),
    otherUserId: requiredUserId(data.otherUserId, "otherUserId"),
    otherUser: parseOtherUser(data.otherUserSnapshot),
    lastMessagePreview: nullableString(data.lastMessagePreview),
    lastMessageType: nullableString(data.lastMessageType),
    lastMessageAt:
      data.lastMessageAt == null
        ? null
        : requiredTimestamp(data.lastMessageAt, "lastMessageAt"),
    lastActivityAt: requiredTimestamp(data.lastActivityAt, "lastActivityAt"),
    unreadCount,
    isPinned: data.isPinned === true,
    sortAt: requiredTimestamp(data.sortAt, "sortAt"),
    otherUserLeft: data.otherUserLeft === true,
    awaitingReply: data.awaitingReply === true,
    awaitingReplyStartedAt:
      data.awaitingReplyStartedAt == null
        ? null
        : requiredTimestamp(
            data.awaitingReplyStartedAt,
            "awaitingReplyStartedAt"
          )
  };
}

function errorReason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * chatListItems projection은 과도기 결제 marker로 openMethod를 정규화하고,
 * 비모델매칭 서비스의 openedMongAmount를 null로 만든다. 정확한 금액·환불 상태는
 * 서비스별 사용자 채널 메타가 권위값이므로 항목별 원본을 다시 읽는다.
 */
async function attachAuthoritativeOpening(
  userId: string,
  item: UserChatListItemWithoutOpening
): Promise<UserChatListItem> {
  const { userChannelCollection } = CHAT_V2_SERVICES[item.type];
  try {
    const snapshot = await getDoc(
      doc(db, "users", userId, userChannelCollection, item.channelId)
    );
    if (!snapshot.exists()) {
      return {
        ...item,
        opening: null,
        openingIssueReason: "v2 사용자 채널 메타 문서가 없습니다."
      };
    }
    return {
      ...item,
      opening: parseChatV2Opening(snapshot.data(), {
        userId,
        channelId: item.channelId
      }),
      openingIssueReason: null
    };
  } catch (error) {
    console.warn(
      `[fetchUserChatListItems] opening read failed: ${item.channelId}/${userId}`,
      error
    );
    return {
      ...item,
      opening: null,
      openingIssueReason: errorReason(error)
    };
  }
}

function listItemsCollection(userId: string) {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) throw new Error("사용자 ID가 비어 있습니다.");
  return collection(db, "users", normalizedUserId, CHAT_LIST_ITEMS_COLLECTION);
}

/** 앱과 같은 정렬을 유지하면서 레거시 목록 문서는 건너뛴다. */
export async function fetchUserChatListItems(
  userId: string
): Promise<Array<UserChatListItem | ChatV2DocumentIssue>> {
  const normalizedUserId = userId.trim();
  const items = listItemsCollection(normalizedUserId);
  const result: Array<UserChatListItemWithoutOpening | ChatV2DocumentIssue> = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

  while (result.length < CHAT_ADMIN_LIST_RESULT_LIMIT) {
    const pageQuery: Query<DocumentData> = cursor
      ? query(
          items,
          orderBy("isPinned", "desc"),
          orderBy("sortAt", "desc"),
          orderBy(documentId(), "desc"),
          startAfter(cursor),
          limit(FIRESTORE_SCAN_PAGE_SIZE)
        )
      : query(
          items,
          orderBy("isPinned", "desc"),
          orderBy("sortAt", "desc"),
          orderBy(documentId(), "desc"),
          limit(FIRESTORE_SCAN_PAGE_SIZE)
        );
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(pageQuery);
    if (snapshot.empty) break;
    for (const document of snapshot.docs) {
      if (isV2Document(document.data())) {
        const parsed = captureChatV2DocumentValidation(document.id, () =>
          parseUserChatListItem(document)
        );
        if (isChatV2DocumentIssue(parsed)) {
          console.warn(
            `[fetchUserChatListItems] invalid v2 item: ${document.id}`,
            parsed.reason
          );
        }
        result.push(parsed);
      }
      if (result.length === CHAT_ADMIN_LIST_RESULT_LIMIT) break;
    }
    cursor = snapshot.docs.at(-1) ?? null;
    if (snapshot.size < FIRESTORE_SCAN_PAGE_SIZE) break;
  }

  return Promise.all(
    result.map((item) =>
      isChatV2DocumentIssue(item)
        ? item
        : attachAuthoritativeOpening(normalizedUserId, item)
    )
  );
}

export async function fetchUserV2ChatCount(userId: string): Promise<number> {
  const snapshot = await getCountFromServer(
    query(
      listItemsCollection(userId),
      where("schemaVersion", "==", CHAT_V2_SCHEMA_VERSION)
    )
  );
  return snapshot.data().count;
}
