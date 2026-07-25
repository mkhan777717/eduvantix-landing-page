"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { getApiBase } from "@/utils/api";
import { getSocket } from "@/utils/socket";
import { AlertTriangle } from "lucide-react";

const AuthContext = createContext(null);

const API_BASE = getApiBase();

// ---------------------------------------------------------------------------
// Helper: format Zod/backend errors into a readable string
// ---------------------------------------------------------------------------
function formatBackendError(data) {
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(e => `• ${e.field ? e.field + ": " : ""}${e.message}`).join("\n");
  }
  return data.message || "An error occurred.";
}

// ---------------------------------------------------------------------------
// Local account store — used when the DB is unreachable
// Accounts are stored in localStorage under "eduvantix_local_accounts"
// ---------------------------------------------------------------------------
function getLocalAccounts() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("eduvantix_local_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveLocalAccount(email, password, user) {
  const accounts = getLocalAccounts();
  // Remove any existing account with same email
  const filtered = accounts.filter(a => a.email !== email);
  filtered.push({ email, password, user });
  localStorage.setItem("eduvantix_local_accounts", JSON.stringify(filtered));
}

function findLocalAccount(email, password) {
  const accounts = getLocalAccounts();
  return accounts.find(a => a.email === email && a.password === password) || null;
}

// ---------------------------------------------------------------------------
// Legacy session keys (used by other pages to detect role)
// ---------------------------------------------------------------------------
function setLegacySession(user) {
  if (typeof window === "undefined") return;
  localStorage.removeItem("synapse_admin_session");
  localStorage.removeItem("synapse_student_session");
  localStorage.removeItem("synapse_mentor_session");
  if (!user) return;

  const role = user.role;
  const email = user.email || "";
  const emailLower = email.toLowerCase();

  if (role === "ADMIN" || role === "INSTITUTE_ADMIN" || role === "BATCH_MANAGER") {
    localStorage.setItem("synapse_admin_session", "true");
  } else if (role === "MENTOR") {
    localStorage.setItem("synapse_mentor_session", "true");
  } else {
    localStorage.setItem("synapse_student_session", "true");
  }
}

function clearLegacySessions() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("synapse_admin_session");
  localStorage.removeItem("synapse_student_session");
  localStorage.removeItem("synapse_mentor_session");
}

// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [isInstituteBlocked, setIsInstituteBlocked] = useState(false);
  const [sessionConflict, setSessionConflict] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const logout = () => {
    setUser(null);
    setToken(null);
    clearLegacySessions();
    localStorage.removeItem("eduvantix_auth_token");
    localStorage.removeItem("eduvantix_auth_user");
    // Note: eduvantix_local_accounts is intentionally kept so users can log back in
  };

  // Sync WebSocket for single-session tracking
  useEffect(() => {
    if (!token || !user?.id || token.startsWith("demo-token-") || token.startsWith("local-token-")) {
      return;
    }
    const socket = getSocket();
    if (socket) {
      const storedUser = localStorage.getItem("eduvantix_auth_user");
      let mySessionId = "";
      try {
        mySessionId = JSON.parse(storedUser)?.sessionId;
      } catch { }

      socket.emit("joinUser", { userId: user.id, sessionId: mySessionId });

      socket.on("newSessionLoggedIn", (data) => {
        if (data.newSessionId && mySessionId && data.newSessionId !== mySessionId) {
          setSessionConflict(true);
          setCountdown(3);
        }
      });

      return () => {
        socket.off("newSessionLoggedIn");
        socket.emit("leaveUser", user.id);
      };
    }
  }, [token, user]);

  // Countdown timer for automatic logout
  useEffect(() => {
    if (!sessionConflict) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          logout();
          setSessionConflict(false);
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionConflict]);

  // Sync / check active session for host
  useEffect(() => {
    async function checkActiveSession() {
      if (!token || !user) {
        setActiveSession(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/livekit/session/active`);
        const data = await res.json();
        if (data.success && data.session && data.session.hostId === user?.id) {
          setActiveSession(data.session);
        } else {
          setActiveSession(null);
        }
      } catch (e) {
        console.error("AuthContext: failed to check active session:", e);
      }
    }
    checkActiveSession();
  }, [token, user]);

  // On mount: restore session from localStorage
  useEffect(() => {
    async function loadStoredAuth() {
      if (typeof window === "undefined") { setLoading(false); return; }

      const storedToken = localStorage.getItem("eduvantix_auth_token");
      const storedUser = localStorage.getItem("eduvantix_auth_user");

      if (storedToken && storedUser) {
        // Only verify with the real backend if this is a real JWT (not demo/local)
        if (!storedToken.startsWith("demo-token-") && !storedToken.startsWith("local-token-")) {
          try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
              headers: { Authorization: `Bearer ${storedToken}` },
              signal: AbortSignal.timeout(30000),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                setUser(data.user);
                localStorage.setItem("eduvantix_auth_user", JSON.stringify(data.user));
                setToken(storedToken);
                setLegacySession(data.user);
                setLoading(false);
                return;
              }
            } else if (res.status === 401) {
              const data = await res.json();
              if (data.code === 'SESSION_EXPIRED') {
                setSessionConflict(true);
                setLoading(false);
                return;
              }
            }
          } catch {
            // DB/backend offline — fall through and restore from storage
          }
        }

        // Restore from stored user object (works for demo + local + offline)
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setLegacySession(parsedUser);
        } catch {
          localStorage.removeItem("eduvantix_auth_token");
          localStorage.removeItem("eduvantix_auth_user");
        }
      }

      setLoading(false);
    }
    loadStoredAuth();
  }, []);

  // ---------------------------------------------------------------------------
  const login = async (email, password) => {
    //1. Try real backend
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLegacySession(data.user);
        setIsInstituteBlocked(false);
        localStorage.setItem("eduvantix_auth_token", data.token);
        localStorage.setItem("eduvantix_auth_user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      }

      // If it's a 4xx (bad credentials, wrong password, etc.) — report immediately
      if (res.status >= 400 && res.status < 500) {
        if (data.code === 'INSTITUTE_BLOCKED') {
          setIsInstituteBlocked(true);
          return { success: false, message: 'Your institute has been blocked. Please contact the Super Administrator.', blocked: true };
        }
        return { success: false, message: formatBackendError(data) };
      }
      // 5xx / 503 → DB down, fall through to offline checks
    } catch {
      // Network timeout — fall through
    }

    // 2. Check locally registered accounts (offline registrations)
    const localAccount = findLocalAccount(email, password);
    if (localAccount) {
      const localToken = `local-token-${Date.now()}`;
      setToken(localToken);
      setUser(localAccount.user);
      setLegacySession(localAccount.user);
      localStorage.setItem("eduvantix_auth_token", localToken);
      localStorage.setItem("eduvantix_auth_user", JSON.stringify(localAccount.user));
      return { success: true, user: localAccount.user };
    }

    return {
      success: false,
      message: process.env.NODE_ENV === "development"
        ? "Invalid credentials.\n\nIf you registered while the database was offline, your account exists locally — try logging in again with the same email and password you used.\n\nOr use a demo account:\n• admin@demo.com / demo123\n• student@demo.com / demo123"
        : "Invalid email or password. Please try again."
    };
  };

  const sendRegistrationOtp = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || formatBackendError(data) };
    } catch (e) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  };

  const verifyRegistrationOtp = async (email, otp) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || formatBackendError(data) };
    } catch (e) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  };

  // ---------------------------------------------------------------------------
  const register = async (username, email, password, role = "USER", referralCode = "", otp = "") => {
    // 1. Try real backend
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role, referralCode, otp }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLegacySession(data.user);
        localStorage.setItem("eduvantix_auth_token", data.token);
        localStorage.setItem("eduvantix_auth_user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      }

      // 4xx — validation or duplicate error, report immediately
      if (res.status >= 400 && res.status < 500) {
        return { success: false, message: formatBackendError(data) };
      }
      // 5xx / 503 → DB down, fall through to offline registration
    } catch {
      // Network/timeout — fall through to offline
    }

    // 2. Offline registration — save locally so login works later
    // Check if email is already taken locally
    const existing = findLocalAccount(email, password) ||
      getLocalAccounts().find(a => a.email === email);
    if (existing) {
      return { success: false, message: "An account with this email already exists locally." };
    }

    const newUser = { id: `local-${Date.now()}`, username, email, role };
    saveLocalAccount(email, password, newUser); // Save for future logins

    const localToken = `local-token-${Date.now()}`;
    setToken(localToken);
    setUser(newUser);
    setLegacySession(newUser);
    localStorage.setItem("eduvantix_auth_token", localToken);
    localStorage.setItem("eduvantix_auth_user", JSON.stringify(newUser));
    return { success: true, offlineMode: true, user: newUser };
  };

  // ---------------------------------------------------------------------------

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      return { success: res.ok && data.success, message: data.message || formatBackendError(data) };
    } catch (e) {
      return { success: false, message: "Network error occurred." };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      return { success: res.ok && data.success, message: data.message || formatBackendError(data) };
    } catch (e) {
      return { success: false, message: "Network error occurred." };
    }
  };

  // ---------------------------------------------------------------------------
  const loginWithGoogle = async (credentialOrTokenObj) => {
    try {
      // Support both ID token (credential string) and access_token object (useGoogleLogin implicit flow)
      const isAccessToken = typeof credentialOrTokenObj === 'object' && credentialOrTokenObj?.access_token;
      const body = isAccessToken
        ? { access_token: credentialOrTokenObj.access_token }
        : { credential: credentialOrTokenObj };

      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        setLegacySession(data.user);
        setIsInstituteBlocked(false);
        localStorage.setItem("eduvantix_auth_token", data.token);
        localStorage.setItem("eduvantix_auth_user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      }

      if (data.code === 'INSTITUTE_BLOCKED') {
        setIsInstituteBlocked(true);
        return { success: false, message: 'Your institute has been blocked. Please contact the Super Administrator.', blocked: true };
      }
      return { success: false, message: data.message || "Google Login failed." };
    } catch (e) {
      return { success: false, message: "Network error occurred." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, sendRegistrationOtp, verifyRegistrationOtp, logout, API_BASE, activeSession, setActiveSession, isInstituteBlocked, setIsInstituteBlocked, forgotPassword, resetPassword, loginWithGoogle }}>
      {children}

      {/* Cross-Device Single Session Countdown Overlay */}
      {sessionConflict && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 font-sans select-none pointer-events-auto">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-primary)] border-rose-500/20 bg-[var(--bg-card)]/90 p-8 text-center space-y-6 shadow-2xl shadow-rose-950/20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-black tracking-tight text-white uppercase">
                Session Terminated
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                This account was logged in from another device or browser tab.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Logging out in</span>
                <span className="inline-flex w-7 h-7 rounded-lg bg-rose-500 text-white font-extrabold text-xs items-center justify-center animate-ping absolute opacity-20"></span>
                <span className="inline-flex w-7 h-7 rounded-lg bg-rose-500 text-white font-extrabold text-xs items-center justify-center relative">
                  {countdown}
                </span>
                <span className="text-xs font-semibold text-slate-400">seconds...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
