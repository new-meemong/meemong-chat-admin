"use client";

import React from "react";
import dynamic from "next/dynamic";

const ModelMatchingLatestChatList = dynamic(
  () => import("./model-matching-latest-chat-channels"),
  { ssr: false }
);
const ModelMatchingLatestChatListMobile = dynamic(
  () => import("./model-matching-latest-chat-list-mobile"),
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

const ModelMatchingLatestChatListWrapper: React.FC = () => {
  const isMobile = useIsMobile();
  if (isMobile) return <ModelMatchingLatestChatListMobile />;
  return <ModelMatchingLatestChatList />;
};

export default ModelMatchingLatestChatListWrapper;
