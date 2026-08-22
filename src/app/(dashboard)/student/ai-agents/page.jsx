"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const STORAGE_KEY = 'eduvantix_ai_conversations';
const DEFAULT_AGENT = 'coding';

const DEFAULT_MODELS = [
  { label: 'Auto', sublabel: 'Best for the task', provider: 'AUTO', model: 'AUTO' }
];

const SUGGESTIONS = [
  { icon: '💡', text: 'Explain React Hooks in simple terms' },
  { icon: '🐛', text: 'Debug my JavaScript code' },
  { icon: '🗄️', text: 'Help me write a SQL query' },
  { icon: '📄', text: 'Review and improve my code' },
];

function groupConversationsByDate(conversations) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);
  const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 30);
  const groups = { Today: [], Yesterday: [], 'Past 7 days': [], 'Past 30 days': [], Older: [] };
  conversations.forEach(c => {
    const d = new Date(c.updatedAt);
    if (d >= today) groups.Today.push(c);
    else if (d >= yesterday) groups.Yesterday.push(c);
    else if (d >= sevenDaysAgo) groups['Past 7 days'].push(c);
    else if (d >= thirtyDaysAgo) groups['Past 30 days'].push(c);
    else groups.Older.push(c);
  });
  return groups;
}

function loadConversations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveConversations(convs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

// ────────────────────────────────────────────────────────────────────────────
// Icons (inline SVGs for self-containment)
// ────────────────────────────────────────────────────────────────────────────
const IconPencilSquare = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);
const IconSearch = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
  </svg>
);
const IconMenu = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const IconChevronDown = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
const IconChevronRight = ({ size = 12, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const IconSend = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const IconPaperclip = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);
const IconGlobe = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
  </svg>
);
const IconGitHub = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.48 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.152-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.52-4.477-10-10-10z" />
  </svg>
);
const IconSpinner = ({ size = 16 }) => (
  <svg width={size} height={size} className="animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const IconCopy = ({ size = 13 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

// ────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────
export default function AIAgentsPage() {
  const { token } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [openThoughts, setOpenThoughts] = useState({});
  const [error, setError] = useState('');

  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef(null);

  const [agentId, setAgentId] = useState(DEFAULT_AGENT);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const hasMessages = messages.length > 0;

  useEffect(() => { setConversations(loadConversations()); }, []);

  useEffect(() => {
    if (!token) return;
    const authToken = token || localStorage.getItem('eduvantix_auth_token');
    fetch(`${API_BASE}/api/ai/agents`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(d => { if (d.success && d.agents.length > 0) setAgentId(d.agents[0].id); })
      .catch(() => {});

    fetch(`${API_BASE}/api/ai/models`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.providers && d.providers.length > 0) {
          setAvailableProviders(d.providers);
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) setModelDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const startNewChat = () => {
    setActiveConvId(null); setMessages([]); setError(''); setPrompt(''); setAttachments([]);
  };

  const loadConversation = (conv) => {
    setActiveConvId(conv.id); setMessages(conv.messages || []); setError('');
  };

  const deleteConversation = (e, convId) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated); saveConversations(updated);
    if (activeConvId === convId) startNewChat();
  };

  const handleSend = async (overridePrompt) => {
    const text = (overridePrompt || prompt).trim();
    if (!text) return;

    const apiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.thinking ? `<think>${m.thinking}</think>\n\n${m.content}` : m.content }));

    const userMsg = { role: 'user', content: text, attachments: attachments.map(f => f.originalname) };
    const assistantMsg = { role: 'assistant', content: '', thinking: null, isStreaming: true };
    const newMessages = [...messages, userMsg, assistantMsg];

    setMessages(newMessages);
    setPrompt('');
    setAttachments([]);
    setLoading(true);
    setIsThinking(true);
    setError('');

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const convId = activeConvId || `conv_${Date.now()}`;
    const convTitle = text.slice(0, 60) + (text.length > 60 ? '…' : '');
    if (!activeConvId) setActiveConvId(convId);

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const capabilities = [];
      const capabilityParams = {};
      if (webSearchEnabled) { capabilities.push('WebSearch'); capabilityParams.searchQuery = text; }
      if (githubUrl) { capabilities.push('GitHub'); capabilityParams.githubUrl = githubUrl; }

      let fileContextBlock = '';
      if (attachments.length > 0) {
        fileContextBlock = attachments.map(f => {
          if (f.extractedText) return `--- FILE: ${f.originalname} ---\n${f.extractedText}\n--- END OF FILE ---`;
          if (f.extractionError) return `--- FILE: ${f.originalname} ---\n[Could not read: ${f.extractionError}]\n--- END OF FILE ---`;
          return '';
        }).filter(Boolean).join('\n\n');
      }

      const codeBlockMatch = text.match(/```(python|javascript|js|node|c\+\+|cpp|c|java)\n([\s\S]*?)```/i);
      let finalLanguage = null;
      if (codeBlockMatch) {
        let lang = codeBlockMatch[1].toLowerCase();
        if (lang === 'js' || lang === 'node') lang = 'javascript';
        if (lang === 'cpp') lang = 'c++';
        finalLanguage = lang;
        capabilities.push('CodeExecution');
        capabilityParams.language = finalLanguage;
        capabilityParams.code = codeBlockMatch[2].trim();
      }

      const messageWithContext = fileContextBlock ? `${fileContextBlock}\n\n--- USER QUERY ---\n${text}` : text;
      const newApiMessages = [...apiMessages, { role: 'user', content: messageWithContext }];

      const res = await fetch(`${API_BASE}/api/ai/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          agent: agentId, messages: newApiMessages,
          provider: selectedModel.provider,
          model: selectedModel.model === 'AUTO' ? undefined : selectedModel.model,
          capabilities, capabilityParams,
        }),
      });

      if (!res.ok) {
        const ed = await res.json().catch(() => ({}));
        throw new Error(ed.error || 'Failed to start stream');
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
              setLoading(false); setIsThinking(false);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
                setConversations(prevConvs => {
                  const existing = prevConvs.find(c => c.id === convId);
                  let updatedConvs;
                  if (existing) {
                    updatedConvs = prevConvs.map(c => c.id === convId ? { ...c, messages: updated, updatedAt: new Date().toISOString() } : c);
                  } else {
                    updatedConvs = [{ id: convId, title: convTitle, messages: updated, updatedAt: new Date().toISOString() }, ...prevConvs];
                  }
                  saveConversations(updatedConvs);
                  return updatedConvs;
                });
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
              let thinkingField = null, contentField = '', stillStreaming = true;
              if (openIdx !== -1) {
                if (closeIdx !== -1) {
                  thinkingField = rawAccum.slice(openIdx + 7, closeIdx).trim();
                  contentField = rawAccum.slice(closeIdx + 8).trim();
                  stillStreaming = false; setIsThinking(false);
                } else { thinkingField = rawAccum.slice(openIdx + 7); setIsThinking(true); }
              } else { contentField = rawAccum.trim(); stillStreaming = false; setIsThinking(false); }
              setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                updated[updated.length - 1] = { role: 'assistant', thinking: thinkingField, content: contentField, isStreaming: stillStreaming, routing: chunkRouting || lastMsg?.routing || null };
                return updated;
              });
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setIsThinking(false); }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingFiles(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/upload`, { method: 'POST', headers: { Authorization: `Bearer ${authToken}` }, body: formData });
      const data = await res.json();
      if (data.success) setAttachments(prev => [...prev, ...data.files]);
      else setError(data.error || 'Upload failed');
    } catch { setError('File upload failed'); }
    finally { setUploadingFiles(false); e.target.value = ''; }
  };

  const filteredConversations = conversations.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const grouped = groupConversationsByDate(filteredConversations);

  // ── Markdown Components ─────────────────────────────────────────────────
  const mdComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative group rounded-xl overflow-hidden my-4 text-[13px]" style={{ border: '1px solid #2d2d2d' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1a1a1a', color: '#888' }}>
            <span className="font-mono text-xs">{match[1]}</span>
            <button onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
              className="flex items-center gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md hover:bg-white/10">
              <IconCopy /> Copy
            </button>
          </div>
          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', lineHeight: '1.6' }} {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="px-1.5 py-0.5 rounded text-[13px] font-mono" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--accent-primary)' }} {...props}>{children}</code>
      );
    },
    p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-7 text-[15px]" style={{ color: 'var(--text-primary)' }} {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-[15px]" style={{ color: 'var(--text-primary)' }} {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-[15px]" style={{ color: 'var(--text-primary)' }} {...props} />,
    li: ({ node, ...props }) => <li className="leading-7" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }} {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 mt-5" style={{ color: 'var(--text-primary)' }} {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 mt-4" style={{ color: 'var(--text-primary)' }} {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 my-4 italic text-sm" style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-muted)' }} {...props} />,
    table: ({ node, ...props }) => <div className="overflow-x-auto mb-4 rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}><table className="min-w-full" {...props} /></div>,
    th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }} {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-3 text-sm border-t" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }} {...props} />,
    a: ({ node, ...props }) => <a className="underline decoration-dotted underline-offset-2 hover:decoration-solid" style={{ color: 'var(--accent-primary)' }} target="_blank" rel="noreferrer" {...props} />,
    strong: ({ node, ...props }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }} {...props} />,
    hr: ({ node, ...props }) => <hr className="my-6 border" style={{ borderColor: 'var(--border-primary)' }} {...props} />,
  };

  // ── Model Dropdown ──────────────────────────────────────────────────────
  const ModelDropdown = () => (
    <div className="relative" ref={modelDropdownRef}>
      <button
        onClick={() => setModelDropdownOpen(o => !o)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', backgroundColor: 'transparent' }}
      >
        {selectedModel.label}
        <IconChevronDown className={`transition-transform duration-150 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {modelDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border shadow-xl overflow-hidden z-50"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Model</p>
          </div>
          {MODELS.map(m => (
            <button key={m.model}
              onClick={() => { setSelectedModel(m); setModelDropdownOpen(false); }}
              className="w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors hover:bg-[var(--bg-hover)]">
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{m.label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.sublabel}</div>
              </div>
              {selectedModel.model === m.model && (
                <span style={{ color: 'var(--accent-primary)' }}><IconCheck /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Input Box ───────────────────────────────────────────────────────────
  const renderInputBox = () => {
    return (
    <div className="w-full">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border text-xs"
              style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
              📎 <span className="truncate max-w-[120px]">{file.originalname}</span>
              <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:text-red-400 text-base leading-none ml-1">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[20px] border transition-all duration-150 focus-within:shadow-md"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 220) + 'px';
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message AI Assistant…"
          rows={1}
          className="w-full resize-none bg-transparent outline-none px-5 pt-4 pb-3 text-[15px] leading-relaxed"
          style={{ color: 'var(--text-primary)', minHeight: '56px', maxHeight: '220px' }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-0 gap-2">
          <div className="flex items-center gap-0.5">
            {/* Attach */}
            <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingFiles} />
            <label htmlFor="file-upload" title="Attach file"
              className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}>
              {uploadingFiles ? <IconSpinner size={15} /> : <IconPaperclip size={15} />}
            </label>

            {/* Web Search */}
            <button onClick={() => setWebSearchEnabled(!webSearchEnabled)} title="Web search"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: webSearchEnabled ? 'var(--accent-primary)' : 'var(--text-muted)', backgroundColor: webSearchEnabled ? 'var(--bg-hover)' : 'transparent' }}>
              <IconGlobe size={15} />
            </button>

            {/* GitHub URL */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1 h-8 px-2.5 rounded-lg border"
              style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}><IconGitHub size={13} /></span>
              <input type="text" placeholder="Repo URL" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                className="bg-transparent outline-none border-none text-xs w-24" style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={modelDropdownRef} className="relative">
              <button
                onClick={() => setModelDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-primary)', backgroundColor: 'transparent' }}
              >
                {selectedModel.label}
                <IconChevronDown className={`transition-transform duration-150 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {modelDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Available Models</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                    <button
                      onClick={() => { setSelectedModel(DEFAULT_MODELS[0]); setModelDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between rounded-lg transition-colors hover:bg-[var(--bg-hover)] ${selectedModel.model === 'AUTO' ? 'bg-[var(--bg-hover)]' : ''}`}>
                      <div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Auto</div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Best available routing</div>
                      </div>
                      {selectedModel.model === 'AUTO' && <span style={{ color: 'var(--accent-primary)' }}><IconCheck /></span>}
                    </button>

                    {availableProviders.map(p => (
                      <div key={p.provider} className="mt-1">
                        <div className="px-3 py-1.5 mt-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          {p.provider}
                        </div>
                        {p.models.map(m => (
                          <button key={m.id}
                            onClick={() => { 
                              setSelectedModel({ label: m.displayName || m.id, sublabel: m.id, provider: p.provider, model: m.id }); 
                              setModelDropdownOpen(false); 
                            }}
                            className={`w-full text-left px-3 py-2.5 flex items-center justify-between rounded-lg transition-colors hover:bg-[var(--bg-hover)] ${selectedModel.model === m.id ? 'bg-[var(--bg-hover)]' : ''}`}>
                            <div className="min-w-0 pr-3">
                              <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{m.displayName || m.id}</div>
                              <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{m.id}</div>
                            </div>
                            {selectedModel.model === m.id && <span className="flex-shrink-0" style={{ color: 'var(--accent-primary)' }}><IconCheck /></span>}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => handleSend()} disabled={loading || !prompt.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0"
              style={{
                backgroundColor: (prompt.trim() && !loading) ? 'var(--accent-primary)' : 'var(--border-primary)',
                color: (prompt.trim() && !loading) ? '#fff' : 'var(--text-muted)',
                cursor: prompt.trim() && !loading ? 'pointer' : 'not-allowed',
              }}>
              {loading ? <IconSpinner size={14} /> : <IconSend size={14} />}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] mt-2" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
        AI can make mistakes. Verify important information.
      </p>
    </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)', backgroundColor: 'var(--bg-primary)' }}>

      {/* ═══ SIDEBAR ════════════════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 flex flex-col border-r transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? '240px' : '0px',
          borderColor: 'var(--border-primary)',
          backgroundColor: 'var(--bg-card)',
        }}>
        <div className="flex flex-col h-full" style={{ minWidth: '240px' }}>

          {/* Sidebar Header */}
          <div className="px-3 pt-4 pb-3 flex-shrink-0">
            <button onClick={startNewChat}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-[var(--bg-hover)] mb-3"
              style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-primary)' }}>
                <IconPencilSquare size={16} />
              </span>
              <span className="text-sm font-medium">New chat</span>
            </button>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                <IconSearch size={13} />
              </span>
              <input
                type="text"
                placeholder="Search chats…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg pl-8 pr-3 py-2 text-xs outline-none border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
            {conversations.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No conversations yet.</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start a new chat!</p>
              </div>
            ) : (
              Object.entries(grouped).map(([groupLabel, convs]) => {
                if (!convs.length) return null;
                return (
                  <div key={groupLabel} className="mb-3">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {groupLabel}
                    </p>
                    {convs.map(conv => (
                      <div key={conv.id} className="group relative">
                        <button
                          onClick={() => loadConversation(conv)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate"
                          style={{
                            backgroundColor: activeConvId === conv.id ? 'var(--bg-hover)' : 'transparent',
                            color: activeConvId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: activeConvId === conv.id ? 500 : 400,
                            paddingRight: '2rem',
                          }}
                          onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          {conv.title || 'New Conversation'}
                        </button>
                        <button
                          onClick={(e) => deleteConversation(e, conv.id)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                          style={{ color: 'var(--text-muted)' }}>
                          <IconTrash size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN AREA ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center px-4 py-2.5 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg mr-3 transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}>
            <IconMenu size={17} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assistant</span>
          </div>

          {hasMessages && (
            <button onClick={startNewChat}
              className="ml-auto flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border transition-colors hover:bg-[var(--bg-hover)]"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
              <IconPencilSquare size={13} />
              New chat
            </button>
          )}
        </div>

        {/* ── Empty / Welcome State ─────────────────────────────────────── */}
        {!hasMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 5% 4rem' }}>
            <div className="w-full" style={{ maxWidth: '680px' }}>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-semibold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  What can I help with?
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {selectedModel.label === 'Auto' ? 'Best model selected automatically' : `Using ${selectedModel.label} · ${selectedModel.sublabel}`}
                </p>
              </div>

              {renderInputBox()}

              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i}
                    onClick={() => { setPrompt(s.text); setTimeout(() => textareaRef.current?.focus(), 50); }}
                    className="flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-150 hover:shadow-sm"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }}>
                    <span className="text-xl leading-none">{s.icon}</span>
                    <span className="text-sm leading-snug">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        ) : (
          /* ── Active Chat ──────────────────────────────────────────────── */
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="mx-auto w-full py-8" style={{ maxWidth: '780px', padding: '2.5rem 1.5rem' }}>
                {messages.map((msg, i) => {
                  if (msg.role === 'assistant' && !msg.content && !msg.thinking) return null;

                  if (msg.role === 'user') {
                    return (
                      <div key={i} className="flex justify-end mb-8">
                        <div style={{ maxWidth: '75%' }}>
                          {msg.attachments?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
                              {msg.attachments.map((fname, ai) => (
                                <span key={ai} className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
                                  📎 {fname}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="px-5 py-3.5 rounded-3xl rounded-br-md text-[15px] leading-relaxed whitespace-pre-wrap"
                            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const hasThinking = msg.thinking !== null && msg.thinking !== undefined;
                  const isThoughtOpen = openThoughts[i] !== false;
                  const isStillStreaming = msg.isStreaming && hasThinking && !msg.content;

                  return (
                    <div key={i} className="flex gap-4 items-start mb-8">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Thinking panel */}
                        {hasThinking && (
                          <div className="mb-4 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
                            <button
                              onClick={() => setOpenThoughts(prev => ({ ...prev, [i]: !isThoughtOpen }))}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
                              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                              <IconChevronRight className={`transition-transform duration-150 ${isThoughtOpen ? 'rotate-90' : ''}`} />
                              {isStillStreaming ? (
                                <span className="flex items-center gap-2">
                                  <span className="flex gap-1">
                                    {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                                  </span>
                                  Thinking…
                                </span>
                              ) : 'Reasoning'}
                            </button>
                            {isThoughtOpen && (
                              <div className="px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap border-t"
                                style={{ color: 'var(--text-muted)', borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}>
                                {msg.thinking || <span className="animate-pulse">…</span>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="text-[15px] leading-relaxed markdown-body">
                          {msg.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                              {msg.content}
                            </ReactMarkdown>
                          ) : !isStillStreaming ? (
                            <div className="flex gap-1 py-2">
                              {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                            </div>
                          ) : null}
                          {msg.isStreaming && msg.content && (
                            <span className="inline-block w-0.5 h-4 rounded-full animate-pulse ml-0.5 align-text-bottom" style={{ backgroundColor: 'var(--accent-primary)' }} />
                          )}
                        </div>

                        {/* Model routing badge */}
                        {msg.routing && (
                          <div className="mt-3 text-[11px] flex items-center gap-1.5 opacity-40" style={{ color: 'var(--text-muted)' }}>
                            <span>via {msg.routing.actualModel}</span>
                            {msg.routing.fallbackUsed && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">fallback</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Initial thinking state before any message appears */}
                {loading && isThinking && !messages.some(m => m.role === 'assistant' && (m.content || m.thinking)) && (
                  <div className="flex gap-4 items-start mb-8">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium"
                      style={{ backgroundColor: '#fff1f1', borderColor: '#fca5a5', color: '#dc2626' }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom input */}
            <div className="flex-shrink-0 border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', padding: '1rem 3%' }}>
              <div className="mx-auto" style={{ maxWidth: '780px' }}>
                {renderInputBox()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
