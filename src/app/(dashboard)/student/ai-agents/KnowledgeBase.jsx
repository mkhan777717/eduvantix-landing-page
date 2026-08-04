"use client";

import React, { useState, useEffect, useRef } from "react";
import { getApiBase } from "@/utils/api";
import { UploadCloud, FileText, Search, Loader2, File, CheckCircle2, AlertCircle, RefreshCw, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = getApiBase();

// Client-side limits — must match server
const MAX_FILE_SIZE_MB = 50;
const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md", ".doc", ".docx"];
const ALLOWED_EXTENSIONS_DISPLAY = "PDF, TXT, MD, DOC, DOCX";

// Human-readable failure reason labels
const FAILURE_LABELS = {
  FILE_NOT_FOUND:     "File could not be read from disk",
  FILE_TOO_LARGE:     `File exceeds the ${MAX_FILE_SIZE_MB} MB size limit`,
  UNSUPPORTED_FORMAT: "Unsupported file format",
  PDF_PARSE_ERROR:    "Failed to extract text from PDF",
  EMPTY_CONTENT:      "File appears to be empty or contains no readable text",
  CHUNKING_ERROR:     "Failed to split document into chunks",
  EMBEDDING_TIMEOUT:  "Embedding generation timed out — please retry",
  EMBEDDING_ERROR:    "Embedding generation failed",
  VECTOR_STORE_ERROR: "Failed to save to the vector database",
  UNKNOWN_ERROR:      "An unexpected error occurred",
};

export default function KnowledgeBase({ token }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [expandedFailure, setExpandedFailure] = useState(null); // doc id

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  // Search Tester state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let interval;
    if (token) {
      fetchDocuments();
      interval = setInterval(() => {
        setDocuments((prev) => {
          if (prev.some((d) => d.status === "PROCESSING")) {
            fetchDocuments();
          }
          return prev;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [token]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/memory/knowledge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Client-side validation ─────────────────────────────────────────────────
  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format "${ext}". Allowed: ${ALLOWED_EXTENSIONS_DISPLAY}`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${MAX_FILE_SIZE_MB} MB`;
    }
    return null; // valid
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Client-side guard — catches obvious errors before they hit the server
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({ type: "error", message: validationError });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: "", message: "" });

    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", file.name);
    const ext = file.name.split(".").pop().toUpperCase();
    formData.append("type", ["PDF", "TXT", "MD", "DOC", "DOCX"].includes(ext) ? ext : "OTHER");

    try {
      const res = await fetch(`${API_BASE}/api/ai/memory/knowledge/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: "success", message: "Document uploaded! Processing in the background…" });
        fetchDocuments();
      } else {
        setUploadStatus({ type: "error", message: data.error || "Failed to upload document" });
      }
    } catch (err) {
      setUploadStatus({ type: "error", message: "Network error while uploading" });
    } finally {
      setUploading(false);
    }
  };

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = async (docId) => {
    setRetryingId(docId);
    try {
      const res = await fetch(`${API_BASE}/api/ai/memory/knowledge/${docId}/retry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Optimistically update the UI
        setDocuments((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, status: "PROCESSING", failureReason: null } : d))
        );
        setExpandedFailure(null);
      } else {
        const data = await res.json();
        console.error("Retry failed:", data.error);
      }
    } catch (err) {
      console.error("Retry request failed:", err);
    } finally {
      setRetryingId(null);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/ai/memory/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.results) setSearchResults(data.results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Knowledge Base
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Upload your personal notes, PDFs, and materials. The AI will learn from these and use them in conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Upload & Search */}
        <div className="space-y-6 lg:col-span-1">

          {/* Uploader */}
          <div
            className="rounded-2xl p-5 shadow-sm relative overflow-hidden border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <UploadCloud className="w-5 h-5 text-indigo-500" />
              Upload Material
            </h2>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragging ? "border-indigo-500 bg-indigo-500/10" : "hover:border-indigo-400"
              }`}
              style={!isDragging ? { backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" } : {}}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                accept={ALLOWED_EXTENSIONS.join(",")}
              />
              {uploading ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Uploading and Processing…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: "var(--bg-hover)" }}
                  >
                    <FileText className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Click or drag file</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {ALLOWED_EXTENSIONS_DISPLAY} · Max {MAX_FILE_SIZE_MB} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {uploadStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
                    uploadStatus.type === "success"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  }`}
                >
                  {uploadStatus.type === "success"
                    ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  {uploadStatus.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Tester */}
          <div
            className="rounded-2xl p-5 shadow-sm border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Search className="w-5 h-5 text-purple-500" />
              Test Memory Search
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask something about your docs…"
                className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 px-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.map((result, idx) => (
                <div key={idx} className="p-3 rounded-xl border text-sm" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-purple-500 flex items-center gap-1">
                      <File className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{result.title}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                      Dist: {result.distance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-3 hover:line-clamp-none transition-all" style={{ color: "var(--text-secondary)" }}>
                    "{result.content}"
                  </p>
                </div>
              ))}
              {searchResults.length === 0 && !searching && searchQuery && (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No matching context found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Document Library */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-5 shadow-sm h-full min-h-[400px] border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <h2 className="text-base font-semibold mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <FileText className="w-5 h-5 text-blue-500" />
              Document Library
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-6" style={{ color: "var(--text-secondary)" }}>
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Knowledge Documents Yet</h3>
                <p className="text-xs max-w-sm mb-4 mx-auto" style={{ color: "var(--text-muted)" }}>
                  Upload your study guides, course syllabus, code snippets, or PDFs. Your AI agents will reference this library to tailor their answers to your studies.
                </p>
                <div className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-3.5 max-w-sm mx-auto text-left space-y-1.5" style={{ color: "var(--text-muted)" }}>
                  <p className="font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>💡 Recommended Uploads:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Semester syllabus or exam rubrics</li>
                    <li>Cheat sheets and markdown project notes</li>
                    <li>PDF textbooks or assignment descriptions</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="group border rounded-xl p-4 transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: doc.status === "FAILED" ? "rgba(239,68,68,0.3)" : "var(--border-primary)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                            doc.type === "PDF"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h3
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                            title={doc.title}
                          >
                            {doc.title}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {doc.status === "FAILED" && (
                          <button
                            onClick={() => setExpandedFailure(expandedFailure === doc.id ? null : doc.id)}
                            title="Show failure details"
                            className="w-5 h-5 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-medium tracking-wider ${
                            doc.status === "READY"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                              : doc.status === "PROCESSING"
                              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 animate-pulse"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {doc.status === "FAILED" ? "FAILED" : doc.status}
                        </span>
                      </div>
                    </div>

                    {/* Expandable failure details + Retry */}
                    <AnimatePresence>
                      {doc.status === "FAILED" && expandedFailure === doc.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mt-3 p-3 rounded-lg border text-xs space-y-2"
                            style={{ backgroundColor: "var(--bg-hover)", borderColor: "rgba(239,68,68,0.2)" }}
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-red-400">
                                  {doc.failureReason || "UNKNOWN_ERROR"}
                                </span>
                                <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>
                                  {FAILURE_LABELS[doc.failureReason] || FAILURE_LABELS.UNKNOWN_ERROR}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRetry(doc.id)}
                              disabled={retryingId === doc.id}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
                              style={{ backgroundColor: "var(--accent-primary)", color: "#fff" }}
                            >
                              {retryingId === doc.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                              {retryingId === doc.id ? "Retrying…" : "Retry Ingestion"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
