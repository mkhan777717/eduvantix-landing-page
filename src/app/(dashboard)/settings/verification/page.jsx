"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle2, XCircle, Clock, AlertCircle,
  ChevronRight, ChevronLeft, Loader2, ExternalLink,
  GraduationCap, BookOpen, Building2, Info, RefreshCw,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";
import VerifiedBadge from "@/components/VerifiedBadge";

const API_BASE = getApiBase();

// ── Tier metadata ─────────────────────────────────────────────────────────────
const TIERS = [
  {
    id: "STUDENT",
    name: "Verified Student",
    icon: GraduationCap,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.05)",
    border: "rgba(37,99,235,0.2)",
    description: "Confirm your identity as a legitimate, active student on Eduvantix.",
    criteria: [
      "Account at least 30 days old",
      "Profile photo and full name set",
      "Enrolled in an institute",
      "≥10 problems solved OR ≥5 discussion/journal posts",
      "Account in good standing (not blocked)",
    ],
  },
  {
    id: "EDUCATOR",
    name: "Verified Educator",
    icon: BookOpen,
    color: "#ea580c",
    bg: "rgba(234,88,12,0.05)",
    border: "rgba(234,88,12,0.2)",
    description: "Show the community you are a verified instructor, mentor, or content creator.",
    criteria: [
      "All Verified Student criteria",
      "Mentor / Batch Manager role OR published courses",
      "≥1 published LMS course OR ≥3 managed batches",
      "≥25 community interactions (posts + comments + upvotes received)",
      "Optional: LinkedIn/GitHub profile for cross-verification",
    ],
  },
  {
    id: "ORGANIZATION",
    name: "Verified Organization",
    icon: Building2,
    color: "#6d28d9",
    bg: "rgba(109,40,217,0.05)",
    border: "rgba(109,40,217,0.2)",
    description: "Verify your institution's legitimacy as an official educational organization.",
    criteria: [
      "Must be an Institute Admin",
      "Institute registered on Eduvantix",
      "≥5 active enrolled students",
      "Official institute email or website set",
    ],
  },
];

const STATUS_CONFIG = {
  PENDING: { label: "Pending Review", icon: Clock, color: "var(--text-secondary)" },
  UNDER_REVIEW: { label: "Under Review", icon: RefreshCw, color: "#3b82f6" },
  APPROVED: { label: "Approved ✓", icon: CheckCircle2, color: "#22c55e" },
  REJECTED: { label: "Not Approved", icon: XCircle, color: "#ef4444" },
  MORE_INFO_REQUIRED: { label: "More Info Needed", icon: AlertCircle, color: "#f59e0b" },
  REVOKED: { label: "Revoked", icon: XCircle, color: "#ef4444" },
};

// ── Main page ──────────────────────────────────────────────────────────────────
export default function VerificationPage() {
  const { user, updateUser, token } = useAuth();
  const [step, setStep] = useState(1); // 1: pick tier, 2: eligibility check, 3: form, 4: status
  const [selectedTier, setSelectedTier] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [form, setForm] = useState({ reason: "", linkedinUrl: "", websiteUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [myBadge, setMyBadge] = useState(null);
  const [appsLoading, setAppsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const headers = buildAuthHeaders(token, user);

  // Fetch existing applications
  const fetchMyApplications = useCallback(async () => {
    setAppsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/verification/my-application`, { 
        headers,
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setMyApplications(data.applications || []);
        setMyBadge(data.badge || null);
        if ((data.applications || []).length > 0) {
          setStep(4);
        } else {
          // Auto-select tier and jump to eligibility (Step 2)
          let tierId = "STUDENT";
          if (user?.role === "INSTITUTE_ADMIN") tierId = "ORGANIZATION";
          if (user?.role === "MENTOR" || user?.role === "BATCH_MANAGER") tierId = "EDUCATOR";
          const tier = TIERS.find(t => t.id === tierId);
          if (tier) {
            setSelectedTier(tier);
            setStep(2);
            runEligibilityCheck(tier.id);
          }
        }
        
        if (data.badge) {
          updateUser({ 
            isVerified: Boolean(data.badge.isVerified), 
            verifiedBadgeTier: data.badge.verifiedBadgeTier 
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchMyApplications(); }, [fetchMyApplications]);

  // Eligibility check
  const runEligibilityCheck = async (tier) => {
    setEligibilityLoading(true);
    setEligibility(null);
    try {
      const bypass = localStorage.getItem('bypass_eligibility') === 'true';
      const res = await fetch(`${API_BASE}/api/verification/check-eligibility?tier=${tier}${bypass ? '&test_bypass=true' : ''}`, { headers });
      const data = await res.json();
      setEligibility(data);
    } catch {
      showToast("Failed to check eligibility. Try again.", "error");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setStep(2);
    runEligibilityCheck(tier.id);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        tier: selectedTier.id,
        reason: form.reason,
        linkedinUrl: form.linkedinUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
      };
      const bypass = localStorage.getItem('bypass_eligibility') === 'true';
      const res = await fetch(`${API_BASE}/api/verification/apply${bypass ? '?test_bypass=true' : ''}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Application submitted successfully! 🎉");
        fetchMyApplications();
      } else {
        showToast(data.message || "Failed to submit.", "error");
      }
    } catch {
      showToast("Network error. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/verification/withdraw/${appId}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        showToast("Application withdrawn.");
        await fetchMyApplications();
      } else {
        showToast(data.message || "Failed to withdraw.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "var(--text-primary)", fontFamily: "Inter, sans-serif", padding: "24px 20px" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{
              position: "fixed", top: 20, right: 20, zIndex: 9999,
              background: toast.type === "error" ? "#ef4444" : "#22c55e",
              border: "none",
              borderRadius: 12, padding: "12px 20px",
              boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
              display: "flex", alignItems: "center", gap: 10,
              color: "white",
              fontWeight: 500, fontSize: 14, maxWidth: 360,
            }}
          >
            {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius: 12, padding: 10, display: "flex" }}>
              <Shield size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Verified Badge</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Apply for a trust badge visible across the platform</p>
            </div>
          </div>

          {/* Current badge status */}
          {myBadge?.isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}
            >
              <CheckCircle2 size={22} color="#22c55e" />
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  You have a verified badge!
                  <VerifiedBadge tier={myBadge.verifiedBadgeTier} size="sm" />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {myBadge.verifiedBadgeTier} badge granted on {new Date(myBadge.verifiedAt).toLocaleDateString()}
                  {myBadge.badgeExpiresAt && ` · Expires ${new Date(myBadge.badgeExpiresAt).toLocaleDateString()}`}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Loading state */}
        {appsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={32} className="animate-spin" color="#3b82f6" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── STEP 4: Application Status View ── */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Your Applications</h2>
                </div>

                {myApplications.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusCfg.icon;
                  const tier = TIERS.find(t => t.id === app.badgeTier);

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: 16, padding: 20, marginBottom: 16 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <VerifiedBadge tier={app.badgeTier} size="md" showTooltip={false} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{tier?.name || app.badgeTier}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              Submitted {new Date(app.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}40`, borderRadius: 20, padding: "5px 14px" }}>
                          <StatusIcon size={13} color={statusCfg.color} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div style={{ display: "flex", gap: 0, marginTop: 16, fontSize: 11 }}>
                        {["SUBMITTED", "UNDER_REVIEW", "DECISION"].map((s, i) => {
                          const done = i === 0 || (i === 1 && ["UNDER_REVIEW", "APPROVED", "REJECTED", "MORE_INFO_REQUIRED", "REVOKED"].includes(app.status)) || (i === 2 && ["APPROVED", "REJECTED", "REVOKED"].includes(app.status));
                          return (
                            <React.Fragment key={s}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? "#22c55e" : "rgba(255,255,255,0.1)", border: `2px solid ${done ? "#22c55e" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {done && <CheckCircle2 size={12} color="white" />}
                                </div>
                                <span style={{ color: done ? "var(--text-primary)" : "var(--text-muted)", fontWeight: done ? 600 : 400 }}>{s}</span>
                              </div>
                              {i < 2 && <div style={{ flex: 1, height: 2, marginTop: 9, background: done ? "#22c55e40" : "rgba(255,255,255,0.07)" }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Admin notes / rejection reason */}
                      {app.rejectionReason && (
                        <div style={{ marginTop: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text-primary)" }}>
                          <span style={{ fontWeight: 700 }}>Reason: </span>{app.rejectionReason}
                          {app.canReApplyAt && <div style={{ fontSize: 11, marginTop: 4, color: "var(--text-muted)" }}>
                            You can re-apply on {new Date(app.canReApplyAt).toLocaleDateString()}
                          </div>}
                        </div>
                      )}
                      {app.adminNotes && app.status === "MORE_INFO_REQUIRED" && (
                        <div style={{ marginTop: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text-primary)" }}>
                          <span style={{ fontWeight: 700 }}>Admin notes: </span>{app.adminNotes}
                        </div>
                      )}

                      {/* Withdraw button */}
                      {["PENDING", "MORE_INFO_REQUIRED"].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          style={{ marginTop: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <Trash2 size={13} /> Withdraw Application
                        </button>
                      )}

                      {/* Reapply button */}
                      {["REJECTED", "REVOKED"].includes(app.status) && (() => {
                        const canReapply = !app.canReApplyAt || new Date() >= new Date(app.canReApplyAt);
                        return (
                          <button
                            disabled={!canReapply}
                            onClick={() => { 
                              if (!canReapply) return;
                              let tierId = "STUDENT";
                              if (user?.role === "INSTITUTE_ADMIN") tierId = "ORGANIZATION";
                              if (user?.role === "MENTOR" || user?.role === "BATCH_MANAGER") tierId = "EDUCATOR";
                              const tier = TIERS.find(t => t.id === tierId);
                              if (tier) {
                                setSelectedTier(tier);
                                setStep(2);
                                runEligibilityCheck(tier.id);
                                setForm({ reason: "", linkedinUrl: "", websiteUrl: "" });
                              }
                            }}
                            style={{ 
                              marginTop: 14, 
                              background: "rgba(59,130,246,0.1)", 
                              border: "1px solid rgba(59,130,246,0.25)", 
                              color: "#3b82f6", 
                              borderRadius: 8, 
                              padding: "7px 14px", 
                              cursor: canReapply ? "pointer" : "not-allowed", 
                              opacity: canReapply ? 1 : 0.5,
                              fontSize: 12, 
                              fontWeight: 600, 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 6 
                            }}
                          >
                            <RefreshCw size={13} /> Reapply for Badge
                          </button>
                        );
                      })()}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}



            {/* ── STEP 2: Eligibility Check ── */}
            {step === 2 && selectedTier && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <VerifiedBadge tier={selectedTier.id} size="md" showTooltip={false} />
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selectedTier.name} — Eligibility Check</h2>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>We&apos;re checking if your account meets the criteria</p>
                  </div>
                </div>

                {eligibilityLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
                    <Loader2 size={30} className="animate-spin" color={selectedTier.color} />
                    <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Checking eligibility…</span>
                  </div>
                ) : eligibility ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Met criteria */}
                    {eligibility.metCriteria?.map((c, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}
                      >
                        <CheckCircle2 size={16} color="#22c55e" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ color: "var(--text-primary)" }}>{c}</span>
                      </motion.div>
                    ))}
                    {/* Missing criteria */}
                    {eligibility.missingCriteria?.map((c, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ((eligibility.metCriteria?.length || 0) + i) * 0.06 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}
                      >
                        <XCircle size={16} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ color: "var(--text-primary)" }}>{c}</span>
                      </motion.div>
                    ))}

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: 12, display: "flex", gap: 12 }}>
                      {eligibility.eligible ? (
                        <button
                          onClick={() => setStep(3)}
                          style={{ flex: 1, background: `linear-gradient(135deg, ${selectedTier.color}, ${selectedTier.color}99)`, border: "none", borderRadius: 12, padding: "14px 24px", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 20px ${selectedTier.color}40` }}
                        >
                          Continue to Application <ChevronRight size={18} />
                        </button>
                      ) : (
                        <div style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 24px", textAlign: "center", fontSize: 14, color: "#ef4444", fontWeight: 600 }}>
                          Complete the missing criteria to apply
                        </div>
                      )}
                    </motion.div>
                  </div>
                ) : null}
              </motion.div>
            )}

            {/* ── STEP 3: Application Form ── */}
            {step === 3 && selectedTier && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13 }}>
                  <ChevronLeft size={16} /> Back to eligibility
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <VerifiedBadge tier={selectedTier.id} size="md" showTooltip={false} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Apply for {selectedTier.name}</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      Why do you deserve verification? <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                    </label>
                    <textarea
                      value={form.reason}
                      onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="Briefly describe your background and why you should be verified…"
                      rows={4}
                      style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: "12px 16px", color: "inherit", fontSize: 14, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {["EDUCATOR", "ORGANIZATION"].includes(selectedTier.id) && (
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                        LinkedIn Profile URL <span style={{ color: "var(--text-muted)" }}>(optional but recommended)</span>
                      </label>
                      <input
                        type="url"
                        value={form.linkedinUrl}
                        onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/your-profile"
                        style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: "12px 16px", color: "inherit", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  )}

                  {selectedTier.id === "ORGANIZATION" && (
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                        Institution Website URL <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={form.websiteUrl}
                        onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
                        placeholder="https://your-institute.edu"
                        style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 12, padding: "12px 16px", color: "inherit", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  )}

                  <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, fontSize: 13, color: "#93c5fd" }}>
                    <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    Our team will review your application within 2–5 business days. Your eligibility will be re-checked at the time of review.
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ background: `linear-gradient(135deg, ${selectedTier.color}, ${selectedTier.color}99)`, border: "none", borderRadius: 12, padding: "14px 28px", color: "white", fontWeight: 700, fontSize: 15, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.7 : 1, boxShadow: `0 4px 20px ${selectedTier.color}40` }}
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : <><Shield size={18} /> Submit Application</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
