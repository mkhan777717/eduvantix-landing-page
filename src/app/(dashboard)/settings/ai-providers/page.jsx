"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Save, CheckCircle2, XCircle, Key, Loader2, Trash2, Eye, EyeOff, Info, HelpCircle } from "lucide-react";

const SUPPORTED_PROVIDERS = [
  { id: "GEMINI", name: "Google Gemini", icon: "🌌", models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"] },
  { id: "GROQ", name: "Groq", icon: "🚀", models: ["llama3-70b", "llama3-8b"] },
  { id: "OPENROUTER", name: "OpenRouter", icon: "🛣️", models: ["auto-resolved"] },
];

export default function AIProvidersSettingsPage() {
  const { user, token, API_BASE } = useAuth();
  
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [connecting, setConnecting] = useState(null); // Provider ID currently connecting
  const [disconnecting, setDisconnecting] = useState(null); // Provider ID currently disconnecting
  const [apiKeys, setApiKeys] = useState({}); // Stores input fields
  const [revealKey, setRevealKey] = useState({}); // Toggles mask/unmask
  const [showAdvanced, setShowAdvanced] = useState(false); // Gated advanced BYO Key section
  const [messages, setMessages] = useState({}); // Success/Error messages per provider

  const getHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  }), [token]);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/ai/providers`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviders(data.providers);
      } else {
        setError(data.message || "Failed to load connected AI providers.");
      }
    } catch {
      setError("Network error loading providers.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getHeaders]);

  useEffect(() => {
    if (user) fetchProviders();
  }, [user, fetchProviders]);

  const handleConnect = async (providerId) => {
    const key = apiKeys[providerId];
    if (!key) {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'API Key is required.' } }));
      return;
    }

    setConnecting(providerId);
    setMessages(prev => ({ ...prev, [providerId]: null }));

    try {
      const res = await fetch(`${API_BASE}/api/ai/providers/connect`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ provider: providerId, apiKey: key })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'success', text: 'Connected Successfully ✅' } }));
        setApiKeys(prev => ({ ...prev, [providerId]: "" }));
        fetchProviders();
      } else {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: data.message || 'Invalid API Key ❌' } }));
      }
    } catch {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'Network Error ❌' } }));
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (providerId) => {
    setDisconnecting(providerId);
    setMessages(prev => ({ ...prev, [providerId]: null }));

    try {
      const res = await fetch(`${API_BASE}/api/ai/providers/${providerId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        fetchProviders();
      } else {
        setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: data.message || 'Disconnect failed.' } }));
      }
    } catch {
      setMessages(prev => ({ ...prev, [providerId]: { type: 'error', text: 'Network Error.' } }));
    } finally {
      setDisconnecting(null);
    }
  };

  const toggleRevealKey = (providerId) => {
    setRevealKey(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  if (!user) return null;

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12" style={{ color: "var(--text-primary)" }}>
      {/* Page Title / Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <Brain size={12} className="text-violet-500 animate-pulse" />
            AI PROVIDERS
          </div>
          <h1 className="text-4xl font-sans font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Connected AI Models
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            View and configure your integration connections. By default, the platform routes your AI requests securely through organization-managed API keys.
          </p>
        </div>
      </section>

      {/* Info Alert Box */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-sm leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-400">Platform-Managed Keys Enabled</span>
          <p className="text-gray-400 mt-1">
            You do not need to provide your own API keys. All AI-assisted features are fully operational out of the box, with usage billed to and tracked by your organization.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-sm font-semibold flex items-center gap-2">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {/* Gated Advanced BYO Key Section Toggle */}
      <div className="border border-[var(--border-primary)] rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 hover:bg-[var(--bg-hover)] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-violet-500" />
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Advanced: Bring Your Own API Key (BYO Key)</h2>
              <p className="text-xs text-[var(--text-muted)]">Override default organization keys with your own personal developer keys.</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)]">
            {showAdvanced ? "Collapse" : "Expand"}
          </span>
        </button>

        {showAdvanced && (
          <div className="p-6 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] space-y-6">
            <div className="p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-500 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Security Notice:</strong> Your personal API keys will be safely encrypted using AES-256-GCM before being stored in our database, and will never be returned to the client or displayed in plaintext.
              </p>
            </div>

            {loading ? (
              <div className="flex h-48 flex-col items-center justify-center space-y-4">
                <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Loading Providers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUPPORTED_PROVIDERS.map(sp => {
                  const connectedInfo = providers.find(p => p.provider === sp.id && p.connected);
                  const isConnected = !!connectedInfo;
                  const msg = messages[sp.id];
                  
                  const isHealthy = connectedInfo?.providerStatus === 'CONNECTED';
                  const statusColor = isHealthy ? 'text-emerald-500' : 'text-rose-500';
                  const statusBg = isHealthy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

                  return (
                    <div key={sp.id} className="p-5 rounded-2xl border border-[var(--border-primary)] space-y-5 bg-[var(--bg-secondary)]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{sp.icon}</span>
                          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{sp.name}</h3>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${isConnected ? statusBg + ' ' + statusColor : 'bg-zinc-500/10 border-zinc-500/20 text-[var(--text-muted)]'}`}>
                          {isConnected ? (connectedInfo.providerStatus || "Connected") : "Disconnected"}
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        {isConnected ? (
                          <>
                            <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-primary)] space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span style={{ color: "var(--text-muted)" }}>Models Available:</span>
                                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{connectedInfo.modelCount || 0}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(sp.models || []).map((m, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-mono border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDisconnect(sp.id)}
                                disabled={disconnecting === sp.id}
                                className="w-full py-2 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors shrink-0 flex items-center justify-center gap-1.5 font-semibold"
                              >
                                {disconnecting === sp.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Remove Key
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative flex items-center">
                              <input
                                type={revealKey[sp.id] ? "text" : "password"}
                                placeholder={`Enter ${sp.name} API Key`}
                                value={apiKeys[sp.id] || ""}
                                onChange={(e) => setApiKeys(prev => ({ ...prev, [sp.id]: e.target.value }))}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 pr-9 text-xs focus:outline-none focus:border-indigo-500 transition-colors text-[var(--text-primary)]"
                                disabled={connecting === sp.id}
                              />
                              <button
                                type="button"
                                onClick={() => toggleRevealKey(sp.id)}
                                className="absolute right-2.5 text-[var(--text-muted)] hover:text-gray-300"
                              >
                                {revealKey[sp.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleConnect(sp.id)}
                              disabled={connecting === sp.id || !apiKeys[sp.id]}
                              className="w-full mt-1.5 flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--accent-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {connecting === sp.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                              Save Key
                            </button>
                          </>
                        )}
                        
                        {msg && (
                          <p className={`text-[10px] font-semibold mt-1 ${msg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
      </div>
    </div>
  );
}
