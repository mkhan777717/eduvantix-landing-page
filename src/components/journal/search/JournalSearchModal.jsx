"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight, BookOpen, Code2, Clock } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

export default function JournalSearchModal({ open, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const tid = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/journal/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        setResults(data.articles || []);
        setSelectedIdx(0);
      } catch (_) { setResults([]); }
      finally { setLoading(false); }
    }, 220);
    return () => clearTimeout(tid);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const article = results[selectedIdx];
      if (article) { router.push(`/journal/article/${article.slug}`); onClose(); }
    }
  };

  if (!open) return null;

  return (
    <div
      className="j-search-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Search EduVantix Journal"
    >
      <div className="j-search-modal mx-4 w-full max-w-2xl">

        {/* Input row */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--j-border)" }}
        >
          <Search size={16} style={{ color: "var(--j-text-muted)" }} className="shrink-0" />
          <input
            ref={inputRef}
            id="journal-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, tags, authors..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              fontFamily: "var(--j-font-mono)",
              color: "var(--j-text)",
              fontSize: "0.9rem",
            }}
            aria-autocomplete="list"
            aria-controls="journal-search-results"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear">
              <X size={14} style={{ color: "var(--j-text-muted)" }} />
            </button>
          )}
          <button
            onClick={onClose}
            className="hidden sm:flex items-center px-1.5 py-0.5 rounded border text-[10px]"
            style={{
              fontFamily: "var(--j-font-mono)",
              color: "var(--j-text-muted)",
              borderColor: "var(--j-border)",
            }}
            aria-label="Close search"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div
          id="journal-search-results"
          className="max-h-[420px] overflow-y-auto"
          role="listbox"
        >
          {loading && (
            <div className="px-4 py-6 text-center">
              <p className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>Searching...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>
                No articles found for &quot;{query}&quot;
              </p>
              <Link
                href={`/journal/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 mt-3 text-xs"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
              >
                Full search <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {!loading && results.length > 0 && results.map((article, idx) => (
            <Link
              key={article.slug}
              href={`/journal/article/${article.slug}`}
              onClick={onClose}
              role="option"
              aria-selected={idx === selectedIdx}
              className="flex items-start gap-3 px-4 py-3 border-b transition-colors"
              style={{
                borderColor: "var(--j-border-subtle)",
                background: idx === selectedIdx ? "var(--j-accent-light)" : "transparent",
              }}
              onMouseEnter={() => setSelectedIdx(idx)}
            >
              <div
                className="w-7 h-7 rounded shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "var(--j-bg-secondary)" }}
              >
                <BookOpen size={13} style={{ color: "var(--j-text-muted)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium leading-snug truncate"
                  style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
                >
                  {article.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="j-filepath text-[11px] truncate">{article.filePath}</span>
                  {article.readTime && (
                    <span className="j-mono text-[11px] flex items-center gap-1" style={{ color: "var(--j-text-muted)" }}>
                      <Clock size={10} />
                      {article.readTime}m
                    </span>
                  )}
                </div>
              </div>

              <ArrowRight size={13} style={{ color: "var(--j-text-muted)", flexShrink: 0, marginTop: 4 }} />
            </Link>
          ))}

          {/* Footer hint */}
          {results.length > 0 && (
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ background: "var(--j-bg-secondary)" }}
            >
              <div className="flex items-center gap-3">
                {[
                  { key: "↑↓", label: "navigate" },
                  { key: "↵",  label: "open" },
                  { key: "ESC", label: "close" },
                ].map(({ key, label }) => (
                  <span key={key} className="flex items-center gap-1">
                    <kbd
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{
                        fontFamily: "var(--j-font-mono)",
                        background: "var(--j-border)",
                        color: "var(--j-text-muted)",
                      }}
                    >
                      {key}
                    </kbd>
                    <span className="text-[10px]" style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}>
                      {label}
                    </span>
                  </span>
                ))}
              </div>
              <Link
                href={`/journal/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="text-[11px] hover:underline"
                style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
              >
                View all results →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
