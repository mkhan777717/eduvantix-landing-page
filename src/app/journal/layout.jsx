import JournalLayoutWrapper from "@/components/journal/layout/JournalLayoutWrapper";

export const metadata = {
  title: {
    default: "Eduvantix Journal — Engineering Knowledge & Technical Articles",
    template: "%s | Eduvantix Journal",
  },
  description:
    "Programming tutorials, DSA guides, interview preparation, AI & ML articles, career advice, placement stories, and engineering blogs from the Eduvantix community.",
  openGraph: {
    siteName: "Eduvantix Journal",
    type: "website",
    locale: "en_IN",
  },
  alternates: {
    types: {
      "application/rss+xml": "https://eduvantix.com/rss.xml",
    },
  },
};

export default function JournalLayout({ children }) {
  return (
    <JournalLayoutWrapper>
      <div className="journal-root min-h-screen flex flex-col">
        {/* Skip to content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
          style={{
            background: "var(--j-accent)",
            color: "#FFFFFF",
            fontFamily: "var(--j-font-mono)",
          }}
        >
          Skip to content
        </a>

        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
      </div>
    </JournalLayoutWrapper>
  );
}
