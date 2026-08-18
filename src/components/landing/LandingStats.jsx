"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Building2, Briefcase, TrendingUp } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const STATS = [
  {
    icon: Users,
    end: 10000,
    suffix: "+",
    label: "Active Engineers",
    sublabel: "and growing every week",
    color: "#10b981",
    prefix: "",
  },
  {
    icon: Building2,
    end: 500,
    suffix: "+",
    label: "Partner Institutes",
    sublabel: "across India",
    color: "#059669",
    prefix: "",
  },
  {
    icon: Briefcase,
    end: 100,
    suffix: "+",
    label: "Hiring Companies",
    sublabel: "actively recruiting",
    color: "#34d399",
    prefix: "",
  },
  {
    icon: TrendingUp,
    end: null,
    suffix: "",
    label: "Learning & Code Events",
    sublabel: "executed on the platform",
    color: "#047857",
    prefix: "Millions",
  },
];

function Counter({ end, prefix, suffix, color, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || end === null) return;
    const duration = 1800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [inView, end]);

  const display = end === null ? "Millions" : prefix ? prefix : count.toLocaleString() + suffix;

  return (
    <span
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight tabular-nums"
      style={{ color }}
    >
      {display}
    </span>
  );
}

function StatCard({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [hovered, setHovered] = useState(false);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center text-center p-8 rounded-3xl border transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: hovered ? stat.color : "var(--border-primary)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 50px ${stat.color}18` : "0 1px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Animated radial glow on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${stat.color}10, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
        style={{
          backgroundColor: hovered ? `${stat.color}20` : `${stat.color}12`,
          border: `1px solid ${stat.color}${hovered ? "40" : "25"}`,
        }}
      >
        <Icon
          size={24}
          style={{ color: stat.color }}
          className="transition-transform duration-300"
          style={{ color: stat.color, transform: hovered ? "scale(1.15)" : "scale(1)" }}
        />
      </div>

      {/* Animated number */}
      <Counter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} color={stat.color} inView={inView} />

      {/* Label */}
      <div className="mt-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
        {stat.label}
      </div>
      <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
        {stat.sublabel}
      </div>
    </motion.div>
  );
}

export default function LandingStats() {
  const isDark = useThemeStore((state) => state.isDark);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section
      className="relative w-full py-32 px-6 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.2)",
              color: "var(--text-accent)",
            }}
          >
            Platform Scale
          </div>
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Engineered for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              proven scale.
            </span>
          </h2>
          <p className="mt-3 text-base sm:text-lg font-normal" style={{ color: "var(--text-secondary)" }}>
            Empowering students, educational institutions, and corporate recruiters nationwide.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
