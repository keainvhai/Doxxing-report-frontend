import React, { useState, useEffect } from "react";
import { FaFileCsv } from "react-icons/fa";
import "../styles/Data.css";

const Data = () => {
  const [totalReports, setTotalReports] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reports/stats`)
      .then((res) => res.json())
      .then((data) => {
        setTotalReports(data.totalReports);
        setLastUpdate(data.lastUpdate);
      })
      .catch((err) => console.error("❌ Error fetching stats:", err));
  }, []);

  const handleDownloadCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL}/reports/download/reports-csv`);
  };

  return (
    <div className="data-container">
      <h1 className="data-title">📊 Doxxing Report Data</h1>

      <p className="data-description">
        If you download and use this data, please cite our paper.
      </p>

      <div className="data-info">
        <p>
          Total Reports: <span>{totalReports}</span>
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
