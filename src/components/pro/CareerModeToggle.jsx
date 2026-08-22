"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap } from "lucide-react";
import { usePro } from "@/context/ProContext";

/**
 * CareerModeToggle — navbar button that switches between Learning and Career Mode.
 */
export default function CareerModeToggle() {
  const router = useRouter();
  const { isPro, mode, toggleMode } = usePro();

  const isCareerMode = mode === "CAREER";

  const handleClick = async () => {
    if (!isPro) {
      router.push("/pro/upgrade");
      return;
    }
    const result = await toggleMode();
    if (result?.error === "PRO_REQUIRED") {
      router.push("/pro/upgrade");
    }
  };

  if (!isPro) {
    return (
      <button
        onClick={handleClick}
        title="Upgrade to Eduvantix Pro"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-xs"
      >
        <Sparkles size={12} className="text-emerald-500" />
        <span className="hidden sm:inline">Go Pro</span>
      </button>
    );
  }

  if (isCareerMode) {
    return (
      <button
        onClick={handleClick}
        title="Switch to Learning Mode"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="hidden sm:inline">Career Mode</span>
        <span className="text-[9px] px-1 py-0.5 rounded bg-white/20 font-bold uppercase">
          ON
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Switch to Career Mode"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 transition-all cursor-pointer border border-neutral-200/60 dark:border-neutral-700/60"
    >
      <Sparkles size={12} className="text-emerald-500" />
      <span className="hidden sm:inline">Career Mode</span>
    </button>
  );
}

