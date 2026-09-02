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
    users: User[]
  ) => void;
  getChannelInfo: (type: ChatChannelType) => ChannelInfo | null;
  clearChannelInfo: (type: ChatChannelType) => void;
}

export const useCurrentChannelStore = create<CurrentChannelState>()(
  persist(
    (set, get) => ({
      channels: {
        "model-matching": null,
        "hair-consultation": null,
        "job-posting": null,
        "review-special": null
      },
      setChannelInfo: (type, channel, users) =>
        set((state) => ({
          channels: {
            ...state.channels,
            [type]: { channel, users }
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
      // 레거시 ChatChannel을 복원하면 v2 불변 participantIds가 없어 상세가
      // 손상되므로 저장소 키를 분리한다.
      name: "current-v2-channel-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
