"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  UserRound,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUser } from "@/apis/users/get-user";
import { CHAT_V2_SERVICES } from "@/apis/firestore/constants";
import { routeLabel } from "@/apis/firestore/chat-journey-labels";
import type { AnalyticsRow } from "@/apis/firestore/chat-journey-periods";
import { record, formatTime, opening } from "./journey-format";

// Every name in the card shares the current profile cache and the same fallback.
function useJourneyParticipantProfile(
  id: unknown,
  snapshot: Record<string, unknown>,
) {
  const normalizedId = id == null ? "" : String(id);
  const numericId = Number(normalizedId);
  const { data: user } = useQuery({
    queryKey: ["journeyParticipantProfile", normalizedId],
    queryFn: () => getUser(numericId),
    enabled: Number.isSafeInteger(numericId) && numericId > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const name =
    user?.DisplayName ||
    (id == null
      ? "확인 불가"
      : String(snapshot.name || `사용자 #${normalizedId}`));
  return { user, name };
}

function JourneyParticipantName({
  id,
  users,
}: {
  id: unknown;
  users: Record<string, unknown>;
}) {
  const { name } = useJourneyParticipantProfile(id, record(users[String(id)]));
  return <>{name}</>;
}

function JourneyParticipant({
  id,
  snapshot,
  firstSender,
}: {
  id: string;
  snapshot: Record<string, unknown>;
  firstSender: boolean;
}) {
  const { user, name } = useJourneyParticipantProfile(id, snapshot);
  // Use the recorded role for this conversation; current profiles may have changed roles.
  const role = snapshot.role;
  const roleLabel =
    role === 1 || role === "MODEL"
      ? "모델"
      : role === 2 || role === "DESIGNER"
        ? "디자이너"
        : "역할 미확인";
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar className="size-12 border border-slate-100 bg-slate-100 shadow-sm sm:size-14">
        {user?.profileUrl && (
          <AvatarImage
            src={user.profileUrl}
            alt={`${name} 프로필`}
            className="object-cover"
          />
        )}
        <AvatarFallback>
          <UserRound aria-hidden className="size-5 text-slate-400" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap gap-1">
          <span
            className={`text-[11px] font-medium ${roleLabel === "디자이너" ? "text-purple-600" : "text-blue-600"}`}
          >
            {roleLabel}
          </span>
          {firstSender && (
            <span className="rounded bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-700">
              첫 발송
            </span>
          )}
        </div>
        <p className="break-words text-sm font-semibold text-slate-900">
          {name}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">#{id}</p>
      </div>
    </div>
  );
}

export function JourneyConversationCard({ row }: { row: AnalyticsRow }) {
  const users = record(row.users);
  const ids = Array.isArray(row.participantIds)
    ? row.participantIds.map(String)
    : [];
  const sender =
    row.firstSenderId == null ? undefined : String(row.firstSenderId);
  const orderedIds =
    sender && ids.includes(sender)
      ? [sender, ...ids.filter((id) => id !== sender)]
      : ids;
  const route = Object.entries(CHAT_V2_SERVICES).find(
    ([, config]) => config.sourceCollection === row.sourceCollection,
  )?.[0];
  const readLabel =
    (
      {
        READ: "열람",
        UNREAD: "미열람",
        UNKNOWN: "읽음 불명",
        NO_MESSAGE: "발송 전",
      } as Record<string, string>
    )[String(row.readStatus)] ?? "읽음 불명";
  const replied = row.firstReplyAt != null;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 font-medium ${replied ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
            >
              {replied ? "답장 있음" : sender ? "답장 없음" : "첫 발송 전"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${readLabel === "읽음 불명" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
            >
              {readLabel}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            방 생성 {formatTime(row.createdAt)}
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          {orderedIds.slice(0, 2).map((id, index) => (
            <div key={id} className={index === 0 ? "contents" : "min-w-0"}>
              {index === 0 ? (
                <>
                  <JourneyParticipant
                    id={id}
                    snapshot={record(users[id])}
                    firstSender={id === sender}
                  />
                  <ArrowRight
                    aria-label={sender ? "첫 발송 방향" : "참여자"}
                    className="size-4 text-slate-300"
                  />
                </>
              ) : (
                <JourneyParticipant
                  id={id}
                  snapshot={record(users[id])}
                  firstSender={id === sender}
                />
              )}
            </div>
          ))}
        </div>
        {orderedIds.length === 0 && (
          <p className="text-sm text-slate-500">참여자 정보 없음</p>
        )}
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-slate-500">
              <MessageCircle aria-hidden className="size-3.5" />첫 메시지
            </span>
            <span className="text-right text-slate-700">
              {sender
                ? formatTime(row.firstMessageAt)
                : "아직 발송하지 않았어요"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">상대 답장</span>
            <span
              className={`text-right ${replied ? "text-emerald-700" : "text-slate-400"}`}
            >
              {replied ? formatTime(row.firstReplyAt) : "관찰 시점까지 없음"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
        <span className="text-xs text-slate-400">
          {sender ? (
            <>
              <JourneyParticipantName id={sender} users={users} /> 먼저 발송
            </>
          ) : (
            "발송 전 채팅방"
          )}
        </span>
        {route && (
          <Link
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            href={`/latest-${route}-chat-list/${encodeURIComponent(String(row.channelId))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            채팅방 열기
            <ChevronRight aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
      <details className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
        <summary className="cursor-pointer font-medium">
          이동 경로 · 개방 정보
        </summary>
        <div className="mt-3 space-y-3 break-words leading-relaxed">
          <p>{routeLabel(row.routeKey)}</p>
          <dl className="space-y-2">
            <div>
              <dt className="text-slate-400">최초 문의자</dt>
              <dd>
                <JourneyParticipantName id={row.creatorId} users={users} /> · #
                {String(row.creatorId ?? "확인 불가")}
              </dd>
            </div>
            {ids.map((id) => (
              <div key={id}>
                <dt className="text-slate-400">
                  <JourneyParticipantName id={id} users={users} /> · #{id} 최초
                  개방
                </dt>
                <dd>{opening(row, id)}</dd>
              </div>
            ))}
            <div>
              <dt className="text-slate-400">대상</dt>
              <dd>{String(record(row.attribution).targetId ?? "확인 불가")}</dd>
            </div>
          </dl>
          {Object.entries(record(record(row.attribution).filters)).map(
            ([key, value]) => (
              <p key={key}>
                {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
              </p>
            ),
          )}
        </div>
      </details>
    </article>
  );
}
