export function sanitizeChatParticipantIds(
  participantIds: readonly unknown[]
) {
  const userIds = participantIds
    .map((userId) =>
      typeof userId === "number" || typeof userId === "string"
        ? Number(userId)
        : NaN
    )
    .filter((userId) => Number.isFinite(userId) && userId > 0)
    .map(String);

  return [...new Set(userIds)];
}

/** 읽음 상태 키처럼 입력 순서와 무관해야 하는 곳에서 사용하는 안정 정렬. */
export function normalizeChatParticipantIds(
  participantIds: readonly unknown[]
) {
  return sanitizeChatParticipantIds(participantIds).sort(
    (a, b) => Number(a) - Number(b)
  );
}
