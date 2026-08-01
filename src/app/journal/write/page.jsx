"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Save, Eye, CheckCircle2, Clock, FileCode, Search, Sparkles, AlertCircle,
  Shield, ChevronRight, X, Image as ImageIcon, Send, ArrowLeft, Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders } from "@/utils/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function JournalEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [filePath, setFilePath] = useState("/dsa/my-article.md");
  const [slug, setSlug] = useState("");
  const [savedSlug, setSavedSlug] = useState(editSlug || null);
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [rejectionReason, setRejectionReason] = useState("");
  const [categories, setCategories] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // UI Drawer states
  const [activeDrawer, setActiveDrawer] = useState(null); // 'seo' | 'workflow' | 'blocks' | 'revisions'
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalResults, setInternalResults] = useState(null);

  // 1. Fetch categories & load existing article if editing
  useEffect(() => {
    fetch(`${API}/api/journal/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    if (editSlug) {
      fetch(`${API}/api/journal/articles/${editSlug}`)
        .then((res) => res.json())
        .then((data) => {
          const a = data.article;
          if (a) {
            setTitle(a.title || "");
            setSubtitle(a.subtitle || "");
            setFilePath(a.filePath || "");
            setSlug(a.slug || "");
            setSavedSlug(a.slug);
            setExcerpt(a.excerpt || "");
            setContentHtml(a.contentHtml || "");
            setCoverImage(a.coverImage || "");
            setDifficulty(a.difficulty || "BEGINNER");
            setCategoryId(a.categoryId ? String(a.categoryId) : "");
            setStatus(a.status || "DRAFT");
            setRejectionReason(a.rejectionReason || "");
          }
        })
        .catch(() => {});
    }
  }, [editSlug]);

  // 2. Auto-generate slug from title if not set
  useEffect(() => {
    if (title && !slug && !savedSlug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }, [title, slug, savedSlug]);

  // 3. Calculated metrics
  const wordCount = contentHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 4. Autosave timer (every 15s)
  useEffect(() => {
    if (!title.trim()) return;
    const tid = setInterval(() => {
      handleSaveArticle(true);
    }, 15000);
    return () => clearInterval(tid);
  }, [title, subtitle, contentHtml, filePath, slug, savedSlug, status]);

  // 5. Internal link search (@ trigger)
  useEffect(() => {
    if (!internalSearchQuery.trim()) { setInternalResults(null); return; }
    const tid = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/journal/internal-entities?q=${encodeURIComponent(internalSearchQuery)}`);
        const data = await res.json();
        setInternalResults(data);
      } catch { setInternalResults(null); }
    }, 200);
    return () => clearTimeout(tid);
  }, [internalSearchQuery]);

  // Save / Publish API Handler
  const handleSaveArticle = async (isAutosave = false, overrideStatus = null) => {
    if (!title.trim()) {
      if (!isAutosave) alert("Please enter an article title.");
      return;
    }
    setSaving(true);

    const targetStatus = overrideStatus || status;
    const targetSlug = savedSlug || slug || `article-${Date.now()}`;

    try {
      const payload = {
        title,
        subtitle,
        filePath: filePath || `/dsa/${targetSlug}.md`,
        slug: targetSlug,
        excerpt,
        content: JSON.stringify({ html: contentHtml }),
        contentHtml,
        coverImage,
        difficulty,
        readTime: readTimeMinutes,
        status: targetStatus,
        categoryId: categoryId ? parseInt(categoryId) : null,
      };

      const url = savedSlug
        ? `${API}/api/journal/articles/${savedSlug}`
        : `${API}/api/journal/articles`;
      const method = savedSlug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders(localStorage.getItem("token"), user),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.article) {
        setSavedSlug(data.article.slug);
        setSlug(data.article.slug);
        setStatus(data.article.status);
        setLastSavedAt(new Date());

        const msg = data.article.status === "PUBLISHED"
          ? "✓ Article Published & Live!"
          : data.article.status === "IN_REVIEW"
          ? "⏳ Publishing permission request sent to Super Admin!"
          : "✓ Draft Saved!";
        setNotificationMsg(msg);
        setTimeout(() => setNotificationMsg(""), 5000);

        if (overrideStatus === "PUBLISHED") {
          setActiveDrawer(null);
        }
      } else {
        if (!isAutosave) alert(data.error || data.message || "Failed to save article.");
      }
    } catch (err) {
      if (!isAutosave) alert("Network error saving article. Please make sure backend is connected.");
    } finally {
      setSaving(false);
    }
  };

  // Status Workflow Change Handler
  const handleStatusChange = async (newStatus) => {
    if (newStatus === "PUBLISHED" && !isSuperAdmin) {
      setShowPermissionModal(true);
      return;
    }
    setStatus(newStatus);
    handleSaveArticle(false, newStatus);
  };

  const confirmSubmitPermission = () => {
    setShowPermissionModal(false);
    setStatus("IN_REVIEW");
    handleSaveArticle(false, "IN_REVIEW");
  };

  // Insert Custom Block into Editor HTML
  const insertCustomBlock = (blockType) => {
    let blockHtml = "";
    if (blockType === "callout") {
      blockHtml = `<div class="j-callout"><strong>Note:</strong> Enter important key takeaway here.</div>`;
    } else if (blockType === "quiz") {
      blockHtml = `<div class="j-widget"><p class="j-widget-eyebrow">Quick Quiz</p><p>What is the time complexity of binary search?</p></div>`;
    } else if (blockType === "ai-summary") {
      blockHtml = `<div class="j-callout success"><strong>AI Summary:</strong><ul><li>Key point 1</li><li>Key point 2</li></ul></div>`;
    } else if (blockType === "code-playground") {
      blockHtml = `<div class="j-code-block"><div class="j-code-header"><span>solution.js</span></div><div class="j-code-content"><pre><code>function solve() {\n  return true;\n}</code></pre></div></div>`;
    }

    setContentHtml((prev) => prev + "\n" + blockHtml);
    setActiveDrawer(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--j-bg)", color: "var(--j-text)" }}>

      {/* ── Notification Banner ────────────────────────────────────────────── */}
      {notificationMsg && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold text-white transition-all flex items-center gap-2"
          style={{ background: "var(--j-accent)", fontFamily: "var(--j-font-mono)" }}
        >
          {notificationMsg}
        </div>
      )}

      {/* ── Permission Request Modal ──────────────────────────────────────── */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: "var(--j-border)" }}>
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--j-font-heading)" }}>
              Super Admin Permission Required
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 mb-6" style={{ fontFamily: "var(--j-font-reading)" }}>
              Your blog post will be sent as a publishing permission request to the <strong>Super Admin</strong> for editorial review. It will not be visible publicly until the Super Admin approves and publishes it on EduVantix.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium border text-slate-600 hover:bg-slate-50"
                style={{ fontFamily: "var(--j-font-mono)" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitPermission}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
                style={{ fontFamily: "var(--j-font-mono)" }}
              >
                <Shield size={13} /> Send Permission Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b flex items-center justify-between px-6 h-14"
        style={{ borderColor: "var(--j-border)", background: "var(--j-bg)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/journal/dashboard"
            className="flex items-center gap-1 text-xs hover:text-[var(--j-accent)] transition-colors"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <span
            className="j-mono text-xs px-2 py-0.5 rounded font-medium"
            style={{
              background: status === "PUBLISHED" ? "rgba(26,115,64,0.12)" : status === "IN_REVIEW" ? "rgba(201,122,26,0.12)" : "var(--j-bg-secondary)",
              color: status === "PUBLISHED" ? "#1A7340" : status === "IN_REVIEW" ? "#C97A1A" : "var(--j-text-secondary)",
            }}
          >
            {status === "IN_REVIEW" ? "PENDING PERMISSION" : status}
          </span>
          {lastSavedAt && (
            <span className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>
              {saving ? "Saving..." : `Saved ${lastSavedAt.toLocaleTimeString()}`}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveArticle(false, status)}
            disabled={saving}
            className="px-3.5 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors hover:border-[var(--j-accent)]"
            style={{
              fontFamily: "var(--j-font-mono)",
              borderColor: "var(--j-border)",
              color: "var(--j-text)",
            }}
          >
            <Save size={12} /> {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === "blocks" ? null : "blocks")}
            className="px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors"
            style={{
              fontFamily: "var(--j-font-mono)",
              borderColor: "var(--j-border)",
              color: activeDrawer === "blocks" ? "var(--j-accent)" : "var(--j-text-secondary)",
              background: activeDrawer === "blocks" ? "var(--j-accent-light)" : "transparent",
            }}
          >
            <Sparkles size={12} /> Add Block
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === "seo" ? null : "seo")}
            className="px-3 py-1.5 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors"
            style={{
              fontFamily: "var(--j-font-mono)",
              borderColor: "var(--j-border)",
              color: activeDrawer === "seo" ? "var(--j-accent)" : "var(--j-text-secondary)",
              background: activeDrawer === "seo" ? "var(--j-accent-light)" : "transparent",
            }}
          >
            <FileCode size={12} /> SEO & Metadata
          </button>

          <button
            onClick={() => handleStatusChange("PUBLISHED")}
            className="px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ fontFamily: "var(--j-font-mono)", background: isSuperAdmin ? "var(--j-accent)" : "#D97706" }}
          >
            {isSuperAdmin ? <Send size={12} /> : <Shield size={12} />}
            {isSuperAdmin ? "Publish Article" : "Request Super Admin Permission"}
          </button>
        </div>
      </header>

      {/* ── Main Editor Canvas ─────────────────────────────────────────────── */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 relative">

        {/* Permission Request Banner */}
        {status === "IN_REVIEW" && (
          <div className="p-4 rounded-md border mb-6 flex items-start gap-3 bg-amber-50 border-amber-300">
            <Shield size={18} className="text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="j-mono text-xs font-bold uppercase tracking-wider text-amber-800">Publishing Permission Requested</p>
              <p className="text-xs mt-1 text-amber-900" style={{ fontFamily: "var(--j-font-reading)" }}>
                Your article is currently pending Super Admin permission and review. Once approved, it will automatically go live across the platform.
              </p>
            </div>
          </div>
        )}

        {/* Rejection Alert if applicable */}
        {status === "REJECTED" && rejectionReason && (
          <div className="p-4 rounded-md border mb-6 flex items-start gap-3" style={{ background: "rgba(192,57,43,0.08)", borderColor: "#C0392B" }}>
            <AlertCircle size={16} style={{ color: "#C0392B" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="j-mono text-xs font-bold uppercase tracking-wider" style={{ color: "#C0392B" }}>Article Returned for Revision</p>
              <p className="text-sm mt-1" style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text)" }}>{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* File Path Editor */}
        <div className="flex items-center gap-2 mb-4">
          <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>Path:</span>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/dsa/sliding-window.md"
            className="j-filepath bg-transparent border-b outline-none text-xs flex-1 py-0.5 focus:border-[var(--j-accent)]"
            style={{ borderColor: "var(--j-border)" }}
          />
        </div>

        {/* Article Title */}
        <textarea
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article Title..."
          className="w-full text-3xl sm:text-4xl font-semibold bg-transparent outline-none resize-none mb-3"
          style={{
            fontFamily: "var(--j-font-heading)",
            color: "var(--j-text)",
            fontStyle: "italic",
            letterSpacing: "-0.03em",
          }}
        />

        {/* Subtitle */}
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle / One-line summary..."
          className="w-full text-lg bg-transparent outline-none mb-6"
          style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
        />

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center gap-4 py-2 border-y mb-8 text-xs" style={{ borderColor: "var(--j-border)", fontFamily: "var(--j-font-mono)" }}>
          <span style={{ color: "var(--j-text-muted)" }}>{wordCount} words</span>
          <span style={{ color: "var(--j-text-muted)" }}>·</span>
          <span style={{ color: "var(--j-text-muted)" }}>{readTimeMinutes} min read</span>
          <span style={{ color: "var(--j-text-muted)" }}>·</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
            style={{ color: "var(--j-accent)" }}
          >
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
          </select>
          <span style={{ color: "var(--j-text-muted)" }}>·</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-transparent outline-none cursor-pointer"
            style={{ color: "var(--j-eyebrow)" }}
          >
            <option value="">Select Category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* HTML Editor Area */}
        <textarea
          rows={18}
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          placeholder="Write your article in HTML or markdown format... Type @ to search internal problems/courses..."
          className="w-full bg-transparent outline-none text-base leading-relaxed resize-y font-mono p-4 border rounded-md"
          style={{
            borderColor: "var(--j-border)",
            color: "var(--j-text)",
            fontFamily: "var(--j-font-mono)",
            fontSize: "0.9rem",
          }}
        />

        {/* Internal Link Picker Trigger (@ Search) */}
        <div className="mt-4 p-3 rounded border" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Search size={12} style={{ color: "var(--j-text-muted)" }} />
            <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>Internal Entity Picker (@ trigger):</span>
            <input
              type="text"
              value={internalSearchQuery}
              onChange={(e) => setInternalSearchQuery(e.target.value)}
              placeholder="Type problem/course name..."
              className="bg-transparent border-b text-xs outline-none flex-1"
              style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text)" }}
            />
          </div>

          {internalResults && (
            <div className="space-y-1 mt-2">
              {internalResults.problems?.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    setContentHtml((prev) => prev + `\n<a href="/practice/${p.slug}">[Problem: ${p.title}]</a>`);
                    setInternalSearchQuery("");
                  }}
                  className="block text-left text-xs hover:underline"
                  style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
                >
                  + Insert Problem Link: {p.title}
                </button>
              ))}
              {internalResults.courses?.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    setContentHtml((prev) => prev + `\n<a href="/courses/${c.slug}">[Course: ${c.title}]</a>`);
                    setInternalSearchQuery("");
                  }}
                  className="block text-left text-xs hover:underline"
                  style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
                >
                  + Insert Course Link: {c.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Drawers (SEO & Blocks & Workflow) ────────────────────────────────── */}
      {activeDrawer === "blocks" && (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l p-6 shadow-xl z-50 overflow-y-auto" style={{ borderColor: "var(--j-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="j-mono text-sm font-semibold">Custom EduVantix Blocks</h3>
            <button onClick={() => setActiveDrawer(null)}><X size={14} /></button>
          </div>
          <div className="space-y-3">
            {[
              { id: "callout", name: "Callout Box", desc: "Note, tip, or warning box" },
              { id: "quiz", name: "Interactive Quiz", desc: "Embed multiple-choice question" },
              { id: "ai-summary", name: "AI Summary Block", desc: "Bullet-point summary callout" },
              { id: "code-playground", name: "Code Block", desc: "Monospace code wrapper" },
            ].map((block) => (
              <button
                key={block.id}
                onClick={() => insertCustomBlock(block.id)}
                className="w-full text-left p-3 rounded border hover:border-[var(--j-accent)] transition-colors"
                style={{ borderColor: "var(--j-border)", background: "var(--j-bg-secondary)" }}
              >
                <p className="j-mono text-xs font-semibold" style={{ color: "var(--j-text)" }}>{block.name}</p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-muted)" }}>{block.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeDrawer === "seo" && (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l p-6 shadow-xl z-50 overflow-y-auto" style={{ borderColor: "var(--j-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="j-mono text-sm font-semibold">SEO & Meta Settings</h3>
            <button onClick={() => setActiveDrawer(null)}><X size={14} /></button>
          </div>
          <div className="space-y-4 text-xs" style={{ fontFamily: "var(--j-font-mono)" }}>
            <div>
              <label className="block mb-1 text-[11px] text-[var(--j-text-muted)]">Custom URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full p-2 border rounded outline-none"
                style={{ borderColor: "var(--j-border)" }}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-[var(--j-text-muted)]">Meta Excerpt</label>
              <textarea
                rows={4}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full p-2 border rounded outline-none"
                style={{ borderColor: "var(--j-border)" }}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-[var(--j-text-muted)]">Cover Image URL (Cloudinary)</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full p-2 border rounded outline-none"
                style={{ borderColor: "var(--j-border)" }}
              />
            </div>
          </div>
        </div>
      )}

      {activeDrawer === "workflow" && (
        <div className="fixed right-0 top-14 bottom-0 w-80 bg-white border-l p-6 shadow-xl z-50 overflow-y-auto" style={{ borderColor: "var(--j-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="j-mono text-sm font-semibold">Publishing Workflow</h3>
            <button onClick={() => setActiveDrawer(null)}><X size={14} /></button>
          </div>
          <div className="space-y-3">
            {[
              { statusKey: "PUBLISHED", label: isSuperAdmin ? "🚀 Publish Article" : "🛡️ Request Super Admin Permission", desc: isSuperAdmin ? "Make public on Journal immediately" : "Send publishing permission request to Super Admin" },
              { statusKey: "DRAFT", label: "Save as Draft", desc: "Keep private while writing" },
              { statusKey: "IN_REVIEW", label: "Submit for Permission", desc: "Send to Super Admin queue" },
              { statusKey: "ARCHIVED", label: "Archive Article", desc: "Unpublish from public listing" },
            ].map(({ statusKey, label, desc }) => (
              <button
                key={statusKey}
                onClick={() => handleStatusChange(statusKey)}
                className="w-full text-left p-3 rounded border hover:border-[var(--j-accent)] transition-colors"
                style={{
                  borderColor: status === statusKey ? "var(--j-accent)" : "var(--j-border)",
                  background: status === statusKey ? "var(--j-accent-light)" : "var(--j-bg-secondary)",
                }}
              >
                <p className="j-mono text-xs font-semibold" style={{ color: status === statusKey ? "var(--j-accent)" : "var(--j-text)" }}>{label}</p>
                <p className="text-[11px] mt-0.5" style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-muted)" }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JournalEditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center j-mono text-xs">Loading editor...</div>}>
      <JournalEditorContent />
    </Suspense>
  );
}
