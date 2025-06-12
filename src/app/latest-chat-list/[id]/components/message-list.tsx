import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

import { User } from "@/types/user";
import { User as UserIcon } from "lucide-react";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";
import { useRouter } from "next/navigation";

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
  const { openUser } = useCurrentChannelStore();
  const router = useRouter();

  // 이미지 모달 상태 추가
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (isLoading) return <div>메시지 불러오는 중...</div>;
  if (isError) return <div>에러 발생: {error?.message}</div>;
  if (!messages || messages.length === 0) return <div>메시지가 없습니다.</div>;

  return (
    <>
      <div className="sm:hidden flex items-center gap-2 mb-2 sticky top-0 bg-white z-10 py-2 px-1 border-b">
        <button
          onClick={() => router.back()}
          className="text-2xl text-gray-700 hover:text-black px-2"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <span className="text-base font-semibold">채팅방</span>
      </div>
      <ul className="flex flex-col space-y-2 mt-4 ">
        {messages.map((msg) => {
          const isSystem = msg.messageType === "system";
          const isOpenUser = openUser?.id === msg.senderId;
          // 정렬 클래스 결정
          const alignClass = isSystem
            ? "justify-center"
            : isOpenUser
            ? "justify-end"
            : "justify-start";

          // 말풍선 스타일 결정
          const bubbleClass = [
            "max-w-xs px-3 py-2 rounded-lg",
            isSystem
              ? "bg-gray-200 text-gray-600 text-center"
              : isOpenUser
              ? "bg-blue-500 text-white rounded-br-none ml-auto"
              : "bg-gray-100 text-gray-800 rounded-bl-none mr-auto"
          ].join(" ");

          return (
            <li key={msg.id} className={`flex w-full ${alignClass} items-end`}>
              {/* 상대방 아바타 */}
              {!isSystem && !isOpenUser && (
                <Avatar className="w-8 h-8 mr-2 self-end">
                  {msg.user?.profileUrl ? (
                    <AvatarImage src={msg.user.profileUrl} alt="avatar" />
                  ) : null}
                  <AvatarFallback>
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* 메시지 말풍선 */}
              <div className={bubbleClass}>
                {!isSystem && (
                  <div className="text-[11px] sm:text-xs text-gray-500 mb-1">
                    {msg.user?.DisplayName ?? msg.senderId} ({msg.user?.role})
                  </div>
                )}
                {msg.messageType === "image" ? (
                  <img
                    src={msg.message}
                    alt="첨부 이미지"
                    className="max-w-xs rounded cursor-pointer"
                    style={{ maxHeight: 300 }}
                    onClick={() => setModalImage(msg.message)}
                  />
                ) : (
                  <div className="text-sm sm:text-base">{msg.message}</div>
                )}
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1 text-right">
                  {msg.createdAt?.toDate?.().toLocaleString?.() ?? ""}
                </div>
              </div>

              {/* 내 아바타 */}
              {!isSystem && isOpenUser && (
                <Avatar className="w-8 h-8 ml-2 self-end">
                  {openUser?.profileUrl ? (
                    <AvatarImage src={openUser.profileUrl} alt="avatar" />
                  ) : null}
                  <AvatarFallback>
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              )}
            </li>
          );
        })}
      </ul>
      {/* 이미지 확대 모달 */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          {/* X 닫기 버튼 */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-60 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setModalImage(null);
            }}
            aria-label="닫기"
          >
            ×
          </button>
          <img
            src={modalImage}
            alt="확대 이미지"
            className="max-w-full max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
