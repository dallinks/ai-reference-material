import { useCallback, useState } from "react";
import { loadProgress, saveProgress, resetCourse } from "../lib/store.js";
import { newCard, schedule, todayStr } from "../lib/srs.js";
import { logActivity } from "./activity.js";

// React binding over the local-first store for a single course. Holds the
// course's progress in state and exposes the three things the loop mutates:
// completing a lesson (which seeds review cards), recording a mastery-check
// score, and grading a review.
export function useProgress(courseId) {
  const [progress, setProgress] = useState(() => loadProgress(courseId));

  const markLesson = useCallback(
    (lesson) => {
      // Streak fuel — outside the updater (StrictMode double-invokes it), and
      // only the first completion of a lesson counts as study.
      if (!loadProgress(courseId).lessonsComplete.includes(lesson.id)) logActivity("lesson");
      setProgress((prev) => {
        const today = todayStr();
        const srs = { ...prev.srs };
        for (const item of lesson.reviewItems || []) {
          if (!srs[item.id]) srs[item.id] = newCard(today); // due immediately, then scheduled out
        }
        const next = {
          ...prev,
          lessonsComplete: [...new Set([...prev.lessonsComplete, lesson.id])],
          srs,
        };
        saveProgress(courseId, next);
        return next;
      });
    },
    [courseId]
  );

  const recordMastery = useCallback(
    (unitId, score) => {
      logActivity("check"); // every gate attempt is real work
      setProgress((prev) => {
        const cur = prev.mastery[unitId];
        const next = {
          ...prev,
          mastery: {
            ...prev.mastery,
            [unitId]: { score: Math.max(cur?.score ?? 0, score), attempts: (cur?.attempts ?? 0) + 1 },
          },
        };
        saveProgress(courseId, next);
        return next;
      });
    },
    [courseId]
  );

  const gradeReview = useCallback(
    (itemId, grade) => {
      logActivity("review");
      setProgress((prev) => {
        const today = todayStr();
        const card = prev.srs[itemId] || newCard(today);
        const next = { ...prev, srs: { ...prev.srs, [itemId]: schedule(card, grade, today) } };
        saveProgress(courseId, next);
        return next;
      });
    },
    [courseId]
  );

  const reset = useCallback(() => {
    resetCourse(courseId);
    setProgress(loadProgress(courseId));
  }, [courseId]);

  return { progress, markLesson, recordMastery, gradeReview, reset };
}
