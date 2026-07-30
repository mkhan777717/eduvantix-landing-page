"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowLeft, BookOpen, Play, Code2, FileQuestion,
  ClipboardList, FileText, CheckCircle, X, Menu, BarChart2,
  ThumbsUp, ThumbsDown, RefreshCw, Check, AlertCircle, Loader,
  Trophy, Lock, ChevronDown, ExternalLink, Send, Terminal, Sparkles
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ICONS = { CONCEPT: BookOpen, VIDEO: Play, MCQ: FileQuestion, CODING: Code2, ASSIGNMENT: ClipboardList, TEST: FileText };
const TYPE_COLORS = {
  CONCEPT: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  VIDEO: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  MCQ: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  CODING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ASSIGNMENT: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  TEST: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};
const LANG_LABELS = { python: "Python", cpp: "C++", java: "Java" };

function CommonDoubtsSection({ doubts }) {
  if (!doubts || doubts.length === 0) return null;
  return (
    <div className="space-y-3 pt-6 border-t border-[var(--border-primary)]">
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Common Doubts</p>
      <div className="space-y-2">
        {doubts.map((d, i) => (
          <details key={i} className="group rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden">
            <summary className="px-4 py-3 text-xs font-bold cursor-pointer hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
              <span>▶ {d.question}</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {d.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

import { renderMarkdown, getYtId } from "@/lib/renderMarkdown";

// ── Concept Renderer ──────────────────────────────────────────────────────────

function ConceptContent({ step, onScrollProgress }) {
  const contentRef = useRef(null);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrolled = el.scrollTop + el.clientHeight;
    const total = el.scrollHeight;
    const pct = Math.round((scrolled / total) * 100);
    onScrollProgress(pct);
  }, [onScrollProgress]);

  useEffect(() => {
    const el = contentRef.current;
    if (el) el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  const ytId = step.videoUrl ? getYtId(step.videoUrl) : null;

  return (
    <div ref={contentRef} className="h-full overflow-y-auto px-6 md:px-12 py-8 space-y-6" onScroll={handleScroll}>
      <div className="max-w-4xl mx-auto space-y-6">
        {ytId && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] aspect-video shadow-xl">
            <iframe className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        )}
        <div className="prose-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(step.content) }} />
        <CommonDoubtsSection doubts={step.commonDoubts} />
      </div>
    </div>
  );
}

// ── Video Content ─────────────────────────────────────────────────────────────

function VideoContent({ step, onWatchProgress }) {
  const getYtId = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYtId(step.videoUrl);
  const [watched, setWatched] = useState(0);
  const intervalRef = useRef(null);

  const startTracking = () => {
    intervalRef.current = setInterval(() => {
      setWatched(p => {
        const next = p + 1;
        onWatchProgress(next);
        return next;
      });
    }, 1000);
  };

  const stopTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-[var(--bg-primary)]">
      <div className="w-full bg-black aspect-video max-h-[60vh] flex items-center justify-center shrink-0">
        {ytId ? (
          <iframe className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onPlay={startTracking} onPause={stopTracking} onEnded={stopTracking} />
        ) : (
          <p className="text-white text-sm">No video URL available.</p>
        )}
      </div>
      {step.content && (
        <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto w-full">
          <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Notes</h3>
          <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{step.content}</div>
        </div>
      )}
    </div>
  );
}

// ── MCQ Content ───────────────────────────────────────────────────────────────

function MCQContent({ step, progress, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const alreadyAnswered = progress?.mcqAnswer != null;
  const dbAnswerIndex = progress?.mcqAnswer;
  const dbIsCorrect = progress?.mcqIsCorrect;

  const handleSubmit = async () => {
    if (selected === null) return;
    setSubmitting(true);
    const data = await onSubmit(selected);
    if (data) {
      setResult(data);
      setIsRetrying(false);
    }
    setSubmitting(false);
  };

  const isSubmitted = !isRetrying && (result || alreadyAnswered);

  return (
    <div className="h-full overflow-y-auto px-6 md:px-12 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Question Header */}
        <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-accent)]">Question</span>
            {isSubmitted && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${(result?.isCorrect || dbIsCorrect)
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/30"
                }`}>
                {(result?.isCorrect || dbIsCorrect) ? "✓ Correct" : "❌ Incorrect"}
              </span>
            )}
          </div>
          <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>{step.questionText}</p>
        </div>

        {/* MCQ Options */}
        <div className="space-y-3">
          {step.mcqOptions?.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isUserSelected = result
              ? selected === opt.id
              : !isRetrying && alreadyAnswered
                ? dbAnswerIndex === i
                : selected === opt.id;
            const isCorrectOption = opt.isCorrect || (result?.correctOptionId === opt.id);

            let style = "border-[var(--border-primary)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)]";
            let badge = null;

            if (isSubmitted) {
              if (isCorrectOption) {
                style = "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md font-bold";
                badge = <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> Correct Answer</span>;
              } else if (isUserSelected && !isCorrectOption) {
                style = "border-rose-500 bg-rose-500/10 text-rose-400 font-bold";
                badge = <span className="text-xs font-bold text-rose-400 flex items-center gap-1"><X size={14} /> Your Answer (Incorrect)</span>;
              } else {
                style = "border-[var(--border-primary)] bg-[var(--bg-secondary)] opacity-50";
              }
            } else if (isUserSelected) {
              style = "border-[var(--border-accent)] bg-[var(--accent-glow)] text-[var(--text-accent)] font-bold shadow-md";
            }

            return (
              <button key={opt.id} disabled={isSubmitted || submitting}
                onClick={() => setSelected(opt.id)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all ${style} ${!isSubmitted ? "cursor-pointer" : "cursor-default"}`}>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isSubmitted && isCorrectOption
                    ? "bg-emerald-500 text-white"
                    : isSubmitted && isUserSelected && !isCorrectOption
                      ? "bg-rose-500 text-white"
                      : isUserSelected
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--bg-secondary)]"
                  }`} style={!(isUserSelected || (isSubmitted && isCorrectOption)) ? { color: "var(--text-muted)" } : undefined}>
                  {letter}
                </span>
                <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{opt.text}</span>
                {badge}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Card */}
        {isSubmitted && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border space-y-3 ${(result?.isCorrect || dbIsCorrect)
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/10"
              }`}>
            <div className="flex items-center justify-between">
              <p className={`font-bold text-sm flex items-center gap-2 ${(result?.isCorrect || dbIsCorrect) ? "text-emerald-400" : "text-rose-400"
                }`}>
                {(result?.isCorrect || dbIsCorrect) ? <CheckCircle size={16} /> : <X size={16} />}
                {(result?.isCorrect || dbIsCorrect) ? "Correct Answer!" : "Incorrect Answer"}
              </p>
              <button onClick={() => { setIsRetrying(true); setResult(null); setSelected(null); }}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border-primary)] hover:border-[var(--border-accent)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                style={{ color: "var(--text-primary)" }}>
                <RefreshCw size={12} /> Re-attempt Question
              </button>
            </div>
            {(step.explanation || result?.explanation) && (
              <div className="pt-2 border-t border-[var(--border-primary)] text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <span className="font-bold text-[var(--text-primary)]">Explanation: </span>
                {result?.explanation || step.explanation}
              </div>
            )}
          </motion.div>
        )}

        {!isSubmitted && (
          <button onClick={handleSubmit} disabled={selected === null || submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg"
            style={{ background: "var(--accent-gradient)" }}>
            {submitting ? <><RefreshCw size={15} className="animate-spin" /> Checking Answer...</> : <><Send size={15} /> Submit Answer</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Starter Templates ─────────────────────────────────────────────────────────

const DEFAULT_STARTER_TEMPLATES = {
  python: `# Write your Python 3 solution here\n`,
  cpp: `// Write your C++ 17 solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
  java: `// Write your Java 17 solution here\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
  javascript: `// Write your JavaScript solution here\n`,
  go: `// Write your Go 1.20 solution here\npackage main\n\nfunc main() {\n    \n}\n`,
  c: `// Write your C 11 solution here\n#include <stdio.h>\n\nint main() {\n    return 0;\n}\n`
};

const ALL_LANGUAGES = [
  { id: "python", name: "Python 3", monaco: "python" },
  { id: "cpp", name: "C++ 17", monaco: "cpp" },
  { id: "java", name: "Java 17", monaco: "java" },
  { id: "javascript", name: "JavaScript", monaco: "javascript" },
  { id: "go", name: "Go 1.20", monaco: "go" },
  { id: "c", name: "C 11", monaco: "c" },
];

const cleanExecutionError = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:[a-zA-Z]:\\|\/)[^\s\n'":]+\/(?:submission|temp|src|tmp|usr|var|app)[^\s\n'":]*\/([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/g, '$1')
    .replace(/(?:[a-zA-Z]:\\|\/)[^\s\n'":]+\/submission_[0-9]+_[^\s\n'":]*\//g, '')
    .replace(/(?:[a-zA-Z]:\\|\/)[^\s\n'":]*\/(?:eduvantix|eduvantix-backend|src|temp)\/[^\s\n'":]*\/([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/gi, '$1')
    .trim();
};

function CodingContent({ step, progress, onRunCode, onSubmitCode }) {
  const allowedLangs = (step.starterCode?.allowedLanguages && Array.isArray(step.starterCode.allowedLanguages) && step.starterCode.allowedLanguages.length > 0)
    ? step.starterCode.allowedLanguages
    : ["python", "cpp", "java", "javascript", "go", "c"];

  const availableLangs = ALL_LANGUAGES.filter(l => allowedLangs.includes(l.id));

  const [lang, setLang] = useState(() => availableLangs[0]?.id || "python");
  const [editorCodes, setEditorCodes] = useState({});
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcase"); // 'testcase' | 'result' | 'verdict'
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);

  // Resizable Layout States
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const [consoleHeight, setConsoleHeight] = useState(260); // pixels
  const isResizingCols = useRef(false);
  const isResizingConsole = useRef(false);
  const containerRef = useRef(null);

  const startResizingCols = useCallback((e) => {
    e.preventDefault();
    isResizingCols.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const startResizingConsole = useCallback((e) => {
    e.preventDefault();
    isResizingConsole.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingCols.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
        if (newLeftWidth >= 20 && newLeftWidth <= 75) {
          setLeftWidth(newLeftWidth);
        }
      }
      if (isResizingConsole.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newConsoleHeight = rect.bottom - e.clientY;
        if (newConsoleHeight >= 90 && newConsoleHeight <= rect.height - 120) {
          setConsoleHeight(newConsoleHeight);
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizingCols.current || isResizingConsole.current) {
        isResizingCols.current = false;
        isResizingConsole.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Reset everything when step changes (navigation)
  useEffect(() => {
    const initial = {};
    availableLangs.forEach(l => {
      const localDraft = typeof window !== "undefined" ? localStorage.getItem(`eduvantix_code_${step.id}_${l.id}`) : null;
      const dbSavedCode = progress?.savedCodes?.[l.id] || (progress?.codingLanguage === l.id ? progress?.codingCode : null);
      const defaultTemplate = step.starterCode?.[l.id] || DEFAULT_STARTER_TEMPLATES[l.id] || "";
      initial[l.id] = localDraft || dbSavedCode || defaultTemplate;
    });

    setEditorCodes(initial);
    setRunResults(null);
    setVerdict(null);
    setActiveConsoleTab("testcase");

    if (progress?.codingLanguage && availableLangs.some(l => l.id === progress.codingLanguage)) {
      setLang(progress.codingLanguage);
    } else {
      setLang(availableLangs[0]?.id || "python");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]); // Only reset UI when navigating to a different step

  // Update saved codes when progress changes WITHOUT resetting the active tab/verdict
  useEffect(() => {
    if (!progress) return;
    setEditorCodes(prev => {
      const updated = { ...prev };
      availableLangs.forEach(l => {
        // Only update if we don't already have a local draft
        const localDraft = typeof window !== "undefined" ? localStorage.getItem(`eduvantix_code_${step.id}_${l.id}`) : null;
        if (!localDraft) {
          const dbSavedCode = progress?.savedCodes?.[l.id] || (progress?.codingLanguage === l.id ? progress?.codingCode : null);
          if (dbSavedCode && !prev[l.id]) {
            updated[l.id] = dbSavedCode;
          }
        }
      });
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const currentCode = editorCodes[lang] !== undefined
    ? editorCodes[lang]
    : (step.starterCode?.[lang] || DEFAULT_STARTER_TEMPLATES[lang] || "");

  const handleCodeChange = (val) => {
    const codeVal = val || "";
    setEditorCodes(prev => ({
      ...prev,
      [lang]: codeVal
    }));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`eduvantix_code_${step.id}_${lang}`, codeVal);
      } catch (e) { }
    }
  };

  const handleResetCode = () => {
    const defaultCode = step.starterCode?.[lang] || DEFAULT_STARTER_TEMPLATES[lang] || "";
    setEditorCodes(prev => ({
      ...prev,
      [lang]: defaultCode
    }));
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`eduvantix_code_${step.id}_${lang}`);
      } catch (e) { }
    }
  };

  const handleRun = async () => {
    if (!onRunCode) return;
    setRunning(true);
    setActiveConsoleTab("result");
    setRunResults(null);
    const res = await onRunCode(currentCode, lang);
    if (res && res.success) {
      setRunResults(res.results);
    } else {
      setRunResults([{
        name: "Run Failed",
        passed: false,
        error: res?.error || "Failed to execute code."
      }]);
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    if (!onSubmitCode) return;
    setSubmitting(true);
    setActiveConsoleTab("verdict");
    setVerdict(null);
    const result = await onSubmitCode(currentCode, lang);
    if (result) setVerdict(result);
    setSubmitting(false);
  };

  const sampleCases = step.testCases?.filter(tc => tc.isSample) || step.testCases || [];
  const currentLangObj = availableLangs.find(l => l.id === lang) || availableLangs[0];

  return (
    <div ref={containerRef} className="h-full flex flex-col md:flex-row overflow-hidden bg-[var(--bg-primary)]">
      {/* Left: Problem Description (Independent Scrolling Column) */}
      <div
        className="h-full overflow-y-auto p-6 space-y-6 shrink-0 border-r border-[var(--border-primary)]"
        style={{ width: `${leftWidth}%` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20">Coding Challenge</span>
            {progress?.isCompleted && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Solved</span>}
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{step.title}</h2>
        </div>

        <div className="prose-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(step.problemStatement) }} />

        {step.constraints && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-emerald-400">Constraints</p>
            <div className="text-xs font-mono p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.constraints}</div>
          </div>
        )}

        {(step.inputFormat || step.outputFormat) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {step.inputFormat && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--text-muted)]">Input Format</p>
                <div className="text-xs p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.inputFormat}</div>
              </div>
            )}
            {step.outputFormat && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--text-muted)]">Output Format</p>
                <div className="text-xs p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.outputFormat}</div>
              </div>
            )}
          </div>
        )}

        {sampleCases.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Sample Test Cases</p>
            {sampleCases.map((tc, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Sample {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold mb-1 text-[var(--text-secondary)]">Input</p>
                    <pre className="text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] font-mono overflow-x-auto" style={{ color: "var(--text-primary)" }}>{tc.input}</pre>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1 text-[var(--text-secondary)]">Expected Output</p>
                    <pre className="text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] font-mono overflow-x-auto text-emerald-400">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step.commonDoubts?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--border-primary)]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Common Doubts</p>
            <div className="space-y-2">
              {step.commonDoubts.map((d, i) => (
                <details key={i} className="group rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] overflow-hidden">
                  <summary className="px-4 py-3 text-xs font-bold cursor-pointer hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
                    <span>▶ {d.question}</span>
                  </summary>
                  <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {d.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resizable Divider (Vertical Drag Handle) */}
      <div
        onMouseDown={startResizingCols}
        className="hidden md:flex w-1.5 hover:w-2 bg-[var(--border-primary)] hover:bg-[var(--accent-primary)] cursor-col-resize items-center justify-center transition-all z-10 group"
      >
        <div className="w-0.5 h-8 rounded-full bg-[var(--text-muted)] group-hover:bg-white transition-colors" />
      </div>

      {/* Right: Code Editor & Execution Console Workspace */}
      <div className="flex-1 h-full flex flex-col bg-[#1e1e1e] overflow-hidden">
        {/* Sub-header / Language & Action Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333333] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Language:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-[#1e1e1e] text-white border border-[#444444] rounded px-2.5 py-1 text-xs font-bold outline-none cursor-pointer hover:border-[#007acc] transition-colors"
            >
              {availableLangs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetCode}
            title="Reset code to starter template"
            className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw size={11} /> Reset Code
          </button>
        </div>

        {/* Monaco Editor Instance (Independent Code Area Scrolling) */}
        <div className="flex-1 min-h-[150px] relative overflow-hidden">
          <Editor
            height="100%"
            language={currentLangObj?.monaco || "python"}
            theme="vs-dark"
            value={currentCode}
            onChange={handleCodeChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              lineNumbersMinChars: 3,
            }}
          />
        </div>

        {/* Resizable Console Drag Handle (Horizontal Handle) */}
        <div
          onMouseDown={startResizingConsole}
          className="h-1.5 hover:h-2 bg-[#333333] hover:bg-[#007acc] cursor-row-resize flex items-center justify-center transition-all z-10 group"
        >
          <div className="h-0.5 w-8 rounded-full bg-gray-500 group-hover:bg-white transition-colors" />
        </div>

        {/* Resizable Execution Terminal & Console */}
        <div
          className="border-t border-[#333333] bg-[#252526] flex flex-col shrink-0 overflow-hidden"
          style={{ height: `${consoleHeight}px` }}
        >
          {/* Console Header Tabs + Action Buttons */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#333333] bg-[#1e1e1e] shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveConsoleTab("testcase")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "testcase"
                    ? "bg-[#007acc] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#333333]"
                  }`}
              >
                <Terminal size={12} /> Testcase
              </button>
              <button
                onClick={() => setActiveConsoleTab("result")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "result"
                    ? "bg-[#007acc] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#333333]"
                  }`}
              >
                <Play size={12} /> Test Result
              </button>
              <button
                onClick={() => setActiveConsoleTab("verdict")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "verdict"
                    ? "bg-[#007acc] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#333333]"
                  }`}
              >
                <CheckCircle size={12} /> Judge Verdict
              </button>
            </div>

            {/* CodeChef Dual Action Buttons: Run Code & Submit Code */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {running ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} className="fill-white" />}
                <span>{running ? "Running..." : "Run Code"}</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || running}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                style={{ background: "var(--accent-gradient)" }}
              >
                {submitting ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                <span>{submitting ? "Submitting..." : "Submit Code"}</span>
              </button>
            </div>
          </div>

          {/* Console Output Body (Independent Console Scrolling) */}
          <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
            {activeConsoleTab === "testcase" && (
              <div className="space-y-3">
                {sampleCases.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 border-b border-[#333333] pb-2">
                      {sampleCases.map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSampleIdx(idx)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${activeSampleIdx === idx
                              ? "bg-[#007acc] text-white"
                              : "bg-[#1e1e1e] text-gray-400 hover:text-white border border-[#333333]"
                            }`}
                        >
                          Sample {idx + 1}
                        </button>
                      ))}
                    </div>
                    {sampleCases[activeSampleIdx] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Input</span>
                          <pre className="p-3 rounded border border-[#333333] bg-[#1e1e1e] text-gray-200 whitespace-pre-wrap">
                            {sampleCases[activeSampleIdx].input || "NO input"}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Expected Output</span>
                          <pre className="p-3 rounded border border-[#333333] bg-[#1e1e1e] text-emerald-400 whitespace-pre-wrap">
                            {sampleCases[activeSampleIdx].expectedOutput || "NO output"}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-xs py-2">No sample test cases available.</p>
                )}
              </div>
            )}

            {activeConsoleTab === "result" && (
              <div className="space-y-3">
                {running ? (
                  <div className="flex items-center gap-2 text-emerald-400 py-4">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Executing code on visible sample test cases...</span>
                  </div>
                ) : runResults ? (
                  runResults.map((res, i) => (
                    <div key={i} className="p-3 rounded-lg border border-[#333333] bg-[#1e1e1e] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{res.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${res.passed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}>
                          {res.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      {res.input && (
                        <div className="text-[11px]">
                          <span className="text-gray-400 font-bold">Input: </span>
                          <span className="text-gray-200">{res.input}</span>
                        </div>
                      )}
                      {res.expectedOutput && (
                        <div className="text-[11px]">
                          <span className="text-gray-400 font-bold">Expected Output: </span>
                          <span className="text-emerald-400">{res.expectedOutput}</span>
                        </div>
                      )}
                      <div className="text-[11px]">
                        <span className="text-gray-400 font-bold">Actual Output: </span>
                        <pre className={`p-2 rounded mt-1 text-xs whitespace-pre-wrap ${res.passed ? "bg-emerald-950/40 text-emerald-300" : "bg-rose-950/40 text-rose-300"
                          }`}>
                          {res.error ? cleanExecutionError(res.error) : res.actualOutput || "(No output)"}
                        </pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs py-2">Click &quot;Run Code&quot; above to test your logic against sample test cases.</p>
                )}
              </div>
            )}

            {activeConsoleTab === "verdict" && (
              <div className="space-y-3">
                {submitting ? (
                  <div className="flex items-center gap-2 text-violet-400 py-4">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Running all test cases (including hidden)...</span>
                  </div>
                ) : verdict ? (() => {
                  const isAccepted = verdict.verdict === "ACCEPTED" || verdict.verdict === "Accepted";
                  const isCompilation = verdict.verdict === "COMPILATION_ERROR" || verdict.failedTestCase?.status === "COMPILATION_ERROR";
                  const isRuntime = verdict.verdict === "RUNTIME_ERROR" || verdict.failedTestCase?.status === "RUNTIME_ERROR";
                  const isWrong = verdict.failedTestCase?.status === "WRONG_ANSWER";

                  if (isAccepted) {
                    return (
                      <div className="space-y-2">
                        {/* Big success banner */}
                        <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Trophy size={22} className="text-yellow-400" />
                            <span className="text-lg font-extrabold text-emerald-400">All Test Cases Passed!</span>
                            <Sparkles size={18} className="text-yellow-400" />
                          </div>
                          <p className="text-emerald-300 text-xs font-semibold">
                            ✓ {verdict.totalCount || verdict.passedCount} / {verdict.totalCount || verdict.passedCount} test cases passed (including hidden)
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase tracking-wide">
                              ✓ Accepted
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border
                          ${isCompilation ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : isRuntime ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                          {isCompilation ? "❌ Compilation Error"
                           : isRuntime ? "💥 Runtime Error"
                           : isWrong ? "✗ Wrong Answer"
                           : `✗ ${verdict.verdict || "Error"}`}
                        </span>
                        {verdict.totalCount !== undefined && (
                          <span className="text-xs font-bold text-rose-400">{verdict.passedCount || 0} / {verdict.totalCount} passed</span>
                        )}
                      </div>

                      {/* Error details */}
                      {(isCompilation || isRuntime) && (verdict.failedTestCase?.error || verdict.output) && (
                        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-[#1e1e1e] space-y-1.5">
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            {isCompilation ? "Compilation Error on Test Case " : "Runtime Error on Test Case "}
                            {verdict.failedTestCase?.index || ""}
                          </p>
                          <pre className="text-xs font-mono text-amber-200 whitespace-pre-wrap leading-relaxed">
                            {cleanExecutionError(verdict.failedTestCase?.error || verdict.output)}
                          </pre>
                        </div>
                      )}

                      {/* Wrong answer details */}
                      {isWrong && verdict.failedTestCase && (
                        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-[#1e1e1e] space-y-2">
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                            Failed on Test Case {verdict.failedTestCase.index}
                          </p>
                          <div className="grid grid-cols-1 gap-2 text-[11px]">
                            <div>
                              <span className="text-gray-400 font-bold block mb-0.5">Input:</span>
                              <pre className="p-2 rounded bg-[#2a2a2a] text-gray-200 whitespace-pre-wrap font-mono text-xs border border-[#333]">
                                {verdict.failedTestCase.input || "(hidden)"}
                              </pre>
                            </div>
                            <div>
                              <span className="text-emerald-400 font-bold block mb-0.5">Expected Output:</span>
                              <pre className="p-2 rounded bg-emerald-950/40 text-emerald-300 whitespace-pre-wrap font-mono text-xs border border-emerald-500/20">
                                {verdict.failedTestCase.expected || "(hidden)"}
                              </pre>
                            </div>
                            <div>
                              <span className="text-rose-400 font-bold block mb-0.5">Your Output:</span>
                              <pre className="p-2 rounded bg-rose-950/40 text-rose-300 whitespace-pre-wrap font-mono text-xs border border-rose-500/20">
                                {verdict.failedTestCase.actual || "(empty output)"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Generic error fallback */}
                      {!isCompilation && !isRuntime && !isWrong && verdict.output && (
                        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-[#1e1e1e]">
                          <pre className="text-xs font-mono text-rose-300 whitespace-pre-wrap">{cleanExecutionError(verdict.output)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <p className="text-gray-400 text-xs py-2">Click &quot;Submit Code&quot; above to evaluate against all test cases (including hidden ones).</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assignment Content ─────────────────────────────────────────────────────────

function AssignmentContent({ step, progress, onSubmit }) {
  const [text, setText] = useState(progress?.submissionUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(progress?.isCompleted || false);

  useEffect(() => {
    if (progress?.submissionUrl) {
      setText(progress.submissionUrl);
      setSubmitted(true);
    }
  }, [progress]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text);
    setSubmitted(true);
    setSubmitting(false);
  };

  const instructions = step.assignmentInstructions || step.content || "";

  return (
    <div className="h-full overflow-y-auto px-6 md:px-12 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="prose-sm space-y-3">
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Assignment Instructions</h3>
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
            {instructions ? (
              <div className="prose-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(instructions) }} />
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Follow the instructions provided by your instructor.</p>
            )}
          </div>
        </div>

        <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <span>💡</span> Submission format: Paste your written answer, GitHub repository URL, Google Drive link, or solution link.
        </p>

        {/* Existing Submission Banner */}
        {submitted && progress?.submissionUrl && (
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle size={18} />
                <span>Assignment Submitted</span>
              </div>
              {progress.completedAt && (
                <span className="text-[10px] font-medium text-emerald-400/80">
                  {new Date(progress.completedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {progress.submissionUrl.startsWith("http://") || progress.submissionUrl.startsWith("https://") ? (
                <a href={progress.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                  🔗 {progress.submissionUrl}
                </a>
              ) : (
                progress.submissionUrl
              )}
            </div>
          </div>
        )}

        {/* Submission Form (Always available for submission or resubmission!) */}
        <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
              {submitted ? "Update / Resubmit Solution" : "Submit Your Solution"}
            </label>
            {submitted && (
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                You can resubmit an updated answer or new link anytime.
              </span>
            )}
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your solution text, GitHub repository link, drive URL, or answer here..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all resize-y"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Instructors and Super Admins can review your submission in real-time.
            </p>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-90 transition-opacity shadow-md shrink-0"
              style={{ background: "var(--accent-gradient)" }}
            >
              {submitting ? (
                <><RefreshCw size={14} className="animate-spin" /> Saving...</>
              ) : submitted ? (
                <><Send size={14} /> Update Solution</>
              ) : (
                <><Send size={14} /> Submit Assignment</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chapter Completion Celebration Modal ──────────────────────────────────────

function ChapterCompletionModal({ isOpen, onClose, onNextChapter, currentChapter, nextChapter, chapterIndex, courseProgressPct }) {
  if (!isOpen) return null;

  const isFinalChapter = !nextChapter;
  const conceptsCount = (currentChapter?.steps || []).filter(s => s.type === "CONCEPT" || s.type === "VIDEO").length;
  const practiceCount = (currentChapter?.steps || []).filter(s => s.type === "CODING" || s.type === "MCQ" || s.type === "ASSIGNMENT").length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden">
        {/* Animated Background Confetti Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${(i * 4) % 100}%`,
                y: -30,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                y: "110vh",
                rotate: Math.random() * 360,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: (i * 0.15) % 3,
                ease: "linear"
              }}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: ["#38bdf8", "#34d399", "#f43f5e", "#fbbf24", "#a855f7"][i % 5]
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl overflow-hidden p-8 space-y-6 text-center"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Trophy Badge */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50"
            />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-emerald-500/20 flex items-center justify-center border border-amber-400/30 shadow-inner">
              <Trophy size={42} className="text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.5)]" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2 }}
              className="absolute -top-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md"
            >
              <Check size={14} className="stroke-[3]" />
            </motion.div>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles size={12} /> Chapter Completed!
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              Congratulations! 🎉
            </h2>
            <p className="text-sm leading-relaxed text-balance" style={{ color: "var(--text-secondary)" }}>
              You have completed <span className="font-bold text-[var(--text-accent)]">Chapter {chapterIndex + 1}: &quot;{currentChapter?.title}&quot;</span>
            </p>
          </div>

          {/* Achievement Summary Cards */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] space-y-1">
              <BookOpen size={18} className="mx-auto text-blue-400" />
              <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{conceptsCount}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Concepts</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] space-y-1">
              <Code2 size={18} className="mx-auto text-violet-400" />
              <p className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{practiceCount}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Practices</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] space-y-1">
              <BarChart2 size={18} className="mx-auto text-emerald-400" />
              <p className="text-lg font-black text-emerald-400">{courseProgressPct}%</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Course Done</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            {!isFinalChapter && nextChapter ? (
              <button
                onClick={onNextChapter}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
              >
                <span>Continue to Chapter {chapterIndex + 2}: {nextChapter.title}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer bg-gradient-to-r from-emerald-500 to-cyan-500"
              >
                <span>🎉 Entire Course Completed!</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Review previous chapter content
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StepPlayerPage() {
  const router = useRouter();
  const { slug, chapterId, stepId } = useParams();
  const { token, API_BASE, user } = useAuth();
  const [step, setStep] = useState(null);
  const [progress, setProgress] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChapterCompleteModal, setShowChapterCompleteModal] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...((!token || token.startsWith("demo-") || token.startsWith("local-"))
      ? { "x-bypass-auth": "true", "x-bypass-role": "USER" }
      : {}),
  }), [token]);

  const loadStep = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [stepRes, courseRes] = await Promise.all([
        fetch(`${API_BASE}/api/learn/steps/${stepId}`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/learn/courses/${slug}`, { headers: authHeaders() }),
      ]);
      const [stepData, courseData] = await Promise.all([stepRes.json(), courseRes.json()]);
      if (stepData.success) { setStep(stepData.step); setProgress(stepData.progress); }
      if (courseData.success) setCourse(courseData.course);
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
  }, [stepId, slug, API_BASE, authHeaders]);

  useEffect(() => { loadStep(); }, [loadStep]);

  const updateProgress = useCallback(async (data) => {
    try {
      await fetch(`${API_BASE}/api/learn/steps/${stepId}/progress`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(data),
      });
    } catch (e) { }
  }, [stepId, API_BASE, authHeaders]);

  const handleScrollProgress = useCallback((pct) => {
    updateProgress({ scrollDepth: pct });
  }, [updateProgress]);

  const handleWatchProgress = useCallback((secs) => {
    updateProgress({ watchedSeconds: secs });
  }, [updateProgress]);

  const handleMCQSubmit = async (optionId) => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/steps/${stepId}/submit-mcq`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ selectedOptionId: optionId }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.progress);
        await loadStep(true);
        return data;
      }
    } catch (e) { console.error(e); }
    return null;
  };

  const handleAssignmentSubmit = async (text) => {
    try {
      await fetch(`${API_BASE}/api/learn/steps/${stepId}/submit-assignment`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ submissionText: text }),
      });
      await loadStep(true);
    } catch (e) { console.error(e); }
  };

  const handleCodeRun = async (code, language) => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/steps/${stepId}/run-coding`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, results: data.results };
      }
      return { success: false, error: data.message || "Failed to run test cases." };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Execution error. Please check server connection." };
    }
  };

  const handleCodeSubmit = async (code, language) => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/steps/${stepId}/submit-coding`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.progress) setProgress(data.progress);
        await loadStep(true);
        return {
          verdict: data.verdict,
          passedCount: data.passedCount,
          totalCount: data.totalCount,
          failedTestCase: data.failedTestCase,
          output: data.verdict === "ACCEPTED"
            ? `✓ Passed all ${data.totalCount} test cases!`
            : data.failedTestCase?.error || `Failed test cases (${data.passedCount || 0}/${data.totalCount || 0} passed)`,
        };
      }
    } catch (e) { console.error(e); }
    return { verdict: "ERROR", output: "Execution error. Please try again." };
  };

  // ── Navigation & Chapter Scoped Calculations ─────────────────────────────────
  const allSteps = course?.chapters?.flatMap(ch =>
    (ch.steps || []).map(s => ({ ...s, chapterId: ch.id, chapterTitle: ch.title }))
  ) || [];

  const currentChapterIndex = course?.chapters?.findIndex(ch => String(ch.id) === String(chapterId)) ?? -1;
  const currentChapter = currentChapterIndex >= 0 ? course?.chapters?.[currentChapterIndex] : null;
  const chapterSteps = currentChapter?.steps || [];

  const currentStepIndexInChapter = chapterSteps.findIndex(s => String(s.id) === String(stepId));
  const isLastStepInChapter = currentStepIndexInChapter >= 0 && currentStepIndexInChapter === chapterSteps.length - 1;

  const nextChapter = (currentChapterIndex >= 0 && currentChapterIndex < (course?.chapters?.length || 0) - 1)
    ? course.chapters[currentChapterIndex + 1]
    : null;

  // Prev step: in current chapter or last step of previous chapter
  const prevStep = currentStepIndexInChapter > 0
    ? chapterSteps[currentStepIndexInChapter - 1]
    : (currentChapterIndex > 0 && course?.chapters?.[currentChapterIndex - 1]?.steps?.length > 0)
      ? course.chapters[currentChapterIndex - 1].steps[course.chapters[currentChapterIndex - 1].steps.length - 1]
      : null;

  // Next step: in current chapter
  const nextStep = currentStepIndexInChapter >= 0 && currentStepIndexInChapter < chapterSteps.length - 1
    ? chapterSteps[currentStepIndexInChapter + 1]
    : null;

  const navigate = (s) => {
    if (!s) return;
    setSidebarOpen(false);
    router.push(`/learn/course/${slug}/${s.chapterId}/${s.id}`);
  };

  const handleNextAction = () => {
    if (isLastStepInChapter) {
      setShowChapterCompleteModal(true);
    } else if (nextStep) {
      navigate(nextStep);
    }
  };

  const handleGoToNextChapter = () => {
    setShowChapterCompleteModal(false);
    if (nextChapter && nextChapter.steps && nextChapter.steps.length > 0) {
      router.push(`/learn/course/${slug}/${nextChapter.id}/${nextChapter.steps[0].id}`);
    } else {
      router.push(`/learn/course/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <AlertCircle size={32} style={{ color: "var(--text-muted)" }} />
        <p className="font-bold" style={{ color: "var(--text-primary)" }}>Step not found or access denied.</p>
        <button onClick={() => router.push(`/learn/course/${slug}`)} className="text-sm font-semibold cursor-pointer" style={{ color: "var(--text-accent)" }}>← Back to Course</button>
      </div>
    );
  }

  const StepIcon = TYPE_ICONS[step.type] || BookOpen;
  const isCompleted = progress?.isCompleted;
  const totalStepsInChapter = allSteps.filter(s => String(s.chapterId) === String(chapterId)).length;

  const completedStepsCount = allSteps.filter(s => s.progress?.isCompleted).length;
  const courseProgressPct = allSteps.length > 0 ? Math.round((completedStepsCount / allSteps.length) * 100) : 0;

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden relative">
      {/* ── Sidebar Overlay Drawer (CodeChef Style) ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs cursor-pointer"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[var(--border-primary)] space-y-3 bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[var(--accent-glow)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Course Syllabus</p>
                      {course && <p className="text-sm font-bold truncate max-w-[170px]" style={{ color: "var(--text-primary)" }}>{course.title}</p>}
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button onClick={() => { setSidebarOpen(false); router.push(`/learn/course/${slug}`); }} className="flex items-center gap-1 font-semibold text-[var(--text-accent)] hover:underline cursor-pointer">
                    View full syllabus <ExternalLink size={12} />
                  </button>
                  <span className="font-bold text-[var(--text-muted)]">{completedStepsCount}/{allSteps.length} Completed</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--bg-hover)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${courseProgressPct}%` }} />
                </div>
              </div>

              {/* Chapters & Steps */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {course?.chapters?.map((ch, ci) => {
                  const chSteps = ch.steps || [];
                  const isCurrentChapter = String(ch.id) === String(chapterId);
                  const chCompleted = chSteps.filter(s => s.progress?.isCompleted).length;
                  return (
                    <div key={ch.id} className="rounded-xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-secondary)]/50">
                      <div className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-[var(--border-primary)] ${isCurrentChapter ? "bg-[var(--accent-glow)]/40" : ""}`}>
                        <span className="text-[10px] font-bold shrink-0 w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>{ci + 1}</span>
                        <span className="text-xs font-bold flex-1 truncate" style={{ color: isCurrentChapter ? "var(--text-accent)" : "var(--text-primary)" }}>{ch.title}</span>
                        <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{chCompleted}/{chSteps.length}</span>
                      </div>
                      <div className="p-1 space-y-0.5">
                        {chSteps.map((s) => {
                          const SIcon = TYPE_ICONS[s.type] || BookOpen;
                          const isActive = String(s.id) === String(stepId);
                          const isStepCompleted = s.progress?.isCompleted;
                          return (
                            <button key={s.id}
                              onClick={() => {
                                setSidebarOpen(false);
                                router.push(`/learn/course/${slug}/${ch.id}/${s.id}`);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${isActive ? "bg-[var(--accent-glow)] border border-[var(--border-accent)]" : "hover:bg-[var(--bg-hover)]"
                                }`}>
                              <div className={`p-1 rounded shrink-0 ${TYPE_COLORS[s.type]}`}><SIcon size={11} /></div>
                              <span className={`text-xs flex-1 truncate ${isActive ? "font-bold" : ""}`} style={{ color: isActive ? "var(--text-accent)" : "var(--text-secondary)" }}>{s.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold text-[var(--text-muted)] bg-[var(--bg-hover)]">
                                {s.type}
                              </span>
                              {isStepCompleted && <CheckCircle size={12} className="text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExitModal(true)} title="Back to Courses Catalog" className="p-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => setSidebarOpen(p => !p)} title="Toggle Syllabus Drawer" className="p-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <Menu size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${TYPE_COLORS[step.type]}`}><StepIcon size={13} /></div>
              <div>
                <p className="text-sm font-bold truncate max-w-[300px]" style={{ color: "var(--text-primary)" }}>{step.title}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{step.type} · {isCompleted ? "Completed" : "In Progress"}</p>
              </div>
              {isCompleted && <CheckCircle size={14} className="text-emerald-400" />}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button disabled={!prevStep} onClick={() => navigate(prevStep)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ color: "var(--text-secondary)" }}>
                <ChevronLeft size={13} /> Prev
              </button>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-hover)]" style={{ color: "var(--text-primary)" }}>
                {currentStepIndexInChapter >= 0 ? currentStepIndexInChapter + 1 : 1} / {chapterSteps.length || 1}
              </span>
              {isLastStepInChapter ? (
                <button
                  onClick={handleNextAction}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md hover:scale-105 transition-all cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border border-emerald-400/30"
                >
                  <Sparkles size={13} className="animate-pulse" />
                  <span>{nextChapter ? "Next Chapter" : "Course Completed"}</span>
                  <ChevronRight size={13} />
                </button>
              ) : (
                <button disabled={!nextStep} onClick={handleNextAction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                  style={{ color: "var(--text-secondary)" }}>
                  Next <ChevronRight size={13} />
                </button>
              )}
            </div>
            {/* Theme Toggle Button */}
            <div className="scale-90 origin-right">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Step Content Area */}
        <div className="flex-1 overflow-hidden">
          {step.type === "CONCEPT" && <ConceptContent step={step} onScrollProgress={handleScrollProgress} />}
          {step.type === "VIDEO" && <VideoContent step={step} onWatchProgress={handleWatchProgress} />}
          {step.type === "MCQ" && <MCQContent step={step} progress={progress} onSubmit={handleMCQSubmit} />}
          {step.type === "CODING" && <CodingContent step={step} progress={progress} onRunCode={handleCodeRun} onSubmitCode={handleCodeSubmit} />}
          {step.type === "ASSIGNMENT" && <AssignmentContent step={step} progress={progress} onSubmit={handleAssignmentSubmit} />}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Are you sure you want to exit?</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Your progress and code drafts are safely saved.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-xs border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowExitModal(false);
                    router.push("/learn");
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white cursor-pointer bg-rose-500 hover:bg-rose-600 transition-colors shadow">
                  Yes, Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chapter Completion Celebration Modal */}
      <ChapterCompletionModal
        isOpen={showChapterCompleteModal}
        onClose={() => setShowChapterCompleteModal(false)}
        onNextChapter={handleGoToNextChapter}
        currentChapter={currentChapter}
        nextChapter={nextChapter}
        chapterIndex={currentChapterIndex}
        courseProgressPct={courseProgressPct}
      />
    </div>
  );
}
