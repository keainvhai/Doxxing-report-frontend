import { useEffect, useState } from "react";
import SearchComponent from "../components/SearchComponent";
import ReportList from "../components/ReportList";
import { fetchApprovedReports } from "../api";
import "../styles/Search.css";

const Search = ({ hideTitle }) => {
  const [reports, setReports] = useState([]); // 所有 Approved reports
  const [filteredReports, setFilteredReports] = useState([]); // 过滤后的 reports
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filters, setFilters] = useState({}); // 存储高级筛选条件
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false); // ✅ 控制 Advanced Search 是否显示

  useEffect(() => {
    getApprovedReports();
  }, []);

  const getApprovedReports = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchApprovedReports(filters);
      console.log("📌 Fetched Approved Reports:", data);
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      console.error("❌ Error fetching approved reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
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
      ...advancedFilters,
    };

    console.log("🔎 Searching with params:", searchParams);
    setFilters(searchParams);

    fetchApprovedReports(searchParams)
      .then(({ data }) => {
        console.log("📌 Filtered Reports:", data);

        setFilteredReports(data);
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
    getApprovedReports(); // 重新加载所有 `Approved Reports`
  };

  return (
    <div className="search-page">
      {!hideTitle && <h2>🔍 Discover Incidents</h2>}
      <SearchComponent
        placeholder="Search by key words.."
        onSearch={handleSearch} // ✅ 传递搜索方法
        onClearFilters={handleClearFilters} // ✅ 传递清空筛选的方法
        showAdvancedSearch={showAdvancedSearch} // ✅ 传递 Advanced Search 状态
        setShowAdvancedSearch={setShowAdvancedSearch} // ✅ 传递切换 Advanced Search 的方法
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
