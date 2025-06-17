"use client";

import UserLatestChatListWrapper from "./components/user-latest-chat-list-wrapper";
import { useParams } from "next/navigation";

export default function UserChatListPage() {
  const params = useParams();
  const userId = params.id as string;

  return <UserLatestChatListWrapper userId={userId} />;
}
