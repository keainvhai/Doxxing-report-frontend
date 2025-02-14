import React, { useState, useEffect } from "react";
import { fetchUserProfile, updateUsername } from "../api";
import { useNavigate } from "react-router-dom";
import ReportList from "../components/ReportList";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  // ✅ 添加username错误提示状态
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchUserProfile();
        // console.log("📌 API Response:", response.data);

        if (response.data.success) {
          setUser(response.data.user);
          setUsername(response.data.user.username || ""); // 预填充 username
        } else {
          navigate("/login");
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
    </div>
  );
};

export default UserProfile;
