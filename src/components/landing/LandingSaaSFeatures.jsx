"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, Brain, Code2, FolderOpen, LayoutTemplate,
  FileText, Mic2, BarChart3, Building2, Target, Award,
  MessageSquare, Bell, Lock, Cloud, CreditCard, Calendar, ChevronRight
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import useThemeStore from "@/store/useThemeStore";

const FEATURES = [
  { label: "Institute Management", icon: GraduationCap, category: "Admin", desc: "Manage your entire institution from a single dashboard — departments, cohorts, staff, and students." },
  { label: "Batch Management", icon: Users, category: "Admin", desc: "Create, track, and manage student batches with automated scheduling and progress reports." },
  { label: "AI Mentorship", icon: Brain, category: "Learning", desc: "AI-powered 1:1 mentorship that adapts to each learner's pace, strengths, and goals." },
  { label: "Coding Playground", icon: Code2, category: "Learning", desc: "In-browser coding environment with real-time evaluation, test cases, and instant AI feedback." },
  { label: "Project Hub", icon: FolderOpen, category: "Projects", desc: "Enterprise-grade project briefs with milestone tracking, code review, and deployment guides." },
  { label: "Portfolio Builder", icon: LayoutTemplate, category: "Career", desc: "Auto-assembled developer portfolios with live demo links and verified skill attestations." },
  { label: "Resume Optimizer", icon: FileText, category: "Career", desc: "ATS-aligned resume scoring and structural improvements tailored to target roles." },
  { label: "Interview AI", icon: Mic2, category: "Career", desc: "Structured mock technical interviews with live coding, behavioral scoring, and feedback." },
  { label: "Analytics Suite", icon: BarChart3, category: "Insights", desc: "Cohort-level learning analytics with predictive performance modeling and dropout alerts." },
  { label: "Hiring Portal", icon: Building2, category: "Hiring", desc: "Company-side portal for reviewing verified candidates, managing pipelines, and issuing offers." },
  { label: "Skill Matching", icon: Target, category: "Hiring", desc: "Algorithmic skill-to-job matching that surfaces pre-vetted engineers for open requisitions." },
  { label: "Digital Certificates", icon: Award, category: "Validation", desc: "Cryptographically verifiable certificates issued on course and project completion." },
  { label: "Peer Community", icon: MessageSquare, category: "Community", desc: "Structured forums, study groups, and alumni networks organized by skill track." },
  { label: "Smart Notifications", icon: Bell, category: "Platform", desc: "Real-time alerts for assignments, deadlines, interview slots, and employer matches." },
  { label: "Access Control", icon: Lock, category: "Security", desc: "Granular role-based permissions for admins, mentors, students, and hiring partners." },
  { label: "Cloud Storage", icon: Cloud, category: "Platform", desc: "Secure, scalable cloud storage for course materials, code submissions, and assessments." },
  { label: "Billing & Plans", icon: CreditCard, category: "Admin", desc: "Flexible subscription billing with institute-level seat management and payment tracking." },
  { label: "Live Classes", icon: Calendar, category: "Learning", desc: "Integrated live session scheduling with recording, attendance tracking, and Q&A tools." },
];

const CATEGORY_COLORS = {
  Admin: "#10b981",
  Learning: "#059669",
  Projects: "#34d399",
  Career: "#047857",
  Insights: "#10b981",
  Hiring: "#059669",
  Validation: "#34d399",
  Community: "#047857",
  Security: "#10b981",
  Platform: "#059669",
};

const RADIUS = 190; // Orbit radius in px
const TOTAL = FEATURES.length;
const STEP_ANGLE = 360 / TOTAL;

export default function LandingSaaSFeatures() {
  const isDark = useThemeStore((state) => state.isDark);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoRef = useRef(null);

  // Rotate wheel so that `targetIndex` comes to 0° (right-center focal point)
  const rotateTo = useCallback((targetIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const targetRotation = -targetIndex * STEP_ANGLE;
    setRotation(targetRotation);
    setActiveIndex(targetIndex);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % TOTAL;
    rotateTo(next);
  }, [activeIndex, rotateTo]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + TOTAL) % TOTAL;
    rotateTo(prev);
  }, [activeIndex, rotateTo]);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    autoRef.current = setInterval(goNext, 3000);
    return () => clearInterval(autoRef.current);
  }, [goNext]);

  const pauseAuto = () => clearInterval(autoRef.current);
  const resumeAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(goNext, 3000);
  };

  const activeFeature = FEATURES[activeIndex];
  const activeColor = CATEGORY_COLORS[activeFeature.category];
  const ActiveIcon = activeFeature.icon;

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Ambient background glows */}
      <div
        className="absolute right-10 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }}
      />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ background: "rgba(16,185,129,0.15)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            Institutional SaaS Platform
          </div>
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            More than a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
              learning LMS.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Eduvantix is a full SaaS ecosystem. Institutes, mentors, companies, and candidates operate within a unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ───── LEFT COLUMN: Active Feature Spotlight (5 cols) ───── */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Active Spotlight Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative p-7 rounded-3xl border shadow-xl overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: `${activeColor}40`,
                  boxShadow: isDark ? `0 20px 50px ${activeColor}15` : `0 20px 40px ${activeColor}10`,
                }}
              >
                {/* Radial glow background */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${activeColor}12, transparent 65%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${activeColor}18`,
                        border: `1.5px solid ${activeColor}40`,
                      }}
                    >
                      <ActiveIcon size={26} style={{ color: activeColor }} />
                    </div>

                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${activeColor}12`,
                        borderColor: `${activeColor}30`,
                        color: activeColor,
                      }}
                    >
                      {activeFeature.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                      {activeFeature.label}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
                      {activeFeature.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-xs font-bold" style={{ color: activeColor }}>
                    <span>Module {activeIndex + 1} of {TOTAL}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

                {/* Animated progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-500/10">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: activeColor }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    key={activeIndex}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { val: "18+", label: "Core Modules" },
                { val: "100%", label: "Cloud Native" },
                { val: "1", label: "Unified OS" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded-2xl border text-center"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)",
                  }}
                >
                  <div className="text-2xl font-extrabold text-emerald-500">{s.val}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots & Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={goNext}
                  className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  ›
                </button>
              </div>

              {/* Step indicator */}
              <div className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Click or hover wheel to navigate
              </div>
            </div>

          </div>

          {/* ───── RIGHT COLUMN: Semi-Circle Circular Orbital Wheel (7 cols) ───── */}
          <div
            className="lg:col-span-7 relative flex items-center justify-center select-none min-h-[480px] sm:min-h-[520px]"
            onMouseEnter={pauseAuto}
            onMouseLeave={resumeAuto}
          >
            {/* Wheel Container Box */}
            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">

              {/* Decorative outer glow ring */}
              <div
                className="absolute inset-0 rounded-full border border-dashed transition-colors"
                style={{
                  borderColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.12)",
                }}
              />

              {/* Inner ring */}
              <div
                className="absolute w-[68%] h-[68%] rounded-full border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                }}
              />

              {/* Center Eduvantix Core Hub */}
              <div
                className="absolute w-24 h-24 rounded-full flex flex-col items-center justify-center z-20 shadow-2xl transition-transform hover:scale-105"
                style={{
                  background: isDark
                    ? "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(10,10,10,0.95) 100%)"
                    : "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0.95) 100%)",
                  border: "2px solid rgba(16,185,129,0.4)",
                  boxShadow: "0 0 35px rgba(16,185,129,0.25)",
                }}
              >
                <span className="text-xl font-extrabold text-emerald-500">Eduvantix</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  SaaS OS
                </span>
              </div>

              {/* Orbiting Cards Container */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: rotation }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {FEATURES.map((feat, i) => {
                  const angleDeg = i * STEP_ANGLE;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  // Calculate percentage coordinates (50% center offset)
                  const centerOffset = 50;
                  const radiusPercent = 42; // % radius within square container
                  const leftPercent = centerOffset + Math.cos(angleRad) * radiusPercent;
                  const topPercent = centerOffset + Math.sin(angleRad) * radiusPercent;

                  const isActive = i === activeIndex;
                  const FeatIcon = feat.icon;
                  const color = CATEGORY_COLORS[feat.category];

                  return (
                    <motion.div
                      key={feat.label}
                      className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                      }}
                      // Counter-rotate each card so its text remains horizontally upright!
                      animate={{ rotate: -rotation }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => rotateTo(i)}
                    >
                      <motion.div
                        animate={{
                          scale: isActive ? 1.15 : 0.9,
                          opacity: isActive ? 1 : 0.7,
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold whitespace-nowrap shadow-md transition-all"
                        style={{
                          backgroundColor: isActive
                            ? isDark ? `${color}25` : `${color}15`
                            : "var(--bg-card)",
                          borderColor: isActive ? color : "var(--border-primary)",
                          color: isActive ? color : "var(--text-secondary)",
                          boxShadow: isActive ? `0 0 25px ${color}35` : "0 2px 8px rgba(0,0,0,0.05)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <FeatIcon size={14} style={{ color: isActive ? color : "var(--text-muted)", shrink: 0 }} />
                        <span className="font-bold">{feat.label}</span>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
