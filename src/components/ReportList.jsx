import React from "react";
import ReportCard from "./ReportCard";
import "../styles/ReportList.css"; // ✅ 引入样式

const ReportList = ({ reports }) => {
  // console.log("📌 Reports received by ReportList:", reports);

  // 保障 reports 一定是数组
  const validReports = Array.isArray(reports) ? reports : [];

  return (
    <div className="report-list">
      <div className="report-grid">
        {validReports.length > 0 ? (
          validReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <p className="no-results">No reports found.</p>
        )}
      </div>
    </div>
  );
};

export default ReportList;
