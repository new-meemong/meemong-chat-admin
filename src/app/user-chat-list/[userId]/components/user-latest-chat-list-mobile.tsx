"use client";

import "moment/locale/ko";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User as UserIcon } from "lucide-react";

import Image from "next/image";
import React from "react";
import { UserChatChannel, ChatChannelType } from "@/types/chat";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useUserCurrentChannelStore } from "@/stores/use-user-current-channel-store";
import { useUserLatestChatChannels } from "@/hooks/use-user-latest-chat-channels";
import { useUserTotalChannelCount } from "@/hooks/use-user-toal-channel-count-query";

interface Props {
  userId: string;
}

const UserLatestChatListMobile: React.FC<Props> = ({ userId }) => {
  const channelType: ChatChannelType = "model-matching";
  const { data, isLoading, isError, error } = useUserLatestChatChannels(
    userId,
    channelType
  );
  const setChannelInfo = useUserCurrentChannelStore(
    (state) => state.setChannelInfo
  );
  const clearChannelInfo = useUserCurrentChannelStore(
    (state) => state.clearChannelInfo
  );
  const router = useRouter();
  const { data: totalChannelCount } = useUserTotalChannelCount(
    userId,
    channelType
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">
        <p>채팅방을 가져오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-400">{error?.message}</p>
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

  // currentUser 추출
  const currentUser = data[0]?.currentUser;

  const handleChannelClick = (channel: UserChatChannel) => {
    clearChannelInfo(channelType);
    // currentUser는 User 타입, otherUser는 OtherUser 타입이므로 User로 변환
    const currentUser = channel.currentUser;
    const otherUser = channel.otherUser;
    otherUser.role = otherUser.Role;
    otherUser.sex = otherUser.Sex;

    setChannelInfo(channelType, channel, currentUser, otherUser);
    router.push(`/user-chat-list/${channel.userId}/${channel.channelId}`);
  };

  return (
    <div className="space-y-2">
      {/* currentUser 정보 상단 노출 */}
      {currentUser && (
        <div className="flex flex-row items-center justify-center gap-4 py-4 border-b border-gray-200 mb-2">
          <Avatar className="border-2 border-white shadow-sm size-14">
            {currentUser.profileUrl ? (
              <AvatarImage
                src={currentUser.profileUrl}
                alt={currentUser.DisplayName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback>
              {currentUser.DisplayName?.[0] || "null"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center">
            <span
              className={`text-lg font-semibold ${
                currentUser.role === 1
                  ? "text-blue-500"
                  : currentUser.role === 2
                  ? "text-purple-500"
                  : "text-gray-900"
              }`}
            >
              {currentUser.DisplayName}
            </span>
            <span className="text-sm text-gray-500">
              {" "}
              {currentUser.createdAt
                ? moment(currentUser.createdAt).format("YYYY.MM.DD")
                : "-"}
            </span>
            <span className="text-xs text-gray-400">({currentUser.id})</span>
          </div>
          {/* 전체 채팅수 라벨 및 값 */}
          <div className="flex flex-col items-center ml-2">
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded px-2 py-0.5 mb-1">
              전체 채팅수
            </span>
            <span className="text-lg font-bold text-gray-900">
              {typeof totalChannelCount === "number" ? totalChannelCount : "-"}
            </span>
          </div>
        </div>
      )}
      {[...data]
        .sort((a, b) => {
          const getTime = (msg: UserChatChannel["lastMessage"] | undefined) => {
            if (!msg?.createdAt) return 0;
            if (msg.createdAt.toDate) return msg.createdAt.toDate().getTime();
            if (msg.createdAt instanceof Date) return msg.createdAt.getTime();
            return 0;
          };
          return getTime(b.lastMessage) - getTime(a.lastMessage);
        })
        .map((channel) => {
          // openUserId로 openUser 찾기
          let openUser = null;
          if (channel.openUserId) {
            if (
              channel.currentUser &&
              channel.currentUser.id === channel.openUserId
            ) {
              openUser = {
                ...channel.currentUser,
                role: channel.currentUser.role
              };
            } else if (
              channel.otherUser &&
              channel.otherUser.id === channel.openUserId
            ) {
              let newRole = 1;
              if (channel.currentUser.role === 1) newRole = 2;
              else if (channel.currentUser.role === 2) newRole = 1;
              openUser = { ...channel.otherUser, role: newRole };
            }
          }
          let openLabel = null;
          if (openUser?.role === 1) openLabel = "모델이 대화시작";
          else if (openUser?.role === 2) openLabel = "디자이너가 대화시작";
          const otherUser = channel.otherUser;
          const lastMsg = channel.lastMessage;
          let timeStr = "";
          let dateStr = "";
          if (lastMsg?.createdAt) {
            const date = lastMsg.createdAt.toDate
              ? lastMsg.createdAt.toDate()
              : lastMsg.createdAt;
            timeStr = moment(date).locale("ko").format("A h:mm");
            dateStr = moment(date).locale("ko").format("YYYY.MM.DD");
          }
          return (
            <div
              key={channel.channelId}
              className="w-full flex flex-col px-2 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              onClick={() => handleChannelClick(channel)}
            >
              {/* 상단: 유저 프로필 (가로 배치) */}
              <div className="flex flex-row items-center gap-4 mb-2">
                <Avatar className="border-2 border-white shadow-sm size-10">
                  {otherUser.profileUrl ? (
                    <AvatarImage
                      src={otherUser.profileUrl}
                      alt={otherUser.DisplayName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback>
                    {otherUser.profileUrl ? (
                      otherUser.DisplayName?.[0] || "null"
                    ) : (
                      <UserIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span
                    className={`text-[13px] font-medium text-left break-words ${
                      otherUser.role === 1
                        ? "text-blue-500"
                        : otherUser.role === 2
                        ? "text-purple-500"
                        : "text-gray-700"
                    }`}
                  >
                    {otherUser.DisplayName}
                  </span>
                  <div className="flex flex-row items-center gap-1">
                    <span className="text-[12px] text-gray-500 max-w-[100px] truncate text-left">
                      {otherUser.profileUrl ? otherUser.Email : "이메일 없음"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ({otherUser.id})
                    </span>
                  </div>
                </div>
              </div>
              {/* 라벨 및 메시지수 */}
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
              {/* 아래: 메시지/시간/기타 정보 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
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
                {/* 안 읽은 메시지/시간 가로 배치 */}
                <div className="text-xs text-gray-600 mt-1 flex flex-row items-center gap-2">
                  <span>
                    안 읽은 메시지:{" "}
                    <span className="font-bold text-black">
                      {channel.unreadCount}
                    </span>
                    개
                  </span>
                  <span className="text-gray-600">
                    · {dateStr} · {timeStr}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default UserLatestChatListMobile;
