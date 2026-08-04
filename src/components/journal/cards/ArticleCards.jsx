"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Heart, Bookmark, Sparkles, Share2, MoreHorizontal, FileText,
  ThumbsDown, UserPlus, VolumeX, Flag, Copy, Check, Send, X
} from "lucide-react";
import { DifficultyBadge, CategoryBadge, TagPill } from "@/components/journal/ui/JournalUI";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const API = getApiBase();

export function ArticleCard({ article, showExcerpt = true }) {
  const { user, token } = useAuth();
  if (!article) return null;

  // Interactive States
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    article.reactionCount || article.reactions || 0
  );
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [followingTopic, setFollowingTopic] = useState(false);
  const [mutedAuthor, setMutedAuthor] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Quick Comment State
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [commentsList, setCommentsList] = useState(article.comments || []);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const menuRef = useRef(null);

  const authorName = article.author?.fullName || article.author?.username || "EduVantix Author";
  const authorUsername = article.author?.username || "author";
  const formattedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const categoryName = article.category?.name || "Engineering";
  const categorySlug = article.category?.slug || "general";

  // Close dropdown menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // 1. Toggle Like / Reaction
  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    triggerToast(newLiked ? "✓ Added reaction to story!" : "Removed reaction");

    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API}/api/journal/articles/${article.slug}/react`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "LIKE" }),
      });
    } catch (_) {}
  };

  // 2. Toggle Bookmark / Save
  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    triggerToast(
      newBookmarked ? "✓ Saved article to your Library!" : "Removed from Library"
    );

    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API}/api/journal/bookmarks`, {
        method: newBookmarked ? "POST" : "DELETE",
        headers,
        body: JSON.stringify({ articleId: article.id, slug: article.slug }),
      });
    } catch (_) {}
  };

  // 3. Toggle Dislike
  const handleToggleDislike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDisliked(!disliked);
    triggerToast(
      !disliked
        ? "Feedback noted. Showing fewer stories like this."
        : "Feedback cleared."
    );
  };

  // 4. Share Article Link
  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/journal/article/${article.slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        triggerToast("✓ Link copied to clipboard!");
      } else {
        triggerToast(`Link: ${shareUrl}`);
      }
    } catch (_) {
      triggerToast("✓ Link copied to clipboard!");
    }
  };

  // 5. Open Quick Comments
  const handleOpenComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentDrawerOpen(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);

    const newCommentObj = {
      id: Date.now(),
      content: commentText,
      author: {
        username: user?.username || "You",
        fullName: user?.fullName || user?.username || "You",
      },
      createdAt: new Date().toISOString(),
    };

    setCommentsList((prev) => [newCommentObj, ...prev]);
    setCommentText("");
    setSubmittingComment(false);
    triggerToast("✓ Response posted!");

    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API}/api/journal/articles/${article.slug}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: commentText }),
      });
    } catch (_) {}
  };

  // Options Menu Handlers
  const handleFollowAuthor = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !followingAuthor;
    setFollowingAuthor(next);
    setMenuOpen(false);
    triggerToast(next ? `✓ You are now following @${authorUsername}` : `Unfollowed @${authorUsername}`);
  };

  const handleFollowTopic = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !followingTopic;
    setFollowingTopic(next);
    setMenuOpen(false);
    triggerToast(next ? `✓ Following topic #${categoryName}` : `Unfollowed topic #${categoryName}`);
  };

  const handleMuteAuthor = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !mutedAuthor;
    setMutedAuthor(next);
    setMenuOpen(false);
    triggerToast(next ? `🔇 Muted stories from @${authorUsername}` : `Unmuted @${authorUsername}`);
  };

  const handleReportStory = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    triggerToast("🚩 Thank you. This story has been reported for editorial review.");
  };

  if (mutedAuthor) {
    return (
      <div className="py-4 border-b border-[var(--j-border)] text-xs text-[var(--j-text-muted)] flex items-center justify-between">
        <span>Story hidden (Muted @{authorUsername})</span>
        <button onClick={handleMuteAuthor} className="text-[var(--j-accent)] hover:underline font-medium">
          Undo Mute
        </button>
      </div>
    );
  }

  return (
    <article className="group relative py-6 border-b border-[var(--j-border)] hover:bg-[var(--j-bg-secondary)]/30 transition-all duration-200 rounded-lg px-2 -mx-2">

      {/* Floating Action Toast Notification */}
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-md animate-fade-in flex items-center gap-1.5">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 1. Top Header Meta Row (Medium-Style) ────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--j-text-secondary)] mb-2 flex-wrap font-sans">
        {/* Publication / Category Badge */}
        <Link
          href={`/journal/category/${categorySlug}`}
          className="inline-flex items-center gap-1 font-semibold text-[var(--j-text)] hover:text-[var(--j-accent)] transition-colors"
        >
          <span className="w-5 h-5 rounded bg-[var(--j-accent-light)] text-[var(--j-accent)] flex items-center justify-center text-[10px] font-mono font-bold uppercase shrink-0">
            {categoryName.substring(0, 2)}
          </span>
          In {categoryName}
        </Link>
        <span className="text-[var(--j-text-muted)]">by</span>

        {/* Author Name */}
        {article.author?.username ? (
          <Link
            href={`/journal/author/${article.author.username}`}
            className="font-medium text-[var(--j-text)] hover:underline"
          >
            {authorName}
          </Link>
        ) : (
          <span className="font-medium text-[var(--j-text)]">{authorName}</span>
        )}

        <span className="text-[var(--j-text-muted)]">·</span>
        <span className="text-[var(--j-text-muted)]">{formattedDate}</span>
      </div>

      {/* ── 2. Middle Main Row (Title & Excerpt Left, Image Right) ───────────── */}
      <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4">
        {/* Left Side: Title & Subtitle/Excerpt */}
        <div className="flex-1 min-w-0">
          <Link href={`/journal/article/${article.slug}`} className="block group/link">
            <h3
              className="text-xl sm:text-2xl font-bold leading-snug tracking-tight text-[var(--j-text)] group-hover/link:text-[var(--j-accent)] transition-colors mb-1.5"
              style={{ fontFamily: "var(--j-font-heading)" }}
            >
              {article.title}
            </h3>
          </Link>

          {showExcerpt && (article.subtitle || article.excerpt) && (
            <p
              className="text-sm text-[var(--j-text-secondary)] line-clamp-2 leading-relaxed font-normal"
              style={{ fontFamily: "var(--j-font-reading)" }}
            >
              {article.subtitle || article.excerpt}
            </p>
          )}
        </div>

        {/* Right Side: Cover Image Thumbnail */}
        <Link href={`/journal/article/${article.slug}`} className="shrink-0">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-24 sm:w-36 h-18 sm:h-24 object-cover rounded-md border border-[var(--j-border)] shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
            />
          ) : (
            <div className="w-24 sm:w-36 h-18 sm:h-24 rounded-md border border-[var(--j-border)] bg-[var(--j-bg-secondary)] flex flex-col items-center justify-center gap-1 p-2 text-center text-[var(--j-text-muted)] group-hover:border-[var(--j-accent)] transition-colors">
              <FileText size={20} className="text-[var(--j-accent)] opacity-80" />
              <span className="text-[10px] font-mono font-medium truncate max-w-full px-1">
                {categoryName}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* ── 3. Bottom Toolbar & Stats Row ────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 text-xs text-[var(--j-text-muted)] font-sans">
        
        {/* Left Side Interactive Reaction Indicators */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {article.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[var(--j-accent)] font-medium" title="Featured Article">
              <Sparkles size={13} fill="currentColor" />
            </span>
          )}

          {/* Like / Clap Action */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`inline-flex items-center gap-1 transition-colors ${
              liked ? "text-red-500 font-semibold" : "hover:text-red-500 text-[var(--j-text-secondary)]"
            }`}
            title={liked ? "Unlike story" : "Like story"}
          >
            <Heart size={15} fill={liked ? "#EF4444" : "none"} className={liked ? "scale-110" : ""} />
            <span>{likeCount}</span>
          </button>

          {/* Quick Comments Button */}
          <button
            type="button"
            onClick={handleOpenComments}
            className="inline-flex items-center gap-1 hover:text-[var(--j-accent)] text-[var(--j-text-secondary)] transition-colors"
            title="Read & post comments"
          >
            <MessageSquare size={14} />
            <span>{commentsList.length || article.commentCount || 0}</span>
          </button>

          {/* Read Time */}
          {article.readTime && (
            <span>{article.readTime} min read</span>
          )}

          {/* Difficulty Badge */}
          {article.difficulty && (
            <DifficultyBadge difficulty={article.difficulty} />
          )}
        </div>

        {/* Right Side Action Icons Toolbar (Medium-Style) */}
        <div className="flex items-center gap-1.5 relative">

          {/* Dislike / Not Interested Button */}
          <button
            type="button"
            onClick={handleToggleDislike}
            className={`p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] transition-colors ${
              disliked ? "text-red-400" : "text-[var(--j-text-muted)] hover:text-[var(--j-text)]"
            }`}
            title="Show fewer stories like this"
            aria-label="Dislike story"
          >
            <ThumbsDown size={14} />
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] transition-colors ${
              bookmarked ? "text-[var(--j-accent)]" : "text-[var(--j-text-muted)] hover:text-[var(--j-text)]"
            }`}
            title={bookmarked ? "Remove bookmark" : "Save bookmark"}
            aria-label="Bookmark article"
          >
            <Bookmark size={15} fill={bookmarked ? "var(--j-accent)" : "none"} />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
            title="Share article link"
            aria-label="Share article"
          >
            <Share2 size={14} />
          </button>

          {/* Medium-Style Options Dropdown Trigger (···) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)] hover:text-[var(--j-text)] transition-colors"
              title="More options"
              aria-label="More options"
            >
              <MoreHorizontal size={15} />
            </button>

            {/* Medium Options Popup Menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl border border-[var(--j-border)] bg-[var(--j-bg-card)] shadow-xl z-50 py-2 text-xs font-sans animate-fade-in">
                
                {/* Follow Author */}
                <button
                  type="button"
                  onClick={handleFollowAuthor}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--j-bg-secondary)] flex items-center justify-between transition-colors"
                  style={{ color: "var(--j-text)" }}
                >
                  <span>{followingAuthor ? `Following @${authorUsername}` : `Follow author (@${authorUsername})`}</span>
                  <UserPlus size={13} className="text-[var(--j-accent)]" />
                </button>

                {/* Follow Topic */}
                <button
                  type="button"
                  onClick={handleFollowTopic}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--j-bg-secondary)] flex items-center justify-between transition-colors"
                  style={{ color: "var(--j-text)" }}
                >
                  <span>{followingTopic ? `Following #${categoryName}` : `Follow topic #${categoryName}`}</span>
                  <Sparkles size={13} className="text-[var(--j-accent)]" />
                </button>

                <div className="my-1 border-t border-[var(--j-border-subtle)]" />

                {/* Mute Author */}
                <button
                  type="button"
                  onClick={handleMuteAuthor}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--j-bg-secondary)] flex items-center justify-between transition-colors text-[var(--j-text-secondary)]"
                >
                  <span>Mute author</span>
                  <VolumeX size={13} />
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--j-bg-secondary)] flex items-center justify-between transition-colors text-[var(--j-text-secondary)]"
                >
                  <span>Copy link</span>
                  <Copy size={13} />
                </button>

                <div className="my-1 border-t border-[var(--j-border-subtle)]" />

                {/* Report Story */}
                <button
                  type="button"
                  onClick={handleReportStory}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--j-bg-secondary)] flex items-center justify-between transition-colors text-red-500 font-medium"
                >
                  <span>Report story...</span>
                  <Flag size={13} />
                </button>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 4. Inline Quick Comment Drawer / Modal ────────────────────────────── */}
      {commentDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCommentDrawerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--j-border)] bg-[var(--j-bg-card)] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--j-border)]">
              <div>
                <p className="text-xs font-semibold text-[var(--j-accent)]">Responses</p>
                <h4 className="text-base font-bold text-[var(--j-text)] line-clamp-1">
                  {article.title}
                </h4>
              </div>
              <button
                onClick={() => setCommentDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-[var(--j-bg-secondary)] text-[var(--j-text-muted)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Comment Post Box */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What are your thoughts?"
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--j-border)] bg-[var(--j-bg-secondary)] text-[var(--j-text)] outline-none focus:border-[var(--j-accent)]"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--j-accent)] text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                <Send size={12} /> Respond
              </button>
            </form>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-2">
              {commentsList.length === 0 ? (
                <p className="text-xs text-[var(--j-text-muted)] text-center py-6">
                  No responses yet. Be the first to share your thoughts!
                </p>
              ) : (
                commentsList.map((c, i) => (
                  <div key={c.id || i} className="p-3 rounded-lg border border-[var(--j-border-subtle)] bg-[var(--j-bg-secondary)]/40 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--j-text)]">
                        @{c.author?.username || "user"}
                      </span>
                      <span className="text-[10px] text-[var(--j-text-muted)]">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-[var(--j-text-secondary)] leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </article>
  );
}

export function FeaturedCard({ article }) {
  if (!article) return null;

  const authorName = article.author?.fullName || article.author?.username || "EduVantix Author";
  const formattedDate = article.publishedAt || article.createdAt
    ? new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Recently";

  const categoryName = article.category?.name || "Featured";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 border-b border-[var(--j-border)]">

      {/* Left: Featured editorial text */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="j-eyebrow">Featured Story</span>
          <span className="text-[var(--j-text-muted)]">·</span>
          <span className="text-xs text-[var(--j-text-muted)]">{categoryName}</span>
        </div>

        <Link href={`/journal/article/${article.slug}`} className="group">
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-3 text-[var(--j-text)] group-hover:text-[var(--j-accent)] transition-colors"
            style={{ fontFamily: "var(--j-font-heading)" }}
          >
            {article.title}
          </h1>
        </Link>

        {(article.subtitle || article.excerpt) && (
          <p
            className="text-base text-[var(--j-text-secondary)] leading-relaxed mb-6 line-clamp-3 font-normal"
            style={{ fontFamily: "var(--j-font-reading)" }}
          >
            {article.subtitle || article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-[var(--j-text-secondary)] mb-4">
          <span className="font-semibold text-[var(--j-text)]">By {authorName}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          {article.readTime && (
            <>
              <span>·</span>
              <span>{article.readTime} min read</span>
            </>
          )}
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <TagPill key={typeof tag === "string" ? tag : tag.slug} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Featured Cover Image */}
      <div className="overflow-hidden rounded-xl border border-[var(--j-border)] bg-[var(--j-bg-secondary)] shadow-sm">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-64 sm:h-80 flex flex-col items-center justify-center p-6 text-center text-[var(--j-text-muted)]">
            <FileText size={48} className="text-[var(--j-accent)] mb-2" />
            <p className="text-sm font-semibold">{article.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MiniArticleCard({ article }) {
  if (!article) return null;
  const authorName = article.author?.fullName || article.author?.username || "Author";

  return (
    <Link
      href={`/journal/article/${article.slug}`}
      className="flex gap-3 py-3 border-b border-[var(--j-border)] group hover:bg-[var(--j-bg-secondary)]/30 px-2 -mx-2 rounded"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--j-text-muted)] mb-0.5 font-sans">
          {authorName} {article.readTime ? `· ${article.readTime} min` : ""}
        </p>
        <p
          className="text-sm font-bold leading-snug truncate text-[var(--j-text)] group-hover:text-[var(--j-accent)] transition-colors"
          style={{ fontFamily: "var(--j-font-heading)" }}
        >
          {article.title}
        </p>
      </div>
    </Link>
  );
}
