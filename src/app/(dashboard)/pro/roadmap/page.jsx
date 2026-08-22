"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search, Plus, Minus, Bell, Check, MoreHorizontal, X,
  Play, Lock, Sparkles, Calendar, Clock, Star, Volume2,
  Video, BookOpen, Layers, Network, Grid, ListFilter,
  ChevronRight, ArrowRight, Share2, HelpCircle, Code,
  Flame, Award, CheckCircle2, MessageSquare, Bot, FileEdit
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import { useAuth } from "@/context/AuthContext";
import ProGate, { UpgradeToPro } from "@/components/pro/ProGate";

// ── Sample Learning Tracks ───────────────────────────────────────────────────
const TRACKS = [
  { id: "fullstack", name: "Full-Stack Software Architect", total: 26, completed: 2, upcoming: 24 },
  { id: "ai-engineer", name: "Applied AI & LLM Systems", total: 22, completed: 3, upcoming: 19 },
  { id: "cloud-devops", name: "Cloud Native & Platform Engineering", total: 18, completed: 1, upcoming: 17 },
];

// ── Milestone Nodes Data ──────────────────────────────────────────────────────
const INITIAL_MILESTONES = [
  {
    id: "m1",
    title: "Modern JavaScript & TypeScript Mastery",
    desc: "Master closures, event loop, type systems, generics, and reactive asynchronous patterns.",
    status: "completed", // completed | watching | upcoming | locked
    track: "fullstack",
    duration: "4.5 hrs",
    xp: 250,
    tags: ["TS", "Async"],
    resources: [
      { title: "Advanced Type Gymnastics", type: "video", time: "22m" },
      { title: "Async Concurrency Lab", type: "lab", time: "45m" }
    ],
    challenges: 4,
    vivaQuestions: ["Explain how TypeScript handles covariance and contravariance in function arguments."]
  },
  {
    id: "m2",
    title: "Reactive State & Component Architecture",
    desc: "Design scalable client state machines, compound components, and zero-runtime CSS tokens.",
    status: "completed",
    track: "fullstack",
    duration: "6.0 hrs",
    xp: 320,
    tags: ["React", "State"],
    resources: [
      { title: "State Management at Scale", type: "video", time: "35m" },
      { title: "Custom Hook Optimization", type: "code", time: "30m" }
    ],
    challenges: 6,
    vivaQuestions: ["When would you prefer optimistic UI updates over standard async loading states?"]
  },
  {
    id: "m3",
    title: "High-Performance Backend & Microservices",
    desc: "Architect event-driven Node/Go backends, distributed caching, idempotency, and connection pooling.",
    status: "watching",
    track: "fullstack",
    duration: "8.5 hrs",
    xp: 450,
    isFeatured: true, // featured floating card with play button
    activeTime: "Watching 12:40",
    learners: [
      { name: "Alex K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
      { name: "Dev P.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" },
      { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" }
    ],
    tags: ["Backend", "Redis", "Kafka"],
    resources: [
      { title: "Distributed Locks & Redis Streams", type: "video", time: "28m" },
      { title: "Database Sharding Patterns", type: "doc", time: "18m" },
      { title: "Microservice Load Balancing", type: "lab", time: "50m" }
    ],
    challenges: 5,
    vivaQuestions: ["How do you prevent duplicate webhook executions in distributed microservices?"]
  },
  {
    id: "m4",
    title: "Database Modeling, Indexing & Query Tuning",
    desc: "PostgreSQL internal indexing, EXPLAIN ANALYZE deep dive, composite keys, and read-replica strategies.",
    status: "upcoming",
    track: "fullstack",
    duration: "5.0 hrs",
    xp: 280,
    tags: ["PostgreSQL", "Prisma"],
    resources: [
      { title: "Query Plan Optimization", type: "video", time: "32m" },
      { title: "B-Tree vs GIN Indexing", type: "doc", time: "15m" }
    ],
    challenges: 4,
    vivaQuestions: ["What causes index bloat in PostgreSQL and how do you mitigate it?"]
  },
  {
    id: "m5",
    title: "Production CI/CD, Docker & Kubernetes",
    desc: "Build automated zero-downtime deployment pipelines, helm charts, rolling updates, and monitoring.",
    status: "upcoming",
    track: "fullstack",
    duration: "7.0 hrs",
    xp: 400,
    tags: ["DevOps", "K8s"],
    resources: [
      { title: "Kubernetes Ingress & TLS Secrets", type: "lab", time: "40m" }
    ],
    challenges: 3,
    vivaQuestions: ["Explain the difference between Liveness and Readiness probes in Kubernetes."]
  },
  {
    id: "m6",
    title: "Full-Stack AI Integration & RAG Systems",
    desc: "Connect vector embeddings, semantic search, hybrid retrieval, and streaming LLM token pipelines.",
    status: "upcoming",
    track: "fullstack",
    duration: "9.0 hrs",
    xp: 500,
    tags: ["AI", "Embeddings", "RAG"],
    resources: [
      { title: "Vector Databases & Cosine Similarity", type: "video", time: "45m" }
    ],
    challenges: 5,
    vivaQuestions: ["How do chunk overlap and semantic re-ranking reduce LLM hallucinations?"]
  }
];

// ── Right Sidebar Schedule Events ─────────────────────────────────────────────
const SCHEDULE_EVENTS = [
  {
    id: "e1",
    type: "webinar",
    badge: "Webinar",
    date: "Tu, 25.03",
    time: "Start at 12:30",
    title: "System Design for 10M Concurrent WebSockets",
    desc: "Live architecture walkthrough with ex-Staff Engineer on distributed connection management and state sync.",
    speaker: { name: "Annette Vance", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" },
    color: "cyan"
  },
  {
    id: "e2",
    type: "lesson",
    badge: "Audio Lesson",
    date: "We, 26.03",
    time: "20 min",
    title: "Distributed Consensus: Raft vs Paxos in Plain English",
    desc: "Audio breakdown of leader election, log replication, and split-brain resolution.",
    color: "purple"
  },
  {
    id: "e3",
    type: "task",
    badge: "Milestone Task",
    date: "Th, 27.03",
    time: "Due 6:00 PM",
    title: "Implement Rate Limiting Token Bucket in Redis",
    desc: "Solve the concurrency challenge and submit PR for AI automated code and edge-case review.",
    color: "yellow"
  },
  {
    id: "e4",
    type: "sticky",
    badge: "Daily Pro Reflection",
    date: "Fr, 28.03",
    title: "Engineering Leadership Tip",
    desc: "Senior engineering is less about writing code fast and more about writing code that allows others to move fast safely.",
    color: "mint"
  }
];

export default function MyRoadmapPage() {
  const { isPro, loadingStatus } = usePro();
  const { user } = useAuth();

  const [selectedTrack, setSelectedTrack] = useState("fullstack");
  const [searchQuery, setSearchQuery] = useState("");
  const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
  const [activeModalMilestone, setActiveModalMilestone] = useState(null);
  const [viewMode, setViewMode] = useState("graph"); // graph | list | grid
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filterLocked, setFilterLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap"); // roadmap | notes | resources

  if (!loadingStatus && !isPro) {
    return <UpgradeToPro />;
  }

  const currentTrackData = TRACKS.find(t => t.id === selectedTrack) || TRACKS[0];
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const upcomingCount = milestones.filter(m => m.status === "upcoming" || m.status === "watching").length;

  const toggleMilestoneStatus = (id, e) => {
    e?.stopPropagation();
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === "completed" ? "upcoming" : "completed";
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const filteredMilestones = milestones.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLocked ? m.status !== "upcoming" : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen -m-6 p-6 lg:p-8" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* â•â•â• TOP BAR / HEADER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="max-w-[1440px] mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Track Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              My Learning Plan
            </h1>
            <span className="text-2xl select-none">⏰</span>
          </div>

          <div className="h-6 w-px bg-[var(--border-primary)] hidden sm:block" />

          {/* Track Dropdown Pill */}
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors shadow-sm outline-none"
            style={{ borderColor: "var(--border-primary)" }}
          >
            {TRACKS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Right: Search & Stat Counter Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search milestone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-full border bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] transition-all w-44 md:w-56 shadow-sm"
              style={{ borderColor: "var(--border-primary)" }}
            />
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2">
            {/* Total */}
            <div className="px-3.5 py-1.5 rounded-2xl border bg-[var(--bg-secondary)] flex flex-col items-center shadow-sm" style={{ borderColor: "var(--border-primary)" }}>
              <span className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{currentTrackData.total}</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">Total</span>
            </div>

            {/* Completed */}
            <div className="px-3.5 py-1.5 rounded-2xl border bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center shadow-sm">
              <div className="flex items-center gap-1">
                <span className="text-base font-bold leading-tight text-emerald-600 dark:text-emerald-400">{completedCount}</span>
                <span className="text-xs">🎉</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Completed</span>
            </div>

            {/* Upcoming */}
            <div className="px-3.5 py-1.5 rounded-2xl border bg-[var(--bg-secondary)] flex flex-col items-center shadow-sm" style={{ borderColor: "var(--border-primary)" }}>
              <span className="text-base font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{upcomingCount}</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN ROADMAP CANVAS & SIDEBAR ─────────────────────────────────────────────  */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
        
        {/* ─── LEFT ROADMAP INTERACTIVE AREA (8 Cols) ───────────────────────── */}
        <div
          className="xl:col-span-8 rounded-[32px] border p-6 lg:p-8 relative min-h-[720px] flex flex-col justify-between overflow-hidden shadow-sm transition-all"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-primary)"
          }}
        >
          {/* Subtle dotted canvas background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle, var(--text-muted) 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* ── Left Floating Toolbar (Zoom & Views) ── */}
          <div className="absolute left-6 top-6 z-20 flex flex-col gap-2">
            
            {/* View Switchers */}
            <div className="p-1 rounded-2xl border bg-[var(--bg-primary)]/90 backdrop-blur shadow-md flex flex-col gap-1" style={{ borderColor: "var(--border-primary)" }}>
              <button
                onClick={() => setViewMode("graph")}
                title="Interactive Flow Graph"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${viewMode === "graph" ? "bg-black dark:bg-white text-white dark:text-black shadow" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"}`}
              >
                <Network size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Linear Step List"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${viewMode === "list" ? "bg-black dark:bg-white text-white dark:text-black shadow" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"}`}
              >
                <Layers size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Milestone Cards Grid"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-black dark:bg-white text-white dark:text-black shadow" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"}`}
              >
                <Grid size={14} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="p-1 rounded-2xl border bg-[var(--bg-primary)]/90 backdrop-blur shadow-md flex flex-col gap-1" style={{ borderColor: "var(--border-primary)" }}>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 10, 130))}
                title="Zoom In"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 10, 70))}
                title="Zoom Out"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Minus size={14} />
              </button>
            </div>

            {/* Notification Bell Badge */}
            <div className="relative">
              <button className="w-10 h-10 rounded-2xl border bg-[var(--bg-primary)]/90 backdrop-blur shadow-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" style={{ borderColor: "var(--border-primary)" }}>
                <Bell size={16} />
              </button>
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black shadow-sm">
                29
              </span>
            </div>
          </div>

          {/* ── Active Node Graph / Canvas Flow ── */}
          <div
            className="flex-1 w-full flex flex-col justify-center items-center py-6 transition-all duration-300 relative z-10"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
          >

            {/* ── Milestone Cards Layout ── */}
            <div className={`w-full max-w-2xl mx-auto space-y-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0" : ""}`}>
              
              {filteredMilestones.map((m, idx) => {
                const isCompleted = m.status === "completed";
                const isWatching = m.status === "watching";

                // FEATURED FLOATING CARD (like "Pharmacology Basics" in the reference)
                if (m.isFeatured && viewMode === "graph") {
                  return (
                    <div
                      key={m.id}
                      onClick={() => setActiveModalMilestone(m)}
                      className="relative z-20 cursor-pointer transform -rotate-1 hover:rotate-0 transition-all duration-300 group max-w-md mx-auto"
                    >
                      <div
                        className="rounded-3xl p-6 border shadow-2xl relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, #f5d0fe 0%, #e9d5ff 50%, #d8b4fe 100%)",
                          borderColor: "rgba(168, 85, 247, 0.4)",
                          color: "#1e1b4b"
                        }}
                      >
                        {/* Playful Floating Music / Wave Notes */}
                        <div className="absolute top-4 right-6 flex items-center gap-1.5 opacity-60 text-purple-900">
                          <Volume2 size={16} />
                          <Sparkles size={14} />
                        </div>

                        {/* Title & Description */}
                        <div className="pr-16">
                          <h3 className="text-xl font-extrabold tracking-tight mb-2 text-purple-950">
                            {m.title}
                          </h3>
                          <p className="text-xs text-purple-900/80 line-clamp-2 leading-relaxed mb-6 font-medium">
                            {m.desc}
                          </p>
                        </div>

                        {/* Big Play Preview Button */}
                        <div className="absolute top-1/2 right-6 -translate-y-1/2">
                          <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
                            <Play size={22} className="fill-purple-700 ml-0.5" />
                          </div>
                        </div>

                        {/* Bottom Row: Active Watching Time & Avatar Stack */}
                        <div className="flex items-center justify-between pt-2 border-t border-purple-300/60">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-white/40 px-3 py-1 rounded-full backdrop-blur">
                            <Clock size={12} />
                            <span>{m.activeTime}</span>
                          </div>

                          {/* Active Learners Avatars */}
                          <div className="flex items-center -space-x-2">
                            {m.learners?.map((l, i) => (
                              <img
                                key={i}
                                src={l.avatar}
                                alt={l.name}
                                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // STANDARD ROADMAP NODE CARDS (like "Medical Terminology" / "Anatomy" in reference)
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveModalMilestone(m)}
                    className={`rounded-3xl p-5 border transition-all duration-200 cursor-pointer group relative shadow-sm hover:shadow-md ${
                      isCompleted
                        ? "bg-[var(--bg-secondary)] border-emerald-200/80 dark:border-emerald-900/40"
                        : "bg-[var(--bg-secondary)] border-[var(--border-primary)] opacity-90 hover:opacity-100"
                    } ${idx % 2 === 0 ? "md:ml-4" : "md:mr-4"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Title & Subtitle */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                            {m.title}
                          </h3>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>

                      {/* Right: Quick Action Controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => toggleMilestoneStatus(m.id, e)}
                            className="w-7 h-7 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center transition-colors"
                          >
                            <Check size={13} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveModalMilestone(m); }}
                          className="w-7 h-7 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status & Tags Bar */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs">
                      {/* Status Tag */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          Completed 🍃
                        </span>
                      ) : isWatching ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                          In Progress ⚡
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-primary)]">
                          <Lock size={10} /> Upcoming
                        </span>
                      )}

                      {/* XP & Duration */}
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {m.duration}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Flame size={11} /> {m.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom Floating Action Dock (like in reference) ── */}
          <div className="relative z-30 flex justify-center mt-6">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full border bg-black text-white dark:bg-white dark:text-black shadow-2xl backdrop-blur">
              <button title="Text Notes" className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center hover:scale-110 transition-transform">
                T
              </button>
              <button title="AI Mentor Copilot" className="w-8 h-8 rounded-full bg-cyan-400 text-black font-bold text-xs flex items-center justify-center hover:scale-110 transition-transform">
                A
              </button>
              <button title="Portfolio Projects" className="w-8 h-8 rounded-full bg-pink-400 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Code size={13} />
              </button>
              <button title="Curated Resources" className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center hover:scale-110 transition-transform">
                <BookOpen size={13} />
              </button>
              <button title="Peer Discussion" className="w-8 h-8 rounded-full bg-indigo-400 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <MessageSquare size={13} />
              </button>
              <button title="AI Mock Viva" className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center hover:scale-110 transition-transform">
                <Bot size={13} />
              </button>
              
              <div className="w-px h-5 bg-white/20 dark:bg-black/20 mx-1" />

              <button
                onClick={() => setFilterLocked(prev => !prev)}
                title={filterLocked ? "Show All Milestones" : "Hide Locked Milestones"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${filterLocked ? "bg-amber-400 text-black" : "text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black"}`}
              >
                <Lock size={13} />
              </button>
              
              <button title="Add Custom Milestone" className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 flex items-center justify-center transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR: "MY EVENTS / SCHEDULE" (4 Cols) ───────────────── */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                My Events
              </h2>
              <span className="text-xl select-none">🥳</span>
            </div>

            <Link
              href="/events"
              className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
            >
              View calendar <ChevronRight size={12} />
            </Link>
          </div>

          {/* Pastel Schedule Cards Stack */}
          <div className="space-y-4">
            
            {/* 1. WEBINAR CARD (Cyan Pastel) */}
            <div
              className="rounded-3xl p-5 border shadow-sm transition-transform hover:-translate-y-0.5 duration-200"
              style={{
                backgroundColor: "#E0F7FA",
                borderColor: "rgba(6, 182, 212, 0.3)",
                color: "#164e63"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={SCHEDULE_EVENTS[0].speaker.avatar}
                    alt="Speaker"
                    className="w-6 h-6 rounded-full object-cover border border-cyan-300"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-900">
                    {SCHEDULE_EVENTS[0].badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-cyan-800">
                  {SCHEDULE_EVENTS[0].date}
                </span>
              </div>

              <h4 className="text-sm font-bold leading-snug mb-2 text-cyan-950">
                {SCHEDULE_EVENTS[0].title}
              </h4>
              <p className="text-xs text-cyan-900/80 leading-relaxed mb-4">
                {SCHEDULE_EVENTS[0].desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-cyan-200">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/70 text-cyan-950 shadow-sm">
                  <Clock size={11} /> {SCHEDULE_EVENTS[0].time}
                </span>
                <button className="text-xs font-bold text-cyan-950 hover:underline flex items-center gap-1">
                  Join Live <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* 2. AUDIO LESSON CARD (Lavender Pastel) */}
            <div
              className="rounded-3xl p-5 border shadow-sm transition-transform hover:-translate-y-0.5 duration-200"
              style={{
                backgroundColor: "#F3E8FF",
                borderColor: "rgba(168, 85, 247, 0.3)",
                color: "#581c87"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-purple-900">
                  <Volume2 size={15} />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
                    {SCHEDULE_EVENTS[1].badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-purple-800">
                  {SCHEDULE_EVENTS[1].date}
                </span>
              </div>

              <h4 className="text-sm font-bold leading-snug mb-2 text-purple-950">
                {SCHEDULE_EVENTS[1].title}
              </h4>
              <p className="text-xs text-purple-900/80 leading-relaxed mb-4">
                {SCHEDULE_EVENTS[1].desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                <span className="text-xs font-bold text-purple-950">
                  â± {SCHEDULE_EVENTS[1].time}
                </span>
                <button className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1">
                  <Play size={10} className="fill-white" /> Listen Now
                </button>
              </div>
            </div>

            {/* 3. TASK CARD (Light Peach / Yellow Pastel) */}
            <div
              className="rounded-3xl p-5 border shadow-sm transition-transform hover:-translate-y-0.5 duration-200"
              style={{
                backgroundColor: "#FEF3C7",
                borderColor: "rgba(245, 158, 11, 0.3)",
                color: "#78350f"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    {SCHEDULE_EVENTS[2].badge}
                  </span>
                </div>
                <span className="text-xs font-semibold text-amber-800">
                  {SCHEDULE_EVENTS[2].date}
                </span>
              </div>

              <h4 className="text-sm font-bold leading-snug mb-2 text-amber-950">
                {SCHEDULE_EVENTS[2].title}
              </h4>
              <p className="text-xs text-amber-900/80 leading-relaxed mb-4">
                {SCHEDULE_EVENTS[2].desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                <span className="text-xs font-bold text-amber-900">
                  {SCHEDULE_EVENTS[2].time}
                </span>
                <Link
                  href="/practice"
                  className="text-xs font-bold text-amber-950 hover:underline flex items-center gap-1"
                >
                  Start Lab <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 4. TILTED STICKY NOTE (Mint Pastel - Playful Tilt like in reference) */}
            <div className="pt-2">
              <div
                className="rounded-3xl p-5 border shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300"
                style={{
                  backgroundColor: "#DCFCE7",
                  borderColor: "rgba(34, 197, 94, 0.4)",
                  color: "#14532d"
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-emerald-900">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                      {SCHEDULE_EVENTS[3].badge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800">
                    {SCHEDULE_EVENTS[3].date}
                  </span>
                </div>

                <p className="text-xs font-medium text-emerald-950 leading-relaxed italic">
                  "{SCHEDULE_EVENTS[3].desc}"
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* â•â•â• INTERACTIVE MILESTONE DETAIL DRAWER / MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeModalMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-3xl border shadow-2xl p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto space-y-6"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)"
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalMilestone(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] flex items-center justify-center transition-colors"
            >
              <X size={15} />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  Milestone Step
                </span>
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  â± {activeModalMilestone.duration}
                </span>
                <span className="text-xs text-amber-500 font-bold">
                  ⚡ {activeModalMilestone.xp} XP
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {activeModalMilestone.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                {activeModalMilestone.desc}
              </p>
            </div>

            {/* Learning Resources */}
            {activeModalMilestone.resources?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Curated Lessons & Labs
                </h4>
                <div className="space-y-2">
                  {activeModalMilestone.resources.map((res, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-center justify-between hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {res.type === "video" ? <Play size={13} className="fill-purple-600" /> : <Code size={13} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{res.title}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">{res.time} Â· Interactive</span>
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-[var(--text-muted)]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Viva Mock Questions */}
            {activeModalMilestone.vivaQuestions?.length > 0 && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                  <Bot size={14} />
                  <span>AI Viva Practice Question:</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">
                  "{activeModalMilestone.vivaQuestions[0]}"
                </p>
                <Link
                  href="/pro/viva"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:underline pt-1"
                >
                  Practice with AI Viva <ChevronRight size={10} />
                </Link>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
              <button
                onClick={() => {
                  toggleMilestoneStatus(activeModalMilestone.id);
                  setActiveModalMilestone(prev => ({
                    ...prev,
                    status: prev.status === "completed" ? "upcoming" : "completed"
                  }));
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeModalMilestone.status === "completed"
                    ? "bg-emerald-500 text-white"
                    : "bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)]"
                }`}
              >
                <CheckCircle2 size={14} />
                {activeModalMilestone.status === "completed" ? "Completed 🎉" : "Mark as Completed"}
              </button>

              <button
                onClick={() => setActiveModalMilestone(null)}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

