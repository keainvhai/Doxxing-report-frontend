import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { toast } from "react-toastify";
import "../styles/CommentsSection.css";

const ReplyForm = ({ reportId, parentId, onReplySuccess }) => {
  const { authState } = useContext(AuthContext);
  const isLoggedIn = authState?.status === true;

  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        {
          content,
          reportId,
          parentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reply submitted!");
      setContent("");
      setShowForm(false);

      onReplySuccess?.(); // 通知父组件刷新评论
    } catch (err) {
      toast.error("Failed to submit reply");
      console.error("❌ Reply error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="reply-form">
      {showForm ? (
        <form onSubmit={handleSubmit}>
          <textarea
            rows={2}
            placeholder="Write a reply..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="comment-input"
          />
          <button type="submit" className="comment-submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Reply"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button className="reply-btn" onClick={() => setShowForm(true)}>
          Reply
        </button>
      )}
    </div>
  );
};

export default ReplyForm;
