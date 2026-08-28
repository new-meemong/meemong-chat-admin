import { CHAT_V2_SCHEMA_VERSION } from "./constants.ts";

export interface CompleteV2DailyCountData {
  schemaVersion: 2;
  baseDate: string;
  dailyTotalCount: number;
  dailyTotalActiveCount: number;
  dailyInvalidNewChannelCount: number;
  dailyInvalidActiveChannelCount: number;
}

export interface DailyChannelCountResult {
  count: number;
  invalidDocumentCount: number;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/**
 * 두 집계와 제외 건수가 모두 저장된 v2 문서만 완료로 본다.
 * 이 판정은 다음 갱신 시작점과 차트 표시 여부에 함께 적용되어 부분 집계가
 * 완료된 운영 통계처럼 노출되지 않게 한다.
 */
export function isCompleteV2DailyCountDocument(
  value: unknown
): value is CompleteV2DailyCountData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    data.schemaVersion === CHAT_V2_SCHEMA_VERSION &&
    typeof data.baseDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.baseDate) &&
    isNonNegativeInteger(data.dailyTotalCount) &&
    isNonNegativeInteger(data.dailyTotalActiveCount) &&
    isNonNegativeInteger(data.dailyInvalidNewChannelCount) &&
    isNonNegativeInteger(data.dailyInvalidActiveChannelCount)
  );
}
