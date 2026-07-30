"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiBase, buildAuthHeaders } from '@/utils/api';
import { Plus, Trash2, Calendar, Target, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDailyChallenges() {
  const { user, token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    question: '',
    date: '',
    points: 10
  });

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/daily-challenges/admin`, {
        headers: buildAuthHeaders(token, user)
      });
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error("Error fetching challenges", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchChallenges();
    }
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/daily-challenges/admin`, {
        method: 'POST',
        headers: buildAuthHeaders(token, user),
        body: JSON.stringify({
          ...formData,
          date: formData.date || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setChallenges([data.challenge, ...challenges]);
        setShowModal(false);
        setFormData({ title: '', question: '', date: '', points: 10 });
      }
    } catch (err) {
      console.error("Error creating challenge", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      const res = await fetch(`${getApiBase()}/api/daily-challenges/admin/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token, user)
      });
      const data = await res.json();
      if (data.success) {
        setChallenges(challenges.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting challenge", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12" style={{ color: "var(--text-primary)" }}>
      {/* Header section */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <Target size={12} className="text-violet-500 animate-pulse" />
            DAILY CHALLENGES
          </div>
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Daily Challenges
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Upload and manage daily challenges for students.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:opacity-90 transition shadow-lg shadow-[var(--accent-glow)] shrink-0"
        >
          <Plus size={18} />
          <span>New Challenge</span>
        </button>
      </section>

      {challenges.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <Target size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Challenges Found</h3>
          <p className="text-[var(--text-secondary)]">Create your first daily challenge to engage students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {challenges.map(challenge => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{challenge.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg">
                      <Target size={12} />
                      {challenge.points} pts
                    </span>
                    <button onClick={() => handleDelete(challenge.id)} className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1 line-clamp-3">
                  {challenge.question}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <Calendar size={14} />
                    {challenge.date ? `Scheduled: ${challenge.date}` : "Unscheduled"}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Created: {new Date(challenge.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-primary)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Daily Challenge</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Challenge Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Reverse a Linked List"
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl outline-none focus:border-[var(--text-muted)] text-[var(--text-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Question Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Describe the challenge..."
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl outline-none focus:border-[var(--text-muted)] text-[var(--text-primary)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl outline-none focus:border-[var(--text-muted)] text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl outline-none focus:border-[var(--text-muted)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Save Challenge</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
