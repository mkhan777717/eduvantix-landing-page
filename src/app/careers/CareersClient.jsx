"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import {
  motion, useInView, useScroll, useTransform,
  useMotionValue, useSpring, useMotionTemplate, AnimatePresence
} from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TiltCard from "@/components/TitleCard";
import useThemeStore from "@/store/useThemeStore";
import useReducedMotion from "@/customHooks/useReducedMotion";
import { EASE_OUT_EXPO, SPRING_CONFIG, SPRING_SNAPPY } from "@/utils/constants.jsx";
import ParticleCursor from "@/components/ParticleCursor";
import Lenis from "lenis";
import {
  Search, MapPin, Briefcase, Clock, ChevronRight, Globe, Building2,
  Star, ArrowRight, FileText, Upload, Send, Loader2, CheckCircle2, X,
  Home, GraduationCap, Wrench, User, AlertTriangle, ChevronDown, Users, Laptop,
  HelpCircle, Check, Award, Heart, Sparkles, BookOpen, Layers, ShieldCheck, Rocket,
  DollarSign, Gift, FileCheck, Lightbulb, MessageSquare, ChevronUp, Radio, Code,
  Palette, BarChart2, Zap, Calendar, Mic
} from "lucide-react";

// ─── Lenis Smooth Scroll ──────────────────────────────────────────────
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

// ─── Mouse Position Hook ──────────────────────────────────────────────
function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const handler = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y]);
  return { x, y };
}

// ─── Cursor Follow Glow ──────────────────────────────────────────────
function CursorGlow() {
  const { x, y } = useMousePosition();
  const smoothX = useSpring(x, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 50, damping: 20 });

  return (
    <motion.div
      className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-[1] opacity-[0.05]"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.7) 0%, transparent 70%)",
      }}
    />
  );
}

// ─── Noise Texture Overlay ────────────────────────────────────────────
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2] opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

// ─── Animated Mesh Background ─────────────────────────────────────────
function MeshBackground({ className = "" }) {
  const reduced = useReducedMotion();
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          top: "-15%", right: "-10%",
          filter: "blur(80px)",
        }}
        animate={reduced ? {} : { x: [0, -40, 20, 0], y: [0, 30, -20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          bottom: "-10%", left: "-8%",
          filter: "blur(80px)",
        }}
        animate={reduced ? {} : { x: [0, 30, -25, 0], y: [0, -35, 15, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
          top: "50%", left: "50%",
          filter: "blur(60px)",
        }}
        animate={reduced ? {} : { x: [0, -60, 40, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
}

// ─── Page Reveal ──────────────────────────────────────────────────────
function PageReveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────
function SectionDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height: "1px" }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(6,182,212,0.3), transparent)" }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.5, ease: EASE_OUT_EXPO }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "var(--border-primary)" }} />
    </div>
  );
}

// ─── Careers Hero Right Graphic ───────────────────────────────────────
function CareersHeroGraphic({ onApply }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto pointer-events-none select-none">
      {/* Glow orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.1) 70%, transparent 100%)" }}
        animate={reduced ? {} : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card 1: Graphic Designer role */}
      <motion.div
        className="absolute top-[0%] right-[0%] w-[65%] bg-[#101014] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl z-20"
        animate={reduced ? {} : { y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-white tracking-wider">OPEN: GRAPHIC DESIGNER</span>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Priority</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Palette size={14} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-[9px] text-white font-bold">Figma · Photoshop · Illustrator</div>
              <div className="text-[8px] text-emerald-400">Skill-based pay · LOR eligible</div>
            </div>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: "0%" }}
              animate={{ width: "85%" }}
              transition={{ duration: 2, delay: 0.5, ease: EASE_OUT_EXPO }}
            />
          </div>
          <div className="text-[8px] text-slate-400">85% skill match · Remote / Onsite</div>
        </div>
      </motion.div>

      {/* Card 2: Applications Overview */}
      <motion.div
        className="absolute top-[35%] left-[-5%] w-[50%] bg-[#050505] border border-blue-500/30 rounded-xl p-4 shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-xl z-10"
        animate={reduced ? {} : { y: [12, -12, 12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Briefcase size={12} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-200">Active Roles</span>
          </div>
        </div>
        <div className="space-y-2 mt-1">
          {[["Graphic Designer", "w-full"], ["Digital Marketing", "w-3/4"], ["QA Testing", "w-1/2"]].map(([role, w], i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-slate-400">{role}</span>
                <span className="text-[8px] text-emerald-400 font-bold">Open</span>
              </div>
              <div className="h-1 bg-white/10 rounded w-full overflow-hidden">
                <div className={`h-full bg-emerald-500 ${w} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Card 3: Perks */}
      <motion.div
        className="absolute top-[50%] right-[-5%] w-[40%] bg-[#0A0A0A] border border-amber-500/30 rounded-xl p-3 shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-xl z-0"
        animate={reduced ? {} : { y: [-15, 15, -15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Gift size={10} className="text-amber-400" />
          </div>
          <span className="text-[8px] font-bold text-slate-200">Your Perks</span>
        </div>
        <div className="space-y-1.5">
          {["Completion Letter", "LOR", "Swag Kit"].map((perk, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 size={8} className="text-emerald-400 shrink-0" />
              <span className="text-[8px] text-slate-300">{perk}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Card 4: Skill pay score */}
      <motion.div
        className="absolute bottom-[2%] right-[5%] w-[45%] bg-[#101014] border border-purple-500/30 rounded-xl p-3 shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-xl z-20"
        animate={reduced ? {} : { y: [-8, 8, -8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
            <DollarSign size={10} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[8px] text-white font-bold">Skill-Based Pay</div>
            <div className="text-[7px] text-emerald-400 mt-0.5">Performance indexed</div>
          </div>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: "0%" }}
            animate={{ width: "92%" }}
            transition={{ duration: 2, delay: 0.5, ease: EASE_OUT_EXPO }}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────
function FloatingParticles({ count = 10 }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      dur: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.2,
    }));
  }, [count, mounted]);

  if (reduced || !mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-500"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() > 0.5 ? 30 : -30, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Scroll Progress Indicator ────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left pointer-events-none"
      style={{ scaleX, background: "linear-gradient(90deg, #10b981, #06b6d4)" }}
    />
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────
function MagneticButton({ children, className = "", style = {}, href, onClick, type, disabled }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_SNAPPY || { stiffness: 260, damping: 18 });
  const springY = useSpring(y, SPRING_SNAPPY || { stiffness: 260, damping: 18 });
  const reduced = useReducedMotion();

  const handleMouse = useCallback((e) => {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.15);
    y.set((e.clientY - cy) * 0.15);
  }, [x, y, reduced]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const Tag = href ? motion.a : motion.button;
  return (
    <Tag
      ref={ref}
      href={href}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </Tag>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────
function AnimatedCounter({ value, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const numericPart = value.toString().match(/\d+/)?.[0] || "";
  const suffix = value.toString().replace(numericPart, "");
  const isNumber = numericPart !== "";

  useEffect(() => {
    if (isInView && isNumber) {
      const target = parseInt(numericPart);
      const duration = 1500;
      const steps = 40;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, numericPart, isNumber]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
        animate={isInView ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
        className="text-3xl md:text-4xl font-black text-emerald-500 font-serif"
      >
        {isNumber ? count + suffix : value}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-[11px] font-bold uppercase tracking-wider mt-1.5 text-gray-500 dark:text-zinc-400"
      >
        {label}
      </motion.div>
    </div>
  );
}



const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+44", flag: "🇬🇧" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+65", flag: "🇸🇬" },
  { code: "+61", flag: "🇦🇺" },
  { code: "+49", flag: "🇩🇪" },
  { code: "+33", flag: "🇫🇷" },
  { code: "+81", flag: "🇯🇵" },
  { code: "+880", flag: "🇧🇩" },
  { code: "+92", flag: "🇵🇰" },
  { code: "+94", flag: "🇱🇰" },
  { code: "+977", flag: "🇳🇵" },
  { code: "other", flag: "🌐", label: "Other" },
];

const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship", PART_TIME: "Part-time" };

// Primary sub-nav tabs (Top Header)
const TOP_TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "how-we-work", label: "How we work", icon: Globe },
  { key: "how-we-hire", label: "How we hire", icon: Wrench },
  { key: "my-applications", label: "My Applications", icon: User },
];

// Sub-nav for "How we work" tab
const WORK_SUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "flexibility", label: "Flexible Working" },
  { id: "benefits", label: "Benefits & Perks" },
  { id: "diversity", label: "Inclusion & Belonging" },
];

// Sub-nav for "How we hire" tab
const HIRE_SUB_TABS = [
  { id: "process", label: "Our Process" },
  { id: "tips", label: "Interview Tips" },
  { id: "faq", label: "Hiring FAQ" },
];

function PerksSection({ reduced, stagger, fadeUp }) {
  return (
    <div>
      <motion.div
        className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
            style={{ borderColor: "var(--border-accent)", backgroundColor: "rgba(16, 185, 129, 0.08)" }}
          >
            <Gift size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-500">Perks & Rewards</span>
          </div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Why build with Eduvantix?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Official credentials, career endorsements, and exclusive perks for everyone on the team.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: <FileText size={22} className="text-emerald-500" />, title: "Completion Letter", desc: "Official Internship or Job Completion Letter verifying your tenure — showcase on LinkedIn & resumes." },
          { icon: <Award size={22} className="text-emerald-500" />, title: "Letter of Recommendation", desc: "Performance-based LOR signed directly by company founders for top-performing team members." },
          { icon: <Gift size={22} className="text-emerald-500" />, title: "Exclusive Swag & Merch", desc: "Custom Eduvantix hoodies, t-shirts, ceramic mugs, laptop stickers & full welcome tech kits." },
          { icon: <DollarSign size={22} className="text-emerald-500" />, title: "Skill-Indexed Pay", desc: "Stipend & salary evaluated strictly on practical assessment performance — grow your skills, boost earnings." },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <TiltCard
              className="p-6 rounded-2xl border group h-full cursor-default"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20"
                whileHover={{ rotate: 8, scale: 1.15 }}
                transition={{ type: "spring", ...SPRING_SNAPPY }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PriorityRolesSection({ reduced, stagger, fadeUp, jobs, setSelectedJob, openApplyModal, setActiveTab }) {
  return (
    <div>
      <motion.div
        className="text-center max-w-3xl mx-auto mb-14 space-y-4"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
            style={{ borderColor: "var(--border-accent)", backgroundColor: "rgba(16, 185, 129, 0.08)" }}
          >
            <Zap size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-500">Priority Hiring Now</span>
          </div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-4xl font-black tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          We're actively hiring for these roles...
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Apply today — stipend based on your skills, not fixed bands.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.slice(0, 6).map((job, i) => (
          <motion.div
            key={job.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <TiltCard
              className="p-6 rounded-2xl border group h-full cursor-pointer"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div onClick={() => setSelectedJob(job)} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {TYPE_LABEL[job.type]}
                    </span>
                    {job.isHot && <span className="ml-2 text-[10px] font-bold text-red-500">🔥 Priority</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>{job.title}</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{job.department} · {job.location}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border-primary)" }}>
                  <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                    <DollarSign size={11} /> Skill-Based Pay
                  </span>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Apply Now
                  </motion.button>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <MagneticButton
          onClick={() => setActiveTab("jobs")}
          className="px-8 py-4 rounded-xl font-bold border flex items-center gap-2 hover:border-emerald-500/40 transition-colors duration-500 cursor-pointer mx-auto"
          style={{ color: "var(--text-primary)", borderColor: "var(--border-primary)" }}
        >
          View All {jobs.length} Open Roles <ArrowRight size={18} />
        </MagneticButton>
      </div>
    </div>
  );
}

function HiringProcessSection({ reduced, jobs, openApplyModal, setActiveTab }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          className="space-y-6"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Join the Eduvantix Team
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            We hire based on skill, not rigid experience bands. Complete a short practical assessment and unlock your career with us.
          </p>
          <div className="space-y-4 pt-4">
            {[
              "Graphic Designer — Figma, Branding, Social Creatives",
              "Digital Marketing — SEO, Analytics, Growth",
              "Sales Executive — Outreach, BD, Client Relations",
              "QA / Software Testing — Manual & Automation"
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5, ease: EASE_OUT_EXPO }}
                className="flex items-center gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * idx, type: "spring", ...SPRING_SNAPPY }}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </motion.div>
                <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="lg:col-span-3">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
        >
          <TiltCard
            className="rounded-2xl border p-6 md:p-8 shadow-xl"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Start Your Application</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Pick any role below and apply directly. Skill-based pay, LOR, completion letter & merch await!</p>
              <div className="space-y-3">
                {jobs.slice(0, 4).map((job) => (
                  <motion.div
                    key={job.id}
                    className="flex items-center justify-between p-4 rounded-xl border cursor-pointer group transition-all"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                    whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.4)" }}
                    onClick={() => openApplyModal(job)}
                  >
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{job.title}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{job.department} · {job.location}</div>
                    </div>
                    <motion.div
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                    >
                      Apply
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <MagneticButton
                onClick={() => setActiveTab("jobs")}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow duration-500 cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                See All Open Roles <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  );
}

export default function CareersClient({ standalone = true }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const isDark = useThemeStore((state) => state.isDark);
  const reduced = useReducedMotion();

  useLenis();

  // Parallax hero scroll transforms (matching InstitutesClient exactly)
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.95]);
  const heroBlur = useTransform(heroProgress, [0, 0.8], [0, 8]);
  const smoothHeroY = useSpring(heroY, SPRING_CONFIG);
  const smoothHeroBlur = useSpring(heroBlur, SPRING_CONFIG);
  const heroFilter = useMotionTemplate`blur(${smoothHeroBlur}px)`;

  const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
  };

  // Active Navigation States
  const [activeTab, setActiveTab] = useState("home");
  const [activeWorkSubTab, setActiveWorkSubTab] = useState("overview");
  const [activeHireSubTab, setActiveHireSubTab] = useState("process");

  // Search & Filter States
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");

  // Job Listing & Applications Data
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Detail Modal
  const [showApply, setShowApply] = useState(false);     // Apply Modal
  const [showAuthModal, setShowAuthModal] = useState(false); // Auth Required Modal
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showJobDetail, setShowJobDetail] = useState(false);

  // Apply Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [customCountryCode, setCustomCountryCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch Jobs from backend API
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(`${API_BASE}/api/careers/jobs`);
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.warn("Failed fetching backend jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch My Applications from backend API
  const fetchMyApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/careers/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.applications) {
        setMyApplications(data.applications.map(app => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: app.job?.title || "Role",
          department: app.job?.department || "Department",
          location: app.job?.location || "Remote",
          type: app.job?.type || "FULL_TIME",
          applicantName: app.fullName,
          email: app.email,
          mobile: app.mobile,
          resumeFileName: app.resumeFileName,
          appliedAt: new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: app.status,
        })));
      }
    } catch (err) {
      console.warn("Failed fetching my applications:", err);
    }
  };

  // Scroll to top whenever activeTab changes (e.g. clicking on Jobs opens from top)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchMyApplications();
    }
  }, [user, token]);

  const departments = ["ALL", ...Array.from(new Set(jobs.map((j) => j.department)))];

  // Filtering Logic for Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchRole = !searchRole || job.title.toLowerCase().includes(searchRole.toLowerCase()) || job.skills.some(s => s.toLowerCase().includes(searchRole.toLowerCase()));
    const matchLocation = !searchLocation || job.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchType = filterType === "ALL" || job.type === filterType;
    const matchDept = filterDept === "ALL" || job.department === filterDept;
    return matchRole && matchLocation && matchType && matchDept;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab("jobs");
  };

  const openApplyModal = (job) => {
    if (!user || !token) {
      setPendingApplyJob(job);
      setShowAuthModal(true);
      return;
    }
    setApplyJob(job);
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setMobile("");
    setCoverNote("");
    setResumeFile(null);
    setFormError("");
    setShowApply(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setFormError("Please upload your resume (PDF or DOCX).");
      return;
    }
    if (!mobile || mobile.length < 5) {
      setFormError("Please enter a valid mobile number.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const finalCode = countryCode === "other" ? (customCountryCode.trim() || "+") : countryCode;
      const formData = new FormData();
      formData.append("jobId", applyJob.id);
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("mobile", `${finalCode} ${mobile}`);
      if (coverNote) formData.append("coverNote", coverNote);
      formData.append("resume", resumeFile);

      const res = await fetch(`${API_BASE}/api/careers/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit application.");
      }

      await fetchMyApplications();

      setShowApply(false);
      setApplyJob(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    } catch (err) {
      setFormError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 flex flex-col">
      {standalone && (
        <div className="relative z-50 [&_header]:!relative [&_header]:!top-0 [&_header]:!my-0 [&_header]:!w-full [&_header]:!max-w-full [&_header]:!rounded-none [&_header]:!border-x-0 [&_header]:!border-t-0">
          <Navbar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* ── Success Toast ── */}
        {showSuccessToast && (
          <div className="fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-full border border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Application Submitted!</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">Our team will review your profile and reach out soon.</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            GOOGLE CAREERS STYLE LEFT VERTICAL SIDEBAR + MAIN CONTENT
        ═════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex min-h-0">
          {/* Left Vertical Navigation Bar (Google Careers style) */}
          <aside data-lenis-prevent className="w-20 sm:w-24 shrink-0 border-r border-gray-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col items-center py-6 gap-6 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar z-20">
            {TOP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex flex-col items-center gap-1 w-full px-2 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs scale-105"
                        : "text-gray-500 dark:text-zinc-400 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800/80"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-zinc-400"} />
                  </div>
                  <span
                    className={`text-[11px] text-center leading-tight transition-all max-w-[75px] ${
                      isActive
                        ? "font-bold text-emerald-700 dark:text-emerald-400"
                        : "font-medium text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {tab.key === "my-applications" && myApplications.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white -mt-0.5">
                      {myApplications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0">

          {/* ── TAB 1: HOME ── */}
          {activeTab === "home" && (
            <PageReveal>
              <div className="relative flex flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
                <ParticleCursor />
                <NoiseOverlay />

                {/* ─── HERO SECTION (Google Careers exact 1-to-1 design) ─── */}
                <section ref={heroRef} className="relative w-full overflow-hidden min-h-[calc(100vh-64px)] flex items-center shadow-xl border-b border-gray-100 dark:border-zinc-800/60 mx-0">
                  {/* Background image — Crisp Google Office Style Photo */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="/bg-image.png"
                      alt="Eduvantix Office"
                      className="w-full h-full object-cover object-center lg:object-bottom transition-transform duration-700"
                    />
                    {/* Subtle left vignette gradient so search card stands out cleanly */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/30" />
                  </div>

                  {/* Content Container (Pushed to the left edge) */}
                  <div className="relative z-10 p-6 md:p-12 w-full max-w-7xl mx-auto flex justify-start py-10">
                    {/* Google Careers Style White Search Box with Emerald Theme */}
                    <motion.div
                      initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                      className="w-full max-w-[440px] bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 p-7 md:p-8 rounded-[28px] shadow-2xl space-y-6 border border-gray-100 dark:border-zinc-800"
                    >
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-snug font-sans text-gray-900 dark:text-white">
                        Search for your career at{" "}
                        <span className="inline-block whitespace-nowrap">
                          <img
                            src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                            alt="Eduvantix"
                            className="h-7 md:h-8 w-auto object-contain inline-block align-middle -mt-1 mx-1"
                          />
                        </span>
                      </h1>

                      <form onSubmit={handleSearchSubmit} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 block">
                            Role
                          </label>
                          <input
                            type="text"
                            value={searchRole}
                            onChange={(e) => setSearchRole(e.target.value)}
                            placeholder="Software engineer, Graphic designer..."
                            className="w-full px-5 py-3 rounded-full border border-emerald-500/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white dark:bg-zinc-800/80 placeholder:text-gray-400 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 block">
                            Where?
                          </label>
                          <div className="relative">
                            <select
                              value={searchLocation}
                              onChange={(e) => setSearchLocation(e.target.value)}
                              className="w-full px-5 py-3 rounded-full border border-emerald-500/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white dark:bg-zinc-800/80 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Any location / Work mode</option>
                              <option value="Remote">Remote</option>
                              <option value="Onsite">Onsite / Bangalore HQ</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Priority Role Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">Trending:</span>
                          {["Graphic Designer", "Digital Marketing", "Sales", "Testing"].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => { setSearchRole(tag); setActiveTab("jobs"); }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer border border-emerald-500/20"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <MagneticButton
                            type="submit"
                            className="px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer shadow-md shadow-emerald-500/20 inline-flex items-center gap-2"
                          >
                            <Search size={15} />
                            Search
                          </MagneticButton>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                </section>

                {/* ─── PERKS GRID ───────────────────────────────────────────── */}
                <section className="py-20">
                  <SectionDivider />
                  <div className="mx-auto max-w-7xl px-6 md:px-12 pt-20">
                    <PerksSection reduced={reduced} stagger={stagger} fadeUp={fadeUp} />
                  </div>
                </section>

                {/* ─── PRIORITY ROLES GRID ──────────────────────────────────────── */}
                <section className="py-20">
                  <SectionDivider />
                  <div className="mx-auto max-w-7xl px-6 md:px-12 pt-20">
                    <PriorityRolesSection
                      reduced={reduced}
                      stagger={stagger}
                      fadeUp={fadeUp}
                      jobs={jobs}
                      setSelectedJob={setSelectedJob}
                      openApplyModal={openApplyModal}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                </section>

                {/* ─── STATS BAR ──────────────────────────────────────────────── */}
                <section>
                  <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 1.5, ease: EASE_OUT_EXPO }}
                    className="relative z-10 my-16 max-w-3xl mx-auto"
                  >
                    <TiltCard
                      className="rounded-2xl"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
                    >
                      <div
                        className="grid grid-cols-3 gap-6 p-8 rounded-2xl border backdrop-blur-sm"
                        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
                      >
                        <AnimatedCounter value="4" label="Priority Roles Open" />
                        <AnimatedCounter value="LOR" label="For Top Performers" />
                        <AnimatedCounter value="100%" label="Skill-Based Pay" />
                      </div>
                    </TiltCard>
                  </motion.div>
                </section>

                {/* ─── HIRING PROCESS ──────────────────────────────────────────── */}
                <section className="pb-20 md:pb-28 relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <SectionDivider />
                  <MeshBackground />
                  <FloatingParticles count={6} />
                  <div className="mx-auto max-w-5xl px-6 md:px-12 relative z-10 pt-20 md:pt-28">
                    <HiringProcessSection
                      reduced={reduced}
                      jobs={jobs}
                      openApplyModal={openApplyModal}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                </section>
              </div>
            </PageReveal>
          )}

          {/* ── TAB 2: JOBS LISTING (Google Careers Style) ── */}
          {activeTab === "jobs" && (
            <div data-lenis-prevent className="flex h-[calc(100vh-64px)] overflow-hidden">

              {/* ── LEFT PANEL: Search + Filters ONLY ── */}
              <div data-lenis-prevent className="w-[320px] lg:w-[340px] shrink-0 flex flex-col border-r border-gray-100 dark:border-zinc-800 overflow-y-auto">

                {/* Search bar + count */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-emerald-600 mb-3">
                    {filteredJobs.length} jobs matched
                    {(searchRole || filterType !== "ALL" || searchLocation) && (
                      <button
                        onClick={() => { setSearchRole(""); setFilterType("ALL"); setSearchLocation(""); }}
                        className="ml-2 text-xs text-gray-400 hover:text-emerald-600 underline cursor-pointer font-normal"
                      >
                        Clear filters
                      </button>
                    )}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchRole}
                      onChange={(e) => setSearchRole(e.target.value)}
                      placeholder="What do you want to do?"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 pr-8"
                    />
                    {searchRole && (
                      <button onClick={() => setSearchRole("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Accordions */}
                {/* Locations */}
                <details className="group border-b border-gray-100 dark:border-zinc-800" open>
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none list-none">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">Locations</span>
                    <ChevronDown size={15} className="text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
                    {["", "Remote", "Onsite"].map((loc) => (
                      <label key={loc} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="location"
                          checked={searchLocation === loc}
                          onChange={() => setSearchLocation(loc)}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white">
                          {loc === "" ? "Any location" : loc === "Remote" ? "Remote" : "Onsite / Bangalore HQ"}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Experience */}
                <details className="group border-b border-gray-100 dark:border-zinc-800" open>
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none list-none">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">Experience</span>
                    <ChevronDown size={15} className="text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
                    {["", "0-2 years"].map((exp) => (
                      <label key={exp} className="flex items-center gap-2.5 cursor-pointer">
                        <input type="radio" name="experience" defaultChecked={exp === ""} className="accent-emerald-600 w-4 h-4 cursor-pointer" readOnly />
                        <span className="text-sm text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white">
                          {exp === "" ? "Any experience" : exp}
                        </span>
                      </label>
                    ))}
                  </div>
                </details>

                {/* Job Types */}
                <details className="group border-b border-gray-100 dark:border-zinc-800" open>
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none list-none">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-200">Job types</span>
                    <ChevronDown size={15} className="text-gray-400 group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="px-4 pb-4 space-y-3">
                    {[{ val: "ALL", label: "All types" }, { val: "FULL_TIME", label: "Full-time" }, { val: "INTERNSHIP", label: "Internship" }].map((t) => (
                      <label key={t.val} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="jobtype"
                          checked={filterType === t.val}
                          onChange={() => setFilterType(t.val)}
                          className="accent-emerald-600 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>

              {/* ── RIGHT PANEL: All Job Cards (Google Careers style) ── */}
              <div data-lenis-prevent className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-zinc-900/30">
                <div className="max-w-3xl mx-auto py-6 px-6 space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <Search size={32} className="text-gray-300 dark:text-zinc-700" />
                      <p className="text-base font-semibold text-gray-500 dark:text-zinc-400">No roles match your search</p>
                      <button
                        onClick={() => { setSearchRole(""); setSearchLocation(""); setFilterType("ALL"); }}
                        className="text-sm text-emerald-600 hover:underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const isApplied = myApplications.some((a) => a.jobId === job.id);
                      const isExpanded = selectedJob?.id === job.id && showJobDetail;
                      const isCardSelected = selectedJob?.id === job.id;
                      return (
                        <div
                          key={job.id}
                          className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-6">
                            {/* Job title */}
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                              {job.title}
                            </h2>

                            {/* Metadata row */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 flex-wrap mb-4">
                              <span className="flex items-center gap-1.5">
                                <Building2 size={13} className="shrink-0" />
                                Eduvantix
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="shrink-0" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <BarChart2 size={13} className="shrink-0" />
                                {job.experience}
                              </span>
                            </div>

                            {/* Minimum qualifications — always shown */}
                            {job.requirements?.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-2">Minimum qualifications</p>
                                <ul className="space-y-1.5">
                                  {job.requirements.slice(0, 3).map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-400">
                                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Expanded detail */}
                            {isExpanded && (
                              <div className="mt-4 space-y-5 border-t border-gray-100 dark:border-zinc-800 pt-5">
                                {job.description && (
                                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{job.description}</p>
                                )}
                                {job.responsibilities?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-2">Responsibilities</p>
                                    <ul className="space-y-1.5">
                                      {job.responsibilities.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-400">
                                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 shrink-0" />
                                          {r}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {job.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {job.skills.map((s) => (
                                      <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {/* Apply inside expanded card */}
                                <button
                                  onClick={() => openApplyModal(job)}
                                  disabled={isApplied}
                                  className={`px-7 py-2.5 rounded text-sm font-bold transition-all cursor-pointer ${
                                    isApplied
                                      ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                >
                                  {isApplied ? "✓ Already Applied" : "Apply"}
                                </button>
                              </div>
                            )}

                            {/* Learn more / Show less */}
                            <button
                              onClick={() => {
                                if (isCardSelected && showJobDetail) {
                                  setShowJobDetail(false);
                                } else {
                                  setSelectedJob(job);
                                  setShowJobDetail(true);
                                }
                              }}
                              className="mt-4 px-4 py-1.5 rounded border border-gray-300 dark:border-zinc-700 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                              {isExpanded ? "Show less" : "Learn more"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="p-4 md:p-8 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Eduvantix for Students</h1>
                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                  We empower university students & early-career engineers through hands-on learning, mentorship, and entry-level career opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: GraduationCap, title: "Internship Programs", desc: "Gain real-world production engineering experience working directly on scalable products." },
                  { icon: Laptop, title: "Hands-on Projects", desc: "Build industry-standard AI and full-stack software applications mentored by senior engineers." },
                  { icon: Award, title: "Fast-Track Hiring", desc: "Top performing interns and students are offered direct full-time role offers upon graduation." },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 4: HOW WE WORK ── */}
          {activeTab === "how-we-work" && (
            <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 overflow-x-auto no-scrollbar max-w-full">
                  {WORK_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkSubTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeWorkSubTab === tab.id
                          ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs font-bold"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-tab 1: Overview */}
              {activeWorkSubTab === "overview" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">How We Work at Eduvantix</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      We combine remote-first flexibility with daily GMeet team syncs, direct founder mentorship, and real production impact.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { icon: Globe, title: "Remote-First Flexibility", desc: "Work from home or campus with flexible schedules while staying connected with the team." },
                      { icon: Laptop, title: "Daily GMeet Standups", desc: "Quick daily Google Meet syncs to align tasks, brainstorm solutions, and unblock code together." },
                      { icon: Sparkles, title: "Direct Founder Mentorship", desc: "Work closely with company founders and leads on high-impact production features." },
                      { icon: DollarSign, title: "Skill-Based Pay & LOR", desc: "Performance-indexed stipend + official completion letters & founder LOR for top performers." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{card.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Flexible Working */}
              {activeWorkSubTab === "flexibility" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">Flexible Working & Daily Syncs</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      Enjoy the freedom of remote work paired with daily live collaboration on Google Meet.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Laptop, title: "Daily Google Meet Standups", desc: "We host interactive daily GMeet calls to review progress, share screen to debug code, and keep everyone aligned on sprint goals." },
                      { icon: Clock, title: "Flexible Work Schedule", desc: "Manage your own hours around college classes, exams, or personal routine while attending core daily team syncs." },
                      { icon: Globe, title: "Work From Campus or Home", desc: "100% remote-friendly structure. All you need is a reliable laptop, internet connection, and active presence in team channels." },
                      { icon: Heart, title: "Fast Help & Direct Guidance", desc: "Never stay stuck alone. Jump on a quick GMeet call anytime with senior devs or founders to resolve technical blockers fast." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Icon size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Benefits & Perks */}
              {activeWorkSubTab === "benefits" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">Real Perks & Team Rewards</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      Tangible career benefits, official credentials, and exclusive rewards for your contributions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { icon: DollarSign, title: "Skill-Indexed Pay & Stipend", desc: "Fair compensation and stipends evaluated directly on practical task performance, code quality, and deliverables." },
                      { icon: Award, title: "Founder LOR & Recommendations", desc: "Personalized Letter of Recommendation signed directly by company founders for top-performing team members." },
                      { icon: FileText, title: "Official Completion Letter", desc: "Verified Internship or Role Completion Letter to enhance your resume, LinkedIn profile, and job applications." },
                      { icon: Gift, title: "Exclusive Eduvantix Swag Kits", desc: "Custom Eduvantix hoodies, t-shirts, ceramic mugs, laptop stickers & welcome tech merchandise for top contributors." },
                      { icon: Rocket, title: "Real Production Impact", desc: "Build & ship real features used by thousands of students daily — portfolio proof that impresses future employers." },
                      { icon: Users, title: "Direct Founder Mentorship", desc: "Collaborate side-by-side with experienced founders on system design, AI architecture, and product growth." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Icon size={24} />
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{card.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Inclusion & Belonging */}
              {activeWorkSubTab === "diversity" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">Inclusion & Open Collaboration</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      A welcoming space where developers and creators of all backgrounds learn and build together.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Users, title: "Skill-First Opportunity", desc: "We evaluate candidates strictly on practical skill assessments and live code quality — not college tier or brand names." },
                      { icon: Heart, title: "Equal Voice in Daily Meetings", desc: "Flat hierarchy where every intern, developer, and team lead shares ideas openly during daily GMeets." },
                      { icon: GraduationCap, title: "Student-Friendly Guidance", desc: "Patience and structured mentorship tailored for university students balancing academics with real tech roles." },
                      { icon: Sparkles, title: "Transparent Team Culture", desc: "Direct access to leadership, clear task expectations, and continuous feedback to help you grow faster." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Icon size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: HOW WE HIRE ── */}
          {activeTab === "how-we-hire" && (
            <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 overflow-x-auto no-scrollbar max-w-full">
                  {HIRE_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHireSubTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeHireSubTab === tab.id
                          ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs font-bold"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-tab 1: Our Process */}
              {activeHireSubTab === "process" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">Our Hiring Process</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      Transparent, fast, and focused on real-world engineering skills — no whiteboard brainteasers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                      { step: "01", title: "Apply Online", desc: "Submit your resume & portfolio link in under 2 minutes." },
                      { step: "02", title: "Practical Assessment", desc: "Complete a short real-world task focused on actual project code or design." },
                      { step: "03", title: "Team & Culture Chat", desc: "30-minute conversation with engineering leads & company founders." },
                      { step: "04", title: "Offer & Onboarding", desc: "Receive a transparent offer letter and set up your welcome tech kit." },
                    ].map((step, i) => (
                      <div key={i} className="p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 relative overflow-hidden">
                        <span className="text-3xl font-black text-emerald-500/20 dark:text-emerald-500/30">{step.step}</span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{step.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <Briefcase size={14} /> Explore Open Positions
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Interview Tips */}
              {activeHireSubTab === "tips" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">How to Stand Out</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      Pro tips from our engineering and hiring leads to help you submit a winning application.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Code, title: "Showcase Deployed Work", desc: "Live web apps, GitHub repositories, and active Figma links carry 10x more weight than a long bulleted resume." },
                      { icon: Lightbulb, title: "Highlight Stack Depth", desc: "Focus on technologies you know deeply. We value strong fundamentals over a shallow list of 20 frameworks." },
                      { icon: MessageSquare, title: "Ask Insightful Questions", desc: "Use the interview to evaluate us! Ask about our system architecture, growth roadmap, and daily engineering rituals." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Icon size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Hiring FAQ */}
              {activeHireSubTab === "faq" && (
                <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white">Hiring FAQ</h2>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                      Everything you need to know about applying, assessment tasks, and role expectations.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { q: "Can university students apply for full-time roles?", a: "Yes! If you are graduating within the semester or capable of full-time commitments, we welcome student applications for both internships and full-time engineering roles." },
                      { q: "How long does the selection process take?", a: "Our team reviews applications within 3-5 business days. The end-to-end process from application to offer typically takes 7-10 days." },
                      { q: "Is the practical skill assessment paid?", a: "For short screening tasks (<2 hrs), it is unpaid screening. For extended trial projects or candidate assignments, candidates are fully compensated." },
                      { q: "Are all engineering and design roles remote?", a: "Yes, most of our roles are fully remote-friendly, with optional access to our Bangalore HQ for team offsites and co-working." },
                    ].map((item, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.q}</h3>
                        <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: MY APPLICATIONS ── */}
          {activeTab === "my-applications" && (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Applications</h1>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Track the real-time status of your submitted job applications.</p>
              </div>

              {!user ? (
                <div className="text-center py-16 space-y-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/50">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <User size={28} />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Sign in to view your applications</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Please log in to your Eduvantix account to see your submitted applications and track real-time status updates.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/login?redirect=/careers")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <User size={14} /> Sign In / Register
                  </button>
                </div>
              ) : myApplications.length === 0 ? (
                <div className="text-center py-16 space-y-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                  <Briefcase size={36} className="mx-auto text-gray-300 dark:text-zinc-700" />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white">No applications submitted yet</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Browse open roles and apply with your resume in less than 2 minutes.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Browse Open Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {app.type}
                          </span>
                          <span className="text-xs text-gray-400">Applied on {app.appliedAt}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{app.jobTitle}</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{app.department} · {app.location}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {(() => {
                          const statusConfig = {
                            PENDING: { label: "Submitted", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
                            REVIEWED: { label: "Application Under Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
                            SHORTLISTED: { label: "Shortlisted 🎉", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold", icon: CheckCircle2 },
                            REJECTED: { label: "Not Selected", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: X },
                            HIRED: { label: "Hired 🎉", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold", icon: CheckCircle2 },
                          };
                          const info = statusConfig[app.status] || statusConfig.PENDING;
                          const StatusIcon = info.icon;
                          return (
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${info.color}`}>
                              <StatusIcon size={13} /> {info.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ═════════════════════════════════════════════════════════════════
            JOB DETAIL MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {selectedJob && activeTab !== "jobs" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setSelectedJob(null)}>
            <div
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-gray-500">Job Opportunity Details</span>
                <button onClick={() => setSelectedJob(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div data-lenis-prevent className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {TYPE_LABEL[selectedJob.type]}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-1">{selectedJob.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedJob.department} · {selectedJob.location}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">About the Role</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Responsibilities</h4>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                        <ChevronRight size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    onClick={() => { setSelectedJob(null); openApplyModal(selectedJob); }}
                    className="w-full py-3.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                  >
                    Apply for this Position
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            APPLY MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {showApply && applyJob && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowApply(false)}>
            <div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Apply — {applyJob.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{applyJob.department} · {applyJob.location}</p>
                </div>
                <button onClick={() => setShowApply(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form data-lenis-prevent onSubmit={handleApplySubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Email</label>
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/50 text-xs text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Mobile Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold appearance-none cursor-pointer focus:outline-none shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.label || c.code}
                        </option>
                      ))}
                    </select>

                    {countryCode === "other" && (
                      <input
                        type="text"
                        placeholder="+XX"
                        value={customCountryCode}
                        onChange={(e) => setCustomCountryCode(e.target.value)}
                        className="w-20 px-3 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 shrink-0"
                      />
                    )}

                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={15}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Cover Note (optional)</label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell us about yourself and why you're interested in this position..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Resume * (PDF or DOCX, max 10MB)</p>
                  <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 hover:border-emerald-500 bg-gray-50 dark:bg-zinc-800/50 cursor-pointer transition-all">
                    <Upload size={16} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-zinc-300 truncate">
                      {resumeFile ? resumeFile.name : "Choose PDF or DOCX file..."}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      required
                      onChange={(e) => setResumeFile(e.target.files[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                    <AlertTriangle size={14} /> {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send size={14} /> Submit Application</span>
                  )}
                </button>

                <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
                  ✉️ After submitting, our team will reach out to you soon.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            AUTH REQUIRED MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 text-center space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <User size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to Apply</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Please log in or create an Eduvantix account to submit your job application for <span className="font-bold text-gray-900 dark:text-white">{pendingApplyJob?.title}</span>.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/login?redirect=/careers");
                  }}
                  className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  <User size={14} /> Sign In / Register Now
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel & Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {standalone && <Footer />}
    </div>
  );
}
