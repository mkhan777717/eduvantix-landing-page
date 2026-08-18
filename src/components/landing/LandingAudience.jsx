"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { GraduationCap, Building2, Briefcase, Users, ChevronRight } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const AUDIENCE_CARDS = [
  {
    icon: GraduationCap,
    label: "Students",
    tagline: "Learn and get hired.",
    desc: "From your first course to your first offer letter — Eduvantix guides you through every step. Mentorship, production projects, interview preparation, and direct job matching.",
    color: "#10b981",
    emoji: "🎓",
    features: ["Personalized roadmap", "Production projects", "Structured mock interviews", "Direct employer matching"],
  },
  {
    icon: Building2,
    label: "Institutes",
    tagline: "The complete EdTech OS.",
    desc: "Manage students, mentors, batches, analytics, attendance, learning, placements, reports, assessments, and certifications from one SaaS platform — built for scale.",
    color: "#059669",
    emoji: "🏫",
    features: ["Batch management", "Attendance & reports", "Placement tracking", "Role-based access"],
  },
  {
    icon: Briefcase,
    label: "Companies",
    tagline: "Find verified talent.",
    desc: "Objective skill evaluations, project portfolios, candidate analytics, internship pipelines, and direct hiring — access pre-vetted engineers with proven capabilities.",
    color: "#34d399",
    emoji: "🏢",
    features: ["Verified skill scores", "Project code proofs", "Internship pipeline", "Direct hiring API"],
  },
  {
    icon: Users,
    label: "Mentors",
    tagline: "Teach once. Scale infinitely.",
    desc: "Track every student's progress with data insights, deliver live and recorded content, and build a scalable teaching practice from one creator dashboard.",
    color: "#047857",
    emoji: "🧑‍🏫",
    features: ["Student progress analytics", "Live & recorded classes", "Assessment tools", "Creator suite"],
  },
];

function AudienceCard({ card, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl p-6 border cursor-default flex flex-col justify-between transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: hovered ? card.color : "var(--border-primary)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 50px ${card.color}15` : "0 1px 5px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial ambient on hover */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at bottom right, ${card.color}10, transparent 65%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Emoji watermark */}
      <div className="absolute -bottom-2 -right-2 text-7xl opacity-5 select-none pointer-events-none">
        {card.emoji}
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
          style={{
            backgroundColor: hovered ? `${card.color}20` : `${card.color}12`,
            border: `1px solid ${card.color}${hovered ? "40" : "25"}`,
          }}
        >
          <Icon
            size={22}
            style={{ color: card.color }}
            className={`transition-transform duration-300 ${hovered ? "scale-110" : "scale-100"}`}
          />
        </div>

        {/* Title */}
        <h3
          className="text-xl font-bold mb-1 transition-colors duration-200"
          style={{ color: hovered ? card.color : "var(--text-primary)" }}
        >
          {card.label}
        </h3>
        <div className="text-xs font-semibold mb-4 flex items-center gap-1" style={{ color: card.color }}>
          <span>{card.tagline}</span>
          <ChevronRight size={12} className={`transition-transform duration-200 ${hovered ? "translate-x-1" : ""}`} />
        </div>

        <p className="text-xs sm:text-sm leading-relaxed mb-6 font-normal" style={{ color: "var(--text-secondary)" }}>
          {card.desc}
        </p>
      </div>

      {/* Features list */}
      <div className="space-y-2 pt-4 border-t relative z-10" style={{ borderColor: "var(--border-primary)" }}>
        {card.features.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
              style={{ backgroundColor: card.color, transform: hovered ? "scale(1.3)" : "scale(1)" }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {f}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function LandingAudience() {
  const isDark = useThemeStore((state) => state.isDark);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(16,185,129,0.05) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(16,185,129,0.03) 0%, transparent 60%)",
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
            Built for Scale
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Purpose-built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              every stakeholder.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
            Whether you're an ambitious student, a growing institute, a hiring company, or an expert mentor.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDIENCE_CARDS.map((card, i) => (
            <AudienceCard key={card.label} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
