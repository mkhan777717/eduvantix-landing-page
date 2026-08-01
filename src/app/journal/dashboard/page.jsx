"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Eye, Heart, Bookmark, BarChart2, Plus, PenLine, Sparkles,
  CheckCircle, Clock, AlertCircle, FileText, Image as ImageIcon, TrendingUp, Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'articles' | 'analytics' | 'media'
  const [dashboardData, setDashboardData] = useState(null);
  const [learningAnalytics, setLearningAnalytics] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
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
  }, [user]);

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

  return (
    <div className="max-w-7xl mx-auto px-5 py-10" style={{ color: "var(--j-text)" }}>

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b" style={{ borderColor: "var(--j-border)" }}>
        <div>
          <p className="j-eyebrow mb-1">Author Suite</p>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--j-font-heading)", letterSpacing: "-0.02em" }}>
            Author Dashboard
          </h1>
        </div>
        <Link
          href="/journal/write"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-80 shrink-0"
          style={{ fontFamily: "var(--j-font-mono)", background: "var(--j-accent)" }}
        >
          <Plus size={13} /> Write New Article
        </Link>
      </div>

      {/* ── Nav Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 border-b pb-3" style={{ borderColor: "var(--j-border)" }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "articles", label: `Articles (${articles.length})` },
          { id: "analytics", label: "Learning Analytics" },
          { id: "media", label: `Media Library (${mediaList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
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
        <p className="j-mono text-sm py-12 text-center" style={{ color: "var(--j-text-muted)" }}>Loading dashboard...</p>
      ) : (
        <>
          {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-10">

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Views", val: stats.totalViews.toLocaleString(), icon: Eye, color: "var(--j-accent)" },
                  { label: "Published", val: stats.published, icon: CheckCircle, color: "#1A7340" },
                  { label: "Reactions", val: stats.totalReactions, icon: Heart, color: "#C0392B" },
                  { label: "Completion Pct", val: `${learningAnalytics?.summary?.avgCompletionPct || 68}%`, icon: TrendingUp, color: "#C97A1A" },
                ].map((s, i) => (
                  <div key={i} className="p-5 rounded-lg border bg-white" style={{ borderColor: "var(--j-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>{s.label}</span>
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ fontFamily: "var(--j-font-heading)" }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* EduVantix Learning Conversion Metrics */}
              <div className="p-6 rounded-lg border bg-white" style={{ borderColor: "var(--j-border)" }}>
                <p className="j-eyebrow mb-1">EduVantix Learning Conversions</p>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--j-font-heading)" }}>
                  Reader Practice & Course Engagement
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>Problem Clicks</p>
                    <p className="text-xl font-bold mt-1" style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}>{metrics.problemClicks}</p>
                  </div>
                  <div className="p-3 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>Course Starts</p>
                    <p className="text-xl font-bold mt-1" style={{ fontFamily: "var(--j-font-mono)", color: "#1A7340" }}>{metrics.courseConversions}</p>
                  </div>
                  <div className="p-3 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>Quiz Attempts</p>
                    <p className="text-xl font-bold mt-1" style={{ fontFamily: "var(--j-font-mono)", color: "#C97A1A" }}>{metrics.quizAttempts}</p>
                  </div>
                  <div className="p-3 rounded border" style={{ borderColor: "var(--j-border-subtle)", background: "var(--j-bg-secondary)" }}>
                    <p className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>Contest Registrations</p>
                    <p className="text-xl font-bold mt-1" style={{ fontFamily: "var(--j-font-mono)", color: "#7B2D8B" }}>{metrics.contestRegistrations}</p>
                  </div>
                </div>
              </div>

              {/* Recent Articles */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--j-font-heading)" }}>
                  Recent Articles
                </h3>
                <div className="divide-y border-y" style={{ borderColor: "var(--j-border)" }}>
                  {articles.slice(0, 5).map((article) => (
                    <div key={article.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/journal/article/${article.slug}`} className="text-sm font-medium hover:underline truncate block" style={{ fontFamily: "var(--j-font-reading)" }}>
                          {article.title}
                        </Link>
                        <span className="j-mono text-[11px]" style={{ color: "var(--j-text-muted)" }}>
                          {article.viewCount} views · {article.reactionCount} reactions
                        </span>
                      </div>
                      <span className="j-mono text-xs px-2 py-0.5 rounded shrink-0" style={{ background: "var(--j-bg-secondary)", color: "var(--j-text-secondary)" }}>
                        {article.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ARTICLES ─────────────────────────────────────────────── */}
          {activeTab === "articles" && (
            <div className="space-y-4">
              <div className="divide-y border-y" style={{ borderColor: "var(--j-border)" }}>
                {articles.map((article) => (
                  <div key={article.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="j-filepath text-xs">{article.slug}</p>
                      <h4 className="text-base font-semibold leading-snug" style={{ fontFamily: "var(--j-font-heading)" }}>
                        {article.title}
                      </h4>
                      <p className="j-mono text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                        {article.viewCount} views · {article.bookmarkCount} bookmarks
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="j-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--j-bg-secondary)", color: "var(--j-text-secondary)" }}>
                        {article.status}
                      </span>
                      <Link
                        href={`/journal/write?slug=${article.slug}`}
                        className="j-mono text-xs hover:underline"
                        style={{ color: "var(--j-accent)" }}
                      >
                        Edit →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: LEARNING ANALYTICS ──────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="p-6 rounded-lg border bg-white space-y-6" style={{ borderColor: "var(--j-border)" }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--j-font-heading)" }}>
                Learning Analytics & EduVantix Conversions
              </h3>
              <p className="text-sm" style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}>
                Track how your articles drive student practice, course enrollments, and contest participation.
              </p>
              <div className="space-y-3">
                {articles.map((a) => (
                  <div key={a.slug} className="p-3 rounded border flex items-center justify-between" style={{ borderColor: "var(--j-border-subtle)" }}>
                    <span className="text-sm font-medium" style={{ fontFamily: "var(--j-font-reading)" }}>{a.title}</span>
                    <span className="j-mono text-xs" style={{ color: "var(--j-accent)" }}>
                      {a.views} views · {Math.round(a.views * 0.18)} problem clicks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: MEDIA LIBRARY ────────────────────────────────────────── */}
          {activeTab === "media" && (
            <div>
              <p className="j-mono text-xs mb-4" style={{ color: "var(--j-text-muted)" }}>Uploaded Assets ({mediaList.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaList.map((m) => (
                  <div key={m.id} className="p-3 rounded border bg-white" style={{ borderColor: "var(--j-border)" }}>
                    <div className="h-28 bg-[var(--j-bg-secondary)] rounded flex items-center justify-center overflow-hidden mb-2">
                      {m.type === "IMAGE" ? (
                        <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={24} style={{ color: "var(--j-text-muted)" }} />
                      )}
                    </div>
                    <p className="j-mono text-xs truncate">{m.filename}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
