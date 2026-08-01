import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

/* ─────────────────────────────────────────────
   MetadataBase — MUST be set so all relative
   OG image URLs and canonical hrefs resolve
   correctly in production.
───────────────────────────────────────────── */
export const metadata = {
  metadataBase: new URL("https://eduvantix.com"),

  /* ── Title ─────────────────────────────── */
  title: {
    default: "Eduvantix — AI-Powered Tech Learning Platform",
    template: "%s | Eduvantix",
  },

  /* ── Description ────────────────────────── */
  description:
    "Master AI, Generative AI, Full Stack Development, Machine Learning, DevOps, and more on Eduvantix — India's premier AI-powered EdTech platform with live classes, coding contests, and expert mentorship.",

  /* ── Keywords ───────────────────────────── */
  keywords: [
    "AI courses",
    "free tech courses",
    "online learning platform",
    "coding bootcamp",
    "full stack development",
    "generative AI course",
    "machine learning",
    "programming courses",
    "career upskilling",
    "software engineering",
    "interview preparation",
    "tech certifications",
    "AI learning platform",
    "EdTech India",
    "AI agents",
    "live coding classes",
    "React course",
    "Next.js course",
    "Node.js course",
    "Python ML",
    "DatamindX",
    "Eduvantix",
  ],

  /* ── Authors & Publisher ─────────────────── */
  authors: [{ name: "Eduvantix Team", url: "https://eduvantix.com" }],
  publisher: "DatamindX Technologies Pvt. Ltd.",
  creator: "DatamindX Technologies Pvt. Ltd.",

  /* ── Canonical & Alternates ─────────────── */
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "https://eduvantix.com/rss.xml",
    },
  },

  /* ── Robots ─────────────────────────────── */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* ── Open Graph ─────────────────────────── */
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://eduvantix.com",
    siteName: "Eduvantix",
    title: "Eduvantix — AI-Powered Tech Learning Platform",
    description:
      "Master AI, Full Stack Development, Machine Learning, and more on India's premier EdTech platform with live classes and expert mentorship.",
    images: [
      {
        url: "/logo-black-text.webp",
        width: 1200,
        height: 630,
        alt: "Eduvantix — AI-Powered Tech Learning Platform",
        type: "image/webp",
      },
    ],
  },

  /* ── Twitter Card ───────────────────────── */
  twitter: {
    card: "summary_large_image",
    site: "@eduvantix",
    creator: "@eduvantix",
    title: "Eduvantix — AI-Powered Tech Learning Platform",
    description:
      "Master AI, Full Stack Development, Machine Learning, and more on India's premier EdTech platform.",
    images: ["/logo-black-text.webp"],
  },

  /* ── Icons ──────────────────────────────── */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/x-icon" }],
  },

  /* ── App & Theme ────────────────────────── */
  applicationName: "Eduvantix",
  // Note: themeColor and colorScheme are now exported in the viewport object below


  /* ── PWA Manifest ───────────────────────── */
  manifest: "/manifest.json",

  /* ── Referrer ───────────────────────────── */
  referrer: "origin-when-cross-origin",

  /* ── Category ───────────────────────────── */
  category: "education",

  /* ── Verification Tags ──────────────────── */
  // Replace with real codes from Google Search Console / Bing Webmaster
  verification: {
    google: "REPLACE_WITH_GOOGLE_SITE_VERIFICATION",
    // yandex: "REPLACE_WITH_YANDEX_CODE",
    // bing: "REPLACE_WITH_BING_CODE",
  },

  /* ── Other ──────────────────────────────── */
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

/* ─────────────────────────────────────────────
   Global JSON-LD Structured Data
   Injected on every page via root layout.
   Page-specific schemas are added per-page.
───────────────────────────────────────────── */
const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    /* Organization */
    {
      "@type": "Organization",
      "@id": "https://eduvantix.com/#organization",
      name: "Eduvantix",
      alternateName: "Eduvantix by DatamindX",
      url: "https://eduvantix.com",
      logo: {
        "@type": "ImageObject",
        url: "https://eduvantix.com/logo.webp",
        width: 300,
        height: 300,
      },
      description:
        "Eduvantix is an AI-powered EdTech platform by DatamindX Technologies Pvt. Ltd., offering courses in AI, Full Stack Development, Machine Learning, DevOps, and more.",
      foundingDate: "2024",
      founder: {
        "@type": "Organization",
        name: "DatamindX Technologies Pvt. Ltd.",
        url: "https://datamindx.in",
      },
      parentOrganization: {
        "@type": "Organization",
        name: "DatamindX Technologies Pvt. Ltd.",
        url: "https://datamindx.in",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: "https://eduvantix.com/about",
        availableLanguage: ["English", "Hindi"],
      },
      sameAs: [
        "https://datamindx.in",
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    },
    /* EducationalOrganization */
    {
      "@type": "EducationalOrganization",
      "@id": "https://eduvantix.com/#educational-org",
      name: "Eduvantix",
      url: "https://eduvantix.com",
      description:
        "India's premier AI-powered EdTech platform offering live tech courses, coding contests, and expert mentorship for aspiring developers.",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Tech & AI Courses",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "Generative AI Specialist" } },
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "Machine Learning & AI" } },
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "Full Stack Web Development" } },
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "React.js Foundations" } },
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "Next.js App Router" } },
          { "@type": "Offer", itemOffered: { "@type": "Course", name: "DevOps & CI/CD" } },
        ],
      },
    },
    /* WebSite + SearchAction */
    {
      "@type": "WebSite",
      "@id": "https://eduvantix.com/#website",
      url: "https://eduvantix.com",
      name: "Eduvantix",
      description:
        "AI-powered EdTech platform with live coding classes, courses, and contests.",
      publisher: { "@id": "https://eduvantix.com/#organization" },
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://eduvantix.com/courses?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/* ─────────────────────────────────────────────
   Theme initialiser — reads localStorage before
   first paint to prevent theme flash.
───────────────────────────────────────────── */
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('academy_theme') || 'theme-light';
    var valid = ['theme-light', 'theme-dark'];
    if (valid.indexOf(t) === -1) t = 'theme-light';
    document.documentElement.classList.add(t);
  } catch(e) {
    document.documentElement.classList.add('theme-light');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className="h-full antialiased scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <head>
        {/* ── Preconnect for font performance ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Google Fonts — preloaded for LCP ── */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* ── Journal Fonts (Fraunces + Source Serif 4 + IBM Plex Mono) ── */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />

        {/* ── Favicon ──────────────────────── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* ── RSS Feed ─────────────────────── */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Eduvantix — Latest Courses & Updates"
          href="https://eduvantix.com/rss.xml"
        />

        {/* ── Canonical (overridden per-page) ── */}
        <link rel="canonical" href="https://eduvantix.com" />

        {/* ── Global JSON-LD ───────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />

        {/* ── Theme init — before hydration ─── */}
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />

        {/* ── Google Analytics 4 ───────────── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6XV8GNW01T"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6XV8GNW01T');
          `}
        </Script>
      </head>

      <body
        className="min-h-full flex flex-col selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
        suppressHydrationWarning={true}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
