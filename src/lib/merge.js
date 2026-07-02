// Cross-machine merge for git-synced progress. Pure and dependency-free —
// runs in the browser AND in the Node server, tested in test/merge.test.js.
//
// The contract that makes sync forgiving:
//   · symmetric   — merge(a, b) and merge(b, a) keep the same work
//   · idempotent  — merge(a, a) = a, so re-importing a stale snapshot or an
//                   old localStorage blob is always harmless
//   · lossless-biased — when two machines disagree, prefer the interpretation
//                   that keeps MORE progress (you can re-earn nothing here)
//
// Per-field semantics:
//   lessonsComplete — set union (finished anywhere = finished everywhere)
//   mastery         — per unit: best score, most attempts ever seen
//   srs             — per card: the most recently reviewed side wins
//   activity.days   — per day+kind: MAX of the counts (a split-brain day may
//                     undercount; it can never double-count)

export function emptyState() {
  return { courses: {}, activity: { days: {} } };
}

function emptyProgressShape() {
  return { lessonsComplete: [], mastery: {}, srs: {} };
}

// Deterministic ordering for the newest-review-wins rule: compare by last
// review date, then due date, then reps, then interval. Ties keep `a`.
function newerCard(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ka = [a.last ?? "", a.due ?? "", a.reps ?? 0, a.interval ?? 0];
  const kb = [b.last ?? "", b.due ?? "", b.reps ?? 0, b.interval ?? 0];
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] < kb[i]) return b;
    if (ka[i] > kb[i]) return a;
  }
  return a;
}

export function mergeProgress(a, b) {
  const pa = { ...emptyProgressShape(), ...(a || {}) };
  const pb = { ...emptyProgressShape(), ...(b || {}) };

  const lessonsComplete = [...new Set([...pa.lessonsComplete, ...pb.lessonsComplete])].sort();

  const mastery = {};
  for (const unitId of new Set([...Object.keys(pa.mastery), ...Object.keys(pb.mastery)])) {
    const ma = pa.mastery[unitId];
    const mb = pb.mastery[unitId];
    mastery[unitId] = {
      ...(ma || {}),
      ...(mb || {}),
      score: Math.max(ma?.score ?? 0, mb?.score ?? 0),
      attempts: Math.max(ma?.attempts ?? 0, mb?.attempts ?? 0),
    };
  }

  const srs = {};
  for (const itemId of new Set([...Object.keys(pa.srs), ...Object.keys(pb.srs)])) {
    srs[itemId] = newerCard(pa.srs[itemId], pb.srs[itemId]);
  }

  return { lessonsComplete, mastery, srs };
}

export function mergeActivity(a, b) {
  const daysA = a?.days || {};
  const daysB = b?.days || {};
  const days = {};
  for (const day of new Set([...Object.keys(daysA), ...Object.keys(daysB)])) {
    const da = daysA[day] || {};
    const db = daysB[day] || {};
    const merged = {};
    for (const kind of new Set([...Object.keys(da), ...Object.keys(db)])) {
      merged[kind] = Math.max(da[kind] || 0, db[kind] || 0);
    }
    days[day] = merged;
  }
  return { days };
}

// state = { courses: { [courseId]: progress }, activity: { days } }
export function mergeState(a, b) {
  const sa = { ...emptyState(), ...(a || {}) };
  const sb = { ...emptyState(), ...(b || {}) };
  const courses = {};
  for (const id of new Set([...Object.keys(sa.courses || {}), ...Object.keys(sb.courses || {})])) {
    courses[id] = mergeProgress(sa.courses?.[id], sb.courses?.[id]);
  }
  return { courses, activity: mergeActivity(sa.activity, sb.activity) };
}

// Stable key order at every depth, so the committed snapshot is byte-identical
// for identical state — git diffs show real changes, nothing else.
export function sortKeysDeep(x) {
  if (Array.isArray(x)) return x.map(sortKeysDeep);
  if (x && typeof x === "object") {
    const out = {};
    for (const k of Object.keys(x).sort()) out[k] = sortKeysDeep(x[k]);
    return out;
  }
  return x;
}
