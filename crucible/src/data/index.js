// Course registry. Generated courses get added here (one import + one array
// entry). Everything downstream — dashboard, gating, review queue — reads from
// COURSES, so adding a course is a two-line change.

import { probability } from "./courses/probability.js";
import { algorithms } from "./courses/algorithms.js";
import { entrepreneurship } from "./courses/entrepreneurship.js";
import { cloud } from "./courses/cloud-architecture.js";

export const COURSES = [algorithms, entrepreneurship, cloud, probability];

export function getCourse(id) {
  return COURSES.find((c) => c.id === id) || null;
}

// Walk a course's lessons and return a flat list of its review items, each
// tagged with the lesson it came from. Used to seed SRS and build review queues.
export function reviewItemsOf(course) {
  const out = [];
  for (const unit of course.units)
    for (const lesson of unit.lessons)
      for (const item of lesson.reviewItems || []) out.push({ unit, lesson, item });
  return out;
}

export function findReviewItem(course, itemId) {
  return reviewItemsOf(course).find((r) => r.item.id === itemId) || null;
}
