// Algorithms & Data Structures — graduate level, anchored in CLRS (4th ed.) and
// MIT 6.006/6.046. Proof-heavy: derivations are taught in full in the lessons,
// and the mastery gate grades two proofs by rubric (see lib/grader.js).
//
// Arc 1 — Foundations: Analysis, Sorting & Search Structures.
// Unit 1 of 5 is complete; units 2–5 follow.

export const algorithms = {
  id: "algorithms",
  title: "Algorithms & Data Structures",
  subject: "Computer Science",
  difficulty: "Graduate",
  description:
    "A rigorous, proof-heavy treatment anchored in CLRS and MIT 6.046 — asymptotic analysis, correctness, sorting, hashing, and balanced search trees. The gates grade your proofs, not just your arithmetic.",
  sources: [
    "Cormen, Leiserson, Rivest & Stein — Introduction to Algorithms (CLRS), 4th ed.",
    "MIT 6.006 / 6.046 (OpenCourseWare)",
  ],
  grader:
    "You are a meticulous theoretical computer scientist grading proofs and derivations for a graduate algorithms course (CLRS / MIT 6.046). Penalize unjustified leaps, missing or unhandled cases, incorrect bounds or quantifiers, circular reasoning, and assuming what must be proven. A valid proof that differs from the reference is fully acceptable — grade the actual argument's rigor, not its similarity to the reference.",
  units: [
    {
      id: "a1",
      title: "Asymptotic Analysis & Correctness",
      summary: "Define growth rigorously, count the work exactly, and prove an algorithm correct.",
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a1l1",
          title: "Asymptotic Notation, Rigorously",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Why we go asymptotic",
              body: "We compare algorithms by how their cost *grows* with input size n, deliberately discarding constant factors and lower-order terms. Those are artifacts of the machine, the language, and the compiler — not of the algorithm. Asymptotic notation is the machinery that makes \"grows like\" a precise, provable statement instead of a hand-wave.",
            },
            {
              type: "text",
              heading: "The five symbols, by definition",
              body: "Each is a *set of functions*. Let f, g be eventually nonnegative.\n\n**O(g)** — asymptotic upper bound: f ∈ O(g) iff ∃ c > 0, n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀.\n**Ω(g)** — asymptotic lower bound: ∃ c > 0, n₀ such that 0 ≤ c·g(n) ≤ f(n) for all n ≥ n₀.\n**Θ(g)** — tight bound: f ∈ O(g) *and* f ∈ Ω(g). This is the one you usually want.\n**o(g)** — strictly smaller: ∀ c > 0, ∃ n₀ with 0 ≤ f(n) < c·g(n) for all n ≥ n₀ (equivalently lim f/g = 0).\n**ω(g)** — strictly larger: lim f/g = ∞.\n\nThe ubiquitous \"f(n) = O(g(n))\" is a conventional abuse of notation for \"f ∈ O(g)\" — the = is not symmetric and not equality.",
            },
            {
              type: "example",
              heading: "A bound proved from the definition",
              body: "Claim: 3n² + 10n = Θ(n²).\nUpper (O): 3n² + 10n ≤ 3n² + 10n² = 13n² for n ≥ 1, so c = 13 works.\nLower (Ω): 3n² + 10n ≥ 3n² for n ≥ 0, so c = 3 works.\nBoth hold for n ≥ 1, hence 3n² + 10n = Θ(n²) with witnesses c₁ = 3, c₂ = 13, n₀ = 1. The 10n term is asymptotically irrelevant — exactly as the notation promises.",
            },
            {
              type: "callout",
              tone: "warn",
              body: "**O is an upper bound, not \"the\" running time.** Proving an algorithm is O(n²) does not say it *is* quadratic — its true cost could be Θ(n). Reach for **Θ** whenever you mean the exact growth, and read a published O-bound as a ceiling, possibly loose.",
            },
            {
              type: "text",
              heading: "The growth hierarchy",
              body: "Under ≺ (meaning \"little-o of\"):\n\n1 ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n! ≺ nⁿ\n\nTwo facts generate most of this: **logs lose to any positive power** (log n = o(n^ε) for every ε > 0), and **any polynomial loses to any exponential with base > 1** (n^k = o(cⁿ)). Factorial in turn beats every fixed exponential, since n! = 2^Θ(n log n).",
            },
            {
              type: "text",
              heading: "The limit test",
              body: "When f and g are smooth enough, ranking them is a single limit. If lim_{n→∞} f(n)/g(n) = L, then:\n\n• L = 0  ⇒ f = o(g)  (so also f = O(g))\n• 0 < L < ∞ ⇒ f = Θ(g)\n• L = ∞  ⇒ f = ω(g)  (so also f = Ω(g))\n\nL'Hôpital and Stirling's approximation (n! ≈ √(2πn)(n/e)ⁿ) handle most cases you'll meet.",
            },
          ],
          reviewItems: [
            { id: "a1l1-i1", front: "Definition of f(n) = O(g(n))?", back: "∃ c > 0 and n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀ — an eventual upper bound within a constant factor." },
            { id: "a1l1-i2", front: "Definition of Θ(g)?", back: "f = O(g) AND f = Ω(g) — a tight bound, bracketed above and below by constant multiples of g." },
            { id: "a1l1-i3", front: "Limit test: lim f/g = L gives what for L = 0, 0<L<∞, L = ∞?", back: "o(g), Θ(g), and ω(g) respectively." },
            { id: "a1l1-i4", front: "How do logs and exponentials rank against polynomials?", back: "log n = o(n^ε) for every ε > 0; n^k = o(cⁿ) for c > 1. Logs ≺ polynomials ≺ exponentials." },
            { id: "a1l1-i5", front: "Why is 'this algorithm is O(n²)' weaker than 'Θ(n²)'?", back: "O is only an upper bound — the true cost could be smaller (e.g. Θ(n)). Θ asserts the exact growth." },
          ],
        },
        {
          id: "a1l2",
          title: "Counting the Work: Summations & Loops",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "From code to a sum",
              body: "The running time of a loop nest is the sum of the inner work over the loop's index values. Analysis is mostly the discipline of writing that sum *exactly* — honoring data-dependent bounds — and then finding its asymptotic class.",
            },
            {
              type: "example",
              heading: "Nested loops → a triangular sum",
              body: "for i = 1..n:\n  for j = 1..i:\n    do O(1) work\n\nThe inner loop runs i times, so the total is Σ_{i=1}^{n} i = n(n+1)/2 = Θ(n²). The triangular shape saves a factor of 2 over the full n × n square — a constant — so the *class* is still Θ(n²).",
            },
            {
              type: "text",
              heading: "Closed forms worth memorizing",
              body: "**Arithmetic:** Σ_{i=1}^{n} i = n(n+1)/2 = Θ(n²); Σ i² = Θ(n³); in general Σ i^k = Θ(n^{k+1}).\n**Geometric:** Σ_{i=0}^{n} rⁱ = (r^{n+1} − 1)/(r − 1). For r > 1 this is Θ(rⁿ) — the *last* term dominates; for r < 1 it converges, so it's Θ(1).\n**Harmonic:** H_n = Σ_{i=1}^{n} 1/i = ln n + γ + o(1) = Θ(log n), where γ ≈ 0.577.",
            },
            {
              type: "callout",
              tone: "info",
              body: "**Sandwich an unfamiliar sum between integrals.** For a monotone term f, comparing the sum to the area under f gives, for increasing f, ∫₀ⁿ f(x) dx ≤ Σ_{i=1}^{n} f(i) ≤ ∫₁^{n+1} f(x) dx. This recovers H_n ≈ ∫ 1/x = ln n and Σ i ≈ ∫ x = n²/2 with no closed form needed.",
            },
            {
              type: "example",
              heading: "A geometric index makes the loop logarithmic",
              body: "i = 1\nwhile i ≤ n:\n  do O(1) work\n  i = 2·i\n\ni takes the values 1, 2, 4, …, up to n, so the loop runs ⌊log₂ n⌋ + 1 times → Θ(log n). Multiplying the index (rather than adding) collapses the iteration count to logarithmic — the engine behind binary search and balanced-tree heights.",
            },
            {
              type: "text",
              heading: "Best, worst, and which one you're proving",
              body: "When an inner bound depends on the data — insertion sort's inner loop runs anywhere from 1 to i times depending on order — the cost has a *range*. Always say which case you are bounding. \"O(n²)\" for insertion sort is the worst case; its best case (already-sorted input) is Θ(n). Conflating them is the most common analysis error.",
            },
          ],
          reviewItems: [
            { id: "a1l2-i1", front: "Σ_{i=1}^{n} i = ?", back: "n(n+1)/2 = Θ(n²)." },
            { id: "a1l2-i2", front: "Σ_{i=0}^{n} rⁱ for r > 1 is Θ(?), and why?", back: "Θ(rⁿ) — a growing geometric series is dominated by its largest (last) term." },
            { id: "a1l2-i3", front: "The harmonic sum H_n is Θ(?) and equals ≈ ?", back: "Θ(log n); H_n = ln n + γ + o(1), γ ≈ 0.577." },
            { id: "a1l2-i4", front: "A loop doing i = 2·i until i > n runs how many times?", back: "⌊log₂ n⌋ + 1 = Θ(log n)." },
            { id: "a1l2-i5", front: "How do you Θ-bound a monotone sum with no closed form?", back: "Sandwich it between integrals of the term (the integral test)." },
          ],
        },
        {
          id: "a1l3",
          title: "Proving Correctness: Loop Invariants",
          estMinutes: 18,
          content: [
            {
              type: "text",
              heading: "Testing is not a proof",
              body: "Tests can reveal the presence of bugs but never their absence — they sample finitely many of infinitely many inputs. To *know* an iterative algorithm is correct, you prove a **loop invariant**: a property that holds before every iteration and, combined with the loop's termination, forces the desired result.",
            },
            {
              type: "text",
              heading: "Three obligations — which are just induction",
              body: "A loop-invariant proof has exactly three parts, mirroring induction on the iteration count:\n\n**Initialization** — the invariant holds before the first iteration. *(the base case)*\n**Maintenance** — if it holds before an iteration, it still holds before the next. *(the inductive step)*\n**Termination** — when the loop exits, the invariant together with the exit condition yields what you wanted to prove.\n\nInitialization + maintenance show the invariant holds at every iteration; termination cashes it in.",
            },
            {
              type: "code",
              heading: "Insertion sort",
              lang: "text",
              code: "INSERTION-SORT(A, n):\n  for j = 2 to n:\n    key = A[j]\n    i = j - 1\n    while i > 0 and A[i] > key:\n      A[i+1] = A[i]\n      i = i - 1\n    A[i+1] = key",
            },
            {
              type: "example",
              heading: "Insertion sort, proved correct",
              body: "**Invariant:** at the start of the for-loop iteration for index j, the subarray A[1..j−1] is a *sorted permutation* of the elements originally in A[1..j−1].\n\n**Initialization** — when j = 2, A[1..1] is a single element: trivially sorted and a permutation of itself.\n**Maintenance** — the inner loop shifts every element of A[1..j−1] greater than key = A[j] one slot right, then drops key into the opened position. The result A[1..j] is sorted and contains exactly the original elements of A[1..j]; incrementing j re-establishes the invariant for the next iteration.\n**Termination** — the loop ends with j = n+1. The invariant then reads: A[1..n] is a sorted permutation of the original A[1..n]. That is precisely correctness. ∎",
            },
            {
              type: "callout",
              tone: "warn",
              body: "**The art is choosing the invariant.** It must be (a) actually maintained every iteration and (b) strong enough at termination to imply the goal. Too weak and termination proves nothing; too strong and maintenance fails. Finding the right invariant *is* the proof.",
            },
            {
              type: "example",
              heading: "A second invariant — running maximum",
              body: "m = A[1]; for i = 2..n: if A[i] > m: m = A[i]\n\n**Invariant:** before the iteration for i, m = max(A[1..i−1]).\nInitialization: i = 2, m = A[1] = max(A[1..1]).\nMaintenance: the body sets m = max(m, A[i]) = max(A[1..i]).\nTermination: i = n+1, so m = max(A[1..n]). ∎",
            },
          ],
          reviewItems: [
            { id: "a1l3-i1", front: "Why is testing not a correctness proof?", back: "It samples finitely many inputs — it can show bugs exist but never that none do. A proof must cover all inputs." },
            { id: "a1l3-i2", front: "The three loop-invariant obligations?", back: "Initialization (holds before iteration 1), Maintenance (preserved across an iteration), Termination (exit condition + invariant ⇒ goal)." },
            { id: "a1l3-i3", front: "Loop invariants mirror which proof technique?", back: "Induction — initialization is the base case, maintenance is the inductive step." },
            { id: "a1l3-i4", front: "Insertion sort's outer-loop invariant?", back: "At the start of iteration j, A[1..j−1] is a sorted permutation of the original A[1..j−1]." },
            { id: "a1l3-i5", front: "What makes an invariant 'strong enough'?", back: "It is maintained every iteration AND, with the exit condition, implies the desired result at termination." },
          ],
        },
      ],
      masteryCheck: {
        id: "a1-check",
        questions: [
          {
            id: "a1q1",
            type: "numeric",
            prompt: "In `for i = 1..n: for j = i..n: visit()`, with n = 100, exactly how many times does visit() run?",
            answer: 5050,
            tolerance: 0,
            explanation: "The inner loop runs (n − i + 1) times, so the total is Σ_{i=1}^{100} (101 − i) = Σ_{k=1}^{100} k = 100·101/2 = 5050.",
          },
          {
            id: "a1q2",
            type: "mcq",
            prompt: "Exactly one of these asymptotic statements is FALSE. Which one?",
            options: [
              "2^{n+1} = O(2ⁿ)",
              "n log n = O(n²)",
              "n! = O(2ⁿ)",
              "log(n!) = Θ(n log n)",
            ],
            answer: 2,
            explanation: "n! = 2^Θ(n log n) grows faster than 2ⁿ, so n! ≠ O(2ⁿ). The others hold: 2^{n+1} = 2·2ⁿ; n log n ≤ n²; and by Stirling log(n!) = Θ(n log n).",
          },
          {
            id: "a1q3",
            type: "short",
            prompt: "The harmonic sum H_n = Σ_{i=1}^{n} 1/i is Θ(____). Fill in the function of n.",
            accept: ["log n", "logn", "log(n)", "lg n", "ln n", "log₂ n", "log_2 n"],
            explanation: "H_n = ln n + γ + o(1) = Θ(log n). (Base is irrelevant inside Θ.)",
          },
          {
            id: "a1q4",
            type: "numeric",
            prompt: "The triple sum Σ_{i=1}^{n} Σ_{j=1}^{i} Σ_{k=1}^{j} 1 is Θ(n^d). What is d?",
            answer: 3,
            tolerance: 0,
            explanation: "Inner sum = j; middle Σ_{j≤i} j = i(i+1)/2; outer Σ_{i≤n} i(i+1)/2 = Θ(n³). So d = 3.",
          },
          {
            id: "a1q5",
            type: "proof",
            points: 3,
            prompt:
              "Prove directly from the definition of O-notation that if f(n) = O(g(n)) and g(n) = O(h(n)), then f(n) = O(h(n)). Assume f, g, h are eventually nonnegative.",
            rubric: [
              "Unpacks both hypotheses into their ∃ c, n₀ definitions (constants c₁, n₁ for f ≤ c₁·g, and c₂, n₂ for g ≤ c₂·h).",
              "Restricts to n ≥ max(n₁, n₂) so both inequalities hold simultaneously.",
              "Chains the inequalities f(n) ≤ c₁·g(n) ≤ c₁·c₂·h(n), correctly using c₁ > 0 and nonnegativity to preserve direction.",
              "Exhibits explicit witnesses c = c₁·c₂ and n₀ = max(n₁, n₂) and concludes f = O(h).",
            ],
            solution:
              "By f = O(g) there are c₁ > 0, n₁ with f(n) ≤ c₁·g(n) for all n ≥ n₁. By g = O(h) there are c₂ > 0, n₂ with g(n) ≤ c₂·h(n) for all n ≥ n₂. Let n₀ = max(n₁, n₂). For every n ≥ n₀ both hold, so f(n) ≤ c₁·g(n) ≤ c₁·(c₂·h(n)) = (c₁·c₂)·h(n); multiplying g ≤ c₂·h by the positive constant c₁ preserves the inequality, and all quantities are nonnegative. Taking c = c₁·c₂ > 0 gives f(n) ≤ c·h(n) for all n ≥ n₀, i.e. f = O(h). ∎",
            explanation:
              "Instantiate both definitions, align thresholds at max(n₁, n₂), multiply the second bound by c₁, and read off c = c₁c₂.",
          },
          {
            id: "a1q6",
            type: "proof",
            points: 3,
            prompt:
              "State a loop invariant for the outer loop of insertion sort and use it to prove the algorithm sorts A[1..n]. Address initialization, maintenance, and termination.",
            rubric: [
              "States a correct, sufficient invariant — e.g. 'at the start of iteration j, A[1..j−1] is a sorted permutation of the original A[1..j−1]'.",
              "Initialization: verifies the invariant before the first iteration (j = 2, the subarray A[1..1]).",
              "Maintenance: argues the inner loop shifts elements greater than key right and inserts key, leaving A[1..j] a sorted permutation, so the invariant holds for the next j.",
              "Termination: uses the exit value j = n+1 with the invariant to conclude A[1..n] is sorted and a permutation of the input.",
            ],
            solution:
              "Invariant: at the start of each outer-loop iteration for index j, A[1..j−1] is a sorted permutation of the elements originally in A[1..j−1]. Initialization: at j = 2, A[1..1] is one element — trivially sorted and a permutation of itself. Maintenance: the inner while loop shifts every element of A[1..j−1] greater than key = A[j] one position right, then places key in the opened slot; the result A[1..j] is sorted and consists of exactly the original elements of A[1..j], so after j is incremented the invariant holds for the next iteration. Termination: the loop exits with j = n+1, and the invariant gives that A[1..n] is a sorted permutation of the original A[1..n] — i.e. the array is sorted. ∎",
            explanation:
              "Choose the invariant 'A[1..j−1] is a sorted permutation of the original'; the three obligations then read directly off the code.",
          },
        ],
      },
    },
    {
      id: "a2",
      title: "Divide & Conquer and Recurrences",
      summary: "Split, recurse, combine — and solve the recurrences that result, including the Master Theorem and where it fails.",
      prerequisites: ["a1"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a2l1",
          title: "The Divide-and-Conquer Paradigm",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Three steps, one recurrence",
              body: `**Divide** the problem into smaller instances of itself; **conquer** them recursively (a base case stops the recursion); **combine** their answers. The running time obeys a recurrence\n\nT(n) = a·T(n/b) + f(n)\n\nwhere a is the number of subproblems, n/b their size, and f(n) the non-recursive cost of dividing and combining. Everything about a divide-and-conquer algorithm's speed is encoded in a, b, and f.`,
            },
            {
              type: "example",
              heading: "Merge sort",
              body: `Divide the array in half, sort each half recursively, then merge the two sorted halves in linear time. That gives T(n) = 2·T(n/2) + Θ(n), which we will see solves to Θ(n log n) — asymptotically optimal for comparison sorting.`,
            },
            {
              type: "example",
              heading: "Binary search",
              body: `One subproblem of half the size, with O(1) work to choose the side: T(n) = T(n/2) + Θ(1) → Θ(log n). The single branch (a = 1) is exactly what makes it logarithmic rather than linearithmic.`,
            },
            {
              type: "text",
              heading: "Which dominates?",
              body: `Reading T(n) = a·T(n/b) + f(n), the whole question is whether the **leaves** (there are about n^(log_b a) of them) or the **root work** f(n) dominates the total — or whether they balance across the log_b n levels. The next two lessons make that comparison rigorous.`,
            },
          ],
          reviewItems: [
            { id: "a2l1-i1", front: "The three divide-and-conquer steps?", back: "Divide into smaller subproblems, conquer them recursively, combine the results." },
            { id: "a2l1-i2", front: "General D&C recurrence, and what each symbol means?", back: "T(n) = a·T(n/b) + f(n): a subproblems of size n/b, plus f(n) to divide and combine." },
            { id: "a2l1-i3", front: "Merge sort's recurrence and its solution?", back: "T(n) = 2T(n/2) + Θ(n) = Θ(n log n)." },
            { id: "a2l1-i4", front: "Why is binary search Θ(log n) and not Θ(n)?", back: "It recurses on only one subproblem (a = 1) of half the size, with O(1) overhead per level." },
          ],
        },
        {
          id: "a2l2",
          title: "Solving Recurrences: Trees & Substitution",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The recursion-tree method",
              body: `Expand the recurrence into a tree: each node is a subproblem, labelled with its non-recursive cost f at that size. Sum the costs level by level, then across all levels. It gives the answer directly — and a guess to verify rigorously by substitution.`,
            },
            {
              type: "example",
              heading: "Tree for 2T(n/2) + cn",
              body: `At depth i there are 2^i nodes, each of size n/2^i, each costing c·(n/2^i). So every level costs 2^i · c·(n/2^i) = cn — identical across levels. The tree has log₂ n + 1 levels (down to size 1), so the total is cn·(log₂ n + 1) = Θ(n log n). The n leaves contribute only Θ(n); the Θ(n log n) is equal work summed over log n levels.`,
            },
            {
              type: "text",
              heading: "The substitution method",
              body: `Guess the form of the bound, then prove it by induction: assume it for inputs smaller than n and verify it for n. Fully rigorous — but you must guess correctly, which is what the recursion tree is for.`,
            },
            {
              type: "example",
              heading: "Substitution for 2T(n/2) + n",
              body: `Guess T(n) ≤ c·n·log₂ n. Assume it for n/2: T(n/2) ≤ c·(n/2)·log₂(n/2). Then\n\nT(n) = 2T(n/2) + n ≤ c·n·log₂(n/2) + n = c·n·(log₂ n − 1) + n = c·n·log₂ n − (c−1)·n ≤ c·n·log₂ n\n\nfor any c ≥ 1. With a base case fixing small n, T(n) = O(n log n). ∎`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Carry the lower-order terms.** The classic substitution failure is guessing T(n) ≤ c·n and "verifying" it — missing that the +n has nothing to cancel against. The −(c−1)n slack above is exactly what absorbs it. If your algebra leaves a positive leftover, the guess is too weak.`,
            },
          ],
          reviewItems: [
            { id: "a2l2-i1", front: "Recursion-tree method in one sentence?", back: "Expand the recurrence into a tree; sum non-recursive costs per level, then across all levels." },
            { id: "a2l2-i2", front: "For 2T(n/2) + cn: per-level cost and number of levels?", back: "Each level costs cn; there are log₂ n + 1 levels → Θ(n log n)." },
            { id: "a2l2-i3", front: "The substitution method?", back: "Guess the bound's form and prove it by induction on n (assume for smaller inputs, verify for n)." },
            { id: "a2l2-i4", front: "Common substitution pitfall?", back: "Guessing too weak a bound; carry lower-order terms — the leftover constant reveals whether the guess holds." },
          ],
        },
        {
          id: "a2l3",
          title: "The Master Theorem",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "One theorem for a·T(n/b) + f(n)",
              body: `Let p = log_b(a) — the critical exponent, equal to the total work in the leaves n^p. Compare f(n) to n^p:\n\n**Case 1** (leaves win): f(n) = O(n^(p−ε)) for some ε > 0 ⇒ T(n) = Θ(n^p).\n**Case 2** (balanced): f(n) = Θ(n^p) ⇒ T(n) = Θ(n^p · log n). More generally f = Θ(n^p·log^k n) ⇒ T = Θ(n^p·log^(k+1) n).\n**Case 3** (root wins): f(n) = Ω(n^(p+ε)) for some ε > 0 AND the regularity condition a·f(n/b) ≤ c·f(n) for some c < 1 ⇒ T(n) = Θ(f(n)).`,
            },
            {
              type: "decision",
              heading: "One recurrence per case",
              rows: [
                ["Merge sort: 2T(n/2) + Θ(n)", "p = 1, f = Θ(n¹) → **Case 2** → Θ(n log n)"],
                ["8T(n/2) + Θ(n²)", "p = log₂8 = 3, f = O(n^(3−ε)) → **Case 1** → Θ(n³)"],
                ["2T(n/2) + n²", "p = 1, f = Ω(n^(1+ε)), regularity holds → **Case 3** → Θ(n²)"],
              ],
            },
            {
              type: "callout",
              tone: "warn",
              body: `**When it doesn't apply.** The Master Theorem needs f *polynomially* separated from n^p. For 2T(n/2) + n/log n, p = 1 but f = n/log n sits in the gap — not O(n^(1−ε)), not Θ(n), not Ω(n^(1+ε)). No case fits. (Akra–Bazzi or direct summation gives Θ(n log log n).) The bare three-case version also misses f = n log n → Θ(n log² n), which only the k-extended Case 2 catches.`,
            },
            {
              type: "text",
              heading: "Akra–Bazzi, in one line",
              body: `The generalization Σ aᵢ·T(n/bᵢ) + f(n) is solved by finding the p with Σ aᵢ·bᵢ^(−p) = 1 and integrating f against it. It handles unequal splits and the polynomial-gap cases the Master Theorem cannot.`,
            },
          ],
          reviewItems: [
            { id: "a2l3-i1", front: "Master Theorem: what is p, and what does n^p represent?", back: "p = log_b(a); n^p is the total work in the leaves of the recursion tree." },
            { id: "a2l3-i2", front: "Case 2 condition and result?", back: "f(n) = Θ(n^p) ⇒ T(n) = Θ(n^p · log n)." },
            { id: "a2l3-i3", front: "Case 3's extra requirement beyond f = Ω(n^(p+ε))?", back: "The regularity condition: a·f(n/b) ≤ c·f(n) for some constant c < 1." },
            { id: "a2l3-i4", front: "A recurrence the Master Theorem can't solve?", back: "2T(n/2) + n/log n — f is in the polynomial gap; the answer (Θ(n log log n)) needs Akra–Bazzi." },
            { id: "a2l3-i5", front: "What does Akra–Bazzi add over the Master Theorem?", back: "Unequal subproblem sizes and gap cases, via Σ aᵢ·bᵢ^(−p) = 1 and integration." },
          ],
        },
      ],
      masteryCheck: {
        id: "a2-check",
        questions: [
          { id: "a2q1", type: "numeric", prompt: "T(n) = 8T(n/2) + Θ(n²) solves to Θ(n^c). What is c?", answer: 3, tolerance: 0, explanation: "p = log₂8 = 3; f = n² = O(n^(3−ε)), so Case 1 gives Θ(n³)." },
          { id: "a2q2", type: "numeric", prompt: "T(n) = 3T(n/4) + Θ(n) solves to Θ(n^c) for what integer c?", answer: 1, tolerance: 0, explanation: "p = log₄3 ≈ 0.79; f = n = Ω(n^(p+ε)) with regularity, so Case 3 gives Θ(n), i.e. c = 1." },
          { id: "a2q3", type: "mcq", prompt: "Which recurrence does the basic (three-case) Master Theorem NOT resolve?", options: ["T(n) = 4T(n/2) + n", "T(n) = 2T(n/2) + n", "T(n) = 2T(n/2) + n/log n", "T(n) = T(n/2) + 1"], answer: 2, explanation: "n/log n is in the polynomial gap around n^p = n¹ — not O(n^(1−ε)), Θ(n), or Ω(n^(1+ε)). The others are Cases 1, 2, 2." },
          { id: "a2q4", type: "short", prompt: "Merge sort's recurrence T(n) = 2T(n/2) + Θ(n) solves to Θ(____).", accept: ["n log n", "nlogn", "n log(n)", "n lg n", "nlog n", "n log n "], explanation: "Master Theorem Case 2 (p = 1, f = Θ(n))." },
          {
            id: "a2q5",
            type: "proof",
            points: 3,
            prompt: "Use the recursion-tree method to show that T(n) = 2T(n/2) + cn = Θ(n log n). Assume n is a power of 2.",
            rubric: [
              "Builds the recursion tree: identifies that depth i has 2^i nodes, each of size n/2^i.",
              "Computes the per-node cost c·(n/2^i) and the per-level cost 2^i·(c·n/2^i) = cn.",
              "Counts the levels: log₂ n + 1 (recursing until subproblem size 1).",
              "Sums to cn·(log₂ n + 1) = Θ(n log n).",
            ],
            solution: "At depth i (root at depth 0) there are 2^i subproblems, each of size n/2^i, each contributing non-recursive cost c·(n/2^i). The cost at depth i is therefore 2^i·c·(n/2^i) = cn — the same at every level. The tree has depth log₂ n (sizes n, n/2, …, 1), i.e. log₂ n + 1 levels. Summing over levels, T(n) = Σ from i=0 to log₂ n of cn = cn·(log₂ n + 1) = Θ(n log n). (The 2^(log₂ n) = n leaves cost Θ(1) each, contributing only Θ(n); the dominant term is the equal cn work summed over the log n levels.) ∎",
            explanation: "Per-level cost is constant at cn; multiply by the log₂ n + 1 levels.",
          },
          {
            id: "a2q6",
            type: "proof",
            points: 3,
            prompt: "Prove by the substitution method that T(n) = 2T(n/2) + n is O(n log n). State the inductive hypothesis and verify the inductive step.",
            rubric: [
              "States the guess/inductive hypothesis T(m) ≤ c·m·log₂ m for m < n, and notes a base case.",
              "Substitutes into T(n) = 2T(n/2) + n to obtain ≤ c·n·log₂(n/2) + n.",
              "Simplifies log₂(n/2) = log₂ n − 1 to reach c·n·log₂ n − (c−1)·n.",
              "Concludes ≤ c·n·log₂ n for c ≥ 1, hence T(n) = O(n log n).",
            ],
            solution: "Guess T(n) ≤ c·n·log₂ n for a constant c to be fixed. Inductive hypothesis: the bound holds for all sizes below n, in particular T(n/2) ≤ c·(n/2)·log₂(n/2). Then T(n) = 2·T(n/2) + n ≤ 2·c·(n/2)·log₂(n/2) + n = c·n·(log₂ n − 1) + n = c·n·log₂ n − c·n + n = c·n·log₂ n − (c−1)·n ≤ c·n·log₂ n whenever c ≥ 1. Choosing c large enough that the bound also holds at the base case (say n = 2) completes the induction, so T(n) = O(n log n). ∎",
            explanation: "The −(c−1)n slack from log₂(n/2) absorbs the +n term for any c ≥ 1.",
          },
        ],
      },
    },
    {
      id: "a3",
      title: "Sorting & Selection",
      summary: "Quicksort, heaps, the Ω(n log n) comparison lower bound, and selection in worst-case linear time.",
      prerequisites: ["a2"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a3l1",
          title: "Quicksort",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Partition, then recurse",
              body: `Quicksort picks a **pivot**, partitions the array so smaller elements precede it and larger ones follow (the pivot lands in its final sorted position), then recursively sorts the two sides. Partitioning is Θ(n) and in place; there is no combine step — the work is all in the divide.`,
            },
            {
              type: "example",
              heading: "Best and worst case",
              body: `A balanced split gives T(n) = 2T(n/2) + Θ(n) = Θ(n log n). The worst case — the pivot is always the minimum or maximum (e.g. already-sorted input with a naive first-element pivot) — gives T(n) = T(n−1) + Θ(n) = Θ(n²).`,
            },
            {
              type: "text",
              heading: "Randomization rescues it",
              body: `Choosing the pivot **uniformly at random** makes the expected number of comparisons 2n·ln n + O(n) = Θ(n log n) on *every* input. No adversarial ordering can force the worst case in expectation — the worst case still exists, but now requires unlucky coin flips, not bad input.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `Despite matching merge sort's Θ(n log n), quicksort usually wins in practice: its partition loop is tight and cache-friendly, and being in place it needs no auxiliary array. Constant factors, not asymptotics, decide here.`,
            },
          ],
          reviewItems: [
            { id: "a3l1-i1", front: "Quicksort's structure vs merge sort?", back: "Work is in the partition (divide); no combine. Pivot lands in place, then recurse on both sides." },
            { id: "a3l1-i2", front: "Quicksort best vs worst case?", back: "Balanced splits → Θ(n log n); pivot always extreme → Θ(n²)." },
            { id: "a3l1-i3", front: "Expected time of randomized quicksort, and why it matters?", back: "Θ(n log n) on every input — random pivots stop any input from forcing the worst case in expectation." },
            { id: "a3l1-i4", front: "When does a naive first-element pivot hit Θ(n²)?", back: "On already-sorted or reverse-sorted input — the pivot is always the extreme element." },
          ],
        },
        {
          id: "a3l2",
          title: "Heaps, Heapsort & the Sorting Lower Bound",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Binary heaps",
              body: `A binary heap is a nearly-complete binary tree (stored in an array) with the **max-heap property**: every parent ≥ its children, so the maximum sits at the root. Insert and extract-max are O(log n); BUILD-MAX-HEAP turns an arbitrary array into a heap.`,
            },
            {
              type: "example",
              heading: "Build-heap is linear",
              body: `Sifting down from a node of height h costs O(h), and there are at most n/2^(h+1) nodes of height h. The total is Σ over h of (n/2^(h+1))·O(h) = O(n · Σ h/2^h) = O(n·2) = O(n). So building a heap is Θ(n), not Θ(n log n) — a routinely missed bound.`,
            },
            {
              type: "text",
              heading: "Heapsort, and the wall at n log n",
              body: `Heapsort builds a max-heap (Θ(n)), then repeatedly swaps the root to the end and sifts down the shrinking heap (n times × O(log n)) → Θ(n log n), in place. And no comparison sort can do better: model any such sort as a binary **decision tree** whose leaves are the possible output orderings. There are n! permutations, so ≥ n! leaves; a height-h binary tree has ≤ 2^h leaves; hence 2^h ≥ n!, giving h ≥ log₂(n!) = Θ(n log n).`,
            },
          ],
          reviewItems: [
            { id: "a3l2-i1", front: "Max-heap property and location of the maximum?", back: "Every parent ≥ its children; the maximum is at the root." },
            { id: "a3l2-i2", front: "Cost of BUILD-MAX-HEAP and the key idea?", back: "Θ(n): Σ over heights of (n/2^(h+1))·O(h) = O(n·Σ h/2^h) = O(n)." },
            { id: "a3l2-i3", front: "Heapsort's time and extra space?", back: "Θ(n log n), in place (Θ(1) extra space)." },
            { id: "a3l2-i4", front: "Decision-tree lower-bound argument?", back: "≥ n! leaves but ≤ 2^h for height h ⇒ h ≥ log(n!) = Ω(n log n)." },
            { id: "a3l2-i5", front: "Does the Ω(n log n) bound apply to all sorts?", back: "Only comparison sorts; counting/radix sort bypass it by not comparing keys." },
          ],
        },
        {
          id: "a3l3",
          title: "Selection in Linear Time",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Selection is easier than sorting",
              body: `Finding the k-th smallest element needn't sort. **Quickselect** is quicksort that recurses into only the side containing the answer: expected T(n) = T(≈n/2) + Θ(n) = Θ(n) (a decaying geometric series), worst case Θ(n²).`,
            },
            {
              type: "example",
              heading: "Median of medians (worst-case linear)",
              body: `Pick the pivot deterministically: split into groups of 5, take each group's median, then recursively select the median of those medians. This pivot guarantees a constant-fraction split, giving T(n) ≤ T(n/5) + T(7n/10) + Θ(n). Since 1/5 + 7/10 = 9/10 < 1, the recurrence solves to Θ(n) — worst-case linear selection (BFPRT).`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Why 9/10 < 1 is the whole trick.** A recurrence T(n) ≤ T(αn) + T(βn) + Θ(n) with α + β < 1 solves to Θ(n): the work shrinks geometrically down the tree. At α + β = 1 you get Θ(n log n); above 1, worse. Median-of-medians is engineered precisely to keep the sum below 1.`,
            },
          ],
          reviewItems: [
            { id: "a3l3-i1", front: "What does quickselect exploit over quicksort?", back: "It recurses into only the one side holding the k-th element → expected Θ(n)." },
            { id: "a3l3-i2", front: "Quickselect expected vs worst case?", back: "Expected Θ(n); worst Θ(n²)." },
            { id: "a3l3-i3", front: "How does median-of-medians reach worst-case Θ(n)?", back: "A deterministic median-of-group-of-5-medians pivot forces a constant-fraction split: T(n) ≤ T(n/5) + T(7n/10) + Θ(n)." },
            { id: "a3l3-i4", front: "Why does T(n) ≤ T(αn) + T(βn) + Θ(n) give Θ(n)?", back: "When α + β < 1 the per-level work shrinks geometrically, summing to Θ(n)." },
          ],
        },
      ],
      masteryCheck: {
        id: "a3-check",
        questions: [
          { id: "a3q1", type: "numeric", prompt: "The worst-case comparison lower bound to sort n elements is ⌈log₂(n!)⌉. For n = 4, compute it.", answer: 5, tolerance: 0, explanation: "4! = 24, log₂24 ≈ 4.585, so ⌈log₂(24)⌉ = 5." },
          { id: "a3q2", type: "mcq", prompt: "BUILD-MAX-HEAP on n elements runs in:", options: ["Θ(n)", "Θ(n log n)", "Θ(log n)", "Θ(n²)"], answer: 0, explanation: "Summing O(h) work over the ≤ n/2^(h+1) nodes of each height gives O(n·Σ h/2^h) = O(n)." },
          { id: "a3q3", type: "short", prompt: "Randomized quicksort's expected running time is Θ(____).", accept: ["n log n", "nlogn", "n log(n)", "n lg n", "nlog n"], explanation: "Expected comparisons 2n·ln n + O(n) = Θ(n log n)." },
          { id: "a3q4", type: "numeric", prompt: "For n = 8, the comparison lower bound ⌈log₂(8!)⌉ equals what? (8! = 40320)", answer: 16, tolerance: 0, explanation: "log₂(40320) ≈ 15.30, so ⌈·⌉ = 16." },
          {
            id: "a3q5",
            type: "proof",
            points: 3,
            prompt: "Prove the Ω(n log n) lower bound on the worst-case number of comparisons for any comparison-based sorting algorithm, using the decision-tree model.",
            rubric: [
              "Models any comparison sort as a binary decision tree (internal node = a comparison, leaf = an output permutation).",
              "Argues there must be ≥ n! reachable leaves — one for each distinct permutation the algorithm must be able to output.",
              "Uses that a binary tree of height h has ≤ 2^h leaves, hence 2^h ≥ n!.",
              "Concludes h ≥ log₂(n!) = Ω(n log n) (e.g. by Stirling) and identifies h with the worst-case comparison count.",
            ],
            solution: "Any algorithm that orders elements only through pairwise comparisons corresponds to a binary decision tree: each internal node is a comparison with two outcomes, and each leaf is labelled with the permutation output along that root-to-leaf path. To be correct, the algorithm must produce a different permutation for each of the n! possible input orderings, so the tree has at least n! reachable leaves. A binary tree of height h has at most 2^h leaves, so 2^h ≥ n!, giving h ≥ log₂(n!). By Stirling, log₂(n!) = n·log₂ n − Θ(n) = Θ(n log n). Since the worst-case number of comparisons equals the height of the tree (the longest root-to-leaf path), every comparison sort makes Ω(n log n) comparisons in the worst case. ∎",
            explanation: "n! leaves into a binary tree forces height ≥ log(n!) = Θ(n log n).",
          },
          {
            id: "a3q6",
            type: "proof",
            points: 3,
            prompt: "Prove that BUILD-MAX-HEAP runs in O(n) time, not O(n log n). (Hint: bound the number of nodes at each height and sum the sift-down work.)",
            rubric: [
              "Bounds the number of nodes of height h by ≤ n/2^(h+1) (or ⌈n/2^(h+1)⌉).",
              "States that sift-down (heapify) from a node of height h costs O(h).",
              "Forms the total Σ over h of (n/2^(h+1))·O(h) and factors out n.",
              "Uses Σ over h≥0 of h/2^h = 2 to conclude the total is O(n).",
            ],
            solution: "A heap of n elements has at most ⌈n/2^(h+1)⌉ nodes of height h. BUILD-MAX-HEAP runs sift-down on every node, and sift-down from a node of height h does O(h) work. The total cost is therefore Σ from h=0 to ⌊log₂ n⌋ of ⌈n/2^(h+1)⌉·O(h) = O(n · Σ from h=0 to ∞ of h/2^h). The series Σ h/2^h converges to 2 (it equals x/(1−x)² evaluated at x = 1/2). Hence the total work is O(n·2) = O(n). ∎",
            explanation: "Most nodes are near the leaves (cheap height), so the height-weighted sum is O(n), not O(n log n).",
          },
        ],
      },
    },
    {
      id: "a4",
      title: "Hashing & Hash Tables",
      summary: "Chaining, open addressing, and the expectations that make hashing O(1) — plus universal and perfect hashing.",
      prerequisites: ["a3"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a4l1",
          title: "Hash Tables & Chaining",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "From direct addressing to hashing",
              body: `Direct addressing — one slot per possible key — is O(1) but needs a slot for the entire key universe. A **hash function** h maps that universe into m slots, storing only the keys present, trading a guarantee for *expected* O(1). Distinct keys mapping to the same slot **collide**, and by pigeonhole collisions are unavoidable once the universe exceeds m.`,
            },
            {
              type: "text",
              heading: "Chaining and the load factor",
              body: `Each slot holds a linked list of its keys. Insert is O(1); search and delete scan the list. The **load factor** is α = n/m (keys per slot). Under **simple uniform hashing** — each key equally likely to hit any slot, independently — the expected list length is α, so search costs Θ(1 + α). Resize to keep α = O(1) and operations stay expected O(1).`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Expected, not worst case.** With chaining the worst case is Θ(n) — every key in one slot. The O(1) is an average over the hashing randomness (or the input distribution). A *worst-case* O(1) guarantee requires perfect hashing (lesson 3).`,
            },
          ],
          reviewItems: [
            { id: "a4l1-i1", front: "What is a collision, and why are collisions unavoidable?", back: "Two distinct keys hashing to the same slot; unavoidable because the universe exceeds m slots (pigeonhole)." },
            { id: "a4l1-i2", front: "Load factor α and expected chained-search cost?", back: "α = n/m; expected search is Θ(1 + α) under simple uniform hashing." },
            { id: "a4l1-i3", front: "How do you keep chained operations expected O(1)?", back: "Resize the table to keep α = O(1)." },
            { id: "a4l1-i4", front: "Worst-case cost of a chained hash table?", back: "Θ(n) — all keys in one slot; the O(1) is only expected." },
          ],
        },
        {
          id: "a4l2",
          title: "Open Addressing",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Store keys in the table itself",
              body: `Open addressing keeps every key in the array — no lists. On collision it **probes** a sequence of slots until an empty one is found: linear probing h(k,i) = (h(k) + i) mod m, quadratic probing, or double hashing h(k,i) = (h₁(k) + i·h₂(k)) mod m. Necessarily α < 1.`,
            },
            {
              type: "example",
              heading: "Expected probes blow up near α = 1",
              body: `Under uniform hashing (every probe sequence equally likely), an **unsuccessful** search examines at most 1/(1−α) slots in expectation. At α = 0.5 that is 2 probes; at α = 0.9 it is 10. Cost grows without bound as the table fills — keep α safely below 1.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Clustering.** Linear probing suffers *primary clustering*: occupied runs coalesce, so probe sequences grow faster than the 1/(1−α) ideal. Double hashing scatters the probes and behaves much closer to uniform.`,
            },
          ],
          reviewItems: [
            { id: "a4l2-i1", front: "Open addressing vs chaining — where do colliding keys go?", back: "Into other slots of the same array, located by probing a sequence; no external lists (so α < 1)." },
            { id: "a4l2-i2", front: "Expected probes for an unsuccessful search under uniform hashing?", back: "At most 1/(1−α)." },
            { id: "a4l2-i3", front: "Expected probes at α = 0.5 vs α = 0.9?", back: "2 vs 10 — cost blows up as α → 1." },
            { id: "a4l2-i4", front: "What is primary clustering, and what mitigates it?", back: "Long runs of occupied slots under linear probing; double hashing mitigates it." },
          ],
        },
        {
          id: "a4l3",
          title: "Universal & Perfect Hashing; Resizing",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Defeating adversarial inputs",
              body: `For any *fixed* hash function, an adversary can choose keys that all collide (Θ(n) per operation). A **universal family** H is a set of hash functions such that for any distinct x, y, Pr over random h∈H of h(x) = h(y) is at most 1/m. Drawing h at random from H gives expected O(1) on *any* fixed input — no adversary can force collisions without seeing the random choice.`,
            },
            {
              type: "text",
              heading: "Perfect hashing",
              body: `For a *static* set, a two-level scheme — universal hash into m = n slots, then a collision-free second-level table of size nᵢ² for the nᵢ keys in slot i — gives **worst-case O(1)** lookup in O(n) expected space. The squared second level is collision-free with constant probability, and the squares still sum to O(n).`,
            },
            {
              type: "example",
              heading: "Table doubling → O(1) amortized",
              body: `When α exceeds a threshold, allocate a table of double the size and rehash everything (Θ(n)). Although one insertion can cost Θ(n), n insertions cost O(n) in total — the doubling series n + n/2 + n/4 + … = O(n) — so insertion is **O(1) amortized**. A first taste of amortized analysis.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Three guarantees, three tools.** Expected O(1) on average input → chaining / open addressing. Expected O(1) on *any* input → universal hashing. Worst-case O(1) on a static set → perfect hashing.`,
            },
          ],
          reviewItems: [
            { id: "a4l3-i1", front: "Definition of a universal hash family?", back: "For any distinct x, y: Pr over random h∈H of h(x)=h(y) ≤ 1/m." },
            { id: "a4l3-i2", front: "What does universal hashing solve that a fixed h cannot?", back: "Adversarial inputs — a random h gives expected O(1) on any fixed input." },
            { id: "a4l3-i3", front: "What does perfect hashing guarantee, and for what set?", back: "Worst-case O(1) lookup for a static set, in O(n) space (two-level scheme)." },
            { id: "a4l3-i4", front: "Why is table doubling O(1) amortized despite Θ(n) rehashes?", back: "n insertions cost O(n) total (the geometric doubling series), so O(1) per insertion amortized." },
            { id: "a4l3-i5", front: "Tool for worst-case O(1) on a static set?", back: "Perfect hashing — universal first level plus collision-free squared second level." },
          ],
        },
      ],
      masteryCheck: {
        id: "a4-check",
        questions: [
          { id: "a4q1", type: "numeric", prompt: "Open addressing with uniform hashing at load factor α = 0.75. The expected number of probes for an unsuccessful search is at most 1/(1−α). Compute it.", answer: 4, tolerance: 0.01, explanation: "1/(1 − 0.75) = 1/0.25 = 4." },
          { id: "a4q2", type: "mcq", prompt: "Under simple uniform hashing with chaining, the expected search time is:", options: ["Θ(1 + α)", "Θ(α)", "Θ(n)", "Θ(log n)"], answer: 0, explanation: "O(1) to hash plus an expected chain length of α." },
          { id: "a4q3", type: "short", prompt: "A hash family is universal if, for distinct keys x, y, Pr[h(x) = h(y)] ≤ ____ (in terms of table size m).", accept: ["1/m", "1 / m", "1÷m"], explanation: "That bound is the defining property of a universal family." },
          { id: "a4q4", type: "mcq", prompt: "Table doubling gives O(1) amortized insertion because:", options: ["the total cost of n insertions is O(n)", "rehashing is free", "doubling happens only once", "the lists always stay short"], answer: 0, explanation: "Total work n + n/2 + n/4 + … = O(n), so O(1) per insertion amortized." },
          {
            id: "a4q5",
            type: "proof",
            points: 3,
            prompt: "Prove that, under simple uniform hashing, the expected number of keys examined in an unsuccessful search of a chained hash table with n keys and m slots is α = n/m.",
            rubric: [
              "Defines indicator variables Xᵢ = 1[key i hashes to the searched slot h(k)].",
              "Uses simple uniform hashing to get E[Xᵢ] = 1/m.",
              "Applies linearity of expectation to E[Σ Xᵢ] = n/m = α.",
              "Concludes the expected examined length is α (so the search costs Θ(1 + α)).",
            ],
            solution: "Search for an absent key k; the chain examined is the list at slot h(k). For each stored key i (i = 1..n), let Xᵢ = 1 if key i hashes to slot h(k) and 0 otherwise. Under simple uniform hashing, key i is equally likely to land in any of the m slots, independently, so E[Xᵢ] = Pr[h(keyᵢ) = h(k)] = 1/m. The length of the examined chain is Σ from i=1 to n of Xᵢ, and by linearity of expectation E[Σ Xᵢ] = Σ E[Xᵢ] = n·(1/m) = n/m = α. Adding O(1) to compute h(k), the expected cost of the unsuccessful search is Θ(1 + α). ∎",
            explanation: "Linearity of expectation over per-key indicators each with mean 1/m.",
          },
          {
            id: "a4q6",
            type: "proof",
            points: 3,
            prompt: "Let H be a universal family of hash functions into {0,…,m−1}. Insert n keys into a chained table using a random h ∈ H. Prove that for any fixed key x, the expected number of other keys that collide with x (land in x's slot) is less than α = n/m — with no assumption that the keys are uniformly distributed.",
            rubric: [
              "For each other key y, defines a collision indicator and bounds its expectation via universality: Pr[h(y) = h(x)] ≤ 1/m.",
              "Sums over the n − 1 other keys using linearity of expectation.",
              "Reaches E[collisions] ≤ (n − 1)/m < n/m = α.",
              "Notes the bound holds for ANY fixed input set — universality replaces the uniformity assumption of SUHA.",
            ],
            solution: "Fix any key x and any set of n keys, and choose h uniformly at random from the universal family H. For each key y ≠ x, let C_y = 1[h(y) = h(x)]. By the universal property, E[C_y] = Pr[h(y) = h(x)] ≤ 1/m. The number of keys colliding with x is C = Σ over y ≠ x of C_y, so by linearity of expectation E[C] = Σ E[C_y] ≤ (n − 1)·(1/m) = (n − 1)/m < n/m = α. The only fact used is the universality of H; nothing assumes the keys are uniformly distributed, so the bound holds for every fixed input — an adversary who fixes the keys still cannot force more than α expected collisions without knowing the random choice of h. ∎",
            explanation: "Universality gives each pair collision probability ≤ 1/m; sum over the n−1 other keys.",
          },
        ],
      },
    },
    {
      id: "a5",
      title: "Binary Search Trees & Balance",
      summary: "Why BST operations are O(height), how AVL and red-black trees force height O(log n), and how to prove it.",
      prerequisites: ["a4"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a5l1",
          title: "BSTs and the Height Problem",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "The BST property",
              body: `For every node, all keys in its left subtree are smaller and all in its right subtree are larger. Search, insert, min, max, and successor each walk a single root-to-leaf path, so they run in O(h) where h is the tree's height. **Delete** is the subtle case: a node with two children is replaced by its in-order successor (the minimum of its right subtree), which preserves the property.`,
            },
            {
              type: "example",
              heading: "Inorder traversal sorts",
              body: `Recursively visit the left subtree, then the node, then the right subtree: this emits the keys in increasing order in Θ(n). A BST is effectively a sorted structure that also supports fast search and dynamic insert/delete.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Height is the whole story — and it can be Θ(n).** Every operation is O(h), so a balanced tree (h = Θ(log n)) gives O(log n), but a *degenerate* one gives O(n). Inserting 1, 2, 3, …, n in order builds a right-leaning chain of height n − 1 — a glorified linked list. Plain BSTs offer no height guarantee.`,
            },
          ],
          reviewItems: [
            { id: "a5l1-i1", front: "The BST property?", back: "For every node, all left-subtree keys < the node's key < all right-subtree keys." },
            { id: "a5l1-i2", front: "Why are BST operations O(h)?", back: "Search/insert/delete/min/max each follow a single root-to-leaf path of length ≤ h." },
            { id: "a5l1-i3", front: "What does an inorder traversal of a BST produce, in what time?", back: "The keys in sorted (increasing) order, in Θ(n)." },
            { id: "a5l1-i4", front: "Worst-case height of an unbalanced BST, and how it arises?", back: "Θ(n) — e.g. inserting already-sorted keys builds a chain; operations degrade to O(n)." },
          ],
        },
        {
          id: "a5l2",
          title: "Self-Balancing: AVL Trees",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Enforce balance, keep O(log n)",
              body: `An **AVL tree** maintains, at every node, |height(left) − height(right)| ≤ 1 (the balance factor). This invariant forces the height to O(log n), so every operation stays O(log n). When an insertion breaks balance at some node, a **rotation** restores it.`,
            },
            {
              type: "example",
              heading: "Rotations restore the invariant",
              body: `A left-left imbalance is fixed by a single right rotation; a left-right imbalance needs a double rotation (left then right). Each rotation is O(1) pointer surgery that preserves the BST property, and at most O(log n) of them — one per level along the insertion path — re-balance the tree.`,
            },
            {
              type: "text",
              heading: "Why the invariant bounds the height",
              body: `Let N(h) be the *fewest* nodes in an AVL tree of height h. The sparsest height-h tree has subtrees of heights h−1 and h−2 (the maximum allowed difference), so N(h) = 1 + N(h−1) + N(h−2). This is Fibonacci-like, and N(h) ≥ φ^h with φ = (1+√5)/2. Hence n ≥ φ^h, so h ≤ log_φ n ≈ 1.44·log₂ n = O(log n).`,
            },
          ],
          reviewItems: [
            { id: "a5l2-i1", front: "The AVL balance invariant?", back: "At every node, |height(left) − height(right)| ≤ 1." },
            { id: "a5l2-i2", front: "What restores balance after an AVL insertion, at what cost?", back: "Rotations (single or double), O(1) each, at most O(log n) along the path." },
            { id: "a5l2-i3", front: "Recurrence for the minimum nodes N(h) in an AVL tree of height h?", back: "N(h) = 1 + N(h−1) + N(h−2) — Fibonacci-like, so N(h) ≥ φ^h." },
            { id: "a5l2-i4", front: "Why is AVL height O(log n)?", back: "n ≥ N(h) ≥ φ^h ⇒ h ≤ log_φ n ≈ 1.44·log₂ n." },
          ],
        },
        {
          id: "a5l3",
          title: "Red-Black Trees & Augmentation",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "A looser, cheaper balance",
              body: `A **red-black tree** colors nodes red or black under five rules; the load-bearing ones: the root and the nil-leaves are black, a red node has black children, and **every root-to-leaf path has the same number of black nodes** (the black-height). Together these force the longest path to be at most twice the shortest, so h = O(log n) — with cheaper rebalancing than AVL (fewer rotations per update), which is why they back most library maps.`,
            },
            {
              type: "example",
              heading: "The height bound",
              body: `Let bh(x) be the black-height of node x. By induction the subtree at x holds at least 2^(bh(x)) − 1 internal nodes. Since at least half the nodes on any root-to-leaf path are black, bh(root) ≥ h/2. Combining: n ≥ 2^(h/2) − 1, hence h ≤ 2·log₂(n + 1) = O(log n).`,
            },
            {
              type: "text",
              heading: "Augmented trees",
              body: `Storing extra data per node — kept correct under rotation — buys new queries for free. A subtree-size field turns a balanced BST into an **order-statistics tree** answering "k-th smallest" and "rank of x" in O(log n). The discipline: each augmentation must be computable from a node plus its two children's fields, so a rotation restores it in O(1).`,
            },
          ],
          reviewItems: [
            { id: "a5l3-i1", front: "The red-black invariants that bound height?", back: "Red nodes have black children, and every root-to-leaf path has equal black-height (root and nil-leaves black)." },
            { id: "a5l3-i2", front: "Why is a red-black tree's height O(log n)?", back: "Subtree at x has ≥ 2^(bh(x)) − 1 nodes and bh(root) ≥ h/2 ⇒ n ≥ 2^(h/2) − 1 ⇒ h ≤ 2·log₂(n+1)." },
            { id: "a5l3-i3", front: "Red-black vs AVL tradeoff?", back: "RB allows looser balance (h ≤ 2 log) with cheaper updates (fewer rotations); AVL is more rigidly balanced, slightly faster lookups." },
            { id: "a5l3-i4", front: "What is an order-statistics tree?", back: "A balanced BST augmented with subtree sizes, giving k-th-smallest and rank queries in O(log n)." },
            { id: "a5l3-i5", front: "Rule for a valid tree augmentation?", back: "Each node's extra field must be computable from the node plus its children's fields, so rotations restore it in O(1)." },
          ],
        },
      ],
      masteryCheck: {
        id: "a5-check",
        questions: [
          { id: "a5q1", type: "numeric", prompt: "Insert 1, 2, …, n into an empty BST in increasing order. For n = 7, what is the resulting tree's height (number of edges on the longest root-to-leaf path)?", answer: 6, tolerance: 0, explanation: "The tree degenerates to a right-leaning chain of 7 nodes, height n − 1 = 6 edges." },
          { id: "a5q2", type: "mcq", prompt: "An AVL tree with n nodes has height:", options: ["Θ(log n)", "Θ(n)", "Θ(√n)", "Θ(n log n)"], answer: 0, explanation: "The balance invariant forces N(h) ≥ φ^h, so h = O(log n)." },
          { id: "a5q3", type: "short", prompt: "An inorder traversal of a binary search tree visits the keys in ____ order.", accept: ["sorted", "increasing", "ascending", "sorted ascending", "non-decreasing"], explanation: "Left, node, right yields keys in increasing order." },
          { id: "a5q4", type: "numeric", prompt: "A red-black tree's height satisfies h ≤ 2·log₂(n + 1). For n = 15, what is this upper bound on h?", answer: 8, tolerance: 0.01, explanation: "log₂(16) = 4, so 2·4 = 8." },
          {
            id: "a5q5",
            type: "proof",
            points: 3,
            prompt: "Prove that an AVL tree with n nodes has height O(log n). (Hint: lower-bound N(h), the minimum number of nodes in an AVL tree of height h.)",
            rubric: [
              "Defines N(h) = minimum nodes in an AVL tree of height h, with base values N(0) = 1, N(1) = 2.",
              "Derives N(h) = 1 + N(h−1) + N(h−2) from the balance invariant (the sparsest height-h tree uses subtrees of heights h−1 and h−2).",
              "Shows N(h) grows at least geometrically: N(h) ≥ φ^h with φ = (1+√5)/2.",
              "Concludes from n ≥ N(h) ≥ φ^h that h ≤ log_φ n = O(log n).",
            ],
            solution: "Let N(h) be the fewest nodes in any AVL tree of height h; N(0) = 1 and N(1) = 2. A height-h AVL tree has two subtrees whose heights differ by at most 1; the sparsest such tree has one subtree of height h−1 and the other of height h−2 (a larger difference violates the invariant, a smaller one wastes nodes), so N(h) = 1 + N(h−1) + N(h−2). This dominates the Fibonacci recurrence, and an easy induction gives N(h) ≥ φ^h where φ = (1+√5)/2 (using φ² = φ + 1). Therefore any AVL tree with n nodes and height h satisfies n ≥ N(h) ≥ φ^h, so h ≤ log_φ n = (1/log₂ φ)·log₂ n ≈ 1.44·log₂ n = O(log n). ∎",
            explanation: "The Fibonacci-like node count grows like φ^h, so height is logarithmic in n.",
          },
          {
            id: "a5q6",
            type: "proof",
            points: 3,
            prompt: "Prove that a red-black tree with n internal nodes has height at most 2·log₂(n + 1). You may use, without proof: (i) the subtree rooted at any node x contains at least 2^(bh(x)) − 1 internal nodes, and (ii) bh(root) ≥ h/2.",
            rubric: [
              "Applies lemma (i) at the root to get n ≥ 2^(bh(root)) − 1.",
              "Applies lemma (ii): bh(root) ≥ h/2.",
              "Combines them into n ≥ 2^(h/2) − 1, i.e. 2^(h/2) ≤ n + 1.",
              "Takes log₂ and rearranges to h ≤ 2·log₂(n + 1).",
            ],
            solution: "Let h be the height and bh(root) the black-height of the root. By lemma (i) applied to the root, the whole tree has at least 2^(bh(root)) − 1 internal nodes, so n ≥ 2^(bh(root)) − 1. By lemma (ii), bh(root) ≥ h/2. Substituting, n ≥ 2^(h/2) − 1, hence 2^(h/2) ≤ n + 1. Taking log₂ of both sides gives h/2 ≤ log₂(n + 1), so h ≤ 2·log₂(n + 1) = O(log n). ∎",
            explanation: "Chain the two lemmas: node count ≥ 2^(bh) − 1 and bh ≥ h/2 give 2^(h/2) ≤ n+1.",
          },
        ],
      },
    },
    {
      id: "a6",
      title: "Graph Representation & Traversal",
      summary: "Represent graphs, and explore them with BFS and DFS — distances, topological order, and cycle detection.",
      prerequisites: ["a5"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a6l1",
          title: "Representations",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Two ways to store a graph",
              body: `An **adjacency list** stores, per vertex, the list of its neighbours: space Θ(V + E), ideal for sparse graphs, and you iterate a vertex's edges in O(deg). An **adjacency matrix** is a V×V table with a 1 at (u,v) for each edge: space Θ(V²), O(1) edge-existence queries, good for dense graphs. The choice drives every traversal's running time.`,
            },
            {
              type: "text",
              heading: "Degree identities",
              body: `In an **undirected** graph, every edge contributes to two vertices' degrees, so Σ over v of deg(v) = 2·|E| (the handshake lemma). In a **directed** graph, every edge has one tail and one head, so Σ in-deg(v) = Σ out-deg(v) = |E|. These counting facts underlie most traversal analyses.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Sparse vs dense decides the structure.** With E = Θ(V) (sparse), the adjacency list's Θ(V + E) traversals win decisively over Θ(V²). With E = Θ(V²) (dense), the matrix's O(1) queries and cache-friendly layout pay off. Default to adjacency lists unless the graph is dense or you need O(1) edge tests.`,
            },
          ],
          reviewItems: [
            { id: "a6l1-i1", front: "Adjacency list vs matrix — space?", back: "List: Θ(V + E), great for sparse. Matrix: Θ(V²), O(1) edge queries, great for dense." },
            { id: "a6l1-i2", front: "Handshake lemma (undirected)?", back: "Σ over v of deg(v) = 2·|E| — each edge contributes to two vertices' degrees." },
            { id: "a6l1-i3", front: "Directed-graph degree identity?", back: "Σ in-degree = Σ out-degree = |E|." },
            { id: "a6l1-i4", front: "When does the adjacency matrix pay off?", back: "Dense graphs (E = Θ(V²)) or when O(1) edge-existence tests are needed." },
          ],
        },
        {
          id: "a6l2",
          title: "Breadth-First Search",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Explore in layers",
              body: `BFS from a source s visits vertices in order of their distance from s, using a **queue**. It computes d[v], the shortest-path distance *in number of edges* from s to v, and a BFS tree of shortest paths. Each vertex is enqueued once and each edge examined once (twice in an undirected graph), so BFS runs in **Θ(V + E)** with an adjacency list.`,
            },
            {
              type: "code",
              heading: "BFS",
              lang: "text",
              code: "BFS(G, s):\n  for each v: d[v] = ∞\n  d[s] = 0;  Q = queue with s\n  while Q not empty:\n    u = dequeue(Q)\n    for each neighbour v of u:\n      if d[v] == ∞:        # first time seen\n        d[v] = d[u] + 1\n        enqueue(Q, v)",
            },
            {
              type: "text",
              heading: "What BFS gives you",
              body: `Because the queue processes vertices in nondecreasing distance, the first time BFS reaches v it does so along a shortest path — so d[v] = δ(s, v), the unweighted shortest distance. BFS therefore solves single-source shortest paths on *unweighted* graphs, finds connected components, and detects bipartiteness (2-colour by layer parity).`,
            },
          ],
          reviewItems: [
            { id: "a6l2-i1", front: "What does BFS compute, and with what data structure?", back: "Shortest-path distances in edges (d[v] = δ(s,v)) and a BFS tree, using a FIFO queue." },
            { id: "a6l2-i2", front: "BFS running time with an adjacency list?", back: "Θ(V + E): each vertex enqueued once, each edge scanned once (twice if undirected)." },
            { id: "a6l2-i3", front: "Why does BFS find shortest unweighted paths?", back: "The queue processes vertices in nondecreasing distance, so v is first reached along a shortest path." },
            { id: "a6l2-i4", front: "Two other things BFS gives for free?", back: "Connected components and a bipartiteness test (2-colour by layer parity)." },
          ],
        },
        {
          id: "a6l3",
          title: "Depth-First Search & Its Applications",
          estMinutes: 17,
          content: [
            {
              type: "text",
              heading: "Go deep, then backtrack",
              body: `DFS explores as far as possible before backtracking, via recursion (or an explicit stack). It stamps each vertex with a **discovery** time and a **finish** time. The parenthesis structure of these intervals (one is nested in another, or they are disjoint — never overlapping) classifies every edge as a tree, back, forward, or cross edge. DFS also runs in **Θ(V + E)**.`,
            },
            {
              type: "text",
              heading: "Topological sort",
              body: `For a DAG, listing vertices in order of **decreasing finish time** yields a **topological order** — every edge points from earlier to later. This is the canonical way to schedule tasks with dependencies, and it runs in Θ(V + E). A directed graph has a topological order if and only if it is acyclic.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Cycle detection = back edges.** A directed graph contains a cycle if and only if a DFS produces a **back edge** (an edge to an ancestor still on the recursion stack). This is the practical cycle test, and the engine behind detecting dependency cycles. (Strongly connected components fall out of two DFS passes — Kosaraju's algorithm.)`,
            },
          ],
          reviewItems: [
            { id: "a6l3-i1", front: "What does DFS stamp on each vertex, and what does it run in?", back: "Discovery and finish times; Θ(V + E)." },
            { id: "a6l3-i2", front: "How do you topologically sort a DAG with DFS?", back: "List vertices in decreasing finish time — every edge then points forward." },
            { id: "a6l3-i3", front: "When does a directed graph have a topological order?", back: "Exactly when it is acyclic (a DAG)." },
            { id: "a6l3-i4", front: "DFS test for a directed cycle?", back: "A cycle exists iff DFS finds a back edge (an edge to an ancestor still on the stack)." },
          ],
        },
      ],
      masteryCheck: {
        id: "a6-check",
        questions: [
          { id: "a6q1", type: "numeric", prompt: "An undirected graph has vertex degrees summing to 30. How many edges does it have?", answer: 15, tolerance: 0, explanation: "By the handshake lemma Σ deg = 2|E|, so |E| = 30/2 = 15." },
          { id: "a6q2", type: "mcq", prompt: "BFS from a source s computes:", options: ["shortest-path distances (in edges) from s", "DFS finish times", "a minimum spanning tree", "a topological order"], answer: 0, explanation: "The queue processes vertices in nondecreasing distance, so d[v] = δ(s,v)." },
          { id: "a6q3", type: "short", prompt: "A directed graph has a topological ordering if and only if it is a ____.", accept: ["DAG", "dag", "directed acyclic graph", "acyclic graph", "acyclic"], explanation: "Topological order exists exactly for directed acyclic graphs." },
          { id: "a6q4", type: "numeric", prompt: "A complete undirected graph on n = 7 vertices has how many edges?", answer: 21, tolerance: 0, explanation: "C(7,2) = 7·6/2 = 21." },
          {
            id: "a6q5",
            type: "proof",
            points: 3,
            prompt: "Prove that every finite directed acyclic graph (DAG) has a vertex with in-degree 0 (a source), and use this to prove by induction that every DAG has a topological ordering.",
            rubric: [
              "Source existence: argues that if every vertex had an incoming edge, following edges backward in a finite graph forces a repeated vertex, hence a cycle — contradicting acyclicity.",
              "Sets up induction on |V| with a correct base case (|V| = 1).",
              "Inductive step: removes a source v (placing it first), notes G − v is still a DAG, and applies the hypothesis to order it.",
              "Argues the result is a valid topological order — v has in-degree 0 so no edge points back to it; all its edges go to later vertices.",
            ],
            solution: "Source existence: suppose, for contradiction, every vertex has in-degree ≥ 1. Pick any vertex and repeatedly walk backward along an incoming edge; since every vertex has a predecessor this never halts, but the graph is finite, so some vertex must repeat — the walk between repeats is a directed cycle, contradicting acyclicity. Hence a source v (in-degree 0) exists. Topological order, by induction on |V|: if |V| = 1 the single vertex is its own order. Otherwise let v be a source; G − v is still acyclic and has fewer vertices, so by the inductive hypothesis it has a topological order. Prepend v. Since v has in-degree 0, no edge points into v, and every edge out of v goes to a vertex placed after it; all other edges are correctly ordered by the hypothesis. So the full list is a topological order. ∎",
            explanation: "Finiteness forces a source; remove it, recurse, and prepend it.",
          },
          {
            id: "a6q6",
            type: "proof",
            points: 3,
            prompt: "Prove that a depth-first search of a directed graph G produces a back edge if and only if G contains a directed cycle.",
            rubric: [
              "(⇐) From a back edge (u,v): notes v is an ancestor of u, so the tree path v ⇝ u plus the edge (u,v) forms a cycle.",
              "(⇒) Given a cycle, identifies the first vertex v of the cycle discovered by DFS and the cycle edge (u,v) entering it.",
              "Applies the white-path theorem (at v's discovery, the rest of the cycle is white and reachable from v), so u becomes a descendant of v.",
              "Concludes that when (u,v) is explored, v is an ancestor of u (still on the stack), so (u,v) is a back edge.",
            ],
            solution: "(⇐) If DFS classifies (u,v) as a back edge, then v is an ancestor of u in the DFS forest, so there is a tree path v ⇝ u; together with the edge (u,v) this is a directed cycle. (⇒) Suppose G has a directed cycle C. Among the vertices of C, let v be the one DFS discovers first, and let (u,v) be the edge of C entering v. At the moment v is discovered, every other vertex of C is still white and reachable from v along the white path that runs around C from v to u. By the white-path theorem, u becomes a descendant of v in the DFS tree. Therefore, when the edge (u,v) is later explored, v is an ancestor of u and v is still on the recursion stack (gray), which is exactly the definition of a back edge. ∎",
            explanation: "Back edge ⇔ ancestor relationship ⇔ a cycle; the white-path theorem supplies the descendant direction.",
          },
        ],
      },
    },
    {
      id: "a7",
      title: "Shortest Paths",
      summary: "Relaxation, Dijkstra for non-negative weights, Bellman-Ford for negative edges, and DAG shortest paths.",
      prerequisites: ["a6"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a7l1",
          title: "Relaxation & Optimal Substructure",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Every algorithm is relaxation",
              body: `Maintain an estimate d[v] ≥ δ(s, v) of the shortest distance, initialized to ∞ (0 at s). **Relaxing** an edge (u, v) asks: is going through u better? If d[u] + w(u, v) < d[v], update d[v]. Every shortest-path algorithm is a different *order* of relaxations; correctness is about doing enough of them in the right order.`,
            },
            {
              type: "text",
              heading: "Optimal substructure",
              body: `Shortest paths have **optimal substructure**: any subpath of a shortest path is itself a shortest path. This is what makes the problem tractable — and it fails when there is a **negative-weight cycle** reachable from s, where you can loop to drive cost to −∞, so shortest paths become undefined.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The triangle inequality** δ(s, v) ≤ δ(s, u) + w(u, v) holds for shortest distances, and relaxation is exactly the operation that enforces it. An estimate that satisfies all edge constraints d[v] ≤ d[u] + w(u,v) and equals δ at s is correct.`,
            },
          ],
          reviewItems: [
            { id: "a7l1-i1", front: "What does relaxing edge (u,v) do?", back: "If d[u] + w(u,v) < d[v], set d[v] = d[u] + w(u,v) — improve the estimate via u." },
            { id: "a7l1-i2", front: "Optimal substructure of shortest paths?", back: "Any subpath of a shortest path is itself a shortest path." },
            { id: "a7l1-i3", front: "When are shortest paths undefined?", back: "When a negative-weight cycle is reachable from s — cost can be driven to −∞." },
            { id: "a7l1-i4", front: "Triangle inequality for shortest distances?", back: "δ(s,v) ≤ δ(s,u) + w(u,v); relaxation enforces it." },
          ],
        },
        {
          id: "a7l2",
          title: "Dijkstra's Algorithm",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Greedy on non-negative weights",
              body: `Dijkstra repeatedly extracts the unsettled vertex u with the smallest d[u], settles it, and relaxes its outgoing edges. It is greedy: once extracted, d[u] = δ(s, u) and never changes. The proof rests on **non-negative weights** — leaving a settled region can only add cost, so the minimum-estimate vertex is genuinely done.`,
            },
            {
              type: "text",
              heading: "Cost depends on the priority queue",
              body: `With a binary heap (V extract-mins and E decrease-keys, each O(log V)), Dijkstra runs in **O((V + E)·log V)**. A Fibonacci heap makes decrease-key O(1) amortized, improving it to O(E + V·log V) — better for dense graphs. Either way it dominates Bellman-Ford when weights are non-negative.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Dijkstra breaks on negative edges.** A negative edge can improve the distance to an already-settled vertex, but Dijkstra never revisits it. If any edge weight can be negative, you must use Bellman-Ford (next lesson), not Dijkstra.`,
            },
          ],
          reviewItems: [
            { id: "a7l2-i1", front: "Dijkstra's greedy step?", back: "Extract the unsettled vertex with smallest d, settle it (d = δ), and relax its edges." },
            { id: "a7l2-i2", front: "What assumption does Dijkstra's correctness require?", back: "Non-negative edge weights — leaving a settled set can only increase cost." },
            { id: "a7l2-i3", front: "Dijkstra's running time with a binary heap?", back: "O((V + E)·log V); a Fibonacci heap gives O(E + V log V)." },
            { id: "a7l2-i4", front: "Why does Dijkstra fail with negative edges?", back: "A negative edge could improve an already-settled vertex, but Dijkstra never revisits it." },
          ],
        },
        {
          id: "a7l3",
          title: "Bellman-Ford & DAG Shortest Paths",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Bellman-Ford handles negatives",
              body: `Bellman-Ford relaxes **all** edges, |V| − 1 times. Since a shortest path has at most |V| − 1 edges (no repeated vertices without a negative cycle), this converges: after pass k, every vertex reachable by a k-edge shortest path is correct. Running time **O(V·E)**. One more pass that still improves some d[v] reveals a **negative-weight cycle**.`,
            },
            {
              type: "decision",
              heading: "Picking a shortest-path algorithm",
              rows: [
                ["Non-negative weights", "**Dijkstra** — O((V+E) log V)"],
                ["Negative edges, need cycle detection", "**Bellman-Ford** — O(VE)"],
                ["Directed acyclic graph (any weights)", "**Topological-order relaxation** — O(V+E)"],
              ],
            },
            {
              type: "text",
              heading: "DAGs are the easy case",
              body: `On a DAG, relax edges in **topological order**: when you process u, every predecessor is already final, so one pass suffices — O(V + E), and it works even with negative weights (a DAG has no cycles to exploit). Topological order turns the shortest-path problem into a single linear sweep.`,
            },
          ],
          reviewItems: [
            { id: "a7l3-i1", front: "How many edge-relaxation passes does Bellman-Ford need, and why?", back: "|V| − 1 — a shortest path has at most |V| − 1 edges (no repeats absent a negative cycle)." },
            { id: "a7l3-i2", front: "Bellman-Ford running time and bonus capability?", back: "O(V·E); detects negative-weight cycles (a V-th pass still improves some d)." },
            { id: "a7l3-i3", front: "Shortest paths on a DAG — method and cost?", back: "Relax edges in topological order, one pass: O(V + E), even with negative weights." },
            { id: "a7l3-i4", front: "Dijkstra vs Bellman-Ford — when each?", back: "Dijkstra for non-negative weights (faster); Bellman-Ford when edges can be negative." },
          ],
        },
      ],
      masteryCheck: {
        id: "a7-check",
        questions: [
          { id: "a7q1", type: "numeric", prompt: "Bellman-Ford relaxes all edges |V| − 1 times to guarantee shortest paths (no negative cycle). For V = 10, how many passes is that?", answer: 9, tolerance: 0, explanation: "|V| − 1 = 9; a shortest path uses at most |V| − 1 edges." },
          { id: "a7q2", type: "mcq", prompt: "Dijkstra's algorithm is correct only when:", options: ["all edge weights are non-negative", "the graph is a DAG", "some weights are negative", "the graph is undirected"], answer: 0, explanation: "Non-negativity is what guarantees a settled vertex is final." },
          { id: "a7q3", type: "short", prompt: "The single-source algorithm that handles negative edge weights (but not negative cycles) by relaxing all edges repeatedly is the ____ algorithm.", accept: ["Bellman-Ford", "bellman-ford", "bellman ford", "bellmanford", "Bellman Ford"], explanation: "Bellman-Ford relaxes all edges |V|−1 times." },
          { id: "a7q4", type: "numeric", prompt: "Dijkstra with a binary heap runs in O((V + E)·log₂ V). For V = 16, what is the log₂ V factor?", answer: 4, tolerance: 0, explanation: "log₂ 16 = 4." },
          {
            id: "a7q5",
            type: "proof",
            points: 3,
            prompt: "Prove that any subpath of a shortest path is itself a shortest path (the optimal-substructure property of shortest paths).",
            rubric: [
              "Sets up a shortest path p from s to v and decomposes it into a prefix, a subpath p' from x to y, and a suffix, with additive weights.",
              "Assumes for contradiction a strictly shorter x–y path p'' exists.",
              "Performs the cut-and-paste: replacing p' by p'' yields an s–v path of strictly smaller total weight.",
              "Concludes this contradicts p being shortest, so p' must be a shortest x–y path.",
            ],
            solution: "Let p be a shortest path from s to v, and decompose it as s ⇝ x (weight a), then x ⇝ y along a subpath p' (weight b), then y ⇝ v (weight c), so w(p) = a + b + c. Suppose p' is not a shortest x–y path: then some path p'' from x to y has weight b'' < b. Replace p' by p'' inside p to get a path from s to v of weight a + b'' + c < a + b + c = w(p). This is an s–v path strictly shorter than p, contradicting that p is a shortest s–v path. Hence no such p'' exists and p' is a shortest x–y path. ∎",
            explanation: "Cut-and-paste: a shorter subpath would yield a shorter whole path.",
          },
          {
            id: "a7q6",
            type: "proof",
            points: 3,
            prompt: "Prove Dijkstra's algorithm correct: when a vertex u is extracted from the priority queue, d[u] = δ(s, u). Assume all edge weights are non-negative.",
            rubric: [
              "States the invariant that d[v] ≥ δ(s,v) always, and that settled vertices have d = δ.",
              "Assumes for contradiction d[u] > δ(s,u) at extraction, and takes a true shortest path s ⇝ u.",
              "Identifies the first unsettled vertex y on that path and its settled predecessor x with d[x] = δ(s,x).",
              "Uses relaxation of (x,y) and non-negativity to get d[y] ≤ δ(s,y) ≤ δ(s,u) < d[u], contradicting that u has the minimum key.",
            ],
            solution: "Relaxations only ever set d[v] to the length of some actual path, so the invariant d[v] ≥ δ(s,v) holds throughout, and any settled (already-extracted) vertex has d = δ. Suppose, for contradiction, that at the moment u is extracted d[u] > δ(s,u). Then u is reachable; take a shortest path P from s to u. Walking along P from s, let y be the first vertex on P that is still unsettled, and let x be its predecessor on P (x is settled, possibly x = s, so d[x] = δ(s,x)). When x was settled, edge (x,y) was relaxed, giving d[y] ≤ d[x] + w(x,y) = δ(s,x) + w(x,y) = δ(s,y). Since y precedes (or equals) u on a shortest path and weights are non-negative, δ(s,y) ≤ δ(s,u). Combining, d[y] ≤ δ(s,y) ≤ δ(s,u) < d[u]. But then y (still in the queue) has a strictly smaller key than u, so Dijkstra would have extracted y before u — contradicting the choice of u. Hence d[u] = δ(s,u). ∎",
            explanation: "The first unsettled vertex on a shortest path already has the correct (smaller) estimate, contradicting u being the minimum.",
          },
        ],
      },
    },
    {
      id: "a8",
      title: "Greedy Algorithms",
      summary: "When local choices are globally optimal — exchange arguments, the MST cut property, scheduling, and Huffman codes.",
      prerequisites: ["a7"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a8l1",
          title: "The Greedy Method & Exchange Arguments",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Locally optimal, globally optimal",
              body: `A greedy algorithm builds a solution one locally-optimal choice at a time, never reconsidering. It works only when the problem has the **greedy-choice property** (some optimal solution makes the greedy first choice) and **optimal substructure** (an optimal solution contains optimal solutions to subproblems). Both must be *proved* — greedy is fast but wrong far more often than it looks.`,
            },
            {
              type: "text",
              heading: "The exchange argument",
              body: `The standard correctness proof is an **exchange argument**: take any optimal solution and transform it, step by step, into the greedy one without ever increasing cost (or decreasing value). If every greedy choice can be swapped into an optimal solution harmlessly, the greedy solution is itself optimal.`,
            },
            {
              type: "example",
              heading: "Interval scheduling",
              body: `To select the most mutually-compatible intervals, greedily pick the interval with the **earliest finish time**, discard those it overlaps, and repeat. Earliest-finish leaves the most room for the rest — an exchange argument shows this greedy choice is always extendable to an optimal schedule.`,
            },
          ],
          reviewItems: [
            { id: "a8l1-i1", front: "Two properties a problem needs for greedy to work?", back: "The greedy-choice property and optimal substructure — both must be proved." },
            { id: "a8l1-i2", front: "What is an exchange argument?", back: "Transform any optimal solution into the greedy one step by step without worsening it — proving greedy is optimal." },
            { id: "a8l1-i3", front: "Greedy rule for maximum interval scheduling?", back: "Repeatedly pick the compatible interval with the earliest finish time." },
            { id: "a8l1-i4", front: "Why earliest-finish-time?", back: "It frees the most room for remaining intervals; an exchange argument shows it stays optimal." },
          ],
        },
        {
          id: "a8l2",
          title: "Minimum Spanning Trees",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The cut property",
              body: `An MST is a minimum-weight set of edges connecting all vertices. The key fact is the **cut property**: for any partition (cut) of the vertices, the minimum-weight edge crossing the cut belongs to some MST (the unique one, if weights are distinct). Both standard MST algorithms are greedy applications of this single property.`,
            },
            {
              type: "text",
              heading: "Kruskal and Prim",
              body: `**Kruskal**: sort edges by weight, add each edge that doesn't form a cycle (tested with a **union-find** structure). O(E·log E) = O(E·log V). **Prim**: grow one tree from a start vertex, always adding the minimum-weight edge leaving it (via a priority queue). O((V + E)·log V) with a binary heap. Kruskal applies the cut property edge-by-edge; Prim applies it to the cut (tree, rest).`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Union-find makes Kruskal fly.** With union by rank and path compression, the m union/find operations cost O(m·α(n)) where α is the inverse Ackermann function — effectively constant. The sort, at O(E log E), is the bottleneck.`,
            },
          ],
          reviewItems: [
            { id: "a8l2-i1", front: "The cut property?", back: "For any cut, the minimum-weight edge crossing it is in some MST (the MST, if weights are distinct)." },
            { id: "a8l2-i2", front: "Kruskal's method and running time?", back: "Sort edges, add each that avoids a cycle (union-find); O(E log E) = O(E log V)." },
            { id: "a8l2-i3", front: "Prim's method and running time?", back: "Grow one tree, repeatedly add the min edge leaving it (heap); O((V+E) log V)." },
            { id: "a8l2-i4", front: "Why is union-find effectively constant time?", back: "Union by rank + path compression give O(α(n)) amortized per operation (inverse Ackermann)." },
          ],
        },
        {
          id: "a8l3",
          title: "Huffman Coding",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Optimal prefix-free codes",
              body: `Given character frequencies, Huffman's algorithm builds an optimal **prefix-free** binary code (no codeword is a prefix of another, so decoding is unambiguous). It greedily merges the two lowest-frequency nodes into a subtree and repeats, using a min-priority queue — O(n·log n) for n characters.`,
            },
            {
              type: "text",
              heading: "Why greedy is optimal here",
              body: `The two least-frequent characters can always be made deepest, sibling leaves in some optimal tree — an **exchange argument**: swapping them with whatever is deepest never increases the weighted code length. Merging them and recursing therefore preserves optimality, which is exactly Huffman's greedy step.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Greedy + optimal substructure, again.** Huffman is the textbook case where a clean exchange argument (least-frequent go deepest) plus optimal substructure (the problem on the merged alphabet) yields a provably optimal greedy algorithm. The same template proves MST and scheduling.`,
            },
          ],
          reviewItems: [
            { id: "a8l3-i1", front: "What does Huffman's algorithm produce?", back: "An optimal prefix-free binary code from character frequencies." },
            { id: "a8l3-i2", front: "Huffman's greedy step and running time?", back: "Repeatedly merge the two lowest-frequency nodes (min-heap); O(n log n)." },
            { id: "a8l3-i3", front: "Why is 'prefix-free' important?", back: "No codeword is a prefix of another, so the bit stream decodes unambiguously." },
            { id: "a8l3-i4", front: "Exchange argument for Huffman's optimality?", back: "The two least-frequent characters can be moved to be deepest sibling leaves without increasing weighted length." },
          ],
        },
      ],
      masteryCheck: {
        id: "a8-check",
        questions: [
          { id: "a8q1", type: "numeric", prompt: "Kruskal sorts E edges, running in O(E·log₂ E). For E = 64, what is the log₂ E factor?", answer: 6, tolerance: 0, explanation: "log₂ 64 = 6." },
          { id: "a8q2", type: "mcq", prompt: "The cut property states that:", options: ["for any cut, the minimum-weight crossing edge is in some MST", "the maximum-weight edge is always in the MST", "every graph has a unique MST", "greedy never produces an MST"], answer: 0, explanation: "This single property justifies both Kruskal and Prim." },
          { id: "a8q3", type: "short", prompt: "To select the maximum number of compatible intervals, the greedy algorithm repeatedly picks the interval with the earliest ____ time.", accept: ["finish", "finishing", "end", "ending", "completion"], explanation: "Earliest finish time leaves the most room for later intervals." },
          { id: "a8q4", type: "numeric", prompt: "A minimum spanning tree of a connected graph with V = 20 vertices has how many edges?", answer: 19, tolerance: 0, explanation: "A spanning tree of V vertices has exactly V − 1 edges." },
          {
            id: "a8q5",
            type: "proof",
            points: 3,
            prompt: "Prove the cut property: for any cut (S, V∖S) of a connected weighted graph with distinct edge weights, the unique minimum-weight edge e crossing the cut belongs to every minimum spanning tree.",
            rubric: [
              "Sets up: let e be the minimum-weight crossing edge and suppose some MST T does not contain e.",
              "Adds e to T, creating a cycle, and argues the cycle contains another edge e' that also crosses the cut.",
              "Uses distinct weights and minimality of e to conclude w(e) < w(e').",
              "Forms T' = T − e' + e, verifies it is a spanning tree of smaller weight, contradicting that T is an MST.",
            ],
            solution: "Let e = (u,v) be the minimum-weight edge crossing the cut (S, V∖S), and suppose for contradiction that some MST T does not contain e. Since T is a spanning tree, adding e creates exactly one cycle C. Following C from u (in S) to v (in V∖S) and back, the cycle crosses the cut an even number of times, so it contains at least one other crossing edge e' ≠ e. Because all weights are distinct and e is the unique minimum crossing edge, w(e) < w(e'). Now remove e' and add e: T' = T − e' + e. Removing e' from the cycle keeps the graph connected, and T' has |V| − 1 edges with no cycle, so it is a spanning tree. Its weight is w(T) − w(e') + w(e) < w(T), contradicting that T is minimum. Hence every MST contains e. ∎",
            explanation: "Swapping e for the heavier crossing edge in the induced cycle strictly improves any MST that omits e.",
          },
          {
            id: "a8q6",
            type: "proof",
            points: 3,
            prompt: "Prove that the earliest-finish-time greedy algorithm selects a maximum-size set of mutually compatible intervals.",
            rubric: [
              "Lets g₁,…,g_k be the greedy picks (by finish time) and o₁,…,o_m an optimal set sorted by finish time.",
              "Proves the 'greedy stays ahead' lemma: finish(g_i) ≤ finish(o_i) for all i ≤ k, by induction.",
              "Argues that if m > k, then o_{k+1} starts after finish(o_k) ≥ finish(g_k), so it is compatible with the greedy set.",
              "Concludes greedy would have selected another interval — contradiction — so k = m and greedy is optimal.",
            ],
            solution: "Let g₁,…,g_k be the intervals greedy selects, ordered by finish time, and let o₁,…,o_m be any optimal solution, also ordered by finish time. Stays-ahead lemma: finish(g_i) ≤ finish(o_i) for every i ≤ k. Base i = 1: greedy picks the globally earliest-finishing interval, so finish(g_1) ≤ finish(o_1). Inductive step: assume finish(g_{i−1}) ≤ finish(o_{i−1}). Since o_i is compatible with o_{i−1}, it starts at or after finish(o_{i−1}) ≥ finish(g_{i−1}); thus o_i is available to greedy when it chooses g_i, and greedy takes the earliest-finishing available interval, so finish(g_i) ≤ finish(o_i). Now suppose m > k. Then o_{k+1} exists and starts at or after finish(o_k) ≥ finish(g_k), so o_{k+1} is compatible with all of g₁,…,g_k and was available — contradicting that greedy stopped at g_k. Hence m = k, and greedy attains the maximum. ∎",
            explanation: "Greedy's i-th interval always finishes no later than the optimum's, so it never runs out of room early.",
          },
        ],
      },
    },
    {
      id: "a9",
      title: "Dynamic Programming",
      summary: "Optimal substructure with overlapping subproblems — memoization, tabulation, and the classic recurrences.",
      prerequisites: ["a8"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a9l1",
          title: "DP Fundamentals",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "When divide-and-conquer overlaps",
              body: `Dynamic programming applies when a problem has **optimal substructure** (an optimal solution is built from optimal solutions to subproblems) *and* **overlapping subproblems** (the same subproblems recur many times). Plain recursion re-solves them exponentially; DP solves each once and reuses it.`,
            },
            {
              type: "text",
              heading: "Memoization vs tabulation",
              body: `**Memoization** is top-down: recurse as usual but cache each subproblem's answer. **Tabulation** is bottom-up: fill a table in dependency order. Both compute each subproblem once. The running time is the clean product\n\n(number of distinct subproblems) × (time to combine each)\n\nso analysis reduces to counting subproblems and per-subproblem work.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Greedy vs DP.** Greedy commits to one locally-best choice; DP considers *all* choices for each subproblem and keeps the best. When a greedy choice can't be proved safe, DP's exhaustive-over-subproblems approach is the fallback — at the cost of filling a table.`,
            },
          ],
          reviewItems: [
            { id: "a9l1-i1", front: "The two ingredients a problem needs for DP?", back: "Optimal substructure and overlapping subproblems." },
            { id: "a9l1-i2", front: "Memoization vs tabulation?", back: "Memoization: top-down recursion with caching. Tabulation: bottom-up table fill in dependency order." },
            { id: "a9l1-i3", front: "How do you compute a DP algorithm's running time?", back: "(number of distinct subproblems) × (work per subproblem)." },
            { id: "a9l1-i4", front: "Greedy vs DP in one line?", back: "Greedy commits to one choice; DP evaluates all choices per subproblem and keeps the best." },
          ],
        },
        {
          id: "a9l2",
          title: "Sequence DPs: LCS & Edit Distance",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Longest common subsequence",
              body: `Let c[i][j] be the LCS length of prefixes X[1..i] and Y[1..j]. If the last characters match, the LCS uses them: c[i][j] = c[i−1][j−1] + 1. Otherwise it drops one of the two: c[i][j] = max(c[i−1][j], c[i][j−1]). With c[0][·] = c[·][0] = 0, filling the m×n table is **Θ(mn)**.`,
            },
            {
              type: "text",
              heading: "Edit distance",
              body: `The Levenshtein distance between strings of length m and n — the minimum insertions, deletions, and substitutions to turn one into the other — satisfies a near-identical recurrence: match costs 0 and copies the diagonal, otherwise take 1 + min(insert, delete, substitute). Also **Θ(mn)** time and space, and the table back-pointers reconstruct the actual edit sequence.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Two strings, two indices, a 2-D table.** Most sequence-alignment DPs share this shape: Θ(mn) subproblems (one per prefix pair), O(1) work each, and a back-trace through the table to recover the solution, not just its cost.`,
            },
          ],
          reviewItems: [
            { id: "a9l2-i1", front: "LCS recurrence when X[i] = Y[j], and when they differ?", back: "Match: c[i][j] = c[i−1][j−1] + 1. Differ: c[i][j] = max(c[i−1][j], c[i][j−1])." },
            { id: "a9l2-i2", front: "LCS time and space?", back: "Θ(mn) — one subproblem per prefix pair, O(1) work each." },
            { id: "a9l2-i3", front: "Edit distance: the three operations and complexity?", back: "Insert, delete, substitute; Θ(mn) via a recurrence taking 1 + min of the three (0 on a match)." },
            { id: "a9l2-i4", front: "How do you recover the actual alignment, not just the cost?", back: "Trace back-pointers through the DP table from the final cell." },
          ],
        },
        {
          id: "a9l3",
          title: "Knapsack & Matrix-Chain",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "0/1 knapsack",
              body: `With capacity W and items of value vᵢ, weight wᵢ, let K(i, w) be the best value using items 1..i within capacity w. Each item is either skipped or taken: K(i, w) = max(K(i−1, w), vᵢ + K(i−1, w − wᵢ)) (the second only if wᵢ ≤ w). The table has n·W cells, O(1) each, so **Θ(nW)**.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Θ(nW) is pseudo-polynomial.** W is a numeric value, not the input size in bits — encoding W takes only log W bits, so Θ(nW) is exponential in the input length. 0/1 knapsack is NP-hard; the DP is efficient only when W is small. Knowing this distinction is half the point of the example.`,
            },
            {
              type: "decision",
              heading: "Classic DP recurrences",
              rows: [
                ["LCS / edit distance", "Θ(mn) — prefix-pair subproblems"],
                ["0/1 knapsack", "Θ(nW) — pseudo-polynomial"],
                ["Matrix-chain order", "Θ(n³) — Θ(n²) subproblems × O(n)"],
              ],
            },
            {
              type: "text",
              heading: "Matrix-chain multiplication",
              body: `To parenthesize a product of n matrices for the fewest scalar multiplications, let m[i][j] be the optimum for the subchain i..j; try every split point k: m[i][j] = min over i ≤ k < j of m[i][k] + m[k+1][j] + (cost of the final multiply). There are Θ(n²) subproblems, each scanning O(n) splits → **Θ(n³)**.`,
            },
          ],
          reviewItems: [
            { id: "a9l3-i1", front: "0/1 knapsack recurrence and complexity?", back: "K(i,w) = max(K(i−1,w), vᵢ + K(i−1,w−wᵢ)); Θ(nW)." },
            { id: "a9l3-i2", front: "Why is Θ(nW) called pseudo-polynomial?", back: "W is a value needing only log W bits, so Θ(nW) is exponential in the input size in bits." },
            { id: "a9l3-i3", front: "Matrix-chain DP complexity and why?", back: "Θ(n³): Θ(n²) subproblems (subchains i..j), each trying O(n) split points." },
            { id: "a9l3-i4", front: "General shape of a DP running time?", back: "(number of subproblems) × (work per subproblem) — e.g. n² subproblems × O(n) = Θ(n³)." },
          ],
        },
      ],
      masteryCheck: {
        id: "a9-check",
        questions: [
          { id: "a9q1", type: "numeric", prompt: "The LCS of strings of lengths m = 8 and n = 5 fills an m×n table in Θ(mn). How many cells is that (m·n)?", answer: 40, tolerance: 0, explanation: "8 · 5 = 40 subproblems, one per prefix pair." },
          { id: "a9q2", type: "mcq", prompt: "Dynamic programming applies when a problem has overlapping subproblems and:", options: ["optimal substructure", "no recursive structure", "exactly one subproblem", "a safe greedy choice"], answer: 0, explanation: "Optimal substructure lets you build the optimum from subproblem optima." },
          { id: "a9q3", type: "short", prompt: "0/1 knapsack's Θ(nW) DP is called ____-polynomial, because W is a numeric value rather than the input size in bits.", accept: ["pseudo", "pseudo-polynomial", "pseudopolynomial", "pseudo polynomial"], explanation: "Encoding W needs only log W bits, so Θ(nW) is exponential in the input length." },
          { id: "a9q4", type: "numeric", prompt: "Matrix-chain multiplication has Θ(n²) subproblems, each costing O(n). It therefore runs in Θ(n^d). What is d?", answer: 3, tolerance: 0, explanation: "n² subproblems × O(n) work = Θ(n³), so d = 3." },
          {
            id: "a9q5",
            type: "proof",
            points: 3,
            prompt: "State the optimal-substructure property of the longest common subsequence and prove the LCS recurrence: with c[i][j] the LCS length of X[1..i] and Y[1..j], show c[i][j] = c[i−1][j−1] + 1 if X[i] = Y[j], and max(c[i−1][j], c[i][j−1]) otherwise.",
            rubric: [
              "Case X[i] = Y[j]: argues an LCS of the prefixes can be taken to end with this matched character, reducing to an LCS of X[1..i−1], Y[1..j−1], giving c[i−1][j−1] + 1.",
              "Case X[i] ≠ Y[j]: argues any common subsequence omits X[i] or omits Y[j], so the LCS is the better of the two reduced prefixes.",
              "Justifies optimal substructure (a cut-and-paste / contradiction argument that the reduced parts must themselves be longest).",
              "States the base cases c[0][j] = c[i][0] = 0 and assembles the full recurrence.",
            ],
            solution: "Optimal substructure: an LCS of X[1..i] and Y[1..j] is composed of an LCS of strictly shorter prefixes. Case X[i] = Y[j]: there is an LCS Z of the prefixes that ends in this common character — if some LCS did not use it, appending the matched character to an LCS of X[1..i−1], Y[1..j−1] gives a common subsequence at least as long. Deleting that last character leaves a common subsequence of X[1..i−1], Y[1..j−1], which must be a longest such (else lengthening it and re-appending the matched character would beat Z — cut-and-paste). Hence c[i][j] = c[i−1][j−1] + 1. Case X[i] ≠ Y[j]: a common subsequence cannot use both X[i] and Y[j] as its final matched pair (they differ), so an LCS omits X[i] or omits Y[j]; the best is therefore max(c[i−1][j], c[i][j−1]), and each of these is a longest subsequence of its prefixes by the same cut-and-paste argument. With c[0][j] = c[i][0] = 0 (an empty string shares nothing), this is the full recurrence. ∎",
            explanation: "Match → extend the diagonal LCS by 1; mismatch → drop one character and take the better side.",
          },
          {
            id: "a9q6",
            type: "proof",
            points: 3,
            prompt: "Prove that the 0/1 knapsack recurrence is correct: with K(i, w) the maximum value achievable using items 1..i within capacity w, show K(i, w) = max( K(i−1, w),  vᵢ + K(i−1, w − wᵢ) ), where the second term is included only when wᵢ ≤ w.",
            rubric: [
              "Establishes the base case (i = 0 gives value 0).",
              "Splits an optimal solution for (i, w) on whether it includes item i.",
              "If item i is excluded: the solution is optimal for items 1..i−1 within w, giving K(i−1, w).",
              "If item i is included (needs wᵢ ≤ w): argues the rest is an optimal solution for items 1..i−1 within w − wᵢ (cut-and-paste), giving vᵢ + K(i−1, w − wᵢ); the optimum is the max.",
            ],
            solution: "Base case: K(0, w) = 0, since no items can be chosen. Inductive step: consider an optimal selection achieving K(i, w). Item i is either out or in. If item i is excluded, the selection uses only items 1..i−1 within capacity w, and it must be optimal for that subproblem (any better selection of 1..i−1 within w would be a better selection for (i, w)), so its value is K(i−1, w). If item i is included, then wᵢ ≤ w, the chosen value is vᵢ plus the value of the remaining items, which are drawn from 1..i−1 within the residual capacity w − wᵢ; that remainder must itself be optimal for (i−1, w − wᵢ) — otherwise replacing it with a better selection (and keeping item i) would beat the supposed optimum (cut-and-paste). So this case yields vᵢ + K(i−1, w − wᵢ). The true optimum is the larger of the two attainable cases, K(i, w) = max( K(i−1, w), vᵢ + K(i−1, w − wᵢ) ) (second term only if wᵢ ≤ w). ∎",
            explanation: "Condition on whether item i is taken; each branch is optimal on the smaller item set by cut-and-paste.",
          },
        ],
      },
    },
    {
      id: "a10",
      title: "Amortized Analysis",
      summary: "Average cost per operation over a worst-case sequence — aggregate, accounting, and the potential method, up to union-find's α(n).",
      prerequisites: ["a9"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a10l1",
          title: "Aggregate & Accounting Methods",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Amortized ≠ average-case",
              body: `Amortized analysis bounds the *average cost per operation over a worst-case sequence* — no probability is involved. A single operation may be expensive, but if it can't happen too often, the average stays low. This is the honest way to analyze data structures (dynamic arrays, hash-table resizing, union-find) where occasional costly operations pay for many cheap ones.`,
            },
            {
              type: "text",
              heading: "Two methods",
              body: `**Aggregate:** bound the total cost of any sequence of n operations directly, then divide by n. **Accounting:** assign each operation an *amortized charge*; cheap operations are overcharged to bank credit, which expensive operations later spend. The invariant — total credit never goes negative — guarantees the amortized charges upper-bound the true cost.`,
            },
            {
              type: "example",
              heading: "The binary counter",
              body: `Incrementing a k-bit binary counter flips the trailing 1s to 0 and one 0 to 1. A single increment can flip many bits (1111→10000), but over n increments bit i flips only every 2ⁱ steps, so total flips < 2n — amortized **O(1)** per increment. Accounting view: charge 2 per increment (1 to set a bit, 1 banked to later reset it).`,
            },
          ],
          reviewItems: [
            { id: "a10l1-i1", front: "Amortized vs average-case analysis?", back: "Amortized is the worst-case average per operation over a sequence — no probability. Average-case averages over random inputs." },
            { id: "a10l1-i2", front: "Aggregate method?", back: "Bound the total cost of n operations directly, then divide by n." },
            { id: "a10l1-i3", front: "Accounting method and its invariant?", back: "Assign amortized charges; cheap ops bank credit for expensive ones — total credit must never go negative." },
            { id: "a10l1-i4", front: "Amortized cost of a binary-counter increment?", back: "O(1): total flips over n increments < 2n (bit i flips every 2ⁱ steps)." },
          ],
        },
        {
          id: "a10l2",
          title: "The Potential Method",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Stored energy",
              body: `Define a **potential** Φ on the data structure's state — a number measuring "stored energy" (prepaid work). The amortized cost of an operation is its actual cost plus the change in potential: â = c + (Φ_after − Φ_before). Summing telescopes: Σ â = Σ c + Φ_final − Φ_initial. If Φ_final ≥ Φ_initial (e.g. Φ ≥ 0 and Φ_initial = 0), then Σ c ≤ Σ â — the amortized costs bound the real total.`,
            },
            {
              type: "example",
              heading: "Dynamic array (table doubling)",
              body: `Take Φ = 2·num − size (num stored, size capacity; the table doubles when full). A plain append: actual 1, num up by 1 so ΔΦ = 2, amortized 3. A resizing append (num = size): actual size + 1 (copy all, insert), and Φ drops from size to 2, ΔΦ = 2 − size, amortized (size + 1) + (2 − size) = 3. Always **O(1)** amortized.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Choosing Φ is the whole art.** A good potential is high exactly when an expensive operation is imminent, so the operation's big actual cost is offset by a big drop in Φ. The same template handles splay trees, Fibonacci heaps, and union-find.`,
            },
          ],
          reviewItems: [
            { id: "a10l2-i1", front: "Amortized cost in the potential method?", back: "Actual cost + ΔΦ (change in potential): â = c + (Φ_after − Φ_before)." },
            { id: "a10l2-i2", front: "Why does Σ â bound Σ c?", back: "Σ â = Σ c + Φ_final − Φ_initial; if Φ_final ≥ Φ_initial the difference is ≥ 0, so Σ c ≤ Σ â." },
            { id: "a10l2-i3", front: "Potential for table-doubling dynamic arrays?", back: "Φ = 2·num − size — gives O(1) amortized append (amortized cost 3 in both cases)." },
            { id: "a10l2-i4", front: "What makes a good potential function?", back: "It's high exactly when an expensive operation looms, so the big actual cost is cancelled by a big drop in Φ." },
          ],
        },
        {
          id: "a10l3",
          title: "Union-Find & the Inverse Ackermann",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Disjoint-set forests",
              body: `Union-Find maintains disjoint sets under union and find, representing each set as a tree with a representative root. Two optimizations: **union by rank** (attach the shorter tree under the taller) and **path compression** (on a find, point every node on the path straight at the root). Each keeps trees shallow.`,
            },
            {
              type: "text",
              heading: "Near-constant amortized cost",
              body: `Either optimization alone gives O(log n) per operation; **both together** give an amortized cost of **O(α(n))**, where α is the inverse Ackermann function. α grows so slowly that α(n) ≤ 4 for any n that could be written down in the physical universe — effectively constant. This is the bound that makes Kruskal's MST O(E log E) (sorting dominates, not the union-find).`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**α(n) is not O(1), but you'll never tell.** The inverse Ackermann is provably more than constant, yet under 5 for all conceivable inputs. Tarjan's analysis (a sophisticated potential argument) is the classic proof that rank + compression reaches it.`,
            },
          ],
          reviewItems: [
            { id: "a10l3-i1", front: "Union-Find's two optimizations?", back: "Union by rank (shorter tree under taller) and path compression (point path nodes straight at the root)." },
            { id: "a10l3-i2", front: "Amortized cost with rank + compression?", back: "O(α(n)) — inverse Ackermann, effectively ≤ 4 for any real n." },
            { id: "a10l3-i3", front: "Cost with only one of the two optimizations?", back: "O(log n) per operation." },
            { id: "a10l3-i4", front: "Why does this make Kruskal O(E log E)?", back: "Union-find is near-constant per op, so sorting the edges dominates the running time." },
          ],
        },
      ],
      masteryCheck: {
        id: "a10-check",
        questions: [
          { id: "a10q1", type: "numeric", prompt: "Over n increments of a binary counter starting at 0, the total number of bit flips is at most 2n. What is the amortized number of flips per increment (total ÷ n)?", answer: 2, tolerance: 0, explanation: "2n total ÷ n = 2 → O(1) amortized." },
          { id: "a10q2", type: "mcq", prompt: "The potential method computes the amortized cost of an operation as:", options: ["actual cost + change in potential (ΔΦ)", "total cost ÷ n, always", "the worst-case single-operation cost", "actual cost − ΔΦ"], answer: 0, explanation: "â = c + (Φ_after − Φ_before)." },
          { id: "a10q3", type: "short", prompt: "Union by rank with path compression gives an amortized cost of O(____(n)), the inverse Ackermann function — effectively constant. Give the symbol/name.", accept: ["α", "alpha", "α(n)", "alpha(n)", "ackermann", "inverse ackermann"], explanation: "O(α(n)), the inverse Ackermann function." },
          { id: "a10q4", type: "mcq", prompt: "Amortized analysis is best described as:", options: ["the average cost per operation over a worst-case sequence, with no probability involved", "the average cost over random inputs", "an analysis that ignores expensive operations", "a technique that only applies to sorting"], answer: 0, explanation: "It's worst-case over the sequence, not probabilistic average-case." },
          {
            id: "a10q5",
            type: "proof",
            points: 3,
            prompt: "Prove that n increments of a binary counter starting at zero take O(n) total time — i.e. O(1) amortized per increment. (Use the accounting or potential method.)",
            rubric: [
              "Sets up a method: a potential Φ = number of 1-bits (with Φ ≥ 0, Φ_initial = 0), or an accounting charge of 2 per increment.",
              "Computes the actual cost of an increment that resets k trailing 1s and sets one 0: k + 1 flips.",
              "Shows the amortized cost is constant: with Φ, ΔΦ = 1 − k so amortized = (k+1) + (1−k) = 2 (or shows banked credit covers the resets).",
              "Concludes total cost over n increments is ≤ 2n = O(n), i.e. O(1) amortized.",
            ],
            solution: "Use the potential Φ = (number of 1-bits in the counter); Φ ≥ 0 and Φ(0) = 0. An increment flips the k trailing 1-bits to 0 and then flips one 0-bit to 1 (an unbounded counter always has a 0 to flip), so its actual cost is k + 1 flips. The potential changes by ΔΦ = (+1) − k = 1 − k. The amortized cost is therefore â = (k + 1) + (1 − k) = 2 — constant, independent of k. Since each amortized cost is 2 and Φ_final ≥ Φ_initial = 0, the total actual cost of n increments is at most the total amortized cost, Σ c ≤ Σ â = 2n = O(n). Hence each increment is O(1) amortized. ∎",
            explanation: "Φ = #1-bits: a costly k-reset increment drops Φ by ~k, cancelling its actual cost down to a constant 2.",
          },
          {
            id: "a10q6",
            type: "proof",
            points: 3,
            prompt: "Using the potential method with Φ = 2·num − size (num = elements stored, size = table capacity, doubling when full), prove that appending to a dynamic array has O(1) amortized cost.",
            rubric: [
              "Verifies the potential is valid: Φ ≥ 0 throughout and Φ_initial = 0, so Σ actual ≤ Σ amortized.",
              "Computes the amortized cost of a non-resizing append: actual 1, ΔΦ = 2, amortized 3.",
              "Computes the amortized cost of a resizing append (num = size): actual = size + 1, and Φ goes from size to 2 (ΔΦ = 2 − size), amortized = (size+1)+(2−size) = 3.",
              "Concludes the amortized cost is O(1), so n appends cost O(n).",
            ],
            solution: "Let Φ = 2·num − size. Initially num = size = 0 so Φ = 0, and immediately after any doubling num ≥ size/2, so Φ ≥ 0 always; hence the total actual cost is at most the total amortized cost. Consider an append. Case 1 — no resize (num < size before): actual cost 1; num increases by 1, so ΔΦ = 2; amortized = 1 + 2 = 3. Case 2 — resize (num = size before): we allocate a table of capacity 2·size, copy all size elements, and insert, for actual cost size + 1; afterward num = size + 1 and capacity = 2·size, so Φ goes from 2·size − size = size to 2(size+1) − 2size = 2, giving ΔΦ = 2 − size; amortized = (size + 1) + (2 − size) = 3. In both cases the amortized cost is 3 = O(1), so n appends cost at most 3n = O(n). ∎",
            explanation: "Φ banks 2 per cheap append; when the table doubles, Φ collapses from size to 2, paying for the size copies.",
          },
        ],
      },
    },
    {
      id: "a11",
      title: "Maximum Flow",
      summary: "Flow networks, the max-flow min-cut theorem, Ford-Fulkerson / Edmonds-Karp, and bipartite matching by reduction.",
      prerequisites: ["a10"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a11l1",
          title: "Flow Networks",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Flows and residuals",
              body: `A flow network is a directed graph with edge **capacities**, a source s, and a sink t. A **flow** assigns each edge a value in [0, capacity] (the capacity constraint) such that at every vertex except s and t, flow in = flow out (**conservation**). The **value** of the flow is the net flow out of s. The goal: maximize it.`,
            },
            {
              type: "text",
              heading: "Augmenting paths",
              body: `The **residual graph** records remaining capacity: a forward edge with leftover capacity, plus a backward edge for each unit of flow (you can "undo" flow). An **augmenting path** is an s→t path in the residual graph; pushing flow along it (by the path's bottleneck capacity) strictly increases the flow value. When no augmenting path exists, the flow is maximum.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Backward edges are the key idea.** They let later augmentations reroute earlier flow, which is exactly what makes "keep finding augmenting paths" reach the true optimum rather than getting stuck.`,
            },
          ],
          reviewItems: [
            { id: "a11l1-i1", front: "The two constraints on a flow?", back: "Capacity (0 ≤ f(e) ≤ c(e)) and conservation (in = out at every vertex but s and t)." },
            { id: "a11l1-i2", front: "Value of a flow?", back: "The net flow out of the source s (= net into the sink t)." },
            { id: "a11l1-i3", front: "What is the residual graph?", back: "Remaining forward capacity plus backward edges (one per unit of flow) that allow undoing/rerouting flow." },
            { id: "a11l1-i4", front: "What is an augmenting path?", back: "An s→t path in the residual graph; pushing its bottleneck capacity raises the flow value." },
          ],
        },
        {
          id: "a11l2",
          title: "Max-Flow Min-Cut & Ford-Fulkerson",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Cuts bound flows",
              body: `An **s-t cut** partitions the vertices into (S, T) with s ∈ S, t ∈ T; its **capacity** is the total capacity of edges from S to T. Any flow's value is at most any cut's capacity (everything must cross). The **max-flow min-cut theorem** says these meet exactly: the maximum flow value equals the minimum cut capacity. The min cut is the true bottleneck.`,
            },
            {
              type: "text",
              heading: "Ford-Fulkerson and Edmonds-Karp",
              body: `**Ford-Fulkerson**: repeatedly find an augmenting path and push flow until none remains. With integer capacities it terminates with an integral max flow. The path-finding rule matters: choosing augmenting paths by **BFS** (shortest, fewest edges) is **Edmonds-Karp**, which runs in **O(V·E²)** regardless of capacities.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Naive Ford-Fulkerson can be slow.** With bad path choices and large capacities it may take time proportional to the max-flow value. Edmonds-Karp's BFS rule removes the dependence on capacities and guarantees a polynomial O(VE²) bound.`,
            },
          ],
          reviewItems: [
            { id: "a11l2-i1", front: "Capacity of an s-t cut (S,T)?", back: "The total capacity of edges going from S to T." },
            { id: "a11l2-i2", front: "The max-flow min-cut theorem?", back: "The maximum s-t flow value equals the minimum s-t cut capacity." },
            { id: "a11l2-i3", front: "Ford-Fulkerson in one line?", back: "Repeatedly find an augmenting path in the residual graph and push flow until none exists." },
            { id: "a11l2-i4", front: "Edmonds-Karp and its running time?", back: "Ford-Fulkerson choosing augmenting paths by BFS — O(V·E²), independent of capacities." },
          ],
        },
        {
          id: "a11l3",
          title: "Application: Bipartite Matching",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Matching as flow",
              body: `Maximum **bipartite matching** — the largest set of edges with no shared endpoints between left set L and right set R — reduces to max flow. Add a source s with capacity-1 edges to each L vertex, direct each original edge L→R with capacity 1, and add capacity-1 edges from each R vertex to a sink t. An integral max flow saturates a set of vertex-disjoint paths: a matching of equal size.`,
            },
            {
              type: "text",
              heading: "What flow buys you",
              body: `By integrality, the max flow is achievable with 0/1 edge values, so max flow value = maximum matching size. The same machinery solves edge-disjoint paths, assignment problems, and (via min cut) image segmentation and project selection. **König's theorem** — in bipartite graphs, max matching = min vertex cover — is a min-cut corollary.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Reduction is the lesson.** You rarely invent a matching algorithm from scratch — you model the problem as a flow network and let max-flow solve it. Recognizing "this is a flow problem" is the skill.`,
            },
          ],
          reviewItems: [
            { id: "a11l3-i1", front: "How is bipartite matching reduced to flow?", back: "s → L (cap 1), each edge L→R (cap 1), R → t (cap 1); integral max flow = a matching of equal size." },
            { id: "a11l3-i2", front: "Why does max flow value equal max matching size?", back: "Integrality gives a 0/1 flow; unit-capacity vertices force vertex-disjoint paths = a matching." },
            { id: "a11l3-i3", front: "König's theorem?", back: "In bipartite graphs, the maximum matching size equals the minimum vertex cover size (a min-cut corollary)." },
            { id: "a11l3-i4", front: "The transferable skill from this unit?", back: "Modeling a problem as a flow network and applying max-flow, rather than inventing a bespoke algorithm." },
          ],
        },
      ],
      masteryCheck: {
        id: "a11-check",
        questions: [
          { id: "a11q1", type: "mcq", prompt: "The max-flow min-cut theorem states that:", options: ["the maximum s-t flow value equals the minimum s-t cut capacity", "max flow equals the number of edges", "the min cut equals the number of vertices", "the flow value is always zero"], answer: 0, explanation: "Flow and cut meet exactly at the bottleneck." },
          { id: "a11q2", type: "short", prompt: "Ford-Fulkerson repeatedly finds an ____ path in the residual graph and pushes flow along it.", accept: ["augmenting", "augment", "augmenting path"], explanation: "Augmenting paths raise the flow value until none remains." },
          { id: "a11q3", type: "numeric", prompt: "Edmonds-Karp (Ford-Fulkerson with BFS-chosen augmenting paths) runs in O(V·E^c). What is c?", answer: 2, tolerance: 0, explanation: "O(V·E²), independent of capacities." },
          { id: "a11q4", type: "mcq", prompt: "Maximum bipartite matching is most cleanly solved by:", options: ["reducing it to a max-flow problem with unit capacities", "sorting the edges by weight", "running a single DFS", "computing a minimum spanning tree"], answer: 0, explanation: "Model it as a flow network and apply max-flow." },
          {
            id: "a11q5",
            type: "proof",
            points: 3,
            prompt: "Prove the easy direction of max-flow min-cut: the value of any s-t flow is at most the capacity of any s-t cut. You may use flow conservation.",
            rubric: [
              "Fixes an arbitrary flow f and an arbitrary s-t cut (S, T) with s ∈ S, t ∈ T.",
              "Expresses |f| as the net flow across the cut (forward minus backward), justified by summing conservation over S.",
              "Drops the nonnegative backward term to bound |f| ≤ total forward flow across the cut.",
              "Applies the capacity constraint edge-by-edge to conclude |f| ≤ c(S, T).",
            ],
            solution: "Let f be any s-t flow and (S, T) any s-t cut with s ∈ S and t ∈ T. Summing the conservation equation over all vertices of S — every vertex but s has net flow 0, and s has net flow |f| — shows that |f| equals the net flow crossing the cut: |f| = Σ_{u∈S, v∈T} f(u,v) − Σ_{u∈T, v∈S} f(u,v). Flow values are nonnegative, so discarding the backward sum only increases the right-hand side: |f| ≤ Σ_{u∈S, v∈T} f(u,v). Finally each forward edge satisfies f(u,v) ≤ c(u,v), so |f| ≤ Σ_{u∈S, v∈T} c(u,v) = c(S, T). Thus every flow value is at most every cut capacity. ∎",
            explanation: "All flow from s to t must cross the cut, and it can't exceed the forward capacity across it.",
          },
          {
            id: "a11q6",
            type: "proof",
            points: 3,
            prompt: "Show how to reduce maximum bipartite matching to maximum flow, and argue that the maximum flow value equals the maximum matching size.",
            rubric: [
              "Constructs the network: source s with capacity-1 edges to each left vertex, original edges directed L→R (capacity 1), capacity-1 edges from each right vertex to sink t.",
              "Argues an integral flow exists (integral capacities ⇒ integral max flow), so edges carry 0 or 1.",
              "Shows a unit-valued flow decomposes into vertex-disjoint s→u→v→t paths whose middle edges form a matching of size = flow value.",
              "Argues the converse (a matching gives a flow of equal value), concluding max flow = max matching.",
            ],
            solution: "Given a bipartite graph with left set L, right set R, and edges E ⊆ L×R, build a flow network: add a source s and an edge s→u of capacity 1 for each u ∈ L; direct each edge (u,v) ∈ E as u→v with capacity 1; add a sink t and an edge v→t of capacity 1 for each v ∈ R. All capacities are integers, so by the integrality theorem there is a maximum flow that is integral, and every edge carries 0 or 1. Each unit of flow traces an s→u→v→t path; the capacity-1 edges s→u and v→t ensure each left and each right vertex carries at most one unit, so the saturated middle edges (u,v) form a set with no shared endpoints — a matching — of size equal to the flow value. Conversely, any matching of size m yields a flow of value m by routing one unit along s→u→v→t for each matched edge. Therefore the maximum flow value equals the maximum matching size. ∎",
            explanation: "Unit capacities force vertex-disjoint paths, so an integral max flow is exactly a maximum matching.",
          },
        ],
      },
    },
    {
      id: "a12",
      title: "NP-Completeness",
      summary: "P, NP, polynomial reductions, and what it means — and takes — to prove a problem NP-complete.",
      prerequisites: ["a11"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a12l1",
          title: "P, NP & Reductions",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Solve vs verify",
              body: `Focus on **decision problems** (yes/no). **P** is the class solvable in polynomial time. **NP** is the class whose yes-answers are *verifiable* in polynomial time given a short **certificate** — e.g. for "does this graph have a Hamiltonian cycle?", a proposed cycle is checked fast, even though finding one seems hard. Every problem in P is in NP; whether P = NP is the great open question.`,
            },
            {
              type: "text",
              heading: "Polynomial-time reductions",
              body: `A **polynomial-time reduction** A ≤_p B is a poly-time map taking instances of A to instances of B that preserves the yes/no answer. It means "B is at least as hard as A": if B were easy (in P), A would be too. Reductions are the tool for **transferring hardness** from a known-hard problem to a new one.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Mind the direction.** To show a new problem X is hard, reduce a known-hard problem *to* X (known ≤_p X), not the other way. Reducing X to something easy proves nothing about X's hardness.`,
            },
          ],
          reviewItems: [
            { id: "a12l1-i1", front: "Definition of NP?", back: "Problems whose yes-instances have a polynomial-size certificate verifiable in polynomial time." },
            { id: "a12l1-i2", front: "Definition of P, and its relation to NP?", back: "Solvable in polynomial time; P ⊆ NP (solving implies verifying). Whether P = NP is open." },
            { id: "a12l1-i3", front: "What does A ≤_p B mean?", back: "A poly-time map from A-instances to B-instances preserving the answer — B is at least as hard as A." },
            { id: "a12l1-i4", front: "Which direction shows X is hard?", back: "Reduce a known-hard problem TO X (known ≤_p X), not X to something easy." },
          ],
        },
        {
          id: "a12l2",
          title: "NP-Completeness & Cook-Levin",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The hardest problems in NP",
              body: `A problem is **NP-hard** if *every* problem in NP reduces to it (it's at least as hard as everything in NP). It is **NP-complete** if it is both NP-hard and itself in NP — the hardest problems *within* NP. If any NP-complete problem were in P, then P = NP.`,
            },
            {
              type: "text",
              heading: "Cook-Levin and the recipe",
              body: `The **Cook-Levin theorem** proves that **SAT** (boolean satisfiability) is NP-complete — every NP problem reduces to it — giving the first NP-complete problem to reduce *from*. After that, to prove a new problem X is NP-complete you do two things: (1) show **X ∈ NP** (exhibit a verifiable certificate), and (2) reduce a **known** NP-complete problem to X. Step 2 inherits hardness; step 1 keeps X inside NP.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**One seed, a whole forest.** Cook-Levin seeds the theory with SAT; from it 3-SAT, CLIQUE, VERTEX-COVER, and thousands more are shown NP-complete by chains of reductions. You almost never reduce from "all of NP" directly — you reduce from a convenient known-complete problem.`,
            },
          ],
          reviewItems: [
            { id: "a12l2-i1", front: "NP-hard vs NP-complete?", back: "NP-hard: every NP problem reduces to it. NP-complete: NP-hard AND itself in NP." },
            { id: "a12l2-i2", front: "What does the Cook-Levin theorem establish?", back: "SAT is NP-complete — the first problem to reduce from." },
            { id: "a12l2-i3", front: "Two steps to prove X NP-complete?", back: "(1) Show X ∈ NP; (2) reduce a known NP-complete problem TO X (X is NP-hard)." },
            { id: "a12l2-i4", front: "Consequence if one NP-complete problem is in P?", back: "Then P = NP — every NP problem would be poly-time solvable." },
          ],
        },
        {
          id: "a12l3",
          title: "The Landscape & Coping",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "A web of equivalently hard problems",
              body: `Thousands of natural problems are NP-complete — 3-SAT, CLIQUE, INDEPENDENT-SET, VERTEX-COVER, HAMILTONIAN-CYCLE, SUBSET-SUM, the decision form of TSP — and all are polynomially inter-reducible, so a poly-time algorithm for any one would solve them all. Recognizing that a problem is (or contains) one of these is a crucial practical skill.`,
            },
            {
              type: "text",
              heading: "What to do when it's NP-complete",
              body: `NP-completeness is not a dead end — it's a redirection. Stop hunting for an efficient *exact, general* algorithm and instead: design an **approximation** algorithm with a provable ratio, use **heuristics**/exact-exponential methods that work in practice, restrict to a tractable **special case** (e.g. trees, bounded parameters), or accept randomization. The next unit makes "approximate it" rigorous.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Proving NP-completeness saves you effort.** Once you know a problem is NP-complete, you stop trying to find a fast exact algorithm (likely impossible) and pivot to approximation, heuristics, or special structure. That redirection is the practical payoff of the theory.`,
            },
          ],
          reviewItems: [
            { id: "a12l3-i1", front: "Name four NP-complete problems.", back: "3-SAT, CLIQUE, VERTEX-COVER, INDEPENDENT-SET, HAMILTONIAN-CYCLE, SUBSET-SUM, TSP-decision (any four)." },
            { id: "a12l3-i2", front: "Why does solving one NP-complete problem fast solve them all?", back: "They are all polynomially inter-reducible, so a poly algorithm for one gives one for every NP problem (P = NP)." },
            { id: "a12l3-i3", front: "Four ways to cope with an NP-complete problem?", back: "Approximation algorithms, heuristics/exact-exponential methods, restricting to special cases, and randomization." },
            { id: "a12l3-i4", front: "The practical value of proving NP-completeness?", back: "It tells you to stop seeking a fast exact algorithm and pivot to approximation/heuristics/special structure." },
          ],
        },
      ],
      masteryCheck: {
        id: "a12-check",
        questions: [
          { id: "a12q1", type: "mcq", prompt: "A problem is in NP if:", options: ["a proposed solution (certificate) can be verified in polynomial time", "it can be solved in polynomial time", "it has no solution", "it is undecidable"], answer: 0, explanation: "NP = polynomial-time verifiable, given a certificate." },
          { id: "a12q2", type: "short", prompt: "A polynomial-time reduction from A to B shows that if B is easy then A is easy — so B is at least as ____ as A.", accept: ["hard", "difficult", "hard as a"], explanation: "Reductions transfer hardness: B is at least as hard as A." },
          { id: "a12q3", type: "mcq", prompt: "To prove a problem X is NP-complete, you show X ∈ NP and:", options: ["reduce a known NP-complete problem TO X", "reduce X to a problem in P", "show X ∈ P", "show X is undecidable"], answer: 0, explanation: "Step 2 (a reduction from a known-complete problem) makes X NP-hard." },
          { id: "a12q4", type: "short", prompt: "By the Cook-Levin theorem, the first problem proven NP-complete was ____ (boolean satisfiability).", accept: ["SAT", "satisfiability", "boolean satisfiability", "3-SAT", "3SAT"], explanation: "Cook-Levin established SAT as NP-complete." },
          {
            id: "a12q5",
            type: "proof",
            points: 3,
            prompt: "Prove that VERTEX-COVER is in NP. Then state the two steps required to prove it is NP-complete.",
            rubric: [
              "States the problem: graph G and integer k; yes iff some ≤ k vertices touch every edge.",
              "Gives a polynomial-size certificate: a vertex subset S.",
              "Describes the polynomial-time verifier: check |S| ≤ k and that every edge has an endpoint in S; concludes VERTEX-COVER ∈ NP.",
              "States the two NP-completeness steps: (1) membership in NP (just shown), and (2) a poly-time reduction FROM a known NP-complete problem TO VERTEX-COVER.",
            ],
            solution: "An instance of VERTEX-COVER is a graph G = (V, E) and an integer k; it is a yes-instance iff some set of at most k vertices includes an endpoint of every edge. Membership in NP: use a candidate vertex set S as the certificate (size at most |V|, polynomial). The verifier checks, in polynomial time, that |S| ≤ k and that for every edge (u, v) ∈ E at least one of u, v lies in S — a single pass over the edges, O(|V| + |E|). It accepts exactly the yes-instances, so VERTEX-COVER ∈ NP. To prove VERTEX-COVER NP-complete requires two things: (1) show it is in NP (done above), and (2) give a polynomial-time reduction from a known NP-complete problem (such as CLIQUE, INDEPENDENT-SET, or 3-SAT) to VERTEX-COVER, which establishes NP-hardness. Together these give NP-completeness. ∎",
            explanation: "A vertex subset is a checkable certificate (NP); NP-completeness then needs a reduction from a known-complete problem.",
          },
          {
            id: "a12q6",
            type: "proof",
            points: 3,
            prompt: "Suppose A ≤_p B (A polynomial-time reduces to B) and B ∈ P. Prove that A ∈ P. (This is why a polynomial algorithm for an NP-complete problem would put all of NP in P.)",
            rubric: [
              "States the properties of the reduction R: poly-time computable, with x ∈ A iff R(x) ∈ B, and |R(x)| polynomially bounded.",
              "States that B has a polynomial-time decider.",
              "Composes: compute R(x), then run B's decider on R(x); argues correctness via the answer-preserving property.",
              "Bounds the total time as a polynomial in |x| (composition of polynomials), concluding A ∈ P.",
            ],
            solution: "Since A ≤_p B, there is a reduction R computable in time p(|x|) for some polynomial p with x ∈ A ⇔ R(x) ∈ B; in particular |R(x)| ≤ p(|x|), as R cannot output more than it has time to write. Since B ∈ P, there is an algorithm D deciding B in time q(m) for some polynomial q on inputs of size m. Decide A on input x as follows: compute y = R(x), then return D(y). Correctness is immediate from x ∈ A ⇔ R(x) = y ∈ B. The running time is p(|x|) to build y plus q(|y|) ≤ q(p(|x|)) to run D — a sum of a polynomial and a composition of polynomials, which is itself polynomial in |x|. Hence A is decidable in polynomial time, i.e. A ∈ P. ∎",
            explanation: "Run the poly-time reduction, then B's poly-time decider; polynomial ∘ polynomial is polynomial.",
          },
        ],
      },
    },
    {
      id: "a13",
      title: "Approximation & Randomized Algorithms",
      summary: "Coping with intractability: provably-near-optimal approximations, and randomization analyzed with indicator variables.",
      prerequisites: ["a12"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "a13l1",
          title: "Approximation Algorithms",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Provably close to optimal",
              body: `When exact optimization is NP-hard, settle for a solution provably within a factor of optimal. For a minimization problem, an algorithm is a **ρ-approximation** if its output is always at most ρ·OPT (ρ ≥ 1). Crucially, you bound the ratio *without knowing OPT*, by comparing both the algorithm's output and OPT to a common quantity you can reason about.`,
            },
            {
              type: "example",
              heading: "A 2-approximation for vertex cover",
              body: `Repeatedly pick any uncovered edge and add **both** its endpoints to the cover. The picked edges share no endpoints — they form a **matching** M — so the cover has size 2|M|. But any vertex cover must include at least one endpoint of each (disjoint) matching edge, so OPT ≥ |M|. Therefore the output ≤ 2|M| ≤ 2·OPT: a 2-approximation, in linear time.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The trick is the lower bound on OPT.** Here the matching M lower-bounds OPT (OPT ≥ |M|) and upper-bounds the algorithm (output = 2|M|). Most approximation proofs hinge on finding such a quantity that brackets both.`,
            },
          ],
          reviewItems: [
            { id: "a13l1-i1", front: "What is a ρ-approximation (minimization)?", back: "An algorithm whose output is always ≤ ρ·OPT, with ρ ≥ 1 — provably within a factor of optimal." },
            { id: "a13l1-i2", front: "The vertex-cover 2-approximation algorithm?", back: "Repeatedly pick an uncovered edge and add both endpoints; the picked edges form a matching, so the cover is 2|M|." },
            { id: "a13l1-i3", front: "Why is that algorithm within 2× of optimal?", back: "The matching M satisfies OPT ≥ |M|, and the output is 2|M|, so output ≤ 2·OPT." },
            { id: "a13l1-i4", front: "Common structure of an approximation proof?", back: "Find a quantity that lower-bounds OPT and upper-bounds the algorithm's output, then compare." },
          ],
        },
        {
          id: "a13l2",
          title: "Randomized Algorithms",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Two flavors of randomness",
              body: `A **Las Vegas** algorithm is *always correct*, with running time that is fast *in expectation* (e.g. randomized quicksort). A **Monte Carlo** algorithm is fast with a deterministic bound but only correct *with high probability* (e.g. Miller-Rabin primality, Karger's min-cut) — and you can drive the error down by repeating independent runs.`,
            },
            {
              type: "text",
              heading: "Why randomize",
              body: `Randomness defeats **adversarial inputs**: a random pivot makes quicksort O(n log n) expected on *every* input, with no worst-case ordering to exploit. It also yields algorithms that are **simpler and faster** than the best known deterministic ones (primality testing, min-cut, hashing). The randomness is in the algorithm's coins, not in any assumption about the input.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Las Vegas vs Monte Carlo:** trade certainty in *correctness* against certainty in *time*. Las Vegas fixes the answer and randomizes the runtime; Monte Carlo fixes the runtime and randomizes the answer (with controllable error).`,
            },
          ],
          reviewItems: [
            { id: "a13l2-i1", front: "Las Vegas algorithm?", back: "Always correct; running time fast in expectation (e.g. randomized quicksort)." },
            { id: "a13l2-i2", front: "Monte Carlo algorithm?", back: "Fixed (fast) running time; correct only with high probability — error reducible by repetition (e.g. Miller-Rabin)." },
            { id: "a13l2-i3", front: "Why does randomization help quicksort?", back: "A random pivot defeats adversarial inputs — O(n log n) expected on every input, no exploitable worst-case order." },
            { id: "a13l2-i4", front: "Where does the randomness live?", back: "In the algorithm's own coin flips — not in any assumption about the input distribution." },
          ],
        },
        {
          id: "a13l3",
          title: "Indicator Variables & Quicksort",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The indicator technique",
              body: `To find the expected count of something, define an **indicator random variable** X_e = 1 if event e happens, else 0. Then E[X_e] = Pr[e], and by **linearity of expectation** the expected total is the sum of these probabilities — even when the events are dependent. This turns a hard expectation into a sum of easy probabilities.`,
            },
            {
              type: "example",
              heading: "Randomized quicksort's expected comparisons",
              body: `Let z_i < z_j be the i-th and j-th smallest elements, and X_ij = 1 if they're ever compared. They are compared exactly when the *first* pivot chosen from {z_i,…,z_j} is z_i or z_j (2 of the j−i+1 elements), so Pr = 2/(j−i+1). By linearity, E[comparisons] = Σ_{i<j} 2/(j−i+1) = O(n log n) — the rigorous version of the bound asserted back in Unit 3.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Linearity is the superpower.** It holds with no independence assumption, so you can sum probabilities of dependent events freely. Most expected-value analyses in randomized algorithms reduce to "define the right indicators, sum their probabilities."`,
            },
          ],
          reviewItems: [
            { id: "a13l3-i1", front: "Indicator random variable, and its expectation?", back: "X_e = 1 if event e occurs else 0; E[X_e] = Pr[e]." },
            { id: "a13l3-i2", front: "Why is linearity of expectation so useful here?", back: "E[Σ X] = Σ E[X] holds even for dependent events — turning a hard expectation into a sum of probabilities." },
            { id: "a13l3-i3", front: "Probability the i-th and j-th smallest are compared in quicksort?", back: "2/(j−i+1) — they're compared iff the first pivot from their range is one of the two endpoints." },
            { id: "a13l3-i4", front: "Expected comparisons of randomized quicksort, via indicators?", back: "Σ_{i<j} 2/(j−i+1) = O(n log n)." },
          ],
        },
      ],
      masteryCheck: {
        id: "a13-check",
        questions: [
          { id: "a13q1", type: "numeric", prompt: "A 2-approximation algorithm for a minimization problem guarantees its output is at most how many times the optimal? Give the factor.", answer: 2, tolerance: 0, explanation: "Output ≤ 2·OPT by definition of a 2-approximation." },
          { id: "a13q2", type: "mcq", prompt: "A Las Vegas randomized algorithm:", options: ["always returns the correct answer, with running time fast in expectation", "is fast but may return a wrong answer", "never uses randomness", "only works on sorted input"], answer: 0, explanation: "Las Vegas = always correct, expected-fast (vs Monte Carlo: fixed-fast, possibly wrong)." },
          { id: "a13q3", type: "short", prompt: "Defining a 0/1 variable for each event and summing expectations via linearity is the ____ random variable method.", accept: ["indicator", "indicator random variable"], explanation: "Indicator random variables + linearity of expectation." },
          { id: "a13q4", type: "numeric", prompt: "In randomized quicksort, the i-th and j-th smallest elements (i<j) are compared with probability 2/(j−i+1). For the smallest and largest of n = 4 distinct elements (so j−i+1 = 4), what is that probability, as a decimal?", answer: 0.5, tolerance: 0.01, explanation: "2/(j−i+1) = 2/4 = 0.5." },
          {
            id: "a13q5",
            type: "proof",
            points: 3,
            prompt: "Prove that the greedy algorithm 'while an uncovered edge exists, pick one and add both its endpoints' is a 2-approximation for minimum VERTEX-COVER.",
            rubric: [
              "Notes the output is a valid vertex cover (the loop ends only when all edges are covered).",
              "Observes the picked edges are pairwise vertex-disjoint — a matching M — so the output has size 2|M|.",
              "Lower-bounds OPT: any vertex cover must include an endpoint of each of the disjoint matching edges, so OPT ≥ |M|.",
              "Concludes output = 2|M| ≤ 2·OPT (and notes polynomial running time).",
            ],
            solution: "Algorithm: while some edge is uncovered, pick any such edge (u, v), add both u and v to the cover, and remove all edges incident to u or v. The result C is a vertex cover because the loop stops only when every edge has a chosen endpoint. Let M be the set of edges the algorithm picked. These edges are pairwise vertex-disjoint — once (u, v) is picked, every edge touching u or v is removed — so M is a matching, and C consists of exactly the two endpoints of each edge of M, giving |C| = 2|M|. Let C* be a minimum vertex cover. C* must contain at least one endpoint of every edge of M, and because the edges of M are disjoint those endpoints are distinct, so |C*| ≥ |M|. Combining, |C| = 2|M| ≤ 2|C*| = 2·OPT. The algorithm runs in polynomial (indeed linear) time, so it is a 2-approximation. ∎",
            explanation: "The picked edges form a matching: it both equals half the output and lower-bounds OPT.",
          },
          {
            id: "a13q6",
            type: "proof",
            points: 3,
            prompt: "Using indicator random variables and linearity of expectation, derive that randomized quicksort makes O(n log n) expected comparisons. You may use that the i-th and j-th smallest elements are compared iff the first pivot chosen from their range is one of them, giving probability 2/(j−i+1).",
            rubric: [
              "Defines X_ij = 1 if the i-th and j-th smallest elements are compared, and notes each pair is compared at most once.",
              "States E[X_ij] = Pr[compared] = 2/(j−i+1), justified by the 'first pivot in the range' fact.",
              "Writes total comparisons X = Σ_{i<j} X_ij and applies linearity of expectation.",
              "Evaluates/bounds the double sum (via the harmonic series) to conclude E[X] = O(n log n).",
            ],
            solution: "Let z_1 < z_2 < … < z_n be the elements in sorted order and define X_ij = 1 if z_i and z_j are ever compared during the sort, else 0; any pair is compared at most once, since a comparison always involves the current pivot, which is then removed. The pair z_i, z_j is compared iff the first element chosen as a pivot from {z_i, …, z_j} is z_i or z_j: if instead some element strictly between them is chosen first, they fall into different subproblems and are never compared. The pivot is uniform over those j − i + 1 elements, so E[X_ij] = Pr[X_ij = 1] = 2/(j − i + 1). The total number of comparisons is X = Σ_{i<j} X_ij, so by linearity of expectation E[X] = Σ_{i=1}^{n-1} Σ_{j=i+1}^{n} 2/(j − i + 1). Setting k = j − i + 1, the inner sum is at most Σ_{k=2}^{n} 2/k < 2 H_n = O(log n), hence E[X] < Σ_{i=1}^{n-1} 2 H_n = O(n log n) (in fact ≈ 2n ln n). Therefore randomized quicksort makes O(n log n) expected comparisons. ∎",
            explanation: "Indicators per pair with probability 2/(j−i+1); linearity turns the expectation into a harmonic sum that is O(n log n).",
          },
        ],
      },
    },
  ],
};
