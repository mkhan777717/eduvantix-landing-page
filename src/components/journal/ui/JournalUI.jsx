import Link from "next/link";

export function FilePath({ path, className = "" }) {
  if (!path) return null;
  return (
    <span className={`j-filepath inline-flex items-center gap-0.5 ${className}`}>
      {path}
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  const level = difficulty.toLowerCase();
  return (
    <span className={`j-difficulty ${level}`}>
      {difficulty}
    </span>
  );
}

export function CategoryBadge({ category, href }) {
  const badge = (
    <span
      className="j-mono inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
      style={{ color: "var(--j-eyebrow)", background: "var(--j-eyebrow-bg)" }}
    >
      {category?.icon && <span className="text-xs">{category.icon}</span>}
      {category?.name || category}
    </span>
  );
  if (href) return <Link href={href}>{badge}</Link>;
  return badge;
}

export function TagPill({ tag, href, active = false }) {
  const pill = (
    <span className={`j-tag ${active ? "border-[var(--j-accent)] text-[var(--j-accent)]" : ""}`}>
      #{typeof tag === "string" ? tag : tag.name}
    </span>
  );
  const tagSlug = typeof tag === "string" ? tag : tag.slug;
  if (href || tagSlug) return <Link href={href || `/journal/tag/${tagSlug}`}>{pill}</Link>;
  return pill;
}

export function ReadTime({ minutes, className = "" }) {
  if (!minutes) return null;
  return (
    <span className={`j-mono text-[var(--j-text-muted)] ${className}`}>
      {minutes} min read
    </span>
  );
}

export function AuthorMeta({ author, date, readTime, showAvatar = false }) {
  const displayName = author?.fullName || author?.username || "Author";
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex items-center gap-3">
      {showAvatar && author?.avatarUrl && (
        <img
          src={author.avatarUrl}
          alt={displayName}
          className="w-7 h-7 rounded-full object-cover border border-[var(--j-border)]"
        />
      )}
      <span
        className="j-mono text-xs"
        style={{ color: "var(--j-text-muted)" }}
      >
        By {displayName}
        {formattedDate && <> · {formattedDate}</>}
        {readTime && <> · {readTime} min read</>}
      </span>
    </div>
  );
}
