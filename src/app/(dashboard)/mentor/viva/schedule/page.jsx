"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Brain, Plus, Calendar, Clock, BookOpen, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, ArrowLeft, Loader2, Trash2
} from "lucide-react";

export default function ScheduleVivaPage() {
  const { user, token, API_BASE } = useAuth();

  // --- Views ---
  // "list" | "create"
  const [view, setView] = useState("list");

  // --- Lists ---
  const [vivas, setVivas] = useState([]);
  const [vivasLoading, setVivasLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // --- Form State ---
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  
  // --- Filters ---
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjectsList, setSubjectsList] = useState([]);

  // --- UI feedback ---
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  });

  // Fetch scheduled Vivas
  const fetchVivas = async () => {
    try {
      setVivasLoading(true);
      const res = await fetch(`${API_BASE}/api/viva/scheduled`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setVivas(data.data || data.vivas || []);
      } else {
        setError(data.message || "Failed to load Vivas.");
      }
    } catch (err) {
      setError("Network error loading Vivas.");
    } finally {
      setVivasLoading(false);
    }
  };

  // Fetch Questions for selection
  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const res = await fetch(`${API_BASE}/api/viva/questions`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        // Extract unique subjects
        const uniqueSubjects = [...new Set(data.questions.map(q => q.subject))];
        setSubjectsList(uniqueSubjects);
        if (uniqueSubjects.length > 0 && !subject) {
          setSubject(uniqueSubjects[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVivas();
    }
  }, [token]);

  useEffect(() => {
    if (view === "create" && token) {
      fetchQuestions();
    }
  }, [view, token]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !startTime || selectedQuestions.length === 0) {
      setError("Please fill all required fields and select at least one question.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_BASE}/api/viva/schedule`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          subject,
          description,
          startTime,
          endTime: endTime || null,
          questionIds: selectedQuestions
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Viva scheduled successfully!");
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setSelectedQuestions([]);
        fetchVivas();
        setTimeout(() => {
          setView("list");
          setSuccess("");
        }, 1500);
      } else {
        setError(data.message || "Failed to schedule Viva.");
      }
    } catch (err) {
      setError("Network error scheduling Viva.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestionSelection = (id) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const getVivaStatus = (viva) => {
    const now = new Date();
    const start = new Date(viva.startTime);
    const end = viva.endTime ? new Date(viva.endTime) : null;

    if (now < start) return { label: "Upcoming", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" };
    if (end && now > end) return { label: "Ended", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" };
    return { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
          <div>

            <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
              Scheduling & Management
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Create, view, and manage scheduled Viva sessions for your institute.
            </p>
          </div>
          <div>
            {view === "list" ? (
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-[var(--text-on-accent)] shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
                style={{ background: "var(--accent-primary)" }}
              >
                <Plus className="w-4 h-4" /> Schedule New Viva
              </button>
            ) : (
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                <ArrowLeft className="w-4 h-4" /> Back to List
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl text-xs font-semibold flex items-center gap-3 border" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl text-xs font-semibold flex items-center gap-3 border" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)", color: "#10b981" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* --- VIEW: LIST --- */}
        {view === "list" && (
          <div className="space-y-6">
            {vivasLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-primary)" }} />
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Loading scheduled Vivas...</p>
              </div>
            ) : vivas.length === 0 ? (
              <div className="border border-[var(--border-primary)] rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                <Calendar className="w-10 h-10 mx-auto" style={{ color: "var(--text-muted)" }} />
                <h3 className="text-lg font-serif" style={{ color: "var(--text-primary)" }}>No Vivas Scheduled</h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  You haven't scheduled any Vivas yet. Click "Schedule New Viva" to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vivas.map((viva) => {
                  const status = getVivaStatus(viva);
                  return (
                    <div
                      key={viva.id}
                      className="border border-[var(--border-primary)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
                      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                            {viva.subject}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[var(--border-primary)] ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-serif leading-tight transition-colors" style={{ color: "var(--text-primary)" }}>
                            {viva.title}
                          </h3>
                          {viva.description && (
                            <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                              {viva.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2.5 border-t pt-4" style={{ borderColor: "var(--border-primary)" }}>
                          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: "var(--text-primary)" }} />
                            <span>Start: {new Date(viva.startTime).toLocaleString()}</span>
                          </div>
                          {viva.endTime && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                              <Clock className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                              <span>End: {new Date(viva.endTime).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                            <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)" }} />
                            <span>Questions: {viva.questions?.length || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                        <span>By {viva.creator?.username || "Mentor"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: CREATE --- */}
        {view === "create" && (
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6 border border-[var(--border-primary)] rounded-2xl p-6 md:p-8" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
              <h2 className="text-xl font-serif flex items-center gap-2 pb-4 border-b" style={{ color: "var(--text-primary)", borderColor: "var(--border-primary)" }}>
                <Calendar className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                Viva Details
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Viva Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. JavaScript Closures Final Exam"
                    className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--text-primary)]"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Subject *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--text-primary)] cursor-pointer"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <option value="">Select Subject</option>
                      {subjectsList.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>New Subject (Optional)</label>
                    <input
                      type="text"
                      placeholder="Or type a new subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--text-primary)]"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide short instructions for students..."
                    className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none resize-none focus:border-[var(--text-primary)]"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--text-primary)]"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)", colorScheme: "dark" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>End Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--text-primary)]"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)", colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Question Selector Sidebar */}
            <div className="space-y-6 border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col h-[650px]" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
              <div>
                <h2 className="text-lg font-serif flex items-center justify-between pb-4 border-b" style={{ color: "var(--text-primary)", borderColor: "var(--border-primary)" }}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    Question Bank *
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md border" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                    {selectedQuestions.length} Selected
                  </span>
                </h2>
                
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Filter by subject..."
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs transition-colors outline-none focus:border-[var(--text-primary)]"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {questionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--text-muted)" }} />
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <p className="text-center py-10 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>No questions in bank.</p>
                ) : (
                  questions
                    .filter(q => !subjectFilter || q.subject.toLowerCase().includes(subjectFilter.toLowerCase()))
                    .map(q => {
                      const isSelected = selectedQuestions.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionSelection(q.id)}
                          className={`p-3.5 border border-[var(--border-primary)] rounded-xl cursor-pointer transition-colors text-left select-none ${
                            isSelected ? "border-[var(--text-primary)]" : "hover:border-[var(--text-muted)]"
                          }`}
                          style={{
                            backgroundColor: isSelected ? "var(--bg-secondary)" : "var(--bg-primary)",
                            borderColor: isSelected ? "var(--text-primary)" : "var(--border-primary)"
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-primary)] rounded text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                              {q.subject}
                            </span>
                            <span className={`text-[9px] uppercase font-bold ${
                              q.difficulty === "EASY" ? "text-emerald-500" : q.difficulty === "MEDIUM" ? "text-amber-500" : "text-rose-500"
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-xs mt-2 font-medium line-clamp-2" style={{ color: "var(--text-primary)" }}>
                            {q.questionText}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-[var(--text-on-accent)] transition-all hover:scale-101 shadow-md disabled:opacity-50 cursor-pointer"
                  style={{ background: "var(--accent-primary)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Publish Viva
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

    </div>
  );
}
