"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BookOpen, Users, Eye, Pencil, Trash2, Globe, Building2,
  BarChart2, Star, ChevronRight, Layers, Clock, Tag, ShoppingBag,
  CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const DIFFICULTY_COLORS = {
  BEGINNER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  INTERMEDIATE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ADVANCED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};
const VISIBILITY_COLORS = {
  PUBLISHED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  DRAFT: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]">
      <div className={`p-2.5 rounded-xl ${color}`}><Icon size={18} /></div>
      <div>
        <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</div>
        <div className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const isSuperAdmin = !user?.role || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center px-4">
        <div className="p-5 rounded-3xl bg-[var(--accent-glow)] border border-[var(--border-accent)] text-[var(--text-accent)] shadow-xl">
          <BookOpen size={40} />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Feature Under Development</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The Learning Management System (LMS) courses feature is currently under active development and will be available for Institute Admins, Managers, and Mentors soon.
          </p>
        </div>
        <div className="pt-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            🚧 Coming Soon
          </span>
        </div>
      </div>
    );
  }

  const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(hasRealToken
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
  };

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = scope !== "all" ? `?scope=${scope}` : "";
      const res = await fetch(`${API_BASE}/api/learn/admin/courses${params}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [scope, API_BASE, token]);

  const loadPendingRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/purchase-requests?status=PENDING`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setPendingCount(data.requests.length);
    } catch (e) {}
  }, [API_BASE, token]);

  useEffect(() => { loadCourses(); loadPendingRequests(); }, [loadCourses, loadPendingRequests]);

  const handleDelete = async (courseId, title) => {
    if (!confirm(`Delete "${title}"? This will remove all chapters, steps, and student progress.`)) return;
    setDeleting(courseId);
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/courses/${courseId}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (data.success) setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (e) { console.error(e); }
    setDeleting(null);
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalLearners = courses.reduce((a, c) => a + (c.learnerCount || 0), 0);
  const published = courses.filter(c => c.visibility === "PUBLISHED").length;
  const drafts = courses.filter(c => c.visibility === "DRAFT").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-3"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <BookOpen size={10} /> Learning Management System
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Courses</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create and manage dynamic learning courses with chapters, steps, MCQs, videos, and coding challenges.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {pendingCount > 0 && (
            <button onClick={() => router.push("/admin/courses/purchase-requests")}
              className="relative px-4 py-2.5 rounded-xl font-semibold text-xs border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center gap-2 text-amber-400 cursor-pointer">
              <ShoppingBag size={14} />
              Access Requests
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold flex items-center justify-center text-white">{pendingCount}</span>
            </button>
          )}
          <button onClick={() => router.push("/admin/courses/create")}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "var(--accent-gradient)" }}>
            <Plus size={14} /> Create Course
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length} color="text-violet-400 bg-violet-500/10" />
        <StatCard icon={CheckCircle} label="Published" value={published} color="text-emerald-400 bg-emerald-500/10" />
        <StatCard icon={AlertCircle} label="Drafts" value={drafts} color="text-slate-400 bg-slate-500/10" />
        <StatCard icon={Users} label="Total Learners" value={totalLearners} color="text-cyan-400 bg-cyan-500/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Scope tabs */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border-primary)] shrink-0">
          {[["all", "All"], ["global", "Global"], ["institute", "Institute"]].map(([val, label]) => (
            <button key={val} onClick={() => setScope(val)}
              className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${scope === val ? "text-[var(--text-on-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}
              style={scope === val ? { background: "var(--accent-gradient)" } : { backgroundColor: "var(--bg-card)" }}>
              {label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border border-[var(--border-primary)]"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
        </div>
        <button onClick={loadCourses} className="p-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 space-y-4 text-center rounded-3xl border border-dashed border-[var(--border-primary)]">
          <div className="p-5 rounded-2xl bg-[var(--bg-hover)]"><BookOpen size={28} style={{ color: "var(--text-muted)" }} /></div>
          <div>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>No courses found</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {search ? "Try a different search term" : "Create your first course to get started"}
            </p>
          </div>
          {!search && (
            <button onClick={() => router.push("/admin/courses/create")}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white cursor-pointer"
              style={{ background: "var(--accent-gradient)" }}>
              <Plus size={13} className="inline mr-1.5" />Create Course
            </button>
          )}
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-card)]">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            {["Course", "Category", "Difficulty", "Chapters", "Learners", "Status", "Actions"].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          <AnimatePresence>
            {filtered.map((course, i) => (
              <motion.div key={course.id}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors last:border-b-0 items-center">
                {/* Course name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden">
                    {course.iconUrl ? (
                      (course.iconUrl.startsWith("http") || course.iconUrl.startsWith("data:") || course.iconUrl.startsWith("/")) ? (
                        <img src={course.iconUrl} className="w-7 h-7 object-contain" alt="" />
                      ) : (
                        course.iconUrl
                      )
                    ) : (
                      "📚"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                    <p className="text-[10px] truncate flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      {course.instituteId ? <><Building2 size={9} /> Institute</> : <><Globe size={9} /> Global</>}
                      {" · "}
                      {course.isFree ? "Free" : `₹${course.offerPrice || course.price}`}
                    </p>
                  </div>
                </div>
                {/* Category */}
                <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{course.category}</span>
                {/* Difficulty */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${DIFFICULTY_COLORS[course.difficulty]}`}>
                  {course.difficulty}
                </span>
                {/* Chapters */}
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Layers size={12} /> {course._count?.chapters || 0}
                </div>
                {/* Learners */}
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Users size={12} /> {course._count?.enrollments || course.learnerCount || 0}
                </div>
                {/* Status */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${VISIBILITY_COLORS[course.visibility]}`}>
                  {course.visibility}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => router.push(`/admin/courses/${course.id}/content`)}
                    title="Manage Content"
                    className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors cursor-pointer text-violet-400">
                    <Layers size={14} />
                  </button>
                  <button onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                    title="Edit Details"
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(course.id, course.title)}
                    title="Delete"
                    disabled={deleting === course.id}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer text-rose-400 disabled:opacity-50">
                    {deleting === course.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
