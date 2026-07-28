"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Loader2, ArrowLeft, Clock, Ticket,
  CheckCircle2, XCircle, AlertCircle, BookOpen, ExternalLink,
  Building2, User, Star, Ban, WifiOff, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// ── Date Badge Component ──────────────────────────────────────────────────────
function DateBadge({ dateStr, className = '' }) {
  const d = new Date(dateStr);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return (
    <div className={`flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl shadow-sm flex-shrink-0 overflow-hidden ${className}`}>
      <div className="w-full py-1 bg-[var(--accent-primary)] text-white text-[10px] font-black tracking-widest text-center uppercase">
        {month}
      </div>
      <div className="py-2 px-3 text-2xl font-black text-[var(--text-primary)] leading-none">
        {day}
      </div>
    </div>
  );
}

// ── Registration Status Card ──────────────────────────────────────────────────
function RegistrationStatusCard({ event, rsvpStatus }) {
  const registrations = event._count?.registrations || 0;
  const capacity = event.maxCapacity;
  const isFull = capacity && registrations >= capacity;
  const isPast = event.date ? new Date(event.date) < new Date() : false;
  const fillPct = capacity ? Math.min((registrations / capacity) * 100, 100) : 0;

  let icon, headline, subline, barColor, badgeBg, badgeText;

  if (rsvpStatus === 'GOING') {
    icon = <CheckCircle2 size={20} />;
    headline = 'You\'re Registered';
    subline = 'You have a confirmed spot at this event.';
    badgeBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    badgeText = 'Confirmed';
  } else if (isPast) {
    icon = <XCircle size={20} />;
    headline = 'Registration Closed';
    subline = 'This event has already taken place.';
    badgeBg = 'bg-[var(--bg-hover)] border-[var(--border-primary)] text-[var(--text-muted)]';
    badgeText = 'Past Event';
  } else if (isFull) {
    icon = <Ban size={20} />;
    headline = 'Event is Full';
    subline = 'All spots have been claimed. You may still express interest.';
    badgeBg = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
    badgeText = 'Full';
  } else {
    icon = <Star size={20} />;
    headline = 'Registration Open';
    subline = capacity
      ? `${capacity - registrations} spot${capacity - registrations !== 1 ? 's' : ''} remaining — secure yours now.`
      : 'Register to attend this event.';
    badgeBg = 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 text-[var(--accent-primary)]';
    badgeText = 'Open';
  }

  if (fillPct >= 90) barColor = 'bg-gradient-to-r from-red-500 to-rose-500';
  else if (fillPct >= 70) barColor = 'bg-gradient-to-r from-orange-400 to-amber-500';
  else barColor = 'bg-gradient-to-r from-emerald-400 to-[var(--accent-primary)]';

  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-hover)] overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-[var(--border-primary)]">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Registration</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${badgeBg}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="font-black text-[var(--text-primary)] text-base leading-snug">{headline}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{subline}</div>
          </div>
        </div>
        {capacity && !isPast && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-1.5">
              <span>{registrations} registered</span>
              <span>{capacity} total</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
      if (data.success) setEvent(data.data);

      const ticketRes = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}/ticket`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ticketData = await ticketRes.json();
      if (ticketData.success && ticketData.data) setRsvpStatus(ticketData.data.status);
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setRsvpStatus(data.data.status);
        if (data.data.status === 'GOING') router.push(`/events/${params.id}/ticket`);
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { setRsvpStatus(null); fetchEventDetails(); }
    } catch (error) {
      console.error("Failed to cancel RSVP", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFull = event?.maxCapacity && (event._count?.registrations || 0) >= event.maxCapacity;
  const isPast = event?.date ? new Date(event.date) < new Date() : false;

  const mapsUrl = event && !event.isOnline && event.venue
    ? `https://maps.google.com/?q=${encodeURIComponent(event.venue)}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4 p-10">
        <XCircle size={48} className="text-[var(--text-muted)]" />
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Event Not Found</h2>
        <Link href="/events" className="text-[var(--accent-primary)] font-bold hover:underline">← Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24 font-sans selection:bg-[var(--accent-primary)] selection:text-white">

      {/* ── Hero Banner ── */}
      <div className="h-[40vh] md:h-[52vh] relative w-full overflow-hidden rounded-b-3xl md:rounded-b-[3rem] shadow-sm">
        {event.bannerUrl ? (
          <>
            <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-black/20" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[var(--bg-card)]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)]/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] translate-y-1/3 -translate-x-1/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
          </>
        )}
        {/* Back button */}
        <div className="absolute top-8 left-6 md:left-10 z-30">
          <Link href="/events" className="group inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-primary)] rounded-full text-sm font-bold text-[var(--text-primary)] transition-all shadow-lg">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Events
          </Link>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-32 md:-mt-44 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Main Content ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Title Block */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-[var(--bg-card)]/80 backdrop-blur-2xl border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-[var(--accent-primary)]" />

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {event.type && (
                  <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)] rounded-full">
                    {event.type}
                  </span>
                )}
                {event.status && (
                  <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-[var(--accent-primary)] text-white rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {event.status}
                  </span>
                )}
              </div>

              {/* Title + Date Badge row */}
              <div className="flex items-start gap-5 mb-7">
                {event.date && <DateBadge dateStr={event.date} className="w-14 mt-1" />}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.08] text-[var(--text-primary)]">
                  {event.title}
                </h1>
              </div>

              {/* Quick meta row: date + time + location */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 text-sm font-semibold text-[var(--text-secondary)] border-t border-[var(--border-primary)]/50 pt-6">
                {event.date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[var(--accent-primary)] flex-shrink-0" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {event.startTime && (
                        <span className="text-[var(--text-muted)] ml-2">
                          · {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-500 flex-shrink-0" />
                  {mapsUrl ? (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                      {event.isOnline ? 'Online Event' : event.venue}
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  ) : (
                    <span>{event.isOnline ? 'Online Event' : event.venue || 'TBD'}</span>
                  )}
                </div>
                {event.isOnline && (
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-[var(--accent-primary)] flex-shrink-0" />
                    <span>Virtual Event</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── About Event ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="bg-[var(--bg-card)]/70 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                  <BookOpen size={17} />
                </div>
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">About Event</h2>
              </div>

              {event.description ? (
                <div className="space-y-4 text-base md:text-[17px] text-[var(--text-secondary)] leading-[1.8] font-medium max-w-2xl">
                  {event.description.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5 bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-primary)] border-dashed">
                  <AlertCircle size={20} className="text-[var(--text-muted)] flex-shrink-0" />
                  <p className="text-[var(--text-muted)] italic font-medium">No description provided for this event.</p>
                </div>
              )}
            </motion.div>

            {/* ── Speakers Grid ── */}
            {event.speakers?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5 }}
                className="bg-[var(--bg-card)]/70 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5"
              >
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <User size={17} />
                  </div>
                  <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Speakers</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {event.speakers.map((speaker, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex flex-col items-center text-center p-5 bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)]/30 transition-colors group"
                    >
                      {speaker.avatarUrl ? (
                        <img
                          src={speaker.avatarUrl}
                          alt={speaker.name}
                          className="w-16 h-16 rounded-2xl object-cover mb-3 group-hover:scale-105 transition-transform ring-2 ring-[var(--border-primary)] ring-offset-2 ring-offset-[var(--bg-hover)]"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <User size={28} className="text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="font-black text-sm text-[var(--text-primary)] leading-tight">{speaker.name}</div>
                      {speaker.title && (
                        <div className="text-xs text-[var(--text-muted)] mt-1 font-medium leading-snug">{speaker.title}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Schedule / Itinerary ── */}
            {event.schedules?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.5 }}
                className="bg-[var(--bg-card)]/70 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <Clock size={17} />
                  </div>
                  <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Schedule</h2>
                </div>
                <div className="space-y-5">
                  {event.schedules.map((schedule, i) => (
                    <div key={i} className="flex gap-5 relative group">
                      {i !== event.schedules.length - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-[var(--accent-primary)]/40 to-transparent" />
                      )}
                      <div className="w-6 h-6 mt-1 rounded-full bg-[var(--bg-card)] border-[3px] border-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-primary)]/10 rounded-lg text-xs font-bold text-[var(--accent-primary)] mb-2.5">
                          <Clock size={11} />
                          {new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {schedule.endTime && ` – ${new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                        <h3 className="text-base font-black text-[var(--text-primary)] mb-1">{schedule.title}</h3>
                        {schedule.description && (
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{schedule.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Hosted By ── */}
            {(event.organizer || event.institute || event.club) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="bg-[var(--bg-card)]/70 backdrop-blur-xl border border-[var(--border-primary)] rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5"
              >
                <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-5">Hosted By</h2>

                {/* Presenting org (institute or club) */}
                {(event.institute || event.club) && (
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[var(--border-primary)]/50">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Presented by</div>
                      <div className="font-black text-[var(--text-primary)] text-base">
                        {event.institute?.name || event.club?.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual organizer */}
                {event.organizer && (
                  <div className="flex items-center gap-4">
                    {event.organizer.avatarUrl ? (
                      <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-2 ring-[var(--border-primary)]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <User size={22} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Host</div>
                      <div className="font-black text-[var(--text-primary)] text-base">{event.organizer.name}</div>
                      {event.organizer.role && (
                        <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{event.organizer.role}</div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Sticky Sidebar ── */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="sticky top-24 space-y-4"
            >
              {/* Registration Status Card */}
              <RegistrationStatusCard event={event} rsvpStatus={rsvpStatus} />

              {/* Date / Location / Capacity metadata card */}
              <div className="bg-[var(--bg-card)]/80 backdrop-blur-2xl border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-2xl shadow-black/10 relative">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[var(--accent-primary)]/15 to-transparent rounded-bl-[80px] -z-10" />

                <div className="divide-y divide-[var(--border-primary)]/50">
                  {/* Date & Time */}
                  {event.date && (
                    <div className="flex items-start gap-4 px-6 py-5 group">
                      <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] shadow-sm flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300">
                        <Calendar size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Date & Time</div>
                        <div className="text-sm font-black text-[var(--text-primary)] leading-snug">
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        {event.startTime && (
                          <div className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {event.endTime && ` – ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-4 px-6 py-5 group">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] shadow-sm flex items-center justify-center text-emerald-500 flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Location</div>
                      {mapsUrl ? (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1 flex-wrap">
                          {event.venue}
                          <ExternalLink size={11} className="opacity-60 flex-shrink-0" />
                        </a>
                      ) : (
                        <div className="text-sm font-black text-[var(--text-primary)]">
                          {event.isOnline ? 'Online Event' : (event.venue || 'TBD')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capacity */}
                  {event.maxCapacity && (
                    <div className="flex items-start gap-4 px-6 py-5 group">
                      <div className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] shadow-sm flex items-center justify-center text-[var(--text-muted)] flex-shrink-0 group-hover:bg-[var(--text-muted)] group-hover:text-white transition-all duration-300">
                        <Users size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Capacity</div>
                        <div className="text-sm font-black text-[var(--text-primary)]">
                          <span className="text-[var(--accent-primary)]">{event._count?.registrations || 0}</span>
                          <span className="text-[var(--text-muted)] font-semibold"> / {event.maxCapacity} registered</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="px-6 pb-6 pt-2">
                  <AnimatePresence mode="wait">
                    {rsvpStatus === 'GOING' ? (
                      <motion.div key="going" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="space-y-3">
                        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm font-bold border border-emerald-500/20">
                          <CheckCircle2 size={18} className="flex-shrink-0" />
                          You're successfully registered!
                        </div>
                        <Link href={`/events/${params.id}/ticket`} className="w-full py-3.5 bg-[var(--accent-primary)] text-white rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] transition-all shadow-lg shadow-[var(--accent-primary)]/20">
                          <Ticket size={17} />
                          View Your Ticket
                        </Link>
                        <button onClick={cancelRSVP} disabled={isSubmitting} className="w-full py-3 text-[var(--text-muted)] font-bold text-sm rounded-xl hover:text-rose-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Cancel Registration'}
                        </button>
                      </motion.div>
                    ) : rsvpStatus === 'INTERESTED' ? (
                      <motion.div key="interested" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="space-y-3">
                        <div className="p-3.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-2xl text-sm font-bold text-center border border-[var(--accent-primary)]/20">
                          You've expressed interest!
                        </div>
                        <button
                          onClick={() => handleRSVP('GOING')}
                          disabled={isSubmitting || !!isFull}
                          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${isFull ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-primary)]' : 'bg-[var(--accent-primary)] text-white hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-[var(--accent-primary)]/20'}`}
                        >
                          {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : isFull ? 'Event is Full' : 'Secure Your Spot'}
                        </button>
                        <button onClick={cancelRSVP} disabled={isSubmitting} className="w-full py-3 text-[var(--text-muted)] font-bold text-sm rounded-xl hover:text-rose-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Remove Interest'}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="none" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="space-y-3">
                        <button
                          onClick={() => handleRSVP('GOING')}
                          disabled={isSubmitting || !!isFull || isPast}
                          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${(isFull || isPast) ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-primary)]' : 'bg-[var(--accent-primary)] text-white hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-[var(--accent-primary)]/20'}`}
                        >
                          {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : isPast ? 'Event Ended' : isFull ? 'Event is Full' : 'Register for Event'}
                        </button>
                        {!isFull && !isPast && (
                          <button
                            onClick={() => handleRSVP('INTERESTED')}
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-sm rounded-2xl hover:bg-[var(--border-primary)]/50 transition-all flex items-center justify-center gap-2 border border-[var(--border-primary)] disabled:opacity-50"
                          >
                            {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : "I'm Interested"}
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
