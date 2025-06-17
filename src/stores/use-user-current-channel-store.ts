import { createJSONStorage, persist } from "zustand/middleware";

import { User } from "@/types/user";
import { UserModelMatchingChatChannel } from "@/types/user-model-matching-chat-channels";
import { create } from "zustand";

/**
 * 특정 userId의 채팅방에서 들어간 현재 채팅방
 */
interface UserCurrentChannelState {
  channel: UserModelMatchingChatChannel | null;
  currentUser: User | null;
  otherUser: Partial<User> | null;

  setChannelInfo: (
    channel: UserModelMatchingChatChannel,
    currentUser: User,
    otherUser: Partial<User>
  ) => void;
  clearChannelInfo: () => void;
}

export const useUserCurrentChannelStore = create<UserCurrentChannelState>()(
  persist(
    (set) => ({
      channel: null,
      currentUser: null,
      otherUser: null,

      setChannelInfo: (channel, currentUser, otherUser) =>
        set({ channel, currentUser, otherUser }),
      clearChannelInfo: () =>
        set({ channel: null, currentUser: null, otherUser: null })
    }),
    {
      name: "user-current-channel-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
