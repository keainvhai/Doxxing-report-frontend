import { useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import ReportList from "../components/ReportList"; // ✅ 引入 ReportList 组件
import { fetchApprovedReports } from "../api"; // 只获取所有 Approved 的 reports
import "../styles/Search.css";

const Search = ({ hideTitle }) => {
  const [reports, setReports] = useState([]); // 所有 Approved reports
  const [filteredReports, setFilteredReports] = useState([]); // 过滤后的 reports
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getApprovedReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchApprovedReports(); // ✅ 只获取所有 approved reports
        console.log("📌 Fetched Approved Reports:", data);
        setReports(data);
        setFilteredReports(data); // ✅ 初始时显示全部
      } catch (err) {
        console.error("❌ Error fetching approved reports:", err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    getApprovedReports();
  }, []);

  // ✅ 直接使用 `filter` 进行前端搜索
  const handleSearch = (query) => {
    // console.log("🔍 Search Query:", query);

    if (!query.trim()) {
      console.log("🔄 Reset to all reports");
      setFilteredReports([...reports]); // ✅ 如果搜索框为空，恢复所有数据
    } else {
      const filtered = reports.filter(
        (report) =>
          report.title.toLowerCase().includes(query.toLowerCase()) ||
          (report.author &&
            report.author.toLowerCase().includes(query.toLowerCase()))
      );

      // console.log("🎯 Filtered Reports:", filtered);
      setFilteredReports([...filtered]);
    }
  };

  return (
    <div className="search-page">
      {!hideTitle && <h2>🔍 Discover Incidents</h2>}
      <SearchComponent
        placeholder="Search reports by title or author..."
        onSearch={handleSearch} // ✅ 传递 handleSearch 方法
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && filteredReports.length === 0 && (
        <p className="no-results">No reports found</p>
      )}
      <ReportList reports={filteredReports} /> {/* ✅ 渲染过滤后的 reports */}
    </div>
  );
};

export default Search;
