"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";

import useThemeStore from "@/store/useThemeStore";

export default function PublicJournalLayout({ children }) {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div
      className="journal-root min-h-screen flex flex-col pt-20 md:pt-24"
      style={{
        background: "var(--j-bg)",
        color: "var(--j-text)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Common Global Navbar */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Main Platform Footer */}
      <Footer />

      <ToastContainer />
    </div>
  );
}
