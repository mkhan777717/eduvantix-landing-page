"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CalendarDays, Search, CheckCircle2, XCircle, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminAttendanceTracker() {
  const { token, API_BASE } = useAuth();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/session/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const q = searchQuery.toLowerCase();
    return (
      session.timetableEntry?.subject?.name?.toLowerCase().includes(q) ||
      session.timetableEntry?.timetable?.batch?.name?.toLowerCase().includes(q) ||
      session.timetableEntry?.faculty?.fullName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      
      {!selectedSession ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
                Attendance Reports
              </h1>
              <p className="text-[var(--text-secondary)]">
                Select a class session to view detailed student attendance rosters.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input 
                type="text" 
                placeholder="Search subject, batch, or faculty..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl text-sm focus:border-[var(--accent-primary)] focus:outline-none text-[var(--text-primary)] transition-all"
              />
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-sm">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)] flex flex-col items-center">
                <FileText size={48} className="mb-4 opacity-50" />
                <p className="font-semibold text-lg">No sessions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--bg-hover)] border-b border-[var(--border-primary)]">
                      <th className="py-4 px-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Subject & Batch</th>
                      <th className="py-4 px-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Faculty</th>
                      <th className="py-4 px-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-center">Attendance</th>
                      <th className="py-4 px-6 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => {
                      const batch = session.timetableEntry?.timetable?.batch;
                      const totalStudents = batch?.students?.length || 0;
                      const presentStudents = session.records?.length || 0;
                      const d = new Date(session.date);

                      return (
                        <tr key={session.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                              <CalendarDays size={16} />
                              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-[var(--text-primary)] mb-0.5">{session.timetableEntry?.subject?.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{batch?.name}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img src={session.timetableEntry?.faculty?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="Faculty" className="w-8 h-8 rounded-full border border-[var(--border-primary)]" />
                              <span className="text-sm font-medium text-[var(--text-secondary)]">{session.timetableEntry?.faculty?.fullName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col items-center gap-1">
                              <div className="text-sm font-bold text-[var(--text-primary)]">
                                {presentStudents} <span className="text-xs font-medium text-[var(--text-muted)]">/ {totalStudents}</span>
                              </div>
                              <div className="w-full h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden max-w-[80px]">
                                <div className="h-full bg-[var(--accent-primary)] rounded-full" style={{ width: `${totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => setSelectedSession(session)}
                              className="text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View Roster
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <button 
            onClick={() => setSelectedSession(null)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Sessions
          </button>

          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[var(--border-primary)] pb-8">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1">
                  {selectedSession.timetableEntry?.subject?.name}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5"><Users size={16}/> {selectedSession.timetableEntry?.timetable?.batch?.name}</span>
                  <span className="text-[var(--border-primary)]">•</span>
                  <span className="flex items-center gap-1.5"><CalendarDays size={16}/> {new Date(selectedSession.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-center">
                  <div className="text-xl font-bold">{selectedSession.records?.length || 0}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">Present</div>
                </div>
                <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-center">
                  <div className="text-xl font-bold">{(selectedSession.timetableEntry?.timetable?.batch?.students?.length || 0) - (selectedSession.records?.length || 0)}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">Absent</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSession.timetableEntry?.timetable?.batch?.students?.map(student => {
                const isPresent = selectedSession.records?.some(r => r.studentId === student.id);
                return (
                  <div key={student.id} className={`flex items-center justify-between p-4 rounded-xl border ${isPresent ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center gap-3">
                      <img src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`} alt={student.fullName} className="w-10 h-10 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)]" />
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm">{student.fullName || student.username}</p>
                        <p className="text-xs text-[var(--text-muted)]">@{student.username}</p>
                      </div>
                    </div>
                    {isPresent ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md">
                        <CheckCircle2 size={14} /> Present
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md">
                        <XCircle size={14} /> Absent
                      </div>
                    )}
                  </div>
                )
              })}
              {(!selectedSession.timetableEntry?.timetable?.batch?.students || selectedSession.timetableEntry.timetable.batch.students.length === 0) && (
                <div className="col-span-full py-8 text-center text-[var(--text-muted)]">
                  No students enrolled in this batch.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
