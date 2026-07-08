// AI depth review — the second gate after `npm run validate`. The validator
// enforces structural floors (word counts, block counts); this script catches
// what counts can't: padded prose, examples that are described rather than
// worked, exercises a novice couldn't do from the text alone.
//
//   npm run review -- <course-id> [threshold]     (threshold default 0.75)
//
// Needs Anthropic credentials (ANTHROPIC_API_KEY or an `ant auth login`
// profile). Costs API tokens — run once per new/deepened course, not on every
// validate. Exits non-zero if any lesson scores below the threshold.

import Anthropic from "@anthropic-ai/sdk";
import { COURSES } from "../src/data/index.js";

const [courseId, thresholdArg] = process.argv.slice(2);
const THRESHOLD = Number(thresholdArg) || 0.75;
const CONCURRENCY = 4;

const course = COURSES.find((c) => c.id === courseId);
if (!course) {
  console.error(`Usage: npm run review -- <course-id> [threshold]\nKnown: ${COURSES.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const SYSTEM = `You are a demanding textbook editor reviewing a lesson for a rigorous self-study platform. The bar is a section of a good university textbook: it develops ideas, proves what it asserts, works its examples step by step, and leaves the reader able to solve new problems.

Grade the lesson against each criterion strictly. Padding, bullet-point enumeration dressed as exposition, hand-waving ("it can be shown that..."), examples that state a result without showing the work, and exercises that only test recall of the text all FAIL their criteria. Judge from the lesson text alone — assume the reader has only the prerequisites and this text.`;

const CRITERIA = [
  "DEVELOPS rather than enumerates: ideas are motivated, built up, and connected in flowing exposition — not a list of assertions or definitions strung together",
  "PROVES what it asserts: every non-trivial claim the lesson relies on is derived, proved, or explicitly cited to a source — nothing load-bearing is just asserted",
  "Examples are WORKED: each example shows the actual steps a reader would take, with intermediate values/reasoning visible, not a summary of the outcome",
  "Exercises demand TRANSFER and are solvable from this text alone: a diligent novice who mastered this lesson (and its prerequisites) could do them, and they require applying the ideas to new cases, not restating the text",
  "Self-contained and honest: terminology is defined before use, notation is consistent, and the content plausibly fills the claimed estMinutes of real study time",
];

const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          criterion: { type: "string" },
          met: { type: "boolean" },
          comment: { type: "string" },
        },
        required: ["criterion", "met", "comment"],
      },
    },
    score: { type: "number", description: "Fraction of criteria weight earned, in [0,1]" },
    biggestGap: { type: "string", description: "The single most important thing to fix, concretely" },
  },
  required: ["criteria", "score", "biggestGap"],
};

function lessonPrompt(unit, lesson) {
  const rubric = CRITERIA.map((c, i) => `${i + 1}. ${c}`).join("\n");
  return [
    `COURSE: ${course.title} (${course.difficulty || "unspecified level"})`,
    `UNIT: ${unit.title}`,
    `LESSON: ${lesson.title} — claims ${lesson.estMinutes} minutes of study`,
    `RUBRIC:\n${rubric}`,
    `LESSON CONTENT (structured blocks, JSON):\n${JSON.stringify(lesson.content, null, 1)}`,
    `REVIEW CARDS:\n${JSON.stringify(lesson.reviewItems || [], null, 1)}`,
  ].join("\n\n");
}

const client = new Anthropic();

async function reviewLesson(unit, lesson) {
  const msg = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: { type: "json_schema", schema: VERDICT_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content: lessonPrompt(unit, lesson) }],
  });
  if (msg.stop_reason === "refusal") throw new Error("reviewer declined this lesson");
  const text = (msg.content || []).find((b) => b.type === "text")?.text || "";
  return JSON.parse(text);
}

// Simple bounded-concurrency runner over all lessons.
const jobs = course.units.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })));
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < jobs.length) {
    const { unit, lesson } = jobs[cursor++];
    try {
      const verdict = await reviewLesson(unit, lesson);
      results.push({ unit, lesson, verdict });
      const flag = verdict.score >= THRESHOLD ? "✓" : "✗";
      console.log(`${flag} ${lesson.id} "${lesson.title}" — ${verdict.score.toFixed(2)}`);
      if (verdict.score < THRESHOLD) console.log(`   fix: ${verdict.biggestGap}`);
    } catch (e) {
      results.push({ unit, lesson, error: e?.message || String(e) });
      console.log(`! ${lesson.id} — review failed: ${e?.message || e}`);
    }
  }
}

console.log(`Reviewing ${jobs.length} lessons of "${course.id}" at threshold ${THRESHOLD}…\n`);
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));

const failed = results.filter((r) => r.error || r.verdict.score < THRESHOLD);
console.log(`\n${results.length - failed.length}/${jobs.length} lessons pass depth review.`);
for (const f of failed) {
  console.log(`\n✗ ${f.lesson.id} "${f.lesson.title}"${f.error ? ` — ERROR: ${f.error}` : ` — ${f.verdict.score.toFixed(2)}`}`);
  for (const c of f.verdict?.criteria || []) if (!c.met) console.log(`   MISS ${c.criterion.split(":")[0]}: ${c.comment}`);
}
process.exit(failed.length ? 1 : 0);
