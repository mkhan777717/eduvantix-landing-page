"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { token, API_BASE } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INSTITUTE',
    venue: '',
    isOnline: false,
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
    bannerUrl: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const ev = data.data;
        const d = new Date(ev.date);
        const st = new Date(ev.startTime);
        const et = new Date(ev.endTime);
        
        setFormData({
          title: ev.title || '',
          description: ev.description || '',
          type: ev.type || 'INSTITUTE',
          venue: ev.venue || '',
          isOnline: ev.isOnline || false,
          date: d.toISOString().split('T')[0],
          startTime: st.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          endTime: et.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          maxCapacity: ev.maxCapacity || '',
          bannerUrl: ev.bannerUrl || ''
        });
      }
    } catch (error) {
      console.error("Failed to fetch event", error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        date: new Date(formData.date).toISOString(),
        startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString()
      };

      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        router.push('/events/organizer');
      } else {
        alert(data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the event.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--bg-primary)]">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/events/organizer" className="p-2 bg-[var(--bg-card)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Edit Event</h1>
          <p className="text-sm text-[var(--text-secondary)]">Update the details of your event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-[2rem] p-8 shadow-sm space-y-8">
        
        {/* Banner Section */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Banner Image URL</label>
          <div className="flex gap-4">
            <input 
              type="url" 
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>
          {formData.bannerUrl && (
            <div className="mt-4 h-40 rounded-xl overflow-hidden border border-[var(--border-primary)]">
              <img src={formData.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Event Title *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Description *</label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Event Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="INSTITUTE">Institute Only</option>
              <option value="GLOBAL">Global</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Max Capacity</label>
            <input 
              type="number" 
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Date *</label>
            <input 
              type="date" 
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Time *</label>
              <input 
                type="time" 
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">End Time *</label>
              <input 
                type="time" 
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3 md:col-span-2 flex items-center gap-4 p-4 border border-[var(--border-primary)] rounded-xl">
            <input 
              type="checkbox" 
              name="isOnline"
              id="isOnline"
              checked={formData.isOnline}
              onChange={handleChange}
              className="w-5 h-5 rounded accent-[var(--accent-primary)]"
            />
            <label htmlFor="isOnline" className="font-bold text-[var(--text-primary)] cursor-pointer">This is an online event</label>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {formData.isOnline ? 'Meeting Link' : 'Venue'} *
            </label>
            <input 
              type="text" 
              name="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              placeholder={formData.isOnline ? "https://meet.google.com/..." : "Main Auditorium"}
              className="w-full bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-primary)] flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent-primary)]/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
}
