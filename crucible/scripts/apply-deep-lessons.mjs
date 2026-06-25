// Splice workflow-generated deep lessons into algorithms.js, in place, by
// brace-matching each unit's `lessons:` array — preserving everything else
// (unit metadata, masteryCheck, comments, other units).
//
// Input JSON (path as argv[2]): an array of { unitId, lessonsJson } where
// lessonsJson is a strictly-valid JSON array of lesson objects.
//
//   node scripts/apply-deep-lessons.mjs scripts/_deep-batch.json
//
// Idempotent per run; validates each lessonsJson parses and re-serializes it as
// pretty JSON (valid JS) at the unit's indentation.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE = path.join(__dirname, "..", "src", "data", "courses", "algorithms.js");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("usage: node apply-deep-lessons.mjs <batch.json>");
  process.exit(1);
}

// Accept either a raw [{unitId, lessonsJson}] array or a workflow output
// wrapper ({summary, logs, result:[…]}) — find the unit array anywhere inside.
function findUnitArray(x) {
  if (Array.isArray(x) && x.length && x.every((e) => e && e.unitId && e.lessonsJson)) return x;
  if (x && typeof x === "object") {
    for (const v of Object.values(x)) {
      const found = findUnitArray(v);
      if (found) return found;
    }
  }
  return null;
}

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const batch = findUnitArray(raw);
if (!batch) throw new Error("no [{unitId, lessonsJson}] array found in input");
let src = fs.readFileSync(COURSE, "utf8");

// Find the `lessons: [ … ]` array belonging to a given unit id, by locating the
// unit object (`id: "<unitId>",`) then the first `lessons: [` after it and
// bracket-matching to its close. Returns {start, end} spanning `[ … ]`.
function findLessonsSpan(text, unitId) {
  const unitAnchor = text.indexOf(`id: "${unitId}",`);
  if (unitAnchor === -1) throw new Error(`unit anchor not found: ${unitId}`);
  const lessonsKey = text.indexOf("lessons:", unitAnchor);
  if (lessonsKey === -1) throw new Error(`lessons: not found for ${unitId}`);
  const open = text.indexOf("[", lessonsKey);
  if (open === -1) throw new Error(`lessons [ not found for ${unitId}`);
  // bracket-match, respecting strings (", ', `) and escapes
  let depth = 0, i = open, str = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (str) {
      if (c === "\\") { i++; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { i++; break; } }
  }
  if (depth !== 0) throw new Error(`unbalanced brackets for ${unitId}`);
  return { start: open, end: i }; // [open, end) covers `[ … ]`
}

const report = [];
// Apply right-to-left so earlier offsets stay valid as we replace.
const ordered = [...batch].sort((a, b) => {
  const ia = src.indexOf(`id: "${a.unitId}",`);
  const ib = src.indexOf(`id: "${b.unitId}",`);
  return ib - ia;
});

for (const { unitId, lessonsJson } of ordered) {
  let lessons;
  try {
    lessons = JSON.parse(lessonsJson);
  } catch (e) {
    throw new Error(`${unitId}: lessonsJson is not valid JSON — ${e.message}`);
  }
  if (!Array.isArray(lessons) || !lessons.length) throw new Error(`${unitId}: lessons must be a non-empty array`);
  const { start, end } = findLessonsSpan(src, unitId);
  // indent the array body two spaces under `lessons:` (which sits at 6 spaces)
  const serialized = JSON.stringify(lessons, null, 2)
    .split("\n")
    .map((line, idx) => (idx === 0 ? line : "      " + line))
    .join("\n");
  src = src.slice(0, start) + serialized + src.slice(end);
  report.push(`${unitId}: ${lessons.length} lessons spliced`);
}

fs.writeFileSync(COURSE, src);
console.log(report.join("\n"));
console.log(`\nWrote ${COURSE}`);
