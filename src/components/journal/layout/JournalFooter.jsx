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
              className="text-sm leading-relaxed mb-4 max-w-xs"
              style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
            >
              Engineering knowledge for the next generation of developers.
              Learn. Build. Share. Grow.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 mb-6">
              {[
                {
                  label: "Twitter",
                  href: "#",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
                {
                  label: "YouTube",
                  href: "#",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ),
                },
                {
                  label: "GitHub",
                  href: "#",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/eduvantix",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z"/>
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-200"
                  style={{
                    borderColor: "var(--j-border)",
                    color: "var(--j-text-muted)",
                    background: "var(--j-bg-card)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--j-accent)";
                    e.currentTarget.style.color = "var(--j-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--j-border)";
                    e.currentTarget.style.color = "var(--j-text-muted)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

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
