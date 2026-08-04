"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Bold, Italic, Link2, Heart, MessageSquare, MoreHorizontal, Send, CornerDownRight, Sparkles, CheckCircle2 } from "lucide-react";
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

function CommentItem({ comment, articleSlug, triggerToast, user, token, isAuthor = false }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.reactionCount || comment.likes || 0);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || comment.children || []);
  const [showReplies, setShowReplies] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Persist comment likes in localStorage so they survive page refresh
  useEffect(() => {
    if (!comment.id) return;
    const storedLiked = localStorage.getItem(`j_cmt_liked_${comment.id}`);
    const storedCount = localStorage.getItem(`j_cmt_count_${comment.id}`);
    if (storedLiked === "true") setLiked(true);
    else if (storedLiked === "false") setLiked(false);
    if (storedCount !== null) setLikeCount(parseInt(storedCount, 10));
  }, [comment.id]);

  const author = comment.author || {};
  const name = author.fullName || author.username || "Reader";
  const isCommentAuthor = author.role === "AUTHOR" || author.username === "admin" || isAuthor;

  const dateStr = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const formattedHtml = formatResponseHtml(comment.content);

  const handleToggleLike = async () => {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(nextLiked);
    setLikeCount(nextCount);
    // Persist to localStorage so likes survive refresh
    if (comment.id) {
      localStorage.setItem(`j_cmt_liked_${comment.id}`, nextLiked ? "true" : "false");
      localStorage.setItem(`j_cmt_count_${comment.id}`, nextCount.toString());
    }
    triggerToast(nextLiked ? "✓ Liked response" : "Removed like");

    try {
      if (token) {
        const headers = buildAuthHeaders(token, user);
        await fetch(`${API}/api/journal/articles/${articleSlug}/reaction`, {
          method: "POST",
          headers,
          body: JSON.stringify({ type: "LIKE" }),
        });
      }
    } catch (_) {}
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      content: replyText,
      author: {
        username: user?.username || "You",
        fullName: user?.fullName || user?.username || "You",
        avatarUrl: user?.avatarUrl || null,
        role: user?.role === "ADMIN" ? "AUTHOR" : "READER",
      },
      createdAt: new Date().toISOString(),
    };

    setReplies((prev) => [...prev, newReply]);
    setShowReplies(true);
    const textToSubmit = replyText;
    setReplyText("");
    setReplying(false);
    triggerToast("✓ Reply published!");

    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API}/api/journal/articles/${articleSlug}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: textToSubmit,
          parentId: comment.id,
        }),
      });
    } catch (_) {}
  };

  return (
    <div className="py-4 space-y-3 font-sans">
      
      {/* ── 1. Author Row & Badges ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={name}
              className="w-9 h-9 rounded-full object-cover border border-[var(--j-border)] shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--j-accent-light)] text-[var(--j-accent)] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {name[0].toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[var(--j-text)] hover:underline cursor-pointer">
                {name}
              </span>
              
              {/* Author Badge */}
              {isCommentAuthor && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-600 text-white shadow-2xs">
                  <CheckCircle2 size={10} /> Author
                </span>
              )}
            </div>
            
            <p className="text-xs text-[var(--j-text-muted)] mt-0.5 font-normal">
              {dateStr}
            </p>
          </div>
        </div>

        {/* Options Dropdown (···) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-[var(--j-text-muted)] hover:text-[var(--j-text)] hover:bg-[var(--j-bg-secondary)] transition-colors rounded-full"
            aria-label="Options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--j-border)] bg-[var(--j-bg-card)] shadow-xl z-50 py-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (typeof window !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                  triggerToast("✓ Link copied!");
                }}
                className="w-full text-left px-3 py-2 hover:bg-[var(--j-bg-secondary)] transition-colors text-[var(--j-text)]"
              >
                Copy link
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  triggerToast("🚩 Reported response for review.");
                }}
                className="w-full text-left px-3 py-2 hover:bg-[var(--j-bg-secondary)] transition-colors text-red-500 font-medium"
              >
                Report response...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Medium Formatted Comment Body ───────────────────────────────── */}
      <div
        className="text-sm sm:text-base leading-relaxed text-[var(--j-text)] font-normal py-1 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_a]:text-[var(--j-accent)] [&_a]:underline"
        style={{ fontFamily: "var(--j-font-reading)" }}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />

      {/* ── 3. Medium Action Toolbar (Clap, Hide/Show Replies, Reply) ──────── */}
      <div className="flex items-center gap-4 text-xs text-[var(--j-text-secondary)] pt-1">
        
        {/* Heart Like Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 transition-colors ${
            liked ? "text-red-500 font-bold" : "hover:text-red-500"
          }`}
          title={liked ? "Unlike response" : "Like response"}
        >
          <Heart size={14} fill={liked ? "#EF4444" : "none"} stroke={liked ? "#EF4444" : "currentColor"} />
          <span className="font-medium">{likeCount}</span>
        </button>

        {/* Hide / Show Replies Toggle */}
        {replies.length > 0 && (
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1.5 hover:text-[var(--j-text)] transition-colors font-medium"
          >
            <MessageSquare size={14} />
            <span>{showReplies ? "Hide replies" : `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}</span>
          </button>
        )}

        {/* Reply Link */}
        <button
          type="button"
          onClick={() => setReplying(!replying)}
          className="font-semibold hover:text-[var(--j-text)] hover:underline transition-colors ml-auto sm:ml-0"
        >
          {replying ? "Cancel" : "Reply"}
        </button>
      </div>

      {/* ── 4. Inline Reply Input Form ──────────────────────────────────────── */}
      {replying && (
        <form onSubmit={handlePostReply} className="mt-3 pl-4 border-l-2 border-[var(--j-accent)] space-y-2.5 animate-fade-in">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to @${author.username || name}...`}
            autoFocus
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[var(--j-border)] bg-[var(--j-bg-secondary)] text-[var(--j-text)] outline-none focus:border-[var(--j-accent)] shadow-2xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="px-3 py-1.5 text-xs font-medium text-[var(--j-text-secondary)] hover:text-[var(--j-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-[var(--j-accent)] text-white rounded-full hover:opacity-90 disabled:opacity-40 shadow-xs"
            >
              Reply
            </button>
          </div>
        </form>
      )}

      {/* ── 5. Medium-Style Indented Nested Replies ───────────────────────────── */}
      {showReplies && replies.length > 0 && (
        <div className="border-l-2 border-[var(--j-border)] pl-4 sm:pl-6 space-y-4 mt-4 pt-1">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleSlug={articleSlug}
              triggerToast={triggerToast}
              user={user}
              token={token}
              isAuthor={reply.author?.role === "AUTHOR" || reply.author?.username === "admin"}
            />
          ))}
        </div>
      )}

    </div>
  );
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
        role: user?.role === "ADMIN" ? "AUTHOR" : "READER",
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

      {/* ── 3. Medium Responses / Comments List ────────────────────────────── */}
      <div className="space-y-6 divide-y divide-[var(--j-border-subtle)]">
        {comments.length === 0 ? (
          <p className="text-xs text-[var(--j-text-muted)] py-6 text-center">
            There are no responses for this story yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleSlug={articleSlug}
              triggerToast={triggerToast}
              user={user}
              token={token}
            />
          ))
        )}
      </div>

    </section>
  );
}
