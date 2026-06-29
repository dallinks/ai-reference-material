// Validate every registered course against the schema. Run before trusting any
// generated course: `npm run validate`. Exits non-zero on any error so it can
// gate a build or a commit hook.

import { COURSES } from "../src/data/index.js";
import { validateCourse } from "../src/lib/schema.js";

let failed = 0;

for (const course of COURSES) {
  const { ok, errors, warnings } = validateCourse(course);
  console.log(`\n${ok ? "✓" : "✗"} ${course.id} — ${course.title}`);
  for (const e of errors) console.log(`   ERROR  ${e}`);
  for (const w of warnings) console.log(`   warn   ${w}`);
  if (!ok) failed++;
}

console.log("");
if (failed) {
  console.error(`${failed} course(s) failed validation.`);
  process.exit(1);
}
console.log(`All ${COURSES.length} course(s) valid.`);
