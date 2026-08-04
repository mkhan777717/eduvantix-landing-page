"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Brain, Save, CheckCircle2, XCircle, Key, Loader2, Trash2, Eye, EyeOff, Shield } from "lucide-react";

const SUPPORTED_PROVIDERS = [
  { id: "GEMINI", name: "Google Gemini", icon: "🌌" },
  { id: "GROQ", name: "Groq", icon: "🚀" },
  { id: "OPENROUTER", name: "OpenRouter", icon: "🛣️" },
];

export default function AIPlatformAdminDashboard() {
  const { user, token, API_BASE } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Org provider settings state
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);
  const [apiKeys, setApiKeys] = useState({});
  const [revealKey, setRevealKey] = useState({});
  const [messages, setMessages] = useState({});
  const [error, setError] = useState("");

  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  }), [token]);

  const fetchOrgProviders = useCallback(async () => {
    setLoadingProviders(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/ai/providers/org`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviders(data.providers);
      } else {
        setError(data.message || "Failed to load organization AI providers.");
      }
    } catch {
      setError("Network error loading organization providers.");
    } finally {
      setLoadingProviders(false);
    }
  }, [API_BASE, getHeaders]);

  useEffect(() => {
    if (user && activeTab === 'providers') {
      fetchOrgProviders();
    }
  }, [user, activeTab, fetchOrgProviders]);

  const handleConnectOrg = async (providerId) => {
    const key = apiKeys[providerId];
    if (!key) {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'API Key is required.' } }));
      return;
    }

    setConnecting(providerId);
    setMessages(prev => ({ ...prev, [providerId]: null }));

    try {
      const res = await fetch(`${API_BASE}/api/ai/providers/org/connect`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ provider: providerId, apiKey: key })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'success', text: 'Org Key connected successfully ✅' } }));
        setApiKeys(prev => ({ ...prev, [providerId]: "" }));
        fetchOrgProviders();
      } else {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: data.message || 'Validation failed ❌' } }));
      }
    } catch {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'Network Error ❌' } }));
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectOrg = async (providerId) => {
    setDisconnecting(providerId);
    setMessages(prev => ({ ...prev, [providerId]: null }));

    try {
      const res = await fetch(`${API_BASE}/api/ai/providers/org/${providerId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        fetchOrgProviders();
      } else {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: data.message || 'Disconnect failed.' } }));
      }
    } catch {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'Network Error.' } }));
    } finally {
      setDisconnecting(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'AI Overview' },
    { id: 'providers', label: 'Enterprise Providers' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'agents', label: 'Agents & Workflows' },
    { id: 'observability', label: 'Observability & Costs' },
    { id: 'security', label: 'Security & Access' }
  ];

  const toggleRevealKey = (providerId) => {
    setRevealKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[var(--text-primary)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Enterprise AI Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Manage observability, organization-scoped credentials, and costs.</p>
        </div>
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

        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-sm leading-relaxed flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-400">Enterprise Mode Active</span>
                <p className="text-gray-400 mt-1">Configure organization-scoped platform keys here. Once saved, these credentials will be securely encrypted using AES-256-GCM and will serve as the default models for all members/students in your organization.</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-sm font-semibold flex items-center gap-2">
                <XCircle size={18} />
                {error}
              </div>
            )}

            {loadingProviders ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-700/50">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <span className="text-sm font-medium text-gray-400">Loading Org Providers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUPPORTED_PROVIDERS.map(sp => {
                  const connectedInfo = providers.find(p => p.provider === sp.id && p.connected);
                  const isConnected = !!connectedInfo;
                  const msg = messages[sp.id];

                  return (
                    <div key={sp.id} className="p-6 rounded-2xl border border-gray-700/50 space-y-5 bg-gray-800/20 hover:bg-gray-800/40 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{sp.icon}</span>
                          <h3 className="text-lg font-bold">{sp.name}</h3>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${
                          isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-500/10 border-zinc-500/20 text-gray-400'
                        }`}>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {isConnected ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDisconnectOrg(sp.id)}
                              disabled={disconnecting === sp.id}
                              className="w-full py-2 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                              {disconnecting === sp.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              Remove Platform Key
                            </button>
                          </div>
                        ) : (
                          <>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                              API Key
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={revealKey[sp.id] ? "text" : "password"}
                                placeholder={`Enter Organization ${sp.name} API Key`}
                                value={apiKeys[sp.id] || ""}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, [sp.id]: e.target.value }))}
                                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-gray-100"
                                disabled={connecting === sp.id}
                              />
                              <button
                                type="button"
                                onClick={() => toggleRevealKey(sp.id)}
                                className="absolute right-3 text-gray-500 hover:text-gray-300"
                              >
                                {revealKey[sp.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleConnectOrg(sp.id)}
                              disabled={connecting === sp.id || !apiKeys[sp.id]}
                              className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              {connecting === sp.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              Save Platform Key
                            </button>
                          </>
                        )}
                        
                        {msg && (
                          <p className={`text-xs font-semibold mt-2 ${msg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {msg.text}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
