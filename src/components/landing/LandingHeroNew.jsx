"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, Building2, Users, Briefcase, ArrowDown } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const STATS = [
  { value: "500K+", label: "Learners", icon: GraduationCap, color: "bg-emerald-500/10 text-emerald-600" },
  { value: "1,000+", label: "Institutes", icon: Building2, color: "bg-teal-500/10 text-teal-600" },
  { value: "10K+", label: "Mentors", icon: Users, color: "bg-green-500/10 text-green-600" },
  { value: "1,000+", label: "Hiring Partners", icon: Briefcase, color: "bg-emerald-500/10 text-emerald-600" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
});

export default function LandingHeroNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0D0D0D" : "#FFFFFF";

  return (
    <section
      className="relative pt-32 sm:pt-36 pb-16 px-6 sm:px-10 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            
            {/* Eyebrow Badge */}
            <motion.div {...fadeUp(0)}>
              <span className="inline-block text-xs font-bold tracking-[0.18em] uppercase text-[#059669]">
                AI CAREER PLATFORM
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.06)}
              className="text-5xl sm:text-6xl lg:text-[4.25rem] font-black tracking-[-0.035em] leading-[1.04] mt-4"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
            >
              From Learning<br />to Getting Hired<span className="text-[#059669]">.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              {...fadeUp(0.12)}
              className="text-base sm:text-lg leading-relaxed max-w-xl mt-6"
              style={{ color: secondary }}
            >
              eduvantix is an AI-powered career platform that takes you from zero to hired.
              Personalized roadmaps, real projects, AI mentorship, and direct employer connections {"—"} all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              {...fadeUp(0.18)}
              className="flex flex-wrap items-center gap-4 mt-8"
            >
              <Link
                href="https://learn.eduvantix.com"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 text-white"
                style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 10px 25px rgba(5, 150, 105, 0.25)" }}
              >
                <span>Start Learning Free</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="mailto:hello@eduvantix.com?subject=Demo+Request"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-[var(--bg-hover)]"
                style={{
                  color: text,
                  border: `1.5px solid ${border}`,
                  backgroundColor: "transparent",
                }}
              >
                Book a Demo
              </a>
            </motion.div>

            {/* Stats Cards Grid */}
            <motion.div
              {...fadeUp(0.24)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 w-full"
            >
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all hover:border-[#059669]/30"
                    style={{ backgroundColor: cardBg, borderColor: border }}
                  >
                    <div className={`p-2.5 rounded-xl ${stat.color} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-extrabold leading-none" style={{ color: text }}>
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-medium mt-1" style={{ color: secondary }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div {...fadeUp(0.3)} className="mt-8">
              <a href="#explore" className="inline-flex items-center gap-2 text-xs font-semibold hover:text-[#059669] transition-colors" style={{ color: secondary }}>
                <ArrowDown size={14} className="animate-bounce text-[#059669]" />
                <span>Scroll to explore</span>
              </a>
            </motion.div>

          </div>

          {/* Right Column: Hero Artwork Graphic */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-[650px] relative"
            >
              <img
                src="/hero-section.png"
                alt="eduvantix AI Career Platform — From Learning to Getting Hired"
                className="w-full h-auto object-contain rounded-3xl dark:hidden"
              />
              <img
                src="/dark-hero.png"
                alt="eduvantix AI Career Platform — From Learning to Getting Hired"
                className="hidden w-full h-auto object-contain rounded-3xl dark:block"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
