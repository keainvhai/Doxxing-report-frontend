import React, { useState, useEffect } from "react";
import { fetchUserProfile, submitReport } from "../api";
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

  // ✅ 存储用户信息
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // ✅ 获取当前登录用户信息
  // useEffect(() => {
  //   const storedUser = JSON.parse(localStorage.getItem("user")); // 假设存储在 localStorage
  //   if (storedUser) {
  //     setUser(storedUser);
  //     setForm((prev) => ({
  //       ...prev,
  //       author: storedUser.email.split("@")[0] || "Anonymous", // ✅ 自动填充 author
  //     }));
  //   }
  // }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetchUserProfile();
        if (response.data.success) {
          setUser(response.data.user);
          setForm((prev) => ({
            ...prev,
            author: response.data.user.email.split("@")[0], // ✅ 自动填充 author
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    getUser();
  }, []);

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
    // formData.append("author", form.author.trim());
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

    // ✅ 传递 `userId` 到后端（如果用户已登录）
    if (user) {
      formData.append("userId", user.id);
    }

    try {
      const response = await submitReport(formData);
      console.log("Report Submitted:", response.data);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setForm({
        url: "",
        title: "",
        // author: "",
        // ✅ 保持 `author` 填充状态
        author: user?.email ? user.email.split("@")[0] : "Anonymous",
        date_published: "",
        incident_date: "",
        text: "",
        victim: "",
        // images: [],
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
          readOnly
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
