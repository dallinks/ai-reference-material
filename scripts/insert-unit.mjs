// Insert a fully-authored unit object into a course file's `units: [ ... ]`
// array (before its closing ]), for building a NEW course unit by unit.
//   node scripts/insert-unit.mjs <unitModule.mjs> <courseFile.js>
// The module must `export const unit = { id, title, ..., lessons, masteryCheck }`.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const [, , modulePath, courseFile] = process.argv;
if (!modulePath || !courseFile) {
  console.error("usage: insert-unit.mjs <unitModule.mjs> <courseFile.js>");
  process.exit(1);
}

const mod = await import(pathToFileURL(modulePath).href);
const unit = mod.unit;
if (!unit || !unit.id || !Array.isArray(unit.lessons)) throw new Error("module must export a unit with id + lessons[]");

let src = fs.readFileSync(courseFile, "utf8");

// Brace-match the units: [ ... ] array to find its closing ].
const key = src.indexOf("units:");
if (key === -1) throw new Error("no `units:` in course file");
const open = src.indexOf("[", key);
let depth = 0, i = open, str = null, close = -1;
for (; i < src.length; i++) {
  const c = src[i];
  if (str) { if (c === "\\") { i++; continue; } if (c === str) str = null; continue; }
  if (c === '"' || c === "'" || c === "`") { str = c; continue; }
  if (c === "[") depth++;
  else if (c === "]") { depth--; if (depth === 0) { close = i; break; } }
}
if (close === -1) throw new Error("unbalanced units array");

// Serialize the unit as pretty JSON (valid JS), indented 4 spaces as an array element.
const serialized = JSON.stringify(unit, null, 2)
  .split("\n")
  .map((line, idx) => (idx === 0 ? line : "    " + line))
  .join("\n");

const before = src.slice(0, close).replace(/\s*$/, ""); // ends with prior unit's "},"
const after = src.slice(close); // starts with "]"
src = before + "\n    " + serialized + ",\n  " + after;
fs.writeFileSync(courseFile, src);

const blocks = unit.lessons.reduce((s, l) => s + (l.content ? l.content.length : 0), 0);
console.log(`inserted ${unit.id}: ${unit.lessons.length} lessons, ${blocks} blocks, gate ${unit.masteryCheck?.questions?.length ?? 0}q`);
