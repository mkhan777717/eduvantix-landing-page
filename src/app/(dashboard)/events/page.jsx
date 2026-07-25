"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function EventsDashboard() {
  const { token, API_BASE } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, PAST
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchEvents(1, false);
  }, []);

  const fetchEvents = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events?page=${pageNum}&limit=9`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        if (append) {
          setEvents(prev => [...prev, ...data.data]);
        } else {
          setEvents(data.data);
        }
        setHasMore(pageNum < data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'UPCOMING') return new Date(event.date) >= new Date();
    if (filter === 'PAST') return new Date(event.date) < new Date();
    return true;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            Events Hub
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Discover and register for upcoming workshops, hackathons, and global webinars.
          </p>
        </div>
        
        <div className="flex bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-primary)] shadow-sm">
          {['ALL', 'UPCOMING', 'PAST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f
                  ? "bg-[var(--accent-primary)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] overflow-hidden animate-pulse">
              <div className="h-48 bg-[var(--bg-hover)]"></div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-[var(--bg-hover)] rounded-md"></div>
                  <div className="h-6 w-20 bg-[var(--bg-hover)] rounded-md"></div>
                </div>
                <div className="h-6 w-3/4 bg-[var(--bg-hover)] rounded"></div>
                <div className="h-4 w-full bg-[var(--bg-hover)] rounded"></div>
                <div className="h-4 w-5/6 bg-[var(--bg-hover)] rounded"></div>
                <div className="pt-4 mt-auto">
                  <div className="h-10 w-full bg-[var(--bg-hover)] rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl border-dashed">
          <Calendar size={48} className="text-[var(--text-muted)] mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Events Scheduled</h3>
          <p className="text-sm text-[var(--text-secondary)]">Check back later for new workshops and hackathons.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl border-dashed">
          <Calendar size={48} className="text-[var(--text-muted)] mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Matches Found</h3>
          <p className="text-sm text-[var(--text-secondary)]">There are no {filter.toLowerCase()} events at the moment.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 9) * 0.05 }}
                className="group flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 relative overflow-hidden bg-[var(--bg-hover)] flex items-center justify-center">
                  {event.bannerUrl ? (
                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--bg-hover)] to-[var(--border-primary)] flex items-center justify-center">
                      <Calendar size={48} className="text-[var(--text-muted)] opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold bg-[var(--bg-primary)]/90 text-[var(--text-primary)] rounded-lg backdrop-blur shadow-sm">
                      {event.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-md">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="mt-auto space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <MapPin size={16} />
                      <span className="truncate">{event.isOnline ? 'Online Event' : event.venue}</span>
                    </div>
                    {event.maxCapacity && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Users size={16} />
                        <span>Capacity: {event.maxCapacity}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/events/${event.id}`}
                    className="w-full py-3 rounded-xl bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--accent-primary)] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
              >
                {loadingMore && <Loader2 size={16} className="animate-spin" />}
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
