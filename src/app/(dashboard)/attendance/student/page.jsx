"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceStore } from '@/store/useAttendanceStore';

export default function StudentAttendanceDashboard() {
  const { token, API_BASE } = useAuth();
  const { studentHistory, fetchStudentHistory, isLoading } = useAttendanceStore();
  
  useEffect(() => {
    fetchStudentHistory(token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
  }, []);

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            My Attendance
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            View your past class attendance records here.
          </p>
        </div>
      </section>

      <div>
        {/* History Section */}
        <div className="w-full">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-hover)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={20} className="text-[var(--accent-primary)]" />
                Recent History
              </h2>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
                </div>
              ) : studentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] py-20">
                  <Calendar size={48} className="mb-4 opacity-50" />
                  <p>No attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {studentHistory.map((record, idx) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-primary)]"
                    >
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] text-lg">
                          {record.session.timetableEntry.subject.name}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {new Date(record.session.date).toLocaleDateString()} • {record.session.timetableEntry.faculty.fullName}
                        </p>
                      </div>
                      
                      <div className="mt-3 md:mt-0 flex items-center gap-4">
                        <span className="text-sm font-medium text-[var(--text-muted)]">
                          {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="px-3 py-1 rounded-full text-sm font-bold bg-green-500/10 text-green-500 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Present
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
