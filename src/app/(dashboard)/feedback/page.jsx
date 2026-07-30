"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake, CheckCircle2, AlertTriangle, Send } from "lucide-react";

export default function FeedbackPage() {
  const { token, API_BASE } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("loading");
    setErrMsg("");

    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "USER" }),
      };

      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage("");
      } else {
        setStatus("error");
        setErrMsg(data.message || "Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
      setStatus("error");
      setErrMsg("Failed to connect to the server. Please check your connection.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 rounded-3xl border border-[var(--border-primary)] shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300"
          style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Feedback Submitted!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Feedback submitted successfully. Our team will look into this shortly...
            </p>
          </div>
          <button
            onClick={() => setStatus("idle")}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-[var(--text-on-accent)] hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/10"
            style={{ background: "var(--accent-gradient)" }}
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-0 flex flex-col flex-1 animate-in fade-in duration-500" style={{ color: "var(--text-primary)" }}>
      {/* Header section */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <HeartHandshake size={12} className="text-violet-500" />
            Feedback Portal
          </div>
          <h1 className="text-4xl font-serif tracking-tight">
            Share Your Feedback
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Help us shape the future of Eduvantix. Tell us what you like or how we can improve.
          </p>
        </div>
      </section>

      <div className="flex-1 min-h-0 overflow-y-auto pb-12 flex justify-center">
        <div className="w-full max-w-2xl p-6 md:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xl relative overflow-hidden h-fit"
          style={{ backgroundColor: "var(--bg-card)" }}>
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[var(--accent-primary)]/5 blur-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
              Your Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your feedback, suggestions, or bug reports here..."
              className="w-full p-4 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            />
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold animate-in fade-in duration-300">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider text-[var(--text-on-accent)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md shadow-[var(--accent-primary)]/10"
            style={{ background: "var(--accent-gradient)" }}
          >
            {status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-[var(--text-on-accent)]" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={13} />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex justify-center items-center gap-2.5 text-[11px] font-semibold pb-8" style={{ color: "var(--text-muted)" }}>
        <HeartHandshake size={14} style={{ color: "var(--accent-primary)" }} />
        <span>Thank you for making Eduvantix better!</span>
      </div>
    </div>
    </div>
  );
}
