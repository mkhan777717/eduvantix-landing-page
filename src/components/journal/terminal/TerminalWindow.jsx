"use client";

import { useEffect, useRef, useState } from "react";

export default function TerminalWindow() {
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState(0);

  const TERMINAL_SCRIPT = [
    // Code block
    { type: "code", lang: "js", lines: [
      { color: "var(--j-term-blue)",    text: "function " },
      { color: "var(--j-term-green)",   text: "solve" },
      { color: "var(--j-term-white)",   text: "(problem) {" },
    ]},
    { type: "code", lines: [
      { color: "var(--j-term-white)",   text: "  " },
      { color: "var(--j-term-purple)",  text: "while" },
      { color: "var(--j-term-white)",   text: "(problem." },
      { color: "var(--j-term-green)",   text: "hasEdgeCases" },
      { color: "var(--j-term-white)",   text: "()) {" },
    ]},
    { type: "code", lines: [
      { color: "var(--j-term-white)",   text: "    " },
      { color: "var(--j-term-green)",   text: "debug" },
      { color: "var(--j-term-white)",   text: "();" },
    ]},
    { type: "code", lines: [
      { color: "var(--j-term-white)",   text: "  }" },
    ]},
    { type: "blank" },
    { type: "code", lines: [
      { color: "var(--j-term-purple)",  text: "  return " },
      { color: "var(--j-term-yellow)",  text: "accepted" },
      { color: "var(--j-term-white)",   text: ";" },
    ]},
    { type: "code", lines: [
      { color: "var(--j-term-white)",   text: "}" },
    ]},
    { type: "blank" },
    // npm run learn
    { type: "prompt", text: "npm run learn" },
    { type: "output", color: "var(--j-term-comment)", text: "" },
    { type: "output", color: "var(--j-term-green)",   text: "✓ Loading DSA roadmap..." },
    { type: "output", color: "var(--j-term-green)",   text: "✓ Building coding examples..." },
    { type: "output", color: "var(--j-term-green)",   text: "✓ Compiling interview questions..." },
    { type: "output", color: "var(--j-term-comment)", text: "" },
    { type: "output", color: "var(--j-term-white)",   text: "Done in 0.42s." },
  ];

  useEffect(() => {
    if (phase >= TERMINAL_SCRIPT.length) return;
    const delay = TERMINAL_SCRIPT[phase].type === "blank" ? 80 : 160;
    const tid = setTimeout(() => {
      setLines((prev) => [...prev, TERMINAL_SCRIPT[phase]]);
      setPhase((p) => p + 1);
    }, delay);
    return () => clearTimeout(tid);
  }, [phase]);

  const isComplete = phase >= TERMINAL_SCRIPT.length;

  return (
    <div className="j-terminal select-none" role="img" aria-label="EduVantix Journal terminal illustration">
      {/* Title bar */}
      <div className="j-terminal-titlebar">
        <span className="j-terminal-dot" style={{ background: "#FF5F57" }} />
        <span className="j-terminal-dot" style={{ background: "#FEBC2E" }} />
        <span className="j-terminal-dot" style={{ background: "#28C840" }} />
        <span
          className="ml-3 text-xs"
          style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-term-comment)" }}
        >
          journal.js — EduVantix
        </span>
      </div>

      {/* Content */}
      <div className="j-terminal-content min-h-[200px]">
        {lines.map((line, i) => {
          if (line.type === "blank") return <div key={i} className="h-3" />;

          if (line.type === "prompt") {
            return (
              <div key={i} className="j-term-line flex items-center gap-2">
                <span style={{ color: "var(--j-term-prompt)" }}>❯</span>
                <span style={{ color: "var(--j-term-white)" }}>{line.text}</span>
              </div>
            );
          }

          if (line.type === "output") {
            return (
              <div key={i} className="j-term-line" style={{ color: line.color }}>
                {line.text}
              </div>
            );
          }

          // code line
          return (
            <div key={i} className="j-term-line flex flex-wrap">
              {line.lines?.map((segment, si) => (
                <span key={si} style={{ color: segment.color }}>{segment.text}</span>
              ))}
            </div>
          );
        })}

        {/* Blinking cursor */}
        {isComplete && <span className="j-cursor" />}
      </div>
    </div>
  );
}
