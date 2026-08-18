import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ─────────────────────────────────────────────
   Privacy Policy Metadata
───────────────────────────────────────────── */
export const metadata = {
  title: "Privacy Policy — Eduvantix",
  description:
    "Read the Eduvantix Privacy Policy to understand how we collect, use, and protect your personal data. Eduvantix is a product of DatamindX Technologies Pvt. Ltd.",
  keywords: [
    "Eduvantix privacy policy",
    "data privacy EdTech",
    "Eduvantix data collection",
    "DatamindX privacy",
  ],
  alternates: {
    canonical: "https://eduvantix.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://eduvantix.com/privacy-policy",
    title: "Privacy Policy — Eduvantix",
    description:
      "How Eduvantix collects, uses, and protects your personal information. Transparency is a core value.",
    siteName: "Eduvantix",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    site: "@eduvantix",
    title: "Privacy Policy — Eduvantix",
  },
};

/* ─────────────────────────────────────────────
   Privacy Policy JSON-LD
───────────────────────────────────────────── */
const privacyJsonLd = {
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
      name: "Privacy Policy",
      item: "https://eduvantix.com/privacy-policy",
    },
  ],
};

export default function PrivacyPolicy() {
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />

      <Navbar />
      <main className="flex-grow" id="main-content">
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-[var(--text-secondary)]">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm">
            <ol className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <li><a href="/" style={{ color: "var(--accent-primary)" }}>Home</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Privacy Policy</li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-[var(--text-primary)]">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-sm md:text-base leading-relaxed">
            <p>
              <time dateTime="2025-01-01">Last updated: January 1, 2025</time>
            </p>

            <section aria-labelledby="intro-heading">
              <h2 id="intro-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                1. Introduction
              </h2>
              <p>
                Welcome to Eduvantix, an educational platform operated by DatamindX Technologies Pvt. Ltd. (
                <a
                  href="https://datamindx.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--text-primary)]"
                  aria-label="Visit DatamindX website (opens in new tab)"
                >
                  datamindx.in
                </a>
                ). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (
                <a
                  href="https://eduvantix.com"
                  className="underline text-[var(--text-primary)]"
                >
                  https://eduvantix.com
                </a>
                ) and use our platform services.
              </p>
            </section>

            <section aria-labelledby="collection-heading">
              <h2 id="collection-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                2. Information We Collect
              </h2>
              <p>
                We may collect personal identification information from Users in a variety of ways, including when Users visit our site, register on the site, log in using third-party services, and interact with our educational services.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  <strong>Account & Personal Data:</strong> Full name, email address, phone number, profile image, and authentication credentials.
                </li>
                <li>
                  <strong>Google User Data (Google OAuth):</strong> When you sign up or log in using Google Single Sign-On (SSO), we access basic profile information provided by Google OAuth APIs, including your Google profile name, primary email address, and profile picture URL.
                </li>
                <li>
                  <strong>Usage & Technical Data:</strong> IP address, browser type, operating system, pages visited, time spent on pages, and platform performance diagnostics.
                </li>
                <li>
                  <strong>Platform Data:</strong> Progress in courses, live class participation, quiz submissions, and contest activity.
                </li>
              </ul>
            </section>

            <section aria-labelledby="usage-heading">
              <h2 id="usage-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                3. How We Use Your Information
              </h2>
              <p>Eduvantix uses the collected data for the following legitimate purposes:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>To authenticate users and manage user accounts securely.</li>
                <li>To deliver, maintain, and personalize our learning services and features.</li>
                <li>To communicate account updates, transaction receipts, and platform notifications.</li>
                <li>To provide customer support and respond to inquiries.</li>
                <li>To monitor, analyze, and optimize platform performance and user experience.</li>
                <li>To prevent fraud, unauthorized access, and security breaches.</li>
              </ul>
            </section>

            {/* Google API Services User Data Policy Compliance */}
            <section aria-labelledby="google-data-heading" className="p-6 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <h2 id="google-data-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                4. Google API Services User Data Policy & Limited Use Disclosure
              </h2>
              <p className="mb-3">
                Eduvantix accesses and uses data obtained through Google API Services strictly in accordance with Google requirements.
              </p>
              <p className="mb-3 font-medium text-[var(--text-primary)]">
                Eduvantix's use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--accent-primary)] hover:text-[var(--text-primary)]"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>No Commercial Sharing:</strong> We do not transfer, sell, or rent Google user data to third parties, advertising networks, or data brokers.
                </li>
                <li>
                  <strong>No Advertising Use:</strong> We do not use or transfer Google user data for serving advertisements, personalized ads, or retargeting.
                </li>
                <li>
                  <strong>Human Inspection Restrictions:</strong> No human reads or inspects Google user data except with explicit user consent for troubleshooting purposes, to comply with applicable law, or for aggregated/anonymized internal security audits.
                </li>
              </ul>
            </section>

            <section aria-labelledby="sharing-heading">
              <h2 id="sharing-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                5. Data Sharing and Disclosure
              </h2>
              <p>
                We respect your privacy and do not sell or rent your personal information. We share data only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party service providers (e.g., hosting infrastructure, database services) bound by confidentiality obligations.</li>
                <li><strong>Legal Compliance:</strong> If required by law, subpoena, court order, or governmental regulations.</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of company assets, subject to strict privacy protections.</li>
              </ul>
            </section>

            <section aria-labelledby="security-heading">
              <h2 id="security-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                6. Data Security, Retention, and User Rights
              </h2>
              <p className="mb-3">
                We employ industry-standard encryption, secure socket layer (SSL/TLS) protocols, and access controls to protect your data against unauthorized access, loss, or alteration.
              </p>
              <p className="mb-3">
                <strong>Data Retention & Deletion:</strong> We retain personal data for as long as your account remains active or as needed to provide platform services. Users have the right to request access, correction, or permanent deletion of their account and personal data at any time.
              </p>
              <p>
                To request data deletion, email us at{" "}
                <a href="mailto:hello@eduvantix.com" className="underline text-[var(--text-primary)]">
                  hello@eduvantix.com
                </a>
                . Account deletion requests will be fulfilled within 30 days.
              </p>
            </section>

            <section aria-labelledby="contact-heading">
              <h2 id="contact-heading" className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                7. Contact Us
              </h2>
              <p className="mb-2">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              <ul className="list-none space-y-1 font-medium">
                <li><strong>Eduvantix</strong> (a product of DatamindX Technologies Pvt. Ltd.)</li>
                <li>Email: <a href="mailto:hello@eduvantix.com" className="underline text-[var(--text-primary)]">hello@eduvantix.com</a></li>
                <li>Phone: +91 9205454717</li>
                <li>Website: <a href="https://eduvantix.com" className="underline text-[var(--text-primary)]">https://eduvantix.com</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
