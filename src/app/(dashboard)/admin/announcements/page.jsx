"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Plus, Search, Filter, Pin, AlertTriangle, AlertCircle,
  FileText, Download, ExternalLink, Trash2, Edit3, X, Check, Upload,
  Image as ImageIcon, Eye, Clock, Users, Building2, Layers, ChevronDown,
  RefreshCw, Sparkles, Paperclip, MoreVertical, ShieldAlert
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { renderMarkdown } from "@/lib/renderMarkdown";

// Helper: Format file size
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Helper: Time-ago formatter
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { user, token, API_BASE, loading: authLoading } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("ALL");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPriority, setFormPriority] = useState("NORMAL");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formBatchId, setFormBatchId] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  // Delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const isInstAdmin = user?.role === "INSTITUTE_ADMIN" || user?.role === "ADMIN";
  const isBatchMgr = user?.role === "BATCH_MANAGER";

  // Permission Guard
  useEffect(() => {
    if (!authLoading && user && user.role !== "ADMIN" && user.role !== "INSTITUTE_ADMIN" && user.role !== "BATCH_MANAGER" && user.role !== "MENTOR") {
      router.replace("/student/announcements");
    }
  }, [user, authLoading, router]);

  const getHeaders = useCallback(() => ({
    ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": user?.role || "INSTITUTE_ADMIN" }),
  }), [token, user]);

  // Load Batches
  const loadBatches = useCallback(async () => {
    try {
      if (!token) return;
      const endpoint = isInstAdmin
        ? `${API_BASE}/api/batches`
        : `${API_BASE}/api/batches/batch-manager/batches`;

      const res = await fetch(endpoint, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.batches)) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  }, [API_BASE, getHeaders, isInstAdmin, token]);

  // Load Announcements
  const loadAnnouncements = useCallback(async () => {
    try {
      if (!token) return;
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (selectedBatchFilter !== "ALL") {
        params.append("batchId", selectedBatchFilter);
      }
      if (selectedPriorityFilter !== "ALL") {
        params.append("priority", selectedPriorityFilter);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`${API_BASE}/api/announcements?${params.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnnouncements(data.announcements || []);
      } else {
        setError(data.message || "Failed to load announcements.");
      }
    } catch (err) {
      setError("Network error while fetching announcements.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getHeaders, selectedBatchFilter, selectedPriorityFilter, searchQuery, token]);

  useEffect(() => {
    if (user) {
      loadBatches();
      loadAnnouncements();
    }
  }, [user, loadBatches, loadAnnouncements]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormTitle("");
    setFormContent("");
    setFormPriority("NORMAL");
    setFormIsPinned(false);
    setFormBatchId(isBatchMgr && batches.length > 0 ? batches[0].id.toString() : "all");
    setSelectedFiles([]);
    setExistingAttachments([]);
    setRemovedAttachmentIds([]);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormContent(ann.content);
    setFormPriority(ann.priority || "NORMAL");
    setFormIsPinned(!!ann.isPinned);
    setFormBatchId(ann.batchId ? ann.batchId.toString() : "all");
    setSelectedFiles([]);
    setExistingAttachments(ann.attachments || []);
    setRemovedAttachmentIds([]);
    setIsModalOpen(true);
  };

  // Handle file select
  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    // Limit to 10 total
    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 10));
    e.target.value = "";
  };

  const removeNewFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingAttachment = (attId) => {
    setExistingAttachments(prev => prev.filter(a => a.id !== attId));
    setRemovedAttachmentIds(prev => [...prev, attId]);
  };

  // Submit announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please provide a title for the announcement.");
      return;
    }
    if (!formContent.trim()) {
      alert("Please write announcement content.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("content", formContent.trim());
      formData.append("priority", formPriority);
      formData.append("isPinned", formIsPinned);
      formData.append("batchId", formBatchId === "all" ? "" : formBatchId);

      // Append new files
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });

      let endpoint = `${API_BASE}/api/announcements`;
      let method = "POST";

      if (editingAnnouncement) {
        endpoint = `${API_BASE}/api/announcements/${editingAnnouncement.id}`;
        method = "PUT";
        if (removedAttachmentIds.length > 0) {
          formData.append("removedAttachmentIds", JSON.stringify(removedAttachmentIds));
        }
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
            ? { Authorization: `Bearer ${token}` }
            : { "x-bypass-auth": "true", "x-bypass-role": user?.role || "ADMIN" }),
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setSuccessMsg(editingAnnouncement ? "Announcement updated successfully!" : "Announcement posted successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
        loadAnnouncements();
      } else {
        alert(data.message || "Failed to save announcement.");
      }
    } catch (err) {
      alert("An error occurred while saving the announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Announcement
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/announcements/${deleteTargetId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteTargetId(null);
        setSuccessMsg("Announcement deleted.");
        setTimeout(() => setSuccessMsg(""), 4000);
        loadAnnouncements();
      } else {
        alert(data.message || "Failed to delete announcement.");
      }
    } catch (err) {
      alert("Error deleting announcement.");
    } finally {
      setDeleting(false);
    }
  };

  // Quick download helper
  const handleDownload = (annId, att) => {
    const downloadUrl = `${API_BASE}/api/announcements/${annId}/download/${att.id}?${
      token && !token.startsWith("demo-") ? `token=${encodeURIComponent(token)}` : "x-bypass-auth=true&x-bypass-role=ADMIN"
    }`;
    window.open(downloadUrl, "_blank");
  };

  // Quick view helper
  const handleView = (annId, att) => {
    const viewUrl = `${API_BASE}/api/announcements/${annId}/download/${att.id}?view=true&${
      token && !token.startsWith("demo-") ? `token=${encodeURIComponent(token)}` : "x-bypass-auth=true&x-bypass-role=ADMIN"
    }`;
    window.open(viewUrl, "_blank");
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: announcements.length,
      pinned: announcements.filter(a => a.isPinned).length,
      urgent: announcements.filter(a => a.priority === "URGENT").length,
      withFiles: announcements.filter(a => a.attachments?.length > 0).length,
    };
  }, [announcements]);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-hover)] text-[var(--accent-primary)] border border-[var(--border-primary)]">
              <Megaphone size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Notice Board &amp; Broadcasting</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Announcements Hub
          </h1>
          <p className="text-xs max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Broadcast notices, timetable updates, and share downloadable PDFs &amp; images with your institute batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:opacity-90 bg-[var(--text-primary)] text-[var(--bg-primary)]"
          >
            <Plus size={15} />
            <span>Post Announcement</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] flex items-center gap-3 animate-in fade-in shadow-sm">
          <Check size={16} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-bold text-[var(--text-primary)]">{successMsg}</p>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Broadcasts", value: stats.total, icon: Megaphone, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pinned Notices", value: stats.pinned, icon: Pin, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Urgent Alerts", value: stats.urgent, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "With Attachments", value: stats.withFiles, icon: Paperclip, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
              <item.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs outline-none border transition-all"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Priority & Batch Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Target Batch Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Batch:</span>
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold outline-none border cursor-pointer"
              style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              <option value="ALL">All Broadcasts</option>
              <option value="institute">Campus-Wide Only</option>
              {batches.map(b => (
                <option key={b.id} value={b.id.toString()}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Pills */}
          <div className="inline-flex p-1 rounded-xl border gap-1" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}>
            {["ALL", "URGENT", "IMPORTANT", "NORMAL"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  selectedPriorityFilter === p
                    ? "bg-[var(--accent-primary)] text-white shadow"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin mx-auto text-[var(--accent-primary)]" />
          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Loading announcements...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-2">
          <AlertCircle size={24} className="mx-auto text-rose-400" />
          <p className="text-xs font-bold text-rose-400">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
            <Megaphone size={22} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>No announcements yet</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {searchQuery || selectedBatchFilter !== "ALL" || selectedPriorityFilter !== "ALL"
                ? "No announcements matched your search and filter criteria."
                : "Post your first announcement to share updates, PDF materials, and alerts with your institute batches."}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all hover:opacity-90 bg-[var(--text-primary)] text-[var(--bg-primary)]"
          >
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isUrgent = ann.priority === "URGENT";
            const isImportant = ann.priority === "IMPORTANT";

            return (
              <div
                key={ann.id}
                className="p-6 rounded-3xl border transition-all hover:shadow-md space-y-4 relative overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: ann.isPinned ? "var(--border-accent)" : "var(--border-primary)",
                }}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Pinned Pill */}
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Pin size={10} className="fill-violet-400" /> Pinned
                      </span>
                    )}

                    {/* Priority Pill */}
                    {isUrgent ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                        <AlertTriangle size={10} /> Urgent Notice
                      </span>
                    ) : isImportant ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertCircle size={10} /> Important
                      </span>
                    ) : null}

                    {/* Target Batch Badge */}
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                      {ann.batch ? (
                        <>
                          <Layers size={10} /> Batch: {ann.batch.name}
                        </>
                      ) : (
                        <>
                          <Building2 size={10} /> Campus-Wide (All Batches)
                        </>
                      )}
                    </span>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Clock size={11} /> {timeAgo(ann.createdAt)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="p-1.5 rounded-lg border hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        style={{ borderColor: "var(--border-primary)" }}
                        title="Edit Announcement"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(ann.id)}
                        className="p-1.5 rounded-lg border hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                        style={{ borderColor: "var(--border-primary)" }}
                        title="Delete Announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    {ann.title}
                  </h3>
                  <div
                    className="prose-sm text-xs leading-relaxed max-w-none"
                    style={{ color: "var(--text-secondary)" }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(ann.content) }}
                  />
                </div>

                {/* Attachments Section */}
                {ann.attachments && ann.attachments.length > 0 && (
                  <div className="pt-3 border-t space-y-3" style={{ borderColor: "var(--border-primary)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Attached Files &amp; Media ({ann.attachments.length})
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {ann.attachments.map((att) => {
                        const isPdf = att.fileType?.includes("pdf") || att.fileName?.toLowerCase().endsWith(".pdf");
                        const isImg = att.fileType?.startsWith("image/") || att.fileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i);

                        return (
                          <div
                            key={att.id}
                            className="p-3 rounded-2xl border flex items-center justify-between gap-3 group transition-all hover:border-[var(--border-accent)]"
                            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? "bg-rose-500/10 text-rose-400" : isImg ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                {isPdf ? <FileText size={15} /> : isImg ? <ImageIcon size={15} /> : <Paperclip size={15} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }} title={att.fileName}>
                                  {att.fileName}
                                </p>
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                  {formatBytes(att.fileSize)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isImg && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(`${API_BASE}${att.fileUrl}`)}
                                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                  title="Preview Image"
                                >
                                  <Eye size={13} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleView(ann.id, att)}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                title="Open in Browser"
                              >
                                <ExternalLink size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(ann.id, att)}
                                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                title="Download File"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Author footer */}
                <div className="flex items-center justify-between text-[11px] pt-2" style={{ color: "var(--text-muted)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-[10px]">
                      {ann.author?.username?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span>
                      Posted by <strong style={{ color: "var(--text-primary)" }}>{ann.author?.fullName || ann.author?.username || "Instructor"}</strong> ({ann.author?.role === "INSTITUTE_ADMIN" ? "Institute Admin" : ann.author?.role === "BATCH_MANAGER" ? "Batch Manager" : ann.author?.role === "ADMIN" ? "Administrator" : "Faculty"})
                    </span>
                  </div>
                  <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT ANNOUNCEMENT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-primary)]">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                      {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                    </h2>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      Target specific batches or send a campus-wide broadcast
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                    Announcement Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Schedule for Mid-Term Python Exam & Submission Guidelines"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-all"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>

                {/* Targeting & Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Target Batch */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      Target Audience
                    </label>
                    <select
                      value={formBatchId}
                      onChange={(e) => setFormBatchId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none border cursor-pointer"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      {isInstAdmin && <option value="all">Campus-Wide (All Batches)</option>}
                      {batches.map((b) => (
                        <option key={b.id} value={b.id.toString()}>
                          Batch: {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Level */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      Priority Level
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none border cursor-pointer"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <option value="NORMAL">Normal (Informative)</option>
                      <option value="IMPORTANT">Important (Attention Required)</option>
                      <option value="URGENT">Urgent (High Alert)</option>
                    </select>
                  </div>

                  {/* Pin Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      Pin to Top
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormIsPinned(!formIsPinned)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formIsPinned
                          ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                          : "border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Pin size={13} className={formIsPinned ? "fill-violet-400" : ""} />
                      <span>{formIsPinned ? "Pinned to Top" : "Standard Order"}</span>
                    </button>
                  </div>
                </div>

                {/* Content Area (Markdown Supported) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                      Announcement Content (Markdown Supported) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">Supports headings, lists, bold text, code, links</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Write announcement details here... Markdown formatted text is supported."
                    className="w-full p-3.5 rounded-2xl text-xs outline-none border transition-all resize-y font-sans leading-relaxed"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>

                {/* Existing Attachments (if editing) */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                      Current Attachments
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {existingAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className="text-rose-400 shrink-0" />
                            <span className="text-xs truncate font-medium" style={{ color: "var(--text-primary)" }}>
                              {att.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingAttachment(att.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                            title="Remove file"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                    Attach PDF Documents &amp; Images (Max 25MB each)
                  </label>

                  <div className="p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-2 relative transition-all hover:border-[var(--border-accent)]" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-input)" }}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.doc,.docx,.txt"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                      <Upload size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                        Click to upload or drag &amp; drop files here
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        PDF documents, assignment briefs, slides, PNG, JPEG (up to 10 files)
                      </p>
                    </div>
                  </div>

                  {/* Selected New Files Chips */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip size={13} className="text-emerald-400 shrink-0" />
                            <span className="text-xs truncate font-medium" style={{ color: "var(--text-primary)" }}>
                              {file.name}
                            </span>
                            <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>
                              ({formatBytes(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer bg-[var(--text-primary)] text-[var(--bg-primary)]"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone size={13} />
                        <span>{editingAnnouncement ? "Update Broadcast" : "Publish Broadcast"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-zoom-out"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={previewImage}
              alt="Attachment Preview"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl border"
              style={{ borderColor: "var(--border-primary)" }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl border p-6 space-y-4 shadow-2xl"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-400">
                <Trash2 size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Delete Announcement?
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  This will permanently delete the broadcast and all attached PDFs/images. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-[var(--bg-hover)] cursor-pointer"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
