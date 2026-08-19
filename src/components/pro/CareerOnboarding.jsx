"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

const steps = [
  { key: "profileCompleted",    label: "Complete Career Profile",  href: "/pro/profile" },
  { key: "resumeUploaded",      label: "Upload Resume",            href: "/pro/resume" },
  { key: "careerGoalSelected",  label: "Choose Career Goal",       href: "/pro/profile" },
  { key: "analysisCompleted",   label: "AI Career Analysis",       href: null },
];

/**
 * CareerOnboarding — 4-step onboarding shell for new Pro users.
 * Shown when a user enters Career Mode for the first time and has not completed setup.
 *
 * Props:
 *  - status : ProContext.proStatus object (profileCompleted, resumeUploaded, etc.)
 *  - onDismiss : callback to hide this banner
 */
export function CareerOnboarding({ status, onDismiss }) {
  const completedCount = steps.filter((s) => status?.[s.key]).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  return (
    <div
      className="rounded-2xl border p-5 space-y-4 mb-6"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.04) 100%)",
        borderColor: "rgba(124,58,237,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome to Eduvantix Pro 🚀
            </h3>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {completedCount}/{steps.length} steps completed — let&apos;s build your career journey.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[10px] font-medium transition-colors flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full" style={{ background: "var(--border-primary)" }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: `${(completedCount / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #7c3aed, #a855f7)",
          }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const done = status?.[step.key];
          const isNext = !done && steps.slice(0, idx).every((s) => status?.[s.key]);
          return (
            <div
              key={step.key}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
              style={{
                backgroundColor: done ? "rgba(124,58,237,0.1)" : "var(--bg-hover)",
                borderColor: done ? "rgba(124,58,237,0.25)" : "var(--border-primary)",
              }}
            >
              {done ? (
                <CheckCircle2 size={15} style={{ color: "#a855f7", flexShrink: 0 }} />
              ) : (
                <Circle size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              )}
              <div>
                <p
                  className="text-[10px] font-semibold"
                  style={{ color: done ? "#a855f7" : "var(--text-secondary)" }}
                >
                  Step {idx + 1}
                </p>
                {isNext && step.href ? (
                  <Link
                    href={step.href}
                    className="text-[11px] font-bold transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.label} →
                  </Link>
                ) : (
                  <p className="text-[11px]" style={{ color: done ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {step.label}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ProfileCompletion — compact progress widget for the dashboard sidebar/header.
 */
export function ProfileCompletion({ status }) {
  const completedCount = steps.filter((s) => status?.[s.key]).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="flex items-center gap-3">
      {/* Circular indicator */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-primary)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#a855f7"
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
          style={{ color: "#a855f7" }}
        >
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>
          Profile Setup
        </p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {completedCount}/{steps.length} steps done
        </p>
      </div>
    </div>
  );
}
