import { createJSONStorage, persist } from "zustand/middleware";

import { ModelMatchingChatChannel } from "@/types/model-matching-chat-channel";
import { User } from "@/types/user";
import { create } from "zustand";

interface CurrentChannelState {
  channel: ModelMatchingChatChannel | null;
  users: User[];
  openUser: User | null;
  setChannelInfo: (
    channel: ModelMatchingChatChannel,
    users: User[],
    openUser: User | null
  ) => void;
  clearChannelInfo: () => void;
}

export const useCurrentChannelStore = create<CurrentChannelState>()(
  persist(
    (set) => ({
      channel: null,
      users: [],
      openUser: null,
      setChannelInfo: (channel, users, openUser) =>
        set({ channel, users, openUser }),
      clearChannelInfo: () => set({ channel: null, users: [], openUser: null })
    }),
    {
      name: "current-channel-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
