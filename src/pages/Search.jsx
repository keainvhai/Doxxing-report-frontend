import { useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import ReportList from "../components/ReportList";
import {
  fetchApprovedReports,
  fetchSources,
  fetchAuthors,
  fetchEntities,
} from "../api";
import "../styles/Search.css";

const Search = ({ hideTitle }) => {
  const [reports, setReports] = useState([]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState("All Sources"); // ✅ 修复 `selectedSource`
  const [authors, setAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const [limit, setLimit] = useState(12); // 默认一页显示 12 条

  const [entities, setEntities] = useState([]);

  useEffect(() => {
    getEntities();
  }, []);

  const getEntities = async () => {
    try {
      const { data } = await fetchEntities();
      const topEntities = data
        .filter((e) => e.name.toLowerCase() !== "news") // 过滤掉名为 "news" 的 entity
        .sort((a, b) => b.count - a.count) // ✅ 按 incident 数量降序排序
        .slice(0, 6); // ✅ 取前 6 个
      setEntities(topEntities);
    } catch (err) {
      console.error("❌ Error fetching entities:", err);
    }
  };

  // ✅ 监听 `filters, page, selectedSource`，确保搜索 & 分页正常
  useEffect(() => {
    getApprovedReports();
  }, [filters, page, selectedSource, limit]);

  useEffect(() => {
    getSources();
  }, []);

  useEffect(() => {
    getAuthors();
  }, []);

  const getApprovedReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryFilters = {
        ...filters,
        source: selectedSource === "All Sources" ? undefined : selectedSource, // ✅ 修复 source 为空时的问题
      };

      // const { data } = await fetchApprovedReports(queryFilters, page);
      const { data } = await fetchApprovedReports(
        { ...queryFilters, limit },
        page
      );

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

      // setSources([
      //   { domain: "All Sources", count: 0 },
      //   ...(data.sources || []),
      // ]);
      const sortedSources = (data.sources || []).sort(
        (a, b) => b.count - a.count
      );
      setSources([{ domain: "All Sources", count: 0 }, ...sortedSources]);
    } catch (err) {
      console.error("❌ Error fetching sources:", err);
      setSources([]);
    }
  };

  const getAuthors = async () => {
    try {
      const { data } = await fetchAuthors();
      const sortedAuthors = (data.authors || []).sort(
        (a, b) => b.count - a.count
      );
      // setAuthors([{ author: "All Authors", count: 0 }, ...sortedAuthors]);
      setAuthors(sortedAuthors);
    } catch (err) {
      console.error("❌ Error fetching authors:", err);
      setAuthors([]);
    }
  };

  // ✅ 处理搜索（含 Advanced Search）
  const handleSearch = (query, advancedFilters) => {
    setPage(1);
    setFilters({
      search: query.trim(),
      ...advancedFilters,
      author: selectedAuthor === "All Authors" ? undefined : selectedAuthor,
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
      alert(`Please enter a page number between 1 and ${totalPages}!`);
    }
    setInputPage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handlePageJump();
    }
  };

  const handleEntitySearch = (entityName) => {
    setPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      entity: entityName,
    }));
  };

  const handleDownloadSearchCSV = () => {
    // ✅ 传递搜索 & 分页参数
    const params = new URLSearchParams({
      ...filters,
      source: selectedSource === "All Sources" ? "" : selectedSource,
      page,
      // limit: 12, // 传递分页参数（和 Search.jsx 里的一致）
      limit: limit === 9999 ? "all" : limit, // ✅ 动态传递
    }).toString();

    window.open(
      `${import.meta.env.VITE_API_URL}/reports/download/search-csv?${params}`
    );
  };

  return (
    <div className="search-page">
      {!hideTitle && <h2>🔍 Discover Incidents</h2>}

      <div className="top-entities">
        <h3>🔥 Top 6 Entities</h3>
        <div className="entity-grid">
          {entities.map((entity, index) => (
            <div
              key={index}
              onClick={() => handleEntitySearch(entity.name)}
              className="entity-card"
            >
              <div className="entity-name">
                {entity.name}
                <span className="entity-badge">{entity.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SearchComponent
        placeholder="Search by key words.."
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        sources={sources}
        selectedSource={selectedSource} // ✅ 传递 `selectedSource`
        setSelectedSource={handleSourceChange} // ✅ 允许切换 Source
        authors={authors}
        selectedAuthor={selectedAuthor}
        setSelectedAuthor={setSelectedAuthor}
        handleDownloadSearchCSV={handleDownloadSearchCSV}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && reports.length === 0 && (
        <p className="no-results">No reports found</p>
      )}
      {!loading && reports.length > 0 && <ReportList reports={reports} />}

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>
          First
        </button>
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
        </button>{" "}
        <input
          type="number"
          value={inputPage}
          onChange={handlePageChange}
          onKeyPress={handleKeyPress}
          placeholder="page"
          className="page-input"
        />
        <button onClick={handlePageJump}>To</button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </button>
        <div className="page-size-selector">
          <label htmlFor="limit-select">Per Page:</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setLimit(9999); // 后端需支持大数代表 all
              } else {
                setLimit(parseInt(value, 10));
              }
              setPage(1); // 切换每页数量时重置页码
            }}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Search;
