"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import KnowledgeBase from './KnowledgeBase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AIAgentsPage() {
  const { token } = useAuth();
  
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  
  const [provider, setProvider] = useState("AUTO");
  const [model, setModel] = useState("AUTO");
  
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [openThoughts, setOpenThoughts] = useState({});
  const [error, setError] = useState("");

  // Capabilities State
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");

  // History State
  const [activeTab, setActiveTab] = useState("agents");
  const [mainView, setMainView] = useState("chat");
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchAgentQuery, setSearchAgentQuery] = useState("");

  const fetchAgents = useCallback(async () => {
    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/agents`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        if (data.agents.length > 0) setSelectedAgentId(data.agents[0].id);
      }
    } catch (err) {
      console.error("Failed to load agents", err);
    } finally {
      setLoadingAgents(false);
    }
  }, [token]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/memory/conversations`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  const loadConversation = async (conversationId, agentId) => {
    try {
      setLoading(true);
      setSelectedAgentId(agentId);
      setActiveConversationId(conversationId);
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/memory/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map(m => ({
          role: m.role,
          content: m.content,
          thinking: null
        })));
      }
    } catch (err) {
      console.error("Failed to load messages", err);
      setError("Failed to load previous conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAgents();
      fetchConversations();
    }
  }, [token, fetchAgents, fetchConversations]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const apiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.thinking ? `<think>${m.thinking}</think>\n\n${m.content}` : m.content }));

    setMessages(prev => [
      ...prev,
      { role: 'user', content: prompt, attachments: attachments.map(f => f.originalname) },
      { role: 'assistant', content: '', thinking: null, isStreaming: true }
    ]);
    setPrompt('');
    setAttachments([]);
    setLoading(true);
    setIsThinking(true);
    setError('');

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const capabilities = [];
      const capabilityParams = {};

      if (webSearchEnabled) {
        capabilities.push('WebSearch');
        capabilityParams.searchQuery = prompt;
      }
      if (githubUrl) {
        capabilities.push('GitHub');
        capabilityParams.githubUrl = githubUrl;
      }

      let fileContextBlock = '';
      if (attachments.length > 0) {
        fileContextBlock = attachments.map(f => {
          if (f.extractedText) return `--- FILE: ${f.originalname} ---\n${f.extractedText}\n--- END OF FILE ---`;
          if (f.extractionError) return `--- FILE: ${f.originalname} ---\n[Could not read file: ${f.extractionError}]\n--- END OF FILE ---`;
          return '';
        }).filter(Boolean).join('\n\n');
      }

      const codeBlockMatch = prompt.match(/```(python|javascript|js|node|c\+\+|cpp|c|java)\n([\s\S]*?)```/i);
      let finalLanguage = null;
      let finalCode = prompt;
      if (codeBlockMatch) {
        let extractedLang = codeBlockMatch[1].toLowerCase();
        if (extractedLang === 'js' || extractedLang === 'node') extractedLang = 'javascript';
        if (extractedLang === 'cpp') extractedLang = 'c++';
        finalLanguage = extractedLang;
        finalCode = codeBlockMatch[2].trim();
      }
      if (finalLanguage) {
        capabilities.push('CodeExecution');
        capabilityParams.language = finalLanguage;
        capabilityParams.code = finalCode;
      }

      const messageWithContext = fileContextBlock
        ? `${fileContextBlock}\n\n--- USER QUERY ---\n${prompt}`
        : prompt;

      const newApiMessages = [...apiMessages, { role: 'user', content: messageWithContext }];

      const res = await fetch(`${API_BASE}/api/ai/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          agent: selectedAgentId,
          messages: newApiMessages,
          provider,
          model: model === 'AUTO' ? undefined : model,
          capabilities,
          capabilityParams
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let rawAccum = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
          const chunkStr = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 2);

          for (const line of chunkStr.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const dataStr = line.slice(6);

            if (dataStr === '[DONE]') {
              setLoading(false);
              setIsThinking(false);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
                return updated;
              });
              return;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.error) { setError(data.error); setLoading(false); setIsThinking(false); return; }
              if (!data.text) continue;

              rawAccum += data.text;
              const chunkRouting = data.routing || null;

              const openIdx = rawAccum.indexOf('<think>');
              const closeIdx = rawAccum.indexOf('</think>');
              let thinkingField = null;
              let contentField = '';
              let stillStreaming = true;

              if (openIdx !== -1) {
                if (closeIdx !== -1) {
                  thinkingField = rawAccum.slice(openIdx + 7, closeIdx).trim();
                  contentField = rawAccum.slice(closeIdx + 8).trim();
                  stillStreaming = false;
                  setIsThinking(false);
                } else {
                  thinkingField = rawAccum.slice(openIdx + 7);
                  contentField = '';
                  setIsThinking(true);
                }
              } else {
                thinkingField = null;
                contentField = rawAccum.trim();
                stillStreaming = false;
                setIsThinking(false);
              }

              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  thinking: thinkingField,
                  content: contentField,
                  isStreaming: stillStreaming,
                  routing: chunkRouting || (lastMsg ? lastMsg.routing : null) || null
                };
                return updated;
              });
            } catch (e) { /* skip malformed chunks */ }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAttachments(prev => [...prev, ...data.files]);
      } else {
        setError(data.error || 'Failed to upload files');
      }
    } catch (err) {
      setError('File upload failed');
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--bg-hover)' }}>
          {['chat', 'knowledge'].map(view => (
            <button key={view} onClick={() => setMainView(view)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={mainView === view
                ? { backgroundColor: 'var(--accent-primary)', color: '#fff' }
                : { color: 'var(--text-secondary)' }}>
              {view === 'chat' ? 'AI Chat' : 'Knowledge Base'}
            </button>
          ))}
        </div>
        {selectedAgent && mainView === 'chat' && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedAgent.name}</span>
            <span>· Connected ({provider === 'AUTO' ? 'Auto-Routing' : provider})</span>
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      {mainView === 'knowledge' ? (
        <div className="flex-1 overflow-y-auto"><KnowledgeBase token={token} /></div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <div className="w-64 flex-shrink-0 flex flex-col border-r"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>

            <div className="flex border-b" style={{ borderColor: 'var(--border-primary)' }}>
              {[{ id: 'agents', label: 'Agents' }, { id: 'history', label: 'History' }].map(tab => (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === 'history') fetchConversations(); }}
                  className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'agents' && (
              <div className="p-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchAgentQuery}
                  onChange={(e) => setSearchAgentQuery(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-[var(--text-primary)]"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar space-y-0.5">
              {activeTab === 'agents' ? (
                loadingAgents
                  ? [...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse my-1" style={{ backgroundColor: 'var(--bg-hover)' }} />)
                  : agents
                      .filter(agent => 
                        agent.name.toLowerCase().includes(searchAgentQuery.toLowerCase()) || 
                        agent.description.toLowerCase().includes(searchAgentQuery.toLowerCase())
                      )
                      .map(agent => {
                        const isActive = selectedAgentId === agent.id && !activeConversationId;
                        return (
                          <button key={agent.id}
                            onClick={() => { setSelectedAgentId(agent.id); setActiveConversationId(null); setMessages([]); setError(''); }}
                            className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-3"
                            style={{
                              backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={isActive
                                ? { backgroundColor: 'var(--accent-primary)', color: '#fff' }
                                : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{agent.name}</div>
                              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{agent.description}</div>
                            </div>
                          </button>
                        );
                      })
              ) : (
                loadingHistory
                  ? [...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse my-1" style={{ backgroundColor: 'var(--bg-hover)' }} />)
                  : conversations.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="text-3xl mb-2">💬</div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
                    </div>
                  ) : conversations.map(conv => (
                    <button key={conv.id} onClick={() => loadConversation(conv.id, conv.agentId)}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150"
                      style={{
                        backgroundColor: activeConversationId === conv.id ? 'var(--bg-hover)' : 'transparent',
                        borderLeft: activeConversationId === conv.id ? '3px solid #a855f7' : '3px solid transparent',
                      }}
                      onMouseEnter={e => { if (activeConversationId !== conv.id) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (activeConversationId !== conv.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{conv.title || 'New Conversation'}</div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Agent {conv.agentId}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* ── Chat Panel ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {selectedAgent ? (
              <>
                {/* Agent Header */}
                <div className="px-5 py-3 border-b flex-shrink-0 flex items-center gap-3"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', border: '1px solid var(--border-primary)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedAgent.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{selectedAgent.description}</div>
                  </div>
                  <div className="hidden md:flex flex-wrap gap-1.5">
                    {(selectedAgent.allowedCapabilities || []).slice(0, 4).map(cap => (
                      <span key={cap} className="px-2 py-0.5 rounded-md text-xs border font-medium"
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>
                        {cap}
                      </span>
                    ))}
                    {(selectedAgent.allowedCapabilities || []).length > 4 && (
                      <span className="px-2 py-0.5 rounded-md text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', borderColor: 'var(--border-primary)' }}>
                        +{selectedAgent.allowedCapabilities.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-6 py-8">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)', color: 'var(--accent-primary)' }}>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      </div>
                       <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedAgent.name}</h2>
                      <p className="text-sm text-center max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>{selectedAgent.description}</p>
                      
                      {selectedAgent.id === 'interview' && (
                        <div className="mb-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-center max-w-md animate-in fade-in duration-300">
                          <p className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">🎯 Practice for AI Viva</p>
                          <p className="text-xs text-[var(--text-secondary)] mb-3">
                            Practice your technical accuracy and communication skills here before starting your official Viva sessions.
                          </p>
                          <Link href="/student/viva" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
                            Go to AI Viva Hub →
                          </Link>
                        </div>
                      )}
                      {selectedAgent.examplePrompts?.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                          {selectedAgent.examplePrompts.map((ex, i) => (
                            <button key={i} onClick={() => setPrompt(ex)}
                              className="text-left p-3.5 rounded-xl border text-sm transition-all duration-200"
                              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
                              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>Try this →</div>
                              <div className="leading-snug">{ex}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 px-4 space-y-5 max-w-5xl mx-auto w-full">
                      {messages.map((msg, i) => {
                        if (msg.role === 'assistant' && !msg.content && !msg.thinking) return null;

                        if (msg.role === 'user') {
                          return (
                            <div key={i} className="flex justify-end items-start gap-2.5">
                              <div className="max-w-[75%]">
                                {msg.attachments?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-1.5 justify-end">
                                    {msg.attachments.map((fname, ai) => (
                                      <span key={ai} className="text-xs px-2 py-1 rounded-lg flex items-center gap-1.5"
                                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                                        📎 {fname}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap"
                                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                                  {msg.content}
                                </div>
                              </div>
                              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                                style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </div>
                            </div>
                          );
                        }

                        const hasThinking = msg.thinking !== null && msg.thinking !== undefined;
                        const isThoughtOpen = openThoughts[i] !== false;
                        const isStillStreaming = msg.isStreaming && hasThinking && !msg.content;

                        return (
                          <div key={i} className="flex justify-start items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', border: '1px solid var(--border-primary)' }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0 max-w-[88%]">
                              {hasThinking && (
                                <div className="mb-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
                                  <button
                                    onClick={() => setOpenThoughts(prev => ({ ...prev, [i]: !isThoughtOpen }))}
                                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                                    <svg className={`w-3 h-3 transition-transform duration-200 ${isThoughtOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {isStillStreaming ? (
                                      <span className="flex items-center gap-2">
                                        <span className="flex gap-1">
                                          {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                        </span>
                                        Thinking...
                                      </span>
                                    ) : 'Thought process'}
                                  </button>
                                  {isThoughtOpen && (
                                    <div className="px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap border-t"
                                      style={{ color: 'var(--text-muted)', borderColor: 'var(--border-primary)' }}>
                                      {msg.thinking || <span className="animate-pulse">...</span>}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="text-sm leading-relaxed markdown-body">
                                {msg.content ? (
                                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                    code({ node, inline, className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      return !inline && match ? (
                                        <div className="relative group rounded-xl overflow-hidden my-3.5 border" style={{ borderColor: 'var(--border-primary)' }}>
                                          <div className="flex items-center justify-between px-4 py-1.5 text-xs" style={{ backgroundColor: '#0d0d1a', color: '#6b7280' }}>
                                            <span className="font-mono">{match[1]}</span>
                                            <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded hover:bg-white/10">
                                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                              Copy
                                            </button>
                                          </div>
                                          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '12.5px' }} {...props}>
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        </div>
                                      ) : (
                                        <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono"
                                          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }} {...props}>{children}</code>
                                      );
                                    },
                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-7" style={{ color: 'var(--text-primary)' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" style={{ color: 'var(--text-primary)' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" style={{ color: 'var(--text-primary)' }} {...props} />,
                                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-5 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }} {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-4" style={{ color: 'var(--text-primary)' }} {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 mt-3" style={{ color: 'var(--text-primary)' }} {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 my-3 italic text-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-muted)' }} {...props} />,
                                    table: ({ node, ...props }) => <div className="overflow-x-auto mb-4 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}><table className="min-w-full" {...props} /></div>,
                                    th: ({ node, ...props }) => <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }} {...props} />,
                                    td: ({ node, ...props }) => <td className="px-4 py-2.5 text-sm border-t" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }} {...props} />,
                                    a: ({ node, ...props }) => <a className="underline decoration-dotted hover:decoration-solid" style={{ color: 'var(--accent-primary)' }} target="_blank" rel="noreferrer" {...props} />,
                                    strong: ({ node, ...props }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }} {...props} />,
                                    hr: ({ node, ...props }) => <hr className="my-4 border" style={{ borderColor: 'var(--border-primary)' }} {...props} />,
                                  }}>
                                    {msg.content}
                                  </ReactMarkdown>
                                ) : !isStillStreaming ? (
                                  <div className="flex gap-1 py-1.5">
                                    {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                  </div>
                                ) : null}
                                {msg.isStreaming && msg.content && (
                                  <span className="inline-block w-0.5 h-4 rounded-full animate-pulse ml-0.5 align-text-bottom" style={{ backgroundColor: 'var(--accent-primary)' }} />
                                )}
                              </div>
                              {msg.routing && (
                                <div className="mt-1 text-[10px] select-none flex items-center gap-1.5 opacity-60" style={{ color: 'var(--text-muted)' }}>
                                  <span>via {msg.routing.actualModel}</span>
                                  {msg.routing.fallbackUsed && (
                                    <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] font-bold tracking-wider uppercase">
                                      fallback — {msg.routing.actualProvider}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {loading && isThinking && !messages.some(m => m.role === 'assistant' && (m.content || m.thinking)) && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', border: '1px solid var(--border-primary)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          </div>
                          <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm border"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                            {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: `${d}ms` }} />)}
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="flex justify-center">
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium"
                            style={{ backgroundColor: '#fff1f1', borderColor: '#fca5a5', color: '#dc2626' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Input ────────────────────────────────────── */}
                <div className="px-4 py-3 border-t flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                  <div className="max-w-5xl mx-auto w-full">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border text-xs"
                          style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="truncate max-w-[120px]">{file.originalname}</span>
                          <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-sm leading-none hover:bg-red-500/20 hover:text-red-400">×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl border transition-all duration-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/30 overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                    <textarea
                      value={prompt}
                      onChange={e => {
                        setPrompt(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={`Message ${selectedAgent.name}...`}
                      rows={1}
                      className="w-full resize-none bg-transparent outline-none px-4 pt-3.5 pb-1.5 text-sm leading-relaxed"
                      style={{ color: 'var(--text-primary)', minHeight: '50px', maxHeight: '160px' }}
                    />
                    <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
                      <div className="flex items-center gap-0.5">
                        <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingFiles} />
                        <label htmlFor="file-upload" title="Attach files"
                          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-gray-500/20"
                          style={{ color: 'var(--text-muted)' }}>
                          {uploadingFiles
                            ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                          }
                        </label>
                        <button onClick={() => setWebSearchEnabled(!webSearchEnabled)} title="Toggle web search"
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                          style={{ color: webSearchEnabled ? 'var(--accent-primary)' : 'var(--text-muted)', backgroundColor: webSearchEnabled ? 'var(--bg-hover)' : 'transparent' }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        </button>
                        <div className="flex items-center gap-1.5 rounded-lg px-2 h-8 border w-32 transition-all focus-within:border-blue-500"
                          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-hover)' }}>
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.48 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.152-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.52-4.477-10-10-10z" /></svg>
                          <input type="text" placeholder="Repo URL" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                            className="bg-transparent outline-none border-none text-xs flex-1 min-w-0"
                            style={{ color: 'var(--text-primary)' }} />
                        </div>
                      </div>
                      <button onClick={handleSend} disabled={loading || !prompt.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
                        {loading
                          ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    <kbd className="px-1.5 py-0.5 rounded border font-mono text-xs" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-hover)' }}>Enter</kbd> to send &nbsp;·&nbsp;
                    <kbd className="px-1.5 py-0.5 rounded border font-mono text-xs" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-hover)' }}>Shift+Enter</kbd> for new line
                  </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: 'var(--bg-hover)' }}>🤖</div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Select an agent from the sidebar</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
