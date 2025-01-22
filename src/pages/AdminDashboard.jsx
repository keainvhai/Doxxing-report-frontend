import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import SearchComponent from "../components/SearchComponent";
import { fetchReports, approveReport, deleteReport } from "../api";
import { AuthContext } from "../helpers/AuthContext";

const AdminDashboard = () => {
  const { authState } = useContext(AuthContext);

  const [reports, setReports] = useState([]); // ✅ 存储所有 reports
  const [filteredReports, setFilteredReports] = useState([]); // ✅ 过滤后的 reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // 未登录的用户跳转到登录页
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/login");
    // }
    if (authState.role !== "admin") {
      navigate("/");
    }

    const getReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchReports(); // ✅ 获取所有 reports（`Pending` & `Approved`）
        setReports(response.data);
        setFilteredReports(response.data); // ✅ 初始时显示所有 reports
      } catch (err) {
        console.error("❌ Error fetching reports:", err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    getReports();
  }, [authState, navigate]);

  const handleApprove = async (id) => {
    try {
      await approveReport(id);
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === id ? { ...report, status: "Approved" } : report
        )
      );
      setFilteredReports((prevReports) =>
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
      setFilteredReports((prevReports) =>
        prevReports.filter((report) => report.id !== id)
      );
    } catch (err) {
      console.error("❌ Error deleting report:", err);
      alert("Failed to delete the report.");
    }
  };

  // ✅ 处理搜索（不区分 `Approved` 和 `Pending`，都可以搜索）
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredReports([...reports]); // ✅ 如果搜索框为空，恢复所有数据
    } else {
      setFilteredReports(
        reports.filter(
          (report) =>
            report.title.toLowerCase().includes(query.toLowerCase()) ||
            (report.author &&
              report.author.toLowerCase().includes(query.toLowerCase()))
        )
      );
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* ✅ 搜索组件 */}
      <SearchComponent
        placeholder="Search admin reports..."
        onSearch={handleSearch}
      />

      {loading && <p>Loading reports...</p>}
      {error && <p className="error">{error}</p>}

      {/* ✅ 显示 reports */}
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
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
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
    </div>
  );
};

export default AdminDashboard;
