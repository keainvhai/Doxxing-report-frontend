import React, { useEffect, useState } from "react";

export default function AddToHomeScreenPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 判断是不是 iPhone/iPad/iPod
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    // 判断是不是已经安装到桌面（PWA 模式）
    const isInStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isIos && !isInStandalone) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "12px 16px",
        borderRadius: "12px",
        maxWidth: "280px",
        textAlign: "center",
        zIndex: 1000,
      }}
    >
      📲 Want quicker access? In Safari, tap the <strong>Share button</strong> →{" "}
      <strong>Add to Home Screen</strong>
    </div>
  );
}
