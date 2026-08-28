"use client";

import "moment/locale/ko";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Pin, User as UserIcon } from "lucide-react";

import { UserChatListItem, isChatV2DocumentIssue } from "@/types/chat";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useUserChatList } from "@/hooks/use-user-chat-list";
import InvalidV2DocumentRow from "@/components/chat/invalid-v2-document-row";
import {
  getChatV2OpeningLabel,
  getChatV2OriginEntrySourceLabel,
  getChatV2PostTypeLabel
} from "@/components/chat/chat-v2-tag-labels";

const CHANNEL_LABELS: Record<UserChatListItem["type"], string> = {
  "model-matching": "모델매칭",
  "hair-consultation": "헤어상담",
  "review-special": "리뷰특가",
  "job-posting": "구인구직"
};

interface Props {
  userId: string;
}

export default function UserChatV2List({ userId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useUserChatList(userId);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-4 text-center text-red-500">
        <p>v2 채팅 목록을 가져오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-400">{error?.message}</p>
      </div>
    );
  }
  if (!data) return null;

  const { currentUser, items, totalCount } = data;
  return (
    <div className="space-y-2">
      <div className="mb-2 flex items-center justify-center gap-4 border-b border-gray-200 py-3">
        <Avatar className="size-14 border-2 border-white shadow-sm">
          {currentUser.profileUrl ? (
            <AvatarImage
              src={currentUser.profileUrl}
              alt={currentUser.DisplayName}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback>{currentUser.DisplayName?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{currentUser.DisplayName}</span>
          <span className="text-sm text-gray-500">
            {currentUser.createdAt
              ? moment(currentUser.createdAt).format("YYYY.MM.DD")
              : "-"}
          </span>
          <span className="text-xs text-gray-400">({currentUser.id})</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            전체 v2 채팅수
          </span>
          <span className="text-lg font-bold text-gray-900">{totalCount}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <MessageSquare className="mx-auto mb-2 size-6" />
          <p>v2 채팅이 없습니다.</p>
        </div>
      ) : (
        items.map((item) =>
          isChatV2DocumentIssue(item) ? (
            <InvalidV2DocumentRow key={item.documentId} issue={item} />
          ) : (() => {
            const postTypeLabel = getChatV2PostTypeLabel(item.postType);
            const entrySource = item.entrySource ?? item.opening?.entrySource ?? null;
            const entrySourceLabel = getChatV2OriginEntrySourceLabel(
              entrySource
            );
            const openingLabel = item.opening
              ? getChatV2OpeningLabel(item.opening, item.postType)
              : "개봉정보 확인불가";
            const openingColorClass = !item.opening
              ? "bg-amber-50 text-amber-700"
              : openingLabel.includes("환불")
                ? "bg-amber-50 text-amber-700"
                : openingLabel.startsWith("유료")
                  ? "bg-rose-50 text-rose-700"
                  : openingLabel === "미개봉"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-emerald-50 text-emerald-700";
            return (
            <button
              key={item.channelId}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-gray-100"
              onClick={() =>
                router.push(
                  `/user-chat-list/${userId}/${item.channelId}?channelType=${item.type}`
                )
              }
            >
              <Avatar className="size-12 shrink-0 border border-white shadow-sm">
                {item.otherUser.profileImageUrl ? (
                  <AvatarImage
                    src={item.otherUser.profileImageUrl}
                    alt={item.otherUser.displayName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback>
                  <UserIcon className="size-5 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">
                    {item.otherUser.displayName || `사용자 ${item.otherUserId}`}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                    {CHANNEL_LABELS[item.type]}
                  </span>
                  {postTypeLabel ? (
                    <span
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                      title={item.postType}
                    >
                      {item.postType === "QUICK_MATCHING_PREMIUM" ? (
                        <span
                          aria-label="프리미엄"
                          className="mr-1 text-amber-500"
                        >
                          ★
                        </span>
                      ) : null}
                      {postTypeLabel}
                    </span>
                  ) : null}
                  {entrySourceLabel ? (
                    <span
                      className="rounded bg-cyan-50 px-1.5 py-0.5 text-xs text-cyan-800"
                      title={entrySource ?? undefined}
                    >
                      최초 진입: {entrySourceLabel}
                    </span>
                  ) : null}
                  {item.postType !== "CHAT" ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                      게시글 #{item.postId}
                    </span>
                  ) : null}
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${openingColorClass}`}
                    title={item.openingIssueReason ?? undefined}
                  >
                    {openingLabel}
                  </span>
                  {item.opening?.openedAt ? (
                    <span className="text-xs text-slate-500">
                      개봉 {moment(item.opening.openedAt.toDate()).format(
                        "YYYY-MM-DD HH:mm"
                      )}
                    </span>
                  ) : null}
                  {item.awaitingReply ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                      답장 대기
                      {item.awaitingReplyStartedAt
                        ? ` ${moment(
                            item.awaitingReplyStartedAt.toDate()
                          ).format("MM-DD HH:mm")}부터`
                        : ""}
                    </span>
                  ) : null}
                  {item.opening?.isChannelRefunded ? (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                      환불 종료
                    </span>
                  ) : null}
                  {item.isPinned ? (
                    <Pin className="size-3.5 text-gray-500" />
                  ) : null}
                  {item.otherUserLeft ? (
                    <span className="text-xs text-amber-600">상대방 나감</span>
                  ) : null}
                </div>
                <p className="truncate text-sm text-gray-700">
                  {item.lastMessagePreview || "메시지가 없습니다"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {moment(
                    item.lastMessageAt?.toDate() ?? item.lastActivityAt.toDate()
                  ).format("YYYY-MM-DD HH:mm")}
                </p>
              </div>
              {item.unreadCount > 0 ? (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {item.unreadCount}
                </span>
              ) : null}
            </button>
            );
          })()
        )
      )}
    </div>
  );
}
