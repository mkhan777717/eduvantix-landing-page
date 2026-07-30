"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileText, Search, Download, ExternalLink, Clock, AlertCircle,
  Folder, ArrowLeft
} from "lucide-react";

export default function StudentMaterialsPage() {
  const { user, token, API_BASE } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "USER" })
  }), [token]);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/viva/materials`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setMaterials(data.materials);
      else setError(data.message || "Failed to load study materials.");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getHeaders]);

  useEffect(() => {
    if (user) fetchMaterials();
  }, [user, fetchMaterials]);

  // Group by subjects for folders
  const subjects = useMemo(() => {
    const subs = new Set(materials.map(m => m.subject).filter(Boolean));
    return Array.from(subs).sort((a, b) => a.localeCompare(b));
  }, [materials]);

  // Filtered notes based on subject and search query
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject ? m.subject === selectedSubject : true;
      return matchesSearch && matchesSubject;
    });
  }, [materials, searchQuery, selectedSubject]);

  const handleDownload = (id) => {
    const url = `${API_BASE}/api/viva/materials/${id}/download`;
    const downloadUrl = token && !token.startsWith("demo-") && !token.startsWith("local-")
      ? `${url}?token=${encodeURIComponent(token)}`
      : `${url}?x-bypass-auth=true&x-bypass-role=USER`;
    window.open(downloadUrl, "_blank");
  };

  const handleView = (id) => {
    const url = `${API_BASE}/api/viva/materials/${id}/view`;
    const viewUrl = token && !token.startsWith("demo-") && !token.startsWith("local-")
      ? `${url}?token=${encodeURIComponent(token)}`
      : `${url}?x-bypass-auth=true&x-bypass-role=USER`;
    window.open(viewUrl, "_blank");
  };

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <FileText size={12} className="text-violet-500 animate-pulse" />
            CLASS NOTES CENTER
          </div>
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Study Materials
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Access class notes and documents taught in your batches.
          </p>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-2xl border border-[var(--border-primary)] bg-rose-500/10 border-rose-500/20 flex items-center space-x-3">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <p className="text-sm font-semibold text-rose-500">{error}</p>
        </div>
      )}

      {/* Search & Filter Options */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 opacity-40" style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          placeholder="Search documents by title or filename..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none transition-colors focus:border-[var(--text-muted)]"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Grid: Folder List or Note List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-accent)" }} />
        </div>
      ) : !selectedSubject ? (
        /* Folder View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Subjects ({subjects.length})
            </span>
          </div>

          {subjects.length === 0 ? (
            <div className="p-12 rounded-2xl border border-[var(--border-primary)] border-dashed text-center space-y-4 shadow-sm" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border"
                   style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <Folder size={24} className="text-[var(--accent-primary)]" />
              </div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>No subjects or notes found</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Notes uploaded by batch managers will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map(subject => {
                const count = materials.filter(m => m.subject === subject).length;
                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className="group p-6 rounded-2xl border border-[var(--border-primary)] text-left flex items-start gap-4 transition-colors hover:bg-[var(--bg-secondary)] shadow-sm cursor-pointer"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                  >
                    <div className="p-4 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shrink-0">
                      <Folder size={24} className="fill-current" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-semibold truncate group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: "var(--text-primary)" }}>
                        {subject}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Polaris School Of Technology
                      </p>
                      <p className="text-[11px] font-medium text-[var(--accent-primary)] pt-1">
                        {count} note{count !== 1 ? "s" : ""} available
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Notes Inside Selected Folder */
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedSubject("")}
              className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer text-zinc-400 flex items-center justify-center"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-2xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
                {selectedSubject}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Showing {filteredMaterials.length} documents
              </p>
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="p-8 rounded-3xl border border-[var(--border-primary)] border-dashed text-center" style={{ borderColor: "var(--border-primary)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No documents match your query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map(m => (
                <div key={m.id} className="p-5 rounded-2xl border border-[var(--border-primary)] flex flex-col justify-between space-y-4 shadow-sm hover:bg-[var(--bg-secondary)] transition-colors"
                     style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500">
                        {m.subject}
                      </span>
                      <span className="text-[10px] flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                        <Clock size={11} />
                        {new Date(m.uploadDate || m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {m.title}
                      </h3>
                      <p className="text-xs truncate font-mono" style={{ color: "var(--text-secondary)" }}>
                        {m.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t gap-2" style={{ borderColor: "var(--border-primary)" }}>
                    <button
                      onClick={() => handleView(m.id)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-primary)] transition-colors cursor-pointer hover:bg-[var(--bg-secondary)]"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                    >
                      <ExternalLink size={13} />
                      <span>Read</span>
                    </button>
                    <button
                      onClick={() => handleDownload(m.id)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-on-accent)] shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                      style={{ background: "var(--accent-primary)" }}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
