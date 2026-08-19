"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, LayoutDashboard, User, FileText,
  Brain, Map, FolderCode, Mic, Video, Briefcase,
  ClipboardList, Bot, Zap, ChevronRight
} from "lucide-react";
import { usePro } from "@/context/ProContext";

const sections = [
  {
    label: "✨ CAREER",
    items: [
      { label: "Overview", href: "/pro", icon: LayoutDashboard },
      { label: "Career Profile", href: "/pro/profile", icon: User },
    ],
  },
  {
    label: "📄 RESUME",
    items: [
      { label: "Resume Analysis", href: "/pro/resume", icon: FileText, comingSoon: true },
      { label: "Resume Optimizer", href: "/pro/resume/optimize", icon: FileText, comingSoon: true },
    ],
  },
  {
    label: "🧠 SKILLS",
    items: [
      { label: "Skill Intelligence", href: "/pro/skills", icon: Brain, comingSoon: true },
      { label: "Skill Gap", href: "/pro/skills/gap", icon: Brain, comingSoon: true },
    ],
  },
  {
    label: "🗺 DEVELOPMENT",
    items: [
      { label: "My Roadmap", href: "/pro/roadmap", icon: Map, comingSoon: true },
      { label: "Projects", href: "/pro/projects", icon: FolderCode, comingSoon: true },
    ],
  },
  {
    label: "🎤 PREPARE",
    items: [
      { label: "AI Interview", href: "/pro/interview", icon: Mic, comingSoon: true },
      { label: "AI Viva", href: "/pro/viva", icon: Video },
    ],
  },
  {
    label: "💼 CAREER",
    items: [
      { label: "Job Matches", href: "/pro/jobs", icon: Briefcase, comingSoon: true },
      { label: "Applications", href: "/pro/applications", icon: ClipboardList, comingSoon: true },
    ],
  },
  {
    label: "🤖 AI",
    items: [
      { label: "AI Career Coach", href: "/pro/coach", icon: Bot, comingSoon: true },
    ],
  },
];

export default function ProSidebar({ collapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setMode } = usePro();

  const handleExitCareerMode = async () => {
    await setMode("LEARNING");
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--bg-sidebar)" }}>
      {/* Header */}
      {!collapsed && (
        <div
          className="px-3 py-3 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Sparkles size={12} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#a855f7" }}>
                Career Mode
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className={`flex-1 px-2 py-2 space-y-3 overflow-y-auto overflow-x-hidden`}>
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p
                className="px-3 mb-1 text-[8px] font-black uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/pro" && pathname.startsWith(item.href));

                return (
                  <a
                    key={item.href}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(item.href);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all relative group"
                    style={{
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                      fontWeight: isActive ? 600 : 400,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                        style={{ background: "#a855f7" }}
                      />
                    )}
                    <Icon
                      size={14}
                      className="flex-shrink-0"
                      style={{ color: isActive ? "#a855f7" : "var(--text-muted)" }}
                    />
                    {!collapsed && (
                      <>
                        <span>{item.label}</span>
                        {item.comingSoon && (
                          <span
                            className="ml-auto text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{ background: "rgba(124,58,237,0.12)", color: "#a855f7" }}
                          >
                            Soon
                          </span>
                        )}
                      </>
                    )}

                    {collapsed && (
                      <div
                        className="absolute left-14 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg"
                      >
                        {item.label}
                        {item.comingSoon && " (Soon)"}
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — exit Career Mode */}
      <div className="p-2 border-t" style={{ borderColor: "var(--border-primary)" }}>
        <button
          onClick={handleExitCareerMode}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[10px] transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          title="Switch back to Learning Mode"
        >
          <Zap size={13} />
          {!collapsed && <span>Exit Career Mode</span>}
        </button>
      </div>
    </div>
  );
}
