import { AlertTriangle } from "lucide-react";

import type { ChatV2DocumentIssue } from "@/types/chat";

export default function InvalidV2DocumentRow({
  issue
}: {
  issue: ChatV2DocumentIssue;
}) {
  return (
    <div className="flex w-full gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-amber-900">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">
          {issue.issueType === "validation"
            ? "손상된 v2 문서"
            : "v2 채널 데이터 읽기 실패"}
        </p>
        <p className="break-all font-mono text-xs">{issue.documentId}</p>
        <p className="mt-1 break-words text-xs">{issue.reason}</p>
      </div>
    </div>
  );
}
