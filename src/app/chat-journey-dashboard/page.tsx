'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { routeLabel, connectionLabel } from '@/apis/firestore/chat-journey-labels';
import { loadAttemptPage, loadConversationPage, loadDailyStats, groupDailyStats } from '@/apis/firestore/chat-journey-analytics';
import type { AnalyticsRow, Basis, Metric, Period, Selection } from '@/apis/firestore/chat-journey-analytics';
import { CHAT_V2_SERVICES } from '@/apis/firestore/constants';
const services: Record<string, string> = { modelMatching: '모델모집', experienceGroup: '체험단', hairConsultation: '헤어컨설팅', reviewSpecial: '리뷰특가', jobPosting: '구인구직' };
const directions: Record<string, string> = { MODEL_TO_DESIGNER: '모델 → 디자이너', DESIGNER_TO_MODEL: '디자이너 → 모델', RECRUITER_TO_JOB_SEEKER: '구인자 → 구직자', JOB_SEEKER_TO_RECRUITER: '구직자 → 구인자', PENDING: '첫 발송 전', UNKNOWN: '확인 불가' };
const number = (r: AnalyticsRow, key: string) => typeof r[key] === 'number' ? r[key] as number : 0;
function map(value: unknown): Record<string, unknown> { return value && typeof value === 'object' ? value as Record<string, unknown> : {}; }
function time(value: unknown) { return typeof value === 'number' ? new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '확인 불가'; }
function rate(r: AnalyticsRow, h: number) { const d = number(r, `eligible${h}`); return d ? `${(number(r, `replied${h}`) / d * 100).toFixed(1)}% (${number(r, `replied${h}`)}/${d})` : '관찰 완료 없음'; }
function opening(row: AnalyticsRow, id: string) {
  const value = map(map(row.openings)[id]);
  const initial = map(map(row.initialOpenings)[id]);
  return typeof value.at === 'number' ? `${({ MONG: '몽 사용', AD: '광고 시청', GROWTH_PASS: '성장패스', MEEMONG_PASS: '미몽패스', DAILY_FREE: '일일 무료', FREE_POLICY: '무료 정책', NONE: '과금 없음' } as Record<string, string>)[String(value.method)] ?? '수단 확인 불가'} · ${time(value.at)}`
    : initial.state === 'NOT_OPENED' ? '미개방' : '확인 불가';
}
export default function ChatJourneyDashboard() {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const [start, setStart] = useState(today.slice(0, 7) + '-01');
  const [end, setEnd] = useState(today);
  const [period, setPeriod] = useState<Period>('day');
  const [basis, setBasis] = useState<Basis>('message');
  const [service, setService] = useState('');
  const [stats, setStats] = useState<AnalyticsRow[]>([]);
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [selection, setSelection] = useState<Selection>();
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData>>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadedAt, setLoadedAt] = useState('');
  const [attempts, setAttempts] = useState<AnalyticsRow[]>([]);
  const [attemptCursor, setAttemptCursor] = useState<QueryDocumentSnapshot<DocumentData>>();
  const [attemptRange, setAttemptRange] = useState<{start: string; end: string}>();
  const groups = useMemo(() => groupDailyStats(stats, period, basis, service), [stats, period, basis, service]);
  async function refresh() {
    setBusy(true); setError(''); setSelection(undefined); setRows([]);
    try { setStats(await loadDailyStats(start, end)); setLoadedAt(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })); }
    catch { setStats([]); setError('집계를 불러오지 못했습니다. Firebase Rules와 집계 배포 상태를 확인해 주세요.'); }
    finally { setBusy(false); }
  }
  async function openRows(s: Selection, more = false) {
    setBusy(true); setError('');
    try {
      const page = await loadConversationPage(s, more ? cursor : undefined);
      setRows(old => more ? [...old, ...page.rows] : page.rows); setCursor(page.cursor); setSelection(s);
    } catch { setError('채팅 목록을 불러오지 못했습니다. 권한과 Firestore 인덱스를 확인해 주세요.'); }
    finally { setBusy(false); }
  }
  async function showAttempts(more = false) {
    setBusy(true); setError('');
    const range = more && attemptRange ? attemptRange : { start, end };
    try {
      const page = await loadAttemptPage(range.start, range.end, more ? attemptCursor : undefined);
      setAttempts(old => more ? [...old, ...page.rows] : page.rows); setAttemptCursor(page.cursor); setAttemptRange(range);
    } catch { setError('시작·재진입 기록을 불러오지 못했습니다.'); }
    finally { setBusy(false); }
  }
  return <main className="p-6 space-y-5">
    <h1 className="text-2xl font-bold">채팅 시작 경로</h1>
    <p>KST 기준 · 주간은 월요일 시작 · 실제 메시지와 상대 답장을 기준으로 집계합니다.</p>
      <div className="flex flex-wrap gap-3 items-center">
        <label>시작일 <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border p-2" /></label>
        <label>종료일 <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border p-2" /></label>
        <select aria-label="기간 단위" value={period} onChange={e => setPeriod(e.target.value as Period)} className="border p-2"><option value="day">일별</option><option value="week">주별</option><option value="month">월별</option></select>
        <select aria-label="날짜 기준" value={basis} onChange={e => { setBasis(e.target.value as Basis); setSelection(undefined); }} className="border p-2"><option value="message">첫 실제 발송일</option><option value="created">방 생성일</option></select>
        <select aria-label="채팅 종류" value={service} onChange={e => setService(e.target.value)} className="border p-2"><option value="">전체 종류</option>{Object.entries(services).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <button disabled={busy} onClick={() => void refresh()} className="border rounded p-2">{busy ? '조회 중…' : '조회'}</button>
        <button disabled={busy} className="border rounded p-2" onClick={() => void showAttempts()}>시작·재진입 기록</button>
      </div>
      <p className="text-sm text-gray-600">조회 시각: {loadedAt || '조회 전'} · 사전 집계 반영 및 관찰 기간 갱신에는 지연이 있을 수 있습니다. 상세 목록은 조회 당시 최신 상태입니다. 숫자를 누르면 같은 조건의 채팅을 50건씩 볼 수 있습니다.</p>
      <div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr>{['기간', '종류', '경로', '첫 발송 방향', '방 수·목록', '발송 전', '발송', '답장', '열람', '미열람', '읽음 불명', '24시간', '72시간', '7일'].map(label => <th key={label} className="p-2 border text-left">{label}</th>)}</tr></thead><tbody>
        {groups.map(row => <tr key={row.id}>
          <td className="p-2 border">{String(row.date)}</td><td className="p-2 border">{services[String(row.service)]}</td><td className="p-2 border break-all">{routeLabel(row.routeKey)}</td><td className="p-2 border">{directions[String(row.direction)] ?? String(row.direction)}</td>
          {(['rooms', 'roomOnly', 'sent', 'replied', 'read', 'unread', 'readUnknown'] as Metric[]).map(metric => <td key={metric} className="p-2 border"><button disabled={busy} className="text-blue-700 underline" onClick={() => void openRows({ start: String(row.start), end: String(row.end), service: String(row.service), routeKey: String(row.routeKey), direction: String(row.direction), basis, metric })}>{number(row, metric)}</button></td>)}
          {[24, 72, 168].map(h => <td key={h} className="p-2 border">{rate(row, h)}</td>)}
        </tr>)}
      </tbody></table></div>
      {!busy && groups.length === 0 && <p>조회된 집계가 없습니다. 수집 배포 이전의 상세 경로는 복원되지 않습니다.</p>}
      {attemptRange && <section className="space-y-2"><h2 className="font-bold">시작·재진입 기록 ({attemptRange.start} ~ {attemptRange.end}) · {attempts.length}건 로드</h2>
        <p className="text-sm">전체 종류의 시작 처리와 기존 방 연결 기록입니다. 최초 개방·다시 문의·목록/푸시/프로필 열기를 구분합니다. 광고·결제 전 취소한 문의 클릭은 포함하지 않습니다.</p>
        {attempts.map(row => <p key={row.id} className="border p-2">{time(row.createdAt)} · 사용자 #{String(row.userId)} · {connectionLabel(row)} · {routeLabel(map(row.attribution).routeKey)} · 방 {String(row.channelId ?? '연결 전')}</p>)}
        {attemptCursor && <button disabled={busy} className="border p-2" onClick={() => void showAttempts(true)}>기록 다음 50건</button>}
      </section>}
      {selection && <section className="space-y-3"><h2 className="font-bold">해당 경로의 {({ rooms: '전체 방', roomOnly: '발송 전', sent: '발송', replied: '답장 있음', read: '열람', unread: '미열람', readUnknown: '열람 불명' })[selection.metric]} · 현재 {rows.length}건 로드</h2>
        {rows.map(row => {
          const users = map(row.users); const ids = Array.isArray(row.participantIds) ? row.participantIds.map(String) : [];
          const route = Object.entries(CHAT_V2_SERVICES).find(([, config]) => config.sourceCollection === row.sourceCollection)?.[0];
          return <article key={row.id} className="border rounded p-3 space-y-2">
            <p>{ids.map(id => `${map(users[id]).name || '사용자'} (#${id})`).join(' ↔ ')} · 생성 {time(row.createdAt)}</p>
            <p>최초 문의자 #{String(row.creatorId ?? '확인 불가')} · 첫 발송자 #{String(row.firstSenderId ?? '발송 전')} · 첫 발송 {time(row.firstMessageAt)}</p>
            {ids.map(id => <p key={id}>#{id} 최초 개방: {opening(row, id)}</p>)}
            <p>상대 열람: {({ READ: '열람 확인', UNREAD: '미열람', UNKNOWN: '확인 불가', NO_MESSAGE: '발송 전' } as Record<string, string>)[String(row.readStatus)]} · 답장: {row.firstReplyAt == null ? '관찰 시점까지 없음' : time(row.firstReplyAt)}</p>
            <details><summary>이동 경로·검색 조건</summary><p className="break-all">{routeLabel(row.routeKey)}</p><p>대상: {String(map(row.attribution).targetId ?? '확인 불가')}</p>{Object.entries(map(map(row.attribution).filters)).map(([key, value]) => <p key={key}>{key}: {Array.isArray(value) ? value.join(', ') : String(value)}</p>)}</details>
            {route && <Link className="text-blue-700 underline" href={`/latest-${route}-chat-list/${encodeURIComponent(String(row.channelId))}`}>채팅 상세 열기</Link>}
          </article>;
        })}
        {cursor && <button disabled={busy} className="border p-2" onClick={() => void openRows(selection, true)}>다음 50건</button>}
      </section>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
  </main>;
}
