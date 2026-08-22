"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, Clock, Users, Star, Trophy, CheckCircle, Lock, Play,
  Code2, FileQuestion, ClipboardList, FileText, ChevronRight,
  Globe, Building2, ArrowRight, Sparkles, BarChart2, Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { renderMarkdown } from "@/lib/renderMarkdown";

const TYPE_ICONS = { CONCEPT: BookOpen, VIDEO: Play, MCQ: FileQuestion, CODING: Code2, ASSIGNMENT: ClipboardList, TEST: FileText };
const TYPE_LABELS = { CONCEPT: "Read", VIDEO: "Watch", MCQ: "Quiz", CODING: "Code", ASSIGNMENT: "Submit", TEST: "Test" };
const TYPE_COLORS = {
  CONCEPT: "text-blue-400 bg-blue-500/10", VIDEO: "text-rose-400 bg-rose-500/10",
  MCQ: "text-amber-400 bg-amber-500/10", CODING: "text-violet-400 bg-violet-500/10",
  ASSIGNMENT: "text-cyan-400 bg-cyan-500/10", TEST: "text-slate-400 bg-slate-500/10",
};

const DIFF_COLORS = {
  BEGINNER: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  INTERMEDIATE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ADVANCED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function CourseOverviewPage() {
  const router = useRouter();
  const { slug } = useParams();
  const { token, API_BASE, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token && !token.startsWith("demo-") && !token.startsWith("local-") ? { Authorization: `Bearer ${token}` } : {}),
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/learn/courses/${slug}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setIsEnrolled(data.isEnrolled);
        setHasPendingRequest(data.hasPendingRequest);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [slug, API_BASE, token]);

  useEffect(() => { load(); }, [load]);

  const handleEnroll = async () => {
    if (!user) { router.push("/login"); return; }
    setEnrolling(true);
    setEnrollMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/learn/courses/${course.id}/enroll`, {
        method: "POST", headers: { ...authHeaders, Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEnrollMsg(data.message || "Enrolled!");
        await load();
      }
    } catch (e) { setEnrollMsg("Error. Please try again."); }
    setEnrolling(false);
  };

  const navigateToFirstStep = () => {
    if (!course?.chapters?.length) return;
    const firstChapter = course.chapters[0];
    if (!firstChapter.steps?.length) return;
    const firstStep = firstChapter.steps[0];
    router.push(`/learn/course/${slug}/${firstChapter.id}/${firstStep.id}`);
  };

  const navigateToContinue = useCallback(() => {
    if (!course?.chapters?.length) return;

    // 1. If enrollment has a recorded lastStepId, resume exact last-accessed step
    if (enrollment?.lastStepId) {
      for (const ch of course.chapters) {
        const found = ch.steps?.find(s => String(s.id) === String(enrollment.lastStepId));
        if (found) {
          router.push(`/learn/course/${slug}/${ch.id}/${found.id}`);
          return;
        }
      }
    }

    // 2. Otherwise redirect to the first uncompleted step
    for (const ch of course.chapters) {
      for (const step of ch.steps) {
        if (!step.progress?.isCompleted) {
          router.push(`/learn/course/${slug}/${ch.id}/${step.id}`);
          return;
        }
      }
    }
    navigateToFirstStep();
  }, [course, enrollment, slug, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto") === "true" && course && isEnrolled) {
        navigateToContinue();
      }
    }
  }, [course, isEnrolled, navigateToContinue]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <BookOpen size={36} style={{ color: "var(--text-muted)" }} />
        <p className="font-bold" style={{ color: "var(--text-primary)" }}>Course not found</p>
        <button onClick={() => router.push("/learn")} className="text-sm font-semibold cursor-pointer" style={{ color: "var(--text-accent)" }}>← Back to Catalog</button>
      </div>
    );
  }

  const totalSteps = course.chapters.reduce((a, ch) => a + (ch.steps?.length || 0), 0);
  const totalChapters = course.chapters.length;
  const codingSteps = course.chapters.flatMap(ch => ch.steps || []).filter(s => s.type === "CODING").length;
  const mcqSteps = course.chapters.flatMap(ch => ch.steps || []).filter(s => s.type === "MCQ").length;
  const progress = enrollment?.progressPercent || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
        <button onClick={() => router.push("/learn")} className="hover:text-[var(--text-accent)] transition-colors cursor-pointer">Courses</button>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-secondary)" }}>{course.title}</span>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left: Course Info */}
        <div className="space-y-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-5">
            <div className="text-6xl shrink-0">{course.iconUrl && !course.iconUrl.startsWith("http") ? course.iconUrl : "📚"}</div>
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${DIFF_COLORS[course.difficulty]}`}>
                  {course.difficulty}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[var(--border-primary)] flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  {course.category}
                </span>
                {course.isFree ? (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Free</span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10">Paid</span>
                )}
                {course.hasCertificate && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10">
                    <Trophy size={10} /> Certificate
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
              {course.description && (
                <div className="prose-sm leading-relaxed text-sm" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: renderMarkdown(course.description) }} />
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 pb-4 border-b border-[var(--border-primary)]">
            {[
              { icon: Layers, label: "Chapters", value: totalChapters },
              { icon: BookOpen, label: "Steps", value: totalSteps },
              { icon: Clock, label: "Hours", value: course.estimatedHours || "—" },
              { icon: Code2, label: "Problems", value: codingSteps },
              { icon: FileQuestion, label: "Quizzes", value: mcqSteps },
              { icon: Users, label: "Learners", value: course._count?.enrollments || course.learnerCount || 0 },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <s.icon size={14} style={{ color: "var(--text-muted)" }} />
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar (if enrolled) */}
          {isEnrolled && enrollment && (
            <div className="p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>Your Progress</span>
                <span className="font-bold" style={{ color: "var(--text-accent)" }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: "var(--accent-gradient)" }} />
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{enrollment.completedSteps} / {enrollment.totalSteps} steps completed</span>
                {progress === 100 && <span className="text-emerald-400 font-bold flex items-center gap-1"><Trophy size={11} /> Course Complete!</span>}
              </div>
            </div>
          )}

          {/* Chapter list */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Course Content</h2>
            {course.chapters.map((chapter, ci) => (
              <motion.div key={chapter.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}
                className="rounded-2xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-card)]">
                {/* Chapter header */}
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "var(--accent-primary)", color: "white" }}>
                    {ci + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{chapter.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{chapter.steps?.length || 0} steps</p>
                  </div>
                  {/* Chapter completion badge */}
                  {isEnrolled && chapter.steps?.every(s => s.progress?.isCompleted) && chapter.steps?.length > 0 && (
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  )}
                </div>
                {/* Steps */}
                <div className="divide-y divide-[var(--border-primary)]">
                  {chapter.steps?.map((step, si) => {
                    const Icon = TYPE_ICONS[step.type] || BookOpen;
                    const isCompleted = step.progress?.isCompleted;
                    return (
                      <button key={step.id}
                        onClick={() => isEnrolled ? router.push(`/learn/course/${slug}/${chapter.id}/${step.id}`) : undefined}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isEnrolled ? "cursor-pointer hover:bg-[var(--bg-hover)]" : "cursor-default"}`}>
                        <div className={`p-1.5 rounded-lg shrink-0 ${TYPE_COLORS[step.type] || "text-slate-400 bg-slate-500/10"}`}>
                          <Icon size={13} />
                        </div>
                        <span className="flex-1 text-sm font-medium truncate" style={{ color: isCompleted ? "var(--text-muted)" : "var(--text-primary)" }}>
                          {step.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[step.type] || ""}`}>
                            {TYPE_LABELS[step.type] || step.type}
                          </span>
                          {isCompleted ? (
                            <CheckCircle size={14} className="text-emerald-400" />
                          ) : !isEnrolled ? (
                            <Lock size={12} style={{ color: "var(--text-muted)" }} />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: CTA Card */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
            {/* Price */}
            <div className="p-5 border-b border-[var(--border-primary)]">
              {course.isFree ? (
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Free</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>₹{course.offerPrice || course.price}</p>
                  {course.offerPrice > 0 && course.price > course.offerPrice && (
                    <p className="text-sm line-through" style={{ color: "var(--text-muted)" }}>₹{course.price}</p>
                  )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="p-5 space-y-3">
              {enrollMsg && (
                <div className="p-3 rounded-xl text-xs font-medium border border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)]">
                  {enrollMsg}
                </div>
              )}

              {isEnrolled ? (
                <button onClick={navigateToContinue}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                  style={{ background: "var(--accent-gradient)" }}>
                  <Play size={15} /> {progress > 0 ? "Continue Learning" : "Start Learning"}
                </button>
              ) : hasPendingRequest ? (
                <button disabled className="w-full py-3.5 rounded-xl font-bold text-sm border border-amber-500/30 text-amber-400 bg-amber-500/10 flex items-center justify-center gap-2">
                  <Clock size={15} /> Request Pending...
                </button>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
                  style={{ background: "var(--accent-gradient)" }}>
                  {enrolling ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enrolling...</>
                    : course.isFree ? <><Play size={15} /> Start for Free</>
                    : <><ArrowRight size={15} /> Request Access</>}
                </button>
              )}

              {!course.isFree && !isEnrolled && (
                <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                  Our team will contact you after your request is reviewed.
                </p>
              )}

              {/* Included in this course */}
              <div className="space-y-2 pt-2">
                {[
                  { icon: Layers, text: `${totalChapters} chapters, ${totalSteps} steps` },
                  { icon: Code2, text: `${codingSteps} coding problems` },
                  { icon: FileQuestion, text: `${mcqSteps} MCQ quizzes` },
                  ...(course.hasCertificate ? [{ icon: Trophy, text: "Certificate of Completion" }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <item.icon size={13} style={{ color: "var(--text-muted)" }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
