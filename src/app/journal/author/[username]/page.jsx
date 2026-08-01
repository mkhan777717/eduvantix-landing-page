import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import Link from "next/link";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `${username || "Author"} — EduVantix Journal`,
    description: `Articles by ${username} on EduVantix Journal.`,
  };
}

export default async function AuthorPage({ params }) {
  const { username } = await params;
  let data;
  try {
    const res = await fetch(`${API}/api/journal/authors/${username}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) notFound();
    data = await res.json();
  } catch { notFound(); }

  const author = data?.author;
  if (!author) notFound();

  const profile = author.journalAuthorProfile;
  const articles = author.journalArticles || [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 mb-10 text-xs hover:text-[var(--j-accent)] transition-colors"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
      >
        ← Back to Journal
      </Link>

      {/* Author header */}
      <div className="flex gap-6 items-start mb-10 pb-10 border-b" style={{ borderColor: "var(--j-border)" }}>
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.fullName || author.username}
            className="w-20 h-20 rounded-full object-cover border shrink-0"
            style={{ borderColor: "var(--j-border)" }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold shrink-0"
            style={{ background: "var(--j-accent-light)", color: "var(--j-accent)", fontFamily: "var(--j-font-heading)" }}
          >
            {(author.fullName || author.username || "A")[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)", letterSpacing: "-0.02em" }}
          >
            {author.fullName || author.username}
          </h1>
          {profile?.role && (
            <p className="j-mono text-xs mb-3" style={{ color: "var(--j-eyebrow)" }}>{profile.role}</p>
          )}
          {profile?.bio && (
            <p
              className="text-sm leading-relaxed mb-4 max-w-lg"
              style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
            >
              {profile.bio}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>
              {articles.length} articles
            </span>
            {profile?.followerCount > 0 && (
              <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>
                {profile.followerCount} followers
              </span>
            )}
            {(author.githubUrl || profile?.githubUrl) && (
              <a
                href={author.githubUrl || profile.githubUrl}
                target="_blank" rel="noopener noreferrer"
                className="j-mono text-xs hover:underline"
                style={{ color: "var(--j-accent)" }}
              >
                GitHub →
              </a>
            )}
            {(author.linkedinUrl || profile?.linkedinUrl) && (
              <a
                href={author.linkedinUrl || profile.linkedinUrl}
                target="_blank" rel="noopener noreferrer"
                className="j-mono text-xs hover:underline"
                style={{ color: "var(--j-accent)" }}
              >
                LinkedIn →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Articles */}
      <h2
        className="text-lg font-semibold mb-6"
        style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
      >
        Articles
      </h2>

      {articles.length === 0 ? (
        <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>
          No published articles yet.
        </p>
      ) : (
        articles.map((article) => <ArticleCard key={article.slug} article={article} />)
      )}
    </div>
  );
}
