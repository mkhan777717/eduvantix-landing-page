"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Check } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const FEATURES = [
  "Read all engineering articles for free",
  "Access DSA, System Design & Interview guides",
  "Save articles to your personal library",
  "Write & publish your own articles",
  "Join the Eduvantix community of developers",
  "Get weekly curated newsletter picks",
];

/**
 * Shows the first ~2 articles fully, then fades out the rest
 * with a gradient + Medium-style paywall CTA.
 */
export default function JournalGuestGate({ children }) {
  const { user, loading } = useAuth();
  const isDark = useThemeStore((state) => state.isDark);

  if (loading) return <>{children}</>;
  if (user) return <>{children}</>;

  const fadeGradient = isDark
    ? "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 45%, #000000 85%)"
    : "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 45%, #ffffff 85%)";

  const sectionBg = "var(--j-bg, inherit)";
  const textColor = "var(--j-text, inherit)";
  const subtextColor = "var(--j-text-secondary, #94a3b8)";
  const borderColor = "var(--j-border, #222222)";

  return (
    <div className="relative">
      {/* ── Content clipped to show ~2 articles ── */}
      <div style={{ maxHeight: "820px", overflow: "hidden", position: "relative" }}>
        {children}

        {/* Gradient fade */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "380px",
            background: fadeGradient,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Medium-style paywall section ── */}
      <div
        className="flex flex-col items-center text-center px-4 pt-4 pb-20"
        style={{ background: sectionBg }}
      >
        {/* Thin separator line */}
        <div
          className="w-full max-w-xl mb-10"
          style={{ borderTop: `1px solid ${borderColor}` }}
        />

        <div className="w-full max-w-xl">
          {/* ── Yellow badge ── */}
          <div className="flex justify-center mb-5">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
              style={{
                background: "#f5c518",
                color: "#111111",
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Free Access
            </span>
          </div>

          {/* ── Headline ── */}
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3 leading-tight tracking-tight"
            style={{
              color: textColor,
            }}
          >
            Access to everything.
          </h2>
          <p
            className="text-xl mb-8"
            style={{ color: textColor }}
          >
            Join for free.
          </p>

          {/* ── Subline ── */}
          <p
            className="text-xl mb-8"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: subtextColor,
            }}
          >
            Unlock every single article.
          </p>

          {/* ── Feature checklist ── */}
          <ul className="space-y-3 mb-10 text-left max-w-sm mx-auto">
            {FEATURES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base"
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  color: textColor,
                }}
              >
                <Check
                  size={18}
                  strokeWidth={2.5}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#10b981" }}
                />
                {item}
              </li>
            ))}
          </ul>

          {/* ── CTA Button ── */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <Link
              href="/login?signup=1&redirect=/journal"
              id="journal-guest-cta-btn"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-base font-bold transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)",
                color: "#ffffff",
                fontFamily: "Inter, system-ui, sans-serif",
                boxShadow: "0 6px 28px rgba(5,150,105,0.35), 0 2px 8px rgba(5,150,105,0.2)",
                fontSize: "1rem",
                letterSpacing: "-0.01em",
                minWidth: "280px",
              }}
            >
              Get started — it&apos;s free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <p
              className="text-xs"
              style={{ color: subtextColor, fontFamily: "Inter, system-ui, sans-serif" }}
            >
              No credit card required · Free forever
            </p>

            {/* ── Social Media Links ── */}
            <div className="flex items-center gap-3 pt-4">
              {[
                {
                  label: "X (Twitter)",
                  href: "https://x.com/DatamindXTech",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/company/eduvantix",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
                    </svg>
                  ),
                },
                {
                  label: "YouTube",
                  href: "https://www.youtube.com/@eduvantix-india",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/eduvantix",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/profile.php?id=61593110181990",
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-110"
                  style={{
                    borderColor: borderColor,
                    color: subtextColor,
                    background: isDark ? "var(--j-bg-card, #1e293b)" : "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#10b981";
                    e.currentTarget.style.color = "#10b981";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                    e.currentTarget.style.color = subtextColor;
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
