"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase, buildAuthHeaders } from "@/utils/api";

const ProContext = createContext(null);

const API_BASE = getApiBase();

export function ProProvider({ children }) {
  const { user, token, updateUser } = useAuth();

  // ─── Derived Pro status ────────────────────────────────────────────────────
  const isPro = useCallback(() => {
    if (!user?.premiumUntil) return false;
    return new Date(user.premiumUntil) > new Date();
  }, [user]);

  // ─── Mode state ───────────────────────────────────────────────────────────
  // Default from user object (persisted in DB), fallback to localStorage
  const [mode, setModeState] = useState("LEARNING");
  const [proProfile, setProProfile] = useState(null);
  const [proStatus, setProStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Initialise mode from user object once loaded
  useEffect(() => {
    if (user?.preferredMode) {
      setModeState(user.preferredMode);
    } else {
      // Fallback: read from localStorage for immediate hydration
      try {
        const stored = localStorage.getItem("eduvantix_mode");
        if (stored === "CAREER" || stored === "LEARNING") {
          setModeState(stored);
        }
      } catch { /* ignore */ }
    }
  }, [user?.preferredMode]);

  // ─── Fetch Pro status from backend ────────────────────────────────────────
  const fetchProStatus = useCallback(async () => {
    if (!user) return;
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/api/pro/status`, {
        headers: buildAuthHeaders(token, user),
      });
      const data = await res.json();
      if (data.success) {
        setProStatus(data);
        // Sync mode from server
        if (data.mode && data.mode !== mode) {
          setModeState(data.mode);
        }
      }
    } catch {
      // Silently fail — Pro status is non-critical
    } finally {
      setLoadingStatus(false);
    }
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) fetchProStatus();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch career profile ─────────────────────────────────────────────────
  const fetchProProfile = useCallback(async () => {
    if (!user || !isPro()) return;
    try {
      const res = await fetch(`${API_BASE}/api/pro/profile`, {
        headers: buildAuthHeaders(token, user),
      });
      const data = await res.json();
      if (data.success) setProProfile(data.profile);
    } catch { /* ignore */ }
  }, [user, token, isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPro()) fetchProProfile();
  }, [user?.id, isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Mode switching ───────────────────────────────────────────────────────
  /**
   * Switch between LEARNING and CAREER mode.
   * Persists to backend and localStorage.
   * Free users cannot switch to CAREER mode.
   */
  const setMode = useCallback(async (newMode) => {
    if (!["LEARNING", "CAREER"].includes(newMode)) return;
    if (newMode === "CAREER" && !isPro()) {
      // Redirect to upgrade page — caller should handle
      return { error: "PRO_REQUIRED" };
    }

    // Optimistic update
    setModeState(newMode);
    try {
      localStorage.setItem("eduvantix_mode", newMode);
    } catch { /* ignore */ }

    // Update user object locally so DashboardLayout re-renders immediately
    updateUser({ preferredMode: newMode });

    // Persist to backend
    try {
      await fetch(`${API_BASE}/api/pro/preferences`, {
        method: "PATCH",
        headers: buildAuthHeaders(token, user),
        body: JSON.stringify({ mode: newMode }),
      });
    } catch { /* Silently fail — local state already updated */ }

    return { success: true };
  }, [isPro, token, user, updateUser]);

  const toggleMode = useCallback(async () => {
    const newMode = mode === "CAREER" ? "LEARNING" : "CAREER";
    return setMode(newMode);
  }, [mode, setMode]);

  // ─── Profile CRUD helpers ─────────────────────────────────────────────────
  const saveProProfile = useCallback(async (profileData) => {
    try {
      const method = proProfile ? "PATCH" : "POST";
      const res = await fetch(`${API_BASE}/api/pro/profile`, {
        method,
        headers: buildAuthHeaders(token, user),
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        setProProfile(data.profile);
        return { success: true, profile: data.profile };
      }
      return { success: false, message: data.message };
    } catch {
      return { success: false, message: "Network error." };
    }
  }, [proProfile, token, user]);

  const value = {
    isPro: isPro(),
    mode,
    setMode,
    toggleMode,
    proProfile,
    proStatus,
    loadingStatus,
    fetchProStatus,
    fetchProProfile,
    saveProProfile,
  };

  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro() {
  const context = useContext(ProContext);
  if (!context) {
    throw new Error("usePro must be used within a ProProvider");
  }
  return context;
}
