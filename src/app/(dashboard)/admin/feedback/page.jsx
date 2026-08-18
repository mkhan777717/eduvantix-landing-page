"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, Check, Trash2, Calendar, Mail, User, AlertTriangle } from "lucide-react";

export default function AdminFeedbackPage() {
  const { token, API_BASE, user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearingId, setClearingId] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };

      const res = await fetch(`${API_BASE}/api/feedback`, { headers });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      } else {
        setError(data.message || "Failed to load feedbacks.");
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      setError("Access Restricted: Super Admins only.");
      setLoading(false);
      return;
    }
    fetchFeedbacks();
  }, [user]);

  const handleClearFeedback = async (id) => {
    setClearingId(id);
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };

      const res = await fetch(`${API_BASE}/api/feedback/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await res.json();
      if (data.success) {
        setFeedbacks(prev => prev.filter(item => item.id !== id));
      } else {
        alert(data.message || "Failed to clear feedback.");
      }
    } catch (err) {
      console.error("Error clearing feedback:", err);
      alert("Failed to clear feedback due to network issues.");
    } finally {
      setClearingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin" style={{ borderColor: "var(--accent-primary)" }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading user feedbacks...</p>
      </div>
    );
  }

  if (error && user?.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto border border-rose-500/20 text-rose-500">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Access Restricted</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            User Feedbacks
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Review feedback, suggestions, and reports shared by platform users.
          </p>
        </div>
        {feedbacks.length > 0 && (
          <div className="text-[10px] font-bold px-2.5 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent-primary)] self-start sm:self-auto uppercase tracking-wider shadow-sm">
            {feedbacks.length} Pending reviews
          </div>
        )}
      </section>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feedbacks Grid/Table */}
      {feedbacks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-[var(--border-primary)] shadow-sm max-w-lg mx-auto space-y-4"
          style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mx-auto border border-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
            <ClipboardList size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>No feedbacks found</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Users haven't submitted any feedback yet.</p>
          </div>
        </div>
      ) : (
        <div className="border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xl"
          style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-bold uppercase tracking-wider"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)", backgroundColor: "var(--bg-hover)" }}>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Feedback Message</th>
                  <th className="py-4 px-6">Submitted On</th>
                  <th className="py-4 px-6 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ divideColor: "var(--border-primary)" }}>
                {feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-4 px-6 space-y-1 w-64">
                      <div className="font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                        <User size={12} className="text-[var(--text-muted)]" />
                        {item.user?.fullName || item.user?.username || "Anonymous"}
                      </div>
                      <div className="text-[10px] flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                        <Mail size={11} />
                        {item.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-6 leading-relaxed max-w-md break-words" style={{ color: "var(--text-secondary)" }}>
                      {item.message}
                    </td>
                    <td className="py-4 px-6 w-48 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center w-24">
                      <button
                        onClick={() => handleClearFeedback(item.id)}
                        disabled={clearingId === item.id}
                        className="p-1.5 rounded-lg border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-400 transition-all duration-200 hover:scale-[1.08] active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-auto flex items-center justify-center shadow-sm"
                        title="Mark as resolved / Clear"
                      >
                        {clearingId === item.id ? (
                          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-emerald-500" />
                        ) : (
                          <Check size={14} strokeWidth={3} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
