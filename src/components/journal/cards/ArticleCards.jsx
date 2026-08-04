import Link from "next/link";
import { FilePath, DifficultyBadge, AuthorMeta, TagPill } from "@/components/journal/ui/JournalUI";

export function ArticleCard({ article, showExcerpt = true }) {
  if (!article) return null;

  return (
    <Link
      href={`/journal/article/${article.slug}`}
      className="j-article-row block group"
      aria-label={`Read: ${article.title}`}
    >
      {/* Title */}
      <h3
        className="j-article-title mt-1 text-lg leading-snug font-semibold"
        style={{
          fontFamily: "var(--j-font-heading)",
          color: "var(--j-text)",
          letterSpacing: "-0.02em",
        }}
      >
        {article.title}
      </h3>

      {/* Excerpt */}
      {showExcerpt && article.excerpt && (
        <p
          className="mt-1.5 text-sm leading-relaxed line-clamp-2"
          style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
        >
          {article.excerpt}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2">
        <AuthorMeta
          author={article.author}
          date={article.publishedAt}
          readTime={article.readTime}
        />
        <div className="flex items-center gap-1.5 ml-4 shrink-0">
          {article.difficulty && <DifficultyBadge difficulty={article.difficulty} />}
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCard({ article }) {
  if (!article) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-12 lg:py-16">

      {/* Left: editorial text */}
      <div>
        <p className="j-eyebrow mb-4">Featured Article</p>

        <Link href={`/journal/article/${article.slug}`} className="group">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-4 group-hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--j-font-heading)",
              color: "var(--j-text)",
              letterSpacing: "-0.03em",
              fontStyle: "normal",
            }}
          >
            {article.title}
          </h1>
        </Link>

        {article.subtitle && (
          <p
            className="text-base leading-relaxed mb-6 max-w-lg"
            style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
          >
            {article.subtitle}
          </p>
        )}

        {article.excerpt && (
          <p
            className="text-sm leading-relaxed mb-6 max-w-lg line-clamp-3"
            style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
          >
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <AuthorMeta
            author={article.author}
            date={article.publishedAt}
            readTime={article.readTime}
            showAvatar
          />
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag.slug} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Right: terminal */}
      <div className="hidden lg:block">
        {/* Terminal window imported where this is used */}
        <div id="hero-terminal-slot" />
      </div>
    </div>
  );
}

export function MiniArticleCard({ article }) {
  if (!article) return null;
  return (
    <Link
      href={`/journal/article/${article.slug}`}
      className="flex gap-3 py-3 border-b group"
      style={{ borderColor: "var(--j-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="mt-0.5 text-sm font-medium leading-snug truncate group-hover:underline"
          style={{
            fontFamily: "var(--j-font-heading)",
            color: "var(--j-text)",
            textUnderlineOffset: "2px",
            textDecorationThickness: "1px",
          }}
        >
          {article.title}
        </p>
        <p
          className="mt-0.5 text-[11px]"
          style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
        >
          {article.readTime ? `${article.readTime} min` : ""}
          {article.author ? ` · By ${article.author.username}` : ""}
        </p>
      </div>
    </Link>
  );
}
