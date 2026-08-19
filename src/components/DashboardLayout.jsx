"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, LogOut,
  Menu, X, ChevronLeft, ChevronRight, BookOpen, ArrowLeftRight,
  Code, Brain, Radio, AlertTriangle, FileText, Gamepad2, FileCheck, Activity, Settings, Paintbrush, Palette,
  ShieldAlert, ShieldCheck, Layers, Users, PlusCircle, List, Bell, BellDot, CheckCircle2, Check, MessageSquare, Crown, HeartHandshake, ClipboardList, Target, Briefcase, CalendarDays, Newspaper, Database
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { BrandingProvider, useBranding } from "@/context/BrandingContext";
import ToastContainer from "@/components/ToastContainer";
import useThemeStore from "@/store/useThemeStore";
import GiftCoupon from "@/components/GiftCoupon";
import VerifiedBadge from "@/components/VerifiedBadge";
import { usePro } from "@/context/ProContext";
import CareerModeToggle from "@/components/pro/CareerModeToggle";
import ProSidebar from "@/components/pro/ProSidebar";

// Inner layout component — has access to BrandingContext
function DashboardLayoutInner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user, token, API_BASE, activeSession, setActiveSession, loading, updateUser } = useAuth();
  const { siteName, logoUrl: brandingLogoUrl } = useBranding();
  const { isPro, mode } = usePro();
  const isCareerMode = isPro && mode === "CAREER";

  const inst = user?.institute;
  const isInstituteAffiliated = !!user?.instituteId;

  const hasAccess = (flag) => {
    if (!isInstituteAffiliated || !inst) return true;
    return inst[flag] !== false;
  };

  const getRequiredFeatureFlag = () => {
    if (pathname.startsWith("/mentor/viva/questions")) return "allowedAiViva";
    if (pathname.startsWith("/student/viva")) return "allowedAiViva";
    
    if (pathname.startsWith("/mentor/viva/materials")) return "allowedStudyMaterial";
    if (pathname.startsWith("/student/materials")) return "allowedStudyMaterial";

    if (pathname.startsWith("/admin/contests")) return "allowedContest";
    if (pathname.startsWith("/contest")) return "allowedContest";

    if (pathname.startsWith("/admin/problems")) return "allowedProblems";

    if (pathname.startsWith("/admin/live")) return "allowedGoLive";
    if (pathname.startsWith("/live-classes")) return "allowedGoLive";

    if (pathname.startsWith("/admin/batches")) return "allowedManageBatches";
    if (pathname.startsWith("/admin/batch-manager")) return "allowedManageBatches";

    if (pathname.startsWith("/admin/people")) return "allowedManagePeople";

    if (pathname.startsWith("/admin/arcade")) return "allowedArcade";
    if (pathname.startsWith("/student/games")) return "allowedArcade";

    return null;
  };

  const requiredFeature = getRequiredFeatureFlag();
  const isFeatureBlocked = requiredFeature && user?.role !== "ADMIN" && !hasAccess(requiredFeature);

  const [premiumRequestLoading, setPremiumRequestLoading] = useState(false);
  const [premiumRequestSuccess, setPremiumRequestSuccess] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dashboardUser, setDashboardUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Role & Session States
  const [roleName, setRoleName] = useState("Scholar");
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState(null);
  const { isDark, initTheme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initTheme();

    // Client-side initialization of local storage states
    if (typeof window !== "undefined") {
      try {
        const reqStored = localStorage.getItem("eduvantix_dismissed_notifications");
        if (reqStored) setDismissedRequests(JSON.parse(reqStored));
        
        const notiStored = localStorage.getItem("eduvantix_dismissed_noti_ids");
        if (notiStored) setDismissedNotiIds(JSON.parse(notiStored));
        
        const hasSession = localStorage.getItem("synapse_student_session") === "true" ||
                           localStorage.getItem("synapse_admin_session") === "true" ||
                           localStorage.getItem("synapse_mentor_session") === "true" ||
                           !!localStorage.getItem("eduvantix_auth_token");
        setCheckingAuth(!hasSession);
      } catch (e) {
        console.error("Error loading local storage", e);
      }
    }
  }, [initTheme]);

  // Update document title with custom site name
  useEffect(() => {
    if (typeof document !== "undefined" && siteName && siteName !== "Eduvantix") {
      document.title = document.title.replace(/Eduvantix/gi, siteName);
    }
  }, [siteName]);

  const effectiveRole = user?.role;
  const isSuperAdmin = effectiveRole === "ADMIN";
  const isInstAdmin = effectiveRole === "INSTITUTE_ADMIN";
  const isBatchMgr = effectiveRole === "BATCH_MANAGER";
  const isMentor = effectiveRole === "MENTOR";
  const isStudent = effectiveRole === "USER";

  const isStudentSession = isStudent;
  const isAdminSession = isSuperAdmin || isInstAdmin || isBatchMgr;
  const isMentorSession = isMentor;
  const isLoginRoute = pathname === "/student" || pathname === "/admin" || pathname === "/mentor";
  const [premiumRequests, setPremiumRequests] = useState([]);
  const [dismissedRequests, setDismissedRequests] = useState([]);

  const handleDismiss = (id) => {
    setDismissedRequests(prev => {
      const updated = [...prev, id];
      localStorage.setItem("eduvantix_dismissed_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const visibleRequests = premiumRequests.filter(req => !dismissedRequests.includes(req.id));

  const getFeatureCleanLabel = (flag) => {
    switch (flag) {
      case "allowedAiViva": return "AI Viva";
      case "allowedStudyMaterial": return "Study Material";
      case "allowedContest": return "Contests";
      case "allowedProblems": return "Problems";
      case "allowedGoLive": return "Go Live";
      case "allowedManageBatches": return "Manage Batches";
      case "allowedManagePeople": return "Manage People";
      case "allowedArcade": return "Arcade Questions";
      default: return flag;
    }
  };

  const fetchPremiumRequests = async () => {
    if (!isSuperAdmin) return;
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "ADMIN" }),
      };
      const res = await fetch(`${API_BASE}/api/auth/institute-admins`, { headers });
      const data = await res.json();
      if (data.success) {
        const uniqueRequests = [];
        (data.users || []).forEach(u => {
          if (u.institute?.wantsPremium) {
            const features = u.institute.wantsPremium.split(",").filter(Boolean);
            features.forEach(feat => {
              uniqueRequests.push({
                id: `${u.instituteId}-${feat}-${u.institute.updatedAt}`,
                instituteName: u.institute.name,
                featureLabel: getFeatureCleanLabel(feat)
              });
            });
          }
        });
        setPremiumRequests(uniqueRequests);
      }
    } catch (err) {
      console.error("Failed to fetch premium requests", err);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchPremiumRequests();
      const interval = setInterval(fetchPremiumRequests, 15000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  // ── In-app Notifications ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [dismissedNotiIds, setDismissedNotiIds] = useState([]);

  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotiIds.includes(n.id) && !n.isRead
  );

  const NOTI_ICONS = {
    JOB_APPLICATION: "💼",
    JOB_STATUS: "📋",
    FEEDBACK: "📝",
    LIVE_CLASS: "📺",
    STUDY_MATERIAL: "📚",
    AI_VIVA: "🧠",
    EXAM: "📝",
    CONTEST: "🏆",
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      const headers = {
        "Content-Type": "application/json",
        ...(hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user?.role || "USER" }),
      };
      const res = await fetch(`${API_BASE}/api/notifications`, { headers });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        
        const latestStatusNotif = data.notifications?.find(n => 
          n.title?.includes("Verified Badge Granted!") || n.title?.includes("Verified Badge Revoked")
        );
        if (latestStatusNotif && user) {
          if (latestStatusNotif.title.includes("Verified Badge Granted!") && !user.isVerified) {
            let tier = "STUDENT";
            if (latestStatusNotif.body?.includes("EDUCATOR")) tier = "EDUCATOR";
            if (latestStatusNotif.body?.includes("ORGANIZATION")) tier = "ORGANIZATION";
            updateUser({ isVerified: true, verifiedBadgeTier: tier });
          } else if (latestStatusNotif.title.includes("Verified Badge Revoked") && user.isVerified) {
            updateUser({ isVerified: false, verifiedBadgeTier: null });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleDismissNoti = async (id) => {
    // Optimistically hide it
    setDismissedNotiIds(prev => {
      const updated = [...prev, id];
      localStorage.setItem("eduvantix_dismissed_noti_ids", JSON.stringify(updated));
      return updated;
    });
    // Call API to mark read
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      await fetch(`${API_BASE}/api/notifications/${id}/dismiss`, {
        method: "PATCH",
        headers: hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user?.role || "USER" },
      });
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const handleDismissAllNoti = async () => {
    const ids = visibleNotifications.map(n => n.id);
    setDismissedNotiIds(prev => {
      const updated = [...prev, ...ids];
      localStorage.setItem("eduvantix_dismissed_noti_ids", JSON.stringify(updated));
      return updated;
    });
    try {
      const hasRealToken = token && !token.startsWith("demo-") && !token.startsWith("local-");
      await fetch(`${API_BASE}/api/notifications/dismiss-all`, {
        method: "PATCH",
        headers: hasRealToken
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": user?.role || "USER" },
      });
    } catch (err) {
      console.error("Failed to dismiss all notifications", err);
    }
    setIsNotiOpen(false);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);



  const [localRequestedFeatures, setLocalRequestedFeatures] = useState([]);

  useEffect(() => {
    if (user?.institute?.wantsPremium) {
      setLocalRequestedFeatures(user.institute.wantsPremium.split(",").filter(Boolean));
    } else {
      setLocalRequestedFeatures([]);
    }
  }, [user]);

  useEffect(() => {
    if (isFeatureBlocked && user?.role !== "INSTITUTE_ADMIN" && user?.role !== "ADMIN") {
      const dashboardUrl = isStudentSession ? "/student/dashboard" : isMentor ? "/mentor/dashboard" : "/admin/dashboard";
      router.replace(dashboardUrl);
    }
  }, [isFeatureBlocked, user, router, isStudentSession, isMentor]);

  useEffect(() => {
    if (!user || !isStudentSession) return;
    async function fetchRank() {
      const headers = {
        "Content-Type": "application/json",
        ...(token && !token.startsWith("demo-") && !token.startsWith("local-")
          ? { Authorization: `Bearer ${token}` }
          : { "x-bypass-auth": "true", "x-bypass-role": "USER" }),
      };
      try {
        const subRes = await fetch(`${API_BASE}/api/submissions?userId=${user.id}`, { headers });
        let uniqueSolved = 0;
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success) {
            const accepted = (subData.submissions || []).filter(s => s.status === "ACCEPTED");
            uniqueSolved = new Set(accepted.map(s => s.problemId)).size;
          }
        }
        const contestRes = await fetch(`${API_BASE}/api/contests`, { headers });
        let bestScore = 0;
        if (contestRes.ok) {
          const contestData = await contestRes.json();
          if (contestData.success) {
            const myParticipations = (contestData.contests || []).filter(c => c.userParticipation && c.userParticipation.completed);
            bestScore = myParticipations.length > 0 ? Math.max(...myParticipations.map(c => c.userParticipation?.score || 0)) : 0;
          }
        }
        const points = uniqueSolved * 10 + bestScore;
        const RANKS = [
          { name: "Novice Scholar", minPoints: 0, maxPoints: 100 },
          { name: "Bronze Scholar", minPoints: 100, maxPoints: 200 },
          { name: "Silver Scholar", minPoints: 200, maxPoints: 300 },
          { name: "Gold Scholar", minPoints: 300, maxPoints: 400 },
          { name: "Elite Scholar III", minPoints: 400, maxPoints: 500 },
          { name: "Elite Scholar II", minPoints: 500, maxPoints: 600 },
          { name: "Elite Scholar I", minPoints: 600, maxPoints: 750 },
          { name: "Grandmaster Scholar", minPoints: 750, maxPoints: 1000 },
          { name: "Legendary Coder", minPoints: 1000, maxPoints: Infinity }
        ];
        const matchedRank = RANKS.find(r => points >= r.minPoints && points < r.maxPoints) || RANKS[0];
        setRoleName(matchedRank.name);
      } catch (e) {
        console.error("Failed to fetch user rank for layout:", e);
      }
    }
    fetchRank();
  }, [user, token, API_BASE, isStudentSession]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (loading) return; // Wait for AuthContext to finish checking

      const hasSession = isStudentSession || isAdminSession || isMentorSession;

      // Public routes that don't require authentication
      const isPublicRoute = pathname === "/courses" || pathname.startsWith("/courses/");

      if (!hasSession && !isPublicRoute) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (hasSession && isLoginRoute) {
        if (isAdminSession) router.push("/admin/dashboard");
        else if (isMentorSession) router.push("/mentor/dashboard");
        else router.push("/student/dashboard");
      } else if (hasSession) {
        const name = user?.username || "Eduvantix User";
        const email = user?.email || "user@synapse.com";
        const avatarUrl = user?.avatarUrl || null;
        const initials = name.slice(0, 2).toUpperCase();

        let displayRole = "User";
        if (isStudentSession) displayRole = roleName;
        else if (isMentorSession) displayRole = "Mentor";
        else if (isSuperAdmin) displayRole = "Super Admin";
        else if (isInstAdmin) displayRole = "Institute Admin";
        else if (isBatchMgr) displayRole = "Batch Manager";

        setDashboardUser({ 
          name, 
          email, 
          role: displayRole, 
          initials, 
          avatarUrl,
          isVerified: user.isVerified,
          verifiedBadgeTier: user.verifiedBadgeTier
        });
        setCheckingAuth(false);
      } else {
        setCheckingAuth(false);
      }
    }
  }, [pathname, router, user, roleName, isStudentSession, isAdminSession, isMentorSession, isSuperAdmin, isInstAdmin, isBatchMgr]);

  const handleLogout = () => setShowLogoutConfirm(true);

  const handleSafeNavigation = (target) => {
    if (activeSession && target !== "/admin/live") {
      setPendingNavAction({ action: target });
      setShowEndConfirmModal(true);
    } else {
      if (typeof target === "string") {
        router.push(target);
      } else if (typeof target === "function") {
        target();
      }
    }
  };

  const handleConfirmEndSession = async () => {
    setShowEndConfirmModal(false);
    if (activeSession) {
      try {
        await fetch(`${API_BASE}/api/livekit/session/${activeSession.id}/end`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed to end session:", err);
      }
      setActiveSession(null);
    }
    if (pendingNavAction && pendingNavAction.action) {
      const action = pendingNavAction.action;
      if (typeof action === "string") router.push(action);
      else if (typeof action === "function") action();
    }
    setPendingNavAction(null);
  };

  if (isLoginRoute) return <>{children}</>;

  const isPracticeWorkspace = pathname.startsWith("/practice/");
  if (isPracticeWorkspace) return <>{children}</>;

  // Hide sidebar + header for contest workspace — the contest page handles its own
  // fullscreen mode and anti-cheat layout internally.
  const isContestWorkspace = /^\/contest\/[^/]+/.test(pathname);
  if (isContestWorkspace) return <>{children}</>;

  // Hide sidebar + header for course catalog & course detail pages — they are
  // full-page immersive layouts that manage their own navigation.
  const isCoursePage = pathname.startsWith("/courses");
  if (isCoursePage) return <>{children}</>;

  // Hide sidebar + header for the LMS step player (full-height immersive mode).
  // URL pattern: /learn/course/[slug]/[chapterId]/[stepId]
  const isLearningStepPlayer = /^\/learn\/course\/[^/]+\/[^/]+\/[^/]+/.test(pathname);
  if (isLearningStepPlayer) return <>{children}</>;



  let sidebarLinks = [];

  const canShowFeature = (flag) => {
    // Super Admin and Institute Admin always see the links in sidebar
    if (isSuperAdmin || isInstAdmin) return true;
    // BMs and Mentors only see it if it's allowed
    return hasAccess(flag);
  };

  if (isStudentSession) {
    sidebarLinks = [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "Learn", href: "/learn", icon: BookOpen },
      { label: "Practice Arena", href: "/practice", icon: Code },
      { label: "Contest Arena", href: "/contest", icon: Trophy },
      { label: "Exam Center", href: "/exams", icon: FileText },
      { label: "Discuss Forum", href: "/discuss", icon: MessageSquare },
      { label: "Blogs", href: "/journal", icon: Newspaper },
      { label: "AI Viva", href: "/student/viva", icon: Brain },
      { label: "AI Agents", href: "/student/ai-agents", icon: Brain },
      { label: "Live Sessions", href: "/live-classes", icon: Radio },
      { label: "Learn with Games", href: "/student/games", icon: Gamepad2 },
      { label: "Events", href: "/events", icon: CalendarDays },
      isInstituteAffiliated ? { label: "My Schedule", href: "/timetable/student", icon: CalendarDays } : null,
      isInstituteAffiliated ? { label: "My Attendance", href: "/attendance/student", icon: CheckCircle2 } : null,
      isInstituteAffiliated ? { label: "Study Materials", href: "/student/materials", icon: FileText } : null,
      { label: "Resume Builder", href: "/student/resume", icon: FileCheck },
      { label: "Job Assistance", href: "/student/job-assistance", icon: Briefcase },
      { label: "Share Feedback", href: "/feedback", icon: HeartHandshake },
    ].filter(Boolean);
  } else {
    sidebarLinks = [
      {
        label: "Dashboard",
        href: isMentor ? "/mentor/dashboard" : "/admin/dashboard",
        icon: LayoutDashboard
      },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && { label: "Exam Center", href: "/exams", icon: FileText },
      isSuperAdmin && { label: "Live Users", href: "/admin/live-users", icon: Users },
      isSuperAdmin && { label: "Institutes", href: "/admin/institutes", icon: ShieldAlert },
      isSuperAdmin && { label: "Verifications", href: "/admin/verification", icon: ShieldCheck },
      isInstAdmin && { label: "Manage Batches", href: "/admin/batches", icon: Layers, featureFlag: "allowedManageBatches" },
      isInstAdmin && { label: "Manage People", href: "/admin/people", icon: Users, featureFlag: "allowedManagePeople" },
      isBatchMgr && canShowFeature("allowedManageBatches") && { label: "My Batches", href: "/admin/batch-manager", icon: Layers, featureFlag: "allowedManageBatches" },
      { label: "Discuss Forum", href: "/discuss", icon: MessageSquare },
      { label: "Blogs", href: "/journal", icon: Newspaper },
      (isBatchMgr || isInstAdmin || isMentor) && canShowFeature("allowedAiViva") && { label: "AI Viva", href: "/mentor/viva/questions", icon: Brain, featureFlag: "allowedAiViva" },
      (isBatchMgr || isInstAdmin || isMentor) && canShowFeature("allowedStudyMaterial") && { label: "Study Materials", href: "/mentor/viva/materials", icon: FileText, featureFlag: "allowedStudyMaterial" },
      isSuperAdmin && { label: "AI Viva", href: "/admin/viva/ai-settings", icon: Brain },
      (isSuperAdmin || isInstAdmin) && { label: "Courses", href: "/admin/courses", icon: BookOpen },
      isSuperAdmin && { label: "User Feedbacks", href: "/admin/feedback", icon: ClipboardList },
      isSuperAdmin && { label: "Job Assistance", href: "/admin/job-assistance", icon: Briefcase },
      isSuperAdmin && { label: "Careers Portal", href: "/admin/careers", icon: Briefcase },
      isSuperAdmin && { label: "Campus Ambassadors", href: "/admin/campus-ambassadors", icon: Users },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && canShowFeature("allowedContest") && { label: "Contests", href: "/admin/contests", icon: Trophy, featureFlag: "allowedContest" },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && canShowFeature("allowedProblems") && { label: "Problems", href: "/admin/problems", icon: Code, featureFlag: "allowedProblems" },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && canShowFeature("allowedGoLive") && { label: "Live Sessions", href: "/admin/live", icon: Radio, featureFlag: "allowedGoLive" },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && canShowFeature("allowedArcade") && { label: "Arcade Questions", href: "/admin/arcade", icon: Gamepad2, featureFlag: "allowedArcade" },
      (isSuperAdmin || isInstAdmin || isBatchMgr || isMentor) && { label: "Events", href: "/events/organizer", icon: CalendarDays },
      isInstAdmin && { label: "Academic Setup", href: "/academic-setup", icon: BookOpen },
      (isInstAdmin || isBatchMgr) && { label: "Timetable", href: "/timetable", icon: CalendarDays },
      isInstAdmin && { label: "Attendance", href: "/attendance/admin", icon: CheckCircle2 },
      isInstAdmin && { label: "Branding", href: "/settings/branding", icon: Palette },

      !isSuperAdmin && { label: "Share Feedback", href: "/feedback", icon: HeartHandshake },
    ].filter(Boolean);
  }

  const BlockedScreen = () => {
    const isAlreadyRequested = requiredFeature && localRequestedFeatures.includes(requiredFeature);

    const handleRequestUpgrade = async () => {
      setPremiumRequestLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/institutes/subscribe-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ featureName: requiredFeature })
        });
        const data = await res.json();
        if (data.success) {
          setLocalRequestedFeatures(prev => [...prev, requiredFeature]);
        } else {
          alert(data.message || "Failed to submit request.");
        }
      } catch (err) {
        alert("Failed to connect to server.");
      } finally {
        setPremiumRequestLoading(false);
      }
    };

    if (isAlreadyRequested) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto space-y-6 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shrink-0">
            <CheckCircle2 size={30} />
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold w-full max-w-xs animate-in zoom-in duration-300">
            Our team will get in touch with you shortly.
          </div>
          <div className="space-y-1.5 text-xs text-[var(--text-muted)] font-medium pt-4">
            <p>If you have urgent queries, write to us directly at:</p>
            <a href="mailto:hello@datamindx.in" className="text-amber-500 hover:underline font-bold">
              hello@datamindx.in
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
          <ShieldAlert size={36} />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Feature Restricted
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your institute does not have access to this premium feature. To enable it and elevate your learning environment, contact your Super Administrator to upgrade to premium.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleRequestUpgrade}
            disabled={premiumRequestLoading}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {premiumRequestLoading ? "Submitting Request..." : "Subscribe to Premium"}
          </button>
        </div>

        <div className="space-y-1.5 text-xs text-[var(--text-muted)] font-medium pt-4">
          <p>Or write to us directly at:</p>
          <a href="mailto:hello@datamindx.in" className="text-amber-500 hover:underline font-bold">
            hello@datamindx.in
          </a>
        </div>
      </div>
    );
  };

  const pageTitle = pathname.split("/").filter(Boolean).slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ") || "Dashboard";
  const isLiveStudioMode = (activeSession && pathname === "/admin/live") || pathname === "/live";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {!isLiveStudioMode && (
        <aside
        className="hidden md:flex flex-col h-full border-r transition-all duration-300 relative z-30"
        style={{ width: isSidebarCollapsed ? "60px" : "195px", backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-primary)" }}
      >
        {isCareerMode ? (
          // ── Pro Career Mode sidebar ────────────────────────────────
          <>
            <div className={`flex items-center h-14 border-b ${isSidebarCollapsed ? "justify-center px-0" : "justify-between px-4"}`} style={{ borderColor: "var(--border-primary)" }}>
              <Link href="/" className={`flex items-center gap-3 py-4 mb-2 ${isSidebarCollapsed ? "px-0" : "px-2"}`}>
                <div className={`flex items-center overflow-hidden transition-all ${isSidebarCollapsed ? "w-6" : "w-32"}`}>
                  {brandingLogoUrl ? (
                    <img src={brandingLogoUrl.startsWith("http") ? brandingLogoUrl : `${API_BASE}${brandingLogoUrl}`} alt={`${siteName} Logo`} className="h-6 object-contain object-left shrink-0 max-w-none" style={{ display: "block" }} />
                  ) : (
                    <img src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"} alt="Eduvantix Logo" className="h-6 object-contain object-left shrink-0 max-w-none" style={{ display: "block" }} />
                  )}
                </div>
              </Link>
            </div>
            <ProSidebar collapsed={isSidebarCollapsed} />
          </>
        ) : (
          // ── Normal Learning Mode sidebar ───────────────────────────
          <>
        <div className={`flex items-center h-14 border-b ${isSidebarCollapsed ? "justify-center px-0" : "justify-between px-4"}`} style={{ borderColor: "var(--border-primary)" }}>
          <Link href="/" className={`flex items-center gap-3 py-4 mb-2 ${isSidebarCollapsed ? "px-0" : "px-2"}`}>
            <div className={`flex items-center overflow-hidden transition-all ${isSidebarCollapsed ? "w-6" : "w-32"}`}>
              {brandingLogoUrl ? (
                <img
                  src={brandingLogoUrl.startsWith("http") ? brandingLogoUrl : `${API_BASE}${brandingLogoUrl}`}
                  alt={`${siteName} Logo`}
                  className="h-6 object-contain object-left shrink-0 max-w-none"
                  style={{ display: "block" }}
                />
              ) : (
                <img
                  src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                  alt="Eduvantix Logo"
                  className="h-6 object-contain object-left shrink-0 max-w-none"
                  style={{ display: "block" }}
                />
              )}
            </div>
          </Link>
        </div>

        <nav className={`flex-1 px-2 py-2 space-y-0.5 ${isSidebarCollapsed ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
          {sidebarLinks.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/student/dashboard" && link.href !== "/admin/dashboard" && link.href !== "/mentor/dashboard" && pathname.startsWith(link.href));
            const isBlocked = link.featureFlag && !hasAccess(link.featureFlag);

            return (
              <a
                key={link.href}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (activeSession && link.href !== "/admin/live") {
                    handleSafeNavigation(link.href);
                  } else {
                    router.push(link.href);
                  }
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all relative group"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "var(--accent-primary)" }} />}
                <LinkIcon size={15} className="flex-shrink-0" style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }} />
                                {!isSidebarCollapsed && <span>{link.label}</span>}
                {isBlocked && !isSidebarCollapsed && (
                  <Crown size={14} className="ml-auto text-amber-500 fill-amber-500/20 shrink-0" />
                )}

                {isSidebarCollapsed && (
                  <div className="absolute left-14 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg flex items-center gap-1.5">
                    {link.label}
                    {isBlocked && (
                      <Crown size={10} className="text-amber-500 fill-amber-500/20" />
                    )}
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        <div className="p-2 border-t space-y-1" style={{ borderColor: "var(--border-primary)" }}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[11px] transition-all"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!isSidebarCollapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
          </>
        )}
      </aside>
      )}

      {isMobileMenuOpen && !isLiveStudioMode && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-72 h-full flex flex-col p-5 shadow-2xl"
            style={{ backgroundColor: "var(--bg-sidebar)", borderRight: "1px solid var(--border-primary)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
              {brandingLogoUrl ? (
                <img
                  src={brandingLogoUrl.startsWith("http") ? brandingLogoUrl : `${API_BASE}${brandingLogoUrl}`}
                  alt={`${siteName} Logo`}
                  className="h-6 object-contain object-left"
                  style={{ display: "block" }}
                />
              ) : (
                <img
                  src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                  alt="Eduvantix Logo"
                  className="h-6 object-contain object-left"
                  style={{ display: "block" }}
                />
              )}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg" style={{ color: "var(--text-secondary)" }}>
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5">
              {sidebarLinks.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;
                const isBlocked = link.featureFlag && !hasAccess(link.featureFlag);
                return (
                  <a key={link.href} href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); if (activeSession && link.href !== "/admin/live") handleSafeNavigation(link.href); else router.push(link.href); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)", backgroundColor: isActive ? "var(--bg-hover)" : "transparent", fontWeight: isActive ? 600 : 400 }}
                  >
                    <LinkIcon size={14} style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }} />
                    <span>{link.label}</span>
                    {isBlocked && (
                      <Crown size={12} className="ml-auto text-amber-500 fill-amber-500/20 shrink-0" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!isLiveStudioMode && (
          <header className="flex justify-between items-center px-4 md:px-6 h-14 border-b flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
            <div className="flex items-center gap-3 md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <Menu size={20} />
              </button>
              <Link href="/">
              {brandingLogoUrl ? (
                <img
                  src={brandingLogoUrl.startsWith("http") ? brandingLogoUrl : `${API_BASE}${brandingLogoUrl}`}
                  alt={`${siteName} Logo`}
                  className="h-5 object-contain"
                />
              ) : (
                <img
                  src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                  alt="Eduvantix Logo"
                  className="h-5 object-contain"
                />
              )}
              </Link>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">

            {isStudentSession && <GiftCoupon />}

            {/* ── Pro / Career Mode Toggle ── */}
            <CareerModeToggle />


            {/* ── Universal Notification Bell (all roles) ── */}
            {dashboardUser && (
              <div className="relative">
                <button
                  onClick={() => { setIsNotiOpen(!isNotiOpen); if (!isNotiOpen) fetchNotifications(); }}
                  className="p-2 rounded-xl transition-all relative cursor-pointer"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  title="Notifications"
                >
                  {visibleNotifications.length > 0 ? <BellDot size={16} style={{ color: "var(--accent-primary)" }} /> : <Bell size={16} />}
                  {visibleNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold text-white bg-rose-500 px-0.5 animate-pulse">
                      {visibleNotifications.length > 9 ? "9+" : visibleNotifications.length}
                    </span>
                  )}
                </button>

                {isNotiOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--border-primary)] shadow-2xl z-50 overflow-hidden"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                      {/* Header */}
                      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border-primary)" }}>
                        <div className="flex items-center gap-2">
                          <Bell size={12} style={{ color: "var(--accent-primary)" }} />
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Notifications</span>
                          {visibleNotifications.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              {visibleNotifications.length} new
                            </span>
                          )}
                        </div>
                        {visibleNotifications.length > 0 && (
                          <button
                            onClick={handleDismissAllNoti}
                            className="text-[9px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                          >
                            Dismiss all
                          </button>
                        )}
                      </div>

                      {/* Super Admin: Upgrade Requests section */}
                      {isSuperAdmin && visibleRequests.length > 0 && (
                        <div className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                          <div className="px-3 pt-2 pb-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Upgrade Requests</span>
                          </div>
                          <div className="max-h-32 overflow-y-auto">
                            {visibleRequests.map((req, i) => (
                              <div key={req.id || i} className="px-3 py-2 flex items-start justify-between gap-2 hover:bg-[var(--bg-hover)] transition-colors">
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                                    <ShieldAlert size={10} />
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{req.instituteName}</div>
                                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Requested {req.featureLabel} access</p>
                                  </div>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDismiss(req.id); }}
                                  className="p-1 rounded-md border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-400 transition-all cursor-pointer shrink-0 self-center"
                                  title="Dismiss"
                                >
                                  <Check size={11} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* General notifications */}
                      <div className="max-h-72 overflow-y-auto">
                        {visibleNotifications.length === 0 && (!isSuperAdmin || visibleRequests.length === 0) ? (
                          <div className="p-6 text-center space-y-2">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mx-auto">
                              <Bell size={14} style={{ color: "var(--text-muted)" }} />
                            </div>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>You&apos;re all caught up!</p>
                          </div>
                        ) : visibleNotifications.length === 0 && isSuperAdmin && visibleRequests.length > 0 ? null : (
                          <>
                            {isSuperAdmin && visibleRequests.length > 0 && (
                              <div className="px-3 pt-2 pb-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Activity</span>
                              </div>
                            )}
                            {visibleNotifications.map((noti) => (
                              <div
                                key={noti.id}
                                className="px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-[var(--bg-hover)] transition-colors border-b last:border-0"
                                style={{ borderColor: "var(--border-primary)" }}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm border"
                                    style={{ backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)" }}
                                  >
                                    {NOTI_ICONS[noti.type] || "🔔"}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-semibold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                                      {noti.title}
                                    </div>
                                    <p className="text-[10px] leading-snug mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                                      {noti.body}
                                    </p>
                                    <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>
                                      {new Date(noti.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDismissNoti(noti.id); }}
                                  className="p-1 rounded-md border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-400 transition-all cursor-pointer shrink-0 self-center"
                                  title="Dismiss"
                                >
                                  <Check size={11} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {dashboardUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {dashboardUser.avatarUrl ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--border-primary)] shadow-sm shrink-0">
                      <img src={dashboardUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-[var(--text-on-accent)] shrink-0" style={{ background: "var(--accent-gradient)" }}>
                      {dashboardUser.initials}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                      {dashboardUser.name}
                      {dashboardUser.isVerified && <VerifiedBadge tier={dashboardUser.verifiedBadgeTier} size="sm" showTooltip={false} />}
                    </div>
                    <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{dashboardUser.role}</div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[var(--border-primary)] shadow-xl z-50 overflow-hidden"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>

                      <div className="p-4 border-b" style={{ borderColor: "var(--border-primary)" }}>
                        <div className="flex items-center gap-3">
                          {dashboardUser.avatarUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border-primary)] shadow-md shrink-0">
                              <img src={dashboardUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[var(--text-on-accent)] shrink-0" style={{ background: "var(--accent-gradient)" }}>
                              {dashboardUser.initials}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                              {dashboardUser.name}
                              {dashboardUser.isVerified && <VerifiedBadge tier={dashboardUser.verifiedBadgeTier} size="sm" showTooltip={false} />}
                            </div>
                            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{dashboardUser.role}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 p-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
                        {isStudentSession && (
                          <>
                            <Link href="/student/lists" onClick={() => setIsProfileMenuOpen(false)}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors text-center"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              <span style={{ color: "var(--accent-primary)" }}><BookOpen size={14} /></span>
                              <span className="text-[9px] font-medium">My Lists</span>
                            </Link>
                            <Link href="/student/notebook" onClick={() => setIsProfileMenuOpen(false)}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors text-center"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              <span style={{ color: "var(--accent-primary)" }}><FileText size={14} /></span>
                              <span className="text-[9px] font-medium">Notebook</span>
                            </Link>
                            <Link href="/student/profile" onClick={() => setIsProfileMenuOpen(false)}
                              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors text-center"
                              style={{ color: "var(--text-secondary)" }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              <span style={{ color: "var(--accent-primary)" }}><Activity size={14} /></span>
                              <span className="text-[9px] font-medium">Profile</span>
                            </Link>
                          </>
                        )}
                        <Link href="/settings/ai-providers" onClick={() => setIsProfileMenuOpen(false)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors text-center"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span style={{ color: "var(--accent-primary)" }}><Settings size={14} /></span>
                          <span className="text-[9px] font-medium">Settings</span>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: "var(--border-primary)" }}>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <Paintbrush size={13} />
                          <span>Appearance</span>
                        </div>
                        <div className="scale-[0.85] origin-right"><ThemeToggle /></div>
                      </div>

                      <div className="p-2">
                        <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        >
                          <LogOut size={13} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>
        )}

        <main className={`flex-1 overflow-y-auto ${isLiveStudioMode ? 'bg-[var(--bg-primary)]' : ''}`}>
          <div className={isLiveStudioMode || pathname.startsWith('/courses') ? "h-full flex flex-col min-h-0" : "max-w-7xl mx-auto p-6 md:p-8"}>
            {isFeatureBlocked ? <BlockedScreen /> : children}
          </div>
        </main>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-[var(--border-primary)] border-rose-500/20">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>Sign out?</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>You&apos;ll need to sign back in to access your portal.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button type="button" onClick={() => { setShowLogoutConfirm(false); logout(); router.push("/login"); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">End Session First?</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                You are currently in a live session. Navigating away will end the session for everyone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowEndConfirmModal(false);
                  setPendingNavAction(null);
                }}
                className="flex-1 py-2 px-4 rounded-lg border border-[var(--border-primary)] text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Stay
              </button>
              <button
                onClick={handleConfirmEndSession}
                className="flex-1 py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Toast Container here */}
      <ToastContainer />
    </div>
  );
}

// Outer wrapper that provides BrandingContext
export default function DashboardLayout({ children }) {
  return (
    <BrandingProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </BrandingProvider>
  );
}
