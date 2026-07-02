// Local-first persistence with a swappable seam — now two-tier:
//
//   SERVER MODE (normal `npm run dev` / `npm run preview`): the Vite plugin in
//   server/store-plugin.js owns a machine-local SQLite DB and mirrors every
//   change into data/progress.json — the file you commit to sync progress
//   across machines via git. This module keeps a whole-state in-memory cache
//   so the app's synchronous read/write API is unchanged; writes stream
//   through to the server in the background. Call initStore() once at boot
//   (main.jsx) before rendering.
//
//   FALLBACK MODE (static deploy, no API): the original localStorage blob,
//   byte-for-byte the old behavior.
//
// On the first server-mode boot, any legacy localStorage blob is pushed
// through POST /api/migrate (an idempotent merge) and parked under a backup
// key, so pre-server progress is folded in exactly once.
//
// Per-course progress shape:
//   {
//     lessonsComplete: string[],                       // lesson ids
//     mastery: { [unitId]: { score, attempts } },      // best mastery-check result
//     srs: { [itemId]: card },                          // see lib/srs.js
//   }
//
// Activity log shape: see lib/streak.js.

import { emptyActivity } from "./streak.js";
import { emptyState } from "./merge.js";

const KEY = "crucible-v1";
const MIGRATED_KEY = "crucible-v1-migrated-backup";

export function emptyProgress() {
  return { lessonsComplete: [], mastery: {}, srs: {} };
}

// ── fallback tier: the original localStorage blob ───────────────────────────

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

// ── server tier: in-memory cache over the SQLite store server ────────────────

let serverMode = false;
let cache = null; // { courses, activity } — authoritative within this session

const clone = (x) => (x === undefined ? x : structuredClone(x));

function normalize(state) {
  const s = { ...emptyState(), ...(state || {}) };
  s.courses = s.courses || {};
  s.activity = s.activity?.days ? s.activity : emptyActivity();
  return s;
}

function push(url, method, body) {
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? null),
  }).catch((e) => console.warn(`[store] background ${method} ${url} failed:`, e));
}

async function migrateLegacyBlob() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (!raw) return;
  try {
    const legacy = JSON.parse(raw);
    const hasWork =
      Object.keys(legacy.courses || {}).length > 0 || Object.keys(legacy.activity?.days || {}).length > 0;
    if (hasWork) {
      const r = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: legacy.courses || {}, activity: legacy.activity || emptyActivity() }),
      });
      if (!r.ok) return; // leave the blob; we'll retry next boot
      cache = normalize(await r.json());
    }
    localStorage.setItem(MIGRATED_KEY, raw); // keep a parked backup, out of the boot path
    localStorage.removeItem(KEY);
  } catch (e) {
    console.warn("[store] legacy migration skipped:", e);
  }
}

// Decides the tier. Server mode requires a real JSON answer — a static host
// returning index.html or a 404 for /api/state drops us to localStorage.
export async function initStore() {
  try {
    const r = await fetch("/api/state");
    if (r.ok && (r.headers.get("content-type") || "").includes("application/json")) {
      cache = normalize(await r.json());
      serverMode = true;
      await migrateLegacyBlob();
      return { serverMode };
    }
  } catch {}
  serverMode = false;
  return { serverMode };
}

export function isServerMode() {
  return serverMode;
}

// ── the app-facing API (synchronous, unchanged) ──────────────────────────────

export function loadProgress(courseId) {
  if (serverMode) return clone(cache.courses[courseId]) || emptyProgress();
  return readAll().courses[courseId] || emptyProgress();
}

export function saveProgress(courseId, progress) {
  if (serverMode) {
    cache.courses[courseId] = clone(progress);
    push(`/api/progress/${encodeURIComponent(courseId)}`, "PUT", progress);
    return;
  }
  const data = readAll();
  data.courses[courseId] = progress;
  writeAll(data);
}

export function loadAllProgress() {
  if (serverMode) return clone(cache.courses);
  return readAll().courses;
}

export function resetCourse(courseId) {
  if (serverMode) {
    delete cache.courses[courseId];
    push(`/api/reset/${encodeURIComponent(courseId)}`, "POST");
    return;
  }
  const data = readAll();
  delete data.courses[courseId];
  writeAll(data);
}

export function loadActivity() {
  if (serverMode) return clone(cache.activity);
  return readAll().activity || emptyActivity();
}

export function saveActivity(activity) {
  if (serverMode) {
    cache.activity = clone(activity);
    push("/api/activity", "PUT", activity);
    return;
  }
  const data = readAll();
  data.activity = activity;
  writeAll(data);
}
