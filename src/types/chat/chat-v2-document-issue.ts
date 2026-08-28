export interface ChatV2DocumentIssue {
  kind: "invalid-v2-document";
  issueType: "validation" | "related-read";
  documentId: string;
  reason: string;
}

export function isChatV2DocumentIssue(
  value: unknown
): value is ChatV2DocumentIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { kind?: unknown }).kind === "invalid-v2-document"
  );
}

export function chatV2DocumentIssue(
  documentId: string,
  error: unknown,
  issueType: ChatV2DocumentIssue["issueType"] = "validation"
): ChatV2DocumentIssue {
  return {
    kind: "invalid-v2-document",
    issueType,
    documentId,
    reason: error instanceof Error ? error.message : "알 수 없는 검증 오류"
  };
}

/** 동기 문서 검증 오류만 항목으로 격리한다. Firestore 쿼리 오류에는 사용하지 않는다. */
export function captureChatV2DocumentValidation<T>(
  documentId: string,
  validate: () => T
): T | ChatV2DocumentIssue {
  try {
    return validate();
  } catch (error) {
    return chatV2DocumentIssue(documentId, error, "validation");
  }
}
