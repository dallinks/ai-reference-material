# Crucible

A personal platform for **rigorous, self-paced courses** — university-level
structure without the price tag. Built around two accountability mechanisms:

- **Mastery gating** — a unit unlocks only when you pass its mastery check. You
  cannot click past material you haven't demonstrated.
- **Spaced repetition** — every lesson seeds review cards that resurface on a
  forgetting curve, so knowledge sticks instead of evaporating after the quiz.

Courses are **AI-generated and source-grounded** (see [AUTHORING.md](AUTHORING.md)).
The runtime is deterministic and local-first — progress lives in `localStorage`,
no backend, no accounts. The one exception is the **proof grader**: `proof`
questions are graded by Claude against a rubric, so graduate-level gates test
real proof construction, not multiple choice. That's the only runtime AI call,
and it needs your own Anthropic key (below).

## Graded proofs (optional, opt-in)

For courses with `proof` questions, set your Anthropic API key via the ⚙ Settings
panel (or a local `.env` with `VITE_ANTHROPIC_API_KEY`). The key is stored only
in your browser and sent only to `api.anthropic.com` when a proof is graded.
Default grader model is `claude-opus-4-8`. Courses with no `proof` questions need
no key and stay fully offline.

## Run it

```bash
cd crucible
npm install
npm run dev        # http://localhost:3001
```

```bash
npm test           # pure-engine tests (srs / gating / grading)
npm run validate   # check every course against the schema
npm run build      # production build
```

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
| `store.js`   | local-first persistence (one swappable seam) |

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
- **IndexedDB / sync** — swap `store.js` only.
- **FSRS** scheduler — swap `srs.js` only.
- **Local proxy for the key** — so the API key never lives in the browser.
