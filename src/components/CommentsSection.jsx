import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../helpers/AuthContext";
import CommentItem from "./CommentItem";
import { buildCommentTree } from "./buildCommentTree";
import AICommentAssistant from "./AICommentAssistant"; // ✅ 引入 AI 助手组件

import "../styles/CommentsSection.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentsSection = ({ reportId }) => {
  const [newComment, setNewComment] = useState("");
  const [flatComments, setFlatComments] = useState([]);
  const [commentTree, setCommentTree] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false); // ✅ 控制 AI 弹窗

  //comment ai generate recognition
  const [isAI, setIsAI] = useState(false);

  const { authState } = useContext(AuthContext);
  const isLoggedIn = authState?.status === true;

  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginRedirect = () => {
    navigate("/login", { state: { from: location } });
  };

  useEffect(() => {
    fetchComments();
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

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must login to submit a comment.");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments`,
        { content: newComment, reportId, is_ai_generated: isAI },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewComment("");
      toast.success("Comment submitted!");
      fetchComments();
    } catch (err) {
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
        { reportId }
      );
      const suggestion = res.data?.suggestion;
      if (suggestion) {
        setNewComment(suggestion);
        setIsAI(true); // ✅ 标记为 AI
        toast.success("AI-generated comment added!");
      } else {
        toast.error("No suggestion received.");
      }
    } catch (err) {
      toast.error("Failed to generate AI comment.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="comments-container">
      <div className="comments-title-wrapper">
        <div className="comments-title-row">
          <h3 className="comments-title">
            💬 Comments {flatComments.length > 0 && `(${flatComments.length})`}
          </h3>
          {isLoggedIn && (
            <button
              className="inline-ai-assistant-btn"
              onClick={() => setShowAssistant((prev) => !prev)}
            >
              🤖 AI Assistant
            </button>
          )}
        </div>

        {showAssistant && (
          <div className="inline-ai-assistant-popup">
            <AICommentAssistant
              reportId={reportId}
              onAdopt={(text) => {
                setNewComment(text);
                setIsAI(true); // ✅ 标记为 AI
                setShowAssistant(false);
              }}
              onClose={() => setShowAssistant(false)}
            />
          </div>
        )}
      </div>

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
              onChange={(e) => {
                setNewComment(e.target.value);
                setIsAI(false);
              }}
              rows={2}
            />
            {isAI && <span className="ai-label">💡 AI-generated</span>}

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
            {/* <button
              type="button"
              className="comment-generate"
              onClick={() => setShowAssistant(true)}
            >
              💬 Open AI Assistant
            </button> */}
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
