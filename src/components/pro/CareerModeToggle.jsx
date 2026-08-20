"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Zap } from "lucide-react";
import { usePro } from "@/context/ProContext";

/**
 * CareerModeToggle — navbar button that switches between Learning and Career Mode.
 *
 * For FREE users: shows "✨ Go Pro" → navigates to /pro/upgrade
 * For PRO users in Learning Mode: shows "✨ Career Mode" → switches to Career Mode
 * For PRO users in Career Mode: shows "⚡ Career Mode ON" (active state) → switches back to Learning Mode
 */
export default function CareerModeToggle() {
  const router = useRouter();
  const { isPro, mode, toggleMode, setMode } = usePro();

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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] cursor-pointer"
        style={{
          background: "var(--pro-accent-glow)",
          border: "1px solid var(--pro-border-subtle)",
          color: "var(--pro-accent-primary)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--pro-bg-surface-sunken)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "var(--pro-accent-glow)";
        }}
      >
        <Sparkles size={12} />
        <span className="hidden sm:inline">Go Pro</span>
      </button>
    );
  }

  if (isCareerMode) {
    return (
      <button
        onClick={handleClick}
        title="Switch to Learning Mode"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] cursor-pointer"
        style={{
          background: "var(--pro-accent-gradient)",
          border: "1px solid var(--pro-accent-primary)",
          color: "#fff",
          boxShadow: "0 0 20px var(--accent-glow)"
        }}
      >
        <Zap size={12} className="fill-white" />
        <span className="hidden sm:inline">Career Mode</span>
        <span
          className="hidden sm:inline text-[8px] px-1 py-0.5 rounded font-bold"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          ON
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Switch to Career Mode"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] cursor-pointer"
      style={{
        background: "var(--pro-accent-glow)",
        border: "1px solid var(--pro-border-subtle)",
        color: "var(--pro-accent-primary)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "var(--pro-bg-surface-sunken)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "var(--pro-accent-glow)";
      }}
    >
      <Sparkles size={12} />
      <span className="hidden sm:inline">Career Mode</span>
    </button>
  );
}
