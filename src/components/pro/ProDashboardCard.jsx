"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * ProDashboardCard — premium card for Pro dashboard sections.
 *
 * Props:
 *  - title       : Card heading
 *  - icon        : Lucide icon component
 *  - description : Subtext / placeholder message
 *  - cta         : { label, href } — action button
 *  - status      : 'empty' | 'loading' | 'ready' | 'coming_soon'
 *  - children    : Content to render when status === 'ready'
 *  - accentColor : CSS color for icon accent (default: #a855f7)
 */
export default function ProDashboardCard({
  title,
  icon: Icon,
  description,
  cta,
  status = "empty",
  children,
  accentColor = "#a855f7",
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 pro-glass-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: "var(--pro-border-subtle)" }}
        >
          {Icon && <Icon size={16} style={{ color: "var(--pro-text-primary)" }} />}
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
      </div>

      {/* Content */}
      {status === "loading" && (
        <div className="flex items-center justify-center py-6">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${accentColor}40`, borderTopColor: "transparent" }}
          />
        </div>
      )}

      {status === "ready" && children}

      {(status === "empty" || status === "coming_soon") && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
          {cta && status !== "coming_soon" && (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: accentColor }}
            >
              {cta.label}
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ProEmptyState — full-page empty state for unimplemented Pro pages.
 */
export function ProEmptyState({
  icon: Icon,
  title = "Coming Soon",
  description = "This feature is being built and will be available in a future update.",
  phase,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-md mx-auto space-y-6">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center border"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(168,85,247,0.06) 100%)",
          borderColor: "rgba(124,58,237,0.2)",
        }}
      >
        {Icon ? (
          <Icon size={32} style={{ color: "#a855f7" }} />
        ) : (
          <Sparkles size={32} style={{ color: "#a855f7" }} />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
        {phase && (
          <p className="text-[11px] font-semibold" style={{ color: "#a855f7" }}>
            Planned for Phase {phase}
          </p>
        )}
      </div>

      <Link
        href="/pro"
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
        style={{ color: "#a855f7" }}
      >
        ← Back to Career Dashboard
      </Link>
    </div>
  );
}
