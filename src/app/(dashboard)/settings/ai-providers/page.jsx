"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Brain, Save, CheckCircle2, XCircle, Key, Loader2, Trash2 } from "lucide-react";

const SUPPORTED_PROVIDERS = [
  { id: "GEMINI", name: "Google Gemini", icon: "🌌" },
  { id: "GROQ", name: "Groq", icon: "🚀" },
  { id: "OPENROUTER", name: "OpenRouter", icon: "🛣️" },
];

export default function AIProvidersSettingsPage() {
  const { user, token, API_BASE } = useAuth();
  
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [connecting, setConnecting] = useState(null); // Provider ID currently connecting
  const [disconnecting, setDisconnecting] = useState(null); // Provider ID currently disconnecting
  const [apiKeys, setApiKeys] = useState({}); // Stores input fields
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
        // Clear the input and reload providers to show it as connected
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
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Connected AI Models
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Connect your own API keys to power AI-assisted features securely across the platform.
          </p>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-sm font-semibold flex items-center gap-2">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
          <Loader2 size={32} className="animate-spin text-[var(--accent-primary)]" />
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Loading Providers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_PROVIDERS.map(sp => {
            const connectedInfo = providers.find(p => p.provider === sp.id && p.connected);
            const isConnected = !!connectedInfo;
            const msg = messages[sp.id];
            
            return (
              <div key={sp.id} className="p-6 rounded-2xl border border-[var(--border-primary)] space-y-5 transition-all hover:bg-[var(--bg-secondary)]" style={{ backgroundColor: "var(--bg-primary)" }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sp.icon}</span>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{sp.name}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-500/10 border-zinc-500/20 text-[var(--text-muted)]'}`}>
                    {isConnected ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isConnected ? "Connected" : "Disconnected"}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    API Key
                  </label>
                  
                  {isConnected ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm font-mono text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        <Key size={14} className="shrink-0" />
                        <span>AIza********************X9A</span>
                      </div>
                      <button 
                        onClick={() => handleDisconnect(sp.id)}
                        disabled={disconnecting === sp.id}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Disconnect Provider"
                      >
                        {disconnecting === sp.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="password"
                        placeholder={`Enter ${sp.name} API Key`}
                        value={apiKeys[sp.id] || ""}
                        onChange={(e) => setApiKeys(prev => ({ ...prev, [sp.id]: e.target.value }))}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--text-muted)] transition-colors text-[var(--text-primary)]"
                        disabled={connecting === sp.id}
                      />
                    </div>
                  )}
                  
                  {msg && (
                    <p className={`text-xs font-semibold ${msg.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {msg.text}
                    </p>
                  )}

                  {!isConnected && (
                    <button
                      onClick={() => handleConnect(sp.id)}
                      disabled={connecting === sp.id || !apiKeys[sp.id]}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {connecting === sp.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Connect
                    </button>
                  )}
                  
                  {isConnected && (
                    <div className="pt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      Update key by disconnecting first, or contact support for assistance.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
