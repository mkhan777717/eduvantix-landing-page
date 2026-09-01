import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── World-Class Redesigned Landing Sections ──
import LandingHeroNew from "@/components/landing/LandingHeroNew";
import LandingProblemNew from "@/components/landing/LandingProblemNew";
import LandingHowItWorksNew from "@/components/landing/LandingHowItWorksNew";
import LandingPlatformPreview from "@/components/landing/LandingPlatformPreview";
import LandingPricingTiers from "@/components/landing/LandingPricingTiers";
import LandingProExperience from "@/components/landing/LandingProExperience";
import LandingInstituteTeaser from "@/components/landing/LandingInstituteTeaser";
import LandingForWho from "@/components/landing/LandingForWho";
import LandingComparisonNew from "@/components/landing/LandingComparisonNew";
import LandingSocialProof from "@/components/landing/LandingSocialProof";
import LandingTestimonialsNew from "@/components/landing/LandingTestimonialsNew";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingFinalCTANew from "@/components/landing/LandingFinalCTANew";

/* ─────────────────────────────────────────────
   Homepage Metadata
   Optimised for: AI Courses, Free Tech Courses,
   Online Learning Platform, Coding Bootcamp,
   Full Stack Development, Generative AI, etc.
───────────────────────────────────────────── */
export const metadata = {
  title: "eduvantix — From Learning to Getting Hired | AI Career Platform",
  description:
    "eduvantix is an AI-powered career platform that takes you from zero to hired. Personalized roadmaps, real projects, AI mentorship, and direct employer connections.",
  keywords: [
    "AI courses India",
    "free tech courses online",
    "online learning platform",
    "coding bootcamp India",
    "full stack development course",
    "generative AI course",
    "AI agents course",
    "machine learning course",
    "programming courses for beginners",
    "career upskilling tech",
    "software engineering course",
    "interview preparation coding",
    "tech certifications online",
    "AI learning platform India",
    "EdTech India",
    "live coding classes",
    "React course free",
    "Next.js course",
    "Node.js course",
    "Python machine learning",
    "DevOps course",
    "eduvantix",
    "DatamindX",
  ],
  alternates: {
    canonical: "https://eduvantix.com",
    types: {
      "application/rss+xml": "https://eduvantix.com/rss.xml",
    },
  },
  openGraph: {
    type: "website",
    url: "https://eduvantix.com",
    title: "eduvantix — From Learning to Getting Hired",
    description:
      "AI-powered career platform with personalized roadmaps, real projects, AI mentorship, and direct employer hiring.",
    siteName: "eduvantix",
    locale: "en_IN",
    images: [
      {
        url: "/logo-black-text.webp",
        width: 1200,
        height: 630,
        alt: "eduvantix — AI Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@eduvantix",
    title: "eduvantix — From Learning to Getting Hired",
    description:
      "AI-powered career platform with personalized roadmaps, real projects, AI mentorship, and direct employer hiring.",
    images: ["/logo-black-text.webp"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* S1: Hero */}
        <LandingHeroNew />

        {/* S2: Problem */}
        <LandingProblemNew />

        {/* S3: How It Works */}
        <LandingHowItWorksNew />

        {/* S5: Platform Preview */}
        <LandingPlatformPreview />

        {/* S6: Individual Pricing Tiers (Free / Premium / Pro) */}
        <LandingPricingTiers />

        {/* S7: eduvantix Pro Experience (AI Career Journey) */}
        <LandingProExperience />

        {/* S8: eduvantix for Institutes — teaser CTA to /institutes */}
        <LandingInstituteTeaser />

        {/* S9: For Students & Institutes */}
        <LandingForWho />

        {/* S10: Comparison Table */}
        <LandingComparisonNew />

        {/* S11: Social Proof */}
        <LandingSocialProof />

        {/* S12: Testimonials */}
        <LandingTestimonialsNew />

        {/* S13: FAQ */}
        <LandingFAQ />

        {/* S14: Unified Final CTA */}
        <LandingFinalCTANew />
      </main>

      <Footer />
    </div>
  );
}
