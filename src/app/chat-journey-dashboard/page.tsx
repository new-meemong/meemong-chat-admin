"use client";
import { useMemo, useState } from "react";
import { JourneyConversationCard } from "./journey-conversation-card";
import { record, formatTime } from "./journey-format";
import {
  nextJourneySort,
  sortJourneyGroups,
} from "@/apis/firestore/chat-journey-sort";
import type {
  JourneySort,
  JourneySortKey,
} from "@/apis/firestore/chat-journey-sort";
import {
  History,
  RefreshCw,
  MessagesSquare,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  routeLabel,
  connectionLabel,
} from "@/apis/firestore/chat-journey-labels";
import {
  loadAttemptPage,
  loadConversationPage,
  loadDailyStats,
  groupDailyStats,
} from "@/apis/firestore/chat-journey-analytics";
import type {
  AnalyticsRow,
  Basis,
  Metric,
  Period,
  Selection,
} from "@/apis/firestore/chat-journey-analytics";

const services: Record<string, string> = {
  modelMatching: "모델모집",
  experienceGroup: "체험단",
  hairConsultation: "헤어컨설팅",
  reviewSpecial: "리뷰특가",
  jobPosting: "구인구직",
};
const directions: Record<string, string> = {
  MODEL_TO_DESIGNER: "모델 → 디자이너",
  DESIGNER_TO_MODEL: "디자이너 → 모델",
  RECRUITER_TO_JOB_SEEKER: "구인자 → 구직자",
  JOB_SEEKER_TO_RECRUITER: "구직자 → 구인자",
  PENDING: "첫 발송 전",
  UNKNOWN: "확인 불가",
};
const metricCount = (r: AnalyticsRow, key: string) =>
  typeof r[key] === "number" ? (r[key] as number) : 0;
function rate(r: AnalyticsRow, h: number) {
  const d = metricCount(r, `eligible${h}`);
  return d
    ? `${((metricCount(r, `replied${h}`) / d) * 100).toFixed(1)}% (${metricCount(r, `replied${h}`)}/${d})`
    : "관찰 완료 없음";
}
const metricLabels: Record<Metric, string> = {
  rooms: "전체 방",
  roomOnly: "발송 전",
  sent: "발송",
  replied: "답장",
  read: "열람",
  unread: "미열람",
  readUnknown: "읽음 불명",
};
const metrics: Metric[] = [
  "rooms",
  "roomOnly",
  "sent",
  "replied",
  "read",
  "unread",
  "readUnknown",
];
const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500";
function JourneyPath({ value }: { value: unknown }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-sm leading-relaxed">
      {routeLabel(value)
        .split(" → ")
        .map((step, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                aria-hidden
                className="size-3 shrink-0 text-slate-300"
              />
            )}
            <span
              className={
                step === "출처 확인 불가"
                  ? "rounded bg-amber-50 px-1.5 text-amber-800"
                  : ""
              }
            >
              {step}
            </span>
          </span>
        ))}
    </div>
  );
}
export default function ChatJourneyDashboard() {
  const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const [start, setStart] = useState(today.slice(0, 7) + "-01");
  const [end, setEnd] = useState(today);
  const [period, setPeriod] = useState<Period>("day");
  const [basis, setBasis] = useState<Basis>("message");
  const [service, setService] = useState("");
  const [sort, setSort] = useState<JourneySort>();
  const [view, setView] = useState<"activity" | "reply">("activity");
  const [panel, setPanel] = useState<"rooms" | "attempts">();
  const [panelError, setPanelError] = useState("");
  const [loadedRange, setLoadedRange] = useState<{
    start: string;
    end: string;
  }>();
  const [stats, setStats] = useState<AnalyticsRow[]>([]);
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [selection, setSelection] = useState<Selection>();
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"stats" | "panel">();
  const busy = loading !== undefined;
  const [loadedAt, setLoadedAt] = useState("");
  const [attempts, setAttempts] = useState<AnalyticsRow[]>([]);
  const [attemptCursor, setAttemptCursor] =
    useState<QueryDocumentSnapshot<DocumentData>>();
  const [attemptRange, setAttemptRange] = useState<{
    start: string;
    end: string;
  }>();
  const groups = useMemo(
    () => groupDailyStats(stats, period, basis, service),
    [stats, period, basis, service],
  );
  const sortedGroups = useMemo(
    () => sortJourneyGroups(groups, sort),
    [groups, sort],
  );
  function sortHeader(key: JourneySortKey, label: string) {
    const active = sort?.key === key;
    const Icon = !active
      ? ArrowUpDown
      : sort.order === "descending"
        ? ArrowDown
        : ArrowUp;
    const next = nextJourneySort(sort, key);
    const action = !next
      ? "정렬 해제"
      : key === "direction"
        ? next.order === "descending"
          ? "디자이너 먼저"
          : "모델 먼저"
        : next.order === "descending"
          ? "높은 순"
          : "낮은 순";
    return (
      <button
        onClick={() => setSort(nextJourneySort(sort, key))}
        aria-label={`${label}: ${action}`}
        title={`클릭하면 ${action}`}
        className={`inline-flex min-h-9 items-center justify-center gap-1 rounded px-1 hover:bg-indigo-100 focus-visible:outline-indigo-600 ${active ? "font-semibold text-indigo-700" : ""}`}
      >
        {label}
        <Icon aria-hidden className="size-3 shrink-0" />
      </button>
    );
  }
  async function refresh() {
    setLoading("stats");
    setError("");
    setSelection(undefined);
    setRows([]);
    setPanel(undefined);
    try {
      setStats(await loadDailyStats(start, end));
      setLoadedRange({ start, end });
      setLoadedAt(
        new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      );
    } catch {
      setStats([]);
      setLoadedAt("");
      setLoadedRange(undefined);
      setError(
        "집계를 불러오지 못했습니다. Firebase Rules와 집계 배포 상태를 확인해 주세요.",
      );
    } finally {
      setLoading(undefined);
    }
  }
  async function openRows(s: Selection, more = false) {
    setLoading("panel");
    setPanelError("");
    setPanel("rooms");
    setSelection(s);
    if (!more) {
      setRows([]);
      setCursor(undefined);
    }
    try {
      const page = await loadConversationPage(s, more ? cursor : undefined);
      setRows((old) => (more ? [...old, ...page.rows] : page.rows));
      setCursor(page.cursor);
      setSelection(s);
    } catch {
      setPanelError(
        "채팅 목록을 불러오지 못했습니다. 권한과 Firestore 인덱스를 확인해 주세요.",
      );
    } finally {
      setLoading(undefined);
    }
  }
  async function showAttempts(more = false) {
    setLoading("panel");
    setPanelError("");
    setPanel("attempts");
    if (!more) {
      setAttempts([]);
      setAttemptCursor(undefined);
    }
    const range = more && attemptRange ? attemptRange : { start, end };
    setAttemptRange(range);
    try {
      const page = await loadAttemptPage(
        range.start,
        range.end,
        more ? attemptCursor : undefined,
      );
      setAttempts((old) => (more ? [...old, ...page.rows] : page.rows));
      setAttemptCursor(page.cursor);
      setAttemptRange(range);
    } catch {
      setPanelError("시작·재진입 기록을 불러오지 못했습니다.");
    } finally {
      setLoading(undefined);
    }
  }
  const totals = Object.fromEntries(
    metrics.map((metric) => [
      metric,
      groups.reduce((sum, row) => sum + metricCount(row, metric), 0),
    ]),
  ) as Record<Metric, number>;
  const datesChanged =
    loadedRange && (loadedRange.start !== start || loadedRange.end !== end);
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-2 pb-8 pt-14 text-slate-800 md:px-0 md:pt-0">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-600">
            CHAT ANALYTICS
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            채팅 시작 경로
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            어디서 시작한 채팅이 실제 대화로 이어졌는지 확인하세요.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void showAttempts()}
          className="gap-2 rounded-lg"
        >
          <History className="size-4" />
          시작·재진입 기록
        </Button>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void refresh();
        }}
        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5"
      >
        <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[1fr_1fr_1.2fr_1fr_auto]">
          <label className="space-y-2 text-xs font-medium text-slate-500">
            <span>시작일</span>
            <input
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-500">
            <span>종료일</span>
            <input
              required
              type="date"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-500">
            <span>날짜 기준</span>
            <select
              value={basis}
              onChange={(e) => setBasis(e.target.value as Basis)}
              className={inputClass}
            >
              <option value="message">첫 실제 발송일</option>
              <option value="created">방 생성일</option>
            </select>
          </label>
          <label className="space-y-2 text-xs font-medium text-slate-500">
            <span>채팅 종류</span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={inputClass}
            >
              <option value="">전체 종류</option>
              {Object.entries(services).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={busy}
            type="submit"
            className="h-10 gap-2 rounded-lg bg-indigo-600 px-6 hover:bg-indigo-700"
          >
            <RefreshCw
              className={`size-4 ${loading === "stats" ? "animate-spin" : ""}`}
            />
            {loading === "stats" ? "조회 중…" : "조회"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>KST 기준 · 주간은 월요일 시작</span>
          <span>
            {basis === "message"
              ? "발송한 방만 포함합니다. 발송 전 방은 방 생성일 기준으로 확인하세요."
              : "선택한 기간에 생성된 방의 발송·답장 상태를 확인합니다."}
          </span>
        </div>
        {datesChanged && (
          <p role="status" className="mt-3 text-sm text-amber-800">
            날짜가 변경되었습니다. 조회를 눌러 적용하세요.
          </p>
        )}
      </form>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <section
        aria-label="집계 요약"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {(
          [
            ["rooms", "전체 방", "현재 조건의 채팅방"],
            ["sent", "첫 메시지 발송", "실제 메시지가 있는 방"],
            ["replied", "상대 답장", "상대의 답장이 있는 방"],
            ["readUnknown", "읽음 불명", "열람 여부를 확인할 수 없는 방"],
          ] as const
        ).map(([key, label, description]) => (
          <div
            key={key}
            className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
              className={`my-2 text-3xl font-semibold tabular-nums tracking-tight ${key === "replied" ? "text-indigo-600" : key === "readUnknown" ? "text-amber-700" : "text-slate-900"}`}
            >
              {loadedAt ? totals[key].toLocaleString("ko-KR") : "—"}
              <span className="ml-1 text-sm font-normal text-slate-400">
                방
              </span>
            </p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-4 md:px-5">
          <div>
            <h2 className="font-semibold">
              경로별 상세{" "}
              <span className="ml-1 text-sm font-normal text-slate-400">
                {groups.length.toLocaleString()}개 항목
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {loadedRange
                ? `${loadedRange.start} ~ ${loadedRange.end}`
                : "기간을 선택하고 조회해 주세요."}{" "}
              · 숫자를 누르면 채팅 목록이 열립니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              aria-label="표시 지표"
              className="flex rounded-lg bg-slate-100 p-1"
            >
              {(
                [
                  ["activity", "발송·열람"],
                  ["reply", "기간별 답장률"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={view === key}
                  onClick={() => {
                    setView(key);
                    if (
                      key === "reply" &&
                      sort &&
                      sort.key !== "rooms" &&
                      sort.key !== "direction"
                    )
                      setSort(undefined);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${view === key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              aria-label="기간 단위"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-lg border border-slate-200 p-2 text-xs"
            >
              <option value="day">일별</option>
              <option value="week">주별</option>
              <option value="month">월별</option>
            </select>
          </div>
        </div>
        {sort && (
          <p
            role="status"
            className="border-b border-slate-100 px-5 py-2 text-xs text-indigo-700"
          >
            {sort.key === "direction"
              ? `첫 발송자 · ${sort.order === "descending" ? "디자이너 먼저" : "모델 먼저"} (그 외 방향·발송 전·확인 불가는 뒤에 표시)`
              : `${metricLabels[sort.key]} · ${sort.order === "descending" ? "높은 순" : "낮은 순"}`}
            <button
              className="ml-3 underline underline-offset-2"
              onClick={() => setSort(undefined)}
            >
              정렬 해제
            </button>
          </p>
        )}
        {view === "reply" && (
          <p className="border-b border-slate-100 bg-indigo-50/50 px-5 py-3 text-xs text-slate-600">
            관찰 기간이 지난 방 중 해당 시간 안에 답장받은 비율입니다. 괄호는
            답장받은 방 / 관찰 완료 방입니다.
          </p>
        )}
        <div
          className="max-h-[65vh] overflow-auto"
          tabIndex={0}
          role="region"
          aria-label="경로별 집계 표"
        >
          <table className="w-full min-w-[920px] table-fixed text-sm">
            <caption className="sr-only">
              {basis === "message" ? "첫 실제 발송일" : "방 생성일"} 기준 경로별
              채팅방 집계
            </caption>
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th
                  scope="col"
                  className="w-36 px-5 py-3 text-left font-medium"
                >
                  기간 / 종류
                </th>
                <th
                  scope="col"
                  className="w-[34%] px-4 py-3 text-left font-medium"
                  aria-sort={sort?.key === "direction" ? "other" : "none"}
                >
                  {sortHeader("direction", "이동 경로 / 첫 발송자")}
                </th>
                {(view === "activity" ? metrics : (["rooms"] as Metric[])).map(
                  (metric) => (
                    <th
                      key={metric}
                      scope="col"
                      aria-sort={sort?.key === metric ? sort.order : "none"}
                      className="whitespace-nowrap px-1 py-2 text-center font-medium"
                    >
                      {sortHeader(metric, metricLabels[metric])}
                    </th>
                  ),
                )}
                {view === "reply" &&
                  ["24시간 이내", "72시간 이내", "7일 이내"].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-1 py-3 text-center font-medium"
                    >
                      {label}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedGroups.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-indigo-50/40"
                >
                  <td className="px-5 py-4 align-top">
                    <p className="whitespace-nowrap text-xs font-medium tabular-nums">
                      {String(row.date)}
                    </p>
                    <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {services[String(row.service)] ?? String(row.service)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <JourneyPath value={row.routeKey} />
                    <p className="mt-2 text-xs text-slate-400">
                      {directions[String(row.direction)] ??
                        String(row.direction)}
                    </p>
                  </td>
                  {(view === "activity"
                    ? metrics
                    : (["rooms"] as Metric[])
                  ).map((metric) => (
                    <td
                      key={metric}
                      className="px-1 py-4 text-center tabular-nums"
                    >
                      <button
                        disabled={busy}
                        aria-label={`${metricLabels[metric]} ${metricCount(row, metric)}방 목록`}
                        className={`min-h-9 min-w-9 rounded-md px-2 font-medium hover:bg-indigo-100 focus-visible:outline-indigo-600 disabled:opacity-50 ${!metricCount(row, metric) ? "text-slate-300" : metric === "readUnknown" ? "text-amber-700" : "text-indigo-700"}`}
                        onClick={() =>
                          void openRows({
                            start: String(row.start),
                            end: String(row.end),
                            service: String(row.service),
                            routeKey: String(row.routeKey),
                            direction: String(row.direction),
                            basis,
                            metric,
                          })
                        }
                      >
                        {metricCount(row, metric).toLocaleString("ko-KR")}
                      </button>
                    </td>
                  ))}
                  {view === "reply" &&
                    [24, 72, 168].map((h) => (
                      <td
                        key={h}
                        className="px-2 py-4 text-center text-xs tabular-nums text-slate-600"
                      >
                        {rate(row, h)}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
          {groups.length === 0 && (
            <div
              role="status"
              className="flex flex-col items-center gap-3 px-6 py-16 text-center"
            >
              <MessagesSquare className="size-8 text-slate-300" />
              <p className="font-medium">
                {loading === "stats"
                  ? "집계를 불러오는 중입니다…"
                  : loadedAt
                    ? "이 조건에 해당하는 집계가 없습니다."
                    : "채팅이 시작된 경로를 확인해 보세요."}
              </p>
              <p className="text-sm text-slate-500">
                {loadedAt
                  ? "기간이나 채팅 종류를 변경해 보세요."
                  : "상단에서 기간을 선택한 뒤 조회를 눌러 주세요."}
              </p>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          {loadedAt ? `마지막 조회 ${loadedAt}` : "아직 조회하지 않았습니다."} ·
          집계 반영과 관찰 기간 갱신에는 지연이 있을 수 있습니다.
        </div>
      </section>
      <details className="rounded-xl border border-slate-200 p-4 text-sm">
        <summary className="cursor-pointer font-medium text-slate-600">
          집계 기준과 용어 안내
        </summary>
        <dl className="mt-4 grid gap-4 text-xs leading-relaxed text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [
              "방 수 · 발송 전 · 발송",
              "숫자의 단위는 메시지가 아닌 채팅방입니다. 전체 방은 발송 전 방과 실제 메시지를 발송한 방의 합계입니다.",
            ],
            [
              "답장",
              "첫 메시지를 받은 상대가 실제로 답장한 방입니다. 열람과 중복될 수 있습니다.",
            ],
            [
              "열람 · 미열람",
              "상대가 첫 실제 메시지를 읽었는지 구분합니다. 마지막 메시지의 읽음 상태를 뜻하지 않습니다.",
            ],
            [
              "읽음 불명",
              "읽음 기록이나 추적 정보가 부족해 판단할 수 없는 방입니다. 미열람을 뜻하지 않습니다.",
            ],
            [
              "출처 확인 불가",
              "시작 경로 정보가 없는 구간입니다. 이후 확인된 이동 경로는 함께 표시합니다. 수집 이전의 상세 경로는 복원되지 않습니다.",
            ],
            [
              "상세 목록",
              "숫자를 누르면 같은 조건의 채팅을 50건씩 확인합니다. 목록은 조회 시점의 최신 상태로 집계와 차이가 있을 수 있습니다.",
            ],
          ].map(([term, description]) => (
            <div key={term}>
              <dt className="mb-1 font-semibold text-slate-700">{term}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </details>
      <Sheet
        open={!!panel}
        onOpenChange={(open) => {
          if (!open) setPanel(undefined);
        }}
      >
        <SheetContent className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b border-slate-200 p-6 pr-10">
            <SheetTitle>
              {panel === "attempts"
                ? "시작·재진입 기록"
                : `채팅 목록 · ${selection ? metricLabels[selection.metric] : ""}`}
            </SheetTitle>
            <SheetDescription>
              {panel === "attempts"
                ? `${attemptRange?.start} ~ ${attemptRange?.end} · 전체 종류`
                : `${selection?.start} ~ ${selection?.end} · ${services[selection?.service ?? ""] ?? ""}`}
            </SheetDescription>
            {panel === "rooms" && selection && (
              <div className="mt-3">
                <JourneyPath value={selection.routeKey} />
                <p className="mt-2 text-xs text-slate-500">
                  {directions[selection.direction] ?? selection.direction} ·{" "}
                  {selection.basis === "message"
                    ? "첫 실제 발송일"
                    : "방 생성일"}{" "}
                  기준
                </p>
              </div>
            )}
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5">
            {panelError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {panelError}
              </p>
            )}
            {panel === "attempts" ? (
              <>
                <p className="text-xs leading-relaxed text-slate-500">
                  최초 개방·다시 문의·목록/푸시/프로필 열기 기록입니다.
                  광고·결제 전 취소한 문의 클릭은 포함하지 않습니다.
                </p>
                {attempts.map((row) => (
                  <article
                    key={row.id}
                    className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm break-words"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">
                        {connectionLabel(row)}
                      </span>
                      <time className="text-xs text-slate-400">
                        {formatTime(row.createdAt)}
                      </time>
                    </div>
                    <JourneyPath value={record(row.attribution).routeKey} />
                    <p className="text-xs text-slate-500">
                      사용자 #{String(row.userId)} · 방{" "}
                      {String(row.channelId ?? "연결 전")}
                    </p>
                  </article>
                ))}
                {attemptCursor && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    className="w-full"
                    onClick={() => void showAttempts(true)}
                  >
                    기록 다음 50건
                  </Button>
                )}
              </>
            ) : (
              selection && (
                <>
                  {rows.map((row) => (
                    <JourneyConversationCard key={row.id} row={row} />
                  ))}
                  {cursor && (
                    <button
                      disabled={busy}
                      className="w-full rounded-lg border p-3 text-sm hover:bg-slate-50"
                      onClick={() => void openRows(selection, true)}
                    >
                      다음 50건
                    </button>
                  )}
                </>
              )
            )}
            {loading === "panel" ? (
              <p
                role="status"
                className="py-6 text-center text-sm text-slate-500"
              >
                불러오는 중…
              </p>
            ) : (
              !panelError &&
              (panel === "attempts" ? attempts : rows).length === 0 && (
                <p className="py-12 text-center text-sm text-slate-500">
                  해당 조건의 기록이 없습니다.
                </p>
              )
            )}
          </div>
          <div className="border-t p-4 text-xs text-slate-500">
            현재 {(panel === "attempts" ? attempts : rows).length}건 표시 ·
            50건씩 불러옵니다.
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
