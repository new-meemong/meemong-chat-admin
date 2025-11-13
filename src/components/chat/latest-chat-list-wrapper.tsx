"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ChatChannelType } from "@/types/chat";

const LatestChatChannels = dynamic(
  () => import("./latest-chat-channels"),
  { ssr: false }
);
const LatestChatListMobile = dynamic(
  () => import("./latest-chat-list-mobile"),
  { ssr: false }
);

function useIsMobile() {
  // 768px 미만이면 모바일로 간주
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.outerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface LatestChatListWrapperProps {
  channelType: ChatChannelType;
}

const LatestChatListWrapper: React.FC<LatestChatListWrapperProps> = ({
  channelType
}) => {
  const isMobile = useIsMobile();
  if (isMobile) return <LatestChatListMobile channelType={channelType} />;
  return <LatestChatChannels channelType={channelType} />;
};

export default LatestChatListWrapper;


