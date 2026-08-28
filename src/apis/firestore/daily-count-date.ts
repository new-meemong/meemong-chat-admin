const KST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000;

function assertDateString(dateString: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`올바르지 않은 일일 집계 날짜입니다: ${dateString}`);
  }
}

/** 운영자 기준 일자(KST 00:00:00~23:59:59.999)의 실제 시각 범위. */
export function kstDayRange(dateString: string): {
  start: Date;
  end: Date;
} {
  assertDateString(dateString);
  return {
    start: new Date(`${dateString}T00:00:00.000+09:00`),
    end: new Date(`${dateString}T23:59:59.999+09:00`)
  };
}

export function kstDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MILLISECONDS)
    .toISOString()
    .slice(0, 10);
}

export function addDateStringDays(dateString: string, days: number): string {
  assertDateString(dateString);
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function yesterdayKstDateString(now = new Date()): string {
  return addDateStringDays(kstDateString(now), -1);
}

export function buildPendingDailyCountDateBatch({
  afterDate,
  throughDate,
  limit
}: {
  afterDate: string;
  throughDate: string;
  limit: number;
}): { dates: string[]; remainingDateCount: number } {
  assertDateString(afterDate);
  assertDateString(throughDate);
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new Error(`일일 집계 처리 상한이 올바르지 않습니다: ${limit}`);
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const pendingDateCount = Math.max(
    0,
    Math.round(
      (Date.parse(`${throughDate}T00:00:00.000Z`) -
        Date.parse(`${afterDate}T00:00:00.000Z`)) /
        millisecondsPerDay
    )
  );
  const processedDateCount = Math.min(pendingDateCount, limit);
  return {
    dates: Array.from({ length: processedDateCount }, (_, index) =>
      addDateStringDays(afterDate, index + 1)
    ),
    remainingDateCount: pendingDateCount - processedDateCount
  };
}
