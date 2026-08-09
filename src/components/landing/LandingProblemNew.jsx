"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const PROBLEMS = [
  {
    title: "Certificates don't get you hired.",
    desc: "Completion badges from online courses mean nothing to employers who need proof of real-world capability.",
  },
  {
    title: "Learning without direction wastes time.",
    desc: "Without a structured, role-specific roadmap, students spend months learning the wrong things in the wrong order.",
  },
  {
    title: "The gap between skills and jobs stays open.",
    desc: "No portfolio. No resume guidance. No interview prep. No company connections. Traditional platforms leave you at the finish line.",
  },
];

const sv = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
});

export default function LandingProblemNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#111111" : "#FFFFFF";

  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div {...sv(0)} className="max-w-3xl">
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            The Problem
          </span>
          <h2
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
            Traditional learning stops at courses.
            <br />
            <span style={{ color: secondary }}>The job market doesn&apos;t care about certificates.</span>
          </h2>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.title}
              {...sv(0.1 + i * 0.08)}
              className="p-7 rounded-2xl"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${border}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.15)" }}
              >
                <X size={16} color="#FF3B30" strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  color: text,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                  marginBottom: "0.75rem",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  color: secondary,
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bridge statement */}
        <motion.p
          {...sv(0.35)}
          style={{
            color: secondary,
            fontSize: "1.05rem",
            lineHeight: 1.7,
            maxWidth: "38rem",
            marginTop: "3rem",
            paddingTop: "3rem",
            borderTop: `1px solid ${border}`,
          }}
        >
          The best engineers aren&apos;t struggling because they lack talent.
          They&apos;re struggling because no platform connects learning to hiring in a structured, complete way.{" "}
          <span style={{ color: text, fontWeight: 600 }}>Until now.</span>
        </motion.p>

      </div>
    </section>
  );
}
