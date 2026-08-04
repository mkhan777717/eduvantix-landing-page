"use client";

import { useState } from "react";
import { getApiBase } from "@/utils/api";

const API = getApiBase();

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/journal/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubscribed(true);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <p className="j-mono text-sm" style={{ color: "var(--j-accent)" }}>
        ✓ You&apos;re subscribed to weekly engineering insights!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        id="homepage-newsletter-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2.5 rounded-md border outline-none transition-colors focus:border-[var(--j-accent)]"
        style={{
          fontFamily: "var(--j-font-mono)",
          background: "var(--j-bg-card)",
          borderColor: "var(--j-border)",
          color: "var(--j-text)",
          fontSize: "0.875rem",
        }}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{
          fontFamily: "var(--j-font-mono)",
          background: "var(--j-accent)",
          color: "#ffffff",
        }}
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
