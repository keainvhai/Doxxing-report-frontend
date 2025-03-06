import { useEffect, useRef, useState } from "react";
import "../styles/Search.css";
import { FaFileCsv } from "react-icons/fa";

const SearchComponent = ({
  placeholder,
  onSearch,
  onClearFilters,
  showAdvancedSearch,
  setShowAdvancedSearch,
  sources, // ✅ 从 `Search.jsx` 传入 sources
  selectedSource,
  setSelectedSource,
  handleDownloadSearchCSV,
}) => {
  const [query, setQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    published_from: "",
    published_to: "",
    incident_from: "",
    incident_to: "",
  });

  // 调试 sources 是否真的有数据
  // console.log("Received sources:", sources);

  // ✅ 控制 Source 显示
  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [showPublishedFilter, setShowPublishedFilter] = useState(false);
  const [showIncidentFilter, setShowIncidentFilter] = useState(false);
  const [searchText, setSearchText] = useState(""); // ✅ 搜索 source

  const publishedRef = useRef(null);
  const incidentRef = useRef(null);
  const sourceRef = useRef(null);

  const totalCount = sources.reduce((acc, src) => acc + (src.count || 0), 0);
  const sourcesFiltered = sources.filter((src) => src.domain !== "All Sources");

  useEffect(() => {
    if (selectedSource) {
      handleSearch(query, advancedFilters);
    }
  }, [selectedSource]);

  // ✅ 监听点击事件，自动关闭 dropdown
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
      if (sourceRef.current && !sourceRef.current.contains(event.target)) {
        setShowSourceFilter(false);
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
      published_from: "",
      published_to: "",
      incident_from: "",
      incident_to: "",
    });
    setQuery("");
    setSelectedSource("All Sources");
    onClearFilters();
  };

  return (
    <div className="search-container">
      <div className="search-row">
        <input
          type="text"
          placeholder={placeholder || "Type Here..."}
          className="search-box"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="search-btn-container">
          {setShowAdvancedSearch !== undefined &&
            typeof setShowAdvancedSearch === "function" && (
              <button
                className="toggle-advanced-btn"
                onClick={() => setShowAdvancedSearch((prev) => !prev)}
              >
                {showAdvancedSearch ? "Hide" : "More filters"}
              </button>
            )}

          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>

          <div className="flex justify-end mt-4">
            <button onClick={handleDownloadSearchCSV} className="export-btn">
              <FaFileCsv style={{ marginRight: "6px" }} />
              Export
              <div className="export-btn-tooltip">
                Export current page or search results as a CSV file
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Advanced Search 面板 */}
      {showAdvancedSearch && (
        <div className="advanced-search show">
          {/* ✅ Source Filter */}
          <div className="filters-row">
            <div className="dropdown-filter" ref={sourceRef}>
              <button
                className="filter-btn"
                onClick={() => setShowSourceFilter((prev) => !prev)}
              >
                📄 Source
              </button>
              {showSourceFilter && (
                <div className="dropdown-container show">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <ul className="source-list">
                    <li
                      className={`source-item ${
                        selectedSource === "" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedSource("");
                        setShowSourceFilter(false);
                        onSearch(query.trim(), advancedFilters); // ✅ 立即搜索
                      }}
                    >
                      All Sources
                      <span className="source-count">{totalCount}</span>
                    </li>

                    {sourcesFiltered
                      .filter((src) =>
                        (src.domain || "")
                          .toLowerCase()
                          .includes(searchText.toLowerCase())
                      )
                      .map((src, index) => (
                        <li
                          key={index}
                          className={`source-item ${
                            selectedSource === src.domain ? "active" : ""
                          }`}
                          onClick={() => {
                            setSelectedSource(src.domain);
                            setShowSourceFilter(false);
                            onSearch(query.trim(), advancedFilters);
                          }}
                        >
                          {src.domain}
                          <span className="source-count">{src.count}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ✅ Date Filters */}
            {/* <div className="date-filters"> */}
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
                  />{" "}
                  <button
                    className="search-btn small"
                    onClick={() => onSearch(query.trim(), advancedFilters)}
                  >
                    Search
                  </button>
                </div>
              )}
            </div>

            {/* 📅 Incident Date */}
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
                  <button
                    className="search-btn small"
                    onClick={() => onSearch(query.trim(), advancedFilters)}
                  >
                    Search
                  </button>
                </div>
              )}
            </div>
            {/* </div> */}
          </div>

          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
