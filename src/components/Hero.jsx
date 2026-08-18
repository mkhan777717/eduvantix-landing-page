"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play, Code2, Cpu, Cloud, CheckCircle2, Star, Users, BookOpen, Award } from "lucide-react";
import useTheme from "@/customHooks/useTheme";
import { getThemeTokens } from "@/utils/themeTokens";

const TRACK_SNIPPETS = {
  ai: {
    title: "AI & Generative AI",
    icon: Cpu,
    filename: "llm_agent.py",
    badge: "Trending",
    code: `from eduvantix import Agent, RAGPipeline

agent = Agent(
    model="gpt-4o",
    role="FullStack Mentor",
    knowledge=RAGPipeline(vector_db="chroma")
)

# Run autonomous code review
response = agent.review_code(repo="user/app")
print(f"✨ Score: {response.quality_score}/100")`,
  },
  web: {
    title: "Full-Stack Web Dev",
    icon: Code2,
    filename: "App.jsx",
    badge: "Popular",
    code: `import { useState, useEffect } from "react";
import { EduvantixSDK } from "@eduvantix/core";

export default function TechPortal() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    EduvantixSDK.getTracks().then(setCourses);
  }, []);

  return <CourseCatalog data={courses} />;
}`,
  },
  devops: {
    title: "Cloud & DevOps",
    icon: Cloud,
    filename: "deploy.yml",
    badge: "High Demand",
    code: `name: Production Deployment
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Eduvantix Cloud
        run: npx eduvantix-cli deploy --prod`,
  },
};

export default function Hero() {
  const dark = useTheme();
  const tok = getThemeTokens(dark);
  const [activeTab, setActiveTab] = useState("ai");

  const currentSnippet = TRACK_SNIPPETS[activeTab];
  const IconComponent = currentSnippet.icon;

  return (
    <section
      className="relative w-full overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: dark ? "#05070a" : "#f8fafc",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      {/* Premium Background Accent Elements (CSS Only, No JS Loops) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left gradient glow */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] opacity-40"
          style={{
            background: dark
              ? "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(59,130,246,0.15) 100%)"
              : "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.1) 100%)",
          }}
        />

        {/* Bottom-right gradient glow */}
        <div
          className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full blur-[140px] opacity-30"
          style={{
            background: dark
              ? "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(16,185,129,0.1) 100%)"
              : "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.08) 100%)",
          }}
        />

        {/* Subtle grid lines background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(${dark ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Hero Container */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 sm:pb-20">

        {/* Main Grid: Left Copy & CTAs, Right Interactive Code Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* LEFT COLUMN: Brand Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 sm:space-y-8">

            {/* Hero Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]"
              style={{ color: tok.textPrimary }}
            >
              Master AI, Cloud & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
                Full-Stack Engineering
              </span>
            </h1>

            {/* Sub-headline / Value Proposition */}
            <p
              className="text-base sm:text-lg max-w-2xl leading-relaxed"
              style={{ color: tok.textSecondary }}
            >
              Accelerate your software career with production-ready tracks, live instructor mentorship, real-world coding playgrounds, and industry-recognized certifications.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto pt-2">
              <Link
                href="/courses"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                }}
              >
                <span>Explore Courses</span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/live-classes"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                style={{
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                  borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                  color: tok.textPrimary,
                }}
              >
                <Play size={15} className="fill-current text-emerald-500" />
                <span>Live Classes</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium opacity-80" style={{ color: tok.textMuted }}>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Free & Premium Tracks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Live Mentorship</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Hands-on Projects</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive macOS Code Card */}
          <div className="lg:col-span-5 w-full">
            <div
              className="rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl transition-all"
              style={{
                backgroundColor: dark ? "rgba(13, 17, 23, 0.85)" : "rgba(255, 255, 255, 0.9)",
                borderColor: dark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)",
                boxShadow: dark
                  ? "0 20px 50px -10px rgba(0, 0, 0, 0.7)"
                  : "0 20px 50px -10px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* macOS Window Title Bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
                  borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                }}
              >
                {/* macOS Controls */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 text-xs font-mono font-medium opacity-60" style={{ color: tok.textMuted }}>
                    {currentSnippet.filename}
                  </span>
                </div>

                {/* Badge */}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {currentSnippet.badge}
                </span>
              </div>

              {/* Interactive Tabs */}
              <div
                className="flex items-center gap-1 p-2 border-b overflow-x-auto scrollbar-none"
                style={{
                  backgroundColor: dark ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)",
                  borderColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                }}
              >
                {Object.entries(TRACK_SNIPPETS).map(([key, item]) => {
                  const TabIcon = item.icon;
                  const isActive = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${isActive
                        ? "bg-emerald-500 text-white shadow-sm font-semibold"
                        : "opacity-70 hover:opacity-100"
                        }`}
                      style={!isActive ? { color: tok.textSecondary } : {}}
                    >
                      <TabIcon size={13} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Code Snippet Display */}
              <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto min-h-[220px]">
                <pre style={{ color: dark ? "#e2e8f0" : "#1e293b" }}>
                  <code>{currentSnippet.code}</code>
                </pre>
              </div>

              {/* Bottom Card Action Footer */}
              <div
                className="px-5 py-3 border-t flex items-center justify-between text-xs"
                style={{
                  backgroundColor: dark ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.02)",
                  borderColor: dark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                  color: tok.textMuted,
                }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Interactive Coding Environment
                </span>
                <Link
                  href="/courses"
                  className="font-bold text-emerald-500 hover:underline flex items-center gap-1"
                >
                  Start Track <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Stats / Social Proof Bar */}
        <div
          className="mt-16 sm:mt-20 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          style={{
            borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black" style={{ color: tok.textPrimary }}>50+</div>
              <div className="text-xs font-medium" style={{ color: tok.textMuted }}>Curated Tech Tracks</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black" style={{ color: tok.textPrimary }}>10,000+</div>
              <div className="text-xs font-medium" style={{ color: tok.textMuted }}>Active Engineers</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black" style={{ color: tok.textPrimary }}>98%</div>
              <div className="text-xs font-medium" style={{ color: tok.textMuted }}>Course Completion</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <Star size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black" style={{ color: tok.textPrimary }}>4.9 / 5.0</div>
              <div className="text-xs font-medium" style={{ color: tok.textMuted }}>Learner Rating</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
