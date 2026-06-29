import { useState } from "react";
import { theme } from "../theme.js";

// A hands-on exercise: scenario + task + self-check criteria, with the worked
// solution hidden behind a reveal so the learner attempts it first.
export function Exercise({ exercise, accent }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: theme.textStrong,
          margin: "0 0 4px",
          fontFamily: theme.font.serif,
        }}
      >
        Hands-On Exercise
      </h2>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: accent,
          marginBottom: 16,
          fontFamily: theme.font.mono,
        }}
      >
        {exercise.title}
      </div>

      <div
        style={{
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: theme.radius.xl,
          padding: "16px 18px",
          background: theme.surface,
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.textMuted, margin: "0 0 14px" }}>
          <strong style={{ color: theme.text }}>Scenario. </strong>
          {exercise.scenario}
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.textMuted, margin: "0 0 14px" }}>
          <strong style={{ color: theme.text }}>Your task. </strong>
          {exercise.task}
        </p>

        <div
          style={{
            fontSize: 13,
            fontFamily: theme.font.mono,
            color: theme.textFaint,
            letterSpacing: 0.5,
            margin: "0 0 8px",
          }}
        >
          SUCCESS CRITERIA
        </div>
        <div style={{ marginBottom: 4 }}>
          {exercise.criteria.map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "5px 0",
                fontSize: 14,
                lineHeight: 1.5,
                color: theme.textMuted,
              }}
            >
              <span style={{ color: accent, flexShrink: 0, fontSize: 12, marginTop: 2 }}>▸</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setRevealed((v) => !v)}
        style={{
          marginTop: 14,
          background: revealed ? "transparent" : accent,
          border: `1px solid ${accent}`,
          color: revealed ? accent : theme.bg,
          padding: "8px 16px",
          borderRadius: theme.radius.md,
          cursor: "pointer",
          fontFamily: theme.font.mono,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {revealed ? "Hide solution" : "Reveal solution"}
      </button>

      {revealed && (
        <div
          style={{
            marginTop: 12,
            padding: "14px 18px",
            border: `1px solid ${accent}55`,
            borderRadius: theme.radius.xl,
            background: theme.surfaceStrong,
            fontSize: 14,
            lineHeight: 1.7,
            color: theme.textMuted,
          }}
        >
          <strong style={{ color: theme.text }}>Solution outline. </strong>
          {exercise.solution}
        </div>
      )}
    </div>
  );
}
