// Streak-engine tests. The habit guarantees (consecutive days count, one grace
// day a month bridges a single miss, two misses break, today-in-progress never
// breaks) live here. Run: `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { todayStr } from "../src/lib/srs.js";
import {
  emptyActivity,
  recordActivity,
  isActiveDay,
  streakInfo,
  longestStreak,
  goalProgress,
  heatmapWeeks,
} from "../src/lib/streak.js";

// Build a log with one qualifying action on each given day.
function logOf(...days) {
  let log = emptyActivity();
  for (const d of days) log = recordActivity(log, "lesson", d);
  return log;
}

test("streak: recordActivity increments per kind and never mutates the input", () => {
  const before = emptyActivity();
  const after = recordActivity(before, "review", "2026-03-01");
  assert.equal(after.days["2026-03-01"].review, 1);
  assert.equal(before.days["2026-03-01"], undefined); // input untouched
  const twice = recordActivity(after, "review", "2026-03-01");
  assert.equal(twice.days["2026-03-01"].review, 2);
  assert.ok(isActiveDay(twice, "2026-03-01"));
});

test("streak: consecutive active days ending today", () => {
  const log = logOf("2026-03-04", "2026-03-05", "2026-03-06");
  const s = streakInfo(log, "2026-03-06");
  assert.equal(s.current, 3);
  assert.ok(s.activeToday);
  assert.ok(!s.atRisk);
});

test("streak: an empty today doesn't break the run — it's at risk", () => {
  const log = logOf("2026-03-04", "2026-03-05");
  const s = streakInfo(log, "2026-03-06");
  assert.equal(s.current, 2); // anchored at yesterday
  assert.ok(!s.activeToday);
  assert.ok(s.atRisk);
});

test("streak: one missed day is bridged by the monthly grace day", () => {
  const log = logOf("2026-03-01", "2026-03-02", "2026-03-03", "2026-03-05", "2026-03-06");
  const s = streakInfo(log, "2026-03-06"); // 03-04 missed
  assert.equal(s.current, 5); // grace bridges, active days still count
  assert.deepEqual(s.graceUsed, ["2026-03-04"]);
  assert.equal(s.graceLeftThisMonth, 0);
});

test("streak: a second miss in the same month breaks the run", () => {
  const log = logOf("2026-03-01", "2026-03-02", "2026-03-04", "2026-03-06");
  const s = streakInfo(log, "2026-03-06"); // missed 03-03 and 03-05
  assert.equal(s.current, 2); // 03-05 bridged, then 03-03 has no grace left
  assert.deepEqual(s.graceUsed, ["2026-03-05"]);
});

test("streak: two consecutive missed days always break, grace or not", () => {
  const log = logOf("2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05", "2026-03-08");
  const s = streakInfo(log, "2026-03-08"); // 03-06 and 03-07 both missed
  assert.equal(s.current, 1);
});

test("streak: no double-bridge across a month boundary", () => {
  const log = logOf("2026-01-29", "2026-01-30", "2026-02-02");
  const s = streakInfo(log, "2026-02-02"); // Jan 31 AND Feb 1 missed — different months, still consecutive
  assert.equal(s.current, 1);
});

test("streak: longest run bridges a mid-run gap but respects the budget", () => {
  const log = logOf("2026-01-01", "2026-01-02", "2026-01-03", "2026-01-05", "2026-01-06", "2026-01-10");
  // 01-04 bridged (5-day run); 01-07/08/09 exhaust January's grace and break.
  assert.equal(longestStreak(log, "2026-01-10"), 5);
  const s = streakInfo(log, "2026-01-10");
  assert.equal(s.current, 1);
  assert.equal(s.longest, 5);
});

test("goal: needs a lesson or gate attempt — reviews alone don't study", () => {
  const reviewsOnly = recordActivity(emptyActivity(), "review", "2026-03-06");
  assert.equal(goalProgress(reviewsOnly, "2026-03-06", 0).studied, false);
  assert.equal(goalProgress(reviewsOnly, "2026-03-06", 0).reviewsCleared, true);

  const lesson = recordActivity(emptyActivity(), "lesson", "2026-03-06");
  assert.ok(goalProgress(lesson, "2026-03-06", 0).done);

  const gate = recordActivity(emptyActivity(), "check", "2026-03-06");
  assert.ok(goalProgress(gate, "2026-03-06", 3).studied);
  assert.equal(goalProgress(gate, "2026-03-06", 3).done, false); // 3 reviews still due
});

test("heatmap: grid shape, today flag, and intensity buckets", () => {
  let log = emptyActivity();
  const bump = (day, n) => {
    for (let i = 0; i < n; i++) log = recordActivity(log, "review", day);
  };
  bump("2026-03-03", 1); // level 1
  bump("2026-03-04", 5); // level 2
  bump("2026-03-05", 9); // level 3
  bump("2026-03-06", 12); // level 4

  const weeks = heatmapWeeks(log, "2026-03-06", 26);
  assert.equal(weeks.length, 26);
  assert.ok(weeks.every((col) => col.length === 7));

  const cells = weeks.flat();
  const at = (d) => cells.find((c) => c.date === d);
  assert.ok(at("2026-03-06").isToday);
  assert.equal(at("2026-03-03").level, 1);
  assert.equal(at("2026-03-04").level, 2);
  assert.equal(at("2026-03-05").level, 3);
  assert.equal(at("2026-03-06").level, 4);
  assert.equal(at("2026-03-02").level, 0);
  // the last column ends the week containing today; nothing after it exists
  assert.ok(cells.filter((c) => c.future).every((c) => c.date > "2026-03-06"));
});

test("todayStr: uses the LOCAL calendar day (late-night study counts today)", () => {
  // Date(y,m,d,h) is constructed in local time, so this holds in any timezone.
  assert.equal(todayStr(new Date(2026, 2, 6, 23, 45)), "2026-03-06");
  assert.equal(todayStr(new Date(2026, 2, 6, 0, 10)), "2026-03-06");
});
