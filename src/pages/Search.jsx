import { useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import ReportList from "../components/ReportList";
import { fetchApprovedReports, fetchSources } from "../api";
import "../styles/Search.css";

const Search = ({ hideTitle }) => {
  const [reports, setReports] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState("All Sources"); // ✅ 修复 `selectedSource`
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");

  // ✅ 监听 `filters, page, selectedSource`，确保搜索 & 分页正常
  useEffect(() => {
    getApprovedReports();
  }, [filters, page, selectedSource]);

  useEffect(() => {
    getSources();
  }, []);

  const getApprovedReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryFilters = {
        ...filters,
        source: selectedSource === "All Sources" ? undefined : selectedSource, // ✅ 修复 source 为空时的问题
      };

      const { data } = await fetchApprovedReports(queryFilters, page);
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("❌ Error fetching approved reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const getSources = async () => {
    try {
      const { data } = await fetchSources();
      setSources([
        { domain: "All Sources", count: 0 },
        ...(data.sources || []),
      ]);
    } catch (err) {
      console.error("❌ Error fetching sources:", err);
      setSources([]);
    }
  };

  // ✅ 处理搜索（含 Advanced Search）
  const handleSearch = (query, advancedFilters) => {
    setPage(1);
    setFilters({
      search: query.trim(),
      ...advancedFilters,
    });
  };

  // ✅ 处理 Source 切换
  const handleSourceChange = (newSource) => {
    setPage(1);
    setSelectedSource(newSource);
  };

  // ✅ 清除筛选
  const handleClearFilters = () => {
    setPage(1);
    setFilters({});
    setSelectedSource("All Sources");
    getApprovedReports();
  };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    } else {
      alert(`请输入 1 到 ${totalPages} 之间的页码！`);
    }
    setInputPage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handlePageJump();
    }
  };

  return (
    <div className="search-page">
      {!hideTitle && <h2>🔍 Discover Incidents</h2>}

      <SearchComponent
        placeholder="Search by key words.."
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        sources={sources}
        selectedSource={selectedSource} // ✅ 传递 `selectedSource`
        setSelectedSource={handleSourceChange} // ✅ 允许切换 Source
      />

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && reports.length === 0 && (
        <p className="no-results">No reports found</p>
      )}
      {!loading && reports.length > 0 && <ReportList reports={reports} />}

      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
        <input
          type="number"
          value={inputPage}
          onChange={handlePageChange}
          onKeyPress={handleKeyPress}
          placeholder="page"
          className="page-input"
        />
        <button onClick={handlePageJump}>To</button>
      </div>
    </div>
  );
};

export default Search;
