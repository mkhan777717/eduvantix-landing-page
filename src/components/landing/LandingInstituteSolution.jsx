"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2, Users, UserCheck, ShieldCheck, GraduationCap,
  Layers, BarChart3, Target, BookOpen, Code2, CheckCircle2,
  FolderGit2, Award, ArrowRight, Check, Activity, TrendingUp
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const INSTITUTE_ROLES = [
  {
    id: "admin",
    title: "INSTITUTE ADMIN",
    role: "Leadership & Dean",
    icon: ShieldCheck,
    tagline: "Total institutional visibility, cohort governance, and placement velocity.",
    tools: [
      "Institute Management & Multi-Campus Scopes",
      "User & Faculty Access Control",
      "Batch & Cohort Orchestration",
      "Mentor Capacity & Assignment",
      "Enterprise Institutional Analytics",
      "Custom Curriculum & Content Ingestion",
      "Placement Velocity & Partner Matching",
    ],
  },
  {
    id: "batch_manager",
    title: "BATCH MANAGER",
    role: "Program Ops & Academic Coordinators",
    icon: Layers,
    tagline: "Granular scheduling, attendance enforcement, and cohort performance pacing.",
    tools: [
      "Automated Batch Management & Milestones",
      "Biometric & Digital Attendance Tracking",
      "Live Class & Viva Scheduling",
      "Real-time Cohort Performance Heatmaps",
      "Intervention Alerts for At-Risk Students",
      "Automated Weekly Academic Reports",
    ],
  },
  {
    id: "mentor",
    title: "MENTOR",
    role: "Instructors & Teaching Assistants",
    icon: UserCheck,
    tagline: "Empower faculty with AI-assisted code review, auto-grading, and viva exams.",
    tools: [
      "Real-time Student Activity Monitoring",
      "Assignment Creation & Code Sandboxes",
      "Proctored Technical Assessments",
      "Automated Diff Reviews & Feedback",
      "1-on-1 Office Hour Management",
      "Individual Velocity & Mastery Tracking",
    ],
  },
  {
    id: "student",
    title: "STUDENT",
    role: "Enrolled Scholars & Cohort Members",
    icon: GraduationCap,
    tagline: "A unified portal for guided lectures, coding sandboxes, and portfolio generation.",
    tools: [
      "Structured Curriculum & Daily Sprints",
      "Interactive In-Browser Cloud IDE",
      "Production-Grade Portfolio Projects",
      "Proctored Skill Diagnostics & AI Viva",
      "ATS Resume & Verified Portfolio Live URL",
      "Direct Placement Opportunities",
    ],
  },
];

const METRICS_DATA = [
  { label: "ENROLLED STUDENTS", value: "1,284", delta: "+18% this semester" },
  { label: "ACTIVE BATCHES", value: "24", delta: "Across 4 departments" },
  { label: "FACULTY & MENTORS", value: "42", delta: "100% active this week" },
  { label: "AVERAGE READINESS", value: "74%", delta: "+26% vs baseline" },
  { label: "PROJECTS COMPLETED", value: "3,842", delta: "Verified in GitHub" },
];

const BENEFITS = [
  {
    num: "01",
    title: "Centralized Management",
    desc: "Manage students, mentors, batches, and curricula from one unified administrative console without fragmented spreadsheets.",
    badge: "Operations OS",
    previewType: "admin_grid",
  },
  {
    num: "02",
    title: "Student Progress Tracking",
    desc: "Understand exactly how every student is progressing through diagnostic mastery graphs, attendance logs, and velocity indexes.",
    badge: "Learning Diagnostics",
    previewType: "student_progress",
  },
  {
    num: "03",
    title: "Mentor Control & Tooling",
    desc: "Give mentors the tools to teach, monitor code commits in real-time, conduct AI vivas, and evaluate submissions with automated feedback.",
    badge: "Faculty Empowerment",
    previewType: "mentor_tools",
  },
  {
    num: "04",
    title: "Automated Technical Assessments",
    desc: "Create and administer anti-cheat coding exams, automated test-suite validations, and audio viva evaluations with tamper-proof records.",
    badge: "Evaluation Suite",
    previewType: "assessments",
  },
  {
    num: "05",
    title: "Project-Based Learning",
    desc: "Track real-world engineering project development from initial GitHub repository forks to deployed cloud endpoints and automated portfolios.",
    badge: "Portfolio Proof",
    previewType: "projects",
  },
  {
    num: "06",
    title: "Career Readiness & Placements",
    desc: "Benchmark student hiring readiness against market standards and connect high-performing candidates directly to recruiting partners.",
    badge: "Outcome Engine",
    previewType: "career",
  },
];

const TRANSFORMATION_STEPS = [
  { label: "Content", icon: BookOpen },
  { label: "Learning", icon: Layers },
  { label: "Practice", icon: Code2 },
  { label: "Projects", icon: FolderGit2 },
  { label: "Assessments", icon: CheckCircle2 },
  { label: "Skills", icon: Activity },
  { label: "Career Readiness", icon: Award },
];

export default function LandingInstituteSolution() {
  const isDark = useThemeStore((s) => s.isDark);
  const [selectedRole, setSelectedRole] = useState("admin");

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F9F9F9";

  const activeRoleData = INSTITUTE_ROLES.find((r) => r.id === selectedRole) || INSTITUTE_ROLES[0];
  const RoleIcon = activeRoleData.icon;

  return (
    <section id="institutes" className="px-6 sm:px-10 py-28 relative" style={{ backgroundColor: bg }}>
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
              style={{ color: "#059669" }}
            >
              Eduvantix for Institutes
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
            Bring your entire institute<br />onto one platform.
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
            Manage students, mentors, batches, learning, assessments, projects and career outcomes from one intelligent platform.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            <a
              href="mailto:hello@eduvantix.com?subject=Institute+Partnership+Inquiry"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
            >
              Partner With Eduvantix
              <ArrowRight size={15} />
            </a>
            <a
              href="mailto:demo@eduvantix.com?subject=Explore+Institute+Platform"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-75"
              style={{
                backgroundColor: "transparent",
                color: text,
                border: `1.5px solid ${border}`,
              }}
            >
              Explore Institute Platform
            </a>
          </motion.div>
        </div>

        {/* ── 1. Interactive Institute Ecosystem Visualization ── */}
        <div
          className="rounded-3xl border p-8 sm:p-12 mb-16 shadow-sm"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-1">
              Multi-Role Ecosystem
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
              One Connected Operational Backbone
            </h3>
            <p className="text-xs mt-2" style={{ color: secondary }}>
              Select a stakeholder role below to see their dedicated workspace capabilities:
            </p>
          </div>

          {/* 4 Interactive Stakeholder Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {INSTITUTE_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = role.id === selectedRole;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between ${isSelected ? "ring-2 ring-emerald-500 shadow-md" : "hover:opacity-85"
                    }`}
                  style={{
                    backgroundColor: isSelected ? (isDark ? "#141414" : "#FFFFFF") : (isDark ? "#0A0A0A" : "#F6F6F6"),
                    borderColor: isSelected ? "#059669" : border,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? "rgba(16,185,129,0.15)" : isDark ? "#222" : "#EAEAEA",
                        color: isSelected ? "#10b981" : secondary,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: isSelected ? text : secondary }}>
                      {role.title}
                    </span>
                    <span className="text-[11px] block truncate mt-0.5" style={{ color: secondary }}>
                      {role.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Capability Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoleData.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-2xl border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              style={{
                backgroundColor: isDark ? "#0D0D0D" : "#FFFFFF",
                borderColor: border,
              }}
            >
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981" }}
                  >
                    <RoleIcon size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 block">
                      Active Workspace
                    </span>
                    <h4
                      style={{
                        color: text,
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                      }}
                    >
                      {activeRoleData.title}
                    </h4>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                  {activeRoleData.tagline}
                </p>
              </div>

              <div className="lg:col-span-7">
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-3" style={{ color: secondary }}>
                  Dedicated Toolkit & Controls
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeRoleData.tools.map((tool) => (
                    <div
                      key={tool}
                      className="p-3 rounded-xl border flex items-center gap-2 text-xs"
                      style={{
                        backgroundColor: isDark ? "#141414" : "#F8FAFC",
                        borderColor: border,
                        color: text,
                      }}
                    >
                      <Check size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                      <span className="leading-snug">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── 2. Institute Live Dashboard Preview ── */}
        <div
          className="rounded-3xl border p-8 sm:p-12 mb-16 shadow-sm"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b" style={{ borderColor: border }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">
                Institute Command Center
              </span>
              <h3
                className="mt-1"
                style={{
                  color: text,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                }}
              >
                Executive Performance Dashboard
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium" style={{ color: secondary }}>
                Live Institutional Telemetry
              </span>
            </div>
          </div>

          {/* 5 Real Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {METRICS_DATA.map((m) => (
              <div
                key={m.label}
                className="p-4 sm:p-5 rounded-2xl border"
                style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: secondary }}>
                  {m.label}
                </span>
                <span
                  className="mt-2 block"
                  style={{
                    color: text,
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                  }}
                >
                  {m.value}
                </span>
                <span className="text-[10px] text-emerald-500 font-medium block mt-1">
                  {m.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Subtle Data Visualizations (Analytics previews) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Performance */}
            <div
              className="p-5 rounded-2xl border"
              style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: text }}>Student Performance</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">92% Passing</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1" style={{ color: secondary }}>
                    <span>Advanced Tier (&gt;85%)</span>
                    <span className="font-bold" style={{ color: text }}>48%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800/20">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "48%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1" style={{ color: secondary }}>
                    <span>Competent Tier (65-85%)</span>
                    <span className="font-bold" style={{ color: text }}>44%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800/20">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "44%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1" style={{ color: secondary }}>
                    <span>Requires Intervention (&lt;65%)</span>
                    <span className="font-bold" style={{ color: text }}>8%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800/20">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Performance & Skill Distribution */}
            <div
              className="p-5 rounded-2xl border"
              style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: text }}>Skill Distribution</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">Top Competencies</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span className="text-[10px] block" style={{ color: secondary }}>Full-Stack Eng</span>
                  <span className="font-bold text-emerald-500">84% Mastery</span>
                </div>
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span className="text-[10px] block" style={{ color: secondary }}>Cloud & DevOps</span>
                  <span className="font-bold text-blue-500">76% Mastery</span>
                </div>
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span className="text-[10px] block" style={{ color: secondary }}>Data & AI Systems</span>
                  <span className="font-bold text-purple-500">79% Mastery</span>
                </div>
                <div className="p-2.5 rounded-xl border" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span className="text-[10px] block" style={{ color: secondary }}>System Design</span>
                  <span className="font-bold text-amber-500">71% Mastery</span>
                </div>
              </div>
            </div>

            {/* Career Readiness & Placements */}
            <div
              className="p-5 rounded-2xl border md:col-span-2 lg:col-span-1"
              style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: text }}>Placement Readiness</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">Ready to Interview</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span style={{ color: secondary }}>Interview-Ready Candidates</span>
                  <span className="font-bold text-emerald-500 text-sm">624 Students</span>
                </div>
                <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: isDark ? "#141414" : "#F8FAFC", borderColor: border }}>
                  <span style={{ color: secondary }}>Verified GitHub Portfolios</span>
                  <span className="font-bold text-blue-500 text-sm">1,190 Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Institute Ecosystem Hierarchy Flow ── */}
        <div
          className="rounded-3xl border p-8 sm:p-12 mb-16 shadow-sm"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-1">
              End-to-End Governance
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
              Hierarchical Control & Execution Flow
            </h3>
          </div>

          {/* Stakeholder Hierarchy Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
            {INSTITUTE_ROLES.map((r, i) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl border text-center flex flex-col items-center justify-center relative"
                style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 font-bold text-xs">
                  0{i + 1}
                </div>
                <span className="text-xs font-bold block" style={{ color: text }}>{r.title}</span>
                <span className="text-[10px]" style={{ color: secondary }}>{r.role}</span>
              </div>
            ))}
          </div>

          {/* Connected Operational Capabilities */}
          <div className="text-center text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: secondary }}>
            Connected to 6 core execution engines:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Content", desc: "Curriculum Ingestion" },
              { name: "Practice", desc: "Cloud Sandboxes" },
              { name: "Assessments", desc: "Proctored Tests" },
              { name: "Projects", desc: "GitHub Portfolios" },
              { name: "Analytics", desc: "Cohort Intelligence" },
              { name: "Career", desc: "Employer Referrals" },
            ].map((engine) => (
              <div
                key={engine.name}
                className="p-3.5 rounded-xl border text-center"
                style={{ backgroundColor: isDark ? "#0E0E0E" : "#FFFFFF", borderColor: border }}
              >
                <span className="text-xs font-bold block text-emerald-500">{engine.name}</span>
                <span className="text-[10px] block mt-0.5" style={{ color: secondary }}>{engine.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Institute 6 Key Benefits with Alternating Layouts ── */}
        <div className="mb-20">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-1">
              Institutional Advantages
            </span>
            <h3
              style={{
                color: text,
                fontSize: "2rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              }}
            >
              Built for institutional excellence.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <motion.div
                key={benefit.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="p-7 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {benefit.num}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                    >
                      {benefit.badge}
                    </span>
                  </div>
                  <h4
                    style={{
                      color: text,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {benefit.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                    {benefit.desc}
                  </p>
                </div>

                {/* Subtle Mini UI Data Element */}
                <div
                  className="mt-6 pt-4 border-t flex items-center justify-between text-[11px]"
                  style={{ borderColor: border, color: secondary }}
                >
                  <span>Automated in Eduvantix OS</span>
                  <span className="font-semibold text-emerald-500">Enterprise Ready ✓</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── 5. Institute Outcome Transformation Statement ── */}
        <div
          className="rounded-3xl border p-8 sm:p-12 text-center"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block mb-2">
            The Institutional Transformation
          </span>
          <h3
            style={{
              color: text,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              maxWidth: "38rem",
              margin: "0 auto 2.5rem",
            }}
          >
            From teaching students to building career outcomes.
          </h3>

          {/* Connected Transformation Chain */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRANSFORMATION_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === TRANSFORMATION_STEPS.length - 1;

              return (
                <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${isLast ? "bg-emerald-500 text-white border-emerald-500 shadow-md" : ""
                      }`}
                    style={{
                      backgroundColor: isLast ? "#059669" : isDark ? "#141414" : "#FFFFFF",
                      borderColor: isLast ? "#059669" : border,
                      color: isLast ? "#FFFFFF" : text,
                    }}
                  >
                    <Icon size={14} className={isLast ? "text-white" : "text-emerald-500"} />
                    <span>{step.label}</span>
                  </div>
                  {!isLast && (
                    <ArrowRight size={14} className="shrink-0" style={{ color: secondary }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
