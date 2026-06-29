import { theme } from "../theme.js";
import { HeaderBar } from "../components/HeaderBar.jsx";
import { Quiz } from "../components/Quiz.jsx";
import { Exercise } from "../components/Exercise.jsx";
import { ASSESSMENTS } from "../data/assessments.js";
import { useAssessmentScores } from "../hooks/useAssessmentScores.js";

export function AssessmentView({ mod, onGo }) {
  const assessment = ASSESSMENTS[mod.id];
  const { recordScore } = useAssessmentScores();

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
        backLabel="BACK TO MODULE"
        onBack={() => onGo("module", mod)}
        accent={mod.accent}
      />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 20px 40px" }}>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: 3,
            color: mod.accent,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Module {mod.number} · Assessment
        </div>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,38px)",
            fontWeight: 400,
            lineHeight: 1.2,
            margin: "0 0 8px",
            color: theme.textStrong,
          }}
        >
          {mod.title}
        </h1>
        <p style={{ fontSize: 15, color: theme.textFaint, margin: "0 0 40px", lineHeight: 1.6 }}>
          Check your understanding, then apply it. Answer each question to see the
          reasoning; attempt the exercise before revealing the solution.
        </p>

        {assessment ? (
          <>
            <Quiz
              quiz={assessment.quiz}
              accent={mod.accent}
              onComplete={(pct) => recordScore(mod.id, pct)}
            />
            <div style={{ borderTop: `1px solid ${theme.borderStrong}`, marginBottom: 32 }} />
            <Exercise exercise={assessment.exercise} accent={mod.accent} />
          </>
        ) : (
          <p style={{ color: theme.textFaintest }}>No assessment is available for this module yet.</p>
        )}

        <div
          style={{
            borderTop: `1px solid ${theme.borderStrong}`,
            paddingTop: 28,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => onGo("module", mod)}
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
            ← Back to module
          </button>
          <button
            onClick={() => onGo("home")}
            style={{
              background: mod.accent,
              border: "none",
              color: theme.bg,
              padding: "8px 16px",
              borderRadius: theme.radius.md,
              cursor: "pointer",
              fontFamily: theme.font.mono,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            All modules →
          </button>
        </div>
      </div>
    </div>
  );
}
