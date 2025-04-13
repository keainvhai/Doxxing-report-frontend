import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchReportById, updateReport, generateReportImage } from "../api";
import { useLocation } from "react-router-dom";

import "../styles/ReportEdit.css";
const API_URL = import.meta.env.VITE_API_URL;

const ReportEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    date_published: "",
    incident_date: "",
    text: "",
    victim: "",
    entity: "",
    images: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [showToast, setShowToast] = useState(false); // ✅ 控制 Toast 状态
  const [toastMessage, setToastMessage] = useState(""); // ✅ 动态设置 Toast 消息
  const [generating, setGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null); // ✅ 存储 AI 生成的图片 URL

  const location = useLocation();
  const fromPage = location.state?.fromPage || 1; // 默认为第一页

  // 处理日期格式，确保前端 input[type="date"] 能正确识别
  const formatDate = (dateString) => {
    return dateString ? dateString.split("T")[0] : "";
  };

  useEffect(() => {
    const getReport = async () => {
      try {
        const { data } = await fetchReportById(id);
        // ✅ 打印后端返回的数据！
        // console.log("🔥 API Response data:", data);
        setReport(data);
        setForm({
          url: data.url || "",
          title: data.title || "",
          author: data.author || "Anonymous",
          date_published: formatDate(data.date_published),
          incident_date: formatDate(data.incident_date),
          text: data.text || "",
          victim: data.victim || "",
          entity: data.entity || "",
          // images: data.images ? JSON.parse(data.images) : [],
          images: data.images
            ? typeof data.images === "string"
              ? JSON.parse(data.images)
              : data.images
            : [],
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

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      const { data } = await generateReportImage(id);
      if (data.imageUrl) {
        // ✅ 存储 OpenAI 生成的图片 URL
        console.log("✅ AI Generated Image URL:", data.imageUrl);
        setGeneratedImageUrl(data.imageUrl);
        if (!form.images.includes(data.imageUrl)) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.imageUrl],
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error generating image:", error);
    }
    setGenerating(false);
  };

  const handleDeleteImage = (img) => {
    setDeletedImages([...deletedImages, img]);
    setForm({ ...form, images: form.images.filter((image) => image !== img) });
  };

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "images") formData.append(key, form[key]);
    });

    formData.append("deletedImages", JSON.stringify(deletedImages));

    // ✅ 先添加 Cloudinary 链接（从 form.images 里来）
    form.images.forEach((img) => {
      if (typeof img === "string") {
        formData.append("images", img);
      }
    });

    // ✅ 再添加用户新上传的文件（File 对象）
    newImages.forEach((file) => {
      if (typeof file !== "string") {
        formData.append("images", file);
      }
    });

    try {
      await updateReport(id, formData);
      setToastMessage("✅ Report updated successfully!");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate(`/admin?page=${fromPage}`);
      }, 3000);
    } catch (err) {
      console.error("❌ Error updating report:", err);
      setToastMessage("❌ Failed to update report.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmitting(false);
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
            form.images.map((img, index) => {
              // // ✅ 手动清除 localhost 前缀
              // const cleanedImg = img.replace(
              //   /http(s)?:\/\/localhost:3001/g,
              //   ""
              // );

              // console.log(`清理后 cleanedImg [${index}]:`, cleanedImg);

              return (
                <div key={index}>
                  <img
                    key={index}
                    src={img}
                    // src={cleanedImg}

                    // src={`${JSON.parse(report.images)[0]}`}
                    // src={`${API_URL}${img}`}
                    // src={img.startsWith("http") ? img : `${API_URL}${img}`}
                    // alt="Report"
                    alt={`Report-${index}`}
                    className="edit-image"
                  />
                  <button onClick={() => handleDeleteImage(img)}>Delete</button>
                </div>
              );
            })
          ) : (
            <p>No images uploaded</p>
          )}
        </div>
        <button onClick={handleGenerateImage} disabled={generating}>
          {generating ? "Generating..." : "Generate Image with AI"}
        </button>
        {generatedImageUrl && (
          <div>
            <p>✅ AI Generated Image:</p>
            <img
              src={generatedImageUrl}
              alt="AI Generated"
              style={{ width: "300px" }}
            />
            {/* 直接下载图片 */}

            <button onClick={handleDownload}>Download Image</button>
          </div>
        )}

        <label>🖼️ Upload New Images</label>
        <input
          type="file"
          multiple
          onChange={(e) => setNewImages([...e.target.files])}
        />
        <div className="button-container">
          <button
            className="save-btn"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReportEdit;
