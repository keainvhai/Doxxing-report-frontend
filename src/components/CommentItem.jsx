import React from "react";
import ReplyForm from "./ReplyForm";
import "../styles/CommentsSection.css";

const renderFlatReplies = (replies = [], reportId, fetchComments) => {
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
              <span className="mention">@{reply.parent.user.username} </span>
            )}
            {reply.content}
          </p>
          <div className="comment-meta">
            <span>{reply.user?.username ?? "Anonymous"}</span>
            <span>{new Date(reply.createdAt).toLocaleString()}</span>
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
  return (
    <li className="comment-item">
      <p className="comment-content">{comment.content}</p>
      <div className="comment-meta">
        <span>{comment.user?.username ?? "Anonymous"}</span>
        <span>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>

      <ReplyForm
        reportId={reportId}
        parentId={comment.id}
        onReplySuccess={fetchComments}
      />

      {comment.replies?.length > 0 &&
        renderFlatReplies(comment.replies, reportId, fetchComments)}
    </li>
  );
};

export default CommentItem;
