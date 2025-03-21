import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/leaderboard`,
          {
            withCredentials: true, // ✅ 如果后端有 JWT 鉴权（你有的话）
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
                <li key={index}>
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
            <h2>📌 Reports added to Existing Incidents</h2>
            <ul className="leaderboard-list">
              {leaderboardData.existingIncidentReports.map((entry, index) => (
                <li key={index}>
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
                <li key={index}>
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
                <li key={index}>
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
              {leaderboardData.reportDomains.map((entry, index) => (
                <li key={index}>
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
      </div>
    </div>
  );
};

export default Leaderboard;
