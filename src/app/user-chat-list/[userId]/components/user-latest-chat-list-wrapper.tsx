"use client";

import React from "react";
import dynamic from "next/dynamic";

const UserLatestChatChannels = dynamic(
  () => import("./user-latest-chat-channels"),
  { ssr: false }
);
const UserLatestChatListMobile = dynamic(
  () => import("./user-latest-chat-list-mobile"),
  { ssr: false }
);

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.outerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

interface Props {
  userId: string;
}

const UserLatestChatListWrapper: React.FC<Props> = ({ userId }) => {
  const isMobile = useIsMobile();
  if (isMobile) return <UserLatestChatListMobile userId={userId} />;
  return <UserLatestChatChannels userId={userId} />;
};

export default UserLatestChatListWrapper;
