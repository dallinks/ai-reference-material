// Export the course data to platform-ingestible Markdown.
// Usage: node scripts/export-markdown.mjs
//
// Produces export/markdown/:
//   index.md                       — curriculum outline (linked)
//   COURSE.md                      — entire course in one document (PDF/EPUB source)
//   NN-module-slug/NN-lesson.md    — one file per lesson
//   README.md                      — how to load this into a course platform

import { COURSE, totalLessons } from "../src/data/index.js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "export", "markdown");

const slug = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// The React renderer uses whiteSpace:pre-line, so single \n is a visible line
// break. Promote newlines to paragraph breaks so Markdown preserves intent.
const bodyToMd = (body) =>
  body.replace(/\n/g, "\n\n").replace(/\n{3,}/g, "\n\n").trim();

// Cell text can't contain raw pipes or newlines in a Markdown table.
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ").trim();

// Pick a fence longer than any backtick run inside the code.
const fenceFor = (code) => {
  const longest = (code.match(/`+/g) || []).reduce((m, s) => Math.max(m, s.length), 0);
  return "`".repeat(Math.max(3, longest + 1));
};

function blockToMd(b) {
  if (b.type === "code") {
    const f = fenceFor(b.code);
    const head = b.heading ? `**${b.heading}**\n\n` : "";
    return `${head}${f}${b.lang || ""}\n${b.code}\n${f}`;
  }
  if (b.type === "checklist") {
    return `### ${b.heading}\n\n${b.items.map((i) => `- ${i}`).join("\n")}`;
  }
  if (b.type === "decision") {
    const rows = b.rows.map((r) => `| ${cell(r[0])} | ${cell(r[1])} |`).join("\n");
    return `### ${b.heading}\n\n| Situation | Recommendation |\n| --- | --- |\n${rows}`;
  }
  if (b.type === "diagram") {
    const label = (n) => (typeof n === "string" ? n : n.detail ? `${n.label} (${n.detail})` : n.label);
    const sep = b.variant === "stack" ? "\n  ↓\n" : " → ";
    let art = (b.nodes || []).map(label).join(sep);
    if (b.variant === "cycle") art += "\n  ↻ repeats until the goal is met or a limit is hit";
    const head = b.heading ? `### ${b.heading}\n\n` : "";
    const cap = b.caption ? `\n\n*${b.caption}*` : "";
    return `${head}\`\`\`\n${art}\n\`\`\`${cap}`;
  }
  return `## ${b.heading}\n\n${bodyToMd(b.body)}`; // text
}

function lessonToMd(lesson, mod) {
  const tags = lesson.tags?.length ? ` · ${lesson.tags.join(", ")}` : "";
  const meta = `*Module ${mod.number} — ${mod.title} · ${lesson.duration}${tags}*`;
  const body = lesson.content.map(blockToMd).join("\n\n");
  return `# ${lesson.title}\n\n${meta}\n\n${body}\n`;
}

const README = `# ${COURSE.title} — Markdown Export

${COURSE.modules.length} modules · ${totalLessons} lessons. Generated from the course
data by \`scripts/export-markdown.mjs\` — re-run that script after editing any lesson.

## What's here
- **index.md** — the full curriculum outline, linked to each lesson file.
- **COURSE.md** — the entire course as one document (best source for PDF/EPUB).
- **NN-module-slug/** — one folder per module, one \`.md\` file per lesson.

## Path A — Hosted LMS (Teachable, Thinkific, Podia, Kajabi)
1. Recreate the structure: each module becomes a Section, each lesson a Lesson.
2. Paste each lesson \`.md\` into the lesson editor. Most editors accept Markdown
   or convert pasted rich text; verify code blocks and tables render, and re-upload
   any images if you add them later.
3. Author quizzes, certificates, and drip schedules in the platform's own tools
   (Markdown can't carry those — they're platform features).
4. Mark the first 2–3 lessons as free preview.

## Path B — Digital download (Gumroad, Lemon Squeezy, Payhip)
Convert the combined document to a sellable file with pandoc:
\`\`\`bash
pandoc COURSE.md -o course.epub                      # no extra tooling needed
pandoc COURSE.md -o course.pdf --toc                 # PDF needs a LaTeX engine
\`\`\`
Then upload the file as the product.

## Note
Markdown carries the text, code, checklists, and decision tables. It does NOT carry
interactivity, progress tracking, quizzes, or certificates — those come from the
platform (Path A) or are out of scope for a static download (Path B).
`;

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const indexLines = [`# ${COURSE.title}`, "", `*${COURSE.subtitle}*`, ""];
  const combined = [`# ${COURSE.title}`, "", `*${COURSE.subtitle}*`, ""];
  const writes = [];
  let lessonCount = 0;
  let blockCount = 0;

  for (const mod of COURSE.modules) {
    const modDir = `${mod.number}-${slug(mod.title)}`;
    await mkdir(join(OUT, modDir), { recursive: true });

    indexLines.push(`## ${mod.number} · ${mod.title}`, "", `${mod.desc}`, "");
    combined.push("", "---", "", `# Module ${mod.number}: ${mod.title}`, "", `*${mod.desc}*`, "");

    mod.lessons.forEach((lesson, i) => {
      const n = String(i + 1).padStart(2, "0");
      const file = `${n}-${slug(lesson.title)}.md`;
      const md = lessonToMd(lesson, mod);

      writes.push(writeFile(join(OUT, modDir, file), md));
      indexLines.push(`- [${lesson.title}](./${modDir}/${file}) — *${lesson.duration}*`);
      combined.push("", md);

      lessonCount++;
      blockCount += lesson.content.length;
    });
    indexLines.push("");
  }

  await Promise.all(writes);

  await writeFile(join(OUT, "index.md"), indexLines.join("\n") + "\n");
  await writeFile(join(OUT, "COURSE.md"), combined.join("\n") + "\n");
  await writeFile(join(OUT, "README.md"), README);

  console.log(`Exported ${lessonCount} lessons / ${blockCount} blocks`);
  console.log(`Output: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
