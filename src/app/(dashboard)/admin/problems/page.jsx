"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code, Plus, RefreshCw, Search, Trash2, Eye, Edit3,
  Tag, BarChart2, ArrowUpRight, Filter, X, CheckCircle2,
  Clock, AlertCircle, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders } from "@/utils/api";

function getDifficultyStyle(difficulty) {
  const d = (difficulty || "").toUpperCase();
  if (d === "EASY" || d === "Easy")
    return {
      cls: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      label: "Easy",
    };
  if (d === "HARD" || d === "Hard")
    return {
      cls: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      label: "Hard",
    };
  return {
    cls: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    label: "Medium",
  };
}

export default function AdminProblemsPage() {
  const router = useRouter();
  const { token, API_BASE, user } = useAuth();

  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("institute");

  useEffect(() => {
    if (user) {
      setActiveTab(user.role === "ADMIN" ? "global" : "institute");
    }
  }, [user]);

  const adminHeaders = buildAuthHeaders(token, user);

  const triggerNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    let backendProblems = [];

    try {
      const res = await fetch(`${API_BASE}/api/problems`, {
        headers: adminHeaders,
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (data.success && data.problems) {
        backendProblems = data.problems.map((p) => ({
          ...p,
          isDbProblem: true,
          difficulty: p.difficulty, // Already uppercase from DB
        }));
      }
    } catch (err) {
      console.error("Failed to fetch problems from backend:", err);
      setError("Could not connect to the backend. Showing local/static data.");
    }

    const combinedProblems = backendProblems;

    setAllProblems(combinedProblems);
    setLoading(false);
  }, [API_BASE, token]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const handleDelete = async (problemId, isDbProblem, slug) => {
    if (!isDbProblem) {
      triggerNotification("Static problems cannot be deleted from here.", "error");
      setDeletingId(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/problems/${problemId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAllProblems((prev) =>
          prev.filter((p) => String(p.id) !== String(problemId))
        );
        triggerNotification("Problem deleted successfully.");
      } else {
        triggerNotification(data.message || "Failed to delete problem.", "error");
      }
    } catch (err) {
      triggerNotification("Server error while deleting problem.", "error");
    }
    setDeletingId(null);
  };

  const canDeleteProblem = (problem) => {
    if (!problem.isDbProblem) return false;
    if (user?.role === "ADMIN") return true;
    if (user?.role === "INSTITUTE_ADMIN" || user?.role === "MENTOR") {
      return !problem.instituteId || Number(problem.instituteId) === Number(user?.instituteId);
    }
    return false;
  };

  const tabProblems = allProblems.filter((p) => {
    if (user?.role === "ADMIN") return true;
    const isGlobal = p.instituteId === null || !p.instituteId;
    if (activeTab === "global" && !isGlobal) return false;
    if (activeTab === "institute" && isGlobal) return false;
    return true;
  });

  const filteredProblems = tabProblems.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const d = (p.difficulty || "").toUpperCase();
    const matchesDiff =
      filterDiff === "all" ||
      d === filterDiff.toUpperCase();
    return matchesSearch && matchesDiff;
  });

  const counts = {
    all: tabProblems.length,
    easy: tabProblems.filter(
      (p) => (p.difficulty || "").toUpperCase() === "EASY"
    ).length,
    medium: tabProblems.filter(
      (p) => (p.difficulty || "").toUpperCase() === "MEDIUM"
    ).length,
    hard: tabProblems.filter(
      (p) => (p.difficulty || "").toUpperCase() === "HARD"
    ).length,
  };

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12" style={{ color: "var(--text-primary)" }}>
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Manage Problems
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Review, publish, and manage all coding challenges in the system.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadProblems}
            className="p-2.5 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-violet-500" : "text-[var(--text-secondary)]"} />
          </button>
          {!(activeTab === "global" && user?.role !== "ADMIN") && (
            <button
              onClick={() => router.push("/admin/problems/new")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md"
              style={{ background: "var(--accent-primary)" }}
            >
              <Plus size={14} />
              <span>Create Problem</span>
            </button>
          )}
        </div>
      </section>

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl border border-[var(--border-primary)] text-xs text-center font-bold ${notification.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
        {[
          { key: "all", label: "Total Problems", color: "text-violet-500", bg: "bg-violet-500/10", icon: Code },
          { key: "easy", label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { key: "medium", label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", icon: BarChart2 },
          { key: "hard", label: "Hard", color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertCircle },
        ].map(({ key, label, color, bg, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilterDiff(key)}
            className={`relative p-5 rounded-2xl border border-[var(--border-primary)] text-left transition-all cursor-pointer group ${filterDiff === key
              ? "ring-2 ring-[var(--accent-primary)] border-transparent bg-[var(--bg-secondary)]"
              : "hover:bg-[var(--bg-secondary)] bg-[var(--bg-card)]"
              }`}
            style={{ borderColor: filterDiff === key ? "transparent" : "var(--border-primary)" }}
          >
            <div className="space-y-1">
              <div className="text-2xl font-serif" style={{ color: "var(--text-primary)" }}>
                {counts[key]}
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {label}
              </div>
            </div>
            <div className={`absolute top-5 right-5 p-2.5 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110`}>
              <Icon size={16} />
            </div>
          </button>
        ))}
      </div>

      {/* Scope Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        {user?.role !== "ADMIN" ? (
          <div className="flex gap-2 p-1.5 rounded-2xl w-fit border border-[var(--border-primary)] shrink-0 bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
            <button
              onClick={() => {
                setActiveTab("institute");
                setFilterDiff("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === "institute"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border-primary)] border-transparent"
                }`}
            >
              Your Institute
            </button>
            <button
              onClick={() => {
                setActiveTab("global");
                setFilterDiff("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === "global"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border-primary)] border-transparent"
                }`}
            >
              Global Problems
            </button>
          </div>
        ) : (
          <div /> // Placeholder to keep search on the right
        )}

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-[var(--text-muted)] transition-colors placeholder:text-[var(--text-muted)]"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--bg-primary)] transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[var(--border-primary)] pb-12" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 space-x-2">
            <RefreshCw size={16} className="animate-spin text-violet-500" />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Fetching problems...
            </span>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
              <Code size={24} className="text-violet-500" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No problems found
              </h3>
              <p className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>
                {search ? "Try adjusting your search or filter." : "Create your first problem."}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => router.push("/admin/problems/new")}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[var(--border-primary)] text-xs font-semibold transition-colors cursor-pointer hover:bg-[var(--bg-secondary)] mt-2"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                <Plus size={14} />
                <span>Create Problem</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto min-w-0">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-[var(--bg-secondary)] text-xs font-semibold uppercase tracking-wider select-none" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Test Cases</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium" style={{ divideColor: "var(--border-primary)" }}>
                <AnimatePresence>
                  {filteredProblems.map((problem, idx) => {
                    const { cls, label } = getDifficultyStyle(problem.difficulty);
                    return (
                      <motion.tr
                        key={problem.id ?? problem.slug ?? idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-[var(--bg-secondary)] transition-colors group"
                      >
                        <td className="px-6 py-4 text-xs tabular-nums text-[var(--text-muted)]">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-[var(--text-primary)] max-w-[220px] truncate">
                              {problem.title}
                            </p>
                            {problem.isStatic && (
                              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                Static — not in DB
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs px-2 py-1 rounded-md bg-[var(--bg-secondary)] border"
                            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                            {problem.slug || problem.id || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-[var(--border-primary)] ${cls}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                          {problem.category || "Algorithms"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {problem.testCasesCount ?? problem.testCases?.length ?? problem.tests?.length ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => router.push(`/practice/${problem.slug || problem.id}`)}
                              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                              title="View Problem"
                            >
                              <Eye size={16} />
                            </button>
                            {canDeleteProblem(problem) && (
                              <>
                                <button
                                  onClick={() => router.push(`/admin/problems/${problem.id}/edit`)}
                                  className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  title="Edit Problem"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeletingId({ id: problem.id, slug: problem.slug, isDb: true })}
                                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Delete Problem"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="p-8 rounded-3xl border border-[var(--border-primary)] shadow-2xl max-w-sm w-full space-y-6 text-center"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div className="space-y-2">
                <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-500 mx-auto mb-2">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>
                  Delete Problem?
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  This will permanently delete this problem and all associated test cases and submissions. This cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm font-semibold transition-colors cursor-pointer hover:bg-[var(--bg-secondary)]"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingId.id, deletingId.isDb, deletingId.slug)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-transform hover:-translate-y-0.5 cursor-pointer bg-rose-600 hover:bg-rose-700 shadow-md"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
