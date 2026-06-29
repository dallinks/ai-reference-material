// Assessment scoring. Each question yields a score in [0,1]; the overall score
// is the weighted average (per-question `points`, default 1). Auto-gradable
// types score 0 or 1 deterministically here; AI-graded free-response types
// (`proof`, `open`) are graded by lib/grader.js and their scores passed in via
// `proofResults` — keeping this module pure and synchronously testable.
//
//   mcq     answer: <optionIndex>          response: <optionIndex>
//   multi   answer: [<optionIndex>, ...]   response: [<optionIndex>, ...]
//   numeric answer: <number>, tolerance?   response: <string|number>
//   short   accept: [<string>, ...]        response: <string>
//   proof   rubric: [...], solution: ...   graded async -> proofResults[id].score
//   open    rubric: [...], solution: ...   graded async -> proofResults[id].score

export const GRADED_TYPES = new Set(["proof", "open"]);

export function normalize(s) {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number(n) || 0));
}

// Boolean for the auto-gradable types. AI-graded types return false here — they
// are graded out of band and folded in via proofResults in gradeAssessment.
export function gradeQuestion(q, response) {
  switch (q.type) {
    case "mcq":
      return response === q.answer;
    case "multi": {
      const a = [...(q.answer || [])].sort().join(",");
      const r = [...(response || [])].sort().join(",");
      return a.length > 0 && a === r;
    }
    case "numeric": {
      const n = parseFloat(response);
      if (Number.isNaN(n)) return false;
      return Math.abs(n - q.answer) <= (q.tolerance ?? 0);
    }
    case "short":
      return (q.accept || []).some((a) => normalize(a) === normalize(response));
    default:
      return false;
  }
}

export function gradeAssessment(assessment, responses, proofResults = {}) {
  const results = assessment.questions.map((q) => {
    const weight = q.points ?? 1;
    const score = GRADED_TYPES.has(q.type)
      ? clamp01(proofResults[q.id]?.score ?? 0)
      : gradeQuestion(q, responses[q.id])
      ? 1
      : 0;
    return { id: q.id, type: q.type, weight, score, correct: score >= 1 };
  });

  const totalWeight = results.reduce((s, r) => s + r.weight, 0);
  const earned = results.reduce((s, r) => s + r.score * r.weight, 0);

  return {
    results,
    correctCount: results.filter((r) => r.score >= 1).length,
    total: results.length,
    score: totalWeight ? earned / totalWeight : 0,
  };
}
