import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001" });

// Submit a report (now supports images)
export const submitReport = (formData) =>
  API.post("/reports/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get all reports
export const fetchReports = () => API.get("/reports");

// admin Get reports by id
export const fetchReportById = (id) => API.get(`/reports/${id}`);

// ✅admin  更新 Report API，确保发送 FormData
export const updateReport = (id, formData) =>
  API.put(`/reports/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }, // 必须加 multipart 头
  });

// Approve a report
export const approveReport = (id) => API.post("/reports/approve", { id });

// Delete a report
export const deleteReport = (id) => API.post("/reports/delete", { id });

//Gengerate image by id, for ReportEdit.jsx
export const generateReportImage = (id) =>
  API.post(`/reports/generate-image/${id}`);

// 用于 SubmitReport.jsx，基于用户输入的 title + url + text 生成 AI 图片
export const generateReportImageByInput = async (title, url, text) => {
  return await API.post("/reports/generate-image", { title, url, text });
};

//Search method
export const searchReports = (query) =>
  API.get("/reports", { params: { search: query.trim() } });

// get all Approved report
export const fetchApprovedReports = (filters = {}) =>
  API.get("/reports/approved", { params: filters });

// 获取所有可用的 source 域名
export const fetchSources = () => API.get("/reports/sources");

// 获取所有 unique 的 entities 及其 incident 数量
export const fetchEntities = () => API.get("/reports/entities");

// ✅ 动态获取 `Authorization` 头
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("accessToken");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// ✅ 获取当前用户的所有 Reports
// 🔴 需要 `Authorization` 的 API
// export const fetchUserReports = () =>
//   API.get("/users/reports", { headers: getAuthHeaders() });

// export const fetchUserProfile = () =>
//   API.get("/users/auth", { headers: getAuthHeaders() });

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 获取用户信息（包含所有 reports）
export const fetchUserProfile = () => API.get("/users/profile");

// 更新 `username`
export const updateUsername = (username) =>
  API.put("/users/update-username", { username });

// 用户获取自己提交的单个 Report
export const fetchUserReportById = (id) => API.get(`/reports/user/${id}`);

// 用户更新自己的 Report
// export const updateUserReport = (id, formData) =>
//   API.put(`/reports/user/update/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
export const updateUserReport = (id, formData) =>
  API.put(`/reports/user/update/${id}`, formData);
