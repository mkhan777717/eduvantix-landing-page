"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Map, CheckCircle2,
  Building2, Users, Briefcase, Star, ChevronRight, Play, Terminal
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const DEMO_TABS = [
  {
    id: "sandbox",
    label: "Interactive Playground",
    icon: Terminal,
    badge: "Live IDE",
    content: {
      filename: "career_roadmap.ts",
      code: `import { EduvantixCareerEngine } from "@eduvantix/core";

// Initialise candidate skill profile
const candidate = await EduvantixCareerEngine.evaluate({
  learnerId: "user_94812",
  targetRole: "Full Stack Engineer",
});

// Run AI skill gap analysis & generate project roadmap
const roadmap = await candidate.generateRoadmap();
console.log(\`✨ Target Achieved in \${roadmap.estimatedWeeks} Weeks\`);
console.log(\`Verified Skills: \${roadmap.verifiedSkills.join(", ")}\`);`,
      metrics: [
        { label: "Completion Rate", value: "94%" },
        { label: "Verified Score", value: "92/100" },
        { label: "Projects Built", value: "6 Full-Stack Apps" },
      ]
    }
  },
  {
    id: "roadmap",
    label: "Career Roadmap Engine",
    icon: Map,
    badge: "AI Powered",
    content: {
      steps: [
        { title: "Skill Diagnostics", desc: "Automated assessment of code quality, architecture & fundamentals", status: "Completed", score: "96%" },
        { title: "Production Projects", desc: "Build enterprise Next.js, Python microservices & cloud deployments", status: "In Progress", score: "88%" },
        { title: "Verified Skill Certification", desc: "AI-proctored evaluation & cryptographic skill badge issuance", status: "Upcoming", score: "Pending" },
        { title: "Direct Employer Match", desc: "Automated submission to top tech partner companies", status: "Upcoming", score: "Pending" }
      ]
    }
  },
  {
    id: "hiring",
    label: "Employer Hiring Match",
    icon: Briefcase,
    badge: "Direct Hiring",
    content: {
      matches: [
        { company: "Razorpay", role: "Frontend Engineer", matchScore: "98%", status: "Interview Offered", location: "Bangalore / Remote" },
        { company: "Swiggy", role: "Full Stack Developer", matchScore: "95%", status: "Portfolio Shortlisted", location: "Hybrid" },
        { company: "Flipkart", role: "Software Development Engineer I", matchScore: "92%", status: "Assessment Cleared", location: "Bangalore" },
      ]
    }
  }
];

const METRICS = [
  { icon: Users, val: "10,000+", label: "Active Engineers" },
  { icon: Building2, val: "500+", label: "Partner Institutes" },
  { icon: Briefcase, val: "100+", label: "Hiring Partners" },
  { icon: Star, val: "4.9 / 5.0", label: "Learner Rating" },
];

export default function LandingHero() {
  const isDark = useThemeStore((state) => state.isDark);
  const [activeTabId, setActiveTabId] = useState("sandbox");

  const activeTab = DEMO_TABS.find((t) => t.id === activeTabId);

  return (
    <section className="relative w-full overflow-hidden pt-28 sm:pt-36 pb-20 px-6 transition-colors duration-300">

      {/* Background Video with Infinite Loop & Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero1.mp4" type="video/mp4" />
          {/* <source src="/guy-coding.mp4" type="video/mp4" /> */}
        </video>


        {/* Ambient green glow accent */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(59,130,246,0.15) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">

        {/* Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-[-0.035em] leading-[1.06] max-w-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          Stop Buying Courses.{" "}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
            Start Building Your Career.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed font-normal"
          style={{ color: "var(--text-secondary)" }}
        >
          Eduvantix unifies personalized learning paths, real production projects, AI-proctored skill verification, and direct employer hiring into one seamless platform.
        </motion.p>

        {/* Primary & Secondary Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: isDark
                ? "0 10px 30px rgba(16,185,129,0.35)"
                : "0 10px 25px rgba(16,185,129,0.25)",
            }}
          >
            <span>Start Learning Free</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="#platform"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold border transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <Play size={14} className="fill-emerald-500 text-emerald-500" />
            <span>Explore Platform</span>
          </Link>
        </motion.div>

        {/* Metrics Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl border transition-colors"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-primary)",
          }}
        >
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-3 justify-center sm:justify-start">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)",
                    color: "var(--text-accent)",
                  }}
                >
                  <Icon size={18} />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {m.val}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {m.label}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Interactive macOS Product Window Preview */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 w-full rounded-2xl border shadow-2xl overflow-hidden transition-colors text-left"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-primary)",
          }}
        >
          {/* macOS Title Bar */}
          <div
            className="flex flex-wrap items-center justify-between px-4 py-3 border-b gap-3"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs font-mono font-medium" style={{ color: "var(--text-muted)" }}>
                eduvantix-os // {activeTab.label.toLowerCase().replace(/\s+/g, "_")}
              </span>
            </div>

            {/* Interactive Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {DEMO_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "hover:bg-slate-500/10"
                      }`}
                    style={!isActive ? { color: "var(--text-secondary)" } : {}}
                  >
                    <TabIcon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Tab Body */}
          <div className="p-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTabId === "sandbox" && (
                <motion.div
                  key="sandbox"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div
                    className="p-4 rounded-xl font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border"
                    style={{
                      backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "#f8fafc",
                      borderColor: "var(--border-primary)",
                      color: isDark ? "#e2e8f0" : "#1e293b",
                    }}
                  >
                    <pre>
                      <code>{activeTab.content.code}</code>
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {activeTab.content.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="p-3 rounded-xl border text-center"
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                          borderColor: "var(--border-primary)",
                        }}
                      >
                        <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                          {m.label}
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: "var(--text-accent)" }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTabId === "roadmap" && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {activeTab.content.steps.map((step, idx) => (
                    <div
                      key={step.title}
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                        borderColor: "var(--border-primary)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{
                            backgroundColor: step.status === "Completed" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.15)",
                            color: "#10b981",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {step.title}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {step.desc}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0"
                        style={{
                          backgroundColor: step.status === "Completed" ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)",
                          borderColor: step.status === "Completed" ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.2)",
                          color: "#10b981",
                        }}
                      >
                        {step.status} ({step.score})
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTabId === "hiring" && (
                <motion.div
                  key="hiring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {activeTab.content.matches.map((item) => (
                    <div
                      key={item.company}
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                        borderColor: "var(--border-primary)",
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {item.company}
                          </span>
                          <span className="text-xs text-emerald-500 font-semibold">• {item.role}</span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          Location: {item.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-500">
                          {item.matchScore} Match
                        </span>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Bar Footer */}
          <div
            className="px-6 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
            style={{
              backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)",
              borderColor: "var(--border-primary)",
              color: "var(--text-muted)",
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Real-time Candidate & Institutional Analytics Engine</span>
            </div>
            <Link href="/courses" className="font-bold text-emerald-500 hover:underline flex items-center gap-1">
              Start Free Assessment <ChevronRight size={13} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
