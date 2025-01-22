import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ReportCard.css"; // ✅ 样式文件

const ReportCard = ({ report }) => {
  const navigate = useNavigate(); // ✅ 处理页面跳转

  const handleViewDetails = () => {
    navigate(`/report/${report.id}`); // ✅ 跳转到 /report/:id
  };

  return (
    <div className="report-card">
      {/* ✅ 显示封面图片（如果存在） */}
      {report.images && JSON.parse(report.images).length > 0 && (
        <img
          src={`http://localhost:3001${JSON.parse(report.images)[0]}`}
          alt={report.title}
          className="report-image"
        />
      )}

      {/* ✅ 报告内容 */}
      <div className="report-content">
        <h3>{report.title}</h3>
        <p>Author: {report.author || "Anonymous"}</p>
        {/* <p>
          <strong>Submitted by:</strong> {report.submitter || "Unknown"}
        </p> */}
        <p>
          Date Published: {new Date(report.date_published).toLocaleDateString()}
        </p>
        <p className="report-text">{report.text.slice(0, 150)}...</p>{" "}
        {/* ✅ 显示前 150 字内容 */}
        {/* ✅ Show Details 按钮 */}
        <div className="button-group">
          <button className="open-source-btn">
            <a href={report.url} target="_blank" rel="noopener noreferrer">
              Open Source
            </a>
          </button>
          <button className="view-btn" onClick={handleViewDetails}>
            View Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
