// Validate every registered course against the schema — shape AND depth (see
// DEPTH in src/lib/schema.js). Run before trusting any generated course:
//   npm run validate              — all courses
//   npm run validate -- <id>      — one course, full error listing
// Exits non-zero on any error so it can gate a build or a commit hook.

import { COURSES } from "../src/data/index.js";
import { validateCourse } from "../src/lib/schema.js";

const only = process.argv[2];
const courses = only ? COURSES.filter((c) => c.id === only) : COURSES;
if (only && !courses.length) {
  console.error(`No course with id "${only}". Known: ${COURSES.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

// When validating everything, cap the per-course error listing so the summary
// stays readable; pass a course id to see its full worklist.
const MAX_SHOWN = only ? Infinity : 10;
const results = [];

for (const course of courses) {
  const { ok, errors, warnings } = validateCourse(course);
  results.push({ course, ok, errors, warnings });
  console.log(`\n${ok ? "✓" : "✗"} ${course.id} — ${course.title}`);
  for (const e of errors.slice(0, MAX_SHOWN)) console.log(`   ERROR  ${e}`);
  if (errors.length > MAX_SHOWN)
    console.log(`   … ${errors.length - MAX_SHOWN} more error(s) — run \`npm run validate -- ${course.id}\` for the full list`);
  for (const w of warnings.slice(0, MAX_SHOWN)) console.log(`   warn   ${w}`);
  if (warnings.length > MAX_SHOWN) console.log(`   … ${warnings.length - MAX_SHOWN} more warning(s)`);
}

const failed = results.filter((r) => !r.ok);
console.log("\n— summary —");
for (const r of results)
  console.log(`${r.ok ? "✓" : "✗"} ${r.course.id.padEnd(22)} ${String(r.errors.length).padStart(4)} errors ${String(r.warnings.length).padStart(4)} warnings`);

console.log("");
if (failed.length) {
  console.error(`${failed.length} course(s) failed validation.`);
  process.exit(1);
}
console.log(`All ${courses.length} course(s) valid.`);
