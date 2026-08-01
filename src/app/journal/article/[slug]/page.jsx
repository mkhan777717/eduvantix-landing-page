import { notFound } from "next/navigation";
import ArticleHeader from "@/components/journal/article/ArticleHeader";
import ReadingProgress from "@/components/journal/article/ReadingProgress";
import {
  AISummary,
  RelatedProblems,
  RelatedCourse,
  RelatedContest,
  RelatedDiscussion,
} from "@/components/journal/widgets/EduVantixWidgets";
import LearningPathWidget from "@/components/journal/widgets/LearningPathWidget";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import { TagPill } from "@/components/journal/ui/JournalUI";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Globe, Share2, Link2 } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

async function fetchArticle(slug) {
  try {
    const res = await fetch(`${API}/api/journal/articles/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article || null;
  } catch {
    return null;
  }
}

async function fetchRelated(categorySlug, currentSlug) {
  try {
    const res = await fetch(
      `${API}/api/journal/latest?category=${categorySlug}&limit=4`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).filter((a) => a.slug !== currentSlug).slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = await fetchArticle(resolvedParams?.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt || article.subtitle,
    alternates: { canonical: `https://eduvantix.com/journal/article/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.subtitle,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author?.fullName || article.author?.username],
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

// ─── Line-numbered paragraph component ───────────────────────────────────────

function LineNumberedContent({ contentHtml }) {
  if (!contentHtml) return null;

  return (
    <div
      className="j-prose pl-16 lg:pl-20 relative"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}

// ─── Author card ──────────────────────────────────────────────────────────────

function AuthorCard({ author }) {
  if (!author) return null;
  const profile = author.journalAuthorProfile;

  return (
    <div
      className="flex gap-5 p-6 rounded-lg border mt-12"
      style={{ borderColor: "var(--j-border)", background: "var(--j-bg-secondary)" }}
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.fullName || author.username}
          className="w-16 h-16 rounded-full object-cover border shrink-0"
          style={{ borderColor: "var(--j-border)" }}
        />
      ) : (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold shrink-0"
          style={{ background: "var(--j-accent-light)", color: "var(--j-accent)" }}
        >
          {(author.fullName || author.username || "A")[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-base mb-0.5"
          style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
        >
          {author.fullName || author.username}
        </p>
        {profile?.role && (
          <p className="j-mono text-xs mb-2" style={{ color: "var(--j-eyebrow)" }}>
            {profile.role}
          </p>
        )}
        {profile?.bio && (
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
          >
            {profile.bio}
          </p>
        )}
        <div className="flex items-center gap-4">
          {profile?.followerCount > 0 && (
            <span className="j-mono text-xs" style={{ color: "var(--j-text-muted)" }}>
              {profile.followerCount} followers
            </span>
          )}
          <Link
            href={`/journal/author/${author.username}`}
            className="j-mono text-xs hover:underline"
            style={{ color: "var(--j-accent)" }}
          >
            View all articles →
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            {(author.githubUrl || profile?.githubUrl) && (
              <a href={author.githubUrl || profile.githubUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--j-text-muted)" }} aria-label="GitHub">
                <Globe size={14} />
              </a>
            )}
            {(author.linkedinUrl || profile?.linkedinUrl) && (
              <a href={author.linkedinUrl || profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--j-text-muted)" }} aria-label="LinkedIn">
                <Link2 size={14} />
              </a>
            )}
            {profile?.twitterUrl && (
              <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--j-text-muted)" }} aria-label="Twitter">
                <Share2 size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── JSON-LD Article Schema ───────────────────────────────────────────────────

function ArticleJsonLd({ article }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.fullName || article.author?.username,
      url: `https://eduvantix.com/journal/author/${article.author?.username}`,
    },
    publisher: {
      "@type": "Organization",
      name: "EduVantix Journal",
      logo: { "@type": "ImageObject", url: "https://eduvantix.com/logo.webp" },
    },
    ...(article.coverImage && { image: article.coverImage }),
    mainEntityOfPage: `https://eduvantix.com/journal/article/${article.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://eduvantix.com" },
        { "@type": "ListItem", position: 2, name: "Journal", item: "https://eduvantix.com/journal" },
        { "@type": "ListItem", position: 3, name: article.category?.name || "Article", item: `https://eduvantix.com/journal/category/${article.category?.slug}` },
        { "@type": "ListItem", position: 4, name: article.title, item: `https://eduvantix.com/journal/article/${article.slug}` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const article = await fetchArticle(resolvedParams?.slug);
  if (!article) notFound();

  const relatedArticles = await fetchRelated(article.category?.slug, article.slug);

  // EduVantix integrations from the article
  const firstRelatedProblem = article.relatedProblems?.[0]?.problem;
  const allProblems = article.relatedProblems || [];
  const firstCourse = article.relatedCourses?.[0]?.course;
  const firstContest = article.relatedContests?.[0]?.contest;
  const firstDiscussion = article.relatedDiscussions?.[0]?.discussion;

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      {/* JSON-LD */}
      <ArticleJsonLd article={article} />

      {/* Cover image */}
      {article.coverImage && (
        <div
          className="w-full border-b"
          style={{ borderColor: "var(--j-border)", background: "var(--j-bg-secondary)" }}
        >
          <div className="max-w-[var(--j-content-width)] mx-auto px-5">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-56 sm:h-72 lg:h-96 object-cover rounded-lg my-6"
            />
          </div>
        </div>
      )}

      {/* Article header */}
      <div className="px-5">
        <ArticleHeader article={article} />
      </div>

      {/* Article body */}
      <article
        className="px-5 pb-12"
        aria-label={`Article: ${article.title}`}
      >
        {/* AI Summary (if available) */}
        {article.aiSummary && (
          <div className="max-w-[var(--j-content-width)] mx-auto mb-8">
            <AISummary summary={article.aiSummary} />
          </div>
        )}

        {/* Main content */}
        <div className="max-w-[var(--j-content-width)] mx-auto relative">
          {article.contentHtml ? (
            <div
              className="j-prose"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          ) : (
            <div className="j-prose">
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--j-text-secondary)" }}
              >
                {article.excerpt || "Content coming soon."}
              </p>
            </div>
          )}
        </div>

        {/* ── EduVantix Integration Widgets ──────────────────────────── */}
        <div className="max-w-[var(--j-content-width)] mx-auto mt-12 space-y-0">

          {/* Related Problems */}
          {allProblems.length > 0 && (
            <RelatedProblems problems={allProblems} />
          )}

          {/* Related Course */}
          {firstCourse && <RelatedCourse course={firstCourse} />}

          {/* Related Contest */}
          {firstContest && <RelatedContest contest={firstContest} />}

          {/* Related Discussion */}
          {firstDiscussion && <RelatedDiscussion discussion={firstDiscussion} />}
        </div>

        {/* ── Learning Path Graph Recommendation (Change #7) ────────── */}
        <div className="max-w-[var(--j-content-width)] mx-auto">
          <LearningPathWidget
            learningPath={{
              currentArticle: { slug: article.slug, title: article.title },
              step1_course: firstCourse,
              step2_problem: firstRelatedProblem,
              step3_discussion: firstDiscussion,
              step4_contest: firstContest,
              step5_nextArticle: relatedArticles[0],
            }}
          />
        </div>

        {/* ── Tags ───────────────────────────────────────────────────── */}
        {article.tags?.length > 0 && (
          <div className="max-w-[var(--j-content-width)] mx-auto mt-10 pt-8 border-t" style={{ borderColor: "var(--j-border)" }}>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <TagPill key={tag.slug} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* ── Author Card ──────────────────────────────────────────────── */}
        <div className="max-w-[var(--j-content-width)] mx-auto">
          <AuthorCard author={article.author} />
        </div>

        {/* ── More from Journal ──────────────────────────────────────── */}
        {relatedArticles.length > 0 && (
          <div className="max-w-[var(--j-content-width)] mx-auto mt-16">
            <h2
              className="text-xl font-semibold mb-6"
              style={{
                fontFamily: "var(--j-font-heading)",
                color: "var(--j-text)",
                letterSpacing: "-0.02em",
              }}
            >
              More from EduVantix Journal
            </h2>
            <div>
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 mt-8 text-sm hover:underline"
              style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
            >
              ← Back to Journal
            </Link>
          </div>
        )}
      </article>
    </>
  );
}
