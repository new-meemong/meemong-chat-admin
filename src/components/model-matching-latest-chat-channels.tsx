// 경로: src/components/chat/model-matching-latest-chat-list.tsx

"use client";

import "moment/locale/ko";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User as UserIcon } from "lucide-react";

import React from "react";
import { User } from "@/types/user";
import moment from "moment";
import { useLatestChatChannels } from "@/hooks/use-latest-chat-channels";
import { useRouter } from "next/navigation";

const ModelMatchingLatestChatList: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useLatestChatChannels();

  const handleChannelClick = (channelId: string, users: User[]) => {
    const usersData = encodeURIComponent(JSON.stringify(users));
    router.push(`/latest-chat-list/${channelId}?users=${usersData}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        <p>채팅방을 가져오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-400">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <MessageSquare className="mx-auto mb-2 w-6 h-6" />
        <p>아직 대화가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((channel) => {
        const users = channel.users.slice(0, 2); // 최대 2명
        const lastMsg = channel.lastMessage;
        // 시간 포맷: 오전/오후 12:34
        let timeStr = "";
        if (lastMsg?.createdAt) {
          const date = lastMsg.createdAt.toDate
            ? lastMsg.createdAt.toDate()
            : lastMsg.createdAt;
          timeStr = moment(date).locale("ko").format("A h:mm");
        }

        return (
          <div
            key={channel.id}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => handleChannelClick(channel.id, channel.users)}
          >
            {/* 왼쪽: 유저 프로필 */}
            <div className="flex flex-col items-center min-w-[60px] mr-4">
              <div className="flex -space-x-2">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col items-center">
                    <Avatar className="border-2 border-white shadow-sm size-20">
                      {user.profileUrl ? (
                        <AvatarImage
                          src={user.profileUrl}
                          alt={user.DisplayName}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback>
                        {user.profileUrl ? (
                          user.DisplayName?.[0] || "null"
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`text-[14px] text-center mt-1 break-words ${
                        user.role === 1
                          ? "text-blue-500"
                          : user.role === 2
                          ? "text-purple-500"
                          : "text-gray-700"
                      }`}
                    >
                      {user.DisplayName}
                    </span>
                    <span className="text-[14px] text-gray-500 max-w-[80px] truncate text-center">
                      ({user.id})
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* 오른쪽: 메시지/시간 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-sm text-gray-900 font-medium break-words line-clamp-2 max-h-[2.8em]">
                {lastMsg?.message || (
                  <span className="text-gray-400">메시지가 없습니다</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">{timeStr}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModelMatchingLatestChatList;
