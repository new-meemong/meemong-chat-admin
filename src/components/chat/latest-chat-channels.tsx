"use client";

import "moment/locale/ko";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User as UserIcon } from "lucide-react";

import Image from "next/image";
import { ChatChannel, ChatChannelType } from "@/types/chat";
import React from "react";
import { User } from "@/types/user";
import moment from "moment";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";
import { useLatestChatChannels } from "@/hooks/use-latest-chat-channels";
import { useRouter } from "next/navigation";

interface LatestChatChannelsProps {
  channelType: ChatChannelType;
}

const LatestChatChannels: React.FC<LatestChatChannelsProps> = ({
  channelType
}) => {
  const router = useRouter();
  const { data, isLoading, error } = useLatestChatChannels(channelType);
  const setChannelInfo = useCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const clearChannelInfo = useCurrentChannelStore(
    (state) => state.clearChannelInfo
  );

  const handleChannelClick = (channel: ChatChannel, users: User[]) => {
    clearChannelInfo(channelType);
    // openUser 계산
    const openUser: User | undefined = channel.users.find(
      (u: User) => u.id === channel.channelOpenUserId
    );

    setChannelInfo(channelType, channel, users, openUser ?? null);
    router.push(`/latest-${channelType}-chat-list/${channel.id}`);
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
        const openUser: User | undefined = channel.users.find(
          (u: User) => u.id === channel.channelOpenUserId
        );
        let openLabel = null;
        if (openUser?.role === 1) openLabel = "모델이 대화시작";
        else if (openUser?.role === 2) openLabel = "디자이너가 대화시작";
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
            className="flex flex-wrap items-center md:px-3 md:py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => handleChannelClick(channel, channel.users)}
          >
            {/* 왼쪽: 유저 프로필 */}
            <div className="flex flex-col items-center md:min-w-[60px] md:mr-4">
              <div className="flex -space-x-2">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col items-center">
                    <Avatar className="border-2 border-white shadow-sm md:size-20">
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
                      className={`md:text-[14px] text-center mt-1 break-words ${
                        user.role === 1
                          ? "text-blue-500"
                          : user.role === 2
                          ? "text-purple-500"
                          : "text-gray-700"
                      }`}
                    >
                      {user.DisplayName}
                    </span>
                    <span className="md:text-[14px] text-gray-500 md:max-w-[80px] truncate text-center">
                      {user.createdAt
                        ? (() => {
                            const d = new Date(user.createdAt);
                            return `${String(d.getFullYear()).slice(
                              2
                            )}.${String(d.getMonth() + 1).padStart(
                              2,
                              "0"
                            )}.${String(d.getDate()).padStart(2, "0")}`;
                          })()
                        : ""}
                    </span>
                    <span className="md:text-[13px] text-gray-400 text-center">
                      ({user.id})
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* 오른쪽: 메시지/시간 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {/* 라벨 추가 */}
              {openLabel && (
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`text-xs font-semibold text-white rounded px-2 py-0.5 w-fit ${
                      openUser?.role === 1
                        ? "bg-blue-400"
                        : openUser?.role === 2
                        ? "bg-purple-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {openLabel}
                  </div>
                  <div className="text-xs text-gray-600">
                    주고받은 메시지수{" "}
                    <span className="font-bold text-black">
                      {channel.messageCount}
                    </span>
                    개
                  </div>
                </div>
              )}
              {lastMsg?.messageType === "image" && lastMsg.message ? (
                <div className="py-1">
                  <Image
                    src={lastMsg.message}
                    alt="사진"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-900 font-medium break-words line-clamp-2 max-h-[2.8em]">
                  {lastMsg?.message || (
                    <span className="text-gray-400">메시지가 없습니다</span>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">{timeStr}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LatestChatChannels;


