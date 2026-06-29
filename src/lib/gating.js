// Mastery gating: a unit unlocks only when its prerequisites are passed, and
// "passed" means the recorded mastery-check score cleared the unit's threshold.
// This is the forcing function — you cannot click past material you haven't
// actually demonstrated.

export const DEFAULT_THRESHOLD = 0.85;

function thresholdFor(unit) {
  return unit.masteryThreshold ?? DEFAULT_THRESHOLD;
}

function isPassed(course, unitId, mastery) {
  const unit = course.units.find((u) => u.id === unitId);
  const record = mastery[unitId];
  return !!(unit && record && record.score >= thresholdFor(unit));
}

// Returns { [unitId]: { status: 'locked' | 'open' | 'passed', score } }.
// Prerequisites default to the immediately preceding unit (linear course) when
// a unit does not declare its own `prerequisites` array.
export function unitStates(course, progress) {
  const mastery = progress?.mastery || {};
  const states = {};

  course.units.forEach((unit, i) => {
    const prereqs = unit.prerequisites ?? (i === 0 ? [] : [course.units[i - 1].id]);
    const passed = isPassed(course, unit.id, mastery);
    const unlocked = prereqs.every((p) => isPassed(course, p, mastery));
    states[unit.id] = {
      status: passed ? "passed" : unlocked ? "open" : "locked",
      score: mastery[unit.id]?.score ?? null,
      prereqs,
    };
  });

  return states;
}

// Overall course completion = fraction of units passed.
export function courseProgress(course, progress) {
  const states = unitStates(course, progress);
  const passed = course.units.filter((u) => states[u.id].status === "passed").length;
  return { passed, total: course.units.length, pct: course.units.length ? passed / course.units.length : 0 };
}
