// src/utils/formatLocation.js
export function normalizeLocationInput(loc) {
  if (!loc) return null;
  if (typeof loc === "object" && !Array.isArray(loc)) return loc;

  // JSON 字符串
  if (typeof loc === "string" && loc.trim().startsWith("{")) {
    try {
      return JSON.parse(loc);
    } catch {
      return { label: loc };
    }
  }
  // 普通字符串（"IL, United States" / "Hong Kong, Hong Kong"...）
  return { label: loc };
}

export function formatLocationLabel(loc) {
  const obj = normalizeLocationInput(loc);
  if (!obj) return "Unknown";

  // 统一字段名
  const city = obj.city ?? null;
  const state = obj.state ?? obj.state_province ?? null;
  let country = obj.country ?? null;

  // 常见修正
  const FIX = {
    "U.S.": "United States",
    USA: "United States",
    "United Kindom": "United Kingdom",
  };
  if (country && FIX[country]) country = FIX[country];
  if (country === "IL") {
    country = "United States";
  }

  // 如果本来就给了 label，优先用
  if (obj.label && obj.label.trim()) return obj.label.trim();

  const parts = [city, state, country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown";
}

export function isUnknownOrOnline(loc) {
  const label = (formatLocationLabel(loc) || "").toLowerCase();
  return (
    !label ||
    label === "unknown" ||
    label === "online" ||
    label === "null" ||
    label === "social media" ||
    label === "google news"
  );
}
