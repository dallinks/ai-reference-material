// Store-server DB tests, run against an in-memory SQLite. The sync-critical
// behavior: importState is an idempotent merge, activity upserts by MAX, and
// progress rows round-trip whole. Run: `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { openDb } from "../server/db.js";

const progress = {
  lessonsComplete: ["u1l1"],
  mastery: { u1: { score: 0.9, attempts: 1 } },
  srs: { "u1l1-i1": { due: "2026-07-02", interval: 1, ease: 2.5, reps: 1, lapses: 0, last: "2026-07-01" } },
};

test("db: progress rows round-trip whole", () => {
  const db = openDb(":memory:");
  db.putProgress("probability", progress);
  assert.deepEqual(db.getState().courses.probability, progress);
  db.close();
});

test("db: activity upserts by MAX — re-sending a log never double-counts", () => {
  const db = openDb(":memory:");
  const log = { days: { "2026-07-01": { lesson: 1, review: 4 } } };
  db.putActivity(log);
  db.putActivity(log); // idempotent re-send
  db.putActivity({ days: { "2026-07-01": { review: 6 } } }); // growth wins
  db.putActivity({ days: { "2026-07-01": { review: 2 } } }); // regression loses
  assert.deepEqual(db.getState().activity.days["2026-07-01"], { lesson: 1, review: 6 });
  db.close();
});

test("db: importState merges a snapshot without losing local work", () => {
  const db = openDb(":memory:");
  db.putProgress("probability", progress);
  db.putActivity({ days: { "2026-07-01": { lesson: 1 } } });

  const merged = db.importState({
    courses: { probability: { lessonsComplete: ["u1l2"], mastery: { u1: { score: 0.7, attempts: 4 } }, srs: {} } },
    activity: { days: { "2026-06-30": { review: 3 } } },
  });

  assert.deepEqual(merged.courses.probability.lessonsComplete, ["u1l1", "u1l2"]); // union
  assert.deepEqual(merged.courses.probability.mastery.u1, { score: 0.9, attempts: 4 }); // best of both
  assert.deepEqual(db.getState(), merged); // persisted, not just returned
  assert.equal(db.getState().activity.days["2026-06-30"].review, 3);

  const again = db.importState(merged); // boot-every-time safety
  assert.deepEqual(again, merged);
  db.close();
});

test("db: resetCourse deletes only that course", () => {
  const db = openDb(":memory:");
  db.putProgress("a", progress);
  db.putProgress("b", progress);
  db.resetCourse("a");
  const state = db.getState();
  assert.equal(state.courses.a, undefined);
  assert.ok(state.courses.b);
  db.close();
});
