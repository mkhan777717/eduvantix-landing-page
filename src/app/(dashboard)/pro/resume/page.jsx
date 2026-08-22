"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResumeIntelligencePage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  // Fetch initial resume status
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pro/resume", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.resumes && data.resumes.length > 0) {
        // Find the active one, or default to the most recent
        const active = data.resumes.find(r => r.isActive) || data.resumes[0];
        setActiveResume(active);
        
        // If it's still processing, start polling
        if (["UPLOADED", "PROCESSING", "ANALYZING"].includes(active.status)) {
          startPolling(active.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch resumes.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (resumeId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/pro/resume/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setActiveResume(data.resume);
          if (["ANALYZED", "FAILED"].includes(data.resume.status)) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // poll every 3 seconds
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
      
      if (!validTypes.includes(selected.type) && !selected.name.match(/\.(pdf|docx)$/i)) {
        setError("Only PDF and DOCX resumes are supported.");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      
      setError("");
      setFile(selected);
      handleUpload(selected);
    }
  };

  const handleUpload = async (selectedFile) => {
    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pro/resume/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setActiveResume(data.resume);
        startPolling(data.resume.id);
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const renderStatus = () => {
    if (!activeResume) return null;

    const { status } = activeResume;
    if (status === "ANALYZED") return null; // We render the dashboard instead
    if (status === "FAILED") {
      return (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
          <p className="text-white/60 mb-6">We couldn't analyze this resume. The file might be corrupted, image-only, or too complex.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
          >
            Try Another Resume
          </button>
        </div>
      );
    }

    // UPLOADED, PROCESSING, ANALYZING
    return (
      <div className="bg-[#12121A] border border-white/10 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {status === "UPLOADED" ? "Securely Storing..." : status === "PROCESSING" ? "Extracting Text..." : "Analyzing with AI..."}
        </h3>
        <p className="text-white/60 max-w-sm">
          We're extracting your experience, skills, and projects to build your career intelligence profile.
        </p>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!activeResume || activeResume.status !== "ANALYZED" || !activeResume.analysis) return null;
    const { analysis } = activeResume;
    const { parsedData, overallScore, atsScore, sectionScores, strengths, weaknesses, recommendations } = analysis;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#12121A] border border-white/10 p-6 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-white/60 font-medium mb-1">Overall Resume Score</p>
              <h2 className="text-4xl font-bold text-white">{overallScore || 0}<span className="text-xl text-white/40">/100</span></h2>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-indigo-500/10">
              <span className="text-2xl font-bold text-indigo-400">{overallScore || 0}</span>
            </div>
          </div>
          <div className="bg-[#12121A] border border-white/10 p-6 rounded-3xl flex items-center justify-between">
            <div>
              <p className="text-white/60 font-medium mb-1">ATS Compatibility</p>
              <h2 className="text-4xl font-bold text-white">{atsScore || 0}<span className="text-xl text-white/40">/100</span></h2>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10">
              <span className="text-2xl font-bold text-emerald-400">{atsScore || 0}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insights */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#12121A] border border-white/10 p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4">AI Insights</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-emerald-400 font-medium flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {(strengths || []).map((s, i) => (
                      <li key={i} className="text-white/80 flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-1">•</span> {s}
                      </li>
                    ))}
                    {(!strengths || strengths.length === 0) && <li className="text-white/50 text-sm">No specific strengths identified.</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-amber-400 font-medium flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5" /> Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {(weaknesses || []).map((w, i) => (
                      <li key={i} className="text-white/80 flex items-start gap-2 text-sm">
                        <span className="text-amber-500 mt-1">•</span> {w}
                      </li>
                    ))}
                    {(!weaknesses || weaknesses.length === 0) && <li className="text-white/50 text-sm">No major weaknesses identified.</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl">
              <h3 className="text-xl font-bold text-indigo-100 mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {(recommendations || []).map((r, i) => (
                  <li key={i} className="text-indigo-200 flex items-start gap-3 bg-indigo-950/40 p-3 rounded-xl text-sm">
                    <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">{i+1}</span>
                    {r}
                  </li>
                ))}
                {(!recommendations || recommendations.length === 0) && <li className="text-white/50 text-sm">No specific recommendations at this time.</li>}
              </ul>
            </div>
          </div>

          {/* Extracted Data Preview */}
          <div className="space-y-6">
            <div className="bg-[#12121A] border border-white/10 p-6 rounded-3xl h-full">
              <h3 className="text-xl font-bold text-white mb-4">Extracted Data</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-white/50 text-xs uppercase font-bold tracking-wider mb-2">Skills Found ({parsedData?.skills?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {(parsedData?.skills || []).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/80">
                        {skill}
                      </span>
                    ))}
                    {(!parsedData?.skills || parsedData.skills.length === 0) && <span className="text-white/40 text-sm">None</span>}
                  </div>
                </div>

                <div>
                  <p className="text-white/50 text-xs uppercase font-bold tracking-wider mb-2">Experience ({parsedData?.experience?.length || 0})</p>
                  <div className="space-y-3">
                    {(parsedData?.experience || []).map((exp, i) => (
                      <div key={i} className="border-l-2 border-white/10 pl-3">
                        <p className="text-white text-sm font-medium">{exp.role}</p>
                        <p className="text-white/60 text-xs">{exp.company} • {exp.dates}</p>
                      </div>
                    ))}
                    {(!parsedData?.experience || parsedData.experience.length === 0) && <span className="text-white/40 text-sm">None</span>}
                  </div>
                </div>

                <div>
                  <p className="text-white/50 text-xs uppercase font-bold tracking-wider mb-2">Education ({parsedData?.education?.length || 0})</p>
                  <div className="space-y-3">
                    {(parsedData?.education || []).map((edu, i) => (
                      <div key={i} className="border-l-2 border-white/10 pl-3">
                        <p className="text-white text-sm font-medium">{edu.degree}</p>
                        <p className="text-white/60 text-xs">{edu.institution} • {edu.dates}</p>
                      </div>
                    ))}
                    {(!parsedData?.education || parsedData.education.length === 0) && <span className="text-white/40 text-sm">None</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/40" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <Link href="/pro" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Resume Intelligence</h1>
            <p className="text-white/60 mt-2">AI-powered analysis to strengthen your career profile.</p>
          </div>
          
          {activeResume && activeResume.status === "ANALYZED" && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Re-Analyze Resume
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Upload Zone (only show if no active resume or if not currently analyzing) */}
        {!activeResume || activeResume.status === "FAILED" ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-indigo-500/50 bg-[#12121A] hover:bg-indigo-500/5 transition-all p-12 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div className="w-16 h-16 bg-white/5 group-hover:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 transition-colors">
              <FileText className="w-8 h-8 text-white/40 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload your resume</h3>
            <p className="text-white/50 text-sm max-w-sm mb-6">
              PDF or DOCX format. Max 5MB. We'll extract your skills and generate actionable insights.
            </p>
            <span className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all">
              Choose File
            </span>
          </div>
        ) : null}

        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />

        {renderStatus()}
        {renderDashboard()}

      </div>
    </div>
  );
}
