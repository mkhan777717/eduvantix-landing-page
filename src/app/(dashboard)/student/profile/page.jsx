"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

import VerifiedBadge from "@/components/VerifiedBadge";
import { Activity, Award, Zap, User, X, Save, RefreshCw, CheckCircle2, Crown, Clock, CalendarDays, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.4 5.4 0 0 0-1.5-3.8 5.3 5.3 0 0 0-.1-3.8s-1.3-.4-4 1.5a13.3 13.3 0 0 0-7 0C6.2 2.7 4.9 3.1 4.9 3.1a5.3 5.3 0 0 0-.1 3.8A5.4 5.4 0 0 0 3 10.7c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);
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

// Activity Heatmap Component
const Heatmap = ({ data, totalActiveDays, maxStreak }) => {
  const weeks = 52;
  const days = 7;
  const today = new Date();
  
  // Calculate start date (52 weeks ago)
  let startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * days) + 1);

  // Group by month
  const monthsData = [];
  let currentMonth = -1;
  let currentMonthObj = null;
  let currentWeek = null;

  let currentDate = new Date(startDate);
  
  for (let i = 0; i < weeks * days; i++) {
    const month = currentDate.getMonth();
    const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
    
    // If we've hit a new month, push the old month and start a new one
    if (month !== currentMonth) {
      if (currentMonthObj) {
        if (currentWeek && currentWeek.length > 0) {
          // pad the rest of the week with nulls and push
          while (currentWeek.length < 7) currentWeek.push(null);
          currentMonthObj.weeks.push(currentWeek);
        }
        monthsData.push(currentMonthObj);
      }
      currentMonth = month;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      currentMonthObj = {
        name: monthNames[month],
        weeks: []
      };
      
      // Start a new week with null padding up to the dayOfWeek
      currentWeek = Array(dayOfWeek).fill(null);
    }
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const count = data?.[dateStr] || 0;
    
    currentWeek.push({ date: dateStr, count });
    
    if (currentWeek.length === 7) {
      currentMonthObj.weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Push the last month
  if (currentMonthObj) {
    if (currentWeek && currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      currentMonthObj.weeks.push(currentWeek);
    }
    monthsData.push(currentMonthObj);
  }

  const getColor = (count) => {
    if (count === 0) return "rgba(128, 128, 128, 0.15)";
    if (count < 2) return "rgba(16, 185, 129, 0.3)";
    if (count < 4) return "rgba(16, 185, 129, 0.6)";
    if (count < 6) return "rgba(16, 185, 129, 0.8)";
    return "rgba(16, 185, 129, 1)";
  };

  return (
    <div className="p-8 rounded-2xl border border-[var(--border-primary)] flex flex-col gap-8 relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Activity Heatmap</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{totalActiveDays} submissions in the past year</p>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span>
            <span>Total: {totalActiveDays}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-sm animate-pulse"></span>
            <span>Max Streak: {maxStreak}</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 min-w-max pt-1 relative">
          {/* Left edge Weekday Labels */}
          <div className="sticky left-0 z-20 flex flex-col gap-[3px] text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] pr-2" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="h-3.5" />
            <div className="h-3.5 flex items-center">Mon</div>
            <div className="h-3.5" />
            <div className="h-3.5 flex items-center">Wed</div>
            <div className="h-3.5" />
            <div className="h-3.5 flex items-center">Fri</div>
            <div className="h-3.5" />
          </div>

          {/* Month Blocks */}
          <div className="flex gap-4">
            {monthsData.map((month, mIdx) => (
              <div key={mIdx} className="flex flex-col gap-2">
                <div className="flex gap-[3px]">
                  {month.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day, dIdx) => (
                        day ? (
                          <div 
                            key={dIdx} 
                            className="w-3.5 h-3.5 rounded-[2px] transition-all hover:ring-2 hover:ring-white/50 cursor-crosshair"
                            style={{ backgroundColor: getColor(day.count) }}
                            title={`${day.count} submissions on ${day.date}`}
                          />
                        ) : (
                          <div key={dIdx} className="w-3.5 h-3.5" />
                        )
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] text-center">
                  {month.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          <span>Learn</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(128, 128, 128, 0.15)" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(16, 185, 129, 0.3)" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(16, 185, 129, 0.6)" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(16, 185, 129, 0.8)" }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: "rgba(16, 185, 129, 1)" }} />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentProfile() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [recentSubs, setRecentSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [editForm, setEditForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    avatarUrl: "",
    githubUrl: "",
    twitterUrl: "",
    linkedinUrl: ""
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");


  const AVATARS = [
    { id: "1", url: "/images/avatar%201.png", label: "Avatar 1" },
    { id: "2", url: "/images/avatar%202.png", label: "Avatar 2" },
    { id: "3", url: "/images/avatar%203.png", label: "Avatar 3" },
    { id: "4", url: "/images/avatar%204.png", label: "Avatar 4" },
    { id: "5", url: "/images/avatar%205.png", label: "Avatar 5" },
    { id: "6", url: "/images/avatar%206.png", label: "Avatar 6" }
  ];
  const DEFAULT_AVATAR = AVATARS[0].url;

  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        username: user.username || "",
        fullName: user.fullName || "",
        email: user.email || "",
        password: "",
        avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
        githubUrl: user.githubUrl || "",
        twitterUrl: user.twitterUrl || "",
        linkedinUrl: user.linkedinUrl || ""
      });
    }
  }, [user, isEditing]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        username: editForm.username,
        fullName: editForm.fullName,
        email: editForm.email,
        avatarUrl: editForm.avatarUrl,
        githubUrl: editForm.githubUrl,
        twitterUrl: editForm.twitterUrl,
        linkedinUrl: editForm.linkedinUrl
      };
      
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSaveSuccess("Profile updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          window.location.reload();
        }, 1500);
      } else {
        const msg = data.message || "";
        if (msg.length > 150 || msg.toLowerCase().includes("unknown argument") || msg.toLowerCase().includes("prisma")) {
          setSaveError("Profile update failed. The database schema may need updating — please contact support.");
        } else {
          setSaveError(msg || "Failed to update profile.");
        }
      }
    } catch (err) {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user.role === "ADMIN" ? "ADMIN" : "USER" }),
      };

      try {
        const statsRes = await fetch(`${API_BASE}/api/auth/student/stats`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success) setStats(data.stats);
        }

        const subsRes = await fetch(`${API_BASE}/api/submissions?userId=${user.id}`, { headers });
        if (subsRes.ok) {
          const data = await subsRes.json();
          if (data.success) {
            setRecentSubs((data.submissions || []).slice(0, 15));
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile stats:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, token, API_BASE]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center space-x-3 text-[var(--text-muted)]">
        <Activity size={20} className="animate-spin" />
        <span className="text-sm font-bold tracking-wider uppercase">Loading Profile...</span>
      </div>
    );
  }

  // Use safe defaults if stats failed to load
  const totalProblems = stats?.totalProblems || { easy: 0, medium: 0, hard: 0 };
  const solvedProblems = stats?.solvedProblems || { easy: 0, medium: 0, hard: 0 };
  const languages = stats?.languages || [];
  const heatmap = stats?.heatmap || {};
  const streaks = stats?.streaks || { current: 0, max: 0, totalActiveDays: 0 };
  
  const easyPct = totalProblems.easy ? (solvedProblems.easy / totalProblems.easy) * 100 : 0;
  const mediumPct = totalProblems.medium ? (solvedProblems.medium / totalProblems.medium) * 100 : 0;
  const hardPct = totalProblems.hard ? (solvedProblems.hard / totalProblems.hard) * 100 : 0;
  
  const totalSolved = solvedProblems.easy + solvedProblems.medium + solvedProblems.hard;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <section className="flex flex-col gap-2 border-b pb-6 shrink-0" style={{ borderColor: "var(--border-primary)" }}>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
          <User size={12} className="text-violet-500" />
          Scholar Profile
        </div>
        <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>Student Profile</h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Manage your account and view your learning statistics.
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: User Card */}
        <div className="w-full lg:w-1/3 space-y-8">
          {/* Main User Card */}
          <div className="p-8 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="flex items-center gap-5 mb-8">
              {user?.avatarUrl ? (
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl transform -rotate-3 border-4 border-[var(--border-primary)]">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl transform -rotate-3 border-4 border-[var(--border-primary)]">
                  <img src={DEFAULT_AVATAR} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  {user?.fullName || user?.username}
                  {user?.isVerified && <VerifiedBadge tier={user.verifiedBadgeTier} />}
                </h2>
                <p className="text-[11px] font-bold tracking-widest mt-1" style={{ color: "var(--text-muted)" }}>@{user?.username}</p>
                <div className="flex items-center gap-3 mt-4">
                  {user?.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all transform hover:-translate-y-1 shadow-sm">
                      <GithubIcon size={16} />
                    </a>
                  )}
                  {user?.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all transform hover:-translate-y-1 shadow-sm">
                      <LinkedinIcon size={16} />
                    </a>
                  )}
                  {user?.twitterUrl && (
                    <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all transform hover:-translate-y-1 shadow-sm">
                      <TwitterIcon size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[var(--text-primary)] text-[var(--bg-primary)] hover:-translate-y-0.5 transition-transform"
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Subscription Plan */}
          <div className="p-6 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            {(() => {
              const now = new Date();
              const premiumUntil = user?.premiumUntil ? new Date(user.premiumUntil) : null;
              const isPremium = premiumUntil && premiumUntil > now;
              let daysLeft = 0;
              let hoursLeft = 0;
              if (isPremium) {
                const diffTime = premiumUntil - now;
                daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                hoursLeft = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
              }

              return (
                <>
                  {isPremium && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -z-10 blur-2xl" />
                  )}
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: "var(--text-secondary)" }}>Subscription Plan</h2>
                  
                  {isPremium ? (
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20">
                          <Crown size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-amber-500 tracking-tight">Premium Member</h3>
                          <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mt-0.5">Active Subscription</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-[var(--border-primary)] space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <Clock size={14} />
                            <span>Premium Time Left</span>
                          </div>
                          <span className="text-amber-500 font-black font-serif-display text-base">{daysLeft}d {hoursLeft}h</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <CalendarDays size={14} />
                            <span>Valid Until</span>
                          </div>
                          <span className="text-[var(--text-primary)] font-bold">{premiumUntil.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-[var(--text-primary)] tracking-tight">Free Tier</h3>
                          <p className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase mt-0.5">Basic Access</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-[var(--border-primary)]">
                         <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <CalendarDays size={14} />
                            <span>Joined On</span>
                          </div>
                          <span className="text-[var(--text-primary)] font-bold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <button className="w-full mt-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          
          {/* Community Stats */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: "var(--text-secondary)" }}>Community Stats</h2>
            <div className="space-y-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)] border" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-3">
                  <Award size={16} className="text-amber-500" />
                  <span>Views</span>
                </div>
                <span className="font-serif-display font-black text-lg text-amber-500">0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)] border" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-emerald-500" />
                  <span>Reputation</span>
                </div>
                <span className="font-serif-display font-black text-lg text-emerald-500">0</span>
              </div>
            </div>
          </div>
          
          {/* Languages */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: "var(--text-secondary)" }}>Languages</h2>
            <div className="space-y-3">
              {languages.length > 0 ? languages.map(lang => (
                <div key={lang.language} className="flex items-center justify-between text-xs font-semibold p-2 border-b last:border-0" style={{ borderColor: "var(--border-primary)" }}>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>{lang.language}</span>
                  <span className="text-[var(--text-secondary)]">
                    <span className="font-black text-[var(--text-primary)]">{lang.problemsSolved}</span> problems
                  </span>
                </div>
              )) : (
                <p className="text-xs text-[var(--text-muted)] italic">No languages used yet.</p>
              )}
            </div>
          </div>

          {/* Referrals Section */}
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-secondary)" }}>Your Referrals</h2>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {user?.referredUsers?.length || 0} TOTAL
              </span>
            </div>
            
            <div className="space-y-3">
              {user?.referredUsers && user.referredUsers.length > 0 ? (
                user.referredUsers.map(ru => (
                  <div key={ru.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-hover)] border transition-colors hover:border-[var(--accent-primary)]" style={{ borderColor: "var(--border-primary)" }}>
                    {ru.avatarUrl ? (
                      <img src={ru.avatarUrl} alt={ru.username} className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-primary)]" />
                    ) : (
                       <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border-2 border-[var(--border-primary)] shadow-sm">
                         <User size={16} className="text-[var(--text-muted)]" />
                       </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{ru.fullName || ru.username}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Joined {new Date(ru.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 px-4 space-y-2 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">You haven't referred anyone yet.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">Share your code to earn premium!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Solved Problems Ring */}
            <div className="p-8 rounded-2xl border border-[var(--border-primary)] flex items-center justify-between" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="var(--bg-secondary)" strokeWidth="4" fill="transparent" />
                  
                  <circle cx="64" cy="64" r="44" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="4" fill="transparent" />
                  <circle cx="64" cy="64" r="44" stroke="#f43f5e" strokeWidth="4" fill="transparent" strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * hardPct) / 100} strokeLinecap="square" />
                  
                  <circle cx="64" cy="64" r="51" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="4" fill="transparent" />
                  <circle cx="64" cy="64" r="51" stroke="#f59e0b" strokeWidth="4" fill="transparent" strokeDasharray="320.44" strokeDashoffset={320.44 - (320.44 * mediumPct) / 100} strokeLinecap="square" />
                  
                  <circle cx="64" cy="64" r="58" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="4" fill="transparent" />
                  <circle cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray="364.42" strokeDashoffset={364.42 - (364.42 * easyPct) / 100} strokeLinecap="square" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-serif-display text-[var(--text-primary)] leading-none">{totalSolved}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-1">Solved</span>
                </div>
              </div>
              <div className="flex-1 ml-8 space-y-4 text-xs font-semibold">
                <div className="flex flex-col gap-1 text-emerald-500">
                  <div className="flex justify-between uppercase tracking-widest text-[9px]"><span>Easy</span><span>{totalProblems.easy} total</span></div>
                  <div className="w-full bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${easyPct}%` }} />
                  </div>
                  <div className="font-black text-right">{solvedProblems.easy}</div>
                </div>
                <div className="flex flex-col gap-1 text-amber-500">
                  <div className="flex justify-between uppercase tracking-widest text-[9px]"><span>Medium</span><span>{totalProblems.medium} total</span></div>
                  <div className="w-full bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${mediumPct}%` }} />
                  </div>
                  <div className="font-black text-right">{solvedProblems.medium}</div>
                </div>
                <div className="flex flex-col gap-1 text-rose-500">
                  <div className="flex justify-between uppercase tracking-widest text-[9px]"><span>Hard</span><span>{totalProblems.hard} total</span></div>
                  <div className="w-full bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${hardPct}%` }} />
                  </div>
                  <div className="font-black text-right">{solvedProblems.hard}</div>
                </div>
              </div>
            </div>
            
            {/* Badges Box */}
            <div className="p-8 rounded-2xl border border-[var(--border-primary)] flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                <Award size={32} />
              </div>
              <div>
                <h2 className="text-lg font-black font-serif-display" style={{ color: "var(--text-primary)" }}>Badges</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[200px]">0 Earned. Compete in arenas to unlock exclusive badges.</p>
              </div>
            </div>
          </div>
          
          {/* Heatmap Section */}
          <Heatmap data={heatmap} totalActiveDays={streaks.totalActiveDays} maxStreak={streaks.max} />
          
          {/* Recent Submissions */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] pb-2 border-b" style={{ color: "var(--text-secondary)", borderColor: "var(--border-primary)" }}>
              Recent Submissions
            </h2>
            
            {recentSubs.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {recentSubs.map((sub, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group" style={{ borderColor: "var(--border-primary)" }} onClick={() => router.push(`/practice/${sub.problem?.slug || sub.problemId}`)}>
                    <div className="space-y-1">
                      <p className="text-sm font-bold group-hover:underline" style={{ color: "var(--text-primary)" }}>
                        {sub.problem?.title || `Problem #${sub.problemId}`}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        {timeAgo(sub.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${sub.status === 'ACCEPTED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {sub.status === 'ACCEPTED' ? 'Accepted' : 'Failed'}
                      </span>
                      <span className="px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest" style={{ borderColor: "var(--border-primary)" }}>
                        {sub.language}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-[var(--border-primary)] rounded-xl text-center" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">No recent submissions found.</p>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Edit Profile Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl border"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X size={18} style={{ color: "var(--text-secondary)" }} />
              </button>

              <h2 className="text-2xl font-serif mb-1" style={{ color: "var(--text-primary)" }}>Edit Profile</h2>
              <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Update your personal details and avatar.</p>

              {saveError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {saveSuccess}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                {/* Avatar Picker */}
                <div className="py-2 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: "var(--text-muted)" }}>Pick your character</p>
                  
                  {/* Selected avatar preview */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] shadow-xl" style={{ borderColor: "var(--accent-primary)" }}>
                      <img
                        src={editForm.avatarUrl || DEFAULT_AVATAR}
                        alt="Selected Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Avatar grid */}
                  <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                    {AVATARS.map((av) => {
                      const isSelected = editForm.avatarUrl === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, avatarUrl: av.url })}
                          className="relative flex flex-col items-center transition-all duration-200"
                          title={av.label}
                        >
                          <div
                            className="w-16 h-16 rounded-full overflow-hidden transition-transform"
                            style={{
                              border: `3px solid ${isSelected ? "var(--accent-primary)" : "transparent"}`,
                              boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.15)",
                              transform: isSelected ? "scale(1.1)" : "scale(1)"
                            }}
                          >
                            <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>Username</label>
                    <input 
                      type="text" 
                      value={editForm.username} 
                      onChange={e => setEditForm({...editForm, username: e.target.value})}
                      required
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.fullName} 
                      onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>GitHub Profile <span className="opacity-60 normal-case">(optional)</span></label>
                    <input 
                      type="url" 
                      value={editForm.githubUrl} 
                      onChange={e => setEditForm({...editForm, githubUrl: e.target.value})}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>LinkedIn Profile <span className="opacity-60 normal-case">(optional)</span></label>
                    <input 
                      type="url" 
                      value={editForm.linkedinUrl} 
                      onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>Twitter/X Profile <span className="opacity-60 normal-case">(optional)</span></label>
                    <input 
                      type="url" 
                      value={editForm.twitterUrl} 
                      onChange={e => setEditForm({...editForm, twitterUrl: e.target.value})}
                      placeholder="https://twitter.com/username"
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--text-secondary)" }}>New Password <span className="opacity-60 normal-case">(optional)</span></label>
                    <input 
                      type="password" 
                      value={editForm.password} 
                      onChange={e => setEditForm({...editForm, password: e.target.value})}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all bg-[var(--bg-card)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl text-xs font-bold shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-on-accent)" }}
                  >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
