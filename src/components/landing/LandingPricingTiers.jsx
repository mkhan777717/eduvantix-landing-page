"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Minus, ArrowRight, Sparkles, ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";
import { getApiBase } from "@/utils/api";

const PLANS = [
  {
    id: "free",
    name: "EDUVANTIX FREE",
    positioning: "Start Learning",
    description: "Essential tools to explore courses, practice fundamentals, and discover your path.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceNote: "Free forever",
    popular: false,
    ctaText: "Start Free",
    ctaHref: "/login",
    benefits: [
      "Access to selected learning content",
      "Basic learning paths",
      "Basic coding practice",
      "Selected quizzes",
      "Basic assessments",
      "Explore projects",
      "Basic progress tracking",
      "Career exploration",
    ],
  },
  {
    id: "premium",
    name: "EDUVANTIX PREMIUM",
    positioning: "Build Skills",
    description: "Comprehensive hands-on training, real projects, and in-depth skill mastery.",
    monthlyPrice: 799,
    yearlyPrice: 599,
    priceNote: "billed annually or ₹799/mo",
    popular: true,
    badge: "Most Popular",
    ctaText: "Start Premium",
    ctaHref: "/login?plan=premium",
    benefits: [
      "Everything in Free, plus:",
      "Full learning content",
      "Structured learning paths",
      "Advanced coding practice",
      "Coding challenges",
      "Real-world projects",
      "Advanced assessments",
      "Project-based learning",
      "Skill tracking",
      "Progress analytics",
      "Interview preparation",
      "Advanced learning assistance",
    ],
  },
  {
    id: "pro",
    name: "EDUVANTIX PRO",
    positioning: "Build Your Career With AI",
    description: "An autonomous AI career copilot that bridges every skill gap and guides you directly to hiring.",
    monthlyPrice: 1999,
    yearlyPrice: 1499,
    priceNote: "billed annually or ₹1,999/mo",
    popular: false,
    badge: "AI Career System",
    ctaText: "Build My Career Path",
    ctaHref: "/login?plan=pro",
    benefits: [
      "Everything in Premium, plus:",
      "AI Resume Analyzer",
      "Skill Profile & AI Skill Gap Analysis",
      "Career Role Recommendations",
      "Career Readiness Score",
      "Personalized AI Roadmap",
      "Adaptive Learning Path & Daily Plan",
      "AI Career Coach & Interview Simulator",
      "Resume-Based Interview Practice",
      "Job Matching & Description Analyzer",
      "Job-Specific Resume Optimization",
      "AI Cover Letter Generator",
      "Project Recommendations",
      "GitHub & LinkedIn Profile Analyzer",
      "AI Viva / Technical Preparation",
      "Career Goal Simulator & Path Comparison",
      "Application Tracker & Weekly AI Report",
      "Dynamic Career Readiness Tracking",
      "Market & Salary Insights",
    ],
  },
];

const COMPARISON_CATEGORIES = [
  {
    category: "Learning",
    features: [
      { name: "Course Curriculum Access", free: "Selected", premium: "Full", pro: "Full + AI Adaptive" },
      { name: "Structured Learning Paths", free: "Basic", premium: "Included", pro: "Included" },
      { name: "Interactive Lessons & Notes", free: "Included", premium: "Included", pro: "Included" },
      { name: "AI Learning Copilot", free: "—", premium: "Basic", pro: "Unlimited 24/7" },
    ],
  },
  {
    category: "Practice",
    features: [
      { name: "In-Browser Cloud IDE", free: "Basic", premium: "Advanced", pro: "Advanced + AI Debug" },
      { name: "Daily Coding Challenges", free: "Limited", premium: "Unlimited", pro: "Unlimited" },
      { name: "Algorithmic Problem Sets", free: "Selected", premium: "Complete Library", pro: "Complete Library" },
      { name: "AI Code Reviews & Diffs", free: "—", premium: "Included", pro: "Real-time AI Feedback" },
    ],
  },
  {
    category: "Projects",
    features: [
      { name: "Curated Project Briefs", free: "Explore Only", premium: "Included", pro: "Included" },
      { name: "Production-Grade Projects", free: "—", premium: "Included", pro: "Included" },
      { name: "Automated Portfolio Generator", free: "—", premium: "Basic", pro: "Live Hosted Portfolio" },
      { name: "AI Project Recommendations", free: "—", premium: "—", pro: "Tailored to Target Role" },
    ],
  },
  {
    category: "Assessments",
    features: [
      { name: "Chapter Quizzes", free: "Selected", premium: "All", pro: "All" },
      { name: "Timed Technical Assessments", free: "Basic", premium: "Advanced", pro: "Adaptive Proctored" },
      { name: "AI Viva Voice Exams", free: "—", premium: "Limited", pro: "Unlimited AI Viva" },
      { name: "Skill Diagnostic Badges", free: "—", premium: "Included", pro: "Verified Credentials" },
    ],
  },
  {
    category: "Career Intelligence",
    features: [
      { name: "AI Resume Parser & Scoring", free: "—", premium: "Basic", pro: "Full ATS Optimization" },
      { name: "Skill Gap Identification", free: "—", premium: "—", pro: "Deep AI Gap Analysis" },
      { name: "Dynamic Career Readiness Score", free: "—", premium: "Basic", pro: "Real-Time Tracking" },
      { name: "Target Role Recommendations", free: "—", premium: "—", pro: "AI Multi-Role Match" },
      { name: "Market & Salary Insights", free: "—", premium: "—", pro: "Real-Time Industry Data" },
    ],
  },
  {
    category: "Personalization",
    features: [
      { name: "Adaptive Daily Schedule", free: "—", premium: "—", pro: "AI Daily Plan" },
      { name: "Custom Milestone Roadmap", free: "—", premium: "Static", pro: "Dynamically Adjusting" },
      { name: "Weekly AI Progress Report", free: "—", premium: "Standard", pro: "Executive Summary" },
    ],
  },
  {
    category: "Interview Preparation",
    features: [
      { name: "Interview Question Bank", free: "Selected", premium: "Full", pro: "Full" },
      { name: "AI Mock Technical Interviews", free: "—", premium: "Limited", pro: "Unlimited AI Simulator" },
      { name: "Resume-Based Question Generation", free: "—", premium: "—", pro: "Custom to Your Resume" },
      { name: "Detailed Speech & Code Feedback", free: "—", premium: "—", pro: "Instant Transcripts & Tips" },
    ],
  },
  {
    category: "Jobs",
    features: [
      { name: "Job Board Exploration", free: "Included", premium: "Included", pro: "Included" },
      { name: "Direct Employer Matching", free: "—", premium: "Standard", pro: "Priority Referral Queue" },
      { name: "Job Description Matcher", free: "—", premium: "—", pro: "Match % & Keyword Analyzer" },
      { name: "AI Cover Letter Generator", free: "—", premium: "—", pro: "Role-Specific Generation" },
      { name: "Job Application Tracker", free: "—", premium: "—", pro: "Kanban Board Tracker" },
    ],
  },
  {
    category: "Portfolio",
    features: [
      { name: "GitHub Profile Analyzer", free: "—", premium: "—", pro: "Repository Quality Scoring" },
      { name: "LinkedIn Profile Optimization", free: "—", premium: "—", pro: "Headline & Skills Audit" },
      { name: "Verified Project Showcase", free: "—", premium: "Included", pro: "Custom Domain Support" },
    ],
  },
  {
    category: "Analytics",
    features: [
      { name: "Personal Learning Velocity", free: "Basic", premium: "Advanced", pro: "Predictive Velocity" },
      { name: "Batch & Cohort Benchmarking", free: "—", premium: "Included", pro: "National Ranking" },
      { name: "Skill Mastery Matrix", free: "Basic", premium: "Detailed", pro: "Multi-Dimensional Radar" },
    ],
  },
];

export default function LandingPricingTiers() {
  const isDark = useThemeStore((s) => s.isDark);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showComparison, setShowComparison] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [proModalOpen, setProModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", description: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const openProModal = () => {
    setFormData({ name: "", email: "", phone: "", description: "" });
    setFormStatus("idle");
    setProModalOpen(true);
  };

  const handleProSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/auth/request-pro-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setFormStatus(res.ok && data.success ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  };

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F9F9F9";

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const renderBadgeValue = (val) => {
    if (val === "Included" || val === "All" || val === "Full") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
          <Check size={14} className="shrink-0" strokeWidth={2.5} />
          {val}
        </span>
      );
    }
    if (val === "—") {
      return (
        <span className="inline-flex items-center text-xs" style={{ color: secondary }}>
          <Minus size={14} className="opacity-40" />
        </span>
      );
    }
    return (
      <span className="text-xs font-medium" style={{ color: text }}>
        {val}
      </span>
    );
  };

  return (
    <section id="pricing" className="px-6 sm:px-10 py-28 relative" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#10b981" }}
            >
              Plans & Investment
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            style={{
              color: text,
              fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              marginTop: "1rem",
            }}
          >
            Choose how you want to grow.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            style={{
              color: secondary,
              fontSize: "1.15rem",
              lineHeight: 1.65,
              maxWidth: "38rem",
              margin: "1.25rem auto 0",
            }}
          >
            Start free. Go deeper with Premium. Let Eduvantix Pro personalize your entire career journey.
          </motion.p>

          {/* Plan Switching Control */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="inline-flex items-center p-1.5 rounded-xl border mt-8 transition-colors"
            style={{
              backgroundColor: cardBg,
              borderColor: border,
            }}
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                billingCycle === "monthly" ? "shadow-sm" : "hover:opacity-75"
              }`}
              style={{
                backgroundColor: billingCycle === "monthly" ? (isDark ? "#1C1C1C" : "#FFFFFF") : "transparent",
                color: billingCycle === "monthly" ? text : secondary,
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                billingCycle === "yearly" ? "shadow-sm" : "hover:opacity-75"
              }`}
              style={{
                backgroundColor: billingCycle === "yearly" ? (isDark ? "#1C1C1C" : "#FFFFFF") : "transparent",
                color: billingCycle === "yearly" ? text : secondary,
              }}
            >
              Yearly
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981" }}
              >
                Save 25%
              </span>
            </button>
          </motion.div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-12">
          {PLANS.map((plan, idx) => {
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isPro = plan.id === "pro";
            const isPremium = plan.id === "premium";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`relative rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 border ${
                  isPremium
                    ? "ring-1 ring-emerald-500/40"
                    : isPro
                    ? "ring-1 ring-blue-500/30"
                    : ""
                }`}
                style={{
                  backgroundColor: cardBg,
                  borderColor: isPremium ? "rgba(16,185,129,0.4)" : isPro ? "rgba(59,130,246,0.3)" : border,
                }}
              >
                {/* Subtle Header Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-8">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                      style={{
                        backgroundColor: isPremium ? "#059669" : "#2563eb",
                        color: "#FFFFFF",
                      }}
                    >
                      {isPro && <Sparkles size={11} className="shrink-0" />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Identifier & Positioning */}
                  <div className="mb-4">
                    <span
                      className="text-xs font-bold uppercase tracking-wider block"
                      style={{
                        color: isPro ? "#3b82f6" : isPremium ? "#10b981" : secondary,
                      }}
                    >
                      {plan.positioning}
                    </span>
                    <h3
                      className="mt-1"
                      style={{
                        color: text,
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        letterSpacing: "-0.025em",
                        fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                      }}
                    >
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-xs leading-relaxed mb-6" style={{ color: secondary }}>
                    {plan.description}
                  </p>

                  {/* Price Block */}
                  <div className="pb-6 mb-6 border-b" style={{ borderColor: border }}>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        style={{
                          color: text,
                          fontSize: "2.5rem",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                          fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                        }}
                      >
                        {price === 0 ? "₹0" : `₹${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs font-medium" style={{ color: secondary }}>
                          / month
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: secondary }}>
                      {price === 0 ? "Free forever • No credit card required" : plan.priceNote}
                    </div>
                  </div>

                  {/* Benefit Items */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: text }}>
                      {isPro ? "Full AI Career Suite:" : isPremium ? "Includes everything in Free, plus:" : "Included features:"}
                    </div>
                    <ul className="space-y-2.5">
                      {plan.benefits.map((b, i) => {
                        const isHeading = b.startsWith("Everything in");
                        if (isHeading) return null;

                        return (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: secondary }}>
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                backgroundColor: isPro
                                  ? "rgba(59,130,246,0.12)"
                                  : isPremium
                                  ? "rgba(16,185,129,0.12)"
                                  : "rgba(148,163,184,0.12)",
                                color: isPro ? "#3b82f6" : isPremium ? "#10b981" : secondary,
                              }}
                            >
                              <Check size={10} strokeWidth={3} />
                            </div>
                            <span className="leading-snug">{b}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  {isPremium || isPro ? (
                    <button
                      onClick={openProModal}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      style={{
                        backgroundColor: isPremium
                          ? "#059669"
                          : isDark ? "#FFFFFF" : "#111111",
                        color: isPremium
                          ? "#FFFFFF"
                          : isDark ? "#000000" : "#FFFFFF",
                      }}
                    >
                      {plan.ctaText}
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <Link
                      href={plan.ctaHref}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                      style={{
                        backgroundColor: "transparent",
                        color: text,
                        border: `1.5px solid ${border}`,
                      }}
                    >
                      {plan.ctaText}
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Accordion Button */}
        <div className="text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: cardBg,
              color: text,
              border: `1px solid ${border}`,
            }}
          >
            <span>{showComparison ? "Hide Detailed Comparison" : "Compare Features Across All Plans"}</span>
            {showComparison ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Comparison Section */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden mt-10"
            >
              <div
                className="rounded-2xl border overflow-hidden shadow-sm"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                {/* Comparison Header */}
                <div
                  className="grid grid-cols-12 p-4 sm:p-5 text-xs font-bold uppercase tracking-wider border-b sticky top-0 backdrop-blur-md"
                  style={{ borderColor: border, color: secondary }}
                >
                  <div className="col-span-5 sm:col-span-4">Capability Area</div>
                  <div className="col-span-2 sm:col-span-2 text-center">Free</div>
                  <div className="col-span-2 sm:col-span-3 text-center font-bold" style={{ color: "#10b981" }}>
                    Premium
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center font-bold" style={{ color: "#3b82f6" }}>
                    Pro
                  </div>
                </div>

                {/* Categorized Comparison Rows */}
                <div className="divide-y" style={{ borderColor: border }}>
                  {COMPARISON_CATEGORIES.map((catGroup) => {
                    const isExpanded = expandedCategories[catGroup.category] !== false;

                    return (
                      <div key={catGroup.category} className="transition-colors">
                        {/* Category Header Bar */}
                        <button
                          onClick={() => toggleCategory(catGroup.category)}
                          className="w-full px-4 sm:px-5 py-3 flex items-center justify-between text-left transition-colors hover:opacity-85"
                          style={{
                            backgroundColor: isDark ? "#111111" : "#F4F4F4",
                            borderBottom: isExpanded ? `1px solid ${border}` : "none",
                          }}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: text }}>
                            {catGroup.category}
                          </span>
                          <span className="text-xs" style={{ color: secondary }}>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </span>
                        </button>

                        {/* Category Rows */}
                        {isExpanded && (
                          <div className="divide-y" style={{ borderColor: border }}>
                            {catGroup.features.map((feat) => (
                              <div
                                key={feat.name}
                                className="grid grid-cols-12 p-3.5 sm:p-4 text-xs sm:text-sm items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              >
                                <div className="col-span-5 sm:col-span-4 font-medium pr-2" style={{ color: text }}>
                                  {feat.name}
                                </div>
                                <div className="col-span-2 sm:col-span-2 text-center">
                                  {renderBadgeValue(feat.free)}
                                </div>
                                <div className="col-span-2 sm:col-span-3 text-center">
                                  {renderBadgeValue(feat.premium)}
                                </div>
                                <div className="col-span-3 sm:col-span-3 text-center">
                                  {renderBadgeValue(feat.pro)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BE THE FIRST TO USE IT — Early Access Modal */}
      <AnimatePresence>
        {proModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-[520px] rounded-2xl p-8 border shadow-2xl z-10 flex flex-col"
              style={{
                backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
                borderColor: "rgba(16,185,129,0.4)",
                color: isDark ? "#FFFFFF" : "#111111",
              }}
            >
              {/* Close */}
              <button
                onClick={() => setProModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors hover:opacity-70"
                style={{ color: isDark ? "#888" : "#666" }}
              >
                <X size={18} />
              </button>

              {formStatus === "success" ? (
                <div className="text-center py-10 space-y-5">
                  <div
                    className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
                  >
                    <Check size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">You&apos;re on the list!</h3>
                    <p className="text-sm mt-2" style={{ color: isDark ? "#888" : "#666" }}>
                      We&apos;ll notify you the moment Pro features go live.
                    </p>
                  </div>
                  <button
                    onClick={() => setProModalOpen(false)}
                    className="px-8 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: "#059669" }}
                  >
                    Got it, thanks!
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-500">
                        Pro Features Coming Soon
                      </span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight leading-tight">
                      BE THE FIRST TO{" "}
                      <span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        USE IT.
                      </span>
                    </h3>
                  </div>

                  <form onSubmit={handleProSubmit} className="space-y-4">
                    {[{ label: "Name", key: "name", type: "text", placeholder: "Your full name" },
                      { label: "Email ID", key: "email", type: "email", placeholder: "you@domain.com" },
                      { label: "Mobile (with country code)", key: "phone", type: "tel", placeholder: "+91 99999 99999" }]
                      .map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? "#666" : "#888" }}>
                            {label}
                          </label>
                          <input
                            type={type}
                            required
                            value={formData[key]}
                            onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                            style={{
                              backgroundColor: isDark ? "#111" : "#F4F4F5",
                              border: `1px solid ${isDark ? "#1C1C1C" : "#E4E4E7"}`,
                              color: isDark ? "#FFFFFF" : "#111111",
                            }}
                          />
                        </div>
                      ))}

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? "#666" : "#888" }}>
                        What do you want to access?
                      </label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="E.g., AI career suite, live interviews..."
                        className="w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all resize-none"
                        style={{
                          backgroundColor: isDark ? "#111" : "#F4F4F5",
                          border: `1px solid ${isDark ? "#1C1C1C" : "#E4E4E7"}`,
                          color: isDark ? "#FFFFFF" : "#111111",
                        }}
                      />
                    </div>

                    {formStatus === "error" && (
                      <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
                    )}

                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: "#059669" }}
                    >
                      {formStatus === "submitting" && <Loader2 size={15} className="animate-spin" />}
                      {formStatus === "submitting" ? "Submitting..." : "Request Early Access"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
