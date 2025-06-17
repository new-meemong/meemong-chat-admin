"use client";

import MessageList from "./components/message-list";
import UserList from "./components/user-list";
import { useParams } from "next/navigation";
import { useUserCurrentChannelStore } from "@/stores/use-user-current-channel-store";

export default function UserLatestChatDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const channelId = params.channelId as string;

  console.log(userId, channelId);

  const { channel, currentUser, otherUser } = useUserCurrentChannelStore();

  console.log("moonsae channel", channel);
  console.log("moonsae currentUser", currentUser);
  console.log("moonsae otherUser", otherUser);

  if (!currentUser || !otherUser) {
    return <div>유저가 없습니다.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="hidden md:block text-2xl font-bold mb-4">
        채팅 상세 페이지
      </h1>
      <UserList currentUser={currentUser} otherUser={otherUser} />
      <MessageList
        channelId={channelId}
        currentUser={currentUser}
        otherUser={otherUser}
      />
    </div>
  );
}
