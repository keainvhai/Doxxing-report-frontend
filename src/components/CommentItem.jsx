import React from "react";
import ReplyForm from "./ReplyForm";
import { useNavigate } from "react-router-dom";
import "../styles/CommentsSection.css";

const FlatReplies = ({ replies = [], reportId, fetchComments }) => {
  const navigate = useNavigate();

  // 展平所有子评论（递归）
  const flat = [];
  const dfs = (node) => {
    flat.push(node);
    if (node.replies?.length > 0) {
      node.replies.forEach(dfs);
    }
  };
  replies.forEach(dfs);

  return (
    <div className="flat-replies">
      {flat.map((reply) => (
        <div key={reply.id} className="reply-flat">
          <p className="comment-content">
            {reply.parent?.user?.username && (
              <span
                className="mention username-link"
                onClick={() => navigate(`/user/${reply.parent.user.id}`)}
              >
                @{reply.parent.user.username}{" "}
              </span>
            )}
            {reply.content}
          </p>
          {reply.is_ai_generated && (
            <span className="ai-tag">💡 AI-generated</span>
          )}
          <div className="comment-meta">
            <span
              className="username-link"
              onClick={() => navigate(`/user/${reply.user?.id}`)}
            >
              {reply.user?.username ?? "Anonymous"}
            </span>

            <span style={{ marginRight: "1rem" }}>
              {new Date(reply.createdAt).toLocaleString()}
            </span>
          </div>
          <ReplyForm
            reportId={reportId}
            parentId={reply.id}
            onReplySuccess={fetchComments}
          />
        </div>
      ))}
    </div>
  );
};

const CommentItem = ({ comment, reportId, fetchComments }) => {
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

      <ReplyForm
        reportId={reportId}
        parentId={comment.id}
        onReplySuccess={fetchComments}
      />

      {comment.replies?.length > 0 && (
        <FlatReplies
          replies={comment.replies}
          reportId={reportId}
          fetchComments={fetchComments}
        />
      )}
    </li>
  );
};

export default CommentItem;
