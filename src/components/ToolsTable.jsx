import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FilePlus,
  MessageSquarePlus,
  Search,
  Book,
  History,
} from "lucide-react"; // 导入图标
import "../styles/ToolsTable.css";

const ToolsTable = ({ report }) => {
  const navigate = useNavigate();

  const [showCitations, setShowCitations] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const generateCitation = () => {
    if (!report) return "";
    const year = new Date(report.date_published).getFullYear();
    return `Shan, G., Riedl, C., Fei, X. (${year}). ${report.title}. Doxing Incident Database, Report ${report.id}.`;
  };

  const handleCopy = () => {
    const citation = generateCitation();
    navigator.clipboard.writeText(citation).then(() => {
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    });
  };

  return (
    <div className="tools-table">
      <h3>Tools</h3>
      <div className="tools-buttons">
        <button className="tool-button">
          <Bell size={18} /> Notify Me of Updates
        </button>
        <button className="tool-button" onClick={() => navigate("/submit")}>
          <FilePlus size={18} /> New Report
        </button>
        <button className="tool-button">
          <MessageSquarePlus size={18} /> New Response
        </button>
        <button className="tool-button" onClick={() => navigate("/search")}>
          <Search size={18} /> Discover
        </button>
        <div
          className="tool-button citation-container"
          onMouseEnter={() => setShowCitations(true)}
          onMouseLeave={() => setShowCitations(false)}
          onClick={handleCopy}
        >
          <Book size={18} /> Citation Info
          {showCitations && (
            <div className="citation-tooltip">{generateCitation()}</div>
          )}
          {copySuccess && <span className="copy-success">{copySuccess}</span>}
        </div>
        {/* <button className="tool-button">
          <History size={18} /> View History
        </button> */}
      </div>
    </div>
  );
};

export default ToolsTable;
