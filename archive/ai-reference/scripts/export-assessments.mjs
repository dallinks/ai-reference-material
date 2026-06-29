// Export per-module quizzes + exercises to platform-ready Markdown.
// Usage: node scripts/export-assessments.mjs
//
// Produces:
//   export/assessments/NN-module-slug.md  — learner quiz + exercise, then an
//                                            instructor answer key
//   export/assessments/ASSESSMENTS.md      — all modules combined

import { COURSE } from "../src/data/index.js";
import { ASSESSMENTS } from "../src/data/assessments.js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "export", "assessments");
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const slug = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function moduleToMd(mod, a) {
  const L = [];
  L.push(`# Module ${mod.number}: ${mod.title} — Assessment`, "");

  // Learner-facing quiz
  L.push("## Knowledge Check", "");
  a.quiz.forEach((item, i) => {
    L.push(`**${i + 1}. ${item.q}**`, "");
    item.options.forEach((opt, j) => L.push(`- ${LETTERS[j]}. ${opt}`));
    L.push("");
  });

  // Learner-facing exercise
  const ex = a.exercise;
  L.push(`## Hands-On Exercise: ${ex.title}`, "");
  L.push(`**Scenario.** ${ex.scenario}`, "");
  L.push(`**Your task.** ${ex.task}`, "");
  L.push("**Success criteria:**", "");
  ex.criteria.forEach((c) => L.push(`- ${c}`));
  L.push("");

  // Instructor section
  L.push("---", "", "## Answer Key — instructor only", "");
  a.quiz.forEach((item, i) => {
    L.push(`**${i + 1}.** ${LETTERS[item.answer]} — ${item.why}`, "");
  });
  L.push(`**Exercise solution outline.** ${ex.solution}`, "");

  return L.join("\n") + "\n";
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const combined = [`# ${COURSE.title} — Assessments`, ""];
  const writes = [];
  let modCount = 0;
  let qCount = 0;

  for (const mod of COURSE.modules) {
    const a = ASSESSMENTS[mod.id];
    if (!a) continue;
    const md = moduleToMd(mod, a);
    writes.push(writeFile(join(OUT, `${mod.number}-${slug(mod.title)}.md`), md));
    combined.push("", "---", "", md);
    modCount++;
    qCount += a.quiz.length;
  }

  await Promise.all(writes);
  await writeFile(join(OUT, "ASSESSMENTS.md"), combined.join("\n") + "\n");

  console.log(`Exported assessments for ${modCount} modules (${qCount} questions + ${modCount} exercises)`);
  console.log(`Output: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
