"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const STUDENT_BENEFITS = [
  "Personalized AI learning roadmap tailored to your target job role",
  "Real-world production projects to build an authentic GitHub portfolio",
  "ATS-ready resume generator and automated portfolio website",
  "AI mock interviews with recorded feedback & technical scoring",
  "Direct access to active internship and entry-level job requisitions",
];

const INSTITUTE_BENEFITS = [
  "Complete EdTech OS for managing cohorts, batches, and student progress",
  "Automated skill diagnostics and real-time learning analytics",
  "Centralized placement portal with verified employer connections",
  "AI-assisted grading, code review, and automated attendance tracking",
  "Branded digital certificates and verified transcript issuing",
];

const sv = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] },
});

export default function LandingForWho() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F9F9F9";

  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            Built For You
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
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
            Empowering students and institutions alike.
          </motion.h2>
        </div>

        {/* 2-Column Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Students */}
          <motion.div
            {...sv(0.1)}
            className="p-8 rounded-2xl flex flex-col justify-between"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 block">
                For Ambitious Learners
              </span>
              <h3
                style={{
                  color: text,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.25rem",
                }}
              >
                For Students
              </h3>
              <ul className="space-y-4">
                {STUDENT_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm" style={{ color: secondary }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t" style={{ borderColor: border }}>
              <a
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#10b981" }}
              >
                Start your career path →
              </a>
            </div>
          </motion.div>

          {/* For Institutes */}
          <motion.div
            {...sv(0.2)}
            className="p-8 rounded-2xl flex flex-col justify-between"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 block">
                For Modern Universities & Bootcamps
              </span>
              <h3
                style={{
                  color: text,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: "1.25rem",
                }}
              >
                For Institutes
              </h3>
              <ul className="space-y-4">
                {INSTITUTE_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm" style={{ color: secondary }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t" style={{ borderColor: border }}>
              <a
                href="mailto:hello@eduvantix.com?subject=Institute+OS+Demo"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#10b981" }}
              >
                Schedule an institute demo →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
