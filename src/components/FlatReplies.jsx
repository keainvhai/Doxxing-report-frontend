import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CommentsSection.css";

const FlatReplies = ({ replies = [], reportId, fetchComments, setReplyTo }) => {
  const navigate = useNavigate();
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
          {reply.is_ai_generated && (
            <span className="ai-tag">💡 AI-generated</span>
          )}
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
          <button className="reply-btn" onClick={() => setReplyTo(reply.id)}>
            Reply
          </button>
        </div>
      ))}
    </div>
  );
};

export default FlatReplies;
