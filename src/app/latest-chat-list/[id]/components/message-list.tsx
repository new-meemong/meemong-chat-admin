import { User } from "@/types/user";
import { useChatMessages } from "@/hooks/use-chat-messages";

interface MessageListProps {
  channelId: string;
  users: User[];
}

export default function MessageList({ channelId, users }: MessageListProps) {
  const {
    data: messages,
    isLoading,
    isError,
    error
  } = useChatMessages(channelId, users);

  if (isLoading) return <div>메시지 불러오는 중...</div>;
  if (isError) return <div>에러 발생: {error?.message}</div>;
  if (!messages || messages.length === 0) return <div>메시지가 없습니다.</div>;
  console.log("moonsae messages", messages);
  return (
    <ul className="space-y-2 mt-4">
      {messages.map((msg) => (
        <li key={msg.id} className="border p-2 rounded">
          <div className="text-sm text-gray-600 mb-1">
            {msg.user?.DisplayName ?? msg.senderId} ({msg.user?.role})
          </div>
          <div>{msg.message}</div>
          <div className="text-xs text-gray-400 mt-1">
            {msg.createdAt?.toDate?.().toLocaleString?.() ?? ""}
          </div>
        </li>
      ))}
    </ul>
  );
}
