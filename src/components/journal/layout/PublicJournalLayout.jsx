"use client";

import PublicJournalNavbar from "./PublicJournalNavbar";
import ToastContainer from "@/components/ToastContainer";

import useThemeStore from "@/store/useThemeStore";

export default function PublicJournalLayout({ children }) {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: isDark ? "var(--j-bg, #0b0f19)" : "var(--j-bg, #ffffff)",
        color: "var(--j-text, inherit)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Floating Pill Navbar */}
      <PublicJournalNavbar />

      {/* Page content — spacer is rendered inside PublicJournalNavbar */}
      <main className="flex-1">
        {children}
      </main>

      <ToastContainer />
    </div>
  );
}
