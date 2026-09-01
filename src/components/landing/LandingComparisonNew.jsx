"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const COMPARISON_ROWS = [
  { feature: "Goal Focus", traditional: "Passive video consumption", eduvantix: "Verified career placement" },
  { feature: "Learning Path", traditional: "Generic static videos", eduvantix: "AI-assessed dynamic roadmap" },
  { feature: "Practical Proof", traditional: "Quiz certificates", eduvantix: "Production-grade portfolio apps" },
  { feature: "AI Mentorship", traditional: "None / Static FAQs", eduvantix: "24/7 AI tutor & code reviewer" },
  { feature: "Resume & Portfolio", traditional: "Manual / Self-made", eduvantix: "Automated & ATS-optimized" },
  { feature: "Interview Prep", traditional: "Static question banks", eduvantix: "AI mock technical interviews" },
  { feature: "Employer Network", traditional: "No direct hiring ties", eduvantix: "Direct hiring partner matching" },
];

export default function LandingComparisonNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#000000" : "#FFFFFF";

  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16 text-center mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            Why eduvantix
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
            Compare with traditional LMS.
          </motion.h2>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="grid grid-cols-12 p-4 text-xs font-bold uppercase tracking-wider border-b" style={{ borderColor: border, color: secondary }}>
            <div className="col-span-4 sm:col-span-4">Capability</div>
            <div className="col-span-4 sm:col-span-4 text-center">Traditional LMS</div>
            <div className="col-span-4 sm:col-span-4 text-center font-bold" style={{ color: "#10b981" }}>eduvantix OS</div>
          </div>

          <div className="divide-y" style={{ borderColor: border }}>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} className="grid grid-cols-12 p-4 text-xs sm:text-sm items-center">
                <div className="col-span-4 sm:col-span-4 font-semibold" style={{ color: text }}>
                  {row.feature}
                </div>
                <div className="col-span-4 sm:col-span-4 text-center flex flex-col sm:flex-row items-center justify-center gap-1.5" style={{ color: secondary }}>
                  <X size={14} className="text-red-500 shrink-0" />
                  <span className="text-xs">{row.traditional}</span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 font-medium" style={{ color: text }}>
                  <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />
                  <span className="text-xs font-bold">{row.eduvantix}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
