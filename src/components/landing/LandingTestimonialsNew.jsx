"use client";

import { motion } from "framer-motion";
import useThemeStore from "@/store/useThemeStore";

const TESTIMONIALS = [
  {
    quote: "Eduvantix completely replaced my resume with proof. When I interviewed at Swiggy, they asked about my verified Eduvantix projects instead of standard LeetCode questions.",
    author: "Rohan Sharma",
    role: "Full Stack Engineer",
    company: "Swiggy",
    tag: "Placed in 3 Months",
  },
  {
    quote: "Our institution onboarding time dropped from 3 weeks to 2 days. The AI diagnostic accurately surfaces skill gaps across 400+ students instantly.",
    author: "Dr. Ananya Verma",
    role: "Head of Computer Science",
    company: "IIT Delhi Partner Program",
    tag: "500+ Students Onboarded",
  },
  {
    quote: "As a hiring manager, pre-verified candidate portfolios save us over 20 hours per engineering hire. The code quality matches production standards.",
    author: "Vikram Malhotra",
    role: "VP of Engineering",
    company: "Razorpay",
    tag: "Hiring Partner",
  },
];

export default function LandingTestimonialsNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#000000" : "#FFFFFF";

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
            Proven Results
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
            Trusted by candidates, institutes &amp; employers.
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-7 rounded-2xl border flex flex-col justify-between"
              style={{ backgroundColor: cardBg, borderColor: border }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 inline-block">
                  {t.tag}
                </span>
                <p className="text-sm leading-relaxed mb-6" style={{ color: secondary }}>
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: border }}>
                <div className="text-sm font-bold" style={{ color: text }}>{t.author}</div>
                <div className="text-xs" style={{ color: secondary }}>{t.role} • <span style={{ color: text }}>{t.company}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
