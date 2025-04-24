import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Summaries.css"; // 需要创建 CSS 样式
import {
  FaXTwitter,
  FaLinkedin,
  FaEnvelope,
  FaFacebook,
} from "react-icons/fa6"; // FontAwesome 6

const Summaries = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/summaries/all`, // ✅ 动态 URL
          {
            withCredentials: true, // ✅ 如果后端有 Cookie 认证，推荐加
          }
        );
        setSummaries(data);
      } catch (err) {
        console.error("❌ Error fetching summaries:", err);
        setError("Failed to load AI summaries.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="digest-container">
      <h2>📊 Weekly Summary</h2>
      {summaries.length === 0 ? (
        <p>No summaries available.</p>
      ) : (
        summaries.map((summary, index) => {
          const shareURL = `${window.location.origin}/summaries/${summary.week_start}`;

          return (
            <div key={index} className="digest-card">
              {/* ✅ 点击标题跳转到 DigestDetails 页面 */}
              <div className="digest-header">
                <h3>
                  <Link
                    to={`/summaries/${summary.week_start}`}
                    className="digest-link"
                  >
                    {/* Week: {new Date(summary.week_start).toLocaleDateString()} -{" "}
                {new Date(summary.week_end).toLocaleDateString()} */}
                    Week of:{" "}
                    {new Date(summary.week_start).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                    })}
                  </Link>
                </h3>
                <div className="share-icons">
                  <FaXTwitter
                    className="share-icon"
                    title="Share on X"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          shareURL
                        )}&text=${encodeURIComponent(
                          "Check out this weekly doxxing summary!"
                        )}`,
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
                          "Weekly Doxxing Summary"
                        )}&body=${encodeURIComponent(shareURL)}`
                      )
                    }
                  />
                </div>
              </div>

              <p>
                <strong>Summary:</strong> {summary.summary_text}
              </p>

              {/* ✅ 关键词变成小格子 */}
              <div className="keywords-container">
                {summary.keywords
                  ? JSON.parse(summary.keywords).map((keyword, i) => (
                      <span key={i} className="keyword-badge">
                        {keyword}
                      </span>
                    ))
                  : "N/A"}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Summaries;
