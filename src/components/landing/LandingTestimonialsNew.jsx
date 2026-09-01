"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useThemeStore from "@/store/useThemeStore";

const TESTIMONIALS = [
  {
    quote: "eduvantix completely replaced my resume with proof. When I interviewed at Swiggy, they asked about my verified eduvantix projects instead of standard LeetCode questions.",
    author: "Rohan Sharma",
    role: "Full Stack Engineer",
    company: "Swiggy",
    tag: "Placed in 3 Months",
    initials: "RS",
  },
  {
    quote: "Our institution onboarding time dropped from 3 weeks to 2 days. The AI diagnostic accurately surfaces skill gaps across 400+ students instantly.",
    author: "Dr. Ananya Verma",
    role: "Head of Computer Science",
    company: "IIT Delhi Partner Program",
    tag: "500+ Students Onboarded",
    initials: "AV",
  },
  {
    quote: "As a hiring manager, pre-verified candidate portfolios save us over 20 hours per engineering hire. The code quality matches production standards.",
    author: "Vikram Malhotra",
    role: "VP of Engineering",
    company: "Razorpay",
    tag: "Hiring Partner",
    initials: "VM",
  },
  {
    quote: "I went from no internship offers to three within a month. The AI mock interviews with live feedback changed how I explain technical problems completely.",
    author: "Priya Nair",
    role: "Software Engineer Intern",
    company: "Zepto",
    tag: "Offer in 28 Days",
    initials: "PN",
  },
  {
    quote: "eduvantix gave our bootcamp a full operating system. Attendance, coding labs, exams, and placement tracking — all in one dashboard.",
    author: "Rajiv Menon",
    role: "Director of Academics",
    company: "TechBridge Academy",
    tag: "300+ Students Managed",
    initials: "RM",
  },
  {
    quote: "The ATS-optimized resume generator created a resume that got me callbacks from companies that previously ghosted me for months.",
    author: "Ishaan Kapoor",
    role: "Backend Engineer",
    company: "Meesho",
    tag: "3 Offers Received",
    initials: "IK",
  },
];

function TestimonialCard({ t, isDark, text, secondary, border, cardBg }) {
  return (
    <div
      className="flex-shrink-0 w-[340px] sm:w-[380px] p-7 rounded-2xl border flex flex-col justify-between select-none"
      style={{ backgroundColor: cardBg, borderColor: border }}
    >
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 inline-block"
        >
          {t.tag}
        </span>
        <p className="text-sm leading-relaxed mb-6" style={{ color: secondary }}>
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>

      <div className="pt-4 border-t flex items-center gap-3" style={{ borderColor: border }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: text }}>{t.author}</div>
          <div className="text-xs" style={{ color: secondary }}>
            {t.role} · <span style={{ color: text }}>{t.company}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingTestimonialsNew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#0A0A0A" : "#F9F9F9";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#000000" : "#FFFFFF";

  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 0.6; // px per frame

  // Duplicate for seamless loop
  const items = [...TESTIMONIALS, ...TESTIMONIALS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const singleWidth = track.scrollWidth / 2;

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= singleWidth) {
          posRef.current -= singleWidth;
        }
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <section className="py-28 overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            Proven Results
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            style={{
              color: text,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              marginTop: "1rem",
            }}
          >
            Trusted by candidates, institutes &amp; employers.
          </motion.h2>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${bg}, transparent)` }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${bg}, transparent)` }}
        />

        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-5 will-change-transform"
            style={{ width: "max-content" }}
          >
            {items.map((t, i) => (
              <TestimonialCard
                key={i}
                t={t}
                isDark={isDark}
                text={text}
                secondary={secondary}
                border={border}
                cardBg={cardBg}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
