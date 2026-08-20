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
const EDUCATIONS = ["High School", "Bachelor's", "Master's", "PhD", "Bootcamp", "Self-Taught"];
const YEARS = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const EXPERIENCES = ["None", "< 1 year", "1-2 years", "3-5 years", "5+ years"];

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
    education: proProfile?.education || "",
    degree: proProfile?.degree || "",
    branch: proProfile?.branch || "",
    graduationYear: proProfile?.graduationYear || "",
    experience: proProfile?.experience || "",
    technologies: proProfile?.technologies || "",
    languages: proProfile?.languages || "",
    frameworks: proProfile?.frameworks || "",
    tools: proProfile?.tools || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  if (!loadingStatus && !isPro) return <UpgradeToPro />;
  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--pro-accent-primary)30", borderTopColor: "var(--pro-accent-primary)" }} />
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
          style={{ background: "var(--pro-accent-gradient)" }}
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
      <div className="rounded-2xl border p-6 space-y-8" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>

        {/* Section: Personal & Education */}
        <div className="space-y-6">
          <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>Personal & Education</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Education Level</label>
              <div className="flex flex-wrap gap-2">
                {EDUCATIONS.map(ed => (
                  <button key={ed} onClick={() => setForm(p => ({ ...p, education: p.education === ed ? "" : ed }))} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all" style={{ backgroundColor: form.education === ed ? "var(--accent-glow)" : "var(--bg-hover)", borderColor: form.education === ed ? "var(--pro-accent-primary)" : "var(--border-primary)", color: form.education === ed ? "#a855f7" : "var(--text-secondary)" }}>{ed}</button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Degree / Program</label>
              <input type="text" value={form.degree} onChange={e => setForm(p => ({ ...p, degree: e.target.value }))} placeholder="e.g. B.Tech Computer Science" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Branch</label>
              <input type="text" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} placeholder="e.g. CSE" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Graduation Year</label>
              <select value={form.graduationYear} onChange={e => setForm(p => ({ ...p, graduationYear: e.target.value }))} className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill=%22none%22 height=%2220%22 stroke=%22%23888%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 viewBox=%220 0 24 24%22 width=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[position:right_12px_center]" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"}>
                <option value="" disabled>Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Experience</label>
              <select value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill=%22none%22 height=%2220%22 stroke=%22%23888%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 viewBox=%220 0 24 24%22 width=%2220%22 xmlns=%22http://www.w3.org/2000/svg%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[position:right_12px_center]" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"}>
                <option value="" disabled>Select Experience</option>
                {EXPERIENCES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        <div className="w-full h-px bg-[var(--border-primary)]" />

        {/* Section: Career Goal */}
        <div className="space-y-6">
          <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>Career Goal</h2>

        {/* Target Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Target Role <span style={{ color: "var(--pro-accent-primary)" }}>*</span>
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
            onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"}
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
                  backgroundColor: form.targetIndustry === ind ? "var(--accent-glow)" : "var(--bg-hover)",
                  borderColor: form.targetIndustry === ind ? "var(--pro-accent-primary)" : "var(--border-primary)",
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
                  backgroundColor: form.careerInterests.includes(interest) ? "var(--accent-glow)" : "var(--bg-hover)",
                  borderColor: form.careerInterests.includes(interest) ? "var(--pro-accent-primary)" : "var(--border-primary)",
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
            Career Goal <span style={{ color: "var(--pro-accent-primary)" }}>*</span>
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
            onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"}
            onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
          />
        </div>

        </div>

        <div className="w-full h-px bg-[var(--border-primary)]" />

        {/* Section: Learning Preferences */}
        <div className="space-y-6">
          <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>Learning Preferences</h2>
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
                    backgroundColor: form.targetTimeline === t ? "var(--accent-glow)" : "var(--bg-hover)",
                    borderColor: form.targetTimeline === t ? "var(--pro-accent-primary)" : "var(--border-primary)",
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
              onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
            />
          </div>
        </div>
        </div>
        
        <div className="w-full h-px bg-[var(--border-primary)]" />

        {/* Section: Skills */}
        <div className="space-y-6">
          <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>Skills</h2>
          <p className="text-xs text-[var(--text-muted)] mt-[-1rem]">Enter comma-separated values for your current skills.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Technologies</label>
              <input type="text" value={form.technologies} onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))} placeholder="e.g. AWS, Docker, Kubernetes" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Languages</label>
              <input type="text" value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))} placeholder="e.g. Python, JavaScript, C++" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Frameworks</label>
              <input type="text" value={form.frameworks} onChange={e => setForm(p => ({ ...p, frameworks: e.target.value }))} placeholder="e.g. React, Next.js, Express" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Tools</label>
              <input type="text" value={form.tools} onChange={e => setForm(p => ({ ...p, tools: e.target.value }))} placeholder="e.g. Git, Figma, Jira" className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors" style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} onFocus={e => e.target.style.borderColor = "var(--pro-accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} />
            </div>
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
            style={{ background: "var(--pro-accent-gradient)" }}
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
