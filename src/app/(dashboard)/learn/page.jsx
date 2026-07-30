"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Filter, Star, Users, Clock, ChevronRight, Lock,
  Globe, Building2, Trophy, Play, Code2, FileQuestion, CheckCircle,
  Sparkles, TrendingUp, Zap, BarChart2, ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DIFFICULTY_STYLE = {
  BEGINNER: { label: "Beginner", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  INTERMEDIATE: { label: "Intermediate", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ADVANCED: { label: "Advanced", className: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
};

const CATEGORIES = ["All", "Programming", "Web Development", "AI / ML"];

function CourseCard({ course, onClick, isInstituteUser }) {
  const diff = DIFFICULTY_STYLE[course.difficulty] || DIFFICULTY_STYLE.BEGINNER;
  const progress = course.enrollment?.progressPercent || 0;
  const isEnrolled = !!course.isEnrolled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden cursor-pointer hover:border-[var(--border-accent)] transition-all duration-300 hover:shadow-lg"
      style={{ boxShadow: "0 0 0 0 var(--accent-glow)" }}>
      {/* Course Hero */}
      <div className="relative h-32 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </div>
        <div className="text-5xl relative z-10 select-none group-hover:scale-110 transition-transform duration-300">
          {course.iconUrl ? (
            (course.iconUrl.startsWith("http") || course.iconUrl.startsWith("data:")) ? (
              <img src={course.iconUrl} className="w-14 h-14 object-contain rounded-lg" alt={course.title} />
            ) : (
              course.iconUrl
            )
          ) : (
            "📚"
          )}
        </div>
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {course.hasCertificate && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Trophy size={8} /> Certificate
            </span>
          )}
          {!course.isFree && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/20 border border-violet-500/30 text-violet-400">
              <Lock size={8} /> Paid
            </span>
          )}
          {course.instituteId ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Building2 size={8} /> Institute
            </span>
          ) : (
            isInstituteUser && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-500/20 border border-slate-500/30 text-slate-400">
                <Globe size={8} /> Global
              </span>
            )
          )}
        </div>
        {isEnrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-secondary)]">
            <div className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm leading-snug group-hover:text-[var(--text-accent)] transition-colors" style={{ color: "var(--text-primary)" }}>
            {course.title}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${diff.className}`}>{diff.label}</span>
        </div>

        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{course.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1"><Clock size={10} /> {course.estimatedHours || 0}h</span>
          {course.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-400"><Star size={10} className="fill-amber-400" /> {course.rating.toFixed(1)}</span>
          )}
          <span className="flex items-center gap-1"><BookOpen size={10} /> {course._count?.chapters || 0} chapters</span>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: "var(--text-muted)" }}>{progress}% complete</span>
                {progress === 100 && <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={10} /> Done!</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-secondary)] mr-3 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]" style={{ width: `${progress}%` }} />
                </div>
                <button className="flex items-center gap-1 text-[11px] font-bold cursor-pointer" style={{ color: "var(--text-accent)" }}>
                  Continue <ChevronRight size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {course.isFree ? "Free" : <><span className="line-through text-xs font-normal mr-1" style={{ color: "var(--text-muted)" }}>₹{course.price}</span>₹{course.offerPrice || course.price}</>}
              </span>
              <button className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[var(--border-accent)] text-[var(--text-accent)] hover:bg-[var(--accent-glow)] transition-colors cursor-pointer">
                {course.isFree ? "Start Free" : "Get Access"} <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function LearnCatalogPage() {
  const router = useRouter();
  const { token, API_BASE, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token && !token.startsWith("demo-") && !token.startsWith("local-") ? { Authorization: `Bearer ${token}` } : {}),
  };

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope !== "all") params.set("scope", scope);
      if (category !== "All") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`${API_BASE}/api/learn/catalog?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [scope, category, search, API_BASE, token]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const stats = [
    { icon: BookOpen, label: "Total Courses", value: courses.length, color: "text-violet-400 bg-violet-500/10" },
    { icon: CheckCircle, label: "Enrolled", value: courses.filter(c => c.isEnrolled).length, color: "text-emerald-400 bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl p-8 border border-[var(--border-primary)]"
        style={{ background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, var(--text-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)]">
            <Sparkles size={11} /> Eduvantix Learning
          </div>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            Learn, Practice, Excel
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm max-w-lg leading-relaxed">
            Master programming concepts with interactive lessons, MCQ quizzes, and real coding challenges.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[..."ABCDE"].map(l => (
                <div key={l} className="w-7 h-7 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: "var(--accent-primary)" }}>{l}</div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}><strong style={{ color: "var(--text-primary)" }}>2000+</strong> learners already enrolled</p>
          </div>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 opacity-60">
          {[Code2, FileQuestion, BookOpen, Trophy].map((Icon, i) => (
            <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }}
              className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center">
              <Icon size={18} style={{ color: "var(--text-accent)" }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]">
            <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={16} /></div>
            <div>
              <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
              <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
        </div>

        {/* Scope + Categories Filter Toolbar */}
        <div className="space-y-3 pt-1">
          {user?.instituteId && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Course Source</span>
              <div className="flex rounded-xl overflow-hidden border border-[var(--border-primary)] w-fit">
                {[["all", "All Courses"], ["global", "Global Courses"], ["institute", "Institute Courses"]].map(([val, label]) => (
                  <button key={val} onClick={() => setScope(val)}
                    className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${scope === val ? "text-[var(--text-on-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}
                    style={scope === val ? { background: "var(--accent-gradient)" } : { backgroundColor: "var(--bg-card)" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Categories</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${category === cat ? "border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)] font-bold" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center rounded-3xl border border-dashed border-[var(--border-primary)]">
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)]"><BookOpen size={28} style={{ color: "var(--text-muted)" }} /></div>
          <div>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No courses found</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Try adjusting your filters or search term</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} isInstituteUser={!!user?.instituteId} onClick={() => router.push(`/learn/course/${course.slug}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
