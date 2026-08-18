"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
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
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    icon: X,
  },
};

function StatCard({ label, value, icon: Icon, color, bg }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="p-4 rounded-2xl border flex items-center justify-between shadow-xs"
      style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}
    >
      <div>
        <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color: color }}
      >
        <Icon size={20} />
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
      transition={{ duration: 0.3 }}
      className="p-5 rounded-2xl border shadow-xs transition-all hover:border-[var(--accent-primary)]/40"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold truncate" style={{ color: "var(--text-primary)" }}>{app.fullName}</h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.bg} ${status.border} ${status.color}`}>
              <StatusIcon size={11} />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
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
              className="inline-flex items-center gap-1 text-[11px] text-emerald-500 hover:underline mt-2 font-medium"
            >
              <ExternalLink size={11} /> LinkedIn Profile
            </a>
          )}

          <div
            className="mt-3 p-3 rounded-xl border"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Why they want to join:</p>
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>{app.whyJoin}</p>
          </div>

          {app.adminNote && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
              <p className="text-[11px] text-amber-500 font-semibold">Admin Note:</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{app.adminNote}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {app.status === "PENDING" && (
            <>
              <button
                onClick={() => onAccept(app)}
                disabled={actionLoading === app.id}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50 shadow-xs hover:opacity-90"
                style={{ backgroundColor: "var(--accent-primary)" }}
              >
                {actionLoading === app.id ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
                Accept
              </button>
              <button
                onClick={() => onReject(app)}
                disabled={actionLoading === app.id}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <ThumbsDown size={12} /> Revoke
            </button>
          )}
          {app.status === "REJECTED" && (
            <button
              onClick={() => onAccept(app)}
              disabled={actionLoading === app.id}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all cursor-pointer"
            >
              <ThumbsUp size={12} /> Re-accept
            </button>
          )}
          <button
            onClick={() => onDelete(app.id)}
            disabled={actionLoading === app.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={12} /> Delete
          </button>
          <div className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
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
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ThumbsDown size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Reject Application</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{app?.fullName} — {app?.collegeName}</p>
          </div>
        </div>
        <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>
          Feedback / Reason (optional — shown in rejection email)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. We've reached capacity in your region for this cohort..."
          className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-rose-500 resize-none"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)"
          }}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <ThumbsDown size={13} />}
            Confirm Rejection
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampusAmbassadorsAdminPage() {
  const { token, user, API_BASE } = useAuth();
  const router = useRouter();

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

      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };

      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications?${params}`, {
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setStats(data.stats || { PENDING: 0, ACCEPTED: 0, REJECTED: 0 });
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
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
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${app.id}/review`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${app.fullName} accepted! Acceptance email sent.`);
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
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${rejectTarget.id}/review`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "REJECTED", adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Application rejected.`);
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
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };
      const res = await fetch(`${API_BASE}/api/campus-ambassador/admin/applications/${id}`, {
        method: "DELETE",
        headers,
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
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === "error"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            Campus Ambassadors
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Review, accept, and manage Campus Ambassador applications across partner colleges.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer self-start sm:self-auto shadow-xs"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[var(--accent-primary)]" : ""} /> Refresh
        </button>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Applications" value={total} icon={Users} color="var(--accent-primary)" bg="var(--bg-hover)" />
        <StatCard label="Pending Review" value={stats.PENDING} icon={Clock} color="#f59e0b" bg="rgba(245,158,11,0.08)" />
        <StatCard label="Accepted" value={stats.ACCEPTED} icon={UserCheck} color="#10b981" bg="rgba(16,185,129,0.08)" />
        <StatCard label="Rejected" value={stats.REJECTED} icon={UserX} color="#ef4444" bg="rgba(239,68,68,0.08)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Search by name, email, college..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {/* Status filter pills */}
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl border shrink-0" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === s
                  ? "shadow-xs font-bold border"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor: statusFilter === s ? "var(--bg-primary)" : "transparent",
                borderColor: statusFilter === s ? "var(--border-primary)" : "transparent",
                color: statusFilter === s ? "var(--text-primary)" : "var(--text-muted)"
              }}
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
        <div className="text-center py-20 border border-dashed rounded-3xl" style={{ borderColor: "var(--border-primary)" }}>
          <Users size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No applications yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
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
            className="p-2 rounded-xl border hover:bg-[var(--bg-hover)] transition-all cursor-pointer disabled:opacity-40"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border hover:bg-[var(--bg-hover)] transition-all cursor-pointer disabled:opacity-40"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
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
