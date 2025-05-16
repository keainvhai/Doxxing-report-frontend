import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
import "react-toastify/dist/ReactToastify.css";

// Modal 必须设定根节点
Modal.setAppElement("#root");

const ToolsTable = ({ report, onJumpToComments }) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [showCitations, setShowCitations] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  // history modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const shareURL = `${window.location.origin}/report/${report.id}`;

  const [subscribed, setSubscribed] = useState(false);

  const token = localStorage.getItem("token");

  const checkSubscription = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/subscriptions/${report.id}/check`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubscribed(res.data.subscribed);
    } catch (err) {
      console.error("❌ Failed to check subscription:", err);
    }
  };
  useEffect(() => {
    if (!token) return;
    // console.log("📌 useEffect triggered for report.id:", report?.id);
    checkSubscription();
  }, [report.id]);

  // const handleSubscribe = async () => {
  //   try {
  //     const res = await axios.post(
  //       `${API_URL}/subscriptions/${report.id}`,
  //       {},
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (res.data.message === "Subscribed") {
  //       toast.success("Subscribed successfully! You will receive updates.");
  //       setSubscribed(true);
  //     } else if (res.data.message === "Unsubscribed") {
  //       toast.info("Unsubscribed from updates.");
  //       setSubscribed(false);
  //     }
  //   } catch (err) {
  //     console.error("❌ Subscription error:", err);
  //     toast.error("Subscription failed.");
  //   }
  // };

  const handleSubscribe = async () => {
    try {
      if (!token) {
        toast.warn(" Please log in to subscribe to updates.");
        return;
      }

      const res = await axios.post(
        `${API_URL}/subscriptions/${report.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.message === "Subscribed") {
        toast.success("Subscribed successfully! You will receive updates.");
        setSubscribed(true);
      } else if (res.data.message === "Unsubscribed") {
        toast.info("Unsubscribed from updates.");
        setSubscribed(false);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Subscription failed. Please try again later.");
    }
  };

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
      console.log("📜 Loaded history data:", res.data);
      console.log("🧪 Trying to load history for report id:", report.id);
      console.log("🧾 Full report object:", report);

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
        <button className="tool-button" onClick={handleSubscribe}>
          <Bell size={18} />
          {subscribed ? "Unsubscribe" : "Notify Me of Updates"}
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
                report.title
              )}&body=${encodeURIComponent(
                `Check out this report: ${window.location.origin}/report/${report.id}`
              )}`
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
                {/* 👤 {entry.author || entry.user?.username || "Anonymous"}{" "}
                🕒{new Date(entry.submittedAt).toLocaleString()} */}
                {entry.author === "Bot" ? (
                  <>
                    🤖 <strong>Bot</strong>
                  </>
                ) : (
                  <>👤 {entry.author || entry.user?.username || "Anonymous"}</>
                )}{" "}
                🕒 {new Date(entry.submittedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
};

export default ToolsTable;
