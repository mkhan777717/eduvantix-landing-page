"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, CalendarDays, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function StudentTimetable() {
  const { token, API_BASE } = useAuth();
  const { todayClasses, isLoading, fetchTodayClasses } = useTimetableStore();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    fetchTodayClasses('USER', token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '', selectedDay);
  }, [selectedDay]);

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <CalendarDays size={12} className="text-violet-500 animate-pulse" />
            CLASS TIMETABLE
          </div>
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            My Schedule
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            View your daily classes, upcoming assignments, and schedule overview.
          </p>
        </div>
      </section>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--border-primary)] pb-4">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              selectedDay === day.value 
                ? 'bg-[var(--accent-primary)] text-white shadow-md' 
                : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)]'
            }`}
          >
            {day.label}
          </button>
        ))}
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
                    <span className="font-medium">
                      {entry.faculty?.fullName || entry.faculty?.username || 'Unknown Faculty'}
                    </span>
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
