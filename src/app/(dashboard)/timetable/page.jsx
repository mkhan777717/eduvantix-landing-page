"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, ArrowRight, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Entry form state
  const [entryForm, setEntryForm] = useState({
    dayOfWeek: 1,
    subjectId: '',
    facultyId: '',
    classroomId: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const [editEntryId, setEditEntryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditEntryClick = (entry) => {
    setEditEntryId(entry.id);
    setEntryForm({
      dayOfWeek: entry.dayOfWeek,
      subjectId: entry.subjectId || '',
      facultyId: entry.facultyId || '',
      classroomId: entry.classroomId || '',
      startTime: entry.startTime,
      endTime: entry.endTime
    });
    setShowAddEntryModal(true);
  };

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
      const url = editEntryId 
        ? `${API_BASE}/api/timetables/entry/${editEntryId}`
        : `${API_BASE}/api/timetables/entry`;
      const method = editEntryId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
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
        setEditEntryId(null);
        fetchBatchTimetable(selectedBatch, token, API_BASE);
        // Reset form
        setEntryForm({ ...entryForm, subjectId: '', facultyId: '', classroomId: '' });
        toast.success(editEntryId ? "Class updated successfully" : "Class entry added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to save entry", error);
      toast.error("Failed to save entry");
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, -startingDayOfWeek + i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

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
                    <div className="p-4 md:p-6 border-b border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)]">
                      <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          {activeTimetable.name}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          Academic Year: {activeTimetable.academicYear}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {viewMode === 'month' && (
                          <div className="flex items-center gap-2 mr-auto md:mr-4">
                            <button onClick={handleToday} className="px-3 py-1.5 rounded-lg border border-[var(--border-primary)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">Today</button>
                            <div className="flex items-center">
                              <button onClick={handlePrevMonth} className="p-1.5 rounded-l-lg border border-r-0 border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"><ChevronLeft size={18} /></button>
                              <button onClick={handleNextMonth} className="p-1.5 rounded-r-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"><ChevronRight size={18} /></button>
                            </div>
                            <span className="ml-2 font-bold text-[var(--text-primary)] min-w-[120px]">
                              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex bg-[var(--bg-hover)] rounded-lg p-1 border border-[var(--border-primary)]">
                          <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Week</button>
                          <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Month</button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {viewMode === 'week' ? (
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
                                      <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                        <button 
                                          onClick={() => handleEditEntryClick(entry)}
                                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded-md transition-all bg-[var(--bg-card)] shadow-sm"
                                          title="Edit class"
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteEntry(entry.id)}
                                          className="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition-all bg-[var(--bg-card)] shadow-sm"
                                          title="Delete class"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
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
                      ) : (
                        <div className="min-w-[900px] flex flex-col border-t border-[var(--border-primary)]">
                          {/* Month headers (Sun-Sat) */}
                          <div className="grid grid-cols-7 border-b border-[var(--border-primary)] bg-[var(--bg-hover)]">
                            {daysOfWeek.map(day => (
                              <div key={day} className="p-3 text-center text-sm font-bold text-[var(--text-primary)]">
                                {day.substring(0, 3)}
                              </div>
                            ))}
                          </div>
                          
                          {/* Month Grid */}
                          <div className="grid grid-cols-7 auto-rows-fr bg-[var(--border-primary)] gap-px border-b border-[var(--border-primary)]">
                            {getDaysInMonth(currentDate).map((dayObj, i) => {
                              const dayEntries = activeTimetable.entries.filter(e => e.dayOfWeek === dayObj.date.getDay());
                              return (
                                <div key={i} className={`min-h-[140px] p-2 bg-[var(--bg-card)] flex flex-col group transition-colors ${dayObj.isCurrentMonth ? 'hover:bg-[var(--bg-hover)]' : 'opacity-50 bg-[var(--bg-secondary)]'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                                      dayObj.date.toDateString() === new Date().toDateString() 
                                        ? 'bg-[var(--accent-primary)] text-white' 
                                        : 'text-[var(--text-primary)]'
                                    }`}>
                                      {dayObj.date.getDate()}
                                    </span>
                                    {dayObj.isCurrentMonth && (
                                      <button 
                                        onClick={() => {
                                          setEntryForm({ ...entryForm, dayOfWeek: dayObj.date.getDay() });
                                          setShowAddEntryModal(true);
                                        }}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-primary)] rounded-md text-[var(--accent-primary)] transition-all"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {dayEntries.map(entry => (
                                      <div key={entry.id} className="relative group/entry">
                                        <div className="p-1.5 rounded bg-[var(--bg-hover)] border border-[var(--border-primary)] text-xs cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                                          <div className="font-bold text-[var(--text-primary)] truncate">{entry.subject?.name}</div>
                                          <div className="text-[10px] text-[var(--accent-primary)] mt-0.5">{entry.startTime}</div>
                                        </div>
                                        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover/entry:opacity-100 transition-all z-10">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditEntryClick(entry); }}
                                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all shadow-sm"
                                            title="Edit class"
                                          >
                                            <Edit2 size={10} />
                                          </button>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all shadow-sm"
                                            title="Delete class from template"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{editEntryId ? 'Edit Class' : 'Add Class'} ({daysOfWeek[entryForm.dayOfWeek]})</h2>
                <button onClick={() => { setShowAddEntryModal(false); setEditEntryId(null); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
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
