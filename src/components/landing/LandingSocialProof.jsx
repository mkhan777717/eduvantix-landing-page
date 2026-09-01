"use client";

import { motion } from "framer-motion";
import useThemeStore from "@/store/useThemeStore";

const STATS = [
  { number: "10,000+", label: "Active Learners", sub: "Building production portfolios" },
  { number: "94%", label: "Placement Rate", sub: "Within 6 months of completion" },
  { number: "100+", label: "Hiring Partners", sub: "Direct candidate requisitions" },
  { number: "500+", label: "Partner Institutes", sub: "Colleges & bootcamps using eduvantix" },
];

export default function LandingSocialProof() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F9F9F9";

  return (
    <section className="px-6 sm:px-10 py-24 border-y" style={{ backgroundColor: bg, borderColor: border }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: cardBg, borderColor: border }}
            >
              <div
                className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
                style={{ color: "#10b981", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
              >
                {s.number}
              </div>
              <div className="text-sm font-bold mb-1" style={{ color: text }}>
                {s.label}
              </div>
              <div className="text-xs" style={{ color: secondary }}>
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
