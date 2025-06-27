import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const EXCLUDED_PLATFORMS = [
  "Unknown",
  "Online",
  "null",
  "social media",
  "Google News",
];

const COLORS = [
  "#FF6B6B",
  "#FFA94D",
  "#4DABF7",
  "#63E6BE",
  "#845EF7",
  "#FCC419",
  "#5C7CFA",
  "#F783AC",
  "#69DB7C",
  "#A9E34B",
  "#CED4DA",
  "#D0BFFF",
  "#B2F2BB",
  "#FFD6A5",
  "#B5EAD7",
];

const PlatformChart = () => {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [topCount, setTopCount] = useState("10");

  const chartHeight = Math.max(300, displayData.length * 40);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reports/platform-statistics`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (entry) =>
            entry.platform &&
            !EXCLUDED_PLATFORMS.includes(entry.platform.trim())
        );

        const sorted = [...filtered].sort((a, b) => b.count - a.count);
        setAllData(sorted);
      })
      .catch((err) =>
        console.error("❌ Failed to fetch platform statistics:", err)
      );
  }, []);

  useEffect(() => {
    let count = parseInt(topCount);
    if (isNaN(count)) {
      setDisplayData(allData); // "all" 情况
      return;
    }

    const top = allData.slice(0, count);
    const others = allData.slice(count).reduce((sum, d) => sum + d.count, 0);
    if (others > 0) {
      top.push({ platform: "Other", count: others });
    }

    setDisplayData(top);
  }, [topCount, allData]);

  return (
    <div style={{ width: "100%", paddingBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ marginTop: "2rem" }}>Platform Distribution</h3>
        <select
          value={topCount}
          onChange={(e) => setTopCount(e.target.value)}
          style={{ padding: "6px 10px", fontSize: "14px", borderRadius: "4px" }}
        >
          <option value="10">Top 10</option>
          <option value="15">Top 15</option>
          <option value="20">Top 20</option>
          <option value="all">All</option>
        </select>
      </div>

      <div style={{ width: "100%", height: chartHeight, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 30 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="platform" type="category" width={80} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 6, 6]}>
              {displayData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformChart;
