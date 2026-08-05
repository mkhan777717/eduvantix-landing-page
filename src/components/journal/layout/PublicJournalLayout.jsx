"use client";

import PublicJournalNavbar from "./PublicJournalNavbar";
import ToastContainer from "@/components/ToastContainer";

export default function PublicJournalLayout({ children }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#ffffff",
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
