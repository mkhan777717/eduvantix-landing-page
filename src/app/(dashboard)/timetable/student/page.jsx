"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';

export default function StudentTimetable() {
  const { token, API_BASE } = useAuth();
  const { todayClasses, isLoading, fetchTodayClasses } = useTimetableStore();

  useEffect(() => {
    fetchTodayClasses('USER', token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
          </div>
        ) : todayClasses.length === 0 ? (
          <div className="col-span-full h-[300px] rounded-3xl border-2 border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]">
            <div className="bg-[var(--accent-primary)]/10 p-4 rounded-full mb-4">
              <CalendarDays size={32} className="text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Classes Today!</h3>
            <p className="text-[var(--text-secondary)]">Enjoy your day off or catch up on assignments.</p>
          </div>
        ) : (
          todayClasses.map((entry, idx) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-primary)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="p-5 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-hover)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-primary)]">
                  <Clock size={16} /> {entry.startTime} - {entry.endTime}
                </div>
                {/* Visual indicator for ongoing class (mock logic for demo) */}
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]"></div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4">
                  {entry.subject.name}
                </h3>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-hover)] p-3 rounded-xl border border-[var(--border-primary)]">
                    <User size={16} className="text-[var(--text-muted)]" />
                    <span className="font-medium">{entry.faculty.fullName}</span>
                  </div>
                  
                  {entry.classroom && (
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-hover)] p-3 rounded-xl border border-[var(--border-primary)]">
                      <MapPin size={16} className="text-[var(--text-muted)]" />
                      <span className="font-medium">{entry.classroom.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
