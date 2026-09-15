"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TiltCard from "@/components/TitleCard";
import useThemeStore from "@/store/useThemeStore";
import useReducedMotion from "@/customHooks/useReducedMotion";
import { EASE_OUT_EXPO, SPRING_SNAPPY } from "@/utils/constants.jsx";
import {
  Search, MapPin, Briefcase, Clock, ChevronRight, Globe, Building2,
  ArrowRight, FileText, Upload, Send, Loader2, CheckCircle2, X,
  Home, GraduationCap, Wrench, User, AlertTriangle, ChevronDown, Users, Laptop,
  Award, Heart, Sparkles, Rocket, IndianRupee, Gift, Lightbulb, MessageSquare, Code,
  Palette, Zap, TrendingUp, Star, ShieldCheck, Flame, Share2
} from "lucide-react";



function SectionDivider() {
  const isDark = useThemeStore((s) => s.isDark);
  return <div className="w-full h-px" style={{ backgroundColor: isDark ? "#1C1C1C" : "#ECECEC" }} />;
}

function AnimatedCounter({ value, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isDark = useThemeStore((s) => s.isDark);
  const [count, setCount] = useState(0);

  const numericPart = value.toString().match(/\d+/)?.[0] || "";
  const suffix = value.toString().replace(numericPart, "");
  const isNumber = numericPart !== "";

  useEffect(() => {
    if (isInView && isNumber) {
      const target = parseInt(numericPart);
      const duration = 1200;
      const steps = 30;
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
      <div
        className="text-3xl md:text-4xl font-extrabold"
        style={{ color: "#10b981", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.03em" }}
      >
        {isNumber ? count + suffix : value}
      </div>
      <div
        className="text-xs font-semibold uppercase tracking-wider mt-1.5"
        style={{ color: isDark ? "#888888" : "#666666" }}
      >
        {label}
      </div>
    </div>
  );
}

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "other", label: "Other Country" },
];

const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship", PART_TIME: "Part-time" };

const TOP_TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "students", label: "Campus Ambassadors", icon: GraduationCap },
  { key: "how-we-work", label: "How we work", icon: Globe },
  { key: "how-we-hire", label: "How we hire", icon: Wrench },
  { key: "my-applications", label: "My Applications", icon: User },
];

const WORK_SUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "flexibility", label: "Flexible Working" },
  { id: "benefits", label: "Benefits & Perks" },
  { id: "diversity", label: "Inclusion & Belonging" },
];

const HIRE_SUB_TABS = [
  { id: "process", label: "Our Process" },
  { id: "tips", label: "Interview Tips" },
  { id: "faq", label: "Hiring FAQ" },
];

// ─── Perks Section ────────────────────────────────────────────────────
function PerksSection({ reduced, isDark }) {
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
          Perks &amp; Rewards
        </span>
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
        >
          Why build with eduvantix?
        </h2>
        <p className="mt-3 text-base" style={{ color: secondary }}>
          Official credentials, career endorsements, and exclusive perks for everyone on the team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: FileText, title: "Completion Letter", desc: "Official Internship or Job Completion Letter verifying your tenure — showcase on LinkedIn & resumes." },
          { icon: Award, title: "Letter of Recommendation", desc: "Performance-based LOR signed directly by company founders for top-performing team members." },
          { icon: Gift, title: "Exclusive Swag & Merch", desc: "Custom eduvantix hoodies, t-shirts, ceramic mugs, laptop stickers & full welcome tech kits." },
          { icon: IndianRupee, title: "Skill-Indexed Pay", desc: "Stipend & salary evaluated strictly on practical assessment performance — grow your skills, boost earnings." },
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * i, duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <TiltCard
                className="p-6 rounded-2xl border group h-full cursor-default"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-500/20"
                  style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                  {feature.desc}
                </p>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Priority Roles Section ───────────────────────────────────────────
function PriorityRolesSection({ reduced, jobs, setSelectedJob, openApplyModal, setActiveTab, isDark }) {
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
          {jobs.length > 0 ? "Priority Hiring Now" : "Current Team Status"}
        </span>
        <h2
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
        >
          {jobs.length > 0 ? "We're actively hiring for these roles..." : "Explore Opportunities & Culture"}
        </h2>
        <p className="mt-3 text-base" style={{ color: secondary }}>
          {jobs.length > 0
            ? "Apply today — stipend based on your skills, not fixed bands."
            : "Check back regularly or explore how our engineering and design teams work."}
        </p>
      </div>

      {jobs.length === 0 ? (
        <div
          className="py-14 px-8 rounded-3xl border max-w-xl mx-auto text-center space-y-5"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
            <Briefcase size={30} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold" style={{ color: text }}>Currently No Job Openings</h3>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: secondary }}>
              We don&apos;t have open roles at this moment. We regularly post positions for engineers, designers, and growth specialists — check back soon!
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setActiveTab("how-we-work")}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "#059669" }}
            >
              Explore How We Work &amp; Perks →
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.slice(0, 6).map((job, i) => (
              <motion.div
                key={job.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i, duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                <TiltCard
                  className="p-6 rounded-2xl border group h-full cursor-pointer flex flex-col justify-between"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <div onClick={() => setSelectedJob(job)} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                        {TYPE_LABEL[job.type] || job.type}
                      </span>
                      {job.isHot && (
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                          Priority Role
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold mb-1" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                        {job.title}
                      </h3>
                      <p className="text-xs" style={{ color: secondary }}>{job.department} · {job.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills?.slice(0, 3).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md text-[10px] font-medium"
                          style={{ backgroundColor: isDark ? "#141414" : "#F4F4F5", color: secondary, border: `1px solid ${border}` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t flex items-center justify-between" style={{ borderColor: border }}>
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#10b981" }}>
                      <IndianRupee size={13} /> Skill-Based Pay
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Apply Now
                    </button>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setActiveTab("jobs")}
              className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer hover:opacity-85 active:scale-95"
              style={{ backgroundColor: isDark ? "#1C1C1C" : "#111111", color: "#FFFFFF", border: `1px solid ${border}` }}
            >
              View All {jobs.length} Open Roles <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hiring Process Section ───────────────────────────────────────────
function HiringProcessSection({ reduced, jobs, openApplyModal, setActiveTab, isDark }) {
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
            Application Pipeline
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
          >
            Join the eduvantix Team
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: secondary }}>
            We hire based on skill, not rigid experience bands. Complete a short practical assessment and unlock your career with us.
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          {[
            "Graphic Designer — Figma, Branding, Social Creatives",
            "Digital Marketing — SEO, Analytics, Growth",
            "Sales Executive — Outreach, BD, Client Relations",
            "QA / Software Testing — Manual & Automation",
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span className="font-medium text-xs sm:text-sm" style={{ color: text }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        <TiltCard
          className="rounded-2xl border p-6 md:p-8"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                Start Your Application
              </h3>
              <p className="text-xs mt-1" style={{ color: secondary }}>
                Pick any role below and apply directly. Skill-based pay, LOR, completion letter &amp; merch await!
              </p>
            </div>

            <div className="space-y-3">
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:border-emerald-500/40"
                  style={{ borderColor: border, backgroundColor: isDark ? "#111111" : "#F9F9F9" }}
                  onClick={() => openApplyModal(job)}
                >
                  <div>
                    <div className="text-sm font-bold" style={{ color: text }}>{job.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: secondary }}>{job.department} · {job.location}</div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "#059669" }}
                    onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab("jobs")}
              className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: "#059669" }}
            >
              See All Open Roles <ArrowRight size={14} />
            </button>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

// ─── Campus Ambassador Section (High Energy Student Focused) ─────────
const CA_FAQS = [
  { q: "Who is eligible to apply?", a: "Any currently enrolled student at a recognized Indian college or university (undergraduate or postgraduate across any branch/stream) can apply for free. You only need an active eduvantix student account." },
  { q: "How and when do I get paid?", a: "Earnings are calculated in real-time on your dashboard and paid out bi-weekly (1st and 15th of every month) directly to your UPI ID (Google Pay, PhonePe, Paytm) or verified bank account." },
  { q: "How much can I realistically earn per month?", a: "There is no ceiling! With our tiered commissions, ambassadors earn between ₹350 to ₹750 per student subscription plus ₹5,000 per institutional/college partnership. Top campus leads routinely earn ₹25,000 to ₹40,000+ per month." },
  { q: "What is included in the Official Welcome Kit?", a: "Once accepted and completing your first 3 referrals, you receive an exclusive eduvantix heavy-cotton developer hoodie, branded oversized t-shirt, stainless steel tech flask, badge pins, and laptop stickers delivered to your doorstep or hostel." },
  { q: "How many hours of weekly commitment is required?", a: "It is 100% flexible! Most ambassadors invest 3–5 hours a week organizing college workshops, sharing webinar links in student WhatsApp/Telegram groups, and connecting with tech societies." },
  { q: "Do I get a Certificate and Founder Letter of Recommendation (LOR)?", a: "Yes! Every active ambassador receives a verified digital certificate. Outstanding performers who reach the Gold Tier receive a personalized Letter of Recommendation (LOR) signed directly by eduvantix founders, ideal for MS/MBA abroad and top tech job placements." },
  { q: "How long does application review take?", a: "Our student community team reviews submissions within 24–48 hours. Once approved, you immediately receive your login credentials to the dedicated Ambassador Portal." },
];

const STUDENT_SPOTLIGHTS = [
  {
    name: "Aarav Sharma",
    college: "IIT Delhi",
    year: "3rd Year CSE",
    earnings: "₹28,500",
    period: "Last Month",
    quote: "Sharing high-yield DSA and viva prep tools with my batchmates made hitting Tier 3 effortless. The bi-weekly UPI transfer was instant!",
    tag: "Top Earner",
  },
  {
    name: "Pooja Iyer",
    college: "VIT Vellore",
    year: "2nd Year IT",
    earnings: "₹19,200",
    period: "Last Month",
    quote: "The Founder LOR was a huge highlight on my resume during summer internship placements. The oversized hoodie is premium quality!",
    tag: "Campus Lead",
  },
  {
    name: "Rohan Verma",
    college: "BITS Pilani",
    year: "4th Year EEE",
    earnings: "₹42,000",
    period: "Last Month",
    quote: "Partnered our college annual technical fest with eduvantix. Bringing 2 departments on board unlocked massive institution bonuses.",
    tag: "B2B Pioneer",
  },
  {
    name: "Ananya Mukherjee",
    college: "Delhi University",
    year: "3rd Year BCA",
    earnings: "₹16,400",
    period: "Last Month",
    quote: "Gained real marketing and leadership experience while studying for semester exams. Flexible hours and an awesome ambassador community.",
    tag: "Community Lead",
  },
];

function CampusAmbassadorSection({ user, token, API_BASE, reduced, router, isDark }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);

  // Interactive Live Calculator State
  const [referralCount, setReferralCount] = useState(20);
  const [partnerColleges, setPartnerColleges] = useState(1);
  const [activePerkTab, setActivePerkTab] = useState("merch");
  const [activeSpotlight, setActiveSpotlight] = useState(0);

  const [regForm, setRegForm] = useState({
    fullName: "",
    phone: "",
    collegeName: "",
    city: "",
    yearOfStudy: "",
    degree: "",
    linkedinUrl: "",
    instagramHandle: "",
    whyJoin: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  // Tier calculations
  const perStudentRate = referralCount <= 10 ? 350 : referralCount <= 30 ? 500 : 750;
  const studentEarnings = referralCount * perStudentRate;
  const collegeEarnings = partnerColleges * 5000;
  const totalEstimatedEarnings = studentEarnings + collegeEarnings;

  const currentTier = useMemo(() => {
    if (referralCount <= 10) {
      return {
        name: "Bronze Scout",
        icon: "🌟",
        color: "#f59e0b",
        rateText: "₹350 / student referral",
        perks: "Starter Commission + Digital Badge + Sticker Pack",
        nextTier: "11+ referrals for Silver",
      };
    }
    if (referralCount <= 30) {
      return {
        name: "Silver Campus Leader",
        icon: "🚀",
        color: "#06b6d4",
        rateText: "₹500 / student referral",
        perks: "1.4x Commission + Official Hoodie + Verified Certificate",
        nextTier: "31+ referrals for Gold",
      };
    }
    return {
      name: "Gold Elite Director",
      icon: "👑",
      color: "#10b981",
      rateText: "₹750 / student referral",
      perks: "Maximum Commission + Founder LOR + Guaranteed Internship Interview",
      nextTier: "Max Tier Unlocked! Top 1% Ambassador",
    };
  }, [referralCount]);

  useEffect(() => {
    try { localStorage.removeItem("eduvantix_ca_status"); } catch { }
  }, []);

  useEffect(() => {
    if (user && token) {
      const emailQuery = user.email ? `?email=${encodeURIComponent(user.email)}` : "";
      fetch(`${API_BASE}/api/campus-ambassador/check-status${emailQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.applied) {
            setExistingStatus({ applied: true, status: data.status });
          } else {
            setExistingStatus(null);
          }
        })
        .catch(() => { setExistingStatus(null); });
    } else {
      setExistingStatus(null);
    }
  }, [user, token, API_BASE]);

  useEffect(() => {
    if (existingStatus?.applied) {
      setShowRegModal(false);
    }
  }, [existingStatus]);

  const openModal = async () => {
    if (!user || !token) {
      router.push("/login?redirect=/careers");
      return;
    }
    if (existingStatus?.applied) {
      return;
    }
    setShowRegModal(true);
  };

  useEffect(() => {
    if (user?.fullName || user?.username) {
      setRegForm(f => ({ ...f, fullName: f.fullName || user.fullName || user.username }));
    }
  }, [user]);

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.whyJoin.trim() || regForm.whyJoin.trim().length < 30) {
      setRegError("Please write at least 30 characters in the 'Why join' field.");
      return;
    }
    setRegLoading(true);
    setRegError("");
    try {
      const res = await fetch(`${API_BASE}/api/campus-ambassador/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccess(true);
        setExistingStatus({ applied: true, status: "PENDING" });
      } else if (data.alreadyApplied) {
        setExistingStatus({ applied: true, status: data.status });
      } else {
        setRegError(data.message || "Failed to submit. Please try again.");
      }
    } catch {
      setRegError("Network error. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate"];
  const DEGREE_OPTIONS = ["B.Tech / B.E.", "BCA", "B.Sc", "B.Com / BBA", "M.Tech / M.E.", "MCA", "MBA / PGDM", "M.Sc", "Diploma / Other"];

  return (
    <div className="flex flex-col">
      {/* ── HIGH-ENERGY HERO ── */}
      <section
        className="relative overflow-hidden py-20 md:py-28 px-6 md:px-12 text-center border-b"
        style={{ backgroundColor: isDark ? "#000000" : "#FAFAFA", borderColor: border }}
      >
        {/* Background ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none"
          style={{ background: isDark ? "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,182,212,0.08) 60%, transparent 100%)" : "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-xs font-semibold tracking-widest uppercase block mb-4" style={{ color: "#10b981" }}>
            Campus Ambassador Program · Batch 2026
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
            style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.04em" }}
          >
            Lead Your College. Earn in{" "}
            <span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Rupees
            </span>
            .<br />Build Your Resume.
          </h1>

          <p className="text-sm sm:text-base md:text-lg max-w-2xl mt-5 leading-relaxed" style={{ color: secondary }}>
            India&apos;s most rewarding student ambassador network. Earn up to <strong className="text-emerald-500 font-bold">₹35,000+/month</strong> with bi-weekly UPI transfers, receive exclusive tech merch kits, and get personalized Founder recommendation letters.
          </p>

          {/* Value highlight pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 max-w-2xl">
            {[
              { icon: Zap, label: "Bi-Weekly UPI Payouts" },
              { icon: Gift, label: "Heavy-Cotton Merch Kit" },
              { icon: Award, label: "Founder LOR for Top 1%" },
              { icon: Building2, label: "500+ Active Campuses" },
            ].map((pill, i) => {
              const Icon = pill.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                    borderColor: border,
                    color: text,
                  }}
                >
                  <Icon size={12} className="text-emerald-500 shrink-0" />
                  <span>{pill.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            {existingStatus?.applied ? (
              <div
                className="px-6 py-3.5 rounded-2xl border flex items-center gap-3 text-xs font-bold"
                style={{
                  backgroundColor: existingStatus.status === "ACCEPTED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                  borderColor: existingStatus.status === "ACCEPTED" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
                  color: existingStatus.status === "ACCEPTED" ? "#10b981" : "#f59e0b",
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {existingStatus.status === "ACCEPTED"
                    ? "Official Campus Ambassador! Check your email for dashboard access."
                    : "Application submitted and actively under review by our community team."}
                </span>
              </div>
            ) : (
              <button
                onClick={openModal}
                className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-lg flex items-center gap-2"
                style={{ backgroundColor: "#059669" }}
              >
                <Rocket size={15} />
                {user ? "Apply in 2 Minutes — Free" : "Login to Apply"}
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl border-t pt-8" style={{ borderColor: border }}>
            {[
              { value: "₹35k+", label: "Top Monthly Earnings" },
              { value: "100%", label: "Direct UPI Payouts" },
              { value: "500+", label: "Colleges Represented" },
              { value: "24-48h", label: "Fast Review Turnaround" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <div className="text-xl sm:text-2xl font-extrabold" style={{ color: "#10b981", fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5" style={{ color: secondary }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="p-6 md:p-12 space-y-24 max-w-6xl mx-auto w-full">
        {/* ── INTERACTIVE LIVE EARNINGS SIMULATOR ── */}
        <section className="relative">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Live Earnings Simulator
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
            >
              Calculate Your Monthly Student Income
            </h2>
            <p className="mt-2 text-xs sm:text-sm max-w-xl mx-auto" style={{ color: secondary }}>
              Adjust the sliders below to see real-time estimated monthly earnings deposited directly to your bank account or UPI ID.
            </p>
          </div>

          <div
            className="p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-8"
            style={{ backgroundColor: cardBg, borderColor: border }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders on Left */}
              <div className="lg:col-span-7 space-y-8">
                {/* Slider 1: Students Referred */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs sm:text-sm font-bold block" style={{ color: text }}>
                        Students Enrolled Per Month
                      </label>
                      <span className="text-[11px]" style={{ color: secondary }}>
                        Classmates &amp; college friends purchasing through your link
                      </span>
                    </div>
                    <div
                      className="px-3.5 py-1 rounded-xl border text-sm font-extrabold font-mono text-emerald-500"
                      style={{ backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}
                    >
                      {referralCount} Students
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={referralCount}
                    onChange={(e) => setReferralCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono" style={{ color: secondary }}>
                    <span>1 Student (₹350/ea)</span>
                    <span>20 Students (₹500/ea)</span>
                    <span>50+ Students (₹750/ea)</span>
                  </div>
                </div>

                {/* Slider 2: Partner Colleges / Tech Clubs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs sm:text-sm font-bold block" style={{ color: text }}>
                        Colleges / Tech Clubs Introduced
                      </label>
                      <span className="text-[11px]" style={{ color: secondary }}>
                        Official department or college fest partnerships
                      </span>
                    </div>
                    <div
                      className="px-3.5 py-1 rounded-xl border text-sm font-extrabold font-mono text-cyan-500"
                      style={{ backgroundColor: "rgba(6,182,212,0.08)", borderColor: "rgba(6,182,212,0.2)" }}
                    >
                      {partnerColleges} {partnerColleges === 1 ? "College" : "Colleges"}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={partnerColleges}
                    onChange={(e) => setPartnerColleges(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono" style={{ color: secondary }}>
                    <span>0 Partnerships</span>
                    <span>3 Partnerships (+₹15,000)</span>
                    <span>6 Partnerships (+₹30,000)</span>
                  </div>
                </div>

                {/* Tier Badge Box */}
                <div
                  className="p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#F9F9F9",
                    borderColor: border,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentTier.icon}</span>
                    <div>
                      <div className="text-xs font-bold" style={{ color: text }}>
                        {currentTier.name}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: secondary }}>
                        {currentTier.perks}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
                  >
                    {currentTier.rateText}
                  </span>
                </div>
              </div>

              {/* Dynamic Earnings Display Card on Right */}
              <div className="lg:col-span-5">
                <div
                  className="p-7 rounded-3xl border text-center space-y-6 relative overflow-hidden"
                  style={{
                    background: isDark
                      ? "linear-gradient(145deg, #0f1715 0%, #050d0a 100%)"
                      : "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)",
                    borderColor: isDark ? "rgba(16,185,129,0.3)" : "#a7f3d0",
                  }}
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Estimated Monthly Earnings
                    </span>
                    <div
                      className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 my-2"
                      style={{ fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
                    >
                      <IndianRupee size={36} className="shrink-0 -mr-1" />
                      <span>{totalEstimatedEarnings.toLocaleString("en-IN")}</span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 self-end mb-1.5">/month</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">
                      Calculated as: ({referralCount} × ₹{perStudentRate}) + ({partnerColleges} × ₹5,000)
                    </p>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-4 space-y-2 text-left text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Student Referral Payout</span>
                      <span className="font-mono font-bold">₹{studentEarnings.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Institutional Bonus</span>
                      <span className="font-mono font-bold">₹{collegeEarnings.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-500/10">
                      <span>Payout Mode</span>
                      <span>Direct UPI / Bank Transfer</span>
                    </div>
                  </div>

                  <button
                    onClick={openModal}
                    className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#059669" }}
                  >
                    <Rocket size={14} /> Start Earning This Month
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TWO STREAMS OF CASH EARNINGS ── */}
        <section>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Revenue Channels
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
            >
              Two High-Yield Ways to Earn Cash
            </h2>
            <p className="mt-3 text-xs sm:text-sm max-w-xl mx-auto" style={{ color: secondary }}>
              Your dedicated referral link tracks every conversion in real-time. Transparent ledger and instant payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: IndianRupee,
                title: "Student Subscription Commissions",
                desc: "Every time a college student buys an eduvantix Premium plan using your code, you earn ₹350 to ₹750 instant cash. Zero limits on referrals.",
                highlight: "Earn ₹350 – ₹750 per student enrolled",
                tag: "B2C Peer Referrals",
                color: "#10b981",
              },
              {
                icon: Building2,
                title: "College & Department Partnerships",
                desc: "Introduce eduvantix to your college HOD, TPO (Placement Cell), or tech club fest. When an institution signs with us, you receive a direct lump-sum bonus.",
                highlight: "Earn ₹5,000+ per institution signed",
                tag: "B2B Campus Introductions",
                color: "#06b6d4",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl border space-y-4 transition-all hover:border-emerald-500/40"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(16,185,129,0.1)", color: item.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 font-mono">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: border }}>
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-500">{item.highlight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── EXCLUSIVE WELCOME KIT & BENEFITS ── */}
        <section>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Ambassador Privileges
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
            >
              What You Unlock as an Ambassador
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Gift, title: "Official Merch Box", desc: "Custom eduvantix developer hoodie, heavyweight oversized tee, enamel pin, and laptop stickers shipped to you." },
              { icon: IndianRupee, title: "Bi-Weekly UPI Transfers", desc: "Direct deposits to your UPI ID (Google Pay, PhonePe, Paytm) every 1st and 15th of the month." },
              { icon: Award, title: "Founder Signed LOR", desc: "High-credibility recommendation letter signed directly by our CEO for top-tier MS/MBA abroad & job applications." },
              { icon: Globe, title: "National Network & VIP Access", desc: "Connect with student leaders across 500+ Indian campuses and get direct access to core engineering team leads." },
            ].map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border space-y-3 transition-transform hover:-translate-y-1"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                    {perk.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                    {perk.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── STUDENT SPOTLIGHT / HALL OF FAME ── */}
        <section>
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Student Hall of Fame
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
            >
              Hear from Active Campus Ambassadors
            </h2>
            <p className="mt-2 text-xs sm:text-sm max-w-xl mx-auto" style={{ color: secondary }}>
              Real college students from across India sharing their journey, earnings, and career growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STUDENT_SPOTLIGHTS.map((student, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border flex flex-col justify-between space-y-4"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded text-emerald-500" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      {student.tag}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed italic" style={{ color: secondary }}>
                    &ldquo;{student.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: border }}>
                  <div>
                    <div className="text-xs font-bold" style={{ color: text }}>{student.name}</div>
                    <div className="text-[10px]" style={{ color: secondary }}>{student.college} · {student.year}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-500 font-mono">{student.earnings}</div>
                    <div className="text-[9px]" style={{ color: secondary }}>{student.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4-STEP ONBOARDING JOURNEY ── */}
        <section>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Simple 4-Step Process
            </span>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`, letterSpacing: "-0.035em" }}
            >
              How to Get Started Today
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { step: "01", icon: FileText, title: "Register in 2 Mins", desc: "Submit the quick form with your college details and basic profile." },
              { step: "02", icon: Search, title: "Fast Verification", desc: "Our team reviews and approves your submission within 24–48 hours." },
              { step: "03", icon: Gift, title: "Receive Kit & Link", desc: "Get access to your custom referral links, dashboard, and welcome swag." },
              { step: "04", icon: IndianRupee, title: "Promote & Earn", desc: "Share on WhatsApp, host college workshops, and receive bi-weekly UPI deposits." },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative p-6 rounded-2xl border space-y-3"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <span className="text-2xl font-mono font-bold absolute top-4 right-5 opacity-20" style={{ color: secondary }}>
                    {step.step}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase block mb-3" style={{ color: "#10b981" }}>
              Ambassador FAQ
            </span>
            <h2
              className="text-2xl md:text-3xl font-extrabold tracking-tight"
              style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {CA_FAQS.map((faq, i) => (
              <div
                key={i}
                className="border rounded-2xl overflow-hidden"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold flex items-center gap-3" style={{ color: text }}>
                    <span className="text-xs font-mono font-bold" style={{ color: "#10b981" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 shrink-0 ml-2"
                    style={{ color: secondary, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 pt-1 text-xs leading-relaxed border-t" style={{ color: secondary, borderColor: border }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── REGISTRATION MODAL ── */}
      <AnimatePresence>
        {showRegModal && !existingStatus?.applied && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => { if (!regLoading) { setShowRegModal(false); setRegSuccess(false); setRegError(""); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor: border }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
                <div>
                  <h3 className="text-base font-bold" style={{ color: text }}>Campus Ambassador Registration</h3>
                  <p className="text-xs mt-0.5" style={{ color: secondary }}>Applying as: {user?.email}</p>
                </div>
                <button
                  onClick={() => { setShowRegModal(false); setRegSuccess(false); setRegError(""); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[75vh] p-6">
                {regSuccess ? (
                  <div className="p-6 text-center space-y-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
                    >
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold" style={{ color: text }}>Application Submitted!</h4>
                      <p className="text-xs mt-2 leading-relaxed" style={{ color: secondary }}>
                        Your campus ambassador application has been received. Our community team will review it and reach out within 24–48 hours with your dashboard credentials.
                      </p>
                    </div>
                    <button
                      onClick={() => { setShowRegModal(false); setRegSuccess(false); }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.fullName}
                        onChange={e => setRegForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                        style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>WhatsApp / Phone *</label>
                        <input
                          type="tel"
                          required
                          value={regForm.phone}
                          onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Year of Study *</label>
                        <select
                          required
                          value={regForm.yearOfStudy}
                          onChange={e => setRegForm(f => ({ ...f, yearOfStudy: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none cursor-pointer"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        >
                          <option value="">Select year</option>
                          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Degree / Program *</label>
                        <select
                          required
                          value={regForm.degree}
                          onChange={e => setRegForm(f => ({ ...f, degree: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none cursor-pointer"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        >
                          <option value="">Select degree</option>
                          {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>City / State *</label>
                        <input
                          type="text"
                          required
                          value={regForm.city}
                          onChange={e => setRegForm(f => ({ ...f, city: e.target.value }))}
                          placeholder="e.g. Bangalore, Delhi..."
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>College / University Name *</label>
                      <input
                        type="text"
                        required
                        value={regForm.collegeName}
                        onChange={e => setRegForm(f => ({ ...f, collegeName: e.target.value }))}
                        placeholder="e.g. IIT Delhi, VIT Vellore, SRM, BITS..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                        style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>LinkedIn Profile</label>
                        <input
                          type="url"
                          value={regForm.linkedinUrl}
                          onChange={e => setRegForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                          placeholder="linkedin.com/in/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Instagram Handle</label>
                        <input
                          type="text"
                          value={regForm.instagramHandle}
                          onChange={e => setRegForm(f => ({ ...f, instagramHandle: e.target.value }))}
                          placeholder="@username"
                          className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>
                        Why do you want to be an eduvantix Campus Ambassador? * <span className="text-[10px] opacity-75">(min. 30 chars)</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={regForm.whyJoin}
                        onChange={e => setRegForm(f => ({ ...f, whyJoin: e.target.value }))}
                        placeholder="Tell us about yourself, student clubs you are part of, or your campus reach..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none resize-none"
                        style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                      />
                    </div>

                    {regError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                        <AlertTriangle size={14} /> {regError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: "#059669" }}
                    >
                      {regLoading ? "Submitting..." : "Submit Application"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Careers Client ──────────────────────────────────────────────
export default function CareersClient({ standalone = true }) {
  const router = useRouter();
  const user = null;
  const token = null;
  const isDark = useThemeStore((state) => state.isDark);
  const reduced = useReducedMotion();

  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  const [activeTab, setActiveTab] = useState("home");
  const [activeWorkSubTab, setActiveWorkSubTab] = useState("overview");
  const [activeHireSubTab, setActiveHireSubTab] = useState("process");

  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchMyApplications();
    }
  }, [user, token]);

  const filteredJobs = jobs.filter((job) => {
    const matchRole = !searchRole || job.title.toLowerCase().includes(searchRole.toLowerCase()) || job.skills?.some(s => s.toLowerCase().includes(searchRole.toLowerCase()));
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg, color: text }}>
      {standalone && (
        <div className="relative z-50 [&_header]:!relative [&_header]:!top-0 [&_header]:!my-0 [&_header]:!w-full [&_header]:!max-w-full [&_header]:!rounded-none [&_header]:!border-x-0 [&_header]:!border-t-0">
          <Navbar />
        </div>
      )}

      {/* Main Page Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Vertical Navigation Bar (Desktop Only) */}
        <aside
          className="hidden md:flex w-20 sm:w-24 shrink-0 border-r flex-col items-center py-6 gap-6 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar z-20"
          style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA", borderColor: border }}
        >
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
                  className="w-11 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: isActive ? "rgba(16,185,129,0.15)" : "transparent",
                    color: isActive ? "#10b981" : secondary,
                  }}
                >
                  <Icon size={17} />
                </div>
                <span
                  className="text-[10px] text-center leading-tight transition-all max-w-[70px]"
                  style={{
                    color: isActive ? "#10b981" : secondary,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {tab.label}
                </span>
                {tab.key === "my-applications" && myApplications.length > 0 && (
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white -mt-0.5"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {myApplications.length}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* MAIN CONTENT AREA (Scrolls naturally, with bottom padding on mobile for bottom nav) */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {/* ── TAB 1: HOME ── */}
          {activeTab === "home" && (
            <div className="relative flex flex-col" style={{ backgroundColor: bg }}>
              {/* Hero Section (Google Careers exact design with dark background image) */}
              <section className="relative w-full overflow-hidden min-h-[calc(100vh-64px)] flex items-center border-b" style={{ borderColor: border }}>
                {/* Background image — Crisp dark office photo */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="/bg-image.png"
                    alt="eduvantix Office"
                    className="w-full h-full object-cover object-center lg:object-bottom"
                  />
                  {/* Dark vignette gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/60" />
                </div>

                <div className="relative z-10 p-6 md:p-12 w-full max-w-7xl mx-auto flex justify-start py-12">
                  {/* Google Careers Style Search Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                    className="w-full max-w-[440px] p-7 md:p-8 rounded-3xl border shadow-2xl space-y-6"
                    style={{ backgroundColor: cardBg, borderColor: border }}
                  >
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug"
                      style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}
                    >
                      Search for your career at{" "}
                      <span className="inline-block whitespace-nowrap align-middle">
                        <img
                          src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                          alt="eduvantix"
                          className="h-6 sm:h-7 w-auto object-contain inline-block align-middle -mt-1 mx-1"
                        />
                      </span>
                    </h1>

                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold block mb-1.5" style={{ color: secondary }}>
                          Role
                        </label>
                        <input
                          type="text"
                          value={searchRole}
                          onChange={(e) => setSearchRole(e.target.value)}
                          placeholder="Software engineer, Graphic designer..."
                          className="w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold block mb-1.5" style={{ color: secondary }}>
                          Where?
                        </label>
                        <div className="relative">
                          <select
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border text-xs outline-none appearance-none cursor-pointer"
                            style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                          >
                            <option value="">Any location / Work mode</option>
                            <option value="Remote">Remote</option>
                            <option value="Onsite">Onsite / Bangalore HQ</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: secondary }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: secondary }}>Trending:</span>
                        {["Graphic Designer", "Digital Marketing", "Sales", "Testing"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => { setSearchRole(tag); setActiveTab("jobs"); }}
                            className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer"
                            style={{ backgroundColor: isDark ? "#161616" : "#F0F0F0", color: secondary, border: `1px solid ${border}` }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          style={{ backgroundColor: "#059669" }}
                        >
                          <Search size={14} />
                          Search Open Roles
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              </section>

              {/* Perks Grid */}
              <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
                <PerksSection reduced={reduced} isDark={isDark} />
              </section>

              <SectionDivider />

              {/* Priority Roles */}
              <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
                <PriorityRolesSection
                  reduced={reduced}
                  jobs={jobs}
                  setSelectedJob={setSelectedJob}
                  openApplyModal={openApplyModal}
                  setActiveTab={setActiveTab}
                  isDark={isDark}
                />
              </section>

              <SectionDivider />

              {/* Stats Bar */}
              <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto w-full">
                <div
                  className="grid grid-cols-3 gap-6 p-8 rounded-2xl border"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <AnimatedCounter value={jobs.filter(j => j.isActive !== false).length === 0 ? "No" : String(jobs.filter(j => j.isActive !== false).length)} label={jobs.filter(j => j.isActive !== false).length === 1 ? "Priority Role Open" : "Priority Roles Open"} />
                  <AnimatedCounter value="LOR" label="For Top Performers" />
                  <AnimatedCounter value="100%" label="Skill-Based Pay" />
                </div>
              </section>

              <SectionDivider />

              {/* Hiring Process */}
              <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
                <HiringProcessSection
                  reduced={reduced}
                  jobs={jobs}
                  openApplyModal={openApplyModal}
                  setActiveTab={setActiveTab}
                  isDark={isDark}
                />
              </section>
            </div>
          )}

          {/* ── TAB 2: JOBS LISTING ── */}
          {activeTab === "jobs" && (
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
              {/* Left Panel: Search & Filters */}
              <div
                className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r p-6 space-y-6 lg:sticky lg:top-0 lg:h-[calc(100vh-64px)] lg:overflow-y-auto"
                style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA", borderColor: border }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                      {filteredJobs.length} Jobs Matched
                    </span>
                    {(searchRole || filterType !== "ALL" || searchLocation) && (
                      <button
                        onClick={() => { setSearchRole(""); setFilterType("ALL"); setSearchLocation(""); }}
                        className="text-[10px] text-gray-400 hover:text-emerald-500 underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchRole}
                      onChange={(e) => setSearchRole(e.target.value)}
                      placeholder="Search roles..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                      style={{ backgroundColor: isDark ? "#111" : "#FFF", borderColor: border, color: text }}
                    />
                    {searchRole && (
                      <button onClick={() => setSearchRole("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: secondary }}>
                    Location
                  </span>
                  <div className="space-y-2">
                    {["", "Remote", "Onsite"].map((loc) => (
                      <label key={loc} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: text }}>
                        <input
                          type="radio"
                          name="location"
                          checked={searchLocation === loc}
                          onChange={() => setSearchLocation(loc)}
                          className="accent-emerald-500 cursor-pointer"
                        />
                        <span>{loc === "" ? "Any location" : loc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Job Types */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: secondary }}>
                    Job Type
                  </span>
                  <div className="space-y-2">
                    {[{ val: "ALL", label: "All types" }, { val: "FULL_TIME", label: "Full-time" }, { val: "INTERNSHIP", label: "Internship" }].map((t) => (
                      <label key={t.val} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: text }}>
                        <input
                          type="radio"
                          name="jobtype"
                          checked={filterType === t.val}
                          onChange={() => setFilterType(t.val)}
                          className="accent-emerald-500 cursor-pointer"
                        />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Job Cards */}
              <div className="flex-1 p-6 md:p-10" style={{ backgroundColor: bg }}>
                <div className="max-w-3xl mx-auto space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div
                      className="py-16 px-6 text-center space-y-4 rounded-3xl border"
                      style={{ backgroundColor: cardBg, borderColor: border }}
                    >
                      <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <Briefcase size={30} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold" style={{ color: text }}>No Openings Found</h3>
                        <p className="text-xs max-w-sm mx-auto" style={{ color: secondary }}>
                          Try adjusting your search filters or check back later.
                        </p>
                      </div>
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const isApplied = myApplications.some((a) => a.jobId === job.id);
                      const isExpanded = selectedJob?.id === job.id && showJobDetail;
                      const isCardSelected = selectedJob?.id === job.id;
                      return (
                        <div
                          key={job.id}
                          className="p-6 rounded-2xl border transition-all"
                          style={{ backgroundColor: cardBg, borderColor: border }}
                        >
                          <h2 className="text-lg font-bold mb-2" style={{ color: text }}>{job.title}</h2>
                          <div className="flex items-center gap-4 text-xs flex-wrap mb-4" style={{ color: secondary }}>
                            <span className="flex items-center gap-1"><Building2 size={12} /> eduvantix</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {TYPE_LABEL[job.type] || job.type}</span>
                          </div>

                          {job.requirements?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: secondary }}>Key requirements</p>
                              <ul className="space-y-1">
                                {job.requirements.slice(0, 3).map((r, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: text }}>
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {isExpanded && (
                            <div className="mt-4 space-y-4 border-t pt-4" style={{ borderColor: border }}>
                              {job.description && <p className="text-xs leading-relaxed" style={{ color: secondary }}>{job.description}</p>}
                              <button
                                onClick={() => openApplyModal(job)}
                                disabled={isApplied}
                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                style={{ backgroundColor: "#059669" }}
                              >
                                {isApplied ? "Applied" : "Apply"}
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isCardSelected && showJobDetail) {
                                setShowJobDetail(false);
                              } else {
                                setSelectedJob(job);
                                setShowJobDetail(true);
                              }
                            }}
                            className="mt-3 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer"
                            style={{ borderColor: border, color: secondary }}
                          >
                            {isExpanded ? "Show less" : "Learn more"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: CAMPUS AMBASSADORS ── */}
          {activeTab === "students" && (
            <CampusAmbassadorSection
              user={user}
              token={token}
              API_BASE={API_BASE}
              reduced={reduced}
              router={router}
              isDark={isDark}
            />
          )}

          {/* ── TAB 4: HOW WE WORK ── */}
          {activeTab === "how-we-work" && (
            <div className="p-6 md:p-12 space-y-12 max-w-6xl mx-auto">
              {/* Modern Subtabs Pill Bar without browser scrollbars */}
              <div className="flex items-center justify-center">
                <div
                  className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-sm max-w-full overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  style={{ backgroundColor: isDark ? "#0A0A0A" : "#F4F4F5", borderColor: border }}
                >
                  {WORK_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkSubTab(tab.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      style={{
                        backgroundColor: activeWorkSubTab === tab.id ? (isDark ? "#1C1C1C" : "#FFFFFF") : "transparent",
                        color: activeWorkSubTab === tab.id ? (isDark ? "#FFFFFF" : "#111111") : secondary,
                        boxShadow: activeWorkSubTab === tab.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeWorkSubTab === "overview" && (
                <div className="space-y-10">
                  {/* Hero Header */}
                  <div className="text-center max-w-3xl mx-auto space-y-3">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Team Culture &amp; Values
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      How We Build &amp; Ship at eduvantix
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: secondary }}>
                      A high-ownership engineering environment where remote flexibility meets daily collaboration and real production impact.
                    </p>
                  </div>

                  {/* Highlights Banner Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Remote Flexibility", value: "100%", desc: "Async & schedule freedom", icon: Globe, color: "#10b981" },
                      { label: "Daily Live Sync", value: "30 min", desc: "Unblock & build together", icon: Laptop, color: "#6366f1" },
                      { label: "Founder Mentorship", value: "1-on-1", desc: "Direct architecture pairing", icon: Sparkles, color: "#f59e0b" },
                      { label: "Production Impact", value: "Immediate", desc: "Ship to active students", icon: Rocket, color: "#ec4899" },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={i}
                          className="p-5 rounded-2xl border transition-transform hover:-translate-y-1 space-y-2"
                          style={{ backgroundColor: cardBg, borderColor: border }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                              <Icon size={16} />
                            </div>
                            <span className="text-lg font-black" style={{ color: text }}>{stat.value}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: text }}>{stat.label}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: secondary }}>{stat.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 4 Core Pillars Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { icon: Globe, title: "Remote-First", desc: "Work from home or campus with flexible schedules while staying connected across regions." },
                      { icon: Laptop, title: "Daily Live Syncs", desc: "Quick daily standups to align sprint goals, brainstorm UI, and unblock code together." },
                      { icon: Sparkles, title: "Direct Mentorship", desc: "Pair closely with company founders and leads on high-throughput backend and AI systems." },
                      { icon: IndianRupee, title: "Skill-Based Pay", desc: "Performance-indexed compensation + official verified completion credentials & LOR." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={i}
                          className="p-6 rounded-2xl border space-y-3 transition-all hover:shadow-lg hover:-translate-y-1"
                          style={{ backgroundColor: cardBg, borderColor: border }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{card.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: secondary }}>{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeWorkSubTab === "flexibility" && (
                <div className="space-y-10">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Work Autonomy
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      Flexible Working &amp; Daily Syncs
                    </h2>
                    <p className="text-xs leading-relaxed" style={{ color: secondary }}>
                      We optimize for high-trust output over rigid hours. Work when you are most productive.
                    </p>
                  </div>

                  {/* Daily Engineering Rituals Flow */}
                  <div className="p-7 rounded-3xl border space-y-6" style={{ backgroundColor: cardBg, borderColor: border }}>
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-emerald-500" />
                      <h3 className="text-base font-bold" style={{ color: text }}>A Typical Day at eduvantix</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { step: "Morning Async", time: "Flexible", title: "Slack / Discord Update", desc: "Share what you finished and what you are building today." },
                        { step: "Midday Sync", time: "30 Mins", title: "Live Huddle & Pairing", desc: "Share screen, demo features, and debug complex challenges together." },
                        { step: "Deep Focus", time: "Self-Paced", title: "Uninterrupted Coding", desc: "Deep work blocks without unnecessary meetings or micro-management." },
                        { step: "Continuous Ship", time: "Daily", title: "PR Review & Deploy", desc: "Fast code reviews from senior engineers and continuous deployment." },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA", borderColor: border }}>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{item.step}</span>
                            <span style={{ color: secondary }}>{item.time}</span>
                          </div>
                          <h4 className="text-xs font-bold" style={{ color: text }}>{item.title}</h4>
                          <p className="text-[11px] leading-relaxed" style={{ color: secondary }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Laptop, title: "Daily Live Collaboration", desc: "Review progress, share screen to debug code, and keep aligned on sprint goals with senior engineers." },
                      { icon: Clock, title: "Flexible Work Schedule", desc: "Manage your own hours around college classes, exam periods, or personal routines." },
                      { icon: Globe, title: "Work From Anywhere", desc: "100% remote-friendly structure with reliable async tools (Slack, GitHub, LiveKit)." },
                      { icon: Heart, title: "Direct Founder Access", desc: "Jump on a quick call anytime with founders to resolve blockers and discuss ideas." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-2xl border space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: cardBg, borderColor: border }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{card.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: secondary }}>{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeWorkSubTab === "benefits" && (
                <div className="space-y-8">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Perks &amp; Rewards
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      Real Perks &amp; Team Rewards
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { icon: IndianRupee, title: "Skill-Indexed Stipend", desc: "Fair compensation evaluated directly on practical task performance and code quality." },
                      { icon: Award, title: "Founder LOR", desc: "Personalized Letter of Recommendation signed directly by founders for top performers." },
                      { icon: FileText, title: "Completion Letter", desc: "Verified Internship or Role Completion Letter for your resume and LinkedIn." },
                      { icon: Gift, title: "eduvantix Swag Kit", desc: "Custom eduvantix hoodies, t-shirts, ceramic mugs, and laptop stickers." },
                      { icon: Rocket, title: "Production Impact", desc: "Build & ship real features used by thousands of students daily." },
                      { icon: Users, title: "Direct Mentorship", desc: "Collaborate side-by-side with experienced founders on system architecture." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-2xl border space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: cardBg, borderColor: border }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{card.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: secondary }}>{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeWorkSubTab === "diversity" && (
                <div className="space-y-8">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Inclusion &amp; Culture
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      Inclusion &amp; Open Collaboration
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Users, title: "Skill-First Hiring", desc: "We evaluate candidates strictly on code quality — not college tier or brand names." },
                      { icon: Heart, title: "Equal Voice", desc: "Flat hierarchy where every intern, developer, and lead shares ideas openly." },
                      { icon: GraduationCap, title: "Student-Friendly", desc: "Structured mentorship tailored for students balancing academics." },
                      { icon: Sparkles, title: "Transparent Culture", desc: "Direct access to leadership, clear expectations, and continuous feedback." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-2xl border space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: cardBg, borderColor: border }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{card.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: secondary }}>{card.desc}</p>
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
            <div className="p-6 md:p-12 space-y-12 max-w-6xl mx-auto">
              {/* Subtabs Pill Bar */}
              <div className="flex items-center justify-center">
                <div
                  className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-sm max-w-full overflow-x-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  style={{ backgroundColor: isDark ? "#0A0A0A" : "#F4F4F5", borderColor: border }}
                >
                  {HIRE_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHireSubTab(tab.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      style={{
                        backgroundColor: activeHireSubTab === tab.id ? (isDark ? "#1C1C1C" : "#FFFFFF") : "transparent",
                        color: activeHireSubTab === tab.id ? (isDark ? "#FFFFFF" : "#111111") : secondary,
                        boxShadow: activeHireSubTab === tab.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeHireSubTab === "process" && (
                <div className="space-y-8">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Selection Journey
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      Our Hiring Process
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                      { step: "01", title: "Apply Online", desc: "Submit your resume & portfolio link in under 2 minutes." },
                      { step: "02", title: "Practical Task", desc: "Complete a short real-world challenge focused on actual code or UI." },
                      { step: "03", title: "Team Chat", desc: "30-minute friendly conversation with engineering leads & founders." },
                      { step: "04", title: "Offer & Welcome", desc: "Receive transparent offer details and welcome tech kit setup." },
                    ].map((step, i) => (
                      <div key={i} className="p-6 rounded-2xl border space-y-3 transition-all hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: cardBg, borderColor: border }}>
                        <span className="text-2xl font-mono font-black" style={{ color: "#10b981" }}>{step.step}</span>
                        <h3 className="text-sm font-bold" style={{ color: text }}>{step.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: secondary }}>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeHireSubTab === "tips" && (
                <div className="space-y-8">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Application Advice
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      How to Stand Out
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { icon: Code, title: "Showcase Deployed Work", desc: "Live web apps, GitHub repositories, and Figma prototypes carry 10x more weight than bullet points." },
                      { icon: Lightbulb, title: "Highlight Stack Depth", desc: "Focus on technologies you know deeply. We value strong core fundamentals over a shallow list of 20 frameworks." },
                      { icon: MessageSquare, title: "Ask Insightful Questions", desc: "Ask about our system architecture, performance bottlenecks, and daily engineering rituals." },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="p-7 rounded-2xl border space-y-3 transition-all hover:shadow-lg" style={{ backgroundColor: cardBg, borderColor: border }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{card.title}</h3>
                          <p className="text-xs leading-relaxed" style={{ color: secondary }}>{card.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeHireSubTab === "faq" && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block" style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.25)", backgroundColor: "rgba(16,185,129,0.08)" }}>
                      Hiring FAQ
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                      Hiring Questions Answered
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { q: "Can university students apply for full-time roles?", a: "Yes! If you are graduating within the semester or capable of full-time commitments, we welcome student applications for both internships and full-time roles." },
                      { q: "How long does the selection process take?", a: "Our team reviews applications within 3-5 business days. The end-to-end process typically takes 7-10 days." },
                      { q: "Is the practical skill assessment paid?", a: "Short screening tasks (<2 hrs) are unpaid. For extended trial projects or assignments, candidates are fully compensated." },
                      { q: "Are all engineering and design roles remote?", a: "Yes, most of our roles are fully remote-friendly, with optional access to our Bangalore HQ." },
                    ].map((item, i) => {
                      const isOpen = openFaqIndex === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : i)}
                          className="p-5 rounded-2xl border transition-all cursor-pointer space-y-2"
                          style={{ backgroundColor: cardBg, borderColor: isOpen ? "#10b981" : border }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold" style={{ color: text }}>{item.q}</h3>
                            <ChevronDown size={16} className={`transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-emerald-500" : ""}`} style={{ color: isOpen ? "#10b981" : secondary }} />
                          </div>
                          {isOpen && (
                            <p className="text-xs leading-relaxed pt-1" style={{ color: secondary }}>{item.a}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: MY APPLICATIONS ── */}
          {activeTab === "my-applications" && (
            <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8">
              {/* Candidate Profile Overview Header */}
              {user && (
                <div
                  className="p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 relative overflow-hidden"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase shadow-inner border"
                        style={{
                          backgroundColor: "rgba(16,185,129,0.12)",
                          color: "#10b981",
                          borderColor: "rgba(16,185,129,0.25)"
                        }}
                      >
                        {user.username?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-extrabold" style={{ color: text }}>{user.fullName || user.username}</h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active Candidate
                          </span>
                        </div>
                        <p className="text-xs font-medium mt-0.5" style={{ color: secondary }}>{user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
                      style={{ backgroundColor: "#059669" }}
                    >
                      Browse Open Jobs
                    </button>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor: border }}>
                    <div className="p-3.5 rounded-xl text-center" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA" }}>
                      <span className="text-xl font-extrabold block" style={{ color: text }}>{myApplications.length}</span>
                      <span className="text-[11px] font-medium" style={{ color: secondary }}>Total Applications</span>
                    </div>
                    <div className="p-3.5 rounded-xl text-center" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA" }}>
                      <span className="text-xl font-extrabold text-amber-500 block">
                        {myApplications.filter(a => a.status === "SUBMITTED" || !a.status).length}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: secondary }}>Under Review</span>
                    </div>
                    <div className="p-3.5 rounded-xl text-center" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA" }}>
                      <span className="text-xl font-extrabold text-emerald-500 block">
                        {myApplications.filter(a => a.status === "SHORTLISTED" || a.status === "HIRED").length}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: secondary }}>Shortlisted</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold tracking-widest uppercase block mb-1" style={{ color: "#10b981" }}>
                  Application Status
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: text, fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif` }}>
                  Submitted Applications
                </h1>
              </div>

              {!user ? (
                <div
                  className="text-center py-16 space-y-4 rounded-3xl border"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    <User size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold" style={{ color: text }}>Sign in to view applications</p>
                    <p className="text-xs" style={{ color: secondary }}>Log in to track status updates for your submitted applications.</p>
                  </div>
                  <button
                    onClick={() => router.push("/login?redirect=/careers")}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md"
                    style={{ backgroundColor: "#059669" }}
                  >
                    Sign In / Register
                  </button>
                </div>
              ) : myApplications.length === 0 ? (
                <div
                  className="text-center py-16 space-y-4 rounded-3xl border"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  <Briefcase size={36} className="mx-auto" style={{ color: secondary }} />
                  <div className="space-y-1">
                    <p className="text-base font-bold" style={{ color: text }}>No applications submitted yet</p>
                    <p className="text-xs" style={{ color: secondary }}>Browse open roles and apply with your resume in less than 2 minutes.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer"
                    style={{ backgroundColor: "#059669" }}
                  >
                    Browse Open Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-6 rounded-2xl border space-y-4 transition-all hover:shadow-md"
                      style={{ backgroundColor: cardBg, borderColor: border }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase"
                              style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                            >
                              {app.type}
                            </span>
                            <span className="text-xs" style={{ color: secondary }}>Applied on {app.appliedAt}</span>
                          </div>
                          <h3 className="text-base font-bold" style={{ color: text }}>{app.jobTitle}</h3>
                          <p className="text-xs" style={{ color: secondary }}>{app.department} · {app.location}</p>
                        </div>

                        <div>
                          <span
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5"
                            style={{
                              backgroundColor: app.status === "SHORTLISTED" || app.status === "HIRED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                              borderColor: app.status === "SHORTLISTED" || app.status === "HIRED" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
                              color: app.status === "SHORTLISTED" || app.status === "HIRED" ? "#10b981" : "#f59e0b",
                            }}
                          >
                            <Clock size={13} /> {app.status || "In Review"}
                          </span>
                        </div>
                      </div>

                      {/* Application Timeline Status Bar */}
                      <div className="pt-3 border-t" style={{ borderColor: border }}>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                          {["Submitted", "Screening", "Interview", "Decision"].map((st, sIdx) => {
                            const isDone = sIdx === 0 || (app.status === "SHORTLISTED" && sIdx <= 2) || (app.status === "HIRED");
                            return (
                              <div key={st} className="space-y-1">
                                <div className={`h-1.5 rounded-full transition-all ${isDone ? "bg-emerald-500" : (isDark ? "bg-zinc-800" : "bg-zinc-200")}`} />
                                <span style={{ color: isDone ? "#10b981" : secondary }}>{st}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedJob && activeTab !== "jobs" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelectedJob(null)}>
          <div
            className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: cardBg, borderColor: border }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: secondary }}>Job Details</span>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                  {TYPE_LABEL[selectedJob.type] || selectedJob.type}
                </span>
                <h2 className="text-xl font-bold mt-2" style={{ color: text }}>{selectedJob.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: secondary }}>{selectedJob.department} · {selectedJob.location}</p>
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: secondary }}>About the Role</h4>
                  <p className="text-xs leading-relaxed" style={{ color: text }}>{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.requirements?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: secondary }}>Requirements</h4>
                  <ul className="space-y-1.5">
                    {selectedJob.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: text }}>
                        <CheckCircle2 size={13} className="mt-0.5 text-emerald-500 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t" style={{ borderColor: border }}>
                <button
                  onClick={() => { setSelectedJob(null); openApplyModal(selectedJob); }}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer shadow-md"
                  style={{ backgroundColor: "#059669" }}
                >
                  Apply for this Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── APPLY MODAL ── */}
      {showApply && applyJob && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowApply(false)}>
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: cardBg, borderColor: border }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: border }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: text }}>Apply — {applyJob.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: secondary }}>{applyJob.department} · {applyJob.location}</p>
              </div>
              <button onClick={() => setShowApply(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Email</label>
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs cursor-not-allowed opacity-60"
                    style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Mobile Number *</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border text-xs outline-none cursor-pointer shrink-0"
                    style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))}
                    placeholder="Mobile number"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none"
                    style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Cover Note (optional)</label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Tell us about yourself and why you're interested in this role..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none resize-none"
                  style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border, color: text }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: secondary }}>Resume * (PDF or DOCX)</label>
                <label
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed hover:border-emerald-500 cursor-pointer transition-colors"
                  style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", borderColor: border }}
                >
                  <Upload size={16} className="text-emerald-500" />
                  <span className="text-xs truncate" style={{ color: text }}>
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
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                style={{ backgroundColor: "#059669" }}
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Application</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTH MODAL ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowAuthModal(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border p-6 text-center space-y-4 shadow-2xl"
            style={{ backgroundColor: cardBg, borderColor: border }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              <User size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold" style={{ color: text }}>Sign in to Apply</h3>
              <p className="text-xs" style={{ color: secondary }}>
                Please log in or create an account to submit your application for <span className="font-bold" style={{ color: text }}>{pendingApplyJob?.title}</span>.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/login?redirect=/careers");
                }}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white cursor-pointer shadow-md"
                style={{ backgroundColor: "#059669" }}
              >
                Sign In / Register Now
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ color: secondary }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">Application submitted successfully!</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-1.5 py-2 backdrop-blur-xl bg-opacity-95 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        style={{
          backgroundColor: isDark ? "rgba(10, 10, 10, 0.94)" : "rgba(250, 250, 250, 0.94)",
          borderColor: border,
        }}
      >
        {TOP_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const shortLabels = {
            "home": "Home",
            "jobs": "Jobs",
            "students": "Ambassadors",
            "how-we-work": "Culture",
            "how-we-hire": "Hiring",
            "my-applications": "Applied",
          };
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-1 relative group cursor-pointer transition-all active:scale-95"
            >
              <div
                className="relative w-10 h-7 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? "rgba(16,185,129,0.15)" : "transparent",
                  color: isActive ? "#10b981" : secondary,
                }}
              >
                <Icon size={17} />
                {tab.key === "my-applications" && myApplications.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    {myApplications.length}
                  </span>
                )}
              </div>
              <span
                className="text-[9px] text-center leading-none tracking-tight truncate w-full px-0.5 transition-all"
                style={{
                  color: isActive ? "#10b981" : secondary,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {shortLabels[tab.key] || tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {standalone && <Footer />}
    </div>
  );
}
