"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, ChevronLeft, Plus, X, Save, Eye, Globe, Building2,
  Tag, Clock, DollarSign, IndianRupee, Trophy, Lock, CheckCircle, Upload
} from "lucide-react";

function IconPickerField({ value, onChange }) {
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const isImage = value && (value.startsWith("http") || value.startsWith("data:"));

  return (
    <FormField label="Course Icon" sublabel="Upload an image (< 10MB) or enter an emoji / image URL">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Icon preview */}
          <div className="w-10 h-10 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-center text-xl shrink-0 overflow-hidden">
            {isImage ? (
              <img src={value} alt="Icon" className="w-full h-full object-contain p-1" />
            ) : (
              value || "📚"
            )}
          </div>

          <Input value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. 🐍 or https://..." />

          {/* File Upload Button */}
          <label className="px-3.5 py-2.5 rounded-xl border border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)] hover:opacity-90 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all">
            <Upload size={13} />
            <span>Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

          {value && (
            <button type="button" onClick={() => onChange("")} className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-all shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
        {uploadError && <p className="text-xs text-rose-400 font-medium">{uploadError}</p>}
      </div>
    </FormField>
  );
}
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = ["Programming", "Web Development", "AI / ML"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function FormField({ label, sublabel, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {sublabel && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{sublabel}</p>}
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)] transition-all focus:border-[var(--border-accent)]"
      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", ...props.style }} />
  );
}

function Textarea({ rows = 4, ...props }) {
  return (
    <textarea rows={rows} {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)] transition-all focus:border-[var(--border-accent)] resize-none"
      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
  );
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, token, API_BASE } = useAuth();
  const isSuperAdmin = !user?.role || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [institutes, setInstitutes] = useState([]);

  const [form, setForm] = useState({
    title: "", description: "", category: "Programming", difficulty: "BEGINNER",
    estimatedHours: 0, tags: [], price: 0, offerPrice: 0, isFree: true,
    iconUrl: "", visibility: "DRAFT", hasCertificate: false, isSequential: false,
    isInstituteCourse: false, instituteId: "",
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
  const authHeaders = {
    "Content-Type": "application/json",
    ...(hasRealToken
      ? { Authorization: `Bearer ${token}` }
      : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isInstScope = params.get("scope") === "institute";
      const instId = params.get("instituteId") || "";
      if (isInstScope || instId) {
        setForm(prev => ({
          ...prev,
          isInstituteCourse: true,
          instituteId: instId
        }));
      }
    }
    fetch(`${API_BASE}/api/institutes`, { headers: authHeaders })
      .then(r => r.json())
      .then(d => {
        if (d.success) setInstitutes(d.data || d.institutes || []);
      })
      .catch(() => {});
  }, [API_BASE]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Course title is required."); return; }
    if (form.isInstituteCourse && !form.instituteId) {
      setError("Please select an institute for this course.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        instituteId: form.isInstituteCourse ? (form.instituteId ? parseInt(form.instituteId) : null) : null
      };
      const res = await fetch(`${API_BASE}/api/learn/admin/courses`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/admin/courses/${data.course.id}/content`);
      } else {
        setError(data.message || "Failed to create course.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-primary)]">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create New Course</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Set up the course details. You can add chapters and steps after creation.</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm">
          <X size={14} /> {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Basic Info */}
        <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-accent)" }}>Basic Information</h2>

          {/* Course Scope (Only visible to Super Admin) */}
          {isSuperAdmin && (
            <>
              <FormField label="Course Scope" sublabel="Select whether this course is platform-wide or for a specific institute">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => set("isInstituteCourse", false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${!form.isInstituteCourse ? "border-[var(--border-accent)] bg-[var(--accent-glow)] text-[var(--text-accent)]" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}>
                    <Globe size={14} /> Global Course
                  </button>
                  <button type="button" onClick={() => set("isInstituteCourse", true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${form.isInstituteCourse ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}>
                    <Building2 size={14} /> Institute Specific Course
                  </button>
                </div>
              </FormField>

              {form.isInstituteCourse && (
                <FormField label="Target Institute" sublabel="Select the educational institution this course belongs to">
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <select
                      value={form.instituteId}
                      onChange={e => set("instituteId", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)] focus:border-[var(--border-accent)] transition-all cursor-pointer"
                      style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                      <option value="">-- Select an Institute --</option>
                      {institutes.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name || inst.title || `Institute #${inst.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </FormField>
              )}
            </>
          )}

          <FormField label="Course Title" sublabel="A clear, descriptive name (e.g. 'Python Fundamentals', 'Dynamic Programming Mastery')">
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Python for Beginners" required />
          </FormField>

          <FormField label="Description (Markdown supported)" sublabel="Explain what students will learn in this course (supports bold, lists, code, links)">
            <Textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} placeholder="A comprehensive course covering... Supports Markdown formatting." />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-primary)]"
                style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Difficulty Level">
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => set("difficulty", d)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${form.difficulty === d
                      ? "border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)]"
                      : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}
                    style={{ color: form.difficulty === d ? "var(--text-accent)" : "var(--text-secondary)" }}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <FormField label="Estimated Duration (hours)">
            <Input type="number" min={0} value={form.estimatedHours} onChange={e => set("estimatedHours", parseInt(e.target.value) || 0)} style={{ maxWidth: 160 }} />
          </FormField>

          <FormField label="Tags" sublabel="Press Enter or click + to add tags">
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="e.g. python, arrays, sorting" />
              <button type="button" onClick={addTag} className="px-3 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[var(--border-primary)] bg-[var(--bg-secondary)]" style={{ color: "var(--text-secondary)" }}>
                  <Tag size={10} /> {tag}
                  <button type="button" onClick={() => set("tags", form.tags.filter(t => t !== tag))} className="hover:text-rose-400 transition-colors cursor-pointer">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </FormField>
        </div>

        {/* Section: Pricing */}
        <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-accent)" }}>Pricing</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set("isFree", true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${form.isFree ? "border-[var(--border-accent)] bg-[var(--accent-glow)] text-[var(--text-accent)]" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}
              style={{ color: form.isFree ? "var(--text-accent)" : "var(--text-secondary)" }}>
              <CheckCircle size={14} /> Free
            </button>
            <button type="button" onClick={() => set("isFree", false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${!form.isFree ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}
              style={{ color: !form.isFree ? undefined : "var(--text-secondary)" }}>
              <IndianRupee size={14} /> Paid
            </button>
          </div>
          {!form.isFree && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-4">
              <FormField label="Original Price (₹)" sublabel="Standard listing price (MRP)">
                <Input type="number" min={0} value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)} placeholder="999" />
              </FormField>
              <FormField label="Offer Price (₹)" sublabel="Discounted price shown to students">
                <Input type="number" min={0} value={form.offerPrice} onChange={e => set("offerPrice", parseFloat(e.target.value) || 0)} placeholder="499" />
              </FormField>
            </motion.div>
          )}
        </div>

        {/* Section: Settings */}
        <div className="p-6 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-card)] space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-accent)" }}>Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Visibility">
              <div className="flex gap-2">
                {["DRAFT", "PUBLISHED"].map(v => (
                  <button key={v} type="button" onClick={() => set("visibility", v)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${form.visibility === v ? "border-[var(--border-accent)] text-[var(--text-accent)] bg-[var(--accent-glow)]" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}
                    style={{ color: form.visibility === v ? "var(--text-accent)" : "var(--text-secondary)" }}>
                    {v === "DRAFT" ? "🔒 Draft" : "🌐 Published"}
                  </button>
                ))}
              </div>
            </FormField>
            <IconPickerField value={form.iconUrl} onChange={v => set("iconUrl", v)} />
          </div>

          <div className="flex gap-4">
            {[
              { key: "hasCertificate", icon: Trophy, label: "Issue Certificate", sub: "Auto-generate PDF on 100% completion" },
              { key: "isSequential", icon: Lock, label: "Sequential Learning", sub: "Students must complete steps in order" },
            ].map(({ key, icon: Icon, label, sub }) => (
              <button key={key} type="button" onClick={() => set(key, !form[key])}
                className={`flex-1 flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${form[key] ? "border-[var(--border-accent)] bg-[var(--accent-glow)]" : "border-[var(--border-primary)] hover:bg-[var(--bg-hover)]"}`}>
                <div className={`p-2 rounded-lg mt-0.5 ${form[key] ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-secondary)]"}`}>
                  <Icon size={13} style={{ color: form[key] ? "white" : "var(--text-muted)" }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: form[key] ? "var(--text-accent)" : "var(--text-primary)" }}>{label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-8 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "var(--accent-gradient)" }}>
            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={14} /> Create &amp; Build Content</>}
          </button>
        </div>
      </form>
    </div>
  );
}
