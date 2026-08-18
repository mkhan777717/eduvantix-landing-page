
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Clock, Users, Terminal, Plus, 
  ArrowUpRight, Activity, Calendar, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/utils/socket";

// Helper: time-ago formatter
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { token, API_BASE, user } = useAuth();
  
  // Dashboard Live Stats
  const [totalContestsCount, setTotalContestsCount] = useState(0);
  const [activeContestsCount, setActiveContestsCount] = useState(0);
  const [allContests, setAllContests] = useState([]);
  const [liveSubmissions, setLiveSubmissions] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [participationReports, setParticipationReports] = useState([]);
  const [activeLeftTab, setActiveLeftTab] = useState("submissions");
  const [selectedSurveyReport, setSelectedSurveyReport] = useState(null);
  


  const loadData = async () => {
    let merged = [];
    const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
    const headers = {
      "Content-Type": "application/json",
      ...(hasRealToken
        ? { Authorization: `Bearer ${token}` }
        : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
    };

    // 1. Fetch contests from backend API
    try {
      const res = await fetch(`${API_BASE}/api/contests`, { headers, signal: AbortSignal.timeout(30000) });
      const data = await res.json();
      if (data.success && data.contests) {
        const now = new Date();
        merged = data.contests.map(c => {
          const start = new Date(c.startTime);
          const end = new Date(c.endTime);
          let status = "upcoming";
          if (now >= start && now <= end) status = "active";
          else if (now > end) status = "past";
          const durationMins = Math.round((end - start) / 60000);
          let timeLeftStr = "Completed";
          if (status === "active") {
            const diffMins = Math.max(0, Math.floor((end - now) / 60000));
            timeLeftStr = `${diffMins}m remaining`;
          } else if (status === "upcoming") {
            const diffHrs = Math.max(0, Math.floor((new Date(c.startTime) - now) / 3600000));
            timeLeftStr = diffHrs < 24 ? `Starts in ${diffHrs}h` : `Starts in ${Math.round(diffHrs / 24)}d`;
          }
          return {
            id: c.id,
            title: c.title,
            desc: c.description || "No description.",
            category: c.category || "General",
            status,
            durationMins,
            timeLeftStr,
            isDbContest: true
          };
        });
      }
    } catch (err) {
      console.error("Failed to fetch backend contests:", err);
    }
    setAllContests(merged);
    setTotalContestsCount(merged.length);
    setActiveContestsCount(merged.filter(c => c.status === "active").length);

    // 2. Fetch live system stats from backend API
    try {
      const res = await fetch(`${API_BASE}/api/auth/stats`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setSystemStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin stats from backend:", err);
    }

    // 3. Fetch recent submissions from backend API
    try {
      const res = await fetch(`${API_BASE}/api/submissions`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.submissions) {
          setLiveSubmissions(data.submissions);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live submissions:", err);
    }

    // 4. Fetch participation reports from backend API
    try {
      const res = await fetch(`${API_BASE}/api/contests/reports/participations`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.participations) {
          setParticipationReports(data.participations);
        }
      }
    } catch (err) {
      console.error("Failed to fetch participation reports:", err);
    }
  };

  useEffect(() => {
    loadData();

    // Connect to WebSocket server for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on("newLiveSubmission", (submission) => {
        setLiveSubmissions((prev) => {
          if (prev.some((s) => s.id === submission.id)) return prev;
          return [submission, ...prev].slice(0, 50);
        });

        setSystemStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalSubmissions: (prev.totalSubmissions || 0) + 1,
            verdicts: {
              ...prev.verdicts,
              AC: submission.status === "ACCEPTED" ? (prev.verdicts?.AC || 0) + 1 : (prev.verdicts?.AC || 0),
              WA: submission.status === "WRONG_ANSWER" ? (prev.verdicts?.WA || 0) + 1 : (prev.verdicts?.WA || 0),
              TLE: submission.status === "TIME_LIMIT_EXCEEDED" ? (prev.verdicts?.TLE || 0) + 1 : (prev.verdicts?.TLE || 0),
              RE: submission.status === "RUNTIME_ERROR" ? (prev.verdicts?.RE || 0) + 1 : (prev.verdicts?.RE || 0),
              CE: submission.status === "COMPILATION_ERROR" ? (prev.verdicts?.CE || 0) + 1 : (prev.verdicts?.CE || 0),
            }
          };
        });
      });

      socket.on("newParticipationReport", (report) => {
        setParticipationReports((prev) => {
          const filtered = prev.filter(
            (r) => !(String(r.userId) === String(report.userId) && String(r.contestId) === String(report.contestId))
          );
          return [report, ...filtered];
        });
      });

      return () => {
        socket.off("newLiveSubmission");
        socket.off("newParticipationReport");
      };
    }

    // Refresh stats every 10 seconds
    const syncInterval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [API_BASE, token]);



  // Base dynamic stats calculations
  const registeredUsersCount = systemStats?.totalUsers || 0;

  const submissionsCount = systemStats?.totalSubmissions || 0;

  const stats = [
    {
      title: "Total Contests",
      value: totalContestsCount,
      change: "Active in Registry",
      icon: Trophy,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Active Contests",
      value: activeContestsCount,
      change: activeContestsCount > 0 ? `${activeContestsCount} active session(s)` : "No active contests",
      icon: Activity,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Registered Users",
      value: registeredUsersCount.toLocaleString(),
      change: "Database users",
      icon: Users,
      color: "text-neutral-400",
      bgColor: "bg-neutral-500/10"
    },
    {
      title: "Submissions Queue",
      value: submissionsCount.toLocaleString(),
      change: "Database submissions",
      icon: Terminal,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10"
    }
  ];

  // Map API submissions list
  const getSubmissionsFeed = () => {
    if (liveSubmissions && liveSubmissions.length > 0) {
      return liveSubmissions.slice(0, 5).map(sub => {
        let verdict = "AC";
        if (sub.status === "WRONG_ANSWER") verdict = "WA";
        else if (sub.status === "TIME_LIMIT_EXCEEDED") verdict = "TLE";
        else if (sub.status === "RUNTIME_ERROR") verdict = "RE";
        else if (sub.status === "COMPILATION_ERROR") verdict = "CE";

        return {
          id: String(sub.id),
          user: sub.user?.username || "scholar",
          problem: sub.problem?.title || `Problem #${sub.problemId}`,
          lang: sub.language || "Unknown",
          verdict: verdict,
          score: sub.status === "ACCEPTED" ? 100 : (sub.status === "TIME_LIMIT_EXCEEDED" ? 40 : 0),
          time: timeAgo(sub.createdAt)
        };
      });
    }

    return [];
  };

  const submissionsFeed = getSubmissionsFeed();

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            Welcome back, {user?.username || "Administrator"}
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Manage the competitive programming workspace, verify active web streams, audit problem schemas, and publish synchronized contest events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => router.push("/admin/daily-challenges")}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer text-amber-500 shadow-sm"
          >
            <span>Daily Challenges</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => router.push("/contest")}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] flex items-center space-x-1.5 cursor-pointer"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          >
            <span>View Contest Arena</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-5 rounded-2xl border flex flex-col justify-between space-y-4 group transition-all hover:shadow-md"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)"
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {stat.title}
                </span>
                <div className="p-2 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                  <IconComponent size={16} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  {stat.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Split details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Live Submissions Feed & Participation Reports Switcher */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
              <button
                onClick={() => setActiveLeftTab("submissions")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeLeftTab === "submissions" ? "var(--accent-primary)" : "transparent",
                  color: activeLeftTab === "submissions" ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                <span>Live Submissions Feed</span>
              </button>
              <button
                onClick={() => setActiveLeftTab("reports")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeLeftTab === "reports" ? "var(--accent-primary)" : "transparent",
                  color: activeLeftTab === "reports" ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                <span>Contest Participation Reports</span>
              </button>
            </div>
            {activeLeftTab === "submissions" && (
              <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Real-time</span>
              </span>
            )}
          </div>

          <div className="border rounded-2xl overflow-hidden shadow-xs" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            {activeLeftTab === "submissions" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b" style={{ borderColor: "var(--border-primary)" }}>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Developer</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Problem</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Lang</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Verdict</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Points</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-muted)" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                    {submissionsFeed.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                          No recent submissions.
                        </td>
                      </tr>
                    ) : submissionsFeed.map((sub, idx) => (
                      <tr key={sub.id ? `sub-${sub.id}-${idx}` : `sub-${idx}`} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                          {sub.user}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-xs">
                          {sub.problem}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[10px]">
                          {sub.lang}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            sub.verdict === "AC" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                            sub.verdict === "TLE" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                            "text-rose-500 bg-rose-500/10 border-rose-500/20"
                          }`}>
                            {sub.verdict}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center font-bold text-xs" style={{ color: sub.score > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {sub.score}
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                          {sub.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b" style={{ borderColor: "var(--border-primary)" }}>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Student</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Contest</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Status</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Score</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Time Spent</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Survey</th>
                      <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-muted)" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                    {participationReports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                          No participation reports found.
                        </td>
                      </tr>
                    ) : (
                      participationReports.map((report, idx) => (
                        <tr key={report.id ? `report-${report.id}-${idx}` : `report-${idx}`} className="hover:bg-[var(--bg-secondary)] transition-colors">
                          <td className="px-6 py-3.5 font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                            {report.user?.username || "N/A"}
                          </td>
                          <td className="px-6 py-3.5 font-medium text-xs">
                            {report.contest?.title || `Contest #${report.contestId}`}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              report.completed ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                            }`}>
                              {report.completed ? "Completed" : "In Progress"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                            {report.score ?? 0} pts
                          </td>
                          <td className="px-6 py-3.5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                            {report.timeSpent || "—"}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            {report.employmentStatus ? (
                              <button
                                onClick={() => setSelectedSurveyReport(report)}
                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Contest status list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center h-[42px] border-b pb-2" style={{ borderColor: "var(--border-primary)" }}>
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
              Contest Timeline
            </h2>
            <Calendar size={16} style={{ color: "var(--text-muted)" }} />
          </div>

          <div className="space-y-3">
            {allContests.slice(0, 4).map((contest, idx) => {
              const isActive = contest.status === "active";
              const isUpcoming = contest.status === "upcoming";
              const isDbContest = contest.isDbContest || /^\d+$/.test(String(contest.id));
              return (
                <div
                  key={contest.id ? `contest-${contest.id}-${idx}` : `contest-${idx}`}
                  className="p-4 rounded-2xl border space-y-3 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)"
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
                        {contest.title}
                      </h3>
                      <p className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                        {contest.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                    >
                      {contest.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-primary)] ${
                      isActive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                      isUpcoming ? "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" :
                      "text-[var(--text-muted)] bg-[var(--bg-secondary)] border-transparent"
                    }`}>
                      {contest.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex items-center space-x-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock size={12} />
                      <span>{contest.durationMins} mins</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{contest.timeLeftStr || contest.startTime}</span>
                      {isDbContest && (
                        <button
                          onClick={() => router.push(`/admin/contests/${contest.id}`)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-semibold transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
                          style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                        >
                          <Users size={12} />
                          <span>Participants</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {allContests.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed text-center space-y-2"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                <Calendar size={28} className="text-[var(--text-muted)] opacity-40 mb-1" />
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>No contests available</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Schedule a new contest to view timeline events.</p>
                <button
                  onClick={() => router.push("/admin/contests/new")}
                  className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-all"
                  style={{ background: "var(--accent-primary)" }}
                >
                  + Create Contest
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contest Survey Detail Modal Popup */}
        <AnimatePresence>
          {selectedSurveyReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="max-w-md w-full rounded-2xl border border-[var(--border-primary)] p-6 md:p-8 space-y-6"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>Survey Report</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      User: {selectedSurveyReport.user?.username} ({selectedSurveyReport.user?.email})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSurveyReport(null)}
                    className="p-2 rounded-full border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer outline-none focus:outline-none"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>Employment Status</div>
                    <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] font-medium text-[var(--text-primary)]" style={{ borderColor: "var(--border-primary)" }}>
                      {selectedSurveyReport.employmentStatus}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>College / Institution</div>
                    <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] font-medium text-[var(--text-primary)]" style={{ borderColor: "var(--border-primary)" }}>
                      {selectedSurveyReport.collegeName || "(Not specified)"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>Target Companies</div>
                    <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] font-medium text-[var(--text-primary)]" style={{ borderColor: "var(--border-primary)" }}>
                      {selectedSurveyReport.companies || "(Not specified)"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>Current Interview Stage</div>
                    <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] font-medium text-[var(--text-primary)]" style={{ borderColor: "var(--border-primary)" }}>
                      {selectedSurveyReport.interviewStage || "(Not specified)"}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <button
                    onClick={() => setSelectedSurveyReport(null)}
                    className="w-full py-3 text-xs font-semibold text-[var(--bg-primary)] rounded-xl shadow-md cursor-pointer outline-none focus:outline-none transition-transform hover:-translate-y-0.5"
                    style={{ background: "var(--text-primary)" }}
                  >
                    Close Report
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
