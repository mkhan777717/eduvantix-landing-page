"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, User, GraduationCap, ShieldAlert, LogOut, AlertTriangle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import useThemeStore from "@/store/useThemeStore";

const navItems = [
  { name: "Free Courses", href: "/courses" },
  { name: "Blogs", href: "/journal" },
  { name: "Careers", href: "/careers" },
];

export default function Navbar({ type = 1 }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSignInDropdownOpen, setIsSignInDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  // only needed for full navbar, harmless here

  const userEmailLower = (user?.email || "").toLowerCase();
  const isUserAdmin = user?.role === "ADMIN" || user?.role === "INSTITUTE_ADMIN" || user?.role === "BATCH_MANAGER" || userEmailLower.includes("admin");
  const isUserMentor = user?.role === "MENTOR" || user?.role === "BATCH_MANAGER" || userEmailLower.includes("mentor");

  // Premium motion constants
  const premiumEase = [0.16, 1, 0.3, 1];
  const fastDuration = 0.15;
  const stdDuration = 0.25;
  const largeDuration = 0.45;
  // Read theme reactively from the Zustand store (updated by ThemeToggle)
  const isDark = useThemeStore((state) => state.isDark);

  // Shortcut for the right user/profile panel and dropdown (Desktop style only as asked)
  if (type === 2) {
    return (
      <>
        <div className="fixed top-4 right-6 z-50 flex items-center justify-end gap-3">
          <ThemeToggle />
          {/* Auth User Panel / Sign In Dropdown */}
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => setIsSignInDropdownOpen(true)}
              onMouseLeave={() => setIsSignInDropdownOpen(false)}
            >
              <button
                className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors outline-none cursor-pointer rounded-full border"
                style={{
                  color: isSignInDropdownOpen ? "var(--text-accent)" : "var(--text-secondary)",
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-primary)"
                }}
              >
                <User size={14} className="text-[var(--text-accent)]" />
                <span className="hidden sm:inline">{user.username}</span>
                <motion.span
                  animate={{ rotate: isSignInDropdownOpen ? 180 : 0 }}
                  transition={{ duration: fastDuration, ease: premiumEase }}
                  className="shrink-0"
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isSignInDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: fastDuration, ease: premiumEase }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border-primary)] p-2 shadow-2xl backdrop-blur-xl z-50 text-left"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-primary)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                    }}
                  >
                    <div className="px-3 py-2 text-[10px] font-bold border-b select-none mb-1 text-slate-400" style={{ borderColor: "var(--border-primary)" }}>
                      Logged in as: <span className="text-[var(--text-primary)] block font-mono font-medium truncate">{user.email}</span>
                    </div>

                    {isUserAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                        onClick={() => setIsSignInDropdownOpen(false)}
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                          <ShieldAlert size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            Admin Panel
                          </div>
                          <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            Create contests & problems
                          </div>
                        </div>
                      </Link>
                    )}

                    {isUserMentor && (
                      <Link
                        href="/mentor"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                        onClick={() => setIsSignInDropdownOpen(false)}
                      >
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 shrink-0">
                          <GraduationCap size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            Mentor Portal
                          </div>
                          <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            Review submissions
                          </div>
                        </div>
                      </Link>
                    )}

                    {!isUserAdmin && !isUserMentor && (
                      <Link
                        href="/student/dashboard"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                        onClick={() => setIsSignInDropdownOpen(false)}
                      >
                        <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-500 shrink-0">
                          <User size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            Student Desk
                          </div>
                          <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            Access study room
                          </div>
                        </div>
                      </Link>
                    )}

                    <div className="border-t my-1" style={{ borderColor: "var(--border-primary)" }} />

                    <button
                      onClick={() => {
                        setIsSignInDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-rose-500/10 text-rose-500 transition-all font-bold text-xs cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--text-on-accent)] shadow-md transition-all shrink-0 hover:scale-[1.02] hover:-translate-y-[3px] hover:shadow-xl"
              style={{
                background: "var(--accent-gradient)",
                boxShadow: "0px 6px 20px var(--accent-glow)"
              }}
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: stdDuration, ease: premiumEase }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: stdDuration, ease: premiumEase }}
                className="w-full max-w-sm rounded-3xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-primary)"
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-[var(--border-primary)] border-rose-500/20">
                  <AlertTriangle size={24} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-rose-500">
                    Are u sure want to logout
                  </h3>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    You will need to sign back in to access your Eduvantix account.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2.5 rounded-2xl border border-[var(--border-primary)] text-xs font-bold transition-all hover:bg-[var(--bg-primary)] premium-glass cursor-pointer text-[var(--text-secondary)]"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      logout();
                      router.push("/");
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default Navbar (type undefined or anything else)
  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: largeDuration, ease: premiumEase }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto w-[95%] md:w-[90%] max-w-[1310px] rounded-full px-6 py-0 md:px-8 h-16 flex items-center"
        style={{
          background: isDark
            ? "rgba(16, 18, 36, 0.7)"
            : "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1.5px solid var(--border-primary)",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.38)"
            : "0 8px 32px rgba(208, 215, 236, 0.18)",
          // Optional: softer edge for glass
          // borderRadius: "9999px",
        }}
      >
        <div className="w-full">
          <nav
            className="relative flex items-center justify-between h-16"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-start cursor-pointer"

              style={{ color: "var(--text-primary)" }}
            >
              <div className="w-full">
                <img
                  src={isDark ? "/logo-white-text.webp" : "/logo-black-text.webp"}
                  alt="Eduvantix Logo"
                  className="h-7 w-full object-contain"
                  style={{ display: "block" }}
                />
              </div>
            </Link>

            <ul className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <li key={item.name} className="relative">
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer relative"
                      style={{
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--text-primary)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-underline"
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                          style={{ backgroundColor: "var(--accent-primary, #10b981)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right: CTA */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {/* Auth User Panel / Sign In Dropdown */}
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsSignInDropdownOpen(true)}
                  onMouseLeave={() => setIsSignInDropdownOpen(false)}
                >
                  <button
                    className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors outline-none curser-pointer rounded-full border"
                    style={{
                      color: isSignInDropdownOpen ? "var(--text-accent)" : "var(--text-secondary)",
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-primary)",
                    }}
                  >
                    <User size={14} className="text-[var(--text-accent)]" />
                    <span>{user.username}</span>
                    <motion.span
                      animate={{ rotate: isSignInDropdownOpen ? 180 : 0 }}
                      transition={{ duration: fastDuration, ease: premiumEase }}
                      className="shrink-0"
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isSignInDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: fastDuration, ease: premiumEase }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border-primary)] p-2 shadow-2xl backdrop-blur-xl z-50 text-left"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          borderColor: "var(--border-primary)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
                        }}
                      >
                        <div className="px-3 py-2 text-[10px] font-bold border-b select-none mb-1 text-slate-400" style={{ borderColor: "var(--border-primary)" }}>
                          Logged in as: <span className="text-[var(--text-primary)] block font-mono font-medium truncate">{user.email}</span>
                        </div>

                        {isUserAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                            onClick={() => setIsSignInDropdownOpen(false)}
                          >
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                              <ShieldAlert size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                Admin Panel
                              </div>
                              <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                Create contests & problems
                              </div>
                            </div>
                          </Link>
                        )}

                        {isUserMentor && (
                          <Link
                            href="/mentor"
                            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                            onClick={() => setIsSignInDropdownOpen(false)}
                          >
                            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 shrink-0">
                              <GraduationCap size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                Mentor Portal
                              </div>
                              <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                Review submissions
                              </div>
                            </div>
                          </Link>
                        )}

                        {!isUserAdmin && !isUserMentor && (
                          <Link
                            href="/student/dashboard"
                            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-500/5 transition-all"
                            onClick={() => setIsSignInDropdownOpen(false)}
                          >
                            <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-500 shrink-0">
                              <User size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                Student Desk
                              </div>
                              <div className="text-[9px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                Access study room
                              </div>
                            </div>
                          </Link>
                        )}

                        <div className="border-t my-1" style={{ borderColor: "var(--border-primary)" }} />

                        <button
                          onClick={() => {
                            setIsSignInDropdownOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-rose-500/10 text-rose-500 transition-all font-bold text-xs cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--text-on-accent)] shadow-md transition-all shrink-0 hover:scale-[1.02] hover:-translate-y-[3px] hover:shadow-xl"
                  style={{
                    background: "var(--accent-gradient)",
                    boxShadow: "0px 6px 20px var(--accent-glow)"
                  }}
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-1 focus:outline-none"
                style={{ color: "var(--text-secondary)" }}
              >
                {isOpen ? <span>X</span> : <span>☰</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: premiumEase }}
              className="absolute left-0 right-0 top-16 z-40 overflow-hidden border-b p-6 shadow-xl md:hidden"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                backdropFilter: "blur(16px)",
              }}
            >
              <ul className="flex flex-col space-y-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center text-base transition-colors relative pb-1"
                        style={{
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          fontWeight: isActive ? 700 : 600,
                        }}
                      >
                        <span>{item.name}</span>
                        {isActive && (
                          <span
                            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                            style={{ backgroundColor: "var(--accent-primary, #10b981)" }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}

                {user ? (
                  <>
                    <li className="text-[10px] font-bold uppercase tracking-wider pl-1" style={{ color: "var(--text-muted)" }}>
                      Hello, {user.username}
                    </li>
                    {isUserAdmin && (
                      <li>
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 text-sm font-bold pl-2 transition-colors hover:text-[var(--text-accent)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <ShieldAlert size={14} className="text-emerald-500" />
                          <span>Admin Control</span>
                        </Link>
                      </li>
                    )}
                    {isUserMentor && (
                      <li>
                        <Link
                          href="/mentor"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 text-sm font-bold pl-2 transition-colors hover:text-[var(--text-accent)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <GraduationCap size={14} className="text-violet-500" />
                          <span>Mentor Board</span>
                        </Link>
                      </li>
                    )}
                    {!isUserAdmin && !isUserMentor && (
                      <li>
                        <Link
                          href="/student/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 text-sm font-bold pl-2 transition-colors hover:text-[var(--text-accent)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <User size={14} className="text-zinc-500" />
                          <span>Student Portal</span>
                        </Link>
                      </li>
                    )}
                    <li className="pt-2 flex justify-between items-center border-t" style={{ borderColor: "var(--border-primary)", marginTop: "8px", paddingTop: "8px" }}>
                      <span className="text-sm font-bold pl-2" style={{ color: "var(--text-secondary)" }}>Theme</span>
                      <ThemeToggle />
                    </li>
                    <li className="pt-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3 font-semibold text-rose-500 border border-[var(--border-primary)] border-rose-500/20 bg-rose-500/5 cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="pt-2 flex justify-between items-center border-t" style={{ borderColor: "var(--border-primary)", marginTop: "8px", paddingTop: "8px" }}>
                      <span className="text-sm font-bold pl-2" style={{ color: "var(--text-secondary)" }}>Theme</span>
                      <ThemeToggle />
                    </li>
                    <li className="pt-2">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-center space-x-2 rounded-xl py-3 font-semibold text-[var(--text-on-accent)] shadow-lg hover:opacity-90 transition-all"
                        style={{ background: "var(--accent-gradient)" }}
                      >
                        <User size={16} />
                        <span>Sign In</span>
                        <ArrowRight size={16} />
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: stdDuration, ease: premiumEase }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: stdDuration, ease: premiumEase }}
              className="w-full max-w-sm rounded-3xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)"
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-[var(--border-primary)] border-rose-500/20">
                <AlertTriangle size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-rose-500">
                  Are u sure want to logout
                </h3>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  You will need to sign back in to access your Eduvantix account.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2.5 rounded-2xl border border-[var(--border-primary)] text-xs font-bold transition-all hover:bg-[var(--bg-primary)] premium-glass cursor-pointer text-[var(--text-secondary)]"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                    router.push("/");
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
