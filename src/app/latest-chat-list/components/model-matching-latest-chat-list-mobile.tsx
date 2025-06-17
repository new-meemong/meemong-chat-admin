"use client";

import "moment/locale/ko";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User as UserIcon } from "lucide-react";

import Image from "next/image";
import { ModelMatchingChatChannel } from "@/types/model-matching-chat-channel";
import React from "react";
import { User } from "@/types/user";
import moment from "moment";
import { useCurrentChannelStore } from "@/stores/use-current-channel-store";
import { useLatestChatChannels } from "@/hooks/use-latest-chat-channels";
import { useRouter } from "next/navigation";

const ModelMatchingLatestChatListMobile: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useLatestChatChannels();
  const setChannelInfo = useCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const clearChannelInfo = useCurrentChannelStore(
    (state) => state.clearChannelInfo
  );

  const handleChannelClick = (
    channel: ModelMatchingChatChannel,
    users: User[]
  ) => {
    clearChannelInfo();
    const openUser: User | undefined = channel.users.find(
      (u: User) => u.id === channel.channelOpenUserId
    );
    setChannelInfo(channel, users, openUser ?? null);
    router.push(`/latest-chat-list/${channel.id}`);
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
            className="w-full flex flex-col px-2 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={() => handleChannelClick(channel, channel.users)}
          >
            {/* 상단: 유저 프로필 (가로 배치) */}
            <div className="flex flex-row items-center gap-4 mb-2">
              {users.map((user) => (
                <div key={user.id} className="flex flex-row items-center gap-2">
                  <Avatar className="border-2 border-white shadow-sm size-10">
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
                  <div className="flex flex-col">
                    <span
                      className={`text-[13px] font-medium text-left break-words ${
                        user.role === 1
                          ? "text-blue-500"
                          : user.role === 2
                          ? "text-purple-500"
                          : "text-gray-700"
                      }`}
                    >
                      {user.DisplayName}
                    </span>
                    <div className="flex flex-row items-center gap-1">
                      <span className="text-[12px] text-gray-500 max-w-[100px] truncate text-left">
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
                      <span className="text-[11px] text-gray-400">
                        ({user.id})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* 아래: 메시지/시간/기타 정보 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
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
              <div className="text-sm text-gray-900 font-medium break-all whitespace-normal w-full">
                {lastMsg?.messageType === "image" && lastMsg.message ? (
                  <Image
                    src={lastMsg.message}
                    alt="사진"
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  lastMsg?.message || (
                    <span className="text-gray-400">메시지가 없습니다</span>
                  )
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

export default ModelMatchingLatestChatListMobile;
