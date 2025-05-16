import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchReportById } from "../api"; // 获取单个 Report
import "../styles/ReportDetails.css";
import ToolsTable from "../components/ToolsTable";
import CommentsSection from "../components/CommentsSection";
import { Helmet } from "react-helmet";

const API_URL = import.meta.env.VITE_API_URL;

const IncidentStatsCard = ({ incident }) => {
  const navigate = useNavigate();

  return (
    <div className="incident-stats-card">
      <h3>Incident Status</h3>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>Incident ID</strong>
            </td>
            <td>{incident.id || "N/A"}</td>
          </tr>
          <tr>
            <td>
              <strong>Report Count</strong>
            </td>
            <td>{incident.report_count ?? 1}</td>
          </tr>
          <tr>
            <td>
              <strong>Date Published</strong>
            </td>
            <td>
              {incident.date
                ? new Date(incident.date).toLocaleDateString()
                : "Unknown"}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Submitter</strong>
            </td>
            <td>
              {incident.userId ? (
                <span
                  className="username-link"
                  onClick={() => navigate(`/user/${incident.userId}`)}
                >
                  {incident.editors || "Anonymous"}
                </span>
              ) : (
                <span className="username-label">
                  {incident.editors || "Bot"}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ReportDetails = () => {
  const { id } = useParams(); // 获取 URL 参数中的 report id
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const commentRef = useRef(null); // 创建 ref

  const location = useLocation();
  useEffect(() => {
    const page = location.state?.fromPage;
    if (page) {
      localStorage.setItem("returnSearchPage", page);
    }
  }, []);

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

  // ✅ 添加这一段：定义 title, description, url, image 给 <Helmet> 用
  const title = report.title || "Doxxing Incident Report";
  const description =
    report.text?.slice(0, 160) || "Detailed report on online abuse or doxxing.";
  const url = `${window.location.origin}/report/${report.id}`;
  const image =
    (report.images && JSON.parse(report.images)?.[0]) ||
    "https://doxxing-report.vercel.app/default-cover.jpg";

  return (
    <div className="report-details">
      {/* ✅ 添加用于 Facebook/LinkedIn/SEO 分享的 meta 标签 */}
      {report && (
        <Helmet>
          <title>{report.title}</title>
          <meta
            name="description"
            content={
              report.text?.slice(0, 160) ||
              "Detailed report on online abuse or doxxing."
            }
          />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={report.title} />
          <meta
            property="og:description"
            content={report.text?.slice(0, 160) || ""}
          />
          <meta
            property="og:url"
            content={`${window.location.origin}/report/${report.id}`}
          />
          <meta
            property="og:image"
            content={
              (report.images && JSON.parse(report.images)?.[0]) ||
              "https://doxxing-report.vercel.app/default-cover.jpg"
            }
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={report.title} />
          <meta
            name="twitter:description"
            content={report.text?.slice(0, 160) || ""}
          />
          <meta
            name="twitter:image"
            content={
              (report.images && JSON.parse(report.images)?.[0]) ||
              "https://doxxing-report.vercel.app/default-cover.jpg"
            }
          />
        </Helmet>
      )}

      <h2>{report.title}</h2>
      <ToolsTable
        report={report}
        onJumpToComments={() =>
          // commentRef.current?.scrollIntoView({ behavior: "smooth" })
          {
            const el = document.getElementById("comments-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }
      />
      {/* ✅ Incident Stats Card */}
      <IncidentStatsCard
        incident={{
          id: report.id,
          report_count: report.count,
          date: report.date_published,
          editors: report.author,
          userId: report.userId,
        }}
      />
      {/* ✅ 报告基本信息 */}
      {/* <p>
        <strong>Author:</strong> {report.author || "Anonymous"}
      </p> */}
      {/* <p>
        <strong>Submitted by:</strong> {report.submitter || "Unknown"}
      </p> */}
      <p>
        <strong>Victim:</strong> {report.victim || "Unknown"}{" "}
        {/* ✅ 显示 Victim */}
      </p>
      <p>
        <strong>Entity:</strong> {report.entity || "Unknown"}{" "}
        {/* ✅ 显示 Entity */}
      </p>
      {/* <p>
        <strong>Date Published:</strong>{" "}
        {new Date(report.date_published).toLocaleDateString()}
      </p> */}
      <p>
        <strong>Created Time:</strong>{" "}
        {new Date(report.createdAt).toLocaleString()}
      </p>

      {report.incident_date && (
        <p>
          <strong>Incident Date:</strong>{" "}
          {new Date(report.incident_date).toLocaleDateString()}
        </p>
      )}
      {/* <p>
        <strong>Source:</strong> {report.url}
      </p> */}
      {/* ✅ 报告描述 */}
      {report.text && (
        <p>
          <strong>Description:</strong> {report.text}
        </p>
      )}
      {/* <p>{report.text}</p> */}
      {/* ✅ 图片显示 */}
      {report.images && JSON.parse(report.images).length > 0 && (
        <div className="report-images">
          {JSON.parse(report.images).map((image, index) => (
            <img
              key={index}
              // src={`http://localhost:3001${JSON.parse(report.images)[0]}`}
              // src={`${API_URL}${image}`}
              src={`${JSON.parse(report.images)[0]}`}
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

      {/* ref 默认只能加在原生 HTML 元素（如 div、input、button） */}
      <div ref={commentRef}>
        <CommentsSection reportId={report.id} />
      </div>
    </div>
  );
};

export default ReportDetails;
