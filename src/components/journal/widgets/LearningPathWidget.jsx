import Link from "next/link";
import { ArrowRight, BookOpen, Code, Trophy, MessageSquare, Award, CheckCircle } from "lucide-react";

export default function LearningPathWidget({ learningPath }) {
  if (!learningPath) return null;

  const { currentArticle, step1_course, step2_problem, step3_discussion, step4_contest, step5_nextArticle } = learningPath;

  const STEPS = [
    {
      num: 1,
      title: "1. Read Article",
      desc: currentArticle?.title || "Mastering the Concept",
      icon: BookOpen,
      color: "var(--j-accent)",
      done: true,
    },
    step1_course && {
      num: 2,
      title: "2. Enroll Course",
      desc: step1_course.title,
      href: `/courses/${step1_course.slug}`,
      icon: BookOpen,
      color: "#7B2D8B",
    },
    step2_problem && {
      num: 3,
      title: "3. Solve Practice Problem",
      desc: step2_problem.title,
      href: `/practice/${step2_problem.slug}`,
      icon: Code,
      color: "#1A7340",
    },
    step3_discussion && {
      num: 4,
      title: "4. Join Community Discussion",
      desc: step3_discussion.title,
      href: `/discuss/${step3_discussion.slug}`,
      icon: MessageSquare,
      color: "#C97A1A",
    },
    step4_contest && {
      num: 5,
      title: "5. Compete in Contest",
      desc: step4_contest.title,
      href: `/contest/${step4_contest.slug}`,
      icon: Trophy,
      color: "#C0392B",
    },
    step5_nextArticle && {
      num: 6,
      title: "6. Next Article in Path",
      desc: step5_nextArticle.title,
      href: `/journal/article/${step5_nextArticle.slug}`,
      icon: ArrowRight,
      color: "var(--j-accent)",
    },
  ].filter(Boolean);

  return (
    <div
      className="p-6 rounded-xl border mt-14"
      style={{
        background: "var(--j-bg-secondary)",
        borderColor: "var(--j-border)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Award size={16} style={{ color: "var(--j-accent)" }} />
        <p className="j-eyebrow" style={{ margin: 0, color: "var(--j-accent)" }}>
          Recommended Learning Path
        </p>
      </div>

      <h3
        className="text-xl font-semibold mb-6"
        style={{ fontFamily: "var(--j-font-heading)", color: "var(--j-text)" }}
      >
        Your Next Steps to Mastery
      </h3>

      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const content = (
            <div
              key={idx}
              className="flex items-start gap-4 p-3.5 rounded-lg border transition-opacity hover:opacity-85"
              style={{ borderColor: "var(--j-border)", background: "var(--j-bg-card)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: step.done ? "rgba(26,115,64,0.1)" : "var(--j-bg-secondary)" }}
              >
                {step.done ? (
                  <CheckCircle size={16} style={{ color: "#1A7340" }} />
                ) : (
                  <Icon size={14} style={{ color: step.color }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="j-mono text-xs font-semibold" style={{ color: step.color }}>
                  {step.title}
                </p>
                <p
                  className="text-sm font-medium leading-snug mt-0.5 truncate"
                  style={{ fontFamily: "var(--j-font-reading)", color: "var(--j-text)" }}
                >
                  {step.desc}
                </p>
              </div>
              {step.href && <ArrowRight size={14} style={{ color: "var(--j-text-muted)", marginTop: 8 }} />}
            </div>
          );

          if (step.href) {
            return (
              <Link key={idx} href={step.href}>
                {content}
              </Link>
            );
          }
          return content;
        })}
      </div>
    </div>
  );
}
