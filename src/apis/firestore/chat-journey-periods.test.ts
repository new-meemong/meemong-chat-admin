import assert from 'node:assert/strict';
import test from 'node:test';
import { groupDailyStats, periodKey } from './chat-journey-periods.ts';
test('KST date keys group Monday through Sunday, including year boundaries', () => {
  assert.equal(periodKey('2026-01-01', 'week'), '2025-12-29');
  assert.equal(periodKey('2026-10-04', 'week'), '2026-09-28');
  assert.equal(periodKey('2026-10-01', 'month'), '2026-10');
});
test('weekly cohorts sum counts rather than daily percentages and retain drilldown dates', () => {
  const base = { service: 'modelMatching', routeKey: 'home', direction: 'MODEL_TO_DESIGNER', basis: 'message' };
  const rows = groupDailyStats([
    { ...base, id: '1', date: '2026-09-28', rooms: 10, eligible24: 10, replied24: 1 },
    { ...base, id: '2', date: '2026-09-29', rooms: 1, eligible24: 1, replied24: 1 },
    { ...base, id: '3', date: '2026-09-29', rooms: 99, basis: 'created' },
  ], 'week', 'message', 'modelMatching');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].rooms, 11);
  assert.equal(rows[0].eligible24, 11);
  assert.equal(rows[0].replied24, 2);
  assert.equal(rows[0].start, '2026-09-28');
  assert.equal(rows[0].end, '2026-09-29');
});

import { routeLabel } from './chat-journey-labels.ts';
test('existing room visits distinguish list, push and notification inbox', () => {
  assert.equal(routeLabel('existing_chat>chat_list'), '기존 채팅 다시 열기 → 채팅 목록');
  assert.equal(routeLabel('existing_chat>push'), '기존 채팅 다시 열기 → 푸시');
  assert.equal(routeLabel('existing_chat>notification_inbox'), '기존 채팅 다시 열기 → 알림함');
});

test('connection action is independent of profile/list entry and old records remain unknown', async () => {
  const { connectionLabel } = await import('./chat-journey-labels.ts');
  assert.equal(connectionLabel({ status: 'reused', attribution: { connectionKind: 'received_first_open', section: 'chat_list' } }), '받은 채팅 최초 개방');
  assert.equal(connectionLabel({ status: 'reused', attribution: { connectionKind: 'inquiry' } }), '다시 문의해서 연결');
  assert.equal(connectionLabel({ status: 'reused', attribution: { connectionKind: 'visit', section: 'profile' } }), '프로필에서 열기');
  assert.equal(connectionLabel({ status: 'reused', attribution: { section: 'chat_list' } }), '기존 방 연결 (동작 미분류)');
});
