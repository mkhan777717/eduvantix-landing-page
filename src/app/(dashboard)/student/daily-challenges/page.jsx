"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Activity, Target, CheckCircle2, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentDailyChallenge() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [hasAttemptedDaily, setHasAttemptedDaily] = useState(false);
  const [dailyAnswer, setDailyAnswer] = useState("");
  const [isSubmittingDaily, setIsSubmittingDaily] = useState(false);
  const [dailyError, setDailyError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
        ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user.role === "ADMIN" ? "ADMIN" : "USER" }),
      };

      try {
        const dailyRes = await fetch(`${API_BASE}/api/daily-challenges/student/today`, { headers });
        if (dailyRes.ok) {
          const dData = await dailyRes.json();
          if (dData.success && dData.challenge) {
            setDailyChallenge(dData.challenge);
            setHasAttemptedDaily(dData.hasAttempted);
            if (dData.attempt) {
              setDailyAnswer(dData.attempt.answer);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily challenge:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, token, API_BASE]);

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    if (!dailyAnswer.trim()) return;
    setIsSubmittingDaily(true);
    setDailyError("");

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch(`${API_BASE}/api/daily-challenges/student/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({ challengeId: dailyChallenge.id, answer: dailyAnswer })
      });
      const data = await res.json();
      if (data.success) {
        setHasAttemptedDaily(true);
      } else {
        setDailyError(data.message || "Failed to submit answer");
      }
    } catch (err) {
      setDailyError("Network error. Please try again.");
    } finally {
      setIsSubmittingDaily(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center space-x-3 text-[var(--text-muted)]">
        <Activity size={20} className="animate-spin" />
        <span className="text-sm font-bold tracking-wider uppercase">Loading Challenge...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <section className="flex flex-col gap-2 border-b pb-6 shrink-0" style={{ borderColor: "var(--border-primary)" }}>
        <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>Question of the Day</h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Solve the daily challenge to earn points and increase your streak!
        </p>
      </section>

      {dailyChallenge ? (
        <div className="p-8 rounded-2xl border relative overflow-hidden shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
            <Target size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Target size={14} />
                Question of the Day
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Award size={16} />
                +{dailyChallenge.points} Points
              </div>
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-4">{dailyChallenge.title}</h2>
            <div className="text-[var(--text-secondary)] text-base mb-8 leading-relaxed whitespace-pre-wrap">
              {dailyChallenge.question}
            </div>
            
            {hasAttemptedDaily ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-500 font-black tracking-tight text-xl">
                  <CheckCircle2 size={24} />
                  Challenge Completed!
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Your Answer</p>
                  <p className="text-base font-medium text-[var(--text-primary)] whitespace-pre-wrap">{dailyAnswer}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDailySubmit} className="space-y-6">
                <textarea
                  required
                  value={dailyAnswer}
                  onChange={(e) => setDailyAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-base font-medium text-[var(--text-primary)] focus:border-[var(--text-muted)] outline-none resize-none min-h-[160px] shadow-inner"
                />
                {dailyError && <p className="text-sm text-rose-500 font-bold px-1">{dailyError}</p>}
                <button
                  type="submit"
                  disabled={isSubmittingDaily}
                  className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all"
                >
                  {isSubmittingDaily ? <Activity size={18} className="animate-spin" /> : "Submit Answer"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 px-4 space-y-4 rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-hover)] border border-[var(--border-primary)] flex items-center justify-center mx-auto text-[var(--text-muted)] mb-2">
            <Target size={28} />
          </div>
          <p className="text-lg font-bold text-[var(--text-primary)]">No Challenge Today</p>
          <p className="text-sm text-[var(--text-secondary)]">Check back tomorrow for a new question!</p>
        </div>
      )}
    </div>
  );
}
