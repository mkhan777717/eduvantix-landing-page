"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Bold, Italic, Link2, Heart, MessageSquare, MoreHorizontal, Send, CornerDownRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

function formatResponseHtml(content) {
  if (!content) return "";
  if (content.includes("<") && content.includes(">")) {
    return content;
  }
  // Convert legacy markdown stars or bracket links into clean HTML tags
  let html = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--j-accent)] underline">$1</a>');
  return html;
}

export default function MediumResponseSection({ articleSlug, initialComments = [] }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const editorRef = useRef(null);
  const displayName = user?.fullName || user?.username || "You";

  useEffect(() => {
    if (!articleSlug) return;
    const headers = buildAuthHeaders(token, user);
    fetch(`${API}/api/journal/articles/${articleSlug}/comments`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      })
      .catch(() => {});
  }, [articleSlug, token, user]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Rich Text ExecCommand Formatting
  const handleFormat = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (command === "createLink") {
        const url = prompt("Enter link URL:", "https://");
        if (url) {
          document.execCommand("createLink", false, url);
        }
      } else {
        document.execCommand(command, false, value);
      }
    }
  };

  const handlePostResponse = async (e) => {
    e.preventDefault();
    const htmlContent = editorRef.current?.innerHTML || "";
    const plainText = editorRef.current?.innerText || "";
    
    if (!plainText.trim() && !htmlContent.includes("<img")) return;
    setSubmitting(true);

    const newResponseObj = {
      id: Date.now(),
      content: htmlContent,
      author: {
        username: user?.username || "You",
        fullName: displayName,
        avatarUrl: user?.avatarUrl || null,
      },
      createdAt: new Date().toISOString(),
      reactionCount: 0,
    };

    setComments((prev) => [newResponseObj, ...prev]);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setIsExpanded(false);
    setSubmitting(false);
    triggerToast("✓ Response published!");

    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API}/api/journal/articles/${articleSlug}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: htmlContent }),
      });
    } catch (_) {}
  };

  return (
    <section id="comments" className="mt-12 pt-10 border-t border-[var(--j-border)] font-sans">
      
      {/* Toast Feedback Banner */}
      {toastMsg && (
        <div className="mb-4 p-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm flex items-center justify-between">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 1. Section Header (Medium-Style) ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-2xl font-bold tracking-tight text-[var(--j-text)]"
          style={{ fontFamily: "var(--j-font-heading)" }}
        >
          Responses ({comments.length})
        </h3>
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] transition-colors"
          title="EduVantix Community Guidelines"
        >
          <ShieldCheck size={18} />
        </button>
      </div>

      {/* ── 2. Medium Rich Response Box ──────────────────────────────── */}
      <div className="mb-10 rounded-xl border border-[var(--j-border)] bg-[var(--j-bg-card)] p-5 shadow-xs transition-all">
        
        {/* User Info Row */}
        <div className="flex items-center gap-3 mb-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-[var(--j-border)] shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--j-accent-light)] text-[var(--j-accent)] flex items-center justify-center font-bold text-xs shrink-0">
              {displayName[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-[var(--j-text)]">
            {displayName}
          </span>
        </div>

        {/* Response Form / Input Area */}
        <form onSubmit={handlePostResponse}>
          {!isExpanded ? (
            /* Collapsed Input Placeholder */
            <div
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => editorRef.current?.focus(), 50);
              }}
              className="w-full p-4 rounded-lg border border-[var(--j-border-subtle)] bg-[var(--j-bg-secondary)] text-sm text-[var(--j-text-muted)] cursor-pointer hover:border-[var(--j-accent)] transition-colors"
            >
              What are your thoughts?
            </div>
          ) : (
            /* Expanded Medium Rich Response Input */
            <div className="rounded-lg border border-[var(--j-border)] bg-[var(--j-bg-secondary)] overflow-hidden">
              
              {/* Rich ContentEditable Textbox */}
              <div
                ref={editorRef}
                contentEditable
                aria-label="What are your thoughts?"
                data-placeholder="What are your thoughts?"
                className="w-full p-4 min-h-[110px] text-sm bg-transparent text-[var(--j-text)] outline-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--j-text-muted)] focus:before:content-none [&_strong]:font-bold [&_strong]:text-[var(--j-text)] [&_b]:font-bold [&_em]:italic [&_i]:italic [&_a]:text-[var(--j-accent)] [&_a]:underline"
                style={{ fontFamily: "var(--j-font-reading)" }}
              />

              {/* Input Box Bottom Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--j-border-subtle)] bg-[var(--j-bg-card)]">
                
                {/* Left Formatting Buttons */}
                <div className="flex items-center gap-1.5 text-[var(--j-text-muted)]">
                  <button
                    type="button"
                    onClick={() => handleFormat("bold")}
                    className="p-1.5 rounded hover:bg-[var(--j-bg-secondary)] hover:text-[var(--j-text)] font-bold text-xs transition-colors"
                    title="Bold text"
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat("italic")}
                    className="p-1.5 rounded hover:bg-[var(--j-bg-secondary)] hover:text-[var(--j-text)] italic text-xs transition-colors"
                    title="Italic text"
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat("createLink")}
                    className="p-1.5 rounded hover:bg-[var(--j-bg-secondary)] hover:text-[var(--j-text)] transition-colors"
                    title="Add Link"
                  >
                    <Link2 size={15} />
                  </button>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      if (editorRef.current) editorRef.current.innerHTML = "";
                    }}
                    className="text-xs font-medium text-[var(--j-text-secondary)] hover:text-[var(--j-text)] transition-colors px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[var(--j-accent)] hover:opacity-90 disabled:opacity-40 transition-opacity shadow-xs flex items-center gap-1.5"
                  >
                    <Send size={12} /> Respond
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── 3. Responses / Comments List ────────────────────────────────────── */}
      <div className="space-y-6 divide-y divide-[var(--j-border-subtle)]">
        {comments.length === 0 ? (
          <p className="text-xs text-[var(--j-text-muted)] py-6 text-center">
            There are no responses for this story yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.author || {};
            const name = author.fullName || author.username || "Reader";
            const dateStr = comment.createdAt
              ? new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "Recently";

            const formattedHtml = formatResponseHtml(comment.content);

            return (
              <div key={comment.id} className="pt-6 space-y-3">
                {/* Author Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {author.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={name}
                        className="w-7 h-7 rounded-full object-cover border border-[var(--j-border)]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--j-accent-light)] text-[var(--j-accent)] flex items-center justify-center font-bold text-xs">
                        {name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[var(--j-text)] leading-none">
                        {name}
                      </p>
                      <span className="text-[10px] text-[var(--j-text-muted)]">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>

                {/* Formatted Comment Content */}
                <div
                  className="text-sm leading-relaxed text-[var(--j-text-secondary)] font-normal [&_strong]:font-bold [&_strong]:text-[var(--j-text)] [&_b]:font-bold [&_b]:text-[var(--j-text)] [&_em]:italic [&_i]:italic [&_a]:text-[var(--j-accent)] [&_a]:underline"
                  style={{ fontFamily: "var(--j-font-reading)" }}
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />

                {/* Response Action Bar */}
                <div className="flex items-center gap-4 text-xs text-[var(--j-text-muted)] pt-1">
                  <button className="flex items-center gap-1 hover:text-[var(--j-accent)] transition-colors">
                    <Heart size={14} />
                    <span>{comment.reactionCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-[var(--j-accent)] transition-colors">
                    <CornerDownRight size={13} />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </section>
  );
}
