"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  motion, useInView, useScroll, useTransform,
  useMotionValue, useSpring, useMotionTemplate,
  AnimatePresence
} from "framer-motion";
import {
  ShieldCheck, Users, Layers, Brain,
  ArrowRight, CheckCircle2, Building2, GraduationCap,
  BarChart2, Zap, UserCheck, Code2, BookOpen,
  FolderGit2, Award, Check, Calendar, ShieldAlert,
  Mail, Phone, MessageSquare, Send, Loader2, X
} from "lucide-react";
import { getApiBase } from "@/utils/api";
import Lenis from "lenis";
import useThemeStore from "@/store/useThemeStore";
import FeatureScrollStack from "@/components/FeatureScrollStack";
import useReducedMotion from "@/customHooks/useReducedMotion";
import TiltCard from "@/components/TitleCard";
import { EASE_OUT_EXPO, SPRING_CONFIG, SPRING_SNAPPY } from "@/utils/constants";
import ParticleCursor from "@/components/ParticleCursor";

// ─── Data ─────────────────────────────────────────────────────────────
const INSTITUTE_ROLES = [
  {
    id: "admin",
    title: "Institute Admin",
    role: "Leadership & Deans",
    icon: ShieldCheck,
    tagline: "Total institutional visibility, cohort governance, and placement velocity.",
    tools: [
      "Multi-Campus Scope Management",
      "Faculty & User Access Control",
      "Batch & Cohort Orchestration",
      "Enterprise Analytics Dashboard",
      "Custom Curriculum Ingestion",
      "Placement Partner Matching",
    ],
  },
  {
    id: "batch_manager",
    title: "Batch Manager",
    role: "Program Ops & Coordinators",
    icon: Layers,
    tagline: "Granular scheduling, attendance enforcement, and cohort performance pacing.",
    tools: [
      "Automated Milestone Management",
      "Digital Attendance Tracking",
      "Live Class & Viva Scheduling",
      "Cohort Performance Heatmaps",
      "At-Risk Student Alerts",
      "Automated Weekly Reports",
    ],
  },
  {
    id: "mentor",
    title: "Mentor",
    role: "Instructors & Teaching Assistants",
    icon: UserCheck,
    tagline: "Empower faculty with AI-assisted code review, auto-grading, and viva exams.",
    tools: [
      "Live Student Activity Monitor",
      "Assignment & Sandbox Creation",
      "Proctored Technical Exams",
      "AI Diff Reviews & Feedback",
      "Office Hour Management",
      "Mastery Tracking Dashboards",
    ],
  },
  {
    id: "student",
    title: "Student",
    role: "Enrolled Scholars",
    icon: GraduationCap,
    tagline: "A unified portal for guided lectures, coding sandboxes, and portfolio generation.",
    tools: [
      "Structured Curriculum & Sprints",
      "In-Browser Cloud IDE",
      "Production-Grade Projects",
      "AI Viva & Skill Diagnostics",
      "ATS Resume Builder",
      "Direct Placement Access",
    ],
  },
];

const STATS = [
  { value: "4", label: "Stakeholder Roles", sub: "Admin, Manager, Mentor, Student" },
  { value: "12+", label: "Integrated Modules", sub: "From content to careers" },
  { value: "Live", label: "Analytics", sub: "Real-time telemetry" },
  { value: "AI", label: "Powered Assessments", sub: "Anti-cheat viva & proctoring" },
];

const CAPABILITIES = [
  { icon: Users, title: "Mentor Portal", desc: "Dedicated dashboard for instructors to manage submissions, guide students, and track engagement across batches." },
  { icon: Layers, title: "Batch Management", desc: "Organize students into cohorts, assign learning tracks, and monitor batch-wise progress and milestones." },
  { icon: BarChart2, title: "Analytics & Reports", desc: "Real-time dashboards with placement velocity, readiness scores, and intervention alerts for at-risk students." },
  { icon: BookOpen, title: "Study Materials", desc: "Centralized distribution of curriculum, notes, and references directly to assigned cohorts and batches." },
  { icon: Calendar, title: "Attendance Tracking", desc: "Seamlessly track student attendance across live sessions, contests, assignments, and viva examinations." },
  { icon: ShieldAlert, title: "Proctored Exams", desc: "Anti-cheat coding tests with identity verification, tab-focus monitoring, and tamper-proof result records." },
  { icon: Code2, title: "Cloud IDE Sandboxes", desc: "Browser-based coding environments for real-time project execution with automated test suite validations." },
  { icon: FolderGit2, title: "Portfolio Projects", desc: "Track engineering project development from GitHub forks to deployed endpoints with automated portfolios." },
  { icon: Award, title: "Placement Engine", desc: "Benchmark hiring readiness against market standards and connect candidates directly to verified employer pipelines." },
];

// ─── Hooks ────────────────────────────────────────────────────────────
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const h = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, [x, y]);
  return { x, y };
}

// ─── Sub-components ───────────────────────────────────────────────────
function CursorGlow() {
  const { x, y } = useMousePosition();
  const sx = useSpring(x, { stiffness: 50, damping: 20 });
  const sy = useSpring(y, { stiffness: 50, damping: 20 });
  return (
    <motion.div
      className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-[1] opacity-[0.04]"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", background: "radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)" }}
    />
  );
}

function MeshBg() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div className="absolute w-[700px] h-[700px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)", top: "-20%", right: "-15%", filter: "blur(100px)" }}
        animate={reduced ? {} : { scale: [1, 1.12, 1], rotate: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,1) 0%, transparent 70%)", bottom: "-10%", left: "-10%", filter: "blur(80px)" }}
        animate={reduced ? {} : { scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left" style={{ scaleX, background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />;
}

function GridPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function InstitutesClient() {
  const isDark = useThemeStore((s) => s.isDark);
  const reduced = useReducedMotion();
  const [selectedRole, setSelectedRole] = useState("admin");
  const [formData, setFormData] = useState({ name: "", university: "", email: "", phone: "", message: "" });
  const [formStatus, setFormStatus] = useState(null); // null | "submitting" | "success" | "error"

  useLenis();

  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroP, [0, 1], [0, 160]);
  const heroOpacity = useTransform(heroP, [0, 0.6], [1, 0]);
  const smoothY = useSpring(heroY, SPRING_CONFIG);

  const activeRole = INSTITUTE_ROLES.find((r) => r.id === selectedRole) || INSTITUTE_ROLES[0];
  const RoleIcon = activeRole.icon;

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F9F9F9";
  const inputBg = isDark ? "#0D0D0D" : "#FFFFFF";

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    try {
      const res = await fetch(`${getApiBase()}/api/auth/request-institute-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setFormStatus(res.ok && data.success ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  };

  const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
  const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } } };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: bg }}>
      <ScrollProgress />
      <ParticleCursor />
      <Navbar />

      <main className="flex-grow">

        {/* ════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative w-full min-h-[92vh] flex items-center overflow-hidden">
          <MeshBg />
          <GridPattern />

          <motion.div
            className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-28 md:py-36"
            style={{ y: reduced ? 0 : smoothY, opacity: reduced ? 1 : heroOpacity }}
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#10b981" }}>
                Eduvantix for Institutions
              </span>
            </motion.div>

            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.35, ease: EASE_OUT_EXPO }}
                style={{ fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, color: text }}
                className="text-5xl md:text-6xl lg:text-7xl mb-6"
              >
                One platform.<br />
                <span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Your entire institute.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: 0.55, ease: EASE_OUT_EXPO }}
                className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
                style={{ color: secondary, fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` }}
              >
                Manage students, mentors, and batches. Run live classes, AI-proctored assessments, and coding sandboxes. Track placement outcomes — all from a single, intelligent console.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease: EASE_OUT_EXPO }}
                className="flex flex-wrap gap-4"
              >
                <a href="#contact"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-sm shadow-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 32px rgba(16,185,129,0.3)" }}
                >
                  <Building2 size={16} /> Request Demo <ArrowRight size={15} />
                </a>
                <a href="#features"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm border transition-all hover:border-emerald-500/40"
                  style={{ borderColor: border, color: text }}
                >
                  Explore Features
                </a>
              </motion.div>
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.0, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl"
            >
              {STATS.map((s) => (
                <div key={s.label} className="p-5 rounded-2xl border" style={{ backgroundColor: cardBg, borderColor: border }}>
                  <div style={{ color: "#10b981", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>{s.value}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: text }}>{s.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: secondary }}>{s.sub}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════
            ROLE WORKSPACES
        ════════════════════════════════════════════════════════ */}
        <section id="features" className="px-6 sm:px-10 py-24" style={{ backgroundColor: bg }}>
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-14">
              <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#10b981" }}>
                Multi-Role Platform
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.06 }}
                style={{ color: text, fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, marginTop: "0.75rem" }}
              >
                A dedicated workspace for every stakeholder.
              </motion.h2>
            </div>

            {/* Role Tab Bar */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {INSTITUTE_ROLES.map((role) => {
                const Icon = role.icon;
                const active = role.id === selectedRole;
                return (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200"
                    style={{
                      backgroundColor: active ? "#059669" : (isDark ? "#0D0D0D" : "#F5F5F5"),
                      borderColor: active ? "#059669" : border,
                      color: active ? "#FFFFFF" : secondary,
                      boxShadow: active ? "0 4px 18px rgba(16,185,129,0.25)" : "none",
                    }}
                  >
                    <Icon size={14} />
                    {role.title}
                  </button>
                );
              })}
            </div>

            {/* Active Role Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                className="rounded-2xl border p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                      <RoleIcon size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 block">Active Role</span>
                      <h3 style={{ color: text, fontWeight: 700, fontSize: "1.25rem", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>{activeRole.title}</h3>
                    </div>
                  </div>
                  <p style={{ color: secondary, fontSize: "0.95rem", lineHeight: 1.7 }}>{activeRole.tagline}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeRole.role}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-4" style={{ color: secondary }}>Dedicated Toolkit</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRole.tools.map((tool) => (
                      <div key={tool} className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium"
                        style={{ backgroundColor: inputBg, borderColor: border, color: text }}>
                        <Check size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            FEATURE SCROLL STACK
        ════════════════════════════════════════════════════════ */}
        <section className="px-6 py-12 sm:px-12 sm:py-20 lg:px-28 lg:py-24" style={{ backgroundColor: bg }}>
          <FeatureScrollStack />
        </section>

        {/* ════════════════════════════════════════════════════════
            OPERATIONAL CAPABILITIES SUITE
        ════════════════════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 py-24" style={{ backgroundColor: isDark ? "#030303" : "#F8FAFC" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#10b981" }}>
                  Campus Infrastructure
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
                style={{ color: text, fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.035em", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
              >
                Complete Operational Suite for Modern Campuses
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
                className="mt-4 text-base" style={{ color: secondary, fontFamily: `'Inter', -apple-system, sans-serif` }}
              >
                9 purpose-built infrastructure modules engineered to eliminate fragmented spreadsheets and streamline every stage of the academic journey.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.06, ease: EASE_OUT_EXPO }}
                  >
                    <TiltCard className="h-full p-6 rounded-2xl border group cursor-default relative overflow-hidden" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF", borderColor: border }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-emerald-500/20" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                          <Icon size={18} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-mono font-bold" style={{ color: secondary }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold mb-2" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>{cap.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: secondary, fontFamily: `'Inter', -apple-system, sans-serif` }}>{cap.desc}</p>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            PREMIUM CONTACT FORM
        ════════════════════════════════════════════════════════ */}
        <section id="contact" className="px-6 sm:px-10 py-28 relative overflow-hidden" style={{ backgroundColor: bg }}>
          <MeshBg />
          <div className="max-w-5xl mx-auto relative z-10">

            {/* Section header */}
            <div className="text-center max-w-xl mx-auto mb-16">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#10b981" }}>
                  Partner With Eduvantix
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
                style={{ color: text, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
              >
                Bring Eduvantix to your institution.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.14 }}
                className="mt-4 text-base" style={{ color: secondary, fontFamily: `'Inter', -apple-system, sans-serif` }}
              >
                Request a demo and our university relations team will set up a dedicated institute portal for you within 24 hours.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">

              {/* Left — info */}
              <motion.div
                className="lg:col-span-2 space-y-8"
                initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              >
                <div>
                  <h3 style={{ color: text, fontSize: "1.3rem", fontWeight: 700, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                    What you get
                  </h3>
                  <div className="mt-5 space-y-3.5">
                    {[
                      "Custom institute onboarding within 24h",
                      "Dedicated support manager assigned",
                      "Bulk student & faculty provisioning",
                      "Customized analytics & reporting",
                      "White-label branding options",
                      "Direct SLA-backed infrastructure",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(16,185,129,0.12)" }}>
                          <Check size={11} className="text-emerald-500" strokeWidth={3} />
                        </div>
                        <span className="text-sm" style={{ color: secondary, fontFamily: `'Inter', -apple-system, sans-serif` }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <a href="mailto:hello@eduvantix.com" className="flex items-center gap-3 text-sm group" style={{ color: secondary }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-500/10" style={{ backgroundColor: isDark ? "#111" : "#F0FDF4", border: `1px solid ${border}` }}>
                      <Mail size={14} className="text-emerald-500" />
                    </div>
                    <span className="group-hover:text-emerald-500 transition-colors" style={{ fontFamily: `'Inter', -apple-system, sans-serif` }}>hello@eduvantix.com</span>
                  </a>
                </div>
              </motion.div>

              {/* Right — form */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
              >
                <div className="rounded-2xl border p-7 sm:p-9 relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: border }}>
                  {/* Glow accent */}
                  <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-[0.06] rounded-full"
                    style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", transform: "translate(40%, -40%)" }} />

                  <AnimatePresence mode="wait">
                    {formStatus === "success" ? (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-5">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.12)" }}>
                          <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>Request Received</h3>
                          <p className="text-sm" style={{ color: secondary, fontFamily: `'Inter', -apple-system, sans-serif` }}>
                            Our team will reach out within 24 hours to provision your Institute Admin portal.
                          </p>
                        </div>
                        <button onClick={() => setFormStatus(null)} className="text-xs font-semibold text-emerald-500 hover:underline mt-2">
                          Submit another request
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form key="form" onSubmit={handleFormSubmit} className="space-y-5 relative z-10">
                        <div className="mb-6">
                          <h3 className="text-lg font-bold" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>Request a Demo</h3>
                          <p className="text-xs mt-1" style={{ color: secondary }}>We'll get back to you within 24 hours.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondary }}>Full Name *</label>
                            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Jane Doe"
                              className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all duration-200"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text, fontFamily: `'Inter', -apple-system, sans-serif` }}
                              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                              onBlur={(e) => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondary }}>University / Institute *</label>
                            <input required type="text" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                              placeholder="Global Tech University"
                              className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all duration-200"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text, fontFamily: `'Inter', -apple-system, sans-serif` }}
                              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                              onBlur={(e) => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondary }}>Work Email *</label>
                            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="jane@university.edu"
                              className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all duration-200"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text, fontFamily: `'Inter', -apple-system, sans-serif` }}
                              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                              onBlur={(e) => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondary }}>Phone</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all duration-200"
                              style={{ backgroundColor: inputBg, borderColor: border, color: text, fontFamily: `'Inter', -apple-system, sans-serif` }}
                              onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                              onBlur={(e) => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: secondary }}>Tell us about your requirements</label>
                          <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Institute size, specific requirements, existing infrastructure..."
                            rows={4} className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all duration-200 resize-none"
                            style={{ backgroundColor: inputBg, borderColor: border, color: text, fontFamily: `'Inter', -apple-system, sans-serif` }}
                            onFocus={(e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                            onBlur={(e) => { e.target.style.borderColor = border; e.target.style.boxShadow = "none"; }}
                          />
                        </div>

                        {formStatus === "error" && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                            style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                            <X size={13} /> Failed to submit. Please check your connection and try again.
                          </motion.div>
                        )}

                        <button type="submit" disabled={formStatus === "submitting"}
                          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 8px 28px rgba(16,185,129,0.25)" }}
                        >
                          {formStatus === "submitting" ? (
                            <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
                          ) : (
                            <><Send size={15} /> Request Demo</>
                          )}
                        </button>

                        <p className="text-center text-[10px]" style={{ color: secondary }}>
                          By submitting, you agree to our <a href="/privacy-policy" className="text-emerald-500 hover:underline">Privacy Policy</a>. We never share your information.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
