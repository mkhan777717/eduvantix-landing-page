"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import { TagPill, DifficultyBadge } from "@/components/journal/ui/JournalUI";
import { Search, X } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

const CATEGORIES = [
  { slug: "dsa",              name: "DSA" },
  { slug: "web-development",  name: "Web Dev" },
  { slug: "ai-ml",            name: "AI & ML" },
  { slug: "system-design",    name: "System Design" },
  { slug: "interview",        name: "Interview" },
  { slug: "career",           name: "Career" },
  { slug: "community",        name: "Community" },
];

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (q, cat, diff, pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat) params.set("category", cat);
      if (diff) params.set("difficulty", diff);
      params.set("page", pg);
      params.set("limit", "12");

      const res = await fetch(`${API}/api/journal/search?${params}`);
      const data = await res.json();
      if (pg === 1) {
        setResults(data.articles || []);
      } else {
        setResults((prev) => [...prev, ...(data.articles || [])]);
      }
      setTotal(data.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount or URL param change
  useEffect(() => {
    doSearch(query, category, difficulty, 1);
    setPage(1);
  }, [query, category, difficulty]);

  // Auto-focus search on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const clearFilter = (type) => {
    if (type === "category") setCategory("");
    if (type === "difficulty") setDifficulty("");
    if (type === "query") { setQuery(""); inputRef.current?.focus(); }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    doSearch(query, category, difficulty, next);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">

        {/* ── Filters sidebar ─────────────────── */}
        <aside>
          {/* Search input */}
          <div className="mb-8">
            <label
              htmlFor="full-search-input"
              className="j-mono text-xs mb-2 block uppercase tracking-widest"
              style={{ color: "var(--j-text-muted)" }}
            >
              Search
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md border"
              style={{ borderColor: query ? "var(--j-accent)" : "var(--j-border)", background: "#FFFFFF" }}
            >
              <Search size={13} style={{ color: "var(--j-text-muted)" }} />
              <input
                ref={inputRef}
                id="full-search-input"
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="articles, tags, authors..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text)", fontSize: "0.875rem" }}
                autoComplete="off"
              />
              {query && (
                <button onClick={() => clearFilter("query")} aria-label="Clear query">
                  <X size={12} style={{ color: "var(--j-text-muted)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <p className="j-mono text-xs mb-3 uppercase tracking-widest" style={{ color: "var(--j-text-muted)" }}>
              Category
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(category === cat.slug ? "" : cat.slug)}
                  className="w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    background: category === cat.slug ? "var(--j-accent-light)" : "transparent",
                    color: category === cat.slug ? "var(--j-accent)" : "var(--j-text-secondary)",
                    fontSize: "0.8125rem",
                  }}
                >
                  {cat.name}
                  {category === cat.slug && (
                    <span className="float-right text-xs" style={{ color: "var(--j-accent)" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty filter */}
          <div>
            <p className="j-mono text-xs mb-3 uppercase tracking-widest" style={{ color: "var(--j-text-muted)" }}>
              Difficulty
            </p>
            <div className="space-y-1">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(difficulty === diff ? "" : diff)}
                  className="w-full text-left flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors"
                  style={{
                    background: difficulty === diff ? "var(--j-accent-light)" : "transparent",
                  }}
                >
                  <DifficultyBadge difficulty={diff.charAt(0) + diff.slice(1).toLowerCase()} />
                  {difficulty === diff && (
                    <span className="text-xs" style={{ color: "var(--j-accent)" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Results ────────────────────────── */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)", letterSpacing: "-0.02em" }}
              >
                {query ? `Results for "${query}"` : "All Articles"}
              </h1>
              <p className="j-mono text-xs mt-1" style={{ color: "var(--j-text-muted)" }}>
                {loading ? "Searching..." : `${total} article${total !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Active filters */}
            <div className="flex gap-2 flex-wrap justify-end">
              {category && (
                <button
                  onClick={() => clearFilter("category")}
                  className="j-tag flex items-center gap-1"
                >
                  {category} <X size={10} />
                </button>
              )}
              {difficulty && (
                <button
                  onClick={() => clearFilter("difficulty")}
                  className="j-tag flex items-center gap-1"
                >
                  {difficulty.toLowerCase()} <X size={10} />
                </button>
              )}
            </div>
          </div>

          <hr className="j-divider mb-6" />

          {/* Article list */}
          {loading && results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="j-mono text-sm mb-2" style={{ color: "var(--j-text-muted)" }}>
                No articles found.
              </p>
              {query && (
                <button
                  onClick={() => clearFilter("query")}
                  className="j-mono text-xs hover:underline"
                  style={{ color: "var(--j-accent)" }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {results.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}

              {/* Load more */}
              {results.length < total && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 rounded-md border text-sm transition-colors hover:border-[var(--j-accent)] hover:text-[var(--j-accent)] disabled:opacity-50"
                    style={{
                      fontFamily: "var(--j-font-mono)",
                      borderColor: "var(--j-border)",
                      color: "var(--j-text-secondary)",
                    }}
                  >
                    {loading ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-5 py-12 text-center">
        <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>Loading search interface...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

