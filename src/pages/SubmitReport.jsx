import React, { useState, useEffect, useContext } from "react";
import { submitReport } from "../api";
import { AuthContext } from "../helpers/AuthContext"; // ✅ 引入 AuthContext
import "../styles/Form.css";

const SubmitReport = () => {
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "Anonymous",
    date_published: "",
    incident_date: "",
    text: "",
    victim: "",
  });

  // ✅ 存储用户信息
  const { authState } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // ✅ 获取当前登录用户信息

  // ✅ 在 `localStorage` 里查找 `user`
  // useEffect(() => {
  //   console.log("🔍 localStorage 内容:", localStorage.getItem("user")); // ✅ 调试代码

  //   const storedUser = localStorage.getItem("user");

  //   if (storedUser) {
  //     const parsedUser = JSON.parse(storedUser);
  //     console.log("📌 检测到已登录用户:", parsedUser);

  //     setUser(parsedUser);
  //     setForm((prev) => ({
  //       ...prev,
  //       author: parsedUser.username || parsedUser.email.split("@")[0], // ✅ 自动填充 author
  //     }));
  //   } else {
  //     console.log("📌 未找到登录用户，保持 author 为 Anonymous");
  //     setUser(null); // ✅ 退出登录后，user 变成 null
  //     setForm((prev) => ({
  //       ...prev,
  //       author: "Anonymous",
  //     }));
  //   }
  // }, [authState]);

  useEffect(() => {
    console.log("🔍 当前 authState:", authState);

    if (authState.status) {
      setUser(authState);
      setForm((prev) => ({
        ...prev,
        author: authState.username || authState.email.split("@")[0], // ✅ 自动填充 author
      }));
    } else {
      setUser(null);
      setForm((prev) => ({
        ...prev,
        author: "Anonymous",
      }));
    }
  }, [authState]); // ✅ 监听 `authState` 变化

  // useEffect(() => {
  //   const token = localStorage.getItem("accessToken");

  //   if (!token) {
  //     console.log("📌 用户未登录，使用默认匿名提交");
  //     return;
  //   }

  //   // const getUser = async () => {
  //   //   try {
  //   //     const response = await fetchUserProfile();
  //   //     if (response.data.success) {
  //   //       setUser(response.data.user);
  //   //       setForm((prev) => ({
  //   //         ...prev,
  //   //         author:
  //   //           response.data.user.username ||
  //   //           response.data.user.email.split("@")[0], // ✅ 自动填充 author
  //   //       }));
  //   //     }
  //   //   } catch (error) {
  //   //     console.error("Error fetching user profile:", error);
  //   //   }
  //   // };

  //   // getUser();
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ 确保字段值不会是 undefined 或者 null
    formData.append("url", form.url.trim());
    formData.append("title", form.title.trim());
    // formData.append(
    //   "author",
    //   form.author.trim() === "" ? "Anonymous" : form.author
    // );

    // ✅ 处理 `author`，如果 `user` 为空，则设为 "Anonymous"
    const author = user?.email ? user.email.split("@")[0] : "Anonymous";
    formData.append("author", author);

    // formData.append("author", form.author.trim());

    // formData.append(
    //   "date_published",
    //   form.date_published ? new Date(form.date_published).toISOString() : ""
    // );
    // formData.append(
    //   "incident_date",
    //   form.incident_date ? new Date(form.incident_date).toISOString() : ""
    // );

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : "";
    formData.append("date_published", formatDate(form.date_published));
    formData.append("incident_date", formatDate(form.incident_date));

    formData.append("text", form.text.trim());
    formData.append(
      "victim",
      form.victim.trim() === "" ? "Unknown" : form.victim
    );

    // ✅ 传递 `userId` 到后端（如果用户已登录）
    // if (user) {
    //   formData.append("userId", user.id);
    // }
    formData.append("userId", user?.id || "");

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
