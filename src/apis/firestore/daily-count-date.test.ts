import assert from "node:assert/strict";
import test from "node:test";

import {
  addDateStringDays,
  buildPendingDailyCountDateBatch,
  kstDateString,
  kstDayRange,
  yesterdayKstDateString
} from "./daily-count-date.ts";

test("KST 일일 집계 경계를 UTC 실제 시각으로 변환한다", () => {
  const range = kstDayRange("2026-08-27");
  assert.equal(range.start.toISOString(), "2026-08-26T15:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-08-27T14:59:59.999Z");
});

test("Timestamp를 KST 운영 일자로 변환한다", () => {
  assert.equal(kstDateString(new Date("2026-08-26T16:00:00.000Z")), "2026-08-27");
});

test("KST 기준 어제와 날짜 증감을 계산한다", () => {
  assert.equal(
    yesterdayKstDateString(new Date("2026-08-27T16:00:00.000Z")),
    "2026-08-27"
  );
  assert.equal(addDateStringDays("2026-03-01", -1), "2026-02-28");
});

test("첫 집계 구간을 처리 상한으로 나누고 남은 날짜를 보고한다", () => {
  const batch = buildPendingDailyCountDateBatch({
    afterDate: "2026-07-01",
    throughDate: "2026-08-05",
    limit: 30
  });
  assert.equal(batch.dates.length, 30);
  assert.equal(batch.dates[0], "2026-07-02");
  assert.equal(batch.dates.at(-1), "2026-07-31");
  assert.equal(batch.remainingDateCount, 5);
});
