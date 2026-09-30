import type { AnalyticsRow } from "@/apis/firestore/chat-journey-periods";
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
export function formatTime(value: unknown) {
  return typeof value === "number"
    ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : "확인 불가";
}
export function opening(row: AnalyticsRow, id: string) {
  const value = record(record(row.openings)[id]);
  const initial = record(record(row.initialOpenings)[id]);
  return typeof value.at === "number"
    ? `${({ MONG: "몽 사용", AD: "광고 시청", GROWTH_PASS: "성장패스", MEEMONG_PASS: "미몽패스", DAILY_FREE: "일일 무료", FREE_POLICY: "무료 정책", NONE: "과금 없음" } as Record<string, string>)[String(value.method)] ?? "수단 확인 불가"} · ${formatTime(value.at)}`
    : initial.state === "NOT_OPENED"
      ? "미개방"
      : "확인 불가";
}
