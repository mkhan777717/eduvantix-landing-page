"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { label: "Free Courses", href: "/courses" },
  { label: "Blogs", href: "/journal" },
];

export default function PublicJournalNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <>
      {/* ── Floating pill header — identical sizing to main Navbar ── */}
      <header
        className="fixed top-4 left-0 right-0 z-50 mx-auto flex items-center"
        style={{
          width: "90%",
          maxWidth: "1310px",
          height: "64px",
          borderRadius: "9999px",
          paddingLeft: "32px",
          paddingRight: "32px",
          background: isDark
            ? "rgba(16, 18, 36, 0.75)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1.5px solid var(--border-primary, rgba(0,0,0,0.08))",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.38)"
            : "0 8px 32px rgba(208,215,236,0.22)",
          /* Centre it the same way the main Navbar does */
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {/* ── Logo (uses the same webp images as Navbar) ── */}
        <Link
          href="/"
          className="flex items-center shrink-0 select-none"
          aria-label="EduVantix home"
        >
          <img
            src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
            alt="Eduvantix Logo"
            className="h-7 w-auto object-contain"
            style={{ display: "block" }}
          />
        </Link>

        {/* ── Centre nav links ── */}
        <nav
          className="hidden md:flex items-center gap-1 flex-1 justify-center"
          aria-label="Public navigation"
        >
          {NAV_LINKS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium transition-colors duration-200 relative cursor-pointer"
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: isActive
                    ? "var(--text-primary, #111)"
                    : "var(--text-secondary, #555)",
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-primary, #111)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-secondary, #555)";
                }}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ backgroundColor: "var(--accent-primary, #10b981)" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right: Sign In button ── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <ThemeToggle />
          <Link
            href="/login"
            id="public-journal-signin-btn"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] hover:-translate-y-[2px] hover:shadow-xl"
            style={{
              background: "var(--accent-gradient, linear-gradient(135deg,#059669,#10b981))",
              color: "#fff",
              boxShadow: "0px 6px 20px var(--accent-glow, rgba(5,150,105,0.32))",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            <span>Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <ThemeToggle />
          <button
            className="p-1.5 rounded-lg focus:outline-none"
            style={{ color: "var(--text-secondary, #555)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Spacer so page content doesn't hide under the fixed navbar */}
      <div style={{ height: "80px" }} aria-hidden="true" />

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-4 right-4 rounded-2xl border py-4 px-5 space-y-2 shadow-2xl"
            style={{
              top: "76px",
              background: isDark
                ? "rgba(16,18,36,0.97)"
                : "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              borderColor: "var(--border-primary, rgba(0,0,0,0.08))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  color: "var(--text-secondary, #374151)",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div
              className="pt-2 border-t"
              style={{ borderColor: "var(--border-primary, rgba(0,0,0,0.07))" }}
            >
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 mt-1 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "var(--accent-gradient, linear-gradient(135deg,#059669,#10b981))",
                  color: "#fff",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
