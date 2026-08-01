import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import Link from "next/link";
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
    title: `${slug ? slug.replace(/-/g, " ") : "Category"} Articles`,
    description: `Browse all EduVantix Journal articles in the ${slug} category.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = await fetchData(`${API}/api/journal/categories/${slug}/articles`);
  if (!data) notFound();

  const articles = data.articles || [];
  const categoryName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 mb-8 text-xs hover:text-[var(--j-accent)] transition-colors"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)" }}
      >
        ← Back to Journal
      </Link>

      <div className="mb-8">
        <p className="j-eyebrow mb-2">Category</p>
        <h1
          className="text-3xl font-semibold"
          style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)", letterSpacing: "-0.02em" }}
        >
          {categoryName}
        </h1>
        <p className="j-mono text-xs mt-2" style={{ color: "var(--j-text-muted)" }}>
          {data.total || articles.length} articles
        </p>
      </div>

      <hr className="j-divider mb-8" />

      {articles.length === 0 ? (
        <p className="j-mono text-sm" style={{ color: "var(--j-text-muted)" }}>
          No articles in this category yet.
        </p>
      ) : (
        articles.map((article) => <ArticleCard key={article.slug} article={article} />)
      )}
    </div>
  );
}
