"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Code2, FolderGit2, User } from "lucide-react";

// Pure code-constructed dark dashboard preview — no images
export default function LandingPlatformPreview() {
  return (
    <section className="px-6 sm:px-10 py-28" style={{ backgroundColor: "#000000" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#10b981" }}
          >
            Platform Preview
          </span>
          <h2
            style={{
              color: "#FFFFFF",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
              marginTop: "1rem",
            }}
          >
            A dashboard built for career outcomes.
          </h2>
          <p style={{ color: "#888888", fontSize: "1rem", lineHeight: 1.7, marginTop: "1rem" }}>
            Every metric, every step, and every opportunity in one clean workspace.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #1C1C1C", backgroundColor: "#0A0A0A" }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid #1C1C1C" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3a3a3a" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3a3a3a" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3a3a3a" }} />
              <span className="ml-3 text-xs font-mono" style={{ color: "#555555" }}>
                eduvantix.com/dashboard
              </span>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md"
              style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              Live Platform
            </span>
          </div>

          {/* Dashboard content */}
          <div className="flex" style={{ minHeight: 480 }}>
            {/* Sidebar */}
            <div
              className="hidden md:flex flex-col gap-1 p-4"
              style={{ width: 200, borderRight: "1px solid #1C1C1C", flexShrink: 0 }}
            >
              <div className="px-3 py-2 mb-3 flex items-center gap-2.5">
                <img
                  src="/logo.webp"
                  alt="eduvantix Logo"
                  className="h-5 w-5 object-contain rounded-md shrink-0"
                />
                <span className="text-sm font-bold tracking-tight" style={{ color: "#FFFFFF" }}>eduvantix OS</span>
              </div>
              {["Overview", "My Roadmap", "Projects", "Portfolio", "Resume", "Interviews", "Job Board"].map((item, i) => (
                <div
                  key={item}
                  className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: i === 0 ? "rgba(16,185,129,0.1)" : "transparent",
                    color: i === 0 ? "#10b981" : "#555555",
                    border: i === 0 ? "1px solid rgba(16,185,129,0.15)" : "1px solid transparent",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 flex flex-col gap-5">

              {/* Top row: 4 metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Skill Score", value: "87/100", sub: "+12 this month", accent: "#10b981" },
                  { label: "Roadmap", value: "68%", sub: "On track", accent: "#34C759" },
                  { label: "Projects", value: "4 Built", sub: "2 in review", accent: "#FFFFFF" },
                  { label: "Interview Ready", value: "91%", sub: "Top 8%", accent: "#FF9F0A" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#111111", border: "1px solid #1C1C1C" }}
                  >
                    <div className="text-xs mb-2" style={{ color: "#555555" }}>{metric.label}</div>
                    <div className="text-xl font-bold tabular-nums" style={{ color: metric.accent, letterSpacing: "-0.03em" }}>
                      {metric.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#444444" }}>{metric.sub}</div>
                  </div>
                ))}
              </div>

              {/* Middle row: Roadmap progress + Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">

                {/* Roadmap progress */}
                <div
                  className="md:col-span-3 p-5 rounded-xl"
                  style={{ backgroundColor: "#111111", border: "1px solid #1C1C1C" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>Learning Roadmap</span>
                    <span className="text-xs" style={{ color: "#555555" }}>Full Stack Development</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "HTML & CSS Foundations", pct: 100, done: true },
                      { name: "JavaScript Advanced", pct: 100, done: true },
                      { name: "React & State Management", pct: 75, done: false },
                      { name: "Node.js & Databases", pct: 30, done: false },
                      { name: "System Design", pct: 0, done: false },
                    ].map((step) => (
                      <div key={step.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={13}
                              style={{ color: step.done ? "#34C759" : "#333333" }}
                              strokeWidth={2}
                            />
                            <span className="text-xs" style={{ color: step.done ? "#FFFFFF" : "#666666" }}>
                              {step.name}
                            </span>
                          </div>
                          <span className="text-xs tabular-nums" style={{ color: "#444444" }}>{step.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ backgroundColor: "#1C1C1C" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${step.pct}%`,
                              backgroundColor: step.done ? "#34C759" : step.pct > 0 ? "#10b981" : "#1C1C1C",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div
                  className="md:col-span-2 p-5 rounded-xl flex flex-col gap-3"
                  style={{ backgroundColor: "#111111", border: "1px solid #1C1C1C" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>Career Feed</span>
                  {[
                    { icon: Code2, text: "Completed: React Hooks module", time: "2h ago", color: "#10b981" },
                    { icon: FolderGit2, text: "Project reviewed: E-commerce App", time: "1d ago", color: "#34C759" },
                    { icon: User, text: "Mock interview scored: 91/100", time: "2d ago", color: "#FF9F0A" },
                    { icon: BarChart3, text: "Matched to 3 new job openings", time: "3d ago", color: "#FFFFFF" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}12`, border: `1px solid ${item.color}20` }}
                        >
                          <Icon size={13} style={{ color: item.color }} />
                        </div>
                        <div>
                          <p className="text-xs leading-tight" style={{ color: "#CCCCCC" }}>{item.text}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#444444" }}>{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
