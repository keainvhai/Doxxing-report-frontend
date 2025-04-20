import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUserPublicProfile } from "../api";
import ReportList from "../components/ReportList";

const PublicUserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchUserPublicProfile(id);
        if (res.data.success) {
          setUser(res.data.user);
          setReports(res.data.reports);
        } else {
          navigate("/not-found");
        }
      } catch (err) {
        console.error(err);
        navigate("/not-found");
      }
    };

    loadData();
  }, [id]);

  if (!user) return <p>Loading user profile...</p>;

  return (
    <div className="public-user-profile">
      <h2>User: {user.username || "Anonymous"}</h2>
      <p>Email: {user.email || "N/A"}</p>
      <h3>Submitted Reports</h3>
      <ReportList reports={reports} />
    </div>
  );
};

export default PublicUserProfile;
