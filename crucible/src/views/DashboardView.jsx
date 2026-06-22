import { theme } from "../theme.js";
import { Page, Header, Button, Bar, Label, Eyebrow } from "../components/ui.jsx";
import { COURSES } from "../data/index.js";
import { loadProgress } from "../lib/store.js";
import { courseProgress } from "../lib/gating.js";
import { buildDueQueue } from "../state/review.js";

export function DashboardView({ onGo, today, onOpenSettings }) {
  const due = buildDueQueue(today);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <Page>
      <Header
        title="Crucible"
        brand
        right={
          <button
            className="btn btn-ghost"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
            style={{
              background: "none",
              border: `1px solid ${theme.border}`,
              color: theme.textFaint,
              width: 32,
              height: 32,
              borderRadius: theme.radius.md,
              cursor: "pointer",
              fontSize: 15,
              lineHeight: 1,
            }}
          >
            ⚙
          </button>
        }
      />
      <div style={{ maxWidth: theme.maxWidth.wide, margin: "0 auto", padding: "52px 22px 96px" }}>
        <div className="rise">
          <Eyebrow style={{ marginBottom: 14 }}>{dateLabel}</Eyebrow>
          <h1 style={{ fontSize: "clamp(34px,6vw,52px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 8px", color: theme.textStrong }}>
            The desk
          </h1>
          <p style={{ color: theme.textFaint, fontSize: 17, margin: 0, fontStyle: "italic" }}>
            Rigor you can't click past. Show up, pass the gate, keep it in memory.
          </p>
        </div>

        {/* Daily review — the forcing function */}
        <div
          className="rise-2"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: due.length ? theme.status.dueBg : theme.surface,
            border: `1px solid ${due.length ? theme.status.due + "44" : theme.border}`,
            borderLeft: `3px solid ${due.length ? theme.status.due : theme.borderStrong}`,
            borderRadius: theme.radius.xl,
            padding: "26px 28px",
            margin: "44px 0 52px",
            boxShadow: theme.shadow.card,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 500,
              lineHeight: 1,
              color: due.length ? theme.status.due : theme.textFaintest,
              minWidth: 74,
              letterSpacing: "-0.02em",
            }}
          >
            {due.length}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, color: theme.textStrong, marginBottom: 3 }}>
              {due.length ? "cards due for review" : "Nothing due right now"}
            </div>
            <div style={{ fontSize: 14.5, color: theme.textFaint, lineHeight: 1.55 }}>
              {due.length
                ? "These resurface on the forgetting curve. Clear them to keep what you've learned."
                : "New cards enter the queue as you complete lessons."}
            </div>
          </div>
          {due.length > 0 && (
            <Button accent={theme.status.due} onClick={() => onGo("review")}>
              Start review →
            </Button>
          )}
        </div>

        <Label>Courses</Label>
        <div className="rise-3" style={{ display: "grid", gap: 16 }}>
          {COURSES.map((course) => {
            const progress = loadProgress(course.id);
            const cp = courseProgress(course, progress);
            const complete = cp.passed === cp.total && cp.total > 0;
            return (
              <div
                key={course.id}
                className="card card-hover"
                onClick={() => onGo("course", { courseId: course.id })}
                style={{
                  background: theme.surface,
                  border: `1px solid ${complete ? theme.accent.gold + "3a" : theme.border}`,
                  borderRadius: theme.radius.xl,
                  padding: "24px 26px",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: 23, margin: 0, color: theme.textStrong, fontWeight: 500, letterSpacing: "-0.01em" }}>
                    {course.title}
                  </h3>
                  <span style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.textFaintest, letterSpacing: 0.5 }}>
                    {course.subject} · {course.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: 15.5, color: theme.textFaint, margin: "0 0 20px", lineHeight: 1.65, maxWidth: 620 }}>
                  {course.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, maxWidth: 360 }}>
                    <Bar pct={cp.pct} color={theme.status.passed} />
                  </div>
                  <span style={{ fontFamily: theme.font.mono, fontSize: 11.5, color: theme.textFaint, letterSpacing: 0.5 }}>
                    {cp.passed}/{cp.total} units mastered
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
