// Export the course to styled, paste-ready HTML for hosted-LMS editors
// (Teachable / Thinkific / Podia / Kajabi), plus a CSV import map.
// Usage: node scripts/export-html.mjs
//
// Produces:
//   export/html/NN-module/NN-lesson.html  — open in a browser, select-all, paste
//                                            into the LMS lesson editor
//   export/import-map.csv                  — section/lesson plan + free-preview flags

import { COURSE } from "../src/data/index.js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "export", "html");

const slug = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Escape first (so user '<' survives), then promote **bold** and *italic*.
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

// A text body: blank-line-separated paragraphs; single \n becomes <br>.
const para = (body) =>
  body
    .split(/\n\n+/)
    .map((p) => `<p>${inline(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");

function blockToHtml(b) {
  if (b.type === "code") {
    const head = b.heading ? `<p class="codehead">${esc(b.heading)}</p>\n` : "";
    return `${head}<pre><code class="language-${esc(b.lang || "")}">${esc(b.code)}</code></pre>`;
  }
  if (b.type === "checklist") {
    const items = b.items.map((i) => `<li>${inline(i)}</li>`).join("\n");
    return `<h3>${esc(b.heading)}</h3>\n<ul>\n${items}\n</ul>`;
  }
  if (b.type === "decision") {
    const rows = b.rows
      .map((r) => `<tr><td>${inline(r[0])}</td><td>${inline(r[1])}</td></tr>`)
      .join("\n");
    return (
      `<h3>${esc(b.heading)}</h3>\n<table>\n` +
      `<thead><tr><th>Situation</th><th>Recommendation</th></tr></thead>\n` +
      `<tbody>\n${rows}\n</tbody>\n</table>`
    );
  }
  if (b.type === "diagram") {
    const vertical = b.variant === "stack";
    const arrow = vertical ? "↓" : "→";
    const box = (n) => {
      const { label, detail } = typeof n === "string" ? { label: n, detail: "" } : n;
      return `<div class="dnode"><span class="dlabel">${esc(label)}</span>${
        detail ? `<span class="ddetail">${esc(detail)}</span>` : ""
      }</div>`;
    };
    const parts = (b.nodes || [])
      .map(box)
      .join(`<span class="darrow">${arrow}</span>`);
    const head = b.heading ? `<h3>${esc(b.heading)}</h3>\n` : "";
    const loop =
      b.variant === "cycle"
        ? `\n<p class="dloop">↻ repeats until the goal is met or a limit is hit</p>`
        : "";
    const cap = b.caption ? `\n<p class="dcap">${inline(b.caption)}</p>` : "";
    return `${head}<div class="diagram ${vertical ? "dvert" : "dflow"}">${parts}</div>${loop}${cap}`;
  }
  return `<h2>${esc(b.heading)}</h2>\n${para(b.body)}`; // text
}

const STYLE = `body{font:16px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}
h1{font-size:1.9rem;line-height:1.2}h2{font-size:1.3rem;margin-top:2rem;border-left:3px solid #FF6B35;padding-left:.6rem}
h3{font-size:1.05rem;margin-top:1.5rem}.meta{color:#666;font-style:italic}
pre{background:#0f1117;color:#e6e6e6;padding:1rem;border-radius:8px;overflow-x:auto;font-size:.85rem}
.codehead{font-weight:600;color:#7B61FF;margin-bottom:.25rem;font-size:.85rem}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:.5rem .7rem;text-align:left;vertical-align:top}
th{background:#faf7f2}ul{padding-left:1.2rem}.free{display:inline-block;background:#00D4AA;color:#062b24;font-weight:700;font-size:.7rem;padding:2px 8px;border-radius:4px;letter-spacing:.5px}
.diagram{display:flex;gap:.4rem;align-items:stretch;justify-content:center;flex-wrap:wrap;border:1px solid #ddd;border-radius:8px;padding:1rem;background:#faf9f7;margin:.5rem 0}
.diagram.dvert{flex-direction:column;align-items:center}
.dnode{flex:1 1 0;min-width:90px;background:#fff;border:1px solid #FF6B3555;border-radius:6px;padding:.5rem .6rem;text-align:center;display:flex;flex-direction:column;gap:.2rem}
.dlabel{font-weight:600;font-size:.8rem}.ddetail{color:#666;font-size:.72rem}
.darrow{align-self:center;color:#FF6B35;font-weight:700}
.dloop{text-align:center;color:#FF6B35;font-size:.8rem;margin:.3rem 0 0}.dcap{color:#666;font-style:italic;font-size:.85rem;margin:.3rem 0 0}`;

function lessonToHtml(lesson, mod) {
  const tags = lesson.tags?.length ? ` · ${lesson.tags.join(", ")}` : "";
  const badge = lesson.preview ? ` <span class="free">FREE PREVIEW</span>` : "";
  const body = lesson.content.map(blockToHtml).join("\n\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(lesson.title)}</title>
<style>${STYLE}</style></head>
<body>
<h1>${esc(lesson.title)}${badge}</h1>
<p class="meta">Module ${esc(mod.number)} — ${esc(mod.title)} · ${esc(lesson.duration)}${esc(tags)}</p>
${body}
</body></html>
`;
}

const csvField = (s) => `"${String(s).replace(/"/g, '""')}"`;

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const csv = [
    ["Section #", "Section (Module)", "Lesson #", "Lesson", "Duration", "Free Preview", "HTML File"]
      .map(csvField)
      .join(","),
  ];
  const writes = [];
  let lessonCount = 0;

  for (const mod of COURSE.modules) {
    const modDir = `${mod.number}-${slug(mod.title)}`;
    await mkdir(join(OUT, modDir), { recursive: true });

    mod.lessons.forEach((lesson, i) => {
      const n = String(i + 1).padStart(2, "0");
      const file = `${n}-${slug(lesson.title)}.html`;
      const rel = `html/${modDir}/${file}`;

      writes.push(writeFile(join(OUT, modDir, file), lessonToHtml(lesson, mod)));
      csv.push(
        [mod.number, mod.title, i + 1, lesson.title, lesson.duration, lesson.preview ? "YES" : "", rel]
          .map(csvField)
          .join(",")
      );
      lessonCount++;
    });
  }

  await Promise.all(writes);
  await writeFile(join(ROOT, "export", "import-map.csv"), csv.join("\n") + "\n");

  const previewCount = COURSE.modules.flatMap((m) => m.lessons).filter((l) => l.preview).length;
  console.log(`Exported ${lessonCount} HTML lessons (${previewCount} free-preview)`);
  console.log(`Import map: export/import-map.csv`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
