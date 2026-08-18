"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function JournalHeaderActions() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  // Redirect guests to login with a redirect back
  const handleGuestClick = (e, destination) => {
    if (!user) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 shrink-0">
      {isSuperAdmin && (
        <Link
          href="/journal/admin"
          className="px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors hover:border-[var(--j-accent)]"
          style={{
            fontFamily: "var(--j-font-mono)",
            borderColor: "var(--j-border)",
            background: "var(--j-bg-secondary)",
            color: "var(--j-accent)",
          }}
        >
          Admin Moderation
        </Link>
      )}

      {/* Write Blog — blocked for guests */}
      <Link
        href={user ? "/journal/write" : "/login?redirect=/journal/write"}
        onClick={(e) => handleGuestClick(e, "/journal/write")}
        className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 text-white transition-opacity hover:opacity-90 shadow-sm"
        style={{
          fontFamily: "var(--j-font-mono)",
          background: "var(--j-accent)",
          opacity: user ? 1 : 0.75,
          cursor: user ? "pointer" : "pointer",
        }}
        title={!user ? "Sign in to write a blog" : undefined}
      >
        Write Blog
      </Link>

      {/* Author Dashboard — blocked for guests */}
      <Link
        href={user ? "/journal/dashboard" : "/login?redirect=/journal/dashboard"}
        onClick={(e) => handleGuestClick(e, "/journal/dashboard")}
        className="px-4 py-2 rounded-full text-xs font-medium border transition-colors hover:border-[var(--j-accent)]"
        style={{
          fontFamily: "var(--j-font-mono)",
          borderColor: "var(--j-border)",
          color: "var(--j-text)",
          opacity: user ? 1 : 0.65,
        }}
        title={!user ? "Sign in to access your dashboard" : undefined}
      >
        Author Dashboard
      </Link>
    </div>
  );
}
