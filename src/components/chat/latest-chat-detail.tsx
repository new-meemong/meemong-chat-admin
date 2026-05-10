"use client";

import MessageList from "@/components/chat/message-list";
import React, { useEffect } from "react";
import SystemMessageButton from "@/components/admin/system-message-button";
import { ChatChannelType } from "@/types/chat";
import UserList from "@/components/chat/user-list";
import { useChatChannel } from "@/hooks/use-chat-channel";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";
import { useParams } from "next/navigation";

interface LatestChatDetailProps {
  channelType: ChatChannelType;
}

export default function LatestChatDetail({
  channelType
}: LatestChatDetailProps) {
  const params = useParams<{ id?: string | string[] }>();
  const routeChannelId = Array.isArray(params.id) ? params.id[0] : params.id;
  const channelId = routeChannelId ?? "";

  const store = useCurrentChannelStore();
  const setChannelInfo = useCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const channelInfo = store.getChannelInfo(channelType);
  const storedChannel = channelInfo?.channel || null;
  const shouldFetchChannel = !storedChannel || storedChannel.id !== channelId;
  const chatChannelQuery = useChatChannel(
    shouldFetchChannel ? channelId : "",
    channelType
  );
  const fetchedChannel = chatChannelQuery.data || null;
  const channel = shouldFetchChannel ? fetchedChannel : storedChannel;
  const users = shouldFetchChannel
    ? fetchedChannel?.users ?? []
    : channelInfo?.users ?? [];

  useEffect(() => {
    if (!fetchedChannel) return;

    const openUser =
      fetchedChannel.users.find(
        (user) => user.id === fetchedChannel.channelOpenUserId
      ) ?? null;

    setChannelInfo(channelType, fetchedChannel, fetchedChannel.users, openUser);
  }, [channelType, fetchedChannel, setChannelInfo]);

  const currentUser = users[0];
  const otherUser = users[1] || null;

  if (!channelId) {
    return <div className="p-4">채팅방 ID가 없습니다.</div>;
  }

  if (shouldFetchChannel && chatChannelQuery.isLoading) {
    return <div className="p-4">채팅방을 불러오는 중...</div>;
  }

  if (shouldFetchChannel && chatChannelQuery.isError) {
    return (
      <div className="p-4">
        채팅방을 가져오는 중 오류가 발생했습니다.
        <p className="mt-2 text-sm text-gray-500">
          {chatChannelQuery.error?.message}
        </p>
      </div>
    );
  }

  if (!channel) {
    return <div className="p-4">채팅방을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="hidden md:block text-2xl font-bold mb-4">
        채팅 상세 페이지
      </h1>
      {currentUser && (
        <SystemMessageButton
          channelId={channel.id}
          currentUser={currentUser}
          otherUser={otherUser}
          channelType={channelType}
        />
      )}
      <UserList users={users} />
      <MessageList
        channelId={channel.id}
        users={users}
        channelType={channelType}
      />
    </div>
  );
}
