import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase"; // firebase 초기화된 객체 import 필요

/**
 * 특정 채팅방에 시스템 메시지를 보냅니다.
 * @param channelId 채팅방 ID
 * @param message 보낼 메시지 내용
 * @returns 생성된 메시지 문서 ID
 */
export async function postSystemMessageToChannel(
  channelId: string,
  message: string
) {
  const messagesRef = collection(
    db,
    "modelMatchingChatChannels",
    channelId,
    "messages"
  );
  // id를 직접 생성
  const newMessageRef = doc(messagesRef);
  const id = newMessageRef.id;
  await setDoc(newMessageRef, {
    id, // id 필드 추가
    message,
    messageType: "system", // 시스템 메시지 타입
    metaPathList: [],
    senderId: "0", // 0 또는 null 등으로 관리자를 표현
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}
