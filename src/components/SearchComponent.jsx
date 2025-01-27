import { useEffect, useRef, useState } from "react";
import "../styles/Search.css";

const SearchComponent = ({
  placeholder,
  onSearch,
  onClearFilters,
  showAdvancedSearch,
  setShowAdvancedSearch,
}) => {
  const [query, setQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    source: "",
    published_from: "",
    published_to: "",
    incident_from: "",
    incident_to: "",
  });

  // 控制 Published Date 和 Incident Date 的显示
  const [showPublishedFilter, setShowPublishedFilter] = useState(false);
  const [showIncidentFilter, setShowIncidentFilter] = useState(false);

  // 用 ref 监听 dropdown-filter
  const publishedRef = useRef(null);
  const incidentRef = useRef(null);

  // 监听点击事件，自动关闭 dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        publishedRef.current &&
        !publishedRef.current.contains(event.target)
      ) {
        setShowPublishedFilter(false);
      }
      if (incidentRef.current && !incidentRef.current.contains(event.target)) {
        setShowIncidentFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    onSearch(query.trim(), advancedFilters);
  };

  const handleClearFilters = () => {
    setAdvancedFilters({
      source: "",
      published_from: "",
      published_to: "",
      incident_from: "",
      incident_to: "",
    });
    setQuery("");
    onClearFilters();
  };

  return (
    <div className="search-container">
      {/* 🔍 搜索框 */}
      <div className="search-row">
        <input
          type="text"
          placeholder={placeholder || "Type Here..."}
          className="search-box"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* ✅ Advanced Search 按钮，点击时切换 `showAdvancedSearch` 状态 */}

        <div className="search-btn-container">
          <button
            className="toggle-advanced-btn"
            onClick={() => setShowAdvancedSearch((prev) => !prev)}
          >
            {showAdvancedSearch ? "Hide Advanced Search" : "Advanced Search"}
          </button>
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* ✅ Advanced Search 面板 */}
      {showAdvancedSearch && (
        <div className="advanced-search show">
          <input
            type="text"
            placeholder="Source (e.g., twitter.com)"
            value={advancedFilters.source}
            onChange={(e) =>
              setAdvancedFilters({ ...advancedFilters, source: e.target.value })
            }
          />

          <div className="date-filters">
            {/* 📅 Published Date 按钮 + 下拉框 */}
            <div className="dropdown-filter" ref={publishedRef}>
              <button
                className="filter-btn"
                onClick={() => setShowPublishedFilter((prev) => !prev)}
              >
                📅 Published Date
              </button>
              {showPublishedFilter && (
                <div className="date-range-container show">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={advancedFilters.published_from}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        published_from: e.target.value,
                      })
                    }
                  />
                  <label>To Date</label>
                  <input
                    type="date"
                    value={advancedFilters.published_to}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        published_to: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
            {/* 📅 Incident Date 按钮 + 下拉框 */}
            <div className="dropdown-filter" ref={incidentRef}>
              <button
                className="filter-btn"
                onClick={() => setShowIncidentFilter((prev) => !prev)}
              >
                📅 Incident Date
              </button>
              {showIncidentFilter && (
                <div className="date-range-container show">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={advancedFilters.incident_from}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        incident_from: e.target.value,
                      })
                    }
                  />
                  <label>To Date</label>
                  <input
                    type="date"
                    value={advancedFilters.incident_to}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        incident_to: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* ✅ 清除筛选按钮 */}
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
