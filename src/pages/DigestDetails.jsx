import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReportList from "../components/ReportList";
import "../styles/DigestDetails.css";

const DigestDetails = () => {
  const { week_start } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/digest/reports/${week_start}`
        );
        setReports(data);
      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [week_start]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="digest-details-container">
      <h2>📋 Reports for Week: {new Date(week_start).toLocaleDateString()}</h2>
      <ReportList reports={reports} /> {/* ✅ 复用 ReportList 组件 */}
    </div>
  );
};

export default DigestDetails;
