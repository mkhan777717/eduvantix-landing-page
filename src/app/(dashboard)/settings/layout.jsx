"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Shield, Brain, Palette } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isInstAdmin = user?.role === "INSTITUTE_ADMIN";

  const navItems = [
    {
      label: "AI Providers",
      href: "/settings/ai-providers",
      icon: <Brain size={16} />,
    },
    {
      label: "Verification",
      href: "/settings/verification",
      icon: <Shield size={16} />,
    },
    // Only Institute Admins see the Branding tab
    ...(isInstAdmin ? [{
      label: "Branding",
      href: "/settings/branding",
      icon: <Palette size={16} />,
    }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-6 border-b" style={{ borderColor: "var(--border-primary)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={24} style={{ color: "var(--text-primary)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        </div>
        
        <div className="flex gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
                  isActive 
                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]" 
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]"
                }`}
                style={{
                  marginBottom: "-2px" // Overlap the bottom border
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
