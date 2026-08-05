"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function JournalHeaderActions() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

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
      <Link
        href="/journal/write"
        className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 text-white transition-opacity hover:opacity-90 shadow-sm"
        style={{ fontFamily: "var(--j-font-mono)", background: "var(--j-accent)" }}
      >
        Write Article
      </Link>
      <Link
        href="/journal/dashboard"
        className="px-4 py-2 rounded-full text-xs font-medium border transition-colors hover:border-[var(--j-accent)]"
        style={{
          fontFamily: "var(--j-font-mono)",
          borderColor: "var(--j-border)",
          color: "var(--j-text)",
        }}
      >
        Author Dashboard
      </Link>
    </div>
  );
}
