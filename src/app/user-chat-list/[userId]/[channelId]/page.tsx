"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import MessageList from "@/components/chat/message-list";
import ChatV2StartInsightBadges from "@/components/chat/chat-v2-start-insight-badges";
import SystemMessageButton from "@/components/admin/system-message-button";
import UserList from "@/components/chat/user-list";
import { isChatChannelType } from "@/apis/firestore/constants";
import { useChatChannel } from "@/hooks/use-chat-channel";

export default function UserChatV2DetailPage() {
  const params = useParams<{ userId: string; channelId: string }>();
  const searchParams = useSearchParams();
  const rawChannelType = searchParams.get("channelType") ?? "";
  const channelType = isChatChannelType(rawChannelType)
    ? rawChannelType
    : null;
  const channelQuery = useChatChannel(
    channelType ? params.channelId : "",
    channelType ?? "model-matching"
  );

  if (!channelType) {
    return <div className="p-4">v2 채널 타입이 없거나 올바르지 않습니다.</div>;
  }
  if (channelQuery.isLoading) {
    return <div className="p-4">v2 채팅방을 불러오는 중...</div>;
  }
  if (channelQuery.isError) {
    return (
      <div className="p-4">
        v2 채팅방을 가져오는 중 오류가 발생했습니다.
        <p className="mt-2 text-sm text-gray-500">
          {channelQuery.error.message}
        </p>
      </div>
    );
  }

  const channel = channelQuery.data;
  const numericUserId = Number(params.userId);
  if (!channel || !channel.participantIds.includes(numericUserId)) {
    return (
      <div className="p-4">
        <p>이 사용자에게 속한 v2 채팅방을 찾을 수 없습니다.</p>
        <Link
          href={`/user-chat-list/${params.userId}`}
          className="mt-3 inline-flex rounded bg-slate-700 px-3 py-2 text-sm text-white"
        >
          사용자 채팅 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <ChatV2StartInsightBadges channel={channel} />
      </div>
      {channel.activeParticipantIds.length > 0 ? (
        <SystemMessageButton channelId={channel.id} channelType={channelType} />
      ) : null}
      <UserList users={channel.users} />
      <MessageList
        channelId={channel.id}
        users={channel.users}
        channelType={channelType}
        participantIds={channel.participantIds}
        rightAlignedUserId={numericUserId}
      />
    </div>
  );
}
