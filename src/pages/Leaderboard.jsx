import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const navigate = useNavigate();

  // 过滤掉 "Unknown" 和 "Online"
  const excludeUnknownOnline = (list, key) =>
    list.filter(
      (entry) =>
        entry[key] &&
        entry[key] !== "Unknown" &&
        entry[key] !== "Online" &&
        entry[key] !== "null" &&
        entry[key] !== "social media" &&
        entry[key] !== "Google News"
    );

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/leaderboard`,
          {
            withCredentials: true, // ✅ 如果后端有 JWT 鉴权
          }
        );
        setLeaderboardData(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  if (!leaderboardData || Object.keys(leaderboardData).length === 0)
    return <p>Loading leaderboard...</p>;

  // 点击后跳转 Search 页，并传递 query 参数
  // encodeURIComponent 防止有特殊字符
  // const handleAuthorClick = (authorName) => {
  //   navigate(`/search?author=${encodeURIComponent(authorName)}`);
  // };
  const handleAuthorClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleSourceClick = (sourceDomain) => {
    navigate(`/search?source=${encodeURIComponent(sourceDomain)}`);
  };

  // 添加奖牌图标
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  return (
    <div className="leaderboard-container">
      <h1>📊 Submission Leaderboard</h1>

      <div className="leaderboard-grid">
        {/* 新事件贡献榜 */}
        {leaderboardData.lastWeekContributions.length > 0 && (
          <div className="leaderboard-section">
            <h2>🏆 Incidents Contributed Last Week</h2>
            <ul className="leaderboard-list">
              {leaderboardData.lastWeekContributions.map((entry, index) => (
                <li
                  key={index}
                  // onClick={() => handleAuthorClick(entry.author)} // ✅ 加点击
                  onClick={() => {
                    if (entry.userId) handleAuthorClick(entry.userId);
                  }}
                  style={{
                    cursor: entry.userId ? "pointer" : "default",
                    color: entry.userId ? "inherit" : "gray",
                  }}
                  // style={{ cursor: "pointer" }}
                >
                  <span className="rank-badge">
                    <div className="medal-container">
                      <span className="medal">{getMedal(index)}</span>
                    </div>
                    <span className="rank-content">{entry.author}</span>
                  </span>
                  <span className="count-badge">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 现有事件补充榜 */}
        {leaderboardData.existingIncidentReports.length > 0 && (
          <div className="leaderboard-section">
            <div className="tooltip-wrapper">
              <h2>📌 Reports added to Existing Incidents</h2>
              <div className="tooltip-box">
                Submissions that supplement already existing incidents
              </div>
            </div>
            <ul className="leaderboard-list">
              {leaderboardData.existingIncidentReports.map((entry, index) => (
                <li
                  key={index}
                  // onClick={() => handleAuthorClick(entry.author)} // ✅ 加点击
                  // style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (entry.userId) handleAuthorClick(entry.userId);
                  }}
                  style={{
                    cursor: entry.userId ? "pointer" : "default",
                    color: entry.userId ? "inherit" : "gray",
                  }}
                >
                  <span className="rank-badge">
                    <div className="medal-container">
                      <span className="medal">{getMedal(index)}</span>
                    </div>

                    <span className="rank-content">{entry.author}</span>
                  </span>
                  <span className="count-badge">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 总贡献榜 */}
        {leaderboardData.totalContributions.length > 0 && (
          <div className="leaderboard-section">
            <h2>📈 Total Report Contributions</h2>
            <ul className="leaderboard-list">
              {leaderboardData.totalContributions.map((entry, index) => (
                <li
                  key={index}
                  // onClick={() => handleAuthorClick(entry.author)} // ✅ 加点击
                  // style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (entry.userId) handleAuthorClick(entry.userId);
                  }}
                  style={{
                    cursor: entry.userId ? "pointer" : "default",
                    color: entry.userId ? "inherit" : "gray",
                  }}
                >
                  <span className="rank-badge">
                    <div className="medal-container">
                      <span className="medal">{getMedal(index)}</span>
                    </div>
                    <span className="rank-content">{entry.author}</span>
                  </span>
                  <span className="count-badge">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 报告作者排名 */}
        {leaderboardData.reportAuthorship.length > 0 && (
          <div className="leaderboard-section">
            <h2>📝 Report Authorship</h2>
            <ul className="leaderboard-list">
              {leaderboardData.reportAuthorship.map((entry, index) => (
                <li
                  key={index}
                  // onClick={() => handleAuthorClick(entry.author)} // ✅ 加点击
                  // style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (entry.userId) handleAuthorClick(entry.userId);
                  }}
                  style={{
                    cursor: entry.userId ? "pointer" : "default",
                    color: entry.userId ? "inherit" : "gray",
                  }}
                >
                  <span className="rank-badge">
                    <div className="medal-container">
                      <span className="medal">{getMedal(index)}</span>
                    </div>
                    <span className="rank-content">{entry.author}</span>
                  </span>
                  <span className="count-badge">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 报告来源域名 */}
        {leaderboardData.reportDomains.length > 0 && (
          <div className="leaderboard-section">
            <h2>🌐 Report Domains</h2>
            <ul className="leaderboard-list">
              {leaderboardData.reportDomains
                .filter((entry) => !entry.entity.toLowerCase().includes("news"))
                .map((entry, index) => (
                  <li
                    key={index}
                    onClick={() => handleSourceClick(entry.entity)} // ✅ 加点击
                    style={{ cursor: "pointer" }}
                  >
                    <span className="rank-badge">
                      <div className="medal-container">
                        <span className="medal">{getMedal(index)}</span>
                      </div>
                      <span className="rank-content">{entry.entity}</span>
                    </span>
                    <span className="count-badge">{entry.count}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Victim Location 排行榜 */}
        {excludeUnknownOnline(
          leaderboardData.victimLocations,
          "victim_location"
        ).length > 0 && (
          <div className="leaderboard-section">
            <h2>📍 Victim Locations</h2>
            <ul className="leaderboard-list">
              {excludeUnknownOnline(
                leaderboardData.victimLocations,
                "victim_location"
              ).map((entry, index) => (
                <li key={index}>
                  <span className="rank-badge">
                    <div className="medal-container">
                      <span className="medal">{getMedal(index)}</span>
                    </div>
                    <span className="rank-content">
                      {entry.victim_location}
                    </span>
                  </span>
                  <span className="count-badge">{entry.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Platform 排行榜 */}
        {excludeUnknownOnline(leaderboardData.platforms, "platform").length >
          0 && (
          <div className="leaderboard-section">
            <h2>💻 Platforms</h2>
            <ul className="leaderboard-list">
              {excludeUnknownOnline(leaderboardData.platforms, "platform").map(
                (entry, index) => (
                  <li key={index}>
                    <span className="rank-badge">
                      <div className="medal-container">
                        <span className="medal">{getMedal(index)}</span>
                      </div>
                      <span className="rank-content">{entry.platform}</span>
                    </span>
                    <span className="count-badge">{entry.count}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
