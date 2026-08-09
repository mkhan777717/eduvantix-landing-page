"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check, Zap } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const OLD_ITEMS = [
  "Watch pre-recorded lectures passively",
  "Take a final quiz with no real depth",
  "Receive a generic completion certificate",
  "Left to job search completely alone",
];

const NEW_ITEMS = [
  "Personalised Skill Diagnostics",
  "In-Browser Hands-on Coding",
  "Production Architecture Projects",
  "Auto-Generated Verified Portfolio",
  "AI-Proctored Skill Assessment",
  "Vetted Internship Placement Pipeline",
  "Direct Technical Employer Matching",
  "Structured Career Upskilling",
  "Long-Term Career Growth Tracking",
];

export default function LandingComparison() {
  const isDark = useThemeStore((state) => state.isDark);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Ambient split gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(to right, rgba(239,68,68,0.03) 0%, transparent 50%, rgba(16,185,129,0.04) 100%)"
            : "linear-gradient(to right, rgba(239,68,68,0.02) 0%, transparent 50%, rgba(16,185,129,0.02) 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Not just video courses.{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Verified career outcomes.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            The difference isn't just what you learn — it's what you prove and who you meet.
          </p>
        </motion.div>

        {/* Comparison split */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Traditional Platforms */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-7 border transition-colors shadow-sm flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div>
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                  Traditional Course Platforms
                </span>
                <h3 className="text-xl font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                  Fragmented &amp; Passive
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {OLD_ITEMS.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -15 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.04)",
                      borderColor: "rgba(239,68,68,0.15)",
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-rose-500/15">
                      <X size={12} className="text-rose-500" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 px-4 py-3 rounded-xl text-xs font-bold text-center border text-rose-500 bg-rose-500/5 border-rose-500/20">
              No verified proof of skill or employer placement support.
            </div>
          </motion.div>

          {/* Eduvantix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-7 border relative overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "rgba(16,185,129,0.35)",
              boxShadow: isDark ? "0 20px 60px rgba(16,185,129,0.08)" : "0 20px 60px rgba(16,185,129,0.06)",
            }}
          >
            {/* Subtle ambient glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at top right, rgba(16,185,129,0.07), transparent 60%)",
              }}
            />

            <div className="relative z-10">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Eduvantix Career OS
                </span>
                <h3 className="text-xl font-bold mt-3" style={{ color: "var(--text-primary)" }}>
                  End-to-End &amp; Verified
                </h3>
              </div>

              <div className="flex flex-col gap-2.5">
                {NEW_ITEMS.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 15 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.4 }}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
                    style={{
                      backgroundColor: "rgba(16,185,129,0.06)",
                      borderColor: "rgba(16,185,129,0.18)",
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/20">
                      <Check size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 relative z-10 px-4 py-3 rounded-xl text-xs font-bold text-center border text-emerald-500 bg-emerald-500/10 border-emerald-500/25 flex items-center justify-center gap-2">
              <Zap size={12} />
              Proven skill validation &amp; direct access to engineering hiring partners.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
