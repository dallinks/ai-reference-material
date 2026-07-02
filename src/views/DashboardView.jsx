import { theme } from "../theme.js";
import { Page, Header, Button, Bar, Label, Eyebrow } from "../components/ui.jsx";
import { Heatmap } from "../components/Heatmap.jsx";
import { COURSES } from "../data/index.js";
import { loadProgress, loadActivity } from "../lib/store.js";
import { courseProgress, unitStates } from "../lib/gating.js";
import { isMature } from "../lib/srs.js";
import { streakInfo, goalProgress, activeDayCount } from "../lib/streak.js";
import { buildDueQueue } from "../state/review.js";

const mono = (size, color, extra) => ({
  fontFamily: theme.font.mono,
  fontSize: size,
  letterSpacing: 0.5,
  color,
  ...extra,
});

function GoalRow({ done, label, note }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
      <span style={mono(13, done ? theme.accent.sage : theme.textFaintest)}>{done ? "◆" : "◇"}</span>
      <span style={{ fontSize: 15.5, color: done ? theme.textFaint : theme.text }}>{label}</span>
      {note && <span style={mono(11, theme.status.due)}>{note}</span>}
    </div>
  );
}

function Stat({ n, of, label }) {
  return (
    <div>
      <div style={{ fontSize: 24, color: theme.textStrong, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
        {n}
        {of != null && <span style={{ color: theme.textFaintest, fontSize: 15 }}> / {of}</span>}
      </div>
      <div style={mono(10, theme.textFaint, { letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 })}>{label}</div>
    </div>
  );
}

export function DashboardView({ onGo, today, onOpenSettings }) {
  const due = buildDueQueue(today);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  // The habit layer: streak, today's goal, and the cross-course standing.
  const activity = loadActivity();
  const streak = streakInfo(activity, today);
  const goal = goalProgress(activity, today, due.length);
  const rollup = COURSES.reduce(
    (acc, course) => {
      const progress = loadProgress(course.id);
      const cp = courseProgress(course, progress);
      acc.unitsPassed += cp.passed;
      acc.unitsTotal += cp.total;
      acc.lessonsDone += progress.lessonsComplete.length;
      acc.lessonsTotal += course.units.reduce((s, u) => s + u.lessons.length, 0);
      acc.known += Object.values(progress.srs).filter(isMature).length;
      return acc;
    },
    { unitsPassed: 0, unitsTotal: 0, lessonsDone: 0, lessonsTotal: 0, known: 0 }
  );

  const streakLive = streak.activeToday && streak.current > 0;
  const streakColor = streakLive ? theme.accent.gold : streak.atRisk ? theme.status.due : theme.textFaintest;
  const stateLine = streakLive
    ? "✓ active today"
    : streak.atRisk
    ? "at risk — study today to keep it"
    : "no streak yet — today's a good day";
  const stateColor = streakLive ? theme.accent.sage : streak.atRisk ? theme.status.due : theme.textFaint;

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

        {/* The habit — streak, today's goal, consistency, standing */}
        <Label>The habit</Label>
        <div
          className="rise-2"
          style={{
            background: theme.surface,
            border: `1px solid ${streakLive ? theme.accent.gold + "2e" : theme.border}`,
            borderRadius: theme.radius.xl,
            padding: "26px 28px",
            margin: "0 0 52px",
            boxShadow: theme.shadow.card,
          }}
        >
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "stretch" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 230 }}>
              <div style={{ fontSize: 56, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: streakColor, minWidth: 74 }}>
                {streak.current}
              </div>
              <div>
                <div style={{ fontSize: 19, color: theme.textStrong, marginBottom: 3 }}>day streak</div>
                <div style={mono(11.5, stateColor, { marginBottom: 5 })}>{stateLine}</div>
                <div style={mono(10.5, theme.textFaintest)}>
                  longest {streak.longest} · grace day {streak.graceLeftThisMonth ? "available" : "spent"} this month
                </div>
              </div>
            </div>
            <div style={{ width: 1, background: theme.border }} />
            <div style={{ flex: 1, minWidth: 230 }}>
              <Eyebrow style={{ marginBottom: 12 }}>Today's goal</Eyebrow>
              <GoalRow done={goal.reviewsCleared} label="Clear the due reviews" note={due.length ? `${due.length} left` : undefined} />
              <GoalRow done={goal.studied} label="Finish a lesson or take a gate" />
              <div style={mono(10.5, goal.done ? theme.accent.sage : theme.textFaintest, { marginTop: 10 })}>
                {goal.done ? "✓ goal met — the day is banked" : "any action keeps the streak · the goal is the real win"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
            <Heatmap log={activity} today={today} />
          </div>

          <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${theme.border}`, display: "flex", gap: 40, flexWrap: "wrap" }}>
            <Stat n={rollup.unitsPassed} of={rollup.unitsTotal} label="units mastered" />
            <Stat n={rollup.lessonsDone} of={rollup.lessonsTotal} label="lessons completed" />
            <Stat n={rollup.known} label="cards known · 3wk+" />
            <Stat n={activeDayCount(activity)} label="study days" />
          </div>
        </div>

        <Label>Courses</Label>
        <div className="rise-3" style={{ display: "grid", gap: 16 }}>
          {COURSES.map((course) => {
            const progress = loadProgress(course.id);
            const cp = courseProgress(course, progress);
            const complete = cp.passed === cp.total && cp.total > 0;
            const states = unitStates(course, progress);
            const nextGate = course.units.find((u) => states[u.id].status === "open");
            const unlocks = course.units.find((u) => states[u.id].status === "locked");
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
                {nextGate && (
                  <div style={mono(11, theme.textFaintest, { marginTop: 12 })}>
                    next gate: <span style={{ color: theme.textFaint }}>{nextGate.title}</span>
                    {unlocks ? (
                      <>
                        {" "}· passing unlocks <span style={{ color: theme.textFaint }}>{unlocks.title}</span>
                      </>
                    ) : (
                      " · the final gate"
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
