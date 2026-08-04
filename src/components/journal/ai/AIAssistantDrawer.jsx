"use client";

import { useState } from "react";
import { Sparkles, HelpCircle, Layers, Globe, X, Send, CheckCircle, ArrowRight } from "lucide-react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

export default function AIAssistantDrawer({ open, onClose, articleContent, selectedText, contextPayload }) {
  const [tab, setTab] = useState("ask"); // 'ask' | 'explain' | 'quiz' | 'flashcards'
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [flashcardData, setFlashcardData] = useState(null);

  if (!open) return null;

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/journal/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, articleContent }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "No response generated.");
    } catch {
      setAiAnswer("Failed to reach AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainContext = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/journal/ai/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedText: selectedText || articleContent.substring(0, 300), ...contextPayload }),
      });
      const data = await res.json();
      setAiAnswer(data.explanation || "No explanation generated.");
    } catch {
      setAiAnswer("Failed to explain text.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/journal/ai/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: articleContent }),
      });
      const data = await res.json();
      setQuizData(data.quiz?.items || data.quiz || []);
    } catch {
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] border-l shadow-2xl z-50 flex flex-col" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)", color: "var(--j-text)" }}>

      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--j-border)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--j-accent)" }} />
          <h3 className="j-mono text-sm font-semibold" style={{ color: "var(--j-text)" }}>
            EduVantix AI Assistant
          </h3>
        </div>
        <button onClick={onClose} aria-label="Close AI Assistant">
          <X size={16} style={{ color: "var(--j-text-muted)" }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-xs" style={{ borderColor: "var(--j-border)", fontFamily: "var(--j-font-mono)" }}>
        {[
          { id: "ask", label: "Ask AI" },
          { id: "explain", label: "Explain Selection" },
          { id: "quiz", label: "Quiz" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              if (t.id === "explain" && !aiAnswer) handleExplainContext();
              if (t.id === "quiz" && !quizData) handleGenerateQuiz();
            }}
            className="flex-1 py-2.5 text-center font-medium border-b-2 transition-colors"
            style={{
              borderColor: tab === t.id ? "var(--j-accent)" : "transparent",
              color: tab === t.id ? "var(--j-accent)" : "var(--j-text-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">

        {/* Tab 1: Ask AI */}
        {tab === "ask" && (
          <div className="space-y-4">
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about this article..."
                className="flex-1 px-3 py-2 text-xs rounded border outline-none focus:border-[var(--j-accent)]"
                style={{ fontFamily: "var(--j-font-mono)", borderColor: "var(--j-border)" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 rounded text-xs font-medium text-white transition-opacity hover:opacity-80"
                style={{ fontFamily: "var(--j-font-mono)", background: "var(--j-accent)" }}
              >
                <Send size={12} />
              </button>
            </form>

            {loading && <p className="j-mono text-xs text-center py-4" style={{ color: "var(--j-text-muted)" }}>Thinking...</p>}

            {aiAnswer && (
              <div className="p-4 rounded border text-sm leading-relaxed" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)", fontFamily: "var(--j-font-reading)" }}>
                {aiAnswer}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Explain Selection */}
        {tab === "explain" && (
          <div className="space-y-3">
            {selectedText && (
              <div className="p-2.5 rounded border text-xs italic" style={{ background: "var(--j-accent-light)", borderColor: "var(--j-accent)", fontFamily: "var(--j-font-reading)" }}>
                &quot;{selectedText}&quot;
              </div>
            )}
            {loading ? (
              <p className="j-mono text-xs text-center py-4" style={{ color: "var(--j-text-muted)" }}>Analyzing context...</p>
            ) : (
              <div className="p-4 rounded border text-sm leading-relaxed" style={{ background: "var(--j-bg-secondary)", borderColor: "var(--j-border)", fontFamily: "var(--j-font-reading)" }}>
                {aiAnswer || "Select text in the article and click Explain to get an instant breakdown."}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Quiz */}
        {tab === "quiz" && (
          <div className="space-y-4">
            {loading ? (
              <p className="j-mono text-xs text-center py-4" style={{ color: "var(--j-text-muted)" }}>Generating quiz...</p>
            ) : Array.isArray(quizData) && quizData.length > 0 ? (
              quizData.map((q, idx) => (
                <div key={idx} className="p-4 rounded border" style={{ borderColor: "var(--j-border)", background: "var(--j-bg-secondary)" }}>
                  <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--j-font-heading)" }}>
                    Q{idx + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5">
                    {q.options?.map((opt, oi) => (
                      <div key={oi} className="p-2 rounded border text-xs" style={{ borderColor: "var(--j-border)", background: "#FFFFFF", fontFamily: "var(--j-font-reading)" }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="j-mono text-xs text-center py-4" style={{ color: "var(--j-text-muted)" }}>No quiz generated yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
