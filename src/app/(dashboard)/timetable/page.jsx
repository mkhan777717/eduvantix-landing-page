"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, ArrowRight, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTimetableStore } from '@/store/useTimetableStore';
import { toast } from '@/store/useToastStore';

export default function AdminTimetableDashboard() {
  const { token, API_BASE } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  const { fetchBatchTimetable, batchTimetables, isLoading } = useTimetableStore();

  // Form options
  const [formOptions, setFormOptions] = useState({ subjects: [], classrooms: [], faculty: [] });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [timetableName, setTimetableName] = useState('');
  const [activeTimetableId, setActiveTimetableId] = useState(null);
  
  // Entry form state
  const [entryForm, setEntryForm] = useState({
    dayOfWeek: 1,
    subjectId: '',
    facultyId: '',
    classroomId: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchOptions();
  }, []);

  // Refresh options when modal opens to ensure we have the latest subjects/faculty/classrooms
  useEffect(() => {
    if (showAddEntryModal) {
      fetchOptions();
    }
  }, [showAddEntryModal]);

  const fetchBatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/timetables/options?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFormOptions(data.data);
      } else {
        toast.error("Failed to fetch dropdown options: " + data.message);
      }
    } catch (error) {
      console.error("Failed to fetch options", error);
      toast.error("Error fetching dropdown options");
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatch(batchId);
    setActiveTimetableId(null);
    fetchBatchTimetable(batchId, token, API_BASE);
  };

  useEffect(() => {
    if (batchTimetables && batchTimetables.length > 0) {
      if (!activeTimetableId || !batchTimetables.find(t => t.id === activeTimetableId)) {
        setActiveTimetableId(batchTimetables[0].id);
      }
    } else {
      setActiveTimetableId(null);
    }
  }, [batchTimetables]);

  const handleCreateTimetable = async () => {
    if (!selectedBatch) return alert('Select a batch first!');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/timetables/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ batchId: selectedBatch, academicYear, name: timetableName })
      });
      const data = await res.json();
      if (data.success) {
        fetchBatchTimetable(selectedBatch, token, API_BASE);
        setShowCreateModal(false);
        setAcademicYear('');
        setTimetableName('');
        toast.success("Timetable initialized successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to create timetable", error);
      toast.error("Failed to initialize timetable");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEntry = async () => {
    if (!activeTimetableId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/timetables/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          timetableId: activeTimetableId,
          ...entryForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddEntryModal(false);
        fetchBatchTimetable(selectedBatch, token, API_BASE);
        // Reset form
        setEntryForm({ ...entryForm, subjectId: '', facultyId: '', classroomId: '' });
        toast.success("Class entry added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to add entry", error);
      toast.error("Failed to add entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/timetables/entry/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchBatchTimetable(selectedBatch, token, API_BASE);
        toast.success("Class entry deleted successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to delete entry", error);
      toast.error("Failed to delete entry");
    }
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
        {selectedBatch && !isLoading && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Initialize Timetable
          </button>
        )}
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
          ) : batchTimetables && batchTimetables.length > 0 ? (
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[var(--border-primary)] flex gap-2 overflow-x-auto bg-[var(--bg-hover)]">
                {batchTimetables.map(tt => (
                  <button
                    key={tt.id}
                    onClick={() => setActiveTimetableId(tt.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                      activeTimetableId === tt.id 
                        ? 'bg-[var(--accent-primary)] text-white' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tt.name}
                  </button>
                ))}
              </div>
              
              {(() => {
                const activeTimetable = batchTimetables.find(t => t.id === activeTimetableId) || batchTimetables[0];
                return (
                  <>
                    <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-card)]">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          {activeTimetable.name}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          Academic Year: {activeTimetable.academicYear}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[900px] grid grid-cols-6 divide-x divide-[var(--border-primary)]">
                        {[1, 2, 3, 4, 5, 6].map(dayIdx => {
                          const dayEntries = activeTimetable.entries.filter(e => e.dayOfWeek === dayIdx);
                          return (
                            <div key={dayIdx} className="flex flex-col min-h-[500px]">
                              <div className="p-3 text-center font-bold text-[var(--text-primary)] bg-[var(--bg-hover)]/50 border-b border-[var(--border-primary)] text-sm flex justify-between items-center">
                                <span>{daysOfWeek[dayIdx]}</span>
                                <button 
                                  onClick={() => {
                                    setEntryForm({ ...entryForm, dayOfWeek: dayIdx });
                                    setShowAddEntryModal(true);
                                  }}
                                  className="p-1 hover:bg-[var(--bg-primary)] rounded-md text-[var(--accent-primary)] transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <div className="p-2 space-y-2 flex-1">
                                {dayEntries.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-[var(--text-muted)] italic mb-2">No classes</span>
                                  </div>
                                ) : (
                                  dayEntries.map(entry => (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      key={entry.id}
                                      className="bg-[var(--bg-hover)] p-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all group relative"
                                    >
                                      <button 
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-md transition-all"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <div className="text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-1 rounded-md inline-flex items-center gap-1 mb-2">
                                        <Clock size={12} />
                                        {entry.startTime} - {entry.endTime}
                                      </div>
                                      <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1 leading-tight pr-6">
                                        {entry.subject?.name}
                                      </h4>
                                      <div className="space-y-1 mt-2">
                                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                                          <Users size={12} className="opacity-70" />
                                          {entry.faculty?.fullName || entry.faculty?.username}
                                        </p>
                                        {entry.classroom && (
                                          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                                            <MapPin size={12} className="opacity-70" />
                                            {entry.classroom?.name}
                                          </p>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
             <div className="h-[600px] rounded-3xl border border-[var(--border-primary)] flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-card)]">
               <Calendar size={48} className="text-[var(--text-muted)] mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Timetable Initialized</h3>
               <p className="text-[var(--text-secondary)] max-w-md">
                 There is no timetable created for this batch yet. Click "Initialize Timetable" above to get started.
               </p>
             </div>
          )}
        </div>
      </div>

      {/* Initialize Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--border-primary)]"
            >
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Initialize Timetable</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Timetable Name (Label)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Term 1 Schedule, May 2026"
                    value={timetableName}
                    onChange={e => setTimetableName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors mb-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Academic Year</label>
                  <input 
                    type="text" 
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTimetable}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Entry Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddEntryModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-[var(--border-primary)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add Class ({daysOfWeek[entryForm.dayOfWeek]})</h2>
                <button onClick={() => setShowAddEntryModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Start Time</label>
                    <input 
                      type="time" 
                      value={entryForm.startTime}
                      onChange={e => setEntryForm({...entryForm, startTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">End Time</label>
                    <input 
                      type="time" 
                      value={entryForm.endTime}
                      onChange={e => setEntryForm({...entryForm, endTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Subject</label>
                  <select 
                    value={entryForm.subjectId}
                    onChange={e => setEntryForm({...entryForm, subjectId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  >
                    <option value="">Select Subject</option>
                    {formOptions.subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Faculty</label>
                  <select 
                    value={entryForm.facultyId}
                    onChange={e => setEntryForm({...entryForm, facultyId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  >
                    <option value="">Select Faculty</option>
                    {formOptions.faculty.map(f => <option key={f.id} value={f.id}>{f.fullName || f.username || 'Unnamed Faculty'}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Classroom (Optional)</label>
                  <select 
                    value={entryForm.classroomId}
                    onChange={e => setEntryForm({...entryForm, classroomId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  >
                    <option value="">Select Classroom</option>
                    {formOptions.classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleAddEntry}
                disabled={isSubmitting || !entryForm.subjectId || !entryForm.facultyId}
                className="w-full px-6 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Class Entry'}
              </button>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
