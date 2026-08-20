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
      className="rounded-2xl border p-5 space-y-4 mb-6 pro-glass-card pro-glass-card-hero relative overflow-hidden"
      style={{ borderColor: "var(--pro-border-subtle)" }}
    >
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, var(--pro-accent-primary) 0%, transparent 60%), radial-gradient(ellipse at bottom left, var(--pro-premium-gold) 0%, transparent 60%)" }} />
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
            style={{ background: "var(--pro-accent-gradient)" }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-medium" style={{ color: "var(--pro-text-primary)" }}>
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
            background: "var(--pro-accent-gradient)",
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
                backgroundColor: done ? "var(--accent-glow)" : "var(--bg-hover)",
                borderColor: done ? "var(--pro-accent-primary)" : "var(--border-primary)",
              }}
            >
              {done ? (
                <CheckCircle2 size={15} style={{ color: "var(--pro-accent-primary)", flexShrink: 0 }} />
              ) : (
                <Circle size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              )}
              <div>
                <p
                  className="text-[10px] font-semibold"
                  style={{ color: done ? "var(--pro-accent-primary)" : "var(--text-secondary)" }}
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
  const [animatedPct, setAnimatedPct] = React.useState(0);
  const completedCount = steps.filter((s) => status?.[s.key]).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  React.useEffect(() => {
    // Delay animation slightly on mount for effect
    const timer = setTimeout(() => setAnimatedPct(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="flex items-center gap-4">
      {/* Circular indicator */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 48 48" className="w-16 h-16 -rotate-90">
          <defs>
            <linearGradient id="proRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--pro-accent-primary)" />
              <stop offset="100%" stopColor="var(--pro-premium-gold)" />
            </linearGradient>
          </defs>
          <circle 
            cx="24" cy="24" r="20" 
            fill="none" 
            stroke="var(--pro-border-subtle)" 
            strokeWidth="6" 
            strokeDasharray={pct === 0 ? "4 4" : "none"}
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="url(#proRingGrad)"
            strokeWidth="6"
            strokeDasharray="125.6 125.6"
            strokeDashoffset={125.6 - (animatedPct / 100) * 125.6}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-mono font-bold"
          style={{ color: "var(--pro-text-primary)" }}
        >
          {animatedPct}%
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold" style={{ color: "var(--pro-text-primary)" }}>
          Profile Setup
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--pro-text-secondary)" }}>
          {completedCount}/{steps.length} steps done
        </p>
      </div>
    </div>
  );
}
