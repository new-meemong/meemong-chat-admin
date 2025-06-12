"use client";

import MessageList from "./components/message-list";
import UserList from "./components/user-list";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";

export default function LatestChatDetailPage() {
  const { channel, users } = useCurrentChannelStore();

  return (
    <div className="p-4">
      <h1 className="hidden md:block text-2xl font-bold mb-4">
        채팅 상세 페이지
      </h1>
      <p className="hidden md:block mb-4">채팅방 ID: {channel?.id}</p>
      <UserList users={users} />
      <MessageList channelId={channel?.id || ""} users={users} />
    </div>
  );
}
