"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, LayoutDashboard, User, FileText,
  Brain, Map, FolderCode, Mic, Video, Briefcase,
  ClipboardList, Bot, ArrowLeftRight,
  Target, Lightbulb, Compass, Code, ChevronRight
} from "lucide-react";
import { usePro } from "@/context/ProContext";

const sections = [
  {
    label: "Career",
    items: [
      { label: "Overview", href: "/pro", icon: LayoutDashboard },
      { label: "Career Profile", href: "/pro/profile", icon: User },
    ],
  },
  {
    label: "Resume",
    items: [
      { label: "Resume Analysis", href: "/pro/resume", icon: FileText },
      { label: "Resume Optimizer", href: "/pro/resume/optimize", icon: Sparkles, comingSoon: true },
    ],
  },
  {
    label: "Skills",
    items: [
      { label: "Skill Intelligence", href: "/pro/skills", icon: Lightbulb, comingSoon: true },
      { label: "Skill Gap Radar", href: "/pro/skills/gap", icon: Brain, comingSoon: true },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "My Roadmap", href: "/pro/roadmap", icon: Map },
      { label: "Projects", href: "/pro/projects", icon: FolderCode, comingSoon: true },
    ],
  },
  {
    label: "Preparation",
    items: [
      { label: "AI Interview", href: "/pro/interview", icon: Mic, comingSoon: true },
      { label: "AI Viva", href: "/pro/viva", icon: Video },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { label: "Job Matches", href: "/pro/jobs", icon: Briefcase, comingSoon: true },
      { label: "Applications", href: "/pro/applications", icon: ClipboardList, comingSoon: true },
    ],
  },
  {
    label: "AI Coach",
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
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
      {/* Sidebar Header Badge */}
      {!collapsed && (
        <div className="px-4 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Career Mode
            </span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            PRO
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/pro" && pathname.startsWith(item.href));

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left relative group cursor-pointer ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100"
                    } ${item.comingSoon ? "opacity-75" : ""}`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-emerald-600 dark:bg-emerald-400" />
                    )}
                    <Icon
                      size={15}
                      className={`flex-shrink-0 ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {!collapsed && item.comingSoon && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500">
                        Soon
                      </span>
                    )}

                    {collapsed && (
                      <div className="absolute left-12 bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-medium py-1 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                        {item.label}
                        {item.comingSoon && " (Soon)"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — exit Career Mode */}
      <div className="p-2.5 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50">
        <button
          onClick={handleExitCareerMode}
          className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all cursor-pointer"
          title="Switch back to Learning Mode"
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={14} className="text-neutral-500" />
            {!collapsed && <span>Learning Mode</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              Exit →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

