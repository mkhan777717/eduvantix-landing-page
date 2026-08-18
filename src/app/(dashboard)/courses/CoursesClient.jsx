"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getApiBase } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, Clock, Layers, Server, Cpu, Database, Code, Sparkles, Globe,
  ArrowRight, BookMarked, Compass, Star, Users, ChevronRight, Zap, Trophy, Play,
  LayoutGrid, List
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Lucide Icon mapping
const IconMap = {
  Layers, Server, Cpu, Database, Code, Sparkles, Globe
};

const categories = [
  "All Courses",
  "Web & Mobile Development",
  "Data & AI",
  "Cloud & DevOps",
  "Creative Tech"
];

const CATEGORY_META = {
  "All Courses":                  { icon: Layers,   color: "#10b981" },
  "Web & Mobile Development":     { icon: Globe,    color: "#6366f1" },
  "Data & AI":                    { icon: Cpu,      color: "#f59e0b" },
  "Cloud & DevOps":               { icon: Server,   color: "#0ea5e9" },
  "Creative Tech":                { icon: Sparkles, color: "#ec4899" },
};

const DIFF_META = {
  Beginner:     { color: "#10b981", bg: "rgba(16,185,129,0.10)" },
  Intermediate: { color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  Advanced:     { color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
};

// Floating particle background
function FloatingParticles() {
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.05,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "var(--accent-primary)",
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Stats ticker
const STATS = [
  { label: "Courses", value: "12+", icon: BookOpen },
  { label: "Learners", value: "2.4k", icon: Users },
  { label: "Avg Rating", value: "4.9", icon: Star },
  { label: "Certificates", value: "800+", icon: Trophy },
];

export default function CoursesCatalogPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const router = useRouter();

  // When user is not authenticated, pass courseId as a redirect param
  const handleCourseCardClick = useCallback((courseId) => {
    if (user) {
      // User is authenticated, go directly to course page
      router.push(`/courses/${courseId}`);
    } else {
      // Redirect to login with a proper redirect param
      router.push(`/login?redirect=/courses/${courseId}`);
    }
  }, [user, router]);

  // On mount, if user just logged in and a redirect param is present, redirect
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      // Check if there is a ?redirect param in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect");
      if (redirectPath && redirectPath.startsWith("/courses/")) {
        router.replace(redirectPath);
      }
    }
  }, [user, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam && categories.includes(catParam)) setSelectedCategory(catParam);
    }
  }, []);

  useEffect(() => {
    async function loadCourses() {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/courses`);
        const data = await res.json();
        if (data.success && data.courses) setCourses(data.courses);
      } catch (err) {
        console.error("Failed to fetch dynamic courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "All Courses" || course.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(q) ||
      course.desc.toLowerCase().includes(q) ||
      course.tags.some(t => t.toLowerCase().includes(q)) ||
      course.difficulty.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const renderIcon = (iconName, accentColor) => {
    const IconComp = IconMap[iconName] || BookOpen;
    return <IconComp size={20} style={{ color: accentColor }} />;
  };

  const diff = (d) => DIFF_META[d] || DIFF_META["Intermediate"];

  return (
    <>
        <div
        className="relative min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        {/* ─── Ambient background ──────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
          <FloatingParticles />
        </div>

        {/* ─── Navbar (public) ─────────────────────────────────────────── */}
        <Navbar />

        {/* ─── HERO BANNER ─────────────────────────────────────────────── */}
        <motion.section
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-6 py-28 md:py-32"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mb-5 py-12"
            style={{ color: "var(--text-primary)" }}
          >
            Learn Without Limits,{" "}
            <span
              className="relative inline-block"
              style={{
                background: "var(--accent-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Free Courses for Everyone
            </span>
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="relative w-full max-w-xl"
          >
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search titles, tech, skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl py-4 pl-12 pr-5 text-sm outline-none border transition-all shadow-lg"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)"
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            )}
          </motion.div>
        </motion.section>

        {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
        <section className="relative z-10 flex-1 w-full px-4 sm:px-8 md:px-10 lg:px-16 xl:px-28 pb-20">
   

          {/* Category + controls bar */}
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-10">

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
                      style={{
                        backgroundColor: isActive ? "var(--accent-primary)" : "var(--bg-card)",
                        borderColor: isActive ? "var(--accent-primary)" : "var(--border-primary)",
                        color: isActive ? "#fff" : "var(--text-secondary)",
                        boxShadow: isActive ? "0 4px 20px var(--accent-glow)" : "none",
                        transform: isActive ? "scale(1.03)" : "scale(1)",
                      }}
                    >
                      <Icon size={14} style={{ color: isActive ? "#fff" : meta.color }} />
                      <span>{cat === "All Courses" ? "All Tracks" : cat}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 rounded-xl"
                          style={{ zIndex: -1 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
                </span>
                {/* Grid/List toggle */}
                <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-primary)" }}>
                  {["grid", "list"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                      style={{
                        backgroundColor: viewMode === mode ? "var(--accent-primary)" : "var(--bg-card)",
                        color: viewMode === mode ? "#fff" : "var(--text-muted)",
                      }}
                      title={mode === "grid" ? "Grid view" : "List view"}
                    >
                      {mode === "grid" ? <LayoutGrid size={14} /> : <List size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── LOADING ── */}
            {loading && courses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                  <div className="absolute inset-2 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--border-primary)", borderTopColor: "transparent", animationDirection: "reverse", animationDuration: "0.7s" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Querying catalog registry...</p>
              </div>
            )}

            {/* ── GRID / LIST view ── */}
            {!loading && (
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredCourses.map((course, index) => {
                        const isHovered = hoveredCourseId === course.id;
                        const dm = diff(course.difficulty);
                        return (
                          <motion.div
                            key={course.id}
                            layout
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.35, delay: index * 0.04 }}
                            onMouseEnter={() => setHoveredCourseId(course.id)}
                            onMouseLeave={() => setHoveredCourseId(null)}
                            onClick={() => handleCourseCardClick(course.id)}
                            className="group relative flex flex-col justify-between rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: `1px solid ${isHovered ? course.accent + "50" : "var(--border-card)"}`,
                              boxShadow: isHovered
                                ? `0 20px 60px ${course.accent}20, 0 0 0 1px ${course.accent}15`
                                : "0 1px 4px rgba(0,0,0,0.06)",
                              transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                            }}
                          >
                            {/* Top accent bar */}
                            <div className="h-1 w-full transition-all duration-300"
                              style={{ background: isHovered ? course.accent : "transparent" }} />

                            {/* Hover glow overlay */}
                            <div className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                              style={{
                                background: `radial-gradient(ellipse at 30% 30%, ${course.accent}10 0%, transparent 65%)`,
                                opacity: isHovered ? 1 : 0,
                              }} />

                            <div className="relative p-6 space-y-4 flex-1">
                              {/* Icon + category */}
                              <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300"
                                  style={{
                                    backgroundColor: `${course.accent}14`,
                                    border: `1px solid ${course.accent}25`,
                                    transform: isHovered ? "scale(1.1) rotate(-3deg)" : "scale(1) rotate(0deg)",
                                  }}>
                                  {renderIcon(course.icon, course.accent)}
                                </div>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg border"
                                  style={{
                                    color: "var(--text-muted)",
                                    borderColor: "var(--border-primary)",
                                    backgroundColor: "var(--bg-hover)",
                                  }}>
                                  {course.category?.split(" ")[0]}
                                </span>
                              </div>

                              {/* Title & description */}
                              <div className="space-y-2">
                                <h3 className="text-sm font-extrabold leading-snug transition-colors duration-200 line-clamp-2"
                                  style={{ color: isHovered ? course.accent : "var(--text-primary)" }}>
                                  {course.title}
                                </h3>
                                <p className="text-xs leading-relaxed line-clamp-3"
                                  style={{ color: "var(--text-secondary)" }}>
                                  {course.desc}
                                </p>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5">
                                {course.tags.slice(0, 3).map(tag => (
                                  <span key={tag}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                                    style={{
                                      color: "var(--text-secondary)",
                                      borderColor: "var(--border-primary)",
                                      backgroundColor: "var(--bg-hover)",
                                    }}>
                                    {tag}
                                  </span>
                                ))}
                                {course.tags.length > 3 && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-hover)" }}>
                                    +{course.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="relative px-6 pb-6 pt-4 space-y-3"
                              style={{ borderTop: "1px solid var(--border-primary)" }}>
                              <div className="flex items-center justify-between text-[11px]"
                                style={{ color: "var(--text-secondary)" }}>
                                <div className="flex items-center gap-1">
                                  <Clock size={11} style={{ color: "var(--text-muted)" }} />
                                  <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen size={11} style={{ color: "var(--text-muted)" }} />
                                  <span>{course.lessons} lessons</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                                  style={{ color: dm.color, backgroundColor: dm.bg }}>
                                  {course.difficulty}
                                </span>
                                <motion.div
                                  animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.6 }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold"
                                  style={{ color: isHovered ? course.accent : "var(--text-secondary)" }}>
                                  <span>Explore</span>
                                  <ArrowRight size={11} />
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty state */}
                    {filteredCourses.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 text-center space-y-4"
                      >
                        <BookMarked size={48} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                        <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                          No courses matched your query
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Try adjusting your keywords or selecting another category.
                        </p>
                        <button
                          onClick={() => { setSearchQuery(""); setSelectedCategory("All Courses"); }}
                          className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                          style={{ background: "var(--accent-gradient)" }}
                        >
                          Reset Filters
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  /* ── LIST VIEW ── */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 max-w-5xl mx-auto"
                  >
                    <AnimatePresence>
                      {filteredCourses.map((course, index) => {
                        const isHovered = hoveredCourseId === course.id;
                        const dm = diff(course.difficulty);
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            transition={{ delay: index * 0.03 }}
                            onMouseEnter={() => setHoveredCourseId(course.id)}
                            onMouseLeave={() => setHoveredCourseId(null)}
                            onClick={() => handleCourseCardClick(course.id)}
                            className="flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              border: `1px solid ${isHovered ? course.accent + "40" : "var(--border-card)"}`,
                              boxShadow: isHovered ? `0 8px 30px ${course.accent}15` : "none",
                              transform: isHovered ? "translateX(4px)" : "translateX(0)",
                            }}
                          >
                            {/* Icon */}
                            <div className="h-12 w-12 flex-shrink-0 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${course.accent}14`, border: `1px solid ${course.accent}25` }}>
                              {renderIcon(course.icon, course.accent)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="text-sm font-bold truncate transition-colors"
                                style={{ color: isHovered ? course.accent : "var(--text-primary)" }}>
                                {course.title}
                              </h3>
                              <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                                {course.desc}
                              </p>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {course.tags.slice(0, 4).map(tag => (
                                  <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md border"
                                    style={{ color: "var(--text-muted)", borderColor: "var(--border-primary)", backgroundColor: "var(--bg-hover)" }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Meta */}
                            <div className="flex-shrink-0 flex items-center gap-6 text-xs" style={{ color: "var(--text-secondary)" }}>
                              <div className="hidden md:flex flex-col items-center gap-0.5">
                                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{course.lessons}</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>Lessons</span>
                              </div>
                              <div className="hidden md:flex flex-col items-center gap-0.5">
                                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{course.duration}</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>Duration</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                                style={{ color: dm.color, backgroundColor: dm.bg }}>
                                {course.difficulty}
                              </span>
                              <ChevronRight size={16} className="transition-transform duration-200"
                                style={{ color: "var(--text-muted)", transform: isHovered ? "translateX(3px)" : "translateX(0)" }} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {filteredCourses.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 text-center space-y-4"
                      >
                        <BookMarked size={48} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                        <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No courses matched</p>
                        <button
                          onClick={() => { setSearchQuery(""); setSelectedCategory("All Courses"); }}
                          className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                          style={{ background: "var(--accent-gradient)" }}
                        >
                          Reset Filters
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* ─── CTA Banner ──────────────────────────────────────────────── */}
        {!loading && !user > 0 && (
          <section className="relative z-10 w-full px-4 sm:px-8 md:px-10 lg:px-16 xl:px-28 pb-20">
            <div className="max-w-[600px] mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
                style={{
                  background: "linear-gradient(135deg, var(--accent-primary) 0%, #047857 100%)",
                }}
              >
                {/* BG glows */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
                  style={{ background: "rgba(255,255,255,0.08)" }} />
                <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
                  style={{ background: "rgba(0,0,0,0.1)" }} />

                <div className="relative space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/15 text-white/80 mb-1">
                    <Zap size={10} />
                    Start Learning Today
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Ready to level up<br className="hidden md:block" /> your skills?
                  </h2>
                  <p className="text-sm text-white/70 max-w-md">
                    Join thousands of developers who have transformed their careers with our hands-on, project-based courses.
                  </p>
                </div>

                <div className="relative flex-shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.href = "/login"}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white text-gray-900 transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  > 
                    Sign in now
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
