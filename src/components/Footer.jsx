"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const footerLinks = [
  {
    title: "Tracks",
    links: [
      { name: "Frontend Architecture", href: "/courses?category=Web%20%26%20Mobile%20Development" },
      { name: "AI & Data Science", href: "/courses?category=Data%20%26%20AI" },
      { name: "Cloud & DevOps", href: "/courses?category=Cloud%20%26%20DevOps" },
      { name: "Creative Tech", href: "/courses?category=Creative%20Tech" },
    ],
  },
  {
    title: "Platform",
    links: [
      { name: "Live Classes", href: "/live-classes" },
      { name: "Contest Hub", href: "/contest" },
      { name: "Free Courses", href: "/courses" },
      { name: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Eduvantix", href: "/about" },
      { name: "Academy Blog", href: "#" },
      { name: "Student Work", href: "#" },
      { name: "Careers", href: "/careers" },
    ],
  },
];

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`relative pt-20 pb-10 footer-reveal ${isVisible ? "is-visible" : ""}`}
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-primary)",
      }}
    >

      <div className="mx-auto max-w-[1400px] px-6 md:px-12">

        {/* Large */}
        <div className="mb-16 overflow-hidden">
          <div
            className="text-[clamp(4rem,10vw,9rem)] font-black tracking-[-0.06em] leading-none select-none uppercase w-full transition-colors duration-700"
            style={{
              color: isVisible
                ? (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? "var(--accent-gradient)"
                  : "#000")
                : "var(--border-card)",
              letterSpacing: "0.4em",
              transitionDelay: isVisible ? "0.5s" : "0s",
            }}
          >
            Eduvantix
          </div>
        </div>

        {/* Link columns + tagline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-16" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          {/* Tagline column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: "var(--text-muted)" }}>
              Engineering precision meets high-end creative design.
            </p>
            <div className="space-y-1.5 pt-1">
              <a href="tel:9205454717" className="block text-sm transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
                +91 9205454717
              </a>
              <a href="mailto:hello@eduvantix.com" className="block text-sm transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-secondary)" }}>
                hello@eduvantix.com
              </a>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: <TwitterIcon />, href: "#", label: "Twitter" },
                { icon: <YoutubeIcon />, href: "#", label: "YouTube" },
                { icon: <GithubIcon />, href: "#", label: "GitHub" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--text-accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-primary)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerLinks.map(col => (
            <div key={col.title} className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-200 underline-draw"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Eduvantix Inc. All rights reserved. A product of{" "}
            <a href="https://datamindx.in" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] transition-colors underline">
              DatamindX
            </a>.
          </p>

          <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <Link href="/privacy-policy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy Policy</Link>
            <span style={{ color: "var(--border-primary)" }}>·</span>
            <Link href="/terms-of-service" className="hover:text-[var(--text-secondary)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}