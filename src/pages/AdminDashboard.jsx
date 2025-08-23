import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import { useSearchParams } from "react-router-dom";
import SearchComponent from "../components/SearchComponent";
import {
  fetchReports,
  fetchSources,
  // approveReport,
  // rejectReport,
  updateReportStatus,
  deleteReport,
} from "../api";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";

const AdminDashboard = () => {
  const { authState } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // URL 参数
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Reports 分页状态（默认从 URL 初始化）
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit = parseInt(searchParams.get("limit")) || 12;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");

  // Users 分页状态（默认从 URL 初始化）
  const initialUserPage = parseInt(searchParams.get("page")) || 1;
  const initialUserLimit = parseInt(searchParams.get("limit")) || 10;
  const [userPage, setUserPage] = useState(initialUserPage);
  const [userLimit, setUserLimit] = useState(initialUserLimit);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userInputPage, setUserInputPage] = useState("");

  // 爬新闻 & 生成周报
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState("");

  // 标签页
  const [activeTab, setActiveTab] = useState("reports");
  const [users, setUsers] = useState([]);

  // === AI Logs: Companion ===
  const [cPage, setCPage] = useState(1);
  const [cPageSize, setCPageSize] = useState(50);
  const [cTotal, setCTotal] = useState(0);
  const [cRows, setCRows] = useState([]);
  const [cLoading, setCLoading] = useState(false);

  // === AI Logs: Comment ===
  const [mPage, setMPage] = useState(1);
  const [mPageSize, setMPageSize] = useState(50);
  const [mTotal, setMTotal] = useState(0);
  const [mRows, setMRows] = useState([]);
  const [mLoading, setMLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");

  // ---- 修复 0：首次进入 /admin 时，如果没有 tab，补上默认 tab=reports ----
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      // 用 replace 避免多一条历史记录
      navigate(`/admin?tab=reports&page=${page}&limit=${limit}`, {
        replace: true,
      });
    }
    // 只需运行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 解析 URL，决定当前 tab 和该 tab 对应的分页参数 ----
  useEffect(() => {
    const tab = searchParams.get("tab") || "reports";
    setActiveTab(tab);

    const urlPage = parseInt(searchParams.get("page"));
    const urlLimit = parseInt(searchParams.get("limit"));

    if (tab === "reports") {
      setPage(!isNaN(urlPage) ? urlPage : 1);
      setLimit(!isNaN(urlLimit) ? urlLimit : 12);
    } else if (tab === "users") {
      setUserPage(!isNaN(urlPage) ? urlPage : 1);
      setUserLimit(!isNaN(urlLimit) ? urlLimit : 10);
    } else {
      // aiLogs 不用从 URL 解析分页，这里忽略
    }
  }, [searchParams]);

  // ---- 只在 Reports 标签下拉取报告数据（修复 1）----
  useEffect(() => {
    if (!authState.status || authState.role !== "admin") return;
    if (activeTab !== "reports") return; // 只在 reports 页才请求
    getReportsAndSources();
  }, [authState, activeTab, page, filters, limit]);

  // Users：当前是 users 标签时才拉用户
  useEffect(() => {
    if (!authState.status || authState.role !== "admin") return;
    if (activeTab !== "users") return;
    fetchUsers(userPage, userLimit);
  }, [authState, activeTab, userPage, userLimit]);

  // AI Logs：当前是 aiLogs 标签时才拉
  useEffect(() => {
    if (!authState.status || authState.role !== "admin") return;
    if (activeTab !== "aiLogs") return;
    fetchCompanion();
    fetchCommentLogs();
  }, [authState, activeTab, cPage, cPageSize, mPage, mPageSize]);

  // 非管理员跳走
  useEffect(() => {
    if (authState.status && authState.role !== "admin") {
      navigate("/");
    }
  }, [authState, navigate]);

  const getReportsAndSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, sourcesRes] = await Promise.all([
        fetchReports(filters, page, limit),
        fetchSources(),
      ]);
      setReports(reportsRes.data.reports);
      setTotalPages(reportsRes.data.totalPages);
      setSources(sourcesRes.data.sources);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to load reports or sources.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReportStatus(id, status);
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );
    } catch (err) {
      console.error("❌ Error updating report status:", err);
      alert("Failed to update report status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      // value = { selectedStatus }; // ⛔️ 这行是无效代码，会报错 ReferenceError，已移除
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== id)
      );
    } catch (err) {
      console.error("❌ Error deleting report:", err);
      alert("Failed to delete the report.");
    }
  };

  const handleSearch = (query, extraFilters = {}) => {
    setFilters({
      search: query.trim(),
      ...extraFilters,
    });
    goToPage(1); // 搜索回到第 1 页
  };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      goToPage(pageNumber);
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

  const handleCrawlNews = async () => {
    setCrawlLoading(true);
    setCrawlMessage("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/reports/crawl-news`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCrawlMessage(res.data.message);
      getReportsAndSources();
    } catch (err) {
      console.error("❌ Error crawling news:", err);
      setCrawlMessage("❌ Failed to crawl news.");
    } finally {
      setCrawlLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummaryMessage("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/summaries/generate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSummaryMessage(res.data.message || "✅ Summary generated!");
    } catch (err) {
      console.error("❌ Error generating summary:", err);
      setSummaryMessage("❌ Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/all?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(res.data.users);
      setUserTotalPages(res.data.totalPages);
    } catch (err) {
      alert("Failed to load users");
      console.error(err);
    }
  };

  // 只负责：更新 reports 分页并同步到 URL
  const goToPage = (targetPage) => {
    if (targetPage !== page) {
      setPage(targetPage);
      navigate(`/admin?tab=reports&page=${targetPage}&limit=${limit}`);
    }
  };

  // 只负责：更新 users 分页并同步到 URL
  const goToUserPage = (targetPage) => {
    if (targetPage !== userPage) {
      setUserPage(targetPage);
      navigate(`/admin?tab=users&page=${targetPage}&limit=${userLimit}`);
    }
  };

  // 拉取 AI Companion 列表（无筛选）
  const fetchCompanion = async () => {
    setCLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/admin/ai-companion-prompts`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { page: cPage, pageSize: cPageSize },
        }
      );
      setCRows(res.data.rows || []);
      setCTotal(res.data.total || 0);
    } finally {
      setCLoading(false);
    }
  };

  // 下载 AI Companion CSV（无筛选）
  const downloadCompanionCSV = async () => {
    try {
      const url = `${
        import.meta.env.VITE_API_URL
      }/reports/admin/ai-companion-prompts?download=csv`;
      const res = await axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ai_companion_prompts_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("❌ Download companion CSV failed:", e);
      alert("Failed to download CSV. Please re-login or check permissions.");
    }
  };

  // 拉取 AI Comment 列表（无筛选）
  const fetchCommentLogs = async () => {
    setMLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/admin/ai-comment-prompts`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { page: mPage, pageSize: mPageSize },
        }
      );
      setMRows(res.data.rows || []);
      setMTotal(res.data.total || 0);
    } finally {
      setMLoading(false);
    }
  };

  // 下载 AI Comment CSV（无筛选）
  const downloadCommentCSV = async () => {
    try {
      const url = `${
        import.meta.env.VITE_API_URL
      }/reports/admin/ai-comment-prompts?download=csv`;
      const res = await axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ai_comment_prompts_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("❌ Download comment CSV failed:", e);
      alert("Failed to download CSV. Please re-login or check permissions.");
    }
  };

  const openGmailCompose = (email) => {
    const subject = encodeURIComponent("Regarding your report");
    const body = encodeURIComponent(
      `Hello ${email.split("@")[0]},\n\n\n\n\n\n— Doxxing Report Team`
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="admin-actions">
        <button
          onClick={handleCrawlNews}
          disabled={crawlLoading}
          className="crawl-btn action-btn"
        >
          {crawlLoading ? "Crawling News..." : "Crawl Latest News"}
        </button>

        <button
          onClick={handleGenerateSummary}
          disabled={summaryLoading}
          className="summary-btn action-btn"
        >
          {summaryLoading ? "Generating Summary..." : "Generate Weekly Summary"}
        </button>

        <button
          className="action-btn"
          onClick={() => {
            window.open(
              `${import.meta.env.VITE_API_URL}/reports/full-summary-csv`,
              "_blank"
            );
          }}
        >
          Export All Report Summary
        </button>
        <button
          className="action-btn"
          onClick={() => {
            window.open(
              `${import.meta.env.VITE_API_URL}/reports/user-activity-csv`,
              "_blank"
            );
          }}
        >
          Export User Activity Summary
        </button>
      </div>

      <div className="status-messages">
        {crawlMessage && <p>{crawlMessage}</p>}
        {summaryMessage && <p>{summaryMessage}</p>}
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => {
            setActiveTab("reports");
            navigate(`/admin?tab=reports&page=${page}&limit=${limit}`);
          }}
        >
          📄 Manage Reports
        </button>

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => {
            setActiveTab("users");
            // 保留用户当前分页
            navigate(`/admin?tab=users&page=${userPage}&limit=${userLimit}`);
          }}
        >
          👥 Manage Users
        </button>

        <button
          className={activeTab === "aiLogs" ? "active" : ""}
          onClick={() => {
            setActiveTab("aiLogs");
            navigate("/admin?tab=aiLogs");
          }}
        >
          🤖 AI Logs
        </button>
      </div>

      {/* Reports 列表 */}
      {activeTab === "reports" && (
        <>
          <SearchComponent
            placeholder="Search reports..."
            onSearch={handleSearch}
            sources={sources}
            showStatusFilter={true}
            filters={filters}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
          {loading && <p>Loading reports...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>URL</th>
                    <th>Author</th>
                    <th>Date Published</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>{report.title}</td>
                        <td>
                          {report.url ? (
                            <a
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                wordBreak: "break-all",
                              }}
                            >
                              {report.url}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        <td>
                          {report.userId && report.userId > 0 ? (
                            <span
                              className="username-link"
                              onClick={() => navigate(`/user/${report.userId}`)}
                            >
                              {report.author || "Anonymous"}
                            </span>
                          ) : (
                            <span className="username-label">
                              {report.author || "Bot"}
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            title={
                              report.isEstimatedDate
                                ? "⚠️ This date was inferred automatically (not found in source)"
                                : "Original publication date"
                            }
                            style={{
                              color: report.isEstimatedDate
                                ? "#d97706"
                                : "inherit",
                              fontWeight: report.isEstimatedDate
                                ? "bold"
                                : "normal",
                            }}
                          >
                            {new Date(
                              report.date_published
                            ).toLocaleDateString()}
                            {report.isEstimatedDate}
                          </span>
                        </td>

                        <td>{report.status}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() =>
                                navigate(`/admin/report/${report.id}`, {
                                  state: { fromPage: page },
                                })
                              }
                            >
                              View/Edit
                            </button>
                            {(report.status === "Pending" ||
                              report.status === "Rejected") && (
                              <>
                                {report.status !== "Approved" && (
                                  <button
                                    className="approve-btn"
                                    onClick={() =>
                                      handleStatusUpdate(report.id, "Approved")
                                    }
                                  >
                                    Approve
                                  </button>
                                )}
                                {report.status !== "Rejected" && (
                                  <button
                                    className="reject-btn"
                                    onClick={() =>
                                      handleStatusUpdate(report.id, "Rejected")
                                    }
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDelete(report.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reports 分页 */}
          <div className="pagination">
            <button onClick={() => goToPage(1)} disabled={page === 1}>
              First
            </button>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
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
            <button
              onClick={() => goToPage(totalPages)}
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
                  const newLimit = value === "all" ? 9999 : parseInt(value, 10);
                  setLimit(newLimit);
                  setPage(1);
                  navigate(`/admin?tab=reports&page=1&limit=${newLimit}`);
                }}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Users 列表 */}
      {activeTab === "users" && (
        <div className="table-container">
          <h3>Registered Users</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <span
                        className="username-link"
                        onClick={() => navigate(`/user/${user.id}`)}
                        style={{ cursor: "pointer", color: "#007bff" }}
                      >
                        {user.username}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="user-action-btn email-btn"
                        onClick={() => openGmailCompose(user.email)}
                      >
                        Send email
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Users 分页 */}
          <div className="pagination">
            <button
              onClick={() => {
                if (userPage !== 1) goToUserPage(1);
              }}
              disabled={userPage === 1}
            >
              First
            </button>
            <button
              onClick={() => {
                const newPage = userPage - 1;
                if (newPage >= 1) goToUserPage(newPage);
              }}
              disabled={userPage === 1}
            >
              Previous
            </button>
            <span>
              {userPage} / {userTotalPages}
            </span>
            <button
              onClick={() => {
                const newPage = userPage + 1;
                if (newPage <= userTotalPages) goToUserPage(newPage);
              }}
              disabled={userPage === userTotalPages}
            >
              Next
            </button>
            <input
              type="number"
              value={userInputPage}
              onChange={(e) => setUserInputPage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const pageNum = parseInt(userInputPage);
                  if (
                    !isNaN(pageNum) &&
                    pageNum >= 1 &&
                    pageNum <= userTotalPages
                  ) {
                    goToUserPage(pageNum);
                  }
                  setUserInputPage("");
                }
              }}
              placeholder="Page"
              className="page-input"
            />
            <button
              onClick={() => {
                const pageNum = parseInt(userInputPage);
                if (
                  !isNaN(pageNum) &&
                  pageNum >= 1 &&
                  pageNum <= userTotalPages
                ) {
                  goToUserPage(pageNum);
                }
                setUserInputPage("");
              }}
            >
              To
            </button>
            <button
              onClick={() => {
                if (userPage !== userTotalPages) goToUserPage(userTotalPages);
              }}
              disabled={userPage === userTotalPages}
            >
              Last
            </button>
            <div className="page-size-selector">
              <label htmlFor="user-limit-select">Per Page:</label>
              <select
                id="user-limit-select"
                value={userLimit}
                onChange={(e) => {
                  const value = e.target.value;
                  const newLimit = value === "all" ? 9999 : parseInt(value, 10);
                  setUserLimit(newLimit);
                  setUserPage(1);
                  navigate(`/admin?tab=users&page=1&limit=${newLimit}`);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* AI Logs */}
      {activeTab === "aiLogs" && (
        <div className="table-container">
          <h3>AI Companion Logs</h3>
          <div className="admin-actions" style={{ gap: 8 }}>
            <button
              className="action-btn"
              onClick={fetchCompanion}
              disabled={cLoading}
            >
              {cLoading ? "Loading..." : "Refresh"}
            </button>
            <button className="action-btn" onClick={downloadCompanionCSV}>
              Download CSV
            </button>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Per Page:</span>
              <select
                value={cPageSize}
                onChange={(e) => {
                  setCPageSize(parseInt(e.target.value, 10));
                  setCPage(1);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>createdAt</th>
                <th>userId</th>
                <th>username</th>
                <th>prompt</th>
                <th>response</th>
              </tr>
            </thead>
            <tbody>
              {cRows.length === 0 ? (
                <tr>
                  <td colSpan="4">No data</td>
                </tr>
              ) : (
                cRows.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.userId ?? ""}</td>
                    <td>{row.username ?? ""}</td>
                    <td
                      title={row.prompt}
                      style={{
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {row.prompt}
                    </td>
                    <td
                      title={row.response ?? ""}
                      style={{
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {row.response ?? ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setCPage(1)} disabled={cPage === 1}>
              First
            </button>
            <button onClick={() => setCPage(cPage - 1)} disabled={cPage === 1}>
              Previous
            </button>
            <span>
              {cPage} / {Math.max(1, Math.ceil(cTotal / cPageSize))}
            </span>
            <button
              onClick={() => setCPage(cPage + 1)}
              disabled={cPage >= Math.ceil(cTotal / cPageSize)}
            >
              Next
            </button>
            <button
              onClick={() =>
                setCPage(Math.max(1, Math.ceil(cTotal / cPageSize)))
              }
              disabled={cPage >= Math.ceil(cTotal / cPageSize)}
            >
              Last
            </button>
          </div>

          <hr style={{ margin: "24px 0" }} />

          <h3>AI Comment Logs</h3>
          <div className="admin-actions" style={{ gap: 8 }}>
            <button
              className="action-btn"
              onClick={fetchCommentLogs}
              disabled={mLoading}
            >
              {mLoading ? "Loading..." : "Refresh"}
            </button>
            <button className="action-btn" onClick={downloadCommentCSV}>
              Download CSV
            </button>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>Per Page:</span>
              <select
                value={mPageSize}
                onChange={(e) => {
                  setMPageSize(parseInt(e.target.value, 10));
                  setMPage(1);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>createdAt</th>
                <th>userId</th>
                <th>username</th>
                <th>reportId</th>
                <th>reportTitle</th>
                <th>prompt</th>
                <th>response</th>
              </tr>
            </thead>
            <tbody>
              {mRows.length === 0 ? (
                <tr>
                  <td colSpan="6">No data</td>
                </tr>
              ) : (
                mRows.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.userId}</td>
                    <td>{row.username ?? ""}</td>
                    <td>{row.reportId}</td>
                    <td
                      title={row.reportTitle ?? ""}
                      style={{
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {row.reportTitle ?? ""}
                    </td>
                    <td
                      title={row.prompt}
                      style={{
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {row.prompt}
                    </td>
                    <td
                      title={row.response ?? ""}
                      style={{
                        maxWidth: 420,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        // whiteSpace: "nowrap",
                      }}
                    >
                      {row.response ?? ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setMPage(1)} disabled={mPage === 1}>
              First
            </button>
            <button onClick={() => setMPage(mPage - 1)} disabled={mPage === 1}>
              Previous
            </button>
            <span>
              {mPage} / {Math.max(1, Math.ceil(mTotal / mPageSize))}
            </span>
            <button
              onClick={() => setMPage(mPage + 1)}
              disabled={mPage >= Math.ceil(mTotal / mPageSize)}
            >
              Next
            </button>
            <button
              onClick={() =>
                setMPage(Math.max(1, Math.ceil(mTotal / mPageSize)))
              }
              disabled={mPage >= Math.ceil(mTotal / mPageSize)}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
