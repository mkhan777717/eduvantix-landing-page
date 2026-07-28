"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Loader2, ArrowLeft, Clock, Share2, Ticket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const { token, API_BASE } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchEventDetails();
  }, [params.id, token]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvent(data.data);
      }
      
      // Also fetch user ticket to see if already registered
      const ticketRes = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}/ticket`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ticketData = await ticketRes.json();
      if (ticketData.success && ticketData.data) {
        setRsvpStatus(ticketData.data.status);
      }
    } catch (error) {
      console.error("Failed to fetch event", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setRsvpStatus(data.data.status);
        if (data.data.status === 'GOING') {
          router.push(`/events/${params.id}/ticket`);
        }
      }
    } catch (error) {
      console.error("Failed to RSVP", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelRSVP = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}/rsvp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRsvpStatus(null);
        // Refresh to update spots filled
        fetchEventDetails();
      }
    } catch (error) {
      console.error("Failed to cancel RSVP", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    );
  }

  if (!event) {
    return <div className="p-10 text-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
      {/* Hero Banner */}
      <div className="h-[40vh] md:h-[50vh] relative w-full bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-10">
          <Link href="/events" className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition">
            <ArrowLeft size={16} />
            <span className="text-sm font-semibold">Back to Events</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 text-xs font-bold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-lg">
                  {event.type}
                </span>
                <span className="px-3 py-1 text-xs font-bold bg-green-500/10 text-green-500 rounded-lg flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  {event.status}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-[var(--text-primary)]">
                {event.title}
              </h1>
              
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </motion.div>

            {/* Schedule Section */}
            {event.schedules?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Schedule</h2>
                <div className="space-y-6">
                  {event.schedules.map((schedule, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== event.schedules.length - 1 && (
                        <div className="absolute left-2.5 top-8 bottom-0 w-px bg-[var(--border-primary)]"></div>
                      )}
                      <div className="w-5 h-5 mt-1 rounded-full bg-[var(--accent-primary)]/20 border-4 border-[var(--bg-card)] z-10 flex-shrink-0"></div>
                      <div>
                        <div className="text-sm font-bold text-[var(--accent-primary)] mb-1">
                          {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{schedule.title}</h3>
                        {schedule.description && <p className="text-[var(--text-secondary)] mt-2">{schedule.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-lg sticky top-24"
            >
              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-muted)] mb-1">Date & Time</div>
                    <div className="font-bold text-[var(--text-primary)]">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-muted)] mb-1">Location</div>
                    <div className="font-bold text-[var(--text-primary)]">
                      {event.isOnline ? 'Online Event' : event.venue}
                    </div>
                  </div>
                </div>
              </div>

              {event.maxCapacity && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                    <span>{event._count?.registrations || 0} / {event.maxCapacity} Spots Filled</span>
                    <span>{Math.min(((event._count?.registrations || 0) / event.maxCapacity) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        ((event._count?.registrations || 0) / event.maxCapacity) >= 0.9 ? 'bg-red-500' 
                        : ((event._count?.registrations || 0) / event.maxCapacity) >= 0.75 ? 'bg-orange-500' 
                        : 'bg-[var(--accent-primary)]'
                      }`}
                      style={{ width: `${Math.min(((event._count?.registrations || 0) / event.maxCapacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {rsvpStatus === 'GOING' ? (
                  <motion.div key="going" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.2}} className="space-y-4">
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 text-green-500 rounded-2xl font-bold border border-green-500/20">
                      <CheckCircle2 size={20} />
                      You're registered!
                    </div>
                    <Link 
                      href={`/events/${params.id}/ticket`}
                      className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent-primary)]/25"
                    >
                      <Ticket size={20} />
                      View Ticket
                    </Link>
                    <button onClick={cancelRSVP} disabled={isSubmitting} className="w-full py-3 bg-red-500/10 text-red-500 rounded-2xl font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Cancel Registration
                    </button>
                  </motion.div>
                ) : rsvpStatus === 'WAITLISTED' ? (
                  <motion.div key="waitlisted" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.2}} className="space-y-4">
                    <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl font-bold text-center border border-orange-500/20">
                        You're on the waitlist
                    </div>
                    <button onClick={cancelRSVP} disabled={isSubmitting} className="w-full py-3 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-2xl font-semibold hover:bg-[var(--border-primary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Leave Waitlist
                    </button>
                  </motion.div>
                ) : rsvpStatus === 'INTERESTED' ? (
                  <motion.div key="interested" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.2}} className="space-y-3">
                    <div className="p-4 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl font-bold text-center border border-[var(--accent-primary)]/20">
                      You've marked yourself as interested!
                    </div>
                    <button 
                      onClick={() => handleRSVP('GOING')}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      ) : 'Register Now Instead'}
                    </button>
                    <button onClick={cancelRSVP} disabled={isSubmitting} className="w-full py-3 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-2xl font-semibold hover:bg-[var(--border-primary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      Remove Interest
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="none" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.2}} className="space-y-3">
                    <button 
                      onClick={() => handleRSVP('GOING')}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[var(--accent-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      ) : 'Register for Event'}
                    </button>
                    <button 
                      onClick={() => handleRSVP('INTERESTED')}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-2xl font-semibold hover:bg-[var(--border-primary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                      ) : "I'm Interested"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
