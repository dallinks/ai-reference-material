// Generate accurate, data-derived course metadata for platform listing forms.
// Usage: node scripts/export-metadata.mjs
//
// Produces:
//   export/course-metadata.json  — machine-readable (counts, curriculum, per-lesson)
//   export/course-metadata.md    — human-readable stats + curriculum + listing fields

import { COURSE, totalLessons, allTags } from "../src/data/index.js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "export");

const mins = (d) => parseInt(d, 10) || 0;

function build() {
  let totalMinutes = 0, code = 0, checklists = 0, decisions = 0, diagrams = 0, preview = 0;
  const modules = COURSE.modules.map((m) => {
    let modMin = 0;
    const lessons = m.lessons.map((l) => {
      modMin += mins(l.duration);
      if (l.preview) preview++;
      for (const c of l.content) {
        if (c.type === "code") code++;
        else if (c.type === "checklist") checklists++;
        else if (c.type === "decision") decisions++;
        else if (c.type === "diagram") diagrams++;
      }
      return { title: l.title, duration: l.duration, preview: !!l.preview, tags: l.tags || [] };
    });
    totalMinutes += modMin;
    return { number: m.number, title: m.title, desc: m.desc, lessonCount: m.lessons.length, minutes: modMin, lessons };
  });

  return {
    title: COURSE.title,
    subtitle: COURSE.subtitle,
    stats: {
      modules: COURSE.modules.length,
      lessons: totalLessons,
      totalMinutes,
      totalHours: +(totalMinutes / 60).toFixed(1),
      codeSamples: code,
      checklists,
      decisionTables: decisions,
      diagrams,
      freePreviewLessons: preview,
      tags: allTags.length,
    },
    modules,
  };
}

function toMd(meta) {
  const s = meta.stats;
  const L = [];
  L.push(`# ${meta.title} — Course Metadata`, "", `*${meta.subtitle}*`, "");
  L.push("> Data-derived facts for platform listing forms. Marketing copy lives in", "> `marketing/`. Regenerate with `node scripts/export-metadata.mjs`.", "");
  L.push("## At a glance", "");
  L.push(`- **Modules:** ${s.modules}`);
  L.push(`- **Lessons:** ${s.lessons}`);
  L.push(`- **Estimated time:** ~${s.totalHours} hours (${s.totalMinutes} min)`);
  L.push(`- **Code samples:** ${s.codeSamples}`);
  L.push(`- **Checklists:** ${s.checklists}`);
  L.push(`- **Decision tables:** ${s.decisionTables}`);
  L.push(`- **Diagrams:** ${s.diagrams}`);
  L.push(`- **Free-preview lessons:** ${s.freePreviewLessons}`);
  L.push(`- **Topic tags:** ${s.tags}`, "");
  L.push("## Curriculum", "");
  L.push("| # | Module | Lessons | Time |", "| --- | --- | --- | --- |");
  for (const m of meta.modules) L.push(`| ${m.number} | ${m.title} | ${m.lessonCount} | ${m.minutes} min |`);
  L.push("");
  L.push("## Lessons by module", "");
  for (const m of meta.modules) {
    L.push(`### ${m.number} · ${m.title}`, "", `${m.desc}`, "");
    m.lessons.forEach((l, i) =>
      L.push(`${i + 1}. ${l.title} — *${l.duration}*${l.preview ? "  **[FREE PREVIEW]**" : ""}`)
    );
    L.push("");
  }
  L.push("## Listing fields", "");
  L.push("Title, descriptions, audience, prerequisites, level, tags, and learning");
  L.push("outcomes are ready to paste from **`marketing/short-descriptions.md`**.");
  return L.join("\n") + "\n";
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const meta = build();
  await writeFile(join(OUT, "course-metadata.json"), JSON.stringify(meta, null, 2) + "\n");
  await writeFile(join(OUT, "course-metadata.md"), toMd(meta));
  console.log(
    `Metadata: ${meta.stats.modules} modules, ${meta.stats.lessons} lessons, ~${meta.stats.totalHours}h`
  );
  console.log(`Output: ${join(OUT, "course-metadata.{json,md}")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
