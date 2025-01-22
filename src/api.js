import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001" });

// Submit a report (now supports images)
export const submitReport = (formData) =>
  API.post("/reports/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Get all reports
export const fetchReports = () => API.get("/reports");

// Get reports by id
export const fetchReportById = (id) => API.get(`/reports/${id}`);
// ✅ 更新 Report API，确保发送 FormData
export const updateReport = (id, formData) =>
  API.put(`/reports/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }, // 必须加 multipart 头
  });

// Approve a report
export const approveReport = (id) => API.post("/reports/approve", { id });

// Delete a report
export const deleteReport = (id) => API.post("/reports/delete", { id });

//Search method
export const searchReports = (query) =>
  API.get("/reports", { params: { search: query.trim() } });

// get all Approved report
export const fetchApprovedReports = () => API.get("/reports/approved"); // ✅ 确保正确访问
