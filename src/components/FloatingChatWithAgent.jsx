import React, { useState, useRef, useEffect } from "react";
import useChatStore from "../store/chatStore";
import ReactMarkdown from "react-markdown";

const FloatingChatWithAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  useEffect(() => {
    // 保证滚到底部
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      clearMessages();
    }
  };
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    addMessage(newUserMessage);
    setInput("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      const data = await res.json();

      addMessage({ role: "assistant", content: data.reply });
    } catch (error) {
      console.error("Chat API failed", error);
      addMessage({
        role: "assistant",
        content: "Oops, something went wrong. I'm still here for you.",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={styles.container}>
      {isOpen ? (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <span>AI Companion</span>

            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#d0e8ff" : "#e8f5e9",
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p style={{ margin: 0, padding: 0 }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ marginBottom: "0.25rem" }} {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        style={{ margin: 0, paddingLeft: "1.25rem" }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something..."
            />
            <button style={styles.clearBtn} onClick={handleClear}>
              🗑
            </button>
            <button style={styles.sendButton} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button style={styles.floatingBtn} onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  floatingBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  chatBox: {
    width: "320px",
    height: "400px",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
  },
  header: {
    fontWeight: "bold",
    marginBottom: "0.5rem",
    display: "flex",
    justifyContent: "space-between",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    marginRight: "0.5rem",
    cursor: "pointer",
    color: "#888",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  message: {
    padding: "0.75rem",
    borderRadius: "10px",
    maxWidth: "70%",
  },
  inputArea: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  sendButton: {
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default FloatingChatWithAgent;
