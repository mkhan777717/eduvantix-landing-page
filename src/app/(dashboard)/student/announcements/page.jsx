"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Search, Pin, AlertTriangle, AlertCircle,
  FileText, Download, ExternalLink, Clock, Users, Building2,
  Layers, RefreshCw, Eye, Paperclip, Image as ImageIcon, Sparkles
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

export default function StudentAnnouncementsPage() {
  const { user, token, API_BASE } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL"); // 'ALL' | 'PINNED' | 'URGENT' | 'BATCH'

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  const getHeaders = useCallback(() => ({
    ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "USER" }),
  }), [token]);

  const loadAnnouncements = useCallback(async () => {
    try {
      if (!user) return;
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (selectedFilter === "URGENT") {
        params.append("priority", "URGENT");
      }

      const res = await fetch(`${API_BASE}/api/announcements?${params.toString()}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        let list = data.announcements || [];
        if (selectedFilter === "PINNED") {
          list = list.filter(a => a.isPinned);
        } else if (selectedFilter === "BATCH") {
          list = list.filter(a => a.batchId !== null);
        }
        setAnnouncements(list);
      } else {
        setError(data.message || "Failed to load announcements.");
      }
    } catch (err) {
      setError("Network error while loading announcements.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getHeaders, searchQuery, selectedFilter, user]);

  useEffect(() => {
    if (user) {
      loadAnnouncements();
    }
  }, [user, loadAnnouncements]);

  // Quick download helper
  const handleDownload = (annId, att) => {
    const downloadUrl = `${API_BASE}/api/announcements/${annId}/download/${att.id}?${
      token && !token.startsWith("demo-") ? `token=${encodeURIComponent(token)}` : "x-bypass-auth=true&x-bypass-role=USER"
    }`;
    window.open(downloadUrl, "_blank");
  };

  // Quick view helper
  const handleView = (annId, att) => {
    const viewUrl = `${API_BASE}/api/announcements/${annId}/download/${att.id}?view=true&${
      token && !token.startsWith("demo-") ? `token=${encodeURIComponent(token)}` : "x-bypass-auth=true&x-bypass-role=USER"
    }`;
    window.open(viewUrl, "_blank");
  };

  return (
    <div className="w-full space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Megaphone size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Notice Board &amp; Updates</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Campus &amp; Batch Announcements
          </h1>
          <p className="text-xs max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Stay updated with vital announcements, exam guidelines, timetable alerts, and lecture notes from your batch managers and institute.
          </p>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={loadAnnouncements}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border hover:bg-[var(--bg-hover)] transition-colors self-start md:self-auto cursor-pointer"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates & documents..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs outline-none border transition-all"
            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Filter Pills */}
        <div className="inline-flex p-1 rounded-xl border gap-1 self-start md:self-auto" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}>
          {[
            { id: "ALL", label: "All Updates" },
            { id: "PINNED", label: "Pinned" },
            { id: "URGENT", label: "Urgent Alerts" },
            { id: "BATCH", label: "My Batch Only" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-[var(--accent-primary)] text-white shadow"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin mx-auto text-emerald-400" />
          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Fetching latest notices...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-2">
          <AlertCircle size={24} className="mx-auto text-rose-400" />
          <p className="text-xs font-bold text-rose-400">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-emerald-500/10 text-emerald-400">
            <Megaphone size={24} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>All Caught Up!</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {searchQuery || selectedFilter !== "ALL"
                ? "No announcements matched your search filter."
                : "No announcements have been posted for your batch yet. Check back soon!"}
            </p>
          </div>
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
                  borderColor: ann.isPinned ? "rgba(16,185,129,0.3)" : "var(--border-primary)",
                  boxShadow: ann.isPinned ? "0 4px 20px -4px rgba(16,185,129,0.08)" : undefined,
                }}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Pinned Pill */}
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Pin size={10} className="fill-emerald-400" /> Pinned
                      </span>
                    )}

                    {/* Priority Pill */}
                    {isUrgent ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                        <AlertTriangle size={10} /> Urgent Alert
                      </span>
                    ) : isImportant ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertCircle size={10} /> Important
                      </span>
                    ) : null}

                    {/* Target Scope Badge */}
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {ann.batch ? (
                        <>
                          <Layers size={10} /> Batch: {ann.batch.name}
                        </>
                      ) : (
                        <>
                          <Building2 size={10} /> Campus-Wide Notice
                        </>
                      )}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[11px] flex items-center gap-1 shrink-0" style={{ color: "var(--text-muted)" }}>
                    <Clock size={11} /> {timeAgo(ann.createdAt)}
                  </span>
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
                      Downloadable Materials &amp; Attachments ({ann.attachments.length})
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {ann.attachments.map((att) => {
                        const isPdf = att.fileType?.includes("pdf") || att.fileName?.toLowerCase().endsWith(".pdf");
                        const isImg = att.fileType?.startsWith("image/") || att.fileName?.match(/\.(png|jpe?g|webp|gif|svg)$/i);

                        return (
                          <div
                            key={att.id}
                            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 group transition-all hover:border-[var(--border-accent)]"
                            style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? "bg-rose-500/10 text-rose-400" : isImg ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                {isPdf ? <FileText size={17} /> : isImg ? <ImageIcon size={17} /> : <Paperclip size={17} />}
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

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isImg && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(`${API_BASE}${att.fileUrl}`)}
                                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                  title="Preview Image"
                                >
                                  <Eye size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleView(ann.id, att)}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                title="Open in Browser"
                              >
                                <ExternalLink size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(ann.id, att)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="Download PDF / File"
                              >
                                <Download size={13} />
                                <span>Download</span>
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
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      {ann.author?.username?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span>
                      Posted by <strong style={{ color: "var(--text-primary)" }}>{ann.author?.fullName || ann.author?.username || "Instructor"}</strong> ({ann.author?.role === "BATCH_MANAGER" ? "Batch Manager" : ann.author?.role === "INSTITUTE_ADMIN" ? "Institute Admin" : "Faculty"})
                    </span>
                  </div>
                  <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
