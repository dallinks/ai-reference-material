// Local-first persistence. One versioned blob in localStorage keyed by course.
// Swappable: every read/write goes through here, so moving to IndexedDB or a
// synced backend later touches only this file.
//
// Per-course progress shape:
//   {
//     lessonsComplete: string[],                       // lesson ids
//     mastery: { [unitId]: { score, passedAt } },      // best mastery-check result
//     srs: { [itemId]: card },                          // see lib/srs.js
//   }

const KEY = "crucible-v1";

export function emptyProgress() {
  return { lessonsComplete: [], mastery: {}, srs: {} };
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { version: 1, courses: {} };
}

function writeAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function loadProgress(courseId) {
  return readAll().courses[courseId] || emptyProgress();
}

export function saveProgress(courseId, progress) {
  const data = readAll();
  data.courses[courseId] = progress;
  writeAll(data);
}

export function loadAllProgress() {
  return readAll().courses;
}

export function resetCourse(courseId) {
  const data = readAll();
  delete data.courses[courseId];
  writeAll(data);
}
