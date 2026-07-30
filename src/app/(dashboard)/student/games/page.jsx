"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Compass, Award, Clock, ArrowRight, ArrowLeft, CheckCircle2, Info, X, Zap, Target, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gamesRegistry } from "@/lib/games/registry";

const gameInstructions = {
  "quiz-blitz": {
    objective: "Test your coding knowledge under pressure in a fast-paced timed trivia challenge.",
    steps: [
      "Select a subject track (e.g., JavaScript, Python, CSS) to begin.",
      "Read each multiple-choice question and click the correct answer.",
      "A ticking timer countdown runs for each question. Speed is rewarded!",
      "Answering correctly builds your Streak Multiplier, compounding your score.",
      "The game ends when all levels/questions are answered or time runs out."
    ],
    proTip: "Maintain your streak! Getting answers wrong resets your score multiplier."
  },
  "code-match": {
    objective: "Improve your technical vocabulary by matching programming terms with their definitions.",
    steps: [
      "A grid of facedown neon cards will be displayed.",
      "Click a card to flip it and reveal either a programming term or a definition.",
      "Click another card to find its matching partner.",
      "If they match, they remain flipped open. If not, they turn facedown again.",
      "Match all pairs in the grid in the fewest turns possible to win."
    ],
    proTip: "Focus on memorizing card locations. A low move count earns higher ranking stars."
  },
  "flex-dojo": {
    objective: "Master CSS Flexbox layout values interactively by aligning items in visual puzzle grids.",
    steps: [
      "You will see visual elements and dashed 'ghost targets' representing where they should go.",
      "Write or select Flexbox CSS rules (like justify-content, align-items, flex-direction) in the console.",
      "Your elements will move in real-time as you write CSS code.",
      "Match all items to their correct target positions to pass each level."
    ],
    proTip: "Remember that changing flex-direction (e.g., from row to column) swaps the main axis and cross axis behaviors."
  },
  "debug-the-bug": {
    objective: "Act as a code reviewer to find and fix syntactic, logical, or runtime errors in code modules.",
    steps: [
      "An editor workspace displays a short function containing one or more bugs.",
      "Analyze the code structure, read the instructions, and identify what is broken.",
      "Edit the code directly in the code window to correct the bugs.",
      "Run the compiler tests. Once all test cases pass green, you can advance to the next level."
    ],
    proTip: "Look closely at console error logs and test outputs to pinpoint exactly where the code is returning incorrect values."
  },
  "type-racer": {
    objective: "Level up your muscle memory and typing speed for real-world syntax.",
    steps: [
      "A snippet of Python or JavaScript code will be shown on the screen.",
      "Begin typing the code exactly as written, including indentation, parentheses, and brackets.",
      "The system monitors your typing real-time. Typos will lock typing progress until you backspace and correct them.",
      "Complete the snippet to see your final Words Per Minute (WPM) speed and accuracy percentage."
    ],
    proTip: "Keep your eyes on the next characters instead of your keyboard, and focus on accuracy first — speed will follow."
  },
  "code-fill-in": {
    objective: "Test your quick reading comprehension of syntax patterns by filling in the missing code blanks.",
    steps: [
      "A code snippet is loaded with a missing blank placeholder marked as '___'.",
      "Look at the choices displayed below the code block.",
      "Click the correct option (e.g. `let`, `map`, `return`, `===`) to complete the code correctly.",
      "Answer quickly to earn speed score bonuses before the timer runs out."
    ],
    proTip: "Quickly scan variables, function calls, and control structures to infer what data type or keyword is expected in the missing slot."
  },
  "sql-dojo": {
    objective: "Learn relational database query writing against interactive tables.",
    steps: [
      "A database schema, visual tables, and a query prompt are provided.",
      "Write actual SQL queries (such as SELECT, WHERE, GROUP BY, JOIN) in the query editor.",
      "Execute the query. The system runs it against an in-memory SQL database and shows the resulting table.",
      "Compare your output table with the expected target table. If they match, the level is unlocked."
    ],
    proTip: "Start with simple SELECT statements, check your columns, and then incrementally add conditions or aggregations to debug step-by-step."
  }
};

export default function GamesHubPage() {
  const router = useRouter();
  const [filterTrack, setFilterTrack] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [progressMap, setProgressMap] = useState({});
  const [selectedGameInfo, setSelectedGameInfo] = useState(null);

  // Fetch progress for each game from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const progress = {};
      gamesRegistry.forEach(game => {
        const key = `game_progress_${game.slug}`;
        const data = localStorage.getItem(key);
        if (data) {
          try {
            progress[game.slug] = JSON.parse(data);
          } catch (e) {
            console.error("Failed to parse progress for", game.slug, e);
          }
        }
      });
      setProgressMap(progress);
    }
  }, []);

  // Extract unique tracks
  const tracks = ["All", ...new Set(gamesRegistry.map(g => g.track))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // Filter games registry
  const filteredGames = gamesRegistry.filter(game => {
    const matchesTrack = filterTrack === "All" || game.track === filterTrack;
    const matchesDiff = filterDifficulty === "All" || game.difficulty === filterDifficulty;
    return matchesTrack && matchesDiff;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-[#7CFFB2] bg-[#7CFFB2]/10 border-[#7CFFB2]/20";
      case "Intermediate":
        return "text-[#FFB86B] bg-[#FFB86B]/10 border-[#FFB86B]/20";
      case "Advanced":
        return "text-[#FF6B6B] bg-[#FF6B6B]/10 border-[#FF6B6B]/20";
      default:
        return "text-[#6B7080] bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Top Arcade Navigation Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 shrink-0 mb-8" style={{ borderColor: "var(--border-primary)" }}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--border-primary)] mb-3 w-fit"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
            <Gamepad2 size={12} className="text-violet-500 animate-pulse" />
            ARCADE
          </div>
          <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
            Eduvantix Arcade
          </h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Level up your engineering skills through interactive, edge-to-edge game arenas. Solve layout puzzles, repair code bases, and hack endpoints in real-time.
          </p>
        </div>
      </section>

      <div className="space-y-8 relative z-10">
        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-primary)] shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
          {/* Track Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider mr-2" style={{ color: "var(--text-muted)" }}>
              Track:
            </span>
            {tracks.map(track => (
              <button
                key={track}
                onClick={() => setFilterTrack(track)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[var(--border-primary)] ${
                  filterTrack === track
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                    : "bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Difficulty Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider mr-2" style={{ color: "var(--text-muted)" }}>
              Difficulty:
            </span>
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-[var(--border-primary)] ${
                  filterDifficulty === diff
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                    : "bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, idx) => {
              const isLive = game.status === "live";
              const prog = progressMap[game.slug];
              const completedCount = prog?.completedLevels?.length || 0;
              const isFullyCompleted = game.totalLevels
                ? completedCount === game.totalLevels
                : (game.slug === "flex-dojo" && completedCount === 8) ||
                  (game.slug === "debug-the-bug" && completedCount === 5);
              
              return (
                <motion.div
                  key={game.slug}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-[var(--border-primary)] p-6 flex flex-col justify-between space-y-6 transition-all hover:shadow-md bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                  style={{ borderColor: "var(--border-primary)",  backgroundColor: "var(--bg-card)" }}
                >
                  {/* Top Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        {game.track}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-[var(--border-primary)] ${
                        game.difficulty === "Beginner" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
                        game.difficulty === "Intermediate" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" :
                        "border-rose-500/30 bg-rose-500/10 text-rose-500"
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <span>{game.title}</span>
                        {isLive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGameInfo(game);
                            }}
                            className="p-1 rounded-lg text-purple-400 hover:text-purple-200 hover:bg-purple-500/10 transition-colors cursor-pointer flex items-center justify-center"
                            title="How to play"
                          >
                            <Info size={15} />
                          </button>
                        )}
                        {isFullyCompleted && (
                          <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />
                        )}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats & Launch Action */}
                  <div className="flex items-center justify-between border-t pt-4 mt-auto" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex items-center space-x-4 text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{game.estimatedMinutes} Mins</span>
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1 font-bold text-emerald-500">
                          <Award size={12} />
                          <span>
                            {game.totalLevels
                              ? `${completedCount}/${game.totalLevels} Levels`
                              : game.slug === "flex-dojo"
                              ? `${completedCount}/8 Levels`
                              : game.slug === "debug-the-bug"
                              ? `${completedCount}/5 Levels`
                              : `${completedCount} Completed`}
                          </span>
                        </span>
                      )}
                    </div>

                    {isLive ? (
                      <button
                        onClick={() => router.push(`/student/games/${game.slug}`)}
                        className="px-4 py-2 rounded-xl font-semibold text-xs text-[var(--text-on-accent)] transition-transform hover:-translate-y-0.5 shadow-md cursor-pointer flex items-center gap-1.5"
                        style={{ background: "var(--accent-primary)" }}
                      >
                        <span>Start</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg font-bold text-xs border border-[var(--border-primary)] cursor-not-allowed select-none"
                        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-muted)" }}>
                        Locked
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Modal overlay */}
      <AnimatePresence>
        {selectedGameInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGameInfo(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border p-6 shadow-2xl z-10"
              style={{ 
                backgroundColor: "var(--bg-card)", 
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)"
              }}
            >
              {/* Decorative accent side line */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "var(--accent-gradient)" }} />

              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-20" style={{ background: "var(--accent-glow)" }} />

              {/* Close Button */}
              <button
                onClick={() => setSelectedGameInfo(null)}
                className="absolute right-4 top-4 p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105"
                style={{ 
                  borderColor: "var(--border-primary)", 
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-secondary)"
                }}
              >
                <X size={16} />
              </button>

              <div className="space-y-5 pl-3">
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {selectedGameInfo.track}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>•</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      selectedGameInfo.difficulty === "Beginner" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
                      selectedGameInfo.difficulty === "Intermediate" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" :
                      "border-rose-500/30 bg-rose-500/10 text-rose-500"
                    }`}>
                      {selectedGameInfo.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Gamepad2 size={20} style={{ color: "var(--accent-primary)" }} />
                    {selectedGameInfo.title}
                  </h3>
                </div>

                {/* Objective */}
                <div className="space-y-2 rounded-2xl p-4 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--accent-primary)" }}>
                    <Target size={12} style={{ color: "var(--accent-primary)" }} />
                    Objective
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {gameInstructions[selectedGameInfo.slug]?.objective || selectedGameInfo.description}
                  </p>
                </div>

                {/* How to Play */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <HelpCircle size={12} style={{ color: "var(--text-muted)" }} />
                    How to Play
                  </h4>
                  <ul className="space-y-2">
                    {(gameInstructions[selectedGameInfo.slug]?.steps || [
                      "Start the game arena.",
                      "Read instructions and solve challenges.",
                      "Submit solutions to unlock next levels."
                    ]).map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span 
                          className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mt-0.5 border"
                          style={{ 
                            backgroundColor: "var(--accent-glow)", 
                            borderColor: "var(--border-primary)",
                            color: "var(--accent-primary)"
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Tip */}
                {gameInstructions[selectedGameInfo.slug]?.proTip && (
                  <div className="space-y-1.5 rounded-2xl p-4 border" style={{ backgroundColor: "var(--accent-glow)", borderColor: "var(--border-primary)" }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--accent-primary)" }}>
                      <Zap size={12} style={{ color: "var(--accent-primary)" }} />
                      Pro Tip
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {gameInstructions[selectedGameInfo.slug].proTip}
                    </p>
                  </div>
                )}

                {/* Got it button */}
                <div className="pt-1">
                  <button
                    onClick={() => setSelectedGameInfo(null)}
                    className="w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                    style={{ background: "var(--accent-gradient)", color: "var(--text-on-accent)" }}
                  >
                    <span>Got it, Let's Play!</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
