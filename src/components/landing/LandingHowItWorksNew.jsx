"use client";

import { motion, useInView } from "framer-motion";
import {
  ScanLine, Map, BookOpen, Code2, FolderGit2,
  LayoutTemplate, FileText, Mic2, Briefcase, CheckCircle2,
} from "lucide-react";
import { useRef } from "react";
import useThemeStore from "@/store/useThemeStore";

const STEPS = [
  {
    num: "01",
    icon: ScanLine,
    title: "Skill Assessment",
    desc: "AI evaluates your current knowledge level across all key technical domains in under 20 minutes.",
  },
  {
    num: "02",
    icon: Map,
    title: "Personalized Roadmap",
    desc: "Based on your goals and skill gaps, a precise learning roadmap is generated — role-specific and time-bound.",
  },
  {
    num: "03",
    icon: BookOpen,
    title: "Structured Learning",
    desc: "Follow your roadmap with curated modules, AI-guided lessons, and adaptive quizzes that respond to your progress.",
  },
  {
    num: "04",
    icon: Code2,
    title: "Coding Playground",
    desc: "Write, run, and debug real code in-browser. AI mentor gives instant feedback on your solutions.",
  },
  {
    num: "05",
    icon: FolderGit2,
    title: "Real-World Projects",
    desc: "Build production-grade applications on actual industry briefs. Every project is code-reviewed and graded.",
  },
  {
    num: "06",
    icon: LayoutTemplate,
    title: "Portfolio Builder",
    desc: "Your completed projects automatically compile into a professional portfolio with live demo links.",
  },
  {
    num: "07",
    icon: FileText,
    title: "Resume Builder",
    desc: "AI generates an ATS-optimized resume from your skills, projects, and certifications. No templates required.",
  },
  {
    num: "08",
    icon: Mic2,
    title: "Mock Interviews",
    desc: "AI-conducted technical and behavioral mock interviews with recorded sessions and improvement feedback.",
  },
  {
    num: "09",
    icon: CheckCircle2,
    title: "Job Matching & Placement",
    desc: "Get matched with internships and jobs at verified hiring partners. Apply directly through Eduvantix.",
  },
];

function Step({ step, index, isDark }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = step.icon;
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex gap-6 group"
    >
      {/* Left: number + connector */}
      <div className="flex flex-col items-center" style={{ width: 40, flexShrink: 0 }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold tabular-nums flex-shrink-0"
          style={{
            border: `1.5px solid ${border}`,
            backgroundColor: cardBg,
            color: "#10b981",
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
          }}
        >
          {step.num}
        </div>
        {index < STEPS.length - 1 && (
          <div
            style={{
              width: 1,
              flexGrow: 1,
              backgroundColor: border,
              marginTop: 6,
              marginBottom: 6,
              minHeight: 40,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: index < STEPS.length - 1 ? "2rem" : 0 }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: isDark ? "#111111" : "#F9F9F9", border: `1px solid ${border}` }}
        >
          <Icon size={17} style={{ color: text }} strokeWidth={1.75} />
        </div>
        <h3
          style={{
            color: text,
            fontSize: "1.05rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: "0.4rem",
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
          }}
        >
          {step.title}
        </h3>
        <p style={{ color: secondary, fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "34rem" }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function LandingHowItWorksNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";

  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Sticky Left Header */}
          <div className="lg:sticky lg:top-32 self-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#10b981" }}
            >
              How It Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06 }}
              style={{
                color: text,
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                marginTop: "1rem",
              }}
            >
              Nine steps.<br />
              One outcome: hired.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                color: secondary,
                fontSize: "1rem",
                lineHeight: 1.7,
                marginTop: "1.25rem",
                maxWidth: "30rem",
              }}
            >
              The Eduvantix career journey is fully automated and personalized.
              Every student follows the same proven path — adapted to their own pace, goals, and skill gaps.
            </motion.p>

            {/* Sticky CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ marginTop: "2rem" }}
            >
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#10b981" }}
              >
                Start your journey →
              </a>
            </motion.div>
          </div>

          {/* Steps */}
          <div>
            {STEPS.map((step, i) => (
              <Step key={step.num} step={step} index={i} isDark={isDark} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
