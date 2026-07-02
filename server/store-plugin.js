// Vite plugin that turns the dev server into Crucible's store server — no
// second process, same port, no CORS. It owns two artifacts under data/:
//
//   crucible.db      — SQLite, machine-local source of truth (GITIGNORED)
//   progress.json    — deterministic snapshot, regenerated after every write.
//                      This is the file you COMMIT; it's how progress travels
//                      between machines via git.
//
// Boot order makes sync forgiving: open the DB, merge in whatever snapshot
// git pulled down (idempotent — see lib/merge.js), write the snapshot back.
// If git ever conflicts on progress.json, resolve it EITHER way; the losing
// side's work is still in that machine's DB and re-merges on its next boot.
//
// API (all JSON):
//   GET  /api/state              → { courses, activity }
//   PUT  /api/progress/:courseId → replace that course's progress
//   PUT  /api/activity           → fold in the activity log (per-day max)
//   POST /api/migrate            → merge a legacy blob, returns merged state
//   POST /api/reset/:courseId    → delete that course's progress

import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";
import { openDb } from "./db.js";
import { sortKeysDeep } from "../src/lib/merge.js";

const BODY_LIMIT = 20 * 1024 * 1024; // whole-state payloads are ~100s of KB

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > BODY_LIMIT) reject(new Error("body too large"));
      else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "null"));
      } catch {
        reject(new Error("invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  if (body === undefined) return res.end();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function crucibleStore({ dataDir = "data" } = {}) {
  let db;
  let snapshotPath;

  function boot(rootDir) {
    const dir = join(rootDir, dataDir);
    mkdirSync(dir, { recursive: true });
    db = openDb(join(dir, "crucible.db"));
    snapshotPath = join(dir, "progress.json");
    if (existsSync(snapshotPath)) {
      try {
        db.importState(JSON.parse(readFileSync(snapshotPath, "utf8")));
      } catch (e) {
        console.warn("[crucible-store] could not import snapshot:", e.message);
      }
    }
    writeSnapshot();
    console.log(`[crucible-store] sqlite + snapshot ready in ${dir}`);
  }

  // Atomic-ish: write a temp file, then rename over the real one, so a crash
  // mid-write can't leave a torn snapshot for git to pick up.
  function writeSnapshot() {
    const json = JSON.stringify(sortKeysDeep(db.getState()), null, 2) + "\n";
    const tmp = snapshotPath + ".tmp";
    writeFileSync(tmp, json, "utf8");
    renameSync(tmp, snapshotPath);
  }

  async function handle(req, res, next) {
    const url = (req.url || "").split("?")[0];
    if (!url.startsWith("/api/")) return next();
    try {
      if (req.method === "GET" && url === "/api/state") {
        return send(res, 200, db.getState());
      }
      if (req.method === "PUT" && url.startsWith("/api/progress/")) {
        db.putProgress(decodeURIComponent(url.slice("/api/progress/".length)), await readBody(req));
        writeSnapshot();
        return send(res, 204);
      }
      if (req.method === "PUT" && url === "/api/activity") {
        db.putActivity(await readBody(req));
        writeSnapshot();
        return send(res, 204);
      }
      if (req.method === "POST" && url === "/api/migrate") {
        const merged = db.importState(await readBody(req));
        writeSnapshot();
        return send(res, 200, merged);
      }
      if (req.method === "POST" && url.startsWith("/api/reset/")) {
        db.resetCourse(decodeURIComponent(url.slice("/api/reset/".length)));
        writeSnapshot();
        return send(res, 204);
      }
      return send(res, 404, { error: "unknown api route" });
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }

  return {
    name: "crucible-store",
    configureServer(server) {
      boot(server.config.root);
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      boot(server.config.root);
      server.middlewares.use(handle);
    },
  };
}
