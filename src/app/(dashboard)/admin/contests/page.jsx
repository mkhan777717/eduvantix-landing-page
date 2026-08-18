"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Plus, RefreshCw, Search, Trash2, Users,
  Clock, Calendar, ChevronRight, CheckCircle2, AlertCircle,
  ArrowUpRight, Edit3, Filter, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders } from "@/utils/api";

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

function getContestStatus(c) {
  const now = new Date();
  const start = new Date(c.startTime);
  const end = new Date(c.endTime);
  if (now >= start && now <= end) return "active";
  if (now > end) return "past";
  return "upcoming";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminContestsPage() {
  const router = useRouter();
  const { token, API_BASE, user } = useAuth();

  const [allContests, setAllContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | upcoming | past
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const adminHeaders = buildAuthHeaders(token, user);

  const triggerNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadContests = useCallback(async () => {
    setLoading(true);
    setError(null);
    let merged = [];

    try {
      const res = await fetch(`${API_BASE}/api/contests`, {
        headers: adminHeaders,
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (data.success && data.contests) {
        merged = data.contests.map((c) => ({
          ...c,
          status: getContestStatus(c),
          isDbContest: true,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch backend contests:", err);
      setError("Could not connect to the backend. Database is offline.");
    }

    setAllContests(merged);
    setLoading(false);
  }, [API_BASE, token]);

  useEffect(() => {
    loadContests();
  }, [loadContests]);

  const handleDelete = async (contestId) => {
    try {
      const res = await fetch(`${API_BASE}/api/contests/${contestId}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAllContests((prev) =>
          prev.filter((c) => String(c.id) !== String(contestId))
        );
        triggerNotification("Contest deleted successfully.");
      } else {
        triggerNotification(data.message || "Failed to delete contest.", "error");
      }
    } catch (err) {
      triggerNotification("Server error while deleting contest.", "error");
    }
    setDeletingId(null);
  };

  const filteredContests = allContests.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: allContests.length,
    active: allContests.filter((c) => c.status === "active").length,
    upcoming: allContests.filter((c) => c.status === "upcoming").length,
    past: allContests.filter((c) => c.status === "past").length,
  };

  const statusStyles = {
    active: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    upcoming: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    past: "text-slate-400 bg-slate-500/5 border-transparent",
  };

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12" style={{ color: "var(--text-primary)" }}>
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            Manage Contests
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            View, manage, and delete contests from the registry.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadContests}
            className="p-2.5 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-violet-500" : "text-[var(--text-secondary)]"} />
          </button>
          <button
            onClick={() => router.push("/admin/contests/new")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md"
            style={{ background: "var(--accent-primary)" }}
          >
            <Plus size={14} />
            <span>Create Contest</span>
          </button>
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Contests", color: "text-[var(--text-muted)]" },
            { key: "active", label: "Active", color: "text-emerald-500" },
            { key: "upcoming", label: "Upcoming", color: "text-zinc-500" },
            { key: "past", label: "Past", color: "text-slate-500" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[var(--border-primary)] ${filterStatus === f.key
                  ? "bg-[var(--bg-primary)] shadow-sm text-[var(--text-primary)] border-[var(--border-primary)]"
                  : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
            >
              <span className={f.color}>{f.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[10px] font-bold">
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search contests..."
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
              Fetching contests...
            </span>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
              <Trophy size={24} className="text-violet-500" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                No contests found
              </h3>
              <p className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>
                {search ? "Try adjusting your search or filter." : "No contests are currently registered."}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto min-w-0">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-[var(--bg-secondary)] text-xs font-semibold uppercase tracking-wider select-none" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                  <th className="px-6 py-4">Contest</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">End Time</th>
                  <th className="px-6 py-4 text-center">Problems</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium" style={{ divideColor: "var(--border-primary)" }}>
                <AnimatePresence>
                  {filteredContests.map((contest, idx) => (
                    <motion.tr
                      key={contest.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-[var(--bg-secondary)] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--text-primary)] max-w-[200px] truncate">
                            {contest.title}
                          </p>
                          {contest.description && (
                            <p className="text-[10px] max-w-[200px] truncate" style={{ color: "var(--text-muted)" }}>
                              {contest.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border"
                          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}>
                          {contest.category || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-[var(--border-primary)] ${statusStyles[contest.status] || statusStyles.past}`}>
                          {contest.status === "active" ? "● Active" : contest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(contest.startTime)}
                      </td>
                      <td className="px-6 py-4 text-[10px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(contest.endTime)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {contest.contestProblems?.length ?? contest.problems?.length ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {contest.isDbContest && (
                            <>
                              <button
                                onClick={() => router.push(`/admin/contests/${contest.id}/edit`)}
                                className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="Edit Contest"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/contests/${contest.id}`)}
                                className="p-2 rounded-lg text-neutral-500 hover:bg-slate-500/10 transition-colors cursor-pointer"
                                title="View Participants"
                              >
                                <Users size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => router.push(`/contest/${contest.id}`)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
                            title="View in Arena"
                          >
                            <ArrowUpRight size={16} />
                          </button>
                          {(contest.isDbContest || contest.isLocalContest) && (
                            <button
                              onClick={() => setDeletingId(String(contest.id))}
                              className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Contest"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
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
                  Delete Contest?
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  This will permanently delete the contest and all related data. This action cannot be undone.
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
                  onClick={() => {
                    const contest = allContests.find((c) => String(c.id) === deletingId);
                    if (contest) handleDelete(contest.id);
                  }}
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
