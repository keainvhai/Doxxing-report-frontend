import React from "react";
import { useNavigate } from "react-router-dom";
import FlatReplies from "./FlatReplies";
import "../styles/CommentsSection.css";

const CommentItem = ({ comment, reportId, fetchComments, setReplyTo }) => {
  const navigate = useNavigate();

  return (
    <li className="comment-item">
      {comment.is_ai_generated && (
        <span className="ai-tag">💡 AI-generated</span> // ✅ 新增：显示 AI 标记
      )}
      <p className="comment-content">{comment.content}</p>
      <div className="comment-meta">
        <span
          className="username-link"
          onClick={() => navigate(`/user/${comment.user.id}`)}
        >
          {comment.user?.username ?? "Anonymous"}
        </span>

        <span style={{ marginRight: "1rem" }}>
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      {/* <ReplyForm
        reportId={reportId}
        parentId={comment.id}
        onReplySuccess={fetchComments}
      /> */}
      <button className="reply-btn" onClick={() => setReplyTo(comment.id)}>
        Reply
      </button>

      {comment.replies?.length > 0 && (
        <FlatReplies
          replies={comment.replies}
          reportId={reportId}
          fetchComments={fetchComments}
          setReplyTo={setReplyTo}
        />
      )}
    </li>
  );
};

export default CommentItem;
