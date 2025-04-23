import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchComponent from "./SearchComponent";
import ReportList from "./ReportList";
import {
  fetchApprovedReports,
  fetchSources,
  fetchAuthors,
  fetchEntities,
} from "../api";

const SearchWithResults = ({ syncURL = true, hideTitle = false }) => {
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

  // 如果需要同步 URL，再读取参数
  const getParams = () =>
    syncURL ? new URLSearchParams(location.search) : new URLSearchParams();

  // ✅ 新增：用于标记是否已经恢复完页码（非 URL 模式下）
  const [hasRestoredPage, setHasRestoredPage] = useState(false);

  // ✅ 1. 页面加载时：从 localStorage 恢复页码（非 URL 模式）
  useEffect(() => {
    if (!syncURL) {
      const saved = localStorage.getItem("returnPage");
      if (saved) {
        setPage(parseInt(saved));
      }
      setHasRestoredPage(true); // 标记初始化完成
    }
  }, []);

  // ✅ 2. 非 URL 模式下，页码变化时：加载对应页数据（仅在初始化完成后）
  useEffect(() => {
    if (!syncURL && hasRestoredPage) {
      getReports();
    }
  }, [page, hasRestoredPage]);

  // ✅ 3. 非 URL 模式下，页码变化时：保存当前页到 localStorage
  useEffect(() => {
    if (!syncURL) {
      localStorage.setItem("returnPage", page.toString());
    }
  }, [page]);

  // ✅ 4. URL 模式下：解析 search 和 page 参数并加载数据
  useEffect(() => {
    if (syncURL) {
      const params = getParams();
      setSelectedAuthor(params.get("author") || "All Authors");
      setSelectedSource(params.get("source") || "All Sources");

      const pageParam = parseInt(params.get("page"));
      if (!isNaN(pageParam) && pageParam >= 1) {
        setPage(pageParam);
        getReports(pageParam);
      } else {
        setPage(1);
        getReports(1);
      }
    }
  }, [location.search]);

  // ✅ 5. URL 模式下：page 改变时同步 URL 参数
  useEffect(() => {
    if (syncURL) {
      const params = getParams();
      params.set("page", page);
      navigate(`/search?${params.toString()}`, { replace: true });
    }
  }, [page]);

  useEffect(() => {
    getSources();
    getAuthors();
    getEntities();
  }, []);

  const getReports = async (customPage = page) => {
    setLoading(true);
    try {
      const params = getParams();
      const filters = {
        author: params.get("author") || undefined,
        source: params.get("source") || undefined,
        search: params.get("search") || undefined,
      };
      const { data } = await fetchApprovedReports(filters, customPage);
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query, extraFilters = {}) => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (extraFilters.author && extraFilters.author !== "All Authors")
      params.set("author", extraFilters.author);
    if (extraFilters.source && extraFilters.source !== "All Sources")
      params.set("source", extraFilters.source);

    if (syncURL) {
      navigate(`/search?${params.toString()}`);
    } else {
      getReports();
    }

    setPage(1);
  };

  const handleClearFilters = () => {
    if (syncURL) {
      navigate(`/search`);
    } else {
      setSelectedAuthor("All Authors");
      setSelectedSource("All Sources");
      setPage(1);
      getReports();
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

  const getEntities = async () => {
    try {
      const { data } = await fetchEntities();
      const topEntities = data.sort((a, b) => b.count - a.count).slice(0, 6);
      setEntities(topEntities);
    } catch (err) {
      console.error("❌ Error fetching entities:", err);
    }
  };

  const handleEntitySearch = (entityName) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("entity", entityName);
    navigate(`/search?${searchParams.toString()}`);
    setPage(1);
  };

  return (
    <div className="search-page">
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
        placeholder="Search by keywords..."
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        sources={sources}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        authors={authors}
        selectedAuthor={selectedAuthor}
        setSelectedAuthor={setSelectedAuthor}
        handleDownloadSearchCSV={() => {}}
      />

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && reports.length > 0 && <ReportList reports={reports} />}

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>
          First
        </button>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const target = parseInt(inputPage);
              if (!isNaN(target) && target >= 1 && target <= totalPages) {
                setPage(target);
                setInputPage("");
              }
            }
          }}
          placeholder="page"
          style={{ width: "60px", marginLeft: "8px" }}
        />
        <button
          onClick={() => {
            const target = parseInt(inputPage);
            if (!isNaN(target) && target >= 1 && target <= totalPages) {
              setPage(target);
              setInputPage("");
            }
          }}
        >
          Go
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
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default SearchWithResults;
