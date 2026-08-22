"use client";

import React from "react";
import { Sparkles } from "lucide-react";

/**
 * ProBadge — Small inline badge indicating Pro status.
 */
export default function ProBadge({ size = "sm", className = "" }) {
  const textSize = size === "xs" ? "text-[8px]" : "text-[10px]";
  const padding = size === "xs" ? "px-1 py-0.5" : "px-1.5 py-0.5";
  const iconSize = size === "xs" ? 8 : 10;

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} ${textSize} font-semibold rounded-md tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 ${className}`}
    >
      <Sparkles size={iconSize} className="flex-shrink-0 text-emerald-500" />
      Pro
    </span>
  );
}

