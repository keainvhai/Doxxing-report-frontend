import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReportList from "../components/ReportList";
import "../styles/SummariesDetails.css";
import { Helmet } from "react-helmet";

const SummariesDetails = () => {
  const { week_start } = useParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formattedDate = new Date(week_start).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const summaryTitle = `Weekly Doxxing Summary - Week of ${formattedDate}`;
  const summaryDescription = `A total of ${reports.length} doxxing reports were submitted this week. Explore the incidents and keywords involved.`;
  const summaryUrl = `${
    import.meta.env.VITE_CLIENT_URL
  }/summaries/${week_start}`;
  const summaryImage = `${import.meta.env.VITE_CLIENT_URL}/preview.png`; // 自定义图

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/summaries/reports/${week_start}`,
          {
            withCredentials: true, // ✅ 如果后端有 JWT / Cookie 认证 ➜ 建议加上
          }
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
    <>
      <Helmet>
        <title>{summaryTitle}</title>
        <meta property="og:title" content={summaryTitle} />
        <meta property="og:description" content={summaryDescription} />
        <meta property="og:url" content={summaryUrl} />
        <meta property="og:image" content={summaryImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="digest-details-container">
        <h2>
          {" "}
          Reports for Week: {new Date(week_start).toLocaleDateString()}
          {/* <p>{reports.length}</p> */}
        </h2>
        <p>Total reports: {reports.length}</p>
        <ReportList reports={reports} />
      </div>{" "}
    </>
  );
};

export default SummariesDetails;
