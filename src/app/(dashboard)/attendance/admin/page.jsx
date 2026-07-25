"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Clock, AlertTriangle, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminAttendanceAnalytics() {
  const { token, API_BASE } = useAuth();
  
  // Mock data for UI demonstration
  const stats = [
    { label: 'Overall Attendance', value: '87%', icon: <BarChart3 />, trend: '+2.4%' },
    { label: 'Classes Conducted', value: '1,240', icon: <Clock />, trend: 'This Month' },
    { label: 'Students Below 75%', value: '42', icon: <AlertTriangle className="text-red-500" />, trend: 'Requires Action' },
    { label: 'Total Enrolled', value: '8,420', icon: <Users />, trend: 'Active' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-[var(--text-primary)]">
            Attendance Analytics
          </h1>
          <p className="text-[var(--text-secondary)]">
            Institute-wide overview of student attendance and faculty engagement.
          </p>
        </div>
        <button className="px-6 py-3 bg-[var(--bg-card)] text-[var(--text-primary)] font-bold rounded-xl border border-[var(--border-primary)] shadow-sm hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all flex items-center gap-2">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[var(--bg-hover)] rounded-xl text-[var(--accent-primary)]">
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend.includes('Action') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">
              {stat.value}
            </h3>
            <p className="text-[var(--text-secondary)] font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm p-8 flex flex-col items-center justify-center text-center h-[400px]">
        <BarChart3 size={64} className="text-[var(--text-muted)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Analytics Engine Connecting...</h3>
        <p className="text-[var(--text-secondary)] max-w-md">
          In a full production environment, this section will render beautiful Recharts graphs displaying week-over-week attendance trends across different batches.
        </p>
      </div>
    </div>
  );
}
