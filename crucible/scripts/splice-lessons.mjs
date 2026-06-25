// Splice an authored lessons module into a course file, in place, by
// brace-matching the unit's `lessons:` array. Lets you author deep lessons in
// nice JS (template literals) and drop them in without matching old strings.
//
//   node scripts/splice-lessons.mjs <authoredModule.mjs> <courseFile.js>
//
// The authored module must `export const unitId = "..."` and
// `export const lessons = [ ... ]`.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const [, , modulePath, courseFile] = process.argv;
if (!modulePath || !courseFile) {
  console.error("usage: splice-lessons.mjs <authoredModule.mjs> <courseFile.js>");
  process.exit(1);
}

const mod = await import(pathToFileURL(modulePath).href);
const { unitId, lessons } = mod;
if (!unitId || !Array.isArray(lessons) || !lessons.length) throw new Error("module must export unitId and a non-empty lessons[]");

let src = fs.readFileSync(courseFile, "utf8");

function findLessonsSpan(text, id) {
  const anchor = text.indexOf(`id: "${id}",`);
  if (anchor === -1) throw new Error(`unit anchor not found: ${id}`);
  const key = text.indexOf("lessons:", anchor);
  const open = text.indexOf("[", key);
  let depth = 0, i = open, str = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (str) { if (c === "\\") { i++; continue; } if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { i++; break; } }
  }
  if (depth !== 0) throw new Error(`unbalanced brackets for ${id}`);
  return { start: open, end: i };
}

const { start, end } = findLessonsSpan(src, unitId);
const serialized = JSON.stringify(lessons, null, 2)
  .split("\n")
  .map((line, idx) => (idx === 0 ? line : "      " + line))
  .join("\n");
src = src.slice(0, start) + serialized + src.slice(end);
fs.writeFileSync(courseFile, src);

const blocks = lessons.reduce((s, l) => s + (l.content ? l.content.length : 0), 0);
console.log(`${unitId}: spliced ${lessons.length} lessons, ${blocks} blocks into ${courseFile}`);
