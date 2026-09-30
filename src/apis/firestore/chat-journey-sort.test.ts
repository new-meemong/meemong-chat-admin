import assert from "node:assert/strict";
import test from "node:test";
import { nextJourneySort, sortJourneyGroups } from "./chat-journey-sort.ts";
import type { AnalyticsRow, Metric } from "./chat-journey-periods.ts";

test("every numeric header cycles descending, ascending, reset without changing the source or ties", () => {
  for (const key of [
    "rooms",
    "roomOnly",
    "sent",
    "replied",
    "read",
    "unread",
    "readUnknown",
  ] as Metric[]) {
    const rows: AnalyticsRow[] = [
      { id: "two", [key]: 2 },
      { id: "ten", [key]: 10 },
      { id: "tie", [key]: 2 },
      { id: "missing" },
    ];
    let sort = nextJourneySort(undefined, key);
    assert.deepEqual(
      sortJourneyGroups(rows, sort).map((r) => r.id),
      ["ten", "two", "tie", "missing"],
    );
    sort = nextJourneySort(sort, key);
    assert.deepEqual(
      sortJourneyGroups(rows, sort).map((r) => r.id),
      ["missing", "two", "tie", "ten"],
    );
    sort = nextJourneySort(sort, key);
    assert.equal(sort, undefined);
    assert.deepEqual(
      sortJourneyGroups(rows, sort).map((r) => r.id),
      ["two", "ten", "tie", "missing"],
    );
  }
  assert.deepEqual(
    nextJourneySort({ key: "rooms", order: "ascending" }, "sent"),
    { key: "sent", order: "descending" },
  );
});

test("sender sort prioritizes designer then model and keeps other roles/unknown/pending behind both", () => {
  const rows = [
    "UNKNOWN",
    "MODEL_TO_DESIGNER",
    "PENDING",
    "DESIGNER_TO_MODEL",
    "RECRUITER_TO_JOB_SEEKER",
  ].map((direction) => ({ id: direction, direction }));
  let sort = nextJourneySort(undefined, "direction");
  assert.deepEqual(
    sortJourneyGroups(rows, sort).map((r) => r.id),
    [
      "DESIGNER_TO_MODEL",
      "MODEL_TO_DESIGNER",
      "UNKNOWN",
      "PENDING",
      "RECRUITER_TO_JOB_SEEKER",
    ],
  );
  sort = nextJourneySort(sort, "direction");
  assert.deepEqual(
    sortJourneyGroups(rows, sort).map((r) => r.id),
    [
      "MODEL_TO_DESIGNER",
      "DESIGNER_TO_MODEL",
      "UNKNOWN",
      "PENDING",
      "RECRUITER_TO_JOB_SEEKER",
    ],
  );
  assert.equal(
    sortJourneyGroups(rows, nextJourneySort(sort, "direction")),
    rows,
  );
});
