// SQLite persistence for the local store server — built on node:sqlite (Node
// >= 22.5, zero native dependencies). The DB file is machine-local and
// GITIGNORED; the git-synced artifact is the JSON snapshot the plugin writes.
//
// Schema philosophy: per-course progress stays a JSON blob (the app reads and
// writes it whole), while activity is properly relational — its per-day-max
// merge maps straight onto UPSERT, and future features (transcript, stats)
// get real SQL to query.

import { DatabaseSync } from "node:sqlite";
import { mergeState, emptyState } from "../src/lib/merge.js";

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      course_id TEXT PRIMARY KEY,
      data      TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity_days (
      day   TEXT NOT NULL,
      kind  TEXT NOT NULL,
      count INTEGER NOT NULL,
      PRIMARY KEY (day, kind)
    );
  `);

  const upsertProgress = db.prepare(
    "INSERT INTO progress (course_id, data) VALUES (?, ?) ON CONFLICT(course_id) DO UPDATE SET data = excluded.data"
  );
  // Counts only ever grow on a machine, so MAX both dedupes re-imports and
  // keeps the larger of two diverged histories — same rule as lib/merge.js.
  const upsertDay = db.prepare(
    "INSERT INTO activity_days (day, kind, count) VALUES (?, ?, ?) ON CONFLICT(day, kind) DO UPDATE SET count = MAX(count, excluded.count)"
  );

  function getState() {
    const state = emptyState();
    for (const row of db.prepare("SELECT course_id, data FROM progress").all()) {
      try {
        state.courses[row.course_id] = JSON.parse(row.data);
      } catch {}
    }
    for (const row of db.prepare("SELECT day, kind, count FROM activity_days").all()) {
      (state.activity.days[row.day] ??= {})[row.kind] = row.count;
    }
    return state;
  }

  function putProgress(courseId, progress) {
    upsertProgress.run(courseId, JSON.stringify(progress));
  }

  function putActivity(activity) {
    for (const [day, kinds] of Object.entries(activity?.days || {})) {
      for (const [kind, count] of Object.entries(kinds)) {
        if (Number.isFinite(count) && count > 0) upsertDay.run(day, kind, Math.floor(count));
      }
    }
  }

  // Merge an external state (git snapshot, legacy localStorage blob) into the
  // DB. Idempotent by construction — safe to call on every boot.
  function importState(incoming) {
    const merged = mergeState(getState(), incoming || {});
    for (const [courseId, progress] of Object.entries(merged.courses)) putProgress(courseId, progress);
    putActivity(merged.activity);
    return merged;
  }

  function resetCourse(courseId) {
    db.prepare("DELETE FROM progress WHERE course_id = ?").run(courseId);
  }

  return { getState, putProgress, putActivity, importState, resetCourse, close: () => db.close() };
}
