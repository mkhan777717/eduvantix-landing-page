"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Plus, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/store/useToastStore';

export default function AcademicSetupPage() {
  const { token, API_BASE } = useAuth();
  
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' });
  const [classroomForm, setClassroomForm] = useState({ name: '', capacity: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subjRes, classRes] = await Promise.all([
        fetch(`${API_BASE}/api/academic/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/academic/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const subjData = await subjRes.json();
      const classData = await classRes.json();
      
      if (subjData.success) setSubjects(subjData.data || []);
      if (classData.success) setClassrooms(classData.data || []);
    } catch (error) {
      console.error("Failed to fetch academic data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/academic/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(subjectForm)
      });
      const data = await res.json();
      if (data.success) {
        setSubjects([...subjects, data.data]);
        setShowSubjectModal(false);
        setSubjectForm({ name: '', code: '' });
        toast.success("Subject added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to add subject", error);
      toast.error("Failed to add subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddClassroom = async (e) => {
    e.preventDefault();
    if (!classroomForm.name || !classroomForm.capacity) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/academic/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(classroomForm)
      });
      const data = await res.json();
      if (data.success) {
        setClassrooms([...classrooms, data.data]);
        setShowClassroomModal(false);
        setClassroomForm({ name: '', capacity: '' });
        toast.success("Classroom added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to add classroom", error);
      toast.error("Failed to add classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
          Academic Setup
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your institute's subjects and physical classrooms. These will be available when scheduling timetables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Subjects Panel */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-xl">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Subjects</h2>
            </div>
            <button 
              onClick={() => setShowSubjectModal(true)}
              className="p-2 bg-[var(--accent-primary)] text-white font-bold rounded-lg shadow hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="p-4 flex-1 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--accent-primary)]" /></div>
            ) : subjects.length === 0 ? (
              <div className="text-center p-8 text-[var(--text-muted)] text-sm">No subjects added yet.</div>
            ) : (
              <ul className="space-y-2">
                {subjects.map(sub => (
                  <li key={sub.id} className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] flex justify-between items-center hover:border-[var(--accent-primary)] transition-colors">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{sub.name}</p>
                      {sub.code && <p className="text-xs text-[var(--text-secondary)]">Code: {sub.code}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Classrooms Panel */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-hover)]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <MapPin size={20} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Classrooms</h2>
            </div>
            <button 
              onClick={() => setShowClassroomModal(true)}
              className="p-2 bg-emerald-500 text-white font-bold rounded-lg shadow hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="p-4 flex-1 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : classrooms.length === 0 ? (
              <div className="text-center p-8 text-[var(--text-muted)] text-sm">No classrooms added yet.</div>
            ) : (
              <ul className="space-y-2">
                {classrooms.map(room => (
                  <li key={room.id} className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] flex justify-between items-center hover:border-emerald-500 transition-colors">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{room.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Capacity: {room.capacity} students</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Modals using createPortal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSubjectModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--border-primary)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add Subject</h2>
                <button onClick={() => setShowSubjectModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Subject Name</label>
                  <input 
                    type="text" required
                    value={subjectForm.name}
                    onChange={e => setSubjectForm({...subjectForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Subject Code (Optional)</label>
                  <input 
                    type="text"
                    value={subjectForm.code}
                    onChange={e => setSubjectForm({...subjectForm, code: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full mt-4 px-6 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Subject'}
                </button>
              </form>
            </motion.div>
          </div>
          )}
        </AnimatePresence>, 
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showClassroomModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--border-primary)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add Classroom</h2>
                <button onClick={() => setShowClassroomModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddClassroom} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Classroom Name/Number</label>
                  <input 
                    type="text" required
                    value={classroomForm.name}
                    onChange={e => setClassroomForm({...classroomForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Capacity (Students)</label>
                  <input 
                    type="number" required min="1"
                    value={classroomForm.capacity}
                    onChange={e => setClassroomForm({...classroomForm, capacity: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full mt-4 px-6 py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex justify-center items-center">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Classroom'}
                </button>
              </form>
            </motion.div>
          </div>
          )}
        </AnimatePresence>, 
        document.body
      )}

    </div>
  );
}
