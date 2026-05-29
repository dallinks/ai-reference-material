import { theme } from "../theme.js";
import { HeaderBar } from "../components/HeaderBar.jsx";
import { allLessonsFlat } from "../data/index.js";

const findLesson = (id) => allLessonsFlat.find((l) => l.id === id);
const mins = (d) => parseInt(d, 10) || 0;

function LessonRow({ lesson, index, accent, done, onGo }) {
  return (
    <div
      onClick={() => onGo("lesson", lesson.mod, lesson)}
      style={{
        padding: "14px 18px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderLeft: done ? `3px solid ${accent}` : `1px solid ${theme.border}`,
        borderRadius: theme.radius.xl,
        marginBottom: 8,
        cursor: "pointer",
        transition: "background 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = theme.surfaceHover)}
      onMouseOut={(e) => (e.currentTarget.style.background = theme.surface)}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: done ? accent : "rgba(255,255,255,0.06)",
          color: done ? theme.bg : theme.textFainter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontFamily: theme.font.mono,
          flexShrink: 0,
        }}
      >
        {done ? "✓" : index}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: theme.textStrong, fontWeight: 500 }}>{lesson.title}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: accent, fontFamily: theme.font.mono }}>
            M{lesson.mod.number}
          </span>
          <span style={{ fontSize: 11, color: theme.textFaintest, fontFamily: theme.font.mono }}>
            {lesson.duration}
          </span>
        </div>
      </div>
      <span style={{ color: theme.textDimmest, fontSize: 16 }}>→</span>
    </div>
  );
}

export function PathView({ path, completed, onGo }) {
  const accent = path.accent || theme.accent.orange;
  const isCapstone = !!path.stages;

  // Flatten every lesson id referenced by this path (role list, or capstone stages).
  const allIds = isCapstone ? path.stages.flatMap((s) => s.lessonIds) : path.lessonIds;
  const resolved = allIds.map(findLesson).filter(Boolean);
  const totalMin = resolved.reduce((sum, l) => sum + mins(l.duration), 0);
  const doneCount = resolved.filter((l) => completed.has(l.id)).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font.serif,
      }}
    >
      <HeaderBar backLabel="ALL MODULES" onBack={() => onGo("home")} accent={accent} />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 20px 40px" }}>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: 3,
            color: accent,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          {isCapstone ? "Capstone Project" : "Learning Path"}
        </div>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,38px)",
            fontWeight: 400,
            lineHeight: 1.2,
            margin: "0 0 10px",
            color: theme.textStrong,
          }}
        >
          {path.title}
        </h1>
        <p style={{ fontSize: 15, color: theme.textFaint, margin: "0 0 12px", lineHeight: 1.6 }}>
          {isCapstone ? path.scenario : path.desc}
        </p>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 12,
            letterSpacing: 1,
            color: accent,
            marginBottom: 36,
          }}
        >
          {resolved.length} lessons · ~{Math.round(totalMin / 60 * 10) / 10} h · {doneCount}/{resolved.length} done
        </div>

        {isCapstone ? (
          <>
            {path.stages.map((stage, si) => {
              const lessons = stage.lessonIds.map(findLesson).filter(Boolean);
              return (
                <div key={si} style={{ marginBottom: 28 }}>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: theme.textStrong,
                      marginBottom: 4,
                    }}
                  >
                    {stage.title}
                  </div>
                  <p style={{ fontSize: 14, color: theme.textMuted, margin: "0 0 10px", lineHeight: 1.6 }}>
                    {stage.goal}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {lessons.map((l) => {
                      const done = completed.has(l.id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => onGo("lesson", l.mod, l)}
                          style={{
                            fontSize: 12,
                            fontFamily: theme.font.mono,
                            color: done ? theme.bg : accent,
                            background: done ? accent : `${accent}14`,
                            border: `1px solid ${accent}40`,
                            padding: "4px 10px",
                            borderRadius: theme.radius.md,
                            cursor: "pointer",
                          }}
                        >
                          {done ? "✓ " : ""}{l.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 8,
                padding: "16px 18px",
                border: `1px solid ${accent}55`,
                borderRadius: theme.radius.xl,
                background: theme.surfaceStrong,
                fontSize: 14,
                lineHeight: 1.7,
                color: theme.textMuted,
              }}
            >
              <strong style={{ color: theme.text }}>Deliverable. </strong>
              {path.deliverable}
            </div>
          </>
        ) : (
          resolved.map((l, i) => (
            <LessonRow
              key={l.id}
              lesson={l}
              index={i + 1}
              accent={accent}
              done={completed.has(l.id)}
              onGo={onGo}
            />
          ))
        )}

        <div style={{ borderTop: `1px solid ${theme.borderStrong}`, marginTop: 28, paddingTop: 24 }}>
          <button
            onClick={() => onGo("home")}
            style={{
              background: "none",
              border: `1px solid ${theme.borderMuted}`,
              color: theme.textDim,
              padding: "8px 16px",
              borderRadius: theme.radius.md,
              cursor: "pointer",
              fontFamily: theme.font.mono,
              fontSize: 12,
            }}
          >
            ← All modules
          </button>
        </div>
      </div>
    </div>
  );
}
