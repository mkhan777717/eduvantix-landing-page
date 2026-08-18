import Link from "next/link";
import { ArticleCard } from "@/components/journal/cards/ArticleCards";
import { TagPill, CategoryBadge } from "@/components/journal/ui/JournalUI";
import { ArrowRight, Search } from "lucide-react";
import { getApiBase } from "@/utils/api";
import JournalHeaderActions from "@/components/journal/ui/JournalHeaderActions";
import JournalGuestGate from "@/components/journal/ui/JournalGuestGate";

const API = getApiBase();

// ── Data fetching helpers (Server Component) ─────────────────────────────────

export const dynamic = "force-dynamic";

async function fetchJSON(path) {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Category Section ─────────────────────────────────────────────────────────

function CategorySection({ title, articles, categorySlug, eyebrow }) {
  if (!articles?.length) return null;

  return (
    <section className="mb-16" aria-label={title}>
      <div className="flex items-end justify-between mb-6">
        <div>
          {eyebrow && <p className="j-eyebrow mb-1">{eyebrow}</p>}
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{
              color: "var(--j-text)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
        </div>
        {categorySlug && (
          <Link
            href={`/journal/category/${categorySlug}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
          >
            View all <ArrowRight size={12} />
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {categorySlug && (
        <Link
          href={`/journal/category/${categorySlug}`}
          className="sm:hidden inline-flex items-center gap-1 mt-4 text-xs font-semibold hover:underline"
          style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
        >
          View all {title} <ArrowRight size={12} />
        </Link>
      )}
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Eduvantix Blogs — Learn, Build & Grow",
  description:
    "Engineering guides, DSA tutorials, interview preparation, system design architecture, and placement advice from the Eduvantix community.",
  alternates: { canonical: "https://eduvantix.com/journal" },
};

export default async function JournalHomePage() {
  // Parallel fetch — all server-side at build/revalidation time
  const [
    featuredData,
    latestData,
    dsaData,
    webDevData,
    aiData,
    systemDesignData,
    interviewData,
    careerData,
    communityData,
    categoriesData,
    tagsData,
    popularData,
  ] = await Promise.all([
    fetchJSON("/api/journal/featured"),
    fetchJSON("/api/journal/latest?limit=6"),
    fetchJSON("/api/journal/latest?category=dsa&limit=5"),
    fetchJSON("/api/journal/latest?category=web-development&limit=5"),
    fetchJSON("/api/journal/latest?category=ai-ml&limit=5"),
    fetchJSON("/api/journal/latest?category=system-design&limit=4"),
    fetchJSON("/api/journal/latest?category=interview&limit=5"),
    fetchJSON("/api/journal/latest?category=career&limit=4"),
    fetchJSON("/api/journal/latest?category=community&limit=4"),
    fetchJSON("/api/journal/categories"),
    fetchJSON("/api/journal/tags"),
    fetchJSON("/api/journal/popular?limit=5"),
  ]);

  const featured = featuredData?.article;
  const latest = latestData?.articles || [];
  const dsa = dsaData?.articles || [];
  const webDev = webDevData?.articles || [];
  const ai = aiData?.articles || [];
  const sysDesign = systemDesignData?.articles || [];
  const interview = interviewData?.articles || [];
  const career = careerData?.articles || [];
  const community = communityData?.articles || [];
  const categories = categoriesData?.categories || [];
  const tags = (tagsData?.tags || []).slice(0, 20);
  const popular = popularData?.articles || [];

  return (
    <JournalGuestGate>
    <div className="px-5 py-8 max-w-7xl mx-auto">
      {/* ── Platform Page Header Banner ── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--j-border)" }}>
        <div className="space-y-2">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              color: "var(--j-text)",
              fontFamily: "var(--font-title)",
            }}
          >
            Eduvantix Blogs
          </h1>
          <p className="text-sm max-w-xl leading-relaxed" style={{ color: "var(--j-text-secondary)" }}>
            Engineering guides, DSA tutorials, system architecture, interview preparation, and technical insights from the Eduvantix community.
          </p>
        </div>

        {/* Action buttons */}
        <JournalHeaderActions />
      </section>

      {/* ── Category Pill Filter Bar + Search ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-xl border overflow-x-auto no-scrollbar"
          style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)" }}
        >
          {[
            { label: "All Blogs", href: "/journal" },
            { label: "DSA", href: "/journal/category/dsa" },
            { label: "Web Dev", href: "/journal/category/web-development" },
            { label: "AI & ML", href: "/journal/category/ai-ml" },
            { label: "System Design", href: "/journal/category/system-design" },
            { label: "Interview", href: "/journal/category/interview" },
            { label: "Career", href: "/journal/category/career" },
          ].map((cat, idx) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${idx === 0
                ? "text-white shadow-xs font-bold"
                : "hover:text-[var(--j-accent)] text-[var(--j-text-secondary)]"
                }`}
              style={{
                background: idx === 0 ? "var(--j-accent)" : "transparent",
              }}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Search Bar Input */}
        <form action="/journal/search" method="GET" className="relative w-full md:w-72">
          {/* Search Icon */}
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none" style={{ color: "var(--j-text-muted)" }}>
            <Search size={14} strokeWidth={2} />
          </span>
          <input
            type="text"
            name="q"
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 rounded-full border text-xs outline-none transition-colors focus:border-[var(--j-accent)]"
            style={{
              fontFamily: "var(--j-font-mono)",
              fontSize: "0.75rem",
              background: "var(--j-bg-card)",
              borderColor: "var(--j-border)",
              color: "var(--j-text)",
            }}
          />
        </form>
      </div>

      {/* ── Main content grid ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">

          {/* ── Primary column ─────────────────────────────────────────── */}
          <div>
            {/* Latest */}
            <CategorySection
              title="Latest Articles"
              eyebrow="New & Recent"
              articles={latest}
              categorySlug={null}
            />

            {/* DSA */}
            <CategorySection
              title="Data Structures & Algorithms"
              eyebrow="DSA"
              articles={dsa}
              categorySlug="dsa"
            />

            {/* Web Development */}
            <CategorySection
              title="Web Development"
              eyebrow="Web Dev"
              articles={webDev}
              categorySlug="web-development"
            />

            {/* AI & ML */}
            <CategorySection
              title="AI & Machine Learning"
              eyebrow="AI / ML"
              articles={ai}
              categorySlug="ai-ml"
            />

            {/* System Design */}
            <CategorySection
              title="System Design"
              eyebrow="Architecture"
              articles={sysDesign}
              categorySlug="system-design"
            />

            {/* Interview Prep */}
            <CategorySection
              title="Interview Preparation"
              eyebrow="Interviews"
              articles={interview}
              categorySlug="interview"
            />

            {/* Career */}
            <CategorySection
              title="Career"
              eyebrow="Growth"
              articles={career}
              categorySlug="career"
            />

            {/* Community */}
            <CategorySection
              title="Community Picks"
              eyebrow="Community"
              articles={community}
              categorySlug="community"
            />
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside aria-label="Sidebar" className="space-y-10">

            {/* Popular this week / Trending */}
            {popular.length > 0 && (
              <div>
                <h2
                  className="text-sm font-medium mb-4"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    color: "var(--j-text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Trending
                </h2>
                <div>
                  {popular.map((article, i) => (
                    <Link
                      key={article.slug}
                      href={`/journal/article/${article.slug}`}
                      className="flex gap-3 py-3 border-b group"
                      style={{ borderColor: "var(--j-border-subtle)" }}
                    >
                      <span
                        className="text-xl font-bold leading-none mt-1 shrink-0"
                        style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text-muted)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium leading-snug group-hover:underline"
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
                          {article.viewCount?.toLocaleString()} views
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h2
                  className="text-sm font-medium mb-4"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    color: "var(--j-text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Categories
                </h2>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/journal/category/${cat.slug}`}
                      className="flex items-center justify-between py-1.5 group border-b border-dashed"
                      style={{ borderColor: "var(--j-border-subtle)" }}
                    >
                      <span
                        className="text-sm group-hover:text-[var(--j-accent)] transition-colors"
                        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-secondary)" }}
                      >
                        {cat.name}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-text-muted)", background: "var(--j-bg-secondary)" }}
                      >
                        {cat.articleCount || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags cloud */}
            {tags.length > 0 && (
              <div>
                <h2
                  className="text-sm font-medium mb-4"
                  style={{
                    fontFamily: "var(--j-font-mono)",
                    color: "var(--j-text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Explore Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagPill key={tag.slug} tag={tag} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
    </JournalGuestGate>
  );
}
