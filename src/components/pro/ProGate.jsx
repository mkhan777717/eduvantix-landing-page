"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { usePro } from "@/context/ProContext";

/**
 * UpgradeToPro — CTA component shown to free users when they hit a Pro gate.
 *
 * Props:
 *  - title       : Heading text
 *  - description : Subtext
 *  - feature     : Optional feature name shown in the message
 *  - compact     : Render a smaller inline version
 */
export function UpgradeToPro({
  title = "This feature is available with Eduvantix Pro",
  description = "Upgrade to Pro to unlock your personalised career intelligence experience.",
  feature = null,
  compact = false,
}) {
  if (compact) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.06) 100%)",
          borderColor: "rgba(124,58,237,0.2)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Lock size={13} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {feature ? `${feature} requires Pro` : "Pro Feature"}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Upgrade to unlock
            </p>
          </div>
        </div>
        <Link
          href="/pro/upgrade"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <Sparkles size={10} />
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto space-y-6">
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center border"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(168,85,247,0.08) 100%)",
          borderColor: "rgba(124,58,237,0.2)",
        }}
      >
        <Sparkles size={32} style={{ color: "#a855f7" }} />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/pro/upgrade"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" }}
      >
        <Sparkles size={15} />
        Upgrade to Pro
        <ArrowRight size={14} />
      </Link>

      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
        All existing Eduvantix features remain available in Learning Mode.
      </p>
    </div>
  );
}

/**
 * ProGate — wraps content that requires Pro access.
 * Shows an upgrade prompt if not Pro, renders children if Pro.
 *
 * Props:
 *  - feature    : Feature name for display
 *  - children   : Content to render when Pro
 *  - fallback   : Custom fallback (overrides default UpgradeToPro)
 *  - compact    : Use compact UpgradeToPro variant
 */
export default function ProGate({ feature, children, fallback, compact = false }) {
  const { isPro } = usePro();

  if (!isPro) {
    if (fallback) return fallback;
    return (
      <UpgradeToPro
        feature={feature}
        compact={compact}
      />
    );
  }

  return <>{children}</>;
}
