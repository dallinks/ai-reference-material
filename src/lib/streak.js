// Study streak + daily goal + heatmap math — the motivation layer's engine.
//
// Pure and testable like srs.js: every function takes `today` as a
// 'YYYY-MM-DD' string and never reads the wall clock. The React layer records
// activity when the loop's real actions happen (lesson completed, review
// graded, gate attempted) and this module turns that log into streaks.
//
// Log shape (persisted via store.js alongside course progress):
//   { days: { 'YYYY-MM-DD': { lesson: n, review: n, check: n } } }
//
// Streak rules — deliberately humane so one bad day doesn't torch a habit:
//   · a day counts if it has ANY recorded activity
//   · ONE missed day per calendar month is auto-bridged (a "grace day")
//   · two consecutive missed days always break the streak
//   · an inactive today doesn't break anything yet — the streak is "at risk"

import { addDays } from "./srs.js";

export const ACTIVITY_KINDS = ["lesson", "review", "check"];

export function emptyActivity() {
  return { days: {} };
}

// Returns a NEW log; never mutates the input (same contract as srs.schedule).
export function recordActivity(log, kind, today) {
  const days = { ...(log?.days || {}) };
  const day = { ...(days[today] || {}) };
  day[kind] = (day[kind] || 0) + 1;
  days[today] = day;
  return { ...log, days };
}

function countOf(day) {
  return day ? (day.lesson || 0) + (day.review || 0) + (day.check || 0) : 0;
}

export function isActiveDay(log, dateStr) {
  return countOf(log?.days?.[dateStr]) > 0;
}

export function activeDayCount(log) {
  return Object.values(log?.days || {}).filter((d) => countOf(d) > 0).length;
}

// A gap day can be bridged when its month still has grace budget AND the day
// before it was active — which is exactly what forbids two misses in a row
// (and stops back-to-back bridges across a month boundary).
const GRACE_PER_MONTH = 1;
const monthOf = (dateStr) => dateStr.slice(0, 7);

// Current streak, walking backward from today (or yesterday when today is
// still empty — the day isn't over). `graceUsed` lists the bridged dates in
// the surviving run, newest first.
export function streakInfo(log, today) {
  const activeToday = isActiveDay(log, today);
  const spent = {}; // 'YYYY-MM' -> grace days consumed in this walk
  const graceUsed = [];
  let current = 0;
  let d = activeToday ? today : addDays(today, -1);

  for (let guard = 0; guard < 40000; guard++) {
    if (isActiveDay(log, d)) {
      current += 1;
      d = addDays(d, -1);
    } else if ((spent[monthOf(d)] || 0) < GRACE_PER_MONTH && isActiveDay(log, addDays(d, -1))) {
      spent[monthOf(d)] = (spent[monthOf(d)] || 0) + 1;
      graceUsed.push(d);
      d = addDays(d, -1); // bridged — keep walking
    } else {
      break;
    }
  }

  return {
    current,
    longest: longestStreak(log, today),
    activeToday,
    atRisk: !activeToday && current > 0,
    graceUsed,
    graceLeftThisMonth: Math.max(0, GRACE_PER_MONTH - (spent[monthOf(today)] || 0)),
  };
}

// Longest run ever, scanning forward with the same monthly grace rule. A gap
// inside a run only bridges when both neighbors are active (retrospectively,
// a dangling grace day at the end of a run adds nothing).
export function longestStreak(log, today) {
  const active = Object.keys(log?.days || {}).filter((k) => countOf(log.days[k]) > 0).sort();
  if (!active.length) return 0;
  const spent = {};
  const last = active[active.length - 1] > today ? active[active.length - 1] : today;
  let best = 0;
  let run = 0;
  for (let d = active[0]; d <= last; d = addDays(d, 1)) {
    if (isActiveDay(log, d)) {
      run += 1;
      if (run > best) best = run;
    } else if (run > 0 && (spent[monthOf(d)] || 0) < GRACE_PER_MONTH && isActiveDay(log, addDays(d, 1))) {
      spent[monthOf(d)] = (spent[monthOf(d)] || 0) + 1; // bridged mid-run gap
    } else {
      run = 0;
    }
  }
  return best;
}

// The daily goal: clear whatever reviews are due AND finish a lesson or take a
// gate. `dueNow` is the live due-count, so seeding new cards mid-day re-opens
// the review half — clear them too.
export function goalProgress(log, today, dueNow) {
  const day = log?.days?.[today] || {};
  const studied = (day.lesson || 0) + (day.check || 0) > 0;
  const reviewsCleared = dueNow === 0;
  return { studied, reviewsCleared, done: studied && reviewsCleared };
}

// Heatmap grid: `weeks` columns × 7 rows (Sunday-first, GitHub-style), the
// last column containing today. Cells carry an intensity level for the ramp.
export function heatmapWeeks(log, today, weeks = 26) {
  const dow = new Date(today + "T00:00:00Z").getUTCDay(); // date strings are naive labels; UTC keeps the math tz-proof
  const start = addDays(addDays(today, -dow), -(weeks - 1) * 7);
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let r = 0; r < 7; r++) {
      const date = addDays(start, w * 7 + r);
      const count = countOf(log?.days?.[date]);
      col.push({ date, count, level: levelOf(count), future: date > today, isToday: date === today });
    }
    cols.push(col);
  }
  return cols;
}

function levelOf(n) {
  if (n <= 0) return 0;
  if (n < 3) return 1;
  if (n < 6) return 2;
  if (n < 10) return 3;
  return 4;
}
