import React, { useState, useEffect } from "react";
import { FaFileCsv } from "react-icons/fa";
import "../styles/Data.css";

const Data = () => {
  const [totalReports, setTotalReports] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const citationText = `Shan, G., Riedl, C., & Fei, X. (2025). Preventing Real-world Doxing by Cataloging Incidents: A Doxing Incident Database. Available at SSRN 5196388.`;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reports/stats`)
      .then((res) => res.json())
      .then((data) => {
        setTotalReports(data.totalReports);
        setTotalCount(data.totalCount);
        setLastUpdate(data.lastUpdate);
      })
      .catch((err) => console.error("❌ Error fetching stats:", err));
  }, []);

  const handleDownloadCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL}/reports/download/reports-csv`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="data-container">
      <h1 className="data-title">📊 Doxxing Report Data</h1>

      <p className="data-description">
        If you download and use this data, please cite our paper.
      </p>

      {/* ✅ 复制按钮 + citation 弹窗容器 */}
      <div className="cite-copy-container">
        <div className="copy-wrapper">
          {/* ✅ 浮动引用内容，仅在 hover 时显示 */}
          <div className="citation-popup">
            Shan, G., Riedl, C., & Fei, X. (2025).{" "}
            <em>
              Preventing Real-world Doxing by Cataloging Incidents: A Doxing
              Incident Database.
            </em>{" "}
            <em>Available at SSRN 5196388.</em>
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "✅ Copied!" : "Copy Citation"}
          </button>
        </div>
      </div>

      <div className="data-info">
        <p>
          Total Reports: <span>{totalReports}</span>
        </p>
        <p>
          Total Submissions: <span>{totalCount}</span>
        </p>

        <p>
          Last Updated: <span>{lastUpdate}</span>
        </p>
      </div>

      <button onClick={handleDownloadCSV} className="download-btn">
        <FaFileCsv />
        Download All Reports CSV
      </button>
    </div>
  );
};

export default Data;
