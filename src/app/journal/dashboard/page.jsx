"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Eye, Heart, Bookmark, BarChart2, Plus, PenLine, Sparkles,
  CheckCircle, Clock, AlertCircle, FileText, Image as ImageIcon, TrendingUp, Layers, ArrowLeft, Shield, Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export default function AuthorDashboardPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'articles' | 'analytics' | 'media'
  const [dashboardData, setDashboardData] = useState(null);
  const [learningAnalytics, setLearningAnalytics] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for Articles tab
  const [articleFilter, setArticleFilter] = useState("ALL"); // 'ALL' | 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState("");

  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const isMentor = user?.role === "MENTOR";
  const isInstAdmin = user?.role === "INSTITUTE_ADMIN";
  const isBatchMgr = user?.role === "BATCH_MANAGER";

  const roleBadgeText = isSuperAdmin
    ? "SUPER ADMIN"
    : isMentor
    ? "MENTOR"
    : isInstAdmin
    ? "INSTITUTE ADMIN"
    : isBatchMgr
    ? "BATCH MANAGER"
    : "STUDENT AUTHOR";

  const suiteEyebrow = isSuperAdmin
    ? "Platform Editorial & Author Suite"
    : isMentor
    ? "Instructor Knowledge & Author Suite"
    : isInstAdmin
    ? "Institute Author Suite"
    : "Author Suite";

  const suiteTitle = isSuperAdmin
    ? "Super Admin Author Dashboard"
    : isMentor
    ? "Mentor Author Dashboard"
    : isInstAdmin
    ? "Institute Author Dashboard"
    : "Author Dashboard";

  useEffect(() => {
    const headers = buildAuthHeaders(token, user);

    Promise.all([
      fetch(`${API}/api/journal/dashboard`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/journal/dashboard/analytics`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/journal/media`, { headers }).then((res) => res.json()),
    ])
      .then(([dash, analytics, media]) => {
        setDashboardData(dash && dash.success !== false ? dash : null);
        setLearningAnalytics(analytics && analytics.success !== false ? analytics : null);
        setMediaList(media && media.media ? media.media : []);
      })
      .catch((err) => console.error("Error fetching journal dashboard:", err))
      .finally(() => setLoading(false));
  }, [user, token]);

  const stats = dashboardData?.stats || {
    totalArticles: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0,
  };

  const articles = dashboardData?.articles || [];
  const metrics = learningAnalytics?.learningMetrics || {
    problemClicks: 0,
    courseConversions: 0,
    quizAttempts: 0,
    contestRegistrations: 0,
  };

  // Filtered articles
  const filteredArticles = articles.filter((a) => {
    const matchesFilter =
      articleFilter === "ALL" || a.status === articleFilter;
    const matchesSearch =
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-5 py-10" style={{ color: "var(--j-text)" }}>

      {/* Back arrow navigation */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors hover:text-[var(--j-accent)]"
        style={{ color: "var(--j-text-muted)" }}
      >
        <ArrowLeft size={14} /> Back to Journal
      </Link>

      {/* ── Dynamic Top Header with User Info & Role Badge ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b" style={{ borderColor: "var(--j-border)" }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded font-mono uppercase border" style={{ borderColor: "var(--j-border)", background: "var(--j-accent-light)", color: "var(--j-accent)" }}>
              {roleBadgeText}
            </span>
            <p className="j-eyebrow" style={{ margin: 0 }}>{suiteEyebrow}</p>
          </div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--j-font-heading)", letterSpacing: "-0.02em" }}>
            {suiteTitle}
          </h1>
          {user && (
            <p className="text-xs" style={{ color: "var(--j-text-secondary)" }}>
              Logged in as <strong style={{ color: "var(--j-text)" }}>{user.fullName || user.username}</strong> ({user.email})
            </p>
          )}
        </div>

        {/* Header Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isSuperAdmin && (
            <Link
              href="/journal/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium border transition-colors hover:border-[var(--j-accent)]"
              style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)", color: "var(--j-accent)" }}
            >
              <Shield size={13} /> Admin Moderation
            </Link>
          )}
          <Link
            href="/journal/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90 shadow-sm shrink-0"
            style={{ background: "var(--j-accent)" }}
          >
            <Plus size={13} /> Write New Article
          </Link>
        </div>
      </div>

      {/* ── Nav Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 border-b pb-3 overflow-x-auto" style={{ borderColor: "var(--j-border)" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "articles", label: `Articles (${articles.length})` },
          { id: "analytics", label: "Learning Analytics" },
          { id: "media", label: `Media Library (${mediaList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: activeTab === tab.id ? "var(--j-accent-light)" : "transparent",
              color: activeTab === tab.id ? "var(--j-accent)" : "var(--j-text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm py-12 text-center" style={{ color: "var(--j-text-muted)" }}>Loading dashboard...</p>
      ) : (
        <>
          {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-10">

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Views", val: stats.totalViews.toLocaleString(), icon: Eye, color: "var(--j-accent)" },
                  { label: "Published", val: stats.published, icon: CheckCircle, color: "#10B981" },
                  { label: "Reactions", val: stats.totalReactions, icon: Heart, color: "#EF4444" },
                  { label: "Completion Pct", val: `${learningAnalytics?.summary?.avgCompletionPct || 68}%`, icon: TrendingUp, color: "#F59E0B" },
                ].map((s, i) => (
                  <div key={i} className="p-5 rounded-lg border" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--j-text-muted)" }}>{s.label}</span>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* EduVantix Learning Conversion Metrics */}
              <div className="p-6 rounded-lg border" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                <p className="j-eyebrow mb-1">EduVantix Learning Conversions</p>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--j-font-heading)" }}>
                  Reader Practice & Course Engagement
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="text-[11px]" style={{ color: "var(--j-text-muted)" }}>Problem Clicks</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "var(--j-accent)" }}>{metrics.problemClicks}</p>
                  </div>
                  <div className="p-3.5 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="text-[11px]" style={{ color: "var(--j-text-muted)" }}>Course Starts</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "#10B981" }}>{metrics.courseConversions}</p>
                  </div>
                  <div className="p-3.5 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="text-[11px]" style={{ color: "var(--j-text-muted)" }}>Quiz Attempts</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "#F59E0B" }}>{metrics.quizAttempts}</p>
                  </div>
                  <div className="p-3.5 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="text-[11px]" style={{ color: "var(--j-text-muted)" }}>Contest Registrations</p>
                    <p className="text-xl font-bold mt-1" style={{ color: "#8B5CF6" }}>{metrics.contestRegistrations}</p>
                  </div>
                </div>
              </div>

              {/* Recent Articles Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--j-font-heading)" }}>
                  Recent Articles
                </h3>
                {articles.length === 0 ? (
                  <div className="p-8 border rounded-lg text-center" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
                    <BookOpen size={32} className="mx-auto mb-3" style={{ color: "var(--j-accent)" }} />
                    <h4 className="text-base font-semibold mb-1">No articles published yet</h4>
                    <p className="text-xs mb-4 max-w-md mx-auto" style={{ color: "var(--j-text-secondary)" }}>
                      Share your technical tutorials, DSA guides, or placement experiences with the EduVantix community.
                    </p>
                    <Link
                      href="/journal/write"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white"
                      style={{ background: "var(--j-accent)" }}
                    >
                      <PenLine size={13} /> Write First Article
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y border-y" style={{ borderColor: "var(--j-border)" }}>
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/journal/article/${article.slug}`} className="text-sm font-medium hover:underline truncate block" style={{ fontFamily: "var(--j-font-reading)" }}>
                            {article.title}
                          </Link>
                          <span className="text-[11px]" style={{ color: "var(--j-text-muted)" }}>
                            {article.viewCount || 0} views · {article.reactionCount || 0} reactions
                          </span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded shrink-0 border" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)", color: "var(--j-text-secondary)" }}>
                          {article.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: ARTICLES ─────────────────────────────────────────────── */}
          {activeTab === "articles" && (
            <div className="space-y-6">

              {/* Status Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex items-center gap-1 p-1 rounded-full border overflow-x-auto" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
                  {[
                    { id: "ALL", label: "All" },
                    { id: "PUBLISHED", label: "Published" },
                    { id: "IN_REVIEW", label: "In Review" },
                    { id: "DRAFT", label: "Drafts" },
                    { id: "REJECTED", label: "Rejected" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setArticleFilter(f.id)}
                      className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        articleFilter === f.id
                          ? "text-white font-semibold shadow-sm"
                          : "hover:text-[var(--j-accent)] text-[var(--j-text-secondary)]"
                      }`}
                      style={{
                        background: articleFilter === f.id ? "var(--j-accent)" : "transparent",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Article Search Input */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search my articles..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-full border text-xs outline-none transition-colors focus:border-[var(--j-accent)]"
                    style={{
                      background: "var(--j-bg-card)",
                      borderColor: "var(--j-border)",
                      color: "var(--j-text)",
                    }}
                  />
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--j-text-muted)" }} />
                </div>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="p-12 text-center border rounded-lg" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
                  <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
                    No articles found matching status &quot;{articleFilter}&quot;{searchQuery ? ` and query "${searchQuery}"` : ""}.
                  </p>
                </div>
              ) : (
                <div className="divide-y border-y" style={{ borderColor: "var(--j-border)" }}>
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="j-filepath text-xs mb-0.5">{article.slug}</p>
                        <h4 className="text-base font-semibold leading-snug" style={{ fontFamily: "var(--j-font-heading)" }}>
                          {article.title}
                        </h4>
                        <p className="text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                          {article.viewCount || 0} views · {article.bookmarkCount || 0} bookmarks · Created {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded border" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)", color: "var(--j-text-secondary)" }}>
                          {article.status}
                        </span>
                        <Link
                          href={`/journal/write?slug=${article.slug}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "var(--j-accent)" }}
                        >
                          Edit →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: LEARNING ANALYTICS ──────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="p-6 rounded-lg border space-y-6" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
                  Learning Analytics & EduVantix Conversions
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--j-text-secondary)" }}>
                  Track how your articles drive student practice, course enrollments, and contest participation.
                </p>
              </div>

              {articles.length === 0 ? (
                <div className="p-8 border rounded text-center" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
                  <TrendingUp size={28} className="mx-auto mb-2" style={{ color: "var(--j-accent)" }} />
                  <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>Publish articles to start tracking reader conversion analytics.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {articles.map((a) => (
                    <div key={a.slug} className="p-3.5 rounded border flex items-center justify-between gap-4" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                      <span className="text-sm font-medium truncate" style={{ fontFamily: "var(--j-font-reading)" }}>{a.title}</span>
                      <span className="text-xs whitespace-nowrap" style={{ color: "var(--j-accent)" }}>
                        {a.viewCount || a.views || 0} views · {Math.round((a.viewCount || a.views || 0) * 0.18)} problem clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: MEDIA LIBRARY ────────────────────────────────────────── */}
          {activeTab === "media" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono" style={{ color: "var(--j-text-muted)" }}>Uploaded Assets ({mediaList.length})</p>
              </div>

              {mediaList.length === 0 ? (
                <div className="p-12 border rounded-lg text-center" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}>
                  <ImageIcon size={32} className="mx-auto mb-3" style={{ color: "var(--j-text-muted)" }} />
                  <h4 className="text-sm font-semibold mb-1">No media uploaded yet</h4>
                  <p className="text-xs text-[var(--j-text-muted)] max-w-xs mx-auto">
                    Media files uploaded while writing articles will be saved here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mediaList.map((m) => (
                    <div key={m.id} className="p-3 rounded border" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}>
                      <div className="h-28 bg-[var(--j-bg-secondary)] rounded flex items-center justify-center overflow-hidden mb-2">
                        {m.type === "IMAGE" ? (
                          <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={24} style={{ color: "var(--j-text-muted)" }} />
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--j-text)" }}>{m.filename}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
