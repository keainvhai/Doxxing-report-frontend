import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchReportById } from "../api"; // ✅ 创建一个 API 来获取单个 Report
import "../styles/ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams(); // 获取 URL 参数中的 report id
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getReport = async () => {
      try {
        const { data } = await fetchReportById(id);
        setReport(data);
      } catch (err) {
        console.error("❌ Error fetching report:", err);
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!report) return <p>No report found.</p>;

  return (
    <div className="report-details">
      <h2>{report.title}</h2>
      {/* ✅ 报告基本信息 */}
      <p>
        <strong>Author:</strong> {report.author || "Anonymous"}
      </p>
      <p>
        <strong>Submitted by:</strong> {report.submitter || "Unknown"}
      </p>
      <p>
        <strong>Date Published:</strong>{" "}
        {new Date(report.date_published).toLocaleDateString()}
      </p>
      <p>
        <strong>Date Downloaded:</strong>{" "}
        {new Date(report.date_downloaded).toLocaleDateString()}
      </p>
      {report.incident_date && (
        <p>
          <strong>Incident Date:</strong>{" "}
          {new Date(report.incident_date).toLocaleDateString()}
        </p>
      )}

      {/* ✅ 报告描述 */}
      <p>{report.text}</p>

      {/* ✅ 图片显示 */}
      {report.images && JSON.parse(report.images).length > 0 && (
        <div className="report-images">
          {JSON.parse(report.images).map((image, index) => (
            <img
              key={index}
              src={`http://localhost:3001${image}`}
              alt={`Report ${index + 1}`}
              className="report-detail-image"
            />
          ))}
        </div>
      )}

      {/* ✅ 原始链接 */}
      <a
        href={report.url}
        target="_blank"
        rel="noopener noreferrer"
        className="source-link"
      >
        🔗 View Original Source
      </a>
    </div>
  );
};

export default ReportDetails;
