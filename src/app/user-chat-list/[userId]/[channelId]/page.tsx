"use client";

import MessageList from "./components/message-list";
import SystemMessageButton from "@/components/admin/system-message-button";
import UserList from "./components/user-list";
import { useParams } from "next/navigation";
import { useUserCurrentChannelStore } from "@/stores/use-user-current-channel-store";
import Link from "next/link";
import { useChatReadStatusChannel } from "@/hooks/use-chat-read-status-channel";
import { useReadStatusParticipants } from "@/hooks/use-read-status-participants";

export default function UserLatestChatDetailPage() {
  const params = useParams();
  const userId = params.userId as string;
  const channelId = params.channelId as string;

  const channelInfo = useUserCurrentChannelStore(
    (state) => state.userChannels["model-matching"]
  );
  const currentUser = channelInfo?.currentUser || null;
  const otherUser = channelInfo?.otherUser || null;
  const storedChannelId = channelInfo?.channel?.channelId;
  const storedUserId = channelInfo?.channel?.userId;
  const isMatchingChannel =
    storedChannelId === channelId && String(storedUserId) === userId;
  const channelQuery = useChatReadStatusChannel(
    isMatchingChannel ? channelId : "",
    "model-matching"
  );
  const readStatusParticipants = useReadStatusParticipants(
    channelQuery.data,
    "model-matching",
    {
      isLoading: channelQuery.isLoading,
      isError: channelQuery.isError
    }
  );

  if (!currentUser || !otherUser || !isMatchingChannel) {
    return (
      <div className="p-4">
        <p>채팅방 정보가 현재 URL과 일치하지 않습니다.</p>
        <Link
          href={`/user-chat-list/${userId}`}
          className="mt-3 inline-flex rounded bg-slate-700 px-3 py-2 text-sm text-white"
        >
          사용자 채팅 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <SystemMessageButton
        channelId={channelId}
        currentUser={currentUser}
        otherUser={otherUser}
        channelType="model-matching"
      />
      <UserList currentUser={currentUser} otherUser={otherUser} />
      <MessageList
        channelId={channelId}
        currentUser={currentUser}
        otherUser={otherUser}
        participantIds={readStatusParticipants.participantIds}
        participantIssue={readStatusParticipants.participantIssue}
        isParticipantResolutionLoading={
          readStatusParticipants.isParticipantResolutionLoading
        }
      />
    </div>
  );
}
