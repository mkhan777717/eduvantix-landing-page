"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Frontend Engineer @ Razorpay",
    avatar: "AM",
    color: "#10b981",
    type: "Engineer",
    rating: 5,
    quote: "Eduvantix provided me with a clear, structured career trajectory. The continuous skill evaluations highlighted gaps I hadn't noticed, allowing me to build a job-ready portfolio.",
  },
  {
    name: "Priya Nair",
    role: "Full Stack Developer @ Swiggy",
    avatar: "PN",
    color: "#059669",
    type: "Engineer",
    rating: 5,
    quote: "The structured mock interview assessments were invaluable. By the time I sat down for real technical interviews, I felt thoroughly prepared and confident.",
  },
  {
    name: "Ravi Kumar",
    role: "Director of Academics, TechSkillz Institute",
    avatar: "RK",
    color: "#34d399",
    type: "Institute",
    rating: 5,
    quote: "We consolidated our academic management onto Eduvantix. Attendance, coding assessments, live sessions, and placement tracking now run seamlessly in one system.",
  },
  {
    name: "Sneha Joshi",
    role: "Data Scientist @ Flipkart",
    avatar: "SJ",
    color: "#047857",
    type: "Engineer",
    rating: 5,
    quote: "Eduvantix helped me transition roles efficiently. The project briefs match real production standards, making my resume stand out to technical recruiters.",
  },
  {
    name: "Dr. Anand Pillai",
    role: "CEO, CodeCraft Academy",
    avatar: "AP",
    color: "#10b981",
    type: "Institute",
    rating: 5,
    quote: "Managing over 1,400 students across multiple cohorts used to be complex. Eduvantix simplified batch management, reporting, and industry tie-ups completely.",
  },
  {
    name: "Deepika Sharma",
    role: "HR Lead, TechCorp India",
    avatar: "DS",
    color: "#059669",
    type: "Recruiter",
    rating: 5,
    quote: "Recruiting through Eduvantix saves significant screening time. Candidates arrive with pre-verified skill scores and verified project portfolios.",
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function TestimonialCard({ t }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="shrink-0 w-[340px] sm:w-[380px] p-6 rounded-3xl border flex flex-col gap-4 cursor-default select-none transition-all duration-300 relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: hovered ? t.color : "var(--border-primary)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 16px 40px ${t.color}15` : "0 1px 5px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top left, ${t.color}08, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Quote mark */}
      <div className="absolute top-5 right-5 opacity-10">
        <Quote size={36} style={{ color: t.color }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors duration-200"
          style={{
            backgroundColor: hovered ? `${t.color}15` : `${t.color}10`,
            color: t.color,
            borderColor: `${t.color}25`,
          }}
        >
          {t.type}
        </span>
        <StarRating count={t.rating} />
      </div>

      {/* Quote */}
      <p className="text-xs sm:text-sm leading-relaxed flex-1 font-normal relative" style={{ color: "var(--text-secondary)" }}>
        "{t.quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 transition-all duration-200"
          style={{
            backgroundColor: hovered ? `${t.color}25` : `${t.color}15`,
            color: t.color,
          }}
        >
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {t.name}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingTestimonials() {
  const isDark = useThemeStore((state) => state.isDark);
  const marqueeRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    let last = null;
    const speed = 0.45;

    const step = (ts) => {
      if (!last) last = ts;
      const dt = ts - last;
      last = ts;
      if (!paused) {
        posRef.current += speed * (dt / 16.67);
        const halfWidth = el.scrollWidth / 2;
        if (posRef.current >= halfWidth) posRef.current = 0;
        el.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused]);

  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      className="relative w-full py-32 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {/* Ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 65%)"
            : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.03) 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-14 px-6 relative z-10"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
          style={{
            backgroundColor: "rgba(16,185,129,0.08)",
            borderColor: "rgba(16,185,129,0.2)",
            color: "var(--text-accent)",
          }}
        >
          Community Endorsements
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Trusted by engineers &{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            academic leaders.
          </span>
        </h2>
        <p className="mt-3 text-base sm:text-lg" style={{ color: "var(--text-secondary)" }}>
          Real stories from learners, institutes, and hiring partners across India.
        </p>
      </motion.div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade masks */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
          style={{
            background: isDark
              ? `linear-gradient(to right, var(--bg-secondary), transparent)`
              : `linear-gradient(to right, var(--bg-secondary), transparent)`,
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none"
          style={{
            background: isDark
              ? `linear-gradient(to left, var(--bg-secondary), transparent)`
              : `linear-gradient(to left, var(--bg-secondary), transparent)`,
          }}
        />

        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={marqueeRef}
            className="flex gap-5 py-4 px-6 will-change-transform"
            style={{ width: "max-content" }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Pause indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs mt-6 px-6 relative z-10"
        style={{ color: "var(--text-muted)" }}
      >
        Hover to pause · Scroll for more stories
      </motion.p>
    </section>
  );
}
