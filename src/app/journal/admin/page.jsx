"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, Trash2, Search, ExternalLink, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export default function AdminCMSPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("IN_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const fetchAdminArticles = () => {
    setLoading(true);
    const url = `${API}/api/journal/admin/articles?status=${statusFilter}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`;
    fetch(url, {
      headers: buildAuthHeaders(localStorage.getItem("token"), user),
    })
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminArticles();
  }, [statusFilter]);

  const handleApprove = async (article) => {
    try {
      const res = await fetch(`${API}/api/journal/admin/articles/${article.id}/approve`, {
        method: "PUT",
        headers: buildAuthHeaders(localStorage.getItem("token"), user),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      }
    } catch (_) {}
  };

  const handleReject = async (article) => {
    const reason = prompt("Enter rejection reason for author:", rejectionNote || "Does not meet editorial guidelines.");
    if (!reason) return;

    try {
      const res = await fetch(`${API}/api/journal/admin/articles/${article.id}/reject`, {
        method: "PUT",
        headers: buildAuthHeaders(localStorage.getItem("token"), user),
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      }
    } catch (_) {}
  };

  const handleDelete = async (article) => {
    if (!confirm(`Are you sure you want to delete article "${article.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API}/api/journal/articles/${article.slug}`, {
        method: "DELETE",
        headers: buildAuthHeaders(localStorage.getItem("token"), user),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== article.id));
      }
    } catch (_) {}
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10" style={{ color: "var(--j-text)" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b" style={{ borderColor: "var(--j-border)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: "var(--j-accent)" }} />
            <p className="j-eyebrow" style={{ margin: 0, color: "var(--j-accent)" }}>Super Admin Moderation</p>
          </div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
            Journal Editorial & Moderation Suite
          </h1>
          <p className="text-xs mt-1" style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-secondary)" }}>
            Review pending user post requests, approve/publish blogs, and delete posts across the platform.
          </p>
        </div>

        <button
          onClick={fetchAdminArticles}
          className="px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 self-start sm:self-auto"
          style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)", color: "var(--j-text-secondary)" }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-1 p-1 rounded-full border overflow-x-auto" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
          {[
            { id: "IN_REVIEW", label: "Pending Approval" },
            { id: "ALL", label: "All Articles" },
            { id: "PUBLISHED", label: "Published" },
            { id: "DRAFT", label: "Drafts" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-[#3454D1] text-white shadow-sm font-semibold"
                  : "hover:text-[var(--j-accent)] text-[var(--j-text-secondary)]"
              }`}
              style={{ fontFamily: "var(--j-font-mono)" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); fetchAdminArticles(); }}
          className="relative w-full md:w-64"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter title or author..."
            className="w-full pl-8 pr-3 py-1.5 rounded-full border text-xs outline-none"
            style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)", background: "#FFFFFF", color: "var(--j-text)" }}
          />
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--j-text-muted)" }} />
        </form>
      </div>

      {/* Queue */}
      <div className="space-y-4">
        {loading ? (
          <p className="j-mono text-sm py-12 text-center" style={{ color: "var(--j-text-muted)" }}>Loading editorial queue...</p>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center border rounded-lg" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
            <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>No articles found for filter &quot;{statusFilter}&quot;.</p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden" style={{ borderColor: "var(--j-border)", background: "#FFFFFF" }}>
            {articles.map((article) => (
              <div key={article.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--j-bg-secondary)] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="j-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase" style={{
                      background: article.status === "PUBLISHED" ? "rgba(26,115,64,0.12)" : article.status === "IN_REVIEW" ? "rgba(201,122,26,0.12)" : "var(--j-bg-secondary)",
                      color: article.status === "PUBLISHED" ? "#1A7340" : article.status === "IN_REVIEW" ? "#C97A1A" : "var(--j-text-muted)",
                    }}>
                      {article.status}
                    </span>
                    <span className="j-filepath text-xs">{article.filePath}</span>
                  </div>
                  <h4 className="text-base font-semibold leading-snug" style={{ fontFamily: "var(--j-font-heading)" }}>
                    {article.title}
                  </h4>
                  <p className="j-mono text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                    Author: <strong className="text-[var(--j-text)]">{article.author?.fullName || article.author?.username}</strong> ({article.author?.email}) · {article.readTime || 5} min read · Created {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  {article.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1 font-mono">Rejection Note: {article.rejectionReason}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {article.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handleApprove(article)}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-white flex items-center gap-1 transition-opacity hover:opacity-90"
                      style={{ fontFamily: "var(--j-font-mono)", background: "#1A7340" }}
                    >
                      <CheckCircle size={12} /> Approve & Publish
                    </button>
                  )}

                  {article.status === "IN_REVIEW" && (
                    <button
                      onClick={() => handleReject(article)}
                      className="px-3 py-1.5 rounded text-xs font-medium text-amber-700 bg-amber-50 border border-amber-300 flex items-center gap-1 transition-colors hover:bg-amber-100"
                      style={{ fontFamily: "var(--j-font-mono)" }}
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  )}

                  <Link
                    href={`/journal/article/${article.slug}`}
                    target="_blank"
                    className="p-1.5 rounded border text-xs transition-colors hover:border-[var(--j-accent)]"
                    style={{ borderColor: "var(--j-border)", color: "var(--j-text-secondary)" }}
                    title="Preview article"
                  >
                    <ExternalLink size={14} />
                  </Link>

                  {/* Super Admin Delete Button */}
                  <button
                    onClick={() => handleDelete(article)}
                    className="p-1.5 rounded border text-xs text-red-600 hover:bg-red-50 border-red-200 transition-colors"
                    title="Delete Article (Super Admin)"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
