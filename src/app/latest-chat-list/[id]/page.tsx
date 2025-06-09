"use client";

import MessageList from "./components/message-list";
import { User } from "@/types/user";
import UserList from "./components/user-list";
import { use } from "react";
import { useSearchParams } from "next/navigation";

type PageParams = {
  id: string;
};

export default function LatestChatDetailPage({
  params
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const usersParam = searchParams.get("users");
  const users: User[] = usersParam
    ? JSON.parse(decodeURIComponent(usersParam))
    : [];
  console.log("moonsae users", users);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">채팅 상세 페이지</h1>
      <p className="mb-4">채팅방 ID: {resolvedParams.id}</p>
      <UserList users={users} />
      <MessageList channelId={resolvedParams.id} users={users} />
    </div>
  );
}
