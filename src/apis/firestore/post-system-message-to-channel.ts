import {
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { ChatChannelType } from "@/types/chat";
import { CHAT_V2_SERVICES } from "./constants";
import { parseChatV2ChannelIdentity } from "./chat-v2-contract";

export interface PostedSystemMessageTarget {
  participantIds: string[];
}

/**
 * v2 시스템 메시지를 메시지 경로와 현재 활성 참여자의 사용자 메타에 원자적으로
 * 기록한다. 나간 참여자의 메타와 목록은 다시 활성화하지 않는다.
 */
export async function postSystemMessageToChannel(
  channelId: string,
  message: string,
  type: string,
  channelType: ChatChannelType = "model-matching"
): Promise<PostedSystemMessageTarget> {
  const { sourceCollection, userChannelCollection } =
    CHAT_V2_SERVICES[channelType];
  const channelReference = doc(db, sourceCollection, channelId);
  const channelSnapshot = await getDoc(channelReference);
  if (!channelSnapshot.exists()) {
    throw new Error("v2 채널 문서를 찾을 수 없습니다.");
  }
  const identity = parseChatV2ChannelIdentity({
    documentId: channelSnapshot.id,
    chatType: channelType,
    rawData: channelSnapshot.data()
  });
  if (identity.activeParticipantIds.length === 0) {
    throw new Error("현재 채널에 남아 있는 참여자가 없습니다.");
  }

  const metadataSnapshots = await Promise.all(
    identity.activeParticipantIds.map((userId) =>
      getDoc(
        doc(
          db,
          "users",
          String(userId),
          userChannelCollection,
          channelId
        )
      )
    )
  );
  for (const [index, snapshot] of metadataSnapshots.entries()) {
    const userId = identity.activeParticipantIds[index];
    const data = snapshot.data();
    if (
      !snapshot.exists() ||
      data?.schemaVersion !== 2 ||
      data.channelId !== channelId ||
      String(data.userId) !== String(userId) ||
      data.deletedAt != null
    ) {
      throw new Error(`사용자 ${userId}의 활성 v2 채널 메타가 올바르지 않습니다.`);
    }
  }

  const batch = writeBatch(db);
  const messageReference = doc(
    collection(db, sourceCollection, channelId, "messages")
  );
  const timestamp = serverTimestamp();
  const messageData = {
    id: messageReference.id,
    message,
    messageType: type,
    metaPathList: [],
    senderId: "0",
    createdAt: timestamp,
    updatedAt: timestamp
  };
  batch.set(messageReference, messageData);
  batch.update(channelReference, {
    lastActivityAt: timestamp,
    updatedAt: timestamp
  });
  for (const snapshot of metadataSnapshots) {
    batch.update(snapshot.ref, {
      lastMessage: messageData,
      lastActivityAt: timestamp,
      updatedAt: timestamp,
      unreadCount: increment(1)
    });
  }
  await batch.commit();

  return {
    participantIds: identity.activeParticipantIds.map(String)
  };
}
