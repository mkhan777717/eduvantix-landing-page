"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';

export default function AdminTimetableDashboard() {
  const { token, API_BASE } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const { fetchBatchTimetable, batchTimetable, isLoading } = useTimetableStore();

  useEffect(() => {
    // In a real scenario, we would fetch batches first.
    // For demo, we mock fetch
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatch(batchId);
    fetchBatchTimetable(batchId, token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
            Timetable Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage schedules, assign faculty, and oversee batch timetables across the institute.
          </p>
        </div>
        <button 
          onClick={() => alert("This will open a modal to select a Batch and Academic Year to initialize a new timetable.")}
          className="px-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Create Timetable
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Batches */}
        <div className="lg:col-span-1 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-hover)]">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users size={18} className="text-[var(--accent-primary)]" />
              Select Batch
            </h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto max-h-[600px]">
            {batches.map(batch => (
              <button
                key={batch.id}
                onClick={() => handleSelectBatch(batch.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                  selectedBatch === batch.id
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="truncate">{batch.name}</span>
                {selectedBatch === batch.id && <ArrowRight size={16} />}
              </button>
            ))}
            {batches.length === 0 && (
              <div className="p-6 text-center text-[var(--text-muted)] text-sm">
                No batches found.
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Timetable View */}
        <div className="lg:col-span-3">
          {!selectedBatch ? (
            <div className="h-[600px] rounded-3xl border-2 border-dashed border-[var(--border-primary)] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]/50">
              <Calendar size={48} className="text-[var(--text-muted)] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Batch Selected</h3>
              <p className="text-[var(--text-secondary)] max-w-md">
                Select a batch from the sidebar to view, edit, or manage its weekly timetable schedule.
              </p>
            </div>
          ) : isLoading ? (
            <div className="h-[600px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6 animate-pulse flex flex-col">
              <div className="h-8 bg-[var(--bg-hover)] rounded-md w-1/4 mb-8"></div>
              <div className="grid grid-cols-5 gap-4 flex-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-[var(--bg-hover)] rounded-xl h-full"></div>
                ))}
              </div>
            </div>
          ) : batchTimetable ? (
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-hover)]">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {batchTimetable.batch.name} - Weekly Schedule
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Academic Year: {batchTimetable.academicYear}
                  </p>
                </div>
                <button className="p-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                  <Edit2 size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-6 divide-x divide-[var(--border-primary)]">
                  {/* Skip Sunday (0) usually, rendering Monday(1) to Saturday(6) */}
                  {[1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const dayEntries = batchTimetable.entries.filter(e => e.dayOfWeek === dayIdx);
                    return (
                      <div key={dayIdx} className="flex flex-col min-h-[500px]">
                        <div className="p-3 text-center font-bold text-[var(--text-primary)] bg-[var(--bg-hover)]/50 border-b border-[var(--border-primary)] text-sm">
                          {daysOfWeek[dayIdx]}
                        </div>
                        <div className="p-2 space-y-2 flex-1">
                          {dayEntries.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs text-[var(--text-muted)] italic">No classes</span>
                            </div>
                          ) : (
                            dayEntries.map(entry => (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={entry.id}
                                className="bg-[var(--bg-hover)] p-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all cursor-pointer group"
                              >
                                <div className="text-xs font-bold text-[var(--accent-primary)] mb-1 truncate">
                                  {entry.subject.name}
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mb-1">
                                  <Clock size={10} />
                                  {entry.startTime} - {entry.endTime}
                                </div>
                                <div className="text-[10px] text-[var(--text-primary)] truncate">
                                  {entry.faculty.fullName}
                                </div>
                                {entry.classroom && (
                                  <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                    <MapPin size={10} />
                                    {entry.classroom.name}
                                  </div>
                                )}
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Schedule Found</h3>
              <p className="text-[var(--text-secondary)]">
                This batch does not have an active timetable yet.
              </p>
              <button className="mt-6 px-6 py-2 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg">
                Create Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
