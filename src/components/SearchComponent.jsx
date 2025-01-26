import { useState } from "react";
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

  const handleSearch = () => {
    console.log("🔍 Searching with:", { query, filters: advancedFilters });

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

      {/* ✅ 确保点击按钮后 `Advanced Search` 显示/隐藏 */}
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
          {/* 📅 Published Date（起止时间） */}
          <div className="date-range-container">
            <label>Published Date:</label>
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
            <span>to</span>
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

          {/* 📅 Incident Date（起止时间） */}
          <div className="date-range-container">
            <label>Incident Date:</label>
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
            <span>to</span>
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
