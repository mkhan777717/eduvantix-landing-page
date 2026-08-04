"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AIPlatformAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'AI Overview' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'agents', label: 'Agents & Workflows' },
    { id: 'observability', label: 'Observability & Costs' },
    { id: 'security', label: 'Security & Access' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enterprise AI Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Manage observability, organizations, and costs.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Sync Providers
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-700/50 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Token Usage (30d)</h3>
              <p className="text-2xl font-bold text-gray-100">12.4M</p>
              <div className="text-xs text-green-400 mt-2 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                <span>+15% from last month</span>
              </div>
            </div>
            
            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Estimated Cost (30d)</h3>
              <p className="text-2xl font-bold text-gray-100">$45.20</p>
              <div className="text-xs text-gray-400 mt-2">Saved $12.50 via Optimization Engine</div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Provider Health</h3>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Gemini</span>
                  <span className="text-green-400 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Online</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Groq</span>
                  <span className="text-green-400 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'observability' && (
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50">
              <h3 className="text-lg font-medium text-gray-100">Live Request Traces</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Provider / Model</th>
                    <th className="px-6 py-3 font-medium">Latency</th>
                    <th className="px-6 py-3 font-medium">Tokens</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <tr className="hover:bg-gray-700/20">
                    <td className="px-6 py-4 text-gray-200">Gemini (gemini-1.5-flash)</td>
                    <td className="px-6 py-4">420ms</td>
                    <td className="px-6 py-4">120 in / 45 out</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Success</span></td>
                  </tr>
                  <tr className="hover:bg-gray-700/20">
                    <td className="px-6 py-4 text-gray-200">Groq (llama3-70b)</td>
                    <td className="px-6 py-4">180ms</td>
                    <td className="px-6 py-4">50 in / 110 out</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Success</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
