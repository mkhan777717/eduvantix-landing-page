"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, FolderPlus, Clock, BookOpen, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export default function PersonalLibraryPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("bookmarks"); // 'bookmarks' | 'collections' | 'history'
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newCollectionScope, setNewCollectionScope] = useState("PERSONAL");

  useEffect(() => {
    const headers = buildAuthHeaders(token, user);

    Promise.all([
      fetch(`${API}/api/journal/bookmarks`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/journal/collections`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/journal/continue-reading`, { headers }).then((res) => res.json()),
    ])
      .then(([bmData, colData, histData]) => {
        setBookmarks(bmData.bookmarks || []);
        setCollections(colData.collections || []);
        setHistory(histData.articles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, token]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;
    try {
      const res = await fetch(`${API}/api/journal/collections`, {
        method: "POST",
        headers: buildAuthHeaders(token, user),
        body: JSON.stringify({ title: newCollectionTitle, scope: newCollectionScope }),
      });
      const data = await res.json();
      if (data.collection) {
        setCollections((prev) => [data.collection, ...prev]);
        setNewCollectionTitle("");
      }
    } catch (_) {}
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-12" style={{ color: "var(--j-text)" }}>

      {/* Back arrow navigation */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors hover:text-[var(--j-accent)]"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
      >
        <ArrowLeft size={14} /> Back to Journal
      </Link>

      {/* Header */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: "var(--j-border)" }}>
        <p className="j-eyebrow mb-1">Personal Knowledge Hub</p>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
          My Library & Collections
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-8 border-b pb-3" style={{ borderColor: "var(--j-border)" }}>
        {[
          { id: "bookmarks", label: `Bookmarks (${bookmarks.length})` },
          { id: "collections", label: `Collections (${collections.length})` },
          { id: "history", label: `Continue Reading (${history.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3.5 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              fontFamily: "var(--j-font-mono)",
              background: activeTab === tab.id ? "var(--j-accent-light)" : "transparent",
              color: activeTab === tab.id ? "var(--j-accent)" : "var(--j-text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="j-mono text-sm py-12 text-center" style={{ color: "var(--j-text-muted)" }}>Loading library...</p>
      ) : (
        <>
          {/* TAB 1: BOOKMARKS */}
          {activeTab === "bookmarks" && (
            <div className="space-y-4">
              {bookmarks.length === 0 ? (
                <p className="j-mono text-sm py-8" style={{ color: "var(--j-text-muted)" }}>No bookmarked articles yet.</p>
              ) : (
                bookmarks.map((bm, i) => (
                  <div key={i} className="p-4 rounded border flex items-center justify-between" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                    <div>
                      <span className="j-filepath text-xs">{bm.article?.filePath}</span>
                      <Link href={`/journal/article/${bm.article?.slug}`} className="text-base font-semibold block hover:underline" style={{ fontFamily: "var(--j-font-heading)" }}>
                        {bm.article?.title}
                      </Link>
                    </div>
                    <Link href={`/journal/article/${bm.article?.slug}`} className="j-mono text-xs" style={{ color: "var(--j-accent)" }}>
                      Read →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: COLLECTIONS */}
          {activeTab === "collections" && (
            <div className="space-y-8">

              {/* Create Collection Form */}
              <form onSubmit={handleCreateCollection} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  placeholder="New Collection Name (e.g. My DSA Prep)..."
                  className="flex-1 px-3 py-2 text-xs rounded border outline-none"
                  style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)" }}
                />
                <select
                  value={newCollectionScope}
                  onChange={(e) => setNewCollectionScope(e.target.value)}
                  className="px-2 py-2 text-xs rounded border bg-transparent"
                  style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)" }}
                >
                  <option value="PERSONAL">PERSONAL</option>
                  <option value="SHARED">SHARED</option>
                  <option value="INSTITUTE">INSTITUTE</option>
                  <option value="BATCH">BATCH</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-medium text-white"
                  style={{ fontFamily: "var(--j-font-mono)", background: "var(--j-accent)" }}
                >
                  Create
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map((col) => (
                  <div key={col.id} className="p-5 rounded-lg border" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                    <span className="j-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--j-accent-light)", color: "var(--j-accent)" }}>
                      {col.scope}
                    </span>
                    <h3 className="text-lg font-semibold mt-2" style={{ fontFamily: "var(--j-font-heading)" }}>{col.title}</h3>
                    <p className="j-mono text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>{col._count?.items || 0} articles</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONTINUE READING */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="j-mono text-sm py-8" style={{ color: "var(--j-text-muted)" }}>No in-progress articles found.</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="p-4 rounded border flex items-center justify-between" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                    <div>
                      <span className="j-filepath text-xs">{h.article?.filePath}</span>
                      <Link href={`/journal/article/${h.article?.slug}`} className="text-base font-semibold block hover:underline" style={{ fontFamily: "var(--j-font-heading)" }}>
                        {h.article?.title}
                      </Link>
                      <p className="j-mono text-xs mt-1" style={{ color: "var(--j-accent)" }}>{Math.round((h.progress || 0) * 100)}% completed</p>
                    </div>
                    <Link href={`/journal/article/${h.article?.slug}`} className="j-mono text-xs" style={{ color: "var(--j-accent)" }}>
                      Resume →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
