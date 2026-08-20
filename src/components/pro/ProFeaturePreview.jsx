import React from "react";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

export default function ProFeaturePreview({
  icon: Icon,
  title,
  description,
  status = "coming_soon",
  ctaLabel,
  ctaHref,
  requirement,
  accentColor = "#a855f7"
}) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div 
          className="w-16 h-16 rounded-md border flex items-center justify-center mb-2"
          style={{ 
            borderColor: "var(--pro-border-subtle)"
          }}
        >
          {Icon ? <Icon size={28} style={{ color: "var(--pro-text-primary)" }} /> : <Sparkles size={28} style={{ color: "var(--pro-text-primary)" }} />}
        </div>

        <div className="space-y-3 max-w-md">

          
          <h1 className="text-3xl font-display font-medium tracking-tight" style={{ color: "var(--pro-text-primary)" }}>
            {title}
          </h1>
          
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        </div>

        {requirement && (
          <div className="mt-4 p-4 rounded-xl border max-w-sm w-full text-left flex items-start gap-3 pro-glass-card">
            <div className="w-8 h-8 rounded-md border flex items-center justify-center shrink-0" style={{ borderColor: "var(--pro-border-subtle)", color: "var(--pro-accent-primary)" }}>
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Requirement</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{requirement}</p>
            </div>
          </div>
        )}

        {ctaLabel && ctaHref && (
          <div className="pt-4">
            <Link 
              href={ctaHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
            >
              {ctaLabel} <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
