"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ShieldAlert, ArrowRight, RefreshCw, AlertCircle, GraduationCap, Sparkles, Eye, EyeOff, Ban, Award, CheckCircle2, KeyRound } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Turnstile } from "@marsidev/react-turnstile";
import useThemeStore from "@/store/useThemeStore";
import { getApiBase } from "@/utils/api";

/**
 * Checks if the given path points to /free-course/<courseId>, for special redirect after login/signup.
 */
function getFreeCoursePath(redirectTo) {
  if (
    typeof redirectTo === "string" &&
    /^\/free-course(\/|$)/.test(redirectTo)
  ) {
    return redirectTo;
  }
  return null;
}

function GoogleLoginButton({ onSuccess, onError, loading }) {
  const googleLogin = useGoogleLogin({
    onSuccess,
    onError,
    flow: 'implicit',
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
      style={{
        backgroundColor: "var(--bg-input)",
        borderColor: "var(--border-primary)",
        color: "var(--text-primary)",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-primary)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-primary)"}
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
        onClick={() => setErrorMsg("Google Sign-In is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.")}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 opacity-80 hover:opacity-100"
        style={{
          backgroundColor: "var(--bg-input)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-primary)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-primary)"}
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
      <div className="space-y-2">
        <GoogleLoginButton onSuccess={onSuccess} onError={onError} loading={loading} />
        <p className="text-[11px] text-center leading-relaxed" style={{ color: "var(--text-muted)" }}>
          By continuing with Google, you agree to our{" "}
          <a href="/terms-of-service" target="_blank" className="underline hover:text-[var(--text-primary)]">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="underline hover:text-[var(--text-primary)]">
            Privacy Policy
          </a>
          . We access your name, email, and profile picture strictly for authentication and account creation.
        </p>
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

  // Show/hide form states
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

  // Registration Email OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Cloudflare Turnstile state
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const [activeTab, setActiveTab] = useState("STUDENT");
  const [hasExplicitRole, setHasExplicitRole] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const verifyReferralCode = async (code) => {
    if (!code) {
      setReferralStatus(null);
      setReferralMessage("");
      return;
    }
    setReferralStatus("checking");
    try {
      const res = await fetch(`${getApiBase()}/api/auth/referral/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: code })
      });
      const data = await res.json();
      if (data.success) {
        setReferralStatus("valid");
        setReferralMessage("Referral accepted");
      } else {
        setReferralStatus("invalid");
        setReferralMessage(data.message || "Invalid code");
      }
    } catch (e) {
      console.error("Referral verification error:", e);
      setReferralStatus("invalid");
      setReferralMessage("Verification failed");
    }
  };

  // Autofill email if provided in query
  useEffect(() => {
    setHasExplicitRole(false);
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams, redirectTo]);

  // Check for role mismatch with redirectTo
  const isMismatched = (() => {
    if (!user || !redirectTo) return false;
    const path = redirectTo.toLowerCase();
    const isUserAdmin = user.role === 'ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'BATCH_MANAGER';
    const isUserMentor = user.role === 'MENTOR';
    const isUserStudent = user.role === 'USER';
    if (path.startsWith('/admin') && !isUserAdmin) return true;
    if (path.startsWith('/mentor')) {
      const isVivaAccess = path.startsWith('/mentor/viva/questions') || path.startsWith('/mentor/viva/materials');
      if (isVivaAccess) { if (!isUserAdmin && !isUserMentor) return true; } else { if (!isUserMentor) return true; }
    }
    if (path.startsWith('/student') && !isUserStudent) return true;
    return false;
  })();

  // MAIN: Handle user login effect (including for free course redirect)
  useEffect(() => {
    // Don't redirect on role mismatch, that screen comes up below
    if (user && !isMismatched) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("synapse_admin_session");
        localStorage.removeItem("synapse_student_session");
        localStorage.removeItem("synapse_mentor_session");
        const role = user.role;
        if (
          role === "ADMIN" ||
          role === "INSTITUTE_ADMIN" ||
          role === "BATCH_MANAGER"
        )
          localStorage.setItem("synapse_admin_session", "true");
        else if (role === "MENTOR") localStorage.setItem("synapse_mentor_session", "true");
        else localStorage.setItem("synapse_student_session", "true");
      }
      // If they came from a free course, ALWAYS send back to that free course path.
      let targetRoute;
      if (freeCoursePath) {
        targetRoute = freeCoursePath;
      } else if (redirectTo === "/") {
        // Normal logic
        const isUserAdmin = user.role === 'ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'BATCH_MANAGER';
        const isUserMentor = user.role === 'MENTOR';
        if (isUserAdmin) targetRoute = '/admin/dashboard';
        else if (isUserMentor) targetRoute = '/mentor/dashboard';
        else targetRoute = '/student/dashboard';
      } else {
        // fallback to redirectTo param
        targetRoute = redirectTo;
      }
      router.replace(targetRoute);
    }
  }, [user, redirectTo, router, isMismatched, freeCoursePath]);

  // Invoked on Google Login success (useGoogleLogin implicit flow returns access_token)
  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Implicit flow: response = { access_token, token_type, ... }
      // AuthContext.loginWithGoogle detects access_token and sends { access_token } to backend
      const result = await loginWithGoogle(response);
      if (result.blocked) {
        setIsBlocked(true);
        setErrorMsg(result.message);
      } else if (!result.success) {
        setErrorMsg(result.message);
      } else {
        // Always prefer freeCoursePath if available
        let targetRoute;
        if (freeCoursePath) {
          targetRoute = freeCoursePath;
        } else if (redirectTo === "/") {
          const isUserAdmin =
            result.user?.role === "ADMIN" ||
            result.user?.role === "INSTITUTE_ADMIN" ||
            result.user?.role === "BATCH_MANAGER" ||
            (result.user?.email || "").toLowerCase().includes("admin");
          const isUserMentor =
            result.user?.role === "MENTOR" ||
            (result.user?.email || "").toLowerCase().includes("mentor");
          if (isUserAdmin) targetRoute = "/admin/dashboard";
          else if (isUserMentor) targetRoute = "/mentor/dashboard";
          else targetRoute = "/student/dashboard";
        } else {
          targetRoute = redirectTo;
        }
        if (result.offlineMode) {
          setErrorMsg("⚠️ Backend offline. Your account is saved locally only.");
          setTimeout(() => router.replace(targetRoute), 2000);
        } else {
          router.replace(targetRoute);
        }
      }
    } catch (err) {
      setErrorMsg("Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };



  const getRoleTheme = () => {
    return {
      accentColor: "#10b981",
      accentGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      bgBadge: "rgba(16, 185, 129, 0.08)",
      borderAccent: "rgba(16, 185, 129, 0.2)",
      icon: (
        <img
          src="/logo.webp"
          alt="Eduvantix Logo"
          style={{ background: "transparent", borderRadius: 4 }}
        />
      ),
      title: isRegistering ? "Create an Account" : "Welcome Back",
      desc: isRegistering ? "Join the Eduvantix network" : "Sign in to access your portal",
      demoEmail: "user@eduvantix.com"
    };
  };

  const theme = getRoleTheme();

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setOtpSuccessMsg("");

    if (!username.trim()) {
      setErrorMsg("Please enter your username.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setOtpSending(true);
    try {
      const res = await sendRegistrationOtp(email);
      if (res.success) {
        setOtpSent(true);
        setIsOtpVerified(false);
        setOtpSuccessMsg(res.message || "Verification code sent! Please check your Inbox and Spam folder.");
        setResendTimer(60);
      } else {
        setErrorMsg(res.message || "Failed to send verification OTP.");
      }
    } catch {
      setErrorMsg("Network error. Unable to send verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setOtpSuccessMsg("");

    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await verifyRegistrationOtp(email, otp);
      if (res.success) {
        setIsOtpVerified(true);
        setOtpSuccessMsg("✅ Email verified successfully! You can now click Register to complete your account creation.");
      } else {
        setErrorMsg(res.message || "Invalid or expired OTP code.");
      }
    } catch {
      setErrorMsg("Network error. Unable to verify OTP code.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle form submit (login/register/forgot)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (isForgot) {
      if (!email) {
        setErrorMsg("Please enter your email address.");
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

    const submitRole = activeTab === "ADMIN" ? "ADMIN" : activeTab === "MENTOR" ? "MENTOR" : "USER";
    try {
      let result;
      if (isRegistering)
        result = await register(username, email, password, submitRole, referralCode, otp, captchaToken);
      else result = await login(email, password, captchaToken);
      if (result.success) {
        // Always prefer freeCoursePath if available
        let targetRoute;
        if (freeCoursePath) {
          targetRoute = freeCoursePath;
        } else if (redirectTo === "/") {
          const emailLower = (result.user?.email || "").toLowerCase();
          const isUserAdmin =
            result.user?.role === 'ADMIN' ||
            result.user?.role === 'INSTITUTE_ADMIN' ||
            result.user?.role === 'BATCH_MANAGER' ||
            emailLower.includes('admin');
          const isUserMentor =
            result.user?.role === 'MENTOR' ||
            emailLower.includes('mentor');
          if (isUserAdmin) targetRoute = '/admin/dashboard';
          else if (isUserMentor) targetRoute = '/mentor/dashboard';
          else targetRoute = '/student/dashboard';
        } else {
          targetRoute = redirectTo;
        }
        if (result.offlineMode) {
          setErrorMsg("⚠️ Backend offline. Your account is saved locally only.");
          setTimeout(() => router.replace(targetRoute), 2000);
        } else {
          router.replace(targetRoute);
        }
      } else if (result.blocked) {
        setIsBlocked(true);
      } else {
        setErrorMsg(result.message || "An error occurred. Please check your credentials.");
      }
    } catch {
      setErrorMsg("Unable to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Role mismatch screen ─────────── */
  if (user && isMismatched) {
    const isUserAdmin = user.role === 'ADMIN' || user.role === 'INSTITUTE_ADMIN' || user.role === 'BATCH_MANAGER';
    const isUserMentor = user.role === 'MENTOR';
    const userRoleLabel = isUserMentor ? 'Mentor' : isUserAdmin ? 'Administrator' : 'Student';
    const targetPortalLabel = redirectTo.toLowerCase().startsWith('/admin') ? 'Admin Control' : redirectTo.toLowerCase().startsWith('/mentor') ? 'Mentor Board' : 'Student Desk';
    const getDashboardPath = () => {
      if (isUserAdmin) return '/admin/dashboard';
      if (isUserMentor) return '/mentor/dashboard';
      return '/student/dashboard';
    };

    return (
      <div className="p-8 rounded-2xl border border-[var(--border-primary)] shadow-lg space-y-6 text-center w-full max-w-md" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--text-on-accent)] shadow-md mx-auto" style={{ background: "var(--accent-gradient)" }}>
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Role Mismatch</h2>
        <div className="space-y-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <p>You are signed in as <strong style={{ color: "var(--text-primary)" }}>{user.username}</strong> ({user.email}) with role <strong style={{ color: "var(--text-primary)" }}>{userRoleLabel}</strong>.</p>
          <p className="p-3 rounded-xl bg-amber-500/10 border border-[var(--border-primary)] border-amber-500/20 text-amber-500 text-left leading-relaxed">⚠️ This account cannot access the <strong>{targetPortalLabel}</strong>. Sign out and use an appropriate account.</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push(getDashboardPath())} className="w-full py-3 rounded-xl font-bold text-xs text-[var(--text-on-accent)] transition-all cursor-pointer" style={{ background: "var(--accent-gradient)" }}>Go to my {userRoleLabel} Desk</button>
          <button onClick={() => logout()} className="w-full py-3 rounded-xl font-bold text-xs transition-all border border-[var(--border-primary)] cursor-pointer" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>Sign Out & Switch Accounts</button>
        </div>
      </div>
    );
  }

  /* ─── Account / Institute blocked screen ────── */
  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
          <Ban size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-rose-500">Account Access Suspended</h1>
          <p className="text-xs font-semibold max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            {errorMsg || "Your account has been blocked by the administrator. Access to the platform is currently restricted."}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <a
            href="mailto:hello@eduvantix.com"
            className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all shadow-sm"
          >
            Contact Support (hello@eduvantix.com)
          </a>
          <button
            onClick={() => { setIsBlocked(false); setErrorMsg(""); router.push("/"); }}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold transition-all cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ─── Main Form ─────────────────── */
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full space-y-5">
      {/* Role tabs removed */}
      <div className="p-8 rounded-2xl border border-[var(--border-primary)] space-y-6" style={{ backgroundColor: "var(--bg-card)", borderColor: theme.borderAccent }}>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h1 className="text-base font-black" style={{ color: "var(--text-primary)" }}>{isForgot ? "Reset Password" : theme.title}</h1>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{isForgot ? "Enter your email to receive a reset link" : theme.desc}</p>
            </div>
          </div>
          <div className="h-px" style={{ background: "var(--border-primary)" }} />
        </div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className={`flex items-start gap-2 p-3.5 rounded-xl border text-xs font-medium ${errorMsg.startsWith("⚠️") ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-rose-500/10 border-rose-500/20 text-rose-600"}`}>
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMsg}</span>
                {errorMsg.toLowerCase().includes("hello@eduvantix.com") && (
                  <div className="pt-1">
                    <a
                      href="mailto:hello@eduvantix.com"
                      className="inline-flex items-center gap-1 font-bold underline text-rose-600 hover:text-rose-700"
                    >
                      Email hello@eduvantix.com
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot success */}
        {isForgot && forgotSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-[var(--border-primary)] border-emerald-500/20 text-emerald-600 text-xs font-medium">✅ Reset link sent! Check your inbox.</div>
            <button type="button" onClick={() => { setIsForgot(false); setForgotSuccess(false); setErrorMsg(""); }} className="w-full py-3 rounded-xl font-bold text-xs text-white" style={{ background: theme.accentGradient }}>Back to Sign In</button>
          </div>
        ) : isForgot ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email Address" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} placeholder="name@example.com" required />
            <SubmitButton loading={loading} gradient={theme.accentGradient} label="Send Reset Link" />
            <div className="text-center"><button type="button" onClick={() => { setIsForgot(false); setErrorMsg(""); }} className="text-xs font-bold" style={{ color: "var(--accent-primary)" }}>Back to Sign In</button></div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {isRegistering && (
                <motion.div key="username" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <InputField label="Username" type="text" value={username} onChange={setUsername} icon={<User size={14} />} placeholder="enter username" />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Referral Code (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Award size={14} /></span>
                      <input type="text" placeholder="ENTER CODE" value={referralCode} 
                        onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus(null); }} 
                        onBlur={(e) => verifyReferralCode(e.target.value)}
                        className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none border transition-all"
                        style={{ backgroundColor: "var(--bg-input)", borderColor: referralStatus === 'invalid' ? '#f43f5e' : referralStatus === 'valid' ? '#10b981' : "var(--border-primary)", color: "var(--text-primary)" }}
                        onFocus={e => { if(!referralStatus) e.target.style.borderColor = "var(--accent-primary)"}} 
                      />
                      {referralStatus === 'checking' && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"><RefreshCw className="animate-spin" size={14} /></span>}
                      {referralStatus === 'valid' && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle2 size={14} /></span>}
                    </div>
                    {referralStatus === 'invalid' && <p className="text-[10px] text-rose-500 font-medium">{referralMessage}</p>}
                    {referralStatus === 'valid' && <p className="text-[10px] text-emerald-500 font-medium">✅ {referralMessage}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <InputField label="Email Address" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} placeholder="name@eduvantix.com" required />
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password</label>
                {!isRegistering && (
                  <button type="button" onClick={() => { setIsForgot(true); setErrorMsg(""); }} className="text-[10px] font-bold" style={{ color: "var(--accent-primary)" }}>Forgot?</button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Lock size={14} /></span>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none border border-[var(--border-primary)] transition-all"
                  style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"} required />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              {isRegistering && (
                <motion.div key="confirm" className="space-y-1.5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}><Lock size={14} /></span>
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none border border-[var(--border-primary)] transition-all"
                      style={{ backgroundColor: "var(--bg-input)", borderColor: confirmPassword && confirmPassword !== password ? "#f43f5e" : "var(--border-primary)", color: "var(--text-primary)" }}
                      required />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && <p className="text-[10px] text-rose-500 font-medium">Passwords do not match</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Email OTP Field & Inline Action */}
            {isRegistering && (
              <motion.div key="otpField" className="space-y-1.5" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                    Email Verification OTP *
                  </label>
                  {otpSent && !isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={resendTimer > 0 || otpSending}
                      className="text-[10px] font-bold text-indigo-500 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : otpSending ? "Sending..." : "Resend OTP"}
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
                    className={`w-full rounded-xl py-2.5 pl-9 pr-28 text-sm font-mono tracking-wider outline-none border transition-all ${isOtpVerified ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-600 font-bold" : "border-[var(--border-primary)]"}`}
                    style={isOtpVerified ? {} : { backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                    required={otpSent}
                  />
                  {isOtpVerified ? (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : !otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending || !email}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: theme.accentGradient }}
                    >
                      {otpSending ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otp.length !== 6}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: theme.accentGradient }}
                    >
                      {otpVerifying ? "Verifying..." : "Verify OTP"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {isRegistering && otpSuccessMsg && (
              <div className={`p-3 rounded-xl border text-xs font-medium space-y-1 ${isOtpVerified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"}`}>
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{isOtpVerified ? "Email Address Verified!" : "Verification Code Sent!"}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isOtpVerified ? "Your email has been successfully verified. Click Register as Student to complete your account setup." : "Please check your Inbox or Spam/Junk folder for your 6-digit code."}
                </p>
              </div>
            )}

            {/* Cloudflare Turnstile CAPTCHA Protection */}
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

            <SubmitButton 
              loading={loading} 
              disabled={(isRegistering && !isOtpVerified) || (isRegistering && referralStatus === 'invalid') || (isRegistering && confirmPassword && confirmPassword !== password)}
              gradient={theme.accentGradient} 
              label={isRegistering ? `Register as Student` : `Sign In`} 
            />
            {!isForgot && (
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-primary)] opacity-20"></div>
                </div>
                <span className="relative px-3 text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] bg-[var(--bg-card)]">Or continue with</span>
              </div>
            )}
            {!isForgot && (
              <div className="flex justify-center w-full mt-2">
                <GoogleLoginSection
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg("Google Login failed.")}
                  loading={loading}
                  setErrorMsg={setErrorMsg}
                />
              </div>
            )}
          </form>
        )}
        {/* Toggle register/login */}
        {!isForgot && (
          <div className="pt-2 text-center border-t" style={{ borderColor: "var(--border-primary)" }}>
            <button type="button" onClick={() => { setErrorMsg(""); setIsRegistering(!isRegistering); }} className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              {isRegistering ? "Already have an account? " : "New to Eduvantix? "}
              <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{isRegistering ? "Sign In" : "Create Account"}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Reusable input ────────────────── */
function InputField({ label, type, value, onChange, icon, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>{icon}</span>
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required}
          className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none border border-[var(--border-primary)] transition-all"
          style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          onFocus={e => e.target.style.borderColor = "var(--accent-primary)"} onBlur={e => e.target.style.borderColor = "var(--border-primary)"}
        />
      </div>
    </div>
  );
}

/* ─── Submit button ─────────────────── */
function SubmitButton({ loading, gradient, label, disabled }) {
  const isDisabled = loading || disabled;
  return (
    <button type="submit" disabled={isDisabled}
      className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
      style={{ background: gradient }}
    >
      {loading ? <><RefreshCw size={14} className="animate-spin" /><span>Processing…</span></> : <><span>{label}</span><ArrowRight size={14} /></>}
    </button>
  );
}

/* ─── Page Wrapper ──────────────────── */
export default function LoginPage() {
  const isDark = useThemeStore((state) => state.isDark);
  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      {/* LEFT — editorial branding */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] min-h-screen p-12 relative"
        style={{ backgroundColor: "white", borderRight: "1px solid var(--border-primary)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.location.href = "/"}
          tabIndex={0}
          role="button"
          aria-label="Go to homepage"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = "/"; }}
        >
          {/* Responsive logo: black in light mode, white in dark mode */}
          <img
            src="/logo-black-text.webp"
            alt="Eduvantix Logo"
            className="h-10 w-auto block"
            style={{
              position: "fixed",
              width: "auto",
            }}
          />
        </div>
        <video
          src="/guy-coding.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "fixed",
            left: 0,
            bottom: 0,
            width: "40vw",
            // minWidth: 400,
            // maxWidth: 650,
            height: "auto",
            zIndex: 10,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            background: "#fff",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-12 lg:px-12 relative z-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src={isDark ? '/logo-white-text.webp' : '/logo-black-text.webp'}
            alt="Eduvantix Logo"
            className="h-10 w-auto"
          />
        </div>
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="flex items-center justify-center p-8"><RefreshCw className="animate-spin" size={22} style={{ color: "var(--accent-primary)" }} /></div>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-10 pt-8 w-full max-w-sm text-center flex flex-col items-center gap-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.15em" }}>
            Are you an educational institution?
          </p>
          <a
            href="/institutes"
            className="w-full px-1 py-3 font-bold rounded-lg text-center relative overflow-hidden group border-2 border-yellow-400 shadow-xl"
            style={{
              background: "linear-gradient(90deg, #f7e260 0%, #ffb300 100%)",
              letterSpacing: ".02em",
              boxShadow: "0 6px 30px 0 rgba(255,223,72,0.13)",
            }}
          >
            <span className="relative z-20 flex items-center justify-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="uppercase tracking-widest text-[12px] text-black">Explore Eduvantix For Institutions</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M12 18v-6m0 0c-1.7-1.7-4.4-1.7-6 0m6 0c1.7-1.7 4.4-1.7 6 0" /></svg>
            </span>
            <span
              className="absolute left-[-85%] top-0 w-[170%] h-full bg-gradient-to-r from-white/30 to-yellow-100/10 opacity-80 blur-[1.5px] transform skew-x-[-18deg] animate-premium-shimmer pointer-events-none"
            ></span>
          </a>
        </div>
      </div>
    </div>
  );
}
