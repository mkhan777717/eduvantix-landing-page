"use client";

import React, { useState } from "react";
import { FileText, Plus } from "lucide-react";

export default function NotebookPage() {
  const [notes, setNotes] = useState([
    { id: 1, title: "Graph Algorithms Summary", snippet: "Dijkstra's is used for shortest path on weighted graphs..." },
    { id: 2, title: "Dynamic Programming Patterns", snippet: "The 0/1 Knapsack problem usually requires a 2D DP array..." }
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in px-0 sm:px-6 pb-12">
      <section className="flex flex-col gap-2 border-b pb-6 shrink-0" style={{ borderColor: "var(--border-primary)" }}>
        <div className="flex items-center justify-between">
          <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[var(--text-on-accent)] transition-transform hover:-translate-y-0.5 shadow-md"
            style={{ background: "var(--accent-primary)" }}>
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>
        <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>My Notebook</h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Store your important algorithms, ideas, and notes.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {notes.map(note => (
          <div key={note.id} className="p-6 rounded-2xl border border-[var(--border-primary)] shadow-sm cursor-pointer transition-colors hover:bg-[var(--bg-secondary)]" 
               style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{note.title}</h3>
            <p className="text-xs line-clamp-3" style={{ color: "var(--text-secondary)" }}>{note.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
