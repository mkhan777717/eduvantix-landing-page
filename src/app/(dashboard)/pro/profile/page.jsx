"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Save, CheckCircle2, Loader2, ArrowRight, ArrowLeft,
  BookOpen, Briefcase, Target, Brain, X, Info
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import { UpgradeToPro } from "@/components/pro/ProGate";

const EDUCATIONS = ["High School", "Bachelor's", "Master's", "PhD", "Bootcamp", "Self-Taught"];
const YEARS = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const EXPERIENCES = ["Student", "Fresher", "Intern", "Entry Level", "Mid Level", "Experienced"];
const INDUSTRIES = ["Software Engineering", "Data Science & AI", "Product Management", "Design", "FinTech", "HealthTech", "EdTech"];
const INTERESTS = ["AI/ML", "Web Development", "Mobile Development", "Cloud & DevOps", "Cybersecurity", "Data Engineering"];
const TIMELINES = ["3 months", "6 months", "1 year", "No fixed timeline"];
const HOURS = ["< 1 hour/day", "1-2 hours/day", "2-3 hours/day", "3-5 hours/day", "5+ hours/day"];

const STEPS = [
  { id: "education", title: "Education", icon: BookOpen },
  { id: "experience", title: "Experience", icon: Briefcase },
  { id: "skills", title: "Skills", icon: Brain },
  { id: "goal", title: "Career Goal", icon: Target },
];

export default function CareerProfilePage() {
  const router = useRouter();
  const { isPro, proProfile, saveProProfile, loadingStatus } = usePro();

  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Parse existing normalized data from API or defaults
  const [form, setForm] = useState({
    educationLevel: proProfile?.education?.educationLevel || "",
    degree: proProfile?.education?.degree || "",
    specialization: proProfile?.education?.specialization || "",
    graduationYear: proProfile?.education?.graduationYear || "",
    experienceLevel: proProfile?.experiences?.[0]?.experienceLevel || "",
    previousRole: proProfile?.experiences?.[0]?.role || "",
    company: proProfile?.experiences?.[0]?.company || "",
    skills: proProfile?.skills?.map(s => s.skill).join(", ") || "",
    targetRole: proProfile?.targetRole || "",
    targetIndustry: proProfile?.targetIndustry || "",
    careerGoal: proProfile?.careerGoal || "",
    careerInterests: proProfile?.careerInterests || [],
    targetTimeline: proProfile?.targetTimeline || "",
    availableHoursStr: proProfile?.preferences?.weeklyGoal || "",
  });

  if (!loadingStatus && !isPro) return <UpgradeToPro />;
  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async (isFinal = false) => {
    setSaving(true);
    setError(null);
    
    const apiData = {
      targetRole: form.targetRole,
      targetIndustry: form.targetIndustry,
      careerGoal: form.careerGoal,
      careerInterests: form.careerInterests,
      targetTimeline: form.targetTimeline,
      education: {
        educationLevel: form.educationLevel,
        degree: form.degree,
        specialization: form.specialization,
        graduationYear: form.graduationYear,
      },
      experience: {
        experienceLevel: form.experienceLevel,
        role: form.previousRole,
        company: form.company,
      },
      preferences: {
        weeklyGoal: form.availableHoursStr
      },
      skills: form.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => ({
          skill: s,
          selfReportedLevel: "Beginner",
        }))
    };

    const result = await saveProProfile(apiData);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (isFinal) {
        router.push("/pro");
      }
    } else {
      setError(result.message || "Failed to save profile.");
    }
    setSaving(false);
  };

  const nextStep = () => {
    handleSave(false);
    setActiveStep(Math.min(STEPS.length - 1, activeStep + 1));
  };
  const prevStep = () => setActiveStep(Math.max(0, activeStep - 1));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* ── Top Back & Header ── */}
      <div>
        <Link
          href="/pro"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-3"
        >
          <ArrowLeft size={13} />
          Back to Overview
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Career Profile
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Structured background intelligence used by the AI Career Engine.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-400">Step {activeStep + 1} of {STEPS.length}</span>
          </div>
        </div>
      </div>

      {/* ── Stepper Navigation ── */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => {
                  handleSave(false);
                  setActiveStep(idx);
                }}
                className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : isCompleted
                    ? "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                    : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={14} /> : <StepIcon size={14} />}
                </div>
                <span className="text-xs truncate hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="cursor-pointer"><X size={14} /></button>
          </div>
        )}

        {/* STEP 0: EDUCATION */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Educational Background
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Specify your current or highest level of formal study.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Education Level
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATIONS.map(ed => (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, educationLevel: ed }))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      form.educationLevel === ed
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    {ed}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Degree / Program
                </label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
                  placeholder="e.g. B.Tech / Bachelor of Science"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Specialization / Major
                </label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Graduation Year
              </label>
              <select
                value={form.graduationYear}
                onChange={e => setForm(p => ({ ...p, graduationYear: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
              >
                <option value="" disabled>Select Graduation Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* STEP 1: EXPERIENCE */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Experience Level
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Helps calibrate interview complexity and project difficulty.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Current Level
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCES.map(ex => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, experienceLevel: ex }))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      form.experienceLevel === ex
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Most Recent Role
                </label>
                <input
                  type="text"
                  value={form.previousRole}
                  onChange={e => setForm(p => ({ ...p, previousRole: e.target.value }))}
                  placeholder="e.g. Frontend Developer / Intern"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  placeholder="e.g. TechCorp / University Lab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SKILLS */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Declared Technical Skills
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                List the languages, frameworks, and databases you are familiar with.
              </p>
            </div>
            
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl flex items-start gap-2.5">
              <Info size={16} className="text-neutral-500 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                These are self-reported skills. When you upload a resume or complete coding assessments, verified skill evidence is merged automatically.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Technical Skills (Comma separated)
              </label>
              <textarea
                value={form.skills}
                onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                placeholder="e.g. TypeScript, React, Node.js, PostgreSQL, Docker, Redis"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        )}

        {/* STEP 3: CAREER GOAL */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Career Target & Goals
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Define where you want to go so your milestone path aligns with real hiring criteria.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Target Role <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                value={form.targetRole}
                onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
                placeholder="e.g. Full-Stack Software Engineer / AI Systems Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Target Industry
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, targetIndustry: ind }))}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      form.targetIndustry === ind
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Target Timeline
                </label>
                <select
                  value={form.targetTimeline}
                  onChange={e => setForm(p => ({ ...p, targetTimeline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                >
                  <option value="" disabled>Select Timeline</option>
                  {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Available Learning Time
                </label>
                <select
                  value={form.availableHoursStr}
                  onChange={e => setForm(p => ({ ...p, availableHoursStr: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-xs sm:text-sm outline-none focus:border-emerald-500 transition-all text-neutral-900 dark:text-neutral-100"
                >
                  <option value="" disabled>Select Time</option>
                  {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Action Buttons Footer ── */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin text-emerald-500" /> : saved ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Save size={14} />}
            <span>{saved ? "Saved" : "Save Draft"}</span>
          </button>

          <div className="flex items-center gap-2.5">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            
            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Complete Profile</span>
                <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

