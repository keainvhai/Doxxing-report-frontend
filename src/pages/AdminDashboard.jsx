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
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState("");
  // User page
  const [userPage, setUserPage] = useState(1);
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

  const navigate = useNavigate();

  // useEffect(() => {
  //   // 🚨 等待 authState 加载完成
  //   if (authState.role === undefined) return;

  //   const urlPage = parseInt(searchParams.get("page"));
  //   const resolvedPage = !isNaN(urlPage) ? urlPage : 1;

  //   if (authState.role !== "admin") {
  //     navigate("/");
  //     return;
  //   }

  //   if (resolvedPage !== page) {
  //     setPage(resolvedPage); // ✅ 触发更新页面后，第二个 useEffect 会执行
  //     return;
  //   }
  //   getReportsAndSources();
  // }, [authState, filters, navigate, page, searchParams]); // ✅ 监听 `page` 变化
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page"));
    const resolvedPage = !isNaN(urlPage) ? urlPage : 1;
    if (resolvedPage !== page) {
      setPage(resolvedPage);
    }
  }, [searchParams]); // 🔁 每当 URL 参数变化时触发
  useEffect(() => {
    // ✅ 确保登录完成再加载
    if (!authState.status || authState.role !== "admin") return;

    getReportsAndSources();
  }, [authState, page, filters]);
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
        fetchReports(filters, page), // ✅ 传递 `filters` 和 `page`
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
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== id)
      );
    } catch (err) {
      console.error("❌ Error deleting report:", err);
      alert("Failed to delete the report.");
    }
  };

  const handleSearch = (query, extraFilters = {}) => {
    goToPage(1); // 重置页码
    setFilters({ search: query.trim(), ...extraFilters });
  };

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

  const fetchUsers = async (page = 1) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/all?page=${page}`,
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
      navigate(`/admin?page=${targetPage}`);
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
              `${import.meta.env.VITE_API_URL}/reports/approved-summary-csv`,
              "_blank"
            );
          }}
        >
          Export Approved Report Summary
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
            setUserPage(1); // 重置页码
            fetchUsers(1); // 加载第一页
          }}
        >
          👥 Manage Users
        </button>
      </div>

      {/* ✅ 报告管理部分 */}
      {activeTab === "reports" && (
        <>
          <SearchComponent
            placeholder="Search reports..."
            onSearch={handleSearch}
            sources={sources}
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
                        <td>
                          {new Date(report.date_published).toLocaleDateString()}
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
                    <td>{user.username}</td>
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
                  setUserPage(1);
                  fetchUsers(1);
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
                  setUserPage(newPage);
                  fetchUsers(newPage);
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
                  setUserPage(newPage);
                  fetchUsers(newPage);
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
                    setUserPage(pageNum);
                    fetchUsers(pageNum);
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
                  setUserPage(pageNum);
                  fetchUsers(pageNum);
                }
                setUserInputPage("");
              }}
            >
              To
            </button>
            <button
              onClick={() => {
                if (userPage !== userTotalPages) {
                  setUserPage(userTotalPages);
                  fetchUsers(userTotalPages);
                }
              }}
              disabled={userPage === userTotalPages}
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
