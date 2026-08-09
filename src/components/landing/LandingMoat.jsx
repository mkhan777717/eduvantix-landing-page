"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  ShieldCheck, GitBranch, BarChart3, Network,
  Building2, Users, Award, Lock
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const MOAT_CARDS = [
  {
    icon: ShieldCheck,
    label: "Verified Skills",
    desc: "Objective evaluations produce authenticated skill signatures that hiring managers genuinely trust.",
    color: "#10b981",
  },
  {
    icon: GitBranch,
    label: "Real-World Projects",
    desc: "Evidence-based portfolios built from production software briefs — not simple tutorial copies.",
    color: "#059669",
  },
  {
    icon: BarChart3,
    label: "Learning Intelligence",
    desc: "Predictive analytics engine that adapts curriculum progression to each engineer's performance.",
    color: "#34d399",
  },
  {
    icon: Building2,
    label: "Institutional Network",
    desc: "A two-sided network uniting higher-ed institutes and corporate hiring partners into one ecosystem.",
    color: "#047857",
  },
  {
    icon: Lock,
    label: "Employer Trust",
    desc: "Companies recruit through Eduvantix because candidate code quality and skills are pre-verified.",
    color: "#10b981",
  },
  {
    icon: Network,
    label: "Hiring Pipeline",
    desc: "Direct integration into active corporate hiring requisitions across 100+ partner companies.",
    color: "#059669",
  },
  {
    icon: Users,
    label: "Engineer Community",
    desc: "A growing network of ambitious developers, mentors, alumni, and industry leaders.",
    color: "#34d399",
  },
  {
    icon: Award,
    label: "Portfolio Validation",
    desc: "Immutable proof of project authorship and skill credentials — eliminating resume inflation.",
    color: "#047857",
  },
];

function MoatCard({ card, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative p-6 rounded-2xl border cursor-default overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: hovered ? `${card.color}07` : "var(--bg-card)",
        borderColor: hovered ? card.color : "var(--border-primary)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${card.color}15` : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none transition-opacity duration-400"
        style={{
          background: `radial-gradient(circle, ${card.color}15, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: hovered ? `${card.color}20` : `${card.color}12`,
          border: `1px solid ${card.color}${hovered ? "40" : "25"}`,
        }}
      >
        <Icon
          size={18}
          style={{ color: card.color }}
          className={`transition-transform duration-300 ${hovered ? "scale-110" : "scale-100"}`}
        />
      </div>

      <h3
        className="text-base font-bold mb-1.5 transition-colors duration-200"
        style={{ color: hovered ? card.color : "var(--text-primary)" }}
      >
        {card.label}
      </h3>

      <p className="text-xs leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
        {card.desc}
      </p>
    </motion.div>
  );
}

export default function LandingMoat() {
  const isDark = useThemeStore((state) => state.isDark);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Radial ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 65%)"
            : "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.03) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 flex flex-col items-center gap-3"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            Competitive Advantage
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Why Eduvantix{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              delivers sustainable value.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
            Every candidate, institute, and corporate partner joining the network reinforces compounding ecosystem value.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOAT_CARDS.map((card, i) => (
            <MoatCard key={card.label + i} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
