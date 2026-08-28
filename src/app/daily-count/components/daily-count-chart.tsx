import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { DailyCountChannelType } from "@/types/chat";
import { TrendingUp } from "lucide-react";
import { useCountDailyNewChatChannels } from "@/hooks/use-count-chat-channels-query";
import { useDailyCountListQuery } from "@/hooks/use-daily-count-list-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  addDateStringDays,
  yesterdayKstDateString
} from "@/apis/firestore/daily-count-date";

export default function DailyCountChart() {
  const yesterday = yesterdayKstDateString();
  const thirtyDaysAgo = addDateStringDays(yesterday, -30);

  // 요일 반환 함수
  function getKoreanDayOfWeek(dateString: string) {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const date = new Date(`${dateString}T00:00:00.000Z`);
    return days[date.getUTCDay()];
  }

  const defaultStartDate = thirtyDaysAgo;
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(yesterday);
  const [queryRange, setQueryRange] = useState<{ start: string; end: string }>({
    start: defaultStartDate,
    end: yesterday
  });

  // 쿼리 파라미터에 따라 데이터 패칭
  const {
    data: listData,
    isLoading,
    error
  } = useDailyCountListQuery(queryRange.start, queryRange.end);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const chartConfig: ChartConfig = {
    dailyTotalCount: {
      label: "생성된 채팅방 수",
      color: "#FF4D4F"
    },
    dailyTotalActiveCount: {
      label: "활성 채팅방 수",
      color: "#1E90FF"
    },
    dailyDiffCount: {
      label: "차이(활성-생성)",
      color: "#FFD700"
    }
  };

  const chartData = (listData || []).map((item) => ({
    date: item.baseDate,
    dailyTotalCount: item.dailyTotalCount ?? 0,
    dailyTotalActiveCount: item.dailyTotalActiveCount ?? 0,
    dailyDiffCount:
      (item.dailyTotalActiveCount ?? 0) - (item.dailyTotalCount ?? 0),
    dailyInvalidNewChannelCount: item.dailyInvalidNewChannelCount ?? 0,
    dailyInvalidActiveChannelCount: item.dailyInvalidActiveChannelCount ?? 0
  }));
  const invalidNewChannelCount = chartData.reduce(
    (total, item) => total + item.dailyInvalidNewChannelCount,
    0
  );
  const invalidActiveChannelCount = chartData.reduce(
    (total, item) => total + item.dailyInvalidActiveChannelCount,
    0
  );

  const queryClient = useQueryClient();
  const mutation = useCountDailyNewChatChannels();

  return (
    <div>
      <div className="text-sm text-gray-500">
        v2 집계만 KST(00:00~23:59) 기준으로 표시합니다. 최신데이터 불러오기
        버튼은 마지막 v2 집계 이후부터 한 번에 최대 30일을 처리합니다.
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {queryRange.start} ~ {queryRange.end} 일자별 생성된 채팅방 수
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 날짜 선택 UI */}
          <div className="flex gap-2 mb-4 items-center">
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={endDate}
              min={startDate}
              max={yesterday}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button
              onClick={() => setQueryRange({ start: startDate, end: endDate })}
              variant="default"
            >
              적용
            </Button>
            {/* 최신 데이터 불러오기 버튼 */}
            <Button
              variant="outline"
              onClick={() => {
                const channelType: DailyCountChannelType = "model-matching";
                mutation.mutate(channelType, {
                  onSuccess: async () => {
                    await queryClient.invalidateQueries({
                      queryKey: ["dailyCountList"]
                    });
                  }
                });
              }}
              disabled={mutation.isPending}
            >
              최신 데이터 불러오기
            </Button>
          </div>
          {mutation.data ? (
            <div
              className={`mb-4 rounded px-3 py-2 text-sm ${
                mutation.data.invalidNewChannelCount > 0 ||
                mutation.data.invalidActiveChannelCount > 0
                  ? "bg-amber-50 text-amber-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              이번 갱신에서 {mutation.data.processedDateCount}일을 처리했습니다.
              {mutation.data.remainingDateCount > 0
                ? ` 남은 ${mutation.data.remainingDateCount}일은 버튼을 다시 눌러 이어서 처리하세요.`
                : " KST 기준 어제까지 최신 상태입니다."}
              {mutation.data.invalidNewChannelCount > 0 ||
              mutation.data.invalidActiveChannelCount > 0
                ? ` 손상 문서 제외: 생성 ${mutation.data.invalidNewChannelCount}건, 활성 ${mutation.data.invalidActiveChannelCount}건.`
                : ""}
            </div>
          ) : null}
          {invalidNewChannelCount > 0 || invalidActiveChannelCount > 0 ? (
            <div className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
              선택 기간 제외 문서: 생성 집계 {invalidNewChannelCount}건, 활성 집계 {invalidActiveChannelCount}건
            </div>
          ) : null}
          {/* 차트 타입 버튼 */}
          <div className="flex gap-2 mb-4 justify-end">
            <Button
              variant={chartType === "area" ? "default" : "outline"}
              onClick={() => setChartType("area")}
            >
              Area Chart
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              onClick={() => setChartType("bar")}
            >
              Bar Chart
            </Button>
          </div>
          {/* 로딩/에러/차트 */}
          {isLoading && <div>로딩 중...</div>}
          {error && <div>에러: {error.message}</div>}
          {!isLoading && !error && chartData && (
            <div className="w-full">
              <ChartContainer config={chartConfig} className="w-full h-[60vh]">
                {chartType === "area" ? (
                  <AreaChart
                    width={400}
                    height={200}
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          labelFormatter={(label, payload) => {
                            const date = payload?.[0]?.payload?.date || label;
                            const day = getKoreanDayOfWeek(date);
                            return (
                              <span>
                                {date} ({day})
                              </span>
                            );
                          }}
                        />
                      }
                    />
                    <Area
                      dataKey="dailyTotalCount"
                      type="natural"
                      fill="#FF4D4F"
                      fillOpacity={0.4}
                      stroke="#FF4D4F"
                    />
                    <Area
                      dataKey="dailyTotalActiveCount"
                      type="natural"
                      fill="#1E90FF"
                      fillOpacity={0.4}
                      stroke="#1E90FF"
                    />
                    <Area
                      dataKey="dailyDiffCount"
                      type="natural"
                      fill="#FFD700"
                      fillOpacity={0.4}
                      stroke="#FFD700"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    width={400}
                    height={200}
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          labelFormatter={(label, payload) => {
                            const date = payload?.[0]?.payload?.date || label;
                            const day = getKoreanDayOfWeek(date);
                            return (
                              <span>
                                {date} ({day})
                              </span>
                            );
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="dailyTotalCount"
                      fill="#FF4D4F"
                      fillOpacity={0.7}
                    />
                    <Bar
                      dataKey="dailyTotalActiveCount"
                      fill="#1E90FF"
                      fillOpacity={0.7}
                    />
                    <Bar
                      dataKey="dailyDiffCount"
                      fill="#FFD700"
                      fillOpacity={0.7}
                    />
                  </BarChart>
                )}
              </ChartContainer>
              <div className="flex w-full items-start gap-2 text-sm mt-2">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    최근 일별 생성 추이 <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none"></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
