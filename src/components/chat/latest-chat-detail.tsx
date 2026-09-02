"use client";

import MessageList from "@/components/chat/message-list";
import ChatV2StartInsightBadges from "@/components/chat/chat-v2-start-insight-badges";
import { useEffect } from "react";
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

  const setChannelInfo = useCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const channelInfo = useCurrentChannelStore(
    (state) => state.channels[channelType]
  );
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

    setChannelInfo(channelType, fetchedChannel, fetchedChannel.users);
  }, [channelType, fetchedChannel, setChannelInfo]);

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
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <ChatV2StartInsightBadges channel={channel} />
      </div>
      {channel.activeParticipantIds.length > 0 && (
        <SystemMessageButton
          channelId={channel.id}
          channelType={channelType}
        />
      )}
      <UserList users={users} />
      <MessageList
        channelId={channel.id}
        users={users}
        channelType={channelType}
        participantIds={channel.participantIds}
        rightAlignedUserId={channel.channelOpenUserId}
      />
    </div>
  );
}
