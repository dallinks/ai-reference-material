# Crucible

A personal platform for **rigorous, self-paced courses** — university-level
structure without the price tag. Built around two accountability mechanisms:

- **Mastery gating** — a unit unlocks only when you pass its mastery check. You
  cannot click past material you haven't demonstrated.
- **Spaced repetition** — every lesson seeds review cards that resurface on a
  forgetting curve, so knowledge sticks instead of evaporating after the quiz.

Courses are **AI-generated and source-grounded** (see [AUTHORING.md](AUTHORING.md)).
The runtime is deterministic and local-first — progress lives in a **local
SQLite db** served by a tiny Vite-plugin API, mirrored to a **git-committed
JSON snapshot** so it syncs across machines (below); no accounts, no cloud.
The one exception is the **proof grader**: `proof` questions are graded by
Claude against a rubric, so graduate-level gates test real proof construction,
not multiple choice. That's the only runtime AI call, and it needs your own
Anthropic key (below).

## Graded proofs (optional, opt-in)

For courses with `proof` questions, set your Anthropic API key via the ⚙ Settings
panel (or a local `.env` with `VITE_ANTHROPIC_API_KEY`). The key is stored only
in your browser and sent only to `api.anthropic.com` when a proof is graded.
Default grader model is `claude-opus-4-8`. Courses with no `proof` questions need
no key and stay fully offline.

## Run it

```bash
npm install
npm run dev        # http://localhost:3001
```

```bash
npm test           # pure-engine tests (srs / gating / grading / streak / merge / db)
npm run validate   # check every course against the schema
npm run build      # production build
```

## Progress storage & syncing across machines

The dev server doubles as the store server (`server/store-plugin.js`):

- **`data/crucible.db`** — machine-local SQLite (gitignored), the source of
  truth this machine reads and writes.
- **`data/progress.json`** — a deterministic snapshot regenerated after every
  change. **Commit this file** — it's how progress travels via git.

On every boot the server **merges** the snapshot into the DB (union of
lessons, best mastery, newest review card, per-day max activity — see
`src/lib/merge.js`). The merge is idempotent and symmetric, so the flow is
just:

```bash
git pull        # bring the other machine's snapshot
npm run dev     # boot merges it into the local db
# ...study...
git add data/progress.json && git commit -m "progress" && git push
```

If both machines studied without syncing, nothing is lost — the next
pull+boot unions the histories. If git ever conflicts on `progress.json`,
resolve it **either way**; each machine's own work is still in its local DB
and re-merges on the next boot. Caveats: your API key and settings are
machine-local (never synced, never committed); "reset course" is
per-machine — another machine's synced copy can resurrect progress unless you
reset there too. Without the server (a static deploy of `dist/`), the app
quietly falls back to browser `localStorage`.

## The loop

```
Dashboard ──▶ Course (unit map: 🔒 locked · open · ✓ mastered)
                 │
                 ├─▶ Lesson ──▶ "mark complete" seeds review cards
                 │
                 └─▶ Mastery Check (the gate) ──pass──▶ next unit unlocks
Dashboard ──▶ Review (everything due today, across all courses)
```

## Architecture

Pure engine (no React, fully testable) under `src/lib/`:

| file         | responsibility |
|--------------|----------------|
| `schema.js`  | the course contract + `validateCourse()` |
| `srs.js`     | SM-2 spaced repetition (day-granularity, clock-injected) |
| `gating.js`  | unit lock/unlock from mastery records |
| `grading.js` | strict scoring for mcq / multi / numeric / short |
| `streak.js`  | study streak, daily goal, heatmap math (clock-injected) |
| `merge.js`   | cross-machine progress merge (symmetric, idempotent) |
| `store.js`   | the storage seam: SQLite server tier + localStorage fallback |

UI under `src/views/` + `src/components/`; cross-course review queue in
`src/state/review.js`; the per-course React binding in `src/state/useProgress.js`.

## Add a course

1. Generate it per [AUTHORING.md](AUTHORING.md) → `src/data/courses/<id>.js`.
2. Register: import it and add to `COURSES` in `src/data/index.js`.
3. `npm run validate`, then `npm run dev`.

## Roadmap (designed-for, not yet built)

- ~~**AI-graded free response**~~ — **built**: the `proof` question type +
  `lib/grader.js`. The gate/SRS engine didn't change — scoring just generalized
  to partial credit.
- **Timed exams + a cross-course transcript.**
- ~~**Sync**~~ — **built**: local SQLite + git-synced snapshot (above).
- **FSRS** scheduler — swap `srs.js` only.
- **Local proxy for the key** — so the API key never lives in the browser.
