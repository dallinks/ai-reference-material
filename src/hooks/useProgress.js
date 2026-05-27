import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ai-course-v2";

export function useProgress() {
  const [completed, setCompleted] = useState(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCompleted(new Set(JSON.parse(stored)));
    } catch {}
    setReady(true);
  }, []);

  const save = useCallback((set) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {}
  }, []);

  const toggle = useCallback(
    (id) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        save(next);
        return next;
      });
    },
    [save]
  );

  const markDone = useCallback(
    (id) => {
      setCompleted((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        save(next);
        return next;
      });
    },
    [save]
  );

  return { completed, ready, toggle, markDone };
}
