import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

async function fetchData(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `#${slug} Articles`,
    description: `Browse all EduVantix Journal articles tagged with #${slug}.`,
  };
}

export default async function TagPage({ params }) {
  const { slug } = await params;
  const data = await fetchData(`${API}/api/journal/tags/${slug}/articles`);
  if (!data) notFound();

  const articles = data.articles || [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 mb-8 text-xs hover:text-[var(--j-accent)] transition-colors"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to Journal
      </Link>

      <div className="mb-8">
        <p className="j-eyebrow mb-2">Tag</p>
        <h1
          className="text-3xl font-semibold"
          style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)", letterSpacing: "-0.02em" }}
        >
          #{slug}
        </h1>
        <p className="j-mono text-xs mt-2" style={{ color: "var(--j-text-muted)" }}>
          {data.total || articles.length} articles
        </p>
      </div>

      <hr className="j-divider mb-8" />

      {articles.length === 0 ? (
        <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>
          No articles found for this tag yet.
        </p>
      ) : (
        articles.map((article) => <ArticleCard key={article.slug} article={article} />)
      )}
    </div>
  );
}
