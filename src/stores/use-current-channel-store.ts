import { ChatChannel, ChatChannelType } from "@/types/chat";
import { createJSONStorage, persist } from "zustand/middleware";

import { User } from "@/types/user";
import { create } from "zustand";

/**
 * 채널 정보 타입
 */
interface ChannelInfo {
  channel: ChatChannel | null;
  users: User[];
  openUser: User | null;
}

/**
 * 최신 채팅방 리스트에서 들어간 현재 채팅방
 * 타입별로 분리된 상태 관리
 */
interface CurrentChannelState {
  channels: {
    [K in ChatChannelType]: ChannelInfo | null;
  };
  setChannelInfo: (
    type: ChatChannelType,
    channel: ChatChannel,
    users: User[],
    openUser: User | null
  ) => void;
  getChannelInfo: (type: ChatChannelType) => ChannelInfo | null;
  clearChannelInfo: (type: ChatChannelType) => void;
}

export const useCurrentChannelStore = create<CurrentChannelState>()(
  persist(
    (set, get) => ({
      channels: {
        "model-matching": null,
        "hair-consultation": null
      },
      setChannelInfo: (type, channel, users, openUser) =>
        set((state) => ({
          channels: {
            ...state.channels,
            [type]: { channel, users, openUser }
          }
        })),
      getChannelInfo: (type) => get().channels[type],
      clearChannelInfo: (type) =>
        set((state) => ({
          channels: {
            ...state.channels,
            [type]: null
          }
        }))
    }),
    {
      name: "current-channel-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
