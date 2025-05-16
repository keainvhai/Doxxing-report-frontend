// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import SearchComponent from "./SearchComponent";
// import ReportList from "./ReportList";
// import {
//   fetchApprovedReports,
//   fetchSources,
//   fetchAuthors,
//   fetchEntities,
// } from "../api";

// const SearchWithResults = () => {
//   const [reports, setReports] = useState([]);
//   const [sources, setSources] = useState([]);
//   const [authors, setAuthors] = useState([]);
//   const [entities, setEntities] = useState([]);
//   const [selectedSource, setSelectedSource] = useState("All Sources");
//   const [selectedAuthor, setSelectedAuthor] = useState("All Authors");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [inputPage, setInputPage] = useState("");
//   const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

//   const location = useLocation();

//   const [hasRestoredPage, setHasRestoredPage] = useState(false);

//   useEffect(() => {
//     const saved = localStorage.getItem("returnPage");
//     if (saved) {
//       setPage(parseInt(saved));
//     }
//     setHasRestoredPage(true);
//   }, []);

//   useEffect(() => {
//     if (hasRestoredPage) {
//       getReports();
//     }
//   }, [page, hasRestoredPage]);

//   useEffect(() => {
//     localStorage.setItem("returnPage", page.toString());
//   }, [page]);

//   useEffect(() => {
//     getSources();
//     getAuthors();
//     getEntities();
//   }, []);

//   const getReports = async (customPage = page, customFilters = null) => {
//     setLoading(true);
//     try {
//       const filters = {
//         search: customFilters?.search,
//         id: customFilters?.id,
//         author:
//           (customFilters?.author ?? selectedAuthor) !== "All Authors"
//             ? customFilters?.author ?? selectedAuthor
//             : undefined,
//         source:
//           (customFilters?.source ?? selectedSource) !== "All Sources"
//             ? customFilters?.source ?? selectedSource
//             : undefined,
//         publish_from: customFilters?.publish_from,
//         publish_to: customFilters?.publish_to,
//         incident_from: customFilters?.incident_from,
//         incident_to: customFilters?.incident_to,
//         entity: customFilters?.entity,
//       };

//       console.log("🟡 getReports with filters:", filters);

//       const { data } = await fetchApprovedReports(filters, customPage);
//       setReports(data.reports);
//       setTotalPages(data.totalPages);
//     } catch (err) {
//       setError("Failed to load reports");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (query, extraFilters = {}) => {
//     const updatedFilters = {
//       search: query || undefined,
//       author:
//         extraFilters.author !== "All Authors" ? extraFilters.author : undefined,
//       source:
//         extraFilters.source !== "All Sources" ? extraFilters.source : undefined,
//       publish_from: extraFilters.published_from || undefined,
//       publish_to: extraFilters.published_to || undefined,
//       incident_from: extraFilters.incident_from || undefined,
//       incident_to: extraFilters.incident_to || undefined,
//       id: extraFilters.id || undefined,
//       entity: extraFilters.entity || undefined,
//     };
//     setSelectedAuthor(extraFilters.author || "All Authors");
//     setSelectedSource(extraFilters.source || "All Sources");
//     setPage(1);
//     localStorage.setItem("returnPage", "1");
//     getReports(1, updatedFilters);
//   };

//   const handleClearFilters = () => {
//     setSelectedAuthor("All Authors");
//     setSelectedSource("All Sources");
//     setPage(1);
//     localStorage.setItem("returnPage", "1");
//     getReports(1);
//   };

//   const getSources = async () => {
//     try {
//       const { data } = await fetchSources();
//       const sortedSources = data.sources.sort((a, b) => b.count - a.count);
//       setSources([{ domain: "All Sources", count: 0 }, ...sortedSources]);
//     } catch (err) {
//       console.error("❌ Error fetching sources:", err);
//     }
//   };

//   const getAuthors = async () => {
//     try {
//       const { data } = await fetchAuthors();
//       const sortedAuthors = data.authors.sort((a, b) => b.count - a.count);
//       setAuthors(sortedAuthors);
//     } catch (err) {
//       console.error("❌ Error fetching authors:", err);
//     }
//   };

//   const getEntities = async () => {
//     try {
//       const { data } = await fetchEntities();
//       const topEntities = data
//         .filter((e) => e.name.toLowerCase() !== "news") //  排除 news
//         .sort((a, b) => b.count - a.count)
//         .slice(0, 6);
//       setEntities(topEntities);
//     } catch (err) {
//       console.error("❌ Error fetching entities:", err);
//     }
//   };

//   const handleEntitySearch = (entityName) => {
//     const updatedFilters = {
//       author: selectedAuthor !== "All Authors" ? selectedAuthor : undefined,
//       source: selectedSource !== "All Sources" ? selectedSource : undefined,
//       entity: entityName,
//     };
//     setPage(1);
//     localStorage.setItem("returnPage", "1");
//     getReports(1, updatedFilters);
//   };

//   const handleDownloadSearchCSV = () => {
//     const params = new URLSearchParams();
//     params.set("page", page);
//     params.set("limit", 12);

//     window.open(
//       `${
//         import.meta.env.VITE_API_URL
//       }/reports/download/search-csv?${params.toString()}`
//     );
//   };

//   return (
//     <div className="search-page">
//       <div className="top-entities">
//         <h3>🔥 Top 6 Entities</h3>
//         <div className="entity-grid">
//           {entities.map((entity, index) => (
//             <div
//               key={index}
//               onClick={() => handleEntitySearch(entity.name)}
//               className="entity-card"
//             >
//               <div className="entity-name">
//                 {entity.name}
//                 <span className="entity-badge">{entity.count}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <SearchComponent
//         placeholder="Search by keywords..."
//         onSearch={handleSearch}
//         onClearFilters={handleClearFilters}
//         showAdvancedSearch={showAdvancedSearch}
//         setShowAdvancedSearch={setShowAdvancedSearch}
//         sources={sources}
//         selectedSource={selectedSource}
//         setSelectedSource={setSelectedSource}
//         authors={authors}
//         selectedAuthor={selectedAuthor}
//         setSelectedAuthor={setSelectedAuthor}
//         handleDownloadSearchCSV={handleDownloadSearchCSV}
//       />

//       {loading && <p>Loading...</p>}
//       {error && <p className="error-message">{error}</p>}

//       {!loading && reports.length > 0 && <ReportList reports={reports} />}

//       <div className="pagination">
//         <button onClick={() => setPage(1)} disabled={page === 1}>
//           First
//         </button>
//         <button onClick={() => setPage(page - 1)} disabled={page === 1}>
//           Prev
//         </button>
//         <input
//           type="number"
//           min={1}
//           max={totalPages}
//           value={inputPage}
//           onChange={(e) => setInputPage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               const target = parseInt(inputPage);
//               if (!isNaN(target) && target >= 1 && target <= totalPages) {
//                 setPage(target);
//                 setInputPage("");
//               }
//             }
//           }}
//           placeholder="page"
//           style={{ width: "60px", marginLeft: "8px" }}
//         />
//         <button
//           onClick={() => {
//             const target = parseInt(inputPage);
//             if (!isNaN(target) && target >= 1 && target <= totalPages) {
//               setPage(target);
//               setInputPage("");
//             }
//           }}
//         >
//           Go
//         </button>
//         <span>
//           {page} / {totalPages}
//         </span>
//         <button
//           onClick={() => setPage(page + 1)}
//           disabled={page === totalPages}
//         >
//           Next
//         </button>
//         <button
//           onClick={() => setPage(totalPages)}
//           disabled={page === totalPages}
//         >
//           Last
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SearchWithResults;
