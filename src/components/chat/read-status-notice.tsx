import type { ChatReadStatusSummary } from "@/hooks/use-chat-read-status";
import type { ReadStatusParticipantIssue } from "@/hooks/use-read-status-participants";

interface ReadStatusNoticeProps {
  readStatus: ChatReadStatusSummary;
  participantIssue: ReadStatusParticipantIssue;
  isParticipantResolutionLoading: boolean;
}

export default function ReadStatusNotice({
  readStatus,
  participantIssue,
  isParticipantResolutionLoading
}: ReadStatusNoticeProps) {
  if (isParticipantResolutionLoading || readStatus.isLoading) {
    return (
      <div className="mt-2 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">
        읽음 상태를 확인하는 중입니다.
      </div>
    );
  }

  if (readStatus.hasError) {
    return (
      <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        읽음 상태를 불러오지 못했습니다. 아래 메시지의 읽음 표시가 실제와 다를
        수 있습니다.
      </div>
    );
  }

  if (readStatus.hasTimedOut) {
    return (
      <div className="mt-2 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">
        읽음 상태가 아직 서버에서 확인되지 않았습니다.
      </div>
    );
  }

  if (readStatus.hasStaleValue) {
    return (
      <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        연결 상태로 인해 읽음 상태가 최신이 아닐 수 있습니다.
      </div>
    );
  }

  if (readStatus.hasInvalidParticipantCount) {
    const message =
      participantIssue === "channel-fetch-failed"
        ? "읽음 상태용 채널 정보를 불러오지 못해 참여자를 확인할 수 없습니다."
        : participantIssue === "channel-missing"
        ? "읽음 상태용 채널 문서가 없어 참여자를 확인할 수 없습니다."
        : participantIssue === "resolution-failed"
        ? "채널 참여자를 2명으로 복원하지 못해 읽음 상태를 판단할 수 없습니다."
        : "읽음 상태를 판단하려면 채널 참여자 정보가 2명이어야 합니다.";

    return (
      <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        {message}
      </div>
    );
  }

  if (readStatus.hasUnreadableValue) {
    return (
      <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        저장된 읽음 시각 형식을 해석할 수 없어 일부 메시지의 읽음 상태를 확인할
        수 없습니다.
      </div>
    );
  }

  if (readStatus.hasMissingRecord) {
    return (
      <div className="mt-2 rounded bg-slate-50 px-3 py-2 text-xs text-slate-600">
        사용자의 채널 기록이 없어 일부 메시지의 읽음 상태를 확인할 수 없습니다.
      </div>
    );
  }

  return null;
}
