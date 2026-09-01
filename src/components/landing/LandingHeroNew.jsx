"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const STATS = [
  { value: "10,000+", label: "Active Students" },
  { value: "500+", label: "Partner Institutes" },
  { value: "100+", label: "Hiring Partners" },
  { value: "94%", label: "Placement Rate" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
});

export default function LandingHeroNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";

  return (
    <section
      className="relative pt-36 pb-24 px-6 sm:px-10 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Eyebrow */}
        <motion.div {...fadeUp(0)}>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            AI Career Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.06)}
          style={{
            color: text,
            fontSize: "clamp(3rem, 7.5vw, 5.75rem)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.04,
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
            marginTop: "1.25rem",
          }}
        >
          From Learning<br />to Getting Hired.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.12)}
          style={{
            color: secondary,
            fontSize: "1.2rem",
            lineHeight: 1.7,
            maxWidth: "42rem",
            marginTop: "1.75rem",
          }}
        >
          eduvantix is an AI-powered career platform that takes you from zero to hired.
          Personalized roadmaps, real projects, AI mentorship, and direct employer connections
          — all in one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.18)}
          className="flex flex-wrap items-center gap-4"
          style={{ marginTop: "2.25rem" }}
        >
          <Link
            href="https://learn.eduvantix.com"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-95"
            style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
          >
            Start Learning Free
            <ArrowRight size={15} />
          </Link>
          <a
            href="mailto:hello@eduvantix.com?subject=Demo+Request"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-70"
            style={{
              backgroundColor: "transparent",
              color: text,
              border: `1.5px solid ${border}`,
            }}
          >
            Book a Demo
          </a>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-8"
          style={{
            marginTop: "3.5rem",
            paddingTop: "2.5rem",
            borderTop: `1px solid ${border}`,
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  color: text,
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                }}
              >
                {stat.value}
              </div>
              <div className="text-sm mt-1" style={{ color: secondary }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
