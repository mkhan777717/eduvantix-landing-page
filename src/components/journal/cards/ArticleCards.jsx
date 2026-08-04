import Link from "next/link";
import { MessageSquare, Heart, Bookmark, Sparkles, Share2, MoreHorizontal, FileText } from "lucide-react";
import { DifficultyBadge, CategoryBadge, TagPill } from "@/components/journal/ui/JournalUI";

export function ArticleCard({ article, showExcerpt = true }) {
  if (!article) return null;

  const authorName = article.author?.fullName || article.author?.username || "EduVantix Author";
  const formattedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const categoryName = article.category?.name || "Engineering";
  const categorySlug = article.category?.slug || "general";

  return (
    <article className="group relative py-6 border-b border-[var(--j-border)] hover:bg-[var(--j-bg-secondary)]/30 transition-all duration-200 rounded-lg px-2 -mx-2">
      
      {/* ── 1. Top Header Meta Row (Medium-Style) ────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--j-text-secondary)] mb-2 flex-wrap font-sans">
        {/* Publication / Category Badge */}
        <Link
          href={`/journal/category/${categorySlug}`}
          className="inline-flex items-center gap-1 font-semibold text-[var(--j-text)] hover:text-[var(--j-accent)] transition-colors"
        >
          <span className="w-5 h-5 rounded bg-[var(--j-accent-light)] text-[var(--j-accent)] flex items-center justify-center text-[10px] font-mono font-bold uppercase shrink-0">
            {categoryName.substring(0, 2)}
          </span>
          In {categoryName}
        </Link>
        <span className="text-[var(--j-text-muted)]">by</span>
        
        {/* Author Name */}
        {article.author?.username ? (
          <Link
            href={`/journal/author/${article.author.username}`}
            className="font-medium text-[var(--j-text)] hover:underline"
          >
            {authorName}
          </Link>
        ) : (
          <span className="font-medium text-[var(--j-text)]">{authorName}</span>
        )}
        
        <span className="text-[var(--j-text-muted)]">·</span>
        <span className="text-[var(--j-text-muted)]">{formattedDate}</span>
      </div>

      {/* ── 2. Middle Main Row (Title & Excerpt Left, Image Right) ───────────── */}
      <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4">
        {/* Left Side: Title & Subtitle/Excerpt */}
        <div className="flex-1 min-w-0">
          <Link href={`/journal/article/${article.slug}`} className="block group/link">
            <h3
              className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-[var(--j-text)] group-hover/link:text-[var(--j-accent)] transition-colors mb-1.5"
              style={{ fontFamily: "var(--j-font-heading)" }}
            >
              {article.title}
            </h3>
          </Link>

          {showExcerpt && (article.subtitle || article.excerpt) && (
            <p
              className="text-sm text-[var(--j-text-secondary)] line-clamp-2 leading-relaxed font-normal"
              style={{ fontFamily: "var(--j-font-reading)" }}
            >
              {article.subtitle || article.excerpt}
            </p>
          )}
        </div>

        {/* Right Side: Cover Image Thumbnail */}
        <Link href={`/journal/article/${article.slug}`} className="shrink-0">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-24 sm:w-36 h-18 sm:h-24 object-cover rounded-md border border-[var(--j-border)] shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
            />
          ) : (
            <div className="w-24 sm:w-36 h-18 sm:h-24 rounded-md border border-[var(--j-border)] bg-[var(--j-bg-secondary)] flex flex-col items-center justify-center gap-1 p-2 text-center text-[var(--j-text-muted)] group-hover:border-[var(--j-accent)] transition-colors">
              <FileText size={20} className="text-[var(--j-accent)] opacity-80" />
              <span className="text-[10px] font-mono font-medium truncate max-w-full px-1">
                {categoryName}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── 3. Bottom Toolbar & Stats Row ────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 text-xs text-[var(--j-text-muted)] font-sans">
        {/* Left Side Meta Indicators */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {article.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[var(--j-accent)] font-medium" title="Featured Article">
              <Sparkles size={13} fill="currentColor" />
            </span>
          )}

          {/* Reaction / Clap Count */}
          <span className="inline-flex items-center gap-1 text-[var(--j-text-secondary)]" title="Reactions">
            <Heart size={14} className="hover:text-red-500 transition-colors" />
            <span>{article.reactionCount || article.reactions || 0}</span>
          </span>

          {/* Comment Count */}
          <span className="inline-flex items-center gap-1 text-[var(--j-text-secondary)]" title="Comments">
            <MessageSquare size={14} className="hover:text-[var(--j-accent)] transition-colors" />
            <span>{article.commentCount || article.comments || 0}</span>
          </span>

          {/* Read Time */}
          {article.readTime && (
            <span>{article.readTime} min read</span>
          )}

          {/* Difficulty Badge */}
          {article.difficulty && (
            <DifficultyBadge difficulty={article.difficulty} />
          )}
        </div>

        {/* Right Side Interactive Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
            title="Save Bookmark"
            aria-label="Bookmark article"
          >
            <Bookmark size={15} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
            title="Share"
            aria-label="Share article"
          >
            <Share2 size={14} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

    </article>
  );
}

export function FeaturedCard({ article }) {
  if (!article) return null;

  const authorName = article.author?.fullName || article.author?.username || "EduVantix Author";
  const formattedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const categoryName = article.category?.name || "Featured";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 border-b border-[var(--j-border)]">

      {/* Left: Featured editorial text */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="j-eyebrow">Featured Story</span>
          <span className="text-[var(--j-text-muted)]">·</span>
          <span className="text-xs text-[var(--j-text-muted)]">{categoryName}</span>
        </div>

        <Link href={`/journal/article/${article.slug}`} className="group">
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-3 text-[var(--j-text)] group-hover:text-[var(--j-accent)] transition-colors"
            style={{ fontFamily: "var(--j-font-heading)" }}
          >
            {article.title}
          </h1>
        </Link>

        {(article.subtitle || article.excerpt) && (
          <p
            className="text-base text-[var(--j-text-secondary)] leading-relaxed mb-6 line-clamp-3 font-normal"
            style={{ fontFamily: "var(--j-font-reading)" }}
          >
            {article.subtitle || article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-[var(--j-text-secondary)] mb-4">
          <span className="font-semibold text-[var(--j-text)]">By {authorName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          {article.readTime && (
            <>
              <span>·</span>
              <span>{article.readTime} min read</span>
            </>
          )}
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <TagPill key={typeof tag === "string" ? tag : tag.slug} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Featured Cover Image */}
      <div className="overflow-hidden rounded-xl border border-[var(--j-border)] bg-[var(--j-bg-secondary)] shadow-sm">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-64 sm:h-80 flex flex-col items-center justify-center p-6 text-center text-[var(--j-text-muted)]">
            <FileText size={48} className="text-[var(--j-accent)] mb-2" />
            <p className="text-sm font-semibold">{article.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MiniArticleCard({ article }) {
  if (!article) return null;
  const authorName = article.author?.fullName || article.author?.username || "Author";

  return (
    <Link
      href={`/journal/article/${article.slug}`}
      className="flex gap-3 py-3 border-b border-[var(--j-border)] group hover:bg-[var(--j-bg-secondary)]/30 px-2 -mx-2 rounded"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--j-text-muted)] mb-0.5 font-sans">
          {authorName} {article.readTime ? `· ${article.readTime} min` : ""}
        </p>
        <p
          className="text-sm font-bold leading-snug truncate text-[var(--j-text)] group-hover:text-[var(--j-accent)] transition-colors"
          style={{ fontFamily: "var(--j-font-heading)" }}
        >
          {article.title}
        </p>
      </div>
    </Link>
  );
}
