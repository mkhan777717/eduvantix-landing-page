"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { XCircle, CheckCircle2, ArrowDown, ArrowRight, Zap } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const OLD_FLOW = [
  { label: "Watch Videos", emoji: "📺", problem: "Passive consumption" },
  { label: "Take a Quiz", emoji: "📝", problem: "Shallow testing" },
  { label: "Get Certificate", emoji: "🏆", problem: "No real proof" },
  { label: "Good Luck.", emoji: "👋", problem: "Zero employer trust", isEnd: true },
];

const NEW_FLOW = [
  { label: "Personalised Roadmap", emoji: "🗺️", highlight: "AI-powered learning path" },
  { label: "Production Projects", emoji: "⚙️", highlight: "Real code you can deploy" },
  { label: "Verified Skill Badges", emoji: "✅", highlight: "AI-proctored evaluation" },
  { label: "Direct Hiring Match", emoji: "🚀", highlight: "Employer connects", isEnd: true },
];

export default function LandingPlatformProblem() {
  const isDark = useThemeStore((state) => state.isDark);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const headRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true, amount: 0.25 });
  const rightInView = useInView(rightRef, { once: true, amount: 0.25 });
  const headInView = useInView(headRef, { once: true, amount: 0.5 });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-32 px-6 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Animated background gradient that parallaxes on scroll */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.4) 50%, transparent 100%)" }}
      />

      <div className="max-w-5xl mx-auto flex flex-col items-center gap-20">

        {/* Section headline — storytelling hook */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center flex flex-col items-center gap-4"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={headInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl"
          >
            🧩
          </motion.span>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            <span style={{ color: "var(--text-muted)" }}>The system is</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>broken.</span>
            <br />
            <span style={{ color: "var(--text-muted)" }}>We </span>
            <span
              className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"
            >
              fixed it.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Traditional EdTech platforms sell you content. They don't care what happens when you close the tab.
          </p>
        </motion.div>

        {/* Two-column before/after comparison */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">

          {/* Left — The Old Way */}
          <div ref={leftRef} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={leftInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <XCircle size={16} className="text-red-500" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-red-500">The Old Way</span>
            </motion.div>

            {OLD_FLOW.map((item, i) => (
              <div key={item.label} className="flex flex-col items-start">
                <motion.div
                  initial={{ opacity: 0, x: -25, scale: 0.95 }}
                  animate={leftInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full p-4 rounded-2xl border flex items-center justify-between"
                  style={{
                    backgroundColor: item.isEnd
                      ? "rgba(239,68,68,0.06)"
                      : "var(--bg-card)",
                    borderColor: item.isEnd ? "rgba(239,68,68,0.25)" : "var(--border-primary)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.isEnd ? "#ef4444" : "var(--text-primary)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      borderColor: "rgba(239,68,68,0.2)",
                      color: "#ef4444",
                    }}
                  >
                    {item.problem}
                  </span>
                </motion.div>

                {/* Connector arrow */}
                {!item.isEnd && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={leftInView ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{ delay: i * 0.15 + 0.35, duration: 0.35 }}
                    style={{ originY: "top" }}
                    className="flex flex-col items-center ml-6 py-1"
                  >
                    <div className="w-px h-4 bg-red-500/30" />
                    <ArrowDown size={13} className="text-red-500/40" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Right — The Eduvantix Way */}
          <div ref={rightRef} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={rightInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-500">The Eduvantix Way</span>
            </motion.div>

            {NEW_FLOW.map((item, i) => (
              <div key={item.label} className="flex flex-col items-start">
                <motion.div
                  initial={{ opacity: 0, x: 25, scale: 0.95 }}
                  animate={rightInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full p-4 rounded-2xl border flex items-center justify-between group hover:-translate-y-0.5 transition-transform"
                  style={{
                    backgroundColor: item.isEnd
                      ? "rgba(16,185,129,0.07)"
                      : "var(--bg-card)",
                    borderColor: item.isEnd ? "rgba(16,185,129,0.3)" : "var(--border-primary)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.isEnd ? "#10b981" : "var(--text-primary)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: "rgba(16,185,129,0.1)",
                      borderColor: "rgba(16,185,129,0.25)",
                      color: "#10b981",
                    }}
                  >
                    {item.highlight}
                  </span>
                </motion.div>

                {!item.isEnd && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={rightInView ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{ delay: i * 0.15 + 0.45, duration: 0.35 }}
                    style={{ originY: "top" }}
                    className="flex flex-col items-center ml-6 py-1"
                  >
                    <div className="w-px h-4 bg-emerald-500/30" />
                    <ArrowDown size={13} className="text-emerald-500/50" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA nudge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl border"
          style={{
            backgroundColor: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)",
            borderColor: "rgba(16,185,129,0.2)",
          }}
        >
          <Zap size={15} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Eduvantix is the{" "}
            <span style={{ color: "var(--text-accent)" }} className="font-bold">
              only platform
            </span>{" "}
            that bridges the gap from learning to verified employment — end to end.
          </p>
          <ArrowRight size={14} className="text-emerald-500 shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}
