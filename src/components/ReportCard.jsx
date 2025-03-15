import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ReportCard.css"; // ✅ 样式文件
import "../styles/ReportList.css"; // ✅ 引入样式

const ReportCard = ({ report }) => {
  const navigate = useNavigate(); // ✅ 处理页面跳转

  const handleViewDetails = () => {
    navigate(`/report/${report.id}`); // ✅ 跳转到 /report/:id
  };

  // ✅ 解析 images，避免 JSON.parse(null) 报错
  let images = [];
  try {
    images = report.images ? JSON.parse(report.images) : [];
  } catch (error) {
    console.error("Error parsing images:", error);
  }

  // ✅ 确保 text 不是 null
  const textPreview = report.text
    ? report.text.slice(0, 150)
    : "No description available.";

  return (
    <div className="report-card">
      {/* ✅ 显示封面图片（如果存在） */}
      {report.images && JSON.parse(report.images).length > 0 && (
        <img
          // src={JSON.parse(report.images)[0]}
          src={JSON.parse(report.images)[0]}
          // src={`http://localhost:3001${JSON.parse(report.images)[0]}`}
          // src={
          //   Array.isArray(report.images)
          //     ? report.images[0]
          //     : JSON.parse(report.images)[0]
          // }
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
        <p className="report-text">{textPreview}...</p>{" "}
        {/* ✅ 显示前 150 字内容 */}
        {/* ✅ 显示前 150 字内容 */}
        {/* ✅ Show Details 按钮 */}
        <div className="button-group">
          <button className="oppen-source-btn">
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
