"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2, XCircle, Loader2, ArrowLeft, Search, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TicketScanner() {
  const params = useParams();
  const { token, API_BASE } = useAuth();
  const [event, setEvent] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null); // { success: boolean, message: string, data?: any }

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvent(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch event", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE || process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${params.id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken: tokenInput.trim() })
      });
      const data = await res.json();
      
      setResult({
        success: data.success,
        message: data.message,
        data: data.data // attendee details
      });

      if (data.success) {
        setTokenInput('');
        // Automatically hide success message after 3 seconds to scan next
        setTimeout(() => setResult(null), 3000);
      }

    } catch (error) {
      setResult({ success: false, message: 'Failed to connect to server.' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} /></div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <Link href="/events/organizer" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-6 w-fit">
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
          Ticket Scanner
        </h1>
        <p className="text-[var(--text-secondary)]">
          {event?.title}
        </p>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-[var(--bg-hover)] rounded-full flex items-center justify-center text-[var(--text-primary)] mb-6 shadow-sm border border-[var(--border-primary)]">
            <QrCode size={40} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Check-in Attendee</h2>
          <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm">
            Enter the unique ticket token to verify their registration and mark them as checked in.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative z-10 max-w-md mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Ticket size={20} />
              </div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token here..."
                className="w-full pl-11 pr-4 py-4 bg-[var(--bg-hover)] border-2 border-[var(--border-primary)] rounded-2xl text-[var(--text-primary)] font-mono font-bold focus:border-[var(--accent-primary)] outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !tokenInput.trim()}
              className="px-6 bg-[var(--accent-primary)] text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20"
            >
              {verifying ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </button>
          </div>
        </form>

        <div className="mt-10 min-h-[150px] relative z-10">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.success ? 'success' : 'error'}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center ${
                  result.success 
                    ? 'bg-green-500/10 border-green-500 text-green-500' 
                    : 'bg-red-500/10 border-red-500 text-red-500'
                }`}
              >
                {result.success ? (
                  <>
                    <CheckCircle2 size={48} className="mb-3" />
                    <h3 className="text-xl font-black mb-1">Valid Ticket</h3>
                    <p className="font-medium text-green-600/80 dark:text-green-400/80">
                      Successfully checked in.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle size={48} className="mb-3" />
                    <h3 className="text-xl font-black mb-1">Invalid Entry</h3>
                    <p className="font-medium text-red-600/80 dark:text-red-400/80">
                      {result.message}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
