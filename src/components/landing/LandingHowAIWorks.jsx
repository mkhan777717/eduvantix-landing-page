"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ScanLine, Map, GraduationCap, Activity, Lightbulb,
  GitBranch, LayoutTemplate, FileEdit, Mic2, Target, Network
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const ENGINE_STEPS = [
  { step: 1, icon: ScanLine, label: "Skill Diagnostic", color: "#10b981", desc: "Automated analysis of candidate coding history and target career role." },
  { step: 2, icon: Map, label: "Personalized Roadmap", color: "#059669", desc: "Structured weekly learning and project timeline adapted to candidate pace." },
  { step: 3, icon: GraduationCap, label: "Interactive Mentorship", color: "#34d399", desc: "Real-time code review, architecture guidance, and instant problem assistance." },
  { step: 4, icon: Activity, label: "Progress Tracking", color: "#10b981", desc: "Continuous monitoring of mastery across software engineering domains." },
  { step: 5, icon: Lightbulb, label: "Adaptive Practice", color: "#047857", desc: "Targeted problem sets focused on addressing detected skill gaps." },
  { step: 6, icon: GitBranch, label: "Production Projects", color: "#059669", desc: "Enterprise-grade software project briefs matching industry standards." },
  { step: 7, icon: LayoutTemplate, label: "Portfolio Verification", color: "#34d399", desc: "Automated portfolio assembly with live deployment links and code proofs." },
  { step: 8, icon: FileEdit, label: "Resume Engineering", color: "#10b981", desc: "ATS optimization and structural resume scoring aligned with hiring criteria." },
  { step: 9, icon: Mic2, label: "Structured Interview AI", color: "#059669", desc: "Technical mock interviews with live coding feedback and behavioral scoring." },
  { step: 10, icon: Target, label: "Skill Matching Engine", color: "#047857", desc: "Algorithmic matching of candidate skill signatures to employer requisitions." },
  { step: 11, icon: Network, label: "Direct Hiring Pipeline", color: "#10b981", desc: "Pre-verified candidate referrals delivered directly to partner engineering leads." },
];

function StepCard({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [hovered, setHovered] = useState(false);
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative p-5 rounded-2xl border transition-all duration-300 cursor-default overflow-hidden"
      style={{
        backgroundColor: hovered ? `${step.color}08` : "var(--bg-card)",
        borderColor: hovered ? step.color : "var(--border-primary)",
        boxShadow: hovered ? `0 8px 30px ${step.color}15` : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top left, ${step.color}10, transparent 65%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div
        className="text-[10px] font-bold mb-3 tracking-widest uppercase transition-colors duration-200"
        style={{ color: step.color }}
      >
        Phase {String(step.step).padStart(2, "0")}
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all duration-300"
        style={{
          backgroundColor: hovered ? `${step.color}20` : `${step.color}12`,
          border: `1px solid ${step.color}${hovered ? "50" : "25"}`,
        }}
      >
        <Icon
          size={18}
          style={{ color: step.color }}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <h3
        className="text-sm font-bold leading-tight mb-1.5 transition-colors duration-200"
        style={{ color: hovered ? step.color : "var(--text-primary)" }}
      >
        {step.label}
      </h3>

      <p
        className="text-xs leading-relaxed font-normal transition-colors duration-200"
        style={{ color: "var(--text-secondary)" }}
      >
        {step.desc}
      </p>
    </motion.div>
  );
}

export default function LandingHowAIWorks() {
  const isDark = useThemeStore((state) => state.isDark);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Radial ambient gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.03) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 flex flex-col items-center gap-4"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            System Architecture
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            How the career engine{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              delivers results.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
            An integrated 11-stage pipeline that continuously measures, accelerates, and validates developer growth.
          </p>
        </motion.div>

        {/* Grid — masonry-style stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ENGINE_STEPS.map((step, i) => (
            <StepCard key={step.step} step={step} index={i} />
          ))}
        </div>

        {/* Bottom pipeline indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {ENGINE_STEPS.map((step, i) => (
            <div key={step.step} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: step.color }}
              />
              {i < ENGINE_STEPS.length - 1 && (
                <div className="w-6 h-px" style={{ backgroundColor: "var(--border-primary)" }} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            11-stage integrated pipeline
          </span>
        </motion.div>
      </div>
    </section>
  );
}
