"use client";

import { useState } from "react";
import Link from "next/link";
import { getApiBase } from "@/utils/api";

const FOOTER_COLS = [
  {
    title: "Learn",
    links: [
      { label: "All Articles",     href: "/journal" },
      { label: "DSA",              href: "/journal/category/dsa" },
      { label: "Web Development",  href: "/journal/category/web-development" },
      { label: "AI & ML",          href: "/journal/category/ai-ml" },
      { label: "System Design",    href: "/journal/category/system-design" },
      { label: "Interview Prep",   href: "/journal/category/interview" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Career",           href: "/journal/category/career" },
      { label: "Placements",       href: "/journal/category/placements" },
      { label: "Series",           href: "/journal/series" },
      { label: "All Tags",         href: "/journal/tags" },
      { label: "Write an Article", href: "/journal/write" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Courses",  href: "/courses" },
      { label: "Practice", href: "/practice" },
      { label: "Contests", href: "/contest" },
      { label: "Discuss",  href: "/discuss" },
      { label: "About",    href: "/about" },
    ],
  },
];

export default function JournalFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch(`${getApiBase()}/api/journal/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubscribed(true);
    } catch (_) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      className="border-t mt-24"
      style={{
        background: "var(--j-bg)",
        borderColor: "var(--j-border)",
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-5 py-16">

        {/* ── Top row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/journal" className="flex items-baseline gap-2 mb-4 select-none">
              <span
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--j-font-heading)", fontStyle: "normal", color: "var(--j-text)" }}
              >
                EduVantix
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: "var(--j-font-mono)",
                  color: "var(--j-text-muted)",
                  background: "var(--j-bg-secondary)",
                  border: "1px solid var(--j-border)",
                }}
              >
                /journal
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
            >
              Engineering knowledge for the next generation of developers.
              Learn. Build. Share. Grow.
            </p>

            {/* Newsletter */}
            {subscribed ? (
              <p
                className="text-sm"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
              >
                ✓ You&apos;re subscribed.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  id="footer-newsletter-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-md border text-sm outline-none transition-colors focus:border-[var(--j-accent)]"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    background: "var(--j-bg-card)",
                    borderColor: "var(--j-border)",
                    color: "var(--j-text)",
                    fontSize: "0.8125rem",
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    background: "var(--j-accent)",
                    color: "#ffffff",
                  }}
                >
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>

          {/* Link cols */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h3
                className="text-xs font-medium mb-4 uppercase tracking-widest"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
              >
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--j-accent)]"
                      style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-secondary)", fontSize: "0.8125rem" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom row ─── */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "var(--j-border)" }}
        >
          <p
            className="text-xs"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
          >
            © {new Date().getFullYear()} DatamindX Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "Privacy", href: "/privacy-policy" },
              { label: "Terms",   href: "/terms-of-service" },
              { label: "RSS",     href: "/rss.xml" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs transition-colors hover:text-[var(--j-accent)]"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
