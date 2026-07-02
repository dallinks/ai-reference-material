# Crucible — Roadmap

Backlog of future work, kept with the content. Current courses: `algorithms`
(9 units, graduate) and `probability` (2-unit seed/demo).

---

## Algorithms & Data Structures (`src/data/courses/algorithms.js`)

**Built:** Arc 1 — Asymptotic Analysis · Divide & Conquer/Recurrences · Sorting &
Selection · Hashing · BSTs & Balance. Arc 2 — Graph Traversal · Shortest Paths ·
Greedy · Dynamic Programming. Arc 3 — Amortized Analysis · Maximum Flow ·
NP-Completeness · Approximation & Randomized Algorithms. (13 units, ~46 lessons,
26 proof-graded gate questions.)

**Now FULL TEXTBOOK DEPTH (all 13 units).** Every lesson was rebuilt into a
complete textbook section — formal `definition`s, key results as `theorem` blocks
with **inline proofs**, multiple worked examples, and an in-text `exercises` set
with solutions (now ~32–54 content blocks/unit, was ~9–18). Generated +
adversarially verified (21 defects caught/fixed); the few unverified units were
self-audited. Tooling: `scripts/extract-units.mjs` + `scripts/apply-deep-lessons.mjs`.
**Entrepreneurship is now FULL TEXTBOOK DEPTH too** (all 9 units, ~187 blocks,
55 theorem/def blocks, 27 exercise sets) — done inline, with the quantitative
spine derived (LTV geometric series, dilution, vesting, viral-k, Metcalfe) and
qualitative frameworks given formal definitions + worked examples + exercises.
**Cloud Architecture is now FULL TEXTBOOK DEPTH too** (all 9 units, ~184 blocks,
76 theorem/def blocks, 27 exercise sets, 7 diagrams) — the most theorem-dense
course (Amdahl, Little's Law, M/M/1, USL, availability composition, CAP, Lamport,
quorum, consistent hashing, exactly-once/backpressure, backoff, tail-at-scale,
FLP, defense-in-depth, cost-of-nines), all derived inline.

**All three main graduate courses are now full textbook depth** (Algorithms 13u,
Entrepreneurship 9u, Cloud 9u). Only the probability seed (2-unit demo) remains
shallow. Reusable deepening tooling: `scripts/{extract-units,splice-lessons,apply-deep-lessons}.mjs`.

**A fourth full course was built from scratch: `langgraph` — "Building Agents with
LangChain & LangGraph"** (9 units, 177 blocks, 20 Python code blocks, 7 diagrams,
APIs web-verified against docs.langchain.com). LangGraph-centered, anchored in the
durable layer (Pregel/BSP execution, graph semantics, retrieval math, the agent
papers), cross-linking the algorithms and cloud courses. New tooling for building
a course unit-by-unit: `scripts/insert-unit.mjs`. **5 courses total.** Future:
deepen the probability seed; consider courses on systems/ML/etc.; back-port more
diagrams; the platform features (timed exams, transcript, off-browser key) still open.

### Arc 4 — candidate new units
- **Advanced data structures** — Fibonacci heaps, B-trees, segment / Fenwick
  trees, tries (union-find's α(n) is now covered in Arc 3's Amortized Analysis).
- **String algorithms** — KMP, Rabin–Karp (rolling hash), Z-algorithm, suffix
  arrays/automata, Aho–Corasick.
- **More randomized algorithms** — treaps / skip lists, Karger's min-cut,
  hashing tail bounds (Chernoff), the probabilistic method (Arc 3 covers the
  indicator-variable basics).
- **Algebraic / number-theoretic** — modular exponentiation, extended GCD, RSA,
  FFT / fast polynomial multiplication.
- **Computational geometry** — convex hull, sweep line, closest pair.
- **Deeper approximation** — LP relaxation & rounding, PTAS/FPTAS, inapproximability.

### Deepen existing units
- Add a **proof of the Master Theorem** (currently stated and used, not proved).
- ~~Quicksort expected-comparisons via indicator variables~~ — **done** (Arc 3, Unit 13).
- ~~Union-find α(n)~~ — **done** (Arc 3, Unit 10's Amortized Analysis).
- **DP reconstruction** (back-tracing the actual solution, not just its cost) as
  its own worked treatment.
- **Runnable code blocks** (Python) for the key algorithms — DFS, Dijkstra, the
  DP tables — alongside the pseudocode.
- **Per-arc capstone** — implement + benchmark (e.g. race the sorts; build a
  shortest-path engine).

### Assessment & rigor
- More proof questions per gate (currently 2), and harder **"design an
  algorithm"** open problems graded by the proof grader.
- **Timed, cumulative arc exams** (needs the timed-exam platform feature).
- **Cross-unit synthesis** questions ("pick and justify an algorithm for this
  scenario").
- Spaced-repetition of **derivations**, not just facts.

### Source-grounding
- Cite specific **CLRS sections** and **MIT 6.046 lecture numbers** per unit
  (currently course-level `sources` only).
- Per-lesson "further reading" pointers.

---

## Platform (cross-course — but high impact for this course)

- ~~**Diagram block type**~~ — **done.** `components/Diagram.jsx`: zero-dep SVG,
  three kinds — `recursion` (work-accounted recursion trees), `graph` (flow
  networks / weighted graphs / BSTs / topologies), `sequence` (message
  timelines). Shape-validated in `schema.js`, documented in `AUTHORING.md`.
  Seeded into three lessons: the 2T(n/2)+cn recursion-tree proof (a2l2), the
  CLRS max-flow network (a11l1), and the Gilbert–Lynch CAP execution (cloud
  c3l2). *Still open:* DP-table / matrix diagrams, and back-porting visuals to
  more units (Dijkstra graphs, BST rotations, quorum intersection).
- ~~**Motivation layer**~~ — **done** (2026-07-01): a study **streak** with one
  auto grace day per calendar month (two consecutive misses always break), a
  **daily goal** (clear due reviews + finish a lesson or take a gate), a
  26-week **consistency heatmap**, cross-course **standing stats** (units ·
  lessons · cards known · study days), and per-course "next gate → unlocks X"
  lines. Engine: `src/lib/streak.js` (pure, clock-injected, tested in
  `test/streak.test.js`); actions become streak fuel only where progress is
  actually persisted (`state/activity.js`). Fix along the way: `todayStr()` now
  uses the LOCAL calendar day — it was UTC, so evening study counted as
  tomorrow. *Still open:* the scheduled daily nudge (deferred by choice).
- **Interactive visualizers** — animate BFS / Dijkstra / DP fills (bigger lift).
- **Timed-exam mode** + a **cross-course transcript / GPA**.
- **Move the API key off the browser** (a small local proxy).
- ~~**Sync / durable storage**~~ — **done** (2026-07-02): the dev server now
  hosts a store API (`server/store-plugin.js`, zero extra process) over a
  machine-local **SQLite** db (`node:sqlite`, gitignored) mirrored to a
  deterministic **`data/progress.json`** snapshot that is **committed and
  synced via git**. Boot merges snapshot ∪ db with a pure symmetric/idempotent
  merge (`src/lib/merge.js`: union lessons, best mastery, newest SRS card,
  per-day-max activity) — diverged machines union losslessly; git conflicts on
  the snapshot can be resolved either way. Legacy localStorage migrates
  automatically on first boot; static deploys fall back to localStorage.
- **FSRS** scheduler upgrade.
