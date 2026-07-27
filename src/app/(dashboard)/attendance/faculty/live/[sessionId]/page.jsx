"use client";

import React, { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function LiveAttendanceScreen({ params }) {
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.sessionId;
  
  const { token, API_BASE } = useAuth();
  const { liveSession, fetchSessionStatus } = useAttendanceStore();
  const [timeLeft, setTimeLeft] = useState(0);

  // Poll for live stats (in a real app, use Socket.IO)
  useEffect(() => {
    fetchSessionStatus(sessionId, token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
    const interval = setInterval(() => {
      fetchSessionStatus(sessionId, token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
    }, 3000); // poll every 3 seconds for demo
    return () => clearInterval(interval);
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (!liveSession) return;
    const expiryTime = new Date(liveSession.expiresAt).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((expiryTime - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [liveSession?.expiresAt]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!liveSession) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    );
  }

  const { stats, isExpired } = liveSession;
  const progressPercent = stats ? (stats.present / (stats.total || 1)) * 100 : 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">
      <Link href="/attendance/faculty" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--bg-hover)]">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-1">
              Live Check-in
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              {liveSession.timetableEntry?.subject?.name} • {liveSession.timetableEntry?.timetable?.batch?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 ${isExpired ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
              <Clock size={20} />
              {isExpired ? 'Expired' : formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
          
          {/* QR Code Section */}
          <div className="flex-shrink-0 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--accent-primary)] to-purple-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white p-6 rounded-[2rem] shadow-xl">
              {isExpired ? (
                <div className="w-[300px] h-[300px] flex flex-col items-center justify-center bg-red-50 rounded-2xl border-2 border-red-200">
                  <AlertTriangle size={48} className="text-red-500 mb-4" />
                  <p className="text-red-700 font-bold text-lg">QR Code Expired</p>
                  <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-medium text-red-600 hover:bg-red-50 transition">
                    <RefreshCw size={16} /> Generate New
                  </button>
                </div>
              ) : (
                <QRCodeSVG 
                  value={liveSession.qrToken}
                  size={300}
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>
            {!isExpired && (
              <p className="text-center mt-6 text-[var(--text-secondary)] font-medium animate-pulse">
                Scan with Eduvantix App
              </p>
            )}
          </div>

          {/* Stats Section */}
          <div className="flex-1 w-full space-y-8">
            <div className="bg-[var(--bg-hover)] rounded-3xl p-8 border border-[var(--border-primary)]">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-1">Checked In</h3>
                  <div className="text-5xl font-black text-[var(--text-primary)]">
                    {stats?.present} <span className="text-2xl text-[var(--text-muted)]">/ {stats?.total}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <Users size={32} className="text-[var(--accent-primary)]" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-[var(--accent-primary)] rounded-full"
                />
              </div>
            </div>

            {/* Recent Check-ins */}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recent Joins</h3>
              <div className="space-y-3 h-[180px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {liveSession.records?.slice(0).reverse().map((record, idx) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-primary)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-blue-500 text-white flex items-center justify-center font-bold">
                          {record.student.fullName?.charAt(0) || '?'}
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{record.student.fullName}</span>
                      </div>
                      <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                        Present
                      </span>
                    </motion.div>
                  ))}
                  {(!liveSession.records || liveSession.records.length === 0) && (
                    <div className="text-center text-[var(--text-muted)] py-4">Waiting for students...</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
