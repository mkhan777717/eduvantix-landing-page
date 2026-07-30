"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BookOpen, Users, Eye, Pencil, Trash2, Globe, Building2,
  BarChart2, Star, ChevronRight, Layers, Clock, Tag, ShoppingBag,
  CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw,
  ClipboardList, Copy, Check, X
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

function CourseSubmissionsModal({ course, isOpen, onClose, API_BASE, authHeaders }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!isOpen || !course?.id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/learn/admin/courses/${course.id}/submissions`, { headers: authHeaders })
      .then(async res => {
        if (!res.ok) return { success: false, submissions: [] };
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setSubmissions(data.submissions || []);
        }
      })
      .catch(err => console.error("Error fetching submissions:", err))
      .finally(() => setLoading(false));
  }, [isOpen, course, API_BASE]);

  if (!isOpen) return null;

  const filtered = submissions.filter(s =>
    (s.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.studentEmail || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.stepTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.submissionUrl || "").toLowerCase().includes(search.toLowerCase())
  );

  const copyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 pb-6 px-4 bg-black/70 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-3xl rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ClipboardList size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Assignment Submissions</h3>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Course: {course?.title} ({submissions.length} total)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pt-4 pb-2 border-b border-[var(--border-primary)] bg-[var(--bg-card)]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name, email, assignment step, or submission..."
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Submissions List */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12 space-y-2 flex-col">
                <RefreshCw size={24} className="animate-spin text-[var(--text-accent)]" />
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Loading course submissions...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <ClipboardList size={32} className="mx-auto text-[var(--text-muted)] opacity-50" />
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>No Submissions Found</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {search ? "No student submissions match your search query." : "No student has submitted an assignment in this course yet."}
                </p>
              </div>
            ) : (
              filtered.map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center font-bold text-xs text-[var(--text-accent)] uppercase">
                        {sub.studentName?.[0] || "S"}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{sub.studentName}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub.studentEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {sub.stepTitle}
                      </span>
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)]" style={{ color: "var(--text-muted)" }}>
                        {new Date(sub.completedAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => copyText(sub.id, sub.submissionUrl)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {copiedId === sub.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedId === sub.id ? "Copied" : "Copy Content"}
                      </button>
                    </div>
                  </div>

                  {/* Submission Content Box */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {sub.submissionUrl.startsWith("http://") || sub.submissionUrl.startsWith("https://") ? (
                      <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                        🔗 {sub.submissionUrl}
                      </a>
                    ) : (
                      sub.submissionUrl
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              style={{ color: "var(--text-primary)" }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DeleteCourseModal({ course, isOpen, onClose, onConfirm, deleting }) {
  if (!isOpen || !course) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[var(--bg-card)] p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Delete Course</h3>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>"{course.title}"</strong>? This will permanently remove all chapters, steps, exercises, and student progress.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              style={{ color: "var(--text-primary)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [selectedInstituteId, setSelectedInstituteId] = useState("all");
  const [institutes, setInstitutes] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [submissionsCourse, setSubmissionsCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const isSuperAdmin = !user?.role || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(hasRealToken
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/institutes`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (d.success) setInstitutes(d.data || d.institutes || []);
      })
      .catch(() => {});
  }, [API_BASE]);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      let params = [];
      if (scope !== "all") params.push(`scope=${scope}`);
      if (scope === "institute" && selectedInstituteId && selectedInstituteId !== "all") {
        params.push(`instituteId=${selectedInstituteId}`);
      }
      const queryString = params.length ? `?${params.join("&")}` : "";
      const res = await fetch(`${API_BASE}/api/learn/admin/courses${queryString}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [scope, selectedInstituteId, API_BASE, token]);

  const loadPendingRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/purchase-requests?status=PENDING`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setPendingCount(data.requests.length);
    } catch (e) {}
  }, [API_BASE, token]);

  useEffect(() => { loadCourses(); loadPendingRequests(); }, [loadCourses, loadPendingRequests]);

  const handleCreateCourse = () => {
    let url = "/admin/courses/create";
    if (scope === "institute") {
      url += `?scope=institute${selectedInstituteId && selectedInstituteId !== "all" ? `&instituteId=${selectedInstituteId}` : ""}`;
    }
    router.push(url);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/courses/${courseToDelete.id}`, { method: "DELETE", headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
        setCourseToDelete(null);
      }
    } catch (e) { console.error(e); }
    setDeleting(false);
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const published = courses.filter(c => c.visibility === "PUBLISHED").length;
  const drafts = courses.filter(c => c.visibility === "DRAFT").length;
  const totalLearners = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
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
          <button onClick={handleCreateCourse}
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
        {/* Scope tabs (Only shown to Super Admin) */}
        {isSuperAdmin && (
          <>
            <div className="flex rounded-xl overflow-hidden border border-[var(--border-primary)] shrink-0">
              {[["all", "All"], ["global", "Global"], ["institute", "Institute"]].map(([val, label]) => (
                <button key={val} onClick={() => { setScope(val); setSelectedInstituteId("all"); }}
                  className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${scope === val ? "text-[var(--text-on-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}
                  style={scope === val ? { background: "var(--accent-gradient)" } : { backgroundColor: "var(--bg-card)" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Institute Selector Dropdown (Only for Super Admin filtering institute scope) */}
            {scope === "institute" && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200 shrink-0">
                <Building2 size={14} className="text-blue-400 shrink-0" />
                <select
                  value={selectedInstituteId}
                  onChange={e => setSelectedInstituteId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold outline-none border border-[var(--border-primary)] transition-all cursor-pointer"
                  style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                  <option value="all">All Institutes</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name || inst.title || `Institute #${inst.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

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
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)]">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr_1fr_150px] gap-4 px-5 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] rounded-t-2xl items-center text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Course</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Category</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Difficulty</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Chapters</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Learners</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-center">Status</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-right pr-2">Actions</span>
          </div>
          {/* Rows */}
          <AnimatePresence>
            {filtered.map((course, i) => (
              <motion.div key={course.id}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => router.push(`/admin/courses/${course.id}/content`)}
                className="grid grid-cols-[2.5fr_1.2fr_1fr_1fr_1fr_1fr_150px] gap-4 px-5 py-4 border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors last:border-b-0 items-center cursor-pointer group/row">
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
                    <p className="font-semibold text-sm truncate group-hover/row:text-[var(--text-accent)] transition-colors" style={{ color: "var(--text-primary)" }}>{course.title}</p>
                    <p className="text-[10px] truncate flex items-center gap-1 font-medium" style={{ color: "var(--text-muted)" }}>
                      {course.instituteId ? <><Building2 size={9} className="text-cyan-400" /> {isSuperAdmin ? (course.institute?.name || "Institute") : "Institute"}</> : <><Globe size={9} className="text-emerald-400" /> Global</>}
                      {" · "}
                      {course.isFree ? "Free" : `₹${course.offerPrice || course.price}`}
                    </p>
                  </div>
                </div>
                {/* Category */}
                <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{course.category}</span>
                {/* Difficulty */}
                <div className="flex justify-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${DIFFICULTY_COLORS[course.difficulty]}`}>
                    {course.difficulty}
                  </span>
                </div>
                {/* Chapters */}
                <div className="flex items-center justify-center gap-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <Layers size={12} /> {course._count?.chapters || 0}
                </div>
                {/* Learners */}
                <div className="flex items-center justify-center gap-1 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <Users size={12} /> {course._count?.enrollments || course.learnerCount || 0}
                </div>
                {/* Status */}
                <div className="flex justify-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${VISIBILITY_COLORS[course.visibility]}`}>
                    {course.visibility}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 justify-end" onClick={e => e.stopPropagation()}>
                  {/* 1. Submissions */}
                  <div className="relative group/tip">
                    <button onClick={(e) => { e.stopPropagation(); setSubmissionsCourse(course); }}
                      className="p-2 rounded-xl hover:bg-cyan-500/15 transition-colors cursor-pointer text-cyan-400">
                      <ClipboardList size={15} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 border border-slate-700">
                      Submissions
                    </div>
                  </div>

                  {/* 2. Course Content */}
                  <div className="relative group/tip">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/courses/${course.id}/content`); }}
                      className="p-2 rounded-xl hover:bg-violet-500/15 transition-colors cursor-pointer text-violet-400">
                      <Layers size={15} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 border border-slate-700">
                      Course Content
                    </div>
                  </div>

                  {/* 3. Edit */}
                  <div className="relative group/tip">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/courses/${course.id}/edit`); }}
                      className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                      <Pencil size={15} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 border border-slate-700">
                      Edit Details
                    </div>
                  </div>

                  {/* 4. Delete */}
                  <div className="relative group/tip">
                    <button onClick={(e) => { e.stopPropagation(); setCourseToDelete(course); }}
                      disabled={deleting && courseToDelete?.id === course.id}
                      className="p-2 rounded-xl hover:bg-rose-500/15 transition-colors cursor-pointer text-rose-400 disabled:opacity-50">
                      {deleting && courseToDelete?.id === course.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-30 border border-slate-700">
                      Delete Course
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Course Assignment Submissions Modal */}
      <CourseSubmissionsModal
        course={submissionsCourse}
        isOpen={!!submissionsCourse}
        onClose={() => setSubmissionsCourse(null)}
        API_BASE={API_BASE}
        authHeaders={authHeaders}
      />

      {/* Custom React Delete Confirmation Modal */}
      <DeleteCourseModal
        course={courseToDelete}
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </div>
  );
}
