"use client";

import PublicJournalNavbar from "./PublicJournalNavbar";
import JournalFooter from "./JournalFooter";
import ToastContainer from "@/components/ToastContainer";

import useThemeStore from "@/store/useThemeStore";

export default function PublicJournalLayout({ children }) {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div
      className="journal-root min-h-screen flex flex-col"
      style={{
        background: "var(--j-bg)",
        color: "var(--j-text)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Floating Pill Navbar */}
      <PublicJournalNavbar />

      {/* Page content — spacer is rendered inside PublicJournalNavbar */}
      <main className="flex-1">
        {children}
      </main>

      {/* Journal Footer with official social links */}
      <JournalFooter />

      <ToastContainer />
    </div>
  );
}
