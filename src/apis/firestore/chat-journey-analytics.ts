import { collection, documentId, getDocs, Timestamp, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AnalyticsRow, Selection } from './chat-journey-periods';
export type { AnalyticsRow, Basis, Metric, Period, Selection } from './chat-journey-periods';
export { groupDailyStats } from './chat-journey-periods';
export async function loadDailyStats(start: string, end: string): Promise<AnalyticsRow[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end
    || Date.parse(end) - Date.parse(start) > 366 * 86400000) throw new Error('조회 기간은 최대 1년입니다.');
  const rows: AnalyticsRow[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | undefined;
  do {
    const page = await getDocs(query(collection(db, 'chatRouteDailyStats'), where('date', '>=', start),
      where('date', '<=', end), orderBy('date'), orderBy(documentId()), limit(500), ...(cursor ? [startAfter(cursor)] : [])));
    rows.push(...page.docs.map(d => ({ ...d.data(), id: d.id })));
    cursor = page.size === 500 ? page.docs.at(-1) : undefined;
  } while (cursor);
  return rows;
}
export async function loadConversationPage(selection: Selection, cursor?: QueryDocumentSnapshot<DocumentData>) {
  const field = selection.basis === 'created' ? 'createdDay' : 'firstMessageDay';
  const filters = selection.metric === 'sent' ? [where('hasMessage', '==', true)]
    : selection.metric === 'roomOnly' ? [where('roomOnly', '==', true)]
    : selection.metric === 'replied' ? [where('hasReply', '==', true)]
    : selection.metric === 'read' ? [where('readStatus', '==', 'READ')]
    : selection.metric === 'unread' ? [where('readStatus', '==', 'UNREAD')]
    : selection.metric === 'readUnknown' ? [where('readStatus', '==', 'UNKNOWN')] : [];
  const page = await getDocs(query(collection(db, 'chatConversationFacts'), ...filters,
    where('service', '==', selection.service), where('routeKey', '==', selection.routeKey), where('direction', '==', selection.direction),
    where(field, '>=', selection.start), where(field, '<=', selection.end), orderBy(field), orderBy(documentId()),
    limit(50), ...(cursor ? [startAfter(cursor)] : [])));
  return { rows: page.docs.map(d => ({ ...d.data(), id: d.id })) as AnalyticsRow[], cursor: page.size === 50 ? page.docs.at(-1) : undefined };
}

export async function loadAttemptPage(start: string, end: string, cursor?: QueryDocumentSnapshot<DocumentData>) {
  const from = Date.parse(`${start}T00:00:00+09:00`);
  const until = Date.parse(`${end}T00:00:00+09:00`) + 86400000;
  if (!Number.isFinite(from) || !Number.isFinite(until) || from >= until || until - from > 367 * 86400000) throw new Error('조회 기간을 확인해 주세요.');
  const page = await getDocs(query(collection(db, 'chatEntryAttempts'), where('createdAt', '>=', Timestamp.fromMillis(from)),
    where('createdAt', '<', Timestamp.fromMillis(until)), orderBy('createdAt'), orderBy(documentId()), limit(50), ...(cursor ? [startAfter(cursor)] : [])));
  return { rows: page.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt?.toMillis() })) as AnalyticsRow[], cursor: page.size === 50 ? page.docs.at(-1) : undefined };
}
