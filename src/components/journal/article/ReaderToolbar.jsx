"use client";

import { useState } from "react";
import { Sliders, Type, Maximize2, Minimize2 } from "lucide-react";

export default function ReaderPreferencesToolbar({ onFontSizeChange, onWidthChange }) {
  const [fontSize, setFontSize] = useState("normal"); // 'small' | 'normal' | 'large'
  const [width, setWidth] = useState("normal");       // 'compact' | 'normal'

  const handleFont = (size) => {
    setFontSize(size);
    onFontSizeChange?.(size);
  };

  const handleWidth = (w) => {
    setWidth(w);
    onWidthChange?.(w);
  };

  return (
    <div
      className="inline-flex items-center gap-2 p-1.5 rounded-full border shadow-sm"
      style={{
        background: "#FFFFFF",
        borderColor: "var(--j-border)",
        fontFamily: "var(--j-font-mono)",
      }}
    >
      {/* Font Size Selector */}
      <span className="text-[11px] px-2 text-[var(--j-text-muted)] flex items-center gap-1">
        <Type size={12} /> Font:
      </span>
      {["small", "normal", "large"].map((s) => (
        <button
          key={s}
          onClick={() => handleFont(s)}
          className="px-2 py-0.5 rounded text-[11px] transition-colors"
          style={{
            background: fontSize === s ? "var(--j-accent-light)" : "transparent",
            color: fontSize === s ? "var(--j-accent)" : "var(--j-text-secondary)",
          }}
        >
          {s.charAt(0).toUpperCase()}
        </button>
      ))}

      <span className="text-[var(--j-border)]">|</span>

      {/* Reading Width Selector */}
      <span className="text-[11px] px-2 text-[var(--j-text-muted)] flex items-center gap-1">
        Width:
      </span>
      <button
        onClick={() => handleWidth(width === "compact" ? "normal" : "compact")}
        className="px-2 py-0.5 rounded text-[11px] transition-colors"
        style={{
          background: width === "compact" ? "var(--j-accent-light)" : "transparent",
          color: width === "compact" ? "var(--j-accent)" : "var(--j-text-secondary)",
        }}
      >
        {width === "compact" ? "Compact" : "Standard"}
      </button>
    </div>
  );
}
