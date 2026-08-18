"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, X, Check, Loader2 } from "lucide-react";
import useThemeStore from "@/store/useThemeStore";
import { getApiBase } from "@/utils/api";

export default function LandingFinalCTANew() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? "#000000" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#111111";
  const secondary = isDark ? "#888888" : "#666666";
  const border = isDark ? "#1C1C1C" : "#ECECEC";

  const [proModalOpen, setProModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", description: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const openModal = () => {
    setFormData({ name: "", email: "", phone: "", description: "" });
    setFormStatus("idle");
    setProModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("submitting");
    try {
      const res = await fetch(`${getApiBase()}/api/auth/request-pro-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setFormStatus(res.ok && data.success ? "success" : "error");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <section className="px-6 sm:px-10 py-32 text-center border-t" style={{ backgroundColor: bg, borderColor: border }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#10b981" }}
        >
          Start Your Journey
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.06 }}
          style={{
            color: text,
            fontSize: "clamp(2.25rem, 5vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Inter', sans-serif`,
          }}
        >
          One platform. Every learner.<br />One clearer path forward.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{
            color: secondary,
            fontSize: "1.15rem",
            lineHeight: 1.65,
            maxWidth: "38rem",
            marginTop: "1.5rem",
          }}
        >
          Whether you&apos;re starting your own journey or building a better learning ecosystem for your institute, Eduvantix brings everything together.
        </motion.p>

        {/* 3 Clear Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mt-10"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-95 shadow-sm"
            style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
          >
            Start Learning Free
            <ArrowRight size={15} />
          </Link>

          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-85 active:scale-95 shadow-sm"
            style={{
              backgroundColor: isDark ? "#1C1C1C" : "#111111",
              color: "#FFFFFF",
              border: `1px solid ${border}`,
            }}
          >
            <Sparkles size={14} className="text-blue-400" />
            Explore Pro
          </button>

          <a
            href="mailto:hello@eduvantix.com?subject=Institute+Partnership+Request"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-75"
            style={{
              backgroundColor: "transparent",
              color: text,
              border: `1.5px solid ${border}`,
            }}
          >
            Partner With Eduvantix
          </a>
        </motion.div>
      </div>

      {/* BE THE FIRST TO USE IT Modal */}
      <AnimatePresence>
        {proModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative w-full max-w-[520px] rounded-2xl p-8 border shadow-2xl z-10 text-left"
              style={{
                backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
                borderColor: "rgba(16,185,129,0.4)",
                color: isDark ? "#FFFFFF" : "#111111",
              }}
            >
              <button
                onClick={() => setProModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors hover:opacity-70"
                style={{ color: isDark ? "#888" : "#666" }}
              >
                <X size={18} />
              </button>

              {formStatus === "success" ? (
                <div className="text-center py-10 space-y-5">
                  <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                    <Check size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">You&apos;re on the list!</h3>
                  <p className="text-sm" style={{ color: isDark ? "#888" : "#666" }}>We&apos;ll notify you the moment Pro features go live.</p>
                  <button onClick={() => setProModalOpen(false)} className="px-8 py-3 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "#059669" }}>
                    Got it, thanks!
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-500">Pro Features Coming Soon</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight leading-tight">
                      BE THE FIRST TO{" "}
                      <span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        USE IT.
                      </span>
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                      { label: "Name", key: "name", type: "text", placeholder: "Your full name" },
                      { label: "Email ID", key: "email", type: "email", placeholder: "you@domain.com" },
                      { label: "Mobile (with country code)", key: "phone", type: "tel", placeholder: "+91 99999 99999" },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? "#666" : "#888" }}>{label}</label>
                        <input
                          type={type}
                          required
                          value={formData[key]}
                          onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
                          style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", border: `1px solid ${isDark ? "#1C1C1C" : "#E4E4E7"}`, color: isDark ? "#FFF" : "#111" }}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? "#666" : "#888" }}>What do you want to access?</label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="E.g., AI career suite, live interviews..."
                        className="w-full px-4 py-2.5 text-sm rounded-xl outline-none resize-none"
                        style={{ backgroundColor: isDark ? "#111" : "#F4F4F5", border: `1px solid ${isDark ? "#1C1C1C" : "#E4E4E7"}`, color: isDark ? "#FFF" : "#111" }}
                      />
                    </div>
                    {formStatus === "error" && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ backgroundColor: "#059669" }}
                    >
                      {formStatus === "submitting" && <Loader2 size={15} className="animate-spin" />}
                      {formStatus === "submitting" ? "Submitting..." : "Request Early Access"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
