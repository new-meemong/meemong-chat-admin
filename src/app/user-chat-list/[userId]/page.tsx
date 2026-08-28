"use client";

import UserChatV2List from "./components/user-chat-v2-list";
import { useParams } from "next/navigation";

export default function UserChatListPage() {
  const params = useParams();
  const userId = params.userId as string;

  return <UserChatV2List userId={userId} />;
}
