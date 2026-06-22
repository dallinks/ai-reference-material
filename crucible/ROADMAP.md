# Crucible — Roadmap

Backlog of future work, kept with the content. Current courses: `algorithms`
(9 units, graduate) and `probability` (2-unit seed/demo).

---

## Algorithms & Data Structures (`src/data/courses/algorithms.js`)

**Built:** Arc 1 — Asymptotic Analysis · Divide & Conquer/Recurrences · Sorting &
Selection · Hashing · BSTs & Balance. Arc 2 — Graph Traversal · Shortest Paths ·
Greedy · Dynamic Programming. Arc 3 — Amortized Analysis · Maximum Flow ·
NP-Completeness · Approximation & Randomized Algorithms. (13 units, 39 lessons,
26 proof-graded questions.)

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

- **Diagram block type** — graphs, trees, recursion trees, and DP tables badly
  want visuals; `Blocks.jsx` has no diagram renderer yet (the sibling AI course
  app had one). Highest-leverage single addition for algorithms.
- **Interactive visualizers** — animate BFS / Dijkstra / DP fills (bigger lift).
- **Timed-exam mode** + a **cross-course transcript / GPA**.
- **Move the API key off the browser** (a small local proxy).
- **FSRS** scheduler upgrade; **IndexedDB / sync** for multi-device review.
