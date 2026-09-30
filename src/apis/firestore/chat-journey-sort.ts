import type { AnalyticsRow, Metric } from "./chat-journey-periods";

export type JourneySortKey = Metric | "direction";
export type JourneySort =
  { key: JourneySortKey; order: "descending" | "ascending" } | undefined;

export function nextJourneySort(
  current: JourneySort,
  key: JourneySortKey,
): JourneySort {
  if (current?.key !== key) return { key, order: "descending" };
  return current.order === "descending"
    ? { key, order: "ascending" }
    : undefined;
}

/** Sort a copy so clearing the sort restores the original date/cohort order. */
export function sortJourneyGroups(
  rows: AnalyticsRow[],
  sort: JourneySort,
): AnalyticsRow[] {
  if (!sort) return rows;
  return [...rows].sort((a, b) => {
    if (sort.key === "direction") {
      const preferred =
        sort.order === "descending" ? "DESIGNER_TO_MODEL" : "MODEL_TO_DESIGNER";
      const other =
        sort.order === "descending" ? "MODEL_TO_DESIGNER" : "DESIGNER_TO_MODEL";
      const rank = (value: unknown) =>
        value === preferred ? 0 : value === other ? 1 : 2;
      return rank(a.direction) - rank(b.direction);
    }
    const count = (row: AnalyticsRow) =>
      typeof row[sort.key] === "number" ? (row[sort.key] as number) : 0;
    return (count(a) - count(b)) * (sort.order === "descending" ? -1 : 1);
  });
}
