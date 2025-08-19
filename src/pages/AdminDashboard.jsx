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
  const [filters, setFilters] = useState({}); // ✅ 解决 filters 未定义问题

  // report page
  const [searchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page")) || 1;
  const initialLimit = parseInt(searchParams.get("limit")) || 12;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit); // 默认每页 12 条

  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");

  // User page
  const initialUserPage = parseInt(searchParams.get("page")) || 1;
  const initialUserLimit = parseInt(searchParams.get("limit")) || 10;
  const [userPage, setUserPage] = useState(initialUserPage);
  const [userLimit, setUserLimit] = useState(initialUserLimit);

  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userInputPage, setUserInputPage] = useState("");

  // crawl report from google news
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState("");

  // generate weekly summary
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState("");

  const [activeTab, setActiveTab] = useState("reports"); // "reports" or "users"
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

  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const userPageParam = parseInt(searchParams.get("page"));
    const userLimitParam = parseInt(searchParams.get("limit"));

    if (tab === "users") {
      setActiveTab("users");

      if (!isNaN(userPageParam)) {
        setUserPage(userPageParam);
      }
      if (!isNaN(userLimitParam)) {
        setUserLimit(userLimitParam);
      }

      fetchUsers(
        isNaN(userPageParam) ? 1 : userPageParam,
        isNaN(userLimitParam) ? 10 : userLimitParam
      );
    } else {
      setActiveTab("reports");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(userPage, userLimit);
    }
  }, [activeTab, userPage, userLimit]);

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page"));
    const resolvedPage = !isNaN(urlPage) ? urlPage : 1;
    if (resolvedPage !== page) {
      setPage(resolvedPage);
    }
  }, [searchParams]); // 🔁 每当 URL 参数变化时触发

  useEffect(() => {
    const urlLimit = parseInt(searchParams.get("limit"));
    if (!isNaN(urlLimit) && urlLimit !== limit) {
      setLimit(urlLimit);
    }
  }, [searchParams]);

  useEffect(() => {
    // ✅ 确保登录完成再加载
    if (!authState.status || authState.role !== "admin") return;

    getReportsAndSources();
  }, [authState, page, filters, limit]);

  useEffect(() => {
    if (!authState.status || authState.role !== "admin") return;
    if (activeTab === "aiLogs") {
      fetchCompanion();
      fetchCommentLogs();
    }
  }, [authState, activeTab, cPage, cPageSize, mPage, mPageSize]);

  useEffect(() => {
    if (authState.status && authState.role !== "admin") {
      navigate("/");
    }
  }, [authState]);

  const getReportsAndSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, sourcesRes] = await Promise.all([
        // fetchReports(filters, page), // ✅ 传递 `filters` 和 `page`
        fetchReports(filters, page, limit),

        fetchSources(),
      ]);
      setReports(reportsRes.data.reports);
      setTotalPages(reportsRes.data.totalPages); // ✅ 修正错误
      setSources(sourcesRes.data.sources);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to load reports or sources.");
    } finally {
      setLoading(false);
    }
  };

  // const handleApprove = async (id) => {
  //   try {
  //     await approveReport(id);
  //     setReports((prevReports) =>
  //       prevReports.map((report) =>
  //         report.id === id ? { ...report, status: "Approved" } : report
  //       )
  //     );
  //   } catch (err) {
  //     console.error("❌ Error approving report:", err);
  //     alert("Failed to approve the report.");
  //   }
  // };
  // const handleReject = async (id) => {
  //   try {
  //     await rejectReport(id);
  //     setReports((prevReports) =>
  //       prevReports.map((report) =>
  //         report.id === id ? { ...report, status: "Rejected" } : report
  //       )
  //     );
  //   } catch (err) {
  //     console.error("❌ Error rejecting report:", err);
  //     alert("Failed to reject the report.");
  //   }
  // };
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
      value = { selectedStatus };
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
    goToPage(1); // 可选
  };
  // const handleSearch = (query, extraFilters = {}) => {
  //   const filtersWithStatus =
  //     selectedStatus && selectedStatus !== "All"
  //       ? { ...extraFilters, status: selectedStatus }
  //       : extraFilters;

  //   goToPage(1); // 重置页码
  //   setFilters({ search: query.trim(), ...filtersWithStatus });
  // };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  // const handlePageJump = () => {
  //   const pageNumber = parseInt(inputPage, 10);
  //   if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
  //     setPage(pageNumber);
  //   } else {
  //     alert(`Please enter a page number between 1 and ${totalPages}!`);
  //   }
  //   setInputPage(""); // ✅ 清空输入框
  // };

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
      // ✅ 爬取完成后刷新 reports 列表
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

  const goToPage = (targetPage) => {
    if (targetPage !== page) {
      setPage(targetPage);
      navigate(`/admin?page=${targetPage}&limit=${limit}`);
    }
  };

  const goToUserPage = (targetPage) => {
    if (targetPage !== userPage) {
      setUserPage(targetPage);
      navigate(`/admin?tab=users&page=${targetPage}&limit=${userLimit}`);
      fetchUsers(targetPage, userLimit);
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
        {/* <button
          className="action-btn"
          onClick={() => {
            window.open(
              `${import.meta.env.VITE_API_URL}/reports/approved-summary-csv`,
              "_blank"
            );
          }}
        >
          Export Approved Report Summary
        </button> */}
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
          onClick={() => setActiveTab("reports")}
        >
          📄 Manage Reports
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={async () => {
            setActiveTab("users");
            goToUserPage(1); // 重置页码
          }}
        >
          👥 Manage Users
        </button>

        <button
          className={activeTab === "aiLogs" ? "active" : ""}
          onClick={() => setActiveTab("aiLogs")}
        >
          🤖 AI Logs
        </button>
      </div>

      {/* ✅ 报告管理部分 */}
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
                          {/* <span
                            className="username-link"
                            onClick={() => navigate(`/user/${report.userId}`)}
                          >
                            {report.author || "Anonymous"}
                          </span> */}
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
                        {/* <td>
                          {new Date(report.date_published).toLocaleDateString()}
                        </td> */}
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
                                : "inherit", // amber color
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
                                  state: { fromPage: page }, // ✅ 添加当前页码
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

          {/* ✅ 分页控件也只在 reports 页面展示 */}
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
                  setPage(1); // 重置页码
                  navigate(`/admin?page=1&limit=${newLimit}`);
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

      {/* ✅ 用户管理表格 */}
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
                    {/* <td>{user.username}</td> */}
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
                      {/* <button className="user-action-btn message-btn">
                        Send message
                      </button> */}
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
          <div className="pagination">
            <button
              onClick={() => {
                if (userPage !== 1) {
                  goToUserPage(1);
                }
              }}
              disabled={userPage === 1}
            >
              First
            </button>
            <button
              onClick={() => {
                const newPage = userPage - 1;
                if (newPage >= 1) {
                  goToUserPage(newPage);
                }
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
                if (newPage <= userTotalPages) {
                  goToUserPage(newPage);
                }
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
                if (userPage !== userTotalPages) {
                  goToUserPage(userTotalPages);
                }
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
                // onChange={(e) => {
                //   const val = e.target.value;
                //   const newLimit = val === "all" ? 9999 : parseInt(val, 10);
                //   setUserLimit(newLimit);
                //   goToUserPage(1);
                // }}
                onChange={(e) => {
                  const value = e.target.value;
                  const newLimit = value === "all" ? 9999 : parseInt(value, 10);
                  setUserLimit(newLimit);
                  setUserPage(1); // 重置页码
                  navigate(`/admin?tab=users&page=1&limit=${newLimit}`);
                  fetchUsers(1, newLimit);
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.prompt}
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
                        whiteSpace: "nowrap",
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.prompt}
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
