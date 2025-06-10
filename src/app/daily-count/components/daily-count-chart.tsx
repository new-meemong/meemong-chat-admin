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
import { TrendingUp } from "lucide-react";
import { useCountChatChannels } from "@/hooks/use-count-chat-channels-query";
import { useDailyCountListQuery } from "@/hooks/use-daily-count-list-query";
import { useLatestChatChannels } from "@/hooks/use-latest-chat-channels";
import { useQueryClient } from "@tanstack/react-query";

export default function DailyCountChart() {
  // 오늘 날짜 계산
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // 날짜를 YYYY-MM-DD 포맷으로 변환하는 함수
  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  // 기본값: 시작일(2025-05-07), 종료일(어제)
  const minStartDate = "2025-05-07";
  const [startDate, setStartDate] = useState<string>(minStartDate);
  const [endDate, setEndDate] = useState<string>(formatDate(yesterday));
  const [queryRange, setQueryRange] = useState<{ start: string; end: string }>({
    start: minStartDate,
    end: formatDate(yesterday)
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
      color: "var(--chart-1)"
    }
  };

  const chartData = (listData || []).map((item) => ({
    date: item.baseDate,
    dailyTotalCount: item.dailyTotalCount
  }));

  const queryClient = useQueryClient();
  // useLatestChatChannels 훅을 호출하여 쿼리 등록 (데이터는 사용하지 않음)
  useLatestChatChannels();
  const mutation = useCountChatChannels();

  return (
    <div>
      <div className="text-sm text-gray-500">
        최신데이터 불러오기 버튼을 누르면 마지막 데이터 이후의 날짜들의 데이터를
        가져옵니다. 데이터는 25-05-07부터 어제까지의 데이터를 가져올 수
        있습니다.
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {queryRange.start} ~ {queryRange.end} Daily Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 날짜 선택 UI */}
          <div className="flex gap-2 mb-4 items-center">
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={startDate}
              min={minStartDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={endDate}
              min={startDate}
              max={formatDate(yesterday)}
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
                mutation.mutate(undefined, {
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
              <ChartContainer config={chartConfig} className="w-full">
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
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="dailyTotalCount"
                      type="natural"
                      fill="var(--chart-1)"
                      fillOpacity={0.4}
                      stroke="var(--chart-1)"
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
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                      dataKey="dailyTotalCount"
                      fill="var(--chart-1)"
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
