"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import useThemeStore from "@/store/useThemeStore";

const FAQS = [
  {
    q: "How does eduvantix differ from traditional video learning platforms?",
    a: "eduvantix is an AI Career Platform, not a course seller. Instead of watching pre-recorded videos passively, eduvantix evaluates your skills, builds a custom roadmap, guides your coding practice in-browser, generates real-world projects, builds an ATS-ready resume, conducts AI mock interviews, and connects you directly with hiring partners.",
  },
  {
    q: "Who is eduvantix designed for?",
    a: "eduvantix is built for students and career switchers wanting verified engineering jobs, as well as colleges and EdTech institutes seeking an all-in-one SaaS OS for managing cohorts, analytics, and placements.",
  },
  {
    q: "Are the projects verified by employers?",
    a: "Yes. Every project completed on eduvantix is code-evaluated, proctored, and cryptographically verified on your automated portfolio website so hiring managers know your code is authentic.",
  },
  {
    q: "How does the AI Mock Interview system work?",
    a: "The AI conducts real-time technical and behavioral interviews based on your target role. It evaluates your problem-solving approach, code efficiency, and verbal articulation, providing immediate scoring and improvement points.",
  },
  {
    q: "Can educational institutes integrate eduvantix into their curriculum?",
    a: "Yes. eduvantix offers an Institutional SaaS layer allowing universities and bootcamps to manage student batches, track skill diagnostics, issue digital certificates, and connect students to top corporate recruiters.",
  },
  {
    q: "Is there a free trial or free tier available?",
    a: "Yes! You can start learning for free, complete initial skill diagnostics, and explore introductory career tracks without any credit card required.",
  },
];

function FAQItem({ faq, isOpen, onToggle, isDark }) {
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";

  return (
    <div className="border-b" style={{ borderColor: border }}>
      <button
        onClick={onToggle}
        className="w-full text-left py-6 flex items-center justify-between gap-4 font-semibold text-base transition-colors"
        style={{ color: text }}
      >
        <span>{faq.q}</span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
          style={{ backgroundColor: isOpen ? "rgba(16,185,129,0.1)" : "transparent", color: isOpen ? "#10b981" : secondary }}
        >
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm leading-relaxed" style={{ color: secondary }}>
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingFAQ() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            Frequently Asked Questions
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
            Everything you need to know.
          </motion.h2>
        </div>

        {/* Accordion List */}
        <div>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={faq.q}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
