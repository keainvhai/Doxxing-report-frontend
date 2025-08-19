// components/UserCommentList.jsx

import "../styles/UserCommentList.css";
import { useNavigate } from "react-router-dom";

export default function UserCommentList({ data, onPageChange, isPublic }) {
  const navigate = useNavigate();

  const {
    rows = [],
    count = rows.length,
    page = 1,
    pageSize = rows.length || 10,
  } = data || {};

  return (
    <div>
      {rows.length ? (
        <ul className="user-comment-list">
          {rows.map((c) => (
            <li key={c.id} className="user-comment-item">
              <div className="comment-meta">
                {isPublic ? (
                  <button
                    className="link"
                    onClick={() =>
                      navigate(`/report/${c.report?.id ?? c.reportId}`)
                    }
                  >
                    {c.report?.title || `Report #${c.reportId}`}
                  </button>
                ) : (
                  <span
                    className="link"
                    onClick={() => navigate(`/report/${c.reportId}`)}
                  >
                    Report #{c.reportId}
                  </span>
                )}
                {/* <span className="dot">•</span> */}
                <span className="time">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                {c.is_ai_generated && <span className="ai-badge">AI</span>}
              </div>
              <div className="comment-content">💬 {c.content}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {isPublic && count > pageSize && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            Prev
          </button>
          <span>
            {page} / {Math.ceil(count / pageSize)}
          </span>
          <button
            disabled={page === Math.ceil(count / pageSize)}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
