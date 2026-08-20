"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, Zap, Brain, Map, Mic, Briefcase, Bot, FileText, ChevronRight } from "lucide-react";
import { usePro } from "@/context/ProContext";
import { useRouter } from "next/navigation";

const features = [
  { icon: FileText, label: "AI Resume Analysis & Optimizer" },
  { icon: Brain, label: "Skill Intelligence & Gap Analysis" },
  { icon: Map, label: "Personalized Career Roadmap" },
  { icon: Mic, label: "AI Interview Practice" },
  { icon: Briefcase, label: "AI Job Matching" },
  { icon: Bot, label: "AI Career Coach (24/7)" },
  { icon: Zap, label: "Career Mode Dashboard" },
  { icon: Sparkles, label: "Priority AI Analysis" },
];

export default function UpgradePage() {
  const { isPro, mode, setMode } = usePro();
  const router = useRouter();

  // If already Pro, offer to activate Career Mode
  if (isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto space-y-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: "var(--pro-accent-gradient)" }}
        >
          <Sparkles size={32} className="text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            You&apos;re already on Pro! 🎉
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            You have full access to all Eduvantix Pro features.
          </p>
        </div>
        <button
          onClick={async () => {
            await setMode("CAREER");
            router.push("/pro");
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: "var(--pro-accent-gradient)" }}
        >
          <Zap size={14} />
          Open Career Dashboard
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
          >
            <Sparkles size={22} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Upgrade to{" "}
          <span style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Eduvantix Pro
          </span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Your complete AI-powered career intelligence system. From resume to job offer — guided every step of the way.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--pro-accent-glow)", border: "1px solid var(--pro-border-subtle)" }}
            >
              <Icon size={14} style={{ color: "var(--pro-accent-primary)" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
            <Check size={14} className="ml-auto flex-shrink-0" style={{ color: "#10b981" }} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl border p-8 text-center space-y-4"
        style={{
          background: "var(--pro-accent-glow)",
          borderColor: "var(--pro-border-subtle)",
        }}
      >
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Ready to accelerate your career?
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Pro subscriptions are managed by your administrator. Contact your institute admin or reach out to us to get Pro access.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:hello@eduvantix.com?subject=Eduvantix Pro Access Request"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" }}
          >
            <Sparkles size={14} />
            Request Pro Access
          </a>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
          >
            Continue with Free
          </Link>
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        All existing Eduvantix Learning features remain free. Pro adds the Career Intelligence layer.
      </p>
    </div>
  );
}
