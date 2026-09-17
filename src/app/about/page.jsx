import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─────────────────────────────────────────────
   About Page Metadata
───────────────────────────────────────────── */
export const metadata = {
  title: "About eduvantix — Our Mission, Vision & Team",
  description:
    "Learn about eduvantix, India's AI-powered EdTech platform built by DatamindX Technologies. Discover our mission to bridge the gap between education and industry with hands-on tech courses.",
  keywords: [
    "about eduvantix",
    "eduvantix team",
    "DatamindX Technologies",
    "EdTech India mission",
    "AI education platform India",
    "tech education company",
    "online coding school India",
    "DatamindX eduvantix",
  ],
  alternates: {
    canonical: "https://eduvantix.com/about",
  },
  openGraph: {
    type: "website",
    url: "https://eduvantix.com/about",
    title: "About eduvantix — Our Mission, Vision & Team",
    description:
      "eduvantix, built by DatamindX Technologies, is redefining technology education through immersive, project-based learning for the next generation of engineers.",
    siteName: "eduvantix",
    locale: "en_IN",
    images: [
      {
        url: "/logo-black-text.webp",
        width: 1200,
        height: 630,
        alt: "About eduvantix — Mission, Vision & Team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@eduvantix",
    title: "About eduvantix — Our Mission, Vision & Team",
    description:
      "Redefining technology education through immersive, project-based learning by DatamindX Technologies.",
    images: ["/logo-black-text.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─────────────────────────────────────────────
   About Page JSON-LD
───────────────────────────────────────────── */
const aboutJsonLd = [
  /* AboutPage */
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://eduvantix.com/about#webpage",
    url: "https://eduvantix.com/about",
    name: "About eduvantix",
    description:
      "eduvantix is an AI-powered EdTech platform by DatamindX Technologies, offering hands-on tech education in AI, Full Stack Development, and more.",
    isPartOf: { "@id": "https://eduvantix.com/#website" },
    about: { "@id": "https://eduvantix.com/#organization" },
    inLanguage: "en-IN",
  },
  /* BreadcrumbList */
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://eduvantix.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: "https://eduvantix.com/about",
      },
    ],
  },
];

export default function About() {
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* About Page JSON-LD */}
      {aboutJsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Navbar />

      <main className="flex-grow" id="main-content">
        <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-[var(--text-secondary)]">

          {/* Breadcrumb — visible navigation */}
          <nav aria-label="Breadcrumb" className="mb-10 text-sm">
            <ol className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <li><a href="/" style={{ color: "var(--accent-primary)" }}>Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" style={{ color: "var(--text-secondary)" }}>About</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-20">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              Our Mission & Story
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-tight">
              About{" "}
              <span className="bg-gradient-to-r from-[#059669] via-[#10b981] to-[#047857] bg-clip-text text-transparent">
                eduvantix
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-[var(--text-secondary)]">
              We are redefining technology education through immersive,
              project-based learning. Built by developers, for the next
              generation of engineers.
            </p>
          </div>

          {/* Mission & Vision Grid */}
          <div className="grid md:grid-cols-2 gap-10 mb-20">
            <article
              className="p-10 rounded-3xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full mb-6 flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-primary)20",
                  color: "var(--accent-primary)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
                Our Mission
              </h2>
              <p className="leading-relaxed">
                To bridge the gap between traditional education and industry
                requirements. We aim to equip learners with cutting-edge skills
                in Web Development, AI, and Cloud technologies through
                hands-on, real-world projects rather than just theoretical
                lectures.
              </p>
            </article>

            <article
              className="p-10 rounded-3xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full mb-6 flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-primary)20",
                  color: "var(--accent-primary)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
                Our Vision
              </h2>
              <p className="leading-relaxed">
                We envision a world where anyone, anywhere, can access
                high-quality, practical tech education. By building a
                community-driven platform with live classes, competitive coding
                environments, and expert mentorship, we&apos;re creating the
                ultimate launchpad for tech careers.
              </p>
            </article>
          </div>

          {/* What We Offer */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-[var(--text-primary)] text-center">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "AI & Machine Learning Courses",
                  desc: "Comprehensive courses in Generative AI, LLMs, LangChain, Machine Learning, and Data Science — taught with real-world projects.",
                },
                {
                  title: "Live Interactive Classes",
                  desc: "Expert-led live sessions with real-time chat, polls, leaderboards, and Q&A. Learn from industry practitioners, not just textbooks.",
                },
                {
                  title: "Coding Contests",
                  desc: "Sharpen your problem-solving skills with timed coding competitions, DSA challenges, and hackathons.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Parent Company Section */}
          <section className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
              Backed by DatamindX Technologies Pvt. Ltd.
            </h2>
            <p className="leading-relaxed mb-6">
              eduvantix is proudly built and maintained by{" "}
              <strong className="text-[var(--text-primary)]">DatamindX</strong>.
              Leveraging years of industry experience in data solutions and
              software engineering, DatamindX created eduvantix to share
              practical, enterprise-grade knowledge with aspiring developers.
            </p>
            <a
              href="https://datamindx.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-primary)",
              }}
              aria-label="Visit DatamindX Technologies official website (opens in new tab)"
            >
              Visit DatamindX
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
