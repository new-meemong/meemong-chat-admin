import type { ChatReadStatusSummary } from "@/hooks/use-chat-read-status";

interface ReadStatusNoticeProps {
  readStatus: ChatReadStatusSummary;
}

export default function ReadStatusNotice({
  readStatus
}: ReadStatusNoticeProps) {
  if (readStatus.isLoading) {
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
    return (
      <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
        v2 채널의 불변 참여자 정보가 2명이 아니어서 읽음 상태를 판단할 수
        없습니다.
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
