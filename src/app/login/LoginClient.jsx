"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, ShieldAlert, ArrowRight, RefreshCw, AlertCircle,
  Sparkles, Eye, EyeOff, Ban, Award, CheckCircle2, KeyRound,
  Code2, Brain, Briefcase, Building2, Check, ArrowLeft
} from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Turnstile } from "@marsidev/react-turnstile";
import useThemeStore from "@/store/useThemeStore";
import { getApiBase } from "@/utils/api";

function getFreeCoursePath(redirectTo) {
  if (typeof redirectTo === "string" && /^\/free-course(\/|$)/.test(redirectTo)) {
    return redirectTo;
  }
  return null;
}

function GoogleLoginButton({ onSuccess, onError, loading }) {
  const googleLogin = useGoogleLogin({
    onSuccess,
    onError,
    flow: "implicit",
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 hover:bg-[var(--bg-hover)] shadow-xs"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        color: "var(--text-primary)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

function GoogleLoginSection({ onSuccess, onError, loading, setErrorMsg }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <button
        type="button"
        onClick={() => setErrorMsg("Google Sign-In is not configured.")}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 opacity-80 hover:opacity-100 shadow-xs"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="w-full space-y-2">
        <GoogleLoginButton onSuccess={onSuccess} onError={onError} loading={loading} />
      </div>
    </GoogleOAuthProvider>
  );
}

function LoginForm() {
  const { login, register, sendRegistrationOtp, verifyRegistrationOtp, user, logout, forgotPassword, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [freeCoursePath, setFreeCoursePath] = useState(null);
  const [isRegistering, setIsRegistering] = useState(() => searchParams.get("signup") === "1");

  useEffect(() => {
    setFreeCoursePath(getFreeCoursePath(redirectTo));
  }, [redirectTo]);

  const [isForgot, setIsForgot] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralStatus, setReferralStatus] = useState(null);
  const [referralMessage, setReferralMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Captcha token
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const isMismatched = searchParams.get("mismatched") === "true";

  const verifyReferralCode = async (code) => {
    if (!code || !code.trim()) {
      setReferralStatus(null);
      setReferralMessage("");
      return;
    }
    setReferralStatus("checking");
    try {
      const res = await fetch(`${getApiBase()}/api/auth/validate-referral?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setReferralStatus("valid");
        setReferralMessage(data.message || "Valid code");
      } else {
        setReferralStatus("invalid");
        setReferralMessage(data.message || "Invalid or inactive referral code");
      }
    } catch {
      setReferralStatus("invalid");
      setReferralMessage("Could not verify referral code");
    }
  };

  const handleSendOtp = async () => {
    if (!email || !email.trim()) {
      setErrorMsg("Please enter your email address to receive an OTP.");
      return;
    }
    setErrorMsg("");
    setOtpSending(true);
    setOtpSuccessMsg("");
    try {
      const res = await sendRegistrationOtp(email.trim().toLowerCase());
      if (res.success) {
        setOtpSent(true);
        setResendTimer(60);
        setOtpSuccessMsg("Verification code sent! Check your inbox.");
      } else {
        setErrorMsg(res.message || "Failed to send OTP. Please try again.");
      }
    } catch {
      setErrorMsg("Error communicating with OTP service.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP.");
      return;
    }
    setErrorMsg("");
    setOtpVerifying(true);
    try {
      const res = await verifyRegistrationOtp(email.trim().toLowerCase(), otp);
      if (res.success) {
        setIsOtpVerified(true);
        setOtpSuccessMsg("Email verified successfully!");
      } else {
        setErrorMsg(res.message || "Invalid verification code.");
      }
    } catch {
      setErrorMsg("Error verifying OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await loginWithGoogle(tokenResponse.access_token, referralCode.trim() || undefined);
      if (result.success) {
        let targetRoute;
        if (freeCoursePath) {
          targetRoute = freeCoursePath;
        } else if (redirectTo === "/") {
          const emailLower = (result.user?.email || "").toLowerCase();
          const isUserAdmin = result.user?.role === "ADMIN" || result.user?.role === "INSTITUTE_ADMIN" || result.user?.role === "BATCH_MANAGER" || emailLower.includes("admin");
          const isUserMentor = result.user?.role === "MENTOR" || emailLower.includes("mentor");
          if (isUserAdmin) targetRoute = "/admin/dashboard";
          else if (isUserMentor) targetRoute = "/mentor/dashboard";
          else targetRoute = "/student/dashboard";
        } else {
          targetRoute = redirectTo;
        }
        router.replace(targetRoute);
      } else {
        setErrorMsg(result.message || "Google sign-in failed.");
      }
    } catch {
      setErrorMsg("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (isForgot) {
      if (!email) {
        setErrorMsg("Please enter your email.");
        setLoading(false);
        return;
      }
      try {
        const result = await forgotPassword(email);
        if (result.success) setForgotSuccess(true);
        else setErrorMsg(result.message || "Failed to send reset link.");
      } catch {
        setErrorMsg("Unable to connect to the authentication server.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (isRegistering && !username) {
      setErrorMsg("Username is required.");
      setLoading(false);
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (isRegistering && !isOtpVerified) {
      setErrorMsg("Please verify your email OTP before registering.");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegistering) {
        result = await register(username, email, password, "USER", referralCode, otp, captchaToken);
      } else {
        result = await login(email, password, captchaToken);
      }

      if (result.success) {
        let targetRoute;
        if (freeCoursePath) {
          targetRoute = freeCoursePath;
        } else if (redirectTo === "/") {
          const emailLower = (result.user?.email || "").toLowerCase();
          const isUserAdmin = result.user?.role === "ADMIN" || result.user?.role === "INSTITUTE_ADMIN" || result.user?.role === "BATCH_MANAGER" || emailLower.includes("admin");
          const isUserMentor = result.user?.role === "MENTOR" || emailLower.includes("mentor");
          if (isUserAdmin) targetRoute = "/admin/dashboard";
          else if (isUserMentor) targetRoute = "/mentor/dashboard";
          else targetRoute = "/student/dashboard";
        } else {
          targetRoute = redirectTo;
        }

        if (result.offlineMode) {
          setErrorMsg("⚠️ Backend offline. Account cached locally.");
          setTimeout(() => router.replace(targetRoute), 2000);
        } else {
          router.replace(targetRoute);
        }
      } else if (result.blocked) {
        setIsBlocked(true);
      } else {
        setErrorMsg(result.message || "Invalid email or password.");
      }
    } catch {
      setErrorMsg("Unable to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Role mismatch screen ─── */
  if (user && isMismatched) {
    const isUserAdmin = user.role === "ADMIN" || user.role === "INSTITUTE_ADMIN" || user.role === "BATCH_MANAGER";
    const isUserMentor = user.role === "MENTOR";
    const userRoleLabel = isUserMentor ? "Mentor" : isUserAdmin ? "Administrator" : "Student";
    const getDashboardPath = () => {
      if (isUserAdmin) return "/admin/dashboard";
      if (isUserMentor) return "/mentor/dashboard";
      return "/student/dashboard";
    };

    return (
      <div className="p-8 rounded-3xl border shadow-xl space-y-6 text-center w-full max-w-md" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mx-auto" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>Role Mismatch</h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Signed in as <strong style={{ color: "var(--text-primary)" }}>{user.username}</strong> ({userRoleLabel}).
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <button onClick={() => router.push(getDashboardPath())} className="w-full py-3 rounded-xl font-bold text-xs text-white transition-all cursor-pointer shadow-md" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            Go to {userRoleLabel} Dashboard
          </button>
          <button onClick={() => logout()} className="w-full py-3 rounded-xl font-bold text-xs transition-all border cursor-pointer hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            Sign Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  /* ─── Account Blocked ─── */
  if (isBlocked) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center space-y-4 w-full max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <Ban size={28} />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-rose-500">Access Restricted</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {errorMsg || "Your account has been restricted by an administrator."}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <a href="mailto:hello@eduvantix.com" className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all shadow-sm">
            Contact Support (hello@eduvantix.com)
          </a>
          <button onClick={() => { setIsBlocked(false); setErrorMsg(""); router.push("/"); }} className="px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:bg-[var(--bg-hover)]" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>

        {/* Toggle Pill (Sign In / Register) */}
        {!isForgot && (
          <div className="flex p-1 rounded-2xl border mb-2" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)" }}>
            <button
              type="button"
              onClick={() => { setErrorMsg(""); setIsRegistering(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${!isRegistering ? "bg-emerald-500 text-white shadow-sm" : "hover:text-[var(--text-primary)]"
                }`}
              style={!isRegistering ? { backgroundColor: "#10b981", color: "#FFFFFF" } : { color: "var(--text-muted)" }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setErrorMsg(""); setIsRegistering(true); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isRegistering ? "bg-emerald-500 text-white shadow-sm" : "hover:text-[var(--text-primary)]"
                }`}
              style={isRegistering ? { backgroundColor: "#10b981", color: "#FFFFFF" } : { color: "var(--text-muted)" }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Header Titles */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
            {isForgot ? "Reset Password" : isRegistering ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {isForgot
              ? "Enter your email to receive a secure password reset link."
              : isRegistering
                ? "Start your AI-guided journey from learning to hired."
                : "Enter your credentials to access your personal dashboard."}
          </p>
        </div>

        {/* Google Single-Sign-On */}
        {!isForgot && (
          <div className="space-y-4">
            <GoogleLoginSection onSuccess={handleGoogleSuccess} onError={() => setErrorMsg("Google Login failed.")} loading={loading} setErrorMsg={setErrorMsg} />
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t" style={{ borderColor: "var(--border-primary)" }} />
              <span className="relative px-3 text-[10px] uppercase font-bold tracking-wider shrink-0" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
                or with email
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className={`flex items-start gap-2 p-3.5 rounded-xl border text-xs font-medium ${errorMsg.startsWith("⚠️") ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot Success State */}
        {isForgot && forgotSuccess ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              A reset link has been dispatched to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>. Please check your inbox.
            </p>
            <button type="button" onClick={() => { setIsForgot(false); setForgotSuccess(false); setErrorMsg(""); }}
              className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              Back to Sign In
            </button>
          </div>
        ) : isForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email Address" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} placeholder="name@domain.com" required />
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>Send Reset Link</span>}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => { setIsForgot(false); setErrorMsg(""); }} className="text-xs font-bold hover:underline" style={{ color: "#10b981" }}>
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration specific fields */}
            <AnimatePresence mode="popLayout">
              {isRegistering && (
                <motion.div key="regFields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <InputField label="Full Name / Username" type="text" value={username} onChange={setUsername} icon={<User size={14} />} placeholder="e.g. Alex Chen" required />

                  {/* Referral Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                      Referral Code (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Award size={14} /></span>
                      <input
                        type="text"
                        placeholder="REFERRAL CODE"
                        value={referralCode}
                        onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus(null); }}
                        onBlur={(e) => verifyReferralCode(e.target.value)}
                        className="w-full rounded-xl py-2.5 pl-9 pr-10 text-xs font-mono outline-none border transition-all"
                        style={{
                          backgroundColor: "var(--bg-input)",
                          borderColor: referralStatus === "invalid" ? "#f43f5e" : referralStatus === "valid" ? "#10b981" : "var(--border-primary)",
                          color: "var(--text-primary)",
                        }}
                      />
                      {referralStatus === "checking" && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"><RefreshCw className="animate-spin" size={13} /></span>}
                      {referralStatus === "valid" && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle2 size={14} /></span>}
                    </div>
                    {referralStatus === "invalid" && <p className="text-[10px] text-rose-500 font-medium">{referralMessage}</p>}
                    {referralStatus === "valid" && <p className="text-[10px] text-emerald-500 font-medium">✓ {referralMessage}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <InputField label="Email Address" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} placeholder="name@domain.com" required />

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password</label>
                {!isRegistering && (
                  <button type="button" onClick={() => { setIsForgot(true); setErrorMsg(""); }} className="text-[10px] font-bold hover:underline" style={{ color: "#10b981" }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Lock size={14} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none border transition-all"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  required
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register Only) */}
            <AnimatePresence mode="popLayout">
              {isRegistering && (
                <motion.div key="confirmPw" className="space-y-1.5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Lock size={14} /></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none border transition-all"
                      style={{
                        backgroundColor: "var(--bg-input)",
                        borderColor: confirmPassword && confirmPassword !== password ? "#f43f5e" : "var(--border-primary)",
                        color: "var(--text-primary)",
                      }}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--text-muted)" }}>
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && <p className="text-[10px] text-rose-500 font-medium">Passwords do not match</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email OTP Verification (Register Only) */}
            {isRegistering && (
              <motion.div key="otpField" className="space-y-1.5 pt-1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                    Email Verification Code *
                  </label>
                  {otpSent && !isOtpVerified && (
                    <button type="button" onClick={handleSendOtp} disabled={resendTimer > 0 || otpSending} className="text-[10px] font-bold text-emerald-500 hover:underline disabled:opacity-50 cursor-pointer">
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : otpSending ? "Sending..." : "Resend Code"}
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                    <KeyRound size={14} />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    disabled={isOtpVerified}
                    placeholder={isOtpVerified ? "✓ Verified" : "Enter 6-digit OTP"}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl py-2.5 pl-9 pr-28 text-xs font-mono tracking-wider outline-none border transition-all"
                    style={{
                      backgroundColor: isOtpVerified ? "rgba(16,185,129,0.06)" : "var(--bg-input)",
                      borderColor: isOtpVerified ? "rgba(16,185,129,0.4)" : "var(--border-primary)",
                      color: isOtpVerified ? "#10b981" : "var(--text-primary)",
                    }}
                    required={otpSent}
                  />
                  {isOtpVerified ? (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : !otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !email}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                    >
                      {otpSending ? "Sending..." : "Get OTP"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otp.length !== 6}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                    >
                      {otpVerifying ? "Verifying..." : "Verify OTP"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cloudflare Turnstile */}
            {!isForgot && (
              <div className="flex justify-center my-3 overflow-hidden rounded-xl">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAD9bxs6BjH3k3YlU"}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken("")}
                  onError={() => setCaptchaToken("")}
                  options={{ theme: "dark" }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (isRegistering && !isOtpVerified) || (isRegistering && referralStatus === "invalid") || (isRegistering && confirmPassword && confirmPassword !== password)}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 6px 24px rgba(16,185,129,0.25)" }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? "Create Free Student Account" : "Sign In to Eduvantix"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Legal note */}
        <p className="text-center text-[10px] leading-relaxed pt-2" style={{ color: "var(--text-muted)" }}>
          By continuing, you agree to our{" "}
          <a href="/terms-of-service" className="underline hover:text-[var(--text-primary)]">Terms of Service</a> and{" "}
          <a href="/privacy-policy" className="underline hover:text-[var(--text-primary)]">Privacy Policy</a>.
        </p>
      </div>
    </motion.div>
  );
}

function InputField({ label, type, value, onChange, icon, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none border transition-all"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Background glow elements */}
      <div
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", filter: "blur(100px)" }}
      />
      <div
        className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* ─── LEFT PANEL (Editorial & Product Showcase) ─── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] min-h-screen p-12 xl:p-16 border-r relative z-10 overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}
      >
        {/* Brand Top */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
              alt="Eduvantix Logo"
              className="h-9 w-auto"
            />
          </Link>

          <div className="pt-8 space-y-4 max-w-lg">
            <span className="text-xs font-semibold tracking-widest uppercase block" style={{ color: "#10b981" }}>
              AI Career Platform
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)", lineHeight: 1.15 }}>
              From learning code to getting hired.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Join thousands of engineers mastering full-stack architecture, participating in live contests, and connecting directly to verified hiring employers.
            </p>
          </div>

          {/* 4 Feature Highlights */}
          <div className="pt-6 space-y-3.5 max-w-md">
            {[
              { icon: Code2, title: "Interactive Cloud Sandboxes", desc: "Write, test, and debug code in-browser with automated test runners." },
              { icon: Brain, title: "AI-Guided Assessments & Viva", desc: "Validate conceptual mastery with anti-cheat oral technical benchmarks." },
              { icon: Briefcase, title: "Placement-Ready Portfolio", desc: "Live GitHub portfolio links & ATS-ready resumes created automatically." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3.5 p-3.5 rounded-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{f.title}</h2>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Social Proof / Trust Badge */}
        <div className="pt-8 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>eduvantix</span>
          </div>
          <span>v1.0</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL (Interactive Form) ─── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen px-6 py-10 sm:px-12 relative z-10">
        {/* Top bar with back to home & mobile logo */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--text-primary)] transition-colors" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={14} />
            <span>Home</span>
          </Link>
          <div className="lg:hidden">
            <img src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"} alt="Eduvantix" className="h-7 w-auto" />
          </div>
        </div>

        {/* Main Form Center */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <Suspense fallback={<div className="flex items-center justify-center p-12"><RefreshCw className="animate-spin text-emerald-500" size={24} /></div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom Banner: Eduvantix for Institutions */}
        <div className="w-full max-w-md mx-auto pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
          <div className="p-4 rounded-2xl border flex items-center justify-between gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">For Institutions</span>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Representing a university or college?</p>
            </div>
            <Link
              href="/institutes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shrink-0 hover:opacity-90 shadow-sm"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <Building2 size={13} />
              <span>Partner</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
