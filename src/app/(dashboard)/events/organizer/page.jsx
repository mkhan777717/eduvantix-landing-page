"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Calendar, Download, Loader2, MoreVertical, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function OrganizerDashboard() {
  const { token, API_BASE } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventToDelete, setEventToDelete] = useState(null);

  // Attendees modal state
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStatus, setAttendeeStatus] = useState('');
  const [attendeePage, setAttendeePage] = useState(1);
  const [attendeeHasMore, setAttendeeHasMore] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    if(!eventToDelete) return;
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        setEvents(events.filter(e => e.id !== eventToDelete.id));
        setEventToDelete(null);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const fetchAttendees = async (event, pageNum = 1, search = '', status = '', append = false) => {
    if(!append) setLoadingAttendees(true);
    try {
      const queryParams = new URLSearchParams({ page: pageNum, limit: 10 });
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);

      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${event.id}/attendees?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if(append) setAttendees(prev => [...prev, ...data.data]);
        else setAttendees(data.data);
        setAttendeeHasMore(pageNum < data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch attendees", error);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const openAttendees = (event) => {
    setAttendeesModalEvent(event);
    setAttendeeSearch('');
    setAttendeeStatus('');
    setAttendeePage(1);
    setAttendees([]);
    fetchAttendees(event, 1, '', '', false);
  };

  useEffect(() => {
    if(attendeesModalEvent) {
       const timer = setTimeout(() => {
           setAttendeePage(1);
           fetchAttendees(attendeesModalEvent, 1, attendeeSearch, attendeeStatus, false);
       }, 500); // debounce search
       return () => clearTimeout(timer);
    }
  }, [attendeeSearch, attendeeStatus]);

  const loadMoreAttendees = () => {
      const next = attendeePage + 1;
      setAttendeePage(next);
      fetchAttendees(attendeesModalEvent, next, attendeeSearch, attendeeStatus, true);
  };

  const filteredAndSortedEvents = events
    .filter(e => statusFilter === 'ALL' || e.status === statusFilter)
    .sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(a.date) - new Date(b.date);
        return sortOrder === 'asc' ? diff : -diff;
      }
      return 0;
    });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
            Organizer Dashboard
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your events, view registrations, and download attendee lists.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Link 
            href="/events/organizer/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent-primary)]/20"
          >
            <Plus size={18} />
            Create Event
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-[var(--accent-primary)]" size={32}/></div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-hover)]/50 border-b border-[var(--border-primary)]">
                <tr>
                  <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Event Name</th>
                  <th 
                    className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none group"
                    onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
                  >
                    Date <span className="opacity-0 group-hover:opacity-100 transition-opacity">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  </th>
                  <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredAndSortedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-[var(--bg-hover)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{event.title}</div>
                      <div className="text-xs text-[var(--text-secondary)] truncate max-w-[250px]">{event.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${event.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/events/organizer/scanner/${event.id}`} className="p-2 text-[var(--text-secondary)] hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer" title="Scan Tickets">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                        </Link>
                        <button onClick={() => openAttendees(event)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-lg transition-colors cursor-pointer" title="View Attendees">
                          <Users size={18} />
                        </button>
                        <Link href={`/events/organizer/edit/${event.id}`} className="p-2 text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer" title="Edit Event">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => setEventToDelete(event)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      No events created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendees Modal via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {attendeesModalEvent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              >
                <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-hover)]/30">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Attendees</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{attendeesModalEvent.title}</p>
                  </div>
                  <button onClick={() => setAttendeesModalEvent(null)} className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="p-4 border-b border-[var(--border-primary)] flex gap-4 bg-[var(--bg-card)] z-10">
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={attendeeSearch}
                    onChange={e => setAttendeeSearch(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                  <select 
                    value={attendeeStatus} 
                    onChange={e => setAttendeeStatus(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option value="">All Status</option>
                    <option value="GOING">Going</option>
                    <option value="WAITLISTED">Waitlisted</option>
                    <option value="INTERESTED">Interested</option>
                  </select>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  {attendees.length === 0 && !loadingAttendees ? (
                    <div className="text-center py-12 text-[var(--text-secondary)] border-2 border-dashed border-[var(--border-primary)] rounded-3xl">No attendees match your search.</div>
                  ) : (
                    <div className="space-y-4">
                      {attendees.map(attendee => (
                        <div key={attendee.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-hover)]/10 hover:bg-[var(--bg-hover)]/50 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            {attendee.user?.avatarUrl ? (
                               <img src={attendee.user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm border border-[var(--border-primary)]" />
                            ) : (
                               <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center font-bold shadow-sm border border-[var(--accent-primary)]/20">
                                 {attendee.user?.fullName?.charAt(0) || attendee.user?.username?.charAt(0) || 'U'}
                               </div>
                            )}
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">{attendee.user?.fullName || attendee.user?.username || 'Unknown User'}</div>
                              <div className="text-xs text-[var(--text-secondary)]">{attendee.user?.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[var(--border-primary)] sm:border-t-0">
                            {attendee.checkedIn ? (
                               <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-green-500/20 text-green-500 flex items-center gap-1">
                                 Checked In
                               </span>
                            ) : null}
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${attendee.status === 'GOING' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                              {attendee.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {loadingAttendees && (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[var(--accent-primary)]" size={24}/></div>
                      )}
                      
                      {attendeeHasMore && !loadingAttendees && (
                        <div className="flex justify-center mt-6">
                           <button onClick={loadMoreAttendees} className="px-6 py-2 bg-[var(--bg-hover)] rounded-lg text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--border-primary)] transition-colors">
                              Load More
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
          {eventToDelete && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Delete Event?</h3>
                    <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="text-[var(--text-secondary)] mb-6 bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border-primary)] border-dashed">
                  Are you sure you want to delete <span className="font-bold text-[var(--text-primary)]">{eventToDelete.title}</span>?
                </p>
                
                <div className="flex gap-3">
                  <button onClick={() => setEventToDelete(null)} className="flex-1 py-3 bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--border-primary)] transition-colors">
                    Cancel
                  </button>
                  <button onClick={deleteEvent} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25">
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
