import assert from "node:assert/strict";
import test from "node:test";

import { isCompleteV2DailyCountDocument } from "./daily-count-contract.ts";

test("신규·활성 수가 모두 저장된 v2 일일 집계만 완료로 본다", () => {
  assert.equal(
    isCompleteV2DailyCountDocument({
      schemaVersion: 2,
      baseDate: "2026-08-27",
      dailyTotalCount: 10,
      dailyTotalActiveCount: 8,
      dailyInvalidNewChannelCount: 0,
      dailyInvalidActiveChannelCount: 0
    }),
    true
  );
});

test("활성 수 저장 전의 부분 성공 문서는 완료로 보지 않는다", () => {
  assert.equal(
    isCompleteV2DailyCountDocument({
      schemaVersion: 2,
      baseDate: "2026-08-27",
      dailyTotalCount: 10
    }),
    false
  );
});

test("레거시·음수·잘못된 날짜 집계를 거부한다", () => {
  assert.equal(
    isCompleteV2DailyCountDocument({
      schemaVersion: 1,
      baseDate: "2026-08-27",
      dailyTotalCount: 10,
      dailyTotalActiveCount: 8,
      dailyInvalidNewChannelCount: 0,
      dailyInvalidActiveChannelCount: 0
    }),
    false
  );
  assert.equal(
    isCompleteV2DailyCountDocument({
      schemaVersion: 2,
      baseDate: "2026/08/27",
      dailyTotalCount: -1,
      dailyTotalActiveCount: 8,
      dailyInvalidNewChannelCount: 0,
      dailyInvalidActiveChannelCount: 0
    }),
    false
  );
});
