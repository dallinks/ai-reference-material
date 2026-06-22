import { useState } from "react";
import { theme } from "../theme.js";
import { Page, Header, Button, Badge, Eyebrow } from "../components/ui.jsx";
import { getCourse } from "../data/index.js";
import { useProgress } from "../state/useProgress.js";
import { gradeAssessment, GRADED_TYPES } from "../lib/grading.js";
import { DEFAULT_THRESHOLD } from "../lib/gating.js";
import { gradeProof } from "../lib/grader.js";
import { getApiKey, getSettings } from "../lib/settings.js";

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 15px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.borderMuted}`,
  background: theme.surface,
  color: theme.textStrong,
  fontSize: 16,
};

// proof = math/derivation (gold "proof"); open = judgment/analysis (blue "analysis").
const META = {
  proof: { label: "proof", color: theme.accent.gold, placeholder: "Write your proof or derivation. State each step and justify it." },
  open: { label: "analysis", color: theme.accent.blue, placeholder: "Write your analysis. Be specific and reason from the frameworks and the evidence." },
};

function QuestionInput({ q, value, onChange, locked }) {
  if (GRADED_TYPES.has(q.type)) {
    return (
      <textarea
        className="field"
        disabled={locked}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={META[q.type].placeholder}
        rows={9}
        style={{ ...inputBase, fontFamily: theme.font.serif, lineHeight: 1.7, resize: "vertical", minHeight: 150 }}
      />
    );
  }
  if (q.type === "mcq" || q.type === "multi") {
    const multi = q.type === "multi";
    const arr = Array.isArray(value) ? value : [];
    const isSel = (i) => (multi ? arr.includes(i) : value === i);
    const toggle = (i) => (multi ? onChange(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]) : onChange(i));
    return (
      <div style={{ display: "grid", gap: 9 }}>
        {q.options.map((opt, i) => (
          <label
            key={i}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: theme.radius.md,
              border: `1px solid ${isSel(i) ? theme.accent.gold + "99" : theme.border}`,
              background: isSel(i) ? `${theme.accent.gold}12` : theme.surface,
              cursor: locked ? "default" : "pointer",
              fontSize: 16,
              color: theme.text,
              transition: "border-color .14s ease, background .14s ease",
            }}
          >
            <input type={multi ? "checkbox" : "radio"} disabled={locked} checked={isSel(i)} onChange={() => toggle(i)} style={{ accentColor: theme.accent.gold }} />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  return (
    <input
      className="field"
      type={q.type === "numeric" ? "number" : "text"}
      step="any"
      disabled={locked}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.type === "numeric" ? "Numeric answer…" : "Type your answer…"}
      style={{ ...inputBase, fontFamily: theme.font.mono }}
    />
  );
}

function GradedFeedback({ verdict }) {
  if (!verdict) return null;
  const pct = Math.round((verdict.score ?? 0) * 100);
  const pass = (verdict.score ?? 0) >= 0.85;
  const c = pass ? theme.accent.sage : verdict.score >= 0.5 ? theme.accent.gold : theme.accent.rust;
  return (
    <div style={{ marginTop: 12, border: `1px solid ${c}33`, background: `${c}0c`, borderRadius: theme.radius.lg, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: theme.font.mono, fontSize: 18, color: c }}>{pct}%</span>
        <span style={{ fontFamily: theme.font.mono, fontSize: 10, letterSpacing: 1.5, color: theme.textFaintest, textTransform: "uppercase" }}>
          graded by Claude
        </span>
      </div>
      {verdict.feedback && (
        <div style={{ fontSize: 14.5, lineHeight: 1.6, color: theme.textMuted, marginBottom: verdict.criteria?.length ? 12 : 0 }}>{verdict.feedback}</div>
      )}
      {(verdict.criteria || []).map((cr, i) => (
        <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.55, color: theme.textFaint, marginBottom: 6 }}>
          <span style={{ color: cr.met ? theme.accent.sage : theme.accent.rust, fontFamily: theme.font.mono }}>{cr.met ? "✓" : "✗"}</span>
          <span><span style={{ color: theme.textMuted }}>{cr.criterion}</span>{cr.comment ? ` — ${cr.comment}` : ""}</span>
        </div>
      ))}
    </div>
  );
}

export function MasteryCheckView({ courseId, unitId, onGo, onOpenSettings }) {
  const course = getCourse(courseId);
  const unit = course.units.find((u) => u.id === unitId);
  const check = unit.masteryCheck;
  const threshold = unit.masteryThreshold ?? DEFAULT_THRESHOLD;
  const { recordMastery } = useProgress(courseId);

  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState("");
  const [needKey, setNeedKey] = useState(false);

  const gradedQs = check.questions.filter((q) => GRADED_TYPES.has(q.type));

  const submit = async () => {
    setGradeError("");
    if (gradedQs.length && !getApiKey()) {
      setNeedKey(true);
      return;
    }
    setNeedKey(false);
    setGrading(true);
    try {
      let proofResults = {};
      if (gradedQs.length) {
        const { model } = getSettings();
        const apiKey = getApiKey();
        const graded = await Promise.all(
          gradedQs.map(async (q) => [
            q.id,
            await gradeProof({ question: q, answer: responses[q.id] || "", apiKey, model, persona: course.grader }),
          ])
        );
        const failure = graded.find(([, v]) => !v.ok);
        if (failure) {
          setGradeError(failure[1].error);
          return;
        }
        proofResults = Object.fromEntries(graded.map(([id, v]) => [id, { score: v.score }]));
        setFeedback(Object.fromEntries(graded.map(([id, v]) => [id, v])));
      }
      const r = gradeAssessment(check, responses, proofResults);
      setResult(r);
      recordMastery(unit.id, r.score);
      window.scrollTo(0, 0);
    } finally {
      setGrading(false);
    }
  };

  const retry = () => {
    setResponses({});
    setResult(null);
    setFeedback({});
    setGradeError("");
    window.scrollTo(0, 0);
  };

  const passed = result && result.score >= threshold;
  const byId = (id) => result?.results.find((x) => x.id === id);
  const answered = check.questions.filter((q) => {
    const v = responses[q.id];
    return Array.isArray(v) ? v.length > 0 : v !== undefined && String(v).trim() !== "";
  }).length;

  return (
    <Page>
      <Header title={`Mastery check · ${unit.title}`} onBack={() => onGo("course", { courseId })} />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 22px 96px" }}>
        <div className="rise">
          <Eyebrow color={theme.status.passed} style={{ marginBottom: 14 }}>
            The gate · pass at {Math.round(threshold * 100)}%
          </Eyebrow>
          <h1 style={{ fontSize: "clamp(28px,4.5vw,38px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 10px", color: theme.textStrong }}>
            {unit.title}
          </h1>
          <p style={{ color: theme.textFaint, fontSize: 16, margin: "0 0 36px", fontStyle: "italic" }}>
            Answer all {check.questions.length}.{gradedQs.length ? " Written responses are graded by Claude against a rubric." : ""} You unlock the next unit only by clearing the bar.
          </p>
        </div>

        {result && (
          <div
            className="flip-in"
            style={{
              background: passed ? theme.status.passedBg : theme.quiz.wrong.bg,
              border: `1px solid ${passed ? theme.accent.gold + "66" : theme.quiz.wrong.border}`,
              borderRadius: theme.radius.xl,
              padding: "26px 28px",
              marginBottom: 36,
              display: "flex",
              alignItems: "center",
              gap: 22,
              boxShadow: passed ? theme.shadow.gold : "none",
            }}
          >
            <div style={{ fontSize: 50, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: passed ? theme.status.passed : theme.quiz.wrong.fg }}>
              {Math.round(result.score * 100)}%
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, color: theme.textStrong, marginBottom: 3 }}>
                {passed ? "Unit mastered — next unit unlocked." : "Not yet. Below the bar."}
              </div>
              <div style={{ fontSize: 13.5, color: theme.textFaint, fontFamily: theme.font.mono, letterSpacing: 0.3 }}>
                {result.correctCount}/{result.total} fully correct · needed {Math.round(threshold * 100)}%
              </div>
            </div>
            {passed ? (
              <Button accent={theme.status.passed} onClick={() => onGo("course", { courseId })}>
                Back to course →
              </Button>
            ) : (
              <Button variant="outline" accent={theme.quiz.wrong.fg} onClick={retry}>
                Try again
              </Button>
            )}
          </div>
        )}

        <div style={{ display: "grid", gap: 30 }}>
          {check.questions.map((q, i) => {
            const res = byId(q.id);
            const isGraded = GRADED_TYPES.has(q.type);
            return (
              <div key={q.id}>
                <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontFamily: theme.font.mono, fontSize: 13, color: theme.textFaintest }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontSize: 18, color: theme.textStrong, lineHeight: 1.5 }}>{q.prompt}</span>
                  {isGraded && <span style={{ marginLeft: "auto" }}><Badge color={META[q.type].color}>{META[q.type].label}</Badge></span>}
                  {res && !isGraded && (
                    <span style={{ marginLeft: "auto" }}>
                      <Badge color={res.correct ? theme.quiz.correct.fg : theme.quiz.wrong.fg}>{res.correct ? "✓ correct" : "✗ wrong"}</Badge>
                    </span>
                  )}
                </div>
                <QuestionInput q={q} value={responses[q.id]} onChange={(v) => setResponses((r) => ({ ...r, [q.id]: v }))} locked={!!result || grading} />
                {isGraded && result && <GradedFeedback verdict={feedback[q.id]} />}
                {res && !isGraded && q.explanation && (
                  <div style={{ marginTop: 12, fontSize: 14.5, color: theme.textFaint, lineHeight: 1.6, borderLeft: `2px solid ${theme.border}`, paddingLeft: 14 }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {needKey && !result && (
          <div
            style={{
              marginTop: 32,
              background: theme.status.dueBg,
              border: `1px solid ${theme.status.due}44`,
              borderRadius: theme.radius.lg,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, fontSize: 14.5, color: theme.textMuted, lineHeight: 1.55 }}>
              This gate includes a response graded by Claude. Add your Anthropic API key to submit.
            </div>
            <Button accent={theme.status.due} onClick={onOpenSettings}>
              Open settings
            </Button>
          </div>
        )}

        {gradeError && !result && (
          <div style={{ marginTop: 24, fontSize: 14, color: theme.quiz.wrong.fg, fontFamily: theme.font.mono, letterSpacing: 0.2 }}>
            {gradeError}
          </div>
        )}

        {!result && (
          <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Button accent={theme.status.passed} onClick={submit} disabled={grading || answered < check.questions.length}>
              {grading ? "Grading…" : "Submit for grading"}
            </Button>
            <span style={{ fontSize: 12, color: theme.textFaintest, fontFamily: theme.font.mono, letterSpacing: 0.5 }}>
              {grading
                ? gradedQs.length
                  ? "Claude is grading your response — this can take 20–40s."
                  : "Scoring…"
                : `${answered}/${check.questions.length} answered`}
            </span>
          </div>
        )}
      </div>
    </Page>
  );
}
