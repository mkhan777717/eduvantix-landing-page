"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy, BookOpen, Terminal, Code,
  ChevronRight, ArrowUpRight, Activity,
  RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle,
  Flame, Award, TrendingUp, HelpCircle, Megaphone, Pin, AlertTriangle, Paperclip
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Helper: time-ago formatter
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

// Status badge styling
function statusStyle(status) {
  switch (status) {
    case "ACCEPTED": return { color: "text-emerald-400", label: "Accepted ✓" };
    case "WRONG_ANSWER": return { color: "text-rose-400", label: "Wrong Answer" };
    case "RUNTIME_ERROR": return { color: "text-orange-400", label: "Runtime Error" };
    case "COMPILATION_ERROR": return { color: "text-amber-400", label: "Compile Error" };
    case "TIME_LIMIT_EXCEEDED": return { color: "text-slate-400", label: "TLE" };
    default: return { color: "text-slate-400", label: status };
  }
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBottomTab, setActiveBottomTab] = useState("contests");

  const handleEnterContest = (contestId) => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen({ navigationUI: "hide" }).catch((err) => {
        console.warn("Fullscreen request deferred or blocked in student dashboard:", err);
      });
    }
    router.push(`/contest/${contestId}`);
  };

  // Fetch live data
  useEffect(() => {
    if (!user) return;

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user.role === "ADMIN" ? "ADMIN" : "USER" }),
      };

      let backendSubmissions = [];
      try {
        // Fetch submissions for this user
        const subRes = await fetch(
          `${API_BASE}/api/submissions?userId=${user.id}`,
          { headers, signal: AbortSignal.timeout(30000) }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success) backendSubmissions = subData.submissions || [];
        }
      } catch (e) {
        console.error("Failed to fetch backend submissions:", e);
      }

      setSubmissions(backendSubmissions);

      let backendContests = [];
      try {
        // Fetch contests for stats
        const contestRes = await fetch(`${API_BASE}/api/contests`, {
          headers,
          signal: AbortSignal.timeout(30000),
        });
        if (contestRes.ok) {
          const contestData = await contestRes.json();
          if (contestData.success) backendContests = contestData.contests || [];
        }
      } catch (e) {
        console.error("Failed to fetch backend contests:", e);
      }

      setContests(backendContests);

      // Fetch recent announcements (only for institute-affiliated students)
      if (user.instituteId) {
        try {
          const annRes = await fetch(`${API_BASE}/api/announcements?limit=3`, { headers, signal: AbortSignal.timeout(10000) });
          if (annRes.ok) {
            const annData = await annRes.json();
            if (annData.success) setAnnouncements(annData.announcements || []);
          }
        } catch (e) {
          console.error("Failed to fetch announcements on dashboard:", e);
        }
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, [user, token, API_BASE]);

  // --- Derived stats from live data ---
  const acceptedSubs = submissions.filter(s => s.status === "ACCEPTED");
  const uniqueSolved = new Set(acceptedSubs.map(s => s.problemId)).size;
  const totalSubs = submissions.length;

  const now = new Date();
  const activeContests = contests.filter(c => new Date(c.startTime) <= now && new Date(c.endTime) >= now);
  const upcomingContests = contests.filter(c => new Date(c.startTime) > now);

  // Contests the user participated in
  const myParticipations = contests.filter(c =>
    c.userParticipation && c.userParticipation.completed
  );

  // Best rank across completed contests (by score)
  const bestScore = myParticipations.length > 0
    ? Math.max(...myParticipations.map(c => c.userParticipation?.score || 0))
    : 0;

  // Recent activity: last 10 submissions sorted by date
  const recentActivity = [...submissions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Dynamic Ranks Definition
  const RANKS = [
    { name: "Novice Scholar", minPoints: 0, maxPoints: 100, color: "text-slate-400" },
    { name: "Bronze Scholar", minPoints: 100, maxPoints: 200, color: "text-amber-600" },
    { name: "Silver Scholar", minPoints: 200, maxPoints: 300, color: "text-slate-300" },
    { name: "Gold Scholar", minPoints: 300, maxPoints: 400, color: "text-yellow-400" },
    { name: "Elite Scholar III", minPoints: 400, maxPoints: 500, color: "text-zinc-400" },
    { name: "Elite Scholar II", minPoints: 500, maxPoints: 600, color: "text-zinc-400" },
    { name: "Elite Scholar I", minPoints: 600, maxPoints: 750, color: "text-rose-400" },
    { name: "Grandmaster Scholar", minPoints: 750, maxPoints: 1000, color: "text-slate-400" },
    { name: "Legendary Coder", minPoints: 1000, maxPoints: Infinity, color: "text-amber-400 animate-pulse" }
  ];

  const currentPoints = uniqueSolved * 10 + bestScore;

  // Find user's current rank
  const currentRank = RANKS.find(
    (r) => currentPoints >= r.minPoints && currentPoints < r.maxPoints
  ) || RANKS[0];

  const minPointsForCurrentRank = currentRank.minPoints;
  const targetNextRankPoints = currentRank.maxPoints === Infinity ? currentPoints : currentRank.maxPoints;

  // Calculate progress percent within the current rank
  const progressPercent = currentRank.maxPoints === Infinity
    ? 100
    : Math.min(100, Math.round(((currentPoints - minPointsForCurrentRank) / (targetNextRankPoints - minPointsForCurrentRank)) * 100));

  // Calculate dynamic active streak from user submissions
  const calculateStreak = (subs) => {
    if (!subs || subs.length === 0) return 0;

    // Extract unique dates of submissions (YYYY-MM-DD) in local time
    const datesList = subs.map(s => {
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const uniqueDates = Array.from(new Set(datesList)).sort((a, b) => new Date(b) - new Date(a));
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const todayStr = formatDate(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // If the user hasn't submitted today or yesterday, streak is 0
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    // Start counting from the most recent date of submission in the active window (today or yesterday)
    const startDateStr = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
    let currentDate = new Date(startDateStr);

    const dateSet = new Set(uniqueDates);
    while (true) {
      const checkStr = formatDate(currentDate);
      if (dateSet.has(checkStr)) {
        streak++;
        // Move to the previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const activeStreak = calculateStreak(submissions);

  // Custom SVG solved breakdown (Difficulties solved)
  const easySolved = acceptedSubs.filter(s => s.problem?.difficulty === "EASY" || !s.problem?.difficulty).length;
  const mediumSolved = acceptedSubs.filter(s => s.problem?.difficulty === "MEDIUM").length;
  const hardSolved = acceptedSubs.filter(s => s.problem?.difficulty === "HARD").length;

  const stats = [
    {
      title: "Problems Solved",
      value: uniqueSolved > 0 ? `${uniqueSolved}` : "0",
      change: totalSubs > 0 ? `${totalSubs} total submissions` : "No submissions yet",
      icon: Code,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
    },
    {
      title: "Contests Entered",
      value: myParticipations.length > 0 ? `${myParticipations.length}` : "0",
      change: bestScore > 0 ? `Best score: ${bestScore} pts` : activeContests.length > 0 ? `${activeContests.length} live now!` : "No contests yet",
      icon: Trophy,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Contests",
      value: activeContests.length > 0 ? `${activeContests.length} Live` : upcomingContests.length > 0 ? `${upcomingContests.length} Soon` : "None",
      change: upcomingContests.length > 0 ? `${upcomingContests.length} upcoming` : "Check back later",
      icon: BookOpen,
      color: "text-neutral-400",
      bgColor: "bg-neutral-500/10",
    },
    {
      title: "Acceptance Rate",
      value: totalSubs > 0 ? `${Math.round((acceptedSubs.length / totalSubs) * 100)}%` : "—",
      change: totalSubs > 0 ? `${acceptedSubs.length} accepted / ${totalSubs} submitted` : "Submit your first solution",
      icon: Terminal,
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
    },
  ]; return (
    <div className="space-y-10">
      {/* ── Announcements Banner (Only for Institute-Affiliated Students with active notices) ─────────────── */}
      {user?.instituteId && announcements.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-accent)" }}
        >
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Megaphone size={18} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Notice Board</span>
                {announcements[0].priority === "URGENT" && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                    Urgent
                  </span>
                )}
                {announcements[0].batch && (
                  <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                    &bull; Batch: {announcements[0].batch.name}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {announcements[0].title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            {announcements[0].attachments?.length > 0 && (
              <span className="text-[10px] flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <Paperclip size={11} /> {announcements[0].attachments.length} attachment{announcements[0].attachments.length > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => router.push("/student/announcements")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-[var(--border-primary)] cursor-pointer flex items-center gap-1.5 hover:bg-[var(--bg-hover)]"
              style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            >
              <span>View Notices</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Editorial Header Banner ───────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 border-b pb-12" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-4 max-w-2xl relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: "var(--accent-primary)" }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>Scholar Dashboard</span>
          </div>
          <h1 className="text-[clamp(2rem,3vw,3rem)] font-black leading-[1] tracking-[-0.03em]" style={{ color: "var(--text-primary)" }}>
            Welcome back, <br />
            <em className="font-serif-display" style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>{user?.username || "Scholar"}</em>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Monitor your coding stats, complete recommended algorithms tracks, and compete in scheduled speedrun contests.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => router.push("/practice")}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all cursor-pointer flex items-center gap-2 hover:-translate-y-0.5"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
            >
              <Code size={14} />
              <span>Practice Coding</span>
            </button>
            <button
              onClick={() => router.push("/contest")}
              className="px-6 py-3 rounded-xl font-bold text-xs transition-all border border-[var(--border-primary)] cursor-pointer flex items-center gap-2 hover:bg-[var(--bg-hover)] hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              <span>Contest Arena</span>
              <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => router.push("/student/daily-challenges")}
              className="px-6 py-3 rounded-xl font-bold text-xs transition-all border border-amber-500/20 bg-amber-500/5 cursor-pointer flex items-center gap-2 hover:bg-amber-500/10 text-amber-500 shadow-sm hover:-translate-y-0.5"
            >
              <span>Daily Challenge</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Gamified visual markers (Streak, Points & animated Progress ring) */}
        <div className="flex flex-col sm:flex-row items-center gap-8 shrink-0 relative z-10 lg:pl-10 lg:border-l" style={{ borderColor: "var(--border-primary)" }}>
          {/* Circular SVG progress ring */}
          <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="54" stroke="var(--border-primary)" strokeWidth="4" fill="transparent" />
              <circle
                cx="64" cy="64" r="54"
                stroke="var(--accent-primary)"
                strokeWidth="4" fill="transparent"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * progressPercent) / 100}
                strokeLinecap="square"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">Rank</span>
              <span className="text-xl font-black font-serif-display" style={{ color: "var(--text-primary)" }}>{progressPercent}%</span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {currentRank.maxPoints === Infinity ? `${currentPoints} pts` : `${currentPoints} / ${targetNextRankPoints}`}
              </span>
            </div>
          </div>

          <div className="space-y-4 w-full sm:w-auto">
            {/* Streak card */}
            <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-primary)" }}>
                <Flame size={18} className="animate-pulse text-orange-500" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Active Streak</p>
                <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                  {activeStreak > 0 ? `${activeStreak} Day${activeStreak > 1 ? "s" : ""} 🔥` : "0 Days"}
                </p>
              </div>
            </div>

            {/* Rank badge card */}
            <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-primary)" }}>
                <Award size={18} className={currentRank.color} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Current Standing</p>
                <p className={`text-sm font-black ${currentRank.color}`}>{currentRank.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dashboard Widgets: Goal & Recommended ─── */}
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Goal Tracker */}
      {/* <div className="p-6 rounded-2xl border border-[var(--border-primary)] flex flex-col justify-between" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          <div className="space-y-2 mb-8">
            <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Daily Study Goal
            </h2>
            <p className="text-3xl font-serif-display italic" style={{ color: "var(--text-primary)" }}>
              45 <span className="text-sm not-italic font-sans" style={{ color: "var(--text-muted)" }}>/ 60 mins</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-full h-1" style={{ backgroundColor: "var(--border-primary)" }}>
              <div className="h-full transition-all duration-1000" style={{ width: "75%", backgroundColor: "var(--accent-primary)" }} />
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              You are <strong style={{ color: "var(--text-primary)" }}>15 mins</strong> away from your daily goal!
            </p>
          </div>
        </div> */}

      {/* Recommended Problem */}
      {/* <div className="lg:col-span-2 p-8 rounded-2xl border border-[var(--border-primary)] relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
          <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 border" style={{ color: "var(--text-secondary)", borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
                  Arrays
                </span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Medium</span>
              </div>
              <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Longest Substring Without Repeating Characters
              </h3>
              <p className="text-xs max-w-md leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Given a string s, find the length of the longest substring without repeating characters. A classic sliding window problem.
              </p>
            </div>

            <button
              onClick={() => router.push("/practice/longest-substring-without-repeating-characters")}
              className="px-6 py-3 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 shrink-0"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
            >
              Solve Now
            </button>
          </div>
        </div>
      </div>*/}
  

      {/* ── Bottom Section: Contests & Submissions ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">

        {/* Left: Active / Upcoming Contests & Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex gap-6">
              <button
                onClick={() => setActiveBottomTab("contests")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 relative transition-all cursor-pointer ${activeBottomTab === "contests" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
              >
                <span>Arena</span>
                {activeBottomTab === "contests" && (
                  <motion.div layoutId="studentBottomTab" className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--text-primary)" }} />
                )}
              </button>
              <button
                onClick={() => setActiveBottomTab("reports")}
                className={`text-xs font-bold uppercase tracking-widest pb-3 relative transition-all cursor-pointer ${activeBottomTab === "reports" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
              >
                <span>Reports</span>
                {activeBottomTab === "reports" && (
                  <motion.div layoutId="studentBottomTab" className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--text-primary)" }} />
                )}
              </button>
            </div>
            {activeBottomTab === "contests" && (
              <button onClick={() => router.push("/contest")} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 underline-draw" style={{ color: "var(--text-secondary)" }}>
                <span>View All</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {activeBottomTab === "contests" ? (
            <div className="space-y-4">
              {loading ? (
                [0, 1, 2].map(i => (
                  <div key={i} className="p-5 rounded-xl border border-[var(--border-primary)] animate-pulse" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                    <div className="h-3 w-40 rounded bg-[var(--border-primary)] mb-3" />
                    <div className="h-2 w-24 rounded bg-[var(--border-primary)]" />
                  </div>
                ))
              ) : [...activeContests, ...upcomingContests].length === 0 ? (
                <div className="p-8 rounded-xl border border-[var(--border-primary)] text-center space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                  <Trophy size={24} className="mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>No contests scheduled yet</p>
                </div>
              ) : (
                [...activeContests.slice(0, 2), ...upcomingContests.slice(0, 2)].map((contest) => {
                  const start = new Date(contest.startTime);
                  const end = new Date(contest.endTime);
                  const isLive = start <= now && end >= now;
                  const minsLeft = isLive ? Math.max(0, Math.floor((end - now) / 60000)) : null;

                  return (
                    <motion.div
                      key={contest.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-xl border border-[var(--border-primary)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-all group"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
                      onClick={() => handleEnterContest(contest.id)}
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${isLive ? "text-emerald-500" : "text-zinc-500"}`}>
                            {isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {isLive ? "Live" : "Upcoming"}
                          </span>
                        </div>
                        <p className="text-base font-bold truncate group-hover:underline" style={{ color: "var(--text-primary)" }}>
                          {contest.title}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          {isLive ? `${minsLeft}m remaining` : `Starts ${start.toLocaleDateString()} at ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-[var(--border-primary)] transition-colors group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                            Enter
                          </span>
                        ) : (
                          <Clock size={16} style={{ color: "var(--text-muted)" }} />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                [0, 1].map(i => (
                  <div key={i} className="p-5 rounded-xl border border-[var(--border-primary)] animate-pulse" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                    <div className="h-3 w-40 rounded bg-[var(--border-primary)] mb-3" />
                    <div className="h-2 w-24 rounded bg-[var(--border-primary)]" />
                  </div>
                ))
              ) : contests.filter(c => c.userParticipation).length === 0 ? (
                <div className="p-8 rounded-xl border border-[var(--border-primary)] text-center space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                  <Trophy size={24} className="mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>No contest attempts recorded</p>
                </div>
              ) : (
                contests.filter(c => c.userParticipation).map((contest) => {
                  const isCompleted = contest.userParticipation?.completed;
                  const score = contest.userParticipation?.score ?? 0;
                  const timeSpent = contest.userParticipation?.timeSpent ?? "—";
                  return (
                    <motion.div
                      key={contest.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-xl border border-[var(--border-primary)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-all group"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
                      onClick={() => handleEnterContest(contest.id)}
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${isCompleted ? "text-emerald-500" : "text-amber-500"}`}>
                            {isCompleted ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <p className="text-base font-bold truncate group-hover:underline" style={{ color: "var(--text-primary)" }}>
                          {contest.title}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          Score: <strong style={{ color: "var(--text-primary)" }}>{score} pts</strong> &bull; Time Spent: {timeSpent}
                        </p>
                      </div>
                      <div className="shrink-0 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                        View &rarr;
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right: Recent Submissions */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: "var(--border-primary)" }}>
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h2>
            <Activity size={14} style={{ color: "var(--text-muted)" }} />
          </div>

          <div className="border border-[var(--border-primary)] rounded-xl" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            {loading ? (
              <div className="p-6 flex items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Loading</span>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle size={20} className="mx-auto opacity-30" style={{ color: "var(--text-muted)" }} />
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>No submissions yet</p>
                <button onClick={() => router.push("/practice")} className="text-[10px] font-bold underline-draw" style={{ color: "var(--text-primary)" }}>
                  Go to Practice →
                </button>
              </div>
            ) : (
              <div className="p-3 divide-y" style={{ borderColor: "var(--border-primary)" }}>
                {recentActivity.map((sub) => {
                  const { color, label } = statusStyle(sub.status);
                  return (
                    <div key={sub.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[var(--border-primary)] rounded-sm" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-hover)" }}>
                          {sub.language}
                        </span>
                        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                          {timeAgo(sub.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <p className="text-xs font-bold truncate pr-2" style={{ color: "var(--text-primary)" }}>
                          {sub.problem?.title || `Problem #${sub.problemId}`}
                        </p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${color}`}>
                          {sub.status === "ACCEPTED" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          <span>{label}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
