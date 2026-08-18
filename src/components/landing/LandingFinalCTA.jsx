"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Users, Building2 } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";
import { useRef } from "react";

const TRUST_ITEMS = [
  { icon: Users, label: "10,000+ Active Learners" },
  { icon: Building2, label: "500+ Partner Institutes" },
  { icon: Sparkles, label: "Free to start · No credit card" },
];

export default function LandingFinalCTA() {
  const isDark = useThemeStore((state) => state.isDark);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-40 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Dramatic radial gradient background that parallaxes */}
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 65%)"
              : "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16,185,129,0.07) 0%, transparent 65%)",
          }}
        />
        {/* Dot matrix pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </motion.div>

      {/* Top accent line — emerald green */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.5) 50%, transparent 100%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold"
          style={{
            backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)",
            borderColor: "rgba(16,185,129,0.25)",
            color: "var(--text-accent)",
          }}
        >
          <Sparkles size={13} className="text-emerald-500" />
          Begin Your Career Journey Today
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </motion.div>

        {/* Large typography — cinematic stagger */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-0.5"
        >
          <h2
            className="text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95]"
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          >
            Don't Just Learn.
          </h2>
          <h2 className="text-5xl sm:text-7xl lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 bg-clip-text text-transparent">
            Build Your Career.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="text-base sm:text-xl max-w-2xl leading-relaxed font-normal"
          style={{ color: "var(--text-secondary)" }}
        >
          Join the unified career operating system that bridges learning, verified production projects, and direct employer matching.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: isDark
                ? "0 10px 40px rgba(16,185,129,0.4)"
                : "0 10px 30px rgba(16,185,129,0.3)",
            }}
          >
            {/* Shimmer effect */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
            />
            <span className="relative">Get Started Free</span>
            <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="mailto:hello@eduvantix.com?subject=Eduvantix%20Demo%20Request"
            className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base font-semibold border transition-all duration-200 hover:-translate-y-1 w-full sm:w-auto"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <Calendar size={18} className="text-emerald-500" />
            <span>Book Institutional Demo</span>
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                <Icon size={13} className="text-emerald-500 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
