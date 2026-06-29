import { theme } from "../theme.js";
import { Page, Header, Button, Bar, Badge, Eyebrow } from "../components/ui.jsx";
import { getCourse } from "../data/index.js";
import { useProgress } from "../state/useProgress.js";
import { unitStates, courseProgress } from "../lib/gating.js";

const STATUS = {
  locked: { label: "Locked", color: theme.status.locked },
  open: { label: "Open", color: theme.status.open },
  passed: { label: "Mastered", color: theme.status.passed },
};

export function CourseView({ courseId, onGo }) {
  const course = getCourse(courseId);
  const { progress } = useProgress(courseId);
  const states = unitStates(course, progress);
  const cp = courseProgress(course, progress);

  return (
    <Page>
      <Header title={course.title} onBack={() => onGo("dashboard")} />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 22px 96px" }}>
        <div className="rise">
          <Eyebrow style={{ marginBottom: 14 }}>{course.subject} · {course.difficulty}</Eyebrow>
          <h1 style={{ fontSize: "clamp(30px,5vw,42px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 12px", color: theme.textStrong }}>
            {course.title}
          </h1>
          <p style={{ color: theme.textFaint, fontSize: 16.5, lineHeight: 1.65, margin: "0 0 22px" }}>{course.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
            <div style={{ flex: 1, maxWidth: 320 }}>
              <Bar pct={cp.pct} color={theme.status.passed} />
            </div>
            <span style={{ fontFamily: theme.font.mono, fontSize: 11.5, color: theme.textFaint, letterSpacing: 0.5 }}>
              {cp.passed}/{cp.total} mastered
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          {course.units.map((unit, i) => {
            const st = states[unit.id];
            const meta = STATUS[st.status];
            const locked = st.status === "locked";
            const passed = st.status === "passed";
            return (
              <div
                key={unit.id}
                className="card"
                style={{
                  background: locked ? theme.status.lockedBg : theme.surface,
                  border: `1px solid ${passed ? theme.accent.gold + "3a" : theme.border}`,
                  borderRadius: theme.radius.xl,
                  padding: "24px 26px",
                  opacity: locked ? 0.66 : 1,
                  boxShadow: passed ? undefined : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <Eyebrow style={{ color: theme.textFaintest }}>Unit {i + 1}</Eyebrow>
                  <Badge color={meta.color}>
                    {locked ? "◷ " : passed ? "◆ " : ""}
                    {meta.label}
                    {st.score != null ? ` · ${Math.round(st.score * 100)}%` : ""}
                  </Badge>
                </div>
                <h3 style={{ fontSize: 24, margin: "0 0 6px", color: theme.textStrong, fontWeight: 500, letterSpacing: "-0.01em" }}>
                  {unit.title}
                </h3>
                <p style={{ fontSize: 15.5, color: theme.textFaint, margin: "0 0 20px", lineHeight: 1.6 }}>{unit.summary}</p>

                {unit.references?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <Eyebrow color={theme.textFaintest} style={{ marginBottom: 8 }}>Grounded in</Eyebrow>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 5 }}>
                      {unit.references.map((r, ri) => (
                        <li key={ri} style={{ fontSize: 12.5, color: theme.textFaint, lineHeight: 1.5, display: "flex", gap: 8 }}>
                          <span style={{ color: theme.accent.sage }}>§</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {locked ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.textFaintest,
                      fontFamily: theme.font.mono,
                      letterSpacing: 0.3,
                      borderTop: `1px solid ${theme.border}`,
                      paddingTop: 16,
                    }}
                  >
                    Locked — pass{" "}
                    <span style={{ color: theme.status.locked }}>
                      {st.prereqs
                        .map((p) => course.units.find((u) => u.id === p)?.title)
                        .filter(Boolean)
                        .join(", ")}
                    </span>{" "}
                    to unlock.
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gap: 7, marginBottom: 20 }}>
                      {unit.lessons.map((l) => {
                        const done = progress.lessonsComplete.includes(l.id);
                        return (
                          <div
                            key={l.id}
                            className="row"
                            onClick={() => onGo("lesson", { courseId, unitId: unit.id, lessonId: l.id })}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "11px 14px",
                              borderRadius: theme.radius.md,
                              background: theme.surfaceStrong,
                              border: `1px solid ${theme.border}`,
                              cursor: "pointer",
                              fontSize: 16,
                            }}
                          >
                            <span style={{ color: done ? theme.status.open : theme.textDimmest, fontFamily: theme.font.mono, fontSize: 14 }}>
                              {done ? "◆" : "◇"}
                            </span>
                            <span style={{ color: theme.text }}>{l.title}</span>
                            <span style={{ marginLeft: "auto", fontFamily: theme.font.mono, fontSize: 11, color: theme.textFaintest }}>
                              {l.estMinutes} min
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      variant={passed ? "ghost" : "primary"}
                      accent={theme.status.passed}
                      onClick={() => onGo("mastery", { courseId, unitId: unit.id })}
                    >
                      {passed ? "Retake mastery check" : "Take mastery check →"}
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
