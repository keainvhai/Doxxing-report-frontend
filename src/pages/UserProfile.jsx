import React, { useState, useEffect } from "react";
import { fetchUserProfile, updateUsername, fetchUserComments } from "../api";
import { useNavigate } from "react-router-dom";
import ReportList from "../components/ReportList";
import UserCommentList from "../components/UserCommentList";
import "../styles/UserProfile.css";
import { getLevelTitle } from "../utils/levels";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);

  const [comments, setComments] = useState([]);

  // ✅ 添加username错误提示状态
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetchUserProfile();
        // console.log("📌 API Response:", response.data);

        if (profileRes.data.success) {
          setUser(profileRes.data.user);
          setUsername(profileRes.data.user.username || ""); // 预填充 username
        } else {
          navigate("/login");
        }

        // 👇 加载评论数据
        const commentRes = await fetchUserComments();
        console.log("📌 Comments API Response:", commentRes.data);
        if (commentRes.data.success) {
          setComments(commentRes.data.comments);
        }
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const handleUsernameUpdate = async () => {
    try {
      const response = await updateUsername(username);
      if (response.data.success) {
        setUser((prevUser) => ({ ...prevUser, username }));
        setEditing(false);
        setErrorMessage(""); // ✅ 清除错误信息
      } else {
        setErrorMessage(response.data.error || "Username update failed");
      }
    } catch (error) {
      setErrorMessage("Username already taken. Please choose another.");
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      {/* ✅ 错误提示显示 */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {user ? (
        <div className="profile-content">
          <p className="profile-email">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="profile-username">
            <strong>Username:</strong>{" "}
            {editing ? (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            ) : (
              username
            )}
            <button
              className={editing ? "save-btn" : "edituser-btn"}
              onClick={() =>
                editing ? handleUsernameUpdate() : setEditing(true)
              }
            >
              {editing ? "Save" : "Edit"}
            </button>
          </p>

          <p className="profile-level">
            🌟 {user.points ?? 0} pts · Level {user.level ?? 1}:{" "}
            <span className="level-title">{getLevelTitle(user.level)}</span>
          </p>

          <h3 className="reports-title">My Reports</h3>

          {user.reports.length > 0 ? (
            <div className="card-container">
              {user.reports.map((report) => (
                <div className="report-card" key={report.id}>
                  <ReportList reports={[report]} />
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/report/user/update/${report.id}`)}
                  >
                    Edit
                  </button>
                  {/* <p className="edit-btn">{report.status}</p> */}
                  <p className="report-status">
                    <strong>Status:</strong> {report.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No reports submitted yet.</p>
          )}
        </div>
      ) : (
        <p>Loading user info...</p>
      )}

      {/* <h3 className="comments-title">My Comments</h3>
      {comments.length > 0 ? (
        <ul className="comment-history">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <p className="comment-content">💬 {comment.content}</p>
              <small>
                On Report ID:{" "}
                <span
                  className="comment-link"
                  onClick={() => navigate(`/report/${comment.reportId}`)}
                >
                  {comment.reportId}
                </span>{" "}
                — {new Date(comment.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )} */}
      <UserCommentList
        isPublic={false}
        data={{
          rows: comments,
          count: comments.length,
          page: 1,
          pageSize: comments.length || 10,
        }} // 私有页暂时不分页，所以不传 onPageChange（组件内部会仅在 isPublic 时显示分页）
      />
    </div>
  );
};

export default UserProfile;
