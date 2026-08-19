"use client";
import Link from "next/link";
import { Video, ArrowRight } from "lucide-react";
import { usePro } from "@/context/ProContext";
import { UpgradeToPro } from "@/components/pro/ProGate";

export default function ProVivaPage() {
  const { isPro } = usePro();
  if (!isPro) return <UpgradeToPro feature="AI Viva Pro" />;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
          <Video size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>AI Viva</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your existing AI Viva sessions in Career Mode</p>
        </div>
      </div>
      <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          AI Viva is available through your institute or as a standalone feature. Access your existing viva sessions below.
        </p>
        <Link
          href="/student/viva"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          Go to AI Viva <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
