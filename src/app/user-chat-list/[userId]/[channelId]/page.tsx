"use client";

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

  return <div>UserLatestChatDetailPage</div>;
}
