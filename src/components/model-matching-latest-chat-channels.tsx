// 경로: src/components/chat/model-matching-latest-chat-list.tsx

"use client";

import { Loader2, MessageSquare } from "lucide-react";

import { Card } from "@/components/ui/card";
import React from "react";
import { useLatestChatChannels } from "@/hooks/use-latest-chat-channels";

const ModelMatchingLatestChatList: React.FC = () => {
  const { data, isLoading, error } = useLatestChatChannels();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        <p>채팅방을 가져오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-400">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <MessageSquare className="mx-auto mb-2 w-6 h-6" />
        <p>아직 대화가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((channel) => (
        <Card
          key={channel.id}
          className="flex items-center p-4 hover:bg-gray-50 transition cursor-pointer"
          onClick={() => {
            // TODO: 채팅방으로 이동하는 로직 (예: 라우터 push)
            // 예시: router.push(`/chat/${channel.id}`);
          }}
        ></Card>
      ))}
    </div>
  );
};

export default ModelMatchingLatestChatList;
