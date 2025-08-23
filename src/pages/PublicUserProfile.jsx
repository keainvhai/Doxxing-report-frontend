import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserPublicProfile } from "../api";
import ReportList from "../components/ReportList";
import UserCommentList from "../components/UserCommentList";
import "../styles/PublicUserProfile.css";
import { getLevelTitle } from "../utils/levels";

const PublicUserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState({
    rows: [],
    count: 0,
    page: 1,
    pageSize: 10,
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // const res = await fetchUserPublicProfile(id);
        const res = await fetchUserPublicProfile(id, {
          commentsPage: page,
          pageSize,
        });
        if (res.data.success) {
          setUser(res.data.user);
          setReports(res.data.reports);
          if (res.data.comments) setComments(res.data.comments);
        } else {
          navigate("/not-found");
        }
      } catch (err) {
        console.error(err);
        navigate("/not-found");
      }
    };

    loadData();
  }, [id, page]);

  if (!user) return <p>Loading user profile...</p>;

  return (
    <div className="public-user-profile">
      <h2>User: {user.username || "Anonymous"}</h2>
      {/* 🌟 积分与等级徽章 */}
      {(typeof user.points === "number" || typeof user.level === "number") && (
        <p className="public-badge">
          🌟 {user.points ?? 0} pts · Level {user.level ?? 1}:{" "}
          <span className="level-title">{getLevelTitle(user.level ?? 1)}</span>
        </p>
      )}

      {/* 📝 用户简介 */}
      {user.description && <p className="public-desc">{user.description}</p>}
      {/* <p>Email: {user.email || "N/A"}</p> */}

      <h3>Submitted Reports</h3>
      <ReportList reports={reports} />

      <h3 style={{ marginTop: 24 }}>Comments</h3>
      <UserCommentList
        data={comments}
        isPublic={true}
        onPageChange={(next) => setPage(next)} // 复用你已有的 page state
      />
    </div>
  );
};

export default PublicUserProfile;
