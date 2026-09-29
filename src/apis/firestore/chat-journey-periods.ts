export type AnalyticsRow = Record<string, unknown> & { id: string };
export type Period = 'day' | 'week' | 'month';
export type Basis = 'created' | 'message';
export type Metric = 'rooms' | 'roomOnly' | 'sent' | 'replied' | 'read' | 'unread' | 'readUnknown';
export interface Selection {
  metric: Metric;
  start: string; end: string; service: string; routeKey: string; direction: string; basis: Basis;
}
export function periodKey(day: string, period: Period): string {
  if (period === 'month') return day.slice(0, 7);
  if (period === 'day') return day;
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

const count = (r: AnalyticsRow, key: string) => typeof r[key] === 'number' ? r[key] as number : 0;
export function groupDailyStats(stats: AnalyticsRow[], period: Period, basis: Basis, service: string): AnalyticsRow[] {
    const result = new Map<string, AnalyticsRow>();
    for (const row of stats) {
      if (row.basis !== basis || service && row.service !== service || count(row, 'rooms') === 0) continue;
      const date = periodKey(String(row.date), period);
      const key = JSON.stringify([date, row.service, row.routeKey, row.direction]);
      const group = result.get(key) ?? { id: key, date, service: row.service, routeKey: row.routeKey, direction: row.direction, start: row.date, end: row.date };
      if (String(row.date) < String(group.start)) group.start = row.date;
      if (String(row.date) > String(group.end)) group.end = row.date;
      for (const field of ['rooms', 'roomOnly', 'sent', 'replied', 'read', 'unread', 'readUnknown', 'eligible24', 'eligible72', 'eligible168', 'replied24', 'replied72', 'replied168']) group[field] = count(group, field) + count(row, field);
      result.set(key, group);
    }
    return [...result.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}
