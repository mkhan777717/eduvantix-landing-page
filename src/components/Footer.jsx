"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About eduvantix", href: "/about" },
      { name: "Careers", href: "/careers" },
    ],
  }
];

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
            eduvantix
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
                { icon: <TwitterIcon />, href: "https://x.com/DatamindXTech", label: "X (Twitter)" },
                { icon: <LinkedinIcon />, href: "https://www.linkedin.com/company/eduvantix", label: "LinkedIn" },
                { icon: <YoutubeIcon />, href: "https://www.youtube.com/@eduvantix-india", label: "YouTube" },
                { icon: <InstagramIcon />, href: "https://www.instagram.com/eduvantix", label: "Instagram" },
                { icon: <FacebookIcon />, href: "https://www.facebook.com/profile.php?id=61593110181990", label: "Facebook" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
            © {new Date().getFullYear()} eduvantix Inc. All rights reserved. A product of{" "}
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