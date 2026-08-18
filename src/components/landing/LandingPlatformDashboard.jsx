"use client";

import { motion, useInView } from "framer-motion";
import {
  BookOpen, Brain, Code2, FolderOpen, LayoutTemplate,
  FileText, Mic2, BarChart3, GraduationCap, Building2,
  Target, Award, Users, MessageSquare
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";
import { useRef, useState } from "react";

const MODULES = [
  { icon: BookOpen, label: "Learning Engine", color: "#10b981" },
  { icon: Brain, label: "AI Mentor", color: "#059669" },
  { icon: Code2, label: "Coding Playground", color: "#34d399" },
  { icon: FolderOpen, label: "Project Hub", color: "#047857" },
  { icon: LayoutTemplate, label: "Portfolio Builder", color: "#10b981" },
  { icon: FileText, label: "Resume Optimizer", color: "#059669" },
  { icon: Mic2, label: "Structured Interview AI", color: "#34d399" },
  { icon: BarChart3, label: "Institute SaaS Dashboard", color: "#047857" },
  { icon: GraduationCap, label: "Cohort Analytics", color: "#10b981" },
  { icon: Users, label: "Student Desk", color: "#059669" },
  { icon: Building2, label: "Company Hiring Portal", color: "#34d399" },
  { icon: Target, label: "Skill Matching Engine", color: "#047857" },
  { icon: Award, label: "Verified Certification", color: "#10b981" },
  { icon: MessageSquare, label: "Peer Community", color: "#059669" },
];

const SIDEBAR_ITEMS = ["Overview", "My Tracks", "Projects", "Portfolio", "Skill Verification", "Mock Interviews", "Job Matching", "Institute Hub"];

const STATS_BAR = [
  { label: "Skill Diagnostic", val: "94/100", color: "#10b981" },
  { label: "ATS Resume Score", val: "92/100", color: "#059669" },
  { label: "Verified Projects", val: "6 Built", color: "#34d399" },
  { label: "Employer Matches", val: "18 Matched", color: "#047857" },
];

function ModuleCard({ mod, index }) {
  const [hovered, setHovered] = useState(false);
  const Icon = mod.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border cursor-default transition-all duration-250"
      style={{
        backgroundColor: hovered ? `${mod.color}08` : "var(--bg-card)",
        borderColor: hovered ? mod.color : "var(--border-primary)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 24px ${mod.color}12` : "none",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: hovered ? `${mod.color}20` : `${mod.color}12`,
          border: `1px solid ${mod.color}${hovered ? "40" : "25"}`,
        }}
      >
        <Icon
          size={15}
          style={{ color: mod.color }}
          className={hovered ? "scale-110" : "scale-100"}
        />
      </div>
      <span
        className="text-xs font-semibold leading-tight transition-colors duration-200"
        style={{ color: hovered ? mod.color : "var(--text-primary)" }}
      >
        {mod.label}
      </span>
    </motion.div>
  );
}

export default function LandingPlatformDashboard() {
  const isDark = useThemeStore((state) => state.isDark);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      id="platform"
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Ambient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 60%)"
            : "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.03) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 flex flex-col items-center gap-3"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            Unified Ecosystem
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Everything in{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              one platform.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
            Eduvantix consolidates your entire career workspace into a clean, modern SaaS platform — for students, mentors, institutes, and employers.
          </p>
        </motion.div>

        {/* Dashboard Frame */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border shadow-2xl overflow-hidden transition-colors"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-primary)",
            boxShadow: isDark
              ? "0 30px 80px rgba(16,185,129,0.06), 0 0 0 1px rgba(255,255,255,0.04)"
              : "0 30px 80px rgba(16,185,129,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
          }}
        >
          {/* Window header */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-xs font-mono font-medium" style={{ color: "var(--text-muted)" }}>
                eduvantix.com/app
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Enterprise Ready
            </span>
          </div>

          {/* Dashboard content */}
          <div className="flex flex-col md:flex-row min-h-[460px]">
            {/* Sidebar */}
            <div
              className="hidden md:flex flex-col gap-1 p-4 shrink-0"
              style={{ width: 210, borderRight: "1px solid var(--border-primary)" }}
            >
              <div className="px-2 py-2 mb-3">
                <span className="text-sm font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  Eduvantix OS
                </span>
              </div>
              {SIDEBAR_ITEMS.map((item, i) => (
                <div
                  key={item}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer hover:bg-emerald-500/5"
                  style={{
                    backgroundColor: i === 0 ? "rgba(16,185,129,0.1)" : "transparent",
                    color: i === 0 ? "var(--text-accent)" : "var(--text-secondary)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main content grid */}
            <div className="flex-1 p-6 space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS_BAR.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="rounded-2xl p-3.5 border"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      borderColor: "var(--border-primary)",
                    }}
                  >
                    <div className="text-base font-extrabold" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Modules Grid */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  Unified Modules
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {MODULES.map((mod, i) => (
                    <ModuleCard key={mod.label} mod={mod} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
