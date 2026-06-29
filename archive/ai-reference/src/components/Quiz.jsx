import { useState } from "react";
import { theme } from "../theme.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Self-check quiz. Each question locks once answered and immediately reveals
// whether the choice was right, highlights the correct option, and shows the
// rationale. onComplete(pct) fires when every question has been answered.
export function Quiz({ quiz, accent, onComplete }) {
  const [answers, setAnswers] = useState({}); // qIndex -> chosen option index

  const answeredCount = Object.keys(answers).length;
  const correctCount = quiz.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0
  );
  const allAnswered = answeredCount === quiz.length;

  const choose = (qi, oi) => {
    if (answers[qi] !== undefined) return; // locked
    setAnswers((prev) => {
      const next = { ...prev, [qi]: oi };
      if (Object.keys(next).length === quiz.length && onComplete) {
        const correct = quiz.reduce((n, q, i) => n + (next[i] === q.answer ? 1 : 0), 0);
        onComplete(Math.round((correct / quiz.length) * 100));
      }
      return next;
    });
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: theme.textStrong,
            margin: 0,
            fontFamily: theme.font.serif,
          }}
        >
          Knowledge Check
        </h2>
        <span
          style={{
            fontFamily: theme.font.mono,
            fontSize: 12,
            color: allAnswered ? accent : theme.textFaintest,
          }}
        >
          {allAnswered
            ? `Score ${correctCount}/${quiz.length} · ${Math.round(
                (correctCount / quiz.length) * 100
              )}%`
            : `${answeredCount}/${quiz.length} answered`}
        </span>
      </div>

      {quiz.map((q, qi) => {
        const chosen = answers[qi];
        const locked = chosen !== undefined;
        return (
          <div key={qi} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: theme.text,
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              {qi + 1}. {q.q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = q.answer === oi;
                let border = theme.borderMuted;
                let bg = theme.surfaceStrong;
                let fg = theme.textMuted;
                if (locked && isCorrect) {
                  border = theme.quiz.correct.border;
                  bg = theme.quiz.correct.bg;
                  fg = theme.textStrong;
                } else if (locked && isChosen && !isCorrect) {
                  border = theme.quiz.wrong.border;
                  bg = theme.quiz.wrong.bg;
                  fg = theme.textStrong;
                } else if (locked) {
                  fg = theme.textFaint;
                }
                return (
                  <button
                    key={oi}
                    onClick={() => choose(qi, oi)}
                    disabled={locked}
                    style={{
                      textAlign: "left",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: theme.radius.lg,
                      color: fg,
                      cursor: locked ? "default" : "pointer",
                      fontSize: 14,
                      lineHeight: 1.45,
                      fontFamily: theme.font.serif,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseOver={(e) => {
                      if (!locked) e.currentTarget.style.borderColor = accent;
                    }}
                    onMouseOut={(e) => {
                      if (!locked) e.currentTarget.style.borderColor = theme.borderMuted;
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.font.mono,
                        fontSize: 12,
                        color: locked && isCorrect
                          ? theme.quiz.correct.fg
                          : locked && isChosen
                          ? theme.quiz.wrong.fg
                          : theme.textFaintest,
                        flexShrink: 0,
                        marginTop: 1,
                        minWidth: 14,
                      }}
                    >
                      {locked && isCorrect ? "✓" : locked && isChosen ? "✗" : LETTERS[oi]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {locked && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: theme.textMuted,
                  background: theme.surface,
                  borderLeft: `2px solid ${
                    chosen === q.answer ? theme.quiz.correct.border : theme.quiz.wrong.border
                  }`,
                  borderRadius: theme.radius.sm,
                }}
              >
                <strong style={{ color: chosen === q.answer ? theme.quiz.correct.fg : theme.quiz.wrong.fg }}>
                  {chosen === q.answer ? "Correct. " : "Not quite. "}
                </strong>
                {q.why}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
