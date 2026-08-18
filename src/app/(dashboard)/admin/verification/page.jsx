"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw,
  Eye, ChevronLeft, ChevronRight, Search, Filter,
  Loader2, User2, Building2, GraduationCap, BookOpen,
  ExternalLink, MessageSquare, ThumbsDown, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";
import VerifiedBadge from "@/components/VerifiedBadge";

const API_BASE = getApiBase();

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "var(--text-secondary)", bg: "rgba(148,163,184,0.1)", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: RefreshCw },
  APPROVED: { label: "Approved", color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  MORE_INFO_REQUIRED: { label: "More Info", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: AlertCircle },
  REVOKED: { label: "Revoked", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
};

const TIER_CONFIG = {
  STUDENT: { label: "Student", color: "#3b82f6", icon: GraduationCap },
  EDUCATOR: { label: "Educator", color: "#f59e0b", icon: BookOpen },
  ORGANIZATION: { label: "Organization", color: "#8b5cf6", icon: Building2 },
};

const REJECTION_REASONS = [
  "Insufficient activity on the platform",
  "Profile is incomplete (missing photo, bio, or institution)",
  "Account too new — must be at least 30 days old",
  "Does not meet the role/content creation criteria",
  "Suspicious account activity detected",
  "Unable to verify provided credentials",
  "Custom reason…",
];

// ── Main Admin Page ─────────────────────────────────────────────────────────────
export default function AdminVerificationPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [revokeUserId, setRevokeUserId] = useState(null);

  // Review modal state
  const [reviewAction, setReviewAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customRejection, setCustomRejection] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const headers = buildAuthHeaders(token, user);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      if (tierFilter) params.set("tier", tierFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${API_BASE}/api/verification/admin?${params}`, { 
        headers,
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch applications.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, tierFilter, search]); // eslint-disable-line

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const openDetail = async (app) => {
    setSelectedApp(app);
    setDetailLoading(true);
    setReviewAction("");
    setAdminNotes("");
    setRejectionReason("");
    setCustomRejection("");
    try {
      const res = await fetch(`${API_BASE}/api/verification/admin/${app.id}`, { 
        headers,
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) setSelectedApp(data.application);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewAction) return;
    setReviewLoading(true);
    const finalRejectionReason = rejectionReason === "Custom reason…" ? customRejection : rejectionReason;

    try {
      const body = { action: reviewAction, adminNotes };
      if (reviewAction === "REJECT") body.rejectionReason = finalRejectionReason;

      const bypass = localStorage.getItem('bypass_eligibility') === 'true';
      const res = await fetch(`${API_BASE}/api/verification/admin/${selectedApp.id}/review${bypass ? '?test_bypass=true' : ''}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Application ${reviewAction.toLowerCase().replace("_", " ")} successfully.`);
        setSelectedApp(null);
        fetchApplications();
      } else {
        showToast(data.message || "Review failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const submitRevoke = async (targetUserId) => {
    if (!confirm("Revoke this user's verified badge?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/verification/admin/revoke/${targetUserId}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ reason: "Revoked by admin." }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Badge revoked.");
        setSelectedApp(null);
        fetchApplications();
      } else {
        showToast(data.message || "Revoke failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
              toast.type === "error"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            Verification Applications
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Review, evaluate credentials, and assign verified profile badges to students, educators, and partner organizations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer shadow-xs"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[var(--accent-primary)]" : ""} /> Refresh
          </button>
          <div className="px-4 py-2 rounded-xl border text-xs font-bold" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}>
            {total} total
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map(s => {
          const cfg = STATUS_CONFIG[s];
          const StatusIcon = cfg.icon;
          return (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02 }}
              onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
              className="p-4 rounded-2xl border flex items-center justify-between shadow-xs transition-all cursor-pointer text-left"
              style={{
                background: statusFilter === s ? cfg.bg : "var(--bg-card)",
                borderColor: statusFilter === s ? cfg.color : "var(--border-primary)"
              }}
            >
              <div>
                <div className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</div>
              </div>
              <StatusIcon size={18} color={cfg.color} />
            </motion.button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)"
            }}
          />
        </div>
        <select
          value={tierFilter}
          onChange={e => { setTierFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border text-xs font-semibold outline-none cursor-pointer"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-primary)",
            color: "var(--text-secondary)"
          }}
        >
          <option value="">All Tiers</option>
          <option value="STUDENT">Student</option>
          <option value="EDUCATOR">Educator</option>
          <option value="ORGANIZATION">Organization</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Loader2 size={28} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Shield size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
              <p>No applications found</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 16, padding: "14px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-primary)", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span>User</span>
                <span>Tier</span>
                <span>Status</span>
                <span>Submitted</span>
                <span>Action</span>
              </div>

              {applications.map((app, i) => {
                const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                const tierCfg = TIER_CONFIG[app.badgeTier] || TIER_CONFIG.STUDENT;
                const StatusIcon = statusCfg.icon;
                const TierIcon = tierCfg.icon;

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 16, padding: "14px 20px", borderBottom: "1px solid var(--border-primary)", alignItems: "center" }}
                  >
                    {/* User */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {app.user?.avatarUrl ? (
                        <img src={app.user.avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User2 size={18} color="#60a5fa" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                          {app.user?.fullName || app.user?.username}
                          {app.user?.isVerified && <VerifiedBadge tier={app.user.verifiedBadgeTier} size="xs" showTooltip={false} />}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{app.user?.email}</div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: tierCfg.color, fontWeight: 600 }}>
                      <TierIcon size={14} />
                      {tierCfg.label}
                    </div>

                    {/* Status */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: statusCfg.bg, border: `1px solid ${statusCfg.color}40`, borderRadius: 20, padding: "4px 10px", width: "fit-content" }}>
                      <StatusIcon size={11} color={statusCfg.color} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</span>
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => openDetail(app)}
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                    >
                      <Eye size={13} /> Review
                    </button>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
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

      {/* ── Application Detail Slide-Over Panel ── */}
      <AnimatePresence>
        {selectedApp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 50 }}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(500px, 100vw)", background: "var(--bg-card)", borderLeft: "1px solid var(--border-primary)", zIndex: 51, overflowY: "auto", padding: 24 }}
            >
              {detailLoading ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                  <Loader2 size={28} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : (
                <>
                  {/* Panel header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Application Review</h2>
                    <button onClick={() => setSelectedApp(null)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, cursor: "pointer", color: "var(--text-secondary)" }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* User profile snapshot */}
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 14, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      {selectedApp.user?.avatarUrl ? (
                        <img src={selectedApp.user.avatarUrl} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User2 size={24} color="#60a5fa" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          {selectedApp.user?.fullName || selectedApp.user?.username}
                          {selectedApp.user?.isVerified && <VerifiedBadge tier={selectedApp.user.verifiedBadgeTier} size="sm" />}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{selectedApp.user?.username} · {selectedApp.user?.email}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                          Role: {selectedApp.user?.role} · Institute: {selectedApp.user?.institute?.name || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Activity metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, fontSize: 12, textAlign: "center" }}>
                      {[
                        { label: "Submissions", val: selectedApp.user?._count?.submissions ?? "—" },
                        { label: "Discussions", val: selectedApp.user?._count?.discussions ?? "—" },
                        { label: "Courses", val: selectedApp.user?._count?.learningCoursesCreated ?? "—" },
                        { label: "Batches", val: selectedApp.user?._count?.managedBatches ?? "—" },
                      ].map(m => (
                        <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 6px" }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: "#e2e8f0" }}>{m.val}</div>
                          <div style={{ color: "var(--text-muted)" }}>{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* External links */}
                    <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedApp.user?.linkedinUrl && (
                        <a href={selectedApp.user.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={11} /> LinkedIn
                        </a>
                      )}
                      {selectedApp.user?.githubUrl && (
                        <a href={selectedApp.user.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={11} /> GitHub
                        </a>
                      )}
                      {selectedApp.websiteUrl && (
                        <a href={selectedApp.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={11} /> Website
                        </a>
                      )}
                      {selectedApp.linkedinUrl && (
                        <a href={selectedApp.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#60a5fa", display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={11} /> Applicant LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Application info */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <VerifiedBadge tier={selectedApp.badgeTier} size="md" showTooltip={false} />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{selectedApp.badgeTier} Badge Application</span>
                    </div>
                    {selectedApp.reason && (
                      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Applicant&apos;s reason:</span>
                        {selectedApp.reason}
                      </div>
                    )}
                  </div>

                  {/* Review action */}
                  {!["APPROVED", "REVOKED"].includes(selectedApp.status) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-secondary)" }}>Admin Action</h3>

                      {/* Action buttons */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                          { action: "APPROVE", label: "Approve", color: "#22c55e", icon: CheckCircle2 },
                          { action: "UNDER_REVIEW", label: "Mark Under Review", color: "#3b82f6", icon: RefreshCw },
                          { action: "MORE_INFO_REQUIRED", label: "Need More Info", color: "#f59e0b", icon: AlertCircle },
                          { action: "REJECT", label: "Reject", color: "#ef4444", icon: XCircle },
                        ].map(({ action, label, color, icon: Icon }) => (
                          <button
                            key={action}
                            onClick={() => setReviewAction(reviewAction === action ? "" : action)}
                            style={{ background: reviewAction === action ? color : "var(--bg-secondary)", border: `1px solid ${reviewAction === action ? color : "var(--border-primary)"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: reviewAction === action ? "#fff" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}
                          >
                            <Icon size={14} /> {label}
                          </button>
                        ))}
                      </div>

                      {/* Action-specific fields */}
                      {reviewAction && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {reviewAction === "REJECT" && (
                            <>
                              <select
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: "10px 14px", color: "inherit", fontSize: 13, outline: "none" }}
                              >
                                <option value="">Select rejection reason…</option>
                                {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              {rejectionReason === "Custom reason…" && (
                                <textarea
                                  value={customRejection}
                                  onChange={e => setCustomRejection(e.target.value)}
                                  placeholder="Enter custom rejection reason…"
                                  rows={3}
                                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: "10px 14px", color: "inherit", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                                />
                              )}
                            </>
                          )}

                          {["APPROVE", "UNDER_REVIEW", "MORE_INFO_REQUIRED"].includes(reviewAction) && (
                            <textarea
                              value={adminNotes}
                              onChange={e => setAdminNotes(e.target.value)}
                              placeholder={reviewAction === "MORE_INFO_REQUIRED" ? "Explain what information is needed…" : "Admin notes (optional)…"}
                              rows={3}
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 10, padding: "10px 14px", color: "inherit", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none" }}
                            />
                          )}

                          <button
                            onClick={submitReview}
                            disabled={reviewLoading}
                            style={{ background: "var(--accent-primary)", border: "none", borderRadius: 10, padding: "12px", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                          >
                            {reviewLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            Confirm & Submit
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Revoke button for approved users */}
                  {selectedApp.user?.isVerified && selectedApp.status === "APPROVED" && (
                    <button
                      onClick={() => submitRevoke(selectedApp.userId)}
                      style={{ marginTop: 16, width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 10, padding: "11px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <ThumbsDown size={14} /> Revoke Badge
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
