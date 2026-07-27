"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function StudentAttendanceDashboard() {
  const { token, API_BASE } = useAuth();
  const { studentHistory, fetchStudentHistory, checkIn, isLoading } = useAttendanceStore();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  useEffect(() => {
    fetchStudentHistory(token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
  }, []);

  const handleScan = async (text) => {
    if (!text || scanResult) return;
    setScanning(false);
    
    // API call to check-in
    const result = await checkIn(text, token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
    
    setScanResult({
      success: result.success,
      message: result.message || (result.success ? "Successfully checked in!" : "Check-in failed")
    });

    if (result.success) {
      // Refresh history
      fetchStudentHistory(token, API_BASE || process.env.NEXT_PUBLIC_API_URL || '');
    }

    // Auto-clear result after 3 seconds
    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
          My Attendance
        </h1>
        <p className="text-[var(--text-secondary)]">
          Scan the live QR code displayed by your faculty to mark your attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Scanner Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border-primary)] shadow-sm flex flex-col items-center">
            
            {!scanning && !scanResult && (
              <div className="text-center">
                <div className="w-24 h-24 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera size={40} className="text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ready to Scan</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  Point your camera at the QR code displayed on the board.
                </p>
                <button
                  onClick={() => setScanning(true)}
                  className="w-full py-3 bg-[var(--accent-primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Start Scanner
                </button>
              </div>
            )}

            {scanning && (
              <div className="w-full relative rounded-2xl overflow-hidden border-2 border-[var(--accent-primary)]">
                <Scanner
                  onResult={(text, result) => handleScan(text)}
                  onError={(error) => console.log(error?.message)}
                  options={{ delayBetweenScanAttempts: 1000 }}
                />
                <button
                  onClick={() => setScanning(false)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md text-white font-bold rounded-full text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full text-center p-6 rounded-2xl border ${
                  scanResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                ) : (
                  <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                )}
                <h3 className={`text-xl font-bold mb-2 ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {scanResult.success ? 'Success!' : 'Error'}
                </h3>
                <p className={scanResult.success ? 'text-green-600' : 'text-red-600'}>
                  {scanResult.message}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-hover)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={20} className="text-[var(--accent-primary)]" />
                Recent History
              </h2>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[var(--accent-primary)]" size={40} />
                </div>
              ) : studentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] py-20">
                  <Calendar size={48} className="mb-4 opacity-50" />
                  <p>No attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {studentHistory.map((record, idx) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-primary)]"
                    >
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] text-lg">
                          {record.session.timetableEntry.subject.name}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {new Date(record.session.date).toLocaleDateString()} • {record.session.timetableEntry.faculty.fullName}
                        </p>
                      </div>
                      
                      <div className="mt-3 md:mt-0 flex items-center gap-4">
                        <span className="text-sm font-medium text-[var(--text-muted)]">
                          {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="px-3 py-1 rounded-full text-sm font-bold bg-green-500/10 text-green-500 flex items-center gap-1">
                          <CheckCircle2 size={14} /> Present
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
