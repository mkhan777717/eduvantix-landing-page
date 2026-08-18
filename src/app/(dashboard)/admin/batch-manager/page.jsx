"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Users, Award, GraduationCap, Plus, Trash2, X, Check,
  AlertCircle, ChevronRight, Briefcase, Mail, ShieldAlert, ArrowLeft, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function BatchManagerDashboard() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();

  // Mock global lists of mentors in the institute
  const [instituteMentors, setInstituteMentors] = useState([]);

  // Mock global students roster in the institute database
  const [instituteStudents, setInstituteStudents] = useState([]);

  // Mock Batches Database state
  const [batches, setBatches] = useState([]);

  // View Navigation States: 'list' | 'details'
  const [activeView, setActiveView] = useState("list");
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const selectedBatch = batches.find(b => b.id === selectedBatchId) || null;
  const [activeDetailTab, setActiveDetailTab] = useState("mentors"); // 'mentors' | 'students'
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);

  // Security check: Redirect if not Batch Manager, Admin, or Institute Admin
  useEffect(() => {
    if (user && user.role !== "BATCH_MANAGER" && user.role !== "ADMIN" && user.role !== "INSTITUTE_ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      if (!token) return;
      setLoading(true);

      // Load members
      const membersRes = await fetch(`${API_BASE}/api/institutes/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const membersData = await membersRes.json();
      if (membersData.success && Array.isArray(membersData.members)) {
        const ments = [];
        const studs = [];
        for (const m of membersData.members) {
          const item = { id: m.id, name: m.username, email: m.email };
          if (m.role === 'MENTOR') ments.push(item);
          else if (m.role === 'USER') studs.push(item);
        }
        setInstituteMentors(ments);
        setInstituteStudents(studs);
      }

      // Load assigned batches (conditional endpoint for Inst Admins)
      const isInstAdmin = user?.role === 'INSTITUTE_ADMIN' || user?.role === 'ADMIN';
      const batchesEndpoint = isInstAdmin
        ? `${API_BASE}/api/batches`
        : `${API_BASE}/api/batches/batch-manager/batches`;

      const batchesRes = await fetch(batchesEndpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const batchesData = await batchesRes.json();
      if (batchesData.success && Array.isArray(batchesData.batches)) {
        const formatted = batchesData.batches.map(b => ({
          id: b.id,
          name: b.name,
          managerId: b.managerId,
          mentorIds: b.mentors.map(m => m.id),
          studentIds: b.students.map(s => s.id)
        }));
        setBatches(formatted);
      }
    } catch (err) {
      console.error("Failed to load batch manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [token, user]);

  const handleRemoveMentorFromBatch = async (menId) => {
    if (!selectedBatch) return;
    const mentorName = instituteMentors.find(m => m.id === menId)?.name || "this mentor";
    if (!window.confirm(`Are you sure you want to remove ${mentorName} from the batch ${selectedBatch.name}?`)) {
      return;
    }
    try {
      if (token) {
        await fetch(`${API_BASE}/api/batches/batch-manager/batches/${selectedBatch.id}/mentors/${menId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Failed to remove mentor:", err);
    }
    const updatedMentorIds = selectedBatch.mentorIds.filter(id => id !== menId);
    setBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, mentorIds: updatedMentorIds } : b));
  };

  const handleAddMentorToBatch = async (menId) => {
    if (!selectedBatch) return;
    if (selectedBatch.mentorIds.includes(menId)) return;
    try {
      if (token) {
        await fetch(`${API_BASE}/api/batches/batch-manager/batches/${selectedBatch.id}/mentors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ mentorId: menId })
        });
      }
    } catch (err) {
      console.error("Failed to add mentor:", err);
    }
    const updatedMentorIds = [...selectedBatch.mentorIds, menId];
    setBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, mentorIds: updatedMentorIds } : b));
  };

  const handleRemoveStudentFromBatch = async (stdId) => {
    if (!selectedBatch) return;
    const studentName = instituteStudents.find(s => s.id === stdId)?.name || "this student";
    if (!window.confirm(`Are you sure you want to remove ${studentName} from the batch ${selectedBatch.name}?`)) {
      return;
    }
    try {
      if (token) {
        await fetch(`${API_BASE}/api/batches/batch-manager/batches/${selectedBatch.id}/students/${stdId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
    }
    const updatedStudentIds = selectedBatch.studentIds.filter(id => id !== stdId);
    setBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, studentIds: updatedStudentIds } : b));
  };

  const handleAddStudentToBatch = async (stdId) => {
    if (!selectedBatch) return;
    if (selectedBatch.studentIds.includes(stdId)) return;
    try {
      if (token) {
        await fetch(`${API_BASE}/api/batches/batch-manager/batches/${selectedBatch.id}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ studentId: stdId })
        });
      }
    } catch (err) {
      console.error("Failed to add student:", err);
    }
    const updatedStudentIds = [...selectedBatch.studentIds, stdId];
    setBatches(prev => prev.map(b => b.id === selectedBatch.id ? { ...b, studentIds: updatedStudentIds } : b));
  };

  if (!user || (user.role !== "BATCH_MANAGER" && user.role !== "ADMIN" && user.role !== "INSTITUTE_ADMIN")) {
    return null;
  }

  // Get list of members in active detail tab
  const getActiveRoster = () => {
    if (!selectedBatch) return [];
    if (activeDetailTab === "mentors") {
      return selectedBatch.mentorIds
        .map(mid => instituteMentors.find(m => m.id === mid))
        .filter(Boolean)
        .map(m => ({ ...m, role: "MENTOR" }));
    }
    return selectedBatch.studentIds
      .map(sid => instituteStudents.find(s => s.id === sid))
      .filter(Boolean)
      .map(s => ({ ...s, role: "STUDENT" }));
  };

  const detailsList = getActiveRoster();

  // Get list of mentors not currently assigned to this batch
  const getAvailableMentors = () => {
    if (!selectedBatch) return [];
    return instituteMentors.filter(m => !selectedBatch.mentorIds.includes(m.id));
  };

  const availableMentors = getAvailableMentors();

  // Get list of students not currently assigned to the active batch
  const getAvailableStudents = () => {
    if (!selectedBatch) return [];
    return instituteStudents.filter(std => !selectedBatch.studentIds.includes(std.id));
  };

  const availableStudents = getAvailableStudents();

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12" style={{ color: "var(--text-primary)" }}>
      {activeView === "list" ? (
        <>
          {/* Header section */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
                My Assigned Batches
              </h1>
              <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                Oversee your dedicated student cohorts, monitor class rosters, and coordinate active mentors.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              title="Refresh Batches"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-violet-500" : ""} />
              <span>Refresh</span>
            </button>
          </section>

          {/* Grid view of batches */}
          <div className="flex-1 min-h-0 overflow-y-auto pb-12">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
                <div className="w-8 h-8 rounded-full border-2 border-[var(--text-primary)] border-t-transparent animate-spin" />
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Fetching roster logs...</span>
              </div>
            ) : batches.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border border-[var(--border-primary)] border-dashed" style={{ borderColor: "var(--border-primary)" }}>
                <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
                  <Layers size={24} className="text-violet-500" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold">No assigned cohorts</h3>
                  <p className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>
                    You have no cohorts assigned to manage.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {batches.map((batch) => {
                  return (
                    <div
                      key={batch.id}
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setActiveDetailTab("mentors");
                        setActiveView("details");
                      }}
                      className="rounded-2xl border border-[var(--border-primary)] p-6 space-y-5 transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer flex flex-col justify-between group"
                      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border"
                            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                            Assigned Cohort
                          </span>
                          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>{batch.name}</h3>
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t text-xs font-medium" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                        <div className="flex items-center gap-1.5">
                          <Award size={14} className="text-amber-500" />
                          <span>{batch.mentorIds.length} Mentors</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-emerald-500" />
                          <span>{batch.studentIds.length} Students</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Full Page Management View */
        <div className="flex-1 flex flex-col min-h-0 space-y-6">
          {/* Header section with back link */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveView("list");
                  setSelectedBatchId(null);
                }}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowLeft size={12} />
                <span>Back to batches</span>
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
                Batch: {selectedBatch?.name}
              </h1>
              <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                Manage mentors and coordinate assigned students inside this batch.
              </p>
            </div>

            {/* Dynamic Button depending on Active Tab & Refresh button */}
            <div className="flex items-center gap-3 shrink-0">
              {activeDetailTab === "mentors" ? (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md shrink-0"
                  style={{ background: "var(--accent-primary)" }}
                >
                  <Plus size={14} />
                  <span>Configure Mentors</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAssignStudentOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md shrink-0"
                  style={{ background: "var(--accent-primary)" }}
                >
                  <Plus size={14} />
                  <span>Configure Students</span>
                </button>
              )}

              {/* Refresh Detailed Roster Button */}
              <button
                onClick={loadData}
                title="Refresh Roster"
                className="p-2.5 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] flex items-center justify-center cursor-pointer disabled:opacity-50"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-violet-500" : ""} />
              </button>
            </div>
          </section>

          {/* Info Banner alert box */}
          <div className="flex gap-3 p-4 rounded-xl border border-[var(--border-primary)] text-sm font-medium shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{(user.role === 'INSTITUTE_ADMIN' || user.role === 'ADMIN') ? "Institute Admin" : "Batch Manager"} Permissions:</strong> You can assign/remove existing mentors and students to this specific batch.
            </p>
          </div>

          {/* Roster Tab list */}
          <div className="flex gap-2 p-1.5 rounded-xl w-fit border border-[var(--border-primary)] shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
            <button
              onClick={() => setActiveDetailTab("mentors")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeDetailTab === "mentors"
                ? "bg-[var(--bg-primary)] shadow-sm text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
            >
              <Award size={14} />
              <span>Mentors</span>
            </button>
            <button
              onClick={() => setActiveDetailTab("students")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${activeDetailTab === "students"
                ? "bg-[var(--bg-primary)] shadow-sm text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
            >
              <GraduationCap size={14} />
              <span>Students</span>
            </button>
          </div>

          {/* Roster Table list */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
            {detailsList.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-[var(--bg-secondary)]">
                  <Users size={24} className="text-violet-500" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold">No members assigned</h3>
                  <p className="text-xs max-w-xs" style={{ color: "var(--text-muted)" }}>
                    No assigned profiles matched this role category for this batch.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto min-w-0">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-[var(--bg-secondary)] text-xs font-semibold uppercase tracking-wider select-none" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Role Permission</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium" style={{ divideColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                    {detailsList.map((member) => (
                      <tr key={member.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                        <td className="px-6 py-4 font-semibold">{member.name}</td>
                        <td className="px-6 py-4" style={{ color: "var(--text-secondary)" }}>{member.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[var(--border-primary)] ${member.role === "MENTOR"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                            }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (activeDetailTab === "mentors") {
                                handleRemoveMentorFromBatch(member.id);
                              } else {
                                handleRemoveStudentFromBatch(member.id);
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Mentors Configuration Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b shrink-0 bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[var(--bg-primary)]">
                    <Award size={16} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Assign Batch Mentors
                  </h3>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] transition-colors cursor-pointer text-[var(--text-muted)] border border-[var(--border-primary)] border-transparent hover:border-[var(--border-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Roster Selector List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Available Institute Mentors
                </span>
                {availableMentors.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6 border border-[var(--border-primary)] border-dashed rounded-xl" style={{ borderColor: "var(--border-primary)" }}>
                    All mentors have already been assigned to this batch teaching roster.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableMentors.map((men) => (
                      <div
                        key={men.id}
                        onClick={() => handleAddMentorToBatch(men.id)}
                        className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer group"
                        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                      >
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-sm font-semibold">{men.name}</span>
                          <span className="text-xs text-[var(--text-muted)]">{men.email}</span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border-primary)] uppercase tracking-wider transition-colors group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                          Assign
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t shrink-0 flex justify-end bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-white text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Students Configuration Modal */}
      <AnimatePresence>
        {isAssignStudentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b shrink-0 bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[var(--bg-primary)]">
                    <GraduationCap size={16} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Assign Batch Students
                  </h3>
                </div>
                <button
                  onClick={() => setIsAssignStudentOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--bg-primary)] transition-colors cursor-pointer text-[var(--text-muted)] border border-[var(--border-primary)] border-transparent hover:border-[var(--border-primary)]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Roster Selector List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                <div className="space-y-1">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Add Students to Batch
                  </span>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Select students to enroll them in this cohort roster.
                  </p>
                </div>

                {availableStudents.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-6 border border-[var(--border-primary)] border-dashed rounded-xl" style={{ borderColor: "var(--border-primary)" }}>
                    No unassigned students found. All registered students are already mapping to batches.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableStudents.map((std) => (
                      <div
                        key={std.id}
                        onClick={() => handleAddStudentToBatch(std.id)}
                        className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer group"
                        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                      >
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-sm font-semibold">{std.name}</span>
                          <span className="text-xs text-[var(--text-muted)]">{std.email}</span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border-primary)] uppercase tracking-wider transition-colors group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-primary)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                          Assign
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t shrink-0 flex justify-end bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-primary)" }}>
                <button
                  onClick={() => setIsAssignStudentOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-white text-xs font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
