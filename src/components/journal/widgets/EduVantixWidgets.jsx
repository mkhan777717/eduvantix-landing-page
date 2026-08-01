import Link from "next/link";
import { ArrowRight, Code, BookOpen, Trophy, MessageSquare, Zap, BarChart2 } from "lucide-react";

// ─── Try This Problem widget ──────────────────────────────────────────────────

export function TryThisProblem({ problem }) {
  if (!problem) return null;

  const diffColor = {
    EASY:   { color: "#1A7340", bg: "rgba(26, 115, 64, 0.1)" },
    MEDIUM: { color: "#C97A1A", bg: "rgba(201, 122, 26, 0.1)" },
    HARD:   { color: "#C0392B", bg: "rgba(192, 57, 43, 0.1)" },
  }[problem.difficulty?.toUpperCase()] || { color: "#5B6472", bg: "rgba(91, 100, 114, 0.1)" };

  return (
    <div className="j-widget">
      <p className="j-widget-eyebrow">Try This Problem</p>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p
            className="text-base font-semibold mb-2"
            style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
          >
            {problem.title}
          </p>
          <span
            className="j-mono text-xs px-2 py-0.5 rounded"
            style={{ color: diffColor.color, background: diffColor.bg }}
          >
            {problem.difficulty}
          </span>
        </div>
        <Link
          href={`/practice/${problem.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap shrink-0 transition-opacity hover:opacity-80"
          style={{
            fontFamily: "var(--j-font-mono)",
            background: "var(--j-accent)",
            color: "#ffffff",
            fontSize: "0.8125rem",
          }}
        >
          Solve Now
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ─── Related Problems widget ──────────────────────────────────────────────────

export function RelatedProblems({ problems }) {
  if (!problems?.length) return null;

  return (
    <div className="j-widget">
      <div className="flex items-center gap-2 mb-4">
        <Code size={14} style={{ color: "var(--j-eyebrow)" }} />
        <p className="j-widget-eyebrow" style={{ margin: 0 }}>Practice Problems</p>
      </div>
      <div className="space-y-0">
        {problems.map(({ problem, order }) => (
          <Link
            key={problem.id}
            href={`/practice/${problem.slug}`}
            className="flex items-center justify-between py-2.5 border-b hover:opacity-75 transition-opacity group"
            style={{ borderColor: "var(--j-border-subtle)" }}
          >
            <span
              className="text-sm group-hover:underline"
              style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text)", textUnderlineOffset: "2px" }}
            >
              {problem.title}
            </span>
            <span
              className="j-mono text-[11px] ml-3 shrink-0"
              style={{
                color: problem.difficulty === "HARD" ? "#C0392B" : problem.difficulty === "MEDIUM" ? "#C97A1A" : "#1A7340",
              }}
            >
              {problem.difficulty}
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/practice"
        className="inline-flex items-center gap-1 mt-4 text-xs hover:underline"
        style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
      >
        More practice problems <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ─── Related Course widget ────────────────────────────────────────────────────

export function RelatedCourse({ course }) {
  if (!course) return null;

  return (
    <div className="j-widget">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={14} style={{ color: "var(--j-eyebrow)" }} />
        <p className="j-widget-eyebrow" style={{ margin: 0 }}>Related Course</p>
      </div>
      <div className="flex items-start gap-3">
        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-14 h-14 rounded object-cover border shrink-0"
            style={{ borderColor: "var(--j-border)" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p
            className="text-base font-semibold leading-snug mb-1"
            style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
          >
            {course.title}
          </p>
          <span
            className="j-mono text-[11px]"
            style={{ color: course.isFree ? "#1A7340" : "var(--j-eyebrow)" }}
          >
            {course.isFree ? "Free" : "Premium"}
          </span>
        </div>
      </div>
      <Link
        href={`/courses/${course.slug}`}
        className="inline-flex items-center gap-1.5 mt-4 px-4 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 border"
        style={{
          fontFamily: "var(--j-font-mono)",
          color: "var(--j-accent)",
          borderColor: "var(--j-accent)",
          fontSize: "0.8125rem",
        }}
      >
        Continue Learning <ArrowRight size={13} />
      </Link>
    </div>
  );
}

// ─── Related Contest widget ───────────────────────────────────────────────────

export function RelatedContest({ contest }) {
  if (!contest) return null;

  const isLive = new Date(contest.startTime) <= new Date() && new Date(contest.endTime) >= new Date();
  const isUpcoming = new Date(contest.startTime) > new Date();

  return (
    <div className="j-widget">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} style={{ color: "var(--j-eyebrow)" }} />
        <p className="j-widget-eyebrow" style={{ margin: 0 }}>Related Contest</p>
      </div>
      <p
        className="text-base font-semibold mb-2"
        style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
      >
        {contest.title}
      </p>
      <div className="flex items-center gap-2 mb-4">
        {isLive && (
          <span
            className="j-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1"
            style={{ color: "#1A7340", background: "rgba(26,115,64,0.1)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Live Now
          </span>
        )}
        {isUpcoming && (
          <span
            className="j-mono text-[11px]"
            style={{ color: "var(--j-text-muted)" }}
          >
            {new Date(contest.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
      <Link
        href={`/contest/${contest.slug}`}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          fontFamily: "var(--j-font-mono)",
          background: isLive ? "var(--j-accent)" : "var(--j-bg-secondary)",
          color: isLive ? "#ffffff" : "var(--j-accent)",
          border: isLive ? "none" : "1px solid var(--j-accent)",
          fontSize: "0.8125rem",
        }}
      >
        {isLive ? "Join Contest" : "Register"} <ArrowRight size={13} />
      </Link>
    </div>
  );
}

// ─── Related Discussion widget ────────────────────────────────────────────────

export function RelatedDiscussion({ discussion }) {
  if (!discussion) return null;

  return (
    <div className="j-widget">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} style={{ color: "var(--j-eyebrow)" }} />
        <p className="j-widget-eyebrow" style={{ margin: 0 }}>Join the Discussion</p>
      </div>
      <Link
        href={`/discuss/${discussion.slug}`}
        className="group"
      >
        <p
          className="text-base font-medium leading-snug mb-2 group-hover:underline"
          style={{
            fontFamily: "var(--j-font-reading)",
            color: "var(--j-text)",
            textUnderlineOffset: "2px",
          }}
        >
          {discussion.title}
        </p>
      </Link>
      <span
        className="j-mono text-[11px]"
        style={{ color: "var(--j-text-muted)" }}
      >
        {discussion.upvoteCount} upvotes
      </span>
    </div>
  );
}

// ─── AI Summary widget ────────────────────────────────────────────────────────

export function AISummary({ summary }) {
  if (!summary) return null;

  const bullets = typeof summary === "string"
    ? summary.split("\n").filter(Boolean)
    : Array.isArray(summary) ? summary : [];

  if (!bullets.length) return null;

  return (
    <div
      className="j-widget"
      style={{ borderColor: "var(--j-accent)", borderLeftWidth: "3px", borderRadius: "0 8px 8px 0" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} style={{ color: "var(--j-accent)" }} />
        <p
          className="text-xs font-medium uppercase tracking-widest"
          style={{ fontFamily: "var(--j-font-mono)", color: "var(--j-accent)" }}
        >
          AI Summary
        </p>
      </div>
      <ul className="space-y-2">
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm leading-relaxed"
            style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text-secondary)" }}
          >
            <span style={{ color: "var(--j-accent)", marginTop: "0.2rem" }}>•</span>
            {bullet.replace(/^[•\-]\s*/, "")}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Practice Quiz widget ─────────────────────────────────────────────────────

export function PracticeQuiz({ question, options, correctIdx }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!question || !options?.length) return null;

  return (
    <div className="j-widget">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} style={{ color: "var(--j-eyebrow)" }} />
        <p className="j-widget-eyebrow" style={{ margin: 0 }}>Quick Quiz</p>
      </div>
      <p
        className="text-base font-medium mb-4"
        style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text)" }}
      >
        {question}
      </p>
      <div className="space-y-2 mb-4">
        {options.map((opt, i) => {
          let bg = "var(--j-bg-secondary)";
          let border = "var(--j-border)";
          let color = "var(--j-text-secondary)";

          if (submitted) {
            if (i === correctIdx) { bg = "rgba(26,115,64,0.1)"; border = "#1A7340"; color = "#1A7340"; }
            else if (i === selected) { bg = "rgba(192,57,43,0.1)"; border = "#C0392B"; color = "#C0392B"; }
          } else if (i === selected) {
            border = "var(--j-accent)";
            color = "var(--j-accent)";
            bg = "var(--j-accent-light)";
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              className="w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors"
              style={{
                fontFamily: "var(--j-font-reading)",
                background: bg,
                borderColor: border,
                color,
              }}
              disabled={submitted}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button
          onClick={() => selected !== null && setSubmitted(true)}
          disabled={selected === null}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            fontFamily: "var(--j-font-mono)",
            background: "var(--j-accent)",
            color: "#ffffff",
            fontSize: "0.8125rem",
          }}
        >
          Submit
        </button>
      ) : (
        <p
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--j-font-mono)",
            color: selected === correctIdx ? "#1A7340" : "#C0392B",
          }}
        >
          {selected === correctIdx ? "✓ Correct!" : `✗ The correct answer is: ${options[correctIdx]}`}
        </p>
      )}
    </div>
  );
}
