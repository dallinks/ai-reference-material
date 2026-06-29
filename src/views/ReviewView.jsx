import { useState } from "react";
import { theme } from "../theme.js";
import { Page, Header, Button, Eyebrow } from "../components/ui.jsx";
import { buildDueQueue, gradeReviewItem } from "../state/review.js";
import { schedule } from "../lib/srs.js";

const GRADES = [
  { grade: "again", label: "Again", color: theme.accent.rust },
  { grade: "hard", label: "Hard", color: theme.accent.gold },
  { grade: "good", label: "Good", color: theme.accent.sage },
  { grade: "easy", label: "Easy", color: theme.accent.blue },
];

function hint(card, grade, today) {
  const d = schedule(card, grade, today).interval;
  return d <= 0 ? "soon" : d === 1 ? "1 day" : `${d} days`;
}

export function ReviewView({ onGo, today }) {
  const [queue] = useState(() => buildDueQueue(today));
  const [extra, setExtra] = useState([]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const all = [...queue, ...extra];
  const current = all[i];

  const grade = (g) => {
    gradeReviewItem(current.courseId, current.item.id, g, today);
    if (g === "again") setExtra((e) => [...e, current]);
    setReviewed((n) => n + 1);
    setRevealed(false);
    setI((n) => n + 1);
  };

  if (!current) {
    return (
      <Page>
        <Header title="Review" onBack={() => onGo("dashboard")} />
        <div className="rise" style={{ maxWidth: 560, margin: "0 auto", padding: "130px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 40, color: queue.length ? theme.accent.gold : theme.textFaintest, marginBottom: 18 }}>
            {queue.length ? "◆" : "◇"}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: theme.textStrong, margin: "0 0 10px" }}>
            {queue.length ? "Review complete" : "Nothing due"}
          </h1>
          <p style={{ color: theme.textFaint, fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>
            {queue.length
              ? `${reviewed} reviews done. They'll resurface when the curve says so.`
              : "Complete some lessons to start filling the review queue."}
          </p>
          <Button onClick={() => onGo("dashboard")}>Back to the desk →</Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Header
        title="Review"
        onBack={() => onGo("dashboard")}
        right={
          <span style={{ fontFamily: theme.font.mono, fontSize: 12, color: theme.textFaint, letterSpacing: 1 }}>
            {String(i + 1).padStart(2, "0")} / {String(all.length).padStart(2, "0")}
          </span>
        }
      />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 22px" }}>
        <Eyebrow style={{ textAlign: "center", marginBottom: 26, color: theme.textFaintest }}>{current.courseTitle}</Eyebrow>

        <div
          key={current.item.id}
          className="flip-in"
          style={{
            background: theme.surface,
            border: `1px solid ${theme.borderStrong}`,
            borderRadius: theme.radius.xxl,
            padding: "52px 36px",
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: theme.shadow.card,
          }}
        >
          <div style={{ fontSize: 24, lineHeight: 1.45, color: theme.textStrong, textAlign: "center", letterSpacing: "-0.01em" }}>
            {current.item.front}
          </div>
          {revealed && (
            <>
              <div style={{ width: 40, height: 2, background: theme.accent.gold, opacity: 0.7, margin: "30px auto", borderRadius: 2 }} />
              <div style={{ fontSize: 18, lineHeight: 1.6, color: theme.textMuted, textAlign: "center" }}>{current.item.back}</div>
            </>
          )}
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          {!revealed ? (
            <Button onClick={() => setRevealed(true)} style={{ padding: "13px 44px" }}>
              Show answer
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {GRADES.map((b) => (
                <div key={b.grade} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Button variant="outline" accent={b.color} onClick={() => grade(b.grade)} style={{ minWidth: 92 }}>
                    {b.label}
                  </Button>
                  <span style={{ fontFamily: theme.font.mono, fontSize: 10, color: theme.textFaintest, letterSpacing: 0.5 }}>
                    {hint(current.card, b.grade, today)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
