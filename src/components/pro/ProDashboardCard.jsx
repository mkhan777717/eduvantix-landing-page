"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * ProDashboardCard — Clean, Linear-style card for Pro dashboard sections.
 */
export default function ProDashboardCard({
  title,
  icon: Icon,
  description,
  cta,
  status = "empty",
  children,
  badge,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/40 dark:group-hover:text-emerald-400 group-hover:border-emerald-200/60 dark:group-hover:border-emerald-800/60 transition-colors">
              {Icon && <Icon size={16} strokeWidth={2} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {title}
              </h3>
              {badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60">
                  {badge}
                </span>
              )}
            </div>
          </div>

          {status === "ready" && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>

        {/* Content */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {status === "ready" && children}

        {(status === "empty" || status === "coming_soon") && (
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>

      {cta && status !== "coming_soon" && (
        <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <Link
            href={cta.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group-hover:translate-x-0.5 transition-transform"
          >
            {cta.label}
            <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  );
}

