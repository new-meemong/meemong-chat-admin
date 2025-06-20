"use client";

import MessageList from "./components/message-list";
// import SystemMessageButton from "@/components/admin/system-message-button";
import UserList from "./components/user-list";
import { useParams } from "next/navigation";
import { useUserCurrentChannelStore } from "@/stores/use-user-current-channel-store";

export default function UserLatestChatDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const channelId = params.channelId as string;

  console.log(userId, channelId);

  const { currentUser, otherUser } = useUserCurrentChannelStore();

  if (!currentUser || !otherUser) {
    return <div>유저가 없습니다.</div>;
  }

  return (
    <div className="p-4">
      {/* <SystemMessageButton
        channelId={channelId}
        currentUser={currentUser}
        otherUser={otherUser}
      /> */}
      <UserList currentUser={currentUser} otherUser={otherUser} />
      <MessageList
        channelId={channelId}
        currentUser={currentUser}
        otherUser={otherUser}
      />
    </div>
  );
}
