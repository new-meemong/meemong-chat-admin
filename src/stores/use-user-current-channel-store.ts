import { createJSONStorage, persist } from "zustand/middleware";

import { User } from "@/types/user";
import { UserChatChannel, ChatChannelType } from "@/types/chat";
import { create } from "zustand";

/**
 * 유저 채널 정보 타입
 */
interface UserChannelInfo {
  channel: UserChatChannel | null;
  currentUser: User | null;
  otherUser: Partial<User> | null;
}

/**
 * 특정 userId의 채팅방에서 들어간 현재 채팅방
 * 타입별로 분리된 상태 관리
 */
interface UserCurrentChannelState {
  userChannels: {
    [K in ChatChannelType]: UserChannelInfo | null;
  };
  setChannelInfo: (
    type: ChatChannelType,
    channel: UserChatChannel,
    currentUser: User,
    otherUser: Partial<User>
  ) => void;
  getChannelInfo: (type: ChatChannelType) => UserChannelInfo | null;
  clearChannelInfo: (type: ChatChannelType) => void;
}

export const useUserCurrentChannelStore = create<UserCurrentChannelState>()(
  persist(
    (set, get) => ({
      userChannels: {
        'model-matching': null,
        'hair-consultation': null
      },
      setChannelInfo: (type, channel, currentUser, otherUser) =>
        set((state) => ({
          userChannels: {
            ...state.userChannels,
            [type]: { channel, currentUser, otherUser }
          }
        })),
      getChannelInfo: (type) => get().userChannels[type],
      clearChannelInfo: (type) =>
        set((state) => ({
          userChannels: {
            ...state.userChannels,
            [type]: null
          }
        }))
    }),
    {
      name: "user-current-channel-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
