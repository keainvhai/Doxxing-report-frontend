import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCommentChatStore = create(
  persist(
    (set, get) => ({
      messagesMap: {},

      // 获取某个 reportId 对应的 messages（数组）
      getMessages: (reportId) => {
        const map = get().messagesMap;
        return map[reportId] || [];
      },

      // 设置某个 reportId 的消息列表
      setMessages: (reportId, newMessages) => {
        const map = get().messagesMap;
        set({
          messagesMap: {
            ...map,
            [reportId]: newMessages,
          },
        });
      },

      // 可选：清空某个 reportId 的记录
      clearMessages: (reportId) => {
        const map = get().messagesMap;
        const newMap = { ...map };
        delete newMap[reportId];
        set({ messagesMap: newMap });
      },
    }),
    {
      name: "comment-chat-store", // 💾 会在 localStorage 中持久化为这个 key
    }
  )
);

export default useCommentChatStore;
