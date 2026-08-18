import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { Layers, CheckCircle2, ShieldAlert, Brain, Radio, Code, LayoutDashboard, Users,
 Plus, Search, RefreshCw,
  Edit, Trash2, Mic, Clock, FileText, ChevronDown, Video,
  Send, X, MessageSquare, ChevronLeft, Terminal, CheckSquare, BookOpen, BarChart2, Zap, Monitor
 } from "lucide-react";
import useReducedMotion from "@/customHooks/useReducedMotion";
import TiltCard from "./TitleCard";
import { motion, AnimatePresence } from 'framer-motion'
import { EASE_OUT_EXPO } from "@/utils/constants";
import useThemeStore from "@/store/useThemeStore";

// ─── Feature Stack Card (Scroll-Stack Animation) ─────────────────────
const FEATURES_LIST = [
    {
        title: "Complete Institute Admin Portal",
        subtitle: "Admin Portal",
        icon: ShieldAlert,
        description: "A centralized command center for your institution. Create and manage mentors, batch managers, and students. Organize them into batches, track progress, and oversee every aspect of your institute operations.",
        bullets: [
            "Create & manage Mentors, Batch Managers, and Students",
            "Organize students into batches and cohorts effortlessly",
            "Full institute-wide analytics and progress dashboards",
            "Role-based access control for secure operations"
        ],
        mockup: "admin",
        gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
        accentColor: "emerald",
    },
    {
        title: "AI-Powered Viva Examinations",
        subtitle: "AI Viva",
        icon: Brain,
        description: "Revolutionize assessments with AI-driven mock interviews and technical vivas. Our intelligent system generates contextual questions, evaluates responses in real-time, and provides instant, unbiased grading.",
        bullets: [
            "AI-generated questions tailored to each student's curriculum",
            "Real-time voice & text response evaluation",
            "Instant grading with detailed feedback reports",
            "Anti-cheating measures with smart proctoring"
        ],
        mockup: "viva",
        gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
        accentColor: "purple",
    },
    {
        title: "HD Live Classes with Cloud Recording",
        subtitle: "Live Classes",
        icon: Radio,
        description: "Host crystal-clear live sessions for your batches with WebRTC-powered streaming. Share your screen, interact with students through live chat, conduct polls, and automatically record every session for on-demand playback.",
        bullets: [
            "WebRTC-powered HD video streaming with screen share",
            "Live chat, polls, reactions & hand-raise interactions",
            "Automatic cloud recording with watermark protection",
            "Batch-specific or institute-wide broadcasts"
        ],
        mockup: "live",
        gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
        accentColor: "cyan",
    },
    {
        title: "In-Browser Coding Tests & Contests",
        subtitle: "Coding Tests",
        icon: Code,
        description: "Run fully-featured coding assessments with our in-browser sandbox. Support for multiple programming languages, automated test case evaluation, real-time leaderboards, and plagiarism detection.",
        bullets: [
            "Multi-language support (C++, Java, Python, JavaScript & more)",
            "Automated test case validation with instant results",
            "Real-time leaderboards and performance analytics",
            "Custom problem creation with difficulty levels"
        ],
        mockup: "coding",
        gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
        accentColor: "amber",
    },
    {
        title: "Smart Anti-Cheat & Proctoring",
        subtitle: "Anti-Cheat Exams",
        icon: ShieldAlert,
        description: "Ensure academic integrity with our military-grade proctoring suite. Track face visibility, detect multiple faces, monitor tab switches, and log screen sharing during high-stakes exams.",
        bullets: [
            "AI face tracking and identity verification",
            "Automatic tab-switch and screen-leave detection",
            "Hardware monitoring (webcam & mic enforcement)",
            "Detailed proctoring logs and trust scores"
        ],
        mockup: "anticheat",
        gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
        accentColor: "rose",
    }
];


// ─── Interactive Admin Portal Mockup ──────────────────────────────────
function AdminPortalMockup() {
    const { isDark } = useThemeStore();
    const [activeTab, setActiveTab] = useState(0); // 0 = People, 1 = Batches
    const [typedText, setTypedText] = useState("");
    const reduced = useReducedMotion();
  
    // Auto switch tabs
    useEffect(() => {
      if (reduced) return;
      const interval = setInterval(() => {
        setActiveTab((prev) => (prev === 0 ? 1 : 0));
      }, 5000);
      return () => clearInterval(interval);
    }, [reduced]);
  
    // Typing animation for search
    useEffect(() => {
      if (reduced) return;
      const searchTexts = activeTab === 0 ? ["Search mentors...", "Majeed", ""] : ["Search batches...", "DSA", ""];
      let textIdx = 0, charIdx = 0, deleting = false;
      const tick = setInterval(() => {
        const target = searchTexts[textIdx];
        if (!deleting) {
          setTypedText(target.slice(0, charIdx + 1));
          charIdx++;
          if (charIdx >= target.length) { deleting = true; setTimeout(() => {}, 600); }
        } else {
          setTypedText(target.slice(0, charIdx - 1));
          charIdx--;
          if (charIdx <= 0) { deleting = false; textIdx = (textIdx + 1) % searchTexts.length; }
        }
      }, 120);
      return () => clearInterval(tick);
    }, [activeTab, reduced]);
  
    const people = [
      { name: "Majeed Khan", email: "majeedkhan@dmx.com", role: "MENTOR", roleColor: "amber", batch: "DSA Bootcamp" },
      { name: "Priya Sharma", email: "priya.s@dmx.com", role: "MENTOR", roleColor: "amber", batch: "GenAI & LLMs" },
      { name: "Rahul Verma", email: "rahul.v@dmx.com", role: "MANAGER", roleColor: "blue", batch: "Full Stack Web" },
      { name: "Sneha Patel", email: "sneha.p@dmx.com", role: "STUDENT", roleColor: "emerald", batch: "DSA Bootcamp" },
      { name: "Arjun Mehta", email: "arjun.m@dmx.com", role: "STUDENT", roleColor: "emerald", batch: "Flutter Mobile" },
    ];
  
    const batches = [
      { name: "DSA Bootcamp", date: "10/07/2026", manager: "Rahul V.", mentors: 2, students: 24, color: "from-blue-500/20 to-cyan-500/10" },
      { name: "GenAI & LLMs", date: "12/07/2026", manager: "Priya S.", mentors: 3, students: 18, color: "from-purple-500/20 to-pink-500/10" },
      { name: "Full Stack Web", date: "08/07/2026", manager: "Abhishek K.", mentors: 2, students: 32, color: "from-emerald-500/20 to-teal-500/10" },
      { name: "Flutter Mobile", date: "15/07/2026", manager: "Sneha P.", mentors: 1, students: 12, color: "from-orange-500/20 to-amber-500/10" },
    ];
  
    const roleColorMap = { amber: { text: "text-amber-600", bg: "bg-amber-500/10" }, blue: { text: "text-blue-600", bg: "bg-blue-500/10" }, emerald: { text: "text-emerald-600", bg: "bg-emerald-500/10" } };
  
    const sidebarItems = [
      { icon: LayoutDashboard, label: "Dashboard", tab: null },
      { icon: Layers, label: "Manage Batches", tab: 1 },
      { icon: Users, label: "Manage People", tab: 0 },
      { icon: Brain, label: "AI Viva", tab: null },
      { icon: Code, label: "All Problems", tab: null },
      { icon: Radio, label: "Go Live", tab: null, live: true },
    ];
  
    return (
      <TiltCard>
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border-primary)] shadow-2xl flex text-left font-sans select-none" style={{ backgroundColor: "var(--bg-primary)" }}>
  
          {/* Sidebar */}
          <div className="w-[26%] border-r border-[var(--border-primary)] flex flex-col justify-between p-2.5 shrink-0" style={{ backgroundColor: "var(--bg-card)" }}>
            <div className="space-y-3">
              {/* Logo */}
              <div className="flex items-center gap-1.5 px-1">
                <img
                  src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                  alt="Eduvantix Logo"
                  className="h-3.5 w-auto object-contain"
                />
              </div>
  
              {/* Sidebar Items */}
              <div className="space-y-0.5">
                <div className="text-[7px] font-bold tracking-wider text-[var(--text-muted)] uppercase px-1 pb-1">Navigation</div>
                {sidebarItems.map((item) => {
                  const isActive = item.tab !== null && item.tab === activeTab;
                  return (
                    <motion.div
                      key={item.label}
                      onClick={() => item.tab !== null && setActiveTab(item.tab)}
                      className={`relative flex items-center gap-2 px-2 py-[5px] rounded-lg text-[8px] cursor-pointer transition-all duration-300 overflow-hidden ${isActive ? "font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                      style={{ backgroundColor: isActive ? "rgba(16, 185, 129, 0.08)" : "transparent", color: isActive ? "var(--accent-primary)" : undefined }}
                      whileHover={{ x: 2 }}
                    >
                      {isActive && (
                        <motion.div layoutId="mockSidebarIndicator" className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-emerald-500 rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      {/* Shimmer sweep on active */}
                      {isActive && !reduced && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.08) 50%, transparent 100%)" }}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                        />
                      )}
                      <item.icon size={10} />
                      <span>{item.label}</span>
                      {item.live && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-auto"
                          animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
  
            <div className="text-[6px] text-[var(--text-muted)] text-center border-t border-[var(--border-primary)] pt-1.5 opacity-60">
              Collapse sidebar
            </div>
          </div>
  
          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
            {/* Header */}
            <div className="h-9 border-b border-[var(--border-primary)] flex items-center justify-between px-3 shrink-0" style={{ backgroundColor: "var(--bg-card)" }}>
              <motion.div
                className="text-[7px] font-bold text-[var(--text-muted)]"
                key={activeTab}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                Admin &nbsp;/&nbsp; <span style={{ color: "var(--text-primary)" }}>{activeTab === 0 ? "People" : "Batches"}</span>
              </motion.div>
              {/* User Profile */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[7px] flex items-center justify-center">DM</div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold leading-none" style={{ color: "var(--text-primary)" }}>DMX School of Tech</span>
                  <span className="text-[5px] text-[var(--text-muted)]">Institute Admin</span>
                </div>
              </div>
            </div>
  
            {/* View Container */}
            <div className="flex-1 p-3 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === 0 ? (
                  /* ──── Manage People View ──── */
                  <motion.div
                    key="people-view"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="h-full flex flex-col"
                  >
                    <div className="space-y-2">
                      {/* Title block */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <motion.div
                            className="inline-block text-[6px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-1 py-0.5 rounded"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                          >
                            👥 Institute Directory
                          </motion.div>
                          <h4 className="text-[11px] font-black leading-none" style={{ color: "var(--text-primary)" }}>Manage People</h4>
                          <p className="text-[6px] text-[var(--text-muted)] leading-tight max-w-[250px]">Register and configure accounts for managers, mentors, and students.</p>
                        </div>
                        <motion.button
                          className="flex items-center gap-1 bg-emerald-500 text-white font-bold text-[7px] px-2 py-1 rounded-md shadow-sm"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={7} />
                          <span>Add Member</span>
                        </motion.button>
                      </div>
  
                      {/* Filter + Search */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-[2px] rounded-lg shrink-0">
                          {["Managers", "Mentors", "Students"].map((tab, i) => (
                            <motion.span
                              key={tab}
                              className={`text-[6px] px-1.5 py-[2px] rounded-md cursor-pointer ${i === 1 ? "font-bold text-emerald-500" : "text-[var(--text-muted)]"}`}
                              style={i === 1 ? { backgroundColor: "var(--bg-primary)" } : {}}
                              whileHover={{ scale: 1.05 }}
                            >
                              {tab}
                            </motion.span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 flex-1 max-w-[120px]">
                          <div className="relative w-full">
                            <Search size={7} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <div className="w-full text-[6px] pl-4 pr-1.5 py-[3px] rounded border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center">
                              <span>{typedText}</span>
                              <motion.span
                                className="inline-block w-[1px] h-2.5 bg-emerald-500 ml-[1px]"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                              />
                            </div>
                          </div>
                          <motion.button
                            className="p-[3px] rounded border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-muted)]"
                            animate={reduced ? {} : { rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                          >
                            <RefreshCw size={7} />
                          </motion.button>
                        </div>
                      </div>
  
                      {/* Table */}
                      <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-primary)]" style={{ backgroundColor: "var(--bg-secondary)" }}>
                              {["NAME", "EMAIL", "ROLE", "BATCH", ""].map((h) => (
                                <th key={h} className={`text-[5px] font-bold text-[var(--text-muted)] py-1 px-1.5 ${h === "" ? "text-right" : ""}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {people.map((p, idx) => (
                              <motion.tr
                                key={p.email}
                                className="text-[6px] border-b border-[var(--border-primary)] last:border-b-0"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + idx * 0.08, duration: 0.4, ease: EASE_OUT_EXPO }}
                              >
                                <td className="py-1 px-1.5 font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                                <td className="py-1 px-1.5 text-[var(--text-muted)]">{p.email}</td>
                                <td className="py-1 px-1.5">
                                  <span className={`text-[5px] font-bold ${roleColorMap[p.roleColor].text} ${roleColorMap[p.roleColor].bg} px-1 py-[1px] rounded`}>{p.role}</span>
                                </td>
                                <td className="py-1 px-1.5">
                                  <span className="flex items-center gap-0.5 text-emerald-500 font-medium">
                                    <Layers size={5} />
                                    <span className="truncate max-w-[60px]">{p.batch}</span>
                                  </span>
                                </td>
                                <td className="py-1 px-1.5 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button className="text-emerald-500 hover:scale-110 transition-transform"><Edit size={7} /></button>
                                    <button className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={7} /></button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ──── Manage Batches View ──── */
                  <motion.div
                    key="batches-view"
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="h-full flex flex-col"
                  >
                    <div className="space-y-2">
                      {/* Title block */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <motion.div
                            className="inline-block text-[6px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-1 py-0.5 rounded"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                          >
                            🎓 Academy Batches
                          </motion.div>
                          <h4 className="text-[11px] font-black leading-none" style={{ color: "var(--text-primary)" }}>Manage Batches</h4>
                          <p className="text-[6px] text-[var(--text-muted)] leading-tight max-w-[250px]">Create academic cohorts, bind managers, and map mentor/student rosters.</p>
                        </div>
                        <motion.button
                          className="flex items-center gap-1 bg-emerald-500 text-white font-bold text-[7px] px-2 py-1 rounded-md shadow-sm"
                          whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={7} />
                          <span>Create Batch</span>
                        </motion.button>
                      </div>
  
                      {/* Search */}
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-full max-w-[120px]">
                          <Search size={7} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                          <div className="w-full text-[6px] pl-4 pr-1.5 py-[3px] rounded border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] flex items-center">
                            <span>{typedText}</span>
                            <motion.span
                              className="inline-block w-[1px] h-2.5 bg-emerald-500 ml-[1px]"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                          </div>
                        </div>
                        <motion.button
                          className="p-[3px] rounded border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-muted)]"
                          animate={reduced ? {} : { rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                        >
                          <RefreshCw size={7} />
                        </motion.button>
                      </div>
  
                      {/* Batch Cards Grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {batches.map((b, idx) => (
                          <motion.div
                            key={b.name}
                            className="border border-[var(--border-primary)] rounded-xl p-2.5 space-y-2 relative overflow-hidden group cursor-pointer"
                            style={{ backgroundColor: "var(--bg-card)" }}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.1, duration: 0.5, ease: EASE_OUT_EXPO }}
                            whileHover={{ scale: 1.02, borderColor: "rgba(16,185,129,0.3)" }}
                          >
                            {/* Gradient background glow on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
  
                            <div className="relative z-10 flex items-start justify-between">
                              <div>
                                <h5 className="text-[8px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{b.name}</h5>
                                <span className="text-[5px] text-[var(--text-muted)]">Created on {b.date}</span>
                              </div>
                              <div className="flex gap-1">
                                <button className="text-emerald-500"><Edit size={7} /></button>
                                <button className="text-rose-500"><Trash2 size={7} /></button>
                              </div>
                            </div>
  
                            {/* Stats */}
                            <div className="relative z-10 grid grid-cols-3 gap-1">
                              {[
                                { label: "Manager", value: b.manager },
                                { label: "Mentors", value: `${b.mentors} Instr.` },
                                { label: "Students", value: `${b.students} Enrolled` },
                              ].map((stat) => (
                                <div key={stat.label} className="p-1 rounded-lg border border-[var(--border-primary)] text-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                                  <span className="text-[4px] text-[var(--text-muted)] font-black uppercase tracking-wider block">{stat.label}</span>
                                  <span className="text-[6px] font-bold block truncate" style={{ color: "var(--text-primary)" }}>{stat.value}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </TiltCard>
    );
  }

// ─── Interactive AI Viva Mockup ───────────────────────────────────────
function AIVivaMockup() {
    const { isDark } = useThemeStore();
    const [activeView, setActiveView] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(101);
    const reduced = useReducedMotion();

    const theme = {
      isDark,
      bg: isDark ? "rgb(10,15,25)" : "var(--bg-primary)",
      border: isDark ? "rgba(16,185,129,0.15)" : "var(--border-primary)",
      cardBg: isDark ? "rgba(255,255,255,0.04)" : "var(--bg-card)",
      cardBorder: isDark ? "rgba(255,255,255,0.06)" : "var(--border-primary)",
      textPrimary: isDark ? "#ffffff" : "var(--text-primary)",
      textSecondary: isDark ? "rgba(148,163,184,0.7)" : "var(--text-secondary)",
      textMuted: isDark ? "rgba(148,163,184,0.5)" : "var(--text-muted)",
      logoSrc: isDark ? "/logo-white-text.webp" : "/logo-black-text.webp",
      topBarBg: isDark ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" : "var(--bg-card)",
      topBarBorder: isDark ? "rgba(255,255,255,0.06)" : "var(--border-primary)",
    };
  
    useEffect(() => {
      if (reduced) return;
      const interval = setInterval(() => setActiveView((p) => (p + 1) % 2), 5500);
      return () => clearInterval(interval);
    }, [reduced]);
  
    useEffect(() => {
      if (activeView !== 1 || reduced) { setTimerSeconds(101); return; }
      const tick = setInterval(() => setTimerSeconds((s) => (s <= 0 ? 101 : s - 1)), 1000);
      return () => clearInterval(tick);
    }, [activeView, reduced]);
  
    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  
    return (
      <TiltCard>
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border shadow-2xl text-left font-sans select-none" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
  
          {/* Animated background orbs */}
          {!reduced && (
            <>
              <motion.div
                className="absolute w-[200px] h-[200px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", top: "-40px", left: "-40px" }}
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-[180px] h-[180px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", bottom: "-40px", right: "-20px" }}
                animate={{ x: [0, -20, 0], y: [0, -25, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-[120px] h-[120px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)", top: "30%", right: "20%" }}
                animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}
  
          {/* Top bar */}
          <div className="relative z-10 h-10 flex items-center justify-between px-4" style={{ borderBottom: `1px solid ${theme.topBarBorder}`, background: theme.topBarBg }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <img
                  src={theme.logoSrc}
                  alt="Eduvantix Logo"
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <div className="w-px h-4 bg-white/10" />
              <motion.span
                className="text-[8px] font-medium"
                style={{ color: theme.textSecondary }}
                key={activeView}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {activeView === 0 ? "Admin" : "Student"} / <span className="font-bold" style={{ color: theme.textPrimary }}>{activeView === 0 ? "AI Viva" : "Live Session"}</span>
              </motion.span>
            </div>
            <div className="flex items-center gap-3">
              {/* View switcher */}
              <div className="flex items-center gap-1 p-[3px] rounded-full" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                {["Mentor View", "Student View"].map((label, i) => (
                  <motion.div
                    key={label}
                    onClick={() => setActiveView(i)}
                    className="px-2.5 py-[3px] rounded-full cursor-pointer text-[6px] font-bold tracking-wide"
                    style={{
                      background: activeView === i ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(14,165,233,0.15))" : "transparent",
                      color: activeView === i ? "#34d399" : theme.textMuted,
                      border: activeView === i ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full font-bold text-[6px] flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>
                  {activeView === 0 ? "DM" : "AM"}
                </div>
                <div>
                  <div className="text-[7px] font-bold leading-none" style={{ color: theme.textPrimary }}>{activeView === 0 ? "DMX School" : "Arjun M."}</div>
                  <div className="text-[5px]" style={{ color: theme.textMuted }}>{activeView === 0 ? "Institute Admin" : "Scholar"}</div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Content area */}
          <div className="relative z-10 p-4 overflow-hidden" style={{ height: "calc(100% - 40px)" }}>
            <AnimatePresence mode="wait">
  
              {/* ═══ VIEW 0: AI Viva Dashboard ═══ */}
              {activeView === 0 && (
                <motion.div
                  key="dash"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                  className="h-full flex flex-col gap-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <motion.div
                        className="inline-flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-1.5"
                        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.1))", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                      >
                        <Brain size={9} /> AI Viva
                      </motion.div>
                      <h4 className="text-[15px] font-black leading-tight tracking-tight" style={{ color: theme.textPrimary }}>Viva Management</h4>
                      <p className="text-[7px] mt-0.5" style={{ color: theme.textSecondary }}>Manage question banks & schedule AI-powered assessments</p>
                    </div>
                    <motion.button
                      className="flex items-center gap-1.5 text-white font-bold text-[7px] px-3 py-1.5 rounded-xl shadow-lg"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                      whileHover={{ scale: 1.06, boxShadow: "0 6px 25px rgba(16,185,129,0.45)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={9} /> Add Question
                    </motion.button>
                  </div>
  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { val: "48", label: "Total", gradient: "from-blue-500 to-indigo-500", glow: "rgba(59,130,246,0.15)", icon: FileText },
                      { val: "22", label: "Easy", gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.15)", icon: CheckCircle2 },
                      { val: "18", label: "Medium", gradient: "from-amber-500 to-orange-500", glow: "rgba(245,158,11,0.15)", icon: BarChart2 },
                      { val: "8", label: "Hard", gradient: "from-rose-500 to-pink-500", glow: "rgba(244,63,94,0.15)", icon: Zap },
                    ].map((s, idx) => (
                      <motion.div
                        key={s.label}
                        className="relative p-3 rounded-xl overflow-hidden"
                        style={{ backgroundColor: s.glow, border: `1px solid ${theme.cardBorder}` }}
                        initial={{ opacity: 0, y: 20, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.15 + idx * 0.08, duration: 0.5, ease: EASE_OUT_EXPO }}
                        whileHover={{ y: -3, scale: 1.03 }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                            <s.icon size={13} className="text-white" />
                          </div>
                          <div>
                            <div className="text-[16px] font-black leading-none" style={{ color: theme.textPrimary }}>{s.val}</div>
                            <div className="text-[5px] font-bold uppercase tracking-wider mt-0.5" style={{ color: theme.textSecondary }}>{s.label}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
  
                  {/* Tabs + Folders */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-[2px] rounded-xl" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                        <div className="text-[7px] font-bold text-white px-3 py-[4px] rounded-[10px]" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>Question Bank</div>
                        <div className="text-[7px] px-3 py-[4px] cursor-pointer" style={{ color: theme.textMuted }}>Schedule Viva</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-[6px] font-bold px-2 py-[3px] rounded-full" style={{ color: "#34d399", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>Your Institute</span>
                      <span className="text-[6px] px-2 py-[3px] cursor-pointer" style={{ color: theme.textMuted }}>Global Bank</span>
                    </div>
                  </div>
  
                  {/* Subject cards */}
                  <div className="grid grid-cols-3 gap-2.5 flex-1">
                    {[
                      { name: "JavaScript", count: 18, emoji: "⚡", color: "from-amber-500/20 to-yellow-600/5", border: "rgba(245,158,11,0.15)" },
                      { name: "Data Structures", count: 15, emoji: "🧮", color: "from-blue-500/20 to-cyan-600/5", border: "rgba(59,130,246,0.15)" },
                      { name: "System Design", count: 15, emoji: "🏗️", color: "from-purple-500/20 to-violet-600/5", border: "rgba(139,92,246,0.15)" },
                    ].map((f, idx) => (
                      <motion.div
                        key={f.name}
                        className={`p-3 rounded-xl cursor-pointer group bg-gradient-to-br ${f.color} flex flex-col justify-center`}
                        style={{ border: `1px solid ${f.border}` }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.4, ease: EASE_OUT_EXPO }}
                        whileHover={{ y: -3, scale: 1.03 }}
                      >
                        <span className="text-[14px] mb-1">{f.emoji}</span>
                        <div className="text-[9px] font-bold" style={{ color: theme.textPrimary }}>{f.name}</div>
                        <div className="text-[6px] font-medium" style={{ color: theme.textSecondary }}>{f.count} questions</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
  
              {/* ═══ VIEW 1: Student Live Viva ═══ */}
              {activeView === 1 && (
                <motion.div
                  key="student"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                  className="h-full flex flex-col gap-2"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[6px] font-bold uppercase tracking-widest" style={{ color: theme.textMuted }}>JS Closures Viva</div>
                      <h4 className="text-[13px] font-black leading-none" style={{ color: theme.textPrimary }}>Question 1 of 3</h4>
                    </div>
                    <motion.div
                      className="text-[7px] font-bold px-2.5 py-1 rounded-lg cursor-pointer"
                      style={{ color: "#fb7185", border: "1px solid rgba(244,63,94,0.2)", background: "rgba(244,63,94,0.06)" }}
                      whileHover={{ scale: 1.05, background: "rgba(244,63,94,0.12)" }}
                    >
                      Abort Session
                    </motion.div>
                  </div>
  
                  {/* Progress */}
                  <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "33%" }}
                      transition={{ delay: 0.2, duration: 1.2, ease: EASE_OUT_EXPO }}
                    />
                  </div>
  
                  {/* Phase + Timer */}
                  <motion.div
                    className="flex items-center justify-between rounded-xl px-4 py-2.5"
                    style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.08))", border: "1px solid rgba(244,63,94,0.15)" }}
                        animate={reduced ? {} : { scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Mic size={12} className="text-rose-400" />
                      </motion.div>
                      <div>
                        <div className="text-[9px] font-bold" style={{ color: theme.textPrimary }}>Answering Phase</div>
                        <div className="text-[5px]" style={{ color: theme.textSecondary }}>Speak clearly into your mic</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                      <Clock size={10} className="text-slate-400" />
                      <motion.span
                        className="text-[14px] font-black font-mono tracking-wider"
                        key={timerSeconds}
                        style={{ color: timerSeconds < 30 ? "#f43f5e" : theme.textPrimary }}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {fmt(timerSeconds)}
                      </motion.span>
                    </div>
                  </motion.div>
  
                  {/* Question */}
                  <motion.div
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: theme.isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                        <MessageSquare size={11} className="text-slate-400" />
                      </div>
                      <p className="text-[9px] font-medium leading-relaxed" style={{ color: theme.textPrimary }}>Explain the concept of closures in JavaScript. How do they work with lexical scoping?</p>
                    </div>
                  </motion.div>
  
                  {/* Waveform area */}
                  <motion.div
                    className="rounded-xl relative flex-1 flex flex-col items-center justify-center"
                    style={{ border: "1px solid rgba(244,63,94,0.12)", background: "linear-gradient(180deg, rgba(244,63,94,0.04), rgba(244,63,94,0.01))" }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {/* LIVE badge */}
                    <motion.div
                      className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-[3px] rounded-full"
                      style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.2)" }}
                      animate={reduced ? {} : { opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        animate={reduced ? {} : { scale: [1, 1.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-[6px] font-black text-rose-400 tracking-wider">LIVE</span>
                    </motion.div>
  
                    {/* Mic status */}
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 0 20px rgba(239,68,68,0.3)" }}
                        animate={reduced ? {} : { scale: [1, 1.12, 1], boxShadow: ["0 0 15px rgba(239,68,68,0.2)", "0 0 25px rgba(239,68,68,0.5)", "0 0 15px rgba(239,68,68,0.2)"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Mic size={13} className="text-white" />
                      </motion.div>
                      <div>
                        <div className="text-[8px] font-bold" style={{ color: theme.textPrimary }}>Microphone is on</div>
                        <div className="text-[5px]" style={{ color: theme.textSecondary }}>Speak your answer now</div>
                      </div>
                    </div>
  
                    {/* Waveform bars */}
                    <div className="flex items-end justify-center gap-[3px] h-8 mb-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-[3px] rounded-full"
                          style={{ background: `linear-gradient(to top, rgba(239,68,68,${0.4 + (i % 4) * 0.1}), rgba(251,113,133,${0.2 + (i % 3) * 0.15}))` }}
                          animate={reduced ? { height: 8 } : {
                            height: [3, 8 + Math.random() * 18, 4, 12 + Math.random() * 12, 3],
                          }}
                          transition={{
                            duration: 0.4 + Math.random() * 0.5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: i * 0.03,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[6px] italic" style={{ color: theme.textMuted }}>Listening...</span>
                  </motion.div>
  
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[6px] text-emerald-400 font-semibold">42 characters captured</span>
                    </div>
                    <motion.button
                      className="flex items-center gap-1.5 text-white font-bold text-[8px] px-4 py-1.5 rounded-xl shadow-lg"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                      whileHover={{ scale: 1.06, boxShadow: "0 6px 25px rgba(16,185,129,0.5)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Answer <Send size={9} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
  
            </AnimatePresence>
          </div>
        </div>
      </TiltCard>
    );
  }
  // ─── Interactive Live Session Mockup ──────────────────────────────────────
  function LiveSessionMockup() {
    const { isDark } = useThemeStore();
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);
    const reduced = useReducedMotion();

    const theme = {
      isDark,
      bg: isDark ? "rgb(12,14,20)" : "var(--bg-primary)",
      border: isDark ? "rgba(255,255,255,0.08)" : "var(--border-primary)",
      cardBg: isDark ? "rgba(255,255,255,0.03)" : "var(--bg-card)",
      cardBorder: isDark ? "rgba(255,255,255,0.06)" : "var(--border-primary)",
      textPrimary: isDark ? "#ffffff" : "var(--text-primary)",
      textSecondary: isDark ? "rgba(148,163,184,0.7)" : "var(--text-secondary)",
      textMuted: isDark ? "rgba(148,163,184,0.5)" : "var(--text-muted)",
      logoSrc: isDark ? "/logo-white-text.webp" : "/logo-black-text.webp",
      topBarBg: isDark ? "rgba(255,255,255,0.02)" : "var(--bg-card)",
      topBarBorder: isDark ? "rgba(255,255,255,0.06)" : "var(--border-primary)",
    };
  
    // Live timer
    useEffect(() => {
      if (reduced) return;
      const tick = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
      return () => clearInterval(tick);
    }, [reduced]);
  
    // Dynamic Chat Simulation
    useEffect(() => {
      if (reduced) return;
      const allMessages = [
        { u: "Rahul S.", text: "This is mind blowing 🤯", color: "text-blue-400" },
        { u: "Priya M.", text: "Can you explain attention mechanism again?", color: "text-purple-400" },
        { u: "Amit K.", text: "Yes sir got it 👍", color: "text-emerald-400" },
        { u: "Neha R.", text: "The code looks very clean!", color: "text-amber-400" },
        { u: "Karan T.", text: "Could you zoom in a bit?", color: "text-cyan-400" },
        { u: "Simran J.", text: "React hooks make so much sense now.", color: "text-rose-400" },
      ];
      
      let msgIndex = 0;
      const interval = setInterval(() => {
        setChatMessages(prev => {
          const msg = allMessages[msgIndex];
          if (!msg) return prev;
          const newMsgs = [...prev, msg];
          return newMsgs.length > 5 ? newMsgs.slice(newMsgs.length - 5) : newMsgs;
        });
        msgIndex = (msgIndex + 1) % allMessages.length;
      }, 2500);
      
      return () => clearInterval(interval);
    }, [reduced]);
  
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  
    return (
      <TiltCard>
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border shadow-2xl text-left font-sans select-none flex flex-col" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          
          {/* Animated Background Mesh */}
          {!reduced && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <motion.div
                className="absolute w-[250px] h-[250px] rounded-full blur-[60px]"
                style={{ background: "rgba(16,185,129,0.3)", top: "-50px", left: "-50px" }}
                animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-[200px] h-[200px] rounded-full blur-[50px]"
                style={{ background: "rgba(59,130,246,0.2)", bottom: "-50px", right: "-20px" }}
                animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}
  
          {/* Header */}
          <div className="relative z-10 h-10 flex items-center justify-between px-4 border-b" style={{ borderColor: theme.topBarBorder, backgroundColor: theme.topBarBg }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <img
                  src={theme.logoSrc}
                  alt="Eduvantix Logo"
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[8px] font-medium" style={{ color: theme.textSecondary }}>
                Admin / <span className="font-bold" style={{ color: theme.textPrimary }}>Live Session</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 pl-2">
                <div className="text-right">
                  <div className="text-[7px] font-bold leading-none" style={{ color: theme.textPrimary }}>DMX School of Tech</div>
                  <div className="text-[5px]" style={{ color: theme.textMuted }}>Institute Admin</div>
                </div>
                <div className="w-5 h-5 rounded-full font-bold text-[6px] flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>
                  DM
                </div>
              </div>
            </div>
          </div>
  
          {/* Body */}
          <div className="relative z-10 flex-1 overflow-hidden p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className="h-full flex flex-col"
            >
              {/* Top Info Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                    style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}
                    animate={reduced ? {} : { opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[7px] font-black text-rose-400 tracking-wider">LIVE</span>
                  </motion.div>
                  <h2 className="text-[13px] font-black tracking-tight" style={{ color: theme.textPrimary }}>GenAI and LLMs Masterclass</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <Clock size={9} className="text-slate-400" />
                    <span className="text-[8px] font-mono font-bold" style={{ color: theme.textPrimary }}>{fmt(timerSeconds)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <Users size={9} className="text-emerald-400" />
                    <span className="text-[8px] font-bold text-emerald-400">142 viewers</span>
                  </div>
                </div>
              </div>
  
              <div className="flex gap-3 flex-1 overflow-hidden">
                {/* Left: Video & Controls */}
                <div className="flex-1 flex flex-col gap-3">
                  
                  {/* ─── Screen Share & PiP Video Area ─── */}
                  <div className="flex-1 rounded-xl overflow-hidden relative" style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}>
                    
                    {/* Fake VS Code Screen Share */}
                    <div className="absolute inset-0 font-mono text-[7px] p-3 text-slate-300 leading-relaxed overflow-hidden">
                      <div className="flex gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <div><span className="text-pink-400">import</span> {'{'} ChatSession, GenerateContentResponse {'}'} <span className="text-pink-400">from</span> <span className="text-emerald-300">'@google/generative-ai'</span>;</div>
                      <br/>
                      <div><span className="text-pink-400">export</span> <span className="text-blue-400">async</span> <span className="text-pink-400">function</span> <span className="text-yellow-200">generateResponse</span>(prompt: <span className="text-cyan-300">string</span>) {'{'}</div>
                      <div className="pl-4"><span className="text-pink-400">const</span> model = <span className="text-blue-400">await</span> ai.<span className="text-yellow-200">getGenerativeModel</span>({'{'} <span className="text-blue-300">model:</span> <span className="text-emerald-300">"gemini-pro"</span> {'}'});</div>
                      <div className="pl-4"><span className="text-pink-400">const</span> result = <span className="text-blue-400">await</span> model.<span className="text-yellow-200">generateContent</span>(prompt);</div>
                      <div className="pl-4"><span className="text-pink-400">const</span> response = <span className="text-blue-400">await</span> result.<span className="text-blue-300">response</span>;</div>
                      <div className="pl-4"><span className="text-pink-400">return</span> response.<span className="text-yellow-200">text</span>();</div>
                      <div>{'}'}</div>
                      <br/>
                      <div className="opacity-50 italic">{'// The model context window is massive now, we can pass...'}</div>
                      <div className="w-[1px] h-2 bg-white animate-pulse inline-block align-middle ml-1" />
                    </div>
  
                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {/* Connected Badge */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[6px] font-bold text-emerald-400">Connected</span>
                      </div>
                      {/* Recording Badge */}
                      <motion.div 
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 shadow-lg"
                        animate={reduced ? {} : { opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="text-[6px] font-bold text-white">REC {fmt(timerSeconds)}</span>
                      </motion.div>
                    </div>
  
                    {/* Teacher Picture-in-Picture (PiP) */}
                    <div className="absolute bottom-2 right-2 w-28 aspect-video bg-black rounded-lg overflow-hidden border border-white/20 shadow-xl shadow-black/50 z-10 group cursor-pointer hover:scale-105 transition-transform">
                      <img src="/images/indian_educator.png" alt="Teacher" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                        <span className="text-[5px] font-bold text-white">You (Host)</span>
                      </div>
                      {/* Mic activity indicator */}
                      <motion.div 
                        className="absolute bottom-1 right-1 flex items-center justify-center gap-[1px] h-2 w-2"
                      >
                        <motion.div className="w-[1.5px] bg-emerald-400 rounded-full" animate={{ height: [2, 6, 3] }} transition={{ duration: 0.4, repeat: Infinity }} />
                        <motion.div className="w-[1.5px] bg-emerald-400 rounded-full" animate={{ height: [4, 2, 5] }} transition={{ duration: 0.5, repeat: Infinity }} />
                        <motion.div className="w-[1.5px] bg-emerald-400 rounded-full" animate={{ height: [3, 7, 2] }} transition={{ duration: 0.3, repeat: Infinity }} />
                      </motion.div>
                    </div>
  
  
                  </div>
  
                  {/* Controls Bar */}
                  <div className="h-10 rounded-xl flex items-center justify-between px-3" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <div className="flex items-center gap-1.5">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary }}>
                        <Mic size={11} />
                      </button>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary }}>
                        <Video size={11} />
                      </button>
                      <button className="h-7 px-3 rounded-lg flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                        <Monitor size={10} />
                        <span className="text-[7px] font-bold">SHARE</span>
                      </button>
                    </div>
                    <button className="h-7 px-3 rounded-lg flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors shadow-lg shadow-rose-500/20">
                      <span className="text-[7px]">END SESSION</span>
                    </button>
                  </div>
                </div>
  
                {/* Right: Live Chat */}
                <div className="w-36 rounded-xl flex flex-col" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <div className="flex items-center gap-3 px-3 py-2 border-b" style={{ borderColor: theme.cardBorder }}>
                    <div className="text-[7px] font-bold border-b-2 border-emerald-500 pb-0.5" style={{ color: theme.textPrimary }}>CHAT (24)</div>
                    <div className="text-[7px] font-bold pb-0.5" style={{ color: theme.textMuted }}>Q&A</div>
                  </div>
                  
                  <div className="flex-1 p-2 flex flex-col justify-end gap-2 overflow-hidden">
                    <AnimatePresence initial={false}>
                      {chatMessages.map((msg, i) => (
                        <motion.div 
                          key={i + (msg?.u || i)} 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="text-[7px] leading-relaxed break-words"
                          layout
                        >
                          <span className={`font-bold ${msg?.color || (theme.isDark ? 'text-white' : 'text-slate-800')}`}>{msg?.u || 'User'}: </span>
                          <span style={{ color: theme.textSecondary }}>{msg?.text || ''}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {chatMessages.length === 0 && (
                      <div className="text-[7px] text-center italic w-full" style={{ color: theme.textMuted }}>Waiting for messages...</div>
                    )}
                  </div>
  
                  <div className="p-2 border-t" style={{ borderColor: theme.cardBorder }}>
                    <div className="w-full rounded px-2 py-1.5 text-[6px] flex items-center justify-between cursor-text" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.textMuted }}>
                      <span>Type a message...</span>
                      <Send size={7} className="text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </TiltCard>
    );
  }
  
  // ─── Interactive Coding Contest Mockup ──────────────────────────────────────
  function CodingContestMockup() {
    const { isDark } = useThemeStore();
    const reduced = useReducedMotion();
    const [charCount, setCharCount] = useState(0);

    const theme = {
      isDark,
      bg: isDark ? "rgb(5,5,5)" : "var(--bg-primary)",
      border: isDark ? "rgba(255,255,255,0.08)" : "var(--border-primary)",
      cardBg: isDark ? "rgba(255,255,255,0.03)" : "var(--bg-card)",
      cardBorder: isDark ? "rgba(255,255,255,0.06)" : "var(--border-primary)",
      textPrimary: isDark ? "#ffffff" : "var(--text-primary)",
      textSecondary: isDark ? "rgba(148,163,184,0.7)" : "var(--text-secondary)",
      textMuted: isDark ? "rgba(148,163,184,0.5)" : "var(--text-muted)",
      topBarBg: isDark ? "#101014" : "var(--bg-card)",
      panelBg: isDark ? "#0a0a0d" : "var(--bg-card)",
      editorBg: isDark ? "#050505" : "var(--bg-card)",
      codeColor: isDark ? "#d4d4d4" : "var(--text-primary)",
    };
    
    const coloredTokens = [
      { t: "// JavaScript Starter Code", c: "text-[#6a9955]" },
      { t: "\n", c: "" },
      { t: "function", c: "text-[#c586c0]" },
      { t: " ", c: "" },
      { t: "solve", c: "text-[#dcdcaa]" },
      { t: "(", c: "text-[#d4d4d4]" },
      { t: "n", c: "text-[#9cdcfe]" },
      { t: ") {", c: "text-[#d4d4d4]" },
      { t: "\n  ", c: "" },
      { t: "for", c: "text-[#c586c0]" },
      { t: " (", c: "text-[#d4d4d4]" },
      { t: "let", c: "text-[#c586c0]" },
      { t: " ", c: "" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: " = ", c: "text-[#d4d4d4]" },
      { t: "1", c: "text-[#b5cea8]" },
      { t: "; ", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: " <= ", c: "text-[#d4d4d4]" },
      { t: "n", c: "text-[#9cdcfe]" },
      { t: "; ", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: "++) {", c: "text-[#d4d4d4]" },
      { t: "\n    ", c: "" },
      { t: "if", c: "text-[#c586c0]" },
      { t: " (", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: " % ", c: "text-[#d4d4d4]" },
      { t: "15", c: "text-[#b5cea8]" },
      { t: " === ", c: "text-[#d4d4d4]" },
      { t: "0", c: "text-[#b5cea8]" },
      { t: ") ", c: "text-[#d4d4d4]" },
      { t: "console", c: "text-[#4fc1ff]" },
      { t: ".", c: "text-[#d4d4d4]" },
      { t: "log", c: "text-[#dcdcaa]" },
      { t: "(", c: "text-[#d4d4d4]" },
      { t: '"FizzBuzz"', c: "text-[#ce9178]" },
      { t: ");", c: "text-[#d4d4d4]" },
      { t: "\n    ", c: "" },
      { t: "else if", c: "text-[#c586c0]" },
      { t: " (", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: " % ", c: "text-[#d4d4d4]" },
      { t: "3", c: "text-[#b5cea8]" },
      { t: " === ", c: "text-[#d4d4d4]" },
      { t: "0", c: "text-[#b5cea8]" },
      { t: ") ", c: "text-[#d4d4d4]" },
      { t: "console", c: "text-[#4fc1ff]" },
      { t: ".", c: "text-[#d4d4d4]" },
      { t: "log", c: "text-[#dcdcaa]" },
      { t: "(", c: "text-[#d4d4d4]" },
      { t: '"Fizz"', c: "text-[#ce9178]" },
      { t: ");", c: "text-[#d4d4d4]" },
      { t: "\n    ", c: "" },
      { t: "else if", c: "text-[#c586c0]" },
      { t: " (", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: " % ", c: "text-[#d4d4d4]" },
      { t: "5", c: "text-[#b5cea8]" },
      { t: " === ", c: "text-[#d4d4d4]" },
      { t: "0", c: "text-[#b5cea8]" },
      { t: ") ", c: "text-[#d4d4d4]" },
      { t: "console", c: "text-[#4fc1ff]" },
      { t: ".", c: "text-[#d4d4d4]" },
      { t: "log", c: "text-[#dcdcaa]" },
      { t: "(", c: "text-[#d4d4d4]" },
      { t: '"Buzz"', c: "text-[#ce9178]" },
      { t: ");", c: "text-[#d4d4d4]" },
      { t: "\n    ", c: "" },
      { t: "else", c: "text-[#c586c0]" },
      { t: " ", c: "" },
      { t: "console", c: "text-[#4fc1ff]" },
      { t: ".", c: "text-[#d4d4d4]" },
      { t: "log", c: "text-[#dcdcaa]" },
      { t: "(", c: "text-[#d4d4d4]" },
      { t: "i", c: "text-[#9cdcfe]" },
      { t: ");", c: "text-[#d4d4d4]" },
      { t: "\n  ", c: "" },
      { t: "}", c: "text-[#d4d4d4]" },
      { t: "\n", c: "" },
      { t: "}", c: "text-[#d4d4d4]" },
    ];
  
    const totalChars = coloredTokens.reduce((acc, tk) => acc + tk.t.length, 0);
  
    useEffect(() => {
      if (reduced) {
        setCharCount(totalChars);
        return;
      }
      
      const interval = setInterval(() => {
        setCharCount(c => {
          if (c >= totalChars) {
             setTimeout(() => setCharCount(0), 3000);
             return c;
          }
          return c + 1;
        });
      }, 40); // typing speed
      
      return () => clearInterval(interval);
    }, [reduced, totalChars]);
  
    const renderTokens = () => {
      let remaining = charCount;
      return coloredTokens.map((tk, i) => {
        if (remaining <= 0) return null;
        const take = Math.min(tk.t.length, remaining);
        remaining -= take;
        const text = tk.t.substring(0, take);
        if (tk.c) {
          return <span key={i} className={tk.c}>{text}</span>;
        }
        return <span key={i}>{text}</span>;
      });
    };
  
    return (
      <TiltCard>
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl text-left font-sans select-none flex flex-col border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          
          {/* Header */}
          <div className="relative z-10 h-10 flex items-center justify-between px-3 border-b" style={{ borderColor: theme.cardBorder, backgroundColor: theme.topBarBg }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[8px]" style={{ color: theme.textSecondary }}>
                <ChevronLeft size={10} />
                <span className="font-medium cursor-pointer transition-colors hover:opacity-80">Practice Explorer</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[9px] font-bold tracking-wide" style={{ color: theme.textPrimary }}>FizzBuzz Challenge</span>
            </div>
            
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[7px] font-bold text-slate-300 transition-colors border border-white/10 bg-white/5 hover:bg-white/10">
              <Mic size={10} /> Voice Mode
            </button>
          </div>
  
          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: Problem Statement */}
            <div className="w-[45%] flex flex-col border-r" style={{ borderColor: theme.cardBorder, backgroundColor: theme.panelBg }}>
              {/* Tabs */}
              <div className="flex px-1 border-b" style={{ borderColor: theme.cardBorder, backgroundColor: theme.topBarBg }}>
                {[
                  { name: "Description", icon: FileText, active: true },
                  { name: "Followup", icon: MessageSquare },
                  { name: "Editorial", icon: BookOpen },
                  { name: "Solution", icon: CheckCircle2 },
                  { name: "Evaluation", icon: CheckSquare },
                ].map((tab, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-2.5 text-[8px] font-medium border-b-2 ${tab.active ? "border-emerald-500 text-emerald-400" : "border-transparent"} cursor-pointer`} style={!tab.active ? { color: theme.textMuted } : {}}>
                    <tab.icon size={10} className={tab.active ? "text-emerald-400" : ""} /> {tab.name}
                  </div>
                ))}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-[10px] leading-relaxed mb-6" style={{ color: theme.textSecondary }}>
                  Write a program that prints numbers from <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>1</code> to <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>N</code>. For multiples of 3 print <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>Fizz</code>, multiples of 5 print <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>Buzz</code>, and multiples of both print <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>FizzBuzz</code>.
                </p>
                
                <h3 className="text-[13px] font-bold mb-3" style={{ color: theme.textPrimary }}>Example</h3>
                <p className="text-[9px] mb-3" style={{ color: theme.textSecondary }}>For <code className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-slate-200" style={{ color: theme.textPrimary }}>N = 5</code>, output:</p>
                
                <div className="rounded border overflow-hidden" style={{ borderColor: theme.cardBorder, backgroundColor: theme.cardBg }}>
                  <div className="px-4 py-2 border-b text-[8px] font-mono tracking-wider" style={{ borderColor: theme.cardBorder, color: theme.textMuted }}>Code Block</div>
                  <div className="px-4 py-3 text-[10px] font-mono leading-relaxed" style={{ color: theme.textSecondary }}>
                    1<br/>
                    2<br/>
                    Fizz<br/>
                    4<br/>
                    Buzz
                  </div>
                </div>
              </div>
            </div>
  
            {/* Right Panel: Code Editor */}
            <div className="flex-1 flex flex-col" style={{ backgroundColor: theme.editorBg }}>
              {/* Editor Top Bar */}
              <div className="h-10 px-4 flex items-center justify-between border-b" style={{ borderColor: theme.cardBorder }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-[3px] rounded">JS</span>
                  <span className="text-[8px] font-mono" style={{ color: theme.textSecondary }}>solution.js</span>
                </div>
                <button className="flex items-center gap-1.5 text-[8px] font-bold text-rose-400 px-2.5 py-1.5 rounded border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-colors">
                  <RefreshCw size={10} /> RESET CODE
                </button>
              </div>
  
              {/* AI Assistant Banner */}
              <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: theme.cardBorder, backgroundColor: theme.panelBg }}>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Mic size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-wider" style={{ color: theme.textPrimary }}>VOICE DEVELOPER ASSISTANT</div>
                  <div className="text-[8px] mt-0.5" style={{ color: theme.textSecondary }}>Ready to explain security & algorithms.</div>
                </div>
              </div>
  
              {/* Editor Area */}
              <div className="flex-1 flex overflow-hidden">
                <div className="w-10 py-4 flex flex-col items-end pr-3 text-[10px] font-mono select-none" style={{ color: "#858585", backgroundColor: theme.editorBg }}>
                  {Array.from({ length: 11 }).map((_, i) => <div key={i} className="leading-relaxed">{i + 1}</div>)}
                </div>
                <div className="flex-1 py-4 text-[10px] font-mono whitespace-pre-wrap leading-relaxed relative" style={{ color: theme.codeColor }}>
                  {renderTokens()}
                  {charCount < totalChars && (
                     <span className="inline-block w-1.5 h-3.5 bg-white animate-pulse align-middle ml-0.5" />
                  )}
                </div>
              </div>
  
              {/* Bottom Output / Debug Bar */}
              <div className="h-12 border-t flex items-center px-4 gap-4" style={{ borderColor: theme.cardBorder, backgroundColor: theme.topBarBg }}>
                <div className="flex items-center gap-2 flex-1">
                  <button className="flex items-center gap-1.5 text-[8px] font-bold transition-colors px-3 py-1.5 rounded border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.textSecondary }}>
                    <Terminal size={10} /> Testcase
                  </button>
                  <button className="flex items-center gap-1.5 text-[8px] font-bold transition-colors px-3 py-1.5" style={{ color: theme.textMuted }}>
                    <CheckCircle2 size={10} /> Test Result
                  </button>
                  <button className="flex items-center gap-1.5 text-[8px] font-bold transition-colors px-3 py-1.5" style={{ color: theme.textMuted }}>
                    <Monitor size={10} /> Debug Console
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-[8px] font-bold tracking-wider" style={{ color: theme.textMuted }}>TEST CASE 1 (SAMPLE)</div>
                  <div className="px-4 py-1.5 rounded border text-[9px] font-mono" style={{ backgroundColor: theme.editorBg, borderColor: theme.cardBorder, color: theme.textPrimary }}>
                    15
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </TiltCard>
    );
  }
  // ─── Interactive Anti-Cheat Mockup ──────────────────────────────────────
  function AntiCheatMockup() {
    const theme = useThemeStore();
    const reduced = useReducedMotion();
    return (
      <TiltCard
        className="w-full aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-[1.5rem] overflow-hidden border shadow-2xl relative select-none"
        style={{
          backgroundColor: theme.isDark ? "#0A0A0C" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        {/* Browser Top Bar */}
        <div
          className="h-8 sm:h-10 flex items-center px-3 sm:px-4 gap-2 sm:gap-3"
          style={{ backgroundColor: theme.isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderBottom: `1px solid ${theme.cardBorder}` }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 ml-2">
            <div className="w-32 sm:w-48 h-4 sm:h-5 rounded-md mx-auto flex items-center justify-center gap-2" style={{ backgroundColor: theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <ShieldAlert size={10} className="text-slate-400" />
              <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 font-medium">exam.eduvantix.com</span>
            </div>
          </div>
        </div>

        {/* Mockup Body */}
        <div className="p-4 sm:p-6 h-full flex gap-4">
          
          {/* Webcam Feed Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative flex-1 rounded-xl overflow-hidden border flex items-center justify-center" style={{ backgroundColor: "#000", borderColor: theme.cardBorder }}>
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&h=400&fit=crop" alt="Student Feed" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              
              {/* Face Tracking Box */}
              <motion.div 
                className="absolute w-32 h-40 border border-emerald-500 rounded shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-emerald-500"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-emerald-500"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-emerald-500"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-500"></div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Identity Verified</span>
              </motion.div>
              
              {/* Recording Indicator */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1.5 border border-white/10">
                <motion.div className="w-2 h-2 rounded-full bg-rose-500" animate={reduced ? {} : { opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="text-white text-[8px] font-bold tracking-wider">REC</span>
              </div>
            </div>
          </div>

          {/* Sidebar / Logs */}
          <div className="w-48 rounded-xl flex flex-col p-4 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={14} className="text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Proctor Logs</span>
            </div>
            
            <div className="space-y-3">
              {[
                { time: "10:04", msg: "Exam started", type: "info" },
                { time: "10:12", msg: "Tab switch detected", type: "alert" },
                { time: "10:15", msg: "Face out of frame", type: "warn" },
                { time: "10:16", msg: "Face visible", type: "info" }
              ].map((log, i) => (
                <motion.div 
                  key={i} 
                  className="flex gap-2 text-[9px]"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 * i + 0.5 }}
                >
                  <span className="text-slate-500 font-mono">{log.time}</span>
                  <span className={log.type === 'alert' ? "text-rose-500 font-bold" : log.type === 'warn' ? "text-amber-500 font-bold" : "text-emerald-500"}>
                    {log.msg}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
              <div className="text-[9px] text-slate-500 mb-1">Trust Score</div>
              <div className="w-full h-1.5 bg-slate-200/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-amber-500 rounded-full" 
                  initial={{ width: "100%" }} 
                  animate={{ width: "85%" }} 
                  transition={{ delay: 1, duration: 1 }} 
                />
              </div>
              <div className="text-[10px] font-bold text-amber-500 mt-1">85% (Warnings)</div>
            </div>
          </div>
        </div>
      </TiltCard>
    );
  }

  function ScreenshotPlaceholder({ label = "Screenshot Coming Soon", icon: Icon = ImageIcon }) {
    const reduced = useReducedMotion();
    const borderRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
  
    const handleMouse = useCallback((e) => {
      const rect = borderRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }, [mouseX, mouseY]);
  
    return (
      <TiltCard>
        <div
          ref={borderRef}
          onMouseMove={handleMouse}
          className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden group p-[1px]"
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: reduced
                ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))"
                : useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(16,185,129,0.5), rgba(6,182,212,0.2) 50%, rgba(16,185,129,0.1))`,
            }}
          />
          {/* Inner content */}
          <div
            className="absolute inset-[1px] rounded-[15px] flex flex-col items-center justify-center gap-3 text-center p-6 z-10"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20"
              animate={reduced ? {} : { scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon size={28} className="text-emerald-500" />
            </motion.div>
            <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>{label}</p>
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={reduced ? {} : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{
              backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      </TiltCard>
    );
  }

function FeatureMobileCard({ feature, index }) {
    const { icon: Icon } = feature;
  
    const renderMockup = () => {
      switch (feature.mockup) {
        case "admin": return <AdminPortalMockup />;
        case "viva": return <AIVivaMockup />;
        case "live": return <LiveSessionMockup />;
        case "coding": return <CodingContestMockup />;
        case "anticheat": return <AntiCheatMockup />;
        default: return <ScreenshotPlaceholder />;
      }
    };
  
    return (
      <div 
        className="w-full rounded-[1.5rem] overflow-hidden border p-6 space-y-6"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-white/5">
              <Icon size={10} className="text-emerald-400" />
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-300">{feature.subtitle}</span>
            </div>
          </div>
          <h3 
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {feature.title}
          </h3>
          <p 
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {feature.description}
          </p>
          <div className="space-y-2">
            {feature.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <span 
                  style={{ color: "var(--text-primary)" }}
                >
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full scale-95 origin-center">
          {renderMockup()}
        </div>
      </div>
    );
  }

// ─── FeatureScrollStack Component ─────────────────────────────
function FeatureScrollStack() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkMedia = () => setIsDesktop(window.innerWidth >= 1024);
        checkMedia();
        window.addEventListener("resize", checkMedia);
        return () => window.removeEventListener("resize", checkMedia);
    }, []);

    // ------- Desktop Stacking Scroll Effect ---------
    function ScrollStack({
        children,
        className = '',
        itemDistance = 100,
        itemScale = 0.03,
        itemStackDistance = 35,
        stackPosition = '12%',
        scaleEndPosition = '3%',
        baseScale = 0.88,
        useWindowScroll = true,
    }) {
        const scrollerRef = useRef(null);
        const cardsRef = useRef([]);
        const lastTransformsRef = useRef(new Map());
        const isUpdatingRef = useRef(false);

        const calculateProgress = useCallback((scrollTop, start, end) => {
            if (scrollTop < start) return 0;
            if (scrollTop > end) return 1;
            return (scrollTop - start) / (end - start);
        }, []);

        const parsePercentage = useCallback((value, containerHeight) => {
            if (typeof value === 'string' && value.includes('%')) {
                return (parseFloat(value) / 100) * containerHeight;
            }
            return parseFloat(value);
        }, []);

        const getScrollData = useCallback(() => {
            if (useWindowScroll) {
                return {
                    scrollTop: window.scrollY,
                    containerHeight: window.innerHeight,
                    scrollContainer: document.documentElement
                };
            } else {
                const scroller = scrollerRef.current;
                return {
                    scrollTop: scroller ? scroller.scrollTop : 0,
                    containerHeight: scroller ? scroller.clientHeight : 0,
                    scrollContainer: scroller
                };
            }
        }, [useWindowScroll]);

        const getElementOffset = useCallback(
            element => {
                const target = element.classList.contains('scroll-stack-card')
                    ? element.parentElement
                    : element;

                if (useWindowScroll) {
                    const rect = target.getBoundingClientRect();
                    return rect.top + window.scrollY;
                } else {
                    return target.offsetTop;
                }
            },
            [useWindowScroll]
        );

        const updateCardTransforms = useCallback(() => {
            if (!cardsRef.current.length || isUpdatingRef.current) return;

            isUpdatingRef.current = true;

            const { scrollTop, containerHeight } = getScrollData();
            const stackPositionPx = parsePercentage(stackPosition, containerHeight);
            const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

            const endElement = useWindowScroll
                ? document.querySelector('.scroll-stack-end')
                : scrollerRef.current?.querySelector('.scroll-stack-end');

            const endElementTop = endElement ? getElementOffset(endElement) : 0;

            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                const cardTop = getElementOffset(card);
                const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
                const triggerEnd = cardTop - scaleEndPositionPx;
                const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
                const pinEnd = endElementTop - containerHeight / 2;

                const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
                const targetScale = baseScale + i * itemScale;
                const scale = 1 - scaleProgress * (1 - targetScale);

                let translateY = 0;
                const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

                if (isPinned) {
                    translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
                } else if (scrollTop > pinEnd) {
                    translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
                }

                const newTransform = {
                    translateY: Math.round(translateY * 100) / 100,
                    scale: Math.round(scale * 1000) / 1000,
                };

                const lastTransform = lastTransformsRef.current.get(i);
                const hasChanged =
                    !lastTransform ||
                    Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
                    Math.abs(lastTransform.scale - newTransform.scale) > 0.001;

                if (hasChanged) {
                    const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale})`;
                    card.style.transform = transform;
                    lastTransformsRef.current.set(i, newTransform);
                }
            });

            isUpdatingRef.current = false;
        }, [
            itemScale,
            itemStackDistance,
            stackPosition,
            scaleEndPosition,
            baseScale,
            useWindowScroll,
            calculateProgress,
            parsePercentage,
            getScrollData,
            getElementOffset
        ]);

        const handleScroll = useCallback(() => {
            updateCardTransforms();
        }, [updateCardTransforms]);

        useLayoutEffect(() => {
            const scroller = scrollerRef.current;
            const cards = Array.from(
                useWindowScroll
                    ? document.querySelectorAll('.scroll-stack-card')
                    : scroller.querySelectorAll('.scroll-stack-card')
            );

            cardsRef.current = cards;
            const transformsCache = lastTransformsRef.current;

            cards.forEach((card) => {
                card.style.willChange = 'transform';
                card.style.transformOrigin = 'top center';
                card.style.backfaceVisibility = 'hidden';
                card.style.transform = 'translateZ(0)';
            });

            window.addEventListener("scroll", handleScroll, { passive: true });

            const timer = setTimeout(() => {
                updateCardTransforms();
            }, 150);

            return () => {
                window.removeEventListener("scroll", handleScroll);
                clearTimeout(timer);
                cardsRef.current = [];
                transformsCache.clear();
                isUpdatingRef.current = false;
            };
        }, [
            itemDistance,
            itemScale,
            itemStackDistance,
            stackPosition,
            scaleEndPosition,
            baseScale,
            useWindowScroll,
            handleScroll,
            updateCardTransforms
        ]);

        const containerClassName = useWindowScroll
            ? `relative w-full ${className}`.trim()
            : `relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim();

        return (
            <div className={containerClassName} ref={scrollerRef}>
                <div className="scroll-stack-inner pt-4 pb-[30vh]">
                    {children}
                    <div className="scroll-stack-end w-full h-px" />
                </div>
            </div>
        );
    }

    // ------- Card for Desktop Stack View -------
    function ScrollStackCard({ feature, index, totalCards }) {
        const { icon: Icon } = feature;

        const renderMockup = () => {
            switch (feature.mockup) {
                case "admin": return <AdminPortalMockup />;
                case "viva": return <AIVivaMockup />;
                case "live": return <LiveSessionMockup />;
                case "coding": return <CodingContestMockup />;
                case "anticheat": return <AntiCheatMockup />;
                default: return <ScreenshotPlaceholder />;
            }
        };

        return (
            <div
                className="scroll-stack-card w-full rounded-[2rem] overflow-hidden border bg-card"
                style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-card)",
                    transformOrigin: "top center",
                    boxShadow: "0 25px 80px -20px rgba(0,0,0,0.55), 0 0 60px -15px rgba(16,185,129,0.06)",
                    willChange: "transform",
                }}
            >
                {/* Subtle top gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient}`} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 p-8 lg:py-16 lg:px-16 items-center relative overflow-hidden">
                    {/* Subtle background mesh */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(circle at 30% 40%, rgba(16,185,129,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(6,182,212,0.3) 0%, transparent 50%)",
                        }}
                    />

                    {/* Text Content */}
                    <div className="space-y-5 relative z-10 lg:order-1">
                        {/* Number Badge */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-base">
                                {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border" style={{ borderColor: "var(--border-accent)", backgroundColor: "rgba(16, 185, 129, 0.08)" }}>
                                <Icon size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-500">{feature.subtitle}</span>
                            </div>
                        </div>

                        <h3
                            className="text-3xl lg:text-4xl font-black leading-tight tracking-tight animate-reveal"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {feature.title}
                        </h3>

                        <p
                            className="text-sm lg:text-base leading-relaxed max-w-lg"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {feature.description}
                        </p>

                        <div className="space-y-2 pt-1">
                            {feature.bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-start gap-3.5">
                                    <div className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/15">
                                        <CheckCircle2 size={10} className="text-emerald-500" />
                                    </div>
                                    <span
                                        className="text-sm font-semibold leading-snug"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {bullet}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mockup Side */}
                    <div className="relative z-10 lg:order-2 scale-[0.88] lg:scale-1 origin-center">
                        {renderMockup()}
                    </div>
                </div>
            </div>
        );
    }

    // ----------- Responsive rendering -----------
    if (!isDesktop) {
        return (
            <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-12">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <span className="text-xs font-semibold tracking-widest uppercase text-emerald-500 block mb-2">Platform Features</span>
                    <h2 className="text-3xl font-black tracking-tight leading-tight mb-3" style={{ color: "var(--text-primary)" }}>
                        Everything your institute needs, <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">all in one place.</span>
                    </h2>
                    <p className="text-sm text-slate-400">Four powerful modules. One unified platform. Zero compromises.</p>
                </div>
                <div className="space-y-8">
                    {FEATURES_LIST.map((feature, i) => (
                        <FeatureMobileCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Section Header */}
            <div className="text-center max-w-[1400px] mx-auto mb-14 px-6">
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-500 block mb-2">Platform Features</span>
                <h2 className="text-6xl md:text-7xl font-bold tracking-tighter font-black leading-tight mb-2" style={{ color: "var(--text-primary)" }}>
                    Everything your institute needs, <br></br> <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">all in one place.</span>
                </h2>
            </div>

            <ScrollStack
                useWindowScroll={true}
                itemDistance={120}
                itemScale={0.03}
                itemStackDistance={35}
                stackPosition="12%"
                scaleEndPosition="3%"
                baseScale={0.88}
                className="w-full max-w-7xl mx-auto px-6 md:px-12"
            >
                {FEATURES_LIST.map((feature, i) => (
                    <div key={i} className="scroll-stack-card-wrapper w-full relative mb-[30vh]">
                        <ScrollStackCard
                            feature={feature}
                            index={i}
                            totalCards={FEATURES_LIST.length}
                        />
                    </div>
                ))}
            </ScrollStack>
        </div>
    );
}

export default FeatureScrollStack;