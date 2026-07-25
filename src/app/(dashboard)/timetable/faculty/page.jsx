"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, CalendarDays, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';
import Link from 'next/link';

export default function FacultyTimetable() {
  const { token, API_BASE } = useAuth();
  const { todayClasses, isLoading, fetchTodayClasses } = useTimetableStore();

  useEffect(() => {
    fetchTodayClasses('FACULTY', token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
  }, []);

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
          My Schedule
        </h1>
        <p className="text-[var(--text-secondary)] font-medium flex items-center gap-2">
          <CalendarDays size={18} className="text-[var(--accent-primary)]" />
          {today.toLocaleDateString(undefined, options)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Today's Classes</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="h-[300px] rounded-3xl border-2 border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]">
              <div className="bg-[var(--accent-primary)]/10 p-4 rounded-full mb-4">
                <CalendarDays size={32} className="text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Classes Today!</h3>
              <p className="text-[var(--text-secondary)]">Enjoy your free time or catch up on grading.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayClasses.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border-primary)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--accent-primary)] transition-colors"
                >
                  <div className="flex gap-6 items-center">
                    <div className="hidden md:flex flex-col items-center justify-center w-24 h-24 bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-primary)] text-center">
                      <span className="text-sm font-bold text-[var(--accent-primary)]">{entry.startTime}</span>
                      <span className="text-xs text-[var(--text-muted)] my-1">to</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{entry.endTime}</span>
                    </div>
                    <div>
                      <div className="md:hidden flex items-center gap-2 mb-2 text-sm font-bold text-[var(--accent-primary)]">
                        <Clock size={16} /> {entry.startTime} - {entry.endTime}
                      </div>
                      <h3 className="text-2xl font-black text-[var(--text-primary)] mb-1">
                        {entry.subject.name}
                      </h3>
                      <p className="text-[var(--text-secondary)] font-medium mb-3">
                        Batch: {entry.timetable.batch.name}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {entry.classroom && (
                          <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] bg-[var(--bg-hover)] px-3 py-1 rounded-lg">
                            <MapPin size={14} /> {entry.classroom.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/attendance/faculty" 
                    className="w-full md:w-auto px-6 py-3 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-all flex items-center justify-center gap-2 group"
                  >
                    Take Attendance
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border-primary)] shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Users size={18} className="text-[var(--accent-primary)]" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link href="/attendance/faculty" className="block w-full p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold transition-all">
                Start Live QR Session
              </Link>
              <button className="w-full text-left p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-semibold transition-all">
                View Weekly Timetable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
