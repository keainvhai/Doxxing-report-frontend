import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReportById, updateReport } from "../api";
import "../styles/ReportEdit.css"; // ✅ 添加新的 CSS

const ReportEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    date_published: "",
    date_downloaded: "",
    incident_date: "",
    text: "",
    victim: "",
    entity: "",
    images: [],
  });

  const [newImages, setNewImages] = useState([]);

  const [showToast, setShowToast] = useState(false); // ✅ 控制 Toast 状态
  const [toastMessage, setToastMessage] = useState(""); // ✅ 动态设置 Toast 消息

  // 处理日期格式，确保前端 input[type="date"] 能正确识别
  const formatDate = (dateString) => {
    return dateString ? dateString.split("T")[0] : "";
  };

  useEffect(() => {
    const getReport = async () => {
      try {
        const { data } = await fetchReportById(id);
        setReport(data);
        setForm({
          url: data.url || "",
          title: data.title || "",
          author: data.author || "Anonymous",
          date_published: formatDate(data.date_published),
          date_downloaded: formatDate(data.date_downloaded),
          incident_date: formatDate(data.incident_date),
          text: data.text || "",
          victim: data.victim || "", // ✅ 载入 victim 数据
          entity: data.entity || "", // ✅ 载入 entity 数据
          images: data.images ? JSON.parse(data.images) : [],
        });
      } catch (err) {
        console.error("❌ Error fetching report:", err);
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    getReport();
  }, [id]);

  const handleUpdate = async () => {
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "images") formData.append(key, form[key]);
    });

    // 添加新图片
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await updateReport(id, formData);
      // alert("✅ Report updated successfully!");
      // navigate("/admin");
      setToastMessage("✅ Report updated successfully!");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate("/admin"); // ✅ 3 秒后跳转到 Admin
      }, 3000);
    } catch (err) {
      console.error("❌ Error updating report:", err);
      // alert("Failed to update report.");
      // ✅ 显示错误消息
      setToastMessage("❌ Failed to update report.");
      setShowToast(true);

      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="report-edit-container">
      {/* ✅ Toast Notification */}
      {showToast && <div className="toast">{toastMessage}</div>}

      <div className="report-edit">
        <h2>Edit Report</h2>

        <label>🔗 Report URL</label>
        <input
          type="text"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <label>📝 Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <label>✍️ Author</label>
        <input
          type="text"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
        {/* Victim */}
        <label>👤 Victim</label>
        <input
          type="text"
          value={form.victim}
          onChange={(e) => setForm({ ...form, victim: e.target.value })}
          required
        />

        {/* Entity */}
        <label>🏢 Entity</label>
        <input
          type="text"
          value={form.entity}
          onChange={(e) => setForm({ ...form, entity: e.target.value })}
          required
        />

        <label>📅 Date Published</label>
        <input
          type="date"
          value={form.date_published}
          onChange={(e) => setForm({ ...form, date_published: e.target.value })}
        />
        <label>⬇️ Date Downloaded</label>
        <input
          type="date"
          value={form.date_downloaded}
          onChange={(e) =>
            setForm({ ...form, date_downloaded: e.target.value })
          }
        />
        <label>⚠️ Incident Date</label>
        <input
          type="date"
          value={form.incident_date}
          onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
        />
        <label>📝 Description</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <label>🖼️ Current Images</label>
        <div className="image-preview">
          {form.images.length > 0 ? (
            form.images.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:3001${img}`}
                alt="Report"
                className="edit-image"
              />
            ))
          ) : (
            <p>No images uploaded</p>
          )}
        </div>
        <label>🖼️ Upload New Images</label>
        <input
          type="file"
          multiple
          onChange={(e) => setNewImages([...e.target.files])}
        />
        <div className="button-container">
          <button className="save-btn" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReportEdit;
