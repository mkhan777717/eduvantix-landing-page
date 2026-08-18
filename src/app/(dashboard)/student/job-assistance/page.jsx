"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Briefcase, CheckCircle2, Clock, XCircle, Upload,
  AlertTriangle, ChevronRight, FileText, Send, Loader2,
  CalendarClock, MessageSquareText, Rocket, RefreshCw, Code, Brain
} from "lucide-react";

// ─── Job role options ─────────────────────────────────────────────────────────
const JOB_ROLES = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "Mobile App Developer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "QA / Test Engineer",
  "UI/UX Designer",
  "Product Manager",
  "System Administrator",
  "Database Administrator",
  "Embedded Systems Engineer",
  "Game Developer",
  "Blockchain Developer",
  "AI Research Engineer",
  "Other"
];

// ─── Slot times (10 AM – 9 PM, 1 hr slots) ──────────────────────────────────
const SLOT_TIMES = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
  "6:00 PM – 7:00 PM",
  "7:00 PM – 8:00 PM",
  "8:00 PM – 9:00 PM",
];

// ─── Stepper Step Config ──────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Application Submitted", description: "Your Details" },
  { num: 2, label: "Application Review", description: "Admin Review" },
  { num: 3, label: "Interview Slot", description: "Book & Confirm" },
  { num: 4, label: "Final Feedback", description: "Mentor Review" },
];

export default function JobAssistancePage() {
  const { user, token, API_BASE, loading: authLoading } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [customCountryCode, setCustomCountryCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [jobType, setJobType] = useState("FULL_TIME");
  const [jobRole, setJobRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // Slot state
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slotSubmitting, setSlotSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const getAuthHeaders = useCallback(() => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (user?.id) {
      return {
        "x-bypass-auth": "true",
        "x-bypass-role": "USER",
        "x-bypass-userid": String(user.id),
      };
    }
    return {
      "x-bypass-auth": "true",
      "x-bypass-role": "USER",
    };
  }, [token, user]);

  // ─── Fetch existing application ─────────────────────────────────────────────
  const fetchMyApplication = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/job-assistance/my`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setApplication(data.application || null);
        if (data.bookedSlots) setBookedSlots(data.bookedSlots);
      } else {
        setApplication(null);
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAuthHeaders]);

  useEffect(() => {
    if (!authLoading) {
      fetchMyApplication();
    }
  }, [authLoading, fetchMyApplication]);

  useEffect(() => {
    if (user && !application) {
      setFullName(user.fullName || user.username || "");
      setEmail(user.email || "");
    }
  }, [user, application]);

  // ─── Submit application ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalRole = jobRole === "Other" ? otherRole.trim() : jobRole;
    if (!finalRole) {
      setError("Please select or specify a job role.");
      return;
    }
    if (!mobile.trim()) {
      setError("Please enter your mobile number.");
      return;
    }
    if (!resumeFile) {
      setError("Please upload your resume (PDF or DOCX).");
      return;
    }

    setSubmitting(true);
    try {
      const selectedCode = countryCode === "other" ? (customCountryCode.trim() || "+") : countryCode;
      const cleanMobile = mobile.trim();
      const finalMobile = cleanMobile.startsWith("+") ? cleanMobile : `${selectedCode} ${cleanMobile}`;

      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("mobile", finalMobile);
      formData.append("jobType", jobType);
      formData.append("jobRole", finalRole);
      formData.append("resume", resumeFile);

      const res = await fetch(`${API_BASE}/api/job-assistance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
      } else {
        setError(data.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Detailed Slot Status Helper (Past vs Buffer vs Available) ──────────────
  const getSlotStatus = (dateStr, timeStr) => {
    if (!dateStr || !timeStr || !application) return { isPast: false, isInBuffer: false, isAvailable: true };

    try {
      const parts = timeStr.split("–");
      const startTimePart = parts[0].trim();
      const endTimePart = parts[1] ? parts[1].trim() : startTimePart;

      const parseTime = (tStr) => {
        const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return null;
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridian = match[3].toUpperCase();
        if (meridian === "PM" && hours < 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;
        return { hours, minutes };
      };

      const startParsed = parseTime(startTimePart);
      const endParsed = parseTime(endTimePart);
      if (!startParsed || !endParsed) return { isPast: false, isInBuffer: false, isAvailable: true };

      const [year, month, day] = dateStr.split("-").map(Number);
      const slotStartObj = new Date(year, month - 1, day, startParsed.hours, startParsed.minutes, 0, 0);
      const slotEndObj = new Date(year, month - 1, day, endParsed.hours, endParsed.minutes, 0, 0);

      const now = new Date();

      // 1. If slot end time is in the past (already ended today or past date), mark as PAST
      if (slotEndObj.getTime() <= now.getTime()) {
        return { isPast: true, isInBuffer: false, isAvailable: false };
      }

      // 2. 6-hour buffer from application approval time (or current time if missing)
      const approvedTime = new Date(application.approvedAt || application.updatedAt || Date.now()).getTime();
      const minAllowedTime = new Date(approvedTime + 6 * 60 * 60 * 1000);

      if (slotStartObj.getTime() < minAllowedTime.getTime()) {
        return { isPast: false, isInBuffer: true, isAvailable: false };
      }

      return { isPast: false, isInBuffer: false, isAvailable: true };
    } catch (e) {
      return { isPast: false, isInBuffer: false, isAvailable: true };
    }
  };

  // ─── Submit slot ────────────────────────────────────────────────────────────
  const handleSlotSubmit = async () => {
    if (!slotDate || !slotTime) return;

    const status = getSlotStatus(slotDate, slotTime);
    if (!status.isAvailable) {
      if (status.isPast) {
        setError("This time slot has already passed. Please select an upcoming slot.");
      } else {
        setError("Selected slot is not available. Please pick a valid upcoming slot.");
      }
      return;
    }

    setSlotSubmitting(true);
    setError("");
    try {
      const preferredSlot = `${slotDate} | ${slotTime}`;
      const res = await fetch(`${API_BASE}/api/job-assistance/${application.id}/slot`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ preferredSlot }),
      });
      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
      } else {
        setError(data.message || "Failed to submit slot.");
      }
    } catch (err) {
      console.error("Slot submit error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setSlotSubmitting(false);
    }
  };

  // ─── Cooldown helper ────────────────────────────────────────────────────────
  const getCooldownInfo = () => {
    if (!application || !["REJECTED", "NEEDS_IMPROVEMENT"].includes(application.status)) return { isCooldownActive: false, text: "" };
    const rejectedTime = new Date(application.rejectedAt || application.updatedAt).getTime();
    const now = Date.now();
    const cooldownMs = 48 * 60 * 60 * 1000;
    const timePassed = now - rejectedTime;
    if (timePassed >= cooldownMs) {
      return { isCooldownActive: false, text: "" };
    }
    const remainingMs = cooldownMs - timePassed;
    const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      isCooldownActive: true,
      text: `${hoursLeft}h ${minsLeft}m`,
      hoursLeft,
      minsLeft,
    };
  };

  // ─── Step status helpers ────────────────────────────────────────────────────
  const getStepState = (stepNum) => {
    if (!application) return "pending";
    const { status, currentStep } = application;

    if (stepNum === 1) {
      return "completed"; // always completed once app exists
    }

    if (stepNum === 2) {
      if (status === "PENDING") return "in-progress";
      if (status === "REJECTED" && currentStep === 2) return "rejected";
      if (["APPROVED", "SLOT_PENDING", "SLOT_CONFIRMED", "SLOT_REJECTED", "NEEDS_IMPROVEMENT", "COMPLETED"].includes(status)) return "completed";
      return "pending";
    }

    if (stepNum === 3) {
      if (["APPROVED", "SLOT_REJECTED"].includes(status)) return "action-required"; // student needs to pick slot
      if (status === "SLOT_PENDING") return "in-progress";
      if (["SLOT_CONFIRMED", "NEEDS_IMPROVEMENT", "COMPLETED"].includes(status)) return "completed";
      if (status === "SLOT_REJECTED") return "rejected";
      return "pending";
    }

    if (stepNum === 4) {
      if (status === "SLOT_CONFIRMED") return "in-progress";
      if (status === "COMPLETED") return "completed";
      if (status === "NEEDS_IMPROVEMENT") return "action-required";
      if (status === "REJECTED" && currentStep === 4) return "rejected";
      return "pending";
    }

    return "pending";
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin mx-auto" style={{ borderColor: "var(--accent-primary)" }} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading your application...</p>
        </div>
      </div>
    );
  }

  // ─── Application Form (no active application) ──────────────────────────────
  if (!application) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in space-y-6 pb-12">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
              Job Assistance
            </h1>
            <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Fill in your details to apply for job & interview assistance. Our team will review your application.
            </p>
          </div>
        </section>

        {/* Form Card */}
        <div className="p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          {/* Decorative glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--accent-primary)", opacity: 0.06 }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  readOnly
                  value={email}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none cursor-not-allowed opacity-85 font-medium"
                  style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] appearance-none cursor-pointer font-semibold shrink-0"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)", minWidth: "105px" }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+92">🇵🇰 +92</option>
                  <option value="+94">🇱🇰 +94</option>
                  <option value="+977">🇳🇵 +977</option>
                  <option value="other">Other</option>
                </select>

                {countryCode === "other" && (
                  <input
                    type="text"
                    placeholder="+XX"
                    value={customCountryCode}
                    onChange={(e) => setCustomCountryCode(e.target.value)}
                    className="w-20 px-3 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] shrink-0"
                    style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  />
                )}

                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={mobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 15);
                    setMobile(digits);
                  }}
                  placeholder="Enter your mobile number"
                  className="flex-1 px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] min-w-0"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                Type of Job <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-3">
                {[
                  { value: "INTERNSHIP", label: "Internship" },
                  { value: "FULL_TIME", label: "Full Time" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setJobType(opt.value)}
                    className="flex-1 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                    style={{
                      borderColor: jobType === opt.value ? "var(--accent-primary)" : "var(--border-primary)",
                      backgroundColor: jobType === opt.value ? "var(--accent-primary)" : "var(--bg-input)",
                      color: jobType === opt.value ? "var(--text-on-accent)" : "var(--text-secondary)",
                      boxShadow: jobType === opt.value ? "0 4px 14px rgba(var(--accent-primary-rgb, 99,102,241), 0.15)" : "none"
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Role */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                Job Role <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] appearance-none cursor-pointer"
                style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                <option value="" disabled>Select a job role...</option>
                {JOB_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              {jobRole === "Other" && (
                <input
                  type="text"
                  required
                  value={otherRole}
                  onChange={(e) => setOtherRole(e.target.value)}
                  placeholder="Specify your desired role..."
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] mt-2"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                />
              )}
            </div>

            {/* Resume Upload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                Resume <span className="text-rose-500">*</span>
                <span className="text-[10px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>(PDF or DOCX, max 10MB)</span>
              </label>
              <label
                className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed text-xs font-semibold transition-all cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]"
                style={{ borderColor: resumeFile ? "var(--accent-primary)" : "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                {resumeFile ? (
                  <>
                    <FileText size={14} style={{ color: "var(--accent-primary)" }} />
                    <span style={{ color: "var(--text-primary)" }}>{resumeFile.name}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      ({(resumeFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Click to upload your resume</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        setError("File size must be under 10MB.");
                        return;
                      }
                      setResumeFile(file);
                      setError("");
                    }
                  }}
                />
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold animate-in fade-in duration-300">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider text-[var(--text-on-accent)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md"
              style={{ background: "var(--accent-gradient)" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Submit Application
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex justify-center items-center gap-2.5 text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
          <Briefcase size={14} style={{ color: "var(--accent-primary)" }} />
          <span>Our team will get back to you within 24-48 hours.</span>
        </div>
      </div>
    );
  }

  // ─── Stepper View (application exists) ──────────────────────────────────────
  const { status } = application;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-2">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Job Assistance
        </h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Track your application progress below.
        </p>
      </div>

      {/* Dynamic Email Notice Banner */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
        <AlertTriangle size={15} className="shrink-0 text-amber-500" />
        <span>
          ✉️ <strong>Important Email Notice:</strong>{" "}
          {status === "PENDING" && (
            <>Once <strong>our team</strong> reviews your application, an official status notification will be sent to your email. Please check your <strong>Inbox</strong> as well as your <strong>Spam / Junk folder</strong>!</>
          )}
          {(status === "APPROVED" || status === "SLOT_REJECTED") && (
            <>Once you select and submit your interview slot below, <strong>our team</strong> will review and confirm it via email. Please check your <strong>Inbox</strong> as well as your <strong>Spam / Junk folder</strong>!</>
          )}
          {status === "SLOT_PENDING" && (
            <>Once <strong>our team</strong> confirms your requested slot and assigns a mentor, your interview details will be sent to your email. Please check your <strong>Inbox</strong> as well as your <strong>Spam / Junk folder</strong>!</>
          )}
          {status === "SLOT_CONFIRMED" && (
            <>Your interview slot has been confirmed by <strong>our team</strong>! Your mentor details and meeting instructions have been sent to your email. Please check your <strong>Inbox</strong> as well as your <strong>Spam / Junk folder</strong>!</>
          )}
          {(status === "COMPLETED" || status === "NEEDS_IMPROVEMENT" || status === "REJECTED") && (
            <>Your interview evaluation report and mentor feedback notes from <strong>our team</strong> have been sent to your email. Please check your <strong>Inbox</strong> as well as your <strong>Spam / Junk folder</strong>!</>
          )}
        </span>
      </div>

      {/* Stepper Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xl relative overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)" }}>
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--accent-primary)", opacity: 0.05 }} />

        {/* ─── Step Circles + Connectors ────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 relative">
          {STEPS.map((step, i) => {
            const state = getStepState(step.num);
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.num} className="flex items-start flex-1" style={{ minWidth: 0 }}>
                {/* Step circle + label */}
                <div className="flex flex-col items-center text-center z-10" style={{ minWidth: "72px" }}>
                  {/* Circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0"
                    style={{
                      borderColor:
                        state === "completed" ? "#10b981"
                        : state === "in-progress" || state === "action-required" ? "var(--accent-primary)"
                        : state === "rejected" ? "#ef4444"
                        : "var(--border-primary)",
                      backgroundColor:
                        state === "completed" ? "#10b981"
                        : state === "rejected" ? "#ef4444"
                        : "transparent",
                      color:
                        state === "completed" || state === "rejected" ? "#fff"
                        : state === "in-progress" || state === "action-required" ? "var(--accent-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {state === "completed" ? (
                      <CheckCircle2 size={18} />
                    ) : state === "rejected" ? (
                      <XCircle size={18} />
                    ) : state === "in-progress" || state === "action-required" ? (
                      <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-primary)" }} />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--border-primary)" }} />
                    )}
                  </div>

                  {/* Label */}
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-2.5"
                    style={{ color: "var(--text-muted)" }}>
                    Step {step.num}
                  </p>
                  <p className="text-[11px] font-bold mt-0.5 leading-tight"
                    style={{
                      color:
                        state === "completed" ? "#10b981"
                        : state === "in-progress" || state === "action-required" ? "var(--accent-primary)"
                        : state === "rejected" ? "#ef4444"
                        : "var(--text-secondary)"
                    }}>
                    {step.label}
                  </p>
                  <p className="text-[10px] mt-0.5"
                    style={{
                      color:
                        state === "completed" ? "#10b981"
                        : state === "rejected" ? "#ef4444"
                        : state === "in-progress" ? "var(--accent-primary)"
                        : "var(--text-muted)"
                    }}>
                    {state === "completed" ? "Completed"
                      : state === "in-progress" ? "In Progress"
                      : state === "action-required" ? "Action Required"
                      : state === "rejected" ? "Rejected"
                      : "Pending"}
                  </p>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 flex items-center pt-5 px-1" style={{ minWidth: "20px" }}>
                    <div className="w-full h-0.5 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: state === "completed" ? "#10b981" :
                          state === "in-progress" || state === "action-required" ? "var(--accent-primary)" :
                          "var(--border-primary)",
                        opacity: state === "completed" ? 1 : 0.4
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Status Detail Section ───────────────────────────────────── */}
        <div className="space-y-4">
          {/* ─── Step 2: Pending Review ─── */}
          {status === "PENDING" && (
            <StatusCard
              icon={<Clock size={20} />}
              iconBg="bg-amber-500/10"
              iconBorder="border-amber-500/20"
              iconColor="text-amber-500"
              title="Application Under Review"
              description="Your application has been submitted successfully. Our team is reviewing your details. Please check back in 24-48 hours."
            />
          )}

          {/* ─── Step 2: Rejected ─── */}
          {status === "REJECTED" && (application.currentStep === 2 || !application.currentStep) && (() => {
            const cooldown = getCooldownInfo();
            return (
              <div className="space-y-4">
                <StatusCard
                  icon={<XCircle size={20} />}
                  iconBg="bg-red-500/10"
                  iconBorder="border-red-500/20"
                  iconColor="text-red-500"
                  title="Application Not Approved"
                  description="Unfortunately, your application was not approved at this time. Please use our practice tools below to enhance your profile skills."
                  note={application.adminNote}
                />

                {/* Quick Guidance Links */}
                <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Rocket size={14} style={{ color: "var(--accent-primary)" }} />
                    Prepare For Your Next Application
                  </h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Improve your profile skills using these platform tools before re-applying:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Link
                      href="/student/resume"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <FileText size={15} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Update Resume</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>ATS Resume Builder</p>
                      </div>
                    </Link>

                    <Link
                      href="/practice"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Code size={15} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Practice Coding</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Solve Arena Problems</p>
                      </div>
                    </Link>

                    <Link
                      href="/student/viva"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Brain size={15} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">AI Viva Mock</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Mock Interview Prep</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Re-apply action button / cooldown badge */}
                {cooldown.isCooldownActive ? (
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-1.5">
                    <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1.5">
                      <Clock size={14} />
                      Re-application Unlocks in {cooldown.text}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Candidates can re-apply 48 hours after rejection. Please utilize this preparation window to enhance your profile.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setApplication(null)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}
                  >
                    <RefreshCw size={13} />
                    Apply Again Now
                  </button>
                )}
              </div>
            );
          })()}

          {/* ─── Step 3: Select Slot ─── */}
          {(status === "APPROVED" || status === "SLOT_REJECTED") && (
            <div className="space-y-4">
              {status === "APPROVED" && (
                <StatusCard
                  icon={<CheckCircle2 size={20} />}
                  iconBg="bg-emerald-500/10"
                  iconBorder="border-emerald-500/20"
                  iconColor="text-emerald-500"
                  title="Application Approved!"
                  description="Congratulations! Your application has been approved. Please select a preferred interview training slot below."
                />
              )}
              {status === "SLOT_REJECTED" && (
                <StatusCard
                  icon={<AlertTriangle size={20} />}
                  iconBg="bg-amber-500/10"
                  iconBorder="border-amber-500/20"
                  iconColor="text-amber-500"
                  title="Slot Not Available"
                  description="Your requested slot was not available. Please select a different slot below to re-submit instantly."
                  note={application.adminNote}
                />
              )}

              {/* Slot Picker */}
              <div className="p-5 rounded-2xl border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <CalendarClock size={16} style={{ color: "var(--accent-primary)" }} />
                  Select Interview Slot
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={slotDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setSlotDate(e.target.value);
                        setSlotTime("");
                      }}
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Preferred Time Slot
                    </label>
                    <select
                      value={slotTime}
                      disabled={!slotDate}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <option value="" disabled>{slotDate ? "Select a time slot..." : "Please select date first..."}</option>
                      {(() => {
                        if (!slotDate) return null;
                        const validSlots = SLOT_TIMES.filter((t) => {
                          const st = getSlotStatus(slotDate, t);
                          return !st.isPast && !st.isInBuffer;
                        });

                        if (validSlots.length === 0) {
                          return <option value="" disabled>No available slots for this date. Please pick a future date.</option>;
                        }

                        return validSlots.map((t) => {
                          const slotString = `${slotDate} | ${t}`;
                          const isBooked = bookedSlots.includes(slotString);
                          return (
                            <option key={t} value={t} disabled={isBooked}>
                              {t}{isBooked ? " (Not Available)" : ""}
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold mb-3">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSlotSubmit}
                  disabled={!slotDate || !slotTime || slotSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[var(--text-on-accent)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {slotSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CalendarClock size={13} />
                      Submit Slot Preference
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Slot Pending ─── */}
          {status === "SLOT_PENDING" && (
            <StatusCard
              icon={<Clock size={20} />}
              iconBg="bg-blue-500/10"
              iconBorder="border-blue-500/20"
              iconColor="text-blue-500"
              title="Interview Slot Under Review"
              description="Your preferred interview slot has been submitted. Please wait for confirmation from our team. We'll update the status here."
            />
          )}

          {/* ─── Step 3: Slot Confirmed ─── */}
          {status === "SLOT_CONFIRMED" && (
            <StatusCard
              icon={<CheckCircle2 size={20} />}
              iconBg="bg-emerald-500/10"
              iconBorder="border-emerald-500/20"
              iconColor="text-emerald-500"
              title="Interview Slot Confirmed!"
              description={`Your interview slot has been ${application.confirmedSlot !== application.preferredSlot ? "updated and " : ""}confirmed. Please check your email for mentor/interviewer details. The interview details have been shared with you.`}
            >
              <div className="mt-3 p-3.5 rounded-xl border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold" style={{ color: "var(--text-muted)" }}>Confirmed Slot: </span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{application.confirmedSlot}</span>
                  </div>
                  {application.interviewerName && (
                    <div>
                      <span className="font-bold" style={{ color: "var(--text-muted)" }}>Interviewer: </span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{application.interviewerName}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] mt-2 font-medium" style={{ color: "var(--text-muted)" }}>
                ✉️ Please wait for the confirmation email with complete details.
              </p>
            </StatusCard>
          )}

          {/* ─── Step 4: Completed / Perfect (Forwarded) ─── */}
          {status === "COMPLETED" && (
            <StatusCard
              icon={<Rocket size={20} />}
              iconBg="bg-emerald-500/10"
              iconBorder="border-emerald-500/20"
              iconColor="text-emerald-500"
              title="Interview Qualified & Profile Forwarded! 🎉"
              description="Outstanding performance! Your interview feedback was perfect. We have forwarded your profile to top hiring partners. Expect interview calls from recruiters soon!"
            >
              {application.mentorFeedback && (
                <div className="mt-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquareText size={14} className="text-emerald-500" />
                    <h4 className="text-xs font-bold text-emerald-500">Mentor Evaluation & Feedback</h4>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-emerald-400">
                    {application.mentorFeedback}
                  </p>
                </div>
              )}
            </StatusCard>
          )}

          {/* ─── Step 4: Needs Improvement ─── */}
          {status === "NEEDS_IMPROVEMENT" && (() => {
            const cooldown = getCooldownInfo();
            return (
              <div className="space-y-4">
                <StatusCard
                  icon={<AlertTriangle size={20} />}
                  iconBg="bg-amber-500/10"
                  iconBorder="border-amber-500/20"
                  iconColor="text-amber-500"
                  title="Interview Completed — Needs Improvement 📈"
                  description="Good effort! Based on the mentor's evaluation, you need more practice before we can forward your profile to recruiters."
                >
                  {application.mentorFeedback && (
                    <div className="mt-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquareText size={14} className="text-amber-500" />
                        <h4 className="text-xs font-bold text-amber-500">Mentor Feedback</h4>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-amber-400">
                        {application.mentorFeedback}
                      </p>
                    </div>
                  )}
                </StatusCard>

                {/* Quick Guidance Links */}
                <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Rocket size={14} style={{ color: "var(--accent-primary)" }} />
                    Practice & Improve Your Skills
                  </h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Work on your mentor feedback using these platform tools before re-applying:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Link
                      href="/student/resume"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <FileText size={15} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Update Resume</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>ATS Resume Builder</p>
                      </div>
                    </Link>

                    <Link
                      href="/practice"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Code size={15} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Practice Coding</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Solve Arena Problems</p>
                      </div>
                    </Link>

                    <Link
                      href="/student/viva"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Brain size={15} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">AI Viva Mock</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Mock Interview Prep</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {cooldown.isCooldownActive ? (
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-1.5">
                    <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1.5">
                      <Clock size={14} />
                      Re-application Unlocks in {cooldown.text}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Please utilize this preparation window to practice before re-applying.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setApplication(null)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}
                  >
                    <RefreshCw size={13} />
                    Apply Again Now
                  </button>
                )}
              </div>
            );
          })()}

          {/* ─── Step 4: Rejected (Interview Failed) ─── */}
          {status === "REJECTED" && application.currentStep === 4 && (() => {
            const cooldown = getCooldownInfo();
            return (
              <div className="space-y-4">
                <StatusCard
                  icon={<XCircle size={20} />}
                  iconBg="bg-red-500/10"
                  iconBorder="border-red-500/20"
                  iconColor="text-red-500"
                  title="Interview Performance Not Qualified ❌"
                  description="Unfortunately, your interview performance did not qualify the required criteria for recruiter forwarding."
                >
                  {application.mentorFeedback && (
                    <div className="mt-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquareText size={14} className="text-red-500" />
                        <h4 className="text-xs font-bold text-red-500">Mentor Feedback</h4>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-red-400">
                        {application.mentorFeedback}
                      </p>
                    </div>
                  )}
                </StatusCard>

                {/* Quick Guidance Links */}
                <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Rocket size={14} style={{ color: "var(--accent-primary)" }} />
                    Prepare For Your Next Application
                  </h4>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Use these platform tools to prepare before re-applying:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Link
                      href="/student/resume"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <FileText size={15} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Update Resume</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>ATS Resume Builder</p>
                      </div>
                    </Link>

                    <Link
                      href="/practice"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Code size={15} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">Practice Coding</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Solve Arena Problems</p>
                      </div>
                    </Link>

                    <Link
                      href="/student/viva"
                      className="flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.02] hover:border-[var(--accent-primary)]"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    >
                      <Brain size={15} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[11px]">AI Viva Mock</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Mock Interview Prep</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {cooldown.isCooldownActive ? (
                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-1.5">
                    <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1.5">
                      <Clock size={14} />
                      Re-application Unlocks in {cooldown.text}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Please utilize this preparation window to enhance your profile.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setApplication(null)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}
                  >
                    <RefreshCw size={13} />
                    Apply Again Now
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* ─── Application Summary ─────────────────────────────────────── */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border-primary)" }}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Application Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Name", value: application.fullName },
              { label: "Email", value: application.email },
              { label: "Mobile", value: application.mobile },
              { label: "Job Type", value: application.jobType === "FULL_TIME" ? "Full Time" : "Internship" },
              { label: "Job Role", value: application.jobRole },
              { label: "Resume", value: application.resumeFileName },
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                <p className="text-[11px] font-semibold truncate" style={{ color: "var(--text-primary)" }} title={item.value}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh prompt */}
      <div className="flex justify-center">
        <button
          onClick={fetchMyApplication}
          className="flex items-center gap-2 text-[11px] font-semibold px-4 py-2 rounded-xl transition-all hover:bg-[var(--bg-hover)] cursor-pointer"
          style={{ color: "var(--text-muted)" }}
        >
          <RefreshCw size={12} />
          Refresh Status
        </button>
      </div>
    </div>
  );
}

// ─── Reusable Status Card Component ───────────────────────────────────────────
function StatusCard({ icon, iconBg, iconBorder, iconColor, title, description, note, children }) {
  return (
    <div className="p-5 rounded-2xl border animate-in fade-in duration-300" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center border ${iconBorder} shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{description}</p>
          {note && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              <span className="font-bold text-amber-500">Note: </span>{note}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
