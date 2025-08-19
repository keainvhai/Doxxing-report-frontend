import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import useCommentChatStore from "../store/commentChatStore"; // ✅ 引入 zustand store
import "../styles/AICommentAssistant.css";

const AICommentAssistant = ({ reportId, onAdopt, onClose }) => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const assistantRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  // ✅ 使用 zustand 管理当前 reportId 的 messages
  const getMessages = useCommentChatStore((s) => s.getMessages);
  const setMessages = useCommentChatStore((s) => s.setMessages);
  const messages = getMessages(reportId);

  const clearMessages = useCommentChatStore((s) => s.clearMessages);

  // ✅ 可选：组件挂载时初始化为空数组（防止未定义）
  useEffect(() => {
    if (!messages || !Array.isArray(messages)) {
      setMessages(reportId, []);
    }
  }, [reportId, messages]);

  // ✅ 拖拽功能
  useEffect(() => {
    const el = assistantRef.current;

    const onMouseDown = (e) => {
      pos.current = {
        x: e.clientX - el.offsetLeft,
        y: e.clientY - el.offsetTop,
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      el.style.left = `${e.clientX - pos.current.x}px`;
      el.style.top = `${e.clientY - pos.current.y}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const header = el.querySelector(".ai-assistant-header");
    header.addEventListener("mousedown", onMouseDown);

    return () => {
      header.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  // ✅ 发送消息并更新 store 中的 messages
  const sendMessage = async () => {
    let input = userInput.trim();
    if (!input) {
      input = "Generate a comment for this article"; // 默认 placeholder 内容
    }

    // ✅ 从本地取 JWT；没登录就阻止请求并提示
    const token = localStorage.getItem("token"); // ← 和登录时保持一致

    if (!token) {
      setMessages(reportId, [
        ...messages,
        {
          role: "assistant",
          content: "⚠️ Please log in to use AI comment assistant.",
        },
      ]);
      return;
    }

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(reportId, newMessages);
    setUserInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/generate`,
        { reportId, chatHistory: newMessages },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ 关键：带上 JWT
          },
        }
      );
      const suggestion = res.data?.suggestion;
      const reply = suggestion
        ? { role: "assistant", content: suggestion }
        : { role: "assistant", content: "⚠️ Failed to generate comment." };

      setMessages(reportId, [...newMessages, reply]);
    } catch {
      setMessages(reportId, [
        ...newMessages,
        { role: "assistant", content: "⚠️ Error generating comment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-box" ref={assistantRef}>
      <div className="ai-assistant-header">
        <span>🤖 AI Comment Assistant</span>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="ai-assistant-chat">
        {(!messages || messages.length === 0) && (
          <div className="ai-message ai-placeholder">
            Hi! I can help you write a short, thoughtful comment. Ask me
            anything!
          </div>
        )}
        {messages?.map((msg, idx) => (
          <div
            key={idx}
            className={`ai-message ${
              msg.role === "user" ? "user" : "assistant"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="ai-assistant-input">
        <textarea
          rows={2}
          placeholder="Generate a comment for this article"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
        />
        <div className="ai-assistant-actions">
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>

          <button
            className="clear-btn"
            onClick={() => {
              if (confirm("Clear this conversation?")) {
                clearMessages(reportId);
              }
            }}
          >
            🗑
          </button>

          <button
            onClick={() => {
              const last = [...messages]
                .reverse()
                .find((m) => m.role === "assistant");
              if (last) {
                onAdopt(last.content);
                onClose();
              }
            }}
            disabled={
              messages?.filter((m) => m.role === "assistant").length === 0
            }
          >
            ✅ Adopt Suggestion
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICommentAssistant;
