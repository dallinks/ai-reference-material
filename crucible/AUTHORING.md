# Authoring a Course (the generation contract)

A course is one JS module exporting a course object that satisfies the schema in
`src/lib/schema.js`. The platform trusts any course that passes `npm run validate`
— so generation can be fast and loose on prose, but **must** be exact on shape.

This file is both the spec and the prompt. To generate a course, hand the
"Generation prompt" below (plus your brief and any source material) to Claude.

---

## The shape

```js
export const <id> = {
  id: "kebab-id",                  // unique, used in URLs + storage
  title: "Human Title",
  subject: "Mathematics",          // for grouping/filtering
  difficulty: "Lower-undergraduate",
  description: "One or two sentences. What it covers and how hard the gates are.",
  sources: ["Stewart, Calculus 8e, ch.2", "MIT 18.01 OCW"],  // provenance — see below
  units: [
    {
      id: "u1",
      title: "Unit title",
      summary: "One line shown on the course map.",
      prerequisites: ["u0"],       // optional; defaults to the previous unit
      masteryThreshold: 0.85,      // optional; defaults to 0.85
      lessons: [
        {
          id: "u1l1",
          title: "Lesson title",
          estMinutes: 12,
          content: [ /* blocks, see below */ ],
          reviewItems: [           // REQUIRED for anything you want to retain
            { id: "u1l1-i1", front: "Question/cue", back: "Answer" },
          ],
        },
      ],
      masteryCheck: {              // REQUIRED — this is the gate
        id: "u1-check",
        questions: [ /* questions, see below */ ],
      },
    },
  ],
};
```

### Content blocks

| type        | fields                                  | use for |
|-------------|-----------------------------------------|---------|
| `text`      | `heading`, `body`                       | core exposition |
| `example`   | `heading`, `body`                       | a worked instance (tinted box) |
| `callout`   | `tone` (`info`\|`warn`\|`danger`), `body` | a warning or key caveat |
| `code`      | `heading`, `lang`, `code`               | code/derivation listings |
| `decision`  | `heading`, `rows: [[left, right], ...]` | "if X → do Y" tables |
| `checklist` | `heading`, `items: [string]`            | procedures/criteria |

`body` supports `**bold**` and `*italic*` and respects line breaks.

### Question types (mastery checks)

| type      | fields                                   | grading |
|-----------|------------------------------------------|---------|
| `mcq`     | `prompt`, `options[]`, `answer` (index)  | exact index |
| `multi`   | `prompt`, `options[]`, `answer` (indices)| set-equality |
| `numeric` | `prompt`, `answer` (number), `tolerance?`| within tolerance |
| `short`   | `prompt`, `accept` (string[])            | normalized string match |
| `proof`   | `prompt`, `rubric` (string[]), `solution`| AI-graded against the rubric (partial credit 0–1) — math/derivations |
| `open`    | `prompt`, `rubric` (string[]), `solution`| AI-graded against the rubric (partial credit 0–1) — judgment/analysis |

Every question takes an optional `explanation`, shown after grading, and an
optional `points` weight (default 1) used in the gate's weighted average.

**`proof` vs `open`** are graded by the same engine (`lib/grader.js`) and differ
only in framing: `proof` for math (badge "proof"), `open` for judgment/case
analysis (badge "analysis"). A **course** may set a top-level `grader` string —
the grader's persona (e.g. "a theoretical computer scientist grading proofs" vs
"a startup operator grading go-to-market analyses") — so the same engine grades
different subjects appropriately.

### Writing `proof` questions (graduate rigor)

A `proof` question is graded by Claude against your `rubric` and `solution`
(see `src/lib/grader.js`), so authoring quality is everything:

- **`rubric`** — 3–5 *independently checkable* criteria, each naming a specific
  step the argument must contain ("applies additivity to disjoint events",
  "handles the base case"). These ARE the grade — vague criteria produce noisy
  scores. Order them as the proof should flow.
- **`solution`** — a correct, rigorous reference proof. The grader uses it as
  ground truth but is instructed to accept any valid alternative argument.
- **`points`** — weight proofs heavier than recall questions (2–3) so the gate
  reflects that they're the hard part.
- Reserve `proof` for things that genuinely require construction (prove
  correctness, derive a bound, show a lower bound). Put computation in
  `numeric`/`short` and recall in `reviewItems`.

---

## Rigor rules (what makes a gate real)

These are non-negotiable if "mastery" is to mean anything:

1. **Prefer `numeric` and `short` over `mcq`.** Multiple choice is guessable; a
   gate built only from `mcq` is theater. Aim for at least half non-MCQ.
2. **Mastery checks test transfer, not recall.** Questions should require *applying*
   the unit to a new case, not restating a definition. (Put the recall in
   `reviewItems` instead.)
3. **Every lesson seeds `reviewItems`** — 3–6 atomic cards, one idea each, cue on
   the front, crisp answer on the back. These are what spaced repetition keeps alive.
4. **One concept per review card.** No "list all five…" cards; split them.
5. **MCQ distractors must be plausible** — each wrong option should reflect a real
   misconception, with the fix in the `explanation`.
6. **Threshold ≥ 0.8.** Lower than that isn't a gate.

## Source-grounding

`sources[]` is the provenance trail. When generating from real material:
- List the actual sources used (textbook + chapter, paper, OCW course).
- Keep definitions and notation faithful to those sources.
- Prefer worked examples adapted from canonical problems over invented ones.

---

## Generation prompt (hand this to Claude)

> Generate a Crucible course on **<TOPIC>** at **<LEVEL>** difficulty, grounded in
> the source material I'm providing (or, if none: standard canonical treatments,
> listed honestly in `sources`).
>
> Output a single JS module exactly matching `crucible/AUTHORING.md`:
> `export const <id> = { ... }`. Follow every rigor rule. Specifically:
> - <N> units, each building on the last, each with 2–4 lessons.
> - Each lesson: 3–5 content blocks + 3–6 atomic review cards.
> - Each unit: a mastery check of 4–6 questions that test *application*, at least
>   half `numeric`/`short`, threshold 0.85, every question with an `explanation`.
> - Faithful notation; worked examples over invented ones.
>
> Before finishing, mentally run it against the schema. Then I'll drop it in
> `src/data/courses/`, register it in `src/data/index.js`, and run `npm run validate`.
