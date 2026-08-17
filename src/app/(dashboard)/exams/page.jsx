"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders, getApiBase } from "@/utils/api";
import { 
  FileText, Plus, Play, Calendar, Lock, AlertCircle, 
  Trash2, Clock, Award, CheckCircle2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamsDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  const isTeacher = user?.role === "ADMIN" || user?.role === "MENTOR" || user?.role === "INSTITUTE_ADMIN";
  const isBatchManager = user?.role === "BATCH_MANAGER";
  const isTeacherOrManager = isTeacher || isBatchManager;
  const isStudent = !isTeacherOrManager;
  const canAccessExams = true;

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isTeacherOrManager ? "all" : "live");

  // Reschedule Modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedExamForReschedule, setSelectedExamForReschedule] = useState(null);
  const [rescheduleStartDate, setRescheduleStartDate] = useState("");
  const [rescheduleEndDate, setRescheduleEndDate] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const API_BASE = getApiBase();

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams`, { headers });
      const json = await res.json();
      if (json.success) {
        setExams(json.data || []);
      } else {
        setError(json.message || "Failed to load exams list");
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading exams dashboard");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token, user]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to soft delete this exam draft?")) return;
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${id}`, {
        method: "DELETE",
        headers
      });
      const json = await res.json();
      if (json.success) {
        fetchExams();
      } else {
        alert(json.message || "Deletion failed");
      }
    } catch (err) {
      alert("Network error deleting exam draft");
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${id}/duplicate`, {
        method: "POST",
        headers
      });
      const json = await res.json();
      if (json.success) {
        alert("Exam duplicated successfully!");
        fetchExams();
      } else {
        alert(json.message || "Duplicate failed");
      }
    } catch (err) {
      alert("Network error duplicating exam");
    }
  };

  const openRescheduleModal = (exam, e) => {
    if (e) e.stopPropagation();
    setSelectedExamForReschedule(exam);
    // Format dates to YYYY-MM-DDTHH:mm format for datetime-local input
    const formatForInput = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return "";
      const pad = (n) => String(n).padStart(2, '0');
      return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    };

    setRescheduleStartDate(formatForInput(exam.startDate));
    setRescheduleEndDate(formatForInput(exam.endDate));
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleStartDate || !rescheduleEndDate) {
      alert("Please specify both start and end dates.");
      return;
    }
    if (new Date(rescheduleStartDate) >= new Date(rescheduleEndDate)) {
      alert("Start date must be earlier than End date.");
      return;
    }

    try {
      setRescheduleLoading(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${selectedExamForReschedule.id}/reschedule`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          startDate: rescheduleStartDate,
          endDate: rescheduleEndDate
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("Exam rescheduled successfully!");
        setRescheduleModalOpen(false);
        fetchExams();
      } else {
        alert(json.message || "Failed to reschedule exam");
      }
    } catch (err) {
      console.error(err);
      alert("Network error rescheduling exam");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const now = new Date();

  const studentTabs = [
    { id: "live", label: "Live Exams" },
    { id: "upcoming", label: "Upcoming Exams" },
    { id: "past", label: "Past Exams" }
  ];

  const teacherTabs = [
    { id: "all", label: "All Drafts & Exams" },
    { id: "draft", label: "Drafts" },
    { id: "published", label: "Published" },
    { id: "archived", label: "Archived" }
  ];

  const tabsToRender = isTeacherOrManager ? teacherTabs : studentTabs;

  const filteredExams = exams.filter(exam => {
    if (isTeacherOrManager) {
      if (activeTab === "all") return true;
      return exam.status?.toLowerCase() === activeTab;
    }

    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    const hasSubmitted = exam.userAttempt && ["SUBMITTED", "AUTO_SUBMITTED", "GRADED", "UNDER_REVIEW"].includes(exam.userAttempt.status);

    if (activeTab === "live") {
      return exam.status === "PUBLISHED" && startDate <= now && now <= endDate && !hasSubmitted;
    }
    if (activeTab === "upcoming") {
      return exam.status === "PUBLISHED" && now < startDate;
    }
    if (activeTab === "past") {
      return now > endDate || hasSubmitted;
    }

    return true;
  });

  if (!loading && !canAccessExams) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-pulse">
          <Lock size={32} />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Institute Portal Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The Examination Portal is exclusively reserved for enrolled Institute students, mentors, and batch managers. Independent accounts do not have access.
          </p>
        </div>
        <button
          onClick={() => router.push("/student/dashboard")}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-6 space-y-8 font-sans">
      {/* Header section */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            {isTeacher ? "Mentor Exam Manager" : isBatchManager ? "Batch Schedule Manager" : "Student Examination Portal"}
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            {isTeacher 
              ? "Configure MCQ, essay, and coding assessments. Grade candidate submissions and publish results."
              : isBatchManager
              ? "Manage and reschedule assessment timelines for your assigned batches. Note: Exam creation is restricted to mentors and admins."
              : "View live assessments, upcoming institute schedules, and historical scorecard reports."}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => router.push("/exams/create")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] text-xs font-semibold cursor-pointer shrink-0"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
          >
            <Plus size={14} />
            <span>Create Exam Draft</span>
          </button>
        )}
      </section>

      {/* Tabs list filtering */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
          {tabsToRender.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-indigo-500/20 font-bold shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-400">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExams.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/20">
          <FileText size={48} className="text-slate-400 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No exams found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mt-2">
            There are currently no exams under the &quot;{activeTab}&quot; tab.
          </p>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30 p-6 backdrop-blur-md transition-all hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl dark:hover:bg-slate-900/50 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-extrabold uppercase tracking-wide border ${
                  exam.status === "PUBLISHED" 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                    : exam.status === "DRAFT"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                }`}>
                  {exam.status}
                </span>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isTeacher && (
                    <>
                      <button
                        onClick={(e) => handleDuplicate(exam.id, e)}
                        title="Duplicate Exam"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/5"
                      >
                        <Award size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(exam.id, e)}
                        title="Delete Exam"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 border border-slate-200 dark:border-white/5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white line-clamp-1 mb-2">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 h-8 leading-relaxed">
                {exam.description || "No description provided."}
              </p>

              <div className="space-y-2 mb-6 border-t border-slate-100 dark:border-white/5 pt-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                  <span>Start: {new Date(exam.startDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400 dark:text-slate-500" />
                  <span>End: {new Date(exam.endDate).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isTeacher ? (
                  <>
                    <button
                      onClick={() => router.push(`/exams/${exam.id}/build`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-2xs font-bold text-slate-700 dark:text-white transition-all"
                    >
                      <FileText size={14} />
                      Builder
                    </button>
                    <button
                      onClick={() => router.push(`/exams/${exam.id}/analytics`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-2xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md"
                    >
                      <Award size={14} />
                      Evaluate
                    </button>
                  </>
                ) : isBatchManager ? (
                  <>
                    <button
                      onClick={(e) => openRescheduleModal(exam, e)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-2xs font-bold text-white hover:bg-amber-500 transition-all shadow-md"
                    >
                      <Calendar size={14} />
                      Reschedule Exam
                    </button>
                    <button
                      onClick={() => router.push(`/exams/${exam.id}/analytics`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-2xs font-bold text-slate-700 dark:text-white transition-all"
                    >
                      <Award size={14} />
                      Analytics
                    </button>
                  </>
                ) : (
                  <>
                    {activeTab === "live" && (
                      exam.userAttempt ? (
                        exam.userAttempt.status === "IN_PROGRESS" ? (
                          <button
                            onClick={() => router.push(`/exams/${exam.id}/attempt/${exam.userAttempt.id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition-all shadow-lg"
                          >
                            <Play size={14} />
                            Resume Attempt
                          </button>
                        ) : exam.userAttempt.resultPublished ? (
                          <button
                            onClick={() => router.push(`/exams/${exam.id}/result/${exam.userAttempt.id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg"
                          >
                            <CheckCircle2 size={14} />
                            View Result & Score
                          </button>
                        ) : (
                          <div className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 select-none">
                            <Clock size={14} />
                            Results Under Review
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => router.push(`/exams/${exam.id}/start`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg"
                        >
                          <Play size={14} />
                          Start Attempt
                        </button>
                      )
                    )}

                    {activeTab === "upcoming" && (
                      <div className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 px-4 py-2.5 text-xs font-semibold text-slate-500 select-none">
                        <Lock size={14} />
                        Starts {new Date(exam.startDate).toLocaleDateString()}
                      </div>
                    )}

                    {activeTab === "past" && (
                      exam.userAttempt?.resultPublished ? (
                        <button
                          onClick={() => router.push(`/exams/${exam.id}/result/${exam.userAttempt.id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg"
                        >
                          <CheckCircle2 size={14} />
                          View Result & Score
                        </button>
                      ) : exam.userAttempt ? (
                        <div className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 select-none">
                          <Clock size={14} />
                          Results Under Review
                        </div>
                      ) : (
                        <div className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 px-4 py-2.5 text-xs font-semibold text-slate-500 select-none">
                          <Lock size={14} />
                          Exam Closed
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reschedule Exam Modal */}
      {rescheduleModalOpen && selectedExamForReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Calendar size={18} />
                <span>Reschedule Assessment</span>
              </div>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedExamForReschedule.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Update the official start and end timeline for this examination.
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleStartDate}
                  onChange={(e) => setRescheduleStartDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleEndDate}
                  onChange={(e) => setRescheduleEndDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
                >
                  {rescheduleLoading ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

