"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/**
 * ProBadge — small inline badge indicating Pro status.
 * Usage: <ProBadge /> or <ProBadge size="sm" />
 */
export default function ProBadge({ size = "sm", className = "" }) {
  const textSize = size === "xs" ? "text-[8px]" : "text-[9px]";
  const padding = size === "xs" ? "px-1 py-0.5" : "px-1.5 py-0.5";
  const iconSize = size === "xs" ? 7 : 9;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${padding} ${textSize} font-bold rounded-md tracking-wider uppercase ${className}`}
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
        color: "#fff",
      }}
    >
      <Sparkles size={iconSize} className="flex-shrink-0" />
      Pro
    </span>
  );
}
