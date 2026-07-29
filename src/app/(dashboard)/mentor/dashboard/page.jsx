"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTimetableStore } from "@/store/useTimetableStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, CheckSquare, Calendar, Star,
  ArrowUpRight, Clock, Award, Activity,
  ChevronRight, BookOpen, Send, CheckCircle,
  FileCode, Sparkles, MessageCircle, Plus, X, List
} from "lucide-react";

export default function MentorDashboard() {
  const router = useRouter();
  const { token, API_BASE } = useAuth();
  const { todayClasses, isLoading: loadingClasses, fetchTodayClasses } = useTimetableStore();

  React.useEffect(() => {
    if (token) {
      fetchTodayClasses('FACULTY', token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
    }
  }, [token, fetchTodayClasses, API_BASE]);
  
  // Interactive Code Review States
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewScore, setReviewScore] = useState(100);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewsList, setReviewsList] = useState([
    { id: "review-1", user: "quantum_coder", problem: "VDOM Reconciliation", lang: "JavaScript", status: "Needs Review", time: "10 mins ago", code: `// Virtual DOM Diff Implementation\nfunction diff(oldNode, newNode) {\n  if (!oldNode) return { type: 'CREATE', newNode };\n  if (!newNode) return { type: 'REMOVE' };\n  if (changed(oldNode, newNode)) {\n    return { type: 'REPLACE', newNode };\n  }\n  if (newNode.type) {\n    return {\n      type: 'UPDATE',\n      children: diffChildren(oldNode, newNode),\n      props: diffProps(oldNode, newNode)\n    };\n  }\n}` },
    { id: "review-2", user: "lex_dev", problem: "Rate Limiter Design", lang: "Go", status: "Needs Review", time: "30 mins ago", code: `package main\n\nimport (\n\t"sync"\n\t"time"\n)\n\ntype TokenBucket struct {\n\tcapacity  int64\n\trate      time.Duration\n\ttokens    int64\n\tlastRefill time.Time\n\tmu        sync.Mutex\n}` },
    { id: "review-3", user: "security_guru", problem: "Merkle Tree Verification", lang: "Rust", status: "Under Review", time: "1 hour ago", code: `pub fn verify_proof(root: &[u8; 32], leaf: &[u8; 32], proof: &Vec<[u8; 32]>, index: usize) -> bool {\n    let mut hash = *leaf;\n    let mut idx = index;\n    for sibling in proof {\n        if idx % 2 == 0 {\n            hash = hash_pair(&hash, sibling);\n        } else {\n            hash = hash_pair(sibling, &hash);\n        }\n        idx /= 2;\n    }\n    hash == *root\n}` },
    { id: "review-4", user: "byte_knight", problem: "Two Sum", lang: "C++", status: "Needs Review", time: "2 hours ago", code: `#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> seen;\n    for(int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if(seen.count(complement)) return {seen[complement], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}` }
  ]);

  // Office hours coordinator slots
  const [officeHours, setOfficeHours] = useState([
    { id: "slot-1", topic: "NextJS React Compiler Features", time: "Tomorrow at 2:00 PM", active: true },
    { id: "slot-2", topic: "System Design: Scaling Key-Value Stores", time: "Friday at 4:30 PM", active: false }
  ]);
  const [newSlotTopic, setNewSlotTopic] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [showAddSlot, setShowAddSlot] = useState(false);

  const [notification, setNotification] = useState(null);

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddOfficeHour = (e) => {
    e.preventDefault();
    if (!newSlotTopic || !newSlotTime) return;
    const newSlot = {
      id: `slot-${Date.now()}`,
      topic: newSlotTopic,
      time: newSlotTime,
      active: false
    };
    setOfficeHours([...officeHours, newSlot]);
    setNewSlotTopic("");
    setNewSlotTime("");
    setShowAddSlot(false);
    triggerNotification("Scheduled new Office Hour slot.");
  };

  const handleSubmitReview = (reviewId) => {
    setReviewsList(reviewsList.map(r => 
      r.id === reviewId ? { ...r, status: "Reviewed" } : r
    ));
    setSelectedReview(null);
    setReviewComment("");
    triggerNotification(`Review submitted successfully. Final score: ${reviewScore} pts.`);
  };

  const stats = [
    { title: "Scholars Guided", value: "45", label: "Active scholars", icon: Users },
    { title: "Reviews Conducted", value: reviewsList.filter(r => r.status === "Reviewed").length, label: `${reviewsList.filter(r => r.status !== "Reviewed").length} pending`, icon: CheckSquare },
    { title: "Office Hours", value: officeHours.length, label: "Scheduled sessions", icon: Calendar },
    { title: "Mentor Rating", value: "4.95", label: "Out of 5.0", icon: Star }
  ];

  const mentoredTracks = [
    { id: "m-1", name: "Web & Mobile Development", activeScholars: 24, progress: 80 },
    { id: "m-2", name: "Creative Tech & Blockchain", activeScholars: 12, progress: 65 },
    { id: "m-3", name: "Data & AI Systems", activeScholars: 9, progress: 40 }
  ];

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      
      {/* ── HEADER / INTRO ────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4 border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
            Instructor Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Welcome back, Mentor.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Review pending code speedruns, coordinate live mentoring office hours, audit course tracks, and check scholar analytics.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={() => router.push("/contest")}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            <Award size={14} /> Manage Contests
          </button>
          <button onClick={() => router.push("/courses")}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-[var(--text-on-accent)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg"
            style={{ background: "var(--accent-primary)" }}>
            Curriculum <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl border border-[var(--border-primary)] shadow-2xl text-xs font-semibold flex items-center gap-3"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          >
            <CheckCircle size={14} style={{ color: "var(--accent-primary)" }} />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KEY METRICS (Asymmetrical Rail) ───────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px border border-[var(--border-primary)] bg-slate-200/20 dark:bg-[var(--bg-hover)]/50 rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-primary)" }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-6 space-y-6 flex flex-col justify-between group transition-colors"
              style={{ backgroundColor: "var(--bg-primary)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--bg-primary)"}>
              <div className="flex justify-between items-start">
                <Icon size={16} className="transition-transform group-hover:scale-110" style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <div className="text-3xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>{stat.title}</div>
                <div className="text-xs mt-3 font-medium" style={{ color: "var(--accent-primary)" }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── MAIN CONTENT (Asymmetrical Grid) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Pending Submissions review queue (Col 8) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
            <h2 className="text-2xl font-serif" style={{ color: "var(--text-primary)" }}>Submission Queue</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Needs Review</span>
            </div>
          </div>

          <div className="border border-[var(--border-primary)] rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Scholar</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Challenge</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>Status</th>
                    <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-right" style={{ color: "var(--text-muted)" }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: "var(--border-primary)" }}>
                  {reviewsList.map((sub) => (
                    <tr key={sub.id} className="transition-colors hover:bg-[var(--bg-secondary)]">
                      <td className="px-5 py-4">
                        <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{sub.user}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub.time}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium" style={{ color: "var(--text-secondary)" }}>{sub.problem}</div>
                        <div className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{sub.lang}</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {sub.status === "Reviewed" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-emerald-600 bg-emerald-500/10">
                            <CheckCircle size={10} /> Reviewed
                          </span>
                        ) : sub.status === "Under Review" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-amber-600 bg-amber-500/10">
                            <Activity size={10} /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md text-rose-600 bg-rose-500/10">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {sub.status !== "Reviewed" ? (
                          <button
                            onClick={() => setSelectedReview(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-primary)] transition-all hover:bg-[var(--bg-secondary)]"
                            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                          >
                            <FileCode size={12} /> Review Code
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Review Overlay / Expansion */}
          <AnimatePresence>
            {selectedReview && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 md:p-8 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-6" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex items-start justify-between pb-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <div>
                      <h3 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>Review Workspace</h3>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Evaluating {selectedReview.user}'s submission for {selectedReview.problem}</p>
                    </div>
                    <button onClick={() => setSelectedReview(null)} className="p-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)] transition-transform hover:rotate-90" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                      <X size={14} />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="px-4 py-2 border-b flex items-center justify-between bg-[var(--bg-card)]/50" style={{ borderColor: "var(--border-primary)" }}>
                      <span className="text-[10px] font-mono text-slate-400">{selectedReview.lang}</span>
                    </div>
                    <div className="p-4 bg-[#0d1117] overflow-x-auto">
                      <pre className="text-xs font-mono text-slate-300 leading-relaxed">{selectedReview.code}</pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        Score Assignment: <span style={{ color: "var(--text-primary)" }}>{reviewScore}</span>
                      </label>
                      <input 
                        type="range" min="0" max="200" step="5"
                        value={reviewScore} onChange={(e) => setReviewScore(Number(e.target.value))}
                        className="w-full h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Suggested: 180-200 for optimal time complexity.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        Feedback Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Leave constructive feedback regarding logic and style..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-xl p-3 text-sm border border-[var(--border-primary)] bg-[var(--bg-primary)] outline-none resize-none transition-colors focus:border-[var(--text-primary)]"
                        style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setSelectedReview(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                      Discard
                    </button>
                    <button onClick={() => handleSubmitReview(selectedReview.id)}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-on-accent)] transition-transform hover:-translate-y-0.5 shadow-md flex items-center gap-2"
                      style={{ background: "var(--accent-primary)" }}>
                      <Send size={12} /> Submit Evaluation
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right column: Mentoring Cohorts & Office Hours Planner (Col 4) */}
        <section className="lg:col-span-4 space-y-10">
          
          {/* Today's Scheduled Classes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <h2 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>
                Today's Scheduled Classes
              </h2>
              <button onClick={() => router.push("/admin/live")}
                className="text-[10px] font-bold uppercase tracking-wider hover:underline"
                style={{ color: "var(--accent-primary)" }}>
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {loadingClasses ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 rounded-full animate-spin border-2 border-t-transparent" style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }} />
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-2xl" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                  <p className="text-xs">No classes scheduled for today.</p>
                </div>
              ) : (
                todayClasses.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl border flex flex-col gap-2 transition-colors hover:border-[var(--accent-primary)] cursor-pointer"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                    onClick={() => router.push("/admin/live")}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{entry.subject?.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-secondary)]" style={{ color: "var(--text-secondary)" }}>
                        {entry.timetable?.batch?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {entry.startTime} - {entry.endTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cohorts Progress */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif pb-2 border-b" style={{ color: "var(--text-primary)", borderColor: "var(--border-primary)" }}>
              Active Cohorts
            </h2>
            <div className="space-y-4">
              {mentoredTracks.map((cohort) => (
                <div key={cohort.id} className="p-5 rounded-2xl border border-[var(--border-primary)] transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>{cohort.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--bg-secondary)]" style={{ color: "var(--text-secondary)" }}>
                        {cohort.activeScholars} Scholars
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                        <span>Completion Rate</span>
                        <span>{cohort.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cohort.progress}%`, backgroundColor: "var(--text-primary)" }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office hours scheduler widget */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <h2 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>Office Hours</h2>
              <button onClick={() => setShowAddSlot(!showAddSlot)}
                className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                {showAddSlot ? <X size={14} /> : <Plus size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {showAddSlot && (
                <motion.form
                  onSubmit={handleAddOfficeHour}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="space-y-4 p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Topic / Agenda</label>
                    <input 
                      type="text" placeholder="e.g. Data Structures Q&A" value={newSlotTopic} onChange={(e) => setNewSlotTopic(e.target.value)} required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] outline-none focus:border-[var(--text-primary)] transition-colors"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Date & Time</label>
                    <input 
                      type="text" placeholder="e.g. Wednesday at 5:00 PM" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] outline-none focus:border-[var(--text-primary)] transition-colors"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <button type="submit"
                    className="w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-all hover:opacity-90"
                    style={{ background: "var(--text-primary)" }}>
                    Schedule Session
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {officeHours.map((slot) => (
                <div key={slot.id} className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-start gap-4 transition-colors hover:border-[var(--text-muted)]"
                  style={{ borderColor: "var(--border-primary)" }}>
                  <div className="p-2 rounded-xl bg-[var(--bg-secondary)] shrink-0 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-tight mb-1" style={{ color: "var(--text-primary)" }}>{slot.topic}</h4>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <Clock size={12} /> {slot.time}
                    </p>
                  </div>
                </div>
              ))}
              {officeHours.length === 0 && (
                <div className="text-center py-6 border border-[var(--border-primary)] border-dashed rounded-2xl" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                  <p className="text-xs">No upcoming sessions scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
