import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Summaries.css"; // 需要创建 CSS 样式

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
        summaries.map((summary, index) => (
          <div key={index} className="digest-card">
            {/* ✅ 点击标题跳转到 DigestDetails 页面 */}
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
        ))
      )}
    </div>
  );
};

export default Summaries;
