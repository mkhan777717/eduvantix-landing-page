"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  useEffect(() => {
    if (token) fetchAgents();
  }, [token, fetchAgents]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    // Only send user messages (strip thinking/response separation for API)
    const apiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.thinking ? `<think>${m.thinking}</think>\n\n${m.content}` : m.content }));
    const newApiMessages = [...apiMessages, { role: 'user', content: prompt }];

    setMessages(prev => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: '', thinking: null, isStreaming: true }
    ]);
    setPrompt('');
    setLoading(true);
    setIsThinking(true);
    setError('');

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ agent: selectedAgentId, messages: newApiMessages, provider, model: model === 'AUTO' ? undefined : model })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let rawAccum = '';  // accumulates everything
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

              // --- Stream-time parsing ---
              // Route each chunk to thinking or content field
              const openIdx = rawAccum.indexOf('<think>');
              const closeIdx = rawAccum.indexOf('</think>');

              let thinkingField = null;
              let contentField = '';
              let stillStreaming = true;

              if (openIdx !== -1) {
                if (closeIdx !== -1) {
                  // Both tags present → complete think block
                  thinkingField = rawAccum.slice(openIdx + 7, closeIdx).trim();
                  contentField = rawAccum.slice(closeIdx + 8).trim();
                  stillStreaming = false;
                  setIsThinking(false);
                } else {
                  // Think tag open, still receiving thoughts
                  thinkingField = rawAccum.slice(openIdx + 7);
                  contentField = '';
                  setIsThinking(true);
                }
              } else {
                // No think tags → direct response
                thinkingField = null;
                contentField = rawAccum.trim();
                stillStreaming = false;
                setIsThinking(false);
              }

              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  thinking: thinkingField,
                  content: contentField,
                  isStreaming: stillStreaming
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

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex h-[calc(100vh-100px)] p-6 max-w-6xl mx-auto gap-6">
      {/* Agent Selector Sidebar */}
      <div className="w-1/3 rounded-xl shadow-sm border p-4 flex flex-col h-full overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>AI Agents</h2>
        {loadingAgents ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading agents...</p>
        ) : (
          <div className="space-y-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setSelectedAgentId(agent.id); setMessages([]); setError(""); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAgentId === agent.id 
                    ? 'shadow-sm' 
                    : 'border-transparent'
                }`}
                style={{ 
                  backgroundColor: selectedAgentId === agent.id ? 'var(--bg-hover)' : 'transparent',
                  borderColor: selectedAgentId === agent.id ? 'var(--accent-primary)' : 'transparent',
                }}
                onMouseEnter={e => { if (selectedAgentId !== agent.id) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (selectedAgentId !== agent.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{agent.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col h-full">
        {selectedAgent ? (
          <div className="flex flex-col h-full rounded-xl shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            
            {/* Agent Header */}
            <div className="p-4 border-b rounded-t-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedAgent.name}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedAgent.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedAgent.allowedCapabilities && selectedAgent.allowedCapabilities.length > 0 ? (
                  selectedAgent.allowedCapabilities.map(cap => (
                    <span key={cap} className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>
                      ✓ {cap}
                    </span>
                  ))
                ) : (
                  // Fallback for older configs
                  <>
                    {selectedAgent.supportsCode && <span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>Code</span>}
                    {selectedAgent.supportsFiles && <span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>Files</span>}
                    {selectedAgent.supportsSearch && <span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>Search</span>}
                    {selectedAgent.supportsVision && <span className="px-2 py-0.5 rounded text-xs border" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)', borderColor: 'var(--border-primary)' }}>Vision</span>}
                  </>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }}>
                    ✨
                  </div>
                  <h3 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>How can I help you today?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md mt-4">
                    {selectedAgent.examplePrompts?.map((ex, i) => (
                      <button 
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="text-left p-3 text-sm border rounded-lg transition-all"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => {
                    if (msg.role === 'assistant' && !msg.content && !msg.thinking) return null;

                    if (msg.role === 'user') {
                      return (
                        <div key={i} className="flex justify-end">
                          <div className="max-w-[80%] rounded-2xl rounded-br-none p-4 shadow-sm border"
                            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff', borderColor: 'var(--accent-primary)' }}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      );
                    }

                    const hasThinking = msg.thinking !== null && msg.thinking !== undefined;
                    const isThoughtOpen = openThoughts[i] !== false;
                    const isStillThinking = msg.isStreaming && hasThinking && !msg.content;

                    return (
                      <div key={i} className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl rounded-bl-none p-4 shadow-sm border markdown-body overflow-hidden w-full"
                          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}
                        >
                          {hasThinking && (
                            <div className="mb-4 text-[13.5px]" style={{ color: 'var(--text-muted)' }}>
                              <button
                                onClick={() => setOpenThoughts(prev => ({ ...prev, [i]: !isThoughtOpen }))}
                                className="font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5 w-full text-left"
                              >
                                <span>{isStillThinking ? 'Thinking...' : 'Thought Process'}</span>
                                <svg
                                  className="w-3.5 h-3.5 opacity-60 transition-transform"
                                  style={{ transform: isThoughtOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {isThoughtOpen && (
                                <div className="mt-2 pl-4 border-l-[3px] border-gray-600/50 whitespace-pre-wrap text-[13px]" style={{ color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                                  {msg.thinking || <span className="animate-pulse">...</span>}
                                </div>
                              )}
                            </div>
                          )}

                          {msg.content ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <div className="relative group rounded-md overflow-hidden my-4 border" style={{ borderColor: 'var(--border-primary)' }}>
                                      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-gray-200 text-xs">
                                        <span>{match[1]}</span>
                                        <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))} className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">Copy Code</button>
                                      </div>
                                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0 }} {...props}>
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code className="px-1 py-0.5 rounded text-sm font-mono" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }} {...props}>{children}</code>
                                  );
                                },
                                p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 border-b pb-2" style={{ borderColor: 'var(--border-primary)' }} {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 border-b pb-1" style={{ borderColor: 'var(--border-primary)' }} {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="min-w-full divide-y border" style={{ borderColor: 'var(--border-primary)' }} {...props} /></div>,
                                th: ({node, ...props}) => <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }} {...props} />,
                                td: ({node, ...props}) => <td className="px-4 py-2 text-sm border-t" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }} {...props} />
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : !isStillThinking ? (
                            <span className="animate-pulse" style={{ color: 'var(--text-muted)' }}>...</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {loading && isThinking && !messages.some(m => m.role === 'assistant' && (m.content || m.thinking)) && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 shadow-sm border rounded-bl-none" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                        <div className="text-[13.5px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="font-medium flex items-center gap-1.5">
                            <span>Thinking...</span>
                            <svg className="w-3.5 h-3.5 opacity-60 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          <div className="mt-2 pl-4 border-l-[3px] border-gray-600/50" style={{ color: 'var(--text-secondary)' }}>
                            <span className="animate-pulse">...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex justify-center my-4">
                      <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
                        {error}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t rounded-b-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div className="flex gap-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none border rounded-xl p-3 focus:outline-none min-h-[50px] max-h-[150px]"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !prompt.trim()}
                  className="text-white rounded-xl px-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onMouseEnter={e => { if (!loading && prompt.trim()) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  Send
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            Select an agent to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
