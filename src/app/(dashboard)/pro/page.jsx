"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, User, FileText, Brain, Map, Mic, Briefcase, Bot,
  ArrowRight, ChevronRight, Target, Clock, TrendingUp, Zap
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import { useAuth } from "@/context/AuthContext";
import ProGate, { UpgradeToPro } from "@/components/pro/ProGate";
import ProDashboardCard from "@/components/pro/ProDashboardCard";
import { CareerOnboarding, ProfileCompletion } from "@/components/pro/CareerOnboarding";

export default function ProDashboardPage() {
  const { user } = useAuth();
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
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--pro-accent-primary)30", borderTopColor: "var(--pro-accent-primary)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight mt-2" style={{ color: "var(--pro-text-primary)" }}>
            Good morning{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Your personalized career journey starts here.
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
        className="rounded-2xl border p-8 pro-glass-card overflow-hidden relative"
        style={{ borderColor: "var(--pro-border-subtle)" }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle at top right, var(--pro-accent-glow), transparent 60%)" }} />
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: "var(--pro-accent-primary)" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--pro-accent-primary)" }}>
                Career Readiness
              </span>
            </div>
            <h2 className="text-2xl font-display font-medium relative z-10" style={{ color: "var(--pro-text-primary)" }}>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:scale-[1.02] relative z-10 shadow-lg"
            style={{ background: "var(--pro-accent-gradient)", boxShadow: "0 10px 25px var(--accent-glow)" }}
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
          accentColor="var(--pro-accent-primary)"
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
                  <Clock size={11} style={{ color: "var(--pro-accent-primary)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {proProfile.targetTimeline}
                  </span>
                </div>
              )}
              <Link href="/pro/profile" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--pro-accent-primary)" }}>
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
        className="rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 pro-glass-card"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--pro-accent-gradient)" }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--pro-accent-primary)" }}>
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:scale-[1.02] shadow-md"
          style={{ background: "var(--pro-accent-gradient)", boxShadow: "0 4px 14px var(--accent-glow)" }}
        >
          Start <ArrowRight size={12} />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t" style={{ borderColor: "var(--border-primary)" }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/pro/profile" className="px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            Complete Profile
          </Link>
          <Link href="/pro/resume" className="px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            Upload Resume
          </Link>
          <Link href="/pro/roadmap" className="px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            Explore Career Paths
          </Link>
          <Link href="/pro/interview" className="px-4 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            AI Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
