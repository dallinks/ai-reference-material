// Pure-engine tests. The accountability guarantees (gating can't be skipped,
// reviews schedule forward, grading is strict) live here. Run: `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { newCard, schedule, isDue } from "../src/lib/srs.js";
import { unitStates, DEFAULT_THRESHOLD } from "../src/lib/gating.js";
import { gradeAssessment } from "../src/lib/grading.js";

test("srs: a new card is due today and a good review pushes it out", () => {
  const card = newCard("2026-01-01");
  assert.ok(isDue(card, "2026-01-01"));
  const after = schedule(card, "good", "2026-01-01");
  assert.equal(after.due, "2026-01-02");
  assert.ok(!isDue(after, "2026-01-01"));
});

test("srs: 'again' keeps the card due today and lowers ease", () => {
  const card = schedule(newCard("2026-01-01"), "good", "2026-01-01"); // reps=1
  const lapsed = schedule(card, "again", "2026-01-02");
  assert.equal(lapsed.due, "2026-01-02");
  assert.equal(lapsed.reps, 0);
  assert.ok(lapsed.ease < card.ease);
});

test("srs: intervals grow with repeated good reviews", () => {
  let c = newCard("2026-01-01");
  c = schedule(c, "good", "2026-01-01"); // -> 1d
  c = schedule(c, "good", c.due); // -> 6d
  const i2 = c.interval;
  c = schedule(c, "good", c.due); // -> ~6*ease
  assert.ok(c.interval > i2);
});

test("gating: first unit is open, later units locked until prereq passed", () => {
  const course = {
    units: [
      { id: "u1", lessons: [], masteryThreshold: 0.85 },
      { id: "u2", prerequisites: ["u1"], lessons: [], masteryThreshold: 0.85 },
    ],
  };
  const empty = unitStates(course, { mastery: {} });
  assert.equal(empty.u1.status, "open");
  assert.equal(empty.u2.status, "locked");

  const passed = unitStates(course, { mastery: { u1: { score: 0.9 } } });
  assert.equal(passed.u1.status, "passed");
  assert.equal(passed.u2.status, "open");
});

test("gating: a sub-threshold score does NOT unlock the next unit", () => {
  const course = {
    units: [
      { id: "u1", lessons: [], masteryThreshold: 0.85 },
      { id: "u2", prerequisites: ["u1"], lessons: [], masteryThreshold: 0.85 },
    ],
  };
  const states = unitStates(course, { mastery: { u1: { score: 0.8 } } });
  assert.equal(states.u1.status, "open"); // attempted but not passed
  assert.equal(states.u2.status, "locked");
});

test("grading: mixed question types score strictly", () => {
  const assessment = {
    questions: [
      { id: "q1", type: "mcq", answer: 2 },
      { id: "q2", type: "numeric", answer: 0.7, tolerance: 0.001 },
      { id: "q3", type: "short", accept: ["1 - P(A)", "1-P(A)"] },
    ],
  };
  const perfect = gradeAssessment(assessment, { q1: 2, q2: "0.7", q3: "1-P(A)" });
  assert.equal(perfect.score, 1);

  const partial = gradeAssessment(assessment, { q1: 0, q2: "0.71", q3: " 1 - p(a) " });
  assert.equal(partial.correctCount, 1); // only the short answer (normalized) is right
});

test("grading: proof scores fold in via proofResults with question weights", () => {
  const assessment = {
    questions: [
      { id: "a", type: "mcq", answer: 0 },
      { id: "p", type: "proof", points: 3, rubric: ["x"], solution: "y" },
    ],
  };
  // mcq correct (score 1, weight 1); proof partial (score 0.5, weight 3)
  const r = gradeAssessment(assessment, { a: 0 }, { p: { score: 0.5 } });
  assert.equal(r.score, (1 * 1 + 0.5 * 3) / 4); // 0.625
  assert.equal(r.correctCount, 1); // only the fully-correct mcq counts as "correct"

  // A missing proof grade scores 0 — you can't pass a proof gate without grading it.
  const r0 = gradeAssessment(assessment, { a: 0 }, {});
  assert.equal(r0.score, 1 / 4);
});

test("threshold default is exported and sane", () => {
  assert.ok(DEFAULT_THRESHOLD > 0.5 && DEFAULT_THRESHOLD <= 1);
});
