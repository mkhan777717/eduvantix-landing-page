"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PublicJournalLayout from "@/components/journal/layout/PublicJournalLayout";

export default function JournalLayoutWrapper({ children }) {
  const { user, loading } = useAuth();

  // While auth is resolving, show in public layout (avoids flash of wrong layout)
  if (loading) {
    return (
      <PublicJournalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#10b981", borderTopColor: "transparent" }}
          />
        </div>
      </PublicJournalLayout>
    );
  }

  // Logged in → use full Dashboard layout with sidebar
  if (user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Not logged in → use public layout (no sidebar)
  return <PublicJournalLayout>{children}</PublicJournalLayout>;
}
