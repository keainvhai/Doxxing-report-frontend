import React from "react";
import ReportCard from "./ReportCard";
import "../styles/ReportList.css"; // ✅ 引入样式

const ReportList = ({ reports }) => {
  console.log("📌 Reports received by ReportList:", reports); // ✅ Debug: 确保收到数据

  return (
    <div className="report-list">
      <div className="report-grid">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};

export default ReportList;
