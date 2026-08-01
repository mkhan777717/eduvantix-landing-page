"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight, BookOpen, Code, Trophy, MessageSquare, Book } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

export default function GlobalSearchModal({ open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ journal: [], problems: [], courses: [], contests: [], discussions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults({ journal: [], problems: [], courses: [], contests: [], discussions: [] });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ journal: [], problems: [], courses: [], contests: [], discussions: [] });
      return;
    }
    const tid = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/journal/global-search?q=${encodeURIComponent(query)}&limit=4`);
        const data = await res.json();
        setResults(data.success ? data : data);
      } catch (_) {
        setResults({ journal: [], problems: [], courses: [], contests: [], discussions: [] });
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(tid);
  }, [query]);

  if (!open) return null;

  const totalResults =
    (results.journal?.length || 0) +
    (results.problems?.length || 0) +
    (results.courses?.length || 0) +
    (results.contests?.length || 0) +
    (results.discussions?.length || 0);

  return (
    <div
      className="j-search-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Global Platform Search"
    >
      <div className="j-search-modal mx-4 w-full max-w-2xl">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--j-border)" }}>
          <Search size={16} style={{ color: "var(--j-text-muted)" }} className="shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Journal, Problems, Courses, Contests, Discussions..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text)", fontSize: "0.875rem" }}
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear">
              <X size={14} style={{ color: "var(--j-text-muted)" }} />
            </button>
          )}
          <span
            className="hidden sm:inline px-1.5 py-0.5 rounded border text-[10px]"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)", borderColor: "var(--j-border)" }}
          >
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[460px] overflow-y-auto p-4 space-y-4">
          {loading && (
            <p className="j-mono text-xs text-center py-6" style={{ color: "var(--j-text-muted)" }}>
              Searching platform...
            </p>
          )}

          {!loading && query && totalResults === 0 && (
            <p className="j-mono text-sm text-center py-8" style={{ color: "var(--j-text-muted)" }}>
              No results found for &quot;{query}&quot;
            </p>
          )}

          {/* Journal Articles */}
          {results.journal?.length > 0 && (
            <div>
              <p className="j-mono text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--j-eyebrow)" }}>
                Journal Articles
              </p>
              <div className="space-y-1">
                {results.journal.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/journal/article/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--j-bg-secondary)] transition-colors"
                  >
                    <BookOpen size={13} style={{ color: "var(--j-accent)" }} />
                    <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "var(--j-font-reading)" }}>
                      {item.title}
                    </span>
                    <span className="j-filepath text-[10px]">{item.filePath}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Practice Problems */}
          {results.problems?.length > 0 && (
            <div>
              <p className="j-mono text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--j-eyebrow)" }}>
                Practice Problems
              </p>
              <div className="space-y-1">
                {results.problems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/practice/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--j-bg-secondary)] transition-colors"
                  >
                    <Code size={13} style={{ color: "#1A7340" }} />
                    <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "var(--j-font-reading)" }}>
                      {item.title}
                    </span>
                    <span className="j-mono text-[10px]" style={{ color: "var(--j-text-muted)" }}>{item.difficulty}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Learning Courses */}
          {results.courses?.length > 0 && (
            <div>
              <p className="j-mono text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--j-eyebrow)" }}>
                Courses
              </p>
              <div className="space-y-1">
                {results.courses.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/courses/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--j-bg-secondary)] transition-colors"
                  >
                    <Book size={13} style={{ color: "#7B2D8B" }} />
                    <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "var(--j-font-reading)" }}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contests */}
          {results.contests?.length > 0 && (
            <div>
              <p className="j-mono text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--j-eyebrow)" }}>
                Contests
              </p>
              <div className="space-y-1">
                {results.contests.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/contest/${item.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--j-bg-secondary)] transition-colors"
                  >
                    <Trophy size={13} style={{ color: "#C0392B" }} />
                    <span className="text-sm font-medium flex-1 truncate" style={{ fontFamily: "var(--j-font-reading)" }}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
