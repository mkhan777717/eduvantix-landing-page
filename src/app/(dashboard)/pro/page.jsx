"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles, User, FileText, Brain, Map, Mic, Briefcase, Bot,
  ArrowRight, Target, Clock, TrendingUp, Zap,
  CheckCircle2, Compass, Play, Trophy, Flame, Layers
} from "lucide-react";
import { usePro } from "@/context/ProContext";
import { useAuth } from "@/context/AuthContext";
import { UpgradeToPro } from "@/components/pro/ProGate";
import ProDashboardCard from "@/components/pro/ProDashboardCard";
import { CareerOnboarding, ProfileCompletion } from "@/components/pro/CareerOnboarding";

export default function ProDashboardPage() {
  const { user } = useAuth();
  const { isPro, proStatus, proProfile, loadingStatus } = usePro();
  const router = useRouter();
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    if (isPro) {
      const fetchResume = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:5000/api/pro/resume", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.resumes && data.resumes.length > 0) {
            const active = data.resumes.find(r => r.isActive) || data.resumes[0];
            setResumeData(active);
          }
        } catch (err) {
          console.error("Failed to fetch resume status", err);
        }
      };
      fetchResume();
    }
  }, [isPro]);

  if (!loadingStatus && !isPro) {
    return <UpgradeToPro />;
  }

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* ═══ TOP HERO / WELCOME BAR ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <Sparkles size={13} className="text-emerald-500" />
              Career Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome back{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your personalized AI-driven software career accelerator.
          </p>
        </div>

        {/* Profile Completion Widget */}
        {proStatus && (
          <div className="flex-shrink-0">
            <ProfileCompletion status={proStatus} />
          </div>
        )}
      </div>

      {/* Onboarding Banner if incomplete */}
      {!dismissedOnboarding && proStatus && !proStatus.onboardingComplete && (
        <CareerOnboarding
          status={proStatus}
          onDismiss={() => setDismissedOnboarding(true)}
        />
      )}

      {/* ═══ HERO BENTO: CAREER READINESS & LEARNING PLAN PREVIEW ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Career Readiness Hero (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          {/* Subtle green ambient accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-semibold">
                <TrendingUp size={13} />
                <span>AI Readiness Engine</span>
              </div>
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                Phase 1 Active
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {proStatus?.profileCompleted
                  ? "Your AI Career Plan is Generated"
                  : "Complete your Career Profile to unlock your analysis"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed max-w-xl">
                {proStatus?.profileCompleted
                  ? "Explore your dynamic learning roadmap, practice targeted interview scenarios, and optimize your portfolio."
                  : "Tell us your target role and goals. Our AI will craft a personalized step-by-step milestone path to land your dream job."}
              </p>
            </div>
          </div>

          {/* Bottom Action Row with Unified Gamification Pills */}
          <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 flex-wrap relative z-10">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                <Flame size={13} className="text-amber-500" />
                <span>4 Day Streak</span>
              </div>
              <div className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                <Trophy size={13} className="text-emerald-500" />
                <span>Top 5% Learner</span>
              </div>
            </div>

            <Link
              href={proStatus?.profileCompleted ? "/pro/roadmap" : "/pro/profile"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm"
            >
              {proStatus?.profileCompleted ? "Open Learning Plan" : "Complete Profile"}
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Right: Interactive Roadmap Mini-Widget (5 Cols) */}
        <Link
          href="/pro/roadmap"
          className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <Compass size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Interactive Roadmap
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                2 / 26 Done
              </span>
            </div>

            <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              My Learning Plan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
              Full-Stack Software Architect Track · Active milestone: High-Performance Backend.
            </p>

            {/* Visual Milestone Mini Flow */}
            <div className="mt-4 space-y-2">
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    Modern JavaScript & TypeScript
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  100%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Play size={12} className="text-emerald-600 fill-emerald-600 dark:text-emerald-400 dark:fill-emerald-400" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    High-Performance Backend
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Watching
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Explore full milestone graph</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ═══ 6 PRO SUITE CARDS ═══════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Career Acceleration Suite
          </h2>
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            All Tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. Career Target */}
          <ProDashboardCard
            title="Career Target"
            icon={Target}
            status={proProfile?.targetRole ? "ready" : "empty"}
            description="Set your desired job title and target timeline so our AI can curate matching challenges."
            cta={{ label: "Edit Target Role", href: "/pro/profile" }}
          >
            {proProfile?.targetRole ? (
              <div className="space-y-2">
                <p className="text-[11px] text-neutral-400 font-medium">Active Target</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{proProfile.targetRole}</p>
                {proProfile.targetIndustry && (
                  <p className="text-xs text-neutral-500">{proProfile.targetIndustry}</p>
                )}
                {proProfile.targetTimeline && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Clock size={11} /> {proProfile.targetTimeline} target
                  </div>
                )}
              </div>
            ) : null}
          </ProDashboardCard>

          {/* 2. Resume Intelligence */}
          <ProDashboardCard
            title="Resume Intelligence"
            icon={FileText}
            status={resumeData && resumeData.status === "ANALYZED" ? "ready" : (resumeData ? "loading" : "empty")}
            description={
              resumeData && resumeData.status === "ANALYZED"
                ? "Your resume has been analyzed and optimized for ATS."
                : (resumeData ? "Analyzing your resume... this may take a moment." : "Upload your resume to receive instant ATS scoring, bullet point optimizations, and AI tailoring.")
            }
            cta={{ 
              label: resumeData && resumeData.status === "ANALYZED" ? "View Analysis" : (resumeData ? "View Status" : "Upload & Analyze"), 
              href: "/pro/resume" 
            }}
          >
            {resumeData && resumeData.status === "ANALYZED" && resumeData.analysis ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Overall Score</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{resumeData.analysis.overallScore}/100</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${resumeData.analysis.overallScore}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-neutral-500">ATS Compatibility</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{resumeData.analysis.atsScore}/100</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${resumeData.analysis.atsScore}%` }} />
                </div>
              </div>
            ) : null}
          </ProDashboardCard>

          {/* 3. Skill Gap Analysis */}
          <ProDashboardCard
            title="Skill Gap Radar"
            icon={Brain}
            status="empty"
            description="Benchmark your technical skills against real senior engineer hiring criteria."
            cta={{ label: "View Intelligence", href: "/pro/skills" }}
            badge="Soon"
          />

          {/* 4. AI Mock Interview & Viva */}
          <ProDashboardCard
            title="AI Interview Coach"
            icon={Mic}
            status="ready"
            description="Practice voice and text mock interviews with real-time AI critique and answer scoring."
            cta={{ label: "Start Practice", href: "/pro/viva" }}
          />

          {/* 5. Production Projects */}
          <ProDashboardCard
            title="Capstone Projects"
            icon={Layers}
            status="empty"
            description="Architect and deploy resume-ready production projects evaluated by automated code reviews."
            cta={{ label: "Browse Projects", href: "/pro/projects" }}
            badge="Soon"
          />

          {/* 6. AI Job Matches */}
          <ProDashboardCard
            title="AI Job Matches"
            icon={Briefcase}
            status="empty"
            description="Direct job recommendations matched to your validated skillset and salary expectations."
            cta={{ label: "Explore Roles", href: "/pro/jobs" }}
            badge="Soon"
          />
        </div>
      </div>

      {/* ═══ RECOMMENDED NEXT STEP ═══════════════════════════════════════════ */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Next Priority Step
            </span>
            <h4 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {!proStatus?.profileCompleted
                ? "Complete your Career Profile & Target Goal"
                : "Explore your Interactive Learning Plan"}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {!proStatus?.profileCompleted
                ? "Takes under 2 minutes to personalize your learning path."
                : "24 milestones available in your Full-Stack Architect track."}
            </p>
          </div>
        </div>

        <Link
          href={!proStatus?.profileCompleted ? "/pro/profile" : "/pro/roadmap"}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
        >
          {!proStatus?.profileCompleted ? "Get Started" : "Open Roadmap"}
          <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

