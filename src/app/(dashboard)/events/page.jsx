"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Loader2, ArrowRight, SearchX, Clock } from 'lucide-react';
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
    if (!token) return;
    setPage(1);
    fetchEvents(1, false);
  }, [token]);

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
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24 font-sans selection:bg-[var(--accent-primary)] selection:text-white">
      
      {/* Premium Header Area */}
      <div className="relative w-full bg-[var(--bg-card)] border-b border-[var(--border-primary)] pt-12 pb-24 overflow-hidden rounded-b-3xl md:rounded-b-[3rem] shadow-sm">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent-primary)]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)]">
              Events Hub
            </h1>
            <p className="text-lg text-[var(--text-secondary)] font-medium">
              Discover and register for upcoming workshops, hackathons, and global webinars designed to accelerate your growth.
            </p>
          </div>
          
          <div className="flex bg-[var(--bg-primary)]/50 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--border-primary)] shadow-sm">
            {['ALL', 'UPCOMING', 'PAST'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === f
                    ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/25"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] overflow-hidden shadow-xl shadow-black/5 animate-pulse">
                <div className="h-52 bg-[var(--bg-hover)]"></div>
                <div className="p-8 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-6 w-16 bg-[var(--bg-hover)] rounded-lg"></div>
                    <div className="h-6 w-24 bg-[var(--bg-hover)] rounded-lg"></div>
                  </div>
                  <div className="h-8 w-3/4 bg-[var(--bg-hover)] rounded-xl"></div>
                  <div className="h-4 w-full bg-[var(--bg-hover)] rounded"></div>
                  <div className="h-4 w-5/6 bg-[var(--bg-hover)] rounded"></div>
                  <div className="pt-6 mt-auto">
                    <div className="h-12 w-full bg-[var(--bg-hover)] rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl border-dashed shadow-sm">
            <div className="w-20 h-20 bg-[var(--bg-hover)] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[var(--accent-primary)]">
              <Calendar size={40} className="opacity-80" />
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">No Events Scheduled</h3>
            <p className="text-[var(--text-secondary)] font-medium">Check back later for new workshops and hackathons.</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl border-dashed shadow-sm">
            <div className="w-20 h-20 bg-[var(--bg-hover)] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[var(--text-muted)]">
              <SearchX size={40} className="opacity-80" />
            </div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">No Matches Found</h3>
            <p className="text-[var(--text-secondary)] font-medium">There are no {filter.toLowerCase()} events at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 9) * 0.05, duration: 0.5, ease: "easeOut" }}
                  className="group flex flex-col bg-[var(--bg-card)]/70 backdrop-blur-2xl rounded-3xl border border-[var(--border-primary)] overflow-hidden shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative"
                >
                  <div className="h-56 relative overflow-hidden bg-[var(--bg-hover)] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 mix-blend-overlay opacity-80"></div>
                    {event.bannerUrl ? (
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)]/20 to-emerald-500/20 flex items-center justify-center">
                        <Calendar size={48} className="text-[var(--text-muted)] opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 items-end">
                      {event.type && (
                        <span className="px-3 py-1 text-[10px] font-black tracking-wider uppercase bg-[var(--bg-card)]/90 backdrop-blur-md text-[var(--text-primary)] rounded-full shadow-sm border border-[var(--border-primary)]/50">
                          {event.type}
                        </span>
                      )}
                      {event.status && (
                        <span className="px-3 py-1 text-[10px] font-black tracking-wider uppercase bg-[var(--accent-primary)] text-white rounded-full shadow-sm">
                          {event.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-7 pt-6 pb-7 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-transparent to-[var(--bg-card)]">
                    {/* Date badge + title row */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Stacked Date Badge */}
                      <div className="flex flex-col items-center flex-shrink-0 w-12 overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-sm">
                        <div className="w-full py-0.5 bg-[var(--accent-primary)] text-white text-[9px] font-black tracking-widest text-center uppercase">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="py-1.5 text-lg font-black text-[var(--text-primary)] leading-none">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <h3 className="text-xl font-black line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors duration-300 leading-tight pt-0.5">
                        {event.title}
                      </h3>
                    </div>

                    {event.startTime && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] mb-3">
                        <Clock size={11} />
                        <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-[var(--text-secondary)] mb-5 line-clamp-2 font-medium leading-relaxed">
                      {event.description || <span className="italic text-[var(--text-muted)]">No description provided.</span>}
                    </p>
                    
                    <div className="mt-auto mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-[var(--accent-primary)]" />
                        <span className="truncate max-w-[130px]">{event.isOnline ? 'Online' : event.venue}</span>
                      </div>
                      {event.maxCapacity && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-[var(--border-primary)] hidden sm:block"></div>
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-[var(--accent-primary)]" />
                            <span>{event.maxCapacity} seats</span>
                          </div>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-3.5 rounded-2xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-black text-sm hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-10 py-4 bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-primary)] text-[var(--text-primary)] font-black tracking-wide rounded-2xl hover:bg-[var(--bg-hover)] hover:scale-[1.02] transition-all duration-300 shadow-xl flex items-center gap-3"
                >
                  {loadingMore && <Loader2 size={18} className="animate-spin text-[var(--accent-primary)]" />}
                  {loadingMore ? 'Loading More...' : 'Load More Events'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
