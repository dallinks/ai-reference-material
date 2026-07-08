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
| `diagram`   | `kind` + kind-specific fields (see below) | recursion trees, graphs, sequence diagrams |
| `theorem`   | `kind`, `name`, `statement`, `proof`    | a stated result with an inline proof |
| `exercises` | `heading`, `items: [{prompt, solution, hint?}]` | end-of-section problem set with worked solutions |

`body` supports `**bold**` and `*italic*` and respects line breaks.

### Diagram blocks

`diagram` renders to hand-built SVG (zero dependencies, `components/Diagram.jsx`)
in the Editorial/Ink palette. The renderer **transcribes** author-provided
structure — it never computes the math, so correctness is the author's job (the
diagram should restate a result the lesson already proves). Every diagram takes
an optional `caption`. Three kinds:

**`recursion`** — a recursion tree with explicit per-level *work accounting*
(the visual proof of a Master-Theorem bound). `levels[]` top-to-bottom + `total`:
```js
{ type: "diagram", kind: "recursion", caption: "...",
  levels: [
    { n: 1, each: "cn",   row: "cn" },          // n = node count (number or symbol),
    { n: 2, each: "cn/2", row: "cn" },          // each = work/node, row = level total
    { ellipsis: true, row: "cn" },              // collapsed level (draws ⋮)
    { n: "n", each: "c", row: "cn", leaf: true, leafLabel: "n leaves" },
  ],
  total: "cn(lg n + 1) = Θ(n lg n)" }           // the Σ shown under the gutter
```
Optional per-level: `draw` (dots to render, default = numeric `n` capped at 8),
`tone` ("gold"|"sage"|…). The right gutter shows `n × each = row`, the rigor.

**`graph`** — positioned node-link: flow networks, weighted/shortest-path graphs,
BSTs, quorum/CAP topologies. Nodes carry `x,y` in **0..100**:
```js
{ type: "diagram", kind: "graph", directed: true, height: 300, caption: "...",
  nodes: [ { id: "s", label: "s", x: 4, y: 50, tone: "gold" }, … ],   // optional sub, r, tone
  edges: [ { from: "s", to: "v1", label: "16", tone: "sage", bold: true }, … ] }
```
Per-edge: `directed` (overrides the block default), `dashed`, `bold`, `tone`, `label`.

**`sequence`** — message/timeline: the Gilbert–Lynch CAP execution, Lamport
happens-before, quorum reads, consensus rounds. `actors[]` are lanes:
```js
{ type: "diagram", kind: "sequence", caption: "...",
  actors: ["Writer", "N₁", "N₂", "Reader"],
  messages: [
    { from: "Writer", to: "N₁", label: "write x=v1", tone: "sage" },
    { from: "N₁", to: "N₂", label: "replicate — lost", tone: "rust", dashed: true },
    { note: "✂ partition — messages dropped" },   // centered note (optional `at: actor`)
  ] }
```
Per-message: `dashed` (async/return), `tone`, `tick` (a clock value, e.g. Lamport).
A `from === to` message draws a self-loop. Notes span centered, or pin to `at`.

Diagram **shape is validated** (`lib/schema.js`): bad `kind`, missing `levels`/
`nodes`/`actors`, non-numeric node coords, or an edge/message naming an unknown
node/actor all fail `npm run validate`. Use it — a diagram that references a
node id you didn't define is a hard error, not a silent blank.

### Theorem & exercises blocks (the spine of a textbook section)

A rigorous lesson does not merely *state* its key results — it **proves them in
the text**, and gives the reader **problems to work**. Two blocks carry that:

**`theorem`** — a labelled statement with an inline proof:
```js
{ type: "theorem", kind: "theorem", name: "Transitivity",
  statement: "If f = O(g) and g = O(h), then f = O(h).",
  proof: "From f = O(g): ∃ c₁,n₁ … therefore f = O(h). ∎" }
```
`kind` ∈ `theorem | lemma | corollary | proposition | definition`. A
`definition` may omit `proof`; **every other kind MUST include one** — that rule
is enforced by `npm run validate`, because an unproven "theorem" is exactly the
lecture-notes shortcut this format exists to forbid. `statement` renders italic
(upright for definitions); `proof` follows under a PROOF rule. Both support
`**bold**`/`*italic*` and line breaks. End proofs with ∎.

**`exercises`** — a problem set with worked solutions, revealed on click so the
reader attempts first:
```js
{ type: "exercises", heading: "Exercises", items: [
  { prompt: "Prove 10n² + 7n + 3 = O(n²).",
    solution: "For n ≥ 1, 10n²+7n+3 ≤ 20n²; c=20, n₀=1. ∎",
    hint: "Bound each lower-order term by a multiple of n²." },   // hint optional
] }
```
Each item needs a `prompt` and a `solution` (a `hint` is optional); both are
validated. Solutions render behind a collapsed "Solution" toggle. Aim for 3–6
problems that demand *transfer* (prove a new bound, find the bug, derive a
formula), graded in difficulty.

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

## Depth floors (ENFORCED — `npm run validate` fails without them)

Prose promises produced screen-sized "15-minute lessons", so the floors are now
code (`DEPTH` in `src/lib/schema.js`). Every **lesson** must have:

| floor | value |
|---|---|
| content words | ≥ 1,200 |
| study-words vs claim | words + 250×(exercise items) ≥ `estMinutes` × 90 |
| content blocks | ≥ 8 |
| words per `text` block | ≥ 40 (no bullet-point "exposition") |
| `theorem`/`definition` blocks | ≥ 1 (formalize what you teach) |
| worked instances (`example`+`code`) | ≥ 2 |
| `exercises` blocks | ≥ 1, each with ≥ 3 problems |
| review cards | 3–6 |

And every **unit's mastery check**: ≥ 4 questions, ≤ half `mcq`, an
`explanation` on every question, `proof`/`open` rubrics with ≥ 3 criteria,
`masteryThreshold` ≥ 0.8.

The study-words rule cuts both ways: state an honest `estMinutes`. Deepen the
lesson or lower the claim — the validator accepts either, and also warns when
the claim *undersells* long content (> 300 implied wpm).

## Rigor rules (what makes a gate real)

These are non-negotiable if "mastery" is to mean anything:

1. **Prefer `numeric` and `short` over `mcq`.** Multiple choice is guessable; a
   gate built only from `mcq` is theater. At least half non-MCQ (enforced).
2. **Mastery checks test transfer, not recall.** Questions should require *applying*
   the unit to a new case, not restating a definition. (Put the recall in
   `reviewItems` instead.)
3. **Every lesson seeds `reviewItems`** — 3–6 atomic cards, one idea each, cue on
   the front, crisp answer on the back. These are what spaced repetition keeps alive.
4. **One concept per review card.** No "list all five…" cards; split them.
5. **MCQ distractors must be plausible** — each wrong option should reflect a real
   misconception, with the fix in the `explanation` (explanations are enforced).
6. **Threshold ≥ 0.8.** Lower than that isn't a gate (enforced).

## Source-grounding

`sources[]` is the provenance trail. When generating from real material:
- List the actual sources used (textbook + chapter, paper, OCW course).
- Keep definitions and notation faithful to those sources.
- Prefer worked examples adapted from canonical problems over invented ones.

---

## Generation process (one unit per pass — this is the depth mechanism)

A whole course generated in one shot comes out thin: the model rations its
output budget across 25+ lessons and every one lands at a third of textbook
depth. The audit that motivated the depth floors showed exactly this signature —
one-shot courses at ~760 median words/lesson vs ~1,850 for unit-by-unit ones.

So: **never generate more than one unit per pass.**

1. Pass 0 — outline only: course object with `id`/`title`/`sources`, unit list
   with titles + summaries, no lessons.
2. Pass N — write ONE unit completely to the depth floors above. Budget
   ~1,600–2,500 words per lesson. If a lesson can't reach 1,200 words without
   padding, its topic is too small — merge it; if it sprawls, split it.
3. Run `npm run validate -- <course-id>` after every pass. Fix errors before
   generating the next unit. Never lower `estMinutes` merely to pass — first ask
   whether the content is actually complete.

## Generation prompt (hand this to Claude, once per unit)

> We are building a Crucible course on **<TOPIC>** at **<LEVEL>** difficulty,
> grounded in the source material I'm providing (or, if none: standard canonical
> treatments, listed honestly in `sources`). Here is the outline and the units
> written so far: <PASTE>.
>
> Write **unit <K> only**, exactly matching `crucible/AUTHORING.md`. Follow every
> rigor rule and every depth floor (they are machine-enforced). Specifically:
> - 3–5 lessons, each a **full textbook section**, not a summary: 8–14 content
>   blocks and ≥ 1,200 words (target 1,600–2,500) — motivation, formal
>   `definition`s, the key results as `theorem` blocks *with inline proofs*, 2+
>   worked `example`s, and a closing `exercises` set (3–6 problems with worked
>   solutions). Plus 3–6 atomic review cards. An honest `estMinutes` backed by
>   the content (≥ 90 study-wpm).
> - A mastery check of 4–6 questions that test *application*, at least half
>   non-`mcq`, threshold 0.85, every question with an `explanation`,
>   `proof`/`open` rubrics with 3+ independently checkable criteria.
> - Faithful notation; worked examples adapted from canonical problems over
>   invented ones; **prove the results you rely on** rather than asserting them.
>
> Then I'll splice it into `src/data/courses/<id>.js` and run
> `npm run validate -- <id>` — it must pass with zero errors.
