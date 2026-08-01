"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle, XCircle, Star, Calendar, Mail, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export default function AdminCMSPage() {
  const { user } = useAuth();
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionNote, setRejectionNote] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/journal/latest?limit=30`)
      .then((res) => res.json())
      .then((data) => {
        setReviewQueue(data.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (slug) => {
    try {
      await fetch(`${API}/api/journal/articles/${slug}/publish`, {
        method: "POST",
        headers: buildAuthHeaders(localStorage.getItem("token"), user),
      });
      setReviewQueue((prev) => prev.filter((a) => a.slug !== slug));
    } catch (_) {}
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-12" style={{ color: "var(--j-text)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: "var(--j-border)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: "var(--j-accent)" }} />
            <p className="j-eyebrow" style={{ margin: 0, color: "var(--j-accent)" }}>Editorial Moderation</p>
          </div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
            Admin CMS & Moderation Suite
          </h1>
        </div>
      </div>

      {/* Queue */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
          Editorial Review Queue
        </h3>

        {loading ? (
          <p className="j-mono text-sm py-8 text-center" style={{ color: "var(--j-text-muted)" }}>Loading review queue...</p>
        ) : (
          <div className="divide-y border-y" style={{ borderColor: "var(--j-border)" }}>
            {reviewQueue.map((article) => (
              <div key={article.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="j-filepath text-xs">{article.filePath}</span>
                  <h4 className="text-base font-semibold leading-snug" style={{ fontFamily: "var(--j-font-heading)" }}>
                    {article.title}
                  </h4>
                  <p className="j-mono text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                    By {article.author?.fullName || article.author?.username} · {article.readTime} min read
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(article.slug)}
                    className="px-3 py-1.5 rounded text-xs font-medium text-white flex items-center gap-1"
                    style={{ fontFamily: "var(--j-font-mono)", background: "#1A7340" }}
                  >
                    <CheckCircle size={12} /> Approve & Publish
                  </button>
                  <Link
                    href={`/journal/article/${article.slug}`}
                    className="px-3 py-1.5 rounded text-xs font-medium border"
                    style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)", color: "var(--j-text-secondary)" }}
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
