"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, Play, Code2, FileQuestion,
  ClipboardList, FileText, CheckCircle, X, Menu, BarChart2,
  ThumbsUp, ThumbsDown, RefreshCw, Check, AlertCircle, Loader,
  Trophy, Lock, ChevronDown, ExternalLink, Send
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/context/AuthContext";

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

  // Simple markdown-to-HTML renderer (handles headers, bold, italic, code)
  const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre class="bg-[var(--bg-code)] border border-[var(--border-primary)] rounded-xl p-4 overflow-x-auto my-4 text-xs font-mono leading-relaxed" style="color:var(--text-primary)"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
      .replace(/`([^`]+)`/g, `<code class="px-1.5 py-0.5 rounded-md text-[var(--text-accent)] bg-[var(--accent-glow)] text-xs font-mono">$1</code>`)
      .replace(/^### (.*$)/gm, `<h3 class="text-base font-bold mt-6 mb-2" style="color:var(--text-primary)">$1</h3>`)
      .replace(/^## (.*$)/gm, `<h2 class="text-lg font-bold mt-8 mb-3" style="color:var(--text-primary)">$1</h2>`)
      .replace(/^# (.*$)/gm, `<h1 class="text-2xl font-bold mt-6 mb-4" style="color:var(--text-primary)">$1</h1>`)
      .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:var(--text-primary)">$1</strong>`)
      .replace(/\*([^*]+)\*/g, `<em>$1</em>`)
      .replace(/\n\n/g, `</p><p class="mb-4 leading-relaxed" style="color:var(--text-secondary)">`)
      .replace(/\n/g, `<br>`);
    return `<p class="mb-4 leading-relaxed" style="color:var(--text-secondary)">${html}</p>`;
  };

  const getYtId = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return m ? m[1] : null;
  };
  const ytId = step.videoUrl ? getYtId(step.videoUrl) : null;

  return (
    <div ref={contentRef} className="h-full overflow-y-auto px-8 py-6 space-y-6" onScroll={handleScroll}>
      <div className="max-w-3xl mx-auto space-y-6">
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
        <div className="px-8 py-6 max-w-3xl mx-auto">
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
    <div className="h-full overflow-y-auto px-8 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Question Header */}
        <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-accent)]">Question</span>
            {isSubmitted && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                (result?.isCorrect || dbIsCorrect)
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
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSubmitted && isCorrectOption
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
            className={`p-5 rounded-2xl border space-y-3 ${
              (result?.isCorrect || dbIsCorrect)
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-rose-500/30 bg-rose-500/10"
            }`}>
            <div className="flex items-center justify-between">
              <p className={`font-bold text-sm flex items-center gap-2 ${
                (result?.isCorrect || dbIsCorrect) ? "text-emerald-400" : "text-rose-400"
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

// ── Coding Content ─────────────────────────────────────────────────────────────

function CodingContent({ step, progress, onSubmitCode }) {
  const allowedLangs = (step.starterCode?.allowedLanguages && Array.isArray(step.starterCode.allowedLanguages) && step.starterCode.allowedLanguages.length > 0)
    ? step.starterCode.allowedLanguages
    : (step.title?.toLowerCase().includes("python") || step.problemStatement?.toLowerCase().includes("python"))
      ? ["python"]
      : ["python", "cpp", "java"];

  const availableLangEntries = Object.entries(LANG_LABELS).filter(([l]) => allowedLangs.includes(l));

  const [lang, setLang] = useState(() => allowedLangs[0] || "python");
  const [code, setCode] = useState(() => step.starterCode?.[lang] || "");
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);

  useEffect(() => {
    if (!allowedLangs.includes(lang)) {
      setLang(allowedLangs[0] || "python");
    }
  }, [allowedLangs, lang]);

  useEffect(() => {
    setCode(step.starterCode?.[lang] || "");
  }, [lang, step]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setVerdict(null);
    const result = await onSubmitCode(code, lang);
    if (result) setVerdict(result);
    setSubmitting(false);
  };

  const sampleCases = step.testCases?.filter(tc => tc.isSample) || [];

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[var(--bg-primary)]">
      {/* Left: Problem Description */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-[var(--border-primary)] p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20">Coding Challenge</span>
            {progress?.isCompleted && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Solved</span>}
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{step.title}</h2>
        </div>

        <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
          {step.problemStatement}
        </div>

        {step.constraints && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-[var(--text-accent)]">Constraints</p>
            <div className="text-xs font-mono p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.constraints}</div>
          </div>
        )}

        {(step.inputFormat || step.outputFormat) && (
          <div className="grid grid-cols-2 gap-3">
            {step.inputFormat && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">Input Format</p>
                <div className="text-xs p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.inputFormat}</div>
              </div>
            )}
            {step.outputFormat && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[var(--text-secondary)]">Output Format</p>
                <div className="text-xs p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.outputFormat}</div>
              </div>
            )}
          </div>
        )}

        {sampleCases.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-accent)]">Sample Test Cases</p>
            {sampleCases.map((tc, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Sample {i + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold mb-1 text-[var(--text-secondary)]">Input</p>
                    <pre className="text-xs p-2.5 rounded-lg bg-[var(--bg-code)] border border-[var(--border-primary)] font-mono overflow-x-auto" style={{ color: "var(--text-primary)" }}>{tc.input}</pre>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold mb-1 text-[var(--text-secondary)]">Expected Output</p>
                    <pre className="text-xs p-2.5 rounded-lg bg-[var(--bg-code)] border border-[var(--border-primary)] font-mono overflow-x-auto" style={{ color: "var(--text-primary)" }}>{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Monaco IDE Editor */}
      <div className="w-full md:w-1/2 h-full flex flex-col bg-[#1e1e1e]">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333333]">
          <div className="flex items-center gap-1.5">
            {availableLangEntries.map(([l, label]) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  lang === l
                    ? "bg-[#007acc] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#333333]"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setCode(step.starterCode?.[lang] || "")}
            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer">
            <RefreshCw size={11} /> Reset Code
          </button>
        </div>

        {/* Monaco Editor Instance */}
        <div className="flex-1 min-h-[300px]">
          <Editor
            height="100%"
            language={lang === "cpp" ? "cpp" : lang === "java" ? "java" : "python"}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
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

        {/* Execution Output Console / Submit Bar */}
        <div className="border-t border-[#333333] bg-[#252526] p-4 space-y-3">
          {verdict && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono whitespace-pre-wrap max-h-56 overflow-y-auto space-y-2 ${
              verdict.verdict === "ACCEPTED" || verdict.verdict === "Accepted"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {verdict.verdict === "ACCEPTED" || verdict.verdict === "Accepted" ? <CheckCircle size={14} /> : <X size={14} />}
                  Verdict: {verdict.verdict}
                </span>
                {verdict.totalCount && (
                  <span className="text-[10px] opacity-80">{verdict.passedCount || 0} / {verdict.totalCount} passed</span>
                )}
              </div>
              <div className="text-[11px] leading-relaxed opacity-95">{verdict.output}</div>
              {verdict.failedTestCase && verdict.failedTestCase.status === "WRONG_ANSWER" && (
                <div className="pt-2 border-t border-rose-500/20 text-[10px] space-y-1 text-rose-300">
                  <div><span className="font-bold">Input:</span> {verdict.failedTestCase.input}</div>
                  <div><span className="font-bold">Expected Output:</span> {verdict.failedTestCase.expected}</div>
                  <div><span className="font-bold">Actual Output:</span> {verdict.failedTestCase.actual}</div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:opacity-90 transition-opacity shadow-md"
            style={{ background: "var(--accent-gradient)" }}>
            {submitting ? <><RefreshCw size={13} className="animate-spin" /> Running Test Cases...</> : <><Send size={13} /> Run &amp; Submit Code</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Assignment Content ─────────────────────────────────────────────────────────

function AssignmentContent({ step, progress, onSubmit }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(progress?.isCompleted || false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit(text);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="prose-sm">
          <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>Assignment</h3>
          <div className="text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
            {step.assignmentInstructions || "Follow the instructions provided by your instructor."}
          </div>
        </div>
        {step.allowedFileTypes && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Accepted formats: {step.allowedFileTypes} {step.maxFileSizeMb && `· Max size: ${step.maxFileSizeMb}MB`}</p>
        )}
        {submitted ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle size={18} />
            <div>
              <p className="font-bold text-sm">Assignment Submitted!</p>
              <p className="text-xs mt-0.5 text-emerald-400/70">Your submission has been recorded.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Your Submission</label>
            <textarea rows={8} value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your solution, link to repository, or write your answer here..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all resize-y"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
            <button onClick={handleSubmit} disabled={!text.trim() || submitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ background: "var(--accent-gradient)" }}>
              {submitting ? <><RefreshCw size={13} className="animate-spin" /> Submitting...</> : <><Send size={13} /> Submit Assignment</>}
            </button>
          </div>
        )}
      </div>
    </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...((!token || token.startsWith("demo-") || token.startsWith("local-"))
      ? { "x-bypass-auth": "true", "x-bypass-role": "USER" }
      : {}),
  }), [token]);

  const loadStep = useCallback(async () => {
    setLoading(true);
    try {
      const [stepRes, courseRes] = await Promise.all([
        fetch(`${API_BASE}/api/learn/steps/${stepId}`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/learn/courses/${slug}`, { headers: authHeaders() }),
      ]);
      const [stepData, courseData] = await Promise.all([stepRes.json(), courseRes.json()]);
      if (stepData.success) { setStep(stepData.step); setProgress(stepData.progress); }
      if (courseData.success) setCourse(courseData.course);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [stepId, slug, API_BASE, authHeaders]);

  useEffect(() => { loadStep(); }, [loadStep]);

  const updateProgress = useCallback(async (data) => {
    try {
      await fetch(`${API_BASE}/api/learn/steps/${stepId}/progress`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(data),
      });
    } catch (e) {}
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
        await loadStep();
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
      await loadStep();
    } catch (e) { console.error(e); }
  };

  const handleCodeSubmit = async (code, language) => {
    try {
      const res = await fetch(`${API_BASE}/api/learn/steps/${stepId}/submit-coding`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.progress) setProgress(data.progress);
        await loadStep();
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

  // Navigation helpers
  const allSteps = course?.chapters?.flatMap(ch =>
    (ch.steps || []).map(s => ({ ...s, chapterId: ch.id, chapterTitle: ch.title }))
  ) || [];

  const currentIdx = allSteps.findIndex(s => String(s.id) === String(stepId));
  const prevStep = currentIdx > 0 ? allSteps[currentIdx - 1] : null;
  const nextStep = currentIdx < allSteps.length - 1 ? allSteps[currentIdx + 1] : null;

  const navigate = (s) => {
    if (!s) return;
    router.push(`/learn/course/${slug}/${s.chapterId}/${s.id}`);
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

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-sidebar)] overflow-hidden">
            {/* Sidebar header */}
            <div className="p-4 border-b border-[var(--border-primary)] space-y-2">
              <button onClick={() => router.push(`/learn/course/${slug}`)} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
                <ChevronLeft size={12} /> Course Overview
              </button>
              {course && <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>}
            </div>

            {/* Chapter list */}
            <div className="flex-1 overflow-y-auto py-2">
              {course?.chapters?.map((ch, ci) => {
                const chSteps = ch.steps || [];
                const isCurrentChapter = String(ch.id) === String(chapterId);
                const chCompleted = chSteps.filter(s => s.progress?.isCompleted).length;
                return (
                  <div key={ch.id} className="mb-1">
                    <div className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer ${isCurrentChapter ? "bg-[var(--accent-glow)]" : ""}`}>
                      <span className="text-[10px] font-bold shrink-0 w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>{ci + 1}</span>
                      <span className="text-xs font-semibold flex-1 truncate" style={{ color: isCurrentChapter ? "var(--text-accent)" : "var(--text-primary)" }}>{ch.title}</span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{chCompleted}/{chSteps.length}</span>
                    </div>
                    <div className="ml-4 space-y-0.5">
                      {chSteps.map((s, si) => {
                        const SIcon = TYPE_ICONS[s.type] || BookOpen;
                        const isActive = String(s.id) === String(stepId);
                        const isStepCompleted = s.progress?.isCompleted;
                        return (
                          <button key={s.id}
                            onClick={() => router.push(`/learn/course/${slug}/${ch.id}/${s.id}`)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer mx-1 ${isActive ? "bg-[var(--accent-glow)] border border-[var(--border-accent)]" : "hover:bg-[var(--bg-hover)]"}`}
                            style={{ width: "calc(100% - 8px)" }}>
                            <div className={`p-1 rounded shrink-0 ${TYPE_COLORS[s.type]}`}><SIcon size={9} /></div>
                            <span className={`text-xs flex-1 truncate ${isActive ? "font-bold" : ""}`} style={{ color: isActive ? "var(--text-accent)" : "var(--text-secondary)" }}>{s.title}</span>
                            {isStepCompleted && <CheckCircle size={10} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(p => !p)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
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
          <div className="flex items-center gap-2">
            <button disabled={!prevStep} onClick={() => navigate(prevStep)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              style={{ color: "var(--text-secondary)" }}>
              <ChevronLeft size={13} /> Prev
            </button>
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {currentIdx + 1} / {allSteps.length}
            </span>
            <button disabled={!nextStep} onClick={() => navigate(nextStep)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              style={{ color: "var(--text-secondary)" }}>
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Step Content Area */}
        <div className="flex-1 overflow-hidden">
          {step.type === "CONCEPT" && <ConceptContent step={step} onScrollProgress={handleScrollProgress} />}
          {step.type === "VIDEO" && <VideoContent step={step} onWatchProgress={handleWatchProgress} />}
          {step.type === "MCQ" && <MCQContent step={step} progress={progress} onSubmit={handleMCQSubmit} />}
          {step.type === "CODING" && <CodingContent step={step} progress={progress} onSubmitCode={handleCodeSubmit} />}
          {step.type === "ASSIGNMENT" && <AssignmentContent step={step} progress={progress} onSubmit={handleAssignmentSubmit} />}
        </div>

        {/* Common Doubts */}
        {step.commonDoubts?.length > 0 && (
          <div className="shrink-0 border-t border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)] max-h-40 overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Common Doubts</p>
            <div className="flex flex-wrap gap-2">
              {step.commonDoubts.map((d, i) => (
                <details key={i} className="group">
                  <summary className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[var(--border-primary)] cursor-pointer hover:border-[var(--border-accent)] hover:text-[var(--text-accent)] transition-colors" style={{ color: "var(--text-secondary)" }}>
                    {d.question}
                  </summary>
                  <div className="mt-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs max-w-sm" style={{ color: "var(--text-secondary)" }}>{d.answer}</div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
