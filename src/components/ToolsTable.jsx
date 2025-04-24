import { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FilePlus,
  MessageSquarePlus,
  Search,
  Book,
  History,
} from "lucide-react"; // 导入图标
import {
  FaXTwitter,
  FaLinkedin,
  FaEnvelope,
  FaFacebook,
} from "react-icons/fa6"; // FontAwesome 6
import "../styles/ToolsTable.css";

// Modal 必须设定根节点
Modal.setAppElement("#root");

const ToolsTable = ({ report, onJumpToComments }) => {
  const navigate = useNavigate();

  const [showCitations, setShowCitations] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // history modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const shareURL = `${window.location.origin}/report/${report.id}`;

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

  const handleViewHistory = async () => {
    setIsModalOpen(true);
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/${report.id}/history`
      );
      setHistoryData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        <button className="tool-button" onClick={onJumpToComments}>
          <MessageSquarePlus size={18} /> New Response
        </button>
        {/* <button className="tool-button" onClick={() => navigate("/search")}>
          <Search size={18} /> Discover
        </button> */}

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
        <button className="tool-button" onClick={handleViewHistory}>
          <History size={18} /> View History
        </button>
      </div>
      <div className="share-icons">
        <FaXTwitter
          className="share-icon"
          title="Share on X"
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareURL
              )}&text=${encodeURIComponent(report.title)}`,
              "_blank"
            )
          }
        />
        <FaLinkedin
          className="share-icon"
          title="Share on LinkedIn"
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareURL
              )}`,
              "_blank"
            )
          }
        />

        <FaFacebook
          className="share-icon"
          title="Share on Facebook"
          onClick={() =>
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareURL
              )}`,
              "_blank"
            )
          }
        />
        <FaEnvelope
          className="share-icon"
          title="Share via Email"
          onClick={() =>
            window.open(
              `mailto:?subject=${encodeURIComponent(
                "Check this Doxxing Incident"
              )}&body=${encodeURIComponent(shareURL)}`
            )
          }
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="History Modal"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>📜 Submission History</h2>
        <button onClick={closeModal} style={{ float: "right" }}>
          ❌
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : historyData.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <ul>
            {historyData.map((entry, idx) => (
              <li key={idx} style={{ marginBottom: "10px" }}>
                👤 {entry.author || entry.user?.username || "Anonymous"}{" "}
                {/* <br /> */}
                🕒{new Date(entry.submittedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

export default ToolsTable;
