"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Search, Clock, Terminal, ChevronRight,
  UserCheck, AlertCircle, RefreshCw, Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders } from "@/utils/api";

// ─── Live timing helpers ───────────────────────────────────────────────────
function computeContestTiming(c) {
  const now = new Date();
  const start = c.startTime ? new Date(c.startTime) : null;
  const end = c.endTime ? new Date(c.endTime) : null;

  // If timestamps are invalid ISO (old static strings), preserve legacy fields
  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    return {
      status: c.status || "upcoming",
      timeLeftStr: c.timeLeftStr || "—",
      durationMins: c.durationMins || 0,
    };
  }

  let status = "upcoming";
  if (now >= start && now <= end) status = "active";
  else if (now > end) status = "past";

  const durationMins = c.durationMins || Math.round((end - start) / 60000);

  let timeLeftStr;
  if (status === "active") {
    const secsLeft = Math.max(0, Math.floor((end - now) / 1000));
    const h = Math.floor(secsLeft / 3600);
    const m = Math.floor((secsLeft % 3600) / 60);
    const s = secsLeft % 60;
    if (h > 0) {
      timeLeftStr = `${h}h ${m}m remaining`;
    } else if (m > 0) {
      timeLeftStr = `${m}m ${String(s).padStart(2, "0")}s remaining`;
    } else {
      timeLeftStr = `${s}s remaining`;
    }
  } else if (status === "upcoming") {
    const secsUntil = Math.max(0, Math.floor((start - now) / 1000));
    const h = Math.floor(secsUntil / 3600);
    const m = Math.floor((secsUntil % 3600) / 60);
    const s = secsUntil % 60;
    if (h >= 24) {
      const days = Math.floor(h / 24);
      timeLeftStr = `Starts in ${days}d ${h % 24}h`;
    } else if (h > 0) {
      timeLeftStr = `Starts in ${h}h ${m}m`;
    } else if (m > 0) {
      timeLeftStr = `Starts in ${m}m ${String(s).padStart(2, "0")}s`;
    } else {
      timeLeftStr = `Starts in ${s}s`;
    }
  } else {
    // past
    const secsAgo = Math.floor((now - end) / 1000);
    const h = Math.floor(secsAgo / 3600);
    const days = Math.floor(secsAgo / 86400);
    if (days >= 1) {
      timeLeftStr = `Completed ${days} day${days > 1 ? "s" : ""} ago`;
    } else if (h >= 1) {
      timeLeftStr = `Completed ${h}h ago`;
    } else {
      timeLeftStr = `Completed recently`;
    }
  }

  return { status, timeLeftStr, durationMins };
}

export default function ContestLobby() {
  const { API_BASE, token, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all"); // all, active, upcoming, past, leaderboard
  const [searchQuery, setSearchQuery] = useState("");
  const [allContests, setAllContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredContests, setRegisteredContests] = useState([]);
  const [pastContestResults, setPastContestResults] = useState(null);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

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

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Enter Arena: navigate to the contest workspace.
  // We trigger fullscreen immediately using the click user gesture, which is
  // preserved during client-side Next.js route transitions.
  const handleEnterArena = (contestId) => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen({ navigationUI: "hide" }).catch((err) => {
        console.warn("Fullscreen request deferred or blocked in lobby:", err);
      });
    }
    router.push(`/contest/${contestId}`);
  };

  // Live tick — forces re-render every second so countdowns stay accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Load registration history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRegs = localStorage.getItem("contest_registrations");
      const isStudent = localStorage.getItem("synapse_student_session") === "true";
      setTimeout(() => {
        if (savedRegs) {
          try { setRegisteredContests(JSON.parse(savedRegs)); } catch { }
        }
        setIsStudentLoggedIn(isStudent);
      }, 0);
    }
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const headersObj = buildAuthHeaders(token, user);

      const res = await fetch(`${API_BASE}/api/contests`, { headers: headersObj });
      const data = await res.json();

      if (data.success && data.contests) {
        const now = new Date();
        const mapped = data.contests.map(c => {
          const start = new Date(c.startTime);
          const end = new Date(c.endTime);

          let status = "upcoming";
          if (now >= start && now <= end) status = "active";
          else if (now > end) status = "past";

          const durationMins = Math.round((end - start) / 60000);
          const totalPoints = c.contestProblems
            ? c.contestProblems.reduce((sum, cp) => sum + cp.points, 0)
            : 0;

          let timeLeftStr = "Completed";
          if (status === "active") {
            const diffMins = Math.max(0, Math.floor((end - now) / 60000));
            timeLeftStr = `${diffMins}m remaining`;
          } else if (status === "upcoming") {
            const diffHrs = Math.max(0, Math.floor((start - now) / 3600000));
            timeLeftStr = diffHrs < 24 ? `Starts in ${diffHrs}h` : `Starts in ${Math.round(diffHrs / 24)} days`;
          }

          const displayStartTime = start.toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
          });

          const attempted = c.userParticipation ? c.userParticipation.completed : false;

          return {
            id: c.id,
            title: c.title,
            desc: c.description || "No description provided.",
            durationMins,
            totalPoints,
            status,
            category: c.category || "General",
            timeLeftStr,
            startTime: displayStartTime,
            attempted,
            leaderboard: []
          };
        });

        setAllContests(mapped);
      } else {
        setAllContests([]);
      }
    } catch (err) {
      console.error("Failed to fetch contests from backend API:", err);
      setAllContests([]);
    }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissions`);
      const data = await res.json();
      if (data.success && data.submissions) {
        const userMap = {};
        data.submissions.forEach((sub) => {
          if (sub.status === "ACCEPTED" && sub.user) {
            const uId = sub.user.id;
            if (!userMap[uId]) {
              userMap[uId] = {
                name: sub.user.username,
                solvedProblems: new Set(),
                points: 0,
              };
            }
            userMap[uId].solvedProblems.add(sub.problemId);
          }
        });

        const list = Object.values(userMap).map((user) => {
          const solvedCount = user.solvedProblems.size;
          const points = solvedCount * 10;
          let rankClass = "Novice";
          let color = "text-slate-400";
          if (points >= 100) {
            rankClass = "Grandmaster";
            color = "text-rose-500";
          } else if (points >= 50) {
            rankClass = "Master";
            color = "text-slate-500";
          } else if (points >= 30) {
            rankClass = "Diamond";
            color = "text-neutral-500";
          } else if (points >= 10) {
            rankClass = "Gold";
            color = "text-amber-500";
          }
          return {
            name: user.name,
            points: points,
            contests: solvedCount,
            rankClass,
            color,
          };
        });

        // Sort descending by points
        list.sort((a, b) => b.points - a.points);
        // Assign ranks
        const rankedList = list.map((item, idx) => ({
          rank: idx + 1,
          ...item,
        }));

        setLeaderboard(rankedList);
      }
    } catch (err) {
      console.error("Failed to fetch global leaderboard submissions:", err);
    }
    setLeaderboardLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchContests();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      setTimeout(() => {
        fetchLeaderboard();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, API_BASE]);

  const handleRegister = (contestId) => {
    const nextRegs = [...registeredContests, contestId];
    setRegisteredContests(nextRegs);
    localStorage.setItem("contest_registrations", JSON.stringify(nextRegs));
  };

  const handleViewScoreboard = async (contest) => {
    const isNumeric = /^\d+$/.test(contest.id);
    if (isNumeric) {
      try {
        const headersObj = buildAuthHeaders(token, user);
        const res = await fetch(`${API_BASE}/api/contests/${contest.id}/leaderboard`, { headers: headersObj });
        const data = await res.json();
        if (data.success) {
          const formattedLeaderboard = data.leaderboard.map((item, index) => ({
            rank: index + 1,
            username: item.user.username,
            score: item.totalScore,
            time: `${Math.round(item.totalExecutionTime / 1000)}s`
          }));

          const currentUsername = user?.username || "You";

          if (!formattedLeaderboard.some(p => p.username === currentUsername)) {
            const localSolved = localStorage.getItem("contest_solved_data");
            if (localSolved) {
              try {
                const parsed = JSON.parse(localSolved);
                const localData = parsed[contest.id];
                if (localData) {
                  formattedLeaderboard.push({
                    rank: formattedLeaderboard.length + 1,
                    username: currentUsername,
                    score: localData.score,
                    time: localData.time
                  });
                }
              } catch { }
            }
          }

          setPastContestResults({
            ...contest,
            leaderboard: formattedLeaderboard
          });
          return;
        }
      } catch (err) {
        console.error("Failed to load database leaderboard:", err);
      }
    }

    setPastContestResults(contest);
  };

  // Re-derive live timings from timestamps on every tick
  const liveContests = allContests.map(c => {
    const { status, timeLeftStr, durationMins } = computeContestTiming(c);
    return { ...c, status, timeLeftStr, durationMins };
  });

  const filteredContests = liveContests.filter(c => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && c.status === "active") ||
      (activeTab === "upcoming" && c.status === "upcoming") ||
      (activeTab === "past" && c.status === "past");

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Background ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[450px] pointer-events-none z-0" />

      {!user && <Navbar />}

      <main className={`flex-grow relative z-10 ${!user ? 'pt-32 pb-24' : ''}`}>
        <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">

          {/* Main header block */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
                Contest Arena
              </h1>
              <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                Challenge other students, solve system architectures under pressure, and climb the Eduvantix leaderboard in timed hackathons.
              </p>
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

                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-6">Page Locked</h3>

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
                    <span>Unlocks In: {timeLeftStr}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={isGlobalStudent ? "opacity-30 pointer-events-none blur-[1.5px]" : ""}>
              {/* Lobby controls bar */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                {/* Tab links */}
                <div className="flex flex-wrap gap-1 items-center p-1 rounded-full border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  {[
                    { id: "all", label: "Contests" },
                    { id: "active", label: "Active" },
                    { id: "upcoming", label: "Upcoming" },
                    { id: "past", label: "Past Events" },
                    { id: "leaderboard", label: "Leaderboard" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer"
                      style={{
                        color: activeTab === tab.id ? "#ffffff" : "var(--text-secondary)"
                      }}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeContestTab"
                          className="absolute inset-0 rounded-full shadow-sm"
                          style={{ background: "var(--accent-gradient)" }}
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Search filter input */}
                {activeTab !== "leaderboard" && (
                  <div className="relative w-full lg:w-80">
                    <Search size={16} className="absolute left-4 top-3" style={{ color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      placeholder="Search contests..."
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
                )}
              </div>

              {/* Tab contents */}
              <div className="relative">
                {activeTab === "leaderboard" ? (
                  /* Global Leaderboard Table */
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-sm max-w-4xl mx-auto mt-8"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)" }}
                  >
                    <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-primary)" }}>
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Eduvantix Grand Rankings</h3>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Updated after every official weekly speedrun contest.</p>
                      </div>
                      <Trophy size={20} className="text-amber-500" />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="font-bold text-[var(--text-muted)] border-b" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Developer</th>
                            <th className="px-6 py-4 text-center">Score Points</th>
                            <th className="px-6 py-4 text-center">Contests Participated</th>
                            <th className="px-6 py-4 text-right">League Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                          {leaderboardLoading ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                                <RefreshCw size={16} className="animate-spin inline-block mr-2" />
                                Loading grand rankings...
                              </td>
                            </tr>
                          ) : leaderboard.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-6 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                                No rankings calculated yet. Solve problems to show up here!
                              </td>
                            </tr>
                          ) : (
                            leaderboard.map((player) => (
                              <tr key={player.rank} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                <td className="px-6 py-4 font-bold">
                                  {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : `#${player.rank}`}
                                </td>
                                <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                                  {player.name}
                                </td>
                                <td className="px-6 py-4 text-center font-extrabold text-[var(--text-accent)]">
                                  {player.points}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {player.contests}
                                </td>
                                <td className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[10px]">
                                  <span className={player.color}>{player.rankClass}</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : loading ? (
                  /* Loading state */
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <RefreshCw size={28} className="animate-spin" style={{ color: "var(--text-accent)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Loading contests...</p>
                  </div>
                ) : filteredContests.length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Trophy size={48} className="opacity-20" style={{ color: "var(--text-secondary)" }} />
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>No contests found</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {searchQuery ? "Try a different search term." : "No contests are scheduled yet. Check back soon."}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={fetchContests}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-bold cursor-pointer transition-all"
                        style={{ borderColor: "var(--border-accent)", color: "var(--text-accent)" }}
                      >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Contests Card Grid */
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredContests.map((contest, idx) => {
                        const isActive = contest.status === "active";
                        const isUpcoming = contest.status === "upcoming";
                        const isPast = contest.status === "past";
                        const isRegistered = registeredContests.includes(contest.id);

                        return (
                          <motion.div
                            key={contest.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, delay: idx * 0.03 }}
                            className="group relative flex flex-col justify-between rounded-3xl p-6 shadow-sm border border-[var(--border-primary)] overflow-hidden hover:shadow-xl transition-all duration-300"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              borderColor: "var(--border-card)"
                            }}
                          >
                            {/* Status Line */}
                            <div
                              className={`absolute top-0 left-0 right-0 h-[3px]"
                                }`}
                            />

                            {/* Card Top */}
                            <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-primary)] bg-slate-500/5"
                                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                                >
                                  {contest.category}
                                </span>

                                {/* Dynamic Tag Pill */}
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-[var(--border-primary)] ${isActive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                                  isUpcoming ? "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" :
                                    "text-[var(--text-muted)] bg-slate-500/5 border-transparent"
                                  }`}>
                                  {contest.status.toUpperCase()}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-lg font-bold font-display leading-snug group-hover:text-[var(--text-accent)] transition-colors"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {contest.title}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                  {contest.desc}
                                </p>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl border border-[var(--border-primary)] bg-slate-500/5" style={{ borderColor: "var(--border-primary)" }}>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Points</span>
                                  <div className="text-sm font-black text-[var(--text-primary)]">{contest.totalPoints} pts</div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Duration</span>
                                  <div className="text-sm font-black text-[var(--text-primary)]">{contest.durationMins} mins</div>
                                </div>
                              </div>
                            </div>

                            {/* Card Bottom CTA Actions */}
                            <div className="pt-4 mt-6 border-t flex items-center justify-between" style={{ borderColor: "var(--border-primary)" }}>
                              <div className="flex items-center space-x-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                <Clock size={12} className="text-[var(--text-muted)]" />
                                <span>{contest.timeLeftStr}</span>
                              </div>

                              {/* --- Student-only action buttons --- */}
                              {!isStudentLoggedIn ? (
                                // Non-students / guests: show login nudge
                                <Link
                                  href="/login?redirect=/contest"
                                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-primary)] transition-all cursor-pointer flex items-center space-x-1"
                                  style={{
                                    backgroundColor: "var(--bg-primary)",
                                    borderColor: "var(--border-primary)",
                                    color: "var(--text-muted)"
                                  }}
                                >
                                  <Lock size={11} />
                                  <span>Login to Participate</span>
                                </Link>
                              ) : (
                                <>
                                  {isActive && (
                                    contest.attempted ? (
                                      <button
                                        disabled
                                        className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-primary)] flex items-center space-x-1 opacity-60 cursor-not-allowed"
                                        style={{
                                          backgroundColor: "var(--bg-badge)",
                                          borderColor: "var(--border-primary)",
                                          color: "var(--text-secondary)"
                                        }}
                                      >
                                        <span>Attempted</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleEnterArena(contest.id)}
                                        className="px-4 py-2 text-xs font-bold text-[var(--text-on-accent)] rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1"
                                        style={{ background: "var(--accent-gradient)" }}
                                      >
                                        <span>Enter Arena</span>
                                        <ChevronRight size={13} />
                                      </button>
                                    )
                                  )}

                                  {isUpcoming && (
                                    isRegistered ? (
                                      <button
                                        disabled
                                        className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-primary)] flex items-center space-x-1"
                                        style={{
                                          backgroundColor: "var(--bg-badge)",
                                          borderColor: "var(--border-accent)",
                                          color: "var(--text-accent)"
                                        }}
                                      >
                                        <UserCheck size={13} />
                                        <span>Registered</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRegister(contest.id)}
                                        className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-primary)] transition-all cursor-pointer"
                                        style={{
                                          backgroundColor: "var(--bg-primary)",
                                          borderColor: "var(--border-primary)",
                                          color: "var(--text-primary)"
                                        }}
                                      >
                                        Register
                                      </button>
                                    )
                                  )}

                                  {isPast && (
                                    <button
                                      onClick={() => handleViewScoreboard(contest)}
                                      className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--border-primary)] transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: "var(--bg-primary)",
                                        borderColor: "var(--border-primary)",
                                        color: "var(--text-primary)"
                                      }}
                                    >
                                      View Scoreboard
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty fallbacks */}
                    {filteredContests.length === 0 && (
                      <div className="col-span-full py-16 text-center space-y-4">
                        <Terminal size={48} className="mx-auto text-[var(--text-muted)]" />
                        <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No contests match filters.</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Try modifying filters or search query terms.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Past Contest Scoreboard Modal overlay */}
      <AnimatePresence>
        {pastContestResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full rounded-3xl border border-[var(--border-primary)] p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-primary)" }}>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Scoreboard: {pastContestResults.title}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Completed on {pastContestResults.startTime}</p>
                </div>
                {/* <button
                  onClick={() => setPastContestResults(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-500/10 cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <AlertCircle size={18} />
                </button> */}
              </div>

              {/* Ranks list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {pastContestResults.leaderboard.map((item) => (
                  <div
                    key={item.rank}
                    className="flex justify-between items-center p-3 rounded-2xl border"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-primary)"
                    }}
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-bold text-[var(--text-secondary)]">
                        {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">{item.username}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono">
                      <span className="text-[var(--text-muted)]">{item.time}</span>
                      <span className="font-extrabold text-[var(--text-accent)]">{item.score} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setPastContestResults(null)}
                  className="px-5 py-2.5 bg-slate-500/10 hover:bg-slate-500/20 font-bold rounded-full text-xs text-[var(--text-secondary)] cursor-pointer"
                >
                  Close Scoreboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!user && <Footer />}
    </div>
  );
}
