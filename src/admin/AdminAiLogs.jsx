import React, { useMemo, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function useAuthHeader() {
  const token = localStorage.getItem("token");
  return useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );
}

function QueryRow({ children }) {
  return (
    <div
      style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}
    >
      {children}
    </div>
  );
}

function Field({ label, ...rest }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ minWidth: 80, color: "#555" }}>{label}:</span>
      <input
        {...rest}
        style={{ padding: 6, border: "1px solid #ddd", borderRadius: 6 }}
      />
    </label>
  );
}

function Actions({ onSearch, onDownload, loading }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onSearch} disabled={loading}>
        Search
      </button>
      <button onClick={onDownload} disabled={loading}>
        Download CSV
      </button>
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div
      style={{ overflow: "auto", border: "1px solid #eee", borderRadius: 8 }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #eee",
                }}
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: 16, color: "#999" }}
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: 8,
                      borderBottom: "1px solid #f5f5f5",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: 420,
                    }}
                    title={String(r[c.key] ?? "")}
                  >
                    {String(r[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAiLogs() {
  const headers = useAuthHeader();

  // companion
  const [cUserId, setCUserId] = useState("");
  const [cQ, setCQ] = useState("");
  const [cFrom, setCFrom] = useState("");
  const [cTo, setCTo] = useState("");
  const [cPage, setCPage] = useState(1);
  const [cPageSize, setCPageSize] = useState(50);
  const [cRows, setCRows] = useState([]);
  const [cTotal, setCTotal] = useState(0);
  const [cLoading, setCLoading] = useState(false);

  // comment
  const [mUserId, setMUserId] = useState("");
  const [mReportId, setMReportId] = useState("");
  const [mQ, setMQ] = useState("");
  const [mFrom, setMFrom] = useState("");
  const [mTo, setMTo] = useState("");
  const [mPage, setMPage] = useState(1);
  const [mPageSize, setMPageSize] = useState(50);
  const [mRows, setMRows] = useState([]);
  const [mTotal, setMTotal] = useState(0);
  const [mLoading, setMLoading] = useState(false);

  const fetchCompanion = async () => {
    setCLoading(true);
    try {
      const res = await axios.get(`${API}/reports/admin/ai-companion-prompts`, {
        headers,
        params: {
          userId: cUserId || undefined,
          q: cQ || undefined,
          from: cFrom || undefined,
          to: cTo || undefined,
          page: cPage,
          pageSize: cPageSize,
        },
      });
      setCRows(res.data.rows || []);
      setCTotal(res.data.total || 0);
    } finally {
      setCLoading(false);
    }
  };

  const downloadCompanion = () => {
    const qs = new URLSearchParams({
      userId: cUserId || "",
      q: cQ || "",
      from: cFrom || "",
      to: cTo || "",
      download: "csv",
    }).toString();
    window.open(`${API}/reports/admin/ai-companion-prompts?${qs}`, "_blank");
  };

  const fetchComment = async () => {
    setMLoading(true);
    try {
      const res = await axios.get(`${API}/reports/admin/ai-comment-prompts`, {
        headers,
        params: {
          userId: mUserId || undefined,
          reportId: mReportId || undefined,
          q: mQ || undefined,
          from: mFrom || undefined,
          to: mTo || undefined,
          page: mPage,
          pageSize: mPageSize,
        },
      });
      setMRows(res.data.rows || []);
      setMTotal(res.data.total || 0);
    } finally {
      setMLoading(false);
    }
  };

  const downloadComment = () => {
    const qs = new URLSearchParams({
      userId: mUserId || "",
      reportId: mReportId || "",
      q: mQ || "",
      from: mFrom || "",
      to: mTo || "",
      download: "csv",
    }).toString();
    window.open(`${API}/reports/admin/ai-comment-prompts?${qs}`, "_blank");
  };

  const cCols = [
    { key: "createdAt", title: "createdAt" },
    { key: "userId", title: "userId" },
    { key: "username", title: "username" },
    { key: "prompt", title: "prompt" },
  ];
  const mCols = [
    { key: "createdAt", title: "createdAt" },
    { key: "userId", title: "userId" },
    { key: "username", title: "username" },
    { key: "reportId", title: "reportId" },
    { key: "reportTitle", title: "reportTitle" },
    { key: "prompt", title: "prompt" },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>AI Logs</h2>

      <section style={{ marginBottom: 32 }}>
        <h3>AI Companion Logs</h3>
        <QueryRow>
          <Field
            label="userId"
            value={cUserId}
            onChange={(e) => setCUserId(e.target.value)}
          />
          <Field label="q" value={cQ} onChange={(e) => setCQ(e.target.value)} />
          <Field
            label="from"
            type="date"
            value={cFrom}
            onChange={(e) => setCFrom(e.target.value)}
          />
          <Field
            label="to"
            type="date"
            value={cTo}
            onChange={(e) => setCTo(e.target.value)}
          />
          <Field
            label="page"
            type="number"
            value={cPage}
            onChange={(e) => setCPage(+e.target.value || 1)}
          />
          <Field
            label="pageSize"
            type="number"
            value={cPageSize}
            onChange={(e) => setCPageSize(+e.target.value || 50)}
          />
          <Actions
            onSearch={fetchCompanion}
            onDownload={downloadCompanion}
            loading={cLoading}
          />
        </QueryRow>
        <Table columns={cCols} rows={cRows} />
        <div style={{ marginTop: 8, color: "#666" }}>Total: {cTotal}</div>
      </section>

      <section>
        <h3>AI Comment Logs</h3>
        <QueryRow>
          <Field
            label="userId"
            value={mUserId}
            onChange={(e) => setMUserId(e.target.value)}
          />
          <Field
            label="reportId"
            value={mReportId}
            onChange={(e) => setMReportId(e.target.value)}
          />
          <Field label="q" value={mQ} onChange={(e) => setMQ(e.target.value)} />
          <Field
            label="from"
            type="date"
            value={mFrom}
            onChange={(e) => setMFrom(e.target.value)}
          />
          <Field
            label="to"
            type="date"
            value={mTo}
            onChange={(e) => setMTo(e.target.value)}
          />
          <Field
            label="page"
            type="number"
            value={mPage}
            onChange={(e) => setMPage(+e.target.value || 1)}
          />
          <Field
            label="pageSize"
            type="number"
            value={mPageSize}
            onChange={(e) => setMPageSize(+e.target.value || 50)}
          />
          <Actions
            onSearch={fetchComment}
            onDownload={downloadComment}
            loading={mLoading}
          />
        </QueryRow>
        <Table columns={mCols} rows={mRows} />
        <div style={{ marginTop: 8, color: "#666" }}>Total: {mTotal}</div>
      </section>
    </div>
  );
}
