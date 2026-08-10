"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function MyListsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in px-0 sm:px-6 pb-12">
      <section className="flex flex-col gap-2 border-b pb-6 shrink-0" style={{ borderColor: "var(--border-primary)" }}>
        <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>My Lists</h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Create and organize collections of problems, materials, and notes.
        </p>
      </section>

      <div className="p-12 text-center rounded-2xl border border-[var(--border-primary)] shadow-sm mt-6" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>No lists created yet</h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>Create lists to organize your favorite problems, articles, and interview preparation materials.</p>
        <button className="px-6 py-2.5 rounded-xl font-semibold text-sm text-[var(--text-on-accent)] transition-transform hover:-translate-y-0.5 shadow-md cursor-pointer"
          style={{ background: "var(--accent-primary)" }}>
          Create New List
        </button>
      </div>
    </div>
  );
}
