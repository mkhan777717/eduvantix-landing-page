"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, User, FileText, Brain, Map, Mic, Briefcase, Bot,
  ArrowRight, ChevronRight, Target, Clock, TrendingUp, Zap
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import ProGate, { UpgradeToPro } from "@/components/pro/ProGate";
import ProDashboardCard from "@/components/pro/ProDashboardCard";
import { CareerOnboarding, ProfileCompletion } from "@/components/pro/CareerOnboarding";

export default function ProDashboardPage() {
  const { isPro, proStatus, proProfile, loadingStatus, mode } = usePro();
  const router = useRouter();
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  // Redirect to upgrade if not Pro
  if (!loadingStatus && !isPro) {
    return <UpgradeToPro />;
  }

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#a855f730", borderTopColor: "#a855f7" }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#a855f7" }}>
              Career Mode
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Career Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Your personalised AI-powered career intelligence hub
          </p>
        </div>

        {/* Profile completion widget */}
        {proStatus && <ProfileCompletion status={proStatus} />}
      </div>

      {/* Onboarding banner */}
      {!dismissedOnboarding && proStatus && !proStatus.onboardingComplete && (
        <CareerOnboarding
          status={proStatus}
          onDismiss={() => setDismissedOnboarding(true)}
        />
      )}

      {/* Career Readiness Hero Card */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(168,85,247,0.06) 50%, rgba(236,72,153,0.04) 100%)",
          borderColor: "rgba(124,58,237,0.2)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: "#a855f7" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#a855f7" }}>
                Career Readiness
              </span>
            </div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {proStatus?.profileCompleted
                ? "Your career analysis is ready to begin"
                : "Complete your career profile to unlock your personalised analysis"}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {proStatus?.profileCompleted
                ? "Resume upload is the next step to generate your full AI career readiness score."
                : "Tell us about your target role, interests, and career goals so our AI can personalise your experience."}
            </p>
          </div>
          <Link
            href={proStatus?.profileCompleted ? "/pro/resume" : "/pro/profile"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            {proStatus?.profileCompleted ? "Upload Resume" : "Complete Career Profile"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Dashboard card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Career Target */}
        <ProDashboardCard
          title="Career Target"
          icon={Target}
          status={proProfile?.targetRole ? "ready" : "empty"}
          description="No career target selected yet. Complete your career profile to set your target role and industry."
          cta={{ label: "Set Career Target", href: "/pro/profile" }}
          accentColor="#7c3aed"
        >
          {proProfile?.targetRole && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Target Role</p>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{proProfile.targetRole}</p>
              {proProfile.targetIndustry && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{proProfile.targetIndustry}</p>
              )}
              {proProfile.targetTimeline && (
                <div className="flex items-center gap-1.5">
                  <Clock size={11} style={{ color: "#a855f7" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {proProfile.targetTimeline}
                  </span>
                </div>
              )}
              <Link href="/pro/profile" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "#a855f7" }}>
                Edit Profile <ChevronRight size={11} />
              </Link>
            </div>
          )}
        </ProDashboardCard>

        {/* Resume */}
        <ProDashboardCard
          title="Resume"
          icon={FileText}
          status="empty"
          description="Upload your resume to begin your AI career analysis and get personalised feedback."
          cta={{ label: "Upload Resume", href: "/pro/resume" }}
          accentColor="#ec4899"
        />

        {/* Skill Intelligence */}
        <ProDashboardCard
          title="Skill Intelligence"
          icon={Brain}
          status="coming_soon"
          description="Complete your profile and assessments to generate your personalised skill profile."
          accentColor="#06b6d4"
        />

        {/* Personalized Roadmap */}
        <ProDashboardCard
          title="Personalized Roadmap"
          icon={Map}
          status="coming_soon"
          description="Your AI roadmap will appear here after career analysis is complete."
          accentColor="#10b981"
        />

        {/* AI Interview */}
        <ProDashboardCard
          title="AI Interview Prep"
          icon={Mic}
          status="coming_soon"
          description="Practice with AI-powered mock interviews tailored to your target role."
          accentColor="#f59e0b"
        />

        {/* Job Matches */}
        <ProDashboardCard
          title="Job Matches"
          icon={Briefcase}
          status="coming_soon"
          description="AI-curated job opportunities matching your skills, experience, and career goals."
          accentColor="#ef4444"
        />

      </div>

      {/* Recommended Next Step */}
      <div
        className="rounded-2xl border px-5 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#a855f7" }}>
              Recommended Next Step
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {!proStatus?.profileCompleted
                ? "Complete your Career Profile"
                : !proStatus?.resumeUploaded
                ? "Upload your Resume"
                : !proStatus?.careerGoalSelected
                ? "Select your Career Goal"
                : "Run your AI Career Analysis"}
            </p>
          </div>
        </div>
        <Link
          href={
            !proStatus?.profileCompleted ? "/pro/profile" :
            !proStatus?.resumeUploaded ? "/pro/resume" :
            "/pro/profile"
          }
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          Start <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
