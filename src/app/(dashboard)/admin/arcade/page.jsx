"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Plus, Trash2, Edit3, CheckCircle2, XCircle,
  RefreshCw, ChevronDown, ChevronUp, Save, X, AlertCircle,
  BookOpen, Code, Terminal, Layers, Search, Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

// ─── Storage helpers ────────────────────────────────────────────────────────────
function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Game type config ─────────────────────────────────────────────────────────
const GAME_TYPES = [
  {
    key: "quiz",
    label: "Quiz Blitz",
    icon: BookOpen,
    color: "indigo",
    accent: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    description: "Multiple-choice timed questions with explanations",
    tracks: ["JavaScript", "React.js", "Node.js", "MongoDB"],
  },
  {
    key: "match",
    label: "Code Match",
    icon: Layers,
    color: "emerald",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "Term-to-definition memory flip card pairs",
    tracks: ["JavaScript", "React.js", "Node.js", "MongoDB"],
  },
  {
    key: "debug",
    label: "Debug the Bug",
    icon: Terminal,
    color: "amber",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Write code to fix logic or syntax errors in an interactive workspace IDE",
    tracks: ["JavaScript", "React.js", "Node.js", "MongoDB", "Python", "SQL"],
  },
  {
    key: "fillin",
    label: "Code Fill-In",
    icon: Code,
    color: "violet",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "Fill the blank in a code snippet from 4 options",
    langs: ["Python", "JavaScript", "SQL"],
  },
];

const GAME_INSTRUCTIONS = {
  quiz: [
    "Choose a track (JavaScript, React.js, Node.js, MongoDB) to begin.",
    "Answer multiple-choice questions within the countdown timer (default 20s).",
    "Maintain your streak multiplier by answering consecutive questions correctly.",
    "Immediate validation and detailed explanations are provided after each submission."
  ],
  match: [
    "Test your memory by matching programming terminology with their correct definitions.",
    "Cards are placed face-down in a neon grid. Click a card to flip it and reveal the content.",
    "Click a second card to find a match. Correct matches remain face-up.",
    "Finish matching all pairs in the shortest time with the fewest card flips."
  ],
  debug: [
    "Fix syntactical, logical, or runtime errors in code snippets within an interactive IDE.",
    "Read the compiler error output or debug details provided in the instructions.",
    "Highlight and edit the specific buggy lines of code to repair the program.",
    "Run and validate the workspace until all tests/assertions pass."
  ],
  fillin: [
    "Complete missing operators, variables, or keywords in code snippets.",
    "Review the syntax code which has blank slots (labeled e.g., ____, ____2).",
    "Select the correct answer from 4 multiple-choice options for each blank.",
    "Submit and get instant evaluation with syntax formatting and speed rewards."
  ]
};

// ─── Empty form templates ─────────────────────────────────────────────────────
const EMPTY_FORMS = {
  quiz: {
    track: "JavaScript",
    question: "",
    code: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    time_limit: 20,
    level: 1,
  },
  match: {
    track: "JavaScript",
    term: "",
    definition: "",
    level: 1,
  },
  debug: {
    track: "JavaScript",
    title: "",
    code: "",
    buggy_lines: [{ line_number: "", line_content: "" }],
    explanation: "",
    level: 1,
  },
  fillin: {
    lang: "Python",
    title: "",
    code: "",
    hint: "",
    level: 1,
    // blanks is the multi-blank array: [{ placeholder, option_a..d, answer }]
    blanks: [
      { placeholder: "____", option_a: "", option_b: "", option_c: "", option_d: "", answer: "" }
    ],
  },
};

// ─── Sub-forms per game type ──────────────────────────────────────────────────
function QuizForm({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Track *</label>
          <select value={form.track} onChange={e => onChange("track", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none transition-all cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            {["JavaScript", "React.js", "Node.js", "MongoDB"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Time Limit (sec)</label>
          <input type="number" min={10} max={60} value={form.time_limit} onChange={e => onChange("time_limit", Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Level *</label>
          <input type="number" min={1} value={form.level} onChange={e => onChange("level", e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Question *</label>
        <textarea rows={2} value={form.question} onChange={e => onChange("question", e.target.value)} placeholder="What does this code output?"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Code Snippet (optional)</label>
        <textarea rows={3} value={form.code} onChange={e => onChange("code", e.target.value)} placeholder="console.log(typeof null);"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-mono outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["A", "B", "C", "D"].map(opt => (
          <div key={opt}>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
              Option {opt} {form.correct_option === opt && <span className="text-emerald-400 ml-1">✓ Correct</span>}
            </label>
            <input type="text" value={form[`option_${opt.toLowerCase()}`]}
              onChange={e => onChange(`option_${opt.toLowerCase()}`, e.target.value)}
              placeholder={`Option ${opt}...`}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: form.correct_option === opt ? "rgb(52 211 153 / 0.4)" : "var(--border-primary)", color: "var(--text-primary)" }} />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Correct Answer *</label>
        <div className="flex gap-2">
          {["A", "B", "C", "D"].map(opt => {
            const isSelected = form.correct_option === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange("correct_option", opt)}
                className={`flex-1 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={{
                  borderColor: isSelected ? "rgb(16, 185, 129)" : "var(--border-primary)",
                  color: isSelected ? undefined : "var(--text-secondary)"
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Explanation *</label>
        <textarea rows={2} value={form.explanation} onChange={e => onChange("explanation", e.target.value)} placeholder="Why is this the correct answer?"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

function MatchForm({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Track *</label>
          <select value={form.track} onChange={e => onChange("track", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            {["JavaScript", "React.js", "Node.js", "MongoDB"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Level *</label>
          <input type="number" min={1} value={form.level} onChange={e => onChange("level", e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Term *</label>
        <input type="text" value={form.term} onChange={e => onChange("term", e.target.value)} placeholder="e.g. Closure"
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Definition *</label>
        <textarea rows={3} value={form.definition} onChange={e => onChange("definition", e.target.value)} placeholder="A function that retains access to its outer lexical scope..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

function DebugForm({ form, onChange }) {
  const buggyLines = form.buggy_lines || [{ line_number: "", line_content: "" }];

  function updateBugLine(idx, field, value) {
    const updated = buggyLines.map((b, i) => i === idx ? { ...b, [field]: value } : b);
    onChange("buggy_lines", updated);
  }

  function addBugLine() {
    onChange("buggy_lines", [...buggyLines, { line_number: "", line_content: "" }]);
  }

  function removeBugLine(idx) {
    if (buggyLines.length <= 1) return;
    onChange("buggy_lines", buggyLines.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Track *</label>
          <select value={form.track} onChange={e => onChange("track", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            {["JavaScript", "React.js", "Node.js", "MongoDB"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Title *</label>
          <input type="text" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Off-by-one Loop Error"
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Level *</label>
          <input type="number" min={1} value={form.level} onChange={e => onChange("level", e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Code Snippet * <span className="normal-case text-white/30">(paste the full snippet including the bug)</span>
        </label>
        <textarea rows={6} value={form.code} onChange={e => onChange("code", e.target.value)}
          placeholder={"function avg(arr) {\n  let total = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    total += arr[i];\n  }\n  return total / arr.length;\n}"}
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-mono outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>

      {/* Buggy lines */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Buggy Lines ({buggyLines.length})
          </label>
          {buggyLines.length < 6 && (
            <button type="button" onClick={addBugLine}
              className="text-[10px] font-bold px-3 py-1 rounded-lg border border-[var(--border-primary)] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer">
              + Add Bug
            </button>
          )}
        </div>

        {buggyLines.map((bug, bi) => (
          <div key={bi} className="flex items-center gap-3 p-3 rounded-2xl border"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
            <div className="shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Line #</label>
              <input type="number" min={1} value={bug.line_number}
                onChange={e => updateBugLine(bi, "line_number", Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-mono outline-none text-center"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Line Content (optional)</label>
              <input type="text" value={bug.line_content}
                onChange={e => updateBugLine(bi, "line_content", e.target.value)}
                placeholder={`Content of line ${bi + 1}...`}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-mono outline-none"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
            </div>
            {buggyLines.length > 1 && (
              <button type="button" onClick={() => removeBugLine(bi)}
                className="shrink-0 text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer transition-colors mt-4">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Explanation *</label>
        <textarea rows={2} value={form.explanation} onChange={e => onChange("explanation", e.target.value)} placeholder="The condition i <= arr.length goes out of bounds..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

function FillinForm({ form, onChange }) {
  // form.blanks = [{ placeholder, option_a, option_b, option_c, option_d, answer }]
  const blanks = form.blanks || [{ placeholder: "____", option_a: "", option_b: "", option_c: "", option_d: "", answer: "" }];

  function updateBlank(idx, field, value) {
    const updated = blanks.map((b, i) => i === idx ? { ...b, [field]: value } : b);
    onChange("blanks", updated);
  }

  function addBlank() {
    const num = blanks.length + 1;
    const placeholder = `${'_'.repeat(4)}${num}`;
    onChange("blanks", [...blanks, { placeholder, option_a: "", option_b: "", option_c: "", option_d: "", answer: "" }]);
  }

  function removeBlank(idx) {
    if (blanks.length <= 1) return;
    onChange("blanks", blanks.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Language *</label>
          <select value={form.lang} onChange={e => onChange("lang", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none cursor-pointer"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            {["Python", "JavaScript", "SQL"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Title *</label>
          <input type="text" value={form.title} onChange={e => onChange("title", e.target.value)} placeholder="Prime Checker"
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Level *</label>
          <input type="number" min={1} value={form.level} onChange={e => onChange("level", e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
          Code with Blanks *
          <span className="normal-case text-white/30 ml-1">
            Use <code className="bg-white/10 px-1 rounded">____</code> for blank 1,
            <code className="bg-white/10 px-1 rounded mx-1">____2</code> for blank 2,
            <code className="bg-white/10 px-1 rounded">____3</code> for blank 3, etc.
          </span>
        </label>
        <textarea rows={5} value={form.code} onChange={e => onChange("code", e.target.value)}
          placeholder={"def prime(n):\n  for i in ____(2, int(n**0.5)+1):\n    if n % ____2 == 0:\n      return False\n  return True"}
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-mono outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>

      {/* ── Per-blank configuration ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Blanks ({blanks.length})
          </label>
          {blanks.length < 5 && (
            <button type="button" onClick={addBlank}
              className="text-[10px] font-bold px-3 py-1 rounded-lg border border-[var(--border-primary)] border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer">
              + Add Blank
            </button>
          )}
        </div>

        {blanks.map((blank, bi) => (
          <div key={bi} className="p-4 rounded-2xl border border-[var(--border-primary)] space-y-3"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-400">
                Blank {bi + 1} — placeholder: <code className="bg-violet-500/10 px-1 rounded">{blank.placeholder}</code>
              </span>
              {blanks.length > 1 && (
                <button type="button" onClick={() => removeBlank(bi)}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer transition-colors">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["a", "b", "c", "d"].map((opt, oi) => (
                <div key={opt}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                    Option {opt.toUpperCase()}
                    {blank.answer === blank[`option_${opt}`] && blank.answer && <span className="text-emerald-400 ml-1">✓</span>}
                  </label>
                  <input type="text" value={blank[`option_${opt}`]}
                    onChange={e => updateBlank(bi, `option_${opt}`, e.target.value)}
                    placeholder={["range", "len", "list", "iter"][oi]}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-mono outline-none"
                    style={{ backgroundColor: "var(--bg-card)", borderColor: blank.answer === blank[`option_${opt}`] && blank.answer ? "rgb(52 211 153 / 0.4)" : "var(--border-primary)", color: "var(--text-primary)" }} />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Correct Answer for Blank {bi + 1} * <span className="normal-case text-white/30">(must match an option exactly)</span>
              </label>
              <input type="text" value={blank.answer}
                onChange={e => updateBlank(bi, "answer", e.target.value)}
                placeholder="range"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] text-xs font-mono outline-none"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Hint *</label>
        <textarea rows={2} value={form.hint} onChange={e => onChange("hint", e.target.value)} placeholder="Use range() to iterate and i to check divisibility..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none resize-none"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

// ─── Validate form before save ────────────────────────────────────────────────
function validateForm(type, form) {
  if (type === "quiz") {
    if (!form.question.trim()) return "Question is required";
    if (!form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) return "All 4 options are required";
    if (!form.explanation.trim()) return "Explanation is required";
  }
  if (type === "match") {
    if (!form.term.trim()) return "Term is required";
    if (!form.definition.trim()) return "Definition is required";
  }
  if (type === "debug") {
    if (!form.title.trim()) return "Title is required";
    if (!form.code.trim()) return "Code snippet is required";
    if (!form.explanation.trim()) return "Explanation is required";
    const bugs = form.buggy_lines || [];
    if (bugs.length === 0) return "At least one buggy line is required";
    for (let i = 0; i < bugs.length; i++) {
      if (!bugs[i].line_number || bugs[i].line_number < 1) return `Bug ${i + 1}: valid line number is required`;
    }
  }
  if (type === "fillin") {
    if (!form.title.trim()) return "Title is required";
    const blanks = form.blanks || [];
    if (blanks.length === 0) return "At least one blank is required";
    if (!form.code.trim()) return "Code snippet is required";
    for (let i = 0; i < blanks.length; i++) {
      const b = blanks[i];
      const opts = [b.option_a, b.option_b, b.option_c, b.option_d];
      if (!form.code.includes(b.placeholder)) return `Blank ${i + 1}: placeholder "${b.placeholder}" not found in code`;
      if (opts.some(o => !o?.trim())) return `Blank ${i + 1}: all 4 options are required`;
      if (!b.answer?.trim()) return `Blank ${i + 1}: correct answer is required`;
      if (!opts.includes(b.answer)) return `Blank ${i + 1}: answer must match one option exactly`;
    }
  }
  if (form.level && (isNaN(form.level) || Number(form.level) < 1)) {
    return "Level must be a valid positive number";
  }
  return null;
}

// ─── Question card display ─────────────────────────────────────────────────────
function QuestionCard({ q, type, onEdit, onDelete, canManage }) {
  const trackName = q.track || q.lang || "General";
  const badgeStyle = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("javascript") || n.includes("react") || n.includes("js")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (n.includes("node")) {
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    }
    if (n.includes("mongo")) {
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    }
    if (n.includes("python")) {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
    if (n.includes("sql")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex items-start justify-between gap-4 p-5 rounded-2xl border border-[var(--border-primary)] group transition-colors hover:bg-[var(--bg-secondary)]"
      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
    >
      <div className="flex-1 min-w-0 space-y-3">
        {/* Badges / Header line */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold bg-zinc-500/5 text-[var(--text-secondary)] border border-[var(--border-primary)] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Lvl {q.level || 1}
          </span>
          <span className={`shrink-0 text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyle(trackName)}`}>
            {trackName}
          </span>
          {!canManage && (
            <span className="shrink-0 text-[9px] font-bold text-amber-400/60 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
              Built-in
            </span>
          )}
        </div>

        {/* Content specific to type */}
        <div className="space-y-2">
          {type === "quiz" && (
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {q.question}
            </p>
          )}

          {type === "match" && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {q.term}
              </p>
            </div>
          )}

          {type === "debug" && (
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {q.title}
            </p>
          )}

          {type === "fillin" && (
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {q.title}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {canManage && (
        <div className="flex items-center gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity self-start mt-1">
          <button onClick={() => onEdit(q)} title="Edit"
            className="p-2 rounded-xl hover:bg-zinc-500/10 hover:text-[var(--text-primary)] text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <Edit3 size={15} />
          </button>
          <button onClick={() => onDelete(q.id)} title="Delete"
            className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ArcadeQuestionsPage() {
  const { token, user } = useAuth();
  const API_BASE = getApiBase();

  const [customData, setCustomData] = useState({ quiz: [], match: [], debug: [], fillin: [] });
  const [activeType, setActiveType] = useState("quiz");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORMS.quiz });
  const [formError, setFormError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [infoGame, setInfoGame] = useState(null);

  const fetchQuestions = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/arcade/questions`, { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const quiz = json.data.filter(q => q.type === "quiz");
        const match = json.data.filter(q => q.type === "match");
        const fillin = json.data.filter(q => q.type === "fillin");
        const debug = json.data.filter(q => q.type === "debug");

        setCustomData({
          quiz: quiz.map(q => ({
            ...q,
            option_a: q.optionA,
            option_b: q.optionB,
            option_c: q.optionC,
            option_d: q.optionD,
            correct_option: q.correctOption,
            time_limit: q.timeLimit
          })),
          match: match,
          fillin: fillin.map(q => ({
            ...q,
            option_a: q.optionA,
            option_b: q.optionB,
            option_c: q.optionC,
            option_d: q.optionD,
            correct_option: q.correctOption,
            blanks: q.blanks || [{ placeholder: "____", option_a: q.optionA, option_b: q.optionB, option_c: q.optionC, option_d: q.optionD, answer: q.correctOption }]
          })),
          debug: debug.map(q => ({
            ...q,
            code: q.defaultCode,
            explanation: q.instructions,
            buggy_lines: q.buggyLines || [{ line_number: "", line_content: "" }]
          }))
        });
      }
    } catch (e) {
      console.error("Failed to fetch questions:", e);
    } finally {
      setLoading(false);
    }
  }, [token, user, API_BASE]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORMS[activeType] });
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (q) => {
    setEditingId(q.id);
    const f = { ...EMPTY_FORMS[activeType] };
    if (activeType === "fillin" && q.options) {
      setForm({
        ...f, ...q,
        option_a: q.options[0] || "",
        option_b: q.options[1] || "",
        option_c: q.options[2] || "",
        option_d: q.options[3] || "",
      });
    } else {
      setForm({ ...f, ...q });
    }
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSave = async () => {
    const err = validateForm(activeType, form);
    if (err) { setFormError(err); return; }

    setLoading(true);
    try {
      let body = {};
      if (activeType === "quiz") {
        body = {
          type: "quiz",
          track: form.track,
          question: form.question,
          code: form.code,
          optionA: form.option_a,
          optionB: form.option_b,
          optionC: form.option_c,
          optionD: form.option_d,
          correctOption: form.correct_option,
          explanation: form.explanation,
          timeLimit: Number(form.time_limit),
          level: Number(form.level)
        };
      } else if (activeType === "match") {
        body = {
          type: "match",
          track: form.track,
          term: form.term,
          definition: form.definition,
          level: Number(form.level)
        };
      } else if (activeType === "fillin") {
        const mainBlank = form.blanks?.[0] || { placeholder: "____", option_a: form.option_a, option_b: form.option_b, option_c: form.option_c, option_d: form.option_d, answer: form.correct_option };
        body = {
          type: "fillin",
          track: form.lang,
          title: form.title,
          code: form.code,
          optionA: mainBlank.option_a || form.option_a,
          optionB: mainBlank.option_b || form.option_b,
          optionC: mainBlank.option_c || form.option_c,
          optionD: mainBlank.option_d || form.option_d,
          correctOption: mainBlank.answer || form.correct_option || form.answer,
          hint: form.hint,
          level: Number(form.level),
          blanks: form.blanks || null
        };
      } else if (activeType === "debug") {
        body = {
          type: "debug",
          track: form.track,
          title: form.title,
          defaultCode: form.code,
          instructions: form.explanation,
          hint: form.hint || "",
          buggyLines: form.buggy_lines || null,
          level: Number(form.level)
        };
      }

      const headers = buildAuthHeaders(token, user);
      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/api/arcade/questions/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API_BASE}/api/arcade/questions`, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });
      }

      const json = await res.json();
      if (json.success) {
        notify(editingId ? "Question updated successfully." : "Question added to the pool!");
        closeForm();
        fetchQuestions();
      } else {
        setFormError(json.message || "Failed to save question.");
      }
    } catch (e) {
      console.error(e);
      setFormError("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/arcade/questions/${id}`, {
        method: "DELETE",
        headers
      });
      const json = await res.json();
      if (json.success) {
        notify("Question removed.", "error");
        setDeleteConfirm(null);
        fetchQuestions();
      } else {
        notify(json.message || "Failed to delete question.", "error");
      }
    } catch (e) {
      console.error(e);
      notify("Server error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const activeGameType = GAME_TYPES.find(g => g.key === activeType);
  const allItems = customData[activeType] || [];
  const filtered = search.trim()
    ? allItems.filter(q => JSON.stringify(q).toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const totalAll = GAME_TYPES.reduce((sum, g) => sum + (customData[g.key]?.length || 0), 0);

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* ── Notification toast ─────────────────────────────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border border-[var(--border-primary)] text-sm font-semibold ${
              notification.type === "error"
                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900"
                : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
            }`}
          >
            {notification.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirm modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-4"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-rose-600 dark:text-rose-400">Remove Question?</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>This question will be removed from the pool immediately.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* ── Game Info modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {infoGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-md rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl space-y-6 relative overflow-hidden"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setInfoGame(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${infoGame.bg} ${infoGame.accent}`}>
                  {React.createElement(infoGame.icon, { size: 24 })}
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[var(--text-primary)]">{infoGame.label}</h3>
                  <p className="text-xs text-[var(--text-muted)]">Game Details & Rules</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Concept</h4>
                  <p className="text-sm leading-relaxed text-[var(--text-primary)]">{infoGame.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">How It Works</h4>
                  <ul className="space-y-2.5">
                    {(GAME_INSTRUCTIONS[infoGame.key] || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setInfoGame(null)}
                  className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold text-xs transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            Question Bank
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Add custom questions to expand the student game pool — they auto-merge with built-in content.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-xs font-medium" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text-primary)" }} className="font-bold text-sm">{totalAll}</span> custom {totalAll === 1 ? "question" : "questions"} total
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-[var(--text-on-accent)] shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "var(--accent-primary)" }}
          >
            <Plus size={14} /> Add Question
          </button>
        </div>
      </section>

      {/* ── Game type tabs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GAME_TYPES.map(gt => {
          const Icon = gt.icon;
          const count = customData[gt.key]?.length || 0;
          const isActive = activeType === gt.key;
          return (
            <div
              key={gt.key}
              onClick={() => { setActiveType(gt.key); setSearch(""); setShowForm(false); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveType(gt.key);
                  setSearch("");
                  setShowForm(false);
                }
              }}
              role="button"
              tabIndex={0}
              className={`p-5 rounded-2xl border border-[var(--border-primary)] text-left transition-colors cursor-pointer flex flex-col items-start relative select-none outline-none focus:ring-1 focus:ring-[var(--accent-primary)] ${isActive ? "shadow-md" : "hover:bg-[var(--bg-secondary)]"}`}
              style={{
                backgroundColor: isActive ? "var(--bg-secondary)" : "var(--bg-primary)",
                borderColor: isActive ? "var(--accent-primary)" : "var(--border-primary)"
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoGame(gt);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="How it works"
              >
                <Info size={16} />
              </button>

              <div className={`p-2.5 rounded-xl mb-4 ${gt.bg} ${gt.accent}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{gt.label}</h3>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{gt.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-primary)] border" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                {count} custom
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit form (slide-down) ────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-[var(--border-primary)] p-6 md:p-8 space-y-6 shadow-sm"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-primary)" }}>
              <h2 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>
                {editingId ? "Edit" : "Add"} {activeGameType.label} Question
              </h2>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer" style={{ color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Render form per type */}
            {activeType === "quiz" && <QuizForm form={form} onChange={handleFieldChange} />}
            {activeType === "match" && <MatchForm form={form} onChange={handleFieldChange} />}
            {activeType === "debug" && <DebugForm form={form} onChange={handleFieldChange} />}
            {activeType === "fillin" && <FillinForm form={form} onChange={handleFieldChange} />}

            {formError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 border border-[var(--border-primary)] border-rose-200 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-400 text-xs font-medium">
                <AlertCircle size={14} className="shrink-0" /> {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
              <button onClick={closeForm}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--accent-primary)" }}>
                <Save size={14} /> {editingId ? "Save Changes" : "Add Question"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Questions list ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-[var(--border-primary)] p-6 md:p-8 space-y-6"
        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border-primary)" }}>
          <div>
            <h2 className="text-xl font-serif" style={{ color: "var(--text-primary)" }}>
              Custom {activeGameType.label} Questions
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {allItems.length} question{allItems.length !== 1 ? "s" : ""} in pool · merge with {activeGameType.description}
            </p>
          </div>

          {allItems.length > 3 && (
            <div className="relative w-full md:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none w-full md:w-64 transition-colors focus:border-[var(--text-muted)]"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              />
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-[var(--border-primary)] border-dashed rounded-2xl" style={{ borderColor: "var(--border-primary)" }}>
            <div className={`p-4 rounded-full ${activeGameType.bg}`}>
              {React.createElement(activeGameType.icon, { size: 24, className: activeGameType.accent })}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {search ? "No questions match your search" : `No custom ${activeGameType.label} questions yet`}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {search ? "Try a different search term" : "Click \"Add Question\" to expand the student question pool."}
              </p>
            </div>
            {!search && (
              <button
                onClick={openAddForm}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--text-on-accent)] text-xs font-semibold cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--accent-primary)" }}
              >
                <Plus size={14} /> Add First Question
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {filtered.map(q => {
                const isAdmin = user?.role === 'ADMIN';
                const isInstituteAdmin = user?.role === 'INSTITUTE_ADMIN';
                const questionInstituteId = q.instituteId ? Number(q.instituteId) : null;
                const userInstituteId = user?.instituteId ? Number(user.instituteId) : null;
                const canManage = isAdmin || (isInstituteAdmin && questionInstituteId !== null && questionInstituteId === userInstituteId);
                return (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    type={activeType}
                    onEdit={openEditForm}
                    onDelete={(id) => setDeleteConfirm(id)}
                    canManage={canManage}
                  />
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Info panel ───────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-[var(--border-primary)] flex items-start gap-3"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">How It Works</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Custom questions are stored locally in this browser and automatically merged with the built-in question pool when students play.
            Students will see both built-in and custom questions shuffled together. Questions are tracked to avoid repetition until the pool is exhausted.
          </p>
        </div>
      </div>
    </div>
  );
}
