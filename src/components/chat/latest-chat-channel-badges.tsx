import type { LatestChatChannel } from "@/types/chat";
import moment from "moment";
import { getChatV2OpeningLabel } from "./chat-v2-tag-labels";
import ChatV2StartInsightBadges from "./chat-v2-start-insight-badges";

function userRoleLabel(
  channel: Pick<LatestChatChannel, "users">,
  userId: number
): string {
  const user = channel.users.find((candidate) => candidate.id === userId);
  if (user?.role === 1) return "모델";
  if (user?.role === 2) return "디자이너";
  return `사용자 ${userId}`;
}

export default function LatestChatChannelBadges({
  channel
}: {
  channel: Pick<
    LatestChatChannel,
    | "channelType"
    | "postType"
    | "postId"
    | "answerId"
    | "roomInstanceId"
    | "originEntrySource"
    | "originPricingType"
    | "channelOpenUserId"
    | "hasFirstReply"
    | "createdAt"
    | "activeParticipantIds"
    | "participantIds"
    | "participantOpenings"
    | "users"
  >;
}) {
  const isChannelRefunded = channel.participantOpenings.some(
    ({ opening }) => opening?.isChannelRefunded === true
  );

  return (
    <div className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
      <ChatV2StartInsightBadges channel={channel} />
      {isChannelRefunded ? (
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
          환불 종료
        </span>
      ) : null}
      {channel.participantOpenings.map((participantOpening) => {
        const roleLabel = userRoleLabel(channel, participantOpening.userId);
        if (!participantOpening.opening) {
          return (
            <span
              key={participantOpening.userId}
              className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700"
              title={participantOpening.issueReason ?? undefined}
            >
              {roleLabel} 개봉정보 확인불가
            </span>
          );
        }
        const openingLabel = getChatV2OpeningLabel(
          participantOpening.opening,
          channel.postType
        );
        const colorClass = openingLabel.includes("환불")
          ? "bg-amber-50 text-amber-700"
          : openingLabel.startsWith("유료")
            ? "bg-rose-50 text-rose-700"
            : openingLabel === "미개봉"
            ? "bg-slate-100 text-slate-600"
            : "bg-emerald-50 text-emerald-700";
        return (
          <span
            key={participantOpening.userId}
            className={`rounded px-1.5 py-0.5 ${colorClass}`}
            title={[
              participantOpening.opening.openedAt
                ? `개봉 ${moment(
                    participantOpening.opening.openedAt.toDate()
                  ).format("YYYY-MM-DD HH:mm")}`
                : null
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            {roleLabel} {openingLabel}
            {participantOpening.opening.openedAt
              ? ` · 개봉 ${moment(
                  participantOpening.opening.openedAt.toDate()
                ).format("MM-DD HH:mm")}`
              : ""}
            {participantOpening.opening.awaitingReply ? " · 답장 대기" : ""}
          </span>
        );
      })}
      {channel.activeParticipantIds.length < channel.participantIds.length ? (
        <span className="text-amber-600">참여자 나감</span>
      ) : null}
    </div>
  );
}
