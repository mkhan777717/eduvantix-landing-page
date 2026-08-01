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

    const newMessages = [...messages, { role: 'user', content: prompt }];
    setMessages([...newMessages, { role: 'assistant', content: "" }]);
    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/agent/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          agent: selectedAgentId,
          messages: newMessages,
          provider: provider,
          model: model === 'AUTO' ? undefined : model
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantMessage = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
          const chunkStr = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 2);
          
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                setLoading(false);
                return;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.error) {
                  setError(data.error);
                  setLoading(false);
                  return;
                }
                if (data.text) {
                  assistantMessage += data.text;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore partial JSON chunks if they somehow still happen
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex h-[calc(100vh-100px)] p-6 max-w-6xl mx-auto gap-6">
      {/* Agent Selector Sidebar */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">AI Agents</h2>
        {loadingAgents ? (
          <p className="text-gray-500">Loading agents...</p>
        ) : (
          <div className="space-y-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => { setSelectedAgentId(agent.id); setMessages([]); setError(""); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAgentId === agent.id 
                    ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-700'
                }`}
              >
                <div className="font-semibold">{agent.name}</div>
                <div className="text-xs text-gray-500 truncate">{agent.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 flex flex-col h-full">
        {selectedAgent ? (
          <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
            
            {/* Agent Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h1 className="text-2xl font-bold text-gray-800">{selectedAgent.name}</h1>
              <p className="text-gray-600 text-sm mt-1">{selectedAgent.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedAgent.supportsCode && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs border border-indigo-100">Code</span>}
                {selectedAgent.supportsFiles && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs border border-emerald-100">Files</span>}
                {selectedAgent.supportsSearch && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">Search</span>}
                {selectedAgent.supportsVision && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs border border-purple-100">Vision</span>}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-2">
                    ✨
                  </div>
                  <h3 className="text-xl font-medium text-gray-700">How can I help you today?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md mt-4">
                    {selectedAgent.examplePrompts?.map((ex, i) => (
                      <button 
                        key={i}
                        onClick={() => setPrompt(ex)}
                        className="text-left p-3 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100 markdown-body overflow-hidden'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative group rounded-md overflow-hidden my-4 border border-gray-200">
                                    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 text-gray-200 text-xs">
                                      <span>{match[1]}</span>
                                      <button 
                                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\\n$/, ''))}
                                        className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                                      >
                                        Copy Code
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{ margin: 0, borderRadius: 0 }}
                                      {...props}
                                    >
                                      {String(children).replace(/\\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                )
                              },
                              p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6 border-b pb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5 border-b pb-1" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                              table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="min-w-full divide-y divide-gray-200 border" {...props} /></div>,
                              th: ({node, ...props}) => <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
                              td: ({node, ...props}) => <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-t" {...props} />
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-500 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 p-4">
                        <span className="animate-pulse">Thinking...</span>
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
            <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl">
              <div className="flex gap-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] max-h-[150px]"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !prompt.trim()}
                  className="bg-blue-600 text-white rounded-xl px-6 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  Send
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select an agent to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
