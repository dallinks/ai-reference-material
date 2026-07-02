// Cross-course review queue. The daily forcing function lives here: gather every
// SRS card that is due today, across all courses, regardless of which course it
// came from — knowledge review shouldn't be siloed by subject.

import { COURSES, reviewItemsOf } from "../data/index.js";
import { loadProgress, saveProgress } from "../lib/store.js";
import { isDue, newCard, schedule, todayStr } from "../lib/srs.js";
import { logActivity } from "./activity.js";

export function buildDueQueue(today = todayStr()) {
  const queue = [];
  for (const course of COURSES) {
    const progress = loadProgress(course.id);
    for (const { unit, lesson, item } of reviewItemsOf(course)) {
      const card = progress.srs[item.id];
      if (card && isDue(card, today)) {
        queue.push({ courseId: course.id, courseTitle: course.title, unitId: unit.id, lessonId: lesson.id, item, card });
      }
    }
  }
  return queue.sort((a, b) => (a.card.due < b.card.due ? -1 : a.card.due > b.card.due ? 1 : 0));
}

export function dueCount(today = todayStr()) {
  return buildDueQueue(today).length;
}

// Standalone grade so the cross-course ReviewView doesn't need one hook per
// course. Writes straight through the store.
export function gradeReviewItem(courseId, itemId, grade, today = todayStr()) {
  const progress = loadProgress(courseId);
  const card = progress.srs[itemId] || newCard(today);
  progress.srs = { ...progress.srs, [itemId]: schedule(card, grade, today) };
  saveProgress(courseId, progress);
  logActivity("review", today); // streak fuel
}
