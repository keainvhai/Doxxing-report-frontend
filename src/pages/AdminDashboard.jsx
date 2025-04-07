import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import SearchComponent from "../components/SearchComponent";
import {
  fetchReports,
  fetchSources,
  approveReport,
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
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    console.log("🌍 VITE_API_URL:", import.meta.env.VITE_API_URL);
  }, []);

  useEffect(() => {
    if (authState.role !== "admin") {
      navigate("/");
    }
    getReportsAndSources();
  }, [authState, filters, navigate, page]); // ✅ 监听 `page` 变化

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

  const handleApprove = async (id) => {
    try {
      await approveReport(id);
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === id ? { ...report, status: "Approved" } : report
        )
      );
    } catch (err) {
      console.error("❌ Error approving report:", err);
      alert("Failed to approve the report.");
    }
  };

  const handleReject = async (id) => {
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

  // const handleSearch = (query) => {
  //   setPage(1); // ✅ 搜索时重置 `page`
  //   setFilters({ search: query.trim() });
  //   getReportsAndSources();
  // };
  const handleSearch = (query, extraFilters = {}) => {
    setPage(1); // 重置页码
    setFilters({ search: query.trim(), ...extraFilters });
  };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    } else {
      alert(`Please enter a page number between 1 and ${totalPages}!`);
    }
    setInputPage(""); // ✅ 清空输入框
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
                        <td>{report.author || "Anonymous"}</td>
                        <td>
                          {new Date(report.date_published).toLocaleDateString()}
                        </td>
                        <td>{report.status}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() =>
                                navigate(`/admin/report/${report.id}`)
                              }
                            >
                              View/Edit
                            </button>
                            {report.status === "Pending" && (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() => handleApprove(report.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="reject-btn"
                                  onClick={() => handleReject(report.id)}
                                >
                                  Reject
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
            <button onClick={() => setPage(1)} disabled={page === 1}>
              First
            </button>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
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
              onClick={() => setPage(totalPages)}
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
                      <button className="user-action-btn message-btn">
                        Send message
                      </button>
                      <button className="user-action-btn email-btn">
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
