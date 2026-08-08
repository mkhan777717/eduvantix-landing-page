"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, GraduationCap, BookOpen, Building2,
  ChevronLeft, ChevronRight, Search, Loader2, Users
} from "lucide-react";
import { getApiBase } from "@/utils/api";
import VerifiedBadge from "@/components/VerifiedBadge";

const API_BASE = getApiBase();

const TIER_FILTERS = [
  { id: "", label: "All Verified", icon: Shield, color: "#3b82f6" },
  { id: "STUDENT", label: "Students", icon: GraduationCap, color: "#3b82f6" },
  { id: "EDUCATOR", label: "Educators", icon: BookOpen, color: "#f59e0b" },
  { id: "ORGANIZATION", label: "Organizations", icon: Building2, color: "#8b5cf6" },
];

export default function VerifiedUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 18 });
      if (tierFilter) params.set("tier", tierFilter);
      const res = await fetch(`${API_BASE}/api/verification/verified-users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter]); // eslint-disable-line

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filteredUsers = search
    ? users.filter(u => (u.fullName || u.username || "").toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "var(--text-primary)", fontFamily: "Inter, sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 30, padding: "8px 20px", marginBottom: 20 }}>
            <Shield size={16} color="#a78bfa" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Verified Community</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 12px", background: "linear-gradient(135deg, #e2e8f0, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Verified Members
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0 }}>
            {total} members have been verified by the Eduvantix team
          </p>
        </motion.div>

        {/* Tier filter tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {TIER_FILTERS.map(t => {
            const Icon = t.icon;
            const active = tierFilter === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setTierFilter(t.id); setPage(1); }}
                style={{ background: active ? `${t.color}20` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? t.color + "60" : "rgba(255,255,255,0.08)"}`, borderRadius: 30, padding: "9px 20px", cursor: "pointer", color: active ? t.color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}
              >
                <Icon size={14} /> {t.label}
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 360, margin: "0 auto 32px" }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search verified members…"
            style={{ width: "100%", paddingLeft: 40, background: "var(--bg-hover)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: "11px 18px 11px 40px", color: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={32} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <Users size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
            <p>No verified members found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", cursor: "default", transition: "all 0.2s" }}
              >
                {/* Avatar */}
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "white" }}>
                    {(user.fullName || user.username || "?")[0].toUpperCase()}
                  </div>
                )}

                {/* Name + badge */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {user.fullName || user.username}
                    <VerifiedBadge tier={user.verifiedBadgeTier} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{user.username}</div>
                </div>

                {/* Tier chip */}
                <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: user.verifiedBadgeTier === "STUDENT" ? "rgba(59,130,246,0.12)" : user.verifiedBadgeTier === "EDUCATOR" ? "rgba(245,158,11,0.12)" : "rgba(139,92,246,0.12)", color: user.verifiedBadgeTier === "STUDENT" ? "#60a5fa" : user.verifiedBadgeTier === "EDUCATOR" ? "#fbbf24" : "#a78bfa" }}>
                  {user.verifiedBadgeTier}
                </div>

                {user.institute?.name && (
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-primary)", paddingTop: 10, width: "100%" }}>
                    {user.institute.name}
                  </div>
                )}

                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  Verified {new Date(user.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 32 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: "var(--bg-hover)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 16px", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#475569" : "#e2e8f0", display: "flex", alignItems: "center", gap: 4 }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ background: "var(--bg-hover)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 16px", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#475569" : "#e2e8f0", display: "flex", alignItems: "center", gap: 4 }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
