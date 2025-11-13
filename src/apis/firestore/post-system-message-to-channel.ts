import {
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { ChatChannelType } from "@/types/chat";
import { CHAT_CHANNEL_COLLECTIONS } from "./constants";

/**
 * 특정 채팅방에 시스템 메시지를 보냅니다.
 * @param channelId 채팅방 ID
 * @param message 보낼 메시지 내용
 * @param type 메시지 타입
 * @param user1Id 사용자 1 ID
 * @param user2Id 사용자 2 ID
 * @param channelType 채널 타입 (기본값: 'model-matching')
 */
export async function postSystemMessageToChannel(
  channelId: string,
  message: string,
  type: string,
  user1Id: string,
  user2Id: string,
  channelType: ChatChannelType = 'model-matching'
) {
  const collections = CHAT_CHANNEL_COLLECTIONS[channelType];
  const messagesRef = collection(
    db,
    collections.channels,
    channelId,
    "messages"
  );
  // id를 직접 생성
  const newMessageRef = doc(messagesRef);
  const id = newMessageRef.id;
  const newMessageData = {
    id, // id 필드 추가
    message,
    messageType: type, // 시스템 메시지 타입
    metaPathList: [],
    senderId: "0", // 0 또는 null 등으로 관리자를 표현
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(newMessageRef, newMessageData);

  // 채널 업데이트
  const channelRef = doc(db, collections.channels, channelId);
  await updateDoc(channelRef, {
    updatedAt: serverTimestamp()
  });

  if (!user1Id) {
    console.error("User IDs are required to update chat metadata.");
    return;
  }

  // user1의 메타데이터 업데이트
  const user1MetaRef = doc(
    db,
    `users/${user1Id}/${collections.userChannels}`,
    channelId
  );

  const updateUser1Meta = updateDoc(user1MetaRef, {
    lastMessage: newMessageData,
    updatedAt: serverTimestamp(),
    unreadCount: increment(1)
  });

  const updatePromises = [updateUser1Meta];

  // user2Id가 있는 경우에만 user2의 메타데이터 업데이트
  if (user2Id && user2Id.trim() !== "") {
    const user2MetaRef = doc(
      db,
      `users/${user2Id}/${collections.userChannels}`,
      channelId
    );

    const updateUser2Meta = updateDoc(user2MetaRef, {
      lastMessage: newMessageData,
      updatedAt: serverTimestamp(),
      unreadCount: increment(1)
    });

    updatePromises.push(updateUser2Meta);
  }

  await Promise.all(updatePromises);
}
