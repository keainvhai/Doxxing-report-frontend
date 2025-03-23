import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [authors, setAuthors] = useState([]);
  const [entities, setEntities] = useState([]);
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 监听 location.search 和 page 变化，直接请求
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const authorParam = params.get("author") || "All Authors";
    const sourceParam = params.get("source") || "All Sources";

    // 👉 保持 UI 一致
    setSelectedAuthor(authorParam);
    setSelectedSource(sourceParam);

    // 请求数据
    getApprovedReports(params);
  }, [location.search, page]);

  // ✅ 初始化获取 sources / authors / entities
  useEffect(() => {
    getEntities();
    getSources();
    getAuthors();
  }, []);

  const getEntities = async () => {
    try {
      const { data } = await fetchEntities();
      const topEntities = data.sort((a, b) => b.count - a.count).slice(0, 6);
      setEntities(topEntities);
    } catch (err) {
      console.error("❌ Error fetching entities:", err);
    }
  };

  const getSources = async () => {
    try {
      const { data } = await fetchSources();
      const sortedSources = data.sources.sort((a, b) => b.count - a.count);
      setSources([{ domain: "All Sources", count: 0 }, ...sortedSources]);
    } catch (err) {
      console.error("❌ Error fetching sources:", err);
    }
  };

  const getAuthors = async () => {
    try {
      const { data } = await fetchAuthors();
      const sortedAuthors = data.authors.sort((a, b) => b.count - a.count);
      setAuthors(sortedAuthors);
    } catch (err) {
      console.error("❌ Error fetching authors:", err);
    }
  };

  const getApprovedReports = async (params) => {
    setLoading(true);
    setError(null);

    try {
      const queryFilters = {
        author: params.get("author") || undefined,
        source: params.get("source") || undefined,
        search: params.get("search") || undefined,
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

  // ✅ 搜索时更新 URL 参数，自动触发 useEffect
  const handleSearch = (query, advancedFilters = {}) => {
    const searchParams = new URLSearchParams(location.search);

    if (selectedAuthor !== "All Authors") {
      searchParams.set("author", selectedAuthor);
    } else {
      searchParams.delete("author");
    }

    if (selectedSource !== "All Sources") {
      searchParams.set("source", selectedSource);
    } else {
      searchParams.delete("source");
    }

    if (query) {
      searchParams.set("search", query.trim());
    } else {
      searchParams.delete("search");
    }

    // TODO: 如果有 advancedFilters，继续加

    navigate(`/search?${searchParams.toString()}`);
    setPage(1);
  };

  const handleSourceChange = (newSource) => {
    const searchParams = new URLSearchParams(location.search);

    if (newSource !== "All Sources") {
      searchParams.set("source", newSource);
    } else {
      searchParams.delete("source");
    }

    navigate(`/search?${searchParams.toString()}`);
    setPage(1);
  };

  const handleAuthorChange = (newAuthor) => {
    const searchParams = new URLSearchParams(location.search);

    if (newAuthor !== "All Authors") {
      searchParams.set("author", newAuthor);
    } else {
      searchParams.delete("author");
    }

    navigate(`/search?${searchParams.toString()}`);
    setPage(1);
  };

  const handleClearFilters = () => {
    navigate(`/search`);
    setPage(1);
  };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    } else {
      alert(`Please enter number between 1 and ${totalPages} !`);
    }
    setInputPage("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handlePageJump();
    }
  };

  const handleEntitySearch = (entityName) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("entity", entityName);
    navigate(`/search?${searchParams.toString()}`);
    setPage(1);
  };

  const handleDownloadSearchCSV = () => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    params.set("limit", 12);

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
        selectedSource={selectedSource}
        setSelectedSource={handleSourceChange}
        authors={authors}
        selectedAuthor={selectedAuthor}
        setSelectedAuthor={handleAuthorChange}
        handleDownloadSearchCSV={handleDownloadSearchCSV}
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
