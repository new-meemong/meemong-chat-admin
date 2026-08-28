import moment from "moment";

import type { ChatChannel } from "@/types/chat";
import {
  getChatV2OriginEntrySourceLabel,
  getChatV2OriginPricingTypeLabel,
  getChatV2PostTypeLabel,
  isPreSequenceV2RoomInstanceId
} from "./chat-v2-tag-labels";

type ChatV2StartInsight = Pick<
  ChatChannel,
  | "channelType"
  | "postType"
  | "postId"
  | "answerId"
  | "roomInstanceId"
  | "originEntrySource"
  | "originPricingType"
  | "channelOpenUserId"
  | "users"
  | "hasFirstReply"
  | "createdAt"
>;

/** 채널 생성 원인과 첫 답장 전환을 모든 관리자 채팅 화면에 동일하게 표시한다. */
export default function ChatV2StartInsightBadges({
  channel
}: {
  channel: ChatV2StartInsight;
}) {
  const postTypeLabel = getChatV2PostTypeLabel(channel.postType);
  const entrySourceLabel = getChatV2OriginEntrySourceLabel(
    channel.originEntrySource
  );
  const pricingTypeLabel = getChatV2OriginPricingTypeLabel(
    channel.originPricingType
  );
  const roomInstanceNumber = Number(channel.roomInstanceId);
  const isPreSequenceRoom = isPreSequenceV2RoomInstanceId(
    channel.roomInstanceId
  );
  const tracksFirstReply =
    channel.channelType === "modelMatching" ||
    channel.channelType === "hairConsultation";
  const initiator = channel.users.find(
    (user) => user.id === channel.channelOpenUserId
  );
  const initiatorRole =
    initiator?.role === 1
      ? "모델"
      : initiator?.role === 2
        ? "디자이너"
        : "사용자";
  const targetLabel =
    channel.postType === "CHAT"
      ? null
      : channel.answerId != null
        ? `답변 #${channel.answerId}`
        : `게시글 #${channel.postId}`;

  return (
    <>
      {postTypeLabel ? (
        <span
          className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700"
          title={channel.postType}
        >
          {channel.postType === "QUICK_MATCHING_PREMIUM" ? (
            <span aria-label="프리미엄" className="mr-1 text-amber-500">
              ★
            </span>
          ) : null}
          {postTypeLabel}
        </span>
      ) : null}
      <span
        className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700"
        title={`channelOpenUserId=${channel.channelOpenUserId}`}
      >
        시작: {initiatorRole}
        {initiator?.DisplayName ? ` ${initiator.DisplayName}` : ""} (#
        {channel.channelOpenUserId})
      </span>
      {entrySourceLabel ? (
        <span
          className="rounded bg-cyan-50 px-1.5 py-0.5 text-cyan-800"
          title={channel.originEntrySource}
        >
          최초 진입: {entrySourceLabel}
        </span>
      ) : null}
      {pricingTypeLabel ? (
        <span
          className="rounded bg-violet-50 px-1.5 py-0.5 text-violet-700"
          title={channel.originPricingType ?? undefined}
        >
          과금문맥: {pricingTypeLabel}
        </span>
      ) : null}
      {targetLabel ? (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
          {targetLabel}
        </span>
      ) : null}
      {isPreSequenceRoom ? (
        <span
          className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700"
          title={`순번 도입 전 v2 방 · roomInstanceId=${channel.roomInstanceId}`}
        >
          레거시
        </span>
      ) : null}
      {!isPreSequenceRoom && roomInstanceNumber > 1 ? (
        <span
          className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600"
          title={`roomInstanceId=${channel.roomInstanceId}`}
        >
          재생성 {roomInstanceNumber}번째
        </span>
      ) : null}
      {tracksFirstReply ? (
        <span
          className={`rounded px-1.5 py-0.5 ${
            channel.hasFirstReply
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {channel.hasFirstReply ? "첫 답장 완료" : "첫 답장 없음"}
        </span>
      ) : (
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
          첫 답장 미집계
        </span>
      )}
      <span
        className="text-slate-500"
        title={channel.createdAt.toDate().toISOString()}
      >
        생성 {moment(channel.createdAt.toDate()).format("YYYY-MM-DD HH:mm")}
      </span>
    </>
  );
}
