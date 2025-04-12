import React, { useState, useEffect, useContext, useRef } from "react";
import { submitReport, generateReportImageByInput } from "../api";
import { AuthContext } from "../helpers/AuthContext"; // ✅ 引入 AuthContext
import "../styles/Form.css";

const API_URL = import.meta.env.VITE_API_URL;

const SubmitReport = () => {
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "Anonymous",
    date_published: "",
    incident_date: "",
    text: "",
    victim: "",
    images: [],
  });

  const fileInputRef = useRef(null); // ✅ 创建 ref 绑定文件输入框

  // ✅ 存储用户信息
  const { authState } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // ✅ 动态 Toast 消息
  const [newImages, setNewImages] = useState([]); // ✅ 处理上传的新图片
  const [generating, setGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null); // ✅ 存储 AI 生成的图片 URL

  const [urlError, setUrlError] = useState("");

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

  const handleGenerateImage = async () => {
    if (!form.title || !form.url) {
      console.error("❌ Title or URL is missing, cannot generate image.");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await generateReportImageByInput(
        form.title,
        form.url,
        form.text
      );

      if (data.imageUrl) {
        console.log("✅ AI Generated Image URL:", data.imageUrl);
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (error) {
      console.error("❌ Error generating image:", error);
    }
    setGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚫 检查是否是本站链接
    const isSelfUrl = form.url.startsWith("https://doxxing-report");
    if (isSelfUrl) {
      setToastMessage(
        "⚠️ This URL is from our own platform. Thank you, but please report new doxxing incidents from other resources."
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return; // 阻止继续提交
    }

    const formData = new FormData();

    // ✅ 确保字段值不会是 undefined 或者 null
    formData.append("url", form.url.trim());
    formData.append("title", form.title.trim());

    // ✅ 处理 `author`，如果 `user` 为空，则设为 "Anonymous"
    // const author = user?.email ? user.email.split("@")[0] : "Anonymous";
    const author = user?.status ? user.username : "Anonymous";
    formData.append("author", author);

    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : "";
    formData.append("date_published", formatDate(form.date_published));
    formData.append("incident_date", formatDate(form.incident_date));

    formData.append("text", form.text.trim());
    formData.append(
      "victim",
      form.victim.trim() === "" ? "Unknown" : form.victim
    );
    formData.append("userId", user?.id || "");

    //确保正确添加 `images`
    if (newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append("images", image);
      });
      // console.log("📌 Images added to FormData:", newImages); // ✅ 检查图片是否添加到 FormData
    } else {
      console.log("🚨 No images selected.");
    }
    try {
      const response = await submitReport(formData);
      console.log("Report Submitted:", response.data);

      setToastMessage("✅ Report submitted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setForm({
        url: "",
        title: "",
        // author: "",
        // ✅ 保持 `author` 填充状态
        // author: user?.email ? user.email.split("@")[0] : "Anonymous",
        author: user?.status ? user.username : "Anonymous", // **保持正确的 author**
        date_published: "",
        incident_date: "",
        text: "",
        victim: "",
        images: [],
      });
      setGeneratedImageUrl(null); // ✅ 清空 AI 生成的图片
      setNewImages([]); // ✅ 清空上传的图片

      // ✅ **清空文件输入框**
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "❌ Submission failed:",
        error.response ? error.response.data : error.message
      );
      setToastMessage("❌ Failed to submit report.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) {
      console.error("No image URL available");
      return;
    }

    try {
      // 让后端代理下载 OpenAI 生成的图片
      const response = await fetch(
        `${API_URL}/api/download-image?imageUrl=${encodeURIComponent(
          generatedImageUrl
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      // 📌 获取 Blob 数据
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // 📌 触发下载
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `AI_Image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 释放 URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("❌ Download failed", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Submit a Doxxing Report</h2>

      {/* ✅ 小窗口 Toast 通知 */}
      {showToast && <div className="toast">{toastMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* Report URL */}
        <label htmlFor="url">🔗 Report URL *</label>
        <input
          type="text"
          placeholder="Report URL"
          value={form.url}
          onChange={(e) => {
            const value = e.target.value;
            setForm({ ...form, url: value });

            // 🚫 实时检测 URL 是否为本站链接
            if (value.startsWith("https://doxxing-report")) {
              setUrlError(
                "⚠️ This URL is from our own platform. Please report a new incident."
              );
            } else {
              setUrlError("");
            }
          }}
          required
        />
        {/* 🚫 显示错误信息 */}
        {urlError && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
            {urlError}
          </p>
        )}
        {/* Title */}
        <label htmlFor="title">📝 Title *</label>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
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
        <label htmlFor="images">🖼️ Upload Images</label>

        {/* AI 生成图片 */}
        <button
          className="ai-img-btn"
          onClick={handleGenerateImage}
          disabled={generating}
          type="button"
        >
          {generating ? "Generating..." : "Generate Image with AI"}
        </button>
        <p style={{ fontSize: "14px", color: "gray" }}>
          Generating AI image may take up to 1 minute.
        </p>

        {generatedImageUrl && (
          <div className="ai-img-container">
            <p>✅ AI Generated Image:</p>

            <img
              src={generatedImageUrl}
              alt="AI Generated"
              style={{ width: "300px" }}
            />
            <button
              onClick={handleDownload}
              type="button"
              className="download-img-btn"
            >
              Download Image
            </button>
          </div>
        )}

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={(e) => {
            // console.log("📌 Selected Files:", e.target.files);
            setNewImages([...e.target.files]);
          }}
        />

        <div className="button-container">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default SubmitReport;
