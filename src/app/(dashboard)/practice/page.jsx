"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BookOpen, Clock, Code, Sparkles, ShieldAlert,
  Terminal, CheckCircle2, ChevronRight, Zap, RefreshCw, Lock, MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const categories = [
  "All Categories",
  "Security",
  "Algorithms",
  "Frontend",
  "System Design"
];

const difficulties = [
  "All Difficulties",
  "Easy",
  "Medium",
  "Hard"
];

// Map categories to icons
const getIcon = (category) => {
  switch (category) {
    case "Security":
      return <ShieldAlert size={20} className="text-emerald-500" />;
    case "Algorithms":
      return <Terminal size={20} className="text-neutral-500" />;
    case "Frontend":
      return <Code size={20} className="text-amber-500" />;
    case "System Design":
      return <Sparkles size={20} className="text-rose-500" />;
    default:
      return <BookOpen size={20} className="text-zinc-500" />;
  }
};

export default function PracticeCatalogPage() {
  const { user, token, API_BASE } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");
  const [hoveredProblemId, setHoveredProblemId] = useState(null);
  const [completedProblems, setCompletedProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lock applies to: students without an institute (global/new users)
  // Note: new registrations return no instituteId (undefined); institute-linked users have it set
  const isGlobalStudent = false;
  const [timeLeftStr, setTimeLeftStr] = useState("24h 00m 00s");

  // Dynamic 1-day running timer loop for global students
  useEffect(() => {
    if (!isGlobalStudent || !user) return;

    const storageKey = `eduvantix_global_lock_expiry_${user.id}`;
    let expiry = localStorage.getItem(storageKey);
    if (!expiry) {
      expiry = String(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem(storageKey, expiry);
    }

    const target = parseInt(expiry, 10);

    const interval = setInterval(() => {
      const remaining = target - Date.now();
      if (remaining <= 0) {
        // Reset timer to start another 24-hour loop (1 day running)
        const nextExpiry = String(Date.now() + 24 * 60 * 60 * 1000);
        localStorage.setItem(storageKey, nextExpiry);
        return;
      }

      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);

      setTimeLeftStr(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isGlobalStudent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadCompletedProblems() {
      if (!user) return;
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user?.role === "ADMIN" ? "ADMIN" : "USER" }),
      };
      try {
        const res = await fetch(`${API_BASE}/api/submissions?userId=${user.id}&status=ACCEPTED`, {
          headers,
          signal: AbortSignal.timeout(30000)
        });
        const data = await res.json();
        if (data.success && data.submissions) {
          const solvedSlugs = Array.from(new Set(data.submissions.map(sub => sub.problem?.slug).filter(Boolean)));
          setCompletedProblems(solvedSlugs);
        }
      } catch (err) {
        console.error("Failed to load completed problems from DB:", err);
      }
    }
    loadCompletedProblems();
  }, [user, token, API_BASE]);

  useEffect(() => {
    async function loadProblems() {
      setLoading(true);
      
      try {
        const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
        const headers = {
          "Content-Type": "application/json",
          ...(hasRealToken
            ? { Authorization: `Bearer ${token}` }
            : {}),
        };
        const res = await fetch(`${API_BASE}/api/problems`, {
          headers,
          signal: AbortSignal.timeout(30000)
        });
        const data = await res.json();
        if (data.success && data.problems) {
          const mapped = data.problems.map(p => {
            let diffStr = "Medium";
            if (p.difficulty === "EASY") diffStr = "Easy";
            else if (p.difficulty === "HARD") diffStr = "Hard";

            return {
              id: p.slug,
              dbId: p.id,
              title: p.title,
              difficulty: diffStr,
              category: "Algorithms",
              desc: "Solve this algorithmic exercise from the database.",
              time: "20 min",
              tags: ["Database", "Dynamic"],
              testcases: new Array(p.testCasesCount || 0)
            };
          });

          setAllProblems(mapped);
        } else {
          setAllProblems([]);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic problems:", err);
        setAllProblems([]);
      }
      setLoading(false);
    }
    loadProblems();
  }, [API_BASE]);

  const filteredProblems = allProblems.filter(prob => {
    const matchesCategory = selectedCategory === "All Categories" || prob.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All Difficulties" || prob.difficulty === selectedDifficulty;
    const matchesSearch = 
      prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden animate-fade-in" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 right-0 h-[450px] pointer-events-none z-0" />
      
      {!user && <Navbar />}

      <main className={`flex-grow relative z-10 ${!user ? 'pt-32 pb-24' : ''}`}>
        <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
          
          {/* Header Description */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
                Interactive Code Zone
              </h1>
              <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                Solve system design scenarios, coding algorithms, and security reviews. Test solutions against live assertions and ask our voice-enabled AI developer assistant for guidance.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="/discuss?category=PROBLEM"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all shadow-sm"
              >
                <MessageSquare size={14} className="text-[var(--accent-primary)]" />
                Problem Discussions
              </a>
            </div>
          </motion.section>

          <div className="relative min-h-[400px]">
            {isGlobalStudent && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-md border border-slate-500/10 rounded-3xl select-none min-h-[450px]">
                <div 
                  className="w-full max-w-[360px] rounded-[32px] p-8 flex flex-col items-center text-center relative border backdrop-blur-2xl shadow-2xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
                  }}
                >
                  {/* Realistic SVG Lock */}
                  <div className="mb-6 relative flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-inner">
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                      <defs>
                        <linearGradient id="shackleGrad" x1="16" y1="6" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="40%" stopColor="#b8b9be" />
                          <stop offset="70%" stopColor="#8a8b90" />
                          <stop offset="100%" stopColor="#b8b9be" />
                        </linearGradient>
                        <linearGradient id="bodyGrad" x1="10" y1="18" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                          <stop offset="25%" stopColor="#f3f4f6" stopOpacity="0.9" />
                          <stop offset="60%" stopColor="#d1d5db" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#9ca3af" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="innerHighlight" x1="12" y1="20" x2="12" y2="38" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
                        </filter>
                      </defs>
                      <path d="M20 22V15C20 8.37 25.37 3 32 3C38.63 3 44 8.37 44 15V22" stroke="url(#shackleGrad)" strokeWidth="4.5" strokeLinecap="round" />
                      <rect x="12" y="20" width="40" height="34" rx="10" fill="url(#bodyGrad)" filter="url(#shadow)" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
                      <rect x="13.5" y="21.5" width="37" height="31" rx="8.5" fill="none" stroke="url(#innerHighlight)" strokeWidth="1.5" />
                      <circle cx="32" cy="34" r="3.5" fill="#4b5563" />
                      <path d="M30.5 36.5L33.5 36.5L35 44L29 44L30.5 36.5Z" fill="#4b5563" />
                    </svg>
                  </div>

                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Page Locked</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-[240px] mb-8">
                    You don't have access to view this page. Enroll in an institute to unlock.
                  </p>

                  {/* Locked Pill with timer */}
                  <div 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs shadow-md border"
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      borderColor: "rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <Lock size={12} className="text-slate-800" />
                    <span>Locked: {timeLeftStr}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={isGlobalStudent ? "opacity-30 pointer-events-none blur-[1.5px]" : ""}>
              {/* Filtering bar */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-1 items-center p-1 rounded-full border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                        style={{
                          color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)"
                        }}
                      >
                        {selectedCategory === cat && (
                          <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 rounded-full shadow-sm"
                            style={{ background: "var(--accent-gradient)" }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                        <span className="relative z-10">{cat.replace("All Categories", "All Topics")}</span>
                      </button>
                    ))}
                  </div>

                  {/* Difficulty Select */}
                  <div className="flex flex-wrap gap-1 items-center p-1 rounded-full border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                    {difficulties.map(diff => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className="relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                        style={{
                          color: selectedDifficulty === diff ? "#ffffff" : "var(--text-secondary)"
                        }}
                      >
                        {selectedDifficulty === diff && (
                          <motion.div
                            layoutId="activeDifficulty"
                            className="absolute inset-0 rounded-full shadow-sm"
                            style={{ background: "var(--accent-gradient)" }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                          />
                        )}
                        <span className="relative z-10">{diff.replace("All Difficulties", "All Levels")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search inputs */}
                <div className="relative w-full lg:w-80">
                  <Search size={16} className="absolute left-4 top-3" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search practice exercises..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full py-2.5 pl-11 pr-4 text-xs outline-none border border-[var(--border-primary)] transition-all"
                    style={{
                      backgroundColor: "var(--bg-input)",
                      borderColor: "var(--border-primary)",
                      color: "var(--text-primary)"
                    }}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <RefreshCw size={28} className="animate-spin" style={{ color: "var(--text-accent)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Loading practice exercises...</p>
                </div>
              ) : (
                /* Cards Grid */
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mt-8"
                >
                  <AnimatePresence mode="popLayout">  
                    {filteredProblems.map((prob, idx) => {
                      const isHovered = hoveredProblemId === prob.id;
                      const isCompleted = completedProblems.includes(prob.id);
                      
                      return (
                        <motion.div
                          key={prob.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, delay: idx * 0.03 }}
                          onMouseEnter={() => setHoveredProblemId(prob.id)}
                          onMouseLeave={() => setHoveredProblemId(null)}
                          onClick={() => {
                            window.location.href = `/practice/${prob.id}`;
                          }}
                          className="group relative flex flex-col justify-between rounded-2xl p-6 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border"
                          style={{
                            backgroundColor: "var(--bg-card)",
                          }}
                        >
                          {/* Hover highlights */}
                          <div 
                            className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                          />

                          <div className="relative z-10 space-y-4">
                            {/* Top status */}
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-[var(--bg-hover)]" style={{ color: "var(--text-secondary)" }}>
                                {prob.category}
                              </span>
                              <div className="flex items-center gap-2">
                                {isCompleted && (
                                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    <span>Solved</span>
                                  </span>
                                )}
                                <span className={`text-[9px] font-black uppercase tracking-wider ${
                                  prob.difficulty === "Easy" ? "text-emerald-500" :
                                  prob.difficulty === "Medium" ? "text-amber-500" : "text-rose-500"
                                }`}>
                                  {prob.difficulty}
                                </span>
                              </div>
                            </div>

                            {/* Title & Desc */}
                            <div className="space-y-2">
                              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                {prob.title}
                              </h2>
                              <p className="text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">
                                {prob.desc}
                              </p>
                            </div>
                          </div>

                          {/* Footer details */}
                          <div className="relative z-10 flex items-center justify-between pt-6 border-t mt-6" style={{ borderColor: "var(--border-primary)" }}>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{prob.time}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Code size={12} />
                                <span>{prob.testcases?.length || 0} assertion{prob.testcases?.length !== 1 ? 's' : ''}</span>
                              </span>
                            </div>

                            <motion.div 
                              className="flex items-center gap-1.5 text-xs font-bold"
                              style={{ color: "var(--text-primary)" }}
                              animate={{ x: isHovered ? 4 : 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <span>Start Practice</span>
                              <ChevronRight size={14} />
                            </motion.div>
                          </div>

                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Empty view */}
                  {filteredProblems.length === 0 && (
                    <div className="col-span-full py-16 text-center space-y-4">
                      <Terminal size={48} className="mx-auto text-[var(--text-muted)]" />
                      <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No practice exercises match filters.</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Try modifying filters or search query terms.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </main>

      {!user && <Footer />}
    </div>
  );
}
