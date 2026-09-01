"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 mx-auto flex h-16 w-[95%] max-w-[1310px] items-center rounded-full border px-6 backdrop-blur-xl md:w-[90%] md:px-8" style={{ background: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
      <nav className="flex h-full w-full items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="eduvantix home">
          <img src="/logo-black-text.webp" alt="eduvantix Logo" className="h-7 w-auto object-contain dark:hidden" />
          <img src="/logo-white-text.webp" alt="eduvantix Logo" className="hidden h-7 w-auto object-contain dark:block" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="https://learn.eduvantix.com" className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 sm:inline-flex" style={{ background: "var(--accent-gradient)" }}>
            <span>Sign In</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </nav>
    </header>
  );
}
