"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";
import {
  Palette, Upload, Trash2, Save, CheckCircle2, XCircle,
  Image as ImageIcon, Globe, Eye, Loader2, RotateCcw, Monitor, Info
} from "lucide-react";

const API_BASE = getApiBase();

// ── Toast helper ───────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: toast.type === "error" ? "#ef4444" : "#22c55e",
      borderRadius: 12, padding: "12px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", gap: 10,
      color: "white", fontWeight: 600, fontSize: 14, maxWidth: 380,
      animation: "slideDown 0.3s ease",
    }}>
      {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.7, marginLeft: 4 }}>×</button>
    </div>
  );
}

// ── Image drop zone ────────────────────────────────────────────────────────────
function ImageDropZone({ label, hint, accept, previewUrl, onFileSelect, onRemove }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "-4px 0 4px" }}>{hint}</p>}

      {previewUrl ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
          borderRadius: 12, padding: "12px 16px"
        }}>
          <img
            src={previewUrl.startsWith("http") || previewUrl.startsWith("blob:")
              ? previewUrl
              : (previewUrl.startsWith("/uploads") ? `${API_BASE}${previewUrl}` : previewUrl)}
            alt={label}
            style={{ height: 48, maxWidth: 160, objectFit: "contain", borderRadius: 6, background: "white", padding: 2 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Current {label}</div>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                fontSize: 11, color: "var(--accent-primary)", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline"
              }}
            >
              Change image
            </button>
          </div>
          <button
            onClick={onRemove}
            style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", borderRadius: 8, padding: "7px 12px", cursor: "pointer",
              fontSize: 12, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed var(--border-primary)", borderRadius: 12,
            padding: "28px 24px", textAlign: "center", cursor: "pointer",
            background: "var(--bg-secondary)", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-primary)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
        >
          <Upload size={22} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Click or drag & drop to upload</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>PNG, JPG, SVG, WEBP · Max 3MB</div>
        </div>
      )}

      <input
        ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ── Live Preview ───────────────────────────────────────────────────────────────
function LivePreview({ customName, logoPreviewUrl }) {
  const displayName = customName || "Your Institute";

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border-primary)",
      borderRadius: 16, overflow: "hidden"
    }}>
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid var(--border-primary)",
        display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-secondary)"
      }}>
        <Monitor size={13} style={{ color: "var(--text-muted)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Live Preview</span>
      </div>

      <div style={{ display: "flex", height: 210 }}>
        {/* Simulated sidebar */}
        <div style={{
          width: 160, flexShrink: 0, background: "var(--bg-sidebar, var(--bg-secondary))",
          borderRight: "1px solid var(--border-primary)", display: "flex", flexDirection: "column"
        }}>
          {/* Logo area */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-primary)", minHeight: 46, display: "flex", alignItems: "center" }}>
            {logoPreviewUrl ? (
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                style={{ maxHeight: 28, maxWidth: 130, objectFit: "contain", objectPosition: "left" }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent-primary, #6366f1)", flexShrink: 0 }} />
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "var(--text-primary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110
                }}>
                  {displayName}
                </span>
              </div>
            )}
          </div>
          {/* Nav items */}
          {["Dashboard", "Courses", "Practice", "Contests"].map((label, i) => (
            <div key={label} style={{
              padding: "8px 14px", display: "flex", alignItems: "center", gap: 8,
              background: i === 0 ? "rgba(99,102,241,0.1)" : "transparent", fontSize: 12,
              color: i === 0 ? "var(--accent-primary, #6366f1)" : "var(--text-muted)",
              fontWeight: i === 0 ? 600 : 400,
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: i === 0 ? "var(--accent-primary, #6366f1)" : "var(--border-primary)" }} />
              {label}
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, background: "var(--bg-primary)", padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
              DASHBOARD — {displayName.toUpperCase()}
            </div>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent-primary, #6366f1)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: 52, borderRadius: 8, background: "var(--bg-card)",
                border: "1px solid var(--border-primary)"
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function BrandingSettingsPage() {
  const { user, token } = useAuth();
  const { updateBranding } = useBranding();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [customName, setCustomName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);
  const [savedBranding, setSavedBranding] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    try {
      const headers = buildAuthHeaders(token, user);
      const res = await fetch(`${API_BASE}/api/institutes/branding`, { headers });
      const data = await res.json();
      if (data.success && data.branding) {
        setSavedBranding(data.branding);
        setCustomName(data.branding.customName || "");
        setLogoPreviewUrl(data.branding.logoUrl ? `${API_BASE}${data.branding.logoUrl}` : "");
        setFaviconPreviewUrl(data.branding.faviconUrl ? `${API_BASE}${data.branding.faviconUrl}` : "");
      }
    } catch {
      showToast("Failed to load branding settings.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, user]); // eslint-disable-line

  useEffect(() => {
    if (user) fetchBranding();
  }, [user, fetchBranding]);

  const handleLogoSelect = (file) => { setLogoFile(file); setLogoPreviewUrl(URL.createObjectURL(file)); setRemoveLogo(false); };
  const handleFaviconSelect = (file) => { setFaviconFile(file); setFaviconPreviewUrl(URL.createObjectURL(file)); setRemoveFavicon(false); };
  const handleRemoveLogo = () => { setLogoFile(null); setLogoPreviewUrl(""); setRemoveLogo(true); };
  const handleRemoveFavicon = () => { setFaviconFile(null); setFaviconPreviewUrl(""); setRemoveFavicon(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("customName", customName.trim());
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);
      if (removeLogo) formData.append("removeLogo", "true");
      if (removeFavicon) formData.append("removeFavicon", "true");

      const authHeaders = {};
      if (token && !token.startsWith("demo-") && !token.startsWith("local-")) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      } else {
        authHeaders["x-bypass-auth"] = "true";
        authHeaders["x-bypass-role"] = user?.role || "INSTITUTE_ADMIN";
        if (user?.id) authHeaders["x-bypass-userid"] = String(user.id);
      }

      const res = await fetch(`${API_BASE}/api/institutes/branding`, {
        method: "PATCH",
        headers: authHeaders,
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setSavedBranding(data.branding);
        updateBranding({
          customName: data.branding.customName || null,
          logoUrl: data.branding.logoUrl || null,
          faviconUrl: data.branding.faviconUrl || null,
          instituteName: data.branding.instituteName,
        });
        setLogoPreviewUrl(data.branding.logoUrl ? `${API_BASE}${data.branding.logoUrl}` : "");
        setFaviconPreviewUrl(data.branding.faviconUrl ? `${API_BASE}${data.branding.faviconUrl}` : "");
        setLogoFile(null); setFaviconFile(null);
        setRemoveLogo(false); setRemoveFavicon(false);
        showToast("✅ Branding saved! Visible to all members of your institute.");
      } else {
        showToast(data.message || "Failed to save branding.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCustomName(savedBranding?.customName || "");
    setLogoFile(null); setFaviconFile(null);
    setLogoPreviewUrl(savedBranding?.logoUrl ? `${API_BASE}${savedBranding.logoUrl}` : "");
    setFaviconPreviewUrl(savedBranding?.faviconUrl ? `${API_BASE}${savedBranding.faviconUrl}` : "");
    setRemoveLogo(false); setRemoveFavicon(false);
  };

  if (user && user.role !== "INSTITUTE_ADMIN") {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        This page is only accessible to Institute Administrators.
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", color: "var(--text-primary)", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .branding-spin { animation: spin 1s linear infinite; }
      `}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            borderRadius: 14, padding: 12, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)"
          }}>
            <Palette size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Institute Branding</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Set a custom portal name, logo, and favicon — visible to all your students, mentors, and staff
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
            <Loader2 size={36} className="branding-spin" style={{ color: "var(--accent-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
            {/* Left column — Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Info banner */}
              <div style={{
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)",
                borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
                fontSize: 13, color: "#a5b4fc"
              }}>
                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Changes apply instantly — all institute members will see the new name, logo, and favicon without refreshing.</span>
              </div>

              {/* Portal name card */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe size={17} style={{ color: "#818cf8" }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Portal Name</h2>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                    Custom site name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={savedBranding?.instituteName || "e.g. ABC Institute of Technology"}
                    maxLength={80}
                    style={{
                      width: "100%", background: "var(--bg-secondary)", border: "1.5px solid var(--border-primary)",
                      borderRadius: 10, padding: "11px 14px", color: "inherit", fontSize: 14,
                      fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent-primary, #6366f1)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
                  />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    Shown in the browser tab and throughout the portal. Leave blank to use "{savedBranding?.instituteName || "Eduvantix"}".
                  </p>
                </div>
              </div>

              {/* Logo card */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon size={17} style={{ color: "#818cf8" }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Logo</h2>
                </div>
                <ImageDropZone
                  label="Site Logo"
                  hint="Appears in sidebar and mobile header. Use a horizontal logo with transparent background (PNG/SVG recommended)."
                  accept="image/*"
                  previewUrl={logoPreviewUrl}
                  onFileSelect={handleLogoSelect}
                  onRemove={handleRemoveLogo}
                />
              </div>

              {/* Favicon card */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Eye size={17} style={{ color: "#818cf8" }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Favicon</h2>
                </div>
                <ImageDropZone
                  label="Favicon"
                  hint="Shown in the browser tab. Use a square image (32×32 or 64×64px), PNG or ICO format."
                  accept="image/*"
                  previewUrl={faviconPreviewUrl}
                  onFileSelect={handleFaviconSelect}
                  onRemove={handleRemoveFavicon}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", borderRadius: 12, padding: "13px 24px",
                    color: "white", fontWeight: 700, fontSize: 14,
                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: saving ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(99,102,241,0.5)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)"; }}
                >
                  {saving
                    ? <><Loader2 size={16} className="branding-spin" /> Saving…</>
                    : <><Save size={16} /> Save Branding</>}
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
                    borderRadius: 12, padding: "13px 18px", color: "var(--text-secondary)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            {/* Right column — Preview + Tips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Live Preview
              </div>
              <LivePreview customName={customName} logoPreviewUrl={logoPreviewUrl} />

              {/* Tips */}
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                borderRadius: 14, padding: 18
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                  Tips for best results
                </div>
                {[
                  "Use a horizontal logo with transparent background (PNG or SVG)",
                  "Favicon should be square — PNG or ICO format works best",
                  "Keep the portal name short (under 30 chars) for sidebar fit",
                  "Logo images are served from your backend server",
                  "All branding is scoped only to your institute",
                ].map((tip, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 8,
                    alignItems: "flex-start", marginBottom: 8
                  }}>
                    <span style={{ color: "var(--accent-primary, #6366f1)", flexShrink: 0, fontWeight: 700 }}>•</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
