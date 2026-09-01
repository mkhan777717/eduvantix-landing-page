"use client";

import { motion, useInView } from "framer-motion";
import {
  Compass, Code2, Brain, Briefcase, CheckCircle2,
  ScanLine, Layers, Award, ArrowRight
} from "lucide-react";
import { useRef } from "react";
import useThemeStore from "@/store/useThemeStore";

const STEPS = [
  {
    num: "01",
    icon: Compass,
    title: "Assess & Map",
    subtitle: "AI Skill Gap Benchmark",
    desc: "Complete an intelligent diagnostic benchmark that identifies your technical strengths, pinpoints missing core proficiencies, and drafts a personalized learning trajectory tailored to your target roles.",
  },
  {
    num: "02",
    icon: Code2,
    title: "Learn & Build",
    subtitle: "Real Projects & Sandbox IDE",
    desc: "Master production technologies through interactive chapter modules, in-browser compiler sandboxes, and full-stack project briefs evaluated by automated test suites.",
  },
  {
    num: "03",
    icon: Brain,
    title: "AI Evaluation",
    subtitle: "Live Viva & Continuous Readiness",
    desc: "Undergo automated technical oral assessments, dynamic coding mock interviews, and real-time skill radar updates to validate conceptual and practical job readiness.",
  },
  {
    num: "04",
    icon: Briefcase,
    title: "Career Placement",
    subtitle: "Verified Credentials & Direct Hiring",
    desc: "Earn cryptographically verifiable credentials, generate ATS-optimized resumes from active project repositories, and unlock direct hiring pipelines across partner employers.",
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
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex gap-6 group"
    >
      {/* Left: number + connector */}
      <div className="flex flex-col items-center" style={{ width: 44, flexShrink: 0 }}>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold tabular-nums flex-shrink-0 shadow-xs transition-transform group-hover:scale-105"
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
              width: 1.5,
              flexGrow: 1,
              backgroundColor: border,
              marginTop: 8,
              marginBottom: 8,
              minHeight: 56,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ paddingBottom: index < STEPS.length - 1 ? "2.5rem" : 0 }} className="flex-1">
        <div className="flex items-center gap-3 mb-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: isDark ? "#111111" : "#F9F9F9", border: `1px solid ${border}` }}
          >
            <Icon size={17} style={{ color: "#10b981" }} strokeWidth={1.75} />
          </div>
          <div>
            <h3
              style={{
                color: text,
                fontSize: "1.15rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              }}
            >
              {step.title}
            </h3>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>
              {step.subtitle}
            </p>
          </div>
        </div>
        <p style={{ color: secondary, fontSize: "0.925rem", lineHeight: 1.7, maxWidth: "34rem" }}>
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
              Four stages.<br />
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
              The eduvantix career pathway is automated, competency-driven, and personalized. Every candidate advances through a proven four-stage cycle that transforms foundational knowledge into verified hireability.
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
                href="https://learn.eduvantix.com"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-transform hover:translate-x-1"
                style={{ color: "#10b981" }}
              >
                <span>Start your journey</span>
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>

          {/* Steps */}
          <div className="pt-2">
            {STEPS.map((step, i) => (
              <Step key={step.num} step={step} index={i} isDark={isDark} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
