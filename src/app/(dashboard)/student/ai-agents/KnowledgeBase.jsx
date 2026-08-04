"use client";

import React, { useState, useEffect, useRef } from "react";
import { getApiBase } from "@/utils/api";
import { UploadCloud, FileText, Search, Loader2, File, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = getApiBase();

export default function KnowledgeBase({ token }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        setDocuments(prev => {
          if (prev.some(d => d.status === 'PROCESSING')) {
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
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    setUploadStatus({ type: "", message: "" });
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", file.name);
    // Simple extension checking
    const ext = file.name.split('.').pop().toUpperCase();
    formData.append("type", ext === "PDF" || ext === "TXT" || ext === "MD" ? ext : "OTHER");

    try {
      const res = await fetch(`${API_BASE}/api/ai/memory/knowledge/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setUploadStatus({ type: "success", message: "Document uploaded successfully! It is now being processed." });
        fetchDocuments(); // Refresh list
      } else {
        setUploadStatus({ type: "error", message: data.error || "Failed to upload document" });
      }
    } catch (err) {
      setUploadStatus({ type: "error", message: "Network error while uploading" });
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = () => setIsDragging(false);
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/memory/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
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
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Knowledge Base</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Upload your personal notes, PDFs, and materials. The AI will learn from these and use them in conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload & Search */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Uploader */}
          <div className="rounded-2xl p-5 shadow-sm relative overflow-hidden group border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <UploadCloud className="w-5 h-5 text-indigo-500" />
              Upload Material
            </h2>
            
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
                ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-indigo-400'}
              `}
              style={!isDragging ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' } : {}}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                accept=".pdf,.txt,.md"
              />
              
              {uploading ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Uploading and Processing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <FileText className="w-6 h-6 group-hover:text-indigo-500 transition-colors" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Click or drag file</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Supports PDF, TXT, MD</p>
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
                    uploadStatus.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  }`}
                >
                  {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  {uploadStatus.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Tester */}
          <div className="rounded-2xl p-5 shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Search className="w-5 h-5 text-purple-500" />
              Test Memory Search
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask something about your docs..."
                className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
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
                <div key={idx} className="p-3 rounded-xl border text-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-purple-500 flex items-center gap-1">
                      <File className="w-3 h-3 shrink-0" /> <span className="truncate max-w-[120px]">{result.title}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      Dist: {result.distance.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-3 hover:line-clamp-none transition-all" style={{ color: 'var(--text-secondary)' }}>
                    "{result.content}"
                  </p>
                </div>
              ))}
              {searchResults.length === 0 && !searching && searchQuery && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No matching context found.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Document Library */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-5 shadow-sm h-full min-h-[400px] border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-base font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-5 h-5 text-blue-500" />
              Document Library
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="group border rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:border-blue-500/50" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 shrink-0 rounded-lg flex items-center justify-center
                          ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}
                        `}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} title={doc.title}>
                            {doc.title}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`
                        text-[10px] px-2 py-1 rounded-full font-medium tracking-wider shrink-0
                        ${doc.status === 'READY' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 
                          doc.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 animate-pulse' : 
                          'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}
                      `}>
                        {doc.status}
                      </div>
                    </div>
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
