import { useEffect, useRef, useState } from "react";
import "../styles/Search.css";
import { FaFileCsv } from "react-icons/fa";

const SearchComponent = ({
  placeholder,
  onSearch,
  onClearFilters,
  showAdvancedSearch,
  setShowAdvancedSearch,
  sources,
  selectedSource,
  setSelectedSource,
  authors,
  selectedAuthor,
  setSelectedAuthor,
  handleDownloadSearchCSV,
}) => {
  const [query, setQuery] = useState("");

  // ✅ 统一所有筛选项到 filters
  const [filters, setFilters] = useState({
    published_from: "",
    published_to: "",
    incident_from: "",
    incident_to: "",
    author: undefined,
    source: undefined,
    sortField: "",
    sortOrder: "",
  });

  const [showSourceFilter, setShowSourceFilter] = useState(false);
  const [showPublishedFilter, setShowPublishedFilter] = useState(false);
  const [showIncidentFilter, setShowIncidentFilter] = useState(false);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchAuthorText, setSearchAuthorText] = useState("");

  const publishedRef = useRef(null);
  const incidentRef = useRef(null);
  const sourceRef = useRef(null);
  const authorRef = useRef(null);

  const totalCount = (sources || []).reduce(
    (acc, src) => acc + (src.count || 0),
    0
  );
  const sourcesFiltered = (sources || []).filter(
    (src) => src.domain !== "All Sources"
  );

  useEffect(() => {
    if (selectedSource) {
      const updatedFilters = { ...filters, source: selectedSource };
      setFilters(updatedFilters);
      handleSearch(updatedFilters);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedAuthor !== undefined) {
      const updatedFilters = { ...filters, author: selectedAuthor };
      setFilters(updatedFilters);
      handleSearch(updatedFilters);
    }
  }, [selectedAuthor]);

  useEffect(() => {
    // 判断是否点到了筛选框外面
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
      if (authorRef.current && !authorRef.current.contains(event.target)) {
        setShowAuthorFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (updatedFilters = filters) => {
    onSearch(query.trim(), updatedFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      published_from: "",
      published_to: "",
      incident_from: "",
      incident_to: "",
      author: undefined,
      source: undefined,
    });
    setQuery("");
    setSelectedSource("All Sources");
    setSelectedAuthor(undefined);
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(); // 🔍 触发搜索
            }
          }}
        />

        <div className="search-btn-container">
          {setShowAdvancedSearch !== undefined && (
            <button
              className="toggle-advanced-btn"
              onClick={() => setShowAdvancedSearch((prev) => !prev)}
            >
              {showAdvancedSearch ? "Hide" : "Advanced Search"}
            </button>
          )}
          <button className="search-btn" onClick={() => handleSearch()}>
            Search
          </button>
          <div className="dropdown-filter">
            {/* <label htmlFor="sort-by-select"> Sort By</label> */}
            {/* <select
              id="sort-by-select"
              value={`${filters.sortField}_${filters.sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("_");
                const updatedFilters = {
                  ...filters,
                  sortField: field,
                  sortOrder: order,
                };
                setFilters(updatedFilters);
                handleSearch(updatedFilters);
              }}
            >
              <option value="_">Default</option>
              <option value="createdAt_asc">Created Time ↑</option>
              <option value="createdAt_desc">Created Time ↓</option>
              <option value="date_published_asc">Published Date ↑</option>
              <option value="date_published_desc">Published Date ↓</option>
            </select> */}
            <select
              id="sort-by-select"
              value={`${filters.sortField}_${filters.sortOrder}`}
              // onChange={(e) => {
              //   // const [field, order] = e.target.value.split("_");
              //   const value = e.target.value;
              //   const lastUnderscoreIndex = value.lastIndexOf("_");
              //   const field = value.slice(0, lastUnderscoreIndex);
              //   const order = value.slice(lastUnderscoreIndex + 1);

              //   const updatedFilters = {
              //     ...filters,
              //     sortField: field,
              //     sortOrder: order,
              //   };
              //   setFilters(updatedFilters);
              //   handleSearch(updatedFilters);
              // }}
              onChange={(e) => {
                const value = e.target.value;
                const lastUnderscoreIndex = value.lastIndexOf("_");
                const field = value.slice(0, lastUnderscoreIndex);
                const order = value.slice(lastUnderscoreIndex + 1);
                const updatedFilters = {
                  ...filters,
                  sortField: field,
                  sortOrder: order,
                };
                setFilters(updatedFilters);
                handleSearch(updatedFilters);
              }}
            >
              {/* ✅ 这个必须指定明确值，否则默认是空字符串会出错 */}
              <option value="createdAt_desc">Default</option>
              <option value="createdAt_asc">Created Time ↑</option>
              <option value="createdAt_desc">Created Time ↓</option>
              <option value="date_published_asc">Published Date ↑</option>
              <option value="date_published_desc">Published Date ↓</option>
            </select>
          </div>
          <div className="flex justify-end">
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

      {showAdvancedSearch && (
        <div className="advanced-search show">
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

            <div className="dropdown-filter" ref={authorRef}>
              <button
                className="filter-btn"
                onClick={() => setShowAuthorFilter((prev) => !prev)}
              >
                🧑 Author
              </button>
              {showAuthorFilter && (
                <div className="dropdown-container show">
                  <input
                    type="text"
                    placeholder="Search author"
                    value={searchAuthorText}
                    onChange={(e) => setSearchAuthorText(e.target.value)}
                  />

                  <ul className="source-list">
                    <li
                      className={`source-item ${
                        selectedAuthor === "" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedAuthor("");
                        setShowAuthorFilter(false);
                      }}
                    >
                      All Authors
                      <span className="source-count">
                        {authors.reduce(
                          (sum, item) => sum + (item.count || 0),
                          0
                        )}
                      </span>
                    </li>

                    {authors
                      .filter((author) =>
                        (author.author || "")
                          .toLowerCase()
                          .includes(searchAuthorText.toLowerCase())
                      )
                      .map((author, index) => (
                        <li
                          key={index}
                          className={`source-item ${
                            selectedAuthor === author.author ? "active" : ""
                          }`}
                          onClick={() => {
                            setSelectedAuthor(author.author);
                            setShowAuthorFilter(false);
                          }}
                        >
                          {author.author}
                          <span className="source-count">{author.count}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

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
                    value={filters.published_from}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        published_from: e.target.value,
                      }))
                    }
                  />
                  <label>To Date</label>
                  <input
                    type="date"
                    value={filters.published_to}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        published_to: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="search-btn small"
                    onClick={() => handleSearch()}
                  >
                    Search
                  </button>
                </div>
              )}
            </div>

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
                    value={filters.incident_from}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        incident_from: e.target.value,
                      }))
                    }
                  />
                  <label>To Date</label>
                  <input
                    type="date"
                    value={filters.incident_to}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        incident_to: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="search-btn small"
                    onClick={() => handleSearch()}
                  >
                    Search
                  </button>
                </div>
              )}
            </div>
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
