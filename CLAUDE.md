# Crucible

Local-first rigorous self-learning platform. React + Vite; courses are JS data
modules in `src/data/courses/`, registered in `src/data/index.js`; the engine
(`src/lib/`) is pure and tested (`npm test`).

## Authoring or editing courses — the iron rules

1. **Read `AUTHORING.md` first.** It is the generation contract: schema, block
   types, depth floors, and the per-unit generation prompt.
2. **Depth floors are machine-enforced** (`DEPTH` in `src/lib/schema.js`).
   Every lesson is a full textbook section: ≥ 1,200 words (target 1,600–2,500),
   ≥ 8 blocks, ≥ 1 theorem/definition, ≥ 2 worked examples, an exercises set
   with ≥ 3 solved problems, 3–6 review cards, and an `estMinutes` backed by
   ≥ 90 study-wpm of content. Gates: ≥ 4 questions, ≤ half MCQ, explanations
   everywhere, threshold ≥ 0.8.
3. **Generate one unit per pass — never a whole course in one shot.** One-shot
   courses come out at a third of textbook depth. Outline first, then one unit
   at a time, running `npm run validate -- <course-id>` between passes.
4. **A course ships only at zero validation errors.** Do not weaken `DEPTH`
   constants, lower `estMinutes`, or trim `masteryThreshold` to make a failing
   course pass — deepen the content instead. Changing the floors themselves is
   a product decision for the user, not a fix.
5. Content must be **rigorous and source-grounded**: list real `sources`, keep
   notation faithful to them, prove the results you rely on (`theorem` blocks
   with inline proofs), and prefer canonical worked problems over invented ones.

## Commands

- `npm run validate` — all courses, shape + depth (summary at the end)
- `npm run validate -- <id>` — one course, full error worklist
- `npm run review -- <id>` — AI depth review of one course (needs Anthropic
  credentials, costs tokens; run once per new/deepened course)
- `npm test` — engine tests (node --test)
- `npm run dev` — Vite dev server

## Known state

Several pre-floor courses currently fail depth validation and are being
deepened course-by-course. Deepening an existing course follows the same
one-unit-per-pass process as generation.
