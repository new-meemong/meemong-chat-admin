"use client";

import React, { useState } from "react";

import { useDailyCount } from "@/hooks/use-daily-count";

export default function DailyCount() {
  const [date, setDate] = useState("");
  const [queryDate, setQueryDate] = useState("");
  const { data, isLoading, isError, error } = useDailyCount(queryDate);

  const handleClick = () => {
    setQueryDate(date);
  };

  return (
    <div>
      <h2>DailyCount</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="YYYY-MM-DD"
      />
      <button onClick={handleClick}>조회</button>
      <div style={{ marginTop: 16 }}>
        {isLoading && <div>로딩 중...</div>}
        {isError && <div>에러: {error?.message}</div>}
        {queryDate && !isLoading && !isError && (
          <div>
            <b>{queryDate}</b> 생성된 채팅방 수: {data ?? 0}
          </div>
        )}
      </div>
    </div>
  );
}
