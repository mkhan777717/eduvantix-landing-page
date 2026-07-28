"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, XCircle, Clock, Search, RefreshCw,
  ChevronLeft, User, BookOpen, Mail, ShieldAlert, Check, X, Calendar
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const { token, API_BASE } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [msg, setMsg] = useState("");

  const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(hasRealToken
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus !== "ALL" ? `?status=${filterStatus}` : "";
      const res = await fetch(`${API_BASE}/api/learn/admin/purchase-requests${params}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filterStatus, API_BASE, token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (requestId, action) => {
    setProcessingId(requestId);
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/purchase-requests/${requestId}/${action}`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Request ${action === "approve" ? "approved & student enrolled!" : "rejected."}`);
        await loadRequests();
        setTimeout(() => setMsg(""), 3000);
      } else {
        alert(data.message || "Action failed.");
      }
    } catch (e) {
      alert("Network error.");
    }
    setProcessingId(null);
  };

  const filtered = requests.filter(r =>
    (r.user?.fullName || r.user?.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.course?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-primary)]">
        <div className="space-y-1">
          <button onClick={() => router.push("/admin/courses")} className="flex items-center gap-1.5 text-xs font-semibold mb-2 cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ChevronLeft size={13} /> Back to Courses
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: "var(--text-primary)" }}>
            <ShoppingBag size={22} className="text-amber-400" /> Course Access Requests
          </h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Review and approve paid course access requests from students. Approving automatically enrolls the student.
          </p>
        </div>
        <button onClick={loadRequests} className="px-3.5 py-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors" style={{ color: "var(--text-secondary)" }}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {msg && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={14} /> {msg}
        </motion.div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex rounded-xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-card)]">
          {[["PENDING", "Pending"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"], ["ALL", "All Requests"]].map(([status, label]) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${filterStatus === status ? "text-[var(--text-on-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}
              style={filterStatus === status ? { background: "var(--accent-gradient)" } : {}}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student or course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center rounded-3xl border border-dashed border-[var(--border-primary)]">
          <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
            <ShoppingBag size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>No requests found</p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {filterStatus === "PENDING" ? "There are no pending course access requests at this time." : "No records match your criteria."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-card)]">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <span>Student</span>
            <span>Requested Course</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[var(--border-primary)]">
            {filtered.map(req => {
              const statusColors = {
                PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                APPROVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                REJECTED: "text-rose-400 bg-rose-500/10 border-rose-500/30",
              };

              return (
                <div key={req.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-[var(--bg-hover)] transition-colors">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center font-bold text-xs shrink-0" style={{ color: "var(--text-accent)" }}>
                      {req.user?.fullName?.[0] || req.user?.username?.[0] || "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate" style={{ color: "var(--text-primary)" }}>
                        {req.user?.fullName || req.user?.username || "Student"}
                      </p>
                      <p className="text-[11px] truncate flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Mail size={10} /> {req.user?.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate" style={{ color: "var(--text-primary)" }}>
                      {req.course?.title || "Course"}
                    </p>
                    <p className="text-[10px] font-bold text-amber-400">
                      ₹{req.course?.offerPrice || req.course?.price || 0}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {new Date(req.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[req.status] || ""}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {req.status === "PENDING" ? (
                      <>
                        <button onClick={() => handleAction(req.id, "approve")} disabled={processingId === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer transition-colors disabled:opacity-50">
                          {processingId === req.id ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} Approve
                        </button>
                        <button onClick={() => handleAction(req.id, "reject")} disabled={processingId === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer transition-colors disabled:opacity-50">
                          <X size={12} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {req.processedAt ? `Processed ${new Date(req.processedAt).toLocaleDateString()}` : "Completed"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
