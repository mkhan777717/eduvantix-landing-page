"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Save, CheckCircle2, Loader2, Sparkles, ArrowRight
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import { UpgradeToPro } from "@/components/pro/ProGate";

const TIMELINES = ["3 months", "6 months", "1 year", "2 years", "3+ years"];
const INDUSTRIES = [
  "Software Engineering", "Data Science & AI", "Product Management", "Design",
  "Finance & FinTech", "Healthcare & BioTech", "Marketing", "Sales", "Education", "Consulting", "Other"
];
const INTERESTS = [
  "AI/ML", "Web Development", "Mobile Development", "Cloud & DevOps", "Cybersecurity",
  "Data Engineering", "Blockchain", "IoT", "Product", "Research", "Entrepreneurship"
];

export default function CareerProfilePage() {
  const router = useRouter();
  const { isPro, proProfile, proStatus, saveProProfile, loadingStatus } = usePro();

  const [form, setForm] = useState({
    targetRole: proProfile?.targetRole || "",
    targetIndustry: proProfile?.targetIndustry || "",
    careerInterests: proProfile?.careerInterests || [],
    careerGoal: proProfile?.careerGoal || "",
    targetTimeline: proProfile?.targetTimeline || "",
    availableHours: proProfile?.availableHours || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  if (!loadingStatus && !isPro) return <UpgradeToPro />;
  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#a855f730", borderTopColor: "#a855f7" }} />
      </div>
    );
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      careerInterests: prev.careerInterests.includes(interest)
        ? prev.careerInterests.filter(i => i !== interest)
        : [...prev.careerInterests, interest]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await saveProProfile(form);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.message || "Failed to save profile.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <User size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Career Profile
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Help our AI understand your career goals and personalise your experience.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border p-6 space-y-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>

        {/* Target Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Target Role <span style={{ color: "#a855f7" }}>*</span>
          </label>
          <input
            type="text"
            value={form.targetRole}
            onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
            placeholder="e.g. Full Stack Developer, Data Scientist, ML Engineer"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
            style={{
              backgroundColor: "var(--bg-hover)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
            onFocus={e => e.target.style.borderColor = "#a855f7"}
            onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
          />
        </div>

        {/* Target Industry */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Target Industry
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setForm(p => ({ ...p, targetIndustry: p.targetIndustry === ind ? "" : ind }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  backgroundColor: form.targetIndustry === ind ? "rgba(124,58,237,0.15)" : "var(--bg-hover)",
                  borderColor: form.targetIndustry === ind ? "rgba(124,58,237,0.4)" : "var(--border-primary)",
                  color: form.targetIndustry === ind ? "#a855f7" : "var(--text-secondary)",
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Career Interests */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Career Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  backgroundColor: form.careerInterests.includes(interest) ? "rgba(124,58,237,0.15)" : "var(--bg-hover)",
                  borderColor: form.careerInterests.includes(interest) ? "rgba(124,58,237,0.4)" : "var(--border-primary)",
                  color: form.careerInterests.includes(interest) ? "#a855f7" : "var(--text-secondary)",
                }}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Career Goal <span style={{ color: "#a855f7" }}>*</span>
          </label>
          <textarea
            value={form.careerGoal}
            onChange={e => setForm(p => ({ ...p, careerGoal: e.target.value }))}
            placeholder="Describe your career goal in 1-3 sentences. What do you want to achieve and why?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none"
            style={{
              backgroundColor: "var(--bg-hover)",
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
            onFocus={e => e.target.style.borderColor = "#a855f7"}
            onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
          />
        </div>

        {/* Timeline & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Target Timeline
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMELINES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(p => ({ ...p, targetTimeline: p.targetTimeline === t ? "" : t }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    backgroundColor: form.targetTimeline === t ? "rgba(124,58,237,0.15)" : "var(--bg-hover)",
                    borderColor: form.targetTimeline === t ? "rgba(124,58,237,0.4)" : "var(--border-primary)",
                    color: form.targetTimeline === t ? "#a855f7" : "var(--text-secondary)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Available Hours / Week
            </label>
            <input
              type="number"
              value={form.availableHours}
              onChange={e => setForm(p => ({ ...p, availableHours: e.target.value }))}
              placeholder="e.g. 10"
              min={1}
              max={80}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-hover)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
              onFocus={e => e.target.style.borderColor = "#a855f7"}
              onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        {/* Save */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your data is used only to personalise your Pro experience.
          </p>
          <button
            onClick={handleSave}
            disabled={saving || !form.targetRole || !form.careerGoal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
