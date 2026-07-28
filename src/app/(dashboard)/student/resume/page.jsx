"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiBase, buildAuthHeaders } from '@/utils/api';
import ResumeForm from '@/components/ResumeBuilder/ResumeForm';
import ResumePreview from '@/components/ResumeBuilder/ResumePreview';
import { Download, Save, Loader2, CheckCircle2, FileText, Target, LayoutTemplate, Plus, Trash2, FolderOpen, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultResume = {
  title: 'Untitled Resume',
  personalInfo: { firstName: '', lastName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: []
};

const TEMPLATES = ['executive', 'professional', 'contemporary', 'elegant', 'split', 'creative'];

// Small named swatches so each template pill hints at its actual look —
// structural information, not decoration.
const TEMPLATE_SWATCH = {
  executive: ['#1f2937', '#7c3aed'],
  professional: ['#1e3a5f', '#3b82f6'],
  contemporary: ['#0f172a', '#06b6d4'],
  elegant: ['#3f2d1f', '#d97757'],
  split: ['#111827', '#f43f5e'],
  creative: ['#312e81', '#f59e0b'],
};

function ATSRing({ score }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(14px)" }}
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--bg-primary)" strokeWidth="6" />
        <motion.circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.span
          key={score}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.3 }}
          className="text-base font-black"
          style={{ color: "var(--text-primary)" }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  const { user, token } = useAuth();
  const [resumeData, setResumeData] = useState(defaultResume);
  const [resumeId, setResumeId] = useState(null);
  const [resumesList, setResumesList] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('executive');

  const calculateATSScore = () => {
    let score = 20;

    if (resumeData.personalInfo) {
      if (resumeData.personalInfo.email && resumeData.personalInfo.phone) score += 5;
      if (resumeData.personalInfo.linkedin || resumeData.personalInfo.github || resumeData.personalInfo.portfolio) score += 5;
    }

    if (resumeData.summary && resumeData.summary.length > 50) score += 15;

    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 15;
      if (resumeData.experience.some(exp => exp.description && exp.description.length > 80)) score += 10;
    }

    if (resumeData.education && resumeData.education.length > 0) score += 10;
    if (resumeData.skills && resumeData.skills.length > 3) score += 10;

    if (resumeData.projects && resumeData.projects.length > 0) {
      score += 5;
      if (resumeData.projects.some(p => p.description && p.description.length > 50)) score += 5;
    }

    return Math.min(100, score);
  };

  const atsScore = calculateATSScore();

  const getATSColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const atsMessage = (score) =>
    score >= 80 ? "Excellent! You're ready to apply." :
    score >= 50 ? "Good, but add more details." :
    "Needs more sections & keywords.";

  useEffect(() => {
    if (!user) return;

    const fetchResume = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/resumes`, {
          headers: buildAuthHeaders(token, user),
        });
        const data = await res.json();

        if (data.success && data.resumes) {
          setResumesList(data.resumes);
          if (data.resumes.length > 0) {
            const latestResume = data.resumes[0];
            setResumeId(latestResume.id);
            setResumeData({
              title: latestResume.title || 'Untitled Resume',
              personalInfo: latestResume.personalInfo || defaultResume.personalInfo,
              summary: latestResume.summary || '',
              experience: latestResume.experience || [],
              education: latestResume.education || [],
              skills: latestResume.skills || [],
              projects: latestResume.projects || [],
              certifications: latestResume.certifications || []
            });
          }
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [user, token]);

  const handleSelectResume = (id) => {
    const selected = resumesList.find(r => r.id === parseInt(id));
    if (selected) {
      setResumeId(selected.id);
      setResumeData({
        title: selected.title || 'Untitled Resume',
        personalInfo: selected.personalInfo || defaultResume.personalInfo,
        summary: selected.summary || '',
        experience: selected.experience || [],
        education: selected.education || [],
        skills: selected.skills || [],
        projects: selected.projects || [],
        certifications: selected.certifications || []
      });
    }
  };

  const handleNewResume = () => {
    setResumeId(null);
    setResumeData(defaultResume);
  };

  const handleDelete = async () => {
    if (!resumeId) return;
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${getApiBase()}/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(token, user),
      });
      const data = await res.json();
      if (data.success) {
        const newList = resumesList.filter(r => r.id !== resumeId);
        setResumesList(newList);
        if (newList.length > 0) {
          handleSelectResume(newList[0].id);
        } else {
          handleNewResume();
        }
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const endpoint = resumeId
        ? `${getApiBase()}/api/resumes/${resumeId}`
        : `${getApiBase()}/api/resumes`;

      const method = resumeId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: buildAuthHeaders(token, user),
        body: JSON.stringify(resumeData),
      });

      const data = await res.json();

      if (data.success) {
        if (data.resume && data.resume.id) {
          setResumeId(data.resume.id);
          setResumesList(prev => {
            const existingIdx = prev.findIndex(r => r.id === data.resume.id);
            if (existingIdx >= 0) {
              const newList = [...prev];
              newList[existingIdx] = data.resume;
              return newList;
            } else {
              return [data.resume, ...prev];
            }
          });
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving resume:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--text-accent)" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Loading your resume...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative px-0 sm:px-6 pb-12">

      {/* Ambient premium glow behind the header — purely decorative, non-interactive */}
      <div className="absolute top-0 left-0 right-0 h-[420px] overflow-hidden pointer-events-none print:hidden -z-10">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: "var(--accent-primary)", filter: "blur(120px)", top: -220, left: -80 }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.10]"
          style={{ background: "#3b82f6", filter: "blur(120px)", top: -160, right: -60 }}
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Header - Hidden when printing */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-6 border-b pb-6 shrink-0 print:hidden mb-6"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-4 w-fit shadow-sm"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}
            >
              <Sparkles size={12} style={{ color: "var(--text-accent)" }} />
              Resume Builder
            </motion.div>
            <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
              Resume Builder
            </h1>
            <p className="text-sm max-w-xl mt-1.5" style={{ color: "var(--text-secondary)" }}>
              Create an ATS-friendly resume to showcase your skills and experience.
            </p>
          </div>

          <div className="flex flex-col items-stretch lg:items-end gap-4 w-full lg:w-auto lg:min-w-[420px]">

            {/* Resume switcher card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="w-full flex items-center gap-2 p-2 rounded-2xl border shadow-sm"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0 px-2">
                <FileText size={15} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={resumeData.title || ''}
                  onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                  placeholder="Resume Title"
                  className="w-full bg-transparent text-sm font-bold outline-none min-w-0"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              {resumesList.length > 0 && (
                <div className="relative shrink-0">
                  <FolderOpen size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  <select
                    value={resumeId || ''}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    className="appearance-none pl-7 pr-6 py-2 text-xs font-semibold rounded-xl border outline-none cursor-pointer max-w-[130px]"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    <option value="" disabled>Select</option>
                    {resumesList.map(r => (
                      <option key={r.id} value={r.id}>{r.title || 'Untitled Resume'}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleNewResume}
                title="Create New Resume"
                className="p-2.5 rounded-xl border shrink-0 cursor-pointer"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                <Plus className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {resumeId && (
                  <motion.button
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    title="Delete Resume"
                    className="p-2.5 rounded-xl border shrink-0 cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 overflow-hidden"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 w-full">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 border rounded-xl font-semibold text-sm shadow-sm cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)"
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSaving ? (
                      <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-[var(--text-muted)]" />
                        Saving...
                      </motion.span>
                    ) : saveSuccess ? (
                      <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                        Saved!
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                        <Save className="w-4 h-4 mr-2" style={{ color: "var(--text-accent)" }} />
                        Save Progress
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 12px 28px -6px var(--accent-glow)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-[var(--text-on-accent)] text-sm shadow-md cursor-pointer relative overflow-hidden"
                  style={{ background: "var(--accent-primary)" }}
                >
                  <motion.span
                    className="absolute inset-y-0 w-1/3 pointer-events-none"
                    style={{ background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.35), transparent)" }}
                    animate={{ x: ["-120%", "220%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />
                  <Download className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Export PDF</span>
                </motion.button>
              </div>

              {/* ATS Score Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center gap-4 border rounded-2xl p-3.5 shadow-sm w-full sm:w-auto"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}
              >
                <ATSRing score={atsScore} />
                <div className="flex flex-col pr-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                    <Target size={14} className={getATSColor(atsScore)} />
                    ATS Score
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {atsMessage(atsScore)}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">

          {/* Left Column: Form Editor (Hidden when printing) */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="print:hidden"
          >
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </motion.div>

          {/* Right Column: Live Preview */}
          <div className="print:m-0 print:p-0 flex flex-col items-center xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)] pb-20 print:pb-0 w-full overflow-hidden">

            {/* Template Selector */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-full xl:max-w-[210mm] flex items-center mb-5 print:hidden border rounded-xl p-1.5 shadow-sm"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest shrink-0 px-3 border-r" style={{ color: "var(--text-secondary)", borderColor: "var(--border-primary)" }}>
                <LayoutTemplate size={14} style={{ color: "var(--text-accent)" }} />
                Templates
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap pl-3 pr-2 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {TEMPLATES.map(t => {
                  const isActive = selectedTemplate === t;
                  const [c1, c2] = TEMPLATE_SWATCH[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedTemplate(t)}
                      className="relative px-4 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap shrink-0 flex items-center gap-2"
                      style={!isActive ? { color: "var(--text-secondary)" } : { color: "#fff" }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="templatePill"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-0 rounded-lg shadow-md"
                          style={{ backgroundColor: "var(--accent-primary)", boxShadow: "0 4px 6px -1px var(--accent-glow), 0 2px 4px -1px var(--accent-glow)" }}
                        />
                      )}
                      <span
                        className="relative z-10 w-2 h-2 rounded-full ring-1 ring-black/10"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                      />
                      <span className="relative z-10">{t}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border-primary)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--text-muted)] [scrollbar-width:thin]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTemplate}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="w-max mx-auto origin-top"
                >
                  <ResumePreview data={resumeData} template={selectedTemplate} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}