"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase, Plus, Edit3, Trash2, Search, Eye, Download, X, Loader2,
  CheckCircle2, XCircle, Clock, AlertTriangle, FileText, ExternalLink,
  Users, MapPin, ChevronDown, Globe, Building2, RefreshCw, Send, Mail,
  LayoutList, Settings2, ToggleLeft, ToggleRight, ArrowUpRight, Flame
} from "lucide-react";

// ─── Status Badge Config (reused from job-assistance pattern) ─────────────────
const APP_STATUS = {
  PENDING:  { label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  REVIEWED: { label: "Reviewed",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)"  },
  SHORTLISTED: { label: "Shortlisted", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  REJECTED: { label: "Rejected",   color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)"  },
  HIRED:    { label: "Hired 🎉",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
};

const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship", PART_TIME: "Part-time" };

// ─── DocxViewer (reused from job-assistance admin page) ───────────────────────
function DocxViewer({ blobUrl, selectedApp, onDownload }) {
  const containerRef = useRef(null);
  const [rendering, setRendering] = useState(true);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!blobUrl || !containerRef.current) return;
    setRendering(true);
    setRenderError(false);

    fetch(blobUrl)
      .then((res) => res.arrayBuffer())
      .then(async (ab) => {
        if (!active || !containerRef.current) return;
        try {
          const { renderAsync } = await import("docx-preview");
          containerRef.current.innerHTML = "";
          await renderAsync(ab, containerRef.current, undefined, {
            inWrapper: true, ignoreWidth: false, ignoreHeight: false,
            experimental: false, className: "docx-rendered-page",
          });
        } catch (err) {
          console.error("DOCX render error:", err);
          if (active) setRenderError(true);
        } finally {
          if (active) setRendering(false);
        }
      })
      .catch(() => { if (active) { setRenderError(true); setRendering(false); } });

    return () => { active = false; };
  }, [blobUrl]);

  if (renderError) return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border text-center space-y-4"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
      <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500"><FileText size={40} /></div>
      <div>
        <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Word Document</h4>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{selectedApp?.resumeFileName || "resume.docx"}</p>
      </div>
      <div className="flex gap-2 pt-2">
        {blobUrl && (
          <button onClick={() => window.open(blobUrl, "_blank")}
            className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold hover:bg-[var(--bg-hover)] cursor-pointer"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            <ExternalLink size={13} /> Open in Tab
          </button>
        )}
        <button onClick={onDownload}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer text-white"
          style={{ backgroundColor: "var(--accent-primary)" }}>
          <Download size={13} /> Download
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-auto rounded-xl border p-4"
      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}>
      {rendering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 backdrop-blur-sm gap-2">
          <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
          <p className="text-xs font-semibold text-white">Rendering document...</p>
        </div>
      )}
      <style>{`.docx-wrapper { background: transparent !important; padding: 0 !important; } .docx-wrapper > section.docx { box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; margin-bottom: 16px !important; border-radius: 6px !important; background: #fff !important; color: #1a1a1a !important; }`}</style>
      <div ref={containerRef} className="w-full flex flex-col items-center" />
    </div>
  );
}

// ─── Main Admin Careers Page ──────────────────────────────────────────────────
export default function AdminCareersPage() {
  const { user, token, API_BASE } = useAuth();

  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "applications"
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterJob, setFilterJob] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Job Form Modal
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "", department: "", location: "Remote", type: "FULL_TIME",
    experience: "", description: "", requirements: "", responsibilities: "", skills: ""
  });

  // Application Review Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [newStatus, setNewStatus] = useState("REVIEWED");
  const [adminNote, setAdminNote] = useState("");

  // Resume Preview Modal (Matching Job Assistance)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewFileType, setPreviewFileType] = useState("pdf");

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  };

  const API_BASE_URL = API_BASE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(true);

  // Fetch Jobs from Backend
  const fetchAdminJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/jobs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.warn("Failed fetching admin jobs, using fallback:", err);
    }
  };

  // Fetch Applications from Backend
  const fetchAdminApps = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.warn("Failed fetching admin applications, using fallback:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAdminJobs(), fetchAdminApps()]);
      setLoading(false);
    };
    initData();
  }, [token]);

  // ── Filtered Applications ──────────────────────────────────────────────────
  const filteredApps = applications.filter((a) => {
    const matchSearch = !search ||
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || a.status === filterStatus;
    const matchJob = filterJob === "ALL" || a.jobTitle === filterJob;
    return matchSearch && matchStatus && matchJob;
  });

  // ── Job Actions ────────────────────────────────────────────────────────────
  const openAddJob = () => {
    setEditingJob(null);
    setJobForm({ title: "", department: "", location: "Remote", type: "FULL_TIME", experience: "", description: "", requirements: "", responsibilities: "", skills: "" });
    setShowJobForm(true);
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title, department: job.department, location: job.location,
      type: job.type, experience: job.experience || "", description: job.description || "",
      requirements: (job.requirements || []).join("\n"),
      responsibilities: (job.responsibilities || []).join("\n"),
      skills: (job.skills || []).join(", ")
    });
    setShowJobForm(true);
  };

  const handleJobSave = async () => {
    if (!jobForm.title.trim() || !jobForm.department.trim()) {
      showFeedback("Job title and department are required.", true);
      return;
    }
    setActionLoading("saveJob");
    try {
      const url = editingJob
        ? `${API_BASE_URL}/api/careers/admin/jobs/${editingJob.id}`
        : `${API_BASE_URL}/api/careers/admin/jobs`;
      const method = editingJob ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(jobForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save job.");
      }

      await fetchAdminJobs();
      showFeedback(editingJob ? "Job updated successfully." : "Job posted successfully! Students can now apply.");
      setShowJobForm(false);
    } catch (err) {
      showFeedback(err.message || "Failed to save job posting.", true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleJob = async (job) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdminJobs();
        showFeedback("Job status updated.");
      }
    } catch (err) {
      showFeedback("Failed to update status.", true);
    }
  };

  const handleToggleHot = async (job) => {
    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, isHot: !j.isHot } : j))
    );
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/jobs/${job.id}/toggle-hot`, {
        method: "PATCH",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!data.success) {
        // Revert optimistic update on failure
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, isHot: job.isHot } : j))
        );
        showFeedback(data.message || "Failed to toggle priority.", true);
      } else {
        showFeedback(data.message);
      }
    } catch (err) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isHot: job.isHot } : j))
      );
      showFeedback("Failed to toggle priority.", true);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdminJobs();
        showFeedback("Job deleted successfully.");
      }
    } catch (err) {
      showFeedback("Failed to delete job.", true);
    }
  };

  // ── Application Review ─────────────────────────────────────────────────────
  const openAppReview = async (app) => {
    setSelectedApp(app);
    setNewStatus(app.status === "PENDING" ? "REVIEWED" : app.status);
    setAdminNote(app.adminNote || "");
    setReviewMode(true);
    setPreviewBlobUrl(null);

    // Fetch candidate resume blob
    if (app.id) {
      setPreviewLoading(true);
      const ext = (app.resumeFileName || "").split(".").pop().toLowerCase();
      setPreviewFileType(ext === "docx" ? "docx" : "pdf");
      try {
        const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications/${app.id}/resume`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
        }
      } catch (err) {
        console.warn("Failed fetching resume blob:", err);
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (shouldSendEmail = false) => {
    if (!selectedApp) return;
    setActionLoading("review");
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications/${selectedApp.id}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus, adminNote, sendEmail: shouldSendEmail }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdminApps();
        if (shouldSendEmail) {
          showFeedback(`Status updated to "${APP_STATUS[newStatus]?.label}" and email sent to applicant!`);
        } else {
          showFeedback(`Application status updated to "${APP_STATUS[newStatus]?.label}".`);
        }
        setReviewMode(false);
        setSelectedApp(null);
      } else {
        throw new Error(data.message || "Failed to update status.");
      }
    } catch (err) {
      showFeedback(err.message || "Failed to update application status.", true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendStatusEmailOnly = async (targetApp = null) => {
    const app = targetApp || selectedApp;
    if (!app) return;
    setActionLoading(`send-email-${app.id}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications/${app.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Status notification email sent to ${app.email}!`);
      } else {
        throw new Error(data.message || "Failed to send email.");
      }
    } catch (err) {
      showFeedback(err.message || "Failed to send email notification.", true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenResumePreview = async (app) => {
    setPreviewApp(app);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewError("");

    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    const fileName = (app.resumeFileName || "").toLowerCase();
    let fileType = "pdf";
    if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      fileType = "docx";
    } else if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".webp")) {
      fileType = "image";
    }
    setPreviewFileType(fileType);

    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications/${app.id}/resume`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to load resume preview");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      console.error("Preview error:", err);
      setPreviewError("Could not load resume preview. You can still download the file directly.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadResume = async (app) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/careers/admin/applications/${app.id}/resume`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = app.resumeFileName || "resume";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      showFeedback("Failed to download resume.", true);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.isActive).length,
    hotJobs: jobs.filter((j) => j.isHot).length,
    totalApps: applications.length,
    pendingReview: applications.filter((a) => a.status === "PENDING").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
  };

  const uniqueJobTitles = ["ALL", ...Array.from(new Set(applications.map((a) => a.jobTitle)))];

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* ── Feedback Toasts ── */}
      {(success || error) && (
        <div className={`fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300`}
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: error ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"
          }}>
          {error ? <XCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{success || error}</p>
        </div>
      )}

      <div className="px-6 md:px-10 py-6 space-y-6 max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-gradient)" }}>
                <Briefcase size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold" style={{ color: "var(--text-primary)" }}>Careers Portal</h1>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage job postings and review candidate applications.</p>
          </div>
          {activeTab === "jobs" && (
            <button
              onClick={openAddJob}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
              style={{ background: "var(--accent-gradient)" }}
            >
              <Plus size={15} />
              Post New Job
            </button>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Jobs", value: stats.totalJobs, color: "#3b82f6" },
            { label: "Active Jobs", value: stats.activeJobs, color: "#10b981" },
            { label: "🔥 Priority Jobs", value: `${stats.hotJobs} / 3`, color: "#f97316" },
            { label: "Total Applications", value: stats.totalApps, color: "#8b5cf6" },
            { label: "Pending Review", value: stats.pendingReview, color: "#f59e0b" },
            { label: "Shortlisted", value: stats.shortlisted, color: "#10b981" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-1 p-1 rounded-xl border w-fit" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
          {[
            { key: "jobs", label: "Job Postings", icon: Briefcase },
            { key: "applications", label: "Applications", icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === key ? "var(--accent-primary)" : "transparent",
                color: activeTab === key ? "white" : "var(--text-muted)",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB: JOB POSTINGS
        ══════════════════════════════════════ */}
        {activeTab === "jobs" && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Briefcase size={32} className="mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>No jobs posted yet</p>
                <button onClick={openAddJob} className="text-xs font-semibold underline cursor-pointer" style={{ color: "var(--accent-primary)" }}>
                  Post the first job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {jobs.map((job) => (
                  <div key={job.id} className="p-5 rounded-2xl border transition-all hover:shadow-md"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-gradient)" }}>
                          <Briefcase size={15} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{job.title}</h3>
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{job.department}</p>
                        </div>
                      </div>
                      {/* Active toggle + Hot toggle */}
                      <div className="flex items-center gap-2">
                        {/* 🔥 Hot / Priority toggle */}
                        <button
                          onClick={() => handleToggleHot(job)}
                          title={job.isHot ? "Remove from Priority" : "Mark as Priority (max 3)"}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                          style={{
                            backgroundColor: job.isHot ? "rgba(249,115,22,0.12)" : "var(--bg-hover)",
                            color: job.isHot ? "#f97316" : "var(--text-muted)",
                            borderColor: job.isHot ? "rgba(249,115,22,0.3)" : "var(--border-primary)",
                          }}
                        >
                          <Flame size={12} />
                          {job.isHot ? "Priority" : "Set Hot"}
                        </button>

                        {/* Active toggle */}
                        <button
                          onClick={() => handleToggleJob(job)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                          style={{
                            backgroundColor: job.isActive ? "rgba(16,185,129,0.1)" : "var(--bg-hover)",
                            color: job.isActive ? "#10b981" : "var(--text-muted)",
                            borderColor: job.isActive ? "rgba(16,185,129,0.2)" : "var(--border-primary)",
                          }}
                        >
                          {job.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {job.isActive ? "Active" : "Paused"}
                        </button>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {job.location === "Remote" ? <Globe size={11} /> : <Building2 size={11} />}
                        {job.location}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-secondary)", borderColor: "var(--border-primary)" }}>
                        {TYPE_LABEL[job.type]}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <Users size={11} />
                        {job.applicants} applicant{job.applicants !== 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        Posted {job.postedAt}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--border-primary)" }}>
                      <button
                        onClick={() => openEditJob(job)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer"
                        style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { setActiveTab("applications"); setFilterJob(job.title); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-[var(--bg-hover)] cursor-pointer"
                        style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                      >
                        <Users size={12} /> View Applications
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-red-500/10 cursor-pointer"
                        style={{ borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: APPLICATIONS
        ══════════════════════════════════════ */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicant name, email, role..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-xl border text-xs font-semibold appearance-none cursor-pointer focus:outline-none"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  <option value="ALL">All Statuses</option>
                  {Object.entries(APP_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>

              {/* Job filter */}
              <div className="relative">
                <select
                  value={filterJob}
                  onChange={(e) => setFilterJob(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-xl border text-xs font-semibold appearance-none cursor-pointer focus:outline-none"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  {uniqueJobTitles.map((t) => <option key={t} value={t}>{t === "ALL" ? "All Jobs" : t}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-primary)" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                      {["Applicant", "Applied For", "Contact", "Applied On", "Status", "Resume"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          {h}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                          No applications match your filters.
                        </td>
                      </tr>
                    ) : filteredApps.map((app, idx) => {
                      const st = APP_STATUS[app.status] || APP_STATUS.PENDING;
                      return (
                        <tr
                          key={app.id}
                          className="border-t transition-colors"
                          style={{
                            borderColor: "var(--border-primary)",
                            backgroundColor: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-secondary)"
                          }}
                        >
                          {/* Applicant */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{app.applicantName}</p>
                              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{app.email}</p>
                            </div>
                          </td>

                          {/* Job */}
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{app.jobTitle}</p>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3">
                            <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{app.mobile}</p>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3">
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{app.appliedAt}</p>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold border whitespace-nowrap"
                              style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}
                            >
                              {st.label}
                            </span>
                          </td>

                          {/* Resume Column (Matching Job Assistance) */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenResumePreview(app)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-all"
                              >
                                <Eye size={11} /> Preview
                              </button>
                              <button
                                onClick={() => handleDownloadResume(app)}
                                title="Download Resume"
                                className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer transition-all"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          </td>

                          {/* Actions (Right Aligned) */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button
                                onClick={() => openAppReview(app)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border hover:bg-[var(--bg-hover)] cursor-pointer transition-all"
                                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                              >
                                <Eye size={12} /> Review
                              </button>

                              <button
                                onClick={() => handleSendStatusEmailOnly(app)}
                                disabled={actionLoading === `send-email-${app.id}`}
                                title="Send Status Notification Email to Candidate"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-all"
                              >
                                <Mail size={12} /> {actionLoading === `send-email-${app.id}` ? "Sending..." : "Send Mail"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Showing {filteredApps.length} of {applications.length} applications
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          JOB FORM MODAL
      ══════════════════════════════════════ */}
      {showJobForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowJobForm(false)}>
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {editingJob ? "Edit Job Posting" : "Post New Job"}
              </h3>
              <button onClick={() => setShowJobForm(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title + Department */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Job Title *", key: "title", placeholder: "e.g. Full Stack Developer" },
                  { label: "Department *", key: "department", placeholder: "e.g. Engineering" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input
                      type="text"
                      value={jobForm[key]}
                      onChange={(e) => setJobForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Location + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Location Type</label>
                  <div className="relative">
                    <select
                      value={jobForm.location}
                      onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full px-3 pr-8 py-2.5 rounded-xl border text-xs appearance-none cursor-pointer focus:outline-none"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Job Type</label>
                  <div className="relative">
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 pr-8 py-2.5 rounded-xl border text-xs appearance-none cursor-pointer focus:outline-none"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <option value="FULL_TIME">Full-time</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="PART_TIME">Part-time</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
              </div>

              {/* Experience + Skills */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Experience Range", key: "experience", placeholder: "e.g. 2-4 years" },
                  { label: "Skills (comma-separated)", key: "skills", placeholder: "e.g. React, Node.js, AWS" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input
                      type="text"
                      value={jobForm[key]}
                      onChange={(e) => setJobForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              {[
                { label: "Job Description", key: "description", placeholder: "Describe the role and what they'll be doing...", rows: 3 },
                { label: "Requirements (one per line)", key: "requirements", placeholder: "3+ years React experience\nStrong problem-solving skills", rows: 3 },
                { label: "Responsibilities (one per line)", key: "responsibilities", placeholder: "Build and maintain web apps\nParticipate in code reviews", rows: 3 },
              ].map(({ label, key, placeholder, rows }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>{label}</label>
                  <textarea
                    value={jobForm[key]}
                    onChange={(e) => setJobForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all resize-none"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}

              {/* Save Button */}
              <button
                onClick={handleJobSave}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                style={{ background: "var(--accent-gradient)" }}
              >
                <Send size={13} />
                {editingJob ? "Save Changes" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          APPLICATION REVIEW DRAWER
      ══════════════════════════════════════ */}
      {reviewMode && selectedApp && (
        <div className="fixed inset-0 z-[9990] flex" onClick={() => { setReviewMode(false); setSelectedApp(null); }}>
          <div className="flex-1" />
          <div
            className="w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
            style={{ backgroundColor: "var(--bg-card)", borderLeft: "1px solid var(--border-primary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Review Application</h3>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{selectedApp.jobTitle}</p>
              </div>
              <button onClick={() => { setReviewMode(false); setSelectedApp(null); }}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Applicant Info */}
              <div className="p-4 rounded-2xl border space-y-2.5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Applicant Info</h4>
                {[
                  { label: "Name", value: selectedApp.applicantName },
                  { label: "Email", value: selectedApp.email },
                  { label: "Mobile", value: selectedApp.mobile },
                  { label: "Applied On", value: selectedApp.appliedAt },
                  { label: "Role", value: selectedApp.jobTitle },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Cover Note</p>
                  <p className="text-xs leading-relaxed p-3 rounded-xl border italic"
                    style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                    "{selectedApp.coverNote}"
                  </p>
                </div>
              )}

              {/* Resume Preview Area */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Resume</p>
                <div className="p-4 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  <div className="flex items-center gap-2">
                    <FileText size={16} style={{ color: "var(--accent-primary)" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{selectedApp.resumeFileName}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Resume document</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenResumePreview(selectedApp)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                    >
                      <Eye size={11} /> Preview
                    </button>
                    <button
                      onClick={() => handleDownloadResume(selectedApp)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "var(--accent-primary)" }}
                    >
                      <Download size={11} /> Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Update Status</p>
                  <button
                    onClick={handleSendStatusEmailOnly}
                    disabled={actionLoading === "send-email"}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Mail size={12} /> {actionLoading === "send-email" ? "Sending..." : "Send Status Email Now"}
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 pr-8 py-2.5 rounded-xl border text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(APP_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>

              {/* Admin Note */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                  Internal Note <span className="text-[9px] font-normal">(optional)</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes about this applicant for your team..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none transition-all"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Update Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleStatusUpdate(false)}
                  disabled={actionLoading === "review"}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                >
                  <CheckCircle2 size={13} />
                  Save Status
                </button>
                <button
                  onClick={() => handleStatusUpdate(true)}
                  disabled={actionLoading === "review"}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  <Mail size={13} />
                  Save & Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Resume Preview Modal (Matching Job Assistance Pattern) ─── */}
      {showPreviewModal && previewApp && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200" onClick={() => setShowPreviewModal(false)}>
          <div className="w-full max-w-4xl h-[85vh] rounded-3xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{previewApp.applicantName} — Resume</h3>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{previewApp.resumeFileName || "Resume document"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadResume(previewApp)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Download size={13} /> Download File
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-black/20 p-4 flex flex-col justify-center items-center overflow-hidden min-h-0">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <Loader2 size={36} className="animate-spin text-emerald-600" />
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Loading document preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] shadow">
                  <AlertTriangle size={36} className="text-amber-500" />
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{previewError}</p>
                  <button
                    onClick={() => handleDownloadResume(previewApp)}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    <Download size={14} /> Download File Directly
                  </button>
                </div>
              ) : previewFileType === "docx" ? (
                <DocxViewer
                  blobUrl={previewBlobUrl}
                  selectedApp={previewApp}
                  onDownload={() => handleDownloadResume(previewApp)}
                />
              ) : previewFileType === "image" ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img src={previewBlobUrl} alt="Resume Preview" className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-[var(--border-primary)]" />
                </div>
              ) : (
                <iframe
                  src={previewBlobUrl ? `${previewBlobUrl}#toolbar=0&navpanes=0` : ""}
                  className="w-full h-full rounded-xl border border-[var(--border-primary)] bg-white shadow-inner"
                  title="Resume Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
