import assert from "node:assert/strict";
import test from "node:test";

import {
  captureChatV2DocumentValidation,
  isChatV2DocumentIssue
} from "../../types/chat/chat-v2-document-issue.ts";

test("손상된 v2 문서를 오류 항목으로 격리하고 다음 문서를 계속 처리한다", () => {
  const entries = ["valid-1", "invalid", "valid-2"].map((documentId) =>
    captureChatV2DocumentValidation(documentId, () => {
      if (documentId === "invalid") throw new Error("identity mismatch");
      return { documentId };
    })
  );

  assert.deepEqual(
    entries.filter((entry) => !isChatV2DocumentIssue(entry)),
    [{ documentId: "valid-1" }, { documentId: "valid-2" }]
  );
  const issue = entries.find(isChatV2DocumentIssue);
  assert.equal(issue?.documentId, "invalid");
  assert.equal(issue?.reason, "identity mismatch");
  assert.equal(issue?.issueType, "validation");
});
