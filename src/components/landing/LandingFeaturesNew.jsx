"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine, Map, Brain, BookOpen, Code2, FolderGit2,
  LayoutTemplate, FileText, Mic2, BarChart3, Building2, GraduationCap,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useThemeStore from "@/store/useThemeStore";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI Skill Assessment",
    category: "Diagnostics",
    desc: "Objective evaluation of technical competency across languages, frameworks, and algorithmic problem-solving in under 20 minutes.",
  },
  {
    icon: Map,
    title: "Personalized Roadmap",
    category: "Guidance",
    desc: "AI-generated learning path tailored specifically to your target role, timeline, and current skill gaps.",
  },
  {
    icon: Brain,
    title: "24/7 AI Mentor",
    category: "Mentorship",
    desc: "Intelligent mentor that answers questions, reviews code diffs, and guides you through complex engineering concepts.",
  },
  {
    icon: BookOpen,
    title: "Interactive Learning",
    category: "Curriculum",
    desc: "Adaptive modules with practice questions that automatically adjust difficulty based on real-time performance.",
  },
  {
    icon: Code2,
    title: "In-Browser Playground",
    category: "Execution",
    desc: "Full cloud IDE with multi-language runtime, automated test suites, and instant AI code feedback.",
  },
  {
    icon: FolderGit2,
    title: "Real-World Projects",
    desc: "Production-grade project briefs with code reviews, milestone tracking, and architecture quality scoring.",
    category: "Portfolio",
  },
  {
    icon: LayoutTemplate,
    title: "Automated Portfolio",
    category: "Showcase",
    desc: "Automatically compiled developer portfolio website built from your verified project repositories and live demos.",
  },
  {
    icon: FileText,
    title: "ATS Resume Builder",
    category: "Career",
    desc: "ATS-optimized resume generated directly from your verified skills, projects, and assessment credentials.",
  },
  {
    icon: Mic2,
    title: "Interview Simulator",
    category: "Preparation",
    desc: "AI-conducted technical and behavioral mock interviews with scoring, transcripts, and targeted improvement paths.",
  },
  {
    icon: BarChart3,
    title: "Career Analytics",
    category: "Insights",
    desc: "Real-time dashboard showing skill growth velocity, job readiness score, and market positioning.",
  },
  {
    icon: Building2,
    title: "Direct Employer Match",
    category: "Hiring",
    desc: "Verified partner network matching your verified skill profile directly to open engineering requisitions.",
  },
  {
    icon: GraduationCap,
    title: "Institute Dashboard",
    category: "Enterprise",
    desc: "Institutional SaaS OS for managing student cohorts, tracking skill diagnostics, and streamlining placements.",
  },
];

export default function LandingFeaturesNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#111111" : "#FFFFFF";

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FEATURES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
  }, []);

  // Auto-rotate every 4 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="px-6 sm:px-10 py-28 overflow-hidden select-none"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-6xl mx-auto">
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
            Platform Capabilities
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
            Everything you need to go from learning to hired.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ color: secondary, fontSize: "1rem", lineHeight: 1.7, marginTop: "1rem" }}
          >
            Explore our 12 integrated capabilities built for verified career outcomes.
          </motion.p>
        </div>

        {/* 3D Carousel Stage */}
        <div
          className="relative py-12 flex flex-col items-center justify-center min-h-[440px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[340px] flex items-center justify-center"
            style={{ perspective: "1200px" }}
          >
            {FEATURES.map((feat, index) => {
              // Calculate relative offset from active index (-2, -1, 0, 1, 2, etc.)
              let offset = index - activeIndex;
              if (offset < -Math.floor(FEATURES.length / 2)) {
                offset += FEATURES.length;
              } else if (offset > Math.floor(FEATURES.length / 2)) {
                offset -= FEATURES.length;
              }

              // Only render visible cards within 2 steps of active card
              const isVisible = Math.abs(offset) <= 2;
              if (!isVisible) return null;

              const Icon = feat.icon;

              // 3D positioning calculations
              const rotateY = offset * 28; // degrees
              const translateX = offset * 260; // px
              const translateZ = -Math.abs(offset) * 160; // px depth
              const scale = 1 - Math.abs(offset) * 0.14;
              const opacity = 1 - Math.abs(offset) * 0.35;
              const isActive = offset === 0;

              return (
                <motion.div
                  key={feat.title}
                  onClick={() => setActiveIndex(index)}
                  initial={false}
                  animate={{
                    rotateY,
                    x: translateX,
                    z: translateZ,
                    scale,
                    opacity,
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    transformStyle: "preserve-3d",
                    zIndex: 30 - Math.abs(offset) * 10,
                  }}
                  className={`absolute w-[320px] sm:w-[380px] p-7 rounded-2xl cursor-pointer shadow-2xl transition-shadow ${isActive ? "ring-2 ring-emerald-500/40" : ""
                    }`}
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${isActive ? "#10b981" : border}`,
                    boxShadow: isActive
                      ? isDark
                        ? "0 25px 50px -12px rgba(16, 185, 129, 0.18)"
                        : "0 25px 50px -12px rgba(16, 185, 129, 0.12)"
                      : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isActive ? "rgba(16,185,129,0.12)" : isDark ? "#1A1A1A" : "#F3F4F6",
                        border: `1px solid ${isActive ? "rgba(16,185,129,0.3)" : border}`,
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: isActive ? "#10b981" : text }}
                        strokeWidth={1.8}
                      />
                    </div>

                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: isActive ? "rgba(16,185,129,0.1)" : "transparent",
                        borderColor: isActive ? "rgba(16,185,129,0.25)" : border,
                        color: isActive ? "#10b981" : secondary,
                      }}
                    >
                      {feat.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      color: isActive ? (isDark ? "#FFFFFF" : "#111111") : text,
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      marginBottom: "0.6rem",
                      fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                    }}
                  >
                    {feat.title}
                  </h3>

                  <p
                    style={{
                      color: secondary,
                      fontSize: "0.875rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {feat.desc}
                  </p>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: border }}>
                    <span className="font-mono font-semibold" style={{ color: isActive ? "#10b981" : secondary }}>
                      0{index + 1} / 12
                    </span>
                    <span className="font-semibold" style={{ color: isActive ? "#10b981" : secondary }}>
                      {isActive ? "Active Module" : "Click to view"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Controls & Indicators */}
          <div className="flex items-center gap-6 mt-8 z-40">
            <button
              onClick={prevSlide}
              aria-label="Previous feature"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: cardBg,
                borderColor: border,
                color: text,
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {FEATURES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: idx === activeIndex ? 24 : 6,
                    backgroundColor: idx === activeIndex ? "#10b981" : border,
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              aria-label="Next feature"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: cardBg,
                borderColor: border,
                color: text,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
