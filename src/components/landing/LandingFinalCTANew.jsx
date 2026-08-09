"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

export default function LandingFinalCTANew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";

  return (
    <section className="px-6 sm:px-10 py-32 text-center border-t" style={{ backgroundColor: bg, borderColor: border }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#0A84FF" }}
        >
          Start Your Transformation
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.06 }}
          style={{
            color: text,
            fontSize: "clamp(2.5rem, 5vw, 4.25rem)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
          }}
        >
          Ready to build your career<br />instead of collecting certificates?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{
            color: secondary,
            fontSize: "1.15rem",
            lineHeight: 1.65,
            maxWidth: "36rem",
            marginTop: "1.5rem",
          }}
        >
          Join over 10,000 engineers using Eduvantix to master in-demand skills, build real projects, and land top roles.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-95"
            style={{ backgroundColor: "#0A84FF", color: "#FFFFFF" }}
          >
            Start Learning Free
            <ArrowRight size={16} />
          </Link>
          <a
            href="mailto:hello@eduvantix.com?subject=Demo+Request"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-70"
            style={{
              backgroundColor: "transparent",
              color: text,
              border: `1.5px solid ${border}`,
            }}
          >
            Book a Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
