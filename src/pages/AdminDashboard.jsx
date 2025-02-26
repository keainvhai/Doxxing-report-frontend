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
import { AuthContext } from "../helpers/AuthContext";

const AdminDashboard = () => {
  const { authState } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({}); // ✅ 解决 filters 未定义问题

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(""); // ✅ 添加输入框的页码

  const navigate = useNavigate();

  useEffect(() => {
    if (authState.role !== "admin") {
      navigate("/");
    }
    getReportsAndSources();
  }, [authState, navigate, page]); // ✅ 监听 `page` 变化

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

  const handleSearch = (query) => {
    setPage(1); // ✅ 搜索时重置 `page`
    setFilters({ search: query.trim() });
    getReportsAndSources();
  };

  const handlePageChange = (event) => {
    setInputPage(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = parseInt(inputPage, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    } else {
      alert(`请输入 1 到 ${totalPages} 之间的页码！`);
    }
    setInputPage(""); // ✅ 清空输入框
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handlePageJump();
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

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
                          onClick={() => navigate(`/admin/report/${report.id}`)}
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

      {/* ✅ 分页控件 */}
      <div className="pagination">
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
        {/* ✅ 输入框+按钮支持跳转 */}
        <input
          type="number"
          value={inputPage}
          onChange={handlePageChange}
          onKeyPress={handleKeyPress}
          placeholder="page"
          className="page-input"
        />
        <button onClick={handlePageJump}>To</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
