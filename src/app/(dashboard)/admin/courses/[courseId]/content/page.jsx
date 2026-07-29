"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Plus, Trash2, Pencil, ChevronDown, ChevronRight, Save,
  GripVertical, BookOpen, Video, Code2, FileQuestion, FileText, ClipboardList,
  RefreshCw, Check, X, AlertCircle, Eye, EyeOff, ArrowUp, ArrowDown, Info, Upload,
  HelpCircle, Copy, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { renderMarkdown, getYtId } from "@/lib/renderMarkdown";

// ── Constants ───────────────────────────────────────────────────────────────

const STEP_TYPES = [
  { value: "CONCEPT", label: "Concept", icon: BookOpen, color: "text-blue-400 bg-blue-500/10", desc: "Text/markdown content for reading" },
  { value: "VIDEO", label: "Video", icon: Video, color: "text-rose-400 bg-rose-500/10", desc: "YouTube/Vimeo video lesson" },
  { value: "MCQ", label: "MCQ Quiz", icon: FileQuestion, color: "text-amber-400 bg-amber-500/10", desc: "Multiple choice question" },
  { value: "CODING", label: "Coding", icon: Code2, color: "text-violet-400 bg-violet-500/10", desc: "Code challenge with test cases" },
  { value: "ASSIGNMENT", label: "Assignment", icon: ClipboardList, color: "text-cyan-400 bg-cyan-500/10", desc: "File/text submission task" },
];

const TYPE_ICONS = { CONCEPT: BookOpen, VIDEO: Video, MCQ: FileQuestion, CODING: Code2, ASSIGNMENT: ClipboardList, TEST: FileText };
const TYPE_COLORS = {
  CONCEPT: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  VIDEO: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  MCQ: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  CODING: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  ASSIGNMENT: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  TEST: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

// ── Small UI helpers ─────────────────────────────────────────────────────────

function Input({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</label>}
      <input {...props}
        className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all"
        style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
    </div>
  );
}

function Textarea({ label, rows = 5, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</label>}
      <textarea rows={rows} {...props}
        className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all resize-y"
        style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", fontFamily: props.mono ? "monospace" : undefined }} />
    </div>
  );
}

function Toggle({ label, checked, onChange, sub }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span>
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-all ${checked ? "bg-[var(--accent-primary)]" : "bg-[var(--border-primary)]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </label>
  );
}

// ── Markdown & ChatGPT Guide Modal ───────────────────────────────────────────

function MarkdownGuideModal({ isOpen, onClose }) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const chatGptPrompt = `You are a course content creator for Eduvantix.
Please output all course content formatted in GitHub-Flavored Markdown according to these rules:

1. Headings: Use # for title, ## for major section, ### for sub-section.
2. Code Blocks: Wrap code in triple backticks with language tag (e.g. \`\`\`python ... \`\`\`).
3. Inline Code: Wrap code keywords or variable names in single backticks (\`variable\`).
4. Tables: Format tables using standard Markdown (| Col 1 | Col 2 | \\n |---|---|).
5. Images: Use ![Alt Caption](image-url) to embed images with captions.
6. YouTube Videos: Use ![video](youtube-url) to embed interactive video players.
7. Callouts: Use > for important notes or warnings.
8. Lists: Use - for bullet points and 1. for numbered lists.

Example Topic: [INSERT TOPIC HERE]`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(chatGptPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-2xl rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--accent-glow)] text-[var(--text-accent)] border border-[var(--border-accent)]">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Markdown & AI Guide</h3>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Supported formatting & prompt generator for AI tools</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* AI Prompt Generator Card */}
            <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500 shrink-0" />
                  <span className="font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>AI Content Prompt</span>
                </div>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer shrink-0"
                >
                  {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                  {copiedPrompt ? "Copied AI Prompt!" : "Copy AI Prompt"}
                </button>
              </div>
              <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Paste this prompt into any AI tool (ChatGPT, Claude, Gemini) when requesting course content. It instructs AI to structure content perfectly compatible with Eduvantix.
              </p>
              <pre className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap shadow-inner" style={{ color: "var(--text-primary)" }}>
                {chatGptPrompt}
              </pre>
            </div>

            {/* Quick Syntax Reference */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Supported Markdown Features</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Headers & Text */}
                <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1.5">
                  <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Headings & Styling</span>
                  <div className="font-mono text-[11px] space-y-1 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                    <p># Heading 1</p>
                    <p>## Heading 2</p>
                    <p>### Heading 3</p>
                    <p>**Bold text** | *Italic text*</p>
                  </div>
                </div>

                {/* Tables */}
                <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1.5">
                  <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Tables</span>
                  <div className="font-mono text-[11px] space-y-1 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                    <p>| Col A | Col B |</p>
                    <p>|-------|-------|</p>
                    <p>| Val 1 | Val 2 |</p>
                  </div>
                </div>

                {/* Code Blocks */}
                <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1.5">
                  <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Code & Syntax</span>
                  <div className="font-mono text-[11px] space-y-1 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                    <p>`inline_code`</p>
                    <p>```python</p>
                    <p>print(&quot;Hello World&quot;)</p>
                    <p>```</p>
                  </div>
                </div>

                {/* Media & Links */}
                <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1.5">
                  <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Media & Embeds</span>
                  <div className="font-mono text-[11px] space-y-1 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                    <p>![Image Caption](url.jpg)</p>
                    <p>![video](youtube-url)</p>
                    <p>[Link Text](url)</p>
                  </div>
                </div>

                {/* Lists & Quotes */}
                <div className="p-3.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] md:col-span-2 space-y-1.5">
                  <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Lists & Callouts</span>
                  <div className="font-mono text-[11px] space-y-1 bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>
                    <p>- Bullet point item</p>
                    <p>1. Numbered item</p>
                    <p>&gt; Blockquote / Important Note</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow transition-all cursor-pointer"
              style={{ background: "var(--accent-gradient)" }}
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TextareaWithMediaToolbar({ label, value = "", onChange, placeholder, rows = 6, mono = false, API_BASE, authHeaders }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'image' | 'video' | 'guide' | null
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  const insertTextAtCursor = (template) => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + "\n" + template);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);
    const newText = textBefore + template + textAfter;
    onChange(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + template.length, start + template.length);
    }, 50);
  };

  const uploadFileAndInsert = async (file) => {
    if (!file) return;
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image size exceeds ${MAX_SIZE_MB}MB limit. Please upload an image smaller than 5MB.`);
      return;
    }
    setUploading(true);
    setUploadProgress("Uploading image...");
    try {
      const fileName = (file.name && file.name !== "blob" && file.name !== "image.png")
        ? file.name
        : `screenshot-${Date.now()}.png`;
      const fileToUpload = new File([file], fileName, { type: file.type || "image/png" });

      const formData = new FormData();
      formData.append("file", fileToUpload, fileName);
      const res = await fetch(`${API_BASE}/api/learn/admin/upload-media`, {
        method: "POST",
        headers: {
          ...(authHeaders?.Authorization ? { Authorization: authHeaders.Authorization } : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        insertTextAtCursor(`\n![](${data.url})\n`);
        setModalMode(null);
      } else {
        alert(data.message || "Failed to upload image.");
      }
    } catch (err) {
      alert("Error uploading image file.");
    }
    setUploading(false);
    setUploadProgress("");
  };

  // GitHub style paste image support (Cmd+V / Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          uploadFileAndInsert(file);
          break;
        }
      }
    }
  };

  // GitHub style drag & drop support
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      uploadFileAndInsert(files[0]);
    }
  };

  const handleConfirmImageUrl = () => {
    if (!imageUrl.trim()) return;
    const altText = imageAlt.trim() || "Image";
    insertTextAtCursor(`\n![${altText}](${imageUrl.trim()})\n`);
    setImageUrl("");
    setImageAlt("");
    setModalMode(null);
  };

  const handleConfirmVideoUrl = () => {
    if (!videoUrl.trim()) return;
    insertTextAtCursor(`\n![video](${videoUrl.trim()})\n`);
    setVideoUrl("");
    setModalMode(null);
  };

  return (
    <div className="space-y-1.5 relative">
      <input type="file" ref={fileInputRef} onChange={e => { if (e.target.files?.[0]) uploadFileAndInsert(e.target.files[0]); e.target.value = ""; }} accept="image/*" className="hidden" />

      <div className="flex items-center justify-between">
        {label && <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</label>}
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--border-primary)] hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)] text-[var(--text-accent)] transition-all cursor-pointer disabled:opacity-50">
            {uploading ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
            {uploading ? uploadProgress || "Uploading..." : "Upload Image"}
          </button>

          <button type="button" onClick={() => setModalMode("image")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--border-primary)] hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer">
            + Image Link
          </button>

          <button type="button" onClick={() => setModalMode("video")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[var(--border-primary)] hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer">
            <Video size={11} /> + Insert Video
          </button>

          <button type="button" onClick={() => setModalMode("guide")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer">
            <HelpCircle size={11} /> Markdown Guide
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        onPaste={handlePaste}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all resize-y"
        style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", fontFamily: mono ? "monospace" : undefined }}
      />
      <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between">
        <span>💡 Tip: You can drag & drop or paste (Cmd+V / Ctrl+V) images directly into the box (Max file size: 5MB).</span>
      </div>

      {/* GitHub Style Custom Modal Dialog (No browser prompts!) */}
      {modalMode === "guide" && (
        <MarkdownGuideModal isOpen={true} onClose={() => setModalMode(null)} />
      )}

      <AnimatePresence>
        {(modalMode === "image" || modalMode === "video") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  {modalMode === "image" ? <Upload size={14} className="text-blue-400" /> : <Video size={14} className="text-rose-400" />}
                  {modalMode === "image" ? "Insert Image via Link" : "Insert Embedded Video"}
                </h3>
                <button type="button" onClick={() => setModalMode(null)} className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              {modalMode === "image" ? (
                <div className="space-y-3">
                  <Input label="Image Web URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/photo.png" />
                  <Input label="Caption / Alt Text (optional)" value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="e.g. Diagram of Binary Search Tree" />
                  {imageUrl && (
                    <div className="p-2 border border-[var(--border-primary)] rounded-xl bg-[var(--bg-secondary)] text-center">
                      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Preview</p>
                      <img src={imageUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" onError={e => e.target.style.display='none'} />
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setModalMode(null)} className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
                      Cancel
                    </button>
                    <button type="button" onClick={handleConfirmImageUrl} disabled={!imageUrl.trim()} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow transition-all cursor-pointer disabled:opacity-50" style={{ background: "var(--accent-gradient)" }}>
                      Insert Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input label="YouTube or Vimeo URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                  {videoUrl && getYtId(videoUrl) && (
                    <div className="rounded-xl overflow-hidden aspect-video border border-[var(--border-primary)]">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYtId(videoUrl)}`} frameBorder="0" allowFullScreen />
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setModalMode(null)} className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
                      Cancel
                    </button>
                    <button type="button" onClick={handleConfirmVideoUrl} disabled={!videoUrl.trim()} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow transition-all cursor-pointer disabled:opacity-50" style={{ background: "var(--accent-gradient)" }}>
                      Insert Video
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



// ── Step Type Editors ────────────────────────────────────────────────────────

function ConceptEditor({ step, onChange, API_BASE, authHeaders }) {
  return (
    <div className="space-y-4">
      <TextareaWithMediaToolbar label="Content (Markdown & Media supported)" rows={14} value={step.content || ""} onChange={val => onChange("content", val)} API_BASE={API_BASE} authHeaders={authHeaders}
        placeholder={`# Introduction\n\nWrite your lesson content here. Use '+ Insert Image' or '+ Insert Video' buttons to embed media anywhere in text.\n\n![Image Caption](https://...)\n![video](https://youtube.com/...)`} />

      <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex gap-2 text-xs text-blue-400">
        <Info size={13} className="shrink-0 mt-0.5" /> Tip: Use the toolbar buttons to insert images or YouTube videos directly into your markdown content.
      </div>
    </div>
  );
}

function VideoEditor({ step, onChange, API_BASE, authHeaders }) {
  const getYtId = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYtId(step.videoUrl);
  return (
    <div className="space-y-4">
      <Input label="YouTube URL" value={step.videoUrl || ""}
        onChange={e => { onChange("videoUrl", e.target.value); onChange("videoProvider", "YOUTUBE"); }}
        placeholder="https://www.youtube.com/watch?v=..." />
      {ytId && (
        <div className="rounded-xl overflow-hidden border border-[var(--border-primary)] aspect-video">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen />
        </div>
      )}
      
      {/* 80% Watch Requirement Toggle (Default: Optional/false) */}
      <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>Require 80% Video Watch to Complete</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${step.requireWatch80Percent ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                {step.requireWatch80Percent ? "Required" : "Optional (Default)"}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              By default, watching 80% is optional. Turn on this toggle if students MUST watch at least 80% of the video to mark this step complete.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={!!step.requireWatch80Percent}
              onChange={e => onChange("requireWatch80Percent", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Conditionally render Video Duration ONLY when toggle is ON */}
        {step.requireWatch80Percent && (
          <div className="pt-3 border-t border-[var(--border-primary)] space-y-2 animate-in fade-in duration-200">
            <Input
              label="Video Duration (seconds)"
              type="number"
              min={0}
              value={step.videoDurationSeconds || ""}
              onChange={e => onChange("videoDurationSeconds", e.target.value)}
              placeholder="e.g. 600 for 10 minutes"
            />
            <p className="text-[10px] text-amber-400 font-medium">
              ⚠️ Set duration accurately so the 80% watch threshold is calculated correctly.
            </p>
          </div>
        )}
      </div>

      <TextareaWithMediaToolbar label="Written Notes (optional)" rows={6} value={step.content || ""} onChange={val => onChange("content", val)} API_BASE={API_BASE} authHeaders={authHeaders} placeholder="Supporting notes, key takeaways, or additional resources..." />
    </div>
  );
}

function MCQEditor({ step, onChange }) {
  const options = step.mcqOptions || [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }];

  const updateOption = (i, key, val) => {
    const updated = options.map((o, idx) => {
      if (key === "isCorrect") return { ...o, isCorrect: idx === i }; // Radio: only one correct
      return idx === i ? { ...o, [key]: val } : o;
    });
    onChange("mcqOptions", updated);
  };

  const addOption = () => onChange("mcqOptions", [...options, { text: "", isCorrect: false }]);
  const removeOption = (i) => onChange("mcqOptions", options.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <Textarea label="Question" rows={3} value={step.questionText || ""} onChange={e => onChange("questionText", e.target.value)} placeholder="What is the time complexity of binary search?" />
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Answer Options <span className="text-[10px] normal-case font-normal text-emerald-400">(click radio to mark correct)</span></label>
        {options.map((opt, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${opt.isCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "border-[var(--border-primary)] bg-[var(--bg-card)]"}`}>
            <button type="button" onClick={() => updateOption(i, "isCorrect", true)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${opt.isCorrect ? "border-emerald-400 bg-emerald-400" : "border-[var(--border-primary)]"}`}>
              {opt.isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
            <span className="text-xs font-bold shrink-0" style={{ color: "var(--text-muted)" }}>{String.fromCharCode(65 + i)}.</span>
            <input value={opt.text} onChange={e => updateOption(i, "text", e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }} />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)} className="p-1 hover:text-rose-400 transition-colors cursor-pointer shrink-0" style={{ color: "var(--text-muted)" }}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addOption}
          className="flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--text-accent)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
          <Plus size={13} /> Add Option
        </button>
      </div>
      <Textarea label="Explanation (shown after submission)" rows={3} value={step.explanation || ""} onChange={e => onChange("explanation", e.target.value)} placeholder="The correct answer is... because..." />
    </div>
  );
}

const ALL_SUPPORTED_LANGUAGES = [
  ["python", "Python 3"],
  ["cpp", "C++ 17"],
  ["java", "Java 17"],
  ["javascript", "JavaScript"],
  ["go", "Go 1.20"],
  ["c", "C 11"]
];

function CodingEditor({ step, onChange, API_BASE, authHeaders }) {
  const testCases = step.testCases || [];
  const starterCode = step.starterCode || {};

  const currentAllowedLangs = (starterCode.allowedLanguages && Array.isArray(starterCode.allowedLanguages) && starterCode.allowedLanguages.length > 0)
    ? starterCode.allowedLanguages
    : ["python", "cpp", "java", "javascript", "go", "c"];

  const addTestCase = () => onChange("testCases", [...testCases, { input: "", expectedOutput: "", isSample: false }]);
  const updateTestCase = (i, key, val) => onChange("testCases", testCases.map((tc, idx) => idx === i ? { ...tc, [key]: val } : tc));
  const removeTestCase = (i) => onChange("testCases", testCases.filter((_, idx) => idx !== i));

  const toggleLang = (langKey, isChecked) => {
    let updated = isChecked
      ? [...currentAllowedLangs, langKey]
      : currentAllowedLangs.filter(l => l !== langKey);
    if (!updated.length) updated = [langKey];
    onChange("starterCode", { ...starterCode, allowedLanguages: updated });
  };

  return (
    <div className="space-y-5">
      <TextareaWithMediaToolbar label="Problem Statement (Markdown & Media supported)" rows={6} value={step.problemStatement || ""} onChange={val => onChange("problemStatement", val)} API_BASE={API_BASE} authHeaders={authHeaders} placeholder="Given an array of integers, find the maximum subarray sum..." />
      <div className="grid grid-cols-2 gap-4">
        <Textarea label="Input Format" rows={3} value={step.inputFormat || ""} onChange={e => onChange("inputFormat", e.target.value)} placeholder="First line: n (array size)&#10;Second line: n space-separated integers" />
        <Textarea label="Output Format" rows={3} value={step.outputFormat || ""} onChange={e => onChange("outputFormat", e.target.value)} placeholder="Print the maximum subarray sum" />
      </div>
      <Textarea label="Constraints" rows={2} value={step.constraints || ""} onChange={e => onChange("constraints", e.target.value)} placeholder="1 ≤ n ≤ 10^5, -10^4 ≤ arr[i] ≤ 10^4" />

      {/* Allowed Languages Checkboxes */}
      <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
            Allowed Programming Languages for Students
          </label>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Select which language tabs students will see for this problem:</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {ALL_SUPPORTED_LANGUAGES.map(([langKey, label]) => {
            const allowed = currentAllowedLangs.includes(langKey);
            return (
              <label key={langKey} className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${allowed ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-bold" : "border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"}`}>
                <input
                  type="checkbox"
                  checked={allowed}
                  onChange={e => toggleLang(langKey, e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-primary)] accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Starter Code per language */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Starter Code (for enabled languages)</label>
        {ALL_SUPPORTED_LANGUAGES.filter(([langKey]) => currentAllowedLangs.includes(langKey)).map(([lang, label]) => (
          <div key={lang}>
            <p className="text-[11px] mb-1 font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
            <textarea rows={4} value={starterCode[lang] || ""} onChange={e => onChange("starterCode", { ...starterCode, [lang]: e.target.value })}
              placeholder={`# ${label} starter code...`}
              className="w-full px-3.5 py-2 rounded-xl text-xs outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all resize-y font-mono"
              style={{ backgroundColor: "var(--bg-code)", color: "var(--text-primary)" }} />
          </div>
        ))}
      </div>

      {/* Test Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Test Cases</label>
          <button type="button" onClick={addTestCase} className="flex items-center gap-1 text-xs font-semibold cursor-pointer" style={{ color: "var(--text-accent)" }}>
            <Plus size={12} /> Add Test Case
          </button>
        </div>
        {testCases.length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>No test cases yet. Add at least one sample test case.</p>}
        {testCases.map((tc, i) => (
          <div key={i} className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>Test Case {i + 1}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer" style={{ color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(i, "isSample", e.target.checked)} className="w-3 h-3" />
                  Sample (visible to students)
                </label>
                <button type="button" onClick={() => removeTestCase(i)} className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"><X size={13} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>Input</p>
                <textarea rows={3} value={tc.input} onChange={e => updateTestCase(i, "input", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none border border-[var(--border-primary)] resize-none"
                  style={{ backgroundColor: "var(--bg-code)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>Expected Output</p>
                <textarea rows={3} value={tc.expectedOutput} onChange={e => updateTestCase(i, "expectedOutput", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none border border-[var(--border-primary)] resize-none"
                  style={{ backgroundColor: "var(--bg-code)", color: "var(--text-primary)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentEditor({ step, onChange, API_BASE, authHeaders }) {
  return (
    <div className="space-y-4">
      <TextareaWithMediaToolbar
        label="Assignment Instructions (Markdown & Media supported)"
        rows={8}
        value={step.assignmentInstructions || step.content || ""}
        onChange={val => {
          onChange("assignmentInstructions", val);
          onChange("content", val);
        }}
        API_BASE={API_BASE}
        authHeaders={authHeaders}
        placeholder="## Task Description&#10;&#10;1. Create a Python script that...&#10;2. Submit your solution as a .py file&#10;&#10;## Evaluation Criteria&#10;- Correctness&#10;- Code quality"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Allowed File Types (comma-separated)" value={step.allowedFileTypes || ""} onChange={e => onChange("allowedFileTypes", e.target.value)} placeholder="py,cpp,java,zip" />
        <Input label="Max File Size (MB)" type="number" min={1} max={50} value={step.maxFileSizeMb || ""} onChange={e => onChange("maxFileSizeMb", e.target.value)} placeholder="10" />
      </div>
    </div>
  );
}

// ── Live Preview Component ────────────────────────────────────────────────────

function StepPreview({ step }) {
  const getYtId = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/);
    return m ? m[1] : null;
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)]">
      {/* Preview header */}
      <div className="px-6 py-3 border-b border-[var(--border-primary)] flex items-center gap-2" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <Eye size={13} style={{ color: "var(--text-accent)" }} />
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-accent)" }}>Student Preview</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-primary)]" style={{ color: "var(--text-muted)" }}>How students see this step</span>
      </div>

      <div className="p-6">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-primary)]">
          <div className={`p-2 rounded-xl ${TYPE_COLORS[step.type]}`}>
            {React.createElement(TYPE_ICONS[step.type] || BookOpen, { size: 16 })}
          </div>
          <div>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{step.title || "(untitled step)"}</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{step.type}</p>
          </div>
        </div>

        {/* CONCEPT preview */}
        {step.type === "CONCEPT" && (
          <div className="space-y-6">
            {step.videoUrl && getYtId(step.videoUrl) && (
              <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] aspect-video shadow-lg">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYtId(step.videoUrl)}`} frameBorder="0" allowFullScreen />
              </div>
            )}
            <div className="max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(step.content) }} />
            {!step.content && <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No content added yet.</p>}
          </div>
        )}

        {/* VIDEO preview */}
        {step.type === "VIDEO" && (
          <div className="space-y-5">
            {step.videoUrl && getYtId(step.videoUrl) ? (
              <div className="rounded-2xl overflow-hidden border border-[var(--border-primary)] aspect-video shadow-lg">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYtId(step.videoUrl)}`} frameBorder="0" allowFullScreen />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 rounded-2xl border border-dashed border-[var(--border-primary)]">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No video URL set</p>
              </div>
            )}
            {step.content && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Notes</p>
                <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{step.content}</div>
              </div>
            )}
          </div>
        )}

        {/* MCQ preview */}
        {step.type === "MCQ" && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Question</p>
              <p className="font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {step.questionText || <span className="italic" style={{ color: "var(--text-muted)" }}>No question text</span>}
              </p>
            </div>
            <div className="space-y-3">
              {(step.mcqOptions || []).map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${opt.isCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "border-[var(--border-primary)] bg-[var(--bg-card)]"}`}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-[var(--bg-secondary)]" style={{ color: "var(--text-muted)" }}>{String.fromCharCode(65 + i)}</span>
                  <span className="text-sm flex-1" style={{ color: "var(--text-primary)" }}>{opt.text || `Option ${String.fromCharCode(65 + i)}`}</span>
                  {opt.isCorrect && <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Correct</span>}
                </div>
              ))}
            </div>
            {step.explanation && (
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <p className="text-[11px] font-bold text-blue-400 mb-1">Explanation (shown after answer):</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{step.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* CODING preview */}
        {step.type === "CODING" && (
          <div className="space-y-5">
            {step.problemStatement && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Problem</p>
                <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{step.problemStatement}</div>
              </div>
            )}
            {step.constraints && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>Constraints</p>
                <div className="text-xs font-mono p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]" style={{ color: "var(--text-secondary)" }}>{step.constraints}</div>
              </div>
            )}
            {(step.testCases || []).filter(tc => tc.isSample).map((tc, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>Sample Input {i+1}</p>
                  <pre className="text-xs p-3 rounded-xl bg-[var(--bg-code)] border border-[var(--border-primary)] font-mono overflow-x-auto" style={{ color: "var(--text-primary)" }}>{tc.input}</pre>
                </div>
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: "var(--text-muted)" }}>Expected Output {i+1}</p>
                  <pre className="text-xs p-3 rounded-xl bg-[var(--bg-code)] border border-[var(--border-primary)] font-mono overflow-x-auto" style={{ color: "var(--text-primary)" }}>{tc.expectedOutput}</pre>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--border-primary)] overflow-hidden">
              <div className="px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>Code Editor (Python)</div>
              <pre className="p-4 text-xs font-mono min-h-[80px]" style={{ backgroundColor: "var(--bg-code)", color: "var(--text-primary)" }}>{step.starterCode?.python || "# Your code here"}</pre>
            </div>
          </div>
        )}

        {/* ASSIGNMENT preview */}
        {step.type === "ASSIGNMENT" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
              <div className="prose-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(step.assignmentInstructions || step.content || "") }} />
              {!(step.assignmentInstructions || step.content) && (
                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>No instructions added yet.</p>
              )}
            </div>
            <div className="p-4 rounded-xl border-2 border-dashed border-[var(--border-primary)] text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Students will submit their solution here</p>
              {step.allowedFileTypes && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Accepted: {step.allowedFileTypes}</p>}
            </div>
          </div>
        )}

        {/* Common Doubts */}
        {step.commonDoubts?.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[var(--border-primary)] space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Common Doubts</p>
            {step.commonDoubts.map((d, i) => (
              <details key={i} className="group">
                <summary className="text-xs font-semibold px-3 py-2 rounded-lg border border-[var(--border-primary)] cursor-pointer hover:border-[var(--border-accent)] transition-colors list-none" style={{ color: "var(--text-secondary)" }}>❓ {d.question}</summary>
                <div className="mt-2 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs" style={{ color: "var(--text-secondary)" }}>{d.answer}</div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Common Doubts Editor ──────────────────────────────────────────────────────

function CommonDoubtsEditor({ doubts = [], onChange }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const add = () => {
    if (!q.trim() || !a.trim()) return;
    onChange([...doubts, { question: q.trim(), answer: a.trim() }]);
    setQ(""); setA("");
  };

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Common Doubts (FAQ)</label>
      {doubts.map((d, i) => (
        <div key={i} className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-1">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Q: {d.question}</p>
            <button type="button" onClick={() => onChange(doubts.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-300 shrink-0 cursor-pointer"><X size={12} /></button>
          </div>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>A: {d.answer}</p>
        </div>
      ))}
      <div className="p-3 rounded-xl border border-dashed border-[var(--border-primary)] space-y-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Question..." className="w-full bg-transparent outline-none text-xs" style={{ color: "var(--text-primary)" }} />
        <input value={a} onChange={e => setA(e.target.value)} placeholder="Answer..." className="w-full bg-transparent outline-none text-xs" style={{ color: "var(--text-primary)" }}
          onKeyDown={e => e.key === "Enter" && add()} />
        <button type="button" onClick={add} className="text-xs font-semibold cursor-pointer flex items-center gap-1" style={{ color: "var(--text-accent)" }}>
          <Plus size={12} /> Add FAQ
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ContentBuilderPage() {
  const router = useRouter();
  const { courseId } = useParams();
  const { token, API_BASE } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [activeStep, setActiveStep] = useState(null); // { chapterId, stepId } or null
  const [stepData, setStepData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [addingStepFor, setAddingStepFor] = useState(null); // chapterId
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepType, setNewStepType] = useState("CONCEPT");
  const [editingChapter, setEditingChapter] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deleteChapterTarget, setDeleteChapterTarget] = useState(null);
  const [deleteStepTarget, setDeleteStepTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteChapter = async (chapterId) => {
    if (!chapterId) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE}/api/learn/admin/chapters/${chapterId}`, { method: "DELETE", headers: authHeaders() });
      await loadCourse();
      if (activeStep && course?.chapters?.find(ch => ch.id === chapterId)?.steps?.some(s => s.id === activeStep)) {
        setActiveStep(null); setStepData(null);
      }
    } catch (e) { console.error(e); }
    setIsDeleting(false);
    setDeleteChapterTarget(null);
  };

  const authHeaders = useCallback(() => {
    const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
    return {
      "Content-Type": "application/json",
      ...(hasRealToken
        ? { Authorization: `Bearer ${token}` }
        : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
    };
  }, [token]);

  // Load course with chapters+steps
  const loadCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/courses/${courseId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success && data.course) {
        setCourse(data.course);
        // Auto-expand first chapter
        if (data.course.chapters?.length > 0) {
          setExpandedChapters(prev => Object.keys(prev).length > 0 ? prev : { [data.course.chapters[0].id]: true });
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [courseId, API_BASE, authHeaders]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  // Open a step for editing
  const openStep = (step) => {
    setActiveStep(step.id);
    setStepData({ ...step, mcqOptions: step.mcqOptions || [], testCases: step.testCases || [], commonDoubts: step.commonDoubts || [] });
    setSaved(false);
  };

  const updateStepField = (key, val) => {
    setStepData(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const saveStep = async () => {
    if (!stepData) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/steps/${stepData.id}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(stepData),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        await loadCourse();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addChapter = async () => {
    if (!newChapterTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/courses/${courseId}/chapters`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ title: newChapterTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewChapterTitle(""); setAddingChapter(false);
        await loadCourse();
        setExpandedChapters(prev => ({ ...prev, [data.chapter.id]: true }));
      }
    } catch (e) { console.error(e); }
  };

  const saveChapterTitle = async (chapterId) => {
    if (!editingChapter || !editingChapter.title.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/chapters/${chapterId}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ title: editingChapter.title.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCourse(prev => ({
          ...prev,
          chapters: prev.chapters.map(ch => ch.id === chapterId ? { ...ch, title: data.chapter.title } : ch)
        }));
        setEditingChapter(null);
      }
    } catch (e) { console.error(e); }
  };

  const deleteChapter = async (chapterId) => {
    if (!chapterId) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE}/api/learn/admin/chapters/${chapterId}`, { method: "DELETE", headers: authHeaders() });
      await loadCourse();
      if (activeStep && course?.chapters?.find(ch => ch.id === chapterId)?.steps?.some(s => s.id === activeStep)) {
        setActiveStep(null); setStepData(null);
      }
    } catch (e) { console.error(e); }
    setIsDeleting(false);
    setDeleteChapterTarget(null);
  };

  const addStep = async (chapterId) => {
    if (!newStepTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/learn/admin/chapters/${chapterId}/steps`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ title: newStepTitle.trim(), type: newStepType }),
      });
      const data = await res.json();
      if (data.success) {
        setNewStepTitle(""); setAddingStepFor(null); setNewStepType("CONCEPT");
        await loadCourse();
        openStep(data.step);
      }
    } catch (e) { console.error(e); }
  };

  const deleteStep = async (stepId) => {
    if (!stepId) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_BASE}/api/learn/admin/steps/${stepId}`, { method: "DELETE", headers: authHeaders() });
      if (activeStep === stepId) { setActiveStep(null); setStepData(null); }
      await loadCourse();
    } catch (e) { console.error(e); }
    setIsDeleting(false);
    setDeleteStepTarget(null);
  };

  const moveChapter = async (chapterId, dir) => {
    const chapters = course.chapters;
    const idx = chapters.findIndex(c => c.id === chapterId);
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= chapters.length) return;
    const swapped = [...chapters];
    [swapped[idx], swapped[newIdx]] = [swapped[newIdx], swapped[idx]];
    const orderList = swapped.map((c, i) => ({ id: c.id, order: i }));
    try {
      await fetch(`${API_BASE}/api/learn/admin/courses/${courseId}/chapters/reorder`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ order: orderList }),
      });
      await loadCourse();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle size={32} style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-secondary)" }}>Course not found or access denied.</p>
        <button onClick={() => router.push("/admin/courses")} className="text-sm font-semibold cursor-pointer" style={{ color: "var(--text-accent)" }}>← Back to Courses</button>
      </div>
    );
  }

  const activeStepData = stepData;

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-6 -my-4">
      {/* ── Left: Chapter + Step Tree ──────────────────────────────────────── */}
      <div className="w-[320px] shrink-0 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-sidebar)] overflow-hidden">
        {/* Course header */}
        <div className="p-4 border-b border-[var(--border-primary)] space-y-1">
          <button onClick={() => router.push("/admin/courses")} className="flex items-center gap-1.5 text-xs font-semibold mb-2 cursor-pointer hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ChevronLeft size={13} /> All Courses
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-[var(--bg-secondary)] border border-[var(--border-primary)] shrink-0 overflow-hidden">
              {course.iconUrl ? (
                (course.iconUrl.startsWith("http") || course.iconUrl.startsWith("data:") || course.iconUrl.startsWith("/")) ? (
                  <img src={course.iconUrl} className="w-full h-full object-contain p-0.5" alt="" />
                ) : (
                  course.iconUrl
                )
              ) : (
                "📚"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{course.title}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{course.chapters?.length || 0} chapters · {course.chapters?.reduce((a, c) => a + (c.steps?.length || 0), 0)} steps</p>
            </div>
          </div>
        </div>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {course.chapters?.map((chapter, ci) => {
            const isExpanded = expandedChapters[chapter.id];
            return (
              <div key={chapter.id} className="rounded-xl border border-[var(--border-primary)] overflow-hidden">
                {/* Chapter row */}
                <div className="flex items-center gap-1.5 p-2.5 bg-[var(--bg-secondary)] group">
                  <button onClick={() => moveChapter(chapter.id, "up")} disabled={ci === 0} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-0 transition-all text-[var(--text-muted)]">
                    <ArrowUp size={11} />
                  </button>

                  {editingChapter?.id === chapter.id ? (
                    <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                      <input
                        value={editingChapter.title}
                        onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") saveChapterTitle(chapter.id);
                          if (e.key === "Escape") setEditingChapter(null);
                        }}
                        className="flex-1 bg-[var(--bg-input)] px-2 py-1 rounded-lg text-xs font-bold outline-none border border-[var(--border-accent)]"
                        style={{ color: "var(--text-primary)" }}
                      />
                      <button onClick={() => saveChapterTitle(chapter.id)} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 cursor-pointer" title="Save">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingChapter(null)} className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer" title="Cancel">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <button onClick={() => setExpandedChapters(p => ({ ...p, [chapter.id]: !p[chapter.id] }))}
                        className="flex-1 flex items-center gap-2 text-left cursor-pointer min-w-0">
                        <ChevronRight size={13} className={`shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} style={{ color: "var(--text-muted)" }} />
                        <span className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                          {ci + 1}. {chapter.title}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: "var(--text-muted)" }}>{chapter.steps?.length || 0}</span>
                      </button>
                      <button onClick={e => { e.stopPropagation(); setEditingChapter({ id: chapter.id, title: chapter.title }); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-[var(--text-accent)] transition-all cursor-pointer text-[var(--text-muted)] shrink-0"
                        title="Edit Chapter Title">
                        <Pencil size={11} />
                      </button>
                    </div>
                  )}

                  <button onClick={() => moveChapter(chapter.id, "down")} disabled={ci === course.chapters.length - 1} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-0 transition-all text-[var(--text-muted)]">
                    <ArrowDown size={11} />
                  </button>
                  <button onClick={() => setDeleteChapterTarget(chapter)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all cursor-pointer text-[var(--text-muted)]" title="Delete Chapter">
                    <Trash2 size={11} />
                  </button>
                </div>

                {/* Steps */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="py-1 space-y-0.5">
                        {chapter.steps?.map((step, si) => {
                          const StepIcon = TYPE_ICONS[step.type] || BookOpen;
                          const isActive = activeStep === step.id;
                          return (
                            <div key={step.id}
                              onClick={() => openStep(step)}
                              className={`flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg cursor-pointer group transition-all ${isActive ? "bg-[var(--accent-glow)] border border-[var(--border-accent)]" : "hover:bg-[var(--bg-hover)]"}`}>
                              <div className={`p-1 rounded-md shrink-0 ${TYPE_COLORS[step.type]}`}>
                                <StepIcon size={11} />
                              </div>
                              <span className={`text-xs truncate flex-1 ${isActive ? "font-bold" : "font-medium"}`} style={{ color: isActive ? "var(--text-accent)" : "var(--text-primary)" }}>
                                {step.title}
                              </span>
                              <button onClick={e => { e.stopPropagation(); setDeleteStepTarget(step); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-all cursor-pointer shrink-0" style={{ color: "var(--text-muted)" }} title="Delete Step">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          );
                        })}

                        {/* Add step inline */}
                        {addingStepFor === chapter.id ? (
                          <div className="mx-1 p-3 space-y-2 rounded-lg border border-dashed border-[var(--border-primary)]">
                            <input value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)}
                              autoFocus onKeyDown={e => e.key === "Enter" && addStep(chapter.id)}
                              placeholder="Step title..." className="w-full bg-transparent outline-none text-xs" style={{ color: "var(--text-primary)" }} />
                            <div className="grid grid-cols-3 gap-1">
                              {STEP_TYPES.map(t => (
                                <button key={t.value} type="button" onClick={() => setNewStepType(t.value)}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${newStepType === t.value ? `${TYPE_COLORS[t.value]} border-current` : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}
                                  style={{ color: newStepType === t.value ? undefined : "var(--text-muted)" }}>
                                  {t.label}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => addStep(chapter.id)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white cursor-pointer" style={{ background: "var(--accent-gradient)" }}>Add</button>
                              <button type="button" onClick={() => { setAddingStepFor(null); setNewStepTitle(""); }} className="px-3 rounded-lg text-[11px] border border-[var(--border-primary)] cursor-pointer hover:bg-[var(--bg-hover)]" style={{ color: "var(--text-secondary)" }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setAddingStepFor(chapter.id); setNewStepTitle(""); setNewStepType("CONCEPT"); }}
                            className="flex items-center gap-1.5 w-full px-3 py-2 text-[11px] font-semibold hover:bg-[var(--bg-hover)] rounded-lg mx-1 transition-colors cursor-pointer" style={{ color: "var(--text-muted)" }}>
                            <Plus size={11} /> Add Step
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Add chapter */}
          {addingChapter ? (
            <div className="p-3 rounded-xl border border-dashed border-[var(--border-primary)] space-y-2">
              <input value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)}
                autoFocus onKeyDown={e => e.key === "Enter" && addChapter()}
                placeholder="Chapter title..." className="w-full bg-transparent outline-none text-sm font-semibold" style={{ color: "var(--text-primary)" }} />
              <div className="flex gap-2">
                <button onClick={addChapter} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer" style={{ background: "var(--accent-gradient)" }}>Add Chapter</button>
                <button onClick={() => { setAddingChapter(false); setNewChapterTitle(""); }} className="px-3 rounded-lg text-xs border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] cursor-pointer" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingChapter(true)}
              className="flex items-center gap-2 w-full p-3 rounded-xl border border-dashed border-[var(--border-primary)] text-xs font-semibold hover:border-[var(--border-accent)] hover:bg-[var(--accent-glow)] transition-all cursor-pointer"
              style={{ color: "var(--text-secondary)" }}>
              <Plus size={13} /> Add Chapter
            </button>
          )}
        </div>
      </div>

      {/* ── Right: Step Editor / Preview ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeStepData ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center">
              <BookOpen size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>Select a step to edit</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Click any step in the left panel, or add a new one to get started.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Step editor toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${TYPE_COLORS[activeStepData.type]}`}>
                  {React.createElement(TYPE_ICONS[activeStepData.type] || BookOpen, { size: 14 })}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{activeStepData.title}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{activeStepData.type}</p>
                </div>
              </div>

              {/* Center: Edit / Preview Switch */}
              <div className="flex rounded-xl overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-card)] p-0.5">
                <button onClick={() => setIsPreviewMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${!isPreviewMode ? "bg-[var(--accent-glow)] text-[var(--text-accent)] border border-[var(--border-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}>
                  <Pencil size={11} /> Edit
                </button>
                <button onClick={() => setIsPreviewMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${isPreviewMode ? "bg-[var(--accent-glow)] text-[var(--text-accent)] border border-[var(--border-accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"}`}>
                  <Eye size={11} /> Student Preview
                </button>
              </div>

              <div className="flex items-center gap-2">
                {saved && (
                  <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Check size={13} /> Saved
                  </motion.span>
                )}
                <button onClick={saveStep} disabled={saving}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow hover:opacity-90 transition-opacity"
                  style={{ background: "var(--accent-gradient)" }}>
                  {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                  {saving ? "Saving..." : "Save Step"}
                </button>
              </div>
            </div>

            {/* Body: Editor or Student Preview */}
            {isPreviewMode ? (
              <StepPreview step={activeStepData} />
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Common fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Step Title" value={activeStepData.title || ""} onChange={e => updateStepField("title", e.target.value)} placeholder="Step title..." />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Step Type</label>
                    <select value={activeStepData.type} onChange={e => updateStepField("type", e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-sm outline-none border border-[var(--border-primary)]"
                      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                      {STEP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                  <Toggle label="Premium Step" sub="Require paid access for this step" checked={activeStepData.isPremium} onChange={v => updateStepField("isPremium", v)} />
                </div>

                {/* Divider */}
                <div className="border-t border-[var(--border-primary)]" />

                {/* Type-specific editor */}
                {activeStepData.type === "CONCEPT" && <ConceptEditor step={activeStepData} onChange={updateStepField} API_BASE={API_BASE} authHeaders={authHeaders()} />}
                {activeStepData.type === "VIDEO" && <VideoEditor step={activeStepData} onChange={updateStepField} API_BASE={API_BASE} authHeaders={authHeaders()} />}
                {activeStepData.type === "MCQ" && <MCQEditor step={activeStepData} onChange={updateStepField} />}
                {activeStepData.type === "CODING" && <CodingEditor step={activeStepData} onChange={updateStepField} API_BASE={API_BASE} authHeaders={authHeaders()} />}
                {activeStepData.type === "ASSIGNMENT" && <AssignmentEditor step={activeStepData} onChange={updateStepField} />}

                {/* Common doubts */}
                <div className="border-t border-[var(--border-primary)] pt-4">
                  <CommonDoubtsEditor doubts={activeStepData.commonDoubts || []} onChange={v => updateStepField("commonDoubts", v)} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Chapter Custom Glassmorphism Modal */}
      <AnimatePresence>
        {deleteChapterTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[var(--bg-card)] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Delete Chapter?</h3>
                  <p className="text-xs text-rose-400/90 font-medium">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Target Chapter</p>
                <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{deleteChapterTarget.title}</p>
                {deleteChapterTarget.steps?.length > 0 && (
                  <p className="text-[11px] text-amber-400 font-medium pt-1">
                    ⚠️ Warning: All {deleteChapterTarget.steps.length} step(s) inside this chapter will also be permanently deleted.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteChapterTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => deleteChapter(deleteChapterTarget.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Chapter"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Step Custom Glassmorphism Modal */}
      <AnimatePresence>
        {deleteStepTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[var(--bg-card)] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Delete Step?</h3>
                  <p className="text-xs text-rose-400/90 font-medium">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Target Step</p>
                <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{deleteStepTarget.title}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteStepTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => deleteStep(deleteStepTarget.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Step"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
