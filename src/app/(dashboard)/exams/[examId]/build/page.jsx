"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { buildAuthHeaders, getApiBase } from "@/utils/api";
import ImportPaperModal from "@/components/exam/ImportPaperModal";
import ExportPaperModal from "@/components/exam/ExportPaperModal";
import { 
  ArrowLeft, Settings, FolderOpen, Play, CheckCircle2, 
  Plus, Trash2, ChevronUp, ChevronDown, Check, X, 
  HelpCircle, Eye, RefreshCw, AlertTriangle, Info, BookOpen, Clock,
  FileUp, Download, Code, FileText, CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamBuilderWorkspace() {
  const { examId } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const API_BASE = getApiBase();

  // Core Draft States
  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [versionConflict, setVersionConflict] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);

  // Overlay / Panel States
  const [showSettings, setShowSettings] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showImportPaperModal, setShowImportPaperModal] = useState(false);
  const [showExportPaperModal, setShowExportPaperModal] = useState(false);
  const [banks, setBanks] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [publishValidations, setPublishValidations] = useState([]);
  const [isValidToPublish, setIsValidToPublish] = useState(false);

  // Workspace Settings Form States
  const [settingsDuration, setSettingsDuration] = useState(60);
  const [settingsStartDate, setSettingsStartDate] = useState("");
  const [settingsEndDate, setSettingsEndDate] = useState("");
  const [settingsTimezone, setSettingsTimezone] = useState("UTC");
  const [settingsReleasePolicy, setSettingsReleasePolicy] = useState("IMMEDIATE");
  const [settingsNegativeMarking, setSettingsNegativeMarking] = useState(false);
  const [settingsShuffleQuestions, setSettingsShuffleQuestions] = useState(false);
  const [settingsShuffleOptions, setSettingsShuffleOptions] = useState(false);
  const [settingsFullscreen, setSettingsFullscreen] = useState(false);
  const [settingsWebcam, setSettingsWebcam] = useState(false);
  const [settingsCopyPaste, setSettingsCopyPaste] = useState(false);
  const [settingsCalculator, setSettingsCalculator] = useState(false);

  const formatToLocalDatetime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };



  // Preview Runner Sandbox State
  const [previewAttempt, setPreviewAttempt] = useState(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const isTeacher = user?.role === "ADMIN" || user?.role === "MENTOR" || user?.role === "INSTITUTE_ADMIN";

  // Role Protection: Teachers & Admins only
  useEffect(() => {
    if (user && !isTeacher) {
      router.push("/exams");
    }
  }, [user, isTeacher, router]);

  // Refs for debouncing autosave
  const autosaveTimer = useRef(null);

  useEffect(() => {
    fetchExamDetails(true);
    fetchQuestionBanks();
    loadLocalRecovery();
  }, [examId]);

  // ── Data Fetching & Sync ───────────────────────────────────────────────────

  async function fetchExamDetails(showSpinner = false) {
    try {
      if (showSpinner) setLoading(true);
      setError(null);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}`, { headers });
      const json = await res.json();
      if (json.success) {
        setExam(json.data);
        setSections(json.data.sections || []);
        setInstructions(json.data.instructions || []);
        setSettingsDuration(json.data.duration || 60);
        setSettingsStartDate(json.data.startDate ? formatToLocalDatetime(json.data.startDate) : "");
        setSettingsEndDate(json.data.endDate ? formatToLocalDatetime(json.data.endDate) : "");
        setSettingsTimezone(json.data.timezone || "UTC");
        setSettingsReleasePolicy(json.data.resultReleasePolicy || "IMMEDIATE");
        setSettingsNegativeMarking(json.data.settings?.negativeMarking || false);
        setSettingsShuffleQuestions(json.data.settings?.shuffleQuestions || false);
        setSettingsShuffleOptions(json.data.settings?.shuffleOptions || false);
        setSettingsFullscreen(json.data.settings?.fullscreenEnforcement || false);
        setSettingsWebcam(json.data.settings?.webcamRequirement || false);
        setSettingsCopyPaste(json.data.settings?.copyPasteRestriction || false);
        setSettingsCalculator(json.data.settings?.calculatorAllowed || false);
      } else {
        setError(json.message || "Failed to load exam configurations");
      }
    } catch (err) {
      console.error(err);
      setError("Network issue pulling builder configurations");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function fetchQuestionBanks() {
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/question-banks`, { headers });
      const json = await res.json();
      if (json.success) {
        setBanks(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const loadBankQuestions = async (bankId) => {
    try {
      setSelectedBankId(bankId);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/question-banks/${bankId}/export`, { headers });
      const json = await res.json();
      if (json.success) {
        setBankQuestions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Autosave & Local Recovery ──────────────────────────────────────────────

  const triggerAutosave = (updatedExam, updatedSections) => {
    const nowTs = new Date().getTime();
    localStorage.setItem(
      `exam_builder_recovery_${examId}`,
      JSON.stringify({ exam: updatedExam, sections: updatedSections, timestamp: nowTs })
    );

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveToServer(updatedExam, updatedSections);
    }, 2000);
  };

  function loadLocalRecovery() {
    try {
      const saved = localStorage.getItem(`exam_builder_recovery_${examId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const nowTs = new Date().getTime();
        if (nowTs - parsed.timestamp < 3600000) {
          console.log("[Recovery] Found backup recovery data", parsed);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const saveToServer = async (targetExam, targetSections) => {
    if (!targetExam) return;
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: targetExam.title,
          description: targetExam.description,
          status: targetExam.status,
          expectedVersion: targetExam.version
        })
      });
      const json = await res.json();
      if (json.code === "VERSION_CONFLICT") {
        setVersionConflict(true);
      } else if (json.success && json.data) {
        setExam(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkspaceSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          duration: parseInt(settingsDuration, 10) || 60,
          startDate: settingsStartDate ? new Date(settingsStartDate).toISOString() : undefined,
          endDate: settingsEndDate ? new Date(settingsEndDate).toISOString() : undefined,
          timezone: settingsTimezone,
          resultReleasePolicy: settingsReleasePolicy,
          version: exam.version,
          settings: {
            ...exam.settings,
            negativeMarking: settingsNegativeMarking,
            shuffleQuestions: settingsShuffleQuestions,
            shuffleOptions: settingsShuffleOptions,
            fullscreenEnforcement: settingsFullscreen,
            webcamRequirement: settingsWebcam,
            copyPasteRestriction: settingsCopyPaste,
            calculatorAllowed: settingsCalculator
          }
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setExam(json.data);
        setShowSettings(false);
        alert("Workspace timing and security settings saved successfully!");
      } else {
        alert(json.message || "Failed to update workspace settings");
      }
    } catch (err) {
      alert("Network error updating workspace settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReload = () => {
    setVersionConflict(false);
    fetchExamDetails(true);
  };

  // ── Section Actions ────────────────────────────────────────────────────────

  const handleAddSection = async (type = "MCQ") => {
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const title = type === "MCQ" ? "New MCQ Section" : type === "CODING" ? "New Coding Assessment" : "New Essay Section";
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          description: `Auto-generated ${type} section`,
          type,
          weightage: 10
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchExamDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (sectionId, newTitle, newDescription) => {
    const updatedSections = sections.map(s => s.id === sectionId ? { ...s, title: newTitle, description: newDescription } : s);
    setSections(updatedSections);
    try {
      const headers = buildAuthHeaders(token, user);
      await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${sectionId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: newTitle, description: newDescription })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section and all associated questions?")) return;
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${sectionId}`, {
        method: "DELETE",
        headers
      });
      const json = await res.json();
      if (json.success) {
        fetchExamDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReorderSection = async (idx, direction) => {
    const newSections = [...sections];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setSections(newSections);

    try {
      const headers = buildAuthHeaders(token, user);
      const payload = newSections.map((sec, i) => ({
        id: sec.id,
        order: i + 1,
        questions: sec.questions ? sec.questions.map((q, qI) => ({ questionId: q.questionId, order: qI + 1 })) : []
      }));
      await fetch(`${API_BASE}/api/v1/exams/${examId}/reorder`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sections: payload })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Question Actions ───────────────────────────────────────────────────────

  const openQuestionEditor = (question, sectionId) => {
    const q = JSON.parse(JSON.stringify(question));

    if (q.type === "MCQ") {
      const existingOpts = (q.options && q.options.length > 0) ? q.options : ((q.mcqOptions && q.mcqOptions.length > 0) ? q.mcqOptions : []);
      q.options = existingOpts.length > 0 ? existingOpts.map(o => ({
        id: o.id,
        text: o.text || o.optionText || o.value || "",
        isCorrect: !!o.isCorrect
      })) : [
        { text: "Option A", isCorrect: true },
        { text: "Option B", isCorrect: false },
        { text: "Option C", isCorrect: false },
        { text: "Option D", isCorrect: false }
      ];
    } else if (q.type === "CODING" && !q.coding) {
      const cq = q.codingQuestion || {};
      let starter = cq.starterCode;
      if (typeof starter === 'object' && starter !== null) {
        starter = starter.default || starter.javascript || JSON.stringify(starter);
      }
      q.coding = {
        constraints: cq.constraints || "1 <= N <= 10^5",
        inputFormat: cq.inputFormat || "Standard input format",
        outputFormat: cq.outputFormat || "Standard output format",
        starterCode: starter || "function solve(nums, target) {\n  // Write solution code here\n}",
        timeLimit: cq.timeLimit || 2000,
        memoryLimit: cq.memoryLimit || 256,
        testCases: cq.testCases && cq.testCases.length > 0 ? cq.testCases : [
          { input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]", isSample: true, weight: 50 },
          { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]", isSample: false, weight: 50 }
        ]
      };
    } else if (q.type === "DESCRIPTIVE" && !q.descriptive) {
      const dq = q.descriptiveQuestion || {};
      q.descriptive = {
        wordLimit: dq.wordLimit || 500,
        charLimit: dq.charLimit || 2500,
        rubric: dq.rubric || "Grade based on clarity, structure, and correctness.",
        sampleAnswer: dq.sampleAnswer || "",
        allowFileUpload: !!dq.allowFileUpload,
        maxFileSize: dq.maxFileSize || 5,
        allowedExtensions: dq.allowedExtensions || ["pdf", "docx"]
      };
    }

    setEditingQuestion(q);
    setEditingSectionId(sectionId);
  };

  // ── MCQ Options Management Helpers ──────────────────────────────────────────

  const handleAddMCQOption = () => {
    if (!editingQuestion) return;
    const currentOptions = [...(editingQuestion.options || [])];
    const newIdx = currentOptions.length;
    currentOptions.push({
      text: `Option ${String.fromCharCode(65 + newIdx)}`,
      isCorrect: currentOptions.length === 0
    });
    setEditingQuestion({
      ...editingQuestion,
      options: currentOptions
    });
  };

  const handleUpdateMCQOption = (index, field, value) => {
    if (!editingQuestion) return;
    const currentOptions = [...(editingQuestion.options || [])];
    if (!currentOptions[index]) return;
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    setEditingQuestion({
      ...editingQuestion,
      options: currentOptions
    });
  };

  const handleDeleteMCQOption = (index) => {
    if (!editingQuestion) return;
    const currentOptions = [...(editingQuestion.options || [])];
    if (currentOptions.length <= 2) {
      alert("An MCQ question must have at least 2 options.");
      return;
    }
    currentOptions.splice(index, 1);
    setEditingQuestion({
      ...editingQuestion,
      options: currentOptions
    });
  };

  const handleCreateQuestion = async (sectionId, type) => {
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${sectionId}/questions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type,
          title: `Draft Question ${type}`,
          text: "Add question text instructions here.",
          marks: type === "CODING" ? 10 : 5,
          negativeMarks: 0,
          difficulty: "MEDIUM"
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchExamDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleImportBankQuestion = async (sectionId, questionId) => {
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${sectionId}/questions/import`, {
        method: "POST",
        headers,
        body: JSON.stringify({ questionId })
      });
      const json = await res.json();
      if (json.success) {
        fetchExamDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !editingSectionId) return;
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const payload = {
        title: editingQuestion.title,
        text: editingQuestion.text,
        marks: editingQuestion.marks,
        negativeMarks: editingQuestion.negativeMarks,
        explanation: editingQuestion.explanation,
        difficulty: editingQuestion.difficulty,
        options: editingQuestion.type === "MCQ" ? editingQuestion.options : undefined,
        coding: editingQuestion.type === "CODING" ? editingQuestion.coding : undefined,
        descriptive: editingQuestion.type === "DESCRIPTIVE" ? editingQuestion.descriptive : undefined
      };
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${editingSectionId}/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setEditingQuestion(null);
        setEditingSectionId(null);
        fetchExamDetails(false);
      } else {
        alert(json.message || "Failed to update question details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (sectionId, questionId) => {
    if (!confirm("Are you sure you want to remove this question?")) return;
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/sections/${sectionId}/questions/${questionId}`, {
        method: "DELETE",
        headers
      });
      const json = await res.json();
      if (json.success) {
        fetchExamDetails(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Test Cases Management Helpers ──────────────────────────────────────────

  const handleAddTestCase = () => {
    if (!editingQuestion || !editingQuestion.coding) return;
    const currentTestCases = editingQuestion.coding.testCases || [];
    const updated = {
      ...editingQuestion,
      coding: {
        ...editingQuestion.coding,
        testCases: [
          ...currentTestCases,
          { input: "", expectedOutput: "", isSample: false, weight: 100 }
        ]
      }
    };
    setEditingQuestion(updated);
  };

  const handleUpdateTestCase = (index, field, value) => {
    if (!editingQuestion || !editingQuestion.coding) return;
    const currentTestCases = [...(editingQuestion.coding.testCases || [])];
    currentTestCases[index] = { ...currentTestCases[index], [field]: value };
    setEditingQuestion({
      ...editingQuestion,
      coding: {
        ...editingQuestion.coding,
        testCases: currentTestCases
      }
    });
  };

  const handleDeleteTestCase = (index) => {
    if (!editingQuestion || !editingQuestion.coding) return;
    const currentTestCases = [...(editingQuestion.coding.testCases || [])];
    currentTestCases.splice(index, 1);
    setEditingQuestion({
      ...editingQuestion,
      coding: {
        ...editingQuestion.coding,
        testCases: currentTestCases
      }
    });
  };

  // ── Publish Action Validation ─────────────────────────────────────────────

  const validateExamPublish = () => {
    const errors = [];
    if (!exam?.title) errors.push("Exam title cannot be empty");
    if (!sections || sections.length === 0) errors.push("Exam must contain at least 1 section");
    
    let qCount = 0;
    sections?.forEach(sec => {
      if (sec.questions) qCount += sec.questions.length;
    });

    if (qCount === 0) errors.push("Exam paper must contain at least 1 question before publishing");

    setPublishValidations(errors);
    setIsValidToPublish(errors.length === 0);
    setShowPublish(true);
  };

  const handleConfirmPublish = async () => {
    try {
      setSaving(true);
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/publish`, {
        method: "POST",
        headers
      });
      const json = await res.json();
      if (json.success) {
        setShowPublish(false);
        fetchExamDetails(true);
        alert("Exam paper published successfully!");
      } else {
        alert(json.message || "Failed to publish assessment");
      }
    } catch (err) {
      console.error(err);
      alert("Network error publishing assessment");
    } finally {
      setSaving(false);
    }
  };

  // ── Sandbox Preview Trigger ───────────────────────────────────────────────

  const handleLaunchPreview = async () => {
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/preview`, {
        method: "POST",
        headers
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPreviewAttempt(json.data);
        setActivePreviewIndex(0);
      } else {
        alert(json.message || "Failed to initialize preview");
      }
    } catch (err) {
      alert("Network issue spinning up preview sandbox");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 font-sans">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Exam Builder workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-6 space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/exams")}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {exam?.title || "Untitled Assessment"}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {exam?.status || "Draft"} · v{exam?.version || 1}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Workspace · Auto-saves changes in real time</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-2xs font-bold text-slate-400 flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" />
              Autosaving...
            </span>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            title="Workspace Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setShowBank(true)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <FolderOpen size={16} />
            Question Bank
          </button>

          <button
            onClick={() => setShowImportPaperModal(true)}
            className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
            title="Import Question Paper (Excel / CSV / JSON)"
          >
            <FileUp size={16} />
            Import Paper
          </button>

          <button
            onClick={() => setShowExportPaperModal(true)}
            className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
            title="Export Question Paper (PDF / Excel / CSV)"
          >
            <Download size={16} />
            Export Paper
          </button>
          <button
            onClick={handleLaunchPreview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <Eye size={15} />
            Preview Runner
          </button>
          <button
            onClick={validateExamPublish}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <CheckCircle2 size={15} />
            Publish Assessment
          </button>
        </div>
      </div>

      {/* Override Multi-tab Warning */}
      {versionConflict && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-rose-500" size={24} />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Autosave Revision Mismatch</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                This draft has been edited in another browser tab. Reload now to fetch the latest state and prevent overwriting work.
              </p>
            </div>
          </div>
          <button
            onClick={handleReload}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-md"
          >
            Reload Workspace
          </button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Sections and Questions builder */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Exam Sections</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddSection("MCQ")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <Plus size={13} /> Add MCQ
              </button>
              <button
                onClick={() => handleAddSection("CODING")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <Plus size={13} /> Add Coding
              </button>
              <button
                onClick={() => handleAddSection("DESCRIPTIVE")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <Plus size={13} /> Add Essay
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {sections.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-inner">
                  <BookOpen size={26} />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Your selected questions will be displayed here
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Get started by adding an MCQ, Coding, or Essay section above, or import questions directly from your Question Bank.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
                  <button
                    onClick={() => handleAddSection("MCQ")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Plus size={14} /> Add MCQ Section
                  </button>
                  <button
                    onClick={() => setShowBank(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <FolderOpen size={14} className="text-indigo-500" /> Browse Question Bank
                  </button>
                </div>
              </div>
            ) : (
              sections.map((section, idx) => (
                <div 
                  key={section.id} 
                  className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 space-y-4 relative shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(section.id, e.target.value, section.description)}
                        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-white/20 focus:border-indigo-500 font-extrabold text-slate-900 dark:text-white text-base focus:outline-none py-0.5 transition-colors"
                      />
                      <p className="text-2xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{section.type} Section</p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleReorderSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleReorderSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Question List inside Section */}
                  <div className="space-y-3">
                    {section.questions?.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/10 text-slate-500 text-xs">
                        No questions added to this section. Create one below or link from Question Bank.
                      </div>
                    ) : (
                      section.questions?.map((sq) => {
                        const q = sq.question;
                        return (
                          <div 
                            key={sq.questionId} 
                            onClick={() => openQuestionEditor(q, section.id)}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-white/5 space-y-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950/60 transition-colors shadow-2xs"
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                {q?.type} · {q?.marks} marks
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveQuestion(section.id, sq.questionId);
                                }}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                              {q?.title}
                            </h4>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add question inline button */}
                  <button
                    onClick={() => handleCreateQuestion(section.id, section.type)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                    Add New {section.type} Question
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right 1/3: Settings overview and recovery info */}
        <div className="space-y-6">
          
          <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Exam Details</h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-bold block">Title</span>
                <input
                  type="text"
                  value={exam?.title || ""}
                  onChange={(e) => {
                    const updated = { ...exam, title: e.target.value };
                    setExam(updated);
                    triggerAutosave(updated, sections);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-bold block">Description</span>
                <textarea
                  value={exam?.description || ""}
                  rows={3}
                  onChange={(e) => {
                    const updated = { ...exam, description: e.target.value };
                    setExam(updated);
                    triggerAutosave(updated, sections);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-xs font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Timing & Duration Overview Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-500" />
                Timing & Duration Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="text-2xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Configure
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-3xs font-extrabold uppercase text-slate-500">Duration</span>
                <div className="font-black text-slate-900 dark:text-white text-sm">
                  {exam?.duration || 60} Mins
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                <span className="text-3xs font-extrabold uppercase text-slate-500">Max Marks</span>
                <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                  {sections.reduce((acc, sec) => acc + (sec.questions || []).reduce((qAcc, sq) => qAcc + (sq.question?.marks || 0), 0), 0)} Marks
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-2 text-2xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">Start Window:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {exam?.startDate ? new Date(exam.startDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Not Scheduled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-semibold">End Window:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {exam?.endDate ? new Date(exam.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Not Scheduled"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md"
            >
              <Settings size={14} />
              Edit Timing & Security Controls
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-6 space-y-4 text-xs shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Autosave & Backup</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Every modification made in this workspace is saved to the server dynamically with optimistic locking validation.
            </p>
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 space-y-1.5 text-indigo-600 dark:text-indigo-400">
              <h5 className="font-bold flex items-center gap-1"><Info size={14} /> Local Recovery Active</h5>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                A browser backup is mirrored locally. In case of unexpected power failure, your draft state remains restorable.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ── Exam Workspace Settings Overlay Modal ───────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Exam Timing, Schedule & Security Controls</span>
                </h3>
                <button type="button" onClick={() => setShowSettings(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveWorkspaceSettings} className="space-y-6 text-xs">
                
                {/* Duration & Timezone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block flex items-center gap-1">
                      <Clock size={14} className="text-indigo-500" /> Exam Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="600"
                      required
                      value={settingsDuration}
                      onChange={(e) => setSettingsDuration(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Timezone</label>
                    <select
                      value={settingsTimezone}
                      onChange={(e) => setSettingsTimezone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                      <option value="America/New_York">EST (America/New_York)</option>
                    </select>
                  </div>
                </div>

                {/* Schedule Window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Official Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={settingsStartDate}
                      onChange={(e) => setSettingsStartDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Official End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={settingsEndDate}
                      onChange={(e) => setSettingsEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Result Policy */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold block">Result Release Policy</label>
                  <select
                    value={settingsReleasePolicy}
                    onChange={(e) => setSettingsReleasePolicy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="IMMEDIATE">Immediate (MCQ Auto-grade & release score)</option>
                    <option value="MANUAL">Manual Reviewer Release (Hold until mentor publishes)</option>
                    <option value="AFTER_DEADLINE">After Deadline (Release after window ends)</option>
                  </select>
                </div>

                {/* Security & Proctoring Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider block">Security & Assessment Controls</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsShuffleQuestions}
                        onChange={(e) => setSettingsShuffleQuestions(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Shuffle Question Order
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsShuffleOptions}
                        onChange={(e) => setSettingsShuffleOptions(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Shuffle MCQ Choice Options
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsNegativeMarking}
                        onChange={(e) => setSettingsNegativeMarking(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Enable Negative Marking
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsFullscreen}
                        onChange={(e) => setSettingsFullscreen(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Fullscreen Enforcement
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsCopyPaste}
                        onChange={(e) => setSettingsCopyPaste(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Restrict Copy / Paste
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 cursor-pointer text-slate-800 dark:text-slate-200 font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsCalculator}
                        onChange={(e) => setSettingsCalculator(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      Allow On-screen Calculator
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs transition-colors disabled:opacity-50 shadow-md"
                  >
                    {saving ? "Saving Settings..." : "Save Workspace Settings"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Question Editor Overlay Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="font-black text-slate-900 dark:text-white text-md flex items-center gap-2">
                  <span>Configure {editingQuestion.type} Question</span>
                  <span className="text-2xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-500/20 uppercase tracking-wider">
                    ID #{editingQuestion.id}
                  </span>
                </h3>
                <button onClick={() => setEditingQuestion(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 text-xs">
                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Question Title</label>
                    <input 
                      type="text" 
                      value={editingQuestion.title || ""} 
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Difficulty Level</label>
                    <select
                      value={editingQuestion.difficulty || "EASY"}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold block">Question Statement / Instructions (Supports Markdown)</label>
                  <textarea 
                    rows={4}
                    value={editingQuestion.text || ""} 
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans resize-none leading-relaxed font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Award Marks</label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="0.5"
                      value={editingQuestion.marks || 1} 
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-bold block">Negative Marks</label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="0"
                      value={editingQuestion.negativeMarks || 0} 
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, negativeMarks: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* ── MCQ Configuration Section ─────────────────────────────────── */}
                {editingQuestion.type === "MCQ" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 dark:text-slate-300 font-extrabold block">
                        MCQ Choices & Correct Key ({editingQuestion.options?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMCQOption}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition-all shadow-sm"
                      >
                        <Plus size={13} /> Add Choice Option
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {editingQuestion.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input 
                              type="checkbox" 
                              checked={!!opt.isCorrect} 
                              onChange={(e) => handleUpdateMCQOption(idx, "isCorrect", e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-2xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">
                              {opt.isCorrect ? "Correct Key" : "Incorrect"}
                            </span>
                          </label>

                          <input 
                            type="text" 
                            placeholder={`Option ${String.fromCharCode(65 + idx)} choice text`}
                            value={opt.text || ""} 
                            onChange={(e) => handleUpdateMCQOption(idx, "text", e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                          />

                          {editingQuestion.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMCQOption(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete Choice"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── CODING Detailed Setup Section ────────────────────────────── */}
                {editingQuestion.type === "CODING" && (
                  <div className="space-y-5 pt-3 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Code size={16} />
                        Coding Problem Specifications
                      </h4>
                    </div>

                    {/* Starter Code */}
                    <div className="space-y-1.5">
                      <label className="text-slate-700 dark:text-slate-300 font-bold block">Starter Code Boilerplate (Provided to Candidates)</label>
                      <textarea
                        rows={5}
                        value={editingQuestion.coding?.starterCode || ""}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          coding: { ...editingQuestion.coding, starterCode: e.target.value }
                        })}
                        placeholder="function solve(input) { &#10;  // Write candidate code here &#10;}"
                        className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Constraints & Input/Output Formats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Constraints</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 <= N <= 10^5"
                          value={editingQuestion.coding?.constraints || ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            coding: { ...editingQuestion.coding, constraints: e.target.value }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Input Format</label>
                        <input
                          type="text"
                          placeholder="e.g. Array of N integers"
                          value={editingQuestion.coding?.inputFormat || ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            coding: { ...editingQuestion.coding, inputFormat: e.target.value }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Output Format</label>
                        <input
                          type="text"
                          placeholder="e.g. Single integer sum"
                          value={editingQuestion.coding?.outputFormat || ""}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            coding: { ...editingQuestion.coding, outputFormat: e.target.value }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Time & Memory Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Time Limit (milliseconds)</label>
                        <input
                          type="number"
                          step="100"
                          value={editingQuestion.coding?.timeLimit || 2000}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            coding: { ...editingQuestion.coding, timeLimit: parseInt(e.target.value, 10) || 2000 }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Memory Limit (Megabytes)</label>
                        <input
                          type="number"
                          step="16"
                          value={editingQuestion.coding?.memoryLimit || 256}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            coding: { ...editingQuestion.coding, memoryLimit: parseInt(e.target.value, 10) || 256 }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Test Cases Suite */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-700 dark:text-slate-300 font-extrabold block">
                          Automated Test Cases Suite ({editingQuestion.coding?.testCases?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={handleAddTestCase}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-2xs font-bold hover:bg-emerald-500/20 transition-all"
                        >
                          <Plus size={12} /> Add Test Case
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editingQuestion.coding?.testCases?.map((tc, tcIdx) => (
                          <div key={tcIdx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between text-2xs font-bold text-slate-500">
                              <span>Test Case #{tcIdx + 1}</span>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1 cursor-pointer text-indigo-600 dark:text-indigo-400">
                                  <input
                                    type="checkbox"
                                    checked={!!tc.isSample}
                                    onChange={(e) => handleUpdateTestCase(tcIdx, "isSample", e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  Sample (Visible)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTestCase(tcIdx)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Input (stdin / arguments)"
                                value={tc.input || ""}
                                onChange={(e) => handleUpdateTestCase(tcIdx, "input", e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-2xs font-mono"
                              />
                              <input
                                type="text"
                                placeholder="Expected Output (stdout / return)"
                                value={tc.expectedOutput || ""}
                                onChange={(e) => handleUpdateTestCase(tcIdx, "expectedOutput", e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-2xs font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DESCRIPTIVE Detailed Setup Section ───────────────────────── */}
                {editingQuestion.type === "DESCRIPTIVE" && (
                  <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-white/10">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <FileText size={16} />
                      Descriptive / Essay Question Guidelines
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Word Limit</label>
                        <input
                          type="number"
                          value={editingQuestion.descriptive?.wordLimit || 500}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            descriptive: { ...editingQuestion.descriptive, wordLimit: parseInt(e.target.value, 10) || 0 }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-slate-300 font-bold block">Character Limit</label>
                        <input
                          type="number"
                          value={editingQuestion.descriptive?.charLimit || 2500}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            descriptive: { ...editingQuestion.descriptive, charLimit: parseInt(e.target.value, 10) || 0 }
                          })}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2 text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 dark:text-slate-300 font-bold block">Grading Rubric / Criteria (Evaluator Guidance)</label>
                      <textarea
                        rows={3}
                        value={editingQuestion.descriptive?.rubric || ""}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          descriptive: { ...editingQuestion.descriptive, rubric: e.target.value }
                        })}
                        placeholder="e.g. Award 5 pts for architectural trade-offs, 5 pts for fault isolation analysis."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-700 dark:text-slate-300 font-bold block">Reference Sample Answer</label>
                      <textarea
                        rows={3}
                        value={editingQuestion.descriptive?.sampleAnswer || ""}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          descriptive: { ...editingQuestion.descriptive, sampleAnswer: e.target.value }
                        })}
                        placeholder="Model response for reference grading..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-xs transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs transition-colors disabled:opacity-50 shadow-md"
                >
                  {saving ? "Saving Changes..." : "Save Question Details"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Publish Assessment Overlay Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {showPublish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="font-black text-slate-900 dark:text-white text-md flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-indigo-600" />
                  <span>Publish Exam Assessment</span>
                </h3>
                <button onClick={() => setShowPublish(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {publishValidations.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-2">
                    <strong className="font-extrabold flex items-center gap-1">
                      <AlertTriangle size={15} />
                      Publish Validation Check Failed:
                    </strong>
                    <ul className="list-disc list-inside space-y-1 text-2xs font-semibold">
                      {publishValidations.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-2">
                    <strong className="font-extrabold flex items-center gap-1 text-sm">
                      <CheckCircle2 size={16} /> Ready to Publish
                    </strong>
                    <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Publishing will lock this draft into version <strong>v{exam?.version || 1}</strong> and generate snapshot copies for candidate attempt runners.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => setShowPublish(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!isValidToPublish || saving}
                  onClick={handleConfirmPublish}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {saving ? "Publishing..." : "Confirm & Publish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Paper Modal */}
      {showImportPaperModal && (
        <ImportPaperModal
          examId={examId}
          token={token}
          user={user}
          onClose={() => setShowImportPaperModal(false)}
          onSuccess={() => fetchExamDetails(true)}
        />
      )}

      {/* Export Paper Modal */}
      {showExportPaperModal && (
        <ExportPaperModal
          examId={examId}
          token={token}
          user={user}
          onClose={() => setShowExportPaperModal(false)}
        />
      )}

    </div>
  );
}
