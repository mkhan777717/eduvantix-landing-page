"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import useThemeStore from "@/store/useThemeStore";

export default function ThemeToggle() {
  const { isDark, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      id="theme-toggle-btn"
      suppressHydrationWarning
      className="relative flex h-9 w-16 items-center rounded-full border border-[var(--border-primary)] transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
      style={{
        backgroundColor: isDark ? "var(--bg-card)" : "var(--bg-hover)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        {/* Sun */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: isDark ? "var(--text-muted)" : "#d97706", opacity: isDark ? 0.3 : 1, transition: "opacity 0.3s" }}
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
          <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
          <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
        </svg>
        {/* Moon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: isDark ? "#818cf8" : "var(--text-muted)", opacity: isDark ? 1 : 0.3, transition: "opacity 0.3s" }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Sliding thumb */}
      <motion.div
        className="absolute top-1 h-7 w-7 rounded-full shadow-md"
        animate={{ x: isDark ? 28 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "linear-gradient(135deg, #f59e0b, #f97316)",
        }}
      />
    </button>
  );
}
