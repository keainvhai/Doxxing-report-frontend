import React from "react";
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

const ToolsTable = () => {
  const navigate = useNavigate();

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
        <button className="tool-button">
          <Book size={18} /> Citation Info
        </button>
        <button className="tool-button">
          <History size={18} /> View History
        </button>
      </div>
    </div>
  );
};

export default ToolsTable;
