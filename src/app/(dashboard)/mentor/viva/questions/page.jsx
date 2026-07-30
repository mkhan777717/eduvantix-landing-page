"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Brain, Plus, Edit2, Trash2, X, Check,
  AlertCircle, BookOpen, Layers, Sparkles,
  Folder, FolderOpen, ChevronLeft, ChevronRight,
  Upload, FileText, RefreshCw, CheckCircle2, XCircle,
  Calendar, Clock, Loader2, Play
} from "lucide-react";

const QUESTIONS_PER_PAGE = 10;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const DIFF_COLOR = {
  EASY: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  MEDIUM: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  HARD: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
};
const STATUS_META = {
  UPLOADED:   { label: "Uploaded",   icon: CheckCircle2,  cls: "bg-slate-500/10 text-[var(--text-muted)]" },
  PROCESSING: { label: "Processing", icon: RefreshCw,     cls: "bg-amber-500/10 text-amber-400 animate-pulse" },
  COMPLETED:  { label: "Ready",      icon: CheckCircle2,  cls: "bg-emerald-500/10 text-emerald-500" },
  FAILED:     { label: "Failed",     icon: XCircle,       cls: "bg-rose-500/10 text-rose-500" },
};

const emptyForm = {
  questionText: "", subject: "", topic: "",
  difficulty: "EASY", expectedAnswer: "", keywords: ""
};

export default function AIAllInOneVivaPage({ children }) {
  const { user, token, API_BASE } = useAuth();

  // --- Common Headers ---
  const getHeaders = useCallback((isJson = true) => ({
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }), [token]);

  // Main subsection tabs: "bank" | "schedule" | "settings"
  const [subSectionTab, setSubSectionTab] = useState(children ? "settings" : "bank");

  // ==========================================
  // 1. QUESTION BANK STATE
  // ==========================================
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questionPage, setQuestionPage] = useState(1);
  const [activeTab, setActiveTab] = useState("institute");

  const [allSubjects, setAllSubjects] = useState([]);
  const [allTopics, setAllTopics] = useState([]);

  // Manual Question Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Manual Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Subject folder modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [newFolderSubjectName, setNewFolderSubjectName] = useState("");
  const [subjectModalError, setSubjectModalError] = useState("");

  const [customSubjects, setCustomSubjects] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eduvantix_custom_subjects");
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("eduvantix_custom_subjects", JSON.stringify(customSubjects));
  }, [customSubjects]);

  useEffect(() => {
    if (user) {
      setActiveTab(user.role === "ADMIN" ? "global" : "institute");
    }
  }, [user]);

  // ==========================================
  // 2. PDF / MATERIALS & AI EXTRACTION STATE
  // ==========================================
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // PDF Delete Target
  const [pdfDeleteTarget, setPdfDeleteTarget] = useState(null);
  const [pdfDeleteLoading, setPdfDeleteLoading] = useState(false);

  // AI Question Generation Workspace
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [savingToBank, setSavingToBank] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [workspaceView, setWorkspaceView] = useState("default");

  // ==========================================
  // 3. VIVA SCHEDULING STATE
  // ==========================================
  const [vivas, setVivas] = useState([]);
  const [vivasLoading, setVivasLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  // Scheduling Form Fields
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleSubject, setScheduleSubject] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [scheduleSelectedQuestions, setScheduleSelectedQuestions] = useState([]);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [editingVivaId, setEditingVivaId] = useState(null);

  // ==========================================
  // DATA FETCHING FUNCTIONS
  // ==========================================
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/viva/questions`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setQuestions(data.questions || []);
      else setError(data.message || "Failed to load questions.");
    } catch {
      setError("Network error loading questions.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getHeaders]);

  const fetchMeta = useCallback(async () => {
    try {
      const [subRes, topRes] = await Promise.all([
        fetch(`${API_BASE}/api/viva/questions/subjects`, { headers: getHeaders() }),
        fetch(`${API_BASE}/api/viva/questions/topics`, { headers: getHeaders() })
      ]);
      if (subRes.ok) { const d = await subRes.json(); setAllSubjects(d.subjects || []); }
      if (topRes.ok) { const d = await topRes.json(); setAllTopics(d.topics || []); }
    } catch { /* silent */ }
  }, [API_BASE, getHeaders]);

  const fetchMaterials = useCallback(async () => {
    setMaterialsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/viva/materials`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setMaterials(data.materials || []);
    } catch { /* silent */ }
    finally { setMaterialsLoading(false); }
  }, [API_BASE, getHeaders]);

  const fetchVivas = useCallback(async () => {
    setVivasLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/viva/scheduled`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) setVivas(data.vivas || []);
    } catch { /* silent */ }
    finally { setVivasLoading(false); }
  }, [API_BASE, getHeaders]);

  const reloadAll = useCallback(() => {
    if (user) {
      fetchQuestions();
      fetchMeta();
      fetchMaterials();
      fetchVivas();
    }
  }, [user, fetchQuestions, fetchMeta, fetchMaterials, fetchVivas]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // Autopoll for materials processing
  useEffect(() => {
    const processing = materials.some(m => m.processingStatus === "PROCESSING" || m.processingStatus === "UPLOADED");
    if (!processing) return;
    const timer = setTimeout(fetchMaterials, 3000);
    return () => clearTimeout(timer);
  }, [materials, fetchMaterials]);

  // ==========================================
  // COMPUTED PROPS
  // ==========================================
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const isGlobal = q.instituteId === null;
      if (activeTab === "global" && !isGlobal) return false;
      if (activeTab === "institute" && isGlobal) return false;
      return true;
    });
  }, [questions, activeTab]);

  const subjectNames = useMemo(() => {
    const fromDB = [...new Set(filteredQuestions.map(q => q.subject))];
    const combined = [...new Set([...fromDB, ...customSubjects])];
    return combined.sort();
  }, [filteredQuestions, customSubjects]);

  const instituteSubjectNames = useMemo(() => {
    const instQuestions = questions.filter(q => q.instituteId !== null);
    const fromDB = [...new Set(instQuestions.map(q => q.subject))];
    const combined = [...new Set([...fromDB, ...customSubjects])];
    return combined.sort();
  }, [questions, customSubjects]);

  const selectedQuestions = useMemo(() => {
    if (!selectedSubject) return [];
    return filteredQuestions.filter(q => q.subject === selectedSubject);
  }, [filteredQuestions, selectedSubject]);

  const visibleQuestions = useMemo(() => {
    const start = (questionPage - 1) * QUESTIONS_PER_PAGE;
    return selectedQuestions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [selectedQuestions, questionPage]);

  const total = filteredQuestions.length;
  const byDiff = useMemo(() => {
    return {
      EASY: filteredQuestions.filter(q => q.difficulty === "EASY").length,
      MEDIUM: filteredQuestions.filter(q => q.difficulty === "MEDIUM").length,
      HARD: filteredQuestions.filter(q => q.difficulty === "HARD").length,
    };
  }, [filteredQuestions]);

  // ==========================================
  // HANDLERS: MANUAL QUESTIONS
  // ==========================================
  const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormError(""); setModalOpen(true); };
  const openEdit = (q) => {
    setForm({
      questionText: q.questionText, subject: q.subject, topic: q.topic || "",
      difficulty: q.difficulty, expectedAnswer: q.expectedAnswer || "", keywords: q.keywords || ""
    });
    setEditingId(q.id);
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditingId(null); setFormError(""); };

  const handleSaveManual = async () => {
    if (!form.questionText.trim()) return setFormError("Question text is required.");
    if (!form.subject.trim()) return setFormError("Subject is required.");
    if (!form.difficulty) return setFormError("Difficulty is required.");
    setFormSaving(true); setFormError("");
    try {
      const url = editingId ? `${API_BASE}/api/viva/questions/${editingId}` : `${API_BASE}/api/viva/questions`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok && data.success) {
        closeModal();
        reloadAll();
      } else {
        setFormError(data.message || "Failed to save question.");
      }
    } catch { setFormError("Network error."); }
    finally { setFormSaving(false); }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/viva/questions/${deleteTarget.id}`, {
        method: "DELETE", headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteTarget(null);
        reloadAll();
      } else setError(data.message || "Delete failed.");
    } catch { setError("Delete failed due to network error."); }
    finally { setDeleteLoading(false); }
  };

  const handleCreateSubjectFolder = () => {
    const trimmed = newFolderSubjectName.trim();
    if (!trimmed) return setSubjectModalError("Subject name is required.");
    if (!subjectNames.includes(trimmed)) {
      setCustomSubjects(prev => [...prev, trimmed]);
    }
    setNewFolderSubjectName("");
    setSubjectModalOpen(false);
  };

  // ==========================================
  // HANDLERS: PDF / EXTRACTION
  // ==========================================
  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadFile) return setUploadError("Please select a PDF file.");
    if (!uploadTitle.trim()) return setUploadError("Please enter a title.");
    if (!uploadSubject.trim()) return setUploadError("Please enter or select a subject folder.");

    setUploading(true); setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("subject", uploadSubject);

      const res = await fetch(`${API_BASE}/api/viva/materials`, {
        method: "POST",
        headers: getHeaders(false),
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadOpen(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadSubject("");
        fetchMaterials();
      } else {
        setUploadError(data.message || "Upload failed.");
      }
    } catch {
      setUploadError("Network error uploading PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePdf = async () => {
    if (!pdfDeleteTarget) return;
    setPdfDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/viva/materials/${pdfDeleteTarget.id}`, {
        method: "DELETE", headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPdfDeleteTarget(null);
        fetchMaterials();
      } else setError(data.message || "Failed to delete PDF.");
    } catch { setError("Network error deleting PDF."); }
    finally { setPdfDeleteLoading(false); }
  };

  const handleRetryExtraction = async (id) => {
    try {
      await fetch(`${API_BASE}/api/viva/materials/${id}/retry`, {
        method: "POST", headers: getHeaders()
      });
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // HANDLERS: AI QUESTION WORKSPACE
  // ==========================================
  const triggerGenerate = (material) => {
    setActiveMaterial(material);
    setGenCount(10);
    setGenError("");
    setDraftQuestions([]);
    setSaveResult(null);
    setExtractModalOpen(false); // Close extraction modal to show generator workspace
    setWorkspaceView("review");
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true); setGenError("");
    setDraftQuestions([]); // clear old before starting

    const BATCH_SIZE = 1;
    let accumulatedQuestions = [];

    try {
      while (accumulatedQuestions.length < genCount) {
        const currentCount = Math.min(BATCH_SIZE, genCount - accumulatedQuestions.length);
        
        const res = await fetch(`${API_BASE}/api/viva/materials/${activeMaterial.id}/generate`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ 
            count: currentCount,
            existingQuestions: accumulatedQuestions.map(q => q.questionText)
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          const newQs = Array.isArray(data.questions) ? data.questions.filter(q => q && q.questionText) : [];
          if (newQs.length === 0) throw new Error("AI returned empty result.");
          
          const formatted = newQs.map((q, idx) => ({ 
            ...q, 
            _id: accumulatedQuestions.length + idx, 
            _approved: true, 
            _editing: false 
          }));
          
          accumulatedQuestions = [...accumulatedQuestions, ...formatted];
          
          // Truncate if the AI over-generated
          if (accumulatedQuestions.length > genCount) {
            accumulatedQuestions = accumulatedQuestions.slice(0, genCount);
          }
          
          // Update state progressively so user sees them appear
          setDraftQuestions(accumulatedQuestions);
        } else {
          throw new Error(data.message || "Failed to generate questions.");
        }
      }
    } catch (err) {
      setGenError(err.message === "Failed to fetch" ? "Network error generating questions." : err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateDraft = (idx, field, val) => {
    setDraftQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: val } : q));
  };

  const handleSaveDraftToBank = async () => {
    const approved = draftQuestions.filter(q => q._approved);
    if (approved.length === 0) return;
    setSavingToBank(true);
    try {
      const res = await fetch(`${API_BASE}/api/viva/materials/save-questions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ questions: approved })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveResult({ saved: approved.length });
        reloadAll();
      } else {
        setGenError(data.message || "Failed to save questions to bank.");
      }
    } catch {
      setGenError("Network error saving questions.");
    } finally {
      setSavingToBank(false);
    }
  };

  // ==========================================
  // HANDLERS: VIVA SCHEDULING
  // ==========================================
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleSubject.trim() || !scheduleStartTime || !scheduleEndTime || scheduleSelectedQuestions.length === 0) {
      setScheduleError("Please fill in all required fields and select at least one question.");
      return;
    }

    setScheduleSubmitting(true);
    setScheduleError("");
    setScheduleSuccess("");
    try {
      const url = editingVivaId 
        ? `${API_BASE}/api/viva/scheduled/${editingVivaId}`
        : `${API_BASE}/api/viva/schedule`;
      const method = editingVivaId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          title: scheduleTitle,
          subject: scheduleSubject,
          description: scheduleDescription,
          startTime: new Date(scheduleStartTime).toISOString(),
          endTime: new Date(scheduleEndTime).toISOString(),
          questionIds: scheduleSelectedQuestions
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScheduleSuccess(editingVivaId ? "Viva updated successfully!" : "Viva scheduled successfully!");
        setScheduleTitle("");
        setScheduleDescription("");
        setScheduleStartTime("");
        setScheduleEndTime("");
        setScheduleSelectedQuestions([]);
        setEditingVivaId(null);
        fetchVivas();
        setTimeout(() => {
          setScheduleOpen(false);
          setScheduleSuccess("");
        }, 1500);
      } else {
        setScheduleError(data.message || "Failed to submit Viva session.");
      }
    } catch {
      setScheduleError("Network error submitting Viva session.");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDeleteViva = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scheduled viva?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/viva/scheduled/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchVivas();
      } else {
        alert(data.message || "Failed to delete viva.");
      }
    } catch {
      alert("Network error deleting viva.");
    }
  };

  const openEditViva = (viva) => {
    setEditingVivaId(viva.id);
    setScheduleTitle(viva.title);
    setScheduleSubject(viva.subject);
    setScheduleDescription(viva.description || "");
    
    const formatDateTime = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };
    
    setScheduleStartTime(formatDateTime(viva.startTime));
    setScheduleEndTime(formatDateTime(viva.endTime));
    setScheduleSelectedQuestions(viva.questions?.map(q => q.id) || []);
    setScheduleError("");
    setScheduleSuccess("");
    setScheduleOpen(true);
  };

  const getVivaStatus = (viva) => {
    const now = new Date();
    const start = new Date(viva.startTime);
    const end = viva.endTime ? new Date(viva.endTime) : null;

    if (now < start) return { label: "Upcoming", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" };
    if (end && now > end) return { label: "Ended", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20" };
    return { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" };
  };

  // ==========================================
  // MODAL RENDER FUNCTION
  // ==========================================
  const renderModals = () => {
    return (
      <>
        {/* 1. Add/Edit Question Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-xl rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">{editingId ? "Edit Question" : "Add New Question"}</h3>
                <button onClick={closeModal} className="p-1 hover:bg-[var(--bg-hover)] rounded"><X size={18} /></button>
              </div>
              {formError && <div className="p-3 bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs rounded-xl">{formError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Question Text *</label>
                  <textarea rows={3} value={form.questionText} onChange={e => setForm({...form, questionText: e.target.value})} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm focus:border-zinc-500 outline-none resize-none" placeholder="Enter question..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Subject Folder *</label>
                    <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none">
                      <option value="">Select Folder</option>
                      {subjectNames.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Topic (Optional)</label>
                    <input type="text" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none" placeholder="e.g. Callbacks" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Difficulty *</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                      <button type="button" key={d} onClick={() => setForm({...form, difficulty: d})} className={`flex-1 py-2 rounded-xl text-xs font-bold border border-[var(--border-primary)] transition-all ${form.difficulty === d ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-transparent" : "border-[var(--border-primary)] text-[var(--text-muted)]"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Expected Answer Keywords (comma separated) *</label>
                  <input type="text" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none" placeholder="e.g. scope, lexical, variables" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Detailed Rubric Expected Answer (Optional)</label>
                  <textarea rows={2} value={form.expectedAnswer} onChange={e => setForm({...form, expectedAnswer: e.target.value})} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none resize-none" placeholder="Provide complete context..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-muted)] font-bold hover:bg-[var(--bg-hover)]">Cancel</button>
                <button onClick={handleSaveManual} disabled={formSaving} className="flex-1 py-2.5 bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-sm text-[var(--text-primary)] rounded-xl">
                  {formSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Add Folder Modal */}
        {subjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Add Subject Folder</h3>
              {subjectModalError && <div className="p-2 bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs rounded-lg">{subjectModalError}</div>}
              <input type="text" value={newFolderSubjectName} onChange={e => setNewFolderSubjectName(e.target.value)} className="w-full bg-[#161B2B] text-slate-200 border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none" placeholder="Subject Name..." />
              <div className="flex gap-3">
                <button onClick={() => setSubjectModalOpen(false)} className="flex-1 py-2 border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-muted)] font-bold hover:bg-[var(--bg-hover)]">Cancel</button>
                <button onClick={handleCreateSubjectFolder} className="flex-1 py-2 bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-xs text-[var(--text-primary)] rounded-xl">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Delete Question Confirm */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Delete Question</h3>
              <p className="text-[var(--text-muted)] text-sm">Are you sure you want to delete: <span className="font-semibold text-slate-200">"{deleteTarget.questionText}"</span>?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">Cancel</button>
                <button onClick={handleDeleteQuestion} disabled={deleteLoading} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-xs text-[var(--text-primary)] rounded-xl">
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Delete PDF Confirm */}
        {pdfDeleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Delete PDF Notes</h3>
              <p className="text-[var(--text-muted)] text-sm">Are you sure you want to delete <span className="font-semibold text-slate-200">"{pdfDeleteTarget.title}"</span>?</p>
              <div className="flex gap-3">
                <button onClick={() => setPdfDeleteTarget(null)} className="flex-1 py-2 border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">Cancel</button>
                <button onClick={handleDeletePdf} disabled={pdfDeleteLoading} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-xs text-[var(--text-primary)] rounded-xl">
                  {pdfDeleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Schedule Viva Modal */}
        {scheduleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <form onSubmit={handleScheduleSubmit} className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-3xl rounded-2xl p-6 space-y-4 my-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Calendar className="w-5 h-5 text-[var(--text-primary)]" />{editingVivaId ? "Edit Viva Session" : "Schedule Viva Session"}</h3>
                <button type="button" onClick={() => setScheduleOpen(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded"><X size={18} /></button>
              </div>
              {scheduleError && <div className="p-3 bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs rounded-xl">{scheduleError}</div>}
              {scheduleSuccess && <div className="p-3 bg-emerald-500/10 border border-[var(--border-primary)] border-emerald-500/20 text-emerald-400 text-xs rounded-xl">{scheduleSuccess}</div>}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Details */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Viva Title *</label>
                    <input type="text" required value={scheduleTitle} onChange={e => setScheduleTitle(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none" placeholder="e.g. JS Closures Final Exam" />
                  </div>
                   <div>
                     <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Select Subject *</label>
                     <select required value={scheduleSubject} onChange={e => setScheduleSubject(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none">
                       <option value="">Select Folder</option>
                       {subjectNames.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Description (Optional)</label>
                    <textarea rows={2} value={scheduleDescription} onChange={e => setScheduleDescription(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none resize-none" placeholder="Instructions..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Start Time *</label>
                      <input type="datetime-local" required value={scheduleStartTime} onChange={e => setScheduleStartTime(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">End Time *</label>
                      <input type="datetime-local" required value={scheduleEndTime} onChange={e => setScheduleEndTime(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-xs outline-none" />
                    </div>
                  </div>
                </div>

                {/* Questions Picker */}
                <div className="flex flex-col h-[320px] lg:h-[350px] border border-[var(--border-primary)] rounded-xl p-4 bg-[#0E1322]">
                  <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Select Questions ({scheduleSelectedQuestions.length})</p>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {questions.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-10">No questions in bank.</p>
                    ) : (
                      questions
                        .filter(q => (!scheduleSubject || q.subject.toLowerCase() === scheduleSubject.toLowerCase()))
                        .map(q => {
                          const isSel = scheduleSelectedQuestions.includes(q.id);
                          return (
                            <div
                              key={q.id}
                              onClick={() => {
                                setScheduleSelectedQuestions(prev =>
                                  prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                                );
                              }}
                              className={`p-2.5 rounded border border-[var(--border-primary)] text-left cursor-pointer transition-all select-none ${
                                isSel ? "bg-emerald-500/10 border-emerald-500/50 outline outline-2 outline-emerald-500/30" : "bg-[#111625] border-[var(--border-primary)]/80 hover:border-[var(--border-primary)]"
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{q.difficulty}</span>
                              <p className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-2">{q.questionText}</p>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]/80">
                <button type="button" onClick={() => setScheduleOpen(false)} className="flex-1 py-2.5 border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-muted)] font-bold hover:bg-[var(--bg-hover)]">Cancel</button>
                <button type="submit" disabled={scheduleSubmitting} className="flex-1 py-2.5 bg-[var(--accent-gradient)] hover:brightness-110  font-bold text-sm text-[var(--text-primary)] rounded-xl">
                  {scheduleSubmitting ? "Scheduling..." : "Schedule & Publish"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 7. PDF AI Question Extraction Main Modal */}
        {extractModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-4xl rounded-2xl p-6 space-y-6 my-8">
              <div className="flex justify-between items-center border-b border-[var(--border-primary)] pb-3">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--text-muted)]" />
                  AI Question Extractor
                </h3>
                <button type="button" onClick={() => setExtractModalOpen(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded"><X size={18} /></button>
              </div>

              <div className="flex justify-between items-center bg-[#0E1322] p-4 rounded-xl border border-[var(--border-primary)]">
                <div>
                  <p className="text-sm font-bold text-slate-200">Generate Questions from PDF</p>
                  <p className="text-xs text-[var(--text-muted)]">Upload class notes or document slides to extract viva questions automatically.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-xs text-[var(--text-primary)]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload PDF</span>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Uploaded Materials</h4>
                {materialsLoading && materials.length === 0 ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                ) : materials.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">No PDF documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {materials.map(m => {
                      const statusMeta = STATUS_META[m.processingStatus] || STATUS_META.UPLOADED;
                      const StatusIcon = statusMeta.icon;
                      const isReady = m.processingStatus === "COMPLETED";
                      const isFailed = m.processingStatus === "FAILED";

                      return (
                        <div key={m.id} className="group p-4 rounded-xl border border-[var(--border-primary)] bg-[#0E1322]/40 flex justify-between items-center hover:border-[var(--border-primary)] transition-all">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-slate-200 truncate">{m.title}</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-[var(--text-muted)] mt-1">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-500/10 text-[var(--text-muted)] font-bold uppercase">{m.subject}</span>
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${statusMeta.cls}`}>
                                <StatusIcon size={8} />
                                <span>{statusMeta.label}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isFailed && (
                              <button type="button" onClick={() => handleRetryExtraction(m.id)} title="Retry" className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"><RefreshCw size={11} /></button>
                            )}
                            {isReady && (
                              <button
                                type="button"
                                onClick={() => triggerGenerate(m)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-[10px] text-[var(--text-primary)]"
                              >
                                <Sparkles size={9} />
                                <span>Generate</span>
                              </button>
                            )}
                            <button type="button" onClick={() => setPdfDeleteTarget(m)} className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-[var(--border-primary)]/80">
                <button type="button" onClick={() => setExtractModalOpen(false)} className="px-4 py-2 border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* 8. Upload PDF Modal */}
        {uploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <form onSubmit={handleUploadFile} className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-md rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Upload PDF</h3>
                <button type="button" onClick={() => setUploadOpen(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded"><X size={18} /></button>
              </div>
              {uploadError && <div className="p-3 bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs rounded-xl">{uploadError}</div>}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Select PDF Document *</label>
                  <input type="file" accept=".pdf" required onChange={e => setUploadFile(e.target.files[0])} className="w-full text-sm text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-primary)] file:text-[var(--text-primary)] hover:file:bg-zinc-700 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Title *</label>
                  <input type="text" required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none" placeholder="e.g. JavaScript Class Notes" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Subject Folder *</label>
                  <select required value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-xl p-3 text-sm outline-none">
                    <option value="">Select Folder</option>
                    {subjectNames.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUploadOpen(false)} className="flex-1 py-2.5 border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-muted)] font-bold hover:bg-[var(--bg-hover)]">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-sm text-[var(--text-primary)] rounded-xl cursor-pointer">
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 9. Delete PDF Confirm */}
        {pdfDeleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111625] border border-[var(--border-primary)] w-full max-w-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200">Delete PDF Notes</h3>
              <p className="text-[var(--text-muted)] text-sm">Are you sure you want to delete <span className="font-semibold text-slate-200">"{pdfDeleteTarget.title}"</span>?</p>
              <div className="flex gap-3">
                <button onClick={() => setPdfDeleteTarget(null)} className="flex-1 py-2 border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] cursor-pointer">Cancel</button>
                <button onClick={handleDeletePdf} disabled={pdfDeleteLoading} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-xs text-[var(--text-primary)] rounded-xl cursor-pointer">
                  {pdfDeleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // --- RENDER COMPONENT: GENERATE REVIEW ---
  if (workspaceView === "review") {
    const approvedCount = draftQuestions.filter(q => q._approved).length;
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-10 font-sans space-y-6">
        <div className="flex items-center space-x-3 border-b border-[var(--border-primary)] pb-4">
          <button onClick={() => setWorkspaceView("default")} className="p-2 rounded-xl hover:bg-slate-500/10 transition-all text-[var(--text-secondary)] cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">Generate &amp; Review Questions</h1>
            <p className="text-xs text-[var(--text-muted)]">PDF: {activeMaterial?.title}</p>
            
        {/* Render any injected children (like AI Settings) */}
        {children}
        
          </div>
        </div>

        {draftQuestions.length === 0 ? (
          <div className="max-w-xl mx-auto p-8 rounded-3xl border border-[var(--border-primary)] bg-[#111625] space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Number of AI Questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button key={n} onClick={() => setGenCount(n)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border border-[var(--border-primary)] transition-all cursor-pointer ${genCount === n ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-transparent" : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--border-primary)]"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {genError && <div className="p-3 rounded-xl bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs">{genError}</div>}
            <button onClick={handleGenerateQuestions} disabled={generating}
                    className="w-full py-3.5 rounded-2xl bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Questions</>}
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <p className="text-[var(--text-muted)] text-sm">Review generated drafts and select which to save.</p>
              {saveResult ? (
                <div className="text-emerald-400 text-sm font-bold">✓ {saveResult.saved} questions added!</div>
              ) : (
                <button onClick={handleSaveDraftToBank} disabled={savingToBank || approvedCount === 0}
                        className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-zinc-700 font-bold text-sm text-[var(--text-primary)] disabled:opacity-50 cursor-pointer">
                  Save {approvedCount} to Bank
                </button>
              )}
            </div>
            {genError && <div className="p-3 rounded-xl bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs">{genError}</div>}
            <div className="space-y-3">
              {draftQuestions.map((q, idx) => (
                <div key={q._id} className={`p-5 rounded-2xl border border-[var(--border-primary)] bg-[#111625] transition-all ${q._approved ? "border-[var(--border-primary)]" : "border-[var(--border-primary)]/40 opacity-50"}`}>
                  <div className="flex items-start gap-4 justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button onClick={() => updateDraft(idx, "_approved", !q._approved)}
                              className={`w-5 h-5 mt-1 rounded border border-[var(--border-primary)] flex items-center justify-center cursor-pointer shrink-0 ${q._approved ? "bg-zinc-500 border-zinc-500" : "border-[var(--border-primary)]"}`}>
                        {q._approved && <Check size={12} />}
                      </button>
                      <div className="flex-1 space-y-2">
                        {q._editing ? (
                          <div className="space-y-3">
                            <textarea rows={2} className="w-full p-3 bg-[#161b2b] border border-[var(--border-primary)] rounded-xl text-sm focus:border-zinc-500 outline-none resize-none" value={q.questionText} onChange={e => updateDraft(idx, "questionText", e.target.value)} />
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">Difficulty</label>
                                <select value={q.difficulty} onChange={e => updateDraft(idx, "difficulty", e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-lg p-2 text-xs outline-none">
                                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-1">Keywords</label>
                                <input type="text" value={q.keywords || ""} onChange={e => updateDraft(idx, "keywords", e.target.value)} className="w-full bg-[#161B2B] border border-[var(--border-primary)] rounded-lg p-2 text-xs outline-none" placeholder="Keywords..." />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-200 leading-snug">{q.questionText}</p>
                            <div className="flex gap-2">
                              <span className="text-[10px] bg-[var(--bg-hover)] px-2 py-0.5 rounded text-[var(--text-muted)] uppercase font-medium">{q.subject}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${DIFF_COLOR[q.difficulty].bg} ${DIFF_COLOR[q.difficulty].text}`}>{q.difficulty}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0">
                      {q._editing ? (
                        <button onClick={() => updateDraft(idx, "_editing", false)} className="p-2 rounded hover:bg-emerald-500/10 hover:text-emerald-400 text-[var(--text-muted)] cursor-pointer" title="Save changes">
                          <Check size={14} />
                        </button>
                      ) : (
                        <button onClick={() => updateDraft(idx, "_editing", true)} className="p-2 rounded hover:bg-zinc-500/10 hover:text-[var(--text-muted)] text-[var(--text-muted)] cursor-pointer" title="Edit draft">
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button onClick={() => setDraftQuestions(qs => qs.filter((_, i) => i !== idx))} className="p-2 rounded hover:bg-rose-500/10 hover:text-rose-400 text-[var(--text-muted)] cursor-pointer" title="Remove question">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {generating && (
                <div className="p-5 rounded-2xl border border-[var(--border-primary)]/40 bg-[#111625]/50 flex items-center justify-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text-muted)]">Generating question {draftQuestions.length + 1} of {genCount}...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- EXPLORER VIEW (WHEN FOLDER IS OPENED) ---
  if (selectedSubject) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-10 font-sans space-y-6 animate-fade-in">
        {/* Breadcrumb folder navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-primary)] pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedSubject("")}
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all text-[var(--text-secondary)] cursor-pointer animate-fade-in"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-xs text-[var(--text-muted)] font-semibold">
                <span className="cursor-pointer hover:underline" onClick={() => setSelectedSubject("")}>Question Bank</span>
                <span>/</span>
                <span className="text-[var(--text-muted)]">{selectedSubject}</span>
              </div>
              <h1 className="text-2xl font-black mt-1 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-[var(--text-muted)] animate-pulse" />
                {selectedSubject}
              </h1>
            </div>
          </div>

          {(activeTab !== "global" || user?.role === "ADMIN") && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setForm({ ...emptyForm, subject: selectedSubject });
                  setEditingId(null);
                  setFormError("");
                  setModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold text-xs text-[var(--text-on-accent)] shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          )}
        </div>

        {/* List of questions for the selected subject */}
        <div className="space-y-4 max-w-5xl">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Questions inside folder</span>
            <span className="text-[10px] text-slate-500">Page {questionPage}</span>
          </div>
          
          {visibleQuestions.length === 0 ? (
            <div className="p-8 rounded-xl border border-[var(--border-primary)] border-dashed border-[var(--border-primary)] text-center text-slate-500">
              No questions in this folder yet. Click "Add Question" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleQuestions.map((q) => (
                <div
                  key={q.id}
                  className="group flex items-start justify-between gap-4 p-5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] transition-all shadow-sm"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{q.questionText}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[var(--bg-hover)] px-2 py-0.5 rounded text-[var(--text-muted)] uppercase font-medium">{q.topic || "General"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${DIFF_COLOR[q.difficulty].bg} ${DIFF_COLOR[q.difficulty].text}`}>{q.difficulty}</span>
                    </div>
                  </div>
                  {!(q.instituteId === null && user?.role !== "ADMIN") && (
                    <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(q)} className="p-2 rounded hover:bg-zinc-500/10 hover:text-[var(--text-muted)] text-[var(--text-muted)] cursor-pointer">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: q.id, questionText: q.questionText })} className="p-2 rounded hover:bg-rose-500/10 hover:text-rose-400 text-[var(--text-muted)] cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Folder Pagination */}
          {selectedQuestions.length > QUESTIONS_PER_PAGE && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-850">
              <button
                disabled={questionPage === 1}
                onClick={() => setQuestionPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded border border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] disabled:opacity-40 text-[var(--text-secondary)] cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">
                Page {questionPage} of {Math.ceil(selectedQuestions.length / QUESTIONS_PER_PAGE)}
              </span>
              <button
                disabled={questionPage >= Math.ceil(selectedQuestions.length / QUESTIONS_PER_PAGE)}
                onClick={() => setQuestionPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded border border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] disabled:opacity-40 text-[var(--text-secondary)] cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {renderModals()}
      </div>
    );
  }

  // --- MAIN ALL-IN-ONE VIEW (FOLDERS CLOSED VIEW) ---
  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
        {/* Page Title / Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8 relative" style={{ borderColor: "var(--border-primary)" }}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
              <Brain size={12} className="text-violet-500 animate-pulse" />
              AI VIVA
            </div>
            <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
              Viva Management Dashboard
            </h1>
            <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Manage question banks and schedule student assessments.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {subSectionTab === "bank" && (activeTab !== "global" || user?.role === "ADMIN") && (
              <>
                <button
                  onClick={() => { setSubjectModalError(""); setNewFolderSubjectName(""); setSubjectModalOpen(true); }}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] font-medium text-xs text-[var(--text-secondary)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Add Folder</span>
                </button>
                <button
                  onClick={() => { setExtractModalOpen(true); fetchMaterials(); }}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] font-medium text-xs text-[var(--text-secondary)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Extract from PDF</span>
                </button>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] font-semibold text-xs text-[var(--text-on-accent)] shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </>
            )}
            {subSectionTab === "schedule" && (
              <button
                onClick={() => {
                  setEditingVivaId(null);
                  setScheduleTitle("");
                  setScheduleSubject("");
                  setScheduleDescription("");
                  const now = new Date();
                  const tzOffset = now.getTimezoneOffset() * 60000;
                  const startStr = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
                  const endStr = new Date(now.getTime() + 3600000 - tzOffset).toISOString().slice(0, 16);
                  setScheduleStartTime(startStr);
                  setScheduleEndTime(endStr);
                  setScheduleSelectedQuestions([]);
                  setScheduleError("");
                  setScheduleSuccess("");
                  setScheduleOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-gradient)] hover:brightness-110  font-bold text-xs text-[var(--text-primary)] shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Viva</span>
              </button>
            )}
          </div>
        </section>

        {/* Tab Switcher: Question Bank vs Schedule Viva vs Settings */}
        <div className="flex space-x-1 p-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-fit min-w-[300px]">
          <button
            type="button"
            onClick={() => setSubSectionTab("bank")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${subSectionTab === "bank" ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
          >
            Question Bank
          </button>
          <button
            type="button"
            onClick={() => setSubSectionTab("schedule")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${subSectionTab === "schedule" ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
          >
            Schedule Viva
          </button>
          {children && (
            <button
              type="button"
              onClick={() => setSubSectionTab("settings")}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer ${subSectionTab === "settings" ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
            >
              AI Settings
            </button>
          )}
        </div>

        {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-[var(--border-primary)] border-rose-500/20 text-rose-400 text-xs">{error}</div>}

        {/* ==========================================
            TAB 1: QUESTION BANK
            ========================================== */}
        {subSectionTab === "bank" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Questions", value: total, icon: BookOpen, color: "indigo" },
                { label: "Easy Questions", value: byDiff.EASY, icon: Layers, color: "emerald" },
                { label: "Medium Questions", value: byDiff.MEDIUM, icon: Layers, color: "amber" },
                { label: "Hard Questions", value: byDiff.HARD, icon: Layers, color: "rose" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)]/30 flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-zinc-500/10 text-[var(--text-muted)] shrink-0`}><Icon size={16} /></div>
                  <div>
                    <p className="text-xl font-black">{value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Institute/Global toggle switcher */}
            {user?.role !== "ADMIN" && (
              <div className="flex space-x-1 p-1 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl max-w-xs">
                <button
                  type="button"
                  onClick={() => { setActiveTab("institute"); setSelectedSubject(""); setQuestionPage(1); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${activeTab === "institute" ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
                >
                  Your Institute
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("global"); setSelectedSubject(""); setQuestionPage(1); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${activeTab === "global" ? "bg-[var(--accent-primary)] text-[var(--text-on-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
                >
                  Global Bank
                </button>
              </div>
            )}

            {/* Folder Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Folder className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                Question Bank Subjects
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : subjectNames.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[var(--border-primary)] text-center" style={{ color: "var(--text-secondary)" }}>
                  No questions found. Add folder or create questions to begin.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {subjectNames.map(subject => {
                    const count = filteredQuestions.filter(q => q.subject === subject).length;
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(subject);
                          setQuestionPage(1);
                        }}
                        className="group p-6 rounded-2xl border border-[var(--border-primary)] text-left flex items-start gap-4 transition-colors hover:bg-[var(--bg-secondary)] shadow-sm cursor-pointer"
                        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                      >
                        <div className="p-4 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shrink-0">
                          <Folder size={24} className="fill-current" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-base font-semibold truncate group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: "var(--text-primary)" }}>
                            {subject}
                          </h3>
                          <p className="text-[11px] font-medium text-[var(--accent-primary)] pt-1">
                            {count} question{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: AI SETTINGS
            ========================================== */}
        {subSectionTab === "settings" && children && (
          <div className="animate-fade-in">
            {children}
          </div>
        )}

        {/* ==========================================
            TAB 2: SCHEDULING VIVA
            ========================================== */}
        {subSectionTab === "schedule" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-primary)]/60">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <Calendar className="w-5 h-5 text-[var(--text-primary)]" />
                Viva Scheduling & Session History
              </h2>
            </div>

            {vivasLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-primary)]" />
              </div>
            ) : vivas.length === 0 ? (
              <div className="p-8 rounded-xl border border-[var(--border-primary)] border-dashed border-[var(--border-primary)] text-center text-slate-500">
                No Vivas scheduled. Click "Schedule Viva" to host a new session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vivas.map(viva => {
                  const status = getVivaStatus(viva);
                  return (
                    <div key={viva.id} className="p-5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)]/30 flex flex-col justify-between space-y-4 hover:border-[var(--border-primary)] transition-all font-sans">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-[var(--text-muted)]">{viva.subject}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--border-primary)] ${status.color}`}>{status.label}</span>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-200">{viva.title}</h3>
                          {viva.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">{viva.description}</p>}
                        </div>
                        <div className="space-y-1 pt-2 border-t border-[var(--border-primary)]/80 text-[11px] text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /><span>Start: {new Date(viva.startTime).toLocaleString()}</span></div>
                          {viva.endTime && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /><span>End: {new Date(viva.endTime).toLocaleString()}</span></div>}
                          <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-slate-500" /><span>Questions: {viva.questions?.length || 0}</span></div>
                        </div>
                        <div className="flex gap-2 items-center pt-2 border-t border-slate-850">
                          <button
                            type="button"
                            onClick={() => openEditViva(viva)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-[var(--text-muted)] hover:text-zinc-300 hover:bg-zinc-500/10 cursor-pointer transition-colors"
                            title="Edit Viva Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteViva(viva.id)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {renderModals()}
    </div>
  );
}
