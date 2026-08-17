"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users, CheckCircle2, Clock, X, Search, Filter, ChevronDown,
  Mail, Phone, MapPin, GraduationCap, Globe, ExternalLink,
  Eye, ThumbsUp, ThumbsDown, Trash2, RefreshCw, AlertTriangle,
  Loader2, Star, TrendingUp, UserCheck, UserX, FileText, Building2,
  ChevronLeft, ChevronRight
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Review",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: X,
  },
};

function StatCard({ label, value, icon: Icon, color }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="p-5 rounded-2xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
        <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

function ApplicationCard({ app, onView, onAccept, onReject, onDelete, actionLoading }) {
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="p-5 rounded-2xl border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{app.fullName}</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.bg} ${status.border} ${status.color}`}>
              <StatusIcon size={11} />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-zinc-400 mt-1">
            <span className="flex items-center gap-1.5"><Mail size={11} />{app.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={11} />{app.phone}</span>
            <span className="flex items-center gap-1.5"><Building2 size={11} />{app.collegeName}</span>
            <span className="flex items-center gap-1.5"><MapPin size={11} />{app.city}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={11} />{app.yearOfStudy}{app.degree ? ` (${app.degree})` : ''}</span>
          </div>

          {app.linkedinUrl && (
            <a
              href={app.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-2"
            >
              <ExternalLink size={11} /> LinkedIn Profile
            </a>
          )}

          <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/50">
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold mb-1">Why they want to join:</p>
            <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed line-clamp-3">{app.whyJoin}</p>
          </div>

          {app.adminNote && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Admin Note:</p>
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-0.5">{app.adminNote}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {app.status === "PENDING" && (
            <>
              <button
                onClick={() => onAccept(app)}
                disabled={actionLoading === app.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {actionLoading === app.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                Accept
              </button>
              <button
                onClick={() => onReject(app)}
                disabled={actionLoading === app.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {actionLoading === app.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsDown size={12} />}
                Reject
              </button>
            </>
          )}
          {app.status === "ACCEPTED" && (
            <button
              onClick={() => onReject(app)}
              disabled={actionLoading === app.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <ThumbsDown size={12} /> Revoke
            </button>
          )}
          {app.status === "REJECTED" && (
            <button
              onClick={() => onAccept(app)}
              disabled={actionLoading === app.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all cursor-pointer"
            >
              <ThumbsUp size={12} /> Re-accept
            </button>
          )}
          <button
            onClick={() => onDelete(app.id)}
            disabled={actionLoading === app.id}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <Trash2 size={12} /> Delete
          </button>
          <div className="text-[10px] text-gray-400 dark:text-zinc-500 text-center">
            {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RejectModal({ app, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <ThumbsDown size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Application</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{app?.fullName} — {app?.collegeName}</p>
          </div>
        </div>
        <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">
          Feedback / Reason (optional — shown in rejection email)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. We've reached capacity in your region for this cohort..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
            Confirm Rejection
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampusAmbassadorsAdminPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ PENDING: 0, ACCEPTED: 0, REJECTED: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
        setStats(data.stats);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed fetching ambassador applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [statusFilter, search, page]);

  const handleAccept = async (app) => {
    setActionLoading(app.id);
    try {
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${app.id}/review`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${app.fullName} accepted! Acceptance email sent. 🎉`);
        fetchApplications();
      } else {
        showToast(data.message || "Failed to accept application.", "error");
      }
    } catch { showToast("Failed to accept application.", "error"); }
    finally { setActionLoading(null); }
  };

  const handleRejectConfirm = async (note) => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${rejectTarget.id}/review`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Application rejected. Rejection email sent.`);
        setRejectTarget(null);
        fetchApplications();
      } else {
        showToast(data.message || "Failed to reject.", "error");
      }
    } catch { showToast("Failed to reject application.", "error"); }
    finally { setRejectLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this application?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast("Application deleted.");
        fetchApplications();
      }
    } catch { showToast("Failed to delete.", "error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === "error"
                ? "bg-white dark:bg-zinc-900 border-red-500/20 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-zinc-900 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Campus Ambassadors
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Review, accept, and manage Campus Ambassador applications.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={total} icon={Users} color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <StatCard label="Pending Review" value={stats.PENDING} icon={Clock} color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <StatCard label="Accepted" value={stats.ACCEPTED} icon={UserCheck} color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Rejected" value={stats.REJECTED} icon={UserX} color="bg-red-500/10 text-red-500 dark:text-red-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Search by name, email, college, city…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        {/* Status filter pills */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm font-bold"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {s === "ALL" ? `All (${total})` : s === "PENDING" ? `Pending (${stats.PENDING})` : s === "ACCEPTED" ? `Accepted (${stats.ACCEPTED})` : `Rejected (${stats.REJECTED})`}
            </button>
          ))}
        </div>
      </div>

      {/* Application List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-emerald-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
          <Users size={40} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
          <p className="text-base font-bold text-gray-900 dark:text-white">No applications yet</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {statusFilter !== "ALL" ? "No applications match this filter." : "Campus Ambassador applications will appear here once students start registering."}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {applications.map(app => (
              <ApplicationCard
                key={app.id}
                app={app}
                onAccept={handleAccept}
                onReject={(a) => setRejectTarget(a)}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600 dark:text-zinc-400 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            app={rejectTarget}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
            loading={rejectLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
