"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Check } from "lucide-react";

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

  if (loading) return <>{children}</>;
  if (user) return <>{children}</>;

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
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.75) 35%, rgba(255,255,255,1) 75%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Medium-style paywall section ── */}
      <div
        className="flex flex-col items-center text-center px-4 pt-4 pb-20"
        style={{ background: "#ffffff" }}
      >
        {/* Thin separator line */}
        <div
          className="w-full max-w-xl mb-10"
          style={{ borderTop: "1px solid #e2e8f0" }}
        />

        <div className="w-full max-w-xl">
          {/* ── Yellow badge ── */}
          <div className="flex justify-center mb-5">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
              style={{
                background: "#f5c518",
                color: "#111",
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
              color: "#0f172a",
            }}
          >
            Access to everything.
          </h2>
          <p
            className="text-xl mb-8"
            style={{ color: "#0f172a" }}>
            Join for free.
          </p>

          {/* ── Subline ── */}
          <p
            className="text-xl mb-8"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "#334155",
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
                  color: "#1e293b",
                }}
              >
                <Check
                  size={18}
                  strokeWidth={2.5}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#0f172a" }}
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
              style={{ color: "#94a3b8", fontFamily: "Inter, system-ui, sans-serif" }}
            >
              No credit card required · Free forever
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
