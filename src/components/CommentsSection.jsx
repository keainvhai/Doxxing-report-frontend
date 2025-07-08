import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../helpers/AuthContext";
import { useContext } from "react";
import CommentItem from "./CommentItem";
import { buildCommentTree } from "./buildCommentTree"; // 可选分离出去

import "../styles/CommentsSection.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentsSection = ({ reportId }) => {
  const [newComment, setNewComment] = useState("");

  const [flatComments, setFlatComments] = useState([]);
  const [commentTree, setCommentTree] = useState([]);

  const [generating, setGenerating] = useState(false);

  // const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  // const [loading, setLoading] = useState(false);

  const { authState } = useContext(AuthContext);
  const isLoggedIn = authState?.status === true;

  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginRedirect = () => {
    navigate("/login", { state: { from: location } });
  };

  useEffect(() => {
    // console.log("📌 当前 reportId 是：", reportId);
    fetchComments(); // ✅ 自动拉取
  }, [reportId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/comments/${reportId}`
      );
      const flat = res.data.comments;

      setFlatComments(flat);

      const tree = buildCommentTree(flat);
      setCommentTree(tree);
    } catch (err) {
      toast.error("Failed to load comments");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("🟢 handleSubmit 被调用");
    console.log("📨 comment:", newComment);

    const token = localStorage.getItem("token");
    console.log("token is:", token);

    if (!token) {
      console.warn("⛔️ please login");
      toast.error("You must login to submit a comment.");
      return;
    }

    if (!newComment.trim()) {
      console.warn("⛔️ empty comment");
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        { content: newComment, reportId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ submit comments successful:", res.data);
      setNewComment("");
      toast.success("Comment submitted!");
      fetchComments(); // 重新拉取第一页
    } catch (err) {
      console.error("❌ submit failed:", err.response?.data || err.message);
      if (err.response?.status === 429) {
        toast.error(
          err.response.data ||
            "🚫 You're commenting too frequently. Please wait a moment."
        );
      } else {
        toast.error("Failed to submit comment");
      }
    }
  };

  const handleGenerateComment = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/generate`,
        {
          reportId,
        }
      );

      const suggestion = res.data?.suggestion;
      if (suggestion) {
        setNewComment(suggestion);
        toast.success("AI-generated comment added!");
      } else {
        toast.error("No suggestion received.");
      }
    } catch (err) {
      console.error("Failed to generate comment:", err);
      toast.error("Failed to generate AI comment.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="comments-container">
      <h3 className="comments-title">
        💬 Comments {flatComments.length > 0 && `(${flatComments.length})`}
      </h3>

      {commentTree.length === 0 ? (
        <p className="no-comments">No comments yet. Be the first to comment!</p>
      ) : (
        <ul className="comment-list">
          {commentTree.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              reportId={reportId}
              fetchComments={fetchComments}
            />
          ))}
        </ul>
      )}

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-row">
            <textarea
              className="comment-input"
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <button type="submit" className="comment-submit">
              Submit
            </button>
            <button
              type="button"
              className="comment-generate"
              onClick={handleGenerateComment}
              disabled={generating}
            >
              💡 {generating ? "Generating..." : "Generate with AI"}
            </button>
          </div>
        </form>
      ) : (
        <p className="login-tip">
          Please{" "}
          <span className="login-link" onClick={handleLoginRedirect}>
            log in
          </span>{" "}
          to post a comment.
        </p>
      )}
    </div>
  );
};

export default CommentsSection;
