"use client";

import MessageList from "./components/message-list";
import SystemMessageButton from "@/components/admin/system-message-button";
import UserList from "./components/user-list";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";

export default function LatestChatDetailPage() {
  const { channel, users } = useCurrentChannelStore();

  // users 배열에서 currentUser와 otherUser 추출
  const currentUser = users[0];
  const otherUser = users[1] || null;

  return (
    <div className="p-4">
      <h1 className="hidden md:block text-2xl font-bold mb-4">
        채팅 상세 페이지
      </h1>
      {currentUser && (
        <SystemMessageButton
          channelId={channel?.id || ""}
          currentUser={currentUser}
          otherUser={otherUser}
        />
      )}
      <UserList users={users} />
      <MessageList channelId={channel?.id || ""} users={users} />
    </div>
  );
}
