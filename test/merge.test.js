// Merge-engine tests. The sync guarantees (no work lost regardless of merge
// order, safe to re-import stale snapshots, deterministic serialization for
// clean git diffs) live here. Run: `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { mergeProgress, mergeActivity, mergeState, sortKeysDeep, emptyState } from "../src/lib/merge.js";

const cardA = { due: "2026-07-03", interval: 2, ease: 2.5, reps: 2, lapses: 0, last: "2026-07-01" };
const cardB = { due: "2026-07-10", interval: 6, ease: 2.6, reps: 3, lapses: 0, last: "2026-07-04" };

test("merge: lessonsComplete is a sorted union", () => {
  const m = mergeProgress({ lessonsComplete: ["b", "a"] }, { lessonsComplete: ["c", "a"] });
  assert.deepEqual(m.lessonsComplete, ["a", "b", "c"]);
});

test("merge: mastery keeps the best score and the most attempts", () => {
  const m = mergeProgress(
    { mastery: { u1: { score: 0.9, attempts: 2 }, u2: { score: 0.5, attempts: 1 } } },
    { mastery: { u1: { score: 0.7, attempts: 5 } } }
  );
  assert.deepEqual(m.mastery.u1, { score: 0.9, attempts: 5 });
  assert.deepEqual(m.mastery.u2, { score: 0.5, attempts: 1 }); // one-sided units survive
});

test("merge: the most recently reviewed SRS card wins, either direction", () => {
  const ab = mergeProgress({ srs: { i1: cardA } }, { srs: { i1: cardB } });
  const ba = mergeProgress({ srs: { i1: cardB } }, { srs: { i1: cardA } });
  assert.deepEqual(ab.srs.i1, cardB); // cardB reviewed later (last 07-04)
  assert.deepEqual(ba.srs.i1, cardB);
  const oneSided = mergeProgress({ srs: { i1: cardA } }, {});
  assert.deepEqual(oneSided.srs.i1, cardA);
});

test("merge: activity takes the per-day per-kind MAX — never double-counts", () => {
  const m = mergeActivity(
    { days: { "2026-07-01": { lesson: 1, review: 4 }, "2026-07-02": { review: 2 } } },
    { days: { "2026-07-01": { lesson: 2, check: 1 } } }
  );
  assert.deepEqual(m.days["2026-07-01"], { lesson: 2, review: 4, check: 1 });
  assert.deepEqual(m.days["2026-07-02"], { review: 2 });
});

test("merge: idempotent and symmetric at the state level", () => {
  const state = {
    courses: {
      algorithms: { lessonsComplete: ["a1l1"], mastery: { a1: { score: 0.9, attempts: 1 } }, srs: { x: cardA } },
      probability: { lessonsComplete: ["u1l1"], mastery: {}, srs: {} },
    },
    activity: { days: { "2026-07-01": { lesson: 1 } } },
  };
  const other = {
    courses: { algorithms: { lessonsComplete: ["a1l2"], mastery: { a1: { score: 0.86, attempts: 3 } }, srs: { x: cardB } } },
    activity: { days: { "2026-07-01": { lesson: 1, review: 4 } } },
  };

  const self = mergeState(state, state);
  assert.deepEqual(mergeState(self, state), self); // idempotent: re-merging adds nothing
  assert.deepEqual(self.courses.algorithms.lessonsComplete, ["a1l1"]);

  const ab = mergeState(state, other);
  const ba = mergeState(other, state);
  assert.deepEqual(ab, ba); // no ordering surprises
  assert.deepEqual(ab.courses.algorithms.lessonsComplete, ["a1l1", "a1l2"]);
  assert.equal(ab.courses.algorithms.mastery.a1.score, 0.9);
  assert.equal(ab.courses.algorithms.mastery.a1.attempts, 3);
  assert.deepEqual(ab.courses.algorithms.srs.x, cardB);
  assert.ok(ab.courses.probability); // one-sided course survives
});

test("merge: merging an empty state changes nothing", () => {
  const state = {
    courses: { c: { lessonsComplete: ["l1"], mastery: { u: { score: 1, attempts: 1 } }, srs: { i: cardA } } },
    activity: { days: { "2026-07-01": { review: 3 } } },
  };
  assert.deepEqual(mergeState(state, emptyState()), mergeState(emptyState(), state));
  assert.deepEqual(mergeState(state, emptyState()).courses.c.lessonsComplete, ["l1"]);
});

test("snapshot: sortKeysDeep gives byte-identical JSON for identical state", () => {
  const a = { b: { z: 1, a: [{ y: 2, x: 1 }] }, a: 3 };
  const b = { a: 3, b: { a: [{ x: 1, y: 2 }], z: 1 } };
  assert.equal(JSON.stringify(sortKeysDeep(a)), JSON.stringify(sortKeysDeep(b)));
});
