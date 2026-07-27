"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Clock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useRouter } from 'next/navigation';

export default function FacultyAttendanceDashboard() {
  const { token, API_BASE } = useAuth();
  const router = useRouter();
  const { todayClasses, isLoading: loadingClasses, fetchTodayClasses } = useTimetableStore();
  const { generateSession, isLoading: generating } = useAttendanceStore();
  const [generatingFor, setGeneratingFor] = useState(null);

  useEffect(() => {
    fetchTodayClasses('FACULTY', token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
  }, []);

  const handleGenerateQR = async (entryId) => {
    setGeneratingFor(entryId);
    try {
      const session = await generateSession(entryId, token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
      if (session && session.id) {
        router.push(`/attendance/faculty/live/${session.id}`);
      }
    } catch (error) {
      console.error("Failed to generate session", error);
      alert(error.message);
    } finally {
      setGeneratingFor(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
          Generate Attendance
        </h1>
        <p className="text-[var(--text-secondary)]">
          Select an ongoing or upcoming class to generate a Live QR code for student check-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingClasses ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
          </div>
        ) : todayClasses.length === 0 ? (
          <div className="col-span-full h-[300px] rounded-3xl border border-[var(--border-primary)] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]">
            <div className="bg-[var(--accent-primary)]/10 p-4 rounded-full mb-4">
              <CheckCircle2 size={32} className="text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Classes Today!</h3>
            <p className="text-[var(--text-secondary)]">You don't have any classes scheduled to take attendance for.</p>
          </div>
        ) : (
          todayClasses.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border-primary)] flex flex-col hover:border-[var(--accent-primary)] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 w-fit px-3 py-1 rounded-full">
                <Clock size={16} /> {entry.startTime} - {entry.endTime}
              </div>
              
              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-1">
                {entry.subject.name}
              </h3>
              <p className="text-[var(--text-secondary)] font-medium mb-6">
                Batch: {entry.timetable.batch.name}
              </p>

              <button
                onClick={() => handleGenerateQR(entry.id)}
                disabled={generating}
                className="mt-auto w-full py-4 bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
              >
                {generatingFor === entry.id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <QrCode size={20} />
                    Generate QR
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
