"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, PenLine, Bell, User, ChevronDown, X, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { label: "Courses",  href: "/courses" },
  { label: "Practice", href: "/practice" },
  { label: "Contests", href: "/contest" },
  { label: "Journal",  href: "/journal", active: true },
  { label: "Discuss",  href: "/discuss" },
  { label: "Careers",  href: "/careers" },
];

export default function JournalHeader({ onSearchOpen }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onSearchOpen]);

  return (
    <header className="j-header" role="banner">
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center gap-6">

        {/* ── Wordmark ───────────────────────── */}
        <Link
          href="/journal"
          className="flex items-baseline gap-2 shrink-0 select-none"
          aria-label="Eduvantix Journal home"
        >
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              fontFamily: "var(--j-font-heading)",
              fontStyle: "normal",
              color: "var(--j-text)",
            }}
          >
            Eduvantix
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              fontFamily: "var(--j-font-mono)",
              color: "var(--j-text-secondary)",
              background: "var(--j-bg-secondary)",
              border: "1px solid var(--j-border)",
            }}
          >
            /journal
          </span>
        </Link>

        {/* ── Nav ────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Journal navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-xs transition-colors"
                style={{
                  fontFamily: "var(--j-font-mono)",
                  color: isActive ? "var(--j-accent)" : "var(--j-text-secondary)",
                  background: isActive ? "var(--j-accent-light)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right Actions ───────────────────── */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {/* Search button */}
          <button
            id="journal-search-btn"
            onClick={onSearchOpen}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors hover:border-[var(--j-accent)]"
            style={{
              fontFamily: "var(--j-font-mono)",
              fontSize: "0.75rem",
              color: "var(--j-text-muted)",
              borderColor: "var(--j-border)",
              background: "var(--j-bg-secondary)",
            }}
            aria-label="Search articles (Ctrl+K)"
          >
            <Search size={13} />
            <span>Search</span>
            <kbd
              className="hidden lg:inline ml-1 px-1 rounded text-[10px]"
              style={{
                background: "var(--j-border)",
                color: "var(--j-text-muted)",
                fontFamily: "var(--j-font-mono)",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={onSearchOpen}
            className="sm:hidden p-2 rounded-md"
            style={{ color: "var(--j-text-secondary)" }}
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {/* Write button — blocked for guests */}
          <Link
            href={user ? "/journal/write" : `/login?redirect=${encodeURIComponent("/journal/write")}`}
            id="journal-write-btn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--j-font-mono)",
              background: "var(--j-accent)",
              color: "#ffffff",
            }}
            title={!user ? "Sign in to write an article" : undefined}
          >
            <PenLine size={12} />
            Write
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                id="journal-profile-btn"
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-1.5 p-1.5 rounded-md transition-colors"
                style={{ color: "var(--j-text-secondary)" }}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover border"
                    style={{ borderColor: "var(--j-border)" }}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "var(--j-accent-light)", color: "var(--j-accent)" }}
                  >
                    {(user.fullName || user.username || "U")[0].toUpperCase()}
                  </div>
                )}
                <ChevronDown size={12} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl border py-1.5 z-50 shadow-lg"
                  style={{
                    background: "var(--j-bg-card)",
                    borderColor: "var(--j-border)",
                  }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ borderColor: "var(--j-border-subtle)" }}
                  >
                    <p className="text-xs font-medium" style={{ color: "var(--j-text)", fontFamily: "var(--j-font-mono)" }}>
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--j-text-muted)", fontFamily: "var(--j-font-mono)" }}>
                      {user.email}
                    </p>
                  </div>
                  {[
                    { label: "Write Article",    href: "/journal/write",                  icon: PenLine },
                    { label: "Author Dashboard", href: "/journal/dashboard",              icon: BookOpen },
                    { label: "My Library",       href: "/journal/library",                icon: Bell },
                    ...((user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") ? [{ label: "Admin CMS", href: "/journal/admin", icon: User }] : []),
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-[var(--j-bg-secondary)] transition-colors"
                      style={{ color: "var(--j-text-secondary)", fontFamily: "var(--j-font-mono)" }}
                    >
                      <Icon size={13} />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t mt-1" style={{ borderColor: "var(--j-border-subtle)" }}>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs hover:bg-[var(--j-bg-secondary)] transition-colors"
                      style={{ color: "var(--j-text-muted)", fontFamily: "var(--j-font-mono)" }}
                    >
                      <LogOut size={13} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md text-xs transition-colors border"
              style={{
                fontFamily: "var(--j-font-mono)",
                color: "var(--j-text-secondary)",
                borderColor: "var(--j-border)",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
