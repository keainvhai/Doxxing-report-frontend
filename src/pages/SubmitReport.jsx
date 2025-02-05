import React, { useState } from "react";
import { submitReport } from "../api";
import "../styles/Form.css";

const SubmitReport = () => {
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    date_published: "",
    date_downloaded: "",
    incident_date: "",
    text: "",
    victim: "",
  });

  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // 自动设置 author 为 "Anonymous" 如果为空
    const reportData = {
      ...form,
      author: form.author.trim() === "" ? "Anonymous" : form.author,
    };

    // 添加文本字段
    Object.keys(reportData).forEach((key) => {
      if (key !== "images") formData.append(key, reportData[key]);
    });

    // 添加图片
    form.images.forEach((image) => {
      formData.append("images", image);
    });

    await submitReport(formData);

    console.log("Report Submitted:", formData);

    // alert("Report submitted!");
    setShowToast(true); // ✅ 显示 Toast
    setTimeout(() => setShowToast(false), 3000); // ✅ 3秒后自动关闭

    setForm({
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
          required
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
          required
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
