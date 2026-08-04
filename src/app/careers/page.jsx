import CareersClient from "./CareersClient";

/* ─────────────────────────────────────────────
   Careers Page Metadata
   Public page accessible directly at /careers
   and via footer links across Eduvantix.
───────────────────────────────────────────── */
export const metadata = {
  title: "Careers at Eduvantix — Join Our Mission to Build the Future of Learning",
  description:
    "Explore job opportunities, internships, engineering roles, and careers at Eduvantix. Discover our culture, locations, hiring process, and submit your application.",
  keywords: [
    "Eduvantix careers",
    "jobs at Eduvantix",
    "software engineering jobs India",
    "EdTech internships",
    "AI research jobs",
    "full stack developer careers",
    "DatamindX jobs",
    "remote tech jobs India",
  ],
  alternates: {
    canonical: "https://eduvantix.com/careers",
  },
  openGraph: {
    type: "website",
    url: "https://eduvantix.com/careers",
    title: "Careers at Eduvantix — Join Our Mission to Build the Future of Learning",
    description:
      "Join Eduvantix to build next-generation AI learning platforms. Explore open positions in software development, AI engineering, design, and DevOps.",
    siteName: "Eduvantix",
  },
};

export default function CareersPage() {
  return <CareersClient standalone={true} />;
}
