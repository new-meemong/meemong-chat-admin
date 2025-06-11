import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useDailyActiveChatChannelsCountQuery } from "@/hooks/use-active-channel-daily-count-query";
import { useState } from "react";

export default function PostActiveChannelDayCountButton() {
  const [date, setDate] = useState("");
  const [queryDate, setQueryDate] = useState("");
  const { data, isLoading, isError, error } =
    useDailyActiveChatChannelsCountQuery(queryDate);

  const handleClick = () => {
    setQueryDate(date);
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>DailyCount</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="border rounded px-2 py-1 text-sm"
          />
          <Button onClick={handleClick}>조회</Button>
        </div>
        <div className="mt-4">
          {isLoading && <div>로딩 중...</div>}
          {isError && <div>에러: {error?.message}</div>}
          {queryDate && !isLoading && !isError && (
            <div>
              <b>{queryDate}</b> 생성된 채팅방 수: {data ?? 0}
            </div>
          )}
        </div>
        <div className="mt-8"></div>
      </CardContent>
    </Card>
  );
}
