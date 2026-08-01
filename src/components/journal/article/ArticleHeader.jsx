import Link from "next/link";
import { FilePath, DifficultyBadge, AuthorMeta, CategoryBadge, TagPill } from "@/components/journal/ui/JournalUI";
import { Clock, BarChart2, BookOpen } from "lucide-react";

export default function ArticleHeader({ article }) {
  if (!article) return null;

  return (
    <header className="max-w-[var(--j-content-width)] mx-auto pt-10 pb-8">

      {/* Back nav */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 mb-8 text-xs transition-colors hover:text-[var(--j-accent)]"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
        aria-label="Back to Journal"
      >
        ← Back to Journal
      </Link>

      {/* File path */}
      <div className="mb-4">
        <FilePath path={article.filePath} />
      </div>

      {/* Category */}
      {article.category && (
        <div className="mb-4">
          <CategoryBadge
            category={article.category}
            href={`/journal/category/${article.category.slug}`}
          />
        </div>
      )}

      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-4"
        style={{
          fontFamily: "var(--j-font-heading)",
          color: "var(--j-text)",
          letterSpacing: "-0.03em",
          fontStyle: "italic",
        }}
      >
        {article.title}
      </h1>

      {/* Subtitle */}
      {article.subtitle && (
        <p
          className="text-lg sm:text-xl leading-relaxed mb-6"
          style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
        >
          {article.subtitle}
        </p>
      )}

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <AuthorMeta
          author={article.author}
          date={article.publishedAt}
          showAvatar
        />

        <div className="flex items-center gap-4">
          {article.readTime && (
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
            >
              <Clock size={12} />
              {article.readTime} min read
            </span>
          )}
          {article.difficulty && (
            <span className="flex items-center gap-1.5">
              <BarChart2 size={12} style={{ color: "var(--j-text-muted)" }} />
              <DifficultyBadge difficulty={article.difficulty} />
            </span>
          )}
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
          >
            <BookOpen size={12} />
            {article.viewCount?.toLocaleString() || 0} views
          </span>
        </div>
      </div>

      {/* Prerequisites */}
      {article.prerequisites?.length > 0 && (
        <div
          className="rounded-md px-4 py-3 mb-6 border"
          style={{
            background: "var(--j-bg-secondary)",
            borderColor: "var(--j-border)",
          }}
        >
          <p
            className="text-xs font-medium mb-2"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Prerequisites
          </p>
          <div className="flex flex-wrap gap-2">
            {article.prerequisites.map((req, i) => (
              <span
                key={i}
                className="j-mono text-xs px-2 py-0.5 rounded border"
                style={{
                  color: "var(--j-text-secondary)",
                  borderColor: "var(--j-border)",
                  background: "#FFFFFF",
                }}
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag) => (
            <TagPill key={tag.slug} tag={tag} />
          ))}
        </div>
      )}

      {/* Series indicator */}
      {article.series && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-md border mb-6"
          style={{
            borderColor: "var(--j-border)",
            background: "var(--j-bg-secondary)",
          }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
          >
            Part {article.seriesOrder} of
          </span>
          <Link
            href={`/journal/series/${article.series.slug}`}
            className="text-xs font-medium hover:underline"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
          >
            {article.series.title}
          </Link>
        </div>
      )}

      {/* Divider */}
      <hr className="j-divider" />
    </header>
  );
}
