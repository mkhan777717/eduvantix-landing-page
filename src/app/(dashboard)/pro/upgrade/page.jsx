"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, Zap, Brain, Map, Mic, Briefcase, Bot, FileText, ChevronRight } from "lucide-react";
import { usePro } from "@/context/ProContext";
import { useRouter } from "next/navigation";

const features = [
  { icon: FileText, label: "AI Resume Analysis & Optimizer", desc: "Get tailored feedback to pass ATS and land interviews." },
  { icon: Brain, label: "Skill Intelligence & Gap Analysis", desc: "Identify what's missing in your skill profile instantly." },
  { icon: Map, label: "Personalized Career Roadmap", desc: "Step-by-step guidance tailored to your dream role." },
  { icon: Mic, label: "AI Interview Practice", desc: "Simulate real technical and HR interviews with AI." },
  { icon: Briefcase, label: "AI Job Matching", desc: "Get paired with the best opportunities for your profile." },
  { icon: Bot, label: "AI Career Coach (24/7)", desc: "Always-on coaching for salary negotiation and career advice." },
  { icon: Zap, label: "Career Mode Dashboard", desc: "A unified command center for your professional growth." },
  { icon: Sparkles, label: "Priority AI Analysis", desc: "Faster processing times and access to premium models." },
];

export default function UpgradePage() {
  const { isPro, mode, setMode } = usePro();
  const router = useRouter();

  // If already Pro, offer to activate Career Mode
  if (isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto space-y-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center border shadow-sm"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--accent-primary)" }}
        >
          <Sparkles size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            You're already on Pro! 🎉
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--accent-primary)" }}
        >
          <Zap size={14} />
          Open Career Dashboard
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 pt-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 mb-2 p-1.5 pr-4 rounded-full border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <Zap size={12} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Eduvantix Pro
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Upgrade your career toolkit.
          </h1>
          
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            A complete career intelligence system. From resume optimization to your final job offer — guided every step of the way.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex gap-4 p-5 rounded-xl border transition-colors hover:bg-[var(--bg-hover)] cursor-default"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
              >
                <Icon size={18} style={{ color: "var(--accent-primary)" }} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
                  <Check size={14} style={{ color: "var(--accent-primary)" }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className="rounded-2xl p-8 sm:p-12 text-center space-y-6 border shadow-sm"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        >
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }}>
            <Briefcase size={24} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ready to accelerate your career?
          </h2>
          
          <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Pro subscriptions are currently managed by administrators. Contact your institute admin or reach out to us directly to request access.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="mailto:hello@eduvantix.com?subject=Eduvantix Pro Access Request"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent-primary)" }}
            >
              <Sparkles size={14} />
              Request Pro Access
            </a>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-colors hover:bg-[var(--bg-hover)]"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
            >
              Continue with Free
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            All existing Eduvantix Learning features remain free. Pro adds the advanced Career Intelligence layer.
          </p>
        </div>
      </div>
    </div>
  );
}
