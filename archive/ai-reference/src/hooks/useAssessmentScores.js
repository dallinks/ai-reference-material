import { useCallback, useEffect, useState } from "react";

// Best quiz score per module, kept separate from lesson progress so it never
// distorts the lesson-based completion percentage. Shape: { [modId]: pct }.
const STORAGE_KEY = "ai-course-assessments-v1";

export function useAssessmentScores() {
  const [scores, setScores] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setScores(JSON.parse(stored));
    } catch {}
    setReady(true);
  }, []);

  const recordScore = useCallback((modId, pct) => {
    setScores((prev) => {
      const best = Math.max(prev[modId] ?? 0, pct);
      if (best === prev[modId]) return prev;
      const next = { ...prev, [modId]: best };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { scores, ready, recordScore };
}
