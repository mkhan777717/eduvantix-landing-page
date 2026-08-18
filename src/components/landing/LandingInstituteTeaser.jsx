"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ArrowRight, Users, Layers, BarChart3, ShieldCheck } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";

const HIGHLIGHTS = [
  { icon: Users, label: "Student & Mentor Portals" },
  { icon: Layers, label: "Batch & Cohort Management" },
  { icon: BarChart3, label: "Real-Time Analytics" },
  { icon: ShieldCheck, label: "Proctored Assessments" },
];

export default function LandingInstituteTeaser() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";
  const cardBg = isDark ? "#0A0A0A" : "#F7F9FA";

  return (
    <section className="px-6 sm:px-10 py-24" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border p-10 sm:p-14 relative overflow-hidden"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          {/* Subtle background glow */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.06]"
            style={{
              background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
              filter: "blur(60px)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
            {/* Left: text */}
            <div className="flex-1 space-y-5">
              <div>
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#10b981" }}
                >
                  Eduvantix for Institutions
                </span>
                <h2
                  className="mt-3"
                  style={{
                    color: text,
                    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                  }}
                >
                  Bring your entire institute<br />onto one platform.
                </h2>
                <p
                  className="mt-4 max-w-lg"
                  style={{ color: secondary, fontSize: "1rem", lineHeight: 1.7 }}
                >
                  A complete institutional OS — manage students, mentors, batches, live classes, assessments, projects, and career placements from one unified console.
                </p>
              </div>

              {/* Pill highlights */}
              <div className="flex flex-wrap gap-2.5">
                {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold"
                    style={{
                      borderColor: border,
                      color: secondary,
                      backgroundColor: isDark ? "#111111" : "#FFFFFF",
                    }}
                  >
                    <Icon size={13} style={{ color: "#10b981" }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Link
                  href="/institutes"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 8px 30px rgba(16,185,129,0.25)",
                  }}
                >
                  <Building2 size={16} />
                  Explore Eduvantix for Institutions
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right: mini stat grid */}
            <div className="lg:w-[320px] grid grid-cols-2 gap-3 shrink-0">
              {[
                { label: "Roles Supported", value: "4", sub: "Admin, Manager, Mentor, Student" },
                { label: "Modules Integrated", value: "12+", sub: "Courses to Placements" },
                { label: "Analytics Dashboards", value: "Live", sub: "Real-Time Telemetry" },
                { label: "Proctored Tests", value: "Anti-Cheat", sub: "Face + Tab Detection" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 rounded-2xl border"
                  style={{ backgroundColor: isDark ? "#111111" : "#FFFFFF", borderColor: border }}
                >
                  <span
                    className="block"
                    style={{
                      color: "#10b981",
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
                    }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5" style={{ color: text }}>
                    {s.label}
                  </span>
                  <span className="text-[10px] block mt-0.5" style={{ color: secondary }}>
                    {s.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
