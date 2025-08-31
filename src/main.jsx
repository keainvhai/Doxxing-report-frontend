import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { registerSW } from "virtual:pwa-register";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const updateSW = registerSW({
  onNeedRefresh() {
    // 可弹出“有新版本，点击刷新”
  },
  onOfflineReady() {
    // 可提示“已可离线使用”
  },
});
