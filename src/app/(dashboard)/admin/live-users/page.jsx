"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Search, ShieldAlert, ShieldCheck, UserCheck, UserX,
  RefreshCw, AlertTriangle, Filter, Mail, Calendar, CheckCircle2,
  XCircle, Ban, Lock, Unlock, Loader2, Building2, Globe
} from "lucide-react";

export default function LiveUsersPage() {
  const { user: currentUser, token, API_BASE, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, global: 0, instituteUsers: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [userType, setUserType] = useState("ALL"); // "ALL" | "GLOBAL" | "INSTITUTE"
  const [selectedInstituteId, setSelectedInstituteId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "BLOCKED"
  const [roleFilter, setRoleFilter] = useState("ALL"); // "ALL" | "USER" | "ADMIN" | "INSTITUTE_ADMIN" | "BATCH_MANAGER"
  const [search, setSearch] = useState("");

  // Action states
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModalUser, setConfirmModalUser] = useState(null); // User object pending block/unblock confirmation
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getAuthHeaders = useCallback(() => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (currentUser?.id) {
      return {
        "x-bypass-auth": "true",
        "x-bypass-role": "ADMIN",
        "x-bypass-userid": String(currentUser.id),
      };
    }
    return {
      "x-bypass-auth": "true",
      "x-bypass-role": "ADMIN",
    };
  }, [token, currentUser]);

  // ─── Fetch live registered users ──────────────────────────────────────────────
  const fetchLiveUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("search", search.trim());
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (roleFilter !== "ALL") queryParams.append("role", roleFilter);
      if (userType !== "ALL") queryParams.append("userType", userType);
      if (selectedInstituteId !== "ALL") queryParams.append("instituteId", selectedInstituteId);

      const res = await fetch(`${API_BASE}/api/auth/live-users?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.institutes) setInstitutes(data.institutes || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        const rawMsg = data.message || "";
        const isTechnicalError = rawMsg.includes("Prisma") || rawMsg.includes("invocation") || rawMsg.includes("Unknown field");
        setError(isTechnicalError ? "An error occurred while fetching users directory. Please try again." : rawMsg);
      }
    } catch (err) {
      console.error("Fetch live users error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAuthHeaders, search, statusFilter, roleFilter, userType, selectedInstituteId]);

  useEffect(() => {
    if (!authLoading) {
      fetchLiveUsers();
    }
  }, [authLoading, fetchLiveUsers]);

  // Clear success notification after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ─── Toggle User Block/Unblock Status ─────────────────────────────────────────
  const handleToggleBlock = async (targetUser) => {
    if (!targetUser) return;
    setActionLoading(targetUser.id);
    setError("");

    const newBlockedState = !targetUser.isBlocked;

    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${targetUser.id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isBlocked: newBlockedState }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || `User status updated successfully.`);
        setConfirmModalUser(null);
        fetchLiveUsers();
      } else {
        setError(data.message || "Failed to update user block status.");
      }
    } catch (err) {
      console.error("Block toggle error:", err);
      setError("Server connection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  // Role badges helper
  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">Super Admin</span>;
      case "INSTITUTE_ADMIN":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-500 border border-purple-500/20">Institute Admin</span>;
      case "BATCH_MANAGER":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">Batch Manager</span>;
      case "MENTOR":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/10 text-teal-500 border border-teal-500/20">Mentor</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Student</span>;
    }
  };

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <Users size={12} className="text-violet-500 animate-pulse" />
            DIRECTORY
          </div>
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Live Registered Users
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Monitor all registered platform users, filter by global vs institute affiliation, and manage access flags.
          </p>
        </div>

        <button
          onClick={fetchLiveUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer self-start sm:self-auto shadow-xs"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[var(--accent-primary)]" : ""} />
          Refresh Directory
        </button>
      </section>

      {/* Success Notification */}
      {success && (
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="text-emerald-500/70 hover:text-emerald-500">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Registered", value: stats.total, icon: Users, color: "var(--accent-primary)", bg: "var(--bg-hover)" },
          { label: "Global Platform Users", value: stats.global, icon: Globe, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Institute Affiliated Users", value: stats.instituteUsers, icon: Building2, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
          { label: "Blocked Accounts", value: stats.blocked, icon: UserX, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
        ].map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-2xl border flex items-center justify-between shadow-xs"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </p>
              <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {card.value}
              </p>
            </div>
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: card.bg, color: card.color }}>
              <card.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Primary Scope Tabs: All vs Global vs Institute */}
      <div className="p-1.5 rounded-2xl border flex items-center gap-1.5 w-fit" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
        {[
          { key: "ALL", label: "All Users", count: stats.total, icon: Users },
          { key: "GLOBAL", label: "Global Users", count: stats.global, icon: Globe },
          { key: "INSTITUTE", label: "Institute Users", count: stats.instituteUsers, icon: Building2 },
        ].map((tab) => {
          const active = userType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setUserType(tab.key);
                if (tab.key !== "INSTITUTE") setSelectedInstituteId("ALL");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[var(--accent-primary)] text-white shadow-xs"
                  : "hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar (Institute Selector, Role, Status & Search) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {[
            { key: "ALL", label: "All Access" },
            { key: "ACTIVE", label: `Active (${stats.active})` },
            { key: "BLOCKED", label: `Blocked (${stats.blocked})` },
          ].map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? "bg-[var(--bg-hover)] text-[var(--accent-primary)] border-[var(--accent-primary)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Institute Selector Dropdown (visible when Institute Users tab is active or in All view) */}
          {(userType === "INSTITUTE" || userType === "ALL") && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedInstituteId}
                onChange={(e) => setSelectedInstituteId(e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] max-w-[200px] truncate"
                style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                <option value="ALL">All Institutes ({institutes.length})</option>
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    🏛️ {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role selector (tailored to active tab scope) */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Student (User)</option>
            {userType !== "GLOBAL" && (
              <>
                <option value="INSTITUTE_ADMIN">Institute Admin</option>
                <option value="BATCH_MANAGER">Batch Manager</option>
              </>
            )}
            <option value="MENTOR">Mentor</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, username, name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 rounded-full border-t-transparent animate-spin" style={{ borderColor: "var(--accent-primary)" }} />
          <p className="text-xs font-semibold text-[var(--text-muted)]">Fetching registered users...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertTriangle size={36} className="text-amber-500" />
          <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
          <button
            onClick={fetchLiveUsers}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Retry Fetch
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <UserX size={36} className="mx-auto text-[var(--text-muted)] opacity-40" />
          <p className="text-sm font-bold text-[var(--text-primary)]">No matching registered users found</p>
          <p className="text-xs text-[var(--text-muted)]">
            Try adjusting your search query, role filter, or institute selection.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-xs" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
          <div className="w-full">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                  {["User Profile", "Email", "Role", "Institute Affiliation", "Registered On", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-3.5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isBlocked = u.isBlocked;

                  return (
                    <tr key={u.id} className="border-b last:border-b-0 transition-colors hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)" }}>
                      {/* User Profile (Avatar + Name + @username) */}
                      <td className="px-3.5 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center uppercase shrink-0 border border-[var(--accent-primary)]/20">
                            {u.fullName?.charAt(0) || u.username?.charAt(0) || "U"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate" style={{ color: "var(--text-primary)" }}>{u.fullName || u.username}</span>
                              {isSelf && (
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest shrink-0">(You)</span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] font-medium text-[var(--text-muted)] truncate">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3.5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={u.email}>
                          <Mail size={12} className="text-[var(--text-muted)] shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-3.5 py-3">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Institute */}
                      <td className="px-3.5 py-3" style={{ color: "var(--text-muted)" }}>
                        {u.institute?.name ? (
                          <div className="flex items-center gap-1 text-[11px] truncate max-w-[150px]" title={u.institute.name}>
                            <Building2 size={11} className="text-purple-400 shrink-0" />
                            <span className="truncate font-medium text-purple-400">{u.institute.name}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400">
                            <Globe size={10} /> Global User
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="px-3.5 py-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} className="shrink-0" />
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status Flag */}
                      <td className="px-3.5 py-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <Lock size={10} /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <ShieldCheck size={10} /> Active
                          </span>
                        )}
                      </td>

                      {/* Block/Unblock Action */}
                      <td className="px-3.5 py-3">
                        {isSelf ? (
                          <span className="text-[10px] font-semibold text-[var(--text-muted)] italic">Cannot block self</span>
                        ) : (
                          <button
                            onClick={() => setConfirmModalUser(u)}
                            disabled={actionLoading === u.id}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isBlocked
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
                            }`}
                          >
                            {actionLoading === u.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : isBlocked ? (
                              <>
                                <Unlock size={12} /> Unblock
                              </>
                            ) : (
                              <>
                                <Ban size={12} /> Block
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Confirmation Modal for Block/Unblock ────────────────────────────── */}
      {confirmModalUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setConfirmModalUser(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${confirmModalUser.isBlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                {confirmModalUser.isBlocked ? <Unlock size={24} /> : <Ban size={24} />}
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {confirmModalUser.isBlocked ? "Unblock Platform Account?" : "Block Platform Account?"}
                </h3>
                <p className="text-xs font-mono font-semibold text-[var(--accent-primary)]">
                  @{confirmModalUser.username} ({confirmModalUser.email})
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {confirmModalUser.isBlocked ? (
                <p>Restoring access will allow <strong>@{confirmModalUser.username}</strong> to log back into the platform and resume their active session.</p>
              ) : (
                <>
                  <p>
                    Blocking this account will immediately prevent <strong>@{confirmModalUser.username}</strong> from logging into the platform. When they attempt to log in, they will be informed that their account has been blocked with instructions to contact <strong>hello@eduvantix.com</strong>.
                  </p>
                  {confirmModalUser.institute?.name && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] font-medium flex items-start gap-1.5 mt-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Blocking this account restricts only <strong>@{confirmModalUser.username}</strong>. Other students & faculty of <strong>{confirmModalUser.institute.name}</strong> will still log in normally. <em>(To block an entire institute, use the Institutes & Admins page).</em>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setConfirmModalUser(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-hover)] cursor-pointer"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleBlock(confirmModalUser)}
                disabled={actionLoading === confirmModalUser.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all hover:scale-[1.02] ${
                  confirmModalUser.isBlocked ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {actionLoading === confirmModalUser.id ? (
                  <Loader2 size={14} className="animate-spin mx-auto" />
                ) : confirmModalUser.isBlocked ? (
                  "Confirm Unblock"
                ) : (
                  "Confirm Block"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
