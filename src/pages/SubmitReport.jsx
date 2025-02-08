import React, { useState } from "react";
import { submitReport } from "../api";
import "../styles/Form.css";

const SubmitReport = () => {
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    date_published: "",
    incident_date: "",
    text: "",
    victim: "",
  });

  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ 确保字段值不会是 undefined 或者 null
    formData.append("url", form.url.trim());
    formData.append("title", form.title.trim());
    formData.append(
      "author",
      form.author.trim() === "" ? "Anonymous" : form.author
    );
    formData.append(
      "date_published",
      form.date_published ? new Date(form.date_published).toISOString() : ""
    );
    formData.append(
      "incident_date",
      form.incident_date ? new Date(form.incident_date).toISOString() : ""
    );
    formData.append("text", form.text.trim());
    formData.append(
      "victim",
      form.victim.trim() === "" ? "Unknown" : form.victim
    );

    // ✅ 检查 `images` 是否存在，避免 undefined 错误
    if (form.images && form.images.length > 0) {
      form.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    try {
      const response = await submitReport(formData);
      console.log("Report Submitted:", response.data);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setForm({
        url: "",
        title: "",
        author: "",
        date_published: "",
        incident_date: "",
        text: "",
        victim: "",
        images: [], // ✅ 确保 images 重新初始化
      });
    } catch (error) {
      console.error(
        "Submission failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="form-container">
      <h2>Submit a Doxxing Report</h2>

      {/* ✅ 小窗口 Toast 通知 */}
      {showToast && (
        <div className="toast">✅ Report submitted successfully!</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Report URL */}
        <label htmlFor="url">🔗 Report URL *</label>
        <input
          type="text"
          placeholder="Report URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          required
        />
        {/* Title */}
        <label htmlFor="title">📝 Title *</label>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        {/* Author */}
        <label htmlFor="author">✍️ Author</label>
        <input
          type="text"
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
        {/* Victim */}
        <label htmlFor="victim">👤 Victim (Optional)</label>
        <input
          type="text"
          placeholder="Victim Name"
          value={form.victim}
          onChange={(e) => setForm({ ...form, victim: e.target.value })}
        />

        {/* Date Published */}
        <label htmlFor="date_published">📅 Date Published *</label>
        <input
          type="date"
          value={form.date_published}
          onChange={(e) => setForm({ ...form, date_published: e.target.value })}
          required
        />

        {/* Incident Date */}
        <label htmlFor="incident_date">⚠️ Incident Date (Optional)</label>
        <input
          type="date"
          value={form.incident_date}
          onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
        />

        {/* Report Text */}
        <label htmlFor="text">📝 Description (Optional)</label>
        <textarea
          placeholder="Description"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        ></textarea>

        {/* Image Upload */}
        {/* <label htmlFor="images">🖼️ Upload Images</label>
        <input
          type="file"
          multiple
          onChange={(e) => setForm({ ...form, images: [...e.target.files] })}
        /> */}
        <div className="button-container">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default SubmitReport;
