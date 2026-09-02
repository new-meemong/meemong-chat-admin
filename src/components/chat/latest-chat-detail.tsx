"use client";

import MessageList from "@/components/chat/message-list";
import ChatV2StartInsightBadges from "@/components/chat/chat-v2-start-insight-badges";
import { useEffect } from "react";
import SystemMessageButton from "@/components/admin/system-message-button";
import { ChatChannelType } from "@/types/chat";
import UserList from "@/components/chat/user-list";
import { useChatChannel } from "@/hooks/use-chat-channel";
import { useLegacyModelMatchingChatChannel } from "@/hooks/use-legacy-model-matching-chat-channel";
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
  const isLegacyModelMatchingChannel =
    channelType === "model-matching" &&
    Boolean(channelId) &&
    !channelId.startsWith("v2_");

  const setChannelInfo = useCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const channelInfo = useCurrentChannelStore(
    (state) => state.channels[channelType]
  );
  const storedChannel = channelInfo?.channel || null;
  const shouldFetchChannel = !storedChannel || storedChannel.id !== channelId;
  const chatChannelQuery = useChatChannel(
    !isLegacyModelMatchingChannel && shouldFetchChannel ? channelId : "",
    channelType
  );
  const legacyChannelQuery = useLegacyModelMatchingChatChannel(
    isLegacyModelMatchingChannel ? channelId : ""
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

  if (isLegacyModelMatchingChannel) {
    if (legacyChannelQuery.isLoading) {
      return <div className="p-4">채팅방을 불러오는 중...</div>;
    }

    if (legacyChannelQuery.isError) {
      return (
        <div className="p-4">
          채팅방을 가져오는 중 오류가 발생했습니다.
          <p className="mt-2 text-sm text-gray-500">
            {legacyChannelQuery.error?.message}
          </p>
        </div>
      );
    }

    const legacyChannel = legacyChannelQuery.data;
    if (!legacyChannel) {
      return <div className="p-4">채팅방을 찾을 수 없습니다.</div>;
    }

    return (
      <div className="p-4">
        <h1 className="hidden md:block text-2xl font-bold mb-4">
          채팅 상세 페이지
        </h1>
        <p className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
          레거시 채팅방으로 참여자와 메시지만 조회할 수 있습니다.
        </p>
        <UserList users={legacyChannel.users} />
        <MessageList
          channelId={legacyChannel.id}
          users={legacyChannel.users}
          channelType="model-matching"
          participantIds={legacyChannel.participantIds}
          rightAlignedUserId={legacyChannel.rightAlignedUserId}
          readStatusEnabled={false}
        />
      </div>
    );
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
