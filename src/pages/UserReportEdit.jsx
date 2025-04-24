import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUserReportById,
  updateUserReport,
  fetchUserProfile,
} from "../api";
import "../styles/UserReportEdit.css";

const UserReportEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    text: "",
    victim: "",
    date_published: "",
    incident_date: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 处理日期格式，确保前端 input[type="date"] 能正确识别
  const formatDate = (dateString) => {
    if (!dateString || dateString === "Invalid date") {
      return ""; // ✅ 或 null，根据需求
    }
    return dateString.split("T")[0];
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetchUserProfile();
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const getReport = async () => {
      try {
        const { data } = await fetchUserReportById(id);
        setReport(data);
        setForm({
          url: data.url || "",
          title: data.title || "",
          author: data.author || "Anonymous",
          text: data.text || "",
          victim: data.victim || "Unknown",
          date_published: formatDate(data.date_published),
          incident_date: formatDate(data.incident_date),
        });
      } catch (error) {
        console.error("❌ Error fetching report:", error);
      }
    };

    getReport();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updateForm = {
      ...form,
      incident_date: form.incident_date || null, // ✅ 兜底处理
    };
    try {
      await updateUserReport(id, updateForm);
      setToastMessage("✅ Report updated successfully!");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("❌ Error updating report:", error);
      setToastMessage("❌ Failed to update report.");
      setShowToast(true);

      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="user-report-edit-container">
      {showToast && <div className="toast">{toastMessage}</div>}

      <div className="user-report-edit">
        <h2>Edit Your Report</h2>

        <form onSubmit={handleUpdate} className="edit-form">
          <label>🔗 Report URL</label>
          <input
            type="text"
            name="url"
            value={form.url}
            onChange={handleChange}
            required
          />

          <label>📝 Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>✍️ Author</label>
          <input type="text" name="author" value={form.author} readOnly />

          <label>📝 Description</label>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            rows="5"
          />

          <label>👤 Victim</label>
          <input
            type="text"
            name="victim"
            value={form.victim}
            onChange={handleChange}
          />

          <label>📅 Date Published</label>
          <input
            type="date"
            name="date_published"
            value={form.date_published}
            onChange={handleChange}
            required
          />

          <label>⚠️ Incident Date</label>
          <input
            type="date"
            name="incident_date"
            value={form.incident_date}
            onChange={handleChange}
          />

          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserReportEdit;
