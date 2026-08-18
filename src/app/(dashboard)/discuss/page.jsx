"use client";

import React, { Suspense } from "react";
import DiscussionFeed from "@/components/discuss/DiscussionFeed";
import DiscussSidebar from "@/components/discuss/DiscussSidebar";
import NotificationBell from "@/components/discuss/NotificationBell";

export default function DiscussPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--text-muted)]">Loading forum...</div>}>
      <div className="space-y-6 min-h-0 flex flex-col flex-1 animate-in fade-in duration-500" style={{ color: "var(--text-primary)" }}>
        {/* Header section */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-title)" }}>
              Community Discussions
            </h1>
            <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Join the community, solve problems together, share interview experiences, and discuss tech topics.
            </p>
          </div>
          <NotificationBell />
        </section>

        {/* Main Grid: Feed + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <DiscussionFeed />
          </div>

          <DiscussSidebar activeTab="feed" />
        </div>
      </div>
    </Suspense>
  );
}
