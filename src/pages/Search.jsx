import { useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import ReportList from "../components/ReportList";
import { fetchApprovedReports, fetchSources } from "../api";
import "../styles/Search.css";

const Search = ({ hideTitle }) => {
  const [reports, setReports] = useState([]); // 所有 Approved reports
  const [filteredReports, setFilteredReports] = useState([]); // 过滤后的 reports
  const [sources, setSources] = useState([]); // 站点来源（域名）
  const [selectedSource, setSelectedSource] = useState("All Sources"); // 选中的 source
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filters, setFilters] = useState({}); // 存储高级筛选条件
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false); // ✅ 控制 Advanced Search 是否显示

  useEffect(() => {
    getApprovedReports();
    getSources();
  }, []);

  const getApprovedReports = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchApprovedReports(filters);
      console.log("📌 Fetched Approved Reports:", data);

      // 确保 data.reports 存在并是数组
      const reportsArray = Array.isArray(data.reports) ? data.reports : [];
      setReports(reportsArray);
      setFilteredReports(reportsArray);
    } catch (err) {
      console.error("❌ Error fetching approved reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };
  // 获取所有可用的 source
  const getSources = async () => {
    try {
      const { data } = await fetchSources();
      console.log("🌐 API Response - Available Sources:", data.sources);

      if (!data.sources || !Array.isArray(data.sources)) {
        console.error("❌ Invalid sources format:", data.sources);
        setSources([]); // 避免 `undefined`
        return;
      }

      // ✅ 确保 sources 是对象数组
      const formattedSources = data.sources.map((source) =>
        typeof source === "string" ? { domain: source, count: 0 } : source
      );

      setSources([{ domain: "All Sources", count: 0 }, ...formattedSources]);
    } catch (err) {
      console.error("❌ Error fetching sources:", err);
      setSources([]);
    }
  };

  const handleSearch = (query, advancedFilters) => {
    setLoading(true);
    setSearchPerformed(true);

    // ✅ 确保 `From` 日期不比 `To` 晚
    if (advancedFilters.published_from && advancedFilters.published_to) {
      if (advancedFilters.published_from > advancedFilters.published_to) {
        alert("Published 'From' date cannot be later than 'To' date.");
        setLoading(false);
        return;
      }
    }

    if (advancedFilters.incident_from && advancedFilters.incident_to) {
      if (advancedFilters.incident_from > advancedFilters.incident_to) {
        alert("Incident 'From' date cannot be later than 'To' date.");
        setLoading(false);
        return;
      }
    }

    // ✅ 组合查询参数
    const searchParams = {
      search: query.trim(),
      source: selectedSource === "All Sources" ? "" : selectedSource, // 传递 source 参数
      // incident_from: advancedFilters.incident_from,
      // incident_to: advancedFilters.incident_to,
      ...advancedFilters,
    };

    console.log("🔎 Searching with params:", searchParams);
    setFilters(searchParams);

    fetchApprovedReports(searchParams)
      .then(({ data }) => {
        console.log("📌 Filtered Reports:", data);

        setFilteredReports(data.reports);
      })
      .catch((err) => {
        console.error("❌ Error searching reports:", err);
        setError("Failed to search reports.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClearFilters = () => {
    console.log("🔄 Resetting filters");
    setSearchPerformed(false);
    setFilters({});
    setSelectedSource("All Sources");
    getApprovedReports(); // 重新加载所有 `Approved Reports`
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
        sources={sources} // ✅ 传递 sources
        selectedSource={selectedSource} // ✅ 传递选中的 source
        setSelectedSource={setSelectedSource} // ✅ 允许修改 source
      />
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && filteredReports.length === 0 && (
        <p className="no-results">No reports found</p>
      )}

      {!loading && (
        <ReportList reports={searchPerformed ? filteredReports : reports} />
      )}
    </div>
  );
};

export default Search;
