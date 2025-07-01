import { create } from "zustand";

// 从 localStorage 加载历史记录
const storedMessages = JSON.parse(
  localStorage.getItem("chat_messages") || "[]"
);

const useChatStore = create((set) => ({
  messages:
    storedMessages.length > 0
      ? storedMessages
      : [
          {
            role: "assistant",
            content: "Hi, I'm here to listen. What's on your mind?",
          },
        ],
  addMessage: (msg) =>
    set((state) => {
      const updated = [...state.messages, msg];
      localStorage.setItem("chat_messages", JSON.stringify(updated));
      return { messages: updated };
    }),
  clearMessages: () => {
    localStorage.removeItem("chat_messages");
    set({ messages: [] });
  },
}));

export default useChatStore;
