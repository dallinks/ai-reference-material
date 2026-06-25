// Dump compact specs for a course's units: title, summary, current lesson
// titles+headings (the scope to deepen), and the mastery-gate questions the new
// lessons must prepare a student to pass. Prints JSON to stdout.
//   node scripts/extract-units.mjs <courseId> [unitId ...]   (no unitIds = all)
import { getCourse } from "../src/data/index.js";

const [courseId, ...unitIds] = process.argv.slice(2);
const course = getCourse(courseId);
if (!course) {
  console.error(`no course with id "${courseId}"`);
  process.exit(1);
}
const want = new Set(unitIds);

const out = course.units
  .filter((u) => !want.size || want.has(u.id))
  .map((u) => ({
    unitId: u.id,
    title: u.title,
    summary: u.summary,
    lessons: u.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      headings: l.content.map((b) => b.heading || b.name || b.kind || b.type),
    })),
    gate: (u.masteryCheck?.questions || []).map((q) => ({
      id: q.id,
      type: q.type,
      points: q.points || 1,
      prompt: q.prompt,
    })),
  }));

console.log(JSON.stringify(out));
