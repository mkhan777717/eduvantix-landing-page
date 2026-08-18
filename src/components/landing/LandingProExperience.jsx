"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Sparkles, UserCheck, AlertTriangle, Target, Map,
  BookOpen, Code2, CheckCircle2, Mic2, Briefcase, Award,
  ArrowRight, ChevronRight, Check
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const PRO_STEPS = [
  {
    id: "resume",
    step: "01",
    label: "Resume Intake",
    short: "Resume",
    icon: FileText,
    headline: "Automated Resume Parsing & ATS Audit",
    metric: "12 skills identified",
    metricHighlight: "94% ATS Score",
    description: "Eduvantix Pro reads your current resume, projects, and work history to construct a foundational data model of your background.",
    preview: {
      title: "Extracted Skill Baseline",
      tags: ["React.js", "Node.js", "TypeScript", "Tailwind CSS", "REST APIs", "PostgreSQL"],
      missingNote: "Identified 4 gaps for Senior Role target",
      status: "Verified Intake",
    },
  },
  {
    id: "analysis",
    step: "02",
    label: "AI Analysis",
    short: "AI Analysis",
    icon: Sparkles,
    headline: "Multi-Dimensional Competency Deep Scan",
    metric: "Full-stack code scan",
    metricHighlight: "Architecture & Syntax",
    description: "Deep AI evaluates your technical fluency, algorithmic logic, architecture conventions, and repository commit patterns.",
    preview: {
      title: "Code Intelligence Matrix",
      score: "86 / 100",
      breakdown: [
        { name: "Frontend State & Optimization", val: 88 },
        { name: "Backend Scalability & ORM", val: 72 },
        { name: "Distributed System Design", val: 64 },
      ],
      status: "Scan Complete",
    },
  },
  {
    id: "profile",
    step: "03",
    label: "Skill Profile",
    short: "Skill Profile",
    icon: UserCheck,
    headline: "Live Adaptive Skill Profile",
    metric: "8 Core Strengths",
    metricHighlight: "Dynamic Graph",
    description: "A living representation of your real-world capability that dynamically updates as you write code, pass vivas, and complete tasks.",
    preview: {
      title: "Skill Verification Graph",
      radar: [
        { label: "React / Next.js", level: "Expert" },
        { label: "Database Optimization", level: "Intermediate" },
        { label: "API Design & Auth", level: "Advanced" },
        { label: "Cloud & CI/CD", level: "Developing" },
      ],
      status: "Live Matrix",
    },
  },
  {
    id: "gap",
    step: "04",
    label: "Skill Gap",
    short: "Skill Gap",
    icon: AlertTriangle,
    headline: "Targeted Priority Gap Detection",
    metric: "4 priority gaps",
    metricHighlight: "High-ROI Fixes",
    description: "Identifies precise missing proficiencies separating your current profile from the hiring expectations of top engineering teams.",
    preview: {
      title: "Priority Gaps for Full-Stack Lead",
      gaps: [
        { name: "System Design & Caching", impact: "High Priority", time: "10h focus" },
        { name: "Postgres Indexing & Sharding", impact: "High Priority", time: "8h focus" },
        { name: "Docker Containerization", impact: "Medium Priority", time: "6h focus" },
      ],
      status: "Actionable Insights",
    },
  },
  {
    id: "goal",
    step: "05",
    label: "Career Goal",
    short: "Career Goal",
    icon: Target,
    headline: "Target Role Calibration & Salary Target",
    metric: "Senior AI Engineer",
    metricHighlight: "Top 10% Tier",
    description: "Calibrate your learning path toward a specific compensation band, company profile, or specialized engineering track.",
    preview: {
      title: "Role Target: Senior Full Stack / AI Specialist",
      targetSalary: "₹18L - ₹28L CTC",
      timeline: "6 Months Milestone Track",
      readinessStart: "Current alignment: 58%",
      status: "Calibrated",
    },
  },
  {
    id: "roadmap",
    step: "06",
    label: "Personalized Roadmap",
    short: "Roadmap",
    icon: Map,
    headline: "Dynamic Milestone Roadmap",
    metric: "6-month personalized plan",
    metricHighlight: "Adaptive Weekly Milestones",
    description: "A tailored sprint schedule that adjusts day-by-day based on your learning speed, concept retention, and test results.",
    preview: {
      title: "Sprint Overview",
      modules: [
        { sprint: "Sprint 01", title: "Distributed State & WebSockets", done: true },
        { sprint: "Sprint 02", title: "Postgres Optimization & Caching", current: true },
        { sprint: "Sprint 03", title: "Microservices & Docker Deployment", pending: true },
      ],
      status: "Active Schedule",
    },
  },
  {
    id: "learn",
    step: "07",
    label: "Learn",
    short: "Learn",
    icon: BookOpen,
    headline: "Context-Aware Micro-Lessons",
    metric: "Adaptive lessons",
    metricHighlight: "Real-time AI Mentor",
    description: "Interactive theory paired with inline AI tutor answers, targeted code snippets, and conceptual mental models.",
    preview: {
      title: "Interactive Lesson: Database Sharding",
      concept: "Horizontal vs Vertical Partitioning",
      aiAssistance: "AI Mentor: Active in right drawer",
      status: "Guided Learning",
    },
  },
  {
    id: "practice",
    step: "08",
    label: "Practice",
    short: "Practice",
    icon: Code2,
    headline: "Hands-on Browser Sandbox",
    metric: "Instant test execution",
    metricHighlight: "Zero setup cloud runtime",
    description: "Write real code in modern TypeScript/Python runtimes with automated test validation and instant diff feedback.",
    preview: {
      title: "Cloud IDE Validation",
      suite: "9/9 Unit Tests Passing",
      latency: "Execution Time: 142ms",
      status: "Verified Submission",
    },
  },
  {
    id: "assess",
    step: "09",
    label: "Assess",
    short: "Assess",
    icon: CheckCircle2,
    headline: "Proctored Skill Diagnostics & AI Viva",
    metric: "Verified skill score",
    metricHighlight: "Anti-Cheat Protection",
    description: "AI-evaluated technical quizzes, live viva voice exams, and code assessments with tamper-proof certification.",
    preview: {
      title: "Viva Assessment Result",
      overall: "92% Score",
      feedback: "Strong architectural explanations; fluent query design",
      status: "Credential Earned",
    },
  },
  {
    id: "interview",
    step: "10",
    label: "Interview",
    short: "Interview",
    icon: Mic2,
    headline: "AI Mock Technical Interviews",
    metric: "Resume-specific simulation",
    metricHighlight: "Speech & Code Scoring",
    description: "Simulate rigorous engineering interviews tailored directly to your resume bullet points and target role requisitions.",
    preview: {
      title: "AI Interview Transcript & Scorecard",
      eval: [
        { metric: "Technical Accuracy", score: "94%" },
        { metric: "Communication Clarity", score: "89%" },
        { metric: "Problem Decomposition", score: "91%" },
      ],
      status: "Interview Ready",
    },
  },
  {
    id: "match",
    step: "11",
    label: "Job Matching",
    short: "Job Match",
    icon: Briefcase,
    headline: "Precision Job Match & ATS Optimization",
    metric: "91% match",
    metricHighlight: "Priority Referral",
    description: "Direct algorithmic alignment between your verified skill data and active engineering job openings across partner companies.",
    preview: {
      title: "Matched Requisitions",
      matches: [
        { role: "Full Stack Engineer", company: "FinTech Scaleup", match: "94%" },
        { role: "AI Software Engineer", company: "DataMindX AI", match: "91%" },
      ],
      status: "Active Referrals",
    },
  },
  {
    id: "ready",
    step: "12",
    label: "Career Ready",
    short: "Career Ready",
    icon: Award,
    headline: "Autonomous Career Readiness",
    metric: "73% -> 96% readiness",
    metricHighlight: "Offer-Grade Competency",
    description: "Continuous real-time tracking that proves your hireability to recruiters with verified credentials, live projects, and interview scores.",
    preview: {
      title: "Dynamic Career Readiness Score",
      finalScore: "96%",
      badge: "Top 5% Candidate Benchmark",
      status: "Placement Pipeline Activated",
    },
  },
];

export default function LandingProExperience() {
  const isDark = useThemeStore((s) => s.isDark);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#000000" : "#FFFFFF";

  const activeStep = PRO_STEPS[activeStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <section className="px-6 sm:px-10 py-28 relative border-t border-b" style={{ backgroundColor: bg, borderColor: border }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#10b981" }}
            >
              Eduvantix Pro Experience
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            style={{
              color: text,
              fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              marginTop: "1rem",
            }}
          >
            More than learning.<br />A career system built around you.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            style={{
              color: secondary,
              fontSize: "1.15rem",
              lineHeight: 1.65,
              marginTop: "1.25rem",
            }}
          >
            Eduvantix Pro understands where you are, identifies what's missing, and continuously builds the path toward where you want to go.
          </motion.p>
        </div>

        {/* Step Navigator — wrapping pill grid */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2">
            {PRO_STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isPast = idx < activeStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border ${
                    isActive ? "shadow-sm" : "hover:opacity-85"
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? (isDark ? "#0D0D0D" : "#FFFFFF")
                      : "transparent",
                    borderColor: isActive
                      ? "#10b981"
                      : isPast
                      ? "rgba(16,185,129,0.25)"
                      : border,
                    color: isActive ? text : secondary,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      backgroundColor: isActive
                        ? "#10b981"
                        : isPast
                        ? "rgba(16,185,129,0.18)"
                        : isDark
                        ? "#1C1C1C"
                        : "#EBEBEB",
                      color: isActive
                        ? "#FFFFFF"
                        : isPast
                        ? "#10b981"
                        : secondary,
                    }}
                  >
                    {step.step}
                  </div>
                  <span>{step.short}</span>
                </button>
              );
            })}
          </div>
          {/* Thin progress track beneath pills */}
          <div
            className="mt-4 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: border }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(activeStepIndex / (PRO_STEPS.length - 1)) * 100}%`,
                backgroundColor: "#10b981",
              }}
            />
          </div>
        </div>

        {/* Live Interactive Product Visualization Card for Active Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-3xl border p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-lg"
            style={{
              backgroundColor: cardBg,
              borderColor: border,
            }}
          >
            {/* Left Column: Step Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                >
                  <StepIcon size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">
                    Step {activeStep.step} of 12
                  </span>
                  <h3
                    style={{
                      color: text,
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                    }}
                  >
                    {activeStep.headline}
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: secondary }}>
                {activeStep.description}
              </p>

              {/* Key Metrics Highlight Strip */}
              <div
                className="p-4 rounded-2xl border flex items-center justify-between gap-4"
                style={{ backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: border }}
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider block" style={{ color: secondary }}>
                    Observed Metric
                  </span>
                  <span className="text-sm font-bold mt-0.5 block" style={{ color: text }}>
                    {activeStep.metric}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider block" style={{ color: secondary }}>
                    AI Validation
                  </span>
                  <span className="text-sm font-bold text-emerald-500 mt-0.5 block">
                    {activeStep.metricHighlight}
                  </span>
                </div>
              </div>

              {/* Interactive Next Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveStepIndex((prev) => (prev + 1) % PRO_STEPS.length)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
                >
                  Next: {PRO_STEPS[(activeStepIndex + 1) % PRO_STEPS.length].short}
                  <ArrowRight size={13} />
                </button>
                <span className="text-xs" style={{ color: secondary }}>
                  Click step numbers above to explore the entire loop
                </span>
              </div>
            </div>

            {/* Right Column: Simulated Live Product Widget */}
            <div className="lg:col-span-6">
              <div
                className="p-6 sm:p-8 rounded-2xl border relative overflow-hidden shadow-sm"
                style={{
                  backgroundColor: isDark ? "#0D0D0D" : "#FBFBFB",
                  borderColor: border,
                }}
              >
                {/* Header of Preview Box */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: border }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-tight" style={{ color: text }}>
                      {activeStep.preview.title}
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981" }}
                  >
                    {activeStep.preview.status}
                  </span>
                </div>

                {/* Dynamic Content based on preview type */}
                {activeStep.preview.tags && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {activeStep.preview.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg text-xs font-medium border"
                          style={{
                            backgroundColor: isDark ? "#141414" : "#FFFFFF",
                            borderColor: border,
                            color: text,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border, color: secondary }}>
                      💡 {activeStep.preview.missingNote}
                    </div>
                  </div>
                )}

                {activeStep.preview.breakdown && (
                  <div className="space-y-3.5">
                    {activeStep.preview.breakdown.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-xs mb-1.5" style={{ color: text }}>
                          <span>{item.name}</span>
                          <span className="font-bold">{item.val}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? "#222" : "#E2E8F0" }}>
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.radar && (
                  <div className="grid grid-cols-2 gap-3">
                    {activeStep.preview.radar.map((r) => (
                      <div
                        key={r.label}
                        className="p-3 rounded-xl border"
                        style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}
                      >
                        <span className="text-[11px] block truncate" style={{ color: secondary }}>
                          {r.label}
                        </span>
                        <span className="text-xs font-bold text-emerald-500 mt-1 block">
                          {r.level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.gaps && (
                  <div className="space-y-2.5">
                    {activeStep.preview.gaps.map((g) => (
                      <div
                        key={g.name}
                        className="p-3 rounded-xl border flex items-center justify-between text-xs"
                        style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}
                      >
                        <span className="font-semibold" style={{ color: text }}>{g.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">
                          {g.impact} • {g.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.targetSalary && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}>
                      <span className="text-[11px] block" style={{ color: secondary }}>Target Compensation</span>
                      <span className="text-base font-bold text-emerald-500 mt-0.5 block">{activeStep.preview.targetSalary}</span>
                    </div>
                    <div className="p-3 rounded-xl border flex justify-between" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border, color: text }}>
                      <span>{activeStep.preview.timeline}</span>
                      <span className="font-bold text-emerald-500">{activeStep.preview.readinessStart}</span>
                    </div>
                  </div>
                )}

                {activeStep.preview.modules && (
                  <div className="space-y-2">
                    {activeStep.preview.modules.map((m) => (
                      <div
                        key={m.sprint}
                        className="p-3 rounded-xl border flex items-center justify-between text-xs"
                        style={{
                          backgroundColor: m.current ? "rgba(16,185,129,0.07)" : isDark ? "#141414" : "#FFFFFF",
                          borderColor: m.current ? "#10b981" : border,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">{m.sprint}</span>
                          <span className="font-medium" style={{ color: text }}>{m.title}</span>
                        </div>
                        {m.done && <Check size={14} className="text-emerald-500 shrink-0" />}
                        {m.current && <span className="text-[10px] font-bold text-emerald-500">In Progress</span>}
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.concept && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}>
                      <span className="text-[11px] block" style={{ color: secondary }}>Core Concept</span>
                      <span className="font-semibold mt-0.5 block" style={{ color: text }}>{activeStep.preview.concept}</span>
                    </div>
                    <div className="p-3 rounded-xl border text-emerald-500 font-medium" style={{ backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
                      ✓ {activeStep.preview.aiAssistance}
                    </div>
                  </div>
                )}

                {activeStep.preview.suite && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl border font-mono flex items-center justify-between" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}>
                      <span className="text-emerald-500 font-bold">{activeStep.preview.suite}</span>
                      <span style={{ color: secondary }}>{activeStep.preview.latency}</span>
                    </div>
                  </div>
                )}

                {activeStep.preview.overall && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}>
                      <span className="font-bold text-lg text-emerald-500">{activeStep.preview.overall}</span>
                      <span style={{ color: secondary }} className="text-right">{activeStep.preview.feedback}</span>
                    </div>
                  </div>
                )}

                {activeStep.preview.eval && (
                  <div className="space-y-2">
                    {activeStep.preview.eval.map((ev) => (
                      <div
                        key={ev.metric}
                        className="p-3 rounded-xl border flex justify-between text-xs"
                        style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}
                      >
                        <span style={{ color: text }}>{ev.metric}</span>
                        <span className="font-bold text-emerald-500">{ev.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.matches && (
                  <div className="space-y-2">
                    {activeStep.preview.matches.map((match) => (
                      <div
                        key={match.role}
                        className="p-3 rounded-xl border flex justify-between items-center text-xs"
                        style={{ backgroundColor: isDark ? "#141414" : "#FFFFFF", borderColor: border }}
                      >
                        <div>
                          <span className="font-bold block" style={{ color: text }}>{match.role}</span>
                          <span className="text-[11px]" style={{ color: secondary }}>{match.company}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-500">
                          {match.match} Match
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep.preview.finalScore && (
                  <div className="text-center py-4 space-y-2">
                    <span className="text-4xl font-extrabold tracking-tight text-emerald-500 block">
                      {activeStep.preview.finalScore}
                    </span>
                    <span className="text-xs font-semibold block" style={{ color: text }}>
                      {activeStep.preview.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
