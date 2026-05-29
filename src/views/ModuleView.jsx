import { theme } from "../theme.js";
import { HeaderBar } from "../components/HeaderBar.jsx";
import { ASSESSMENTS } from "../data/assessments.js";
import { useAssessmentScores } from "../hooks/useAssessmentScores.js";

function TypeChip({ kind }) {
  const tint = theme.chip[kind] || theme.chip.neutral;
  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: theme.font.mono,
        color: tint.fg,
        background: tint.bg,
        padding: "1px 6px",
        borderRadius: theme.radius.sm,
      }}
    >
      {kind.toUpperCase()}
    </span>
  );
}

export function ModuleView({ mod, completed, onGo }) {
  const doneCount = mod.lessons.filter((l) => completed.has(l.id)).length;
  const { scores } = useAssessmentScores();
  const hasAssessment = !!ASSESSMENTS[mod.id];
  const bestScore = scores[mod.id];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font.serif,
      }}
    >
      <HeaderBar
        backLabel="ALL MODULES"
        onBack={() => onGo("home")}
        accent={mod.accent}
      />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 20px" }}>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 56,
            fontWeight: 700,
            color: mod.accent,
            opacity: 0.12,
            lineHeight: 1,
            marginBottom: -16,
          }}
        >
          {mod.number}
        </div>
        <h1
          style={{
            fontSize: "clamp(30px,5vw,44px)",
            fontWeight: 400,
            margin: "0 0 8px",
            color: theme.textStrong,
          }}
        >
          {mod.title}
        </h1>
        <p style={{ fontSize: 15, color: theme.textFaint, margin: "0 0 8px" }}>{mod.desc}</p>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 12,
            letterSpacing: 2,
            color: mod.accent,
            marginBottom: 36,
          }}
        >
          {doneCount}/{mod.lessons.length} COMPLETE
        </div>

        {mod.lessons.map((lesson, i) => {
          const d = completed.has(lesson.id);
          const types = [...new Set(lesson.content.map((c) => c.type))];
          return (
            <div
              key={lesson.id}
              onClick={() => onGo("lesson", mod, lesson)}
              style={{
                padding: "18px 22px",
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderLeft: d
                  ? `3px solid ${mod.accent}`
                  : `1px solid ${theme.border}`,
                borderRadius: theme.radius.xl,
                marginBottom: 10,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = theme.surfaceHover)}
              onMouseOut={(e) => (e.currentTarget.style.background = theme.surface)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: d ? mod.accent : "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: d ? theme.bg : theme.textFainter,
                    fontFamily: theme.font.mono,
                    flexShrink: 0,
                  }}
                >
                  {d ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, color: theme.textStrong, fontWeight: 500 }}>
                    {lesson.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 4,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: theme.textFaintest,
                        fontFamily: theme.font.mono,
                      }}
                    >
                      {lesson.duration}
                    </span>
                    {lesson.preview && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: theme.font.mono,
                          letterSpacing: 0.5,
                          color: "#062b24",
                          background: theme.accent.teal,
                          padding: "1px 6px",
                          borderRadius: theme.radius.sm,
                        }}
                      >
                        FREE
                      </span>
                    )}
                    {types.includes("code") && <TypeChip kind="code" />}
                    {types.includes("checklist") && <TypeChip kind="checklist" />}
                    {types.includes("decision") && <TypeChip kind="decision" />}
                    {types.includes("diagram") && <TypeChip kind="diagram" />}
                  </div>
                </div>
                <span style={{ color: theme.textDimmest, fontSize: 16 }}>→</span>
              </div>
            </div>
          );
        })}

        {hasAssessment && (
          <div
            onClick={() => onGo("assessment", mod)}
            style={{
              padding: "18px 22px",
              background: `${mod.accent}0d`,
              border: `1px solid ${mod.accent}40`,
              borderRadius: theme.radius.xl,
              marginTop: 18,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = `${mod.accent}1a`)}
            onMouseOut={(e) => (e.currentTarget.style.background = `${mod.accent}0d`)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: mod.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: theme.bg,
                  flexShrink: 0,
                }}
              >
                ✦
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: theme.textStrong, fontWeight: 500 }}>
                  Module Assessment
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: theme.textFaintest,
                    fontFamily: theme.font.mono,
                    marginTop: 4,
                  }}
                >
                  {ASSESSMENTS[mod.id].quiz.length} questions · 1 hands-on exercise
                  {bestScore !== undefined && (
                    <span style={{ color: mod.accent }}> · best {bestScore}%</span>
                  )}
                </div>
              </div>
              <span style={{ color: mod.accent, fontSize: 16 }}>→</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
