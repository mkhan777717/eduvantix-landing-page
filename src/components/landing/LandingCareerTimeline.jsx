"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen, Code2, FolderOpen, BarChart3, Brain,
  Briefcase, Building2, TrendingUp, Award, Infinity, ChevronRight
} from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const TIMELINE_NODES = [
  {
    icon: BookOpen, label: "Learn",
    desc: "Personalised learning paths adapted to your pace, goals, and existing experience.",
    color: "#10b981", phase: "Foundation",
  },
  {
    icon: Code2, label: "Practice",
    desc: "In-browser coding playgrounds with automated evaluation and instant feedback.",
    color: "#059669", phase: "Skills",
  },
  {
    icon: FolderOpen, label: "Projects",
    desc: "Production-ready software project briefs that build a verified portfolio.",
    color: "#34d399", phase: "Portfolio",
  },
  {
    icon: BarChart3, label: "Portfolio",
    desc: "Auto-generated, shareable developer portfolio with live demos and code analysis.",
    color: "#10b981", phase: "Showcase",
  },
  {
    icon: Brain, label: "Skill Assessment",
    desc: "Objective skill evaluations producing verified badges employers actually trust.",
    color: "#059669", phase: "Validation",
  },
  {
    icon: Briefcase, label: "Internships",
    desc: "Match verified candidate skill profiles directly to active internship pipelines.",
    color: "#047857", phase: "Experience",
  },
  {
    icon: Building2, label: "Jobs",
    desc: "Resume optimization, structured mock interviews, and direct employer matching.",
    color: "#10b981", phase: "Career",
  },
  {
    icon: TrendingUp, label: "Upskill",
    desc: "Continuous learning recommendations based on industry trends and career trajectory.",
    color: "#34d399", phase: "Growth",
  },
  {
    icon: Award, label: "Promotion",
    desc: "Track milestones, collect verified credentials, and demonstrate continuous growth.",
    color: "#059669", phase: "Recognition",
  },
  {
    icon: Infinity, label: "Lifetime Growth",
    desc: "A long-term career operating system that evolves as your ambitions expand.",
    color: "#10b981", phase: "∞ Ongoing",
  },
];

function TimelineNode({ node, index, isLast, isActive, onHover }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const Icon = node.icon;

  return (
    <div
      ref={ref}
      className="relative flex gap-6 sm:gap-10 cursor-pointer group"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Left: icon + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -20 }}
          animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
          transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isActive ? `${node.color}20` : "var(--bg-card)",
            borderColor: isActive ? node.color : "var(--border-primary)",
            borderWidth: 1.5,
            borderStyle: "solid",
            boxShadow: isActive ? `0 0 20px ${node.color}30` : "none",
          }}
        >
          <Icon size={20} style={{ color: isActive ? node.color : "var(--text-muted)" }} />
          {isActive && (
            <motion.div
              layoutId="nodeGlow"
              className="absolute inset-0 rounded-2xl"
              style={{ background: `${node.color}10` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>

        {/* Animated connector line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: index * 0.07 + 0.2, duration: 0.6 }}
            style={{ originY: "top" }}
            className="w-px flex-1 mt-2 min-h-[52px]"
          >
            <div
              className="w-full h-full transition-all duration-500"
              style={{
                background: isActive
                  ? `linear-gradient(to bottom, ${node.color}, ${TIMELINE_NODES[index + 1]?.color || node.color}50)`
                  : `linear-gradient(to bottom, ${node.color}40, ${TIMELINE_NODES[index + 1]?.color || node.color}20)`,
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Right: content */}
      <motion.div
        initial={{ opacity: 0, x: 25 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.07 + 0.1, duration: 0.5 }}
        className="pb-10 flex-1 min-w-0"
      >
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <h3
            className="text-lg font-bold tracking-tight transition-colors duration-200"
            style={{ color: isActive ? node.color : "var(--text-primary)" }}
          >
            {node.label}
          </h3>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300"
            style={{
              backgroundColor: isActive ? `${node.color}12` : "transparent",
              borderColor: isActive ? node.color : "var(--border-primary)",
              color: isActive ? node.color : "var(--text-muted)",
            }}
          >
            {node.phase}
          </span>
        </div>
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p
                className="text-sm leading-relaxed font-normal"
                style={{ color: "var(--text-secondary)", maxWidth: 480 }}
              >
                {node.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {!isActive && (
          <p
            className="text-sm leading-relaxed font-normal opacity-50"
            style={{ color: "var(--text-secondary)", maxWidth: 480 }}
          >
            {node.desc}
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function LandingCareerTimeline() {
  const [activeIndex, setActiveIndex] = useState(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -left-32 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(16,185,129,0.07)" }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 35 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 flex flex-col gap-5 text-center sm:text-left"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mx-auto sm:mx-0 border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            End-to-End Career OS
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            From foundational learning to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              career advancement.
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed font-normal" style={{ color: "var(--text-secondary)" }}>
            A structured timeline that guides learners through skill acquisition, real production projects, assessment, and hiring.
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            <ChevronRight size={12} className="inline mr-1 text-emerald-500" />
            Hover any step to explore what happens at that stage.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="flex flex-col">
          {TIMELINE_NODES.map((node, i) => (
            <TimelineNode
              key={node.label}
              node={node}
              index={i}
              isLast={i === TIMELINE_NODES.length - 1}
              isActive={activeIndex === i}
              onHover={setActiveIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
