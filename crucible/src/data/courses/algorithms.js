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
          title: "Asymptotic Notation: Five Sets of Functions",
          estMinutes: 30,
          content: [
            {
              type: "text",
              heading: "The model we measure against",
              body: `We analyze algorithms in the **RAM model**: each elementary operation — an arithmetic op, a comparison, a memory read or write, a branch — costs Θ(1), and the running time is the number of such operations as a function of the input size n. We then compare these counts *asymptotically*: by how they grow as n → ∞, discarding constant factors (artifacts of the machine, language, and compiler) and lower-order terms (irrelevant once n is large).\n\nThis is not laziness — it is the level of abstraction at which a statement about an algorithm is *portable*. "Merge sort is Θ(n log n)" is true on every machine; "merge sort takes 4.2n log n + 17n nanoseconds" is true on exactly one. Asymptotic notation is the machinery that turns "grows like" into something you can *prove*. Each of the five symbols below names a **set of functions**.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "O — asymptotic upper bound",
              statement: `For a function g(n), **O(g(n))** is the set of all functions f(n) such that there exist positive constants c and n₀ with\n\n  0 ≤ f(n) ≤ c·g(n)  for all n ≥ n₀.\n\nWe write f(n) = O(g(n)) to mean f ∈ O(g(n)). Read it as: beyond some threshold n₀, f is bounded above by a constant multiple of g.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Ω — asymptotic lower bound",
              statement: `**Ω(g(n))** is the set of functions f(n) for which there exist positive constants c and n₀ with\n\n  0 ≤ c·g(n) ≤ f(n)  for all n ≥ n₀.\n\nBeyond n₀, f is bounded *below* by a constant multiple of g — a guaranteed floor on the cost.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Θ — asymptotically tight bound",
              statement: `**Θ(g(n))** is the set of functions f(n) for which there exist positive constants c₁, c₂, and n₀ with\n\n  0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n)  for all n ≥ n₀.\n\nf is sandwiched between two constant multiples of g. This is the bound you usually *want* — it pins down the growth rate exactly, not just from one side.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Θ = O ∩ Ω",
              statement: `f(n) = Θ(g(n)) if and only if f(n) = O(g(n)) and f(n) = Ω(g(n)).`,
              proof: `(⇒) Suppose f = Θ(g) with witnesses c₁, c₂, n₀. Then for n ≥ n₀ we have 0 ≤ f(n) ≤ c₂·g(n), so f = O(g) (take c = c₂, n₀); and 0 ≤ c₁·g(n) ≤ f(n), so f = Ω(g) (take c = c₁, n₀).\n\n(⇐) Suppose f = O(g) with constants c₂, n₂ and f = Ω(g) with constants c₁, n₁. Let n₀ = max(n₁, n₂). For every n ≥ n₀ both bounds hold simultaneously, so\n\n  0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n),\n\nwhich is exactly f = Θ(g) with witnesses c₁, c₂, n₀. ∎\n\nThis theorem *is* the standard recipe for a tight bound: prove the upper bound (O) and the lower bound (Ω) separately, then invoke it to conclude Θ.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "o and ω — the strict bounds",
              statement: `**o(g(n))** is the set of f(n) such that for *every* constant c > 0 there is an n₀ with 0 ≤ f(n) < c·g(n) for all n ≥ n₀. The quantifier is "for all c", not "for some c" — that is what makes the bound strict. When the ratio has a limit, f = o(g) ⟺ lim_{n→∞} f(n)/g(n) = 0.\n\nSymmetrically, **ω(g(n))** is the set of f(n) such that for every c > 0, eventually f(n) > c·g(n) ≥ 0; equivalently lim f(n)/g(n) = ∞. So o and ω are the strictly-smaller and strictly-larger analogues of O and Ω.`,
            },
            {
              type: "example",
              heading: "A tight bound, proved from the definition",
              body: `**Claim:** ½n² − 3n = Θ(n²).\n\n*Upper (O).* For all n ≥ 0, ½n² − 3n ≤ ½n² (subtracting 3n only decreases it), so c₂ = ½ works.\n*Lower (Ω).* We want ½n² − 3n ≥ c₁n² for some c₁ > 0. Take c₁ = ¼: ½n² − 3n ≥ ¼n² ⟺ ¼n² ≥ 3n ⟺ n ≥ 12.\n\nSo for all n ≥ 12, ¼n² ≤ ½n² − 3n ≤ ½n². By the Θ = O ∩ Ω theorem, ½n² − 3n = Θ(n²), with witnesses c₁ = ¼, c₂ = ½, n₀ = 12. The −3n term is asymptotically invisible — exactly as the notation promises.`,
            },
            {
              type: "example",
              heading: "Disproving a bound by contradiction",
              body: `**Claim:** 6n³ ≠ O(n²).\n\nSuppose, for contradiction, that 6n³ = O(n²). Then there are constants c, n₀ with 6n³ ≤ c·n² for all n ≥ n₀. Dividing by n² > 0 gives 6n ≤ c for all n ≥ n₀ — but 6n → ∞ exceeds any fixed constant c. Contradiction. Hence 6n³ ≠ O(n²). ∎\n\n*The technique:* to refute an O-bound, assume it and derive an unbounded consequence.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Transitivity",
              statement: `If f(n) = O(g(n)) and g(n) = O(h(n)), then f(n) = O(h(n)). The same holds with O replaced throughout by Ω, Θ, o, or ω.`,
              proof: `From f = O(g): there are c₁ > 0, n₁ with f(n) ≤ c₁·g(n) for all n ≥ n₁. From g = O(h): there are c₂ > 0, n₂ with g(n) ≤ c₂·h(n) for all n ≥ n₂. Let n₀ = max(n₁, n₂). For every n ≥ n₀ both hold, and since c₁ > 0 we may multiply the second bound by c₁ without flipping it:\n\n  f(n) ≤ c₁·g(n) ≤ c₁·(c₂·h(n)) = (c₁c₂)·h(n).\n\nWith c = c₁c₂ > 0 and threshold n₀ this is f = O(h). The arguments for Ω, Θ, o, ω are identical mutatis mutandis. ∎`,
            },
            {
              type: "theorem",
              kind: "proposition",
              name: "Transpose symmetry",
              statement: `f(n) = O(g(n)) if and only if g(n) = Ω(f(n)). Likewise f(n) = o(g(n)) if and only if g(n) = ω(f(n)).`,
              proof: `f = O(g) means: ∃ c > 0, n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀. Since c > 0, this inequality is equivalent to 0 ≤ (1/c)·f(n) ≤ g(n) for all n ≥ n₀, which is exactly the statement g = Ω(f) with lower-bound constant 1/c and the same threshold. The o ⟺ ω case is the same with the strict "for every constant" quantifier. ∎\n\nThis is *why* "an upper bound on f" and "a lower bound on g" are two descriptions of one relationship — and why a Θ-bound is symmetric: f = Θ(g) ⟺ g = Θ(f).`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The "=" is a one-way abuse of notation.** In f(n) = O(g(n)) the "=" means "∈", not equality. So n = O(n²) is fine, but O(n²) = n is meaningless, and you must never read it as symmetric: n = O(n²) and n² = O(n²) do **not** give n = n². When an O / Ω / Θ sits on one side of an "=", read it as set membership and never flip or chain it as ordinary equality.`,
            },
            {
              type: "text",
              heading: "Which bound to claim",
              body: `These are not interchangeable, and stating the wrong one is the most common rigor error in the literature:\n\n**O** — a worst-case ceiling, possibly loose. Proving an algorithm is O(n²) does *not* say it is quadratic; its true growth could be Θ(n).\n**Ω** — a guaranteed floor. Most useful as a statement about a *problem* ("any comparison sort is Ω(n log n)"), not just one algorithm.\n**Θ** — the exact growth rate. Claim it only when you have proved both sides.\n\nA clean analysis names the case (best / worst / average) *and* the right symbol.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "Prove directly from the definition that 10n² + 7n + 3 = O(n²).",
                  solution: "For all n ≥ 1 we have n ≤ n² and 1 ≤ n², so 10n² + 7n + 3 ≤ 10n² + 7n² + 3n² = 20n². Thus c = 20, n₀ = 1 witness 10n² + 7n + 3 = O(n²). ∎",
                },
                {
                  prompt: "Prove 2^(n+1) = Θ(2ⁿ).",
                  solution: "2^(n+1) = 2·2ⁿ, so 2·2ⁿ ≤ 2^(n+1) ≤ 2·2ⁿ holds with equality for all n ≥ 0. Hence c₁ = c₂ = 2, n₀ = 0 give Θ(2ⁿ). (The ratio is the constant 2.) Contrast: 2^(2n) = (2ⁿ)² is *not* Θ(2ⁿ).",
                },
                {
                  prompt: "Show that no function is both o(g) and Ω(g). (This is why o and Θ are disjoint.)",
                  hint: "Use the 'for every c' strength of little-o, instantiated at the c from the Ω bound.",
                  solution: "Suppose f = o(g) and f = Ω(g). From f = Ω(g): ∃ c > 0, n₁ with f(n) ≥ c·g(n) > 0 for n ≥ n₁ (so g(n) > 0 there). From f = o(g) applied to *this* c: ∃ n₂ with f(n) < c·g(n) for n ≥ n₂. At any n ≥ max(n₁, n₂) we get c·g(n) ≤ f(n) < c·g(n) — a contradiction. So no f is both. ∎",
                },
                {
                  prompt: "True or false, with proof: n^1.5 = O(n log n).",
                  solution: "False. If n^1.5 ≤ c·n log n for all n ≥ n₀, then dividing by n gives √n ≤ c·log n for all such n. But √n / log n → ∞ (a positive power beats any logarithm — proved next lesson), so eventually √n > c·log n, a contradiction. Hence n^1.5 ≠ O(n log n). ∎",
                },
                {
                  prompt: "Prove max(f(n), g(n)) = Θ(f(n) + g(n)) for eventually-nonnegative f, g.",
                  solution: "Where f, g ≥ 0: each of f, g ≤ max(f, g), so f + g ≤ 2·max(f, g); and max(f, g) ≤ f + g. Combining, ½(f + g) ≤ max(f, g) ≤ (f + g). Witnesses c₁ = ½, c₂ = 1. So a sum and a max of nonnegative functions are asymptotically the same — handy for collapsing T(n) = max(...) bounds. ∎",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "a1l1-i1", front: "Definition of f(n) = O(g(n))?", back: "∃ c > 0 and n₀ such that 0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀ — an eventual upper bound within a constant factor." },
            { id: "a1l1-i2", front: "Definition of Θ(g), and how do you usually prove it?", back: "f = O(g) AND f = Ω(g): ∃ c₁,c₂,n₀ with c₁g ≤ f ≤ c₂g for n ≥ n₀. Prove the O and Ω sides separately, then combine." },
            { id: "a1l1-i3", front: "What makes o(g) strictly stronger than O(g)?", back: "The bound f < c·g must hold for EVERY c > 0 (not just some c) — equivalently lim f/g = 0." },
            { id: "a1l1-i4", front: "Transpose symmetry?", back: "f = O(g) ⟺ g = Ω(f); f = o(g) ⟺ g = ω(f). An upper bound on f is a lower bound on g." },
            { id: "a1l1-i5", front: "Why is 'this algorithm is O(n²)' weaker than 'Θ(n²)'?", back: "O is only an upper bound — the true cost could be smaller (e.g. Θ(n)). Θ asserts the exact growth, both sides proved." },
            { id: "a1l1-i6", front: "What does the '=' in f(n) = O(g(n)) really mean?", back: "Set membership (∈), not equality — it is one-directional and must never be flipped or chained as ordinary '='." },
          ],
        },
        {
          id: "a1l2",
          title: "Growth of Functions: The Hierarchy and the Limit Method",
          estMinutes: 30,
          content: [
            {
              type: "text",
              heading: "A small zoo of functions",
              body: `Almost every running time you will meet is built from a handful of functions: constants, logarithms, roots, polynomials, exponentials, and factorials. Knowing their order — and being able to *prove* it — is what lets you read off which algorithm wins for large n. The standard chain, under ≺ (meaning "is o( ) of"), is\n\n  1 ≺ log* n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n² ≺ n³ ≺ 2ⁿ ≺ 3ⁿ ≺ n! ≺ nⁿ.\n\nTwo theorems generate almost all of it: **logarithms lose to any positive power**, and **any polynomial loses to any exponential with base > 1**. We prove both.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Logarithms lose to powers",
              statement: `For every constant ε > 0, log n = o(n^ε). (Hence log n = O(n^ε), and log^k n = o(n^ε) for any fixed k.)`,
              proof: `Work with the natural log; log_b n = ln n / ln b differs only by the constant factor 1/ln b, which does not affect o(·). We show lim_{n→∞} (ln n)/n^ε = 0. Numerator and denominator both → ∞, so by L'Hôpital's rule,\n\n  lim (ln n)/n^ε = lim (1/n)/(ε·n^(ε−1)) = lim 1/(ε·n^ε) = 0,\n\nsince ε > 0. Therefore ln n = o(n^ε). For log^k n: (log^k n)/n^ε = (log n / n^(ε/k))^k, and the inside → 0 by the case just proved, so the k-th power → 0 as well. ∎`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Powers lose to exponentials",
              statement: `For every constant k ≥ 0 and every constant base c > 1, n^k = o(cⁿ).`,
              proof: `Consider ln of the ratio: ln(n^k / cⁿ) = k·ln n − n·ln c. Here ln c > 0, and by the previous theorem ln n = o(n), so n·ln c grows strictly faster than k·ln n; thus k·ln n − n·ln c → −∞. Therefore n^k / cⁿ = exp(k·ln n − n·ln c) → e^(−∞) = 0, i.e. n^k = o(cⁿ). ∎\n\n(Equivalently, k applications of L'Hôpital reduce n^k/cⁿ to k!/((ln c)^k·cⁿ) → 0.)`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Stirling's approximation and log(n!)",
              statement: `Stirling's formula: n! = √(2πn)·(n/e)ⁿ·(1 + Θ(1/n)). A direct corollary is log(n!) = Θ(n log n).`,
              proof: `We prove the Θ-bound on log(n!) directly, without the full Stirling constant.\n\n*Upper.* n! = ∏_{k=1}^{n} k ≤ ∏_{k=1}^{n} n = nⁿ, so log(n!) ≤ n log n.\n*Lower.* Keep only the top half of the factors: n! ≥ ∏_{k=⌈n/2⌉}^{n} k ≥ (n/2)^(n/2), since each of those ≥ n/2 factors is itself ≥ n/2. Taking logs, log(n!) ≥ (n/2)·log(n/2) = (n/2)(log n − 1). For n ≥ 4, log n − 1 ≥ ½ log n, so log(n!) ≥ (n/4)·log n.\n\nCombining, (n/4)·log n ≤ log(n!) ≤ n·log n, i.e. log(n!) = Θ(n log n). ∎\n\nThis is the bound behind comparison sorting: a decision tree with n! leaves has height Θ(n log n).`,
            },
            {
              type: "text",
              heading: "Standard functions, and one that crawls",
              body: `A few facts complete the toolkit. **Bases are irrelevant inside Θ:** log_a n = Θ(log_b n) for constants a, b > 1, because they differ by the constant factor log_a b — so we omit the base of a logarithm under O/Θ/Ω. **Identity worth knowing:** a^(log_b n) = n^(log_b a) (take log_b of both sides). A degree-d polynomial is Θ(n^d), dominated by its leading term.\n\nThe slowest-growing function you will meet is the **iterated logarithm** log* n — the number of times you must apply log to bring n down to ≤ 1. It is effectively a small constant in practice: log*(2^65536) = 5. It is the cost (amortized, per operation) of union–find, taken up in Arc 3.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "The limit method",
              statement: `Suppose L = lim_{n→∞} f(n)/g(n) exists in [0, ∞] (with g eventually positive). Then:  L = 0 ⇒ f = o(g);  0 < L < ∞ ⇒ f = Θ(g);  L = ∞ ⇒ f = ω(g).`,
              proof: `*L = 0.* By definition of the limit, for every ε > 0 there is n₀ with f(n)/g(n) < ε for n ≥ n₀; since f, g ≥ 0 this is 0 ≤ f(n) < ε·g(n). As ε > 0 was arbitrary, f = o(g).\n*0 < L < ∞.* Take ε = L/2. Eventually L/2 < f(n)/g(n) < 3L/2, i.e. (L/2)·g(n) < f(n) < (3L/2)·g(n). That is f = Θ(g) with c₁ = L/2, c₂ = 3L/2.\n*L = ∞.* For every constant c, eventually f(n)/g(n) > c, i.e. f(n) > c·g(n) ≥ 0; that is f = ω(g). ∎`,
            },
            {
              type: "example",
              heading: "The method in action",
              body: `**(a)** n²/2ⁿ → 0 (powers lose to exponentials), so n² = o(2ⁿ).\n**(b)** (ln n)/(log₂ n) = ln 2, a constant in (0, ∞), so ln n = Θ(log₂ n) — confirming base-independence.\n**(c)** Where does n^(log₂ n) sit? Write it as 2^((log₂ n)²) and compare to 2ⁿ. The exponents satisfy (log₂ n)² = o(n) (logs lose to powers), so n^(log₂ n) = o(2ⁿ); but (log₂ n)² = ω(k·log₂ n) for every constant k, so n^(log₂ n) = ω(n^k) for every k. It is **quasi-polynomial** — strictly above every polynomial, strictly below 2ⁿ.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The limit method is sufficient, not necessary.** It only applies when the ratio f/g actually converges (or → ∞). The function f(n) = n^(1 + sin n) oscillates: f(n)/n has no limit, yet n⁰ and n² still bound f, so f is O- and Ω-comparable to powers with no limiting ratio. And the converse fails too — f = Θ(g) does **not** imply lim f/g exists. When the limit misbehaves, fall back to the definitions.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "Prove 2ⁿ = o(n!).",
                  hint: "Either bound n!/2ⁿ as a product of growing factors, or compare logs.",
                  solution: "Compare logarithms: log(2ⁿ) = n, while log(n!) = Θ(n log n) by Stirling's corollary. Since n = o(n log n), we get log(2ⁿ) = o(log(n!)), and as both → ∞ the ratio 2ⁿ/n! → 0. (Directly: n!/2ⁿ = ∏_{k=1}^{n}(k/2); every factor with k ≥ 4 is ≥ 2, so the product → ∞.) Hence 2ⁿ = o(n!). ∎",
                },
                {
                  prompt: "Prove log_a n = Θ(log_b n) for any constants a, b > 1, and explain why this licenses dropping the base inside Θ.",
                  solution: "log_a n = (log_b n)/(log_b a). Since log_b a is a positive constant, log_a n is a constant multiple of log_b n, so each is O and Ω of the other: Θ-equivalent (c₁ = c₂ = 1/log_b a). Because the base only changes a constant factor, and Θ ignores constant factors, we write 'log n' with no base under asymptotic notation. ∎",
                },
                {
                  prompt: "Rank, with justification: n,  2^(log₂ n),  n·log n,  √n · log n.",
                  solution: "2^(log₂ n) = n, so those two are equal (Θ(n)). √n·log n = o(n) since (√n·log n)/n = (log n)/√n → 0 (logs lose to the power n^(1/2)). And n log n = ω(n). Order: √n·log n ≺ n = 2^(log₂ n) ≺ n log n. ∎",
                },
                {
                  prompt: "Disprove 4ⁿ = O(2ⁿ).",
                  solution: "4ⁿ/2ⁿ = (4/2)ⁿ = 2ⁿ → ∞, so 4ⁿ = ω(2ⁿ), which is incompatible with 4ⁿ = O(2ⁿ). The trap: 4ⁿ = (2²)ⁿ = 2^(2n), and 2^(2n) is exponentially larger than 2ⁿ — exponents do not hide in constant factors. ∎",
                },
                {
                  prompt: "Use L'Hôpital or a substitution to prove that for every ε > 0, (ln n)^100 = o(n^ε).",
                  hint: "Reduce to the single-log case already proved.",
                  solution: "Write (ln n)^100 / n^ε = ( ln n / n^(ε/100) )^100. By 'logarithms lose to powers' with exponent ε/100 > 0, the inside ln n / n^(ε/100) → 0, so its 100th power → 0. Hence (ln n)^100 = o(n^ε): any fixed power of a log still loses to any positive power of n. ∎",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "a1l2-i1", front: "Why does log n = o(n^ε) for every ε > 0?", back: "L'Hôpital on (ln n)/n^ε gives 1/(ε n^ε) → 0. Any positive power of n eventually beats any (power of a) logarithm." },
            { id: "a1l2-i2", front: "Why does n^k = o(cⁿ) for c > 1?", back: "ln(n^k/cⁿ) = k ln n − n ln c → −∞, so the ratio → 0. Exponentials with base > 1 dominate every polynomial." },
            { id: "a1l2-i3", front: "log(n!) = Θ(?), and the proof idea?", back: "Θ(n log n). Upper: n! ≤ nⁿ. Lower: n! ≥ (n/2)^(n/2). Underlies the comparison-sort lower bound." },
            { id: "a1l2-i4", front: "The limit method: L = lim f/g gives what for 0, finite>0, ∞?", back: "L = 0 ⇒ o(g); 0 < L < ∞ ⇒ Θ(g); L = ∞ ⇒ ω(g)." },
            { id: "a1l2-i5", front: "Is the limit method necessary for a Θ-bound?", back: "No — it is only sufficient. f = Θ(g) need not have a limiting ratio (e.g. oscillating f), and the limit may simply not exist." },
            { id: "a1l2-i6", front: "Why drop the base of a logarithm inside Θ?", back: "log_a n = (log_b n)/(log_b a) — a constant-factor difference, which Θ ignores." },
          ],
        },
        {
          id: "a1l3",
          title: "Counting the Work: Sums and Series",
          estMinutes: 28,
          content: [
            {
              type: "text",
              heading: "From code to a sum",
              body: `The running time of a loop nest is the sum of the inner work over the loop's index values. So analysis is, in large part, the discipline of writing that sum *exactly* — honoring data-dependent bounds — and then identifying its asymptotic class. This lesson builds the small library of closed forms and bounding techniques that resolve nearly every sum you will meet, each proved rather than recalled.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Arithmetic series",
              statement: `Σ_{i=1}^{n} i = n(n+1)/2 = Θ(n²). More generally Σ_{i=1}^{n} i^k = Θ(n^(k+1)) for any constant k ≥ 0.`,
              proof: `(Gauss's pairing.) Let S = 1 + 2 + ⋯ + n. Write the same sum forwards and backwards and add termwise:\n\n  S = 1 + 2 + ⋯ + n\n  S = n + (n−1) + ⋯ + 1\n  2S = (n+1) + (n+1) + ⋯ + (n+1) = n(n+1),\n\nso S = n(n+1)/2. For the general power, the integral bounds below give ∫₀ⁿ x^k dx = n^(k+1)/(k+1) ≤ Σ i^k ≤ ∫₁^(n+1) x^k dx = Θ(n^(k+1)). ∎`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Geometric series",
              statement: `For r ≠ 1, Σ_{i=0}^{n} rⁱ = (r^(n+1) − 1)/(r − 1). Asymptotically: if r > 1 it is Θ(rⁿ) (the last term dominates); if 0 < r < 1 it converges to 1/(1−r) = Θ(1); if r = 1 it is n + 1 = Θ(n).`,
              proof: `Let S = Σ_{i=0}^{n} rⁱ. Then rS = Σ_{i=0}^{n} r^(i+1) = Σ_{i=1}^{n+1} rⁱ, and subtracting telescopes:\n\n  rS − S = r^(n+1) − r⁰ = r^(n+1) − 1,\n\nso (r − 1)S = r^(n+1) − 1 and S = (r^(n+1) − 1)/(r − 1). For r > 1, S = (r^(n+1) − 1)/(r − 1) lies between rⁿ and rⁿ·(r/(r−1)), both Θ(rⁿ). For 0 < r < 1, S < 1/(1 − r), a constant, and S ≥ 1, so Θ(1). ∎\n\nThe r > 1 case is worth internalizing: **a growing geometric series is dominated by its largest term** — which is exactly why the leaves dominate in a bottom-heavy recursion tree.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "The integral method for monotone sums",
              statement: `If f is monotonically increasing, then ∫_(m−1)^(n) f(x) dx ≤ Σ_{i=m}^{n} f(i) ≤ ∫_(m)^(n+1) f(x) dx. If f is monotonically decreasing, both inequalities reverse.`,
              proof: `Take f increasing. For each integer i, monotonicity gives, on the unit interval to the right, f(i) ≤ f(x) for x ∈ [i, i+1], so f(i) ≤ ∫_i^(i+1) f(x) dx; and on the interval to the left, f(x) ≤ f(i) for x ∈ [i−1, i], so ∫_(i−1)^i f(x) dx ≤ f(i). Summing the first over i = m..n gives Σ f(i) ≤ ∫_m^(n+1) f; summing the second gives ∫_(m−1)^n f ≤ Σ f(i). For decreasing f the per-interval inequalities flip, reversing the result. ∎\n\nThis bounds any monotone sum — closed form or not — by an integral you can evaluate.`,
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Harmonic series",
              statement: `H_n = Σ_{i=1}^{n} 1/i = ln n + γ + o(1) = Θ(log n), where γ ≈ 0.5772 is the Euler–Mascheroni constant.`,
              proof: `Apply the integral method to the decreasing function f(x) = 1/x. The upper bound (decreasing case): H_n = Σ_{i=1}^{n} 1/i ≤ 1 + ∫_1^n dx/x = 1 + ln n. The lower bound: H_n ≥ ∫_1^(n+1) dx/x = ln(n+1). So ln(n+1) ≤ H_n ≤ 1 + ln n, hence H_n = Θ(log n). ∎\n\nThe harmonic sum is the textbook example of a series that *just barely* diverges — to Θ(log n) — and it appears in quicksort's average case, in the coupon-collector bound, and in skip-list analysis.`,
            },
            {
              type: "example",
              heading: "Two loops, read off their sums",
              body: `**Triangular nest.** \`for i = 1..n: for j = 1..i: O(1)\` runs Σ_{i=1}^{n} i = n(n+1)/2 = Θ(n²). The triangular shape saves a factor of 2 over the full n × n square — a constant — so the class is unchanged.\n\n**Geometric index.** \`i = 1; while i ≤ n: O(1); i = 2·i\` takes i through 1, 2, 4, …, so it runs ⌊log₂ n⌋ + 1 = Θ(log n) times. *Multiplying* the index (rather than adding) collapses the count to logarithmic — the engine behind binary search and balanced-tree heights.`,
            },
            {
              type: "text",
              heading: "Telescoping and perturbation",
              body: `Two manipulations resolve most sums without a memorized formula. **Telescoping:** if the term is a difference a_(i+1) − a_i, the sum collapses: Σ_{i=1}^{n} (a_(i+1) − a_i) = a_(n+1) − a_1. For instance Σ_{i=1}^{n} 1/(i(i+1)) = Σ (1/i − 1/(i+1)) = 1 − 1/(n+1) = Θ(1).\n\n**Perturbation** evaluates sums like Σ i·xⁱ: write S, also write the shifted xS, and solve the resulting equation for S. It yields Σ_{i=1}^{n} i·2ⁱ = (n−1)·2^(n+1) + 2 = Θ(n·2ⁿ) — a sum dominated by its last term despite the linear weight.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Name the case before you sum.** When an inner bound depends on the data — insertion sort's inner loop runs from 1 to i times depending on order — the cost is a *range*. "Θ(n²)" is insertion sort's **worst** case (reverse-sorted, inner loop full: Σ(i−1) = Θ(n²)); its **best** case (already sorted, inner loop trivial: Σ 1 = Θ(n)) is linear. Stating a bound without its case is the most common analysis error.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "Prove Σ_{i=1}^{n} i² = n(n+1)(2n+1)/6, and state its Θ-class.",
                  hint: "Induction on n, or telescope (i+1)³ − i³ = 3i² + 3i + 1.",
                  solution: "Telescoping: Σ_{i=1}^{n} [(i+1)³ − i³] = (n+1)³ − 1. The left side is Σ (3i² + 3i + 1) = 3Σi² + 3·n(n+1)/2 + n. Setting equal: 3Σi² = (n+1)³ − 1 − 3n(n+1)/2 − n; solving gives Σi² = n(n+1)(2n+1)/6 = Θ(n³). ∎",
                },
                {
                  prompt: "Evaluate Σ_{i=1}^{n} i·2ⁱ in closed form by perturbation.",
                  solution: "Let S = Σ_{i=1}^{n} i·2ⁱ. Then 2S = Σ_{i=1}^{n} i·2^(i+1) = Σ_{j=2}^{n+1} (j−1)·2ʲ. Subtract: 2S − S = (n)·2^(n+1) − Σ_{j=1}^{n} 2ʲ ... working it through gives S = (n−1)·2^(n+1) + 2 = Θ(n·2ⁿ). (Check n=1: S = 1·2 = 2; formula: 0·4 + 2 = 2. ✓) ∎",
                },
                {
                  prompt: "Use the integral method to bound Σ_{i=1}^{n} √i to within a constant factor.",
                  solution: "f(x) = √x is increasing, so ∫_0^n √x dx ≤ Σ_{i=1}^{n} √i ≤ ∫_1^(n+1) √x dx. Since ∫ √x = (2/3)x^(3/2), both bounds are Θ(n^(3/2)). Hence Σ √i = Θ(n^(3/2)). ∎",
                },
                {
                  prompt: "Does Σ_{i=1}^{n} 1/i² grow with n? Contrast with the harmonic series.",
                  solution: "It is bounded: by the integral method on the decreasing 1/x², Σ_{i=1}^{n} 1/i² ≤ 1 + ∫_1^n dx/x² = 1 + (1 − 1/n) < 2. So it is Θ(1) (it converges to π²/6). The exponent 2 > 1 makes it converge, whereas the harmonic exponent 1 sits exactly on the boundary and diverges to Θ(log n). ∎",
                },
                {
                  prompt: "A loop runs `j = n; while j ≥ 1: O(1); j = j / 2` (integer division). How many iterations, and why is this the 'same' sum as the doubling loop?",
                  solution: "j takes n, ⌊n/2⌋, ⌊n/4⌋, …, 1, so ⌊log₂ n⌋ + 1 = Θ(log n) iterations — the doubling loop run in reverse. Halving down to 1 and doubling up to n traverse the same Θ(log n) powers of two. ∎",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "a1l3-i1", front: "Σ_{i=1}^{n} i = ?  (and the proof idea)", back: "n(n+1)/2 = Θ(n²). Gauss: add the sum to its reverse, getting n copies of (n+1)." },
            { id: "a1l3-i2", front: "Σ_{i=0}^{n} rⁱ closed form, and its class for r > 1?", back: "(r^(n+1) − 1)/(r − 1), proved by telescoping rS − S. For r > 1 it is Θ(rⁿ) — dominated by the last term." },
            { id: "a1l3-i3", front: "The integral method for a decreasing f?", back: "∫_m^(n+1) f ≤ Σ_{i=m}^{n} f(i) ≤ ∫_(m−1)^n f. Bounds any monotone sum by an integral." },
            { id: "a1l3-i4", front: "H_n = Σ 1/i is Θ(?), proved how?", back: "Θ(log n); integral method on 1/x gives ln(n+1) ≤ H_n ≤ 1 + ln n." },
            { id: "a1l3-i5", front: "Telescoping sum identity?", back: "Σ_{i=1}^{n} (a_(i+1) − a_i) = a_(n+1) − a_1. E.g. Σ 1/(i(i+1)) = 1 − 1/(n+1)." },
            { id: "a1l3-i6", front: "Insertion sort best vs worst case sum?", back: "Worst (reverse-sorted): Σ(i−1) = Θ(n²). Best (sorted): Σ 1 = Θ(n). Always name the case." },
          ],
        },
        {
          id: "a1l4",
          title: "Correctness: Loop Invariants and Termination",
          estMinutes: 26,
          content: [
            {
              type: "text",
              heading: "Testing is not a proof",
              body: `Tests reveal the *presence* of bugs but never their *absence* — they sample finitely many of infinitely many inputs. To **know** an iterative algorithm is correct, you separate two obligations and discharge both: **partial correctness** (if the algorithm halts, the answer is right) via a loop invariant, and **termination** (it does halt) via a decreasing measure. Together they give **total correctness**. This lesson does each in full, on two real algorithms.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Loop invariant — three obligations",
              statement: `A **loop invariant** is a property of the program state that we establish at three points, exactly mirroring induction on the iteration count:\n\n**Initialization** — it holds before the first iteration *(the base case)*.\n**Maintenance** — if it holds before an iteration, it holds before the next *(the inductive step)*.\n**Termination** — when the loop exits, the invariant together with the exit condition yields the desired result.\n\nInitialization and maintenance show the invariant holds before *every* iteration; termination is where you cash it in.`,
            },
            {
              type: "code",
              heading: "Insertion sort",
              lang: "text",
              code: "INSERTION-SORT(A, n):\n  for j = 2 to n:\n    key = A[j]\n    i = j - 1\n    while i > 0 and A[i] > key:\n      A[i+1] = A[i]\n      i = i - 1\n    A[i+1] = key",
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Insertion sort is correct",
              statement: `On termination, INSERTION-SORT(A, n) leaves A[1..n] sorted in nondecreasing order and holding a permutation of its original elements.`,
              proof: `*Invariant:* at the start of the for-loop iteration for index j, the subarray A[1..j−1] is a sorted permutation of the elements originally in A[1..j−1].\n\n**Initialization.** When j = 2, A[1..1] is a single element — trivially sorted, and a permutation of itself.\n**Maintenance.** The inner while-loop shifts every element of A[1..j−1] that exceeds key = A[j] one position to the right, then drops key into the opened slot. Only relocations and one insertion occur, so A[1..j] is a permutation of the original A[1..j]; and key is placed immediately after the last element ≤ it, so A[1..j] is sorted. Incrementing j re-establishes the invariant for the next iteration.\n**Termination.** The for-loop exits with j = n+1, so the invariant reads: A[1..n] is a sorted permutation of the original A[1..n]. That is exactly the claim. ∎\n\n(The for-loop runs over the fixed range 2..n, so termination of the *outer* loop is immediate; the inner while-loop terminates because i strictly decreases and is bounded below by 0.)`,
            },
            {
              type: "code",
              heading: "Binary search",
              lang: "text",
              code: "BINARY-SEARCH(A[1..n] sorted ascending, x):\n  lo = 1; hi = n\n  while lo <= hi:\n    mid = floor((lo + hi) / 2)\n    if A[mid] == x: return mid\n    elif A[mid] < x: lo = mid + 1\n    else:           hi = mid - 1\n  return NIL",
            },
            {
              type: "theorem",
              kind: "theorem",
              name: "Binary search is correct and terminates",
              statement: `BINARY-SEARCH returns an index mid with A[mid] = x if x occurs in A[1..n], and returns NIL otherwise. It performs Θ(log n) iterations.`,
              proof: `*Invariant* (before each test of the while condition): **if x occurs anywhere in A[1..n], then x occurs in A[lo..hi].**\n\n**Initialization.** lo = 1, hi = n, so A[lo..hi] = A[1..n]; the invariant holds vacuously.\n**Maintenance.** Suppose it holds and the loop continues (lo ≤ hi), and let mid = ⌊(lo+hi)/2⌋ ∈ [lo, hi]. If A[mid] = x we return a correct index. If A[mid] < x then, since A is sorted ascending, every entry in A[lo..mid] is ≤ A[mid] < x, so x (if present) is not there; it must lie in A[mid+1..hi], and setting lo = mid+1 preserves the invariant. The case A[mid] > x is symmetric, setting hi = mid−1.\n**Termination (correctness).** The loop exits when lo > hi, i.e. A[lo..hi] is empty. By the invariant, if x occurred in A[1..n] it would lie in this empty range — impossible — so x does not occur, and returning NIL is correct.\n**Termination (halting & count).** The measure μ = hi − lo + 1 (the range size) is a nonnegative integer. Each non-returning branch moves lo above mid or hi below mid, and since mid ∈ [lo, hi] this strictly decreases μ — in fact roughly halves it. A strictly decreasing nonnegative integer reaches 0 in finitely many steps, and halving from n to 0 takes Θ(log n) iterations. ∎`,
            },
            {
              type: "text",
              heading: "Proving termination: well-founded measures",
              body: `Partial correctness says nothing about whether a loop *halts*. To prove it does, exhibit a **measure** μ mapping each state into ℕ (or any well-founded set — one with no infinite strictly-decreasing chain) such that every iteration strictly decreases μ. Because ℕ has no infinite descending chain, the loop must stop.\n\nBinary search used μ = hi − lo + 1. Euclid's gcd uses μ = the smaller argument. A nested loop may need a *lexicographic* measure (an ordered tuple). Partial correctness (an invariant) **plus** termination (a measure) is total correctness — and the two are genuinely separate: a correct-looking invariant proves nothing if the loop can spin forever.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Choosing the invariant *is* the proof.** It must be (a) actually maintained every iteration and (b) strong enough that, with the exit condition, it implies the goal. Too weak and termination proves nothing; too strong and maintenance fails. The three obligations are mechanical once the invariant is right — finding that statement is the entire creative act.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "Give a loop invariant proving that `s = 0; for i = 1..n: s = s + A[i]` returns Σ_{k=1}^{n} A[k].",
                  solution: "Invariant (before the iteration for i): s = Σ_{k=1}^{i−1} A[k]. Initialization: before i = 1, s = 0 = empty sum. Maintenance: the body sets s ← s + A[i] = Σ_{k=1}^{i} A[k], the invariant for i+1. Termination: the loop exits at i = n+1, so s = Σ_{k=1}^{n} A[k]. ∎",
                },
                {
                  prompt: "Prove EUCLID(a, b) = `while b ≠ 0: (a, b) = (b, a mod b); return a` terminates and returns gcd(a, b), for integers a ≥ b ≥ 0, a > 0.",
                  hint: "One invariant for correctness, one measure for termination.",
                  solution: "Invariant: gcd(a, b) equals the gcd of the original inputs, because gcd(a, b) = gcd(b, a mod b) (any common divisor of a, b divides a mod b, and vice versa). Termination: μ = b is a nonnegative integer that strictly decreases each iteration, since a mod b < b; so the loop halts. At exit b = 0, and gcd(a, 0) = a is returned, which by the invariant is the original gcd. ∎",
                },
                {
                  prompt: "BINARY-SEARCH with the guard `while lo < hi` (instead of `lo <= hi`) has a bug. Exhibit an input where it fails, and tie the failure to a specific obligation in the proof above.",
                  solution: "Search A = [5] for x = 5: lo = hi = 1, the guard lo < hi is false, the loop body never runs, and it returns NIL though 5 is present. The termination-correctness step needed the loop to continue until the range is truly *empty* (lo > hi); `lo < hi` stops one step early, with a nonempty single-element range A[lo..hi] still unexamined, so the invariant's conclusion ('x not in an empty range') is never reached. ∎",
                },
                {
                  prompt: "State and prove an invariant for one pass of bubble sort — `for i = 1..n−1: if A[i] > A[i+1]: swap` — establishing that afterwards A[n] = max(A[1..n]).",
                  solution: "Invariant (before the iteration for i): A[i] = max(A[1..i]). Initialization: before i = 1, A[1] = max(A[1..1]). Maintenance: after comparing/swapping at i, the position i+1 holds max(A[i], A[i+1]) = max(max(A[1..i]), A[i+1]) = max(A[1..i+1]), which is the invariant for i+1. Termination: the loop ends after i = n−1, having just placed max(A[1..n]) into A[n]. So the largest element 'bubbles' to the end in one pass. ∎",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "a1l4-i1", front: "Why is testing not a correctness proof?", back: "It samples finitely many inputs — it can show bugs exist but never that none do. A proof must cover all inputs." },
            { id: "a1l4-i2", front: "The three loop-invariant obligations?", back: "Initialization (holds before iteration 1), Maintenance (preserved across an iteration), Termination (exit condition + invariant ⇒ goal)." },
            { id: "a1l4-i3", front: "Partial vs total correctness?", back: "Partial: IF it halts, the answer is right (invariant). Total: partial correctness PLUS termination (a decreasing measure)." },
            { id: "a1l4-i4", front: "Binary search's loop invariant?", back: "Before each guard test: if x occurs in A[1..n], it occurs in A[lo..hi]. The empty range at exit proves the NIL case." },
            { id: "a1l4-i5", front: "How do you prove a loop terminates?", back: "Exhibit a measure into ℕ (or a well-founded set) that strictly decreases each iteration; no infinite descending chain ⇒ it halts." },
            { id: "a1l4-i6", front: "Why is choosing the invariant the hard part?", back: "It must be both maintained every iteration AND strong enough at exit to imply the goal; the three checks are mechanical once it's right." },
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
          "id": "a2l1",
          "title": "The Divide-and-Conquer Paradigm",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "Three steps, one recurrence",
              "body": "A **divide-and-conquer** algorithm solves a problem of size n by doing three things at every level of recursion:\n\n**Divide** the instance into a subproblems, each of size n/b (b > 1).\n**Conquer** each subproblem by recursing — until n drops to a base case small enough to solve directly in Θ(1) time.\n**Combine** the subproblem answers into an answer for the original.\n\nLet T(n) be the worst-case running time on an input of size n. If dividing and combining together cost f(n), then the work obeys\n\n  T(n) = a·T(n/b) + f(n),  with T(n) = Θ(1) for n below a constant threshold.\n\nEverything in this unit is about *solving* recurrences of this shape — turning the self-referential equation into a closed-form Θ. Three quantities decide the answer: the **branching factor** a (how many subproblems), the **shrinkage** b (how fast they get smaller), and the **driving function** f(n) (the per-call divide-plus-combine cost). The art is seeing which of f(n) and the recursion dominates."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Divide-and-conquer recurrence",
              "statement": "A **divide-and-conquer recurrence** is a recurrence of the form\n\n  T(n) = a·T(n/b) + f(n)   (n large),  T(n) = Θ(1)   (n ≤ n₀),\n\nwhere a ≥ 1 and b > 1 are constants and f(n) ≥ 0 is the *driving function* (the cost of the divide and combine steps at the top level). The term n/b is understood as ⌊n/b⌋ or ⌈n/b⌉ when n is not divisible by b; for asymptotic purposes the floors and ceilings do not change the Θ-class (justified in CLRS §4.6), so we routinely assume n is an exact power of b."
            },
            {
              "type": "code",
              "heading": "Merge sort",
              "lang": "text",
              "code": "MERGE-SORT(A, p, r):              // sort A[p..r]\n  if p >= r: return              // 0 or 1 element: base case, Θ(1)\n  q = (p + r) / 2  (floor)       // DIVIDE: split at the midpoint\n  MERGE-SORT(A, p, q)            // CONQUER left half\n  MERGE-SORT(A, q+1, r)          // CONQUER right half\n  MERGE(A, p, q, r)             // COMBINE two sorted halves, Θ(n)"
            },
            {
              "type": "text",
              "heading": "Reading off merge sort's recurrence",
              "body": "Apply the template to MERGE-SORT on n = r − p + 1 elements:\n\n**Divide** computes the midpoint in Θ(1).\n**Conquer** makes a = 2 recursive calls, each on n/2 elements (b = 2).\n**Combine** is MERGE, which walks the two sorted runs with a constant number of operations per output element, hence Θ(n).\n\nSo the divide-plus-combine cost is f(n) = Θ(1) + Θ(n) = Θ(n), and\n\n  T(n) = 2·T(n/2) + Θ(n),  T(1) = Θ(1).\n\nWe will prove in the next lesson — by two independent methods — that this solves to **T(n) = Θ(n lg n)**. (Throughout, lg n = log₂ n.) That bound is the whole reason merge sort matters: it sorts in Θ(n lg n) in the *worst* case, asymptotically optimal for comparison sorts, unlike insertion sort's Θ(n²)."
            },
            {
              "type": "example",
              "heading": "Binary search: a = 1",
              "body": "Searching a sorted array for a key probes the midpoint, then recurses into *one* half:\n\n**Divide** compares the key to the midpoint — Θ(1).\n**Conquer** makes a = 1 recursive call on n/2 elements (b = 2).\n**Combine** does nothing — Θ(1).\n\nSo f(n) = Θ(1) and\n\n  T(n) = 1·T(n/2) + Θ(1),  T(1) = Θ(1).\n\nUnrolling: after k probes the live region has size n/2^k, and the search stops when n/2^k ≈ 1, i.e. k ≈ lg n. Each probe is Θ(1), so **T(n) = Θ(lg n)**. Note the contrast with merge sort: branching a = 1 (not 2) keeps the total number of nodes at just lg n, so there is no n-factor — the recursion *itself*, not the combine, sets the cost."
            },
            {
              "type": "example",
              "heading": "Maximum-subarray and the cost of a heavy combine",
              "body": "The divide-and-conquer maximum-subarray algorithm (CLRS §4.1) splits the array at the midpoint, recurses on the left and right halves (a = 2, b = 2), and then — the crux — finds the best subarray *crossing* the midpoint by a left-and-right linear scan from the center, costing Θ(n). So\n\n  T(n) = 2·T(n/2) + Θ(n) = Θ(n lg n),\n\nthe same recurrence as merge sort. Here the Θ(n) lives entirely in the **combine** step, not the divide. The lesson: f(n) is the *total* non-recursive work, wherever it sits among divide and combine."
            },
            {
              "type": "decision",
              "heading": "Which dominates — the leaves or the root?",
              "rows": [
                [
                  "Recursion dominates (leaves heavy)",
                  "Total work ≈ a^{depth} · base cost; f(n) is asymptotically negligible. Example: T(n) = 2T(n/2) + Θ(1) = Θ(n)."
                ],
                [
                  "Balanced (every level costs the same)",
                  "Each of the Θ(log n) levels does Θ(f(n)) work. Example: merge sort, T(n) = 2T(n/2) + Θ(n) = Θ(n log n)."
                ],
                [
                  "Driving function dominates (root heavy)",
                  "The top-level f(n) outweighs all recursion below it; total = Θ(f(n)). Example: T(n) = 2T(n/2) + Θ(n²) = Θ(n²)."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "The quantity that decides it",
              "body": "The decision above is governed by comparing f(n) against a single yardstick: **n^{log_b a}**, the *watershed function*. Intuitively, n^{log_b a} counts the work done at the **leaves** of the recursion tree (there are a^{log_b n} = n^{log_b a} of them, each Θ(1)), while f(n) is the work at the **root**. The three rows of the table are exactly the three relations f(n) can have to n^{log_b a}: polynomially smaller (leaves win), the same order up to a log factor (tie, pay per level), or polynomially larger (root wins). The next two lessons make this precise — first by summing the recursion tree explicitly, then by packaging the result as the Master Theorem."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**A useful sanity check before you solve anything.** The number of leaves in the recursion tree is n^{log_b a}. If a = b the leaves number n^{log_b b} = n; if a < b^k where f(n) = Θ(n^k) the root wins; if a > b^k the leaves win. Memorize the watershed n^{log_b a} now — it is the single number the Master Theorem compares f(n) against, and computing it correctly is the difference between right and wrong on every recurrence in this unit."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Write the divide-and-conquer recurrence for an algorithm that splits a size-n instance into 3 subproblems of size n/2 each, with Θ(n) divide-plus-combine cost. Identify a, b, and f(n), and compute the watershed n^{log_b a}.",
                  "hint": "The watershed exponent is log_b a, not the exponent of f.",
                  "solution": "T(n) = 3·T(n/2) + Θ(n), so a = 3, b = 2, f(n) = Θ(n). The watershed is n^{log₂ 3} ≈ n^{1.585}. Since f(n) = Θ(n) = Θ(n¹) and 1 < log₂ 3, the leaves dominate, foreshadowing T(n) = Θ(n^{log₂ 3}) (this is the recurrence behind Karatsuba/Strassen-style multiplication)."
                },
                {
                  "prompt": "Give the recurrence for binary search's *iterative* (non-recursive) version's number of probes, and explain why it is still Θ(lg n).",
                  "solution": "The loop halves the live interval each iteration: if Pᵢ is the size after i probes, Pᵢ = P₀/2^i. The loop ends when Pᵢ < 1, i.e. when i > lg P₀ = lg n. So it performs ⌊lg n⌋ + 1 probes, each Θ(1): total Θ(lg n). The recurrence T(n) = T(n/2) + Θ(1) describes the recursive form and has the same Θ(lg n) solution — control structure (loop vs recursion) does not change the asymptotic count."
                },
                {
                  "prompt": "An algorithm has T(n) = 2T(n/2) + Θ(n²). Without using the Master Theorem, argue informally whether the root or the leaves dominate, and guess the Θ-class.",
                  "hint": "Compare f(n) = Θ(n²) to the next level's total combine cost.",
                  "solution": "At the root the combine costs Θ(n²). The two children each cost Θ((n/2)²) = Θ(n²/4), totaling Θ(n²/2) — half the root. Each level down the geometric series shrinks by ½, so the total is dominated by the root: Σ n²/2^i = Θ(n²). The root (driving function) dominates, so T(n) = Θ(n²). The leaves contribute only n^{log₂2} = Θ(n), negligible."
                },
                {
                  "prompt": "Merge sort makes a = 2 calls. Suppose instead you split into 4 quarters and merge them pairwise (still Θ(n) combine). What recurrence results and does the asymptotic time change?",
                  "solution": "T(n) = 4·T(n/4) + Θ(n). Here a = 4, b = 4, so the watershed is n^{log₄4} = n¹ = n, matching f(n) = Θ(n). This is the balanced/tie case: Θ(log₄ n) levels each costing Θ(n), giving T(n) = Θ(n log n). Same asymptotic time as standard merge sort — the base of the log differs by a constant factor only, which Θ absorbs."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a2l1-i1",
              "front": "The three steps of divide-and-conquer, and the recurrence they produce?",
              "back": "Divide into a subproblems of size n/b; Conquer (recurse) to a Θ(1) base case; Combine in f(n). Yields T(n) = a·T(n/b) + f(n), T(n)=Θ(1) for small n."
            },
            {
              "id": "a2l1-i2",
              "front": "Merge sort's recurrence and its solution?",
              "back": "T(n) = 2T(n/2) + Θ(n), solving to Θ(n lg n). a=2 recursive calls, b=2, MERGE combines in Θ(n)."
            },
            {
              "id": "a2l1-i3",
              "front": "Binary search's recurrence and why a = 1 matters?",
              "back": "T(n) = T(n/2) + Θ(1) = Θ(lg n). Only one branch (a=1), so the tree has lg n nodes total — no n-factor; the recursion depth alone sets the cost."
            },
            {
              "id": "a2l1-i4",
              "front": "What is the 'watershed function' for T(n)=a·T(n/b)+f(n)?",
              "back": "n^{log_b a} — the number of leaves (a^{log_b n}) times the Θ(1) leaf cost. The Master Theorem decides by comparing f(n) to it."
            },
            {
              "id": "a2l1-i5",
              "front": "In maximum-subarray, where does the Θ(n) in f(n) come from?",
              "back": "The COMBINE step: a linear scan outward from the midpoint to find the best subarray crossing the split. f(n) is total non-recursive work, divide OR combine."
            }
          ]
        },
        {
          "id": "a2l2",
          "title": "Solving Recurrences: Trees & Substitution",
          "estMinutes": 32,
          "content": [
            {
              "type": "text",
              "heading": "Two methods, two purposes",
              "body": "A divide-and-conquer recurrence is an equation; we want a closed-form Θ. Two elementary methods do the job before we reach for the Master Theorem.\n\nThe **recursion-tree method** *derives* a candidate bound: it draws the recursion as a tree, charges each node its non-recursive work, sums the work level by level, and adds the levels. It is constructive — it tells you the answer.\n\nThe **substitution method** *proves* a bound you already guessed: you assume the bound holds for all smaller inputs (strong induction), substitute that hypothesis into the recurrence, and verify the bound for n. It is verificational — it confirms the answer with full rigor and pins down the constants.\n\nThey are complementary: use a tree to *guess*, substitution to *prove*. We develop both on the merge-sort recurrence."
            },
            {
              "type": "text",
              "heading": "The recursion-tree method",
              "body": "Take T(n) = 2T(n/2) + cn (the merge-sort recurrence with the combine cost written explicitly as cn for a constant c > 0). Assume n is a power of 2.\n\nThe **root** is charged its own non-recursive cost cn and has two children, each a recurrence of size n/2. Expand recursively: a node of size n/2^i is charged c·(n/2^i) and spawns two children of size n/2^{i+1}. Continue until the subproblem size reaches 1.\n\nNow account the work two ways — **across each level**, then **down the levels**:\n\n• **Number of nodes at depth i:** the branching factor is 2, so depth i holds 2^i nodes.\n• **Cost of one node at depth i:** size n/2^i, charged c·n/2^i.\n• **Total cost of level i:** 2^i · (c·n/2^i) = cn. *Every level costs exactly cn* — the per-node cost halves while the node count doubles, and the two cancel.\n• **Number of levels:** sizes are n, n/2, …, 1 = n/2^L, so 2^L = n, L = lg n; counting the root level (i = 0) through the leaf level (i = lg n) gives lg n + 1 levels."
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Recursion tree for T(n) = 2T(n/2) + cn. Depth i holds 2^i nodes of size n/2^i, each charged c·n/2^i, so every level sums to exactly cn (right column). With lg n + 1 levels, the total is cn(lg n + 1) = Θ(n lg n) — the bound summed, not asserted.",
              "levels": [
                {
                  "n": 1,
                  "each": "cn",
                  "row": "cn"
                },
                {
                  "n": 2,
                  "each": "cn/2",
                  "row": "cn"
                },
                {
                  "n": 4,
                  "each": "cn/4",
                  "row": "cn"
                },
                {
                  "ellipsis": true,
                  "row": "cn"
                },
                {
                  "n": "n",
                  "each": "c",
                  "row": "cn",
                  "leaf": true,
                  "leafLabel": "n leaves"
                }
              ],
              "total": "cn(lg n + 1) = Θ(n lg n)"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Recursion-tree solution of T(n) = 2T(n/2) + cn",
              "statement": "Let c > 0 be constant and let T(n) = 2T(n/2) + cn for n a power of 2, with base case T(1) = c'. Then T(n) = Θ(n lg n) for **any** positive base constant c'. The exact closed form depends on c': it is T(n) = cn·lg n + c'·n. In the special case c' = c (the base cost equals the driving constant) this collapses to the clean form T(n) = cn·lg n + cn = cn(lg n + 1).",
              "proof": "Sum the tree's work over all levels. The internal levels are i = 0, 1, …, lg n − 1; level i has 2^i nodes each charged c·n/2^i, so its total is 2^i · c·n/2^i = cn. There are lg n such internal levels, contributing\n\n  Σ_{i=0}^{lg n − 1} cn = cn·lg n.\n\nThe **leaf level** i = lg n has 2^{lg n} = n leaves, each a base case of cost T(1) = c', contributing n·c'. Adding,\n\n  T(n) = cn·lg n + c'·n.\n\n(When c' = c this is cn·lg n + cn = cn(lg n + 1); for c' ≠ c the leaf term carries its own constant and the clean parenthetical form does not hold.)\n\nThe exact value cn·lg n + c'·n is simultaneously an upper and a lower bound on itself, so we read off both sides directly, for any fixed c' > 0:\n\n  *Upper:* for n ≥ 2 we have 1 ≤ lg n, so c'·n ≤ c'·n·lg n, giving cn·lg n + c'·n ≤ (c + c')·n·lg n = O(n lg n).\n  *Lower:* since c' > 0, cn·lg n + c'·n ≥ cn·lg n = Ω(n lg n).\n\nBy Θ = O ∩ Ω, T(n) = Θ(n lg n) regardless of the (positive) base constant c'; only the multiplicative constants in the O- and Ω-bounds depend on c'. ∎\n\n*Method note.* The cancellation '2^i nodes × c·n/2^i each = cn per level' is the engine: a balanced recurrence where every level costs the same total accumulates exactly (per-level cost) × (number of internal levels) = cn × lg n, plus the separate leaf charge c'·n."
            },
            {
              "type": "text",
              "heading": "The substitution method",
              "body": "The tree *suggested* Θ(n lg n). The substitution method *proves* it without trusting the picture. The recipe has three steps:\n\n1. **Guess** the form of the bound (e.g. T(n) = O(n lg n)), with an undetermined constant.\n2. **State the inductive hypothesis:** assume the bound holds for all smaller arguments.\n3. **Verify the inductive step:** substitute the hypothesis into the recurrence and show the *same* bound, with the *same* constant, follows for n — then discharge the base case.\n\nThe discipline that makes it a proof and not a wish: you must reproduce the bound with the *identical* constant you assumed. If the algebra leaves a leftover positive term, the proof fails and you must strengthen the hypothesis — the most common subtlety, which we hit head-on next."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Substitution proof that T(n) = 2T(n/2) + n is O(n lg n)",
              "statement": "Let T(n) = 2T(n/2) + n for n a power of 2, with T(1) = Θ(1). Then T(n) = O(n lg n); concretely, there is a constant d > 0 such that T(n) ≤ d·n lg n for all n ≥ 2.",
              "proof": "**Guess.** T(n) = O(n lg n).\n\n**Inductive hypothesis.** Assume there is a constant d > 0 (fixed below) such that for *every* m with 2 ≤ m < n and m a power of 2,\n\n  T(m) ≤ d·m lg m.   (IH)\n\nWe use strong induction on n; the value we need is m = n/2.\n\n**Inductive step.** Substitute the IH at m = n/2 into the recurrence:\n\n  T(n) = 2·T(n/2) + n\n      ≤ 2·(d·(n/2)·lg(n/2)) + n   [by IH, valid since n/2 < n]\n      = d·n·lg(n/2) + n\n      = d·n·(lg n − 1) + n        [lg(n/2) = lg n − 1]\n      = d·n·lg n − d·n + n\n      = d·n·lg n − (d − 1)·n.\n\nWe need this ≤ d·n·lg n, i.e. we need −(d − 1)·n ≤ 0, i.e. **d ≥ 1**. Choose any d ≥ 1 — say d = 2 to also cover the base case below. Then\n\n  T(n) ≤ d·n·lg n − (d − 1)·n ≤ d·n·lg n,\n\nwhich is exactly the bound with the *same* constant d. The inductive step holds.\n\n**Base case.** Induction starts at n = 2: T(2) = 2T(1) + 2 = 2·Θ(1) + 2 is some constant; with d chosen large enough that d·2·lg 2 = 2d ≥ T(2) (e.g. enlarge d if needed — this does not break the step, which only required d ≥ 1), the base holds. (We start at n = 2 rather than n = 1 because n lg n = 0 at n = 1, so no constant d can dominate a positive T(1); this boundary dodge is standard and legitimate, since asymptotic notation ignores finitely many small n.)\n\nWith base and step established, T(n) ≤ d·n lg n for all powers of 2 with n ≥ 2, so T(n) = O(n lg n). ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The subtractive-term trap.** When proving an *exact* polynomial bound by substitution, guessing T(n) ≤ d·g(n) often leaves a positive leftover that the bound can't absorb. The fix is to strengthen the hypothesis by *subtracting* a lower-order term, e.g. prove T(n) ≤ d·g(n) − e·(lower order). For instance, to show T(n) = 2T(n/2) + Θ(1) is O(n) you must guess T(n) ≤ dn − e (not just dn): T(n) ≤ 2(d(n/2) − e) + c = dn − 2e + c ≤ dn − e iff e ≥ c, which works, whereas the naïve T(n) ≤ dn yields dn + c ⩽̸ dn and *fails*. Strengthening the claim makes the induction go through — a hallmark of substitution proofs."
            },
            {
              "type": "example",
              "heading": "Substitution lower bound: T(n) = 2T(n/2) + n is Ω(n lg n)",
              "body": "The same machinery proves the matching lower bound, giving Θ. **Guess** T(n) ≥ d·n lg n. **IH:** T(m) ≥ d·m lg m for m < n. **Step:**\n\n  T(n) = 2T(n/2) + n ≥ 2·d·(n/2)·lg(n/2) + n = d·n(lg n − 1) + n = d·n lg n − d·n + n = d·n lg n + (1 − d)·n.\n\nWe need (1 − d)·n ≥ 0, i.e. **d ≤ 1**. Pick d = 1: T(n) ≥ n lg n for n ≥ 2 (base T(2) = 2T(1)+2 ≥ 2 = 1·2·lg 2). Hence T(n) = Ω(n lg n). Combined with the O-bound above, **T(n) = Θ(n lg n)**. Note the constants pull opposite ways: the upper proof needs d ≥ 1, the lower needs d ≤ 1 — they meet exactly at the true leading constant 1."
            },
            {
              "type": "example",
              "heading": "A wrong guess, caught by substitution",
              "body": "Suppose someone guesses T(n) = 2T(n/2) + n is **O(n)**. Try to prove T(n) ≤ dn. Substituting: T(n) ≤ 2·d(n/2) + n = dn + n = (d+1)·n. We needed ≤ dn but got (d+1)n, and no choice of constant d makes d + 1 ≤ d. The leftover +n cannot be absorbed *because it grows at the same rate as the bound*. The substitution method has refuted the guess — correctly, since the true answer is Θ(n lg n), not Θ(n). This is the method's diagnostic power: a failed absorption is a genuine signal that the guess is too small, not just a sloppy constant."
            },
            {
              "type": "decision",
              "heading": "Recursion tree vs. substitution",
              "rows": [
                [
                  "Recursion tree",
                  "Constructive — DERIVES a candidate bound by summing per-level work. Best for guessing. Rigor caveat: a tree drawn for a power of b is suggestive, not airtight, for general n."
                ],
                [
                  "Substitution",
                  "Verificational — PROVES a guessed bound by induction, fixing the constant. Best for confirming. Caveat: needs a correct guess first, and may require a strengthened (subtractive) hypothesis."
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Use a recursion tree to solve T(n) = 3T(n/2) + cn (n a power of 2). Give the per-level cost, the number of levels, and the Θ-class.",
                  "hint": "The branching factor 3 does not cancel the size factor 2, so levels are not constant — they form a geometric series.",
                  "solution": "Depth i has 3^i nodes of size n/2^i, each charged c·n/2^i; level cost = 3^i·c·n/2^i = cn·(3/2)^i — a GROWING geometric series. Levels run i=0..lg n. Total = cn·Σ_{i=0}^{lg n}(3/2)^i = cn·((3/2)^{lg n+1}−1)/(3/2−1) = Θ(n·(3/2)^{lg n}) = Θ(n · n^{lg(3/2)}) = Θ(n^{1+lg 3 −1}) = Θ(n^{lg 3}) ≈ Θ(n^{1.585}). The leaves (i = lg n) dominate; the answer is n^{log₂3}."
                },
                {
                  "prompt": "Prove by substitution that T(n) = 2T(n/2) + cn is O(n lg n). State the IH and verify the step.",
                  "solution": "Guess T(n) ≤ d·n lg n. IH: T(n/2) ≤ d·(n/2)·lg(n/2). Step: T(n) = 2T(n/2)+cn ≤ 2·d(n/2)lg(n/2)+cn = d·n(lg n −1)+cn = d·n lg n −d·n +cn = d·n lg n −(d−c)n ≤ d·n lg n provided d ≥ c. Pick d = max(c, T(2)/2). Base n=2: T(2)=2T(1)+2c ≤ 2d = d·2·lg2. Hence T(n)=O(n lg n). ∎ (Identical shape to the unit-c proof; the combine constant c just sets the threshold d ≥ c.)"
                },
                {
                  "prompt": "Test whether the naïve guess T(n) ≤ dn suffices for T(n) = T(n/2) + T(n/4) + n. Substitute it, find the condition on d, and conclude whether the plain linear guess closes — explaining *why* it does or does not in terms of the sum of the child coefficients.",
                  "hint": "Add up the coefficients on the recursive terms: ½ + ¼. Compare that sum to 1 before doing any algebra.",
                  "solution": "Substitute the guess T(m) ≤ dm for the two children: T(n) ≤ d(n/2) + d(n/4) + n = (d/2 + d/4)n + n = (3d/4)n + n = (3d/4 + 1)n. This is ≤ dn iff 3d/4 + 1 ≤ d iff 1 ≤ d/4 iff **d ≥ 4**. So the plain guess T(n) ≤ dn DOES close — pick any d ≥ 4 — and T(n) = O(n). The reason is structural: the child coefficients sum to ½ + ¼ = 3/4 < 1, so the recursive terms only consume a (3/4)-fraction of the budget dn, leaving room (the remaining d/4·n) to absorb the +n driving term whenever d ≥ 4. The general rule this illustrates: when Σ(child coefficients) < 1, the linear additive driving term is absorbable and the plain dn guess works; when Σ(child coefficients) = 1 (e.g. T(n/2)+T(n/2)+n), every bit of dn is consumed by the recursion and the leftover +n cannot be absorbed — there you must strengthen to T(n) ≤ dn − e·lg n or switch the guess to n lg n."
                },
                {
                  "prompt": "Solve T(n) = T(n/2) + Θ(1) (binary search) by both a recursion tree and substitution.",
                  "solution": "Tree: each level has exactly 1 node (a = 1) charged Θ(1); there are lg n + 1 levels (sizes n, n/2, …, 1). Total = Θ(1)·(lg n + 1) = Θ(lg n). Substitution: guess T(n) ≤ d·lg n. IH T(n/2) ≤ d·lg(n/2) = d(lg n − 1). Step: T(n) = T(n/2) + c ≤ d·lg n − d + c ≤ d·lg n iff d ≥ c. Base n=2: T(2)=T(1)+c=Θ(1) ≤ d·lg2 = d for d large. Hence Θ(lg n). ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a2l2-i1",
              "front": "In the recursion tree for 2T(n/2)+cn, why does every internal level cost exactly cn?",
              "back": "Depth i has 2^i nodes each charged c·n/2^i; 2^i · c·n/2^i = cn. Node count doubles while per-node cost halves — they cancel."
            },
            {
              "id": "a2l2-i2",
              "front": "How does the tree for 2T(n/2)+cn give Θ(n lg n), and what is the exact total with base case T(1)=c'?",
              "back": "lg n internal levels each cost cn (= cn·lg n), plus n leaves each costing c' (= c'·n). Exact total cn·lg n + c'·n = Θ(n lg n) for any c'>0. Only when c'=c does it simplify to cn(lg n+1)."
            },
            {
              "id": "a2l2-i3",
              "front": "The three steps of the substitution method?",
              "back": "(1) Guess the bound's form. (2) State the inductive hypothesis (bound holds for all smaller m). (3) Substitute IH into the recurrence and verify the SAME bound with the SAME constant for n; discharge the base case."
            },
            {
              "id": "a2l2-i4",
              "front": "In proving 2T(n/2)+n = O(n lg n), what does the inductive step reduce to?",
              "back": "T(n) ≤ d·n lg n − (d−1)n, which is ≤ d·n lg n iff d ≥ 1. The leftover −(d−1)n is nonpositive exactly when d ≥ 1."
            },
            {
              "id": "a2l2-i5",
              "front": "The subtractive-term trick, and when you need it?",
              "back": "When proving a tight polynomial bound, strengthen the guess to T(n) ≤ d·g(n) − e·(lower-order term) so the leftover can be absorbed. Needed when the naïve guess leaves a same-order positive remainder — i.e. when Σ(child coefficients) = 1."
            },
            {
              "id": "a2l2-i6",
              "front": "Recursion tree vs. substitution — division of labor?",
              "back": "Tree = constructive, DERIVES a candidate (good for guessing). Substitution = verificational, PROVES a guess by induction and fixes the constant (good for confirming)."
            }
          ]
        },
        {
          "id": "a2l3",
          "title": "The Master Theorem",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "One theorem for a·T(n/b) + f(n)",
              "body": "Drawing a tree for every recurrence is tedious. The **Master Theorem** packages the recursion-tree argument once and for all for T(n) = a·T(n/b) + f(n) with a ≥ 1, b > 1 constants and f(n) asymptotically positive. It decides the answer by a single comparison: f(n) against the **watershed** n^{log_b a} (the leaf work). There are three cases, by whether f is polynomially smaller, the same order, or polynomially larger than the watershed.\n\nThe intuition is exactly the recursion tree: the leaves contribute Θ(n^{log_b a}); the root contributes Θ(f(n)); the answer is dominated by whichever wins, and in the tie it is their common order times the Θ(log n) levels."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Master Theorem (CLRS 4e, §4.5)",
              "statement": "Let a ≥ 1 and b > 1 be constants, f(n) a nonnegative function, and T(n) = a·T(n/b) + f(n) (n/b read as floor or ceiling). Let the watershed be n^{log_b a}. Then:\n\n  **Case 1 (leaves win).** If f(n) = O(n^{log_b a − ε}) for some constant ε > 0, then T(n) = Θ(n^{log_b a}).\n\n  **Case 2 (tie).** If f(n) = Θ(n^{log_b a}), then T(n) = Θ(n^{log_b a}·lg n). (More generally, if f(n) = Θ(n^{log_b a}·lg^k n) for k ≥ 0, then T(n) = Θ(n^{log_b a}·lg^{k+1} n).)\n\n  **Case 3 (root wins).** If f(n) = Ω(n^{log_b a + ε}) for some ε > 0, AND f satisfies the *regularity condition* a·f(n/b) ≤ c·f(n) for some constant c < 1 and all large n, then T(n) = Θ(f(n)).",
              "proof": "Assume n = b^m (the floor/ceiling correction is handled in CLRS §4.6 and does not change the Θ-class). Unrolling the recurrence m = log_b n times gives the exact sum\n\n  T(n) = Θ(n^{log_b a}) + Σ_{j=0}^{m−1} a^j · f(n/b^j),     (★)\n\nwhere the first term is the total leaf cost (a^m = a^{log_b n} = n^{log_b a} base cases) and the sum g(n) = Σ a^j f(n/b^j) is the total internal (root-plus-divide) cost. The three cases evaluate g(n).\n\n**Case 1.** With f(n) = O(n^{log_b a − ε}), bound a^j f(n/b^j) ≤ a^j·O((n/b^j)^{log_b a − ε}) = O(n^{log_b a − ε}·(a/b^{log_b a − ε})^j) = O(n^{log_b a − ε}·(b^ε)^j). Summing the geometric series with ratio b^ε > 1: g(n) = O(n^{log_b a − ε}·(b^ε)^m) = O(n^{log_b a − ε}·n^ε) = O(n^{log_b a}). So g(n) = O(n^{log_b a}) and (★) gives T(n) = Θ(n^{log_b a}) + O(n^{log_b a}) = Θ(n^{log_b a}). The leaf term dominates.\n\n**Case 2 (k = 0).** With f(n) = Θ(n^{log_b a}), each term a^j f(n/b^j) = Θ(a^j (n/b^j)^{log_b a}) = Θ(n^{log_b a}·(a/b^{log_b a})^j) = Θ(n^{log_b a}), since a/b^{log_b a} = 1. There are m = log_b n such terms, so g(n) = Θ(n^{log_b a}·log_b n) = Θ(n^{log_b a} lg n). This matches and dominates the Θ(n^{log_b a}) leaf term, so T(n) = Θ(n^{log_b a} lg n). (The lg^k generalization sums Σ lg^k by an integral to lg^{k+1}.)\n\n**Case 3.** The regularity condition a·f(n/b) ≤ c·f(n), c < 1, iterated j times gives a^j f(n/b^j) ≤ c^j f(n). Hence g(n) = Σ_{j=0}^{m−1} a^j f(n/b^j) ≤ f(n)·Σ_{j≥0} c^j = f(n)/(1−c) = O(f(n)); and g(n) ≥ f(n) (the j = 0 term) = Ω(f(n)), so g(n) = Θ(f(n)). Since f(n) = Ω(n^{log_b a + ε}) strictly exceeds the leaf term Θ(n^{log_b a}), the f-term dominates (★): T(n) = Θ(f(n)). ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Mechanical recipe.** (1) Compute the watershed exponent log_b a. (2) Compare f(n) to n^{log_b a}. If f is polynomially *smaller* → Case 1, answer Θ(n^{log_b a}). If *equal* order (up to lg^k) → Case 2, answer Θ(n^{log_b a} lg^{k+1} n). If polynomially *larger* (and regularity holds) → Case 3, answer Θ(f(n)). 'Polynomially' is the catch: there must be a true n^{±ε} gap, not merely a lg-factor gap — that gap is exactly what the next callout is about."
            },
            {
              "type": "example",
              "heading": "Gate item: T(n) = 8T(n/2) + Θ(n²) — find c with solution Θ(n^c)",
              "body": "Here a = 8, b = 2, f(n) = Θ(n²). Watershed exponent: log_b a = log₂ 8 = **3**, so the watershed is n³.\n\nCompare f(n) = Θ(n²) to n³: since n² = O(n^{3 − ε}) with ε = 1 (indeed n² = n^{3−1}), f is **polynomially smaller** than the watershed → **Case 1**. Therefore\n\n  T(n) = Θ(n^{log₂ 8}) = Θ(n³).\n\nSo **c = 3.** Sanity check via the tree: the recursion has 8 branches halving the size, so n^{log₂8} = n³ leaves each Θ(1) — n³ leaf work swamps the Θ(n²) combine. The leaves win."
            },
            {
              "type": "example",
              "heading": "Gate item: T(n) = 3T(n/4) + Θ(n) — find integer c with solution Θ(n^c)",
              "body": "Here a = 3, b = 4, f(n) = Θ(n). Watershed exponent: log_b a = log₄ 3 ≈ 0.792, so the watershed is n^{0.792…}.\n\nCompare f(n) = Θ(n) = Θ(n¹) to n^{0.792}: since 1 > log₄ 3, f is **polynomially larger** — specifically n = Ω(n^{log₄3 + ε}) with ε = 1 − log₄3 ≈ 0.208 > 0 → **Case 3** (check regularity: a·f(n/b) = 3·(n/4) = (3/4)n ≤ c·f(n) with c = 3/4 < 1 ✓). Therefore\n\n  T(n) = Θ(f(n)) = Θ(n) = Θ(n¹).\n\nThe root (driving function) dominates: **c = 1.** Each level's combine shrinks geometrically (ratio 3/4), so the top-level Θ(n) sets the total. This is the CLRS canonical Case-3 example."
            },
            {
              "type": "example",
              "heading": "Gate item: merge sort, T(n) = 2T(n/2) + Θ(n)",
              "body": "a = 2, b = 2, f(n) = Θ(n). Watershed: log₂ 2 = 1, so n^{log_b a} = n¹ = n. Now f(n) = Θ(n) = Θ(n^{log_b a}) **exactly** — the orders match → **Case 2** (with k = 0). Therefore\n\n  T(n) = Θ(n^{log_b a}·lg n) = Θ(n lg n).\n\nThis is the Master-Theorem confirmation of the result we summed by hand in the recursion tree and proved by substitution: merge sort's recurrence solves to **Θ(n lg n)**. All three methods agree."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Where the basic theorem FAILS — the gap between cases.** The three cases do not tile the whole space. There is a gap on each side that is *not* a polynomial factor:\n\n• Between Cases 1 and 2: f smaller than the watershed but by *less than any n^ε* (only by a log). E.g. f(n) = n^{log_b a}/lg n.\n• Between Cases 2 and 3: f *larger* than the watershed by only a log factor, e.g. **T(n) = 2T(n/2) + n lg n** — here f(n) = n lg n vs watershed n; the ratio lg n is sub-polynomial (lg n = O(n^ε) for all ε > 0), so f is NOT Ω(n^{1+ε}). Case 3 does not apply, Case 2 (k=0) does not apply. The basic three-case theorem is **silent**. (This particular recurrence solves to Θ(n lg² n), reachable by the Case-2 lg^k generalization or a recursion tree, not the bare three cases.)\n\nCase 3 can also fail when the *regularity condition* breaks even though f is polynomially larger — a real, if pathological, gap."
            },
            {
              "type": "decision",
              "heading": "The three cases at a glance",
              "rows": [
                [
                  "Case 1: f(n) = O(n^{log_b a − ε})",
                  "Leaves dominate. T(n) = Θ(n^{log_b a}). Ex: 8T(n/2)+Θ(n²) → Θ(n³)."
                ],
                [
                  "Case 2: f(n) = Θ(n^{log_b a} lg^k n)",
                  "Balanced. T(n) = Θ(n^{log_b a} lg^{k+1} n). Ex: 2T(n/2)+Θ(n) → Θ(n lg n)."
                ],
                [
                  "Case 3: f(n) = Ω(n^{log_b a + ε}) + regularity",
                  "Root dominates. T(n) = Θ(f(n)). Ex: 3T(n/4)+Θ(n) → Θ(n)."
                ],
                [
                  "Gap (no case applies)",
                  "f differs from watershed by only a lg factor, or regularity fails. Ex: 2T(n/2)+n lg n. Use Akra–Bazzi or a recursion tree."
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Akra–Bazzi, single-term case with explicit bounds",
              "statement": "Let a ≥ 1, b > 1 be constants and let p = log_b a (equivalently, the unique real with a·b^{−p} = 1). Suppose T(n) = a·T(n/b) + f(n) for n a power of b, with f nonnegative and monotonically nondecreasing, and define the *Akra–Bazzi integral term* I(n) = ∫₁ⁿ f(u)/u^{p+1} du. Then\n\n  T(n) = Θ( n^p·(1 + I(n)) ).\n\nThis is the single-subproblem instance of the general Akra–Bazzi formula T(n) = Θ(n^p(1 + ∫₁ⁿ f(u)/u^{p+1} du)) for T(n) = Σ aᵢ T(n/bᵢ) + f(n), where p solves Σ aᵢ bᵢ^{−p} = 1; the general case is cited from Akra–Bazzi (1998).",
              "proof": "Write n = b^m, so m = log_b n and a^m = a^{log_b n} = n^{log_b a} = n^p. Unrolling the recurrence m times gives the exact identity\n\n  T(n) = a^m·T(1) + Σ_{j=0}^{m−1} a^j·f(n/b^j) = Θ(n^p) + g(n),  where g(n) = Σ_{j=0}^{m−1} a^j f(n/b^j).   (★)\n\nIt remains to show g(n) = Θ(n^p·I(n)) and combine with the Θ(n^p) leaf term to obtain Θ(n^p(1 + I(n))). Because a = b^p, the j-th term is\n\n  a^j f(n/b^j) = b^{pj} f(n/b^j) = n^p·f(n/b^j)/(n/b^j)^p,\n\nso, factoring out n^p,  g(n) = n^p·Σ_{j=0}^{m−1} f(n/b^j)/(n/b^j)^p.   (†)\n\nLet S = Σ_{j=0}^{m−1} f(n/b^j)/(n/b^j)^p be the bracketed sum. We bound S above and below by the integral I(n) = ∫₁ⁿ f(u)/u^{p+1} du by comparing the sum to a Riemann sum under the substitution that makes consecutive terms a geometric grid u_j = n/b^j (so u_0 = n down to u_{m} = 1, with u_{j+1} = u_j/b).\n\n**Setup.** Define h(u) = f(u)/u^{p+1}, the integrand. On the interval [u_{j+1}, u_j] = [n/b^{j+1}, n/b^j] the width is u_j − u_{j+1} = u_j(1 − 1/b) = (n/b^j)(1 − 1/b). The j-th summand of S is f(n/b^j)/(n/b^j)^p = f(u_j)/u_j^p = u_j·h(u_j). Multiplying and dividing by the interval width,\n\n  f(u_j)/u_j^p = u_j·h(u_j) = [ (u_j − u_{j+1})·h(u_j) ] / (1 − 1/b).   (‡)\n\n**Upper bound on S.** Since f is nondecreasing and u^{p+1} > 0, on [u_{j+1}, u_j] we have, for every point u in that interval, f(u_j) ≥ f(u) and u_j^{p+1} ≥ u^{p+1} need not both push the same way, so we instead bound the integral by the value at the *right* endpoint where the comparison is clean: because f is nondecreasing, ∫_{u_{j+1}}^{u_j} f(u)/u^{p+1} du ≤ f(u_j)·∫_{u_{j+1}}^{u_j} u^{−(p+1)} du. Now ∫_{u_{j+1}}^{u_j} u^{−(p+1)} du = [u^{−p}/(−p)]... handled by cases on the sign of p below; the key fact we use is the elementary comparison ∫_{u_{j+1}}^{u_j} u^{−(p+1)} du ≤ (u_j − u_{j+1})·u_{j+1}^{−(p+1)} = u_j(1−1/b)·u_{j+1}^{−(p+1)}. With u_{j+1} = u_j/b this equals u_j(1−1/b)·b^{p+1}u_j^{−(p+1)} = (1−1/b)b^{p+1}·u_j^{−p}. Hence\n\n  ∫_{u_{j+1}}^{u_j} f(u)/u^{p+1} du ≤ f(u_j)·(1−1/b)b^{p+1}·u_j^{−p} = (1−1/b)b^{p+1}·[f(u_j)/u_j^p].\n\nSumming j = 0,…,m−1 (the intervals tile [1, n]) gives I(n) = ∫₁ⁿ h ≤ (1−1/b)b^{p+1}·S, i.e. S ≥ I(n)/[(1−1/b)b^{p+1}] = Ω(I(n)).\n\n**Lower bound on S.** Symmetrically, because f is nondecreasing, ∫_{u_{j+1}}^{u_j} f(u)/u^{p+1} du ≥ f(u_{j+1})·∫_{u_{j+1}}^{u_j} u^{−(p+1)} du ≥ f(u_{j+1})·(u_j − u_{j+1})·u_j^{−(p+1)} = f(u_{j+1})·(1−1/b)·u_j^{−p}. Since f(u_{j+1}) ≤ f(u_j) would go the wrong way, reindex: shift the sum by one term and use f(u_{j+1}) appearing against u_{j+1}: a cleaner route is f(u_{j+1})·u_j^{−p} = f(u_{j+1})·(u_{j+1}b)^{−p} = b^{−p}·f(u_{j+1})/u_{j+1}^p, so ∫_{u_{j+1}}^{u_j} h ≥ (1−1/b)b^{−p}·[f(u_{j+1})/u_{j+1}^p]. Summing over j and noting that {f(u_{j+1})/u_{j+1}^p : j=0..m−1} are the terms of S indexed 1..m (i.e. S minus its j=0 term plus its j=m term f(1)/1^p) gives I(n) ≥ (1−1/b)b^{−p}·(S − f(n)/n^p). Because the dropped j=0 term f(n)/n^p is itself ≤ S, we get S ≤ I(n)/[(1−1/b)b^{−p}] + f(n)/n^p = O(I(n)) + O(f(n)/n^p); and f(n)/n^p ≤ I-comparable since the single largest term is absorbed into the Θ. Thus S = O(I(n) + 1) (the +1 covering the cases where the integral is bounded, e.g. Case 1).\n\n**Combine.** The two bounds give S = Θ(I(n) + 1): more precisely S = Ω(I(n)) and S = O(I(n) + 1), and the additive 1 is dominated whenever I(n)→∞ and otherwise S = Θ(1). Substituting into (†), g(n) = n^p·S = Θ(n^p(I(n) + 1)). Adding the leaf term Θ(n^p) from (★) — which is exactly the n^p·1 contribution — yields\n\n  T(n) = Θ(n^p) + Θ(n^p(1 + I(n))) = Θ(n^p(1 + I(n))).\n\n**Sanity against the Master cases.** (i) f(u) = Θ(u^p) ⇒ h(u) = Θ(1/u) ⇒ I(n) = Θ(lg n) ⇒ T = Θ(n^p lg n), the Case-2 tie. (ii) f(u) = O(u^{p−ε}) ⇒ h(u) = O(u^{−1−ε}) ⇒ I(n) = O(1) ⇒ T = Θ(n^p), Case 1. (iii) f(u) = Ω(u^{p+ε}) ⇒ h(u) = Ω(u^{ε−1}) ⇒ I(n) = Θ(n^ε) = Θ(f(n)/n^p) ⇒ n^p·I(n) = Θ(f(n)), Case 3. And the Master-gap recurrence 2T(n/2)+n lg n has p = 1, h(u) = lg u/u, I(n) = ∫₁ⁿ lg u/u du = Θ(lg² n), giving T(n) = Θ(n lg² n) — resolved with no gap. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why Akra–Bazzi has no gap.** The Master Theorem's three cases are a coarse trichotomy on f — polynomially below, equal to, or above the watershed n^p — and so it goes silent in the two sub-polynomial seams. Akra–Bazzi replaces the trichotomy with a single *integral* I(n) = ∫₁ⁿ f(u)/u^{p+1} du that varies continuously with f: whatever f is (as long as it is reasonably regular), the integral has *some* growth rate, and T(n) = Θ(n^p(1 + I(n))) reads it off. The proof above shows the per-level sum Σ a^j f(n/b^j), after factoring n^p, is exactly a geometric-grid Riemann sum of that integral — which is why summing the tree and integrating give the same Θ. It also handles unequal subproblem sizes ΣaᵢT(n/bᵢ): then p is the unique root of Σ aᵢ bᵢ^{−p} = 1 rather than log_b a."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Solve T(n) = 4T(n/2) + Θ(n) by the Master Theorem. State a, b, the watershed, the case, and the answer.",
                  "hint": "Compute log₂ 4 first.",
                  "solution": "a = 4, b = 2, f(n) = Θ(n). Watershed: log₂4 = 2, so n². Compare f = Θ(n) = O(n^{2−1}) → polynomially smaller → Case 1. T(n) = Θ(n²). (The four-way branching produces n² leaves that dominate the linear combine.)"
                },
                {
                  "prompt": "Solve T(n) = 2T(n/2) + Θ(n²). Which case, and why is it Case 3?",
                  "solution": "a=2,b=2, watershed n^{log₂2}=n. f(n)=Θ(n²)=Ω(n^{1+ε}) with ε=1 → polynomially larger → Case 3. Regularity: a·f(n/b)=2·(n/2)²=n²/2 ≤ c·n² with c=1/2<1 ✓. So T(n)=Θ(n²). The Θ(n²) root work swamps the Θ(n) leaf work."
                },
                {
                  "prompt": "Explain precisely why the basic Master Theorem cannot solve T(n) = 2T(n/2) + n/lg n, and which gap it falls into. Then resolve it with Akra–Bazzi.",
                  "hint": "Compute the watershed and see how f compares to it; for Akra–Bazzi take p = 1 and evaluate the integral.",
                  "solution": "a=2,b=2 → watershed n^{log₂2}=n. f(n)=n/lg n is SMALLER than n, but only by a logarithmic factor: n/lg n = Θ(n·lg^{−1}n), and lg^{−1}n is NOT O(n^{−ε}) for any ε>0 (no polynomial gap). So f ≠ O(n^{1−ε}) (Case 1 needs a polynomial gap) and f ≠ Θ(n lg^k n) for k ≥ 0 (Case 2 needs k ≥ 0, but here k = −1). It falls in the Case-1/Case-2 gap. Akra–Bazzi: p = log₂2 = 1, h(u)=f(u)/u^{p+1}=(u/lg u)/u² = 1/(u lg u), so I(n)=∫₂ⁿ du/(u lg u)=Θ(lg lg n). Hence T(n)=Θ(n^1(1+lg lg n))=Θ(n lg lg n)."
                },
                {
                  "prompt": "MCQ-style: Of these, which does the basic three-case Master Theorem NOT resolve? (a) 4T(n/2)+n²; (b) 2T(n/2)+n lg n; (c) 9T(n/3)+n; (d) T(n/2)+1.",
                  "solution": "(b). Check each: (a) watershed n², f=Θ(n²) → Case 2, Θ(n² lg n) ✓. (c) watershed n^{log₃9}=n², f=Θ(n)=O(n^{2−ε}) → Case 1, Θ(n²) ✓. (d) a=1,b=2 watershed n⁰=1, f=Θ(1)=Θ(n⁰) → Case 2, Θ(lg n) ✓. (b) watershed n^{log₂2}=n, f=n lg n exceeds n by only the sub-polynomial factor lg n, so NOT Ω(n^{1+ε}) → Case 3 fails, and it isn't Θ(n lg^k n) form for the answer Case 2 gives directly — actually it IS Θ(n lg^k n) with k=1, so Case 2's generalization gives Θ(n lg² n); but the BASIC three cases (k=0 only) do not cover it. (b) is the intended non-resolvable one for the bare theorem."
                },
                {
                  "prompt": "Apply the Master Theorem to Strassen's matrix multiplication, T(n) = 7T(n/2) + Θ(n²).",
                  "solution": "a=7,b=2,f=Θ(n²). Watershed log₂7 ≈ 2.807, so n^{2.807}. Compare f=Θ(n²)=O(n^{2.807−ε}) with ε≈0.807 → polynomially smaller → Case 1. T(n)=Θ(n^{log₂7}) ≈ Θ(n^{2.807}) — beating the naïve Θ(n³). The 7 multiplications (vs 8) drop the leaf exponent below 3."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a2l3-i1",
              "front": "Master Theorem: the watershed function and what it represents?",
              "back": "n^{log_b a} — the total leaf work (n^{log_b a} base cases). The three cases compare f(n) to it: smaller, equal, or larger."
            },
            {
              "id": "a2l3-i2",
              "front": "Master Theorem Case 1 condition and result?",
              "back": "If f(n)=O(n^{log_b a − ε}) for some ε>0 (polynomially smaller than the watershed), then T(n)=Θ(n^{log_b a}). Leaves dominate."
            },
            {
              "id": "a2l3-i3",
              "front": "Master Theorem Case 2 condition and result?",
              "back": "If f(n)=Θ(n^{log_b a} lg^k n), k≥0, then T(n)=Θ(n^{log_b a} lg^{k+1} n). The tie case — every level the same order. Merge sort: Θ(n lg n)."
            },
            {
              "id": "a2l3-i4",
              "front": "Master Theorem Case 3 conditions and result?",
              "back": "If f(n)=Ω(n^{log_b a + ε}) for some ε>0 AND regularity a·f(n/b) ≤ c·f(n), c<1, holds, then T(n)=Θ(f(n)). Root dominates."
            },
            {
              "id": "a2l3-i5",
              "front": "Why does the basic Master Theorem fail on 2T(n/2)+n lg n?",
              "back": "Watershed is n; f=n lg n exceeds it by only the factor lg n, which is sub-polynomial (not Ω(n^ε)). So Case 3 fails and Case 2 (k=0) doesn't match. The gap. (Answer is Θ(n lg² n).)"
            },
            {
              "id": "a2l3-i6",
              "front": "Akra–Bazzi single-term formula and why no gap?",
              "back": "With p=log_b a, T(n)=Θ(n^p(1+∫₁ⁿ f(u)/u^{p+1}du)). The per-level sum Σa^j f(n/b^j), after factoring n^p, is a geometric-grid Riemann sum of that integral; the integral varies continuously with f, so it reads off Case 1 (I=Θ(1)), Case 2 (I=Θ(lg n)), Case 3 (I=Θ(f/n^p)), and the gaps (e.g. n lg n → Θ(n lg²n)) uniformly."
            }
          ]
        }
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
          "id": "a3l1",
          "title": "Quicksort",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "Divide and conquer with no combine step",
              "body": "Quicksort sorts an array A[p..r] in place by the divide-and-conquer scheme, but with an unusual balance of work. It picks a **pivot** element, **partitions** A[p..r] about that pivot so that every element left of the pivot is ≤ it and every element right of it is ≥ it, then recursively sorts the two sides. Crucially, once both sides are sorted the whole subarray is sorted: there is **no combine step**. All the cleverness lives in PARTITION, and all the cost lives in the divide.\n\nThis is the mirror image of merge sort, whose divide is trivial (split in the middle) and whose work lives in MERGE. The two algorithms share the Θ(n log n) best case but differ sharply in their worst case and their constant factors."
            },
            {
              "type": "code",
              "heading": "Lomuto partition",
              "lang": "text",
              "code": "QUICKSORT(A, p, r)\n  if p < r\n    q = PARTITION(A, p, r)      // pivot lands in final position q\n    QUICKSORT(A, p, q - 1)\n    QUICKSORT(A, q + 1, r)\n\nPARTITION(A, p, r)\n  x = A[r]                      // pivot = last element\n  i = p - 1\n  for j = p to r - 1\n    if A[j] <= x\n      i = i + 1\n      exchange A[i] with A[j]\n  exchange A[i + 1] with A[r]\n  return i + 1"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Partition",
              "statement": "Given A[p..r], to **partition** about pivot x is to rearrange A[p..r] and return an index q ∈ [p, r] such that x = A[q], every element of A[p..q−1] is ≤ x, and every element of A[q+1..r] is ≥ x. The pivot A[q] is then in its **final sorted position**: no later recursive call ever moves it."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Correctness of PARTITION (loop invariant)",
              "statement": "After PARTITION(A, p, r) returns q = i+1, we have A[k] ≤ A[q] for all p ≤ k < q and A[k] > A[q] for all q < k ≤ r, and A[q] equals the original A[r].",
              "proof": "Consider the loop over j = p..r−1 and the invariant maintained at the start of each iteration: (i) every entry of A[p..i] is ≤ x; (ii) every entry of A[i+1..j−1] is > x; (iii) A[r] = x.\n\n**Initialization.** Before the first iteration i = p−1 and j = p, so the ranges A[p..i] and A[i+1..j−1] are both empty and (i),(ii) hold vacuously; (iii) holds since x = A[r] was never written.\n\n**Maintenance.** In an iteration we examine A[j]. If A[j] > x, neither i nor any small-region entry changes, and A[j] joins the region A[i+1..j], preserving (ii); (i) and (iii) are untouched. If A[j] ≤ x, we increment i and exchange A[i] with A[j]: the old A[j] (≤ x) moves to position i, extending region (i); the old A[i] (which was > x by (ii), unless i+1 = j in which case nothing of substance moves) moves to position j−1+1, staying in region (ii). In both cases the invariant holds for j+1.\n\n**Termination.** The loop ends with j = r, so A[p..i] are all ≤ x and A[i+1..r−1] are all > x. The final exchange of A[i+1] with A[r] places x at index q = i+1, pushing the (> x) element formerly at i+1 to the end. Thus A[p..q−1] ≤ x = A[q] < A[q+1..r], which is exactly the claim. ∎"
            },
            {
              "type": "example",
              "heading": "Partitioning a concrete array",
              "body": "Partition A = [2, 8, 7, 1, 3, 5, 6, 4] with p=1, r=8, pivot x = A[8] = 4.\n\nWalk j from 1 to 7, moving any element ≤ 4 into the low region just past i:\n- j=1: A[1]=2 ≤ 4 → i=1, swap with itself → [**2**, 8, 7, 1, 3, 5, 6, 4]\n- j=2: 8 > 4 → no move\n- j=3: 7 > 4 → no move\n- j=4: 1 ≤ 4 → i=2, swap A[2]↔A[4] → [2, **1**, 7, 8, 3, 5, 6, 4]\n- j=5: 3 ≤ 4 → i=3, swap A[3]↔A[5] → [2, 1, **3**, 8, 7, 5, 6, 4]\n- j=6: 5 > 4; j=7: 6 > 4 → no moves\n\nFinal swap A[i+1]=A[4] ↔ A[8]: [2, 1, 3, **4**, 7, 5, 6, 8]. Returns q = 4. The pivot 4 sits in its final position; left side {2,1,3} ≤ 4, right side {7,5,6,8} > 4. This is the canonical CLRS trace."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Best- and worst-case running time",
              "statement": "PARTITION on a subarray of size n does Θ(n) work and n−1 key comparisons. Quicksort's running time satisfies T(n) = Θ(n²) in the worst case and T(n) = Θ(n log n) in the best case.",
              "proof": "PARTITION runs its loop once per element of A[p..r−1], doing O(1) work each plus the final swap, hence Θ(n) and exactly n−1 comparisons (one A[j] ≤ x test per loop iteration).\n\n**Worst case.** If every partition is maximally unbalanced — the pivot is always the minimum or maximum, so one side has n−1 elements and the other 0 — then T(n) = T(n−1) + T(0) + Θ(n) = T(n−1) + Θ(n). Unrolling, T(n) = Σ_{k=1}^{n} Θ(k) = Θ(n²). This occurs, e.g., on already-sorted input with the last-element pivot. No input can be worse, since each PARTITION costs only Θ(n) and there are at most n levels of recursion, giving the matching O(n²) upper bound.\n\n**Best case.** If every partition is balanced, splitting n into ⌊n/2⌋ and ⌈n/2⌉−1, then T(n) ≤ 2T(n/2) + Θ(n), which by the master theorem (case 2) is Θ(n log n). Since any sort must inspect all n elements at every level and there are Ω(log n) levels, this is also a lower bound, so the best case is Θ(n log n). ∎"
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Worst-case quicksort: each PARTITION peels off one element, so the tree is a path of depth n with level-k work Θ(n−k). The total is Θ(n²).",
              "levels": [
                {
                  "n": "n",
                  "each": "Θ(n)",
                  "row": "Θ(n)"
                },
                {
                  "n": "n−1",
                  "each": "Θ(n−1)",
                  "row": "Θ(n−1)"
                },
                {
                  "n": "n−2",
                  "each": "Θ(n−2)",
                  "row": "Θ(n−2)"
                },
                {
                  "ellipsis": true,
                  "row": "⋮"
                },
                {
                  "n": "1",
                  "each": "Θ(1)",
                  "row": "Θ(1)"
                }
              ],
              "total": "Σ_{k=1}^{n} Θ(k) = Θ(n²)"
            },
            {
              "type": "text",
              "heading": "Randomization breaks the adversary",
              "body": "The worst case is not a quirk of pathological data — for a *fixed* deterministic pivot rule, an adversary who knows the rule can always hand quicksort its Θ(n²) input. The fix is **RANDOMIZED-QUICKSORT**: in RANDOMIZED-PARTITION, before partitioning, swap A[r] with A[random(p, r)] so the pivot is drawn **uniformly at random** from the subarray. Now no input is special; the worst case still exists but requires an unlucky sequence of coin flips, not bad data. We prove the expected running time is Θ(n log n) on *every* input."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected running time of randomized quicksort",
              "statement": "On any input of n distinct elements, RANDOMIZED-QUICKSORT performs an expected 2n·ln n + O(n) = Θ(n log n) comparisons, hence runs in expected time Θ(n log n).",
              "proof": "The total time is dominated by the number of comparisons across all PARTITION calls, since each PARTITION does O(1) work beyond its comparisons. Let z₁ < z₂ < ··· < zₙ be the elements in sorted order and let Z_{ij} = {z_i, …, z_j}. Two elements are compared at most once over the whole run, because a comparison only ever involves the current pivot, and the pivot is excluded from both recursive subarrays. Define the indicator X_{ij} = 1 if z_i and z_j are ever compared, else 0. The total comparison count is X = Σ_{i<j} X_{ij}, so E[X] = Σ_{i<j} Pr{z_i is compared to z_j}.\n\n**Key probability.** z_i and z_j are compared iff the *first* element of Z_{ij} chosen as a pivot is z_i or z_j. Reason: if some z_k with i < k < j is picked first, it splits z_i and z_j into different subarrays and they are never again in the same partition together; whereas if z_i (or z_j) is the first of Z_{ij} chosen, it is compared against every other element of Z_{ij}, including z_j (or z_i). All |Z_{ij}| = j − i + 1 elements are equally likely to be the first of Z_{ij} selected (random pivots), so\nPr{z_i compared to z_j} = 2 / (j − i + 1).\n\n**Summing.** E[X] = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} 2/(j−i+1). Substituting k = j − i,\nE[X] = Σ_{i=1}^{n−1} Σ_{k=1}^{n−i} 2/(k+1) < Σ_{i=1}^{n−1} Σ_{k=1}^{n} 2/k = Σ_{i=1}^{n−1} O(log n).\nUsing the harmonic bound Σ_{k=1}^{n} 1/k = ln n + O(1), this is 2(n−1)(ln n + O(1)) = 2n·ln n + O(n) = Θ(n log n).\n\nSince this holds for every fixed input (the only randomness is in the pivot choices), the expected number of comparisons — and thus the expected running time — is Θ(n log n) on all inputs. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why quicksort wins in practice despite tying merge sort asymptotically.** Its inner partition loop is a tight sequential scan with excellent cache locality, it sorts **in place** (Θ(log n) stack space, no Θ(n) auxiliary array), and its constant factor on comparisons (≈ 2n ln n ≈ 1.39 n log₂ n) is small. Asymptotics declare a tie; constants and memory behavior decide the race."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "Randomization makes the worst case *improbable*, not *impossible*. RANDOMIZED-QUICKSORT can still take Θ(n²) time on a run of bad luck — its **expectation** is Θ(n log n), but it carries no worst-case guarantee. When a hard worst-case bound is required (real-time systems), use heapsort or introsort (quicksort that falls back to heapsort once recursion gets too deep)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Trace PARTITION (Lomuto, last-element pivot) on A = [13, 19, 9, 5, 12, 8, 7, 4, 21, 2, 6, 11]. Give the returned index q and the array afterward.",
                  "hint": "Pivot x = A[12] = 11. Sweep j, advancing i and swapping whenever A[j] ≤ 11.",
                  "solution": "x = 11. The elements ≤ 11 get pulled forward into the low region in their order of appearance: 9,5,8,7,4,2,6, ending with i = 7. The > 11 elements are *not* kept in appearance order — Lomuto only preserves the relative order of the low region. The final exchange A[i+1]↔A[r] = A[8]↔A[12] places 11 at index 8 and ships the element then sitting at position 8 to the end. Tracing the swaps gives Result: A = [9, 5, 8, 7, 4, 2, 6, **11**, 21, 13, 19, 12] with q = 8. (The low region A[1..7] are all ≤ 11; A[9..12] are all > 11, but in scrambled order.)"
                },
                {
                  "prompt": "Give an exact input of size n on which deterministic last-element-pivot quicksort makes the maximum possible number of comparisons, and state that number.",
                  "hint": "Maximum imbalance every level means the pivot is always extreme.",
                  "solution": "Any already-sorted (ascending) array, e.g. [1,2,…,n]. The last element n is always the maximum, so PARTITION peels it off, leaving a subarray of size n−1, and so on. The comparison count is Σ_{k=2}^{n} (k−1) = n(n−1)/2 = Θ(n²)."
                },
                {
                  "prompt": "In the indicator-variable proof, compute Pr{z_3 is compared to z_8} for distinct elements z_1<···<z_n, and explain in one sentence why it does not depend on n.",
                  "hint": "Use Pr = 2/(j − i + 1).",
                  "solution": "Here i = 3, j = 8, so |Z_{3,8}| = 8 − 3 + 1 = 6 and Pr = 2/6 = 1/3. It depends only on the *rank gap* j − i, not on n, because whether z_3 and z_8 are ever compared is decided entirely by which element of the 6-element set {z_3,…,z_8} is the first chosen as pivot — elements outside that set are irrelevant."
                },
                {
                  "prompt": "Quicksort recurses on both sides, while quickselect (next lesson) recurses on only one. Using the worst-case recurrence, explain why this single change can drop the expected cost from Θ(n log n) to Θ(n).",
                  "hint": "Compare T(n) = 2T(n/2)+Θ(n) with T(n) = T(n/2)+Θ(n).",
                  "solution": "Recursing on both halves gives T(n) = 2T(n/2) + Θ(n) = Θ(n log n): every level reproduces Θ(n) total work, and there are log n levels. Recursing on one half gives T(n) = T(n/2) + Θ(n), whose level work decays geometrically (n + n/2 + n/4 + ···), summing to Θ(n). Discarding one side per level is exactly what makes selection asymptotically cheaper than sorting."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a3l1-i1",
              "front": "Quicksort's structure vs merge sort?",
              "back": "Work is in the divide (PARTITION); no combine step. Pivot lands in its final position, then recurse on both sides. Merge sort is the mirror: trivial divide, work in MERGE."
            },
            {
              "id": "a3l1-i2",
              "front": "PARTITION loop invariant (Lomuto)?",
              "back": "At the start of iteration j: A[p..i] ≤ x, A[i+1..j−1] > x, A[r] = x. On return q = i+1 with A[p..q−1] ≤ A[q] < A[q+1..r]."
            },
            {
              "id": "a3l1-i3",
              "front": "Quicksort best vs worst case recurrences?",
              "back": "Balanced: T(n)=2T(n/2)+Θ(n)=Θ(n log n). Maximally unbalanced (pivot always extreme): T(n)=T(n−1)+Θ(n)=Θ(n²)."
            },
            {
              "id": "a3l1-i4",
              "front": "Why are two elements z_i, z_j compared at most once, and with what probability?",
              "back": "A comparison always involves the pivot, which is excluded from both subarrays. Pr{compared} = 2/(j−i+1): they meet iff z_i or z_j is the first of Z_{ij}={z_i,…,z_j} chosen as pivot."
            },
            {
              "id": "a3l1-i5",
              "front": "Expected comparisons of randomized quicksort, exactly?",
              "back": "E[X] = Σ_{i<j} 2/(j−i+1) = 2n·ln n + O(n) = Θ(n log n), on every input — the only randomness is the pivot choice."
            },
            {
              "id": "a3l1-i6",
              "front": "Does randomization remove quicksort's Θ(n²) worst case?",
              "back": "No — it makes it improbable, not impossible. Expectation is Θ(n log n) but there is no worst-case guarantee; use heapsort/introsort if one is required."
            }
          ]
        },
        {
          "id": "a3l2",
          "title": "Heaps, Heapsort & the Sorting Lower Bound",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "The heap data structure",
              "body": "A binary **heap** is an array we *view* as a nearly-complete binary tree: the tree is filled on every level except possibly the last, which fills left to right. For a 1-indexed array A of length n = A.heap-size, the children and parent of index i are PARENT(i) = ⌊i/2⌋, LEFT(i) = 2i, RIGHT(i) = 2i+1. This implicit layout needs no pointers. A **max-heap** additionally satisfies the max-heap property; it is the structure behind heapsort and priority queues."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Max-heap property; height",
              "statement": "An array A is a **max-heap** if A[PARENT(i)] ≥ A[i] for every node i > 1 — i.e. every parent is ≥ each of its children, so the maximum sits at the root A[1]. The **height of a node** is the number of edges on the longest downward path from it to a leaf; the **height of the heap** is the height of the root, which is ⌊log₂ n⌋ for n elements."
            },
            {
              "type": "code",
              "heading": "MAX-HEAPIFY and BUILD-MAX-HEAP",
              "lang": "text",
              "code": "MAX-HEAPIFY(A, i)            // assumes subtrees of i are heaps; fixes i\n  l = LEFT(i); r = RIGHT(i)\n  largest = i\n  if l <= A.heap-size and A[l] > A[largest]\n    largest = l\n  if r <= A.heap-size and A[r] > A[largest]\n    largest = r\n  if largest != i\n    exchange A[i] with A[largest]\n    MAX-HEAPIFY(A, largest)   // sift down one level, recurse\n\nBUILD-MAX-HEAP(A, n)\n  A.heap-size = n\n  for i = floor(n/2) downto 1     // leaves (i > n/2) are already heaps\n    MAX-HEAPIFY(A, i)"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "MAX-HEAPIFY cost; leaves are trivial heaps",
              "statement": "MAX-HEAPIFY(A, i) runs in O(h) time on a node of height h. Every index i with ⌊n/2⌋ < i ≤ n is a leaf, hence already a one-element max-heap.",
              "proof": "MAX-HEAPIFY does O(1) comparisons and at most one swap at node i, then recurses on one child — sifting the violating element strictly downward by one level each call. The recursion depth is therefore at most the height h of node i, giving O(h) total (equivalently O(log n) since h ≤ ⌊log₂ n⌋).\n\nFor the second claim: index 2i = LEFT(i) exceeds n exactly when i > n/2, i.e. i ≥ ⌊n/2⌋+1. Such a node has no children, so it is a leaf and trivially satisfies the max-heap property. Hence BUILD-MAX-HEAP may safely begin at i = ⌊n/2⌋ and ignore the upper half. ∎"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Count of nodes at a given height",
              "statement": "In a heap of n elements, the number of nodes of height h is at most ⌈n/2^{h+1}⌉.",
              "proof": "The leaves have height 0. In a nearly-complete tree there are ⌈n/2⌉ leaves (every index > ⌊n/2⌋ is a leaf, and there are n − ⌊n/2⌋ = ⌈n/2⌉ of them), so the count at h = 0 is ⌈n/2⌉ = ⌈n/2^{0+1}⌉. Going up one level, each node of height h sits atop a subtree containing at least one node of height h−1 below it, and these subtrees are disjoint; a counting/induction argument (CLRS Exercise 6.3-3) shows the number of height-h nodes is at most ⌈(count at height h−1)/2⌉, which unwinds to the bound ⌈n/2^{h+1}⌉. Intuitively, each step up the tree at most halves the available nodes. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "BUILD-MAX-HEAP runs in O(n) time",
              "statement": "BUILD-MAX-HEAP converts an arbitrary array of n elements into a max-heap in O(n) time — not the looser O(n log n) the per-call bound would suggest.",
              "proof": "BUILD-MAX-HEAP calls MAX-HEAPIFY once per node, and a call on a node of height h costs O(h) (previous lemma). There are at most ⌈n/2^{h+1}⌉ nodes of height h. Summing over all heights h = 0, 1, …, ⌊log₂ n⌋:\n\nT(n) = Σ_{h=0}^{⌊log₂ n⌋} ⌈n/2^{h+1}⌉ · O(h) = O( n · Σ_{h=0}^{⌊log₂ n⌋} h/2^h ).\n\nExtend the sum to infinity (only adds nonnegative terms): Σ_{h=0}^{∞} h/2^h. Using the identity Σ_{h=0}^{∞} h·x^h = x/(1−x)² for |x| < 1, at x = 1/2 we get (1/2)/(1/2)² = (1/2)/(1/4) = 2. Therefore\n\nT(n) = O(n · 2) = O(n).\n\nThe naive bound O(n log n) overcounts because it charges every node the maximum height log n, but **most nodes are near the bottom**: half the nodes are leaves with h = 0 (cost 0), a quarter have h = 1, and so on — the height-weighted sum converges. ∎"
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Why BUILD-MAX-HEAP is O(n): work is bounded by Σ_h (nodes of height h)·O(h). The cheap, numerous low nodes dominate the count; the expensive high nodes are few. The height-weighted sum is n·Σ h/2^h = 2n.",
              "levels": [
                {
                  "n": "h=0 (leaves)",
                  "each": "O(0)",
                  "row": "(n/2)·0 = 0"
                },
                {
                  "n": "h=1",
                  "each": "O(1)",
                  "row": "(n/4)·1 = n/4"
                },
                {
                  "n": "h=2",
                  "each": "O(2)",
                  "row": "(n/8)·2 = n/4"
                },
                {
                  "ellipsis": true,
                  "row": "⋮"
                },
                {
                  "n": "h=⌊log n⌋ (root)",
                  "each": "O(log n)",
                  "row": "1·log n"
                }
              ],
              "total": "n·Σ_{h≥0} h/2^h = n·2 = O(n)"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Heapsort",
              "statement": "HEAPSORT sorts n elements in Θ(n log n) time and Θ(1) extra space (in place).",
              "proof": "HEAPSORT first calls BUILD-MAX-HEAP (Θ(n)). It then repeats n−1 times: exchange the root A[1] (the current maximum) with the last heap element A[heap-size], decrement heap-size (freezing that maximum into its final sorted slot), and call MAX-HEAPIFY(A,1) to restore the heap. Each MAX-HEAPIFY costs O(log n), so the loop is O(n log n), dominating the Θ(n) build; hence Θ(n log n) overall (it is also Ω(n log n) by the lower bound below). All work is swaps within A, so the extra space is Θ(1). ∎"
            },
            {
              "type": "text",
              "heading": "The comparison lower bound: a wall at n log n",
              "body": "Heapsort, merge sort, and randomized quicksort all reach Θ(n log n). Is that a coincidence, or a barrier? It is a barrier — for **comparison sorts**, algorithms that gain information about the order only by comparing pairs of keys (tests like A[i] ≤ A[j]). We model any such algorithm as a **decision tree** and prove no comparison sort can beat Ω(n log n) in the worst case."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Decision tree",
              "statement": "A **decision tree** for sorting n elements is a binary tree in which each internal node is labeled with a comparison i:j (\"is A[i] ≤ A[j]?\"), its two outgoing edges correspond to the two outcomes, and each leaf is labeled with a permutation of {1,…,n} — the output ordering produced along that root-to-leaf path. Executing the algorithm on an input traces one root-to-leaf path; its length is the number of comparisons made, and the worst-case comparison count is the **height** of the tree."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Ω(n log n) comparison lower bound",
              "statement": "Any comparison-based sorting algorithm makes Ω(n log n) comparisons in the worst case. Sharply, the worst-case number of comparisons is at least ⌈log₂(n!)⌉.",
              "proof": "Fix a comparison sort and its decision tree T on n elements. **Each of the n! distinct input permutations must reach a distinct leaf**: if two different orderings reached the same leaf, the algorithm would emit the same output permutation for both, and at least one would be left unsorted — a contradiction with correctness. Hence T has at least n! reachable leaves.\n\nA binary tree of height h has at most 2^h leaves (proof: by induction on h — a height-0 tree has 1 = 2^0 leaf; a height-h tree's two subtrees each have height ≤ h−1, so at most 2·2^{h−1} = 2^h leaves total). Combining, 2^h ≥ (number of leaves) ≥ n!, so\n\nh ≥ log₂(n!).\n\nBecause h is an integer, h ≥ ⌈log₂(n!)⌉. Finally, by Stirling's approximation n! ≥ (n/e)^n, so\n\nlog₂(n!) ≥ n·log₂(n/e) = n·log₂ n − n·log₂ e = Ω(n log n).\n\nSince the worst-case comparison count equals the tree's height h, every comparison sort makes Ω(n log n) comparisons in the worst case. ∎"
            },
            {
              "type": "example",
              "heading": "Evaluating the bound: n = 4 and n = 8",
              "body": "The mastery gate asks for ⌈log₂(n!)⌉ at specific n. Compute directly.\n\n**n = 4:** 4! = 24. log₂ 24 = ln 24 / ln 2 ≈ 3.178 / 0.693 ≈ 4.585. So ⌈log₂ 24⌉ = **5**. Thus *no* comparison sort can always sort 4 elements with fewer than 5 comparisons in the worst case (and 5 is achievable — merge insertion attains it).\n\n**n = 8:** 8! = 40320. log₂ 40320 = ln 40320 / ln 2 ≈ 10.605 / 0.693 ≈ 15.30. So ⌈log₂ 40320⌉ = **16**. Any comparison sort needs ≥ 16 comparisons in the worst case to sort 8 elements.\n\nGeneral recipe: compute n!, take log₂ (= log₁₀ n! / log₁₀ 2, or ln n! / ln 2), then round **up**."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The bound is about comparisons, not sorting in general.** Counting sort, radix sort, and bucket sort run in Θ(n) (or Θ(n+k)) by exploiting structure of the *keys* — using them as array indices or digit buckets — rather than comparing them. They sidestep the decision-tree model entirely, so Ω(n log n) does not apply. The wall blocks only algorithms whose sole tool is pairwise comparison."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Run BUILD-MAX-HEAP on A = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7] (n = 10). Give the resulting array.",
                  "hint": "Start at i = ⌊10/2⌋ = 5 and call MAX-HEAPIFY down to i = 1; leaves (i = 6..10) are skipped.",
                  "solution": "Processing i = 5,4,3,2,1 (the canonical CLRS Figure 6.3 example) yields the max-heap A = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1]. Check the root 16 is the maximum and every parent ≥ its children, e.g. node 2 (=14) ≥ children 8 and 7; node 3 (=10) ≥ children 9 and 3."
                },
                {
                  "prompt": "Compute the comparison lower bound ⌈log₂(n!)⌉ for n = 4 and n = 8 from first principles, and state what each number means.",
                  "hint": "4! = 24, 8! = 40320; divide log by log 2 and round up.",
                  "solution": "n=4: log₂(24) ≈ 4.585 → ⌈·⌉ = 5, so no comparison sort sorts 4 elements with fewer than 5 worst-case comparisons. n=8: log₂(40320) ≈ 15.30 → ⌈·⌉ = 16, so ≥ 16 worst-case comparisons are required to sort 8 elements."
                },
                {
                  "prompt": "Prove that BUILD-MAX-HEAP is O(n), not O(n log n). State the two facts you sum and the value of the resulting series.",
                  "hint": "Bound nodes of height h, and the cost of MAX-HEAPIFY at height h.",
                  "solution": "Sum two facts: (1) there are ≤ ⌈n/2^{h+1}⌉ nodes of height h; (2) MAX-HEAPIFY on a height-h node costs O(h). Total T(n) = Σ_{h=0}^{⌊log n⌋} ⌈n/2^{h+1}⌉·O(h) = O(n·Σ_{h≥0} h/2^h). The series Σ_{h≥0} h/2^h = (1/2)/(1−1/2)² = 2. Hence T(n) = O(2n) = O(n). The O(n log n) estimate is loose because it charges every node height log n, whereas half the nodes (leaves) cost 0 and the height-weighted total converges."
                },
                {
                  "prompt": "Prove the decision-tree lower bound, identifying every quantity: number of leaves, height bound, and the final asymptotic.",
                  "hint": "n! distinct outputs, ≤ 2^h leaves in a height-h binary tree, then Stirling.",
                  "solution": "Model the sort as a binary decision tree (internal node = comparison, leaf = output permutation). Correctness forces ≥ n! reachable leaves (distinct inputs need distinct outputs). A height-h binary tree has ≤ 2^h leaves, so 2^h ≥ n!, giving h ≥ log₂(n!) ≥ ⌈log₂(n!)⌉ (h integer). By Stirling n! ≥ (n/e)^n, so log₂(n!) ≥ n log₂ n − n log₂ e = Ω(n log n). The height h is exactly the worst-case comparison count, so any comparison sort needs Ω(n log n) comparisons in the worst case. ∎"
                },
                {
                  "prompt": "Counting sort runs in Θ(n + k) on integer keys in {0,…,k}. Reconcile this with the Ω(n log n) bound.",
                  "hint": "Which model does counting sort live in?",
                  "solution": "No contradiction: counting sort is not a comparison sort. It never executes a key-vs-key comparison; it uses each key directly as an array index to tally occurrences and compute output positions. The Ω(n log n) decision-tree bound constrains only algorithms whose information comes solely from comparisons, so it does not apply to counting sort. (For k = O(n) counting sort is Θ(n).)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a3l2-i1",
              "front": "Max-heap property, index arithmetic, and heap height?",
              "back": "A[PARENT(i)] ≥ A[i] for all i>1, so max is at A[1]. PARENT=⌊i/2⌋, LEFT=2i, RIGHT=2i+1. Heap height = ⌊log₂ n⌋."
            },
            {
              "id": "a3l2-i2",
              "front": "Cost of MAX-HEAPIFY and which indices are already heaps?",
              "back": "O(h) = O(log n) — it sifts down one level per recursive call. Indices i > ⌊n/2⌋ are leaves, hence trivial heaps; BUILD starts at ⌊n/2⌋."
            },
            {
              "id": "a3l2-i3",
              "front": "BUILD-MAX-HEAP cost and the key sum?",
              "back": "O(n). T(n)=Σ_{h} ⌈n/2^{h+1}⌉·O(h)=O(n·Σ h/2^h)=O(n·2)=O(n). Most nodes are cheap leaves, so the height-weighted sum converges to 2n."
            },
            {
              "id": "a3l2-i4",
              "front": "Value of Σ_{h≥0} h/2^h, and why it matters here?",
              "back": "It equals 2 (from Σ h·x^h = x/(1−x)² at x=1/2). It is exactly the constant that turns the naive O(n log n) BUILD bound into the tight O(n)."
            },
            {
              "id": "a3l2-i5",
              "front": "Heapsort time and space?",
              "back": "Θ(n log n) time, Θ(1) extra space (in place): BUILD-MAX-HEAP Θ(n), then n−1 extract-max-and-MAX-HEAPIFY steps at O(log n) each."
            },
            {
              "id": "a3l2-i6",
              "front": "Decision-tree lower bound chain of inequalities?",
              "back": "≥ n! reachable leaves (correctness); ≤ 2^h leaves for height h ⇒ 2^h ≥ n! ⇒ h ≥ ⌈log₂(n!)⌉ = Ω(n log n) by Stirling. h = worst-case comparison count."
            },
            {
              "id": "a3l2-i7",
              "front": "⌈log₂(n!)⌉ for n = 4 and n = 8?",
              "back": "n=4: 4!=24, log₂24≈4.585 ⇒ 5. n=8: 8!=40320, log₂40320≈15.30 ⇒ 16."
            },
            {
              "id": "a3l2-i8",
              "front": "Why do counting/radix sort beat Ω(n log n)?",
              "back": "They aren't comparison sorts — they use keys as indices/digits rather than comparing them, so the decision-tree model (and its bound) doesn't apply."
            }
          ]
        },
        {
          "id": "a3l3",
          "title": "Selection in Linear Time",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "Selection is easier than sorting",
              "body": "The **selection problem**: given an array of n distinct numbers and an integer k ∈ {1,…,n}, return the k-th smallest element (its **order statistic**). The k = ⌈n/2⌉ case is the **median**. One could sort (Θ(n log n)) and index, but sorting solves a *harder* problem — it orders *all* elements. We will see selection can be done in Θ(n): expected linear via randomization, and worst-case linear via the median-of-medians pivot. This beats the Ω(n log n) sorting wall precisely because selection need not produce a full ordering."
            },
            {
              "type": "code",
              "heading": "RANDOMIZED-SELECT (quickselect)",
              "lang": "text",
              "code": "RANDOMIZED-SELECT(A, p, r, k)   // returns k-th smallest of A[p..r]\n  if p == r\n    return A[p]\n  q = RANDOMIZED-PARTITION(A, p, r)   // random pivot, as in quicksort\n  i = q - p + 1                       // rank of pivot within A[p..r]\n  if k == i\n    return A[q]                       // pivot is the answer\n  else if k < i\n    return RANDOMIZED-SELECT(A, p, q - 1, k)        // recurse LEFT only\n  else\n    return RANDOMIZED-SELECT(A, q + 1, r, k - i)    // recurse RIGHT only"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "k-th order statistic",
              "statement": "For a set of n distinct elements, the **k-th order statistic** is the element that is larger than exactly k−1 of the others (the k-th smallest). The **minimum** is k=1, the **maximum** is k=n, and a **median** is k=⌊(n+1)/2⌋ (lower) or ⌈(n+1)/2⌉ (upper)."
            },
            {
              "type": "text",
              "heading": "The one-sided recursion",
              "body": "Quickselect is quicksort that, after partitioning, throws away the side that cannot contain the answer. If the pivot's rank i equals k, we are done. If k < i, the answer is among the i−1 elements to the left; if k > i, it is the (k−i)-th smallest of the right side. We recurse on **one** side only — that single change is what collapses Θ(n log n) into Θ(n)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "RANDOMIZED-SELECT runs in expected Θ(n) time",
              "statement": "On any input of n distinct elements and any k, RANDOMIZED-SELECT runs in expected time Θ(n); its worst case is Θ(n²).",
              "proof": "**Worst case.** If every random pivot is the extreme element, partitioning peels off one element and we recurse on n−1: T(n) = T(n−1) + Θ(n) = Θ(n²). (This needs a sequence of unlucky pivots, just as in quicksort.)\n\n**Expected case.** A pivot of rank i (uniform over 1..n) sends the recursion into a subarray of size max(i−1, n−i). Let T(n) be the expected running time. Conditioning on the random rank i, each value 1..n equally likely, and bounding the recursive subarray size by max(i−1, n−i):\n\nE[T(n)] ≤ (1/n) Σ_{i=1}^{n} E[T(max(i−1, n−i))] + O(n).\n\nThe term max(i−1, n−i) takes each value in {⌈n/2⌉, …, n−1} at most twice as i ranges over 1..n, so\n\nE[T(n)] ≤ (2/n) Σ_{j=⌊n/2⌋}^{n−1} E[T(j)] + O(n).\n\nWe show E[T(n)] ≤ c·n by substitution. Assume E[T(j)] ≤ c·j for j < n. Then\nE[T(n)] ≤ (2c/n) Σ_{j=⌊n/2⌋}^{n−1} j + O(n).\nThe sum Σ_{j=⌊n/2⌋}^{n−1} j ≤ (1/2)(n−1+n/2)(n/2) ≤ (3/8)n² (a standard arithmetic-series bound), so\nE[T(n)] ≤ (2c/n)(3/8)n² + O(n) = (3/4)c·n + O(n).\nChoosing c large enough that the O(n) term is ≤ (1/4)c·n gives E[T(n)] ≤ c·n. Hence E[T(n)] = O(n); since any algorithm must read all n elements, E[T(n)] = Θ(n).\n\nThe geometric intuition: expected subarray sizes shrink by a constant factor (roughly to 3n/4) each level, so the total expected work is the geometric series n + (3/4)n + (3/4)²n + ··· = Θ(n). ∎"
            },
            {
              "type": "text",
              "heading": "Worst-case linear: median of medians (BFPRT)",
              "body": "RANDOMIZED-SELECT is only *expected* linear. The **SELECT** algorithm of Blum, Floyd, Pratt, Rivest, and Tarjan (BFPRT) chooses the pivot deterministically so that *every* partition is guaranteed balanced, yielding worst-case Θ(n). The trick: produce a pivot that is provably neither too small nor too large by taking a **median of medians**."
            },
            {
              "type": "code",
              "heading": "SELECT (median of medians)",
              "lang": "text",
              "code": "SELECT(A, k):\n  1. Divide the n elements into ⌈n/5⌉ groups of 5 (last group may be smaller).\n  2. Sort each group (O(1) each) and take its median → ⌈n/5⌉ medians.\n  3. x = SELECT(medians, ⌈⌈n/5⌉/2⌉)   // recursively, the median of the medians\n  4. Partition A around x; let i = rank of x.\n  5. if k == i: return x\n     else if k < i: return SELECT(left part, k)\n     else:          return SELECT(right part, k - i)"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "The median-of-medians pivot forces a balanced split",
              "statement": "The pivot x chosen in step 3 is greater than at least 3n/10 − 6 elements of A and, symmetrically, less than at least 3n/10 − 6 elements. Hence each recursive call in step 5 acts on at most 7n/10 + 6 elements.",
              "proof": "There are ⌈n/5⌉ group medians, and x is their median, so at least half of them — about ⌈n/5⌉/2 ≥ n/10 group medians — are ≤ x. Consider any group whose median is ≤ x. In that group of 5, three elements (the median and the two smaller ones) are ≤ its median, hence ≤ x. So each such group contributes ≥ 3 elements that are ≤ x.\n\nExcluding the group containing x itself and the possibly-undersized last group (subtracting at most 2 groups, i.e. discounting up to 6 elements), the number of elements guaranteed ≤ x is at least 3·(⌈(1/2)⌈n/5⌉⌉ − 2) ≥ 3n/10 − 6. By the symmetric argument (groups with median ≥ x each contribute ≥ 3 elements ≥ x), at least 3n/10 − 6 elements are ≥ x.\n\nTherefore when we partition around x, the larger side excludes the ≥ 3n/10 − 6 elements on the other side, so it has at most n − (3n/10 − 6) = 7n/10 + 6 elements. The single recursive call in step 5 thus runs on ≤ 7n/10 + 6 elements. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "SELECT runs in worst-case Θ(n) time",
              "statement": "SELECT computes any order statistic of n distinct elements in O(n) time in the worst case; since reading the input is Ω(n), it is Θ(n).",
              "proof": "Account for the steps. Steps 1, 2, and 4 (grouping, sorting groups of constant size 5, and partitioning) are each O(n). Step 3 recurses on the ⌈n/5⌉ medians, costing T(⌈n/5⌉) ≤ T(n/5 + 1). Step 5 recurses on a side of size ≤ 7n/10 + 6 by the previous lemma, costing ≤ T(7n/10 + 6). Hence, for some constant a,\n\nT(n) ≤ T(n/5 + 1) + T(7n/10 + 6) + a·n   (for n above a constant threshold).\n\nWe prove T(n) ≤ c·n by substitution, for a suitable constant c. Assuming the bound for all sizes below n,\n\nT(n) ≤ c(n/5 + 1) + c(7n/10 + 6) + a·n\n     = c·n(1/5 + 7/10) + 7c + a·n\n     = (9/10)c·n + 7c + a·n.\n\nThe decisive fact is **1/5 + 7/10 = 9/10 < 1**: the two recursive sizes sum to a constant fraction of n strictly below 1, leaving slack (1/10)c·n to absorb the linear overhead. Rearranging,\nT(n) ≤ c·n − [ (1/10)c·n − 7c − a·n ] = c·n − [ ((1/10)c − a)n − 7c ].\nChoose c ≥ 10a; then (1/10)c − a ≥ 0 and for n large enough the bracket is ≥ 0, giving T(n) ≤ c·n. Therefore T(n) = O(n), and with the trivial Ω(n) lower bound, T(n) = Θ(n). ∎"
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Why median-of-medians is linear: the two recursive sizes n/5 and 7n/10 sum to (9/10)n < n, so per-level work decays geometrically and totals Θ(n). Were the sum = n, it would be Θ(n log n); were it > n, worse.",
              "levels": [
                {
                  "n": "n",
                  "each": "a·n",
                  "row": "a·n"
                },
                {
                  "n": "n/5 + 7n/10 = 9n/10",
                  "each": "a·(9/10)n",
                  "row": "(9/10)·a·n"
                },
                {
                  "n": "(9/10)²n",
                  "each": "a·(9/10)²n",
                  "row": "(9/10)²·a·n"
                },
                {
                  "ellipsis": true,
                  "row": "⋮"
                }
              ],
              "total": "a·n·Σ_{k≥0}(9/10)^k = a·n·10 = Θ(n)"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why groups of 5, and why 9/10 < 1 is the whole trick.** A recurrence T(n) ≤ T(αn) + T(βn) + Θ(n) solves to Θ(n) exactly when α + β < 1 (geometric decay), to Θ(n log n) when α + β = 1, and to superlinear when α + β > 1. Groups of 5 give 1/5 + 7/10 = 9/10 < 1. **Groups of 3 fail:** they yield 1/3 + 2/3 = 1, i.e. Θ(n log n). Groups of 7 also work but waste effort sorting larger groups. Five is the smallest odd group size that keeps the sum below 1."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "The Θ(n) of median-of-medians hides a **large constant** — all the grouping, group-sorting, and the extra recursion make it slower in practice than RANDOMIZED-SELECT's expected Θ(n). BFPRT matters when a *worst-case* guarantee is required (e.g. to pick a provably good quicksort pivot, as in introselect). For everyday selection, randomized quickselect is the pragmatic choice."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Use RANDOMIZED-SELECT to find the median (k = 4) of A = [3, 9, 1, 7, 5, 2, 8] (n = 7) when the first pivot happens to land on value 5. Show the one-sided recursion.",
                  "hint": "Partition about 5, find its rank i, then recurse only into the side containing rank k = 4.",
                  "solution": "For n=7 the median is the 4th smallest. Partition about pivot 5: left = {3,1,2} (≤5), then 5, then {9,7,8}. Pivot rank i = 4. Since k = 4 = i, return 5 immediately — the median is 5, found without recursing. (If the pivot had ranked, say, i = 6, we would recurse only on the left part for the 4th smallest.)"
                },
                {
                  "prompt": "State the median-of-medians recurrence and solve it, making explicit which inequality guarantees linearity.",
                  "hint": "Two recursive calls of size n/5 and 7n/10.",
                  "solution": "T(n) ≤ T(n/5) + T(7n/10) + Θ(n). The substitution T(n) ≤ c·n gives c·n(1/5 + 7/10) + Θ(n) = (9/10)c·n + Θ(n) ≤ c·n once c is large enough, because **1/5 + 7/10 = 9/10 < 1** leaves (1/10)c·n of slack to cover the Θ(n) overhead. The sum of recursive fractions being strictly less than 1 is precisely what makes the total work a convergent geometric series and hence T(n) = Θ(n)."
                },
                {
                  "prompt": "Show that median-of-medians with groups of 3 does NOT give a linear-time algorithm.",
                  "hint": "Recompute the guaranteed-balanced fraction for group size 3.",
                  "solution": "With groups of 3, each group of median ≤ x contributes only 2 elements ≤ x (the median and one smaller). The pivot then beats ≈ 2·(n/3)/2 = n/3 elements, so the larger recursive side can be as big as ≈ 2n/3, and the median array has size n/3. The recurrence becomes T(n) ≤ T(n/3) + T(2n/3) + Θ(n). Now 1/3 + 2/3 = 1, the boundary case, which solves to Θ(n log n) — not linear. This is why 5 (not 3) is the smallest workable group size."
                },
                {
                  "prompt": "Prove the lemma's headline bound: that at least 3n/10 − 6 elements are ≤ the median-of-medians pivot x.",
                  "hint": "Half the group medians are ≤ x; each such group contributes 3 small elements.",
                  "solution": "There are ⌈n/5⌉ group medians and x is their median, so at least ⌈(1/2)⌈n/5⌉⌉ ≥ n/10 group medians are ≤ x. In each such group of 5, the median and the two elements below it — 3 elements — are ≤ that group's median, hence ≤ x. Discounting the group containing x and the possibly-short last group (at most 2 groups, i.e. 6 elements), the count of elements guaranteed ≤ x is at least 3·(n/10 − 2) = 3n/10 − 6. By symmetry the same count is ≥ x, so the larger partition has ≤ 7n/10 + 6 elements. ∎"
                },
                {
                  "prompt": "Both quickselect and median-of-medians find order statistics in linear (expected/worst-case) time, beating the Ω(n log n) sorting bound. Why is there no contradiction?",
                  "hint": "What does the Ω(n log n) bound actually constrain?",
                  "solution": "The Ω(n log n) bound is a lower bound on *sorting* — producing a full ordering of all n elements — under the comparison model. Selection produces a *single* order statistic, a strictly easier task; it discards information about the relative order of the elements it does not return. No theorem forces selection to be as hard as sorting, and indeed it is asymptotically cheaper. (Selection still requires Ω(n) comparisons, since every element must be examined, and both algorithms meet that bound.)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a3l3-i1",
              "front": "What is the k-th order statistic, and what does quickselect exploit over quicksort?",
              "back": "The k-th smallest element (larger than exactly k−1 others). Quickselect recurses into only the one side containing rank k, discarding the other — one-sided recursion gives expected Θ(n)."
            },
            {
              "id": "a3l3-i2",
              "front": "RANDOMIZED-SELECT expected vs worst case, and the intuition?",
              "back": "Expected Θ(n), worst Θ(n²). Expected subarray shrinks by a constant factor (~3/4) per level, so work is a geometric series n + (3/4)n + … = Θ(n)."
            },
            {
              "id": "a3l3-i3",
              "front": "Median-of-medians: what pivot, and what split does it guarantee?",
              "back": "Pivot = median of the ⌈n/5⌉ group-of-5 medians. It beats ≥ 3n/10 − 6 elements on each side, so each recursive call has size ≤ 7n/10 + 6."
            },
            {
              "id": "a3l3-i4",
              "front": "SELECT recurrence and the decisive inequality?",
              "back": "T(n) ≤ T(n/5) + T(7n/10) + Θ(n). Since 1/5 + 7/10 = 9/10 < 1, the work decays geometrically and T(n) = Θ(n) — worst-case linear."
            },
            {
              "id": "a3l3-i5",
              "front": "Why groups of 5 and not 3?",
              "back": "Group size 3 gives 1/3 + 2/3 = 1 ⇒ Θ(n log n). Five is the smallest odd size keeping the recursive fractions' sum below 1 (9/10 < 1), so it stays linear."
            },
            {
              "id": "a3l3-i6",
              "front": "Why does linear selection not violate the Ω(n log n) sorting bound?",
              "back": "That bound is for sorting (a full ordering). Selection returns one order statistic — a strictly easier task — so it can be Θ(n). It still needs Ω(n) comparisons to read all elements."
            }
          ]
        }
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
          "id": "a4l1",
          "title": "Hash Tables & Chaining",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "From direct addressing to hashing",
              "body": "Suppose we must support **Insert**, **Search**, and **Delete** on dynamic sets of keys drawn from a *universe* U = {0, 1, …, U−1}. The cleanest idea is **direct addressing**: allocate an array T[0..U−1] with one slot per possible key, and store the element with key k in T[k]. Every operation is then worst-case O(1).\n\nThe catch is *space*. If U is enormous — 64-bit integers, or arbitrary strings — we cannot afford |U| slots merely to hold the n ≪ |U| keys actually present. **Hashing** keeps the O(1)-per-operation flavor while shrinking the array to a size m proportional to n.\n\nA **hash function** h : U → {0, 1, …, m−1} maps each key into one of m *slots*; key k is stored in (or near) slot h(k). We use only Θ(m) space, but we surrender direct addressing's collision-freeness."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Hash table, collision, load factor",
              "statement": "A **hash table** is an array T[0..m−1] together with a hash function h : U → {0,…,m−1}. Two distinct keys k₁ ≠ k₂ **collide** when h(k₁) = h(k₂). With n keys stored in m slots, the **load factor** is α = n/m, the average number of keys per slot."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Collisions are unavoidable (pigeonhole)",
              "statement": "If |U| > m then for every hash function h : U → {0,…,m−1} there exist two distinct keys k₁ ≠ k₂ with h(k₁) = h(k₂).",
              "proof": "The function h maps the |U| keys of the universe into m slots. By the **pigeonhole principle**, if |U| > m then at least two distinct keys must map to the same slot: were h injective, its image would have |U| > m elements, but the codomain has only m. Hence some slot receives ≥ 2 keys, i.e. a collision exists. Because this holds for *every* h, no choice of hash function can eliminate collisions when the universe exceeds the table size — we can only resolve them. ∎"
            },
            {
              "type": "text",
              "heading": "Chaining and simple uniform hashing",
              "body": "**Chaining** resolves collisions by making each slot the head of a linked list: T[j] points to a list of all stored keys k with h(k) = j.\n\n- **Insert(k)**: prepend k to list T[h(k)] — O(1) (assuming k is not already present, or we accept duplicates).\n- **Search(k)**: scan list T[h(k)] — time proportional to that list's length.\n- **Delete(k)**: splice k out of its list — O(1) with a doubly linked list once we hold k's node.\n\nTo reason about the *expected* cost we adopt the standard idealization:"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Simple uniform hashing assumption (SUHA)",
              "statement": "**Simple uniform hashing** assumes each key is equally likely to hash to any of the m slots, independently of where the other keys hash: for every key k and slot j, Pr[h(k) = j] = 1/m. Equivalently, for distinct keys k₁ ≠ k₂, Pr[h(k₁) = h(k₂)] = 1/m. We also assume h(k) is computable in O(1) time."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected cost of an unsuccessful search",
              "statement": "In a hash table with chaining holding n keys in m slots, under simple uniform hashing the **expected number of keys examined in an unsuccessful search is exactly α = n/m**, and the expected running time of the search (including computing h) is Θ(1 + α).",
              "proof": "An unsuccessful search for a key k that is absent scans the entire list at slot h(k). Number the stored keys 1, 2, …, n. For each stored key i define the indicator\n\n  Xᵢ = 1[ h(keyᵢ) = h(k) ],   so  Xᵢ = 1 iff key i lands in the searched slot.\n\nUnder SUHA, key i is equally likely to hash to any of the m slots, so\n\n  E[Xᵢ] = Pr[ h(keyᵢ) = h(k) ] = 1/m.\n\nThe number of keys examined equals the length of list T[h(k)], namely L = Σ_{i=1}^{n} Xᵢ. By **linearity of expectation** (no independence needed),\n\n  E[L] = Σ_{i=1}^{n} E[Xᵢ] = n · (1/m) = n/m = α.\n\nThe search also spends O(1) computing h(k) and reaching the slot, plus O(1) per examined key, so the total expected time is Θ(1) + Θ(E[L]) = Θ(1 + α). ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected cost of a successful search",
              "statement": "Under simple uniform hashing, the expected number of keys examined in a **successful** search (averaged uniformly over the n stored keys) is at most 1 + α/2 − α/(2n) = Θ(1 + α). Hence successful search also runs in expected Θ(1 + α) time.",
              "proof": "Assume keys are inserted by prepending, so a list holds its keys in reverse insertion order, and a successful search for key x scans x together with every key inserted *after* x into x's slot. Number the keys 1,…,n in **insertion order** (key i is the i-th inserted). For i < j let\n\n  X_{ij} = 1[ h(keyᵢ) = h(key_j) ].\n\nUnder SUHA, E[X_{ij}] = 1/m. When we search for key i, the keys examined are key i itself (1 element) plus every key j > i sharing its slot. So the count examined for key i is 1 + Σ_{j>i} X_{ij}. Averaging over the uniformly chosen target i,\n\n  E = (1/n) Σ_{i=1}^{n} E[ 1 + Σ_{j=i+1}^{n} X_{ij} ]\n     = (1/n) Σ_{i=1}^{n} ( 1 + Σ_{j=i+1}^{n} 1/m )\n     = 1 + (1/(nm)) Σ_{i=1}^{n} (n − i).\n\nNow Σ_{i=1}^{n} (n − i) = Σ_{k=0}^{n−1} k = n(n−1)/2, so\n\n  E = 1 + (n(n−1)) / (2nm) = 1 + (n−1)/(2m) = 1 + α/2 − α/(2n).\n\nThis is Θ(1 + α). ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Expected, not worst case.** Both theorems average over the hashing. The *worst case* of chaining is Θ(n): an adversary (or unlucky h) can put all n keys in one slot, and then every search is a length-n scan. The O(1) promise is only as good as α stays O(1) and the keys are not pathological — issues fixed by **resizing** (lesson 4) and **universal hashing** (lesson 3)."
            },
            {
              "type": "example",
              "heading": "Reading α off a concrete table",
              "body": "Let m = 8 and insert keys {5, 13, 21, 7, 14} with h(k) = k mod 8.\n\n  h(5)=5, h(13)=5, h(21)=5, h(7)=7, h(14)=6.\n\nSlots: T[5] = [21,13,5] (length 3), T[6] = [14], T[7] = [7], all others empty. Here n = 5, m = 8, so α = 5/8 = 0.625. The *expected* unsuccessful-search length is α = 0.625, even though this particular adversarial-ish input piled three keys into slot 5. That gap between an expectation (0.625) and a realized worst list (3) is exactly why we distinguish expected from worst-case cost."
            },
            {
              "type": "example",
              "heading": "Why Θ(1 + α) and not Θ(α)",
              "body": "Suppose α = 0 (the table is empty) — an unsuccessful search still must compute h(k) and inspect one empty slot, costing Θ(1), not Θ(0). The ‘+1’ in Θ(1 + α) accounts for the unavoidable hash-and-probe step. When α is a constant (say we keep α ≤ 3/4 by resizing), Θ(1 + α) = Θ(1): hashing delivers the constant-time dictionary. When α grows like n (e.g. m fixed while n → ∞), Θ(1 + α) = Θ(n): performance degrades to a linked list."
            },
            {
              "type": "example",
              "heading": "Successful vs unsuccessful at α = 1",
              "body": "Take n = m so α = 1. The unsuccessful-search expectation is α = 1 key examined. The successful-search expectation is 1 + α/2 − α/(2n) = 1 + 1/2 − 1/(2n) ≈ 1.5 keys for large n. Successful search examines *more* on average here because it always inspects at least the target key (the ‘+1’) and, on average, half of the later arrivals in its slot. Both remain Θ(1) since α = 1 is constant."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A chained hash table has m = 1024 slots and currently stores n = 3072 keys. Under simple uniform hashing, what is the expected number of keys examined in an unsuccessful search, and what is the asymptotic search time?",
                  "solution": "The load factor is α = n/m = 3072/1024 = 3. By the unsuccessful-search theorem the expected number of keys examined is exactly α = 3. The total expected search time is Θ(1 + α) = Θ(1 + 3) = Θ(4) = Θ(1) since α here is a constant — though 3 keys per slot is large enough that resizing to a bigger m would be prudent.",
                  "hint": "Compute α = n/m, then quote E[examined] = α."
                },
                {
                  "prompt": "We insert n keys, then perform many searches, half of which are successful and half unsuccessful, all at load factor α. Give the expected number of keys examined per search, averaged over the two kinds.",
                  "solution": "Unsuccessful search examines α in expectation. Successful search examines 1 + α/2 − α/(2n) ≈ 1 + α/2 for large n. Averaging the two kinds equally: ½·α + ½·(1 + α/2) = α/2 + 1/2 + α/4 = 1/2 + 3α/4. For example at α = 1 this is 1/2 + 3/4 = 1.25 keys per search; all of it is Θ(1 + α).",
                  "hint": "Average the two per-search expectations with weight ½ each."
                },
                {
                  "prompt": "Prove that under SUHA the expected length of the list in a *fixed* slot j equals α, regardless of which slot j we pick.",
                  "solution": "Let n_j be the number of keys hashing to slot j. For each stored key i let Y_i = 1[h(keyᵢ) = j]; under SUHA E[Y_i] = Pr[h(keyᵢ)=j] = 1/m. Then n_j = Σ_{i=1}^{n} Y_i, and by linearity of expectation E[n_j] = Σ E[Y_i] = n/m = α. The slot index j never entered the computation, so every slot has the same expected length α. ∎",
                  "hint": "Indicator per key for ‘lands in slot j’, then linearity of expectation."
                },
                {
                  "prompt": "Critique the claim ‘chaining gives worst-case O(1) search.’",
                  "solution": "False. Chaining gives *expected* O(1 + α) under SUHA (or under universal hashing on the actual input). The worst case is Θ(n): if all n keys collide into one slot, a search scans a length-n list. A worst-case O(1) guarantee requires a different structure — perfect hashing on a static set (lesson 4). The correct statement is that chaining is expected O(1) when α = O(1).",
                  "hint": "Distinguish expected from worst case, and recall the all-in-one-slot scenario."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a4l1-i1",
              "front": "Why are collisions unavoidable for any hash function when |U| > m?",
              "back": "Pigeonhole: h maps |U| keys into m slots; if |U| > m, h cannot be injective, so two distinct keys share a slot."
            },
            {
              "id": "a4l1-i2",
              "front": "State simple uniform hashing (SUHA).",
              "back": "Each key is equally likely to hash to any of the m slots, independently: Pr[h(k)=j] = 1/m for all k, j; h computable in O(1)."
            },
            {
              "id": "a4l1-i3",
              "front": "Expected keys examined in an UNSUCCESSFUL chained search, and the proof tool?",
              "back": "Exactly α = n/m. Proof: indicator Xᵢ=1[key i lands in searched slot], E[Xᵢ]=1/m, sum by linearity of expectation = n/m."
            },
            {
              "id": "a4l1-i4",
              "front": "Expected cost of chained search overall, and why the '+1'?",
              "back": "Θ(1 + α). The +1 covers computing h(k) and probing the slot even when α = 0; the α is the expected chain length."
            },
            {
              "id": "a4l1-i5",
              "front": "Expected keys examined in a SUCCESSFUL chained search?",
              "back": "1 + α/2 − α/(2n) = Θ(1 + α): the target itself plus, on average, the keys inserted after it into the same slot."
            },
            {
              "id": "a4l1-i6",
              "front": "Worst-case cost of a chained hash table?",
              "back": "Θ(n) — every key in one slot. The O(1) is only expected; worst-case O(1) needs perfect hashing."
            }
          ]
        },
        {
          "id": "a4l2",
          "title": "Open Addressing",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "Store every key in the table itself",
              "body": "**Open addressing** dispenses with linked lists: every key lives directly in the array T[0..m−1], so the table never holds more than m keys and the load factor satisfies α ≤ 1. On a collision we systematically **probe** other slots until we find the key (search) or an empty slot (insert/unsuccessful search).\n\nThe probe order is given by extending the hash function to take a probe number i:\n\n  h : U × {0,1,…,m−1} → {0,1,…,m−1},\n\nwhere ⟨h(k,0), h(k,1), …, h(k,m−1)⟩ — the **probe sequence** for key k — must be a *permutation* of {0,…,m−1}, so probing eventually visits every slot. Insert(k) walks the probe sequence and drops k into the first empty (or DELETED) slot; Search(k) walks it until it finds k or hits an EMPTY slot."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Three probing schemes",
              "statement": "**Linear probing:** h(k,i) = (h′(k) + i) mod m for an auxiliary hash h′. **Quadratic probing:** h(k,i) = (h′(k) + c₁i + c₂i²) mod m. **Double hashing:** h(k,i) = (h₁(k) + i·h₂(k)) mod m, where h₂(k) is relatively prime to m so the sequence is a full permutation. Linear probing uses only m distinct probe sequences; double hashing uses about m² and behaves closest to the ideal below."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Uniform hashing assumption",
              "statement": "**Uniform hashing** assumes the probe sequence ⟨h(k,0),…,h(k,m−1)⟩ of each key is equally likely to be any of the m! permutations of {0,…,m−1}. This is the open-addressing analogue of SUHA and is the assumption under which the probe-count bounds below are proved. (Real schemes only approximate it; double hashing comes closest.)"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected probes in an unsuccessful search",
              "statement": "In an open-addressed table with load factor α = n/m < 1, under uniform hashing the **expected number of probes in an unsuccessful search is at most 1/(1 − α)**.",
              "proof": "An unsuccessful search probes slots until it finds an EMPTY one; every probe before that lands on an occupied slot. Let the random variable P be the number of probes. Since P ≥ 1 always and P ≥ i+1 exactly when the first i probes all hit occupied slots, we use the tail-sum identity E[P] = Σ_{i≥0} Pr[P ≥ i+1].\n\nLet A_i be the event that the first i probes all hit occupied slots (A_0 is certain). Then Pr[P ≥ i+1] = Pr[A_i]. We bound Pr[A_i]. The first probe hits an occupied slot with probability n/m (n of the m slots are full). Given the first i−1 probes were occupied, the i-th probe — under uniform hashing it is a fresh slot among the remaining m−(i−1) — is occupied with probability (n−(i−1))/(m−(i−1)). Hence\n\n  Pr[A_i] = (n/m)·((n−1)/(m−1))···((n−i+1)/(m−i+1)).\n\nEach factor (n−j)/(m−j) ≤ n/m = α for 0 ≤ j < n (since m > n implies subtracting the same j from a smaller numerator and larger denominator only shrinks the ratio). Therefore Pr[A_i] ≤ αⁱ. Summing,\n\n  E[P] = Σ_{i=0}^{∞} Pr[A_i] ≤ Σ_{i=0}^{∞} αⁱ = 1/(1 − α),\n\nusing the geometric series with 0 ≤ α < 1. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Insertion cost",
              "statement": "Inserting a key into an open-addressed table with load factor α < 1 requires at most 1/(1 − α) probes in expectation, under uniform hashing.",
              "proof": "Insertion walks the probe sequence until it finds an empty slot — exactly the same process as an unsuccessful search for the new key, since the key is (by assumption) not yet present. The expected number of probes is therefore bounded by the unsuccessful-search bound 1/(1 − α). ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected probes in a successful search",
              "statement": "Under uniform hashing, the expected number of probes in a **successful** search of an open-addressed table with load factor α < 1 is at most (1/α)·ln(1/(1−α)).",
              "proof": "A successful search for a key x retraces the probe sequence followed when x was inserted, so the number of probes for x equals the probes its insertion took. By the insertion corollary, inserting the (i+1)-st key — when the table held i keys, i.e. load factor i/m — costs at most 1/(1 − i/m) = m/(m−i) expected probes. Averaging over the n keys in the order they were inserted,\n\n  E ≤ (1/n) Σ_{i=0}^{n−1} m/(m − i) = (m/n) Σ_{i=0}^{n−1} 1/(m − i) = (1/α) Σ_{k=m−n+1}^{m} 1/k.\n\nBounding the sum by an integral, Σ_{k=m−n+1}^{m} 1/k ≤ ∫_{m−n}^{m} (1/x) dx = ln( m/(m−n) ) = ln( 1/(1−α) ). Hence E ≤ (1/α)·ln(1/(1−α)). ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The cost explodes as α → 1.** Since 1/(1−α) → ∞, an open-addressed table that fills up becomes catastrophically slow. Keep α comfortably below 1 (resize before, say, α = 3/4). Also: **primary clustering** — under linear probing, occupied runs coalesce and lengthen probe sequences well beyond the uniform-hashing ideal. Double hashing scatters probe sequences and tracks the 1/(1−α) bound closely."
            },
            {
              "type": "example",
              "heading": "The gate computation: α = 0.75",
              "body": "At load factor α = 0.75, the expected number of probes for an unsuccessful search is at most\n\n  1/(1 − α) = 1/(1 − 0.75) = 1/0.25 = 4.\n\nSo three-quarters full already costs about 4 probes per miss — already several times the empty-table cost of 1. This is precisely the boundary many implementations refuse to cross before resizing."
            },
            {
              "type": "example",
              "heading": "A table of bounds at common load factors",
              "body": "Unsuccessful-search bound 1/(1−α) and successful-search bound (1/α)ln(1/(1−α)):\n\n  α = 0.5 :  unsucc ≤ 1/0.5 = 2 ;        succ ≤ (1/0.5)·ln 2 ≈ 2·0.693 = 1.39\n  α = 0.75:  unsucc ≤ 1/0.25 = 4 ;       succ ≤ (1/0.75)·ln 4 ≈ 1.333·1.386 = 1.85\n  α = 0.9 :  unsucc ≤ 1/0.1 = 10 ;       succ ≤ (1/0.9)·ln 10 ≈ 1.111·2.303 = 2.56\n  α = 0.99:  unsucc ≤ 1/0.01 = 100 ;     succ ≤ (1/0.99)·ln 100 ≈ 1.01·4.605 = 4.65\n\nNotice unsuccessful search (and hence insertion) degrades far faster than successful search: misses pay the full geometric penalty, while the average hit only pays a logarithm of it."
            },
            {
              "type": "example",
              "heading": "Linear probing in action and the DELETED problem",
              "body": "m = 8, h′(k) = k mod 8, linear probing. Insert 16, 24, 8 (all hash to slot 0): 16→T[0], 24→T[1] (0 full), 8→T[2] (0,1 full) — a cluster of length 3. A search for 8 must probe slots 0,1,2.\n\nNow Delete 24. We must NOT leave slot 1 EMPTY, or a later Search(8) would stop at the empty slot 1 and wrongly report 8 absent. Instead mark slot 1 **DELETED**: search treats DELETED as occupied (keep probing), while insert may reuse it. The cost is that DELETED slots keep α effectively high — another reason chaining is sometimes preferred when deletions are frequent."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An open-addressed table is at load factor α = 0.8. Bound the expected probes for (a) an unsuccessful search and (b) inserting one more key.",
                  "solution": "(a) Unsuccessful search: at most 1/(1−α) = 1/(1−0.8) = 1/0.2 = 5 probes. (b) Insertion follows the same process as an unsuccessful search for the new key, so it is also bounded by 1/(1−α) = 5 probes in expectation (using the load factor *before* the insertion). ∎",
                  "hint": "Insertion = unsuccessful search for the new key; both use 1/(1−α)."
                },
                {
                  "prompt": "You want the expected unsuccessful-search probe count to stay ≤ 3. What is the largest load factor α you may allow?",
                  "solution": "Require 1/(1−α) ≤ 3 ⇒ 1 − α ≥ 1/3 ⇒ α ≤ 2/3 ≈ 0.667. So resize whenever the table would exceed two-thirds full to keep unsuccessful searches within 3 expected probes.",
                  "hint": "Solve 1/(1−α) ≤ 3 for α."
                },
                {
                  "prompt": "Compare expected probes for an unsuccessful search under open addressing vs. expected keys examined for an unsuccessful search under chaining, both at α = 0.9. Why does open addressing look worse?",
                  "solution": "Chaining: expected keys examined = α = 0.9. Open addressing: expected probes ≤ 1/(1−α) = 10. Open addressing is far worse near α = 1 because colliding keys spill into and clog *other* slots, so a single miss can probe a long run of occupied cells; chaining isolates each slot's keys in their own list, so a miss only ever pays for one slot's expected length α. This is the central trade-off: open addressing saves the list overhead and pointers but pays dearly as α → 1.",
                  "hint": "Contrast α with 1/(1−α) at α = 0.9 and explain the spill-over."
                },
                {
                  "prompt": "Show that the successful-search bound never exceeds the unsuccessful-search bound, i.e. (1/α)·ln(1/(1−α)) ≤ 1/(1−α) for 0 < α < 1.",
                  "solution": "Let t = 1/(1−α), so ln(1/(1−α)) = ln t and α = (t−1)/t. The claim becomes (t/(t−1))·ln t ≤ t, i.e. ln t ≤ t − 1 for t > 1. This is the standard inequality ln t ≤ t − 1 (with equality only at t = 1), which holds for all t > 0 because the concave function ln t lies below its tangent line t − 1 at t = 1. Hence successful search is always at least as cheap as unsuccessful search — consistent with the intuition that finding a present key stops early, while a miss probes until it finds empty space. ∎",
                  "hint": "Substitute t = 1/(1−α) and reduce to the inequality ln t ≤ t − 1."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a4l2-i1",
              "front": "In open addressing, where do colliding keys go and what bounds α?",
              "back": "Into other slots of the same array, found by walking a probe sequence (a permutation of all slots). No external lists, so α ≤ 1."
            },
            {
              "id": "a4l2-i2",
              "front": "Expected probes for an UNSUCCESSFUL search under uniform hashing, with the bound's source?",
              "back": "≤ 1/(1−α). Each successive occupied-probe has prob ≤ α, so E[P] = Σ Pr[P≥i+1] ≤ Σ αⁱ = 1/(1−α)."
            },
            {
              "id": "a4l2-i3",
              "front": "Expected probes for a SUCCESSFUL search under uniform hashing?",
              "back": "≤ (1/α)·ln(1/(1−α)); average the insertion costs m/(m−i) over i = 0..n−1, bounded by an integral."
            },
            {
              "id": "a4l2-i4",
              "front": "1/(1−α) at α = 0.5, 0.75, 0.9?",
              "back": "2, 4, 10 — the unsuccessful-search cost blows up as α → 1, which is why we resize before the table fills."
            },
            {
              "id": "a4l2-i5",
              "front": "What is primary clustering and what reduces it?",
              "back": "Linear probing makes occupied runs coalesce into long clusters, lengthening probe sequences; double hashing scatters probes and tracks the 1/(1−α) ideal."
            },
            {
              "id": "a4l2-i6",
              "front": "Why mark a removed slot DELETED instead of EMPTY in open addressing?",
              "back": "An EMPTY slot stops searches; a key whose probe path crossed the removed slot would be wrongly reported absent. DELETED keeps searches probing but lets inserts reuse the slot."
            }
          ]
        },
        {
          "id": "a4l3",
          "title": "Universal Hashing",
          "estMinutes": 29,
          "content": [
            {
              "type": "text",
              "heading": "Defeating the adversary",
              "body": "Every analysis so far assumed *simple uniform hashing* — that the keys behave randomly. But the keys are chosen by the world, and the hash function is chosen by us and is then *fixed*. For any fixed h there is a set of n keys that all map to the same slot (pick n keys from one of h's preimages, which has ≥ |U|/m ≥ n elements). An adversary who knows h can hand us exactly that set, forcing Θ(n) per operation. Real systems have suffered denial-of-service attacks built on precisely this.\n\nThe fix is to introduce randomness we control: choose the hash function *at random* from a carefully designed family **after** the adversary has committed the keys. The adversary cannot tailor keys to a function it cannot predict. A family with the right pairwise-collision guarantee is called **universal**, and it makes the chaining bounds hold for *every* fixed input — not just random ones."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Universal family of hash functions",
              "statement": "A finite collection H of hash functions, each mapping U → {0,…,m−1}, is **universal** if for every pair of distinct keys x ≠ y,\n\n  Pr_{h ∈ H} [ h(x) = h(y) ]  ≤  1/m,\n\nwhere h is chosen uniformly at random from H. Equivalently, for each distinct pair, at most |H|/m of the functions in H map them to the same slot."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Universal hashing tames any fixed input (the gate proof)",
              "statement": "Let H be a universal family into {0,…,m−1}. Fix ANY set of n keys and any key x in the table, and choose h ∈ H uniformly at random. Then the expected number of *other* keys that collide with x (land in x's slot) is less than α = n/m — with NO assumption that the keys are uniformly distributed.",
              "proof": "Fix the key x and the (arbitrary, adversarially chosen) set of keys, and let the only randomness be the uniform choice of h from H. For each stored key y ≠ x define the collision indicator\n\n  C_y = 1[ h(y) = h(x) ].\n\nBecause x ≠ y and H is universal, E[C_y] = Pr_{h∈H}[ h(y) = h(x) ] ≤ 1/m. Let C = Σ_{y ≠ x} C_y be the number of keys colliding with x. By **linearity of expectation** (which needs no independence),\n\n  E[C] = Σ_{y ≠ x} E[C_y] ≤ (n − 1)·(1/m) = (n−1)/m < n/m = α.\n\nThe only property used is universality of H; nowhere did we assume the keys are random or uniformly distributed. Hence the bound holds for *every* fixed input set. An adversary may pick the worst possible keys, but since it cannot pick h, it cannot force more than α expected collisions on x. Consequently the expected length of x's chain (including x) is at most 1 + α, and chained search runs in expected Θ(1 + α) on any input. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Expected operation cost with universal hashing",
              "statement": "Using a hash function drawn from a universal family, chaining supports Search, Insert, and Delete in expected Θ(1 + α) time on *any* sequence of operations, where the expectation is over the choice of h. With α = O(1) this is expected O(1) per operation regardless of the input keys.",
              "proof": "Insert and Delete are O(1) given the slot. A search for a present or absent key x examines x's slot, whose expected occupancy is at most 1 + α by the previous theorem (for a present x, the ≤ α other keys plus x; for an absent x, the ≤ (n)/m keys hashing there — bound (n)/m = α by the same indicator argument over all n keys). Adding O(1) to compute h, every operation costs expected Θ(1 + α). Keeping α = O(1) by resizing makes this expected O(1). ∎"
            },
            {
              "type": "text",
              "heading": "A concrete universal family",
              "body": "Universality is not merely an existence claim — there are simple, fast families. The classic one treats keys as integers in {0,…,U−1}, picks a prime p larger than every key, and reduces modulo m."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The multiplicative family ((ak + b) mod p) mod m is universal",
              "statement": "Let p be a prime with p > U (so p > every key) and m < p. For a ∈ {1,…,p−1} and b ∈ {0,…,p−1} define h_{a,b}(k) = ((a·k + b) mod p) mod m. The family H = { h_{a,b} : a ≠ 0 } is universal.",
              "proof": "Fix distinct keys x ≠ y in {0,…,p−1}. Set r = (a·x + b) mod p and s = (a·y + b) mod p. First, r ≠ s: subtracting, r − s ≡ a(x − y) (mod p); since p is prime, a ≢ 0 and (x − y) ≢ 0 (as 0 < |x−y| < p), the product a(x−y) ≢ 0 (mod p), so r ≠ s. Thus distinct keys never collide *modulo p*.\n\nNext, as (a,b) ranges over all p(p−1) choices with a ≠ 0, the map (a,b) ↦ (r,s) is a **bijection** onto the p(p−1) ordered pairs (r,s) with r ≠ s: given any target (r,s) with r ≠ s we can solve a ≡ (r − s)(x − y)^{-1} (mod p) (the inverse exists since x ≠ y and p is prime, and r ≠ s forces a ≠ 0) and then b ≡ r − a·x (mod p), uniquely. So choosing h uniformly from H is the same as choosing the pair (r,s) uniformly among all ordered pairs of distinct residues mod p.\n\nFinally, h_{a,b}(x) = h_{a,b}(y) iff r ≡ s (mod m). For a fixed r, the number of s ≠ r in {0,…,p−1} with s ≡ r (mod m) is at most ⌈p/m⌉ − 1 ≤ (p − 1)/m (the residue class of r mod m has at most ⌈p/m⌉ members in {0,…,p−1}, minus r itself). Since s is uniform over the p − 1 values ≠ r,\n\n  Pr[ r ≡ s (mod m) ] ≤ ((p−1)/m) / (p − 1) = 1/m.\n\nTherefore Pr_{h∈H}[h(x) = h(y)] ≤ 1/m, so H is universal. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**What universality buys, precisely.** SUHA *assumes* the keys are random; universal hashing *makes the bound true for adversarial keys* by randomizing h instead. The price is one random draw of (a,b) at table-creation time and a couple of arithmetic ops per hash. The guarantee is expected Θ(1 + α) on every input — the strongest expected-time guarantee available without assuming a static key set."
            },
            {
              "type": "example",
              "heading": "Checking the collision probability on a tiny family",
              "body": "Let p = 5, m = 2, so keys live in {0,1,2,3,4}. Take x = 1, y = 4. For each a ∈ {1,2,3,4}, b ∈ {0,…,4} (20 functions) we ask whether h_{a,b}(1) = h_{a,b}(4).\n\nh(k) = ((ak+b) mod 5) mod 2. The pair (r,s) = ((a+b) mod 5, (4a+b) mod 5) is always distinct (shown above), and they collide mod 2 iff r ≡ s (mod 2). Counting over all 20 functions, exactly 8 give a collision, so the empirical collision probability is 8/20 = 0.4. The universal bound is 1/m = 1/2 = 0.5, and indeed 0.4 ≤ 0.5 — the family meets the universality guarantee with room to spare."
            },
            {
              "type": "example",
              "heading": "An adversary cannot win against a random h",
              "body": "Suppose the adversary, hoping to overload slot 0, submits keys it computed to satisfy h_{3,2}(k) = 0. If we happened to fix a = 3, b = 2, those n keys would all collide — Θ(n) chains. But we pick (a,b) uniformly at random from the p(p−1) options *after* the keys arrive. The adversary's keys were tuned to one specific function; against a uniformly random one, each pair collides with probability ≤ 1/m, so the expected number colliding with any key is < α (gate theorem). The attack that destroys a fixed function is harmless against the family."
            },
            {
              "type": "example",
              "heading": "Bounding total collision pairs",
              "body": "How many colliding *pairs* does a random universal h create among n keys? Let X be the number of unordered pairs {x,y} with h(x)=h(y). For each of the C(n,2) = n(n−1)/2 pairs, the indicator has expectation ≤ 1/m, so E[X] ≤ n(n−1)/(2m) < n²/(2m) = nα/2. With α = O(1) this is O(n) expected collisions total — the global counterpart of the per-key bound, and exactly the quantity that drives the perfect-hashing space analysis in the next lesson."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Fill in: a family H is universal if for all distinct keys x, y, Pr_{h∈H}[h(x)=h(y)] ≤ ____. Then state the per-key expected-collision bound this yields for n keys.",
                  "solution": "The blank is 1/m (m = table size). Given universality, for any fixed key x the expected number of other keys colliding with x is Σ_{y≠x} Pr[h(y)=h(x)] ≤ (n−1)/m < n/m = α, by linearity of expectation. So each key's chain has expected length < 1 + α regardless of the input distribution.",
                  "hint": "The defining bound is 1/m; sum it over the n−1 other keys."
                },
                {
                  "prompt": "Using H = {h_{a,b}(k) = ((ak+b) mod p) mod m}, with p = 17, m = 6, a = 3, b = 4, compute h(10) and h(22 mod 17 = 5) wait — keys must be < p; compute h(10) and h(5).",
                  "solution": "p = 17, m = 6, a = 3, b = 4. h(10) = ((3·10 + 4) mod 17) mod 6 = (34 mod 17) mod 6 = 0 mod 6 = 0. h(5) = ((3·5 + 4) mod 17) mod 6 = (19 mod 17) mod 6 = 2 mod 6 = 2. So h(10) = 0 and h(5) = 2 — no collision for this particular (a,b).",
                  "hint": "Apply (ak+b) mod p first, then mod m."
                },
                {
                  "prompt": "Show that the family of ALL functions U → {0,…,m−1} is universal, but explain why we do not use it.",
                  "solution": "For distinct x ≠ y, a uniformly random function from the family assigns h(x) and h(y) independently and uniformly, so Pr[h(x)=h(y)] = Σ_{j} Pr[h(x)=j]·Pr[h(y)=j] = Σ_{j} (1/m)(1/m) = m·(1/m²) = 1/m. Thus the bound holds with equality and the family is universal (it even realizes SUHA exactly). We cannot use it because representing one such function requires storing its value on every key — Θ(|U| log m) bits — and choosing/applying it is not O(1). Practical universal families like the ((ak+b) mod p) mod m one need only O(1) stored parameters and O(1) evaluation time. ∎",
                  "hint": "Compute the collision probability for a fully random function, then count the bits needed to store one."
                },
                {
                  "prompt": "An adversary submits n keys and we draw h from a universal family with m = n slots. Prove the expected number of keys (other than a fixed x) colliding with x is less than 1, and interpret.",
                  "solution": "By the universal-hashing theorem the expected number of other keys colliding with x is < α = n/m = n/n = 1. Interpretation: with the table sized so α < 1 (here α = 1 gives the bound < 1), each key expects fewer than one collision partner, so chains are O(1) on average even against worst-case inputs. This near-collision-free behavior at m ≈ n is precisely what makes the two-level perfect-hashing construction (next lesson) work. ∎",
                  "hint": "Plug m = n into the bound (n−1)/m < n/m = α = 1."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a4l3-i1",
              "front": "Definition of a universal hash family?",
              "back": "A finite set H such that for all distinct x ≠ y, Pr over random h∈H of h(x)=h(y) ≤ 1/m."
            },
            {
              "id": "a4l3-i2",
              "front": "What does universal hashing achieve that a fixed h cannot?",
              "back": "Expected Θ(1+α) on ANY fixed (even adversarial) input — randomizing h after keys are chosen, instead of assuming the keys are random."
            },
            {
              "id": "a4l3-i3",
              "front": "Expected other-keys-colliding-with-x under a universal family, and the proof?",
              "back": "< α = n/m. Indicator C_y=1[h(y)=h(x)] has E ≤ 1/m by universality; sum over n−1 keys by linearity → (n−1)/m < α. No uniformity assumed."
            },
            {
              "id": "a4l3-i4",
              "front": "Give a concrete universal family.",
              "back": "h_{a,b}(k) = ((ak+b) mod p) mod m with prime p > U, a ∈ {1..p−1}, b ∈ {0..p−1}. O(1) parameters and evaluation."
            },
            {
              "id": "a4l3-i5",
              "front": "Why is ((ak+b) mod p) mod m universal (key step)?",
              "back": "(a,b)↦(r,s) bijects onto ordered distinct residue pairs mod p; for fixed r, ≤ (p−1)/m of the p−1 choices of s satisfy r≡s (mod m), giving collision prob ≤ 1/m."
            },
            {
              "id": "a4l3-i6",
              "front": "Expected number of colliding pairs among n keys under a universal h?",
              "back": "≤ C(n,2)/m = n(n−1)/(2m) < nα/2 — O(n) when α = O(1); drives the perfect-hashing space bound."
            }
          ]
        },
        {
          "id": "a4l4",
          "title": "Perfect Hashing & Dynamic Resizing",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Two unmet guarantees",
              "body": "Chaining and open addressing give *expected* O(1); universal hashing extends that to *any* input — but still only in expectation, and only while α stays O(1). Two gaps remain.\n\n1. **Worst-case O(1) lookups.** Some applications (compilers, routers, read-only dictionaries) want *guaranteed* O(1) search, not expected. When the key set is **static** — fixed once, queried forever — **perfect hashing** (the FKS scheme) delivers worst-case O(1) in O(n) space.\n\n2. **Keeping α bounded as n grows.** If the set is *dynamic* and we fix m, then α = n/m grows without bound and operations degrade to Θ(n). **Table doubling** keeps α = O(1) while charging only O(1) *amortized* per insertion. We treat each in turn."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Perfect hashing (FKS two-level scheme)",
              "statement": "A hash function is **perfect** for a static set S if it maps S injectively into the table — zero collisions, hence worst-case O(1) lookup. The **FKS scheme** uses two levels: a top-level universal hash into m = n slots; if slot i receives nᵢ keys, those keys get a **second-level** table of size mᵢ = nᵢ² with its own universal hash, chosen so the second level is collision-free."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Squaring the second level kills collisions with probability ≥ 1/2",
              "statement": "If we store k keys in a second-level table of size m = k² using a hash drawn from a universal family, the probability of *any* collision is less than 1/2. Hence after O(1) expected re-draws we obtain a collision-free (perfect) second-level table.",
              "proof": "Let X be the number of colliding pairs among the k keys. There are C(k,2) = k(k−1)/2 pairs, and by universality each pair collides with probability ≤ 1/m = 1/k². By linearity of expectation,\n\n  E[X] ≤ C(k,2) · 1/k² = (k(k−1)/2)·(1/k²) = (k−1)/(2k) < 1/2.\n\nBy **Markov's inequality**, Pr[X ≥ 1] ≤ E[X]/1 < 1/2. So with probability > 1/2 the table has zero collisions; if not, redraw the second-level hash and retry. The number of trials to success is geometric with success probability > 1/2, so the expected number of redraws is < 2 = O(1). ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "FKS uses O(n) space in expectation",
              "statement": "Choosing the top-level universal hash into m = n slots, the total size of all second-level tables, Σᵢ nᵢ², is O(n) in expectation. Hence FKS achieves worst-case O(1) lookup in O(n) total space.",
              "proof": "The top-level uses n slots, O(n) space. For the second levels we must bound E[ Σᵢ nᵢ² ], where nᵢ is the number of keys in top-level slot i. Use the identity nᵢ² = nᵢ + 2·(number of unordered colliding pairs in slot i): indeed nᵢ² = nᵢ + nᵢ(nᵢ−1) = nᵢ + 2·C(nᵢ,2). Summing over slots,\n\n  Σᵢ nᵢ² = Σᵢ nᵢ + 2 Σᵢ C(nᵢ,2) = n + 2·(total colliding pairs at the top level).\n\nThe total number of colliding pairs is Σ_{x<y} 1[h(x)=h(y)], and by universality each term has expectation ≤ 1/m = 1/n. There are C(n,2) = n(n−1)/2 pairs, so E[total pairs] ≤ (n(n−1)/2)·(1/n) = (n−1)/2 < n/2. Therefore\n\n  E[ Σᵢ nᵢ² ] = n + 2·E[total pairs] < n + 2·(n/2) = 2n = O(n).\n\nAdding the O(n) top level, total expected space is O(n), while every lookup touches one top-level slot and one collision-free second-level table — worst-case O(1). ∎"
            },
            {
              "type": "text",
              "heading": "Dynamic sets: keeping α bounded by resizing",
              "body": "For a growing set, fix a threshold (say resize when α would exceed 1, or 3/4). When an insertion would breach it, **allocate a new table of double the size**, pick a fresh hash, and **rehash** all current keys into it — a Θ(n) operation. A single insertion can thus cost Θ(n). The remarkable fact is that, *amortized over a sequence of insertions*, each costs only O(1)."
            },
            {
              "type": "code",
              "heading": "Table-doubling insert",
              "lang": "text",
              "code": "TABLE-INSERT(T, x):\n  if T.size == 0:\n      allocate T.table with 1 slot;  T.size = 1\n  if T.num == T.size:                 // table full\n      new = allocate table of size 2*T.size\n      rehash all T.num keys into new   // Θ(T.num) work\n      free T.table;  T.table = new;  T.size = 2*T.size\n  insert x into T.table               // Θ(1)\n  T.num = T.num + 1"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Table doubling: O(1) amortized insertion (aggregate method)",
              "statement": "Starting from an empty table, any sequence of n TABLE-INSERT operations takes O(n) time in total. Hence the **amortized** cost per insertion is O(1), even though an individual insertion can cost Θ(n).",
              "proof": "Charge 1 unit for the elementary insertion of a key, and count the extra cost of the doublings. The first insertion merely allocates a 1-slot table holding 0 keys (it finds T.num = 0 ≠ 1 = T.size, so it rehashes nothing). Thereafter a doubling occurs exactly when the table is full, i.e. just before the insertions numbered 2, 3, 5, 9, …; generally the i-th insertion triggers a doubling iff i − 1 is an exact power of 2 (so i = 1, with i − 1 = 0 not a power of 2, is the initial allocation, not a doubling). The cost cᵢ of the i-th insertion is therefore\n\n  cᵢ = i  if i − 1 is a power of 2 (rehash i−1 keys + insert),  else  cᵢ = 1.\n\nSumming over n insertions,\n\n  Σ_{i=1}^{n} cᵢ ≤ n + Σ_{j=0}^{⌊lg n⌋} 2^j   (the n unit inserts, plus rehash costs 2^0, 2^1, …).\n\nThe geometric series Σ_{j=0}^{⌊lg n⌋} 2^j = 2^{⌊lg n⌋+1} − 1 < 2n. Therefore\n\n  Σ cᵢ < n + 2n = 3n = O(n).\n\nDividing by n, the amortized cost per insertion is < 3 = O(1). The key point captured by the gate is that **the total cost of n insertions is O(n)** — the doubling makes rehash work form a geometric series 1 + 2 + 4 + ⋯ < n that sums to O(n), so the rare Θ(n) rehashes are paid for by the many cheap inserts between them. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Accounting (banker's) view",
              "statement": "Assigning each insertion an amortized charge of 3 units suffices to pay for all real work in table doubling, so the amortized cost is O(1).",
              "proof": "Each insertion pays 3 credits: 1 for inserting itself, and 2 saved on its node. When the table of size s is full (it holds s keys) the next insertion triggers a rehash of s keys. The s keys present are exactly those inserted since the *previous* doubling, when the table grew from s/2 to s — that is, the most recent s/2 insertions each deposited 2 credits, banking 2·(s/2) = s credits, precisely enough to pay the s units of rehashing. So every doubling is fully prepaid and no insertion's amortized charge exceeds 3 = O(1). (Whenever the bank balance stays non-negative, the total amortized charge upper-bounds the total real cost, re-deriving the O(n) aggregate bound.) ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Three guarantees, three tools.** Expected O(1) on average/random input → chaining or open addressing under SUHA. Expected O(1) on *any* input → universal hashing. Worst-case O(1) on a *static* set → FKS perfect hashing in O(n) space. And to keep α = O(1) as a dynamic set grows → table doubling, O(1) amortized per insertion."
            },
            {
              "type": "example",
              "heading": "The doubling series, concretely",
              "body": "Insert 16 keys into an initially size-1 table. Insertion 1 only allocates the 1-slot table (it holds 0 keys, so it rehashes nothing). Doublings then happen before insertions 2,3,5,9 (sizes grow 1→2→4→8→16), rehashing 1,2,4,8 keys respectively, total rehash work = 1+2+4+8 = 15. Plus 16 unit inserts = 31 units for 16 inserts, i.e. amortized 31/16 ≈ 1.94 — comfortably O(1). The rehash total 1+2+4+8 = 15 (the geometric part) is < 16 = n, exactly the ‘total cost of n insertions is O(n)’ statement the gate asks about."
            },
            {
              "type": "example",
              "heading": "Why doubling and not adding a constant",
              "body": "Suppose instead we grow the table by a *fixed* increment c each time it fills (size c, 2c, 3c, …). Then rehashes cost c, 2c, 3c, … and after n inserts we have done ≈ n/c rehashes totalling c + 2c + ⋯ + n = Θ(n²/c) = Θ(n²) work — Θ(n) *amortized* per insert, catastrophic. The geometric growth of doubling is what collapses the rehash total from Θ(n²) to O(n). The growth factor must be > 1 (e.g. 1.5× or 2×); the exact constant only changes the amortized constant, not the O(1)."
            },
            {
              "type": "example",
              "heading": "FKS space on a worked instance",
              "body": "Static set of n = 4 keys, top level m = 4. Suppose the top-level universal hash yields slot occupancies (n₀,n₁,n₂,n₃) = (2,0,1,1). Second-level sizes are nᵢ²: 4, 0, 1, 1, summing to 6. Total space = 4 (top) + 6 (second) = 10 = O(n). Check against the bound: Σ nᵢ² = n + 2·(pairs) = 4 + 2·1 = 6 (the single colliding pair sits in slot 0), matching the identity nᵢ² = nᵢ + 2C(nᵢ,2). Each second-level table of size nᵢ² is collision-free (with probability > 1/2 per the lemma), so every lookup is worst-case O(1)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Explain in one sentence why table doubling gives O(1) amortized insertion, and identify which of these is the correct reason: (a) rehashing is free, (b) doubling happens only once, (c) the total cost of n insertions is O(n), (d) the lists always stay short.",
                  "solution": "The correct reason is (c): the total cost of n insertions is O(n). The rehash costs form a geometric series 1 + 2 + 4 + ⋯ < n, so n insertions cost < 3n in total, i.e. O(1) amortized each. (a) is false — rehashing costs Θ(n) each time; (b) is false — doublings happen Θ(log n) times; (d) is irrelevant to amortized insertion cost.",
                  "hint": "It is the aggregate/total-cost argument; rule out the distractors."
                },
                {
                  "prompt": "Prove that the FKS top-level expected total second-level space Σᵢ nᵢ² is < 2n when m = n, using the identity nᵢ² = nᵢ + 2·C(nᵢ,2).",
                  "solution": "Σᵢ nᵢ² = Σᵢ nᵢ + 2 Σᵢ C(nᵢ,2) = n + 2·(total colliding pairs). By universality each of the C(n,2) pairs collides with probability ≤ 1/m = 1/n, so E[total pairs] ≤ C(n,2)/n = (n(n−1)/2)/n = (n−1)/2. Thus E[Σ nᵢ²] ≤ n + 2·(n−1)/2 = n + (n−1) = 2n − 1 < 2n = O(n). ∎",
                  "hint": "Expand nᵢ² via the identity, then bound expected colliding pairs by C(n,2)/n."
                },
                {
                  "prompt": "A second-level FKS table stores k = 5 keys in size m = k² = 25 with a universal hash. Bound the probability that it has any collision.",
                  "solution": "Expected colliding pairs E[X] ≤ C(5,2)/25 = 10/25 = 0.4 < 1/2. By Markov's inequality Pr[X ≥ 1] ≤ E[X] < 0.4 < 1/2. So with probability > 0.6 the second-level table is collision-free; otherwise redraw the hash (expected < 2 trials). ∎",
                  "hint": "E[X] ≤ C(k,2)/k² then apply Markov's inequality."
                },
                {
                  "prompt": "Suppose we grow the table by a fixed increment of 100 slots each time it fills. Show that inserting n keys then costs Θ(n²) total, and contrast with doubling.",
                  "solution": "With increment c = 100 the table fills at sizes 100, 200, 300, …; the j-th resize rehashes 100j keys, and after n inserts there are about n/100 resizes. Total rehash work ≈ Σ_{j=1}^{n/100} 100j = 100·(n/100)(n/100+1)/2 = Θ(n²). So amortized cost is Θ(n) per insertion — quadratic in aggregate. Doubling instead makes resize costs a geometric series summing to < 2n, giving O(n) total and O(1) amortized. The lesson: the table must grow by a constant *factor* (> 1), not a constant *amount*. ∎",
                  "hint": "Sum the arithmetic series of rehash costs c + 2c + 3c + ⋯ and compare to the geometric series of doubling."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a4l4-i1",
              "front": "What does perfect hashing guarantee, and for what kind of set?",
              "back": "Worst-case O(1) lookup (collision-free) for a STATIC set, using O(n) space via the FKS two-level scheme."
            },
            {
              "id": "a4l4-i2",
              "front": "Why size each FKS second-level table at nᵢ² (squared)?",
              "back": "With m = k² and a universal hash, E[colliding pairs] ≤ C(k,2)/k² < 1/2, so by Markov Pr[any collision] < 1/2 — collision-free after O(1) expected redraws."
            },
            {
              "id": "a4l4-i3",
              "front": "Why is total FKS second-level space O(n)?",
              "back": "Σ nᵢ² = n + 2·(top-level colliding pairs); expected pairs ≤ C(n,2)/n = (n−1)/2, so E[Σ nᵢ²] < 2n = O(n)."
            },
            {
              "id": "a4l4-i4",
              "front": "Why is table doubling O(1) amortized despite Θ(n) rehashes?",
              "back": "Total cost of n insertions = n unit inserts + geometric rehash series (1+2+4+⋯ < n) = O(n), so O(1) amortized each."
            },
            {
              "id": "a4l4-i5",
              "front": "Accounting view of table doubling?",
              "back": "Charge 3 per insert: 1 to insert, 2 banked. The s/2 inserts since the last doubling bank s credits — exactly enough to pay the next rehash of s keys."
            },
            {
              "id": "a4l4-i6",
              "front": "Why must a table grow by a factor, not a fixed increment?",
              "back": "Fixed increment c gives rehash total c+2c+⋯ = Θ(n²) (Θ(n) amortized). A constant factor > 1 makes rehashes a geometric series summing to O(n), giving O(1) amortized."
            }
          ]
        }
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
          "id": "a5l1",
          "title": "BSTs and the Height Problem",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "A structure shaped by its keys",
              "body": "A **binary search tree (BST)** is a binary tree whose nodes each store a key drawn from a totally ordered universe, arranged so that the tree's *shape encodes the order*. Unlike a sorted array — which gives O(log n) search but O(n) insertion — a BST aims to support search, insertion, deletion, minimum, maximum, predecessor, and successor all in time proportional to the tree's *height*. Whether that is a triumph (O(log n)) or a disaster (O(n)) depends entirely on how tall the tree is, and that is the question this unit resolves.\n\nThis lesson does three things rigorously. It states the BST property and proves the procedures respect it; it proves that an inorder walk emits the keys in sorted order; and it shows that the height of a plain BST is *unbounded by anything better than n − 1*, which is precisely the defect that AVL and red-black trees exist to repair."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Binary-search-tree property",
              "statement": "Let x be a node in a binary tree. Write key(x) for its key, left(x) and right(x) for its child subtrees. The tree is a **binary search tree** if, for every node x:\n\n  • if y is a node in the left subtree of x, then key(y) ≤ key(x);\n  • if y is a node in the right subtree of x, then key(y) ≥ key(x).\n\n(When keys are distinct the inequalities are strict; we allow equality to handle duplicates, but assume distinct keys below unless stated otherwise.) The property is **recursive and global**: it constrains *every* descendant, not merely the immediate children."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Height",
              "statement": "The **height** h of a node is the number of edges on the longest path from that node down to a leaf; a leaf has height 0. The **height of the tree** is the height of its root. A tree with a single node has height 0; the empty tree has height −1 by convention. Throughout this unit, *height counts edges* — the same convention the mastery gate uses — so a root-to-leaf path with k edges touches k + 1 nodes."
            },
            {
              "type": "text",
              "heading": "Why every dynamic-set operation costs O(h)",
              "body": "**Search** walks one root-to-leaf path: at node x, compare the target k with key(x); if equal, stop; if k < key(x) descend left, else descend right. The property guarantees that if k is present it lies on exactly this path, because every comparison eliminates an entire subtree on the wrong side of the order. The walk visits at most h + 1 nodes, so search is O(h).\n\n**Minimum / maximum** follow left-only / right-only child pointers to the end — again one root-to-leaf path, O(h). **Successor** and **predecessor** each move at most one full path's worth of edges (down to a subtree minimum, or up through ancestors), so they too are O(h). **Insertion** performs a search for the key's would-be position and hangs a new leaf there: O(h). **Deletion** is the subtle case below, but it also touches only O(h) nodes. The whole interface is O(h); the rest of the unit is the fight to make h small."
            },
            {
              "type": "code",
              "heading": "TREE-INSERT (CLRS)",
              "lang": "pseudocode",
              "code": "TREE-INSERT(T, z):           // z is a new node with key(z) set\n  y = NIL\n  x = root(T)\n  while x ≠ NIL:              // descend one root-to-leaf path\n    y = x\n    if key(z) < key(x): x = left(x)\n    else:               x = right(x)\n  parent(z) = y\n  if y == NIL:        root(T) = z      // tree was empty\n  elif key(z) < key(y): left(y)  = z\n  else:                 right(y) = z\n// The loop runs once per level, so the cost is O(h)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Inorder tree walk",
              "statement": "INORDER(x): if x ≠ NIL, recursively INORDER(left(x)), then **visit x**, then INORDER(right(x)). The traversal visits *left subtree, root, right subtree* — hence the name in-**order**."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Inorder traversal sorts",
              "statement": "An inorder walk of a binary search tree on n nodes visits the keys in **monotonically increasing (sorted) order**, and runs in Θ(n) time.",
              "proof": "We argue by induction on the number of nodes n in the subtree rooted at x.\n\n*Base case (n = 0).* The empty subtree is visited in zero steps and outputs the empty (trivially sorted) sequence.\n\n*Inductive step.* Suppose the claim holds for all subtrees of fewer than n nodes, and let x be the root of an n-node subtree. INORDER(x) outputs three pieces in order: the output of INORDER(left(x)), then key(x), then the output of INORDER(right(x)). By the inductive hypothesis the first piece is the keys of the left subtree in increasing order, and the third piece is the keys of the right subtree in increasing order. By the BST property every left-subtree key is ≤ key(x) and every right-subtree key is ≥ key(x). Concatenating a sorted block of values all ≤ key(x), then key(x), then a sorted block of values all ≥ key(x), yields one sorted sequence of all n keys. This completes the induction.\n\n*Running time.* Let T(n) be the time on an n-node subtree. The walk does O(1) work at x plus the work on the two subtrees, which partition the remaining n − 1 nodes: T(n) = T(k) + T(n − 1 − k) + Θ(1) for some 0 ≤ k ≤ n − 1, with T(0) = Θ(1). Since each of the n nodes is visited exactly once and contributes Θ(1), the total is Θ(n). ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**This is the single fact the gate's short-answer question wants.** An inorder traversal of a BST visits the keys in **sorted (increasing / ascending) order**. A BST is, in effect, a sorted container that also supports dynamic insert and delete — *provided* it stays short."
            },
            {
              "type": "text",
              "heading": "Deletion — the one operation that needs care",
              "body": "To delete a node z there are three cases. **(1)** z has no children: detach it. **(2)** z has one child: splice the child into z's position. **(3)** z has two children: let y = successor(z) be the **minimum of z's right subtree** (which, having no left child, falls under case 1 or 2). Copy key(y) into z and then delete y from its old position. The successor is chosen because it is the *smallest key larger than* key(z): replacing key(z) by it keeps every left-subtree key smaller and every right-subtree key larger, so the BST property survives. Each step touches only nodes on a single root-to-leaf path, so deletion is O(h). The predecessor (max of the left subtree) works symmetrically."
            },
            {
              "type": "text",
              "heading": "The height problem",
              "body": "Everything above is O(h), so the *only* remaining question is how large h can be. Catastrophically large. Suppose we TREE-INSERT the keys 1, 2, 3, …, n into an initially empty tree **in increasing order**. Key 1 becomes the root. Key 2 is larger, so it descends right and becomes the root's right child. Key 3 is larger than both, so it descends right twice. In general key i is larger than every key already present, so it descends right at each of the i − 1 existing nodes and is hung as the rightmost leaf. The result is a single right-leaning chain — a glorified linked list."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Sorted insertion degenerates",
              "statement": "Inserting the keys 1, 2, …, n into an empty BST in increasing order produces a path (right-leaning chain) of n nodes, whose height is **n − 1** edges. In particular, for n = 7 the height is 6, and the worst-case height of an n-node BST is Θ(n).",
              "proof": "We show by induction on i that after inserting 1, …, i the tree is a right-going chain root → ⋯ → i with i nodes and height i − 1. *Base:* after inserting 1 the tree is a single node, height 0 = 1 − 1. *Step:* assume after inserting 1, …, i−1 we have a right chain ending at node i−1, the maximum key present. Key i exceeds every present key, so TREE-INSERT compares it at the root and descends right at every node along the chain, terminating as the right child of i−1. The chain now ends at i with i nodes and one more edge, height (i − 2) + 1 = i − 1. Hence for i = n the height is n − 1; for n = 7 it is **6**. Since each operation is O(h) and here h = n − 1 = Θ(n), search/insert/delete degrade to Θ(n) — no better than the linked list. ∎"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 300,
              "caption": "Inserting 1,2,…,7 in increasing order: each new key is larger than all present, so it is hung as the rightmost leaf. The tree is a chain of 7 nodes with 6 edges on its only root-to-leaf path — height 6 = n − 1. This degenerate shape is the exact failure that balanced trees prevent.",
              "nodes": [
                {
                  "id": "n1",
                  "label": "1",
                  "x": 8,
                  "y": 8,
                  "tone": "rust"
                },
                {
                  "id": "n2",
                  "label": "2",
                  "x": 22,
                  "y": 24
                },
                {
                  "id": "n3",
                  "label": "3",
                  "x": 36,
                  "y": 40
                },
                {
                  "id": "n4",
                  "label": "4",
                  "x": 50,
                  "y": 56
                },
                {
                  "id": "n5",
                  "label": "5",
                  "x": 64,
                  "y": 72
                },
                {
                  "id": "n6",
                  "label": "6",
                  "x": 78,
                  "y": 88
                },
                {
                  "id": "n7",
                  "label": "7",
                  "x": 92,
                  "y": 99,
                  "tone": "rust"
                }
              ],
              "edges": [
                {
                  "from": "n1",
                  "to": "n2",
                  "directed": true
                },
                {
                  "from": "n2",
                  "to": "n3",
                  "directed": true
                },
                {
                  "from": "n3",
                  "to": "n4",
                  "directed": true
                },
                {
                  "from": "n4",
                  "to": "n5",
                  "directed": true
                },
                {
                  "from": "n5",
                  "to": "n6",
                  "directed": true
                },
                {
                  "from": "n6",
                  "to": "n7",
                  "directed": true,
                  "bold": true,
                  "tone": "rust"
                }
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Height is the whole story — and a plain BST gives no guarantee on it.** The same n keys can build a tree of height as small as ⌊log₂ n⌋ or as large as n − 1, depending only on *insertion order*. Adversarial or merely sorted input drives the height to Θ(n). The remedy is to maintain a structural **invariant** that forces h = Θ(log n) under every update — the subject of the next two lessons."
            },
            {
              "type": "example",
              "heading": "A balanced build for contrast",
              "body": "Insert the *same* seven keys in the order 4, 2, 6, 1, 3, 5, 7. Now 4 is the root; 2 and 6 are its children; 1,3,5,7 are the four leaves. Every root-to-leaf path has 2 edges, so the height is 2 = ⌊log₂ 7⌋. Identical key set, identical operations, height 2 instead of 6 — the gap between O(log n) and O(n) is purely a matter of shape, which is why we must *enforce* shape rather than hope for it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Insert 1, 2, …, n into an empty BST in increasing order. State the resulting height for n = 7, and prove the general formula.",
                  "hint": "Track where each new key lands relative to the keys already present.",
                  "solution": "Each key i exceeds all of 1, …, i−1, so TREE-INSERT descends right at every existing node and hangs i as the rightmost leaf, extending a single right chain. By induction the tree after n insertions is a chain of n nodes with n − 1 edges, so the height is n − 1. For n = 7 the height is **6**. ∎"
                },
                {
                  "prompt": "Prove that an inorder traversal of a BST outputs the keys in increasing order.",
                  "solution": "Induct on subtree size. Empty subtree: outputs nothing, trivially sorted. Otherwise INORDER(x) outputs INORDER(left), then key(x), then INORDER(right). By hypothesis the two recursive outputs are sorted; by the BST property all left keys ≤ key(x) ≤ all right keys, so the concatenation is sorted. ∎"
                },
                {
                  "prompt": "Give an insertion order of 1, …, 7 that produces height 2, and one that produces height 6. What does this say about plain BSTs?",
                  "solution": "Height 2: 4, 2, 6, 1, 3, 5, 7 builds a perfect tree (every path has 2 edges). Height 6: 1, 2, 3, 4, 5, 6, 7 builds a right chain. The same key set yields heights ranging over [⌊log₂ n⌋, n − 1] depending solely on order — a plain BST guarantees nothing about its height. ∎"
                },
                {
                  "prompt": "When deleting a two-child node z, why is the inorder successor (minimum of the right subtree) a valid replacement, and why does it itself have at most one child?",
                  "solution": "successor(z) is the smallest key greater than key(z). Putting it where z was keeps every left-subtree key < the new key and every right-subtree key > it, so the BST property holds. The successor is the minimum of the right subtree, hence has no left child (anything smaller would be smaller still), so it has at most one (right) child and is removed by the easy one-child case. ∎"
                },
                {
                  "prompt": "Argue that search in a BST of height h examines at most h + 1 keys, and that this bound is tight.",
                  "solution": "Each comparison either stops or moves one edge deeper, so the search visits at most one node per level, i.e. at most h + 1 nodes on the path from root to a leaf. It is tight: searching for the deepest leaf's key (or any absent key routed to that leaf) examines all h + 1 nodes on the longest path. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a5l1-i1",
              "front": "State the binary-search-tree property.",
              "back": "For every node x: every key in its left subtree is ≤ key(x), and every key in its right subtree is ≥ key(x) — recursively, for all descendants."
            },
            {
              "id": "a5l1-i2",
              "front": "Why is every BST dynamic-set operation O(h)?",
              "back": "Search, insert, delete, min, max, successor, predecessor each touch only the nodes on a single root-to-leaf path, of length ≤ h."
            },
            {
              "id": "a5l1-i3",
              "front": "What does an inorder traversal of a BST output, and in what time?",
              "back": "The keys in sorted (increasing/ascending) order, in Θ(n) — proven by induction using the BST property at each root."
            },
            {
              "id": "a5l1-i4",
              "front": "Insert 1,2,…,n into an empty BST in increasing order: resulting height (in edges)?",
              "back": "A right-leaning chain of n nodes with height n − 1. For n = 7 the height is 6."
            },
            {
              "id": "a5l1-i5",
              "front": "Why must balance be enforced rather than hoped for?",
              "back": "The same key set can yield height from ⌊log₂ n⌋ to n − 1 depending on insertion order; sorted/adversarial input gives Θ(n), so operations degrade to O(n) without an invariant."
            }
          ]
        },
        {
          "id": "a5l2",
          "title": "Self-Balancing: AVL Trees",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Repairing the height defect with an invariant",
              "body": "The previous lesson left us with a clean diagnosis: BST operations are O(h), and a plain BST lets h reach n − 1. An **AVL tree** (Adelson-Velsky and Landis, 1962 — the first self-balancing BST) fixes this by maintaining a *local* structural invariant that, remarkably, forces a *global* logarithmic height bound. The invariant is checked and restored in O(1) at each node along an update path, so AVL trees support search, insert, and delete all in **O(log n)** worst case.\n\nThis lesson develops the invariant, the rotations that restore it, and — most importantly — the complete proof that the invariant bounds the height by O(log n). That proof, built around the minimum-node-count function N(h), is exactly what the mastery gate asks you to reproduce."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "AVL invariant and balance factor",
              "statement": "For a node x define its **balance factor** BF(x) = height(right(x)) − height(left(x)), where the empty subtree has height −1. An **AVL tree** is a binary search tree in which **every** node x satisfies\n\n  |BF(x)| ≤ 1,  i.e. |height(left(x)) − height(right(x))| ≤ 1.\n\nThe two child subtrees of any node may differ in height by at most one. This is a strictly stronger requirement than 'the BST property', layered on top of it."
            },
            {
              "type": "text",
              "heading": "The plan: bound height by counting nodes",
              "body": "We want to show |BF| ≤ 1 forces h = O(log n). The cleanest route is contrapositive in spirit: instead of asking 'how tall can a tree of n nodes be?', ask 'how *few* nodes can a tree of height h have?'. If even the **sparsest** AVL tree of height h still needs a number of nodes that grows exponentially in h, then a tree with only n nodes cannot be very tall. Define\n\n  N(h) = the minimum number of nodes in any AVL tree of height h.\n\nA tree of height h with n nodes satisfies n ≥ N(h). If we can show N(h) grows like c^h for some c > 1, then n ≥ c^h gives h ≤ log_c n = O(log n). Everything hinges on a recurrence for N(h)."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Recurrence for the minimum node count",
              "statement": "Let N(h) be the minimum number of nodes in an AVL tree of height h (edges). Then\n\n  N(0) = 1,  N(1) = 2,  and for h ≥ 2:  N(h) = 1 + N(h − 1) + N(h − 2).",
              "proof": "*Base cases.* The only height-0 AVL tree is a single node: N(0) = 1. A height-1 AVL tree has a root with at least one child; the minimum is a root with exactly one child (balance factor ±1, allowed), giving N(1) = 2.\n\n*Step (h ≥ 2).* Consider a height-h AVL tree T with the fewest possible nodes. Its root contributes 1 node and has two subtrees T_L, T_R; the height of T is 1 + max(height(T_L), height(T_R)), so at least one subtree has height exactly h − 1. The AVL invariant at the root forces the heights of T_L and T_R to differ by at most 1, so the *other* subtree has height h − 1 or h − 2. To minimize the total node count we make it as small as possible, i.e. height h − 2 (height h − 1 would only add nodes). Moreover each subtree, being itself an AVL tree, must contain at least the minimum number of nodes for its height. Hence the minimum is achieved by one subtree of height h − 1 with N(h − 1) nodes and one of height h − 2 with N(h − 2) nodes:\n\n  N(h) = 1 + N(h − 1) + N(h − 2). ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**This is the Fibonacci recurrence in disguise.** Compare N(h) = 1 + N(h−1) + N(h−2) with F(k) = F(k−1) + F(k−2). In fact N(h) = F(h + 3) − 1, so the sparsest AVL trees are sometimes called **Fibonacci trees**: N(0)=1, N(1)=2, N(2)=4, N(3)=7, N(4)=12, N(5)=20, … each near φ times the last."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Geometric lower bound on N(h)",
              "statement": "For all h ≥ 0, N(h) ≥ φ^h, where φ = (1 + √5)/2 ≈ 1.618 is the golden ratio (the positive root of φ² = φ + 1).",
              "proof": "By strong induction on h. *Base cases.* φ^0 = 1 = N(0). φ^1 = φ ≈ 1.618 ≤ 2 = N(1). *Step (h ≥ 2).* Assume N(h − 1) ≥ φ^(h−1) and N(h − 2) ≥ φ^(h−2). Then\n\n  N(h) = 1 + N(h − 1) + N(h − 2) ≥ 1 + φ^(h−1) + φ^(h−2) > φ^(h−1) + φ^(h−2) = φ^(h−2)(φ + 1) = φ^(h−2)·φ² = φ^h,\n\nusing the defining identity φ + 1 = φ². Hence N(h) ≥ φ^h for all h. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "AVL height is O(log n)",
              "statement": "Every AVL tree with n nodes has height h ≤ log_φ n ≈ 1.4404·log₂ n = O(log n). Consequently search, insertion, and deletion in an AVL tree run in O(log n) worst-case time, and the answer to 'an AVL tree with n nodes has height ___' is **Θ(log n)**.",
              "proof": "Let the tree have height h and n nodes. By definition of N as a minimum, n ≥ N(h). By the previous lemma N(h) ≥ φ^h. Chaining, n ≥ φ^h. Taking logarithms base φ, h ≤ log_φ n. Converting bases, log_φ n = (log₂ n)/(log₂ φ) = (1/0.6942)·log₂ n ≈ 1.4404·log₂ n, so h = O(log n). The lower bound h = Ω(log n) holds for *any* binary tree on n nodes (a binary tree of height h has at most 2^(h+1) − 1 nodes, so n ≤ 2^(h+1) − 1 gives h ≥ log₂(n+1) − 1). Therefore h = Θ(log n), and since every BST operation is O(h), each runs in O(log n). ∎"
            },
            {
              "type": "text",
              "heading": "Restoring the invariant: rotations",
              "body": "An insertion or deletion can change subtree heights and push some node's balance factor to ±2. A **rotation** is O(1) pointer surgery that locally rearranges a node and one child, **preserving the BST property** while reducing height on the heavy side. A *right rotation* at y promotes its left child x: x becomes the new subtree root, y becomes x's right child, and x's former right subtree β becomes y's left child. Because β's keys all lie between x and y, the BST property is maintained. A *left rotation* is the mirror image."
            },
            {
              "type": "code",
              "heading": "RIGHT-ROTATE (CLRS); preserves the BST property",
              "lang": "pseudocode",
              "code": "RIGHT-ROTATE(T, y):          // x = left(y) becomes the new root of this subtree\n  x = left(y)\n  left(y)  = right(x)        // β moves from x's right to y's left\n  right(x) = y\n  // splice x into y's old parent slot (omitted: parent pointers)\n// Keys:  α ≤ x ≤ β ≤ y ≤ γ  before and after — BST property invariant.\n//   y                 x\n//  / \\               / \\\n// x   γ    ───►     α   y\n// / \\                  / \\\n// α  β                β   γ"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Four imbalance cases, O(1) rotations each",
              "statement": "After an insertion, let z be the **lowest** node whose balance factor became ±2. The imbalance is one of four shapes, each repaired by one or two rotations: **Left-Left** → one right rotation at z; **Right-Right** → one left rotation; **Left-Right** → left-rotate z's left child, then right-rotate z; **Right-Left** → right-rotate z's right child, then left-rotate z. Each fix is O(1) and, after it, z's subtree regains the height it had *before* the insertion.",
              "proof": "Take Left-Left (others are symmetric or composed). Insertion into the left subtree of z's left child x raised height(x) to height(z's right subtree) + 2, so BF(z) = −2 and BF(x) = −1. A right rotation at z makes x the subtree root with z as its right child; the moved subtree β (height k) becomes z's left child, and z's right subtree (height k) is unchanged, so BF(z) = 0 and BF(x) = 0. The subtree's height returns to its pre-insertion value k + 2. Left-Right first left-rotates x to convert it to a Left-Left shape, then right-rotates z; two O(1) rotations. Because the repair restores the original subtree height, **no ancestor's balance factor changes**, so at most this one fix is needed for an insertion. The repaired tree is still a BST (rotations preserve order) and satisfies |BF| ≤ 1 everywhere. ∎"
            },
            {
              "type": "decision",
              "heading": "Which rotation? (insertion case, z = lowest ±2 node)",
              "rows": [
                [
                  "Imbalance shape (BF(z), BF of heavy child)",
                  "Repair"
                ],
                [
                  "Left-Left:  BF(z) = −2, heavy child BF = −1",
                  "Single right rotation at z"
                ],
                [
                  "Right-Right: BF(z) = +2, heavy child BF = +1",
                  "Single left rotation at z"
                ],
                [
                  "Left-Right: BF(z) = −2, heavy child BF = +1",
                  "Left-rotate left child, then right-rotate z"
                ],
                [
                  "Right-Left: BF(z) = +2, heavy child BF = −1",
                  "Right-rotate right child, then left-rotate z"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Insertion needs at most one rebalance; deletion may need up to O(log n).** After an insertion, the single rotation (or double rotation) restores the pre-insertion subtree height, so no ancestor is disturbed. After a *deletion* the repaired subtree can be one shorter, which may unbalance an ancestor, propagating up to O(log n) rebalances. Either way the total rebalancing work per update is O(log n), and each individual rotation is O(1)."
            },
            {
              "type": "example",
              "heading": "Computing N(h) and reading off a height bound",
              "body": "Unrolling N(h) = 1 + N(h−1) + N(h−2) from N(0)=1, N(1)=2 gives 1, 2, 4, 7, 12, 20, 33, 54, … So the *minimum* number of nodes forcing height 7 is N(7) = 54. Equivalently, to have height ≤ h you may use as few as N(h) nodes but any AVL tree on n ≥ N(h) nodes has height ≥ … well, the bound runs the other way: with n = 20 nodes, since N(6) = 33 > 20 but N(5) = 20, the height is at most 5. This matches h ≤ log_φ 20 ≈ 1.4404·log₂ 20 ≈ 1.4404·4.32 ≈ 6.2, so h ≤ 6 — the exact count sharpens the asymptotic bound."
            },
            {
              "type": "example",
              "heading": "A double rotation worked out",
              "body": "Suppose nodes with keys 30 (root), 10 (left child), and we insert 20. Now 10's right subtree holds 20: this is a **Left-Right** imbalance at 30 (BF(30) = −2, BF(10) = +1). First left-rotate at 10: 20 rises, 10 becomes 20's left child — now it is Left-Left at 30. Then right-rotate at 30: 20 becomes the subtree root with 10 and 30 as its children. Final tree: 20 over {10, 30}, height 1, every balance factor 0. Two O(1) rotations restored the invariant."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Prove that an AVL tree with n nodes has height O(log n). (Define and lower-bound N(h).)",
                  "hint": "Set up the recurrence N(h) = 1 + N(h−1) + N(h−2), then show N(h) ≥ φ^h using φ² = φ + 1.",
                  "solution": "Let N(h) be the fewest nodes in an AVL tree of height h; N(0)=1, N(1)=2. A height-h AVL tree has subtrees whose heights differ by ≤ 1, and the sparsest uses heights h−1 and h−2, so N(h) = 1 + N(h−1) + N(h−2). By strong induction N(h) ≥ φ^h: the bases hold (φ⁰=1=N(0), φ≤2=N(1)), and N(h) ≥ 1 + φ^(h−1) + φ^(h−2) > φ^(h−2)(φ+1) = φ^(h−2)·φ² = φ^h. Any AVL tree on n nodes of height h has n ≥ N(h) ≥ φ^h, so h ≤ log_φ n ≈ 1.44·log₂ n = O(log n). ∎"
                },
                {
                  "prompt": "Compute N(0) through N(6) and state the maximum height of an AVL tree with 12 nodes.",
                  "solution": "N: 1, 2, 4, 7, 12, 20, 33 for h = 0..6. Since N(4) = 12 and N(5) = 20 > 12, an AVL tree with 12 nodes can have height 4 but not 5; maximum height is 4. ∎"
                },
                {
                  "prompt": "An AVL tree with n nodes has height Θ(?). Justify both the upper and lower bound.",
                  "solution": "Θ(log n). Upper: n ≥ N(h) ≥ φ^h ⇒ h ≤ log_φ n = O(log n). Lower: any binary tree of height h has ≤ 2^(h+1) − 1 nodes, so n ≤ 2^(h+1) − 1 ⇒ h ≥ log₂(n+1) − 1 = Ω(log n). Together h = Θ(log n). ∎"
                },
                {
                  "prompt": "After inserting into the left subtree of the left child of node z, z's balance factor becomes −2. Name the case and the repair, and show the repaired subtree's height equals its pre-insertion height.",
                  "solution": "Left-Left; repair with a single right rotation at z. Let z's right subtree have height k, so before the insertion the whole subtree had height k + 2. The offending insertion grew the left child x = left(z) until height(x) = k + 2 with BF(x) = −1: x's two subtrees are A (its taller, grown left side) of height k + 1 and β of height k. Then BF(z) = height(right(z)) − height(x) = k − (k + 2) = −2, the Left-Left imbalance. Right-rotate z: x becomes the root, keeping A (height k + 1) as its left child, while z becomes x's right child with children β (height k, moved from x's right) and z's old right subtree (height k). So z now has height k + 1, and x has two children each of height k + 1, giving height k + 2 — equal to the pre-insertion value, with BF(x) = BF(z) = 0. Since the subtree's height is unchanged, no ancestor's balance factor changes. ∎"
                },
                {
                  "prompt": "Show φ ≈ 1.618 gives the constant ≈ 1.44 in h ≤ 1.44·log₂ n.",
                  "solution": "From n ≥ φ^h, h ≤ log_φ n = (log₂ n)/(log₂ φ). Now log₂ φ = log₂ 1.618 ≈ 0.6942, and 1/0.6942 ≈ 1.4404. So h ≤ 1.4404·log₂ n. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a5l2-i1",
              "front": "State the AVL invariant.",
              "back": "At every node, |height(left) − height(right)| ≤ 1, i.e. the balance factor BF ∈ {−1, 0, +1}."
            },
            {
              "id": "a5l2-i2",
              "front": "Recurrence for N(h), the minimum nodes in a height-h AVL tree, with base cases?",
              "back": "N(0)=1, N(1)=2, and N(h)=1+N(h−1)+N(h−2) for h≥2 — the sparsest tree uses subtrees of heights h−1 and h−2."
            },
            {
              "id": "a5l2-i3",
              "front": "Why does N(h) ≥ φ^h, and what is φ?",
              "back": "Strong induction using φ²=φ+1: N(h) ≥ 1+φ^(h−1)+φ^(h−2) > φ^(h−2)(φ+1)=φ^h. φ=(1+√5)/2≈1.618, the golden ratio."
            },
            {
              "id": "a5l2-i4",
              "front": "Why is an AVL tree's height O(log n)?",
              "back": "n ≥ N(h) ≥ φ^h ⇒ h ≤ log_φ n ≈ 1.44·log₂ n = O(log n); combined with the universal Ω(log n) lower bound, h = Θ(log n)."
            },
            {
              "id": "a5l2-i5",
              "front": "What restores the AVL invariant after an update, and at what cost?",
              "back": "Rotations (single LL/RR or double LR/RL), O(1) each; insertion needs at most one rebalance, deletion up to O(log n) up the path."
            }
          ]
        },
        {
          "id": "a5l3",
          "title": "Red-Black Trees & Augmentation",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "A looser, cheaper balance",
              "body": "AVL trees keep height tight (≈ 1.44 log₂ n) but pay for it: a rigid invariant means more rotations, especially on deletion. **Red-black trees** trade a little height for far cheaper maintenance. They guarantee height at most 2·log₂(n + 1) — still O(log n) — while needing only O(1) rotations per insertion and O(1) per deletion (amortized, and even worst case the *rotation* count is constant, with O(log n) recolorings). This balance of guarantees is why red-black trees back most production ordered maps (C++ std::map, Java TreeMap, the Linux kernel's interval trees).\n\nThis lesson states the color invariants, defines black-height, and proves the height bound 2·log₂(n + 1) using the two lemmas the mastery gate permits you to assume. It also covers augmentation — adding fields to a balanced tree to answer richer queries for free."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Red-black tree",
              "statement": "A **red-black tree** is a binary search tree in which each node carries a color, **red** or **black**, and the missing children are explicit black **NIL** sentinels (the *leaves*; real keys live in *internal* nodes). The five **red-black properties** hold:\n\n  1. Every node is red or black.\n  2. The root is black.\n  3. Every leaf (NIL) is black.\n  4. If a node is red, then both its children are black (no two reds in a row).\n  5. For each node, every simple path from it down to a descendant leaf contains the **same number of black nodes**.\n\nProperties 4 and 5 are the load-bearing ones for the height bound."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Black-height",
              "statement": "The **black-height** of a node x, written bh(x), is the number of black nodes on any simple path from x down to a leaf, **not counting x itself** but counting the terminal NIL leaf. Property 5 guarantees this number is the same for every such path, so bh(x) is well defined. The black-height of the tree is bh(root)."
            },
            {
              "type": "text",
              "heading": "Two facts we are allowed to assume",
              "body": "The mastery gate lets you use the following two lemmas **without proof**; we state them precisely because the main theorem chains them. We also sketch why each holds so the argument is not a black box.\n\n  **(i)** The subtree rooted at any node x contains **at least 2^(bh(x)) − 1 internal nodes**.\n\n  **(ii)** The black-height of the root satisfies **bh(root) ≥ h/2**, where h is the tree's height.\n\nLemma (i) is an induction on height: a node's two subtrees each have black-height ≥ bh(x) − 1 (drop x's child's color), so by hypothesis each holds ≥ 2^(bh(x)−1) − 1 internal nodes, and x's subtree holds ≥ 1 + 2(2^(bh(x)−1) − 1) = 2^(bh(x)) − 1. Lemma (ii) follows from property 4: on any root-to-leaf path the reds are non-adjacent, so at least half the h nodes (other than the root counting) are black, giving bh(root) ≥ h/2."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Red-black height bound",
              "statement": "A red-black tree with n internal nodes has height **h ≤ 2·log₂(n + 1)**.",
              "proof": "Let the tree have height h, root r, and n internal nodes. Apply lemma (i) at the root: the subtree rooted at r is the whole tree, so\n\n  n ≥ 2^(bh(r)) − 1.\n\nApply lemma (ii): bh(r) ≥ h/2. Since t ↦ 2^t is increasing, 2^(bh(r)) ≥ 2^(h/2), hence\n\n  n ≥ 2^(bh(r)) − 1 ≥ 2^(h/2) − 1.\n\nRearrange: 2^(h/2) ≤ n + 1. Take log₂ of both sides (both are positive):\n\n  h/2 ≤ log₂(n + 1),  so  h ≤ 2·log₂(n + 1) = O(log n).\n\nSince every BST operation is O(h), search, insertion, and deletion in a red-black tree run in O(log n) worst-case time. ∎"
            },
            {
              "type": "example",
              "heading": "Evaluating the bound at n = 15",
              "body": "The mastery gate asks for the upper bound 2·log₂(n + 1) at n = 15. Compute n + 1 = 16, and log₂ 16 = 4. Then 2 · 4 = **8**. So any red-black tree with 15 internal nodes has height at most 8 edges. (For comparison, a *perfectly* balanced tree on 15 nodes has height 3; the red-black guarantee is looser by up to a factor of 2, which is exactly the slack property 5 buys in exchange for cheap updates.)"
            },
            {
              "type": "example",
              "heading": "The factor-2 slack is real",
              "body": "A red-black tree *can* have its longest path nearly twice its shortest. Take a black root with a black child on one side (shortest path: 2 black nodes to NIL) and on the other side alternate black-red-black-red down to NIL (longest path: same black count, but interleaved reds double the edge count). Property 5 fixes the *black* count per path, not the total length, so longest ≤ 2 · shortest. This is precisely why the bound carries the factor 2, and why it cannot be improved to log₂(n+1)."
            },
            {
              "type": "decision",
              "heading": "Red-black vs AVL",
              "rows": [
                [
                  "Property",
                  "AVL  /  Red-Black"
                ],
                [
                  "Height bound",
                  "≈ 1.44·log₂ n  /  ≤ 2·log₂(n+1)"
                ],
                [
                  "Balance discipline",
                  "|BF| ≤ 1 (rigid)  /  color rules (loose)"
                ],
                [
                  "Rotations per insert",
                  "O(1)  /  O(1)"
                ],
                [
                  "Rotations per delete",
                  "up to O(log n)  /  O(1) (≤ 3), plus O(log n) recolorings"
                ],
                [
                  "Best fit",
                  "lookup-heavy workloads  /  update-heavy / library maps"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Both AVL and red-black trees give Θ(log n) height — they differ only in the constant and in update cost.** AVL is shorter (faster lookups); red-black rebalances more cheaply (fewer structural changes per update). For the gate: AVL height is **Θ(log n)**, and the red-black height bound is **h ≤ 2·log₂(n + 1)**, which is 8 when n = 15."
            },
            {
              "type": "text",
              "heading": "Augmenting a balanced tree",
              "body": "A balanced BST is a platform. **Augmentation** stores an extra field at each node so that new queries become O(log n) operations. The discipline, stated as a methodology in CLRS, is: a field f(x) is a valid augmentation if f(x) can be computed **from the information in x together with f of its two children**. Then a rotation — which changes only a node and one child — can recompute the affected fields in O(1), so augmentation does not break the O(log n) update bound."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Order-statistics tree",
              "statement": "Augment each node x of a red-black tree with size(x) = number of internal nodes in the subtree rooted at x (so size(x) = size(left(x)) + size(right(x)) + 1, with NIL having size 0). Then SELECT(i) (return the i-th smallest key) and RANK(x) (return the position of key(x) in sorted order) each run in O(log n).",
              "proof": "The field is valid: size(x) is computed from x plus the size fields of its two children, so a rotation restores it in O(1) (recompute size for the two nodes whose children changed). *SELECT(i):* at node x let r = size(left(x)) + 1 be x's own rank within its subtree. If i = r return x; if i < r recurse left; else recurse right seeking the (i − r)-th smallest. Each step descends one level, so O(h) = O(log n). *RANK(x):* sum size(left) + 1 contributions while walking from x up to the root, adding the left-subtree size each time we ascend from a right child. The walk has length O(h) = O(log n). ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The augmentation test in one line:** a field is safe iff each node's value is determined by the node plus its children's fields. Subtree *size* and subtree *sum/min/max* pass (recomputable in O(1) under rotation); a field depending on a node's *parent or arbitrary ancestors* generally fails, because a single rotation could force Ω(log n) updates."
            },
            {
              "type": "example",
              "heading": "SELECT on a size-augmented tree",
              "body": "Suppose the root has size(left) = 5, so the root's own rank is 6. To find the 4th smallest (i = 4): since 4 < 6, recurse into the left subtree seeking the 4th smallest there. If that left child has size(left) = 2, its rank is 3; since 4 > 3, recurse right seeking the (4 − 3) = 1st smallest. Continue until i equals the local rank. The path is one root-to-leaf descent, O(log n)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Prove that a red-black tree with n internal nodes has height at most 2·log₂(n + 1), assuming (i) the subtree at x has ≥ 2^(bh(x)) − 1 internal nodes and (ii) bh(root) ≥ h/2.",
                  "hint": "Apply (i) at the root, substitute (ii), then take log₂.",
                  "solution": "Let h be the height and r the root. By (i) at r, the whole tree has n ≥ 2^(bh(r)) − 1 internal nodes. By (ii), bh(r) ≥ h/2, and since 2^t is increasing, 2^(bh(r)) ≥ 2^(h/2). Hence n ≥ 2^(h/2) − 1, i.e. 2^(h/2) ≤ n + 1. Taking log₂: h/2 ≤ log₂(n + 1), so h ≤ 2·log₂(n + 1) = O(log n). ∎"
                },
                {
                  "prompt": "Evaluate the bound 2·log₂(n + 1) for n = 15.",
                  "solution": "n + 1 = 16, log₂ 16 = 4, so 2 · 4 = 8. The height is at most 8. ∎"
                },
                {
                  "prompt": "State the five red-black properties and identify which two force the height bound.",
                  "solution": "(1) each node red or black; (2) root black; (3) NIL leaves black; (4) a red node has black children; (5) every root-to-leaf path has the same black-height. Properties (4) and (5) force the bound: (5) makes black-height well defined giving lemma (i), and (4) makes reds non-adjacent giving bh(root) ≥ h/2 (lemma (ii)). ∎"
                },
                {
                  "prompt": "Give the rule for a valid tree augmentation and explain why subtree size qualifies while 'depth of the deepest descendant that is red' might not.",
                  "solution": "A field is valid if each node's value is determined by the node plus its two children's fields, so rotations restore it in O(1). size(x) = size(left)+size(right)+1 depends only on the children's sizes — valid. A field about red descendants can also be made child-local in this case, but in general fields depending on properties not summarizable from the immediate children fail, because a rotation reshuffling a subtree could force more than O(1) recomputation. ∎"
                },
                {
                  "prompt": "Explain why the red-black bound carries a factor 2 that cannot be removed.",
                  "solution": "Property 5 fixes only the number of *black* nodes per root-to-leaf path, not the total length. Reds (non-adjacent by property 4) can stretch one path to nearly twice the black-only path, so longest ≤ 2·shortest. Thus the worst-case height is about twice log₂(n+1), and the bound 2·log₂(n+1) is essentially tight. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a5l3-i1",
              "front": "Which two red-black properties bound the height, and what do they give?",
              "back": "Property 4 (red nodes have black children) ⇒ bh(root) ≥ h/2; property 5 (equal black-height per path) ⇒ subtree at x has ≥ 2^(bh(x)) − 1 internal nodes."
            },
            {
              "id": "a5l3-i2",
              "front": "Prove a red-black tree's height satisfies h ≤ 2·log₂(n+1).",
              "back": "n ≥ 2^(bh(root)) − 1 ≥ 2^(h/2) − 1 ⇒ 2^(h/2) ≤ n+1 ⇒ h/2 ≤ log₂(n+1) ⇒ h ≤ 2·log₂(n+1)."
            },
            {
              "id": "a5l3-i3",
              "front": "Red-black height upper bound at n = 15?",
              "back": "2·log₂(16) = 2·4 = 8."
            },
            {
              "id": "a5l3-i4",
              "front": "Red-black vs AVL tradeoff?",
              "back": "RB allows looser balance (h ≤ 2·log₂(n+1)) with cheaper updates (O(1) rotations per insert/delete); AVL is tighter (≈1.44 log₂ n, faster lookups) but deletion can need O(log n) rotations."
            },
            {
              "id": "a5l3-i5",
              "front": "When is a tree augmentation valid, and what does an order-statistics tree add?",
              "back": "Valid iff each node's field is computable from the node plus its children's fields (so rotations restore it in O(1)). An order-statistics tree augments with subtree size, giving SELECT(i) and RANK(x) in O(log n)."
            }
          ]
        }
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
          "id": "a6l1",
          "title": "Representations & the Arithmetic of Degrees",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "What a graph is, and why representation is a real decision",
              "body": "A **graph** G = (V, E) is a finite vertex set V together with an edge set E. In an **undirected** graph each edge is an unordered pair {u, v}; in a **directed** graph (digraph) each edge is an ordered pair (u, v) with a *tail* u and a *head* v. We write n = |V| and m = |E|. Every algorithm in this unit — BFS, DFS, topological sort — has a running time stated in terms of both V and E, because the work is driven partly by touching vertices and partly by scanning edges.\n\nThat is exactly why the choice of representation is not cosmetic. The two standard representations differ in space by a factor of up to V, and they make different operations cheap. Picking the wrong one turns a Θ(V + E) traversal into a Θ(V²) one on a sparse graph. We develop both, then prove the degree identities that let us *count* edges and bound traversal cost without ever drawing the graph."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Adjacency-list representation",
              "statement": "The **adjacency-list** representation of G = (V, E) is an array Adj of |V| lists, one per vertex. For u ∈ V, Adj[u] contains every v such that (u, v) ∈ E (directed) or {u, v} ∈ E (undirected). In the undirected case each edge {u, v} appears twice — once in Adj[u] and once in Adj[v]. The total length of all lists is Σ_u |Adj[u]|, which is |E| for a digraph and 2|E| for an undirected graph, so the representation uses **Θ(V + E)** space."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Adjacency-matrix representation",
              "statement": "The **adjacency-matrix** representation is a |V|×|V| matrix A = (a_{ij}) with a_{ij} = 1 if (i, j) ∈ E and a_{ij} = 0 otherwise. For an undirected graph A is symmetric (A = Aᵀ). It uses **Θ(V²)** space regardless of how many edges are present, and answers the query \"is (u, v) an edge?\" in Θ(1) time by a single lookup."
            },
            {
              "type": "decision",
              "heading": "Adjacency list vs. adjacency matrix",
              "rows": [
                [
                  "Space",
                  "List Θ(V + E)  vs.  Matrix Θ(V²)"
                ],
                [
                  "Edge-existence test (u,v)?",
                  "List O(deg u)  vs.  Matrix Θ(1)"
                ],
                [
                  "Iterate all neighbours of u",
                  "List Θ(deg u) — optimal  vs.  Matrix Θ(V)"
                ],
                [
                  "Best fit",
                  "List → sparse (E = o(V²))  vs.  Matrix → dense / need O(1) tests"
                ],
                [
                  "Traversal cost (BFS/DFS)",
                  "List Θ(V + E)  vs.  Matrix Θ(V²)"
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Handshake lemma (undirected degree sum)",
              "statement": "Let G = (V, E) be an undirected graph (no self-loops). For v ∈ V let deg(v) be the number of edges incident to v. Then\n\n  Σ_{v ∈ V} deg(v) = 2|E|.",
              "proof": "Count the set of incidences I = { (v, e) : v ∈ V, e ∈ E, v is an endpoint of e } in two ways.\n\nGrouping by vertex: for each v, the number of edges incident to v is exactly deg(v) by definition, so |I| = Σ_{v ∈ V} deg(v).\n\nGrouping by edge: each edge e = {x, y} is an unordered pair of two *distinct* endpoints, so it contributes exactly two incidences, (x, e) and (y, e). Hence |I| = 2|E|.\n\nThe two counts equal the same set's size, so Σ_{v} deg(v) = 2|E|. ∎\n\n**Corollary (parity).** The number of vertices of odd degree is even, because the left side is even and removing the even-degree vertices leaves a sum of odd numbers that must still be even — possible only if there is an even count of them."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Directed degree identity",
              "statement": "Let G = (V, E) be a digraph. For v ∈ V let in-deg(v) be the number of edges with head v and out-deg(v) the number with tail v. Then\n\n  Σ_{v ∈ V} in-deg(v) = Σ_{v ∈ V} out-deg(v) = |E|.",
              "proof": "Each directed edge (u, w) ∈ E has exactly one tail (u) and exactly one head (w). Summing out-degrees counts, for each vertex u, the edges whose tail is u; as u ranges over V every edge is counted exactly once by its unique tail, so Σ_v out-deg(v) = |E|. Symmetrically, summing in-degrees counts each edge exactly once by its unique head, so Σ_v in-deg(v) = |E|. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Edge count of the complete graph K_n",
              "statement": "The complete undirected graph K_n on n vertices (every pair of distinct vertices joined by exactly one edge) has |E| = C(n, 2) = n(n−1)/2 edges. Each vertex has degree n−1.",
              "proof": "Every vertex is adjacent to all of the other n−1 vertices, so deg(v) = n−1 for all v. By the handshake lemma,\n\n  2|E| = Σ_{v} deg(v) = n·(n−1),  hence |E| = n(n−1)/2.\n\nEquivalently, an edge is an unordered pair of distinct vertices, and there are exactly C(n, 2) = n(n−1)/2 such pairs. ∎"
            },
            {
              "type": "example",
              "heading": "Degrees sum to 30 ⇒ how many edges?",
              "body": "Suppose an undirected graph has vertex degrees summing to 30. By the handshake lemma, Σ_v deg(v) = 2|E|, so\n\n  2|E| = 30  ⟹  |E| = 15.\n\nThe graph has **15 edges**. Note we needed nothing about how many vertices there are or how the degrees are distributed — the identity converts the *one* number 30 directly into an edge count. (Sanity check: the sum is even, as the handshake lemma forces; a degree sum of 31 would be impossible for any graph.)"
            },
            {
              "type": "example",
              "heading": "Edges of K₇",
              "body": "The complete graph on n = 7 vertices has\n\n  |E| = C(7, 2) = 7·6/2 = 21 edges,\n\nand every vertex has degree 6. Cross-check via the handshake lemma: Σ deg(v) = 7·6 = 42 = 2·21. ✓ For contrast, K₇'s adjacency matrix is 7×7 = 49 cells (with 42 ones off the diagonal), while its adjacency list stores total length 2|E| = 42 — here the two representations are comparable precisely because K₇ is dense."
            },
            {
              "type": "example",
              "heading": "A traversal cost that depends on the representation",
              "body": "Take a graph with V = 10⁶ vertices and E = 2·10⁶ edges (sparse: E = Θ(V)). A BFS/DFS that scans every adjacency list runs in Θ(V + E) = Θ(3·10⁶) steps. The same traversal on an adjacency matrix must, for each of the V vertices, scan a full row of V entries to find its neighbours — Θ(V²) = Θ(10¹²) steps, a million-fold blowup. This is the concrete payoff of choosing the list for sparse graphs, and it is why the traversals to come are analysed against the list."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Three counting facts you will reuse all unit.** (1) Undirected: Σ deg(v) = 2|E| (handshake) — so an edge count is *half* a degree sum. (2) Directed: Σ in-deg = Σ out-deg = |E|. (3) The work of an adjacency-list traversal is Σ_u deg(u) = Θ(E) for the edge scans plus Θ(V) for touching each vertex, giving the ubiquitous **Θ(V + E)**."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": false,
              "height": 240,
              "caption": "An undirected graph with degree sequence (3, 3, 2, 2, 2). The degrees sum to 12, so by the handshake lemma it has 12/2 = 6 edges — confirmed by counting the drawn edges.",
              "nodes": [
                {
                  "id": "a",
                  "label": "a (3)",
                  "x": 12,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "b",
                  "label": "b (3)",
                  "x": 40,
                  "y": 14
                },
                {
                  "id": "c",
                  "label": "c (2)",
                  "x": 40,
                  "y": 86
                },
                {
                  "id": "d",
                  "label": "d (2)",
                  "x": 72,
                  "y": 30
                },
                {
                  "id": "e",
                  "label": "e (2)",
                  "x": 72,
                  "y": 78
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b"
                },
                {
                  "from": "a",
                  "to": "c"
                },
                {
                  "from": "a",
                  "to": "d"
                },
                {
                  "from": "b",
                  "to": "d"
                },
                {
                  "from": "b",
                  "to": "e"
                },
                {
                  "from": "c",
                  "to": "e"
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An undirected graph has degrees summing to 48. How many edges does it have? Could a graph have degrees summing to 17?",
                  "solution": "By the handshake lemma 2|E| = 48, so |E| = 24. A degree sum of 17 is impossible: the handshake lemma forces Σ deg(v) = 2|E| to be even, and 17 is odd, so no undirected graph realizes it.",
                  "hint": "Σ deg(v) = 2|E|, and 2|E| is always even."
                },
                {
                  "prompt": "How many edges does the complete graph K₁₀ have, and what is each vertex's degree?",
                  "solution": "Each vertex is joined to the other 9, so deg(v) = 9 for all v. |E| = C(10, 2) = 10·9/2 = 45. Check: Σ deg = 10·9 = 90 = 2·45. ✓",
                  "hint": "Use |E| = n(n−1)/2 with n = 10."
                },
                {
                  "prompt": "A 5-regular undirected graph (every vertex has degree exactly 5) has how many vertices if it has 20 edges?",
                  "solution": "Let n = |V|. Each vertex has degree 5, so Σ deg(v) = 5n. By the handshake lemma 5n = 2|E| = 2·20 = 40, hence n = 8. (A 5-regular graph needs n even, since 5n must be even; n = 8 works.)",
                  "hint": "Σ deg(v) = (degree)·(number of vertices) for a regular graph; set it equal to 2|E|."
                },
                {
                  "prompt": "A digraph has 12 edges. What is Σ_v out-deg(v)? If one vertex has out-degree 0 (a sink) and in-degree 4, does that contradict anything?",
                  "solution": "Σ_v out-deg(v) = |E| = 12 by the directed degree identity (likewise Σ in-deg = 12). A single vertex with out-degree 0 and in-degree 4 is perfectly consistent: in- and out-degrees are tallied independently, and only the *totals* over all vertices must each equal |E|.",
                  "hint": "Σ in-deg = Σ out-deg = |E|; per-vertex in- and out-degrees are unconstrained beyond that."
                },
                {
                  "prompt": "You must store a graph on 10⁴ vertices with about 3·10⁴ edges and answer many \"is (u,v) an edge?\" queries. Which representation, and what is the space cost?",
                  "solution": "The graph is sparse (E = Θ(V)). An adjacency list costs Θ(V + E) ≈ 4·10⁴ words; a matrix costs Θ(V²) = 10⁸ words — 2500× more. Unless the O(1) edge test is on the critical path, use the list (each edge test costs O(deg u), which is small in a sparse graph). If edge tests truly dominate and memory permits, the matrix's Θ(1) test can justify the Θ(V²) space — but at 10⁸ words that is usually prohibitive here.",
                  "hint": "Compare Θ(V + E) against Θ(V²) for these numbers, then weigh the O(1) edge test."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a6l1-i1",
              "front": "Adjacency list vs. matrix — space?",
              "back": "List: Θ(V + E), great for sparse. Matrix: Θ(V²), but O(1) edge-existence queries; great for dense graphs."
            },
            {
              "id": "a6l1-i2",
              "front": "Handshake lemma (undirected)?",
              "back": "Σ_v deg(v) = 2|E|. Proof: count vertex–edge incidences two ways; each edge contributes 2. So |E| = (degree sum)/2."
            },
            {
              "id": "a6l1-i3",
              "front": "Directed-graph degree identity?",
              "back": "Σ in-deg(v) = Σ out-deg(v) = |E| — each edge has exactly one tail and one head."
            },
            {
              "id": "a6l1-i4",
              "front": "Edges in K_n (complete graph)?",
              "back": "C(n,2) = n(n−1)/2; each vertex has degree n−1. K₇ has 21 edges."
            },
            {
              "id": "a6l1-i5",
              "front": "Degrees sum to 30 ⇒ edges?",
              "back": "2|E| = 30 ⇒ |E| = 15. (An odd degree sum is impossible.)"
            }
          ]
        },
        {
          "id": "a6l2",
          "title": "Breadth-First Search & Shortest Distances",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Explore in layers",
              "body": "Breadth-first search (BFS) explores a graph from a source s outward in **layers**: first s, then all neighbours of s (distance 1), then everything new reachable from them (distance 2), and so on. The defining data structure is a **FIFO queue**: vertices leave the queue in the same order they entered, which is what enforces the layer-by-layer discipline. BFS works on directed and undirected graphs alike.\n\nFor each vertex v it computes d[v], the **shortest-path distance** measured in number of edges, and a predecessor π[v] that reconstructs a shortest path. We will define this precisely, give the algorithm, and then *prove* that d[v] equals the true distance δ(s, v) — the central guarantee of BFS and the reason it solves unweighted single-source shortest paths."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Shortest-path distance δ(s, v)",
              "statement": "For vertices s, v in a graph G, the **shortest-path distance** δ(s, v) is the minimum number of edges on any path from s to v, or ∞ if no path exists. A path achieving this minimum is a **shortest path**. Note δ(s, s) = 0, and δ satisfies the triangle inequality δ(s, v) ≤ δ(s, u) + δ(u, v)."
            },
            {
              "type": "code",
              "heading": "BFS(G, s)",
              "lang": "text",
              "code": "BFS(G, s):\n  for each vertex u ∈ V:           # initialize\n    color[u] = WHITE\n    d[u] = ∞\n    π[u] = NIL\n  color[s] = GRAY\n  d[s] = 0\n  Q = empty queue\n  ENQUEUE(Q, s)\n  while Q not empty:\n    u = DEQUEUE(Q)                 # u is fully processed once popped\n    for each v ∈ Adj[u]:\n      if color[v] == WHITE:        # v discovered for the first time\n        color[v] = GRAY\n        d[v] = d[u] + 1\n        π[v] = u\n        ENQUEUE(Q, v)\n    color[u] = BLACK"
            },
            {
              "type": "text",
              "heading": "The color invariant",
              "body": "Each vertex passes through WHITE (undiscovered) → GRAY (discovered, in the queue) → BLACK (finished, all its edges scanned). A vertex's d-value and π-value are assigned **exactly once**, at the moment it first turns GRAY, and never change afterward — this *write-once* property is what makes the correctness proof go through. The queue at any moment holds only GRAY vertices."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "BFS never underestimates: d[v] ≥ δ(s, v)",
              "statement": "After BFS(G, s) terminates, d[v] ≥ δ(s, v) for every vertex v ∈ V.",
              "proof": "We show the stronger fact that *throughout* the run d[v] ≥ δ(s, v), by induction on the number of ENQUEUE operations.\n\n**Base.** The first enqueue is s, with d[s] = 0 = δ(s, s) ≥ δ(s, s). For every other vertex d is initialized to ∞ ≥ δ(s, ·).\n\n**Step.** Consider the discovery of a WHITE vertex v while scanning the adjacency list of a vertex u that was already dequeued. We set d[v] = d[u] + 1. By the inductive hypothesis d[u] ≥ δ(s, u). Since (u, v) is an edge, δ(s, v) ≤ δ(s, u) + 1 (triangle inequality). Combining,\n\n  d[v] = d[u] + 1 ≥ δ(s, u) + 1 ≥ δ(s, v).\n\nNo other operation changes any d-value (the write-once property), so the inequality is preserved. ∎"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Queue monotonicity",
              "statement": "Suppose during BFS the queue holds ⟨v₁, v₂, …, v_r⟩ with v₁ at the head and v_r at the tail. Then d[v_r] ≤ d[v₁] + 1 and d[v_i] ≤ d[v_{i+1}] for each i = 1, …, r−1. That is, d-values in the queue are nondecreasing and differ by at most 1 between the two ends.",
              "proof": "By induction on the number of queue operations. Initially the queue holds only s, and the claim is vacuous. \n\n*Dequeue.* Removing the head v₁ makes v₂ the new head. By the hypothesis d[v₁] ≤ d[v₂], so d[v_r] ≤ d[v₁] + 1 ≤ d[v₂] + 1, and the internal inequalities still hold.\n\n*Enqueue.* When BFS discovers v while processing u (the vertex it most recently dequeued), it enqueues v with d[v] = d[u] + 1, appending it as the new tail v_{r+1}. By the hypothesis applied at the moment u was dequeued, every vertex still in the queue has d at least d[u], so in particular d[v_r] ≥ d[u], giving d[v_{r+1}] = d[u] + 1 ≤ d[v_r] + 1 — wait, we need d[v_r] ≤ d[v_{r+1}]: indeed d[v_r] ≤ d[u] + 1 = d[v_{r+1}] by the previous-state bound d[v_r] ≤ d[u] + 1, and d[v_{r+1}] = d[u] + 1 ≤ d[v₁] + 1 since d[u] ≤ d[v₁]. Both required inequalities hold, completing the induction. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "BFS correctness: d[v] = δ(s, v)",
              "statement": "On termination of BFS(G, s), for every vertex v reachable from s we have d[v] = δ(s, v), and v is reachable from s along a shortest path whose last edge is (π[v], v).",
              "proof": "By the first lemma d[v] ≥ δ(s, v) always, so it suffices to prove d[v] ≤ δ(s, v) for every reachable v. Suppose not, and let v be a reachable vertex with the *smallest* δ(s, v) for which d[v] ≠ δ(s, v); then d[v] > δ(s, v). Since v ≠ s (as d[s] = 0 = δ(s, s)), let k = δ(s, v) ≥ 1 and let u be the predecessor of v on a shortest s→v path, so δ(s, u) = k − 1. By minimality of v, d[u] = δ(s, u) = k − 1.\n\nConsider the moment BFS dequeues u and scans (u, v). At that point v has one of three colors:\n\n• **WHITE:** then BFS sets d[v] = d[u] + 1 = k = δ(s, v), contradicting d[v] > δ(s, v).\n• **BLACK:** then v was already dequeued, so by queue monotonicity d[v] ≤ d[u]= k − 1 < k, contradicting d[v] > δ(s, v).\n• **GRAY:** then v was discovered while processing some earlier-dequeued w, giving d[v] = d[w] + 1. By queue monotonicity d[w] ≤ d[u], so d[v] = d[w] + 1 ≤ d[u] + 1 = k, again contradicting d[v] > k.\n\nEvery case is impossible, so no such v exists: d[v] = δ(s, v) for all reachable v. Reachable vertices are exactly those that become non-WHITE (an unreachable vertex is never discovered, keeping d = ∞ = δ). Finally, when d[v] = d[u] + 1 was set with π[v] = u, the predecessor chain π[v], π[π[v]], … traces a path of length d[v] = δ(s, v) back to s — a shortest path. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "BFS runs in Θ(V + E)",
              "statement": "With an adjacency-list representation, BFS(G, s) runs in O(V + E) time, and Θ(V + E) when every vertex is reachable.",
              "proof": "Initialization touches each vertex once: Θ(V). Each vertex is enqueued at most once (only WHITE vertices are enqueued, and enqueuing immediately turns a vertex GRAY), hence dequeued at most once, so the queue operations total O(V). When a vertex u is dequeued, BFS scans Adj[u] once, doing Θ(deg(u)) work. The total adjacency-scan work is therefore Σ_u deg(u), which is Θ(E) for a digraph and 2·|E| = Θ(E) undirected (handshake lemma). Summing: O(V) + O(E) = O(V + E). When all vertices are reachable, every vertex is enqueued and every edge scanned, making the bound tight: Θ(V + E). ∎"
            },
            {
              "type": "example",
              "heading": "BFS distances on a small graph",
              "body": "Run BFS from s on the directed graph s→a, s→b, a→c, b→c, c→t, b→t.\n\nQueue trace: enqueue s (d=0). Dequeue s, discover a, b (d=1). Dequeue a, discover c (d=2). Dequeue b: a is not adjacent; c already GRAY, t discovered (d=2). Dequeue c: t already GRAY. Dequeue t.\n\nResult: d[s]=0, d[a]=d[b]=1, d[c]=d[t]=2. These match δ: e.g. s→b→t has length 2 and no shorter path to t exists, so δ(s,t)=2. ✓ Notice t got d=2 from b (via π[t]=b) before c was processed — BFS finds the *first* shortest path it encounters."
            },
            {
              "type": "example",
              "heading": "Why a queue and not a stack",
              "body": "Replace the FIFO queue with a LIFO stack and the layer discipline collapses. On the graph s→a, s→b, a→c, b→c, c→t, a stack might push a then b, pop b, push c, pop c, push t — racing to depth before finishing layer 1. The d-values it would assign no longer equal δ; e.g. it can reach c via b (d would track a longer route) instead of guaranteeing the minimum. The proof above used queue monotonicity in *every* case — that lemma is false for a stack, which is precisely why BFS, not DFS, computes shortest distances."
            },
            {
              "type": "example",
              "heading": "Application: testing bipartiteness",
              "body": "A graph is **bipartite** iff it has no odd-length cycle. BFS tests this: color each vertex by the parity of its layer, color[v] = d[v] mod 2. After the search, scan every edge {u, v}. If some edge joins two vertices of the *same* parity, an odd cycle exists and the graph is not bipartite; otherwise the parity 2-coloring is a valid bipartition. The whole test is one BFS plus one edge scan: Θ(V + E)."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**What BFS gives you, in one line.** From source s, in Θ(V + E): the exact unweighted shortest-path distances d[v] = δ(s, v), a shortest-path (BFS) tree via π, the set of vertices reachable from s, connected components (undirected, by running from each undiscovered vertex), and a bipartiteness test by layer parity."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": false,
              "height": 260,
              "caption": "BFS layers from s. Vertices are placed by BFS distance: s at d=0, {a,b} at d=1, {c,d} at d=2, t at d=3. Bold edges form the BFS tree (one shortest path to each vertex); the thin edge {a,b} is a non-tree edge within a layer.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s d0",
                  "x": 8,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "a",
                  "label": "a d1",
                  "x": 33,
                  "y": 25,
                  "tone": "sage"
                },
                {
                  "id": "b",
                  "label": "b d1",
                  "x": 33,
                  "y": 75,
                  "tone": "sage"
                },
                {
                  "id": "c",
                  "label": "c d2",
                  "x": 62,
                  "y": 25,
                  "tone": "sage"
                },
                {
                  "id": "d",
                  "label": "d d2",
                  "x": 62,
                  "y": 75,
                  "tone": "sage"
                },
                {
                  "id": "t",
                  "label": "t d3",
                  "x": 90,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "a",
                  "bold": true
                },
                {
                  "from": "s",
                  "to": "b",
                  "bold": true
                },
                {
                  "from": "a",
                  "to": "b"
                },
                {
                  "from": "a",
                  "to": "c",
                  "bold": true
                },
                {
                  "from": "b",
                  "to": "d",
                  "bold": true
                },
                {
                  "from": "c",
                  "to": "t",
                  "bold": true
                },
                {
                  "from": "d",
                  "to": "t"
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State precisely what BFS from a source s computes, and complete: \"BFS computes the shortest-path distances d[v] = ____ for all v.\"",
                  "solution": "BFS computes d[v] = δ(s, v), the minimum number of edges on any path from s to v (∞ if v is unreachable), together with a BFS tree of shortest paths encoded by π. The blank is δ(s, v) — the unweighted (edge-count) shortest-path distance.",
                  "hint": "BFS measures distance in number of edges, not weight."
                },
                {
                  "prompt": "Prove that immediately before BFS dequeues u, every WHITE vertex w with an edge (u, w) satisfies δ(s, w) ≥ d[u]. (This is the intuition that BFS never skips a layer.)",
                  "solution": "When u is dequeued, by the BFS correctness theorem d[u] = δ(s, u). If w is WHITE it has not yet been discovered, so by queue monotonicity every vertex enqueued so far has d-value ≤ d[u] + 1, and any not-yet-discovered w must lie in layer ≥ d[u] (it cannot be closer than s's already-processed neighbours). Formally δ(s, w) ≤ δ(s, u) + 1 = d[u] + 1, and since w is still undiscovered when we reach u it cannot have δ(s, w) < d[u] (such vertices were dequeued earlier), so δ(s, w) ∈ {d[u], d[u]+1}, in particular ≥ d[u].",
                  "hint": "Combine d[u] = δ(s,u) with queue monotonicity; an undiscovered neighbour cannot be in an already-finished layer."
                },
                {
                  "prompt": "Give the running time of BFS on an adjacency *matrix*, and explain the difference from the list version.",
                  "solution": "On a matrix, finding the neighbours of a dequeued u requires scanning its whole row of V entries, i.e. Θ(V) per vertex, for Θ(V²) total — independent of E. This is worse than the list's Θ(V + E) on sparse graphs because the matrix pays Θ(V) per vertex even when deg(u) is tiny.",
                  "hint": "Neighbour iteration is Θ(V) per vertex on a matrix vs. Θ(deg u) on a list."
                },
                {
                  "prompt": "On the undirected graph with edges {s,a},{s,b},{a,c},{b,c},{c,t}, compute d[v] for all v by BFS from s, and give a shortest s→t path.",
                  "solution": "d[s]=0; neighbours a,b get d=1; from a (or b) we reach c with d=2; from c we reach t with d=3. So d: s=0, a=1, b=1, c=2, t=3. A shortest path: s→a→c→t (length 3), equivalently s→b→c→t. δ(s,t)=3, matching d[t].",
                  "hint": "Process layer by layer; t is one edge past c."
                },
                {
                  "prompt": "True or false: BFS can compute correct shortest-path distances on a graph with positive integer edge *weights* by treating each edge as unweighted. Justify.",
                  "solution": "False in general. BFS counts edges, so it returns the minimum *number of edges*, which need not minimize total *weight*. Example: s→t of weight 10 (one edge) versus s→a→t of weights 1+1=2 (two edges); BFS returns d[t]=1 reflecting the 1-edge path, but the minimum-weight path has weight 2 via the 2-edge route. (One can recover BFS-correctness by subdividing a weight-w edge into w unit edges, but that is no longer the original graph and costs Θ(total weight).)",
                  "hint": "BFS minimizes edge count, not summed weight."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a6l2-i1",
              "front": "What does BFS compute, and with what data structure?",
              "back": "d[v] = δ(s,v), the unweighted shortest-path distance (in edges), plus a BFS tree via π. Uses a FIFO queue."
            },
            {
              "id": "a6l2-i2",
              "front": "BFS running time (adjacency list)?",
              "back": "Θ(V + E): Θ(V) init + each vertex enqueued/dequeued once + Σ deg(u) = Θ(E) edge scans."
            },
            {
              "id": "a6l2-i3",
              "front": "Why is d[v] = δ(s,v) (proof skeleton)?",
              "back": "d[v] ≥ δ(s,v) by induction (triangle ineq.). d[v] ≤ δ(s,v) by contradiction on the closest bad v, using queue monotonicity in the WHITE/GRAY/BLACK cases."
            },
            {
              "id": "a6l2-i4",
              "front": "Queue monotonicity lemma?",
              "back": "In the BFS queue ⟨v₁…v_r⟩, d-values are nondecreasing and d[v_r] ≤ d[v₁] + 1 — vertices span at most two adjacent layers."
            },
            {
              "id": "a6l2-i5",
              "front": "Two BFS applications beyond distances?",
              "back": "Connected components (restart from each undiscovered vertex) and bipartiteness test (2-color by layer parity d[v] mod 2)."
            }
          ]
        },
        {
          "id": "a6l3",
          "title": "Depth-First Search, Topological Sort & Cycle Detection",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Go deep, then backtrack",
              "body": "Depth-first search (DFS) explores as far along each branch as possible before backtracking — the opposite discipline from BFS. Implemented with recursion (an implicit stack), it stamps each vertex with two timestamps: a **discovery time** d[v] when it first turns GRAY and a **finish time** f[v] when its entire subtree is done and it turns BLACK. These timestamps, not distances, are DFS's payload, and they unlock its two flagship applications: **topological sorting** of a DAG and **cycle detection** in a digraph.\n\nThe analysis rests on two structural facts — the parenthesis theorem and the white-path theorem — and on a classification of every edge into four types. We build that machinery, then prove the two gate theorems in full: every DAG has a topological ordering, and DFS produces a back edge iff the digraph has a directed cycle."
            },
            {
              "type": "code",
              "heading": "DFS(G) with timestamps",
              "lang": "text",
              "code": "DFS(G):\n  for each u ∈ V: color[u] = WHITE; π[u] = NIL\n  time = 0\n  for each u ∈ V:\n    if color[u] == WHITE: DFS-VISIT(G, u)\n\nDFS-VISIT(G, u):\n  time = time + 1;  d[u] = time      # u discovered → GRAY\n  color[u] = GRAY\n  for each v ∈ Adj[u]:\n    if color[v] == WHITE:\n      π[v] = u\n      DFS-VISIT(G, v)\n  color[u] = BLACK                    # u finished\n  time = time + 1;  f[u] = time"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Edge classification & timestamps",
              "statement": "DFS assigns each vertex u a discovery time d[u] and finish time f[u] with d[u] < f[u]; u is GRAY on the open interval (d[u], f[u]). Relative to the DFS forest, each edge (u, v) of G is:\n• a **tree edge** if v was discovered by exploring (u, v) (so π[v] = u);\n• a **back edge** if v is an ancestor of u in the DFS forest — equivalently, v is GRAY when (u, v) is scanned;\n• a **forward edge** if v is a proper descendant of u reached by a non-tree edge;\n• a **cross edge** otherwise.\nA self-loop counts as a back edge. In an *undirected* DFS only tree and back edges occur."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Parenthesis theorem",
              "statement": "In any DFS of G, for every pair of vertices u, v exactly one of the following holds:\n(1) the intervals [d[u], f[u]] and [d[v], f[v]] are entirely disjoint, and neither u nor v is a descendant of the other;\n(2) [d[u], f[u]] ⊂ [d[v], f[v]] (strictly), and u is a descendant of v;\n(3) [d[v], f[v]] ⊂ [d[u], f[u]] (strictly), and v is a descendant of u.\nThe intervals are properly nested like balanced parentheses — they never partially overlap.",
              "proof": "Assume WLOG d[u] < d[v]. Two cases.\n\n**Case d[v] < f[u]** (v discovered while u is GRAY). Then v was discovered after u began but before u finished, so the recursive call DFS-VISIT(v) was nested inside DFS-VISIT(u); v is a descendant of u. Because the recursion is a stack, the call on v must return before the call on u returns, giving f[v] < f[u]. Hence d[u] < d[v] < f[v] < f[u], i.e. [d[v], f[v]] ⊂ [d[u], f[u]] — case (3).\n\n**Case f[u] < d[v].** Then u finished before v was discovered, so by d[u] < f[u] < d[v] < f[v] the two intervals are disjoint. Neither call was active during the other, so neither vertex is a descendant of the other — case (1).\n\n(The remaining arithmetic possibility d[v] = f[u] cannot occur since all timestamps are distinct.) The argument with the roles of u, v swapped covers d[v] < d[u], yielding case (2). Exactly one case holds because the three timestamp orderings are mutually exclusive and exhaustive. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "White-path theorem",
              "statement": "In a DFS forest of G, vertex v is a descendant of vertex u if and only if at the time d[u] when the search discovers u, there is a path from u to v consisting entirely of WHITE vertices (a *white path*).",
              "proof": "(⇒) Suppose v is a descendant of u. Then by the parenthesis theorem d[u] ≤ d[w] for every vertex w on the tree path u ↝ v, so every such w is still WHITE at time d[u]; the tree path itself is a white path.\n\n(⇐) Suppose at time d[u] there is a white path u = w₀, w₁, …, w_k = v but, for contradiction, v is *not* a descendant of u. Take the first w_i on the path that does not become a descendant of u (it exists; w₀ = u is a descendant of itself, and some w_i fails). Its predecessor w_{i−1} *is* a descendant of u, so d[u] ≤ d[w_{i−1}]. Since w_i is WHITE at time d[u], it is discovered after u. Now w_i is a neighbour of w_{i−1}; when DFS-VISIT(w_{i−1}) scans the edge (w_{i−1}, w_i): if w_i is still WHITE it becomes a child of w_{i−1}, hence a descendant of u (contradiction); if it is already non-WHITE, then d[w_{i−1}] < d[w_i] < f[w_{i−1}], so by the parenthesis theorem w_i is a descendant of w_{i−1}, hence of u (contradiction). Either way w_i is a descendant of u, contradicting its choice. Thus v is a descendant of u. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "DFS runs in Θ(V + E)",
              "statement": "With an adjacency list, DFS(G) runs in Θ(V + E) time.",
              "proof": "The outer loop and initialization are Θ(V). DFS-VISIT is invoked exactly once per vertex (only on WHITE vertices, which it immediately turns GRAY), so the calls cost Θ(V) in overhead. Within the call on u its loop scans Adj[u] once, doing Θ(deg(u)) work; summed over all vertices this is Σ_u deg(u) = Θ(E). Total Θ(V) + Θ(E) = Θ(V + E). ∎"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "DAG and topological ordering",
              "statement": "A **directed acyclic graph (DAG)** is a digraph with no directed cycle. A **topological ordering** of a digraph G = (V, E) is a linear order v₁, v₂, …, v_n of V such that for every edge (v_i, v_j) ∈ E we have i < j — every edge points forward in the order."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Every finite DAG has a source (in-degree-0 vertex)",
              "statement": "Every finite DAG with at least one vertex contains a vertex of in-degree 0.",
              "proof": "Suppose, for contradiction, that every vertex of the DAG G has in-degree ≥ 1. Pick any vertex u₀. Since in-deg(u₀) ≥ 1, it has a predecessor u₁ with (u₁, u₀) ∈ E. Since in-deg(u₁) ≥ 1, it has a predecessor u₂, and so on, building a backward walk u₀, u₁, u₂, …. Because V is finite, after at most |V| steps some vertex repeats: u_i = u_j with i < j. The segment u_j, u_{j−1}, …, u_i then traverses edges forward as (u_{k+1}, u_k) and returns to its start, forming a directed cycle. This contradicts G being acyclic. Hence some vertex has in-degree 0. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "A digraph has a topological ordering iff it is a DAG",
              "statement": "A finite digraph G has a topological ordering if and only if G is a DAG. In particular, every DAG admits a topological ordering.",
              "proof": "(⇒, contrapositive) If G has a directed cycle v_{i₁} → v_{i₂} → ⋯ → v_{i₁}, no linear order can place all of i₁ < i₂ < ⋯ < i₁, since that would require i₁ < i₁. So a graph with a cycle has no topological order; equivalently, having one forces acyclicity.\n\n(⇐) We prove every DAG on n vertices has a topological ordering by **induction on n**.\n\n*Base n = 1.* A single vertex is trivially ordered; the lone listing v₁ satisfies the (empty) edge condition.\n\n*Inductive step.* Assume every DAG on n−1 vertices has a topological ordering; let G be a DAG on n ≥ 2 vertices. By the source lemma G has a vertex s with in-degree 0. Remove s and its outgoing edges to get G′ on n−1 vertices. G′ is still acyclic (deleting a vertex cannot create a cycle), so by the inductive hypothesis G′ has a topological ordering u₂, u₃, …, u_n. Prepend s to obtain s, u₂, …, u_n. Verify the edge condition: any edge of G is either (a) out of s — its head appears after s, so it points forward; or (b) an edge within G′ — forward by the inductive ordering. No edge enters s (in-degree 0), so nothing must precede s. Hence the listing is a valid topological ordering of G. By induction, every finite DAG has one. ∎\n\n**Algorithmic corollary.** DFS yields one for free: output vertices in order of *decreasing finish time* f[·]. We justify this with the cycle theorem below — in a DAG there are no back edges, so for every edge (u, v), f[u] > f[v], which is exactly the decreasing-finish-time order being topological."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Back edge iff directed cycle",
              "statement": "A depth-first search of a directed graph G yields a **back edge** if and only if G contains a directed cycle.",
              "proof": "(⇐) Suppose G has a directed cycle C. Let v be the *first* vertex of C discovered by the DFS, and let (u, v) be the edge of C entering v (its predecessor on C). At time d[v], the rest of C — the path from v around to u — consists only of vertices not yet discovered, hence WHITE; so there is a white path from v to u. By the white-path theorem u is a descendant of v in the DFS forest. Therefore when the descendant u later scans the edge (u, v), v is still an ancestor and still GRAY (its interval contains u's), so (u, v) is classified as a back edge.\n\n(⇒) Suppose DFS produces a back edge (u, v). By definition of back edge, v is an ancestor of u in the DFS forest, so there is a tree path v ↝ u of forward tree edges. Appending the back edge (u, v) closes this path into a directed cycle v ↝ u → v. Hence G contains a directed cycle. ∎\n\n**Corollary.** G is a DAG iff a DFS of G produces no back edge — giving a Θ(V + E) acyclicity test: run DFS and report a cycle the instant an edge to a GRAY vertex is found."
            },
            {
              "type": "code",
              "heading": "TOPOLOGICAL-SORT(G) via DFS",
              "lang": "text",
              "code": "TOPOLOGICAL-SORT(G):\n  run DFS(G), computing finish times f[v]\n  # (if any back edge is found, G is cyclic → no topo order)\n  output vertices in order of DECREASING f[v]\n  # implemented by pushing each vertex onto a stack as it finishes;\n  # the stack popped top-to-bottom is the topological order.\n# Correctness: for every edge (u,v) in a DAG, f[u] > f[v],\n# so u precedes v in decreasing-finish order. Runs in Θ(V + E)."
            },
            {
              "type": "example",
              "heading": "Topological sort of a dependency DAG",
              "body": "Let tasks have edges shirt→belt, shirt→tie, tie→jacket, belt→jacket, socks→shoes, pants→shoes, pants→belt. This is acyclic. Run DFS; one valid finish-time order (decreasing f) is: socks, pants, shirt, tie, belt, jacket, shoes — check each edge points forward, e.g. belt→jacket has belt before jacket. ✓ Equivalently, repeatedly remove an in-degree-0 vertex (socks or pants or shirt first), exactly as in the inductive proof, to build the ordering left to right."
            },
            {
              "type": "example",
              "heading": "DFS edge classification with timestamps",
              "body": "DFS the digraph a→b, b→c, c→a, a→d starting at a. Discover a (d=1), then b (d=2), then c (d=3). From c the edge c→a finds a GRAY → **back edge** (a is an ancestor of c). c finishes (f=4), b finishes (f=5). Back at a, edge a→d discovers d (d=6, f=7), then a finishes (f=8). The back edge (c,a) certifies the cycle a→b→c→a, exactly as the theorem predicts: a was the first cycle vertex discovered, and the white path a↝c made c a descendant of a."
            },
            {
              "type": "example",
              "heading": "No back edge ⇒ DAG ⇒ decreasing-finish is topological",
              "body": "DFS the DAG a→b, a→c, b→d, c→d. Suppose discovery order a, b, d, then c. Finishes: d (f=4), b (f=5), then c discovers nothing new (d is BLACK, a cross/forward situation, *not* a back edge since d is not GRAY), c finishes (f=7), a finishes (f=8). No edge ever hit a GRAY vertex → no back edge → acyclic. Decreasing f: a(8), c(7), b(5), d(4) → order a, c, b, d. Every edge points forward (a→b, a→c, b→d, c→d). ✓"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Back edge needs GRAY, not merely non-WHITE.** An edge (u, v) where v is already BLACK is a forward or cross edge, **not** a back edge, and creates no cycle — v's interval has already closed, so v is not an ancestor of u. Only an edge to a GRAY (still-on-the-recursion-stack) vertex is a back edge. Conflating BLACK with GRAY is the classic false cycle-detection bug."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 260,
              "caption": "DFS from a. Tree edges a→b→c and a→d are bold; the edge c→a (rust) is a back edge because a is still GRAY (an ancestor of c) when scanned — it certifies the directed cycle a→b→c→a.",
              "nodes": [
                {
                  "id": "a",
                  "label": "a 1/8",
                  "x": 12,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "b",
                  "label": "b 2/5",
                  "x": 42,
                  "y": 22,
                  "tone": "sage"
                },
                {
                  "id": "c",
                  "label": "c 3/4",
                  "x": 72,
                  "y": 22,
                  "tone": "sage"
                },
                {
                  "id": "d",
                  "label": "d 6/7",
                  "x": 42,
                  "y": 80
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b",
                  "directed": true,
                  "bold": true,
                  "label": "tree"
                },
                {
                  "from": "b",
                  "to": "c",
                  "directed": true,
                  "bold": true,
                  "label": "tree"
                },
                {
                  "from": "c",
                  "to": "a",
                  "directed": true,
                  "tone": "rust",
                  "label": "back"
                },
                {
                  "from": "a",
                  "to": "d",
                  "directed": true,
                  "bold": true,
                  "label": "tree"
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Complete and justify: \"A directed graph has a topological ordering if and only if it is a ____.\"",
                  "solution": "The blank is **DAG** (directed acyclic graph). If G has a cycle, no linear order can make every cycle edge point forward (it would force some index strictly before itself), so no topological order exists. Conversely every DAG has one: repeatedly extract an in-degree-0 source and recurse (proved by induction on |V|).",
                  "hint": "A cycle would force a vertex to precede itself in the order."
                },
                {
                  "prompt": "Prove that every finite DAG has a vertex with in-degree 0 (a source).",
                  "solution": "Suppose every vertex has in-degree ≥ 1. Starting from any u₀, repeatedly follow an incoming edge backward: u₀ has a predecessor u₁, which has a predecessor u₂, etc. Since V is finite this infinite backward walk must repeat a vertex, u_i = u_j (i < j). The portion u_j → u_{j−1} → ⋯ → u_i is a directed cycle, contradicting acyclicity. Hence some vertex has in-degree 0.",
                  "hint": "Walk backward along in-edges; finiteness forces a repeat, and a repeat is a cycle."
                },
                {
                  "prompt": "Using the source lemma, prove by induction on |V| that every finite DAG has a topological ordering.",
                  "solution": "Base |V| = 1: the single vertex is a valid order. Step: assume the claim for n−1; let G be a DAG on n ≥ 2 vertices. By the source lemma pick s with in-degree 0. Delete s; the remaining graph G′ on n−1 vertices is still acyclic, so it has a topological order u₂,…,u_n by hypothesis. Prepend s: in s, u₂,…,u_n, edges out of s point forward (heads come after s), edges inside G′ are forward by hypothesis, and no edge enters s. So it is a topological order of G. By induction all finite DAGs have one.",
                  "hint": "Remove an in-degree-0 source, order the rest recursively, then prepend the source."
                },
                {
                  "prompt": "Prove that a DFS of a digraph G produces a back edge if and only if G contains a directed cycle.",
                  "solution": "(⇐) Let C be a directed cycle and v its first vertex discovered by DFS; let (u,v) be the edge of C entering v. At time d[v] the rest of C from v to u is all WHITE, so there is a white path v↝u; by the white-path theorem u is a descendant of v. Thus v is still GRAY (an ancestor of u) when u scans (u,v), making (u,v) a back edge. (⇒) If (u,v) is a back edge then v is an ancestor of u, so the tree path v↝u plus the edge (u,v) is a directed cycle. ∎",
                  "hint": "Forward direction: white-path theorem on the first-discovered cycle vertex. Reverse: a back edge closes a tree path into a cycle."
                },
                {
                  "prompt": "In a DAG, prove that for every edge (u, v) we have f[u] > f[v], and conclude that ordering vertices by decreasing finish time is a topological sort.",
                  "solution": "When (u, v) is explored, v is not GRAY (else (u,v) is a back edge and the cycle theorem makes G cyclic, contradiction). So v is WHITE or BLACK. If WHITE, v becomes a descendant of u, so by the parenthesis theorem [d[v],f[v]] ⊂ [d[u],f[u]], giving f[v] < f[u]. If BLACK, then f[v] is already set and d[u] < f[v] < f[u]... more simply, v finished before u was even scanning, so f[v] < (current time) < f[u]. Either way f[u] > f[v]. Hence in decreasing-finish order u precedes v for every edge (u,v) — a topological ordering.",
                  "hint": "Rule out the back-edge (GRAY) case via the cycle theorem; then handle WHITE and BLACK with the parenthesis theorem."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a6l3-i1",
              "front": "DFS timestamps and the four edge types?",
              "back": "d[u]=discovery, f[u]=finish (u GRAY on (d,f)). Edges: tree, back (to a GRAY ancestor), forward, cross. Undirected DFS has only tree & back."
            },
            {
              "id": "a6l3-i2",
              "front": "Topological ordering exists iff ___?",
              "back": "iff the digraph is a DAG (directed acyclic graph). A cycle would force a vertex to precede itself."
            },
            {
              "id": "a6l3-i3",
              "front": "Every finite DAG has a source — why?",
              "back": "If all in-degrees ≥ 1, walk backward along in-edges; finiteness forces a repeat, which is a directed cycle — contradiction. So some vertex has in-degree 0."
            },
            {
              "id": "a6l3-i4",
              "front": "DAG ⇒ topological order (proof idea)?",
              "back": "Induction on |V|: remove an in-degree-0 source s, topologically order the rest, prepend s. Edges out of s and within G′ all point forward."
            },
            {
              "id": "a6l3-i5",
              "front": "Back edge ⟺ directed cycle (both directions)?",
              "back": "Cycle ⇒ first-discovered cycle vertex v has a white path to its predecessor u (white-path thm) ⇒ (u,v) back edge. Back edge (u,v) ⇒ tree path v↝u + edge = cycle."
            },
            {
              "id": "a6l3-i6",
              "front": "DFS topological sort & its cost?",
              "back": "Output vertices by decreasing finish time f (in a DAG every edge (u,v) has f[u]>f[v]). Runs in Θ(V + E)."
            }
          ]
        }
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
          "id": "a7l1",
          "title": "Relaxation & Optimal Substructure",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "The problem, stated precisely",
              "body": "Let G = (V, E) be a directed graph with a **weight function** w: E → ℝ assigning a real number w(u, v) to each edge (u, v). The weight of a path p = ⟨v₀, v₁, …, v_k⟩ is the sum of its edge weights,\n\n  w(p) = Σ_{i=1}^{k} w(v_{i−1}, v_i).\n\nThe **shortest-path weight** from u to v is\n\n  δ(u, v) = min { w(p) : p is a path from u to v }   if such a path exists, and ∞ otherwise.\n\nA *shortest path* from u to v is any path p with w(p) = δ(u, v). The **single-source shortest-paths (SSSP) problem** fixes a source s ∈ V and asks for δ(s, v) — and a shortest path realizing it — for every v ∈ V.\n\nThree facts shape everything that follows. (1) Shortest paths can fail to exist: if some path from s to v passes through a cycle of negative total weight, you can drive the weight to −∞ by looping, so δ(s, v) = −∞ and is undefined as a *minimum*. (2) When δ(s, v) is finite, some shortest path is **simple** — it has no repeated vertices — because any nonnegative cycle on a path can be excised without increasing weight. (3) The collection of shortest paths from s forms a tree. This section builds the two structural pillars — *optimal substructure* and *relaxation* — on which every SSSP algorithm in this unit rests."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Shortest-path estimate and predecessor",
              "statement": "Every algorithm in this unit maintains, for each vertex v, two attributes:\n\n• **d[v]** — the *shortest-path estimate*, an upper bound on δ(s, v) that the algorithm progressively tightens; and\n• **π[v]** — the *predecessor* of v, either another vertex or NIL, used to reconstruct the path tree.\n\nThey are initialized by INITIALIZE-SINGLE-SOURCE: d[s] ← 0, and d[v] ← ∞, π[v] ← NIL for every v ≠ s. The invariant every algorithm preserves is d[v] ≥ δ(s, v) at all times (Upper-Bound Property)."
            },
            {
              "type": "code",
              "heading": "Initialization and the relaxation step",
              "lang": "text",
              "code": "INITIALIZE-SINGLE-SOURCE(G, s)\n  for each vertex v ∈ G.V\n    d[v] ← ∞\n    π[v] ← NIL\n  d[s] ← 0\n\nRELAX(u, v, w)            // try to improve the path to v by going through u\n  if d[v] > d[u] + w(u, v)\n    d[v] ← d[u] + w(u, v)\n    π[v] ← u"
            },
            {
              "type": "text",
              "heading": "Relaxation is the only move",
              "body": "RELAX(u, v, w) asks a single question: *is the best route to v known so far improved by taking a known route to u and then crossing the edge (u, v)?* If d[u] + w(u, v) < d[v], it is, and we lower d[v] to that value and record π[v] = u. This is the **edge-relaxation** step, and it is the *only* operation any algorithm in this unit uses to change d or π.\n\nWhat distinguishes Dijkstra, Bellman–Ford, and the DAG algorithm is **not** the operation but the **order and multiplicity** in which edges are relaxed. Get the order right and the estimates converge to the true shortest-path weights. The rest of this section proves the two properties that make this work regardless of order: optimal substructure (why shortest paths decompose) and the basic relaxation properties (why estimates never lie and, once correct, stay correct)."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Optimal substructure of shortest paths",
              "statement": "Let p = ⟨v₀, v₁, …, v_k⟩ be a shortest path from v₀ to v_k. For any 0 ≤ i ≤ j ≤ k, let p_{ij} = ⟨v_i, v_{i+1}, …, v_j⟩ be the subpath from v_i to v_j. Then p_{ij} is a shortest path from v_i to v_j.",
              "proof": "Decompose p into three contiguous subpaths along the cut points i and j:\n\n  v₀ ⇝ v_i ⇝ v_j ⇝ v_k,    realized as  p = p_{0i} · p_{ij} · p_{jk},\n\nwhere · denotes concatenation. Because weight is the sum of edge weights and these three subpaths partition the edges of p, we have\n\n  w(p) = w(p_{0i}) + w(p_{ij}) + w(p_{jk}).   (★)\n\nNow suppose, for contradiction, that p_{ij} is *not* a shortest path from v_i to v_j. Then there exists a path p′_{ij} from v_i to v_j with w(p′_{ij}) < w(p_{ij}). Form the path\n\n  p′ = p_{0i} · p′_{ij} · p_{jk},\n\nwhich is a valid path from v₀ to v_k (it starts at v_i = endpoint of p_{0i} and ends at v_j = start of p_{jk}). Its weight is\n\n  w(p′) = w(p_{0i}) + w(p′_{ij}) + w(p_{jk}) < w(p_{0i}) + w(p_{ij}) + w(p_{jk}) = w(p),\n\nusing w(p′_{ij}) < w(p_{ij}) in the strict step and (★) in the last. Thus w(p′) < w(p), contradicting the assumption that p is a shortest path from v₀ to v_k. Therefore no such p′_{ij} exists, and p_{ij} is a shortest path from v_i to v_j. ∎\n\n*Remark on negative weights.* The argument never assumes weights are nonnegative; it needs only that path weight is additive over the cut and that p is genuinely a minimum-weight path (so δ(v₀, v_k) is finite). Optimal substructure therefore holds even with negative edges, as long as no negative cycle makes the minimum undefined."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "Optimal substructure is *why* SSSP is solvable by local edge relaxations at all. It guarantees δ satisfies the triangle inequality and lets a correct path to v be assembled from a correct path to v's predecessor plus one edge — the exact shape RELAX exploits."
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Triangle inequality for shortest-path weights",
              "statement": "For every edge (u, v) ∈ E, δ(s, v) ≤ δ(s, u) + w(u, v).",
              "proof": "If δ(s, u) = ∞ the right side is ∞ and the inequality holds trivially, so assume δ(s, u) is finite. Let p be a shortest path from s to u, so w(p) = δ(s, u). Appending the edge (u, v) gives a path p · (u, v) from s to v of weight δ(s, u) + w(u, v). Since δ(s, v) is the minimum weight over *all* s-to-v paths, it is at most the weight of this particular one:\n\n  δ(s, v) ≤ w(p · (u, v)) = δ(s, u) + w(u, v).   ∎\n\n(If δ(s, v) = −∞ via a negative cycle the bound still holds vacuously; the statement is meaningful precisely when δ(s, v) is finite.)"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Upper-bound and convergence properties of relaxation",
              "statement": "Run INITIALIZE-SINGLE-SOURCE and then any sequence of RELAX steps on G. Then:\n(a) **Upper bound.** d[v] ≥ δ(s, v) holds for all v at all times, and once d[v] = δ(s, v) it never changes again.\n(b) **Convergence.** If s ⇝ u → v is a shortest path and d[u] = δ(s, u) holds at the moment RELAX(u, v, w) is called, then d[v] = δ(s, v) holds immediately after — and forever after.",
              "proof": "(a) The invariant d[v] ≥ δ(s, v) holds after initialization: d[s] = 0 = δ(s, s) (no negative cycle through s, else δ(s, s) = −∞ is excluded by hypothesis) and d[v] = ∞ ≥ δ(s, v) for v ≠ s. Suppose it holds before a call RELAX(u, v, w). The only attribute that can change is d[v], and only to d[u] + w(u, v). By the inductive hypothesis d[u] ≥ δ(s, u), and by the triangle inequality δ(s, v) ≤ δ(s, u) + w(u, v), so\n\n  d[u] + w(u, v) ≥ δ(s, u) + w(u, v) ≥ δ(s, v).\n\nHence the new value of d[v] is still ≥ δ(s, v); the invariant is preserved. Moreover RELAX only ever *decreases* d[v] (it assigns a value strictly smaller than the current d[v]), and since d[v] can never drop below δ(s, v), once it equals δ(s, v) no further relaxation can change it. \n\n(b) Suppose d[u] = δ(s, u) when RELAX(u, v, w) runs, and that s ⇝ u → v is a shortest path. By optimal substructure, the prefix s ⇝ u of this shortest path is itself shortest, and δ(s, v) = δ(s, u) + w(u, v). Immediately after the relaxation,\n\n  d[v] ≤ d[u] + w(u, v) = δ(s, u) + w(u, v) = δ(s, v),\n\nbecause RELAX sets d[v] to min(d[v], d[u] + w(u, v)). Combined with part (a)'s lower bound d[v] ≥ δ(s, v), we get d[v] = δ(s, v). By part (a) it stays there. ∎"
            },
            {
              "type": "example",
              "heading": "Why order is everything",
              "body": "Take edges s→a (weight 1), a→b (weight 1), s→b (weight 5), and source s. The true value is δ(s, b) = 2 via s→a→b.\n\n*Good order.* Relax s→a (d[a]=1), then a→b (d[b]=2), then s→b (no change: 0+5 > 2). One pass in topological order nails every estimate.\n\n*Bad order.* Relax a→b first: d[a] = ∞, so d[b] stays ∞. Relax s→b: d[b] = 5. Relax s→a: d[a] = 1. Now d[b] = 5 ≠ 2 — wrong, and we must relax a→b *again* to fix it. The Convergence Lemma is precise about the cure: a→b must be relaxed *after* d[a] has reached its final value δ(s, a). Sequencing relaxations so this happens is exactly what the algorithms in the next two lessons engineer."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Path-relaxation property",
              "statement": "Let p = ⟨v₀, v₁, …, v_k⟩ be a shortest path from s = v₀ to v_k. Suppose the edges of p are relaxed, in the order (v₀,v₁), (v₁,v₂), …, (v_{k−1},v_k), at some point during a run of RELAX steps (other relaxations may be interleaved). Then d[v_k] = δ(s, v_k) after the last of these k relaxations.",
              "proof": "By induction on i, we show d[v_i] = δ(s, v_i) holds after edge (v_{i−1}, v_i) is relaxed. Base i = 0: d[v₀] = d[s] = 0 = δ(s, s) from initialization, and by the Upper-Bound Property it never increases. Inductive step: assume d[v_{i−1}] = δ(s, v_{i−1}) holds before edge (v_{i−1}, v_i) is relaxed (it was achieved when the previous edge was relaxed, and Upper-Bound keeps it fixed thereafter). Since p is a shortest path, its prefix s ⇝ v_i is shortest (optimal substructure), so s ⇝ v_{i−1} → v_i is a shortest path. The Convergence Lemma then gives d[v_i] = δ(s, v_i) immediately after this relaxation. Taking i = k completes the proof. ∎\n\nThis is the workhorse for proving Bellman–Ford and the DAG algorithm correct: arrange that the edges of every shortest path get relaxed *in path order*, and the right answers fall out."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Prove that if δ(s, v) is finite, then some shortest path from s to v is simple (has no repeated vertices).",
                  "solution": "Let p be any shortest path from s to v, so w(p) = δ(s, v) is finite. If p repeats a vertex x, it contains a cycle c from x back to x. Because δ(s, v) is finite, G has no negative-weight cycle reachable on an s-to-v path, so w(c) ≥ 0. Excise c from p to get a shorter (in edge count) path p′ from s to v with w(p′) = w(p) − w(c) ≤ w(p) = δ(s, v). Since δ(s, v) is the minimum, w(p′) = δ(s, v), so p′ is also a shortest path. Repeat until no vertex repeats; the process terminates because each excision strictly reduces the number of edges. The result is a simple shortest path. ∎",
                  "hint": "A repeated vertex encloses a cycle; finiteness of δ forbids that cycle from being negative, so removing it cannot increase the weight."
                },
                {
                  "prompt": "Show by example that the triangle inequality δ(s, v) ≤ δ(s, u) + w(u, v) can be a strict inequality, and explain what that means for the shortest-path tree.",
                  "solution": "Edges s→u (weight 10), s→v (weight 1), u→v (weight 1). Then δ(s, u) = 10, δ(s, v) = 1, and δ(s, u) + w(u, v) = 11 > 1 = δ(s, v), strict. Meaning: the edge (u, v) is *not* on any shortest path to v (v is reached cheaper directly), so in the shortest-path tree π[v] ≠ u. Equality δ(s, v) = δ(s, u) + w(u, v) is exactly the condition under which (u, v) *could* be a tree edge to v.",
                  "hint": "Make the direct route to v much cheaper than the detour through u."
                },
                {
                  "prompt": "A student claims: 'After we relax edge (u, v), the value d[v] equals δ(s, v).' Give a counterexample, then state the correct precondition under which the claim becomes true.",
                  "solution": "Counterexample: edges s→u (1), u→v (1) with d[u] still ∞ when we relax (u, v). Then d[v] stays ∞ ≠ δ(s, v) = 2 — relaxing one edge with a stale d[u] achieves nothing. Correct precondition (Convergence Lemma): if d[u] = δ(s, u) *and* s ⇝ u → v is a shortest path at the moment RELAX(u, v, w) is called, then afterward d[v] = δ(s, v). The hypothesis on d[u] is essential.",
                  "hint": "Relaxation can only propagate a *correct* d[u]; if d[u] is still an overestimate, d[v] inherits the overestimate."
                },
                {
                  "prompt": "Prove that at any time during a sequence of relaxations, the predecessor subgraph G_π (edges {(π[v], v) : v ∈ V, π[v] ≠ NIL}) contains no cycle, given that G has no negative-weight cycle reachable from s.",
                  "solution": "Suppose, for contradiction, that at some moment G_π contains a cycle c = ⟨v₀, v₁, …, v_k = v₀⟩ with π[v_i] = v_{i−1} for i = 1, …, k. Each of these k predecessor edges was installed by a relaxation. Among the k edges of c, let edge (v_{j−1}, v_j) be the one whose π-assignment π[v_j] ← v_{j−1} happened **most recently** in time, and let τ be the instant just after that final relaxation RELAX(v_{j−1}, v_j) completes. We work with the d-values as they stand at time τ.\n\nFirst, that final relaxation took the improving branch, so just *before* it d[v_j] > d[v_{j−1}] + w(v_{j−1}, v_j), and just *after* it (i.e. at τ),\n\n  d[v_j] = d[v_{j−1}] + w(v_{j−1}, v_j).   (1)\n\nMoreover the relaxation **strictly decreased** d[v_j]: writing d_before[v_j] for its value just before, d_before[v_j] > d[v_j].\n\nSecond, every *other* edge (v_{i−1}, v_i) of c (i ≠ j) was installed strictly *before* τ — because (v_{j−1}, v_j) is the most recent. At the instant its own assignment π[v_i] ← v_{i−1} occurred, RELAX set d[v_i] = d[v_{i−1}] + w(v_{i−1}, v_i). Between that instant and τ, d-values never increase (Upper-Bound Property: RELAX only lowers estimates), so d[v_{i−1}] can only have dropped further, giving at time τ\n\n  d[v_i] ≤ d[v_{i−1}] + w(v_{i−1}, v_i)    for every i ≠ j.   (2)\n\nNow comes the decisive point that rules out *both* a negative and a zero cycle. Consider in particular the predecessor of v_j inside c, namely the edge (v_{j−2}, v_{j−1}) (indices mod k), which set π[v_{j−1}] ← v_{j−2} at some instant strictly before τ with equality d[v_{j−1}] = d[v_{j−2}] + w(v_{j−2}, v_{j−1}) *then*. By the same monotonicity, at the earlier instant when (v_{j−1}, v_j) was being relaxed and chosen, the d[v_{j−1}] used in (1) is a value that has only decreased since v_{j−1} itself was last updated. We never need the exact history beyond this: combine (1) and (2) by summing around the whole cycle at time τ. Adding the single equality (1) for index j to the k−1 inequalities (2) for i ≠ j yields\n\n  Σ_{i=1}^{k} d[v_i] ≤ Σ_{i=1}^{k} ( d[v_{i−1}] + w(v_{i−1}, v_i) ) = Σ_{i=1}^{k} d[v_{i−1}] + Σ_{i=1}^{k} w(v_{i−1}, v_i).\n\nBecause c is a cycle, {v₀, …, v_{k−1}} = {v₁, …, v_k} as multisets, so the two d-sums are equal and cancel (every d-value is finite, as each v_i has a finite estimate the moment its π-edge was set). This leaves Σ_{i=1}^{k} w(v_{i−1}, v_i) ≥ 0: the cycle is nonnegative.\n\nTo eliminate the remaining zero case, return to the strict decrease at the final relaxation. Just before that relaxation the edge (v_{j−1}, v_j) was *not* tight: d_before[v_j] > d[v_{j−1}] + w(v_{j−1}, v_j). But the value d_before[v_j] is the estimate produced when π[v_j] last pointed elsewhere; in particular, at that earlier moment v_j already satisfied — via the still-standing chain of equalities along c that were installed before τ — the relation d_before[v_j] ≤ d[v_{j−1}] + w(v_{j−1}, v_j) had the cycle weight been zero. Concretely, summing (1)–(2) with (1) replaced by the *strict* pre-relaxation relation d_before[v_j] > d[v_{j−1}] + w(v_{j−1}, v_j) and the unchanged (2) for the other edges (whose left sides are ≤ their pre-τ values) gives, after the identical cancellation of the d-terms around the loop,\n\n  Σ_{i=1}^{k} w(v_{i−1}, v_i) < 0.\n\nThus the very relaxation that *installed the last cycle edge* could only fire because traversing c once strictly decreases the accumulated estimate — i.e. c has strictly negative weight. This contradicts the hypothesis that no negative-weight cycle is reachable from s (and every vertex of G_π with a finite estimate is reachable from s, since each π-edge was created by relaxing an edge out of a vertex with a finite d, tracing back to s). The negative case is impossible, and the strict relation just derived shows the zero case is impossible too. Hence G_π contains no cycle. ∎",
                  "hint": "Look at the **most recently installed** π-edge of a hypothetical cycle, say π[v_j] ← v_{j−1}. That relaxation *strictly* decreased d[v_j], while every other cycle edge was already tight beforehand. Sum the one strict relation with the k−1 non-strict ones around the loop: the d-terms cancel and force Σw < 0, contradicting reachable-no-negative-cycle. The strict decrease is what kills the zero-weight case the nonnegativity argument alone leaves open."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a7l1-i1",
              "front": "Define δ(s, v), the shortest-path weight.",
              "back": "The minimum weight w(p) over all paths p from s to v, or ∞ if no such path exists. It is −∞ (undefined as a minimum) if some s-to-v path passes through a negative-weight cycle."
            },
            {
              "id": "a7l1-i2",
              "front": "What does RELAX(u, v, w) do?",
              "back": "If d[v] > d[u] + w(u, v), it sets d[v] ← d[u] + w(u, v) and π[v] ← u. It is the only operation that changes d or π; algorithms differ only in the order/multiplicity of relaxations."
            },
            {
              "id": "a7l1-i3",
              "front": "State the optimal-substructure property of shortest paths.",
              "back": "Any subpath of a shortest path is itself a shortest path between its endpoints. Proof: if a subpath could be improved, splicing in the cheaper subpath would yield a cheaper overall path, contradicting minimality."
            },
            {
              "id": "a7l1-i4",
              "front": "State the Convergence Property of relaxation.",
              "back": "If s ⇝ u → v is a shortest path and d[u] = δ(s, u) holds when RELAX(u, v, w) is called, then afterward d[v] = δ(s, v) — and stays there (Upper-Bound Property)."
            },
            {
              "id": "a7l1-i5",
              "front": "What is the triangle inequality for shortest paths, and where does it come from?",
              "back": "δ(s, v) ≤ δ(s, u) + w(u, v) for every edge (u, v). It follows because appending edge (u,v) to a shortest s→u path gives one particular s→v path, whose weight bounds the minimum δ(s, v)."
            }
          ]
        },
        {
          "id": "a7l2",
          "title": "Dijkstra's Algorithm",
          "estMinutes": 32,
          "content": [
            {
              "type": "text",
              "heading": "A greedy strategy that needs nonnegative weights",
              "body": "Dijkstra's algorithm solves SSSP on a directed graph G = (V, E) with weight function w: E → ℝ≥0 — **all edge weights nonnegative**. It maintains a set S of vertices whose shortest-path weights are already known to be final, and a min-priority queue Q of the remaining vertices keyed by their current estimate d. Repeatedly it **extracts the minimum-d vertex u from Q**, adds it to S as settled, and **relaxes every edge leaving u**. The greedy bet is that the closest unsettled vertex already has its correct distance — a bet that pays off precisely because no edge can lower an estimate by a negative amount.\n\nThis lesson states the algorithm, proves it correct (the central proof the gate demands), and analyzes its running time as a function of the priority-queue implementation."
            },
            {
              "type": "code",
              "heading": "Dijkstra's algorithm",
              "lang": "text",
              "code": "DIJKSTRA(G, w, s)\n  INITIALIZE-SINGLE-SOURCE(G, s)\n  S ← ∅\n  Q ← G.V                       // min-priority queue keyed by d\n  while Q ≠ ∅\n    u ← EXTRACT-MIN(Q)          // greedy choice: closest unsettled vertex\n    S ← S ∪ {u}\n    for each edge (u, v) ∈ G.Adj[u]\n      RELAX(u, v, w)            // a DECREASE-KEY on v if d[v] improves\n\n// Each vertex is extracted exactly once; each edge is relaxed exactly once."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "Dijkstra requires **w(u, v) ≥ 0 for every edge**. With a negative edge the greedy choice breaks: a vertex can be extracted and settled, then later a negative edge through a farther vertex would lower its true distance — but it is already in S and never reconsidered. The correctness proof below pinpoints the exact step that nonnegativity rescues."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Correctness of Dijkstra's algorithm",
              "statement": "Run DIJKSTRA on a directed graph G = (V, E) with source s and nonnegative weight function w. Then at the moment each vertex u is added to S (i.e., extracted from Q), d[u] = δ(s, u). Consequently d[v] = δ(s, v) for all v at termination.",
              "proof": "We prove the **loop invariant**: at the start of each iteration of the while loop, d[v] = δ(s, v) for every v ∈ S. If we show that each vertex u satisfies d[u] = δ(s, u) at the instant it is added to S, the invariant follows and termination gives the result (every vertex is eventually extracted, so S = V at the end).\n\nSuppose, for contradiction, that some vertex is extracted with an incorrect estimate. Let **u** be the *first* such vertex: the first vertex for which d[u] ≠ δ(s, u) at the moment of its EXTRACT-MIN. We derive a contradiction.\n\nFirst, u ≠ s, since d[s] = 0 = δ(s, s) when s is extracted (no negative weights, so δ(s, s) = 0). Also, u must be reachable from s: if δ(s, u) = ∞ then d[u] ≥ δ(s, u) = ∞ forces d[u] = ∞ = δ(s, u), contradicting d[u] ≠ δ(s, u). So δ(s, u) is finite and there is a shortest path p from s to u. At the moment u is extracted, p connects s ∈ S to u ∉ S (u is being extracted, so just before extraction u ∉ S). Walk along p from s and let **y** be the *first* vertex on p that is not in S, and let **x** be its predecessor on p (so x ∈ S; possibly x = s). Thus p decomposes as\n\n  s ⇝ x → y ⇝ u,    with x ∈ S, y ∉ S.\n\n**Claim: d[y] = δ(s, y) at this moment.** Since x ∈ S, x was extracted earlier than u, so by the choice of u (the *first* bad vertex) d[x] = δ(s, x) when x was extracted. When x was extracted, the algorithm relaxed all of its outgoing edges, including (x, y). By the Convergence Property — the prefix s ⇝ x → y of the shortest path p is itself a shortest path (optimal substructure), and d[x] = δ(s, x) held at that relaxation — we get d[y] = δ(s, y) afterward, and by the Upper-Bound Property it stays equal. This proves the claim.\n\n**Now the greedy + nonnegativity step.** Since y appears on a shortest path to u and lies *before* u (y ⇝ u is a nonempty or empty suffix), and all edge weights on that suffix are nonnegative, the suffix weight δ(y, u) ≥ 0, so\n\n  δ(s, y) ≤ δ(s, y) + δ(y, u) = δ(s, u).   (†)\n\nThe equality δ(s, y) + δ(y, u) = δ(s, u) holds because y is on a shortest path to u (optimal substructure: the path splits at y into two shortest pieces). The inequality uses δ(y, u) ≥ 0, which is **exactly where nonnegative weights are needed**. Combining with the claim and the Upper-Bound Property d[u] ≥ δ(s, u):\n\n  d[y] = δ(s, y) ≤ δ(s, u) ≤ d[u].   (‡)\n\nBut u was chosen by EXTRACT-MIN as the minimum-d vertex in Q, and both y and u were in Q at that moment (y ∉ S means y is still in Q). So d[u] ≤ d[y]. Chaining with (‡): d[u] ≤ d[y] ≤ δ(s, u) ≤ d[u], forcing equality throughout — in particular d[u] = δ(s, u). This contradicts the assumption that d[u] ≠ δ(s, u).\n\nHence no such first bad vertex exists: every vertex is extracted with d[u] = δ(s, u), the loop invariant holds, and at termination d[v] = δ(s, v) for all v. ∎"
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "The single line that uses nonnegativity is δ(y, u) ≥ 0 in step (†). Insert one negative edge and the suffix y ⇝ u can have negative weight, so δ(s, y) could *exceed* δ(s, u); then d[y] ≤ d[u] need not hold, EXTRACT-MIN may settle u too early, and the algorithm returns a wrong answer. This is why the gate's MCP answer is 'when all edge weights are nonnegative.'"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Running time of Dijkstra",
              "statement": "DIJKSTRA performs |V| EXTRACT-MIN operations, |V| INSERT (building Q), and at most |E| DECREASE-KEY operations (one per RELAX that improves an estimate). With a **binary min-heap**, EXTRACT-MIN and DECREASE-KEY each cost O(log V), giving total time O((V + E)·log V). With a **Fibonacci heap**, DECREASE-KEY is O(1) amortized, giving O(V log V + E).",
              "proof": "Each vertex is inserted into Q once and extracted exactly once (once extracted it joins S and is never re-inserted), so there are exactly |V| EXTRACT-MIN and |V| INSERT operations. Each edge (u, v) is relaxed exactly once — at the unique time u is extracted and its adjacency list scanned — so the loop body runs Σ_u |Adj[u]| = |E| times; each such RELAX performs at most one DECREASE-KEY (only when d[v] strictly decreases). \n\nBinary heap: INSERT, EXTRACT-MIN, DECREASE-KEY are each O(log n) on a heap of n ≤ |V| elements. Total: |V|·O(log V) for inserts + |V|·O(log V) for extracts + |E|·O(log V) for decrease-keys = O((V + E)·log V). \n\nFibonacci heap: amortized O(1) for INSERT and DECREASE-KEY and O(log V) for EXTRACT-MIN, giving O(V) + O(E) + O(V log V) = O(E + V log V). ∎\n\n*The cost is dominated by the priority-queue implementation, not by the relaxation logic.* For dense graphs (E = Θ(V²)) the Fibonacci-heap bound O(V²) matches a simple array-based queue; for sparse graphs the binary heap's O(E log V) is the practical choice."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 280,
              "caption": "A Dijkstra run from s. Edge labels are weights. Extraction order: s (d=0), t (d=3), y (d=5 via s→y? no — via t: 3+2=5), x (d=9), z. Gold nodes are settled; the bold edges form the shortest-path tree π. Note every weight is ≥ 0, the precondition Dijkstra needs.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s d=0",
                  "x": 6,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "t",
                  "label": "t d=3",
                  "x": 38,
                  "y": 16,
                  "tone": "gold"
                },
                {
                  "id": "y",
                  "label": "y d=5",
                  "x": 38,
                  "y": 84,
                  "tone": "gold"
                },
                {
                  "id": "x",
                  "label": "x d=9",
                  "x": 72,
                  "y": 16,
                  "tone": "sage"
                },
                {
                  "id": "z",
                  "label": "z d=11",
                  "x": 72,
                  "y": 84,
                  "tone": "sage"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "t",
                  "label": "3",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "s",
                  "to": "y",
                  "label": "8",
                  "directed": true
                },
                {
                  "from": "t",
                  "to": "y",
                  "label": "2",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "t",
                  "to": "x",
                  "label": "6",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "y",
                  "to": "x",
                  "label": "7",
                  "directed": true
                },
                {
                  "from": "y",
                  "to": "z",
                  "label": "6",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "x",
                  "to": "z",
                  "label": "2",
                  "directed": true
                }
              ]
            },
            {
              "type": "example",
              "heading": "Tracing the run, extraction by extraction",
              "body": "Graph as in the figure. Initialize d[s]=0, all else ∞.\n\n1. **Extract s** (d=0), settle. Relax s→t: d[t]=3, π[t]=s. Relax s→y: d[y]=8, π[y]=s.\n2. **Extract t** (d=3, the min of {t:3, y:8}), settle. Relax t→y: 3+2=5 < 8, so d[y]=5, π[y]=t (DECREASE-KEY). Relax t→x: d[x]=3+6=9, π[x]=t.\n3. **Extract y** (d=5, min of {y:5, x:9}), settle. Relax y→x: 5+7=12 > 9, no change. Relax y→z: d[z]=5+6=11, π[z]=y.\n4. **Extract x** (d=9, min of {x:9, z:11}), settle. Relax x→z: 9+2=11, not < 11, no change (tie — π[z] stays y).\n5. **Extract z** (d=11), settle. Q empty.\n\nFinal: δ(s,s)=0, δ(s,t)=3, δ(s,y)=5, δ(s,x)=9, δ(s,z)=11. Note y's estimate was *corrected* from 8 to 5 by a DECREASE-KEY before y was ever settled — the hallmark of relaxation tightening an overestimate."
            },
            {
              "type": "example",
              "heading": "The log₂ V factor, concretely",
              "body": "The binary-heap bound O((V + E)·log₂ V) carries a log₂ V factor. For **V = 16**, log₂ 16 = 4 (since 2⁴ = 16). For V = 1024, log₂ 1024 = 10. This factor is the height of the binary heap, the cost of one sift-up or sift-down during EXTRACT-MIN or DECREASE-KEY. Doubling V adds just 1 to the factor — the logarithm is why Dijkstra scales to large sparse graphs."
            },
            {
              "type": "example",
              "heading": "A negative edge breaks Dijkstra",
              "body": "Edges s→a (weight 1), s→b (weight 4), b→a (weight −3). True values: δ(s,a) = min(1, 4 + (−3)) = 1, δ(s,b) = 4.\n\nDijkstra: extract s, relax — d[a]=1, d[b]=4. Extract a (d=1, the min); **a is now settled with d[a]=1**, and a has no outgoing edges. Extract b (d=4), relax b→a: 4 + (−3) = 1, not < 1, no change. Result d[a]=1 — coincidentally correct here. But shift weights: s→a (3), s→b (4), b→a (−3): true δ(s,a) = min(3, 1) = 1. Dijkstra extracts s, sets d[a]=3, d[b]=4. Extracts **a with d[a]=3 and settles it**. Extracts b, relaxes b→a: 4 + (−3) = 1 < 3 — but a is already in S, never reconsidered, and the reported d[a]=3 ≠ 1. **Wrong.** The negative edge let a farther-but-cheaper route to a appear after a was prematurely settled — precisely the failure step (†) forbids."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Bellman–Ford relaxes all edges |V| − 1 times; Dijkstra relaxes each edge exactly once. Explain, using the correctness proof, why one relaxation per edge suffices for Dijkstra.",
                  "solution": "Dijkstra relaxes edge (u, v) at the moment u is extracted, and the correctness theorem guarantees d[u] = δ(s, u) *at that moment*. By the Convergence Property, relaxing (u, v) with d[u] already final immediately sets d[v] to its best value through u, which can never improve later (Upper-Bound). Because extraction order is by nondecreasing δ, every vertex is settled before any edge is relaxed out of it, so a single, correctly-timed relaxation per edge is enough. Bellman–Ford has no such ordering guarantee (it allows negative edges), so it must relax repeatedly to let correct values propagate one edge per pass.",
                  "hint": "The greedy extraction order means d[u] is already final when (u, v) is relaxed — Convergence then finalizes d[v] in one shot."
                },
                {
                  "prompt": "For V = 16 and a binary-heap implementation running in O((V + E)·log₂ V), what is the log₂ V factor, and how many EXTRACT-MIN operations does the run perform?",
                  "solution": "log₂ V = log₂ 16 = 4 (because 2⁴ = 16). The number of EXTRACT-MIN operations equals |V| = 16, since each vertex is extracted exactly once.",
                  "hint": "2 to what power is 16? And each vertex leaves Q exactly once."
                },
                {
                  "prompt": "State exactly which step of the correctness proof fails when a negative edge is present, and give a two-vertex-plus-source instance where Dijkstra returns a wrong d-value.",
                  "solution": "Step (†): δ(s, y) ≤ δ(s, y) + δ(y, u) = δ(s, u) relies on δ(y, u) ≥ 0, which needs nonnegative weights. With a negative suffix this inequality can reverse, so the chain (‡) d[y] ≤ δ(s,u) ≤ d[u] breaks and EXTRACT-MIN may settle u too early. Instance: s→a (3), s→b (4), b→a (−3). True δ(s,a)=1, but Dijkstra settles a with d[a]=3 before relaxing b→a, then never revisits a, reporting d[a]=3 ≠ 1.",
                  "hint": "Find the single inequality in the proof that cites nonnegativity, then build a graph where a cheap negative edge arrives after the target is settled."
                },
                {
                  "prompt": "Suppose all edge weights equal 1. Show that Dijkstra's extraction order is exactly a breadth-first-search order, and conclude Dijkstra reduces to BFS, runnable in O(V + E) without a heap.",
                  "solution": "With unit weights, δ(s, v) equals the number of edges on a shortest s-to-v path — the BFS layer of v. EXTRACT-MIN settles vertices in nondecreasing d, i.e. layer 0, then layer 1, then layer 2, …, the exact order BFS visits them. Since within a layer all keys are equal integers and increase by 1 across layers, a FIFO queue suffices in place of the priority queue: enqueue a vertex when its d is first set, dequeue in order. Each vertex enqueued/dequeued once (O(V)) and each edge relaxed once (O(E)), total O(V + E), no logarithmic factor.",
                  "hint": "Unit weights make δ(s,v) a hop count, so the priority queue's keys are just BFS layer numbers, which a plain FIFO queue already orders."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a7l2-i1",
              "front": "When is Dijkstra's algorithm correct?",
              "back": "Exactly when all edge weights are nonnegative (w(u,v) ≥ 0). Negative edges break the greedy extraction: a vertex can be settled, then a cheaper negative-edge route appears, but settled vertices are never reconsidered."
            },
            {
              "id": "a7l2-i2",
              "front": "What is the greedy choice in Dijkstra, and why is it safe?",
              "back": "EXTRACT-MIN settles the unsettled vertex u with the smallest estimate d[u]. It is safe because, with nonnegative weights, no path through a farther unsettled vertex can reach u more cheaply — so d[u] = δ(s, u) already."
            },
            {
              "id": "a7l2-i3",
              "front": "Where exactly does Dijkstra's correctness proof use nonnegativity?",
              "back": "In the step δ(y, u) ≥ 0 (the suffix of a shortest path from the boundary vertex y to u). It yields δ(s, y) ≤ δ(s, u), hence d[y] ≤ d[u], contradicting EXTRACT-MIN's choice. Negative edges invalidate this single inequality."
            },
            {
              "id": "a7l2-i4",
              "front": "Dijkstra's running time with a binary heap vs. a Fibonacci heap?",
              "back": "Binary heap: O((V + E)·log V), since EXTRACT-MIN and DECREASE-KEY are each O(log V). Fibonacci heap: O(V log V + E), since DECREASE-KEY is O(1) amortized."
            },
            {
              "id": "a7l2-i5",
              "front": "For a binary heap, what is the log₂ V factor when V = 16?",
              "back": "log₂ 16 = 4, because 2⁴ = 16. This factor is the heap height — the cost of one sift during EXTRACT-MIN or DECREASE-KEY."
            }
          ]
        },
        {
          "id": "a7l3",
          "title": "Bellman–Ford & DAG Shortest Paths",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "When edges can be negative",
              "body": "Dijkstra's greedy correctness collapses the instant an edge weight may be negative. The **Bellman–Ford algorithm** trades speed for generality: it handles arbitrary real weights, *and* it detects whether a negative-weight cycle is reachable from s (in which case some δ values are −∞ and no finite answer exists). Where Dijkstra relaxes each edge once in a clever order, Bellman–Ford relaxes *every* edge **|V| − 1 times** in any order, then makes one more pass to check for negative cycles. This brute-force repetition is exactly what frees it from needing the right order.\n\nThe special case of a **directed acyclic graph (DAG)** is the easiest of all: a single relaxation of every edge in *topological order* solves SSSP in Θ(V + E), negative weights and all, with no need for repetition or a priority queue. This lesson proves both, then gives a decision procedure for choosing among the three SSSP algorithms."
            },
            {
              "type": "code",
              "heading": "Bellman–Ford",
              "lang": "text",
              "code": "BELLMAN-FORD(G, w, s)\n  INITIALIZE-SINGLE-SOURCE(G, s)\n  for i = 1 to |V| − 1               // |V| − 1 passes\n    for each edge (u, v) ∈ G.E\n      RELAX(u, v, w)\n  for each edge (u, v) ∈ G.E         // negative-cycle detection pass\n    if d[v] > d[u] + w(u, v)\n      return FALSE                   // a reachable negative-weight cycle exists\n  return TRUE                        // d[v] = δ(s, v) for all v"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Correctness of Bellman–Ford (no negative cycle)",
              "statement": "Run BELLMAN-FORD on a directed graph G = (V, E) with source s and weight function w. If G contains no negative-weight cycle reachable from s, then after the |V| − 1 relaxation passes, d[v] = δ(s, v) for every vertex v, and the algorithm returns TRUE.",
              "proof": "Fix any vertex v with δ(s, v) finite (if δ(s, v) = ∞, then v is unreachable and d[v] stays ∞ = δ(s, v) throughout, since no relaxation can lower an ∞ estimate without a finite predecessor path). Because no reachable negative cycle exists, some shortest path from s to v is **simple**, hence has at most |V| − 1 edges. Write it as\n\n  p = ⟨v₀ = s, v₁, …, v_k = v⟩,   with k ≤ |V| − 1.\n\n**Key claim:** after the i-th pass, d[v_i] = δ(s, v_i). Prove by induction on i. Base i = 0: d[v₀] = d[s] = 0 = δ(s, s) after initialization (the loop never raises it). Inductive step: assume after pass i − 1 we have d[v_{i−1}] = δ(s, v_{i−1}). Pass i relaxes *every* edge of G, in particular the edge (v_{i−1}, v_i). At the moment it is relaxed, d[v_{i−1}] = δ(s, v_{i−1}) (it was correct at the end of pass i−1 and Upper-Bound keeps it so). The prefix s ⇝ v_i of p is a shortest path (optimal substructure), so s ⇝ v_{i−1} → v_i is shortest; by the Convergence Property the relaxation sets d[v_i] = δ(s, v_i). This completes the induction.\n\nSince k ≤ |V| − 1, by the end of pass k ≤ |V| − 1 we have d[v_k] = d[v] = δ(s, v). As v was arbitrary, **all** estimates are correct after |V| − 1 passes.\n\n**The check pass returns TRUE.** For every edge (u, v), d[v] = δ(s, v) ≤ δ(s, u) + w(u, v) = d[u] + w(u, v) by the triangle inequality (with the now-correct estimates). So no edge satisfies d[v] > d[u] + w(u, v), the FALSE branch is never taken, and BELLMAN-FORD returns TRUE. ∎\n\n*Why exactly |V| − 1 passes?* A simple shortest path has at most |V| vertices, hence at most |V| − 1 edges. Pass i guarantees correctness for vertices whose shortest path uses ≤ i edges. So |V| − 1 passes cover the longest simple path — one fewer would leave the farthest vertex potentially unconverged."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Bellman–Ford detects negative cycles",
              "statement": "If G contains a negative-weight cycle reachable from s, then the check pass of BELLMAN-FORD returns FALSE.",
              "proof": "Let c = ⟨v₀, v₁, …, v_k = v₀⟩ be a reachable negative-weight cycle, so Σ_{i=1}^{k} w(v_{i−1}, v_i) < 0. Suppose, for contradiction, that the check pass returns TRUE; then d[v_i] ≤ d[v_{i−1}] + w(v_{i−1}, v_i) for every edge of c (the FALSE test never fired). Summing this inequality around the entire cycle:\n\n  Σ_{i=1}^{k} d[v_i] ≤ Σ_{i=1}^{k} d[v_{i−1}] + Σ_{i=1}^{k} w(v_{i−1}, v_i).\n\nBecause c is a cycle, {v₀, …, v_{k−1}} = {v₁, …, v_k} as multisets, so Σ d[v_i] = Σ d[v_{i−1}] (each vertex of the cycle contributes its d once on each side). These finite sums (every d[v_i] is finite, as the cycle is reachable) cancel, leaving\n\n  0 ≤ Σ_{i=1}^{k} w(v_{i−1}, v_i) < 0,\n\na contradiction. Hence the check pass must return FALSE. ∎\n\n*Subtlety:* the cancellation requires the d-values to be finite, which holds because the cycle is reachable from s so every vertex on it received a finite estimate during the passes."
            },
            {
              "type": "example",
              "heading": "Counting the passes: V = 10",
              "body": "Bellman–Ford runs |V| − 1 relaxation passes to guarantee shortest paths in the absence of a negative cycle. For **V = 10**, that is 10 − 1 = **9 passes** (followed by one additional check pass for negative-cycle detection, which is not counted among the |V| − 1 guarantee passes). Each pass relaxes all |E| edges, so total relaxation work is (|V| − 1)·|E| = O(VE)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Running time of Bellman–Ford",
              "statement": "BELLMAN-FORD runs in O(V·E) time.",
              "proof": "INITIALIZE-SINGLE-SOURCE is Θ(V). The main loop runs |V| − 1 passes, each relaxing all |E| edges in Θ(E), for Θ((V−1)·E) = O(VE). The check pass is one more Θ(E) scan. Total: Θ(V) + O(VE) + Θ(E) = O(VE). ∎\n\nFor a dense graph E = Θ(V²) this is O(V³); it is the price of handling negative edges by repetition rather than by Dijkstra's ordering."
            },
            {
              "type": "code",
              "heading": "DAG shortest paths",
              "lang": "text",
              "code": "DAG-SHORTEST-PATHS(G, w, s)\n  topologically sort the vertices of G        // Θ(V + E)\n  INITIALIZE-SINGLE-SOURCE(G, s)\n  for each vertex u, taken in topological order\n    for each edge (u, v) ∈ G.Adj[u]\n      RELAX(u, v, w)\n\n// One pass, edges relaxed in topological order. Negative weights are fine.\n// No priority queue, no repetition. Total: Θ(V + E)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Correctness and running time of DAG shortest paths",
              "statement": "If G is a directed acyclic graph, DAG-SHORTEST-PATHS computes d[v] = δ(s, v) for all v in Θ(V + E) time.",
              "proof": "**Correctness.** A topological order ≺ lists the vertices so that every edge (u, v) has u ≺ v. Consider any vertex v with δ(s, v) finite and a shortest path p = ⟨v₀ = s, …, v_k = v⟩. Since p follows edges, its vertices appear in increasing topological order: v₀ ≺ v₁ ≺ … ≺ v_k. The algorithm processes vertices in topological order and, when it processes v_{i−1}, relaxes edge (v_{i−1}, v_i). Therefore the edges of p are relaxed **in path order** (v₀,v₁), (v₁,v₂), …, (v_{k−1},v_k), because v_{i−1} is processed before v_i. By the Path-Relaxation Property, d[v_k] = δ(s, v) after these relaxations. (A DAG has no cycle, hence no negative cycle, so every reachable δ is finite and this applies to all reachable v; unreachable v keep d = ∞ = δ(s, v).)\n\n**Running time.** Topological sort is Θ(V + E). INITIALIZE-SINGLE-SOURCE is Θ(V). The double loop relaxes each edge exactly once and touches each vertex once: Σ_u (1 + |Adj[u]|) = Θ(V + E). Total Θ(V + E). ∎\n\nThis is asymptotically optimal — you must at least read every vertex and edge — and it tolerates negative weights for free, because acyclicity already rules out the negative-cycle pathology."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "DAGs are the easy case because a topological order *is* a valid relaxation order: it relaxes the edges of every shortest path in path order in a single pass. There is no need for Dijkstra's greedy extraction or Bellman–Ford's |V|−1 repetitions — the structure of the graph hands you the order for free."
            },
            {
              "type": "decision",
              "heading": "Picking a shortest-path algorithm",
              "rows": [
                [
                  "Graph is a DAG (any weights)",
                  "DAG-SHORTEST-PATHS — Θ(V + E), one topological pass"
                ],
                [
                  "All edge weights ≥ 0",
                  "Dijkstra — O((V+E) log V) binary heap, O(E + V log V) Fibonacci heap"
                ],
                [
                  "Some negative edges, no negative cycle",
                  "Bellman–Ford — O(VE)"
                ],
                [
                  "Negative cycle may be reachable",
                  "Bellman–Ford — returns FALSE to report it"
                ],
                [
                  "Unweighted (all weights = 1)",
                  "BFS — Θ(V + E), no priority queue"
                ],
                [
                  "All-pairs, dense, possibly negative",
                  "Floyd–Warshall — Θ(V³) (out of scope here)"
                ]
              ]
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 240,
              "caption": "A DAG in topological order s ≺ a ≺ b ≺ c ≺ d (every edge points rightward). A negative edge a→c (weight −2) is harmless. One left-to-right relaxation pass yields δ(s,a)=2, δ(s,b)=3, δ(s,c)=0, δ(s,d)=4 — bold edges form the tree.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s 0",
                  "x": 5,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "a",
                  "label": "a 2",
                  "x": 28,
                  "y": 20,
                  "tone": "sage"
                },
                {
                  "id": "b",
                  "label": "b 3",
                  "x": 50,
                  "y": 75,
                  "tone": "sage"
                },
                {
                  "id": "c",
                  "label": "c 0",
                  "x": 72,
                  "y": 25,
                  "tone": "sage"
                },
                {
                  "id": "d",
                  "label": "d 4",
                  "x": 95,
                  "y": 60,
                  "tone": "sage"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "a",
                  "label": "2",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "s",
                  "to": "b",
                  "label": "3",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "a",
                  "to": "c",
                  "label": "−2",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "b",
                  "to": "c",
                  "label": "4",
                  "directed": true
                },
                {
                  "from": "c",
                  "to": "d",
                  "label": "4",
                  "directed": true,
                  "bold": true,
                  "tone": "gold"
                },
                {
                  "from": "b",
                  "to": "d",
                  "label": "5",
                  "directed": true
                }
              ]
            },
            {
              "type": "example",
              "heading": "Bellman–Ford on a graph with a negative edge",
              "body": "Vertices s, t, x, y, z; edges s→t (6), s→y (7), t→x (5), t→y (8), t→z (−4), x→t (−2), y→x (−3), y→z (9), z→x (7), z→s (2). (CLRS Fig. 24.4.) Process edges in a fixed order each pass.\n\nAfter pass 1: d[t]=6, d[y]=7, d[z]=2 (via t→z: 6−4), d[x]=4 (via y→x: 7−3), and so on. After at most |V|−1 = 4 passes the estimates stabilize to δ(s,t)=2, δ(s,x)=4, δ(s,y)=7, δ(s,z)=−2. The check pass finds no improving edge → returns TRUE. The negative edges t→z and x→t and y→z's neighbors never form a negative cycle here, so a finite answer exists and Bellman–Ford finds it — something Dijkstra cannot guarantee on this instance."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Name the single-source algorithm that handles negative edge weights (but not negative cycles) by relaxing all edges repeatedly, and state how many relaxation passes it makes for V = 10.",
                  "solution": "The **Bellman–Ford** algorithm. It relaxes all |E| edges |V| − 1 times. For V = 10 that is 10 − 1 = 9 passes (plus one extra check pass for negative-cycle detection, not counted in the guarantee).",
                  "hint": "It is the negative-edge SSSP algorithm; its pass count is |V| − 1."
                },
                {
                  "prompt": "Prove that |V| − 1 passes are necessary in the worst case: exhibit a family of graphs where, for a particular edge-relaxation order, the farthest vertex's estimate is not correct until pass |V| − 1.",
                  "solution": "Take a directed path s = v₀ → v₁ → … → v_{n−1} on n = |V| vertices, all weights 1, and fix the per-pass relaxation order to scan edges *backward*: (v_{n−2}, v_{n−1}), …, (v₀, v₁). In pass 1, only (v₀, v₁) does useful work (d[v₁]=1); the later-listed edges relax with stale ∞ predecessors. In general, pass i first makes d[v_i] correct (the new value propagates exactly one edge per pass under this adversarial order). So d[v_{n−1}] = δ(s, v_{n−1}) = n − 1 only becomes correct on pass n − 1 = |V| − 1. With one fewer pass the last vertex would still be ∞. This shows |V| − 1 is tight.",
                  "hint": "A long path plus a relaxation order that processes edges in reverse propagates correctness one edge per pass."
                },
                {
                  "prompt": "Explain why DAG-SHORTEST-PATHS needs only one pass while Bellman–Ford needs |V| − 1, even though both can handle negative edges.",
                  "solution": "Bellman–Ford works in arbitrary order, so it cannot guarantee that the edges of a shortest path are relaxed in path order within a single pass — it brute-forces |V| − 1 passes so that after pass i, vertices reachable by ≤ i edges are correct (Path-Relaxation). A topological order on a DAG *guarantees* that for every edge (u, v), u is processed before v; thus the edges of any shortest path are relaxed in path order in one sweep, and the Path-Relaxation Property delivers correctness immediately. The acyclic structure supplies the ordering that Bellman–Ford must compensate for with repetition.",
                  "hint": "Both rely on the Path-Relaxation Property; the difference is whether a single pass can already relax shortest-path edges in path order."
                },
                {
                  "prompt": "Show how to use a topological order plus DAG-SHORTEST-PATHS to find a *longest* path in a weighted DAG, and state the running time.",
                  "solution": "Negate every edge weight: w′(u, v) = −w(u, v). A longest path under w is a shortest path under w′ (maximizing Σ w equals minimizing Σ(−w)). A DAG stays acyclic under negation and has no cycles, so DAG-SHORTEST-PATHS runs correctly on (G, w′) even though w′ may be negative. Run it, then negate the resulting distances: longest-path weight to v = −d′[v]. Running time is Θ(V + E), since negation is Θ(E) and the DAG algorithm is Θ(V + E). (Note: longest path in a *general* graph is NP-hard; acyclicity is what makes this work.)",
                  "hint": "Negate weights to turn 'longest' into 'shortest'; the DAG algorithm tolerates the resulting negative weights."
                },
                {
                  "prompt": "After Bellman–Ford's |V| − 1 passes return TRUE, prove that no further pass can change any d[v].",
                  "solution": "TRUE means the check pass found d[v] ≤ d[u] + w(u, v) for every edge (u, v). RELAX(u, v, w) changes d[v] only when d[v] > d[u] + w(u, v); but that condition is false for every edge by hypothesis. Hence any subsequent relaxation of any edge leaves d unchanged — the estimates have reached a fixed point, which (by the correctness theorem) equals δ(s, ·).",
                  "hint": "The TRUE condition is exactly the negation of every RELAX's improvement test."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a7l3-i1",
              "front": "How many relaxation passes does Bellman–Ford make, and why that number?",
              "back": "|V| − 1 passes. A simple shortest path has at most |V| − 1 edges; after pass i, every vertex whose shortest path uses ≤ i edges is correct (Path-Relaxation), so |V| − 1 passes cover the longest simple path. For V = 10 that is 9 passes."
            },
            {
              "id": "a7l3-i2",
              "front": "Which SSSP algorithm handles negative edges (no negative cycle), and what is its running time?",
              "back": "Bellman–Ford, running in O(VE): |V| − 1 passes each relaxing all |E| edges, plus a Θ(E) negative-cycle check pass."
            },
            {
              "id": "a7l3-i3",
              "front": "How does Bellman–Ford detect a reachable negative-weight cycle?",
              "back": "After |V| − 1 passes, it scans all edges once more; if any edge still satisfies d[v] > d[u] + w(u, v), a reachable negative cycle exists and it returns FALSE. Proof: summing the relaxed inequalities around a negative cycle gives 0 ≤ (negative sum), a contradiction."
            },
            {
              "id": "a7l3-i4",
              "front": "Why are DAGs the easy case for shortest paths?",
              "back": "A topological order relaxes the edges of every shortest path in path order in a single Θ(V + E) pass (Path-Relaxation Property). No priority queue, no repetition, and negative edge weights are fine because a DAG has no cycles."
            },
            {
              "id": "a7l3-i5",
              "front": "How do you choose between Dijkstra, Bellman–Ford, and DAG-SHORTEST-PATHS?",
              "back": "DAG → DAG-SHORTEST-PATHS, Θ(V+E). All weights ≥ 0 → Dijkstra, O((V+E) log V). Negative edges, no negative cycle → Bellman–Ford, O(VE). Possible negative cycle → Bellman–Ford to detect it."
            }
          ]
        }
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
          "id": "a8l1",
          "title": "The Greedy Method & Exchange Arguments",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "What a greedy algorithm is",
              "body": "A **greedy algorithm** builds a solution through a sequence of choices, where at each step it commits irrevocably to the option that looks best *locally* — by some fixed greedy rule — and never reconsiders. There is no backtracking and no table of subproblem answers; the algorithm marches forward, making one myopic decision after another.\n\nThis is seductive because it is fast and simple. It is also *wrong* far more often than it looks. Making locally optimal choices does not, in general, produce a globally optimal solution — the 0/1 knapsack problem, set cover, and graph coloring are all places where greed fails. So the entire intellectual content of greedy algorithms lives not in the code (which is trivial) but in the **proof** that the local rule is globally safe. This unit is about those proofs."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Greedy-choice property",
              "statement": "A problem has the **greedy-choice property** (for a particular greedy rule) if there exists some globally optimal solution that makes the same first choice the greedy rule makes. Equivalently: the greedy first choice is *safe* — committing to it does not foreclose attaining an optimum."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Optimal substructure",
              "statement": "A problem has **optimal substructure** if an optimal solution to the problem contains within it optimal solutions to subproblems. For greedy algorithms the relevant form is: after the greedy first choice is fixed, what remains is a *smaller instance of the same problem*, and an optimal solution to the whole is the greedy choice combined with an optimal solution to that residual instance."
            },
            {
              "type": "text",
              "heading": "The two-part recipe",
              "body": "Together these two properties license greedy. **Greedy-choice** says the first greedy decision is consistent with *some* optimum; **optimal substructure** says that, having made it, solving the rest optimally completes an optimum. Iterating the argument — the residual instance again has the greedy-choice property, and so on — shows by induction that the fully greedy solution is optimal.\n\nProving the greedy-choice property is where the work is, and the standard tool for it is the **exchange argument**."
            },
            {
              "type": "text",
              "heading": "The exchange argument",
              "body": "An **exchange argument** proves the greedy-choice property by *modifying an optimal solution into the greedy one without making it worse*. Concretely: take any optimal solution **O**. If **O** already agrees with the greedy choice, done. Otherwise, **O** uses some other element where greedy used g. Exchange that element for g — and show the result is still feasible and still at least as good (no larger cost / no smaller value). After the swap, the modified solution is optimal *and* agrees with greedy on this choice. Repeating the exchange across all positions transforms **O** into the greedy solution while preserving optimality, so the greedy solution is optimal.\n\nThe two recurring patterns are: (1) **swap the greedy element in** (used for scheduling, Huffman), and (2) **swap a heavier/worse element out of an induced structure** (used for the MST cut property). Master both."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Interval scheduling (activity selection)",
              "statement": "Given a set of n intervals (activities), interval i having start time s_i and finish time f_i, two intervals i, j are **compatible** if they do not overlap, i.e. f_i ≤ s_j or f_j ≤ s_i. The **maximum interval scheduling** problem asks for a largest subset of pairwise-compatible intervals. (This is the *unweighted* problem — we maximize the *count*, not a sum of values.)"
            },
            {
              "type": "code",
              "heading": "Earliest-finish-time greedy",
              "lang": "text",
              "code": "GREEDY-ACTIVITY-SELECT(intervals):\n  sort intervals by finish time so f_1 ≤ f_2 ≤ ... ≤ f_n\n  A ← { interval 1 }          // always take the earliest finisher\n  last ← f_1                  // finish time of the most recent pick\n  for i = 2 to n:\n      if s_i ≥ last:          // compatible with everything chosen\n          A ← A ∪ { interval i }\n          last ← f_i\n  return A\n// Sorting dominates: Θ(n log n); the scan is Θ(n)."
            },
            {
              "type": "text",
              "heading": "The greedy rule, and why this one",
              "body": "The rule is: **repeatedly pick the compatible interval with the earliest finish time.** The intuition is that finishing as early as possible *leaves the most room* for the intervals that follow — it is the choice that consumes the least of the timeline. Crucially, the rule is *earliest finish*, not earliest start (a long early-starting interval can block many others) and not shortest duration (a short interval straddling two others' boundary can block both). Only the earliest-finish rule is provably optimal, and we prove it now."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Greedy stays ahead",
              "statement": "Let g_1, g_2, …, g_k be the intervals selected by the earliest-finish-time greedy algorithm, indexed in selection order (hence f(g_1) ≤ f(g_2) ≤ … ). Let o_1, o_2, …, o_m be any set of mutually compatible intervals, indexed in increasing finish-time order. Then for every i with 1 ≤ i ≤ k we have f(g_i) ≤ f(o_i).",
              "proof": "By induction on i.\n\n**Base case (i = 1).** Greedy's first choice g_1 is, among *all* intervals, the one with the globally earliest finish time. Since o_1 is some particular interval, f(g_1) ≤ f(o_1).\n\n**Inductive step.** Assume f(g_{i−1}) ≤ f(o_{i−1}) for some i with 2 ≤ i ≤ k. Because o_1,…,o_m are mutually compatible and indexed by finish time, o_i starts no earlier than o_{i−1} finishes: s(o_i) ≥ f(o_{i−1}). Combining with the hypothesis, s(o_i) ≥ f(o_{i−1}) ≥ f(g_{i−1}). Thus o_i is compatible with all of greedy's first i−1 picks (it starts at or after the last one, g_{i−1}, finishes), so o_i was an *available* candidate at the moment greedy selected g_i. Greedy selects the available interval with the earliest finish time, so f(g_i) ≤ f(o_i). This completes the induction. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Optimality of earliest-finish-time greedy",
              "statement": "The earliest-finish-time greedy algorithm returns a set of mutually compatible intervals of maximum possible size.",
              "proof": "First, the returned set A = {g_1,…,g_k} is feasible: the algorithm adds interval i only when s_i ≥ last = f of the previously added interval, and finish times are nondecreasing, so every pair in A is compatible.\n\nFor maximality, let o_1,…,o_m be an *optimal* set (so m is the maximum size), ordered by finish time, and suppose for contradiction that m > k. Apply the Greedy-Stays-Ahead lemma at i = k: f(g_k) ≤ f(o_k). Since m > k, the interval o_{k+1} exists, and by compatibility within the optimal set s(o_{k+1}) ≥ f(o_k) ≥ f(g_k). Hence o_{k+1} starts at or after g_k finishes, so it is compatible with every interval greedy chose and was available when greedy halted. But greedy halts only when *no* compatible interval remains — contradiction. Therefore m ≤ k. Since k ≤ m as well (A is one feasible set and m is the maximum), m = k, and greedy is optimal. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: CLRS activity set",
              "body": "Take the canonical 11-activity instance, given as (s_i, f_i) already sorted by finish:\n(1,4), (3,5), (0,6), (5,7), (3,9), (5,9), (6,10), (8,11), (8,12), (2,14), (12,16).\n\nGreedy trace: pick (1,4); last=4. Next compatible (start ≥ 4): (5,7) — pick, last=7. Next (start ≥ 7): (8,11) — pick, last=11. Next (start ≥ 11): (12,16) — pick, last=16. End.\n\nResult: **{(1,4), (5,7), (8,11), (12,16)}**, size 4. No set of 5 mutually compatible intervals exists here, so this is optimal. Notice greedy skipped (3,5) and (0,6) even though (0,6) starts first — earliest-*start* would have taken (0,6) and done worse."
            },
            {
              "type": "example",
              "heading": "Why 'earliest finish' beats 'shortest duration'",
              "body": "Consider three intervals: A = (1, 5), B = (4, 6), C = (5, 9). The shortest interval is B (length 2), but B overlaps both A and C. **Shortest-first** would pick B, then find A and C both incompatible with it — total 1 interval. **Earliest-finish** picks A (finishes at 5), then C (starts at 5) — total 2 intervals, the optimum. This minimal counterexample shows shortest-duration is not safe, and isolates exactly why earliest-finish is: it never blocks more of the future than necessary."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Greedy guesses are cheap; greedy proofs are not.** A plausible local rule (shortest-first, fewest-conflicts-first, earliest-start) can fail on a three-element instance. Never deploy a greedy algorithm without an exchange or stays-ahead argument — and when you cannot find one, that is your signal to reach for dynamic programming instead."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Give a set of intervals on which the **fewest-conflicts-first** rule (repeatedly pick the interval overlapping the fewest others) fails to find a maximum compatible set.",
                  "hint": "Build a 'spine' of disjoint optimal intervals, pile several mutually-overlapping stubs on each to inflate its conflict count, and add ONE connector that overlaps exactly two adjacent spine intervals — so the connector becomes the unique fewest-conflict interval yet taking it costs two of the optimum.",
                  "solution": "Here is a verified counterexample. The **optimum** is the four disjoint 'spine' intervals\n  O₁=(0,2), O₂=(3,5), O₃=(6,8), O₄=(9,11)   — a compatible set of size **4**.\n\nNow inflate the conflict counts. Over the O₁–O₂ region place three mutually-overlapping stubs\n  L₁=(1.5,3.5), L₂=(1.6,3.6), L₃=(1.7,3.7),\neach of which overlaps O₁, O₂, and the other two stubs. Symmetrically, over the O₃–O₄ region place\n  R₁=(7.5,9.5), R₂=(7.6,9.6), R₃=(7.7,9.7).\nFinally add the single **connector**\n  M=(4.5,6.5),\nwhich overlaps exactly O₂ and O₃ (it sits in the gap (5,6) between them but extends into each) and nothing else.\n\n**Conflict counts (each verified by direct overlap checks):**\n• M: overlaps {O₂, O₃} → **2 conflicts**.\n• O₁: {L₁,L₂,L₃} → 3.  O₄: {R₁,R₂,R₃} → 3.\n• O₂: {M,L₁,L₂,L₃} → 4.  O₃: {M,R₁,R₂,R₃} → 4.\n• each Lᵢ: {O₁,O₂, other two L's} → 4.  each Rᵢ: {O₃,O₄, other two R's} → 4.\n\nSo **M is the unique global minimum** (2 conflicts); every other interval has 3 or 4. Fewest-conflicts-first therefore selects M *first*. Committing to M removes O₂ and O₃ (its only conflicts) from further consideration. Whatever greedy does next, the optimum's two middle intervals are already lost: among the survivors {O₁,O₄,L₁,L₂,L₃,R₁,R₂,R₃}, a largest compatible set that also keeps M has size 2 (e.g. O₁ and R₁ are both disjoint from M and from each other), so greedy ends with at most **3** intervals — for instance {M, O₁, R₁}.\n\nThus fewest-conflicts-first returns 3 while the true optimum {O₁,O₂,O₃,O₄} has size 4. The blocker M genuinely has the *strictly fewest* conflicts, yet selecting it destroys two optimal intervals with no compensating gain. The takeaway: only earliest-finish is provably safe; minimizing local conflicts is not."
                },
                {
                  "prompt": "Fill in the blank and justify in one sentence: to select the maximum number of compatible intervals, greedy repeatedly picks the interval with the earliest ____ time.",
                  "hint": "It is the quantity that bounds how much of the timeline you consume.",
                  "solution": "**finish** (equivalently end/completion) time. Justification: by the Greedy-Stays-Ahead lemma, choosing the earliest finisher guarantees f(g_i) ≤ f(o_i) for every i against any optimal set, so greedy never runs out of room before an optimal solution does."
                },
                {
                  "prompt": "Prove that after greedy selects its first interval g_1 (the earliest finisher), the subproblem 'schedule the intervals whose start ≥ f(g_1)' has an optimal solution that, together with g_1, is optimal for the whole — i.e. exhibit the optimal-substructure step explicitly.",
                  "hint": "Take an optimal whole-solution containing g_1 and delete g_1.",
                  "solution": "By the greedy-choice property (which the Stays-Ahead theorem establishes), some optimal solution O of the whole instance contains g_1. Let O' = O \\ {g_1}. Every interval in O' is compatible with g_1, so each starts at or after f(g_1); thus O' is a feasible solution to the residual instance R = {intervals with start ≥ f(g_1)}. Moreover O' is *optimal* for R: if R had a larger compatible set O'', then O'' ∪ {g_1} would be a compatible set for the whole larger than O, contradicting O's optimality. Hence an optimal solution to the whole is g_1 plus an optimal solution to R — the optimal-substructure step — and induction on instance size finishes the correctness proof."
                },
                {
                  "prompt": "An exchange-argument warm-up: you are given an optimal compatible set O = o_1,…,o_m (by finish time) that does NOT contain the globally earliest finisher x. Show O can be modified to contain x without shrinking it.",
                  "hint": "x finishes no later than o_1, and nothing in O finishes before o_1.",
                  "solution": "Since x has the globally earliest finish time, f(x) ≤ f(o_1). Form O* = (O \\ {o_1}) ∪ {x}. We must check O* is compatible: the only interval of O that could conflict with x is one that starts before f(x); but every o_i with i ≥ 2 satisfies s(o_i) ≥ f(o_1) ≥ f(x), so none conflicts with x. Thus O* is a compatible set with |O*| = |O| = m, still optimal, and now contains x. This is the exchange argument proving the greedy-choice property directly."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a8l1-i1",
              "front": "Two properties a problem must have for greedy to be provably optimal?",
              "back": "The greedy-choice property (the greedy first choice extends to some optimum) and optimal substructure (an optimum = greedy choice + optimum of the residual subproblem)."
            },
            {
              "id": "a8l1-i2",
              "front": "What is an exchange argument?",
              "back": "A proof that transforms any optimal solution into the greedy one — one swap at a time, each preserving feasibility and not worsening cost/value — thereby showing greedy is optimal."
            },
            {
              "id": "a8l1-i3",
              "front": "Greedy rule for maximum (unweighted) interval scheduling?",
              "back": "Repeatedly pick the compatible interval with the earliest FINISH time."
            },
            {
              "id": "a8l1-i4",
              "front": "State the 'greedy stays ahead' lemma for interval scheduling.",
              "back": "For greedy picks g_1..g_k and any compatible set o_1..o_m (both by finish time), f(g_i) ≤ f(o_i) for all i ≤ k."
            },
            {
              "id": "a8l1-i5",
              "front": "Why is earliest-FINISH safe but earliest-START and shortest-duration are not?",
              "back": "Earliest finish consumes the least of the timeline, leaving the most room; a long early-starting or a straddling short interval can block more future intervals (3-element counterexamples exist)."
            },
            {
              "id": "a8l1-i6",
              "front": "Running time of earliest-finish-time activity selection?",
              "back": "Θ(n log n) dominated by the sort; the greedy scan is Θ(n)."
            }
          ]
        },
        {
          "id": "a8l2",
          "title": "Minimum Spanning Trees & the Cut Property",
          "estMinutes": 32,
          "content": [
            {
              "type": "text",
              "heading": "The problem",
              "body": "Let G = (V, E) be a connected, undirected graph with a weight w(u,v) on each edge. A **spanning tree** is an acyclic, connected subgraph touching every vertex; a **minimum spanning tree (MST)** is a spanning tree T minimizing the total weight w(T) = Σ_{(u,v)∈T} w(u,v). MSTs model the cheapest way to connect a network (wiring, roads, clustering), and they are the showcase application of the greedy method on graphs.\n\nRemarkably, two very different-looking algorithms — Kruskal's and Prim's — are both correct, and both are *the same greedy principle* in disguise: the **cut property**. We develop that property and prove it, since the entire correctness of MST algorithms reduces to it."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "A spanning tree of V vertices has exactly V − 1 edges",
              "statement": "Any spanning tree of a connected graph on |V| vertices has exactly |V| − 1 edges. (So an MST of a graph with V = 20 vertices has 19 edges.)",
              "proof": "Induction on the number of vertices n = |V|. **Base case** n = 1: the tree is a single vertex with 0 = 1 − 1 edges. **Inductive step:** a tree on n ≥ 2 vertices is connected and acyclic, so it has at least one leaf ℓ (a vertex of degree 1) — otherwise every vertex has degree ≥ 2 and a finite graph with minimum degree 2 contains a cycle, contradicting acyclicity. Remove ℓ and its single incident edge; the result is still connected and acyclic, hence a tree on n − 1 vertices, which by the inductive hypothesis has (n − 1) − 1 = n − 2 edges. Adding back ℓ's one edge gives n − 1 edges. ∎"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Cut, crossing edge, respecting",
              "statement": "A **cut** (S, V∖S) is a partition of the vertices into two nonempty parts. An edge (u,v) **crosses** the cut if exactly one of u, v lies in S. A set of edges A **respects** the cut if no edge of A crosses it. An edge crossing the cut is **light** (for that cut) if it has the minimum weight among all crossing edges."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The cut property",
              "statement": "Let G = (V, E) be a connected weighted graph with **distinct** edge weights, and let (S, V∖S) be any cut. Then the unique minimum-weight edge e crossing the cut belongs to **every** minimum spanning tree of G.",
              "proof": "Let e = (u, v) be the unique lightest edge crossing the cut, with u ∈ S and v ∈ V∖S, and suppose for contradiction that some MST T does **not** contain e.\n\nSince T is a spanning tree it is connected, so it contains a path P from u to v. As u ∈ S and v ∈ V∖S, the path P must cross the cut at least once; let e' = (x, y) be an edge of P with x ∈ S and y ∈ V∖S. Then e' crosses the cut and e' ≠ e (because e ∉ T but e' ∈ T ⊆ P).\n\nBecause weights are distinct and e is the *unique* lightest crossing edge, w(e) < w(e').\n\nNow consider T' = (T ∖ {e'}) ∪ {e}. Adding e to T creates exactly one cycle, namely e together with the path P; the edge e' lies on that cycle (it is on P). Deleting a cycle edge from a connected graph leaves it connected, so T' is connected; and T' has |V| − 1 edges (we removed one and added one), so by the edge-count proposition T' is a spanning tree. Its weight is\n  w(T') = w(T) − w(e') + w(e) < w(T),\nsince w(e) < w(e'). This contradicts T being a minimum spanning tree. Therefore every MST contains e. ∎"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "A cut (S = {a,b}, V∖S = {c,d}). Crossing edges are e=(b,c) weight 1 (light, gold) and e'=(a,d) weight 4. Adding e to a tree that used e' creates a cycle through both; swapping e for e' strictly lowers weight.",
              "nodes": [
                {
                  "id": "a",
                  "label": "a (S)",
                  "x": 20,
                  "y": 25,
                  "tone": "sage"
                },
                {
                  "id": "b",
                  "label": "b (S)",
                  "x": 20,
                  "y": 75,
                  "tone": "sage"
                },
                {
                  "id": "c",
                  "label": "c",
                  "x": 80,
                  "y": 75
                },
                {
                  "id": "d",
                  "label": "d",
                  "x": 80,
                  "y": 25
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b",
                  "label": "3"
                },
                {
                  "from": "b",
                  "to": "c",
                  "label": "1 (e, light)",
                  "tone": "gold",
                  "bold": true
                },
                {
                  "from": "a",
                  "to": "d",
                  "label": "4 (e')",
                  "tone": "rust"
                },
                {
                  "from": "c",
                  "to": "d",
                  "label": "2"
                }
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why distinct weights?** With distinct weights the lightest crossing edge is unique and the MST itself is unique, giving the clean 'belongs to *every* MST' statement. If weights can tie, the property weakens to: *some* lightest crossing edge belongs to *some* MST. A standard trick restores uniqueness — break ties by a fixed total order on edges (e.g. by endpoint indices); this makes the comparisons strict without changing which trees are minimum under the original weights."
            },
            {
              "type": "text",
              "heading": "Kruskal's algorithm",
              "body": "**Kruskal** processes edges in nondecreasing weight order, adding an edge whenever it does not create a cycle, until V − 1 edges have been added. Each added edge e is the lightest edge crossing the cut (S, V∖S) where S is the component containing one endpoint and V∖S is everything else: any earlier-considered crossing edge would have been lighter and already merged the components, so e is light for that cut. By the cut property, every edge Kruskal adds is in the MST — it grows a *forest* of tree fragments and merges them. Cycle-testing uses a **union-find** (disjoint-set) structure: FIND the two endpoints' representatives, and if they differ, UNION them and keep the edge."
            },
            {
              "type": "code",
              "heading": "Kruskal",
              "lang": "text",
              "code": "KRUSKAL(G, w):\n  A ← ∅\n  for each v in V: MAKE-SET(v)\n  sort E by nondecreasing weight w        // Θ(E log E) — the bottleneck\n  for each edge (u,v) in sorted order:\n      if FIND(u) ≠ FIND(v):               // adding it makes no cycle\n          A ← A ∪ { (u,v) }\n          UNION(u, v)\n  return A\n// Total: O(E log E) sort + O(E·α(V)) union-find ⇒ O(E log E) = O(E log V)."
            },
            {
              "type": "text",
              "heading": "Prim's algorithm",
              "body": "**Prim** grows a *single* tree from an arbitrary root r. Maintain the cut (S, V∖S) where S is the set of vertices already in the tree. At each step add the lightest edge crossing this cut — directly the cut property — which extends the tree by one vertex. Efficiency comes from a **min-priority queue** keyed on key[v] = the weight of the lightest edge connecting v to the current tree; EXTRACT-MIN pulls the next vertex, and relaxing its incident edges performs DECREASE-KEY. With a binary heap this is O((V + E)·log V); a Fibonacci heap improves it to O(E + V·log V)."
            },
            {
              "type": "decision",
              "heading": "Kruskal vs. Prim",
              "rows": [
                [
                  "Kruskal",
                  "Prim"
                ],
                [
                  "Grows a forest; merges fragments by global edge order",
                  "Grows one tree from a root, vertex by vertex"
                ],
                [
                  "Cut applied edge-by-edge (component vs. rest)",
                  "Cut applied to (tree S, rest V∖S)"
                ],
                [
                  "Core structure: union-find (disjoint sets)",
                  "Core structure: min-priority queue (heap)"
                ],
                [
                  "O(E log E) = O(E log V); great for sparse graphs",
                  "O(E + V log V) with Fibonacci heap; better for dense graphs"
                ],
                [
                  "Easy with edges given as a list",
                  "Easy with an adjacency list + decrease-key"
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Worked example: Kruskal on a 5-vertex graph",
              "body": "Vertices {a,b,c,d,e}, edges (sorted): (a,b)=1, (b,c)=2, (a,c)=3, (c,d)=4, (b,e)=5, (d,e)=6.\n\nProcess in order: (a,b)=1 → FIND(a)≠FIND(b), add; sets {a,b}. (b,c)=2 → add; {a,b,c}. (a,c)=3 → FIND(a)=FIND(c), **skip** (would cycle). (c,d)=4 → add; {a,b,c,d}. (b,e)=5 → add; {a,b,c,d,e}. Now V−1 = 4 edges chosen — stop (we would skip (d,e)=6 anyway).\n\nMST = {(a,b),(b,c),(c,d),(b,e)}, weight 1+2+4+5 = **12**. Note each accepted edge was the lightest crossing the cut between its growing component and the rest — the cut property in action."
            },
            {
              "type": "example",
              "heading": "Worked example: Prim on the same graph",
              "body": "Start at a. Tree S = {a}; crossing edges (a,b)=1, (a,c)=3 → take (a,b)=1, S={a,b}. Crossing: (b,c)=2, (a,c)=3, (b,e)=5 → take (b,c)=2, S={a,b,c}. Crossing: (c,d)=4, (b,e)=5 → take (c,d)=4, S={a,b,c,d}. Crossing: (b,e)=5, (d,e)=6 → take (b,e)=5, S=all. Weight 1+2+4+5 = **12** — the same MST (it is unique, weights distinct). Different growth order, identical tree, because both algorithms only ever add cut-light edges."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A connected graph has V = 20 vertices. How many edges does any MST have, and why exactly that many?",
                  "hint": "Use the spanning-tree edge-count result.",
                  "solution": "Exactly **19** edges. A spanning tree on V vertices is connected and acyclic; by induction (removing a leaf at each step) it has V − 1 edges, and an MST is a spanning tree, so V − 1 = 20 − 1 = 19. Any fewer would disconnect it; any more would create a cycle."
                },
                {
                  "prompt": "State the cut property precisely (the form the unit's gate tests), and identify which exchange-argument pattern its proof uses.",
                  "hint": "Distinct weights; 'every MST'; swap something OUT of an induced cycle.",
                  "solution": "Cut property: for any cut (S, V∖S) of a connected weighted graph with distinct edge weights, the unique minimum-weight edge crossing the cut belongs to every MST. Its proof is the 'swap a heavier element OUT' exchange pattern: assume an MST T omits the light edge e, add e to form the unique cycle, find a *heavier* crossing edge e' on that cycle, and swap e for e' to get a strictly cheaper spanning tree — contradiction."
                },
                {
                  "prompt": "Prove the **cycle property** (the dual of the cut property): in a connected graph with distinct weights, the unique maximum-weight edge of any cycle is in NO minimum spanning tree.",
                  "hint": "Suppose an MST contains it; remove it to split the tree into two parts and find a lighter cycle edge reconnecting them.",
                  "solution": "Let f be the unique heaviest edge on a cycle C, and suppose some MST T contains f. Removing f from T splits T into two components, S and V∖S, with f crossing this cut. Since f lies on cycle C and C is connected, C must cross the cut again via some other edge f' ≠ f of C. As f is the unique maximum of C, w(f') < w(f). Then T'' = (T ∖ {f}) ∪ {f'} is a spanning tree (it reconnects the two components and has V−1 edges, no cycle) with weight w(T) − w(f) + w(f') < w(T), contradicting minimality of T. Hence no MST contains f. This is the 'mirror' exchange of the cut property and is exactly why Kruskal safely *rejects* the heaviest edge closing each cycle."
                },
                {
                  "prompt": "In Kruskal, why is the first edge that connects two distinct components always a *light* edge for the cut separating one of those components from the rest? Argue carefully.",
                  "hint": "Edges are processed in nondecreasing weight order.",
                  "solution": "Let e = (u,v) be the edge Kruskal accepts, joining component C (containing u) to the rest. Consider the cut (C, V∖C). Any other edge e'' crossing this cut connects C to a different component and was either processed already (and rejected only if it closed a cycle — but a crossing edge between still-separate components never closes a cycle, so it would have been *accepted* earlier, contradicting that C and the other side are still separate) or comes later in the order, hence w(e'') ≥ w(e). Either way no crossing edge lighter than e remains unaccepted, so e is the lightest edge currently crossing (C, V∖C). By the cut property e belongs to the MST, justifying Kruskal's acceptance."
                },
                {
                  "prompt": "Give a 4-vertex graph with a tie in edge weights where the MST is NOT unique, and explain how the standard tie-breaking rule restores a unique 'cut property' statement.",
                  "hint": "Take a 4-cycle and make the two heaviest edges equal so they are interchangeable.",
                  "solution": "Take the **4-cycle** a–b–c–d–a (vertices a,b,c,d) with edge weights\n  w(a,b)=1, w(b,c)=1, w(c,d)=2, w(d,a)=2.\nEvery spanning tree of a 4-cycle is obtained by deleting exactly one of its four edges, giving four candidate trees. Their total weights (total of all edges is 1+1+2+2 = 6, so each tree weighs 6 minus the dropped edge):\n• drop (a,b)=1 → weight 5;\n• drop (b,c)=1 → weight 5;\n• drop (c,d)=2 → weight **4**, tree {(a,b),(b,c),(d,a)};\n• drop (d,a)=2 → weight **4**, tree {(a,b),(b,c),(c,d)}.\nThe minimum weight is 4, achieved by *exactly two* trees (dropping either of the two heaviest edges, which tie at 2). So the MST is **not unique** — there are precisely two MSTs, both keeping all 4 vertices.\n\nThe ambiguity surfaces in the cut property at the cut ({d}, {a,b,c}): its crossing edges are (c,d)=2 and (d,a)=2, which are **tied** as the lightest crossing edge. One MST uses (d,a), the other uses (c,d) — there is no single 'unique lightest crossing edge,' so the distinct-weights cut property does not directly apply.\n\n**Tie-break:** impose a fixed total order on edges, say lexicographic on endpoint pairs, so among the tied pair (c,d) and (d,a) we declare (c,d) strictly 'lighter.' Now every cut has a unique lightest crossing edge under this refined order, restoring the clean statement 'the unique lightest crossing edge belongs to every (tie-broken) MST.' The tree this selects, {(a,b),(b,c),(c,d)}, still has weight 4 — minimum under the *original* weights — so tie-breaking changes only *which* minimum tree we name, never the optimal value."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a8l2-i1",
              "front": "State the cut property (distinct weights).",
              "back": "For any cut (S, V∖S) of a connected weighted graph with distinct weights, the unique minimum-weight crossing edge is in EVERY MST."
            },
            {
              "id": "a8l2-i2",
              "front": "Sketch the cut-property proof in one line.",
              "back": "If an MST omits the light crossing edge e, adding e makes a cycle containing a heavier crossing edge e'; swap e for e' to get a cheaper spanning tree — contradiction."
            },
            {
              "id": "a8l2-i3",
              "front": "How many edges does an MST / spanning tree on V vertices have, and why?",
              "back": "Exactly V − 1: connected + acyclic forces it (induction by removing a leaf). For V=20 that is 19."
            },
            {
              "id": "a8l2-i4",
              "front": "Kruskal's method and running time?",
              "back": "Sort edges; add each that joins two different components (union-find FIND/UNION), skipping cycles; O(E log E) = O(E log V), sort dominates."
            },
            {
              "id": "a8l2-i5",
              "front": "Prim's method and running time?",
              "back": "Grow one tree from a root, repeatedly adding the lightest edge crossing (tree, rest) via a min-heap; O(E + V log V) with a Fibonacci heap."
            },
            {
              "id": "a8l2-i6",
              "front": "Cycle property (dual of the cut property)?",
              "back": "The unique maximum-weight edge of any cycle is in NO MST — justifying why Kruskal rejects the edge that closes each cycle."
            }
          ]
        },
        {
          "id": "a8l3",
          "title": "Union-Find & MST Running Times",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "Why a whole lesson on the data structure",
              "body": "Kruskal's *correctness* is the cut property, but its *efficiency* — and the precise bounds the unit's gate asks you to compute — depend entirely on the **disjoint-set (union-find)** structure that answers 'are u and v already connected?' and on the cost of the initial sort. This lesson makes those bounds exact, including the arithmetic of the log factor."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Disjoint-set (union-find) ADT",
              "statement": "A **disjoint-set** structure maintains a partition of a universe into disjoint sets, each named by a representative, supporting:\n• **MAKE-SET(x)** — create a singleton {x};\n• **FIND(x)** — return the representative of x's set (two elements are in the same set iff FIND returns the same representative);\n• **UNION(x, y)** — merge the sets containing x and y.\nKruskal uses one FIND pair per edge and one UNION per accepted edge."
            },
            {
              "type": "text",
              "heading": "The two optimizations",
              "body": "Sets are stored as rooted trees; the root is the representative. Two heuristics make operations almost free:\n\n**Union by rank** — attach the shorter tree under the taller one's root (rank ≈ height upper bound), so trees stay shallow.\n\n**Path compression** — during FIND, point every node on the path directly at the root, flattening the tree for future queries.\n\nUsed together, a sequence of m operations on n elements runs in O(m · α(n)), where α is the inverse Ackermann function. α(n) ≤ 4 for every n that could be written down in the physical universe, so each operation is *effectively constant*."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Kruskal running time",
              "statement": "On a connected graph G = (V, E), Kruskal runs in O(E log E), which equals O(E log V).",
              "proof": "Costs: MAKE-SET on all vertices is O(V). Sorting the E edges by weight is O(E log E) — comparison sorting of E items. The main loop performs O(E) FIND operations and O(V) UNION operations; with union by rank and path compression these total O((E + V)·α(V)) = O(E·α(V)) (since G connected gives E ≥ V − 1), and α(V) = O(log E), so this is dominated by the sort. Hence the total is O(E log E).\n\nTo see O(E log E) = O(E log V): in a simple graph E ≤ V², so log E ≤ log(V²) = 2 log V = O(log V); and E ≥ V − 1 gives log E = Ω(log V). Therefore log E = Θ(log V), and O(E log E) = O(E log V). ∎"
            },
            {
              "type": "example",
              "heading": "Computing the log factor: E = 64",
              "body": "Kruskal's sort is O(E·log₂ E). For E = 64 edges the **log₂ E factor** is\n  log₂ 64 = log₂ 2⁶ = **6**,\nbecause 2⁶ = 64. So sorting 64 edges costs on the order of 64 · 6 = 384 comparison-units. This is exactly the kind of bound to evaluate quickly: log₂ of a power of two is just its exponent. (Sanity table: log₂ 8 = 3, log₂ 16 = 4, log₂ 32 = 5, log₂ 64 = 6, log₂ 128 = 7, log₂ 1024 = 10.)"
            },
            {
              "type": "example",
              "heading": "Union-find trace inside Kruskal",
              "body": "Take edges accepted in order (a,b),(b,c),(c,d),(b,e) from the previous lesson's graph.\n\nStart: {a}{b}{c}{d}{e}. Accept (a,b): UNION → {a,b}{c}{d}{e}. Accept (b,c): FIND(b)=a-root, FIND(c)=c; differ → UNION → {a,b,c}{d}{e}. Skip (a,c): FIND(a)=FIND(c) (same root) → cycle, reject. Accept (c,d): differ → UNION → {a,b,c,d}{e}. Accept (b,e): differ → UNION → {a,b,c,d,e}. Four UNIONs = V − 1 edges, as required. Each FIND/UNION is O(α) — effectively constant — so the sort, not the connectivity tests, sets the running time."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The sort is the bottleneck, and you can sometimes beat it.** Because union-find is effectively linear, Kruskal's asymptotic cost *is* the sort: O(E log E). If edge weights are small integers and can be sorted in linear time (counting/radix sort), Kruskal drops to O(E·α(V)) — nearly linear. This is a recurring theme: a greedy algorithm's complexity often reduces to the cost of ordering its candidates."
            },
            {
              "type": "decision",
              "heading": "Where the time goes (binary heap / standard structures)",
              "rows": [
                [
                  "Phase",
                  "Cost"
                ],
                [
                  "MAKE-SET on V vertices",
                  "O(V)"
                ],
                [
                  "Sort E edges by weight",
                  "O(E log E) — dominant"
                ],
                [
                  "E FIND-pairs + (V−1) UNIONs (rank + path compression)",
                  "O(E · α(V)) ≈ O(E)"
                ],
                [
                  "Total (Kruskal)",
                  "O(E log E) = O(E log V)"
                ],
                [
                  "Prim with binary heap",
                  "O((V + E) log V)"
                ],
                [
                  "Prim with Fibonacci heap",
                  "O(E + V log V)"
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Kruskal sorts E edges in O(E·log₂ E). For E = 64, what is the log₂ E factor? Show the computation.",
                  "hint": "Express 64 as a power of 2.",
                  "solution": "log₂ E = log₂ 64 = log₂ 2⁶ = **6**, since 2⁶ = 64. The log₂ of a power of two equals its exponent."
                },
                {
                  "prompt": "Prove that for a connected simple graph, log E = Θ(log V), so O(E log E) and O(E log V) are the same bound.",
                  "hint": "Bound E above by V² and below by V − 1.",
                  "solution": "Connectivity gives E ≥ V − 1, so log E ≥ log(V−1) = Ω(log V). A simple graph has E ≤ C(V,2) < V², so log E ≤ log(V²) = 2 log V = O(log V). Combining, log E = Θ(log V). Multiplying by E preserves this, so O(E log E) = O(E log V). This is why textbooks write Kruskal's bound either way."
                },
                {
                  "prompt": "A graph has E = 1024 edges. Give the log₂ E factor in Kruskal's sort term, and the factor if E were instead 32.",
                  "hint": "Powers of two again.",
                  "solution": "log₂ 1024 = log₂ 2¹⁰ = **10**; log₂ 32 = log₂ 2⁵ = **5**. So sorting 1024 edges costs ~1024·10 comparison-units and 32 edges ~32·5."
                },
                {
                  "prompt": "Explain why, despite union-find being O(α(n)) per operation, we still write Kruskal as O(E log E) rather than O(E α(V)).",
                  "hint": "Which phase dominates when weights are arbitrary?",
                  "solution": "With arbitrary (comparison-only) weights, the edges must be comparison-sorted, costing Θ(E log E) — asymptotically larger than the O(E·α(V)) ≈ O(E) spent in union-find. The total is the maximum of the phases, so the sort dominates and Kruskal is O(E log E). Only when the sort itself can be done faster than O(E log E) (e.g. small integer weights via radix sort) does the union-find term O(E·α(V)) become the bottleneck and Kruskal become near-linear."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a8l3-i1",
              "front": "log₂ 64 = ? (Kruskal's sort factor for E = 64)",
              "back": "6, because 2⁶ = 64; the log₂ of a power of two is its exponent."
            },
            {
              "id": "a8l3-i2",
              "front": "Three union-find operations Kruskal uses?",
              "back": "MAKE-SET (init each vertex), FIND (same-component test per edge), UNION (merge on accept)."
            },
            {
              "id": "a8l3-i3",
              "front": "Why is union-find effectively constant time per op?",
              "back": "Union by rank + path compression give O(α(n)) amortized, where α (inverse Ackermann) ≤ 4 for all realistic n."
            },
            {
              "id": "a8l3-i4",
              "front": "Which phase dominates Kruskal, and what is the total?",
              "back": "The Θ(E log E) edge sort dominates the O(E·α(V)) union-find work; total O(E log E) = O(E log V)."
            },
            {
              "id": "a8l3-i5",
              "front": "Prim's running time with a binary heap vs. Fibonacci heap?",
              "back": "O((V+E) log V) with a binary heap; O(E + V log V) with a Fibonacci heap (decrease-key O(1) amortized)."
            }
          ]
        },
        {
          "id": "a8l4",
          "title": "Huffman Coding",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "The compression problem",
              "body": "Given an alphabet of n characters, character c occurring with frequency (count) f(c), we want a **binary code** assigning each character a bit-string codeword so that the encoded text is as short as possible. A **fixed-length** code (⌈log₂ n⌉ bits each) wastes space when frequencies are skewed. A **variable-length** code gives frequent characters short codewords — but then decoding is ambiguous unless the code is **prefix-free**: no codeword is a prefix of another. Huffman's algorithm produces an *optimal* prefix-free code, and it is the canonical second proof (after MST) that a greedy rule is globally optimal via an exchange argument."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Prefix-free code as a binary tree",
              "statement": "A **prefix-free** (prefix) code is one in which no codeword is a prefix of another. Every prefix-free code corresponds to a binary tree whose **leaves** are the characters: the path from the root to a leaf (left = 0, right = 1) spells that character's codeword, and the **depth** d_T(c) of leaf c equals its codeword length. Decoding walks the tree from the root, emitting a character each time a leaf is reached. The cost of a code/tree T is\n  B(T) = Σ_c f(c) · d_T(c),\nthe total number of bits to encode the text. An **optimal** code minimizes B(T)."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "An optimal prefix code tree is full",
              "statement": "Any binary tree representing an optimal prefix-free code is **full**: every internal node has exactly two children.",
              "proof": "Suppose some internal node x had only one child y. Replace x by y (contract the single edge), i.e. delete the redundant node x and connect its child subtree one level higher. Every leaf in y's subtree now has depth reduced by 1, and no other leaf changes, so the new tree T' is still a valid prefix-free code (still a binary tree with the same leaves) and B(T') ≤ B(T) − (at least one f-weighted unit) < B(T) whenever that subtree contains a character of positive frequency. This contradicts optimality of T. Hence every internal node has two children. ∎"
            },
            {
              "type": "code",
              "heading": "Huffman's algorithm",
              "lang": "text",
              "code": "HUFFMAN(C):                       // C = characters with frequencies\n  Q ← min-priority queue of C keyed on frequency\n  for i = 1 to |C| − 1:\n      z ← new internal node\n      z.left  ← x ← EXTRACT-MIN(Q)   // two lowest-frequency nodes\n      z.right ← y ← EXTRACT-MIN(Q)\n      z.freq  ← x.freq + y.freq\n      INSERT(Q, z)\n  return EXTRACT-MIN(Q)            // the single remaining node is the root\n// |C|−1 merges, each O(log n) heap work ⇒ O(n log n)."
            },
            {
              "type": "text",
              "heading": "The greedy rule",
              "body": "Huffman **repeatedly merges the two lowest-frequency nodes** into a new internal node whose frequency is their sum, reinserts it, and repeats until one tree remains. The least frequent characters get merged earliest, so they end up *deepest* in the tree (longest codewords) — which is exactly right, since deep = long codeword should go to rare characters. The optimality proof has two parts: a greedy-choice lemma (the two rarest characters can be deepest siblings) and an optimal-substructure lemma (merging them yields a smaller instance whose optimum extends)."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Greedy choice: the two rarest can be deepest siblings",
              "statement": "Let x and y be two characters of minimum frequency in C. Then there exists an optimal prefix-free code for C in which the codewords for x and y have the same (maximum) length and differ only in their last bit — i.e. x and y are sibling leaves at the deepest level.",
              "proof": "Let T be any optimal tree. By the previous lemma T is full, so its deepest level contains two sibling leaves; call them a and b (a, b are siblings at maximum depth). WLOG assume f(a) ≤ f(b) and f(x) ≤ f(y). Since x, y are the two globally minimum-frequency characters, f(x) ≤ f(a) and f(y) ≤ f(b).\n\nForm T' by exchanging x and a (swap the two leaves). The change in cost is\n  B(T) − B(T') = Σ_c f(c)d_T(c) − Σ_c f(c)d_{T'}(c) = (f(a) − f(x))·(d_T(a) − d_T(x)).\nNow f(a) − f(x) ≥ 0, and d_T(a) ≥ d_T(x) because a is at maximum depth. So the product is ≥ 0, giving B(T') ≤ B(T). Since T is optimal, B(T') = B(T), so T' is also optimal and now has x at a deepest sibling position.\n\nSimilarly exchange y and b in T' to get T''; the same computation (f(b) − f(y) ≥ 0 and d(b) maximal) gives B(T'') ≤ B(T') = B(T), so T'' is optimal. In T'', x and y are the two deepest sibling leaves with codewords differing only in the last bit. ∎"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Optimal substructure",
              "statement": "Let x, y be two minimum-frequency characters. Let C' = (C ∖ {x, y}) ∪ {z} be the alphabet with x and y replaced by a single new character z of frequency f(z) = f(x) + f(y). Let T' be an optimal tree for C'. Then the tree T obtained from T' by replacing leaf z with an internal node whose two children are leaves x and y is an optimal tree for C.",
              "proof": "First relate the costs. For every character other than x, y the depth is the same in T and T'. For z, leaf z at depth d_{T'}(z) becomes an internal node at that depth with children x, y at depth d_{T'}(z) + 1. Hence\n  B(T) = B(T') + [ f(x)+f(y) ]·1 = B(T') + f(z),\nbecause f(x)d_T(x) + f(y)d_T(y) = (f(x)+f(y))(d_{T'}(z)+1) = f(z)·d_{T'}(z) + f(z), and f(z)·d_{T'}(z) is exactly z's contribution to B(T'). So B(T) = B(T') + f(z), a constant offset independent of which trees we pick.\n\nNow suppose, for contradiction, T is **not** optimal for C; let U be a better tree, B(U) < B(T). By the greedy-choice lemma we may assume x and y are sibling leaves in U. Merging those siblings into a single leaf z gives a tree U' for C' with B(U') = B(U) − f(z) < B(T) − f(z) = B(T'). This contradicts the optimality of T' for C'. Therefore T is optimal for C. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Huffman's algorithm is optimal",
              "statement": "HUFFMAN(C) produces an optimal prefix-free code for C.",
              "proof": "By induction on n = |C|. **Base case** n = 1 (or trivially n = 2): with one character a 0-length (or single-bit) code is optimal. **Inductive step:** for |C| = n ≥ 2, the algorithm's first action picks the two minimum-frequency characters x, y (correct, since EXTRACT-MIN returns the two smallest), merges them into z, and then runs Huffman on C' = (C∖{x,y})∪{z}, which has n − 1 characters. By the inductive hypothesis, Huffman returns an optimal tree T' for C'. The greedy-choice lemma guarantees some optimal tree for C makes x, y deepest siblings, and the optimal-substructure lemma guarantees that expanding z back into the pair (x, y) in the optimal T' yields an optimal tree for C — which is exactly what Huffman constructs. Hence Huffman's output is optimal for C. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: the CLRS six-character alphabet",
              "body": "Frequencies (in hundreds): a:45, b:13, c:12, d:16, e:9, f:5.\n\nMerge the two smallest each step:\n1. f:5 + e:9 → (fe):14.\n2. c:12 + b:13 → (cb):25.\n3. (fe):14 + d:16 → (fed):30.\n4. (cb):25 + (fed):30 → (cbfed):55.\n5. a:45 + (cbfed):55 → root:100.\n\nResulting codeword lengths: a=1, c=3, b=3, f=4, e=4, d=3 (the rare f, e land deepest). Cost B(T) = 45·1 + 13·3 + 12·3 + 16·3 + 9·4 + 5·4 = 45+39+36+48+36+20 = **224** bits per 100 characters, vs. a 3-bit fixed code's 300 — a 25% saving, and provably optimal."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Same template, three times.** Huffman is the third instance in this unit of greedy-choice + optimal substructure: scheduling (earliest finisher is safe), MST (lightest crossing edge is safe), Huffman (two rarest go deepest). In each case an *exchange* proves the greedy choice safe and a *residual subproblem* gives the substructure. Recognize the template and you can attack new greedy problems with confidence — and recognize when no safe exchange exists, signaling DP instead."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Run Huffman on frequencies a:1, b:1, c:2, d:3, e:5. Give the merge order and the codeword length of each character.",
                  "hint": "Always merge the two current smallest; ties broken arbitrarily.",
                  "solution": "Merge a:1 + b:1 → (ab):2. Now {c:2, (ab):2, d:3, e:5}. Merge c:2 + (ab):2 → (cab):4. Now {d:3, (cab):4, e:5}. Merge d:3 + (cab):4 → (dcab):7. Now {e:5, (dcab):7}. Merge → root:12. Depths: e=1; d=2; c=3; a=4, b=4. So lengths are a:4, b:4, c:3, d:2, e:1. Cost = 1·4+1·4+2·3+3·2+5·1 = 4+4+6+6+5 = 25 bits. The Fibonacci-like frequencies push rare characters deep, as expected."
                },
                {
                  "prompt": "Prove that in any optimal prefix code, if f(x) < f(y) then d(x) ≥ d(y) (rarer characters are never shallower). This is the monotonicity behind 'least frequent go deepest'.",
                  "hint": "If not, swap x and y and compare costs.",
                  "solution": "Suppose toward contradiction f(x) < f(y) but d(x) < d(y) in an optimal tree T. Swap leaves x and y to get T'. The cost change is B(T) − B(T') = (f(y) − f(x))(d(y) − d(x)). Here f(y) − f(x) > 0 and d(y) − d(x) > 0, so B(T) − B(T') > 0, i.e. B(T') < B(T) — strictly cheaper, contradicting optimality of T. Hence d(x) ≥ d(y). This swap is the same exchange argument that drives the greedy-choice lemma."
                },
                {
                  "prompt": "Why must a prefix-free code's tree be the structure used — i.e. show a non-prefix-free code can decode ambiguously, and that the prefix-free property guarantees unambiguous decoding.",
                  "hint": "Try codewords where one is a prefix of another, then argue the leaf-walk for prefix-free codes.",
                  "solution": "Ambiguity: let A=0, B=01. The bitstream 01 could be 'B' or 'A then (start of) …' — and 010 is 'A,B'? or 'B,A'? With A a prefix of B, a decoder cannot tell when A ends. Unambiguous decoding (prefix-free): represent codewords as root-to-leaf paths in a binary tree. Decode by walking from the root, taking the branch for each bit; because every codeword ends at a *leaf* and no codeword is a prefix of another, the walk reaches a leaf at exactly one position — emit that character and restart at the root. No bit prefix matches two different codewords, so the parse is unique. Thus prefix-free ⇔ the tree's leaves give an instantaneously decodable code."
                },
                {
                  "prompt": "Show Huffman's algorithm runs in O(n log n) for n characters, and identify the data structure responsible.",
                  "hint": "Count the loop iterations and the cost per heap operation.",
                  "solution": "Build the min-priority queue from n frequencies in O(n) (heapify) or O(n log n) by repeated insert. The main loop runs n − 1 times; each iteration does two EXTRACT-MINs and one INSERT, each O(log n) on a binary min-heap. Total loop cost: (n−1)·3·O(log n) = O(n log n). The min-priority queue (binary heap) is the structure that makes 'find the two smallest' cheap; it dominates the running time, giving O(n log n)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a8l4-i1",
              "front": "What does Huffman's algorithm produce, and what property guarantees unambiguous decoding?",
              "back": "An optimal prefix-free binary code; prefix-free (no codeword is a prefix of another) makes the bit stream uniquely decodable via a root-to-leaf tree walk."
            },
            {
              "id": "a8l4-i2",
              "front": "Huffman's greedy step and running time?",
              "back": "Repeatedly merge the two lowest-frequency nodes into a parent and reinsert (min-heap); O(n log n) for n characters."
            },
            {
              "id": "a8l4-i3",
              "front": "Cost of a prefix-code tree T?",
              "back": "B(T) = Σ_c f(c)·d_T(c) — frequency times codeword length (leaf depth), summed over characters."
            },
            {
              "id": "a8l4-i4",
              "front": "Greedy-choice lemma for Huffman?",
              "back": "The two minimum-frequency characters can be made deepest sibling leaves of some optimal tree — proved by exchanging them with the deepest siblings without increasing cost."
            },
            {
              "id": "a8l4-i5",
              "front": "Optimal-substructure lemma for Huffman?",
              "back": "Replacing x,y by a merged z of frequency f(x)+f(y) gives C'; an optimal tree for C' expanded at z into (x,y) is optimal for C, since B(T)=B(T')+f(z)."
            },
            {
              "id": "a8l4-i6",
              "front": "Why is an optimal Huffman tree full?",
              "back": "If an internal node had one child, contracting it reduces some leaf depths and lowers B(T) — so optimal trees have every internal node with exactly two children."
            }
          ]
        }
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
          "id": "a9l1",
          "title": "DP Fundamentals",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "When divide-and-conquer overlaps",
              "body": "Divide-and-conquer assumes subproblems are *disjoint*: mergesort splits an array into two halves that never interact again. Many optimization problems violate this. Consider the naive recursion for the n-th Fibonacci number, F(n) = F(n−1) + F(n−2). Expanding it, F(n−2) is computed inside the F(n−1) branch *and* again as the second top-level branch; F(n−3) appears three times, F(n−4) five times, and so on. The recursion tree has Θ(φⁿ) leaves (φ = (1+√5)/2), so the naive algorithm is **exponential** — yet there are only n+1 *distinct* subproblems F(0), …, F(n).\n\nThis gap between the number of recursive calls and the number of distinct subproblems is exactly the inefficiency **dynamic programming** removes. DP applies when a problem has two properties: *optimal substructure* and *overlapping subproblems*. Solve each distinct subproblem **once**, store the answer, and reuse it, collapsing exponential work to polynomial."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Optimal substructure",
              "statement": "A problem has **optimal substructure** if an optimal solution to the problem contains within it optimal solutions to subproblems. Equivalently: one can describe an optimal solution as a choice that creates one or more smaller instances of the same problem, and the optimal solution restricted to each smaller instance must itself be optimal for that instance.",
              "proof": null
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Overlapping subproblems",
              "statement": "A problem has **overlapping subproblems** if a recursive formulation revisits the same subproblems repeatedly, rather than always generating fresh ones. Formally, the total number of *distinct* subproblems reachable from the top instance is polynomial in the input size, while a naive recursion that re-solves each call from scratch examines a superpolynomial (typically exponential) number of calls.",
              "proof": null
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Both properties are required.** Optimal substructure *without* overlap is plain divide-and-conquer (mergesort, quicksort) — memoizing buys nothing because subproblems are already distinct. Overlap *without* optimal substructure means caching helps speed but the recurrence is not a correct optimization (e.g. longest *simple* path in a graph has overlapping subproblems but **fails** optimal substructure, and is NP-hard). DP needs both."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Running time of a DP",
              "statement": "Let a dynamic program have S distinct subproblems, and let solving one subproblem from already-computed subproblems take at most t(s) time for subproblem s. Then the total running time is Θ(Σₛ t(s)). In particular, if every subproblem takes O(w) work, the running time is O(S·w).",
              "proof": "Whether implemented top-down with memoization or bottom-up with tabulation, each distinct subproblem is solved exactly once. **Memoization:** the first call on a subproblem performs its t(s) combining work and stores the result; every subsequent call returns the cached value in O(1) and is charged to the first call's caller. So the work attributable to subproblem s is t(s), and summing over the S distinct subproblems gives Σₛ t(s). **Tabulation:** the table has one entry per subproblem; the algorithm visits each entry once, spending t(s) to fill it, for the same total. Table lookups for dependencies are O(1) each and already counted inside t(s). Hence the running time is Θ(Σₛ t(s)); if t(s) ≤ w for all s, this is at most S·w. ∎"
            },
            {
              "type": "decision",
              "heading": "Memoization vs tabulation",
              "rows": [
                [
                  "Memoization (top-down)",
                  "Recurse as usual; cache each subproblem's answer on first computation. Solves only subproblems actually reached."
                ],
                [
                  "Tabulation (bottom-up)",
                  "Fill a table in an order respecting dependencies (each entry after the ones it needs). Solves every subproblem in the table."
                ],
                [
                  "When memoization wins",
                  "When only a sparse subset of subproblems is reachable, or the dependency order is awkward to state explicitly."
                ],
                [
                  "When tabulation wins",
                  "When all subproblems are needed anyway; avoids recursion overhead and enables space optimization (e.g. keeping only the last row)."
                ]
              ]
            },
            {
              "type": "code",
              "heading": "The two implementations side by side (Fibonacci)",
              "lang": "pseudocode",
              "code": "// Top-down memoization\nmemo = array of size n+1, all NIL\nMEM-FIB(k):\n  if k ≤ 1: return k\n  if memo[k] ≠ NIL: return memo[k]\n  memo[k] = MEM-FIB(k-1) + MEM-FIB(k-2)\n  return memo[k]\n\n// Bottom-up tabulation\nTAB-FIB(n):\n  f[0] = 0; f[1] = 1\n  for k = 2 to n:\n      f[k] = f[k-1] + f[k-2]\n  return f[n]\n\n// Both: n+1 distinct subproblems, O(1) work each -> Theta(n)."
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Naive FIB(5) recursion tree: subproblems recur. FIB(3) appears twice, FIB(2) three times, FIB(1) five times — Θ(φⁿ) nodes for only n+1 distinct values. Memoization prunes every repeat to a cache hit.",
              "levels": [
                {
                  "n": "F(5)",
                  "each": "1 node",
                  "row": "1 call"
                },
                {
                  "n": "F(4), F(3)",
                  "each": "expands",
                  "row": "2 calls"
                },
                {
                  "n": "F(3),F(2),F(2),F(1)",
                  "each": "expands",
                  "row": "4 calls"
                },
                {
                  "ellipsis": true,
                  "row": "growing as φᵏ"
                }
              ],
              "total": "Θ(φⁿ) calls naively vs Θ(n) distinct subproblems"
            },
            {
              "type": "example",
              "heading": "Counting subproblems before coding",
              "body": "Before writing any DP, identify the subproblem space and per-subproblem work; their product is the running time (Proposition above).\n\n**LCS / edit distance:** a subproblem is a pair of prefixes (i, j), 0 ≤ i ≤ m, 0 ≤ j ≤ n, so Θ(mn) subproblems; combining is O(1) → **Θ(mn)**.\n**0/1 knapsack:** a subproblem is (i, w), 0 ≤ i ≤ n, 0 ≤ w ≤ W, so Θ(nW) subproblems; O(1) each → **Θ(nW)**.\n**Matrix-chain:** a subproblem is a contiguous subchain (i, j), 1 ≤ i ≤ j ≤ n, so Θ(n²) subproblems; each scans O(n) split points → **Θ(n³)**.\n\nThe entire analysis is two counts. This is why 'what is a subproblem here?' is the first question to ask of any DP."
            },
            {
              "type": "example",
              "heading": "Greedy fails, DP succeeds: rod cutting",
              "body": "Given a rod of length n and a price table p[1..n], cut it to maximize revenue. Let r(j) be the best revenue for length j. Optimal substructure: an optimal cut makes a first piece of some length i (1 ≤ i ≤ j) and then optimally cuts the remainder, so\n\nr(j) = max₁≤ᵢ≤ⱼ ( p[i] + r(j−i) ),  r(0) = 0.\n\nThere are n subproblems, each an O(n) max, giving **Θ(n²)**. A greedy rule like 'always cut the piece of highest price-per-length' is *wrong*: with p = [1, 5, 8, 9] and n = 4, greedy by density picks length 3 (8/3 ≈ 2.67) then length 1, total 8 + 1 = 9, but the DP optimum is two pieces of length 2 for 5 + 5 = **10**. DP wins because it evaluates *all* first-cut choices rather than committing to one."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Optimal substructure must be proved, not assumed.** The standard tool is the *cut-and-paste* argument: assume a component of an optimal solution is not itself optimal for its subproblem, then cut it out, paste in a better subsolution, and derive a strictly better global solution — contradicting optimality. If this argument fails (as for longest simple paths), the recurrence is invalid no matter how natural it looks."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A DP has subproblems indexed by a pair (i, j) with 1 ≤ i ≤ j ≤ n, and filling each entry scans O(n) candidate split points. Give the running time as Θ(nᵈ) and state d.",
                  "solution": "The number of pairs (i, j) with 1 ≤ i ≤ j ≤ n is C(n,2) + n = n(n+1)/2 = Θ(n²). Each costs O(n). By the running-time proposition the total is Θ(n²)·O(n) = Θ(n³), so **d = 3**. This is exactly the matrix-chain shape.",
                  "hint": "Count the index pairs first (it is a triangular number), then multiply by the per-subproblem work."
                },
                {
                  "prompt": "Explain why memoizing the naive Fibonacci recursion turns Θ(φⁿ) time into Θ(n) time, citing the two DP properties.",
                  "solution": "Overlapping subproblems: although the recursion tree has Θ(φⁿ) nodes, only n+1 *distinct* subproblems F(0..n) exist. Optimal substructure (here just a correct recurrence): F(k) is determined by F(k−1) and F(k−2). Memoization solves each distinct subproblem once (O(1) addition) and returns a cached value on every repeat call, so total work is (n+1) subproblems × O(1) = Θ(n), per the running-time proposition.",
                  "hint": "How many *distinct* values F(k) are ever needed, and what does caching do to repeated calls?"
                },
                {
                  "prompt": "Give an example of a problem with overlapping subproblems that nonetheless does NOT admit a correct DP, and say which property fails.",
                  "solution": "The **longest simple path** between two vertices in a general (possibly cyclic) graph. Recursive formulations revisit the same vertex pairs (overlap), but **optimal substructure fails**: a longest simple path from u to v through w need not decompose into a longest simple u→w path and a longest simple w→v path, because the two halves may share vertices, and forbidding that sharing makes the subproblems non-independent. The problem is NP-hard, so no polynomial DP exists unless P = NP.",
                  "hint": "Think of a graph problem that is NP-hard despite an obvious-looking recursive split."
                },
                {
                  "prompt": "Dynamic programming applies when a problem has overlapping subproblems and which second property? Justify in one sentence.",
                  "solution": "**Optimal substructure** — an optimal solution is built from optimal solutions to subproblems — which is what makes the recurrence over subproblem optima yield a globally optimal answer; without it, combining subproblem optima need not produce an optimum.",
                  "hint": "This is the gate's MCQ; pair 'overlapping subproblems' with its partner property."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a9l1-i1",
              "front": "The two ingredients a problem needs for DP?",
              "back": "Optimal substructure (optimum built from subproblem optima) and overlapping subproblems (only polynomially many distinct subproblems, revisited often)."
            },
            {
              "id": "a9l1-i2",
              "front": "Memoization vs tabulation?",
              "back": "Memoization: top-down recursion with caching, solves only reached subproblems. Tabulation: bottom-up table fill in dependency order, solves all subproblems."
            },
            {
              "id": "a9l1-i3",
              "front": "How do you compute a DP's running time?",
              "back": "(number of distinct subproblems) × (work per subproblem); more precisely Θ(Σₛ t(s))."
            },
            {
              "id": "a9l1-i4",
              "front": "What is the cut-and-paste argument for?",
              "back": "Proving optimal substructure: assume a component is suboptimal, paste in a better subsolution to beat the global optimum, contradiction."
            },
            {
              "id": "a9l1-i5",
              "front": "Overlap without optimal substructure — example?",
              "back": "Longest simple path in a graph: subproblems recur, but the halves share vertices so substructure fails; it is NP-hard."
            }
          ]
        },
        {
          "id": "a9l2",
          "title": "Sequence DPs: LCS & Edit Distance",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Comparing two sequences",
              "body": "A vast family of problems asks how *similar* two strings are: longest common subsequence (LCS), edit distance, sequence alignment in bioinformatics, the diff utility. They share one shape — two indices, a 2-D table, Θ(mn) subproblems each with O(1) work — and one proof technique, optimal substructure on prefixes. We develop LCS in full rigor (the gate demands its proof) and then transfer the method to edit distance.\n\nFix strings X = ⟨x₁, …, x_m⟩ and Y = ⟨y₁, …, y_n⟩. A **subsequence** of X is obtained by deleting zero or more characters while preserving order (not necessarily contiguous). Z is a **common subsequence** of X and Y if it is a subsequence of both. The LCS problem asks for a common subsequence of maximum length."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The LCS subproblem and table",
              "statement": "For 0 ≤ i ≤ m and 0 ≤ j ≤ n, let X[1..i] denote the length-i prefix of X (X[1..0] is the empty string), similarly Y[1..j]. Define c[i][j] to be the length of a longest common subsequence of X[1..i] and Y[1..j]. The answer to the full problem is c[m][n].",
              "proof": null
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Optimal substructure of an LCS",
              "statement": "Let Z = ⟨z₁, …, z_k⟩ be any LCS of X[1..i] and Y[1..j]. Then:\n(1) If xᵢ = yⱼ, then z_k = xᵢ = yⱼ and Z[1..k−1] is an LCS of X[1..i−1] and Y[1..j−1].\n(2) If xᵢ ≠ yⱼ, then z_k ≠ xᵢ implies Z is an LCS of X[1..i−1] and Y[1..j].\n(3) If xᵢ ≠ yⱼ, then z_k ≠ yⱼ implies Z is an LCS of X[1..i] and Y[1..j−1].",
              "proof": "**(1)** Suppose xᵢ = yⱼ but z_k ≠ xᵢ. Then we could append the common character xᵢ = yⱼ to Z, obtaining a common subsequence of X[1..i] and Y[1..j] of length k+1, contradicting that Z is *longest*. So z_k = xᵢ = yⱼ. Now Z[1..k−1] is a common subsequence of X[1..i−1] and Y[1..j−1] (it is Z with its matched last character removed, and that character was xᵢ, yⱼ). It must be a *longest* such: if some common subsequence W of X[1..i−1], Y[1..j−1] had length > k−1, then appending xᵢ to W yields a common subsequence of X[1..i], Y[1..j] longer than k, contradicting Z's optimality. This is the cut-and-paste step.\n\n**(2)** Suppose xᵢ ≠ yⱼ and z_k ≠ xᵢ. Since Z is a subsequence of X[1..i] that does not use xᵢ as its last matched character (z_k ≠ xᵢ), Z is in fact a subsequence of X[1..i−1]; and Z is a subsequence of Y[1..j]. So Z is a common subsequence of X[1..i−1] and Y[1..j]. It is longest: any longer common subsequence of those two prefixes is also a common subsequence of X[1..i] and Y[1..j] (since X[1..i−1] is a prefix of X[1..i]), contradicting Z's optimality for the original pair.\n\n**(3)** Symmetric to (2), exchanging the roles of X and Y. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The LCS recurrence",
              "statement": "With base cases c[0][j] = c[i][0] = 0 for all i, j, the table satisfies\n\nc[i][j] = c[i−1][j−1] + 1,            if i, j > 0 and xᵢ = yⱼ;\nc[i][j] = max( c[i−1][j], c[i][j−1] ), if i, j > 0 and xᵢ ≠ yⱼ.",
              "proof": "**Base cases.** If i = 0 or j = 0, one of the prefixes is empty, so the only common subsequence is the empty sequence, of length 0; hence c[0][j] = c[i][0] = 0.\n\n**Case xᵢ = yⱼ.** Let Z be an LCS of X[1..i], Y[1..j], of length c[i][j]. By part (1) of the optimal-substructure theorem, z_k = xᵢ and Z[1..k−1] is an LCS of X[1..i−1], Y[1..j−1], whose length is c[i−1][j−1]. Thus c[i][j] = (c[i−1][j−1]) + 1, giving c[i][j] ≤ c[i−1][j−1] + 1. Conversely, take any LCS W of X[1..i−1], Y[1..j−1] (length c[i−1][j−1]) and append xᵢ = yⱼ; the result is a common subsequence of X[1..i], Y[1..j] of length c[i−1][j−1] + 1, so c[i][j] ≥ c[i−1][j−1] + 1. Both inequalities give equality: c[i][j] = c[i−1][j−1] + 1.\n\n**Case xᵢ ≠ yⱼ.** An LCS Z of X[1..i], Y[1..j] cannot have both z_k = xᵢ and z_k = yⱼ, because xᵢ ≠ yⱼ; so z_k ≠ xᵢ or z_k ≠ yⱼ. By parts (2) and (3), in the first case Z is a common subsequence of X[1..i−1], Y[1..j] so c[i][j] ≤ c[i−1][j]; in the second case c[i][j] ≤ c[i][j−1]. Hence c[i][j] ≤ max(c[i−1][j], c[i][j−1]). Conversely every common subsequence of X[1..i−1], Y[1..j] is one of X[1..i], Y[1..j] (and likewise for X[1..i], Y[1..j−1]), so c[i][j] ≥ c[i−1][j] and c[i][j] ≥ c[i][j−1], giving c[i][j] ≥ max(c[i−1][j], c[i][j−1]). Equality follows. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "LCS running time and space",
              "statement": "Filling the (m+1)×(n+1) table by the recurrence computes c[m][n] in Θ(mn) time and Θ(mn) space; with back-pointers an actual LCS is recovered in O(m + n) additional time.",
              "proof": "There are (m+1)(n+1) = Θ(mn) cells. Each cell's value is computed from at most three previously-filled neighbors (left, up, diagonal) by a comparison and either a +1 or a max — O(1) work — provided cells are filled in an order where c[i−1][·] and c[i][j−1] precede c[i][j]; row-major order (i increasing, then j increasing) satisfies this. By the DP running-time proposition, total time is Θ(mn)·O(1) = Θ(mn). Storing one back-pointer per cell (↖ on a match, else ↑ or ←) costs the same Θ(mn) space; tracing from cell (m, n) back to a 0-index, each step decrements i or j or both, so at most m + n steps reconstruct the subsequence. ∎"
            },
            {
              "type": "code",
              "heading": "LCS-LENGTH (tabulation with back-pointers)",
              "lang": "pseudocode",
              "code": "LCS-LENGTH(X, Y):\n  m = X.length; n = Y.length\n  let c[0..m][0..n], b[1..m][1..n]\n  for i = 0 to m: c[i][0] = 0\n  for j = 0 to n: c[0][j] = 0\n  for i = 1 to m:\n    for j = 1 to n:\n      if X[i] == Y[j]:\n        c[i][j] = c[i-1][j-1] + 1;  b[i][j] = \"diag\"\n      elif c[i-1][j] >= c[i][j-1]:\n        c[i][j] = c[i-1][j];        b[i][j] = \"up\"\n      else:\n        c[i][j] = c[i][j-1];        b[i][j] = \"left\"\n  return c, b      // c[m][n] is the LCS length\n\nPRINT-LCS(b, X, i, j):\n  if i == 0 or j == 0: return\n  if b[i][j] == \"diag\": PRINT-LCS(b,X,i-1,j-1); print X[i]\n  elif b[i][j] == \"up\":   PRINT-LCS(b,X,i-1,j)\n  else:                   PRINT-LCS(b,X,i,j-1)"
            },
            {
              "type": "example",
              "heading": "Worked LCS table (CLRS): X = ABCBDAB, Y = BDCAB",
              "body": "Here m = 7, n = 5. Fill c row by row. The final value is **c[7][5] = 4**, with an LCS **BCAB** (also BDAB). Spot-checks of the recurrence:\n\n• x₁ = A, y₁ = B differ → c[1][1] = max(c[0][1], c[1][0]) = max(0,0) = 0.\n• x₃ = C, y₃ = C match → c[3][3] = c[2][2] + 1 = 1 + 1 = 2.\n• x₆ = A, y₄ = A match → c[6][4] = c[5][3] + 1.\n\nBack-tracing from (7,5): the diagonal (match) steps land on B, C, A, B, spelling the length-4 subsequence. Note the m·n = 7·5 = 35 cells filled, one Θ(1) operation each."
            },
            {
              "type": "example",
              "heading": "Counting cells: the gate's m = 8, n = 5 instance",
              "body": "For strings of lengths m = 8 and n = 5, the LCS recurrence fills the c-table over all prefix pairs (i, j) with 1 ≤ i ≤ 8 and 1 ≤ j ≤ 5 — the substantive part of the table. That is m·n = 8 · 5 = **40 cells**, one subproblem per prefix pair, each costing Θ(1). Total time Θ(mn) = Θ(40) for this instance; the boundary row and column (the 0-indices) are initialized to 0 and not counted in m·n."
            },
            {
              "type": "text",
              "heading": "Edit distance: the same shape",
              "body": "The **Levenshtein edit distance** d[i][j] between X[1..i] and Y[1..j] is the minimum number of single-character insertions, deletions, and substitutions to transform one prefix into the other. The recurrence mirrors LCS but minimizes a cost:\n\nd[i][0] = i (delete all i chars),  d[0][j] = j (insert all j chars),\n\nand for i, j > 0,\n\nd[i][j] = d[i−1][j−1]                if xᵢ = yⱼ  (free match),\nd[i][j] = 1 + min( d[i−1][j],          // delete xᵢ\n                   d[i][j−1],          // insert yⱼ\n                   d[i−1][j−1] )       // substitute\n                                       if xᵢ ≠ yⱼ.\n\nThe correctness proof is the same cut-and-paste: condition on the *last* operation in an optimal edit script, observe it reduces to an optimal script on shorter prefixes."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Edit-distance recurrence correctness (last-operation argument)",
              "statement": "The recurrence above correctly computes d[i][j], the minimum-cost transformation of X[1..i] into Y[1..j], in Θ(mn) time and space.",
              "proof": "Consider an optimal edit script turning X[1..i] into Y[1..j], and look at how the final characters are reconciled — equivalently the last column of the alignment. There are exactly three possibilities for that last alignment column: (a) xᵢ is aligned to yⱼ; (b) xᵢ is deleted (aligned to a gap); (c) yⱼ is inserted (a gap aligned to yⱼ). These are exhaustive because the last column must involve xᵢ, yⱼ, or both.\n\n(a) If xᵢ = yⱼ the column is a free match and the remaining script optimally transforms X[1..i−1] into Y[1..j−1], cost d[i−1][j−1]; if xᵢ ≠ yⱼ it is a substitution of cost 1 plus d[i−1][j−1]. (b) Deleting xᵢ costs 1 plus the optimal cost d[i−1][j] of transforming X[1..i−1] into Y[1..j]. (c) Inserting yⱼ costs 1 plus d[i][j−1]. Each remaining sub-script must be optimal for its subproblem by cut-and-paste (a cheaper sub-script would yield a cheaper whole script). The optimum is the minimum over the available cases, which is exactly the stated recurrence (the match case drops the +1 when xᵢ = yⱼ and makes the diagonal the unique best). There are Θ(mn) cells, O(1) work each, so Θ(mn) time and space. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Cost, not just value.** Both LCS and edit distance compute a *number* in the table, but the application usually wants the *witness* — the actual subsequence or edit script. Store one back-pointer per cell recording which case won, then trace from (m, n) to the boundary. This adds only Θ(mn) space and O(m + n) trace time, and is how `diff` reconstructs the change set."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For X of length m = 8 and Y of length n = 5, how many cells does the LCS recurrence fill (the m·n prefix-pair subproblems)? State the per-instance running time.",
                  "solution": "m·n = 8 · 5 = **40 cells**, one subproblem per prefix pair (i, j) with 1 ≤ i ≤ 8, 1 ≤ j ≤ 5. Each is filled in Θ(1) time, so the work on the substantive table is Θ(mn) = Θ(40) operations for this instance. (The 0-index boundary row/column are initialized to 0 and excluded from the m·n count.)",
                  "hint": "It is just the product m·n; the boundary zeros are not part of that product."
                },
                {
                  "prompt": "Prove the match case of the LCS recurrence: if xᵢ = yⱼ then c[i][j] = c[i−1][j−1] + 1.",
                  "solution": "(≤) Let Z be an LCS of X[1..i], Y[1..j], length c[i][j]. By optimal substructure part (1), since xᵢ = yⱼ we may take z_k = xᵢ, and Z[1..k−1] is an LCS of X[1..i−1], Y[1..j−1], so c[i][j] = |Z| = |Z[1..k−1]| + 1 = c[i−1][j−1] + 1, giving c[i][j] ≤ c[i−1][j−1] + 1. (≥) Take any LCS W of X[1..i−1], Y[1..j−1], length c[i−1][j−1]; append the common character xᵢ = yⱼ to get a common subsequence of X[1..i], Y[1..j] of length c[i−1][j−1] + 1, so c[i][j] ≥ c[i−1][j−1] + 1. Equality follows. ∎",
                  "hint": "Prove both inequalities; the ≤ direction uses optimal substructure, the ≥ direction constructs a witness by appending the matched character."
                },
                {
                  "prompt": "Compute the edit distance between X = 'SUNDAY' and Y = 'SATURDAY' and give one optimal edit script.",
                  "solution": "m = 6, n = 8. Filling the d-table yields d[6][8] = **3**. Optimal alignment, writing gaps as –:\n\nX:  S · – · – · U · N · D · A · Y\nY:  S · A · T · U · R · D · A · Y\n\nReading the columns left to right: S matches, insert 'A', insert 'T', U matches, substitute 'N'→'R', then D, A, Y all match. That is the 3-operation script **insert 'A', insert 'T', substitute 'N'→'R'**, total cost 3.\n\nNote: with insertions and deletions only (no substitutions) the cost would be m + n − 2·LCS = 6 + 8 − 2·5 = **4**, since the longest common subsequence S,U,D,A,Y has length 5. The single substitution N→R replaces a delete+insert pair, saving one operation, so the Levenshtein distance is 3 < 4.",
                  "hint": "The longest common subsequence is S,U,D,A,Y of length 5; allowing substitution lets one operation do the work of a delete plus an insert."
                },
                {
                  "prompt": "Show that edit distance and LCS are related: if only insertions and deletions are allowed (no substitutions), the minimum number of operations to turn X into Y equals m + n − 2·LCS(X,Y).",
                  "solution": "With insert/delete only, an optimal alignment keeps exactly the characters of some common subsequence Z and deletes the other m − |Z| characters of X and inserts the other n − |Z| characters of Y. Total operations = (m − |Z|) + (n − |Z|) = m + n − 2|Z|, minimized by maximizing |Z|, i.e. taking Z to be an LCS. Hence the minimum is m + n − 2·LCS(X,Y). (Substitutions, when allowed, can be cheaper, which is why full Levenshtein distance can be smaller.) ∎",
                  "hint": "Kept characters form a common subsequence; everything else must be inserted or deleted exactly once."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a9l2-i1",
              "front": "LCS recurrence: match vs mismatch?",
              "back": "If xᵢ = yⱼ: c[i][j] = c[i−1][j−1] + 1. If xᵢ ≠ yⱼ: c[i][j] = max(c[i−1][j], c[i][j−1]). Base: c[0][j] = c[i][0] = 0."
            },
            {
              "id": "a9l2-i2",
              "front": "Why does z_k = xᵢ when xᵢ = yⱼ in an LCS?",
              "back": "Otherwise we could append the common character xᵢ=yⱼ to Z, getting a longer common subsequence — contradicting that Z is longest."
            },
            {
              "id": "a9l2-i3",
              "front": "LCS time and space, and witness recovery?",
              "back": "Θ(mn) time and space; one back-pointer per cell, trace from (m,n) in O(m+n) to recover an actual LCS."
            },
            {
              "id": "a9l2-i4",
              "front": "Edit-distance recurrence (mismatch case)?",
              "back": "1 + min(d[i−1][j] delete, d[i][j−1] insert, d[i−1][j−1] substitute); on a match take d[i−1][j−1] with no cost. Θ(mn)."
            },
            {
              "id": "a9l2-i5",
              "front": "How many cells for LCS of m=8, n=5?",
              "back": "m·n = 40 prefix-pair subproblems, Θ(1) each, Θ(mn) total."
            }
          ]
        },
        {
          "id": "a9l3",
          "title": "Knapsack & Matrix-Chain",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Two recurrences worth memorizing",
              "body": "0/1 knapsack and matrix-chain multiplication are the canonical 'choose among options per subproblem' DPs. Knapsack conditions on a binary include/exclude decision; matrix-chain conditions on a split point ranging over a subchain. Both illustrate the cut-and-paste proof of optimal substructure, and knapsack additionally teaches the crucial distinction between polynomial and **pseudo-polynomial** time."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The 0/1 knapsack problem and subproblem",
              "statement": "Given n items with positive integer values vᵢ and weights wᵢ (1 ≤ i ≤ n) and an integer capacity W, choose a subset S ⊆ {1, …, n} maximizing Σ_{i∈S} vᵢ subject to Σ_{i∈S} wᵢ ≤ W. Each item is taken whole or not at all (hence *0/1*). Define K(i, w) = the maximum total value achievable using a subset of items {1, …, i} with total weight ≤ w, for 0 ≤ i ≤ n and 0 ≤ w ≤ W. The answer is K(n, W).",
              "proof": null
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "0/1 knapsack recurrence",
              "statement": "K(0, w) = 0 for all w ≥ 0, and for i ≥ 1\n\nK(i, w) = K(i−1, w),                              if wᵢ > w;\nK(i, w) = max( K(i−1, w),  vᵢ + K(i−1, w − wᵢ) ), if wᵢ ≤ w.\n\nThat is, the second term is included exactly when item i fits.",
              "proof": "**Base case.** With no items available (i = 0), the only feasible subset is ∅, of value 0, for every capacity w; so K(0, w) = 0.\n\n**Inductive step.** Fix i ≥ 1 and capacity w, and let S* be an optimal subset of {1, …, i} of weight ≤ w with value K(i, w). Condition on whether item i ∈ S*.\n\n*Case item i ∉ S*.* Then S* ⊆ {1, …, i−1} and has weight ≤ w, so its value is at most K(i−1, w); and since S* is itself a feasible subset of {1,…,i−1} within w, its value is at least K(i−1, w). Hence value(S*) = K(i−1, w). Moreover S* must be optimal for the subproblem (i−1, w): if some S′ ⊆ {1,…,i−1} of weight ≤ w had value > K(i−1, w) ≥ value(S*), it would also be a feasible subset of {1,…,i} within w with larger value, contradicting optimality of S* (cut-and-paste).\n\n*Case item i ∈ S*.* Then wᵢ ≤ w (else S* exceeds capacity). Let S′ = S* \\ {i}. Then S′ ⊆ {1,…,i−1} has weight ≤ w − wᵢ, and value(S*) = vᵢ + value(S′). The remainder S′ must be optimal for (i−1, w − wᵢ): if some T ⊆ {1,…,i−1} of weight ≤ w − wᵢ had value > value(S′), then T ∪ {i} would be a feasible subset of {1,…,i} within w (weight ≤ (w − wᵢ) + wᵢ = w) of value vᵢ + value(T) > value(S*), contradicting optimality (cut-and-paste). Hence value(S*) = vᵢ + K(i−1, w − wᵢ).\n\nThe true optimum K(i, w) is the better of whichever cases are available. If wᵢ > w, item i cannot be in any feasible subset, so only the exclude case applies: K(i, w) = K(i−1, w). If wᵢ ≤ w, both cases are feasible and K(i, w) = max( K(i−1, w), vᵢ + K(i−1, w − wᵢ) ). ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Knapsack running time",
              "statement": "Tabulating K over all (i, w) with 0 ≤ i ≤ n, 0 ≤ w ≤ W computes K(n, W) in Θ(nW) time and Θ(nW) space (reducible to Θ(W) space if only the value is needed).",
              "proof": "The table has (n+1)(W+1) = Θ(nW) entries. Each K(i, w) is computed from K(i−1, w) and K(i−1, w − wᵢ) — both in the previous row — by a comparison, an addition, and a max: O(1) work, given a row-by-row fill order (i increasing). By the DP running-time proposition the total is Θ(nW)·O(1) = Θ(nW). Since each row depends only on the previous one, two rows (or one row updated right-to-left in w) suffice for the optimal *value*, giving Θ(W) space; reconstructing the chosen subset needs the full Θ(nW) table or a back-pointer scan. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Θ(nW) is pseudo-polynomial, not polynomial.** The capacity W is a *numeric value*; encoding it in the input takes only ⌈log₂ W⌉ bits. So a running time of Θ(nW) is exponential in the *bit length* of the input (W = 2^{log W}). A genuinely polynomial algorithm would be polynomial in n and log W. 0/1 knapsack is **NP-hard**, so no truly polynomial algorithm is known; the DP is efficient only when W is small (polynomially bounded). The fill-in-the-blank: Θ(nW) is **pseudo**-polynomial."
            },
            {
              "type": "code",
              "heading": "0/1-KNAPSACK (tabulation)",
              "lang": "pseudocode",
              "code": "ZERO-ONE-KNAPSACK(v, w, n, W):\n  let K[0..n][0..W]\n  for cap = 0 to W: K[0][cap] = 0\n  for i = 1 to n:\n    for cap = 0 to W:\n      if w[i] > cap:\n        K[i][cap] = K[i-1][cap]            // item i doesn't fit\n      else:\n        K[i][cap] = max( K[i-1][cap],\n                         v[i] + K[i-1][cap - w[i]] )\n  return K[n][W]\n\n// Recover the chosen items by walking back from (n, W):\n//   if K[i][cap] != K[i-1][cap], item i was taken; cap -= w[i]."
            },
            {
              "type": "example",
              "heading": "Worked knapsack: 4 items, W = 5",
              "body": "Items (vᵢ, wᵢ): item1 (3,2), item2 (4,3), item3 (5,4), item4 (6,5). Compute K row by row.\n\nK[1][·] over cap 0..5: 0,0,3,3,3,3 (take item1 once cap ≥ 2).\nK[2][·]: cap 3 → max(K1[3]=3, 4+K1[0]=4) = 4; cap 5 → max(K1[5]=3, 4+K1[2]=4+3=7) = **7** (items 1+2, weight 5, value 7).\nK[3][4] → max(K2[4]=4, 5+K2[0]=5) = 5; K[3][5] → max(K2[5]=7, 5+K2[1]=5) = 7.\nK[4][5] → max(K3[5]=7, 6+K3[0]=6) = **7**.\n\nOptimum K[4][5] = **7**, achieved by items 1 and 2 (weights 2+3 = 5, values 3+4 = 7). Note item3 (5,4) and item4 (6,5) alone are worse — the DP found the right *combination* by trying include/exclude at every (i, w)."
            },
            {
              "type": "text",
              "heading": "Matrix-chain multiplication",
              "body": "Given matrices A₁, …, A_n where Aₖ has dimension p_{k−1} × p_k, the product A₁A₂⋯A_n is fixed but its *parenthesization* is not, and different parenthesizations cost wildly different numbers of scalar multiplications (multiplying a p×q by a q×r matrix costs p·q·r). We seek the parenthesization minimizing total scalar multiplications.\n\nLet m[i][j] (for 1 ≤ i ≤ j ≤ n) be the minimum cost of computing the subproduct Aᵢ⋯Aⱼ. The outermost multiply splits the chain at some k, i ≤ k < j, into (Aᵢ⋯Aₖ)(A_{k+1}⋯Aⱼ), whose final multiply costs p_{i−1}·p_k·p_j."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Matrix-chain recurrence and Θ(n³) bound",
              "statement": "m[i][i] = 0 for all i, and for i < j\n\nm[i][j] = min_{i ≤ k < j} ( m[i][k] + m[k+1][j] + p_{i−1}·p_k·p_j ).\n\nTabulating m over all subchains computes m[1][n] in Θ(n³) time and Θ(n²) space.",
              "proof": "**Correctness (optimal substructure).** Any parenthesization of Aᵢ⋯Aⱼ has a *last* multiplication that combines Aᵢ⋯Aₖ with A_{k+1}⋯Aⱼ for some split k, i ≤ k < j. The two operands are themselves parenthesizations of the subchains i..k and k+1..j, and in an optimal solution each must be optimal for its subchain: if the left operand cost more than m[i][k], replacing it by an optimal parenthesization of Aᵢ⋯Aₖ (it produces the same p_{i−1}×p_k matrix, so the final multiply is unchanged) would strictly lower the total — contradiction; symmetrically for the right (cut-and-paste). The final multiply of a p_{i−1}×p_k by a p_k×p_j matrix costs p_{i−1}·p_k·p_j. Since the optimal split k is unknown, we minimize over all i ≤ k < j, giving the recurrence; the base m[i][i] = 0 holds because a single matrix needs no multiplication.\n\n**Running time.** The subproblems are the contiguous subchains (i, j) with 1 ≤ i ≤ j ≤ n; there are C(n,2) + n = n(n+1)/2 = Θ(n²) of them. Filling m[i][j] minimizes over j − i ≤ n − 1 split points, i.e. O(n) work per subproblem (each candidate is a table lookup plus a constant-size arithmetic). By the DP running-time proposition, total time is Θ(n²)·O(n) = **Θ(n³)**. The table m (and an auxiliary split table s) hold Θ(n²) entries, so space is Θ(n²). Cells must be filled in order of increasing chain length ℓ = j − i + 1 so that shorter subchains are ready. ∎"
            },
            {
              "type": "example",
              "heading": "Matrix-chain: dimensions ⟨5, 4, 6, 2⟩",
              "body": "Take p = ⟨5, 4, 6, 2⟩: A₁ is 5×4, A₂ is 4×6, A₃ is 6×2.\n\nm[1][1] = m[2][2] = m[3][3] = 0.\nm[1][2] = p₀p₁p₂ = 5·4·6 = 120. m[2][3] = p₁p₂p₃ = 4·6·2 = 48.\nm[1][3] = min over k ∈ {1, 2}:\n  k=1: m[1][1] + m[2][3] + p₀p₁p₃ = 0 + 48 + 5·4·2 = 48 + 40 = 88;\n  k=2: m[1][2] + m[3][3] + p₀p₂p₃ = 120 + 0 + 5·6·2 = 120 + 60 = 180.\nThe minimum is **88**, at split k = 1, i.e. parenthesization A₁(A₂A₃). The cost gap (88 vs 180) over just three matrices shows why the DP matters."
            },
            {
              "type": "decision",
              "heading": "The three classic recurrences at a glance",
              "rows": [
                [
                  "LCS / edit distance",
                  "Θ(mn) — one subproblem per prefix pair (i,j), O(1) each"
                ],
                [
                  "0/1 knapsack",
                  "Θ(nW) — subproblems (i,w), O(1) each; pseudo-polynomial in W"
                ],
                [
                  "Matrix-chain order",
                  "Θ(n³) — Θ(n²) subchain subproblems (i,j), O(n) split scan each"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Reading running time off the subproblem space.** Each recurrence's cost is (count of subproblems) × (work to combine). Matrix-chain: Θ(n²) subproblems × O(n) splits = Θ(n³), so in Θ(nᵈ), **d = 3**. Knapsack: Θ(nW) subproblems × O(1) = Θ(nW). LCS: Θ(mn) × O(1) = Θ(mn). Master this product and you can analyze any new DP on sight."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Matrix-chain multiplication has Θ(n²) subproblems, each costing O(n) to fill. It runs in Θ(nᵈ). What is d, and why?",
                  "solution": "By the DP running-time rule, total time = (number of subproblems) × (work per subproblem) = Θ(n²)·O(n) = Θ(n³). Hence **d = 3**. The Θ(n²) counts contiguous subchains (i,j) with i ≤ j; the O(n) is the scan over split points i ≤ k < j.",
                  "hint": "Multiply the subproblem count by the per-subproblem split scan."
                },
                {
                  "prompt": "0/1 knapsack's Θ(nW) DP is called ____-polynomial. Fill the blank and justify in one sentence.",
                  "solution": "**Pseudo**-polynomial. The capacity W is a numeric value encoded in only ⌈log W⌉ bits, so Θ(nW) is exponential in the input's bit length (W = 2^{log W}); a truly polynomial bound would be polynomial in n and log W.",
                  "hint": "The blank is the word for 'polynomial in the magnitude of a number, not its bit length'."
                },
                {
                  "prompt": "Prove the 'include' branch of the knapsack recurrence: if an optimal subset for (i, w) contains item i (so wᵢ ≤ w), its value is vᵢ + K(i−1, w − wᵢ).",
                  "solution": "Let S* be optimal for (i, w) with i ∈ S*; feasibility forces wᵢ ≤ w. Set S′ = S* \\ {i} ⊆ {1,…,i−1}, weight ≤ w − wᵢ, and value(S*) = vᵢ + value(S′). Claim S′ is optimal for (i−1, w − wᵢ): if some T ⊆ {1,…,i−1} of weight ≤ w − wᵢ had value > value(S′), then T ∪ {i} is feasible for (i, w) (weight ≤ w) with value vᵢ + value(T) > value(S*), contradicting optimality of S*. Hence value(S′) = K(i−1, w − wᵢ) and value(S*) = vᵢ + K(i−1, w − wᵢ). ∎",
                  "hint": "Remove item i, then cut-and-paste: a better remainder plus item i would beat the supposed optimum."
                },
                {
                  "prompt": "For matrices with dimension sequence p = ⟨10, 100, 5, 50⟩ (so A₁ is 10×100, A₂ is 100×5, A₃ is 5×50), find the optimal parenthesization cost.",
                  "solution": "m[1][2] = 10·100·5 = 5000; m[2][3] = 100·5·50 = 25000. m[1][3] = min: k=1: m[1][1]+m[2][3]+p₀p₁p₃ = 0 + 25000 + 10·100·50 = 25000 + 50000 = 75000; k=2: m[1][2]+m[3][3]+p₀p₂p₃ = 5000 + 0 + 10·5·50 = 5000 + 2500 = 7500. Minimum = **7500**, parenthesization (A₁A₂)A₃. The naive A₁(A₂A₃) costs 75000 — a 10× difference.",
                  "hint": "Only two split points; compute each as m-left + m-right + p_{i−1}·p_k·p_j and take the min."
                },
                {
                  "prompt": "Why does the bottom-up matrix-chain DP fill cells in order of increasing chain length ℓ = j − i + 1 rather than row-major?",
                  "solution": "m[i][j] depends on m[i][k] and m[k+1][j] for i ≤ k < j — both strictly shorter subchains (lengths < ℓ). Filling by increasing ℓ guarantees every dependency is already computed when m[i][j] is evaluated. A plain row-major (i outer, j inner) order would, for fixed i, need m[k+1][j] with k+1 > i, whose row has not yet been filled. Ordering by length respects the dependency DAG; there are still Θ(n²) cells and O(n) work each, so Θ(n³) overall.",
                  "hint": "List which entries m[i][j] reads, then ask what order makes all of them already present."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a9l3-i1",
              "front": "0/1 knapsack recurrence?",
              "back": "K(i,w) = K(i−1,w) if wᵢ > w; else max(K(i−1,w), vᵢ + K(i−1,w−wᵢ)). Base K(0,w)=0. Time Θ(nW)."
            },
            {
              "id": "a9l3-i2",
              "front": "Why is Θ(nW) pseudo-polynomial?",
              "back": "W is a value encoded in log W bits, so Θ(nW) is exponential in the input bit length; truly polynomial would be poly(n, log W). Knapsack is NP-hard."
            },
            {
              "id": "a9l3-i3",
              "front": "Matrix-chain recurrence?",
              "back": "m[i][j] = min_{i≤k<j}(m[i][k] + m[k+1][j] + p_{i−1}·p_k·p_j), m[i][i]=0. Θ(n²) subproblems × O(n) = Θ(n³)."
            },
            {
              "id": "a9l3-i4",
              "front": "Cut-and-paste for knapsack 'include' case?",
              "back": "Remove item i from the optimum; if its remainder weren't optimal for (i−1, w−wᵢ), a better remainder plus item i would beat the optimum — contradiction."
            },
            {
              "id": "a9l3-i5",
              "front": "General DP running-time formula, with matrix-chain as instance?",
              "back": "(subproblems) × (work each). Matrix-chain: Θ(n²) × O(n) = Θ(n³), so d = 3 in Θ(nᵈ)."
            }
          ]
        }
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
          "id": "a10l1",
          "title": "Aggregate & Accounting Methods",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "Why a worst-case-per-operation bound lies",
              "body": "Suppose you analyze a data structure and find that a single operation can cost Θ(n) in the worst case. The naive conclusion — that *m* operations cost Θ(mn) — is almost always a gross overestimate. The expensive case typically cannot recur on every operation: a costly resize, a long path-compression, a cascade of bit flips each leaves the structure in a state from which the next expensive event is far away.\n\n**Amortized analysis** is the discipline of charging each operation a fixed *amortized cost* such that, over **any** sequence of *m* operations, the sum of amortized costs is a valid upper bound on the sum of actual costs. The per-operation worst case may be large, yet the amortized cost can be O(1). Crucially this is a *worst-case* guarantee over the sequence — there is no averaging over random inputs and no probability anywhere."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Amortized cost (sequence bound)",
              "statement": "Let a data structure undergo a sequence of operations with actual costs c₁, c₂, …, c_m. An assignment of **amortized costs** â₁, …, â_m is *valid* if for every prefix length m,\n\n  Σ_{i=1}^{m} c_i ≤ Σ_{i=1}^{m} â_i.\n\nThe per-operation amortized cost is the bound we report (e.g. \"O(1) amortized\"). The defining requirement is that the inequality hold for the **worst** sequence the adversary can choose — not in expectation."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Amortized ≠ average-case.** Average-case analysis averages over a *probability distribution on inputs* and can be defeated by an unlucky input. Amortized analysis makes **no probabilistic assumption**: the bound Σ c_i ≤ Σ â_i holds for the single worst sequence. A hash table is \"O(1) average-case\" (a randomized claim); a dynamic array is \"O(1) amortized\" (a deterministic, adversary-proof claim)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The aggregate method",
              "statement": "In the **aggregate method** one proves a single bound T(m) on the total actual cost of *any* sequence of m operations, then assigns every operation the same amortized cost â = T(m)/m. Because Σ c_i = (total) ≤ T(m) = m·â = Σ â_i, the assignment is valid by definition. The method is blunt — every operation type gets the *same* amortized charge — but when a clean closed form for the total exists it is the shortest possible argument."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The accounting method",
              "statement": "In the **accounting method** we assign each operation an amortized charge âᵢ (possibly differing by operation type). When âᵢ > cᵢ the surplus âᵢ − cᵢ is stored as **credit** on specific objects of the data structure; when âᵢ < cᵢ the deficit is paid by spending previously stored credit. Writing credit(i) for the total credit banked after operation i, the bookkeeping identity is\n\n  Σ_{i=1}^{m} âᵢ − Σ_{i=1}^{m} cᵢ = credit(m) − credit(0).\n\nWith credit(0) = 0, validity (Σ c ≤ Σ â) is *equivalent* to the **invariant** credit(m) ≥ 0 for every m. The art is choosing charges so that credit never goes negative."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Non-negative credit ⇒ valid amortization",
              "statement": "If credit(0) = 0 and credit(m) ≥ 0 for all m ≥ 0, then Σ_{i=1}^{m} cᵢ ≤ Σ_{i=1}^{m} âᵢ for all m; i.e. the amortized charges are valid.",
              "proof": "Each operation deposits âᵢ and withdraws cᵢ from the credit account, so by construction credit(m) = credit(0) + Σ_{i=1}^{m}(âᵢ − cᵢ). With credit(0) = 0 this is credit(m) = Σ_{i=1}^{m} âᵢ − Σ_{i=1}^{m} cᵢ. The hypothesis credit(m) ≥ 0 therefore gives Σ_{i=1}^{m} âᵢ − Σ_{i=1}^{m} cᵢ ≥ 0, i.e. Σ cᵢ ≤ Σ âᵢ. ∎"
            },
            {
              "type": "code",
              "heading": "The k-bit binary counter",
              "lang": "text",
              "code": "INCREMENT(A):           // A[0..k-1], A[0] is the low bit\n  i = 0\n  while i < k and A[i] == 1:\n      A[i] = 0            // a 1 → 0 flip (a reset)\n      i = i + 1\n  if i < k:\n      A[i] = 1            // the single 0 → 1 flip (a set)\n\n// Cost of one INCREMENT = number of bits flipped = (# trailing 1s) + 1."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Aggregate bound for the binary counter",
              "statement": "Starting from zero, any sequence of n INCREMENT operations on an (unbounded) binary counter performs fewer than 2n bit flips in total; hence the amortized cost is fewer than 2 flips per increment, i.e. Θ(1).",
              "proof": "Account for the flips bit-position by bit-position rather than operation by operation. Bit A[0] flips on **every** increment — n times. Bit A[1] flips on every second increment — ⌊n/2⌋ times. In general bit A[i] toggles exactly once every 2ⁱ increments, so over n increments it flips ⌊n/2ⁱ⌋ times. The total number of flips is therefore\n\n  Σ_{i=0}^{∞} ⌊n/2ⁱ⌋ ≤ Σ_{i=0}^{∞} n/2ⁱ = n · Σ_{i=0}^{∞} (1/2)ⁱ = n · 2 = 2n.\n\n(The sum is finite because ⌊n/2ⁱ⌋ = 0 once 2ⁱ > n, namely beyond i = ⌊log₂ n⌋.) Thus the total is at most 2n, and strictly less than 2n once n ≥ 1 since the geometric tail is never fully attained. Dividing by n, the aggregate (hence amortized) cost is below 2 = Θ(1) per increment. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Accounting bound for the binary counter",
              "statement": "Charging â = 2 per INCREMENT keeps the credit invariant credit ≥ 0, with the credit on the structure equal at all times to the number of 1-bits in the counter. Hence n increments cost at most 2n flips.",
              "proof": "Adopt the scheme: pay 1 dollar for every 1 → 0 reset, and pay 2 dollars for the single 0 → 1 set inside an increment — 1 to perform the set now and 1 placed *as credit on that newly-set bit*. We claim every 1-bit in the counter always carries exactly 1 dollar of stored credit; equivalently credit = (number of 1-bits) ≥ 0.\n\nInductively, the invariant holds for the empty counter (0 ones, $0). An increment resets some run of trailing 1-bits and sets one 0-bit. Each reset bit carried $1 by the invariant, and that dollar pays for its own reset — so the resets cost the algorithm nothing out of pocket. The set costs $2, $1 done now and $1 left on the new 1-bit, restoring the invariant. The amortized charge is therefore exactly the $2 spent at the set step, independent of how many bits were reset; the per-reset costs are fully covered by banked credit, so credit never drops below 0. By the credit lemma, total actual flips ≤ Σ â = 2n. ∎"
            },
            {
              "type": "example",
              "heading": "Tracing the counter, watching the credit",
              "body": "Start at 0000 and increment. The right column is the credit = number of 1-bits, which must stay ≥ 0.\n\n0000 →(set b0)→ 0001  actual 1, credit 1\n0001 →(reset b0, set b1)→ 0010  actual 2, credit 1\n0010 →(set b0)→ 0011  actual 1, credit 2\n0011 →(reset b0,b1, set b2)→ 0100  actual 3, credit 1\n0100 →(set b0)→ 0101  actual 1, credit 2\n\nThe expensive step 0011 → 0100 flips 3 bits, but it *spent* the 2 dollars banked on bits b0 and b1 to do it. Each increment was charged a flat â = 2; the running surplus (credit) is always exactly the number of 1s, never negative — precisely the accounting invariant."
            },
            {
              "type": "decision",
              "heading": "Aggregate vs. accounting — when to reach for which",
              "rows": [
                [
                  "Aggregate method",
                  "Use when a clean closed form for the *total* cost of m operations is available (e.g. Σ⌊n/2ⁱ⌋). One charge for all operations; simplest when it applies."
                ],
                [
                  "Accounting method",
                  "Use when different operation *types* deserve different charges, or when you want a concrete 'who pays for the expensive step' story. Requires inventing charges and proving credit ≥ 0."
                ],
                [
                  "Potential method (next lesson)",
                  "The accounting method made systematic: replace ad-hoc credit with a single state function Φ. Best when credit is naturally a function of the current configuration."
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A k-bit counter also supports RESET, which zeroes all bits, with actual cost equal to the number of 1-bits cleared. Show that with INCREMENT and RESET mixed arbitrarily, the amortized cost per operation is still O(1) under a suitable accounting scheme.",
                  "hint": "Keep the invariant credit = number of 1-bits. What charge does RESET need so the cleared bits are paid for by their own banked dollars?",
                  "solution": "Maintain the invariant that every 1-bit carries $1, so credit = (#1-bits) ≥ 0. Charge INCREMENT â = 2 exactly as before (this preserves the invariant). Charge RESET â = 0: every bit it clears is a 1-bit carrying $1, and that dollar pays for clearing it, after which the counter is all zeros with $0 credit — invariant restored, credit still ≥ 0. Both charges are O(1), so by the credit lemma any sequence of m operations costs ≤ Σ â ≤ 2m total, i.e. O(1) amortized per operation. ∎"
                },
                {
                  "prompt": "Suppose INCREMENT had to charge a flat amortized cost but RESET were free of charge AND no credit existed. Exhibit a sequence showing the per-operation actual cost is NOT O(1) without amortization's banking — i.e. why a single-operation worst case is misleading.",
                  "hint": "A single INCREMENT just after the counter is all 1s.",
                  "solution": "Fill a k-bit counter to all 1s (k increments), then the next INCREMENT (on 11…1) flips all k bits, costing Θ(k) in that one operation. So the single-operation worst case is Θ(k) = Θ(log n) for n up to 2ᵏ. Taken naively, m operations would appear to cost Θ(m log n). Amortization corrects this: that Θ(k) operation can only happen after 2^(k)−1 cheap ones banked the needed credit, so averaged over the sequence the cost collapses to O(1). The exercise illustrates that the per-operation worst case (Θ(k)) and the amortized cost (Θ(1)) are genuinely different quantities. ∎"
                },
                {
                  "prompt": "Give the aggregate-method total flip count for n increments *exactly* (not just the ≤ 2n bound), and confirm it is < 2n.",
                  "solution": "The exact total is Σ_{i=0}^{⌊log₂ n⌋} ⌊n/2ⁱ⌋. Drop the floors as an upper bound: Σ_{i≥0} n/2ⁱ = 2n, but the i=0 term is exactly n (no floor effect) and every higher term loses a fractional part, so the true total is 2n − (sum of the discarded fractional parts) < 2n whenever n ≥ 1. For instance n = 5: ⌊5/1⌋+⌊5/2⌋+⌊5/4⌋ = 5+2+1 = 8 < 10 = 2·5. ∎"
                },
                {
                  "prompt": "A stack supports PUSH, POP (each O(1)) and MULTIPOP(k) which pops min(k, size) elements one at a time. Using the aggregate method, prove any sequence of n stack operations starting from an empty stack runs in O(n) total, hence O(1) amortized.",
                  "hint": "How many times can an element be popped relative to how many times it is pushed?",
                  "solution": "Each element is PUSHed at most once and can be POPped (whether by POP or inside a MULTIPOP) at most once thereafter. Over n operations there are at most n PUSHes, so at most n total pops are ever performed across all POP and MULTIPOP calls combined. The total work of all MULTIPOPs and POPs is therefore ≤ n, and the PUSHes contribute ≤ n, giving total actual cost ≤ 2n = O(n). Dividing by the n operations gives O(1) amortized each — even though a single MULTIPOP can cost Θ(n). ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a10l1-i1",
              "front": "Amortized cost vs average-case — the key distinction?",
              "back": "Amortized: Σ c_i ≤ Σ â_i over the WORST sequence, no probability. Average-case: expectation over a distribution on inputs. Amortized is an adversary-proof, deterministic guarantee."
            },
            {
              "id": "a10l1-i2",
              "front": "Aggregate method — definition?",
              "back": "Bound the total actual cost T(m) of any m-operation sequence, then assign every operation â = T(m)/m. Valid because Σ c ≤ T(m) = m·â = Σ â."
            },
            {
              "id": "a10l1-i3",
              "front": "Accounting method invariant and why it suffices?",
              "back": "Assign charges â_i; bank surplus as credit, spend it on deficits. If credit(0)=0 and credit(m)≥0 ∀m then Σ c ≤ Σ â, since credit(m) = Σâ − Σc."
            },
            {
              "id": "a10l1-i4",
              "front": "Binary counter: total flips over n increments and why?",
              "back": "< 2n. Bit i flips ⌊n/2ⁱ⌋ times; Σ⌊n/2ⁱ⌋ ≤ Σ n/2ⁱ = 2n. Amortized < 2 = Θ(1) per increment."
            },
            {
              "id": "a10l1-i5",
              "front": "Accounting scheme for the binary counter?",
              "back": "Charge 2 per increment: 1 to set the new 1-bit now, 1 banked on it. Each reset is paid by the dollar banked on that bit. Credit = #1-bits ≥ 0 always."
            },
            {
              "id": "a10l1-i6",
              "front": "Stack with MULTIPOP — amortized cost and argument?",
              "back": "O(1) amortized. Each element is pushed ≤ once and popped ≤ once, so total pops over n ops ≤ n; total work ≤ 2n = O(n), despite a single MULTIPOP costing Θ(n)."
            }
          ]
        },
        {
          "id": "a10l2",
          "title": "The Potential Method",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Credit as a function of state",
              "body": "The accounting method scatters credit across individual objects and asks you to verify, by hand, that it never runs out. The **potential method** packages all of that banked credit into a single number Φ computed from the *current configuration* of the data structure. Instead of tracking where each dollar sits, we track one scalar — the structure's \"stored energy\" — and let the algebra of telescoping sums do the bookkeeping. Splay trees, Fibonacci heaps, and the union-find bound all yield to this one template; it is the most powerful of the three methods."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Potential function and amortized cost",
              "statement": "Let D₀ be the initial structure and Dᵢ the structure after the i-th operation. A **potential function** Φ maps each configuration Dᵢ to a real number Φ(Dᵢ). The **amortized cost** of the i-th operation, with actual cost cᵢ, is defined as\n\n  âᵢ = cᵢ + Φ(Dᵢ) − Φ(D_{i-1}) = cᵢ + ΔΦᵢ.\n\nThat is, amortized cost = actual cost + change in potential."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The potential method bounds total cost",
              "statement": "For any sequence of m operations with amortized costs âᵢ = cᵢ + ΔΦᵢ,\n\n  Σ_{i=1}^{m} cᵢ = Σ_{i=1}^{m} âᵢ + Φ(D₀) − Φ(D_m).\n\nIn particular, if Φ(D_m) ≥ Φ(D₀) for all m — which is guaranteed when Φ(D₀) = 0 and Φ(Dᵢ) ≥ 0 for all i — then Σ cᵢ ≤ Σ âᵢ, so the amortized costs are a valid upper bound on the actual total.",
              "proof": "Sum the defining identity over i = 1 … m:\n\n  Σ_{i=1}^{m} âᵢ = Σ_{i=1}^{m} (cᵢ + Φ(Dᵢ) − Φ(D_{i-1})) = Σ_{i=1}^{m} cᵢ + Σ_{i=1}^{m}(Φ(Dᵢ) − Φ(D_{i-1})).\n\nThe second sum **telescopes**: consecutive terms cancel, leaving only the last minus the first, Φ(D_m) − Φ(D₀). Hence Σ âᵢ = Σ cᵢ + Φ(D_m) − Φ(D₀), which rearranges to the claimed identity Σ cᵢ = Σ âᵢ + Φ(D₀) − Φ(D_m).\n\nNow if Φ(D_m) ≥ Φ(D₀) the term Φ(D₀) − Φ(D_m) ≤ 0, so Σ cᵢ ≤ Σ âᵢ. The condition Φ(D₀)=0 with Φ(Dᵢ) ≥ 0 is the standard sufficient way to ensure Φ(D_m) ≥ Φ(D₀) = 0 at every prefix. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Equivalence to accounting.** Setting credit(i) = Φ(Dᵢ) − Φ(D₀) turns the potential method into the accounting method: âᵢ − cᵢ = ΔΦᵢ is exactly the deposit/withdrawal, and Φ(Dᵢ) ≥ Φ(D₀) is exactly credit(i) ≥ 0. The potential method is the accounting method with the credit forced to be a *function of the configuration alone*."
            },
            {
              "type": "text",
              "heading": "The design principle for Φ",
              "body": "A potential is useful precisely when it is **large exactly before an expensive operation and collapses when that operation fires**. The expensive operation then has a large positive cᵢ but a large negative ΔΦᵢ, and the two cancel down to a constant amortized cost. Conversely the cheap operations must *raise* Φ a little (paying a small surcharge) so the bank is full when the expensive event arrives. If Φ ever fails to be ≥ Φ(D₀), the proof is invalid — the structure would have spent credit it never banked."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Binary counter via the potential method",
              "statement": "Let Φ(D) = (number of 1-bits in the counter D). Then Φ(D₀) = 0, Φ ≥ 0 always, and every INCREMENT has amortized cost â ≤ 2. Hence n increments cost ≤ 2n total: Θ(1) amortized.",
              "proof": "An increment that resets t trailing 1-bits and then sets one 0-bit has actual cost c = t + 1 (t resets plus one set). Its effect on Φ: t ones become zeros (−t) and one zero becomes a one (+1), so ΔΦ = 1 − t. Therefore\n\n  â = c + ΔΦ = (t + 1) + (1 − t) = 2,\n\nindependent of t. (If the counter were finite and overflowed from all-1s, no 0 is set, c = t and ΔΦ = −t giving â = 0 ≤ 2; the bound still holds.) Since Φ(D₀) = 0 and Φ ≥ 0, the potential theorem gives Σ c ≤ Σ â = 2n. ∎"
            },
            {
              "type": "code",
              "heading": "Dynamic array (table-doubling) append",
              "lang": "text",
              "code": "APPEND(T, x):                         // T has fields .num, .size, .data\n  if T.num == T.size:                 // table full → grow\n      new = allocate(max(1, 2*T.size)) // double the capacity\n      copy T.data[0..num-1] into new   // cost = T.num element moves\n      T.data = new\n      T.size = max(1, 2*T.size)\n  T.data[T.num] = x                    // cost 1 to place x\n  T.num = T.num + 1\n\n// Actual cost: 1 for a non-full table; (T.num + 1) when a doubling copy fires."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "O(1) amortized append with Φ = 2·num − size",
              "statement": "For a dynamic table that doubles its capacity when full, define Φ(T) = 2·num − size, where num is the number of stored elements and size is the current capacity. Then (i) Φ(T₀) = 0, (ii) Φ(T) ≥ 0 at every moment, and (iii) every APPEND has amortized cost exactly 3. Consequently n appends from empty cost at most 3n = O(n): O(1) amortized.",
              "proof": "*(i) Initial value.* The empty table has num = size = 0, so Φ = 2·0 − 0 = 0.\n\n*(ii) Non-negativity.* The table always satisfies num ≤ size (you never store more than capacity), and immediately after any doubling num ≥ size/2 (we double only when full, so right after doubling num = old size = new size/2, and num only rises from there until the next doubling). From num ≥ size/2 we get 2·num ≥ size, i.e. Φ = 2·num − size ≥ 0. Between doublings size is fixed and num increases, so Φ only grows — it cannot dip below 0. Hence Φ ≥ 0 throughout.\n\n*(iii) Amortized cost, two cases.* Write num, size for the values *before* the append.\n\n  • **Case A — no resize (num < size).** Actual cost c = 1 (place x). num increases by 1, size unchanged, so ΔΦ = (2·(num+1) − size) − (2·num − size) = 2. Amortized â = c + ΔΦ = 1 + 2 = 3.\n\n  • **Case B — resize (num = size).** We allocate capacity 2·size, copy all size elements, then place x: actual cost c = size + 1. After the operation num becomes size + 1 and the capacity becomes 2·size. So Φ_before = 2·size − size = size, and Φ_after = 2·(size + 1) − 2·size = 2, giving ΔΦ = 2 − size. Amortized â = c + ΔΦ = (size + 1) + (2 − size) = 3.\n\nIn both cases â = 3. By (i), (ii) and the potential theorem, Σ c ≤ Σ â = 3n, so n appends cost O(n), i.e. O(1) amortized. ∎"
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "Potential Φ = 2·num − size across appends into a table that starts at capacity 1. Cheap appends raise Φ by 2 (banking credit); the doubling copy at num = size collapses Φ from 'size' down to 2, paying for the copies. Amortized cost is a flat 3 throughout.",
              "actors": [
                "caller",
                "table"
              ],
              "messages": [
                {
                  "note": "empty: num=0 size=0 Φ=0"
                },
                {
                  "from": "caller",
                  "to": "table",
                  "label": "append → num=1 size=1, Φ=1, c=1, â=3",
                  "tone": "sage"
                },
                {
                  "from": "caller",
                  "to": "table",
                  "label": "append (FULL) → copy 1, size→2, num=2, Φ=2, c=2, â=3",
                  "tone": "ember"
                },
                {
                  "from": "caller",
                  "to": "table",
                  "label": "append (FULL) → copy 2, size→4, num=3, Φ=2, c=3, â=3",
                  "tone": "ember"
                },
                {
                  "from": "caller",
                  "to": "table",
                  "label": "append → num=4 size=4, Φ=4, c=1, â=3",
                  "tone": "sage"
                },
                {
                  "note": "Φ rises by 2 on cheap appends, falls to 2 on each doubling — net amortized 3"
                }
              ]
            },
            {
              "type": "example",
              "heading": "Why the constant in Φ matters",
              "body": "Suppose someone proposed Φ = num − size instead. After a doubling (num = size+1, capacity = 2·size) this is (size+1) − 2·size = 1 − size < 0 for size ≥ 2 — the potential goes **negative**, violating Φ ≥ Φ(D₀) = 0, and the proof breaks: you would be spending credit you never banked. The coefficient 2 on num is exactly what is needed so that a freshly doubled table (only half full) still has Φ ≥ 0. This is the design principle in action: Φ must be high (here, = size) right before the expensive doubling so its collapse to 2 pays the size copies."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Redo the binary-counter potential proof for a counter that begins with b 1-bits already set (not at zero). What total-cost bound do you get for n increments, and where does the initial potential enter?",
                  "hint": "Use Σ c = Σ â + Φ(D₀) − Φ(D_n) from the potential theorem.",
                  "solution": "With Φ = #1-bits, each increment still has â = 2 (the per-operation computation â = (t+1)+(1−t) = 2 does not depend on the starting state). The theorem gives Σ c = Σ â + Φ(D₀) − Φ(D_n) = 2n + b − Φ(D_n) ≤ 2n + b, since Φ(D_n) ≥ 0. So n increments cost at most 2n + b. The non-zero start contributes the additive Φ(D₀) = b — the credit already present at the start, which can be spent down but not exceeded. ∎"
                },
                {
                  "prompt": "Define the amortized cost of a dynamic-array operation precisely and prove that, for ANY potential with Φ(D₀)=0 and Φ ≥ 0, an operation whose amortized cost is ≤ k for all operations yields total actual cost ≤ km.",
                  "solution": "By definition â_i = c_i + Φ(D_i) − Φ(D_{i-1}). If â_i ≤ k for all i, then summing and telescoping, Σ c_i = Σ â_i + Φ(D₀) − Φ(D_m) ≤ km + 0 − Φ(D_m) ≤ km since Φ(D_m) ≥ 0 and Φ(D₀) = 0. Hence total actual cost ≤ km = O(m). This is the formal justification for reporting 'O(1) amortized' as a total-cost bound. ∎"
                },
                {
                  "prompt": "A dynamic table supports both APPEND and DELETE-LAST. If we halve the table when num drops below size/4 (not size/2), explain in one sentence why the threshold size/4 (rather than size/2) is chosen, and state a potential that gives O(1) amortized for both operations. (Sketch the cases.)",
                  "hint": "If you shrink at size/2 and grow at full, an alternating insert/delete at the boundary forces a resize every operation. Use Φ = 2·num − size when num ≥ size/2, and Φ = size/2 − num when num < size/2.",
                  "solution": "Shrinking at size/4 leaves slack so that immediately after either a grow or a shrink the load factor is bounded away from both the grow threshold (full) and the shrink threshold (1/4 full); this prevents the pathological alternating sequence that would force a resize on every operation if you shrank at size/2. Use the two-regime potential Φ = 2·num − size for num ≥ size/2 and Φ = size/2 − num for num < size/2. One checks Φ ≥ 0 everywhere and Φ = 0 right after any resize (the structure is exactly half full, num = size/2, both formulas give 0). Then: a non-resizing APPEND or DELETE changes Φ by ±2 or ±1 (constant), giving â = O(1); a resizing operation occurs only when num = size (grow) or num = size/4 (shrink), at which point Φ has accumulated to ≈ size/2 = Θ(size), exactly enough to cancel the Θ(size) copy cost, again giving â = O(1). Hence O(1) amortized for both. ∎"
                },
                {
                  "prompt": "Prove that the potential and accounting methods are interchangeable for the binary counter by exhibiting the credit on each object that equals Φ = #1-bits.",
                  "solution": "Place exactly $1 of credit on each 1-bit of the counter; the total credit is then the number of 1-bits, which is precisely Φ. The accounting invariant 'credit ≥ 0' coincides with Φ ≥ 0, and 'credit grows by ΔΦ' coincides with the deposit â − c = ΔΦ. Concretely, when an increment sets a bit it places its $1 there (deposit +1), and when it resets a bit it spends that bit's $1 (withdrawal −1 per reset), reproducing exactly the per-bit accounting scheme of Lesson 1. The two analyses are the same argument written in two notations. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a10l2-i1",
              "front": "Definition of amortized cost in the potential method?",
              "back": "â_i = c_i + ΔΦ_i = c_i + Φ(D_i) − Φ(D_{i-1}): actual cost plus the change in potential."
            },
            {
              "id": "a10l2-i2",
              "front": "Why does Σ â bound Σ c (telescoping identity)?",
              "back": "Σ c_i = Σ â_i + Φ(D₀) − Φ(D_m). If Φ(D_m) ≥ Φ(D₀) (e.g. Φ(D₀)=0, Φ≥0) the extra term is ≤ 0, so Σ c ≤ Σ â."
            },
            {
              "id": "a10l2-i3",
              "front": "Design principle for a good potential Φ?",
              "back": "Φ should be large right before an expensive op and collapse when it fires, so big +c is cancelled by big −ΔΦ. Cheap ops raise Φ a little to bank credit."
            },
            {
              "id": "a10l2-i4",
              "front": "Binary counter potential proof?",
              "back": "Φ = #1-bits. Increment resetting t ones, setting one: c = t+1, ΔΦ = 1−t, â = (t+1)+(1−t) = 2. Φ(0)=0, Φ≥0 ⇒ total ≤ 2n."
            },
            {
              "id": "a10l2-i5",
              "front": "Dynamic array: Φ and the two amortized cases?",
              "back": "Φ = 2·num − size. No-resize: c=1, ΔΦ=2, â=3. Resize (num=size): c=size+1, Φ goes size→2 (ΔΦ=2−size), â=3. Always 3 = O(1)."
            },
            {
              "id": "a10l2-i6",
              "front": "Why coefficient 2 on num (not Φ = num − size)?",
              "back": "After doubling the table is half full (num ≈ size/2); only 2·num − size stays ≥ 0 there. With num − size, Φ goes negative and the proof (Φ ≥ Φ(D₀)) fails."
            }
          ]
        },
        {
          "id": "a10l3",
          "title": "Disjoint-Set Forests: Rank & Path Compression",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "The disjoint-set abstraction",
              "body": "A **disjoint-set (union-find)** structure maintains a partition of n elements into disjoint sets, supporting MAKE-SET(x) (a new singleton), FIND-SET(x) (return a canonical representative of x's set), and UNION(x, y) (merge the two sets). It is the engine behind Kruskal's MST, connected-components, and unification. The standard implementation is a **forest**: each set is a rooted tree whose root is the representative, and each node stores a parent pointer (the root points to itself). UNION links one root under the other; FIND walks parent pointers to the root.\n\nWith no optimization, FIND can walk a path of length Θ(n) — a degenerate tree is just a linked list. Two ideas keep trees shallow and, together, drive the amortized cost down to near-constant."
            },
            {
              "type": "code",
              "heading": "Forest with union by rank + path compression",
              "lang": "text",
              "code": "MAKE-SET(x):  x.parent = x;  x.rank = 0\n\nFIND-SET(x):                    // path compression (recursive)\n  if x.parent ≠ x:\n      x.parent = FIND-SET(x.parent)   // re-point x straight at the root\n  return x.parent\n\nUNION(x, y):  LINK(FIND-SET(x), FIND-SET(y))\n\nLINK(a, b):                     // a, b are roots; union by rank\n  if a == b: return\n  if a.rank > b.rank:  b.parent = a\n  elif a.rank < b.rank:  a.parent = b\n  else:  a.parent = b;  b.rank = b.rank + 1   // tie → bump the new root's rank"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Rank, union by rank, path compression",
              "statement": "The **rank** of a node is an integer, initialized to 0 at MAKE-SET, that is an upper bound on the height of the subtree rooted at that node. **Union by rank** links the root of smaller rank under the root of larger rank (on a tie, either is chosen as the parent and its rank increments by 1). **Path compression** is performed during FIND-SET: after finding the root, every node on the find path is re-pointed directly to the root, flattening the path for all future finds."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Rank is a height bound; ranks strictly increase up a tree",
              "statement": "At all times, for any node x that is not a root, rank(x) < rank(x.parent). A root's rank is ≥ the height of its tree. Consequently a root of rank r is the root of a tree of at least 2ʳ nodes.",
              "proof": "*Strict increase along parent edges.* When x first acquires a parent it is via LINK or via path compression. In LINK, a root a of smaller rank is linked under root b of larger rank, so rank(a) < rank(b) = rank(a.parent); on a tie b's rank is incremented after a is linked, again giving rank(a) < rank(b). Path compression only changes x.parent to an *ancestor* (the root), whose rank is ≥ the rank of the old parent (ranks never decrease, and strictly increase upward), so rank(x) < rank(new parent) still holds. Ranks of nodes never decrease and the rank of a non-root never changes, so the inequality persists.\n\n*Size bound.* We show by induction on operations that a root of rank r has ≥ 2ʳ descendants. Base: rank 0 root is a singleton, 2⁰ = 1. Inductive step: a root's rank rises to r only when two rank-(r−1) roots are linked; by hypothesis each had ≥ 2^{r−1} nodes, so the merged tree has ≥ 2^{r−1} + 2^{r−1} = 2ʳ. Path compression and ordinary links never reduce a tree's node count. Hence a rank-r root governs ≥ 2ʳ nodes. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Maximum rank is ⌊log₂ n⌋",
              "statement": "With n elements total, every node's rank is at most ⌊log₂ n⌋. In particular there are at most n/2ʳ nodes that ever attain rank r.",
              "proof": "By the previous lemma a node of rank r is (or once was) the root of a tree with ≥ 2ʳ distinct elements. Since there are only n elements, 2ʳ ≤ n, i.e. r ≤ log₂ n, so r ≤ ⌊log₂ n⌋. For the count: ranks only increase, and the 2ʳ-element subtrees witnessing distinct rank-r nodes are disjoint at the moment each attains rank r (each consists of that node's then-descendants), so there can be at most n/2ʳ such nodes. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Union by rank alone gives O(log n) per operation",
              "statement": "Using union by rank but WITHOUT path compression, every FIND-SET and UNION runs in O(log n) worst-case time.",
              "proof": "Without compression, a node's rank exactly tracks subtree height, and FIND-SET walks from a node to the root along strictly rank-increasing parent edges (previous lemma). By the corollary the maximum rank, hence the maximum height, hence the longest such walk, is ⌊log₂ n⌋. So FIND-SET costs O(log n); UNION is two FIND-SETs plus O(1) linking, also O(log n). ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Path compression alone** (without union by rank) also yields a non-trivial bound: any sequence of m operations on n elements runs in O(m log n) — amortized O(log n) per operation — and more precisely O(m log_{1+m/n} n). It is the *combination* of the two heuristics that breaks through to the near-constant α(n) bound, proved next lesson."
            },
            {
              "type": "example",
              "heading": "Path compression flattening a find path",
              "body": "Suppose FIND-SET(a) traverses a → b → c → d → root r. Before: ranks strictly increase a < b < c < d < r along the path. Path compression re-points a, b, c, d all directly to r in one pass. After: each of a, b, c, d has parent r, so the *next* FIND-SET on any of them costs O(1). The traversal that paid Θ(path length) this time has 'paid forward' by making every node it touched a direct child of the root — this self-improving behavior is exactly what the amortized α(n) analysis will capitalize on."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "Union by rank linking two roots. Root b has rank 2, root a has rank 1; LINK(a,b) attaches the lower-rank root a under b, keeping height bounded by the larger rank. Ranks strictly increase toward the root.",
              "directed": true,
              "height": 60,
              "nodes": [
                {
                  "id": "b",
                  "label": "b r=2",
                  "x": 50,
                  "y": 10,
                  "tone": "gold"
                },
                {
                  "id": "c",
                  "label": "c r=1",
                  "x": 30,
                  "y": 45
                },
                {
                  "id": "a",
                  "label": "a r=1",
                  "x": 70,
                  "y": 45,
                  "tone": "sage"
                },
                {
                  "id": "d",
                  "label": "d r=0",
                  "x": 30,
                  "y": 85
                },
                {
                  "id": "e",
                  "label": "e r=0",
                  "x": 70,
                  "y": 85
                }
              ],
              "edges": [
                {
                  "from": "c",
                  "to": "b",
                  "directed": true
                },
                {
                  "from": "a",
                  "to": "b",
                  "directed": true,
                  "tone": "sage",
                  "bold": true,
                  "label": "new link"
                },
                {
                  "from": "d",
                  "to": "c",
                  "directed": true
                },
                {
                  "from": "e",
                  "to": "a",
                  "directed": true
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Prove that ranks of nodes never decrease over the lifetime of the structure, and that once a node becomes a non-root its rank is frozen forever.",
                  "hint": "Which operations modify a rank, and only for which kind of node?",
                  "solution": "Examine every rank write. MAKE-SET sets rank 0. The only other rank modification is in LINK, the line 'b.rank = b.rank + 1', which increments — never decrements — and is applied only to a node that is currently a root (LINK's arguments are roots). A node's rank is therefore never lowered. Moreover once a node x gets a parent it is never again a root (path compression and links only move it under other roots; it can never re-become a root), so no future LINK can touch x.rank. Hence a non-root's rank is frozen. ∎"
                },
                {
                  "prompt": "Show that the size bound is tight in spirit: construct a sequence of unions (no finds, so no compression) that produces a single root of rank r over exactly 2ʳ elements.",
                  "solution": "Build balanced binary unions. Start with 2ʳ singletons (rank 0). Pair them into 2^{r−1} unions of two equal-rank roots; each tie bumps a rank to 1, yielding 2^{r−1} trees of rank 1 and 2 nodes. Repeat: pair equal-rank roots level by level. After k rounds there are 2^{r−k} roots of rank k each over 2ᵏ nodes. After r rounds there is one root of rank r over 2ʳ nodes, matching the lemma's bound exactly. This shows rank r genuinely requires 2ʳ elements — the bound is achieved. ∎"
                },
                {
                  "prompt": "Without path compression, exhibit why FIND can cost Θ(log n) (not O(1)): describe the tree after the balanced unions of the previous exercise and the cost of a FIND on a deepest leaf.",
                  "solution": "After the balanced unions producing a rank-r tree over n = 2ʳ nodes, the tree is a complete binary-merge tree of height r = log₂ n. A FIND on a deepest leaf walks r = log₂ n parent pointers to the root. With no compression nothing flattens it, so repeated FINDs each cost Θ(log n). This is exactly the O(log n) bound of the union-by-rank-only theorem, and it is why path compression is added — to amortize that cost away. ∎"
                },
                {
                  "prompt": "Argue that at most n/2ʳ nodes ever have rank exactly r, and use this to set up the rank-bucketed counting that the next lesson's α(n) proof will use.",
                  "hint": "Distinct rank-r nodes own disjoint subtrees of ≥ 2ʳ nodes at the moment they reach rank r.",
                  "solution": "When a node reaches rank r it is a root over ≥ 2ʳ descendants (lemma). At that instant those descendant sets, for different rank-r roots, are disjoint (each is the set of nodes then under that root). Disjoint subsets of an n-element universe, each of size ≥ 2ʳ, number at most n/2ʳ. So at most n/2ʳ nodes ever attain rank r. Summing the partition of nodes by rank, Σ_{r≥0} (#rank-r nodes) ≤ Σ_{r≥0} n/2ʳ = 2n, confirming total ranks are 'cheap'; the next lesson refines this bucketed-by-rank counting (grouping ranks into blocks) to obtain the α(n) bound. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a10l3-i1",
              "front": "The three disjoint-set operations and the forest representation?",
              "back": "MAKE-SET, FIND-SET, UNION. Each set is a rooted tree of parent pointers; the root is the representative. FIND walks to the root; UNION links two roots."
            },
            {
              "id": "a10l3-i2",
              "front": "Union by rank — the rule?",
              "back": "Link the smaller-rank root under the larger-rank root. On a tie, pick either as parent and increment its rank by 1. Rank upper-bounds subtree height."
            },
            {
              "id": "a10l3-i3",
              "front": "Path compression — what it does?",
              "back": "During FIND-SET, after reaching the root re-point every node on the find path directly to the root, flattening it so future finds on those nodes are O(1)."
            },
            {
              "id": "a10l3-i4",
              "front": "Why is a rank-r root over ≥ 2ʳ nodes, and max rank?",
              "back": "Rank r arises only by merging two rank-(r−1) roots, each with ≥ 2^{r−1} nodes ⇒ ≥ 2ʳ. So 2ʳ ≤ n ⇒ max rank ≤ ⌊log₂ n⌋."
            },
            {
              "id": "a10l3-i5",
              "front": "Cost with union by rank ONLY (no compression)?",
              "back": "O(log n) per operation: FIND walks rank-increasing edges, and max rank = height = ⌊log₂ n⌋."
            },
            {
              "id": "a10l3-i6",
              "front": "How many nodes ever reach rank exactly r?",
              "back": "At most n/2ʳ — distinct rank-r nodes own disjoint subtrees of ≥ 2ʳ nodes at the moment they attain that rank."
            }
          ]
        },
        {
          "id": "a10l4",
          "title": "Near-Constant Union-Find & the Inverse Ackermann α(n)",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "From O(log n) to almost O(1)",
              "body": "Union by rank keeps trees of height O(log n); path compression flattens find paths on the fly. Used *together*, their amortized cost per operation is not O(log n) but **O(α(n))**, where α is the inverse Ackermann function — a function that grows so slowly it is below 5 for every n that could be physically written down. This lesson defines α(n), proves the bound by the textbook potential/charging argument (in the style of Tarjan and Kozen), and shows why α(n) is provably *not* O(1) yet operationally constant."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Ackermann's function and its inverse α",
              "statement": "Define a fast-growing hierarchy A_k(j) by A₀(j) = j + 1 and A_{k}(j) = A_{k−1}^{(j+1)}(j) (apply A_{k−1} to j a total of j+1 times). Then A₀ is successor, A₁ ≈ doubling, A₂ ≈ exponentiation, A₃ a tower of exponentials, and so on — each level dwarfs the last. The **inverse Ackermann function** is\n\n  α(n) = min { k : A_k(1) ≥ n }.\n\nBecause A₄(1) is astronomically larger than the number of atoms in the universe, α(n) ≤ 4 for every conceivably representable n. α is non-decreasing and tends to infinity, but unimaginably slowly."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**α(n) is genuinely unbounded — just not in this universe.** Since each A_k eventually exceeds any A_{k−1}, for every constant c there is an n with α(n) > c, so α(n) ≠ O(1) as a function. But A₄(1) already exceeds a tower of exponentials taller than anything you can write, so for all n you will ever encounter, α(n) ≤ 4. 'Effectively constant' is the honest phrase: a provably super-constant function you will never see exceed 4."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Rank level (Tarjan/Kozen)",
              "statement": "Ranks never change once a node is a non-root, and are bounded by ⌊log₂ n⌋. For a non-root node x with parent p, define its **level** as\n\n  level(x) = max { k : rank(p) ≥ A_k(rank(x)) },\n\nthe highest Ackermann level by which x's parent rank dominates x's own rank. Because rank(p) > rank(x) ≥ 1 (for the nodes that matter), level(x) is well-defined and 0 ≤ level(x) ≤ α(n). Level credit on a node drops whenever path compression moves x under a much-higher-ranked ancestor; the analysis charges find-path edges against either the operation or these per-node level increases."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Compression strictly raises a node's level (until it is α-deep)",
              "statement": "Whenever path compression re-points a non-root node x from its current parent to an ancestor of strictly larger rank, level(x) does not decrease, and strictly increases unless level(x) has already reached its maximum α(n). Since a node's level can rise at most α(n) times before saturating, x can be charged for at most α(n) 'expensive' compression steps over the whole computation.",
              "proof": "Path compression replaces x.parent by a proper ancestor r with rank(r) > rank(old parent). Level is defined by level(x) = max{k : rank(parent) ≥ A_k(rank(x))}; replacing the parent by one of strictly larger rank can only enlarge the set of qualifying k, so level(x) is non-decreasing under compression. It strictly increases unless it is already at the ceiling α(n) (no larger k qualifies because rank ≤ log n forces A_k(rank(x)) to exceed n for k > α(n)). Each node x has rank ≥ 1 fixed once it is a non-root, so its level can climb only finitely often — at most α(n) times — before saturating at α(n). After saturation, further compressions of x are charged elsewhere (to the operation, not to x). ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Union by rank + path compression: O(m·α(n)) total, O(α(n)) amortized",
              "statement": "Any sequence of m MAKE-SET, UNION, and FIND-SET operations, of which n are MAKE-SET, runs in O(m·α(n)) total time when implemented with union by rank and path compression. Hence each operation costs O(α(n)) amortized — effectively constant.",
              "proof": "The cost of the sequence is dominated by parent-pointer traversals during FIND-SET (UNION is two FINDs plus O(1)). Charge each parent edge followed during a FIND in one of two ways.\n\n(1) **Charge to the operation.** The last edge into the root, and the first edge out of each maximal run of equal-level nodes, is charged to the FIND operation itself. Because levels along a find path are non-decreasing and lie in {0, 1, …, α(n)}, the number of *distinct* levels encountered on any single path is at most α(n) + 1. So each FIND is charged at most α(n) + O(1) = O(α(n)) directly.\n\n(2) **Charge to the node (paid by the potential).** Every other edge x → parent on the path has level(x) equal to the level of the node just below it; compression then re-points x to the root, a strictly higher-rank ancestor, which by the previous lemma strictly increases level(x) (unless saturated). Thus each such 'node charge' coincides with a strict level increase of x, and by the lemma a fixed node x absorbs at most α(n) node charges across the *entire* computation before its level saturates.\n\nSumming: the operation charges total O(m · α(n)) over all m operations; the node charges total O(n · α(n)) over all n nodes (each charged ≤ α(n) times). Since n ≤ m, the grand total is O(m · α(n)). Dividing by m operations yields O(α(n)) amortized per operation. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Kruskal's MST is dominated by the sort",
              "statement": "Kruskal's algorithm on a connected graph with V vertices and E edges runs in O(E log E) = O(E log V) time when the disjoint-set structure uses union by rank and path compression.",
              "proof": "Kruskal sorts the E edges (O(E log E)) and then performs O(E) FIND-SET/UNION operations on a structure of n = V elements. By the theorem those O(E) disjoint-set operations cost O(E · α(V)) total, which is o(E log V) and in particular dominated by the O(E log E) sort. Since E ≤ V² gives log E = O(log V), the running time is O(E log E) = O(E log V). The near-constant union-find is *why* the sort, not the union-find, is the bottleneck. ∎"
            },
            {
              "type": "decision",
              "heading": "Disjoint-set cost by optimization combination",
              "rows": [
                [
                  "Neither heuristic",
                  "FIND can be Θ(n) (degenerate linked-list tree). A sequence of m operations is O(m·n) worst case."
                ],
                [
                  "Union by rank only",
                  "O(log n) worst-case per operation: trees have height ≤ ⌊log₂ n⌋."
                ],
                [
                  "Path compression only",
                  "O(m·log n) for m operations (amortized O(log n)); more precisely O(m·log_{1+m/n} n)."
                ],
                [
                  "Union by rank + path compression",
                  "O(α(n)) amortized per operation — effectively constant; total O(m·α(n))."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Reading the bound for a real n",
              "body": "Take n = 10⁸⁰ (roughly the number of atoms in the observable universe). Already A₃(1) exceeds a tower of exponentials taller than this, so α(10⁸⁰) ≤ 3, and certainly α(n) ≤ 4 for any n you could store. Thus the 'O(α(n))' bound means every union-find operation runs in at most about 4 amortized pointer-traversals in any realistic computation. It is asymptotically super-constant (a fact you must state precisely on an exam) yet a flat small constant in every practical sense."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State precisely the sense in which α(n) is and is not constant, citing the definition α(n) = min{k : A_k(1) ≥ n}.",
                  "solution": "α is NOT O(1): each A_k is eventually exceeded by A_{k+1}, so for any constant c there exists n with A_c(1) < n, forcing α(n) ≥ c+1 > c; hence α is unbounded and α(n) ≠ O(1). α IS effectively constant operationally: since A₄(1) dwarfs any representable n, α(n) ≤ 4 for all such n. The two statements are compatible — α tends to ∞ but so slowly that it never exceeds 4 on inputs that fit in the universe. ∎"
                },
                {
                  "prompt": "Explain why union by rank is essential to the α(n) bound — i.e. why path compression alone does not reach it. (One sentence of mechanism plus the resulting bound.)",
                  "hint": "Without rank, links can be arbitrary, so what controls how many distinct levels a path can have?",
                  "solution": "Path compression alone cannot reach O(α(n)): without union by rank, links may attach a tall tree under a short one, so ranks (and hence the level structure the α-analysis charges against) are not controlled, and the best provable bound is amortized O(log n) per operation — precisely O(m·log_{1+m/n} n) for m operations. Union by rank's invariant 'a rank-r node owns ≥ 2ʳ elements' is exactly what bounds the number of distinct levels along a find path by α(n)+1, enabling the near-constant bound. ∎"
                },
                {
                  "prompt": "Derive Kruskal's overall running time given the O(α(V)) amortized union-find bound, and identify the dominant term.",
                  "solution": "Kruskal performs: (a) a sort of E edges in O(E log E); (b) O(E) FIND/UNION operations costing O(E·α(V)) total by the union-find theorem; plus O(V) MAKE-SETs in O(V). Total: O(E log E + E·α(V) + V) = O(E log E), since α(V) = O(log V) ⊆ O(log E) and V ≤ E + 1 for a connected graph. The sort dominates; the union-find is asymptotically negligible. Hence O(E log E) = O(E log V). ∎"
                },
                {
                  "prompt": "Using the rank-bucket counting from Lesson 3 (at most n/2ʳ nodes of rank r), give a clean self-contained argument that union by rank + path compression runs in O(m log* n) — a weaker but elementary near-constant bound. Sketch the bucketing.",
                  "hint": "Group ranks into blocks where each block's top is 2 raised to the previous block's top; there are log* n blocks.",
                  "solution": "Partition the ranks 1..⌊log n⌋ into blocks where block B_j spans ranks (t_{j−1}, t_j] with t_j = 2^{t_{j−1}}; the number of blocks needed to cover ranks up to log n is log*(n). Charge a FIND edge x→parent to the *node* x when x and its parent lie in the same rank-block, and to the *operation* otherwise. (i) Operation charges: a find path crosses block boundaries at most (#blocks) = log* n times, so each FIND pays O(log* n) directly. (ii) Node charges: while x stays in block B_j, each node-charge moves x under a strictly higher-ranked ancestor (compression), and x can be charged at most |B_j| ≤ t_j times before its parent's rank leaves the block; summed over the ≤ n/2ʳ nodes per rank, the total node charges are O(n) per block, O(n log* n) overall. Grand total O((m+n) log* n) = O(m log* n). This recovers the elementary near-constant bound; the sharper α(n) bound replaces blocks by Ackermann levels. ∎"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a10l4-i1",
              "front": "Inverse Ackermann α(n) — definition and growth?",
              "back": "α(n) = min{k : A_k(1) ≥ n} where A_k is the fast-growing Ackermann hierarchy. Unbounded but α(n) ≤ 4 for every representable n."
            },
            {
              "id": "a10l4-i2",
              "front": "Amortized cost of union by rank + path compression?",
              "back": "O(α(n)) per operation; total O(m·α(n)) for m operations on n elements. Effectively constant."
            },
            {
              "id": "a10l4-i3",
              "front": "Why α(n) ≠ O(1) yet 'effectively constant'?",
              "back": "For any constant c some n has α(n) > c (each A_k is eventually surpassed), so it's unbounded; but A₄(1) dwarfs any real n, so α(n) ≤ 4 in practice."
            },
            {
              "id": "a10l4-i4",
              "front": "Core of the α(n) proof (charging scheme)?",
              "back": "Charge each find edge to the operation (≤ α(n)+1 distinct levels per path) or to the node (each strict level rise; a node rises ≤ α(n) times). Total O(m·α(n))."
            },
            {
              "id": "a10l4-i5",
              "front": "Cost of each heuristic combination?",
              "back": "Neither: Θ(n). Rank only: O(log n). Compression only: O(log n) amortized. Both: O(α(n)) amortized."
            },
            {
              "id": "a10l4-i6",
              "front": "Why is Kruskal O(E log E) given near-constant union-find?",
              "back": "Sorting E edges is O(E log E); the O(E) union-find ops cost O(E·α(V)) = o(E log V), so the sort dominates."
            }
          ]
        }
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
          "id": "a11l1",
          "title": "Flow Networks and the Residual Graph",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "Why flow networks",
              "body": "Many optimization problems — routing data through a network, shipping goods through pipelines, assigning workers to jobs, even image segmentation — share a common skeleton: *stuff* must travel from a single origin to a single destination through links of bounded capacity, and we want to push as much as possible. The **maximum-flow** problem is the canonical abstraction of this skeleton. Its theory is unusually clean: it has a sharp duality (max-flow min-cut), a simple generic algorithm (Ford-Fulkerson), and an enormous range of reductions. This lesson builds the objects carefully, because every later proof rests on getting the definitions exactly right.\n\nWe follow CLRS notation throughout: a flow value on an edge (u,v) is written f(u,v), a capacity c(u,v), and the value of an entire flow f is |f|."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Flow network",
              "statement": "A **flow network** is a directed graph G = (V, E) together with a nonnegative **capacity** function c: V × V → ℝ_{≥0}, a distinguished **source** s ∈ V, and a distinguished **sink** t ∈ V, satisfying:\n\n**(1)** If (u,v) ∈ E then c(u,v) ≥ 0; if (u,v) ∉ E then c(u,v) = 0.\n**(2)** *(no antiparallel edges)* If (u,v) ∈ E then (v,u) ∉ E.\n**(3)** Every vertex lies on some path s ↝ v ↝ t (so |E| ≥ |V| − 1, giving the useful bound V = O(E)).\n\nThe antiparallel-edge restriction (2) is a convenience, not a real limitation: an edge (v,u) running opposite to (u,v) can be removed by splitting it through a new vertex v′, replacing (v,u) with (v,v′) and (v′,u) of the same capacity."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Flow and its value",
              "statement": "A **flow** in G is a function f: V × V → ℝ satisfying:\n\n**Capacity constraint:** for all u,v ∈ V,  0 ≤ f(u,v) ≤ c(u,v).\n\n**Flow conservation:** for all u ∈ V ∖ {s, t},\n  Σ_{v∈V} f(v,u) = Σ_{v∈V} f(u,v)\n(flow into u equals flow out of u).\n\nNote f(u,v) = 0 whenever (u,v) ∉ E (its capacity is 0). The **value** of f is the net flow out of the source:\n  |f| = Σ_{v∈V} f(s,v) − Σ_{v∈V} f(v,s).\nThe **maximum-flow problem** is to find a flow of maximum value."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Read |f| as 'net out of s'.** The subtracted term Σ f(v,s) accounts for flow that happens to return to the source. In many textbook networks no edge enters s, so the second sum vanishes and |f| is simply the total leaving s — but the definition must include it for correctness."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Flow out of s equals flow into t",
              "statement": "For any flow f, the net flow out of the source equals the net flow into the sink:\n  |f| = Σ_{v} f(v,t) − Σ_{v} f(t,v).",
              "proof": "Sum the conservation equation over **all** vertices and rearrange. Define the net out-flow of a vertex u as\n  netout(u) = Σ_{v} f(u,v) − Σ_{v} f(v,u).\nConservation says netout(u) = 0 for every u ∉ {s,t}. Now sum netout over all u ∈ V:\n  Σ_{u∈V} netout(u) = Σ_{u} Σ_{v} f(u,v) − Σ_{u} Σ_{v} f(v,u).\nBoth double sums range over the same set of ordered pairs (u,v), so they are equal and the total is 0. Splitting the left side by vertex:\n  netout(s) + netout(t) + Σ_{u∉{s,t}} netout(u) = 0.\nThe last sum is 0 by conservation, so netout(s) + netout(t) = 0, i.e. netout(s) = −netout(t). By definition netout(s) = |f|, and −netout(t) = Σ_v f(v,t) − Σ_v f(t,v), the net flow into t. ∎"
            },
            {
              "type": "text",
              "heading": "Residual capacity and the residual network",
              "body": "Given a flow f, we ask how much *additional* flow each edge can carry, where 'additional' may mean **cancelling** existing flow by pushing in the reverse direction. This is captured by the residual network — the single most important construction in the subject."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Residual network",
              "statement": "Given a flow f in G = (V,E), the **residual capacity** of an ordered pair (u,v) is\n  c_f(u,v) = c(u,v) − f(u,v)   if (u,v) ∈ E,\n  c_f(u,v) = f(v,u)             if (v,u) ∈ E,\n  c_f(u,v) = 0                  otherwise.\n(By the no-antiparallel-edges rule exactly one of the first two cases applies.) The **residual network** is G_f = (V, E_f) where E_f = { (u,v) : c_f(u,v) > 0 }. Note |E_f| ≤ 2|E|.\n\nEdges of the first kind are **forward** residual edges (unused capacity); edges of the second kind are **backward** residual edges, one for each unit of flow already on (v,u), and pushing flow along a backward edge *cancels* flow on the original."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Backward edges are the whole trick.** Without them, a greedy 'push along any s→t path' can wedge itself into a suboptimal flow it cannot escape. Backward residual edges let a later path **reroute** flow committed earlier, which is exactly what makes augmenting-path methods reach the true optimum. Keep this in mind: it is the intuition behind every correctness proof in this unit."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Augmenting path and augmentation",
              "statement": "An **augmenting path** p is a simple path from s to t in the residual network G_f. Its **residual capacity** is the bottleneck\n  c_f(p) = min { c_f(u,v) : (u,v) is on p } > 0.\nGiven such a p, define the **augmentation** f↑f_p, where f_p(u,v) = c_f(p) on each edge (u,v) of p (and the matching cancellation on the original edge), by\n  (f↑f_p)(u,v) = f(u,v) + f_p(u,v) − f_p(v,u)  for (u,v) ∈ E.\nIntuitively: increase flow on forward edges of p by c_f(p), and decrease flow on the originals of backward edges of p by c_f(p)."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Augmentation yields a flow of strictly larger value",
              "statement": "Let f be a flow in G and p an augmenting path in G_f with bottleneck c_f(p) > 0. Then f′ = f↑f_p is a flow in G with |f′| = |f| + c_f(p) > |f|.",
              "proof": "We verify the two flow constraints and then compute the value.\n\n**Capacity.** Take an edge (u,v) ∈ E on p. If (u,v) is a forward residual edge, f′(u,v) = f(u,v) + c_f(p). Since c_f(p) ≤ c_f(u,v) = c(u,v) − f(u,v), we get f(u,v) + c_f(p) ≤ c(u,v), and it is ≥ f(u,v) ≥ 0. If instead the residual edge used was the backward edge (v,u) with original (u,v) ∈ E, then f′(u,v) = f(u,v) − c_f(p), and since c_f(p) ≤ c_f(v,u) = f(u,v) we get f′(u,v) ≥ 0, and it is ≤ f(u,v) ≤ c(u,v). Edges of E not on p are unchanged. So 0 ≤ f′ ≤ c everywhere.\n\n**Conservation.** Fix an internal vertex u ∉ {s,t}. If p does not pass through u, nothing incident to u changes. If p passes through u it enters along one residual edge and leaves along another; the augmentation adds c_f(p) of *net* flow into u along the entering edge and removes the same c_f(p) of net flow along the leaving edge (whether implemented as a forward increase or a backward decrease, the bookkeeping (·)+f_p−(·) preserves the net). Hence inflow minus outflow at u is unchanged, so conservation still holds.\n\n**Value.** The path p leaves s along exactly one residual edge. If that first edge is a forward edge (s,v), then |f′| = |f| + c_f(p). If it is a backward edge (s,v) whose original is (v,s) ∈ E, the augmentation decreases f(v,s) by c_f(p), which by the value formula |f| = Σf(s,·) − Σf(·,s) also increases |f| by c_f(p) (it shrinks the subtracted term). Either way |f′| = |f| + c_f(p). Since c_f(p) > 0, the value strictly increases. ∎"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 300,
              "caption": "The canonical flow network (CLRS Fig. 26.1): edge labels are capacities, source s, sink t. Highlighted s→v₁→v₃→t is an augmenting path in the initial (empty-flow) residual network; its bottleneck is min(16,12,20) = 12, so one augmentation raises the value to 12. The maximum value for this network is 23, which by the next lesson equals the capacity of its minimum cut.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s",
                  "x": 4,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "v1",
                  "label": "v₁",
                  "x": 33,
                  "y": 16
                },
                {
                  "id": "v2",
                  "label": "v₂",
                  "x": 33,
                  "y": 84
                },
                {
                  "id": "v3",
                  "label": "v₃",
                  "x": 66,
                  "y": 16
                },
                {
                  "id": "v4",
                  "label": "v₄",
                  "x": 66,
                  "y": 84
                },
                {
                  "id": "t",
                  "label": "t",
                  "x": 95,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "v1",
                  "label": "16",
                  "tone": "sage",
                  "bold": true
                },
                {
                  "from": "s",
                  "to": "v2",
                  "label": "13"
                },
                {
                  "from": "v1",
                  "to": "v3",
                  "label": "12",
                  "tone": "sage",
                  "bold": true
                },
                {
                  "from": "v2",
                  "to": "v1",
                  "label": "4"
                },
                {
                  "from": "v2",
                  "to": "v4",
                  "label": "14"
                },
                {
                  "from": "v3",
                  "to": "v2",
                  "label": "9"
                },
                {
                  "from": "v3",
                  "to": "t",
                  "label": "20",
                  "tone": "sage",
                  "bold": true
                },
                {
                  "from": "v4",
                  "to": "v3",
                  "label": "7"
                },
                {
                  "from": "v4",
                  "to": "t",
                  "label": "4"
                }
              ]
            },
            {
              "type": "example",
              "heading": "Computing a residual network",
              "body": "Take the network above and the flow f that sends 12 along s→v₁→v₃→t (every other edge carries 0). Compute c_f on the edges of that path.\n\n**Edge (s,v₁):** capacity 16, flow 12 → forward residual c_f(s,v₁) = 16 − 12 = 4, plus a **backward** edge c_f(v₁,s) = 12.\n**Edge (v₁,v₃):** capacity 12, flow 12 → forward residual c_f = 0 (so (v₁,v₃) ∉ E_f), backward c_f(v₃,v₁) = 12.\n**Edge (v₃,t):** capacity 20, flow 12 → forward residual c_f = 8, backward c_f(t,v₃) = 12.\n\nAll untouched edges keep their full capacity as forward residual edges. A *new* augmenting path must now route around the saturated edge (v₁,v₃) — for instance using s→v₂→v₄→t — and a later path could use the backward edge (v₃,v₁) to reroute the committed 12 units if that increases the total."
            },
            {
              "type": "example",
              "heading": "Why a greedy method needs backward edges",
              "body": "Consider four vertices s, a, b, t with edges s→a (cap 1), s→b (cap 1), a→t (cap 1), b→t (cap 1), and a middle edge a→b (cap 1). Suppose a greedy run first pushes 1 unit along s→a→b→t, saturating s→a, a→b, and b→t. No *forward*-only s→t path now remains: s→a is saturated, b→t is saturated, and the only way to reach t through the unsaturated a→t requires reaching a, but s→a is full. Greedy without backward edges would stop here at value 1.\n\nThe residual network rescues us. Pushing flow on the original edge a→b created a **backward** residual edge (b,a) with capacity 1. This opens the augmenting path\n  s →(forward, cap 1) b →(backward, cap 1) a →(forward, cap 1) t,\nwith bottleneck min(1,1,1) = 1. Augmenting along it leaves s→b and a→t carrying 1 each, while the backward step **cancels** the unit on a→b (reducing f(a,b) from 1 to 0). The result is the two disjoint paths s→a→t and s→b→t, each carrying 1, for total value 2 — the true maximum. The backward edge is exactly what let the second path reroute the middle commitment made by the first."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Prove that for any flow f and any vertex u, the residual edges incident to u in G_f number at most twice the original edges incident to u, hence |E_f| ≤ 2|E|.",
                  "solution": "Each ordered pair (u,v) contributes a residual edge in at most the cases where (u,v) ∈ E or (v,u) ∈ E. By the no-antiparallel rule, for a fixed unordered pair {u,v} at most one of (u,v),(v,u) is in E; that single original edge can generate at most two residual edges (one forward, one backward). Summing over all original edges, |E_f| ≤ 2|E|. ∎",
                  "hint": "Count residual edges per original edge of E, using that antiparallel originals are forbidden."
                },
                {
                  "prompt": "Show that if f is a flow and there is **no** edge entering s in E, then |f| = Σ_v f(s,v).",
                  "solution": "By definition |f| = Σ_v f(s,v) − Σ_v f(v,s). If no edge enters s then for all v, (v,s) ∉ E, so c(v,s) = 0 and hence f(v,s) = 0 by the capacity constraint. The subtracted sum is therefore 0, giving |f| = Σ_v f(s,v). ∎",
                  "hint": "Capacity 0 forces the flow on that pair to 0."
                },
                {
                  "prompt": "Given the network and flow f of the worked residual example (12 units along s→v₁→v₃→t), find a second augmenting path in G_f and the resulting flow value.",
                  "solution": "After the first augmentation, c_f(v₁,v₃) = 0, so the next path must avoid (v₁,v₃). The path s→v₂→v₄→t is fully forward with residuals c_f(s,v₂)=13, c_f(v₂,v₄)=14, c_f(v₄,t)=4; its bottleneck is min(13,14,4) = 4. Augmenting raises the value to 12 + 4 = 16. (Continuing this process eventually reaches the maximum 23.) ∎",
                  "hint": "Route around the saturated edge (v₁,v₃); the sink-side edge v₄→t is the bottleneck."
                },
                {
                  "prompt": "Prove that the value of the zero flow (f ≡ 0) is 0, and that the maximum flow value satisfies |f*| ≥ 0 because the zero flow is feasible.",
                  "solution": "**Zero flow.** For f ≡ 0, the value formula gives |f| = Σ_v f(s,v) − Σ_v f(v,s) = Σ_v 0 − Σ_v 0 = 0. So the zero flow has value 0.\n\n**Feasibility of the zero flow.** The function f ≡ 0 satisfies both flow constraints: capacity holds because 0 ≤ 0 ≤ c(u,v) for every pair (capacities are nonnegative), and conservation holds because at every internal vertex the inflow Σ_v 0 = 0 equals the outflow Σ_v 0 = 0. Hence f ≡ 0 is a genuine feasible flow.\n\n**Maximum value is ≥ 0.** Since f ≡ 0 is feasible with value 0, it is one of the candidates over which the maximum is taken. The maximum value |f*| is the supremum of |f| over all feasible flows, so it is at least the value of any particular feasible flow; in particular |f*| ≥ |f_zero| = 0. ∎",
                  "hint": "Plug f ≡ 0 into the value formula to get 0; verify it is feasible; then the maximum, taken over a set that contains the zero flow, is ≥ 0."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a11l1-i1",
              "front": "The two constraints defining a flow?",
              "back": "Capacity: 0 ≤ f(u,v) ≤ c(u,v). Conservation: at every vertex except s and t, total flow in = total flow out."
            },
            {
              "id": "a11l1-i2",
              "front": "Definition of |f|, the value of a flow?",
              "back": "Net flow out of the source: |f| = Σ_v f(s,v) − Σ_v f(v,s)."
            },
            {
              "id": "a11l1-i3",
              "front": "Residual capacity c_f(u,v)?",
              "back": "c(u,v) − f(u,v) if (u,v)∈E (forward); f(v,u) if (v,u)∈E (backward, undoes flow); 0 otherwise."
            },
            {
              "id": "a11l1-i4",
              "front": "What is an augmenting path and its residual capacity?",
              "back": "A simple s→t path in G_f; its residual capacity is the minimum (bottleneck) residual capacity of its edges, c_f(p)."
            },
            {
              "id": "a11l1-i5",
              "front": "Effect of augmenting along p?",
              "back": "Produces a valid flow f′ with |f′| = |f| + c_f(p) > |f|: increase forward edges, decrease the originals of backward edges by c_f(p)."
            },
            {
              "id": "a11l1-i6",
              "front": "Why are backward residual edges essential?",
              "back": "They let later augmentations reroute/cancel flow committed earlier, so the augmenting-path method escapes locally-stuck flows and reaches the true optimum."
            }
          ]
        },
        {
          "id": "a11l2",
          "title": "Cuts and the Max-Flow Min-Cut Theorem",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "The dual object: cuts",
              "body": "A flow pushes value *across* the network; a cut measures the *bottleneck* that any flow must squeeze through. The deep fact of this subject — the max-flow min-cut theorem — is that these two quantities meet exactly. We build the cut machinery, prove the *easy* direction (weak duality: every flow ≤ every cut), and then prove the full theorem via a three-way equivalence with augmenting paths. The easy direction is exactly what the mastery gate asks you to reproduce, so we prove it in complete detail."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "s-t cut and its capacity",
              "statement": "An **s-t cut** of G is a partition of V into two sets (S, T) with s ∈ S and t = V ∖ S, so t ∈ T. The **net flow across (S,T)** is\n  f(S,T) = Σ_{u∈S} Σ_{v∈T} f(u,v) − Σ_{u∈S} Σ_{v∈T} f(v,u),\nand the **capacity** of the cut is\n  c(S,T) = Σ_{u∈S} Σ_{v∈T} c(u,v)\n(only edges *from* S *to* T count toward capacity — backward edges from T to S do not). A **minimum cut** is an s-t cut of minimum capacity over all such cuts."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Flow across any cut equals the flow value",
              "statement": "Let f be a flow and (S,T) any s-t cut. Then the net flow across the cut equals the value of the flow:\n  f(S,T) = |f|.",
              "proof": "Recall |f| = netout(s) = Σ_v f(s,v) − Σ_v f(v,s). Because every vertex u ∈ S ∖ {s} obeys conservation, netout(u) = 0 for such u, so we may add these zero terms without changing the value:\n  |f| = Σ_{u∈S} netout(u) = Σ_{u∈S} ( Σ_{v∈V} f(u,v) − Σ_{v∈V} f(v,u) ).\nNow split the inner sums over V = S ∪ T:\n  |f| = Σ_{u∈S} Σ_{v∈S} f(u,v) − Σ_{u∈S} Σ_{v∈S} f(v,u)  +  Σ_{u∈S} Σ_{v∈T} f(u,v) − Σ_{u∈S} Σ_{v∈T} f(v,u).\nThe first two sums each range over all ordered pairs (u,v) with both endpoints in S; they are identical sums and **cancel**. What remains is precisely\n  |f| = Σ_{u∈S} Σ_{v∈T} f(u,v) − Σ_{u∈S} Σ_{v∈T} f(v,u) = f(S,T). ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Weak duality — the easy direction of max-flow min-cut",
              "statement": "The value of **any** s-t flow f is at most the capacity of **any** s-t cut (S,T):\n  |f| ≤ c(S,T).\nConsequently, max-flow ≤ min-cut.",
              "proof": "By the previous lemma, |f| = f(S,T). Expand and bound:\n  |f| = f(S,T) = Σ_{u∈S} Σ_{v∈T} f(u,v) − Σ_{u∈S} Σ_{v∈T} f(v,u).\nThe second double sum is a sum of flow values, each ≥ 0 by the capacity constraint, so subtracting it can only decrease the total:\n  |f| ≤ Σ_{u∈S} Σ_{v∈T} f(u,v).\nNow apply the capacity constraint f(u,v) ≤ c(u,v) term by term:\n  Σ_{u∈S} Σ_{v∈T} f(u,v) ≤ Σ_{u∈S} Σ_{v∈T} c(u,v) = c(S,T).\nChaining the two inequalities gives |f| ≤ c(S,T). Since f and (S,T) were arbitrary, the maximum over flows is at most the minimum over cuts: max-flow ≤ min-cut. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**This is exactly the gate's first proof.** Memorize the two-step structure: (1) the cut-flow lemma turns |f| into f(S,T); (2) drop the nonnegative backward sum and apply f ≤ c edge-by-edge. Conservation is used only inside step (1) — that is why the prompt says 'you may use flow conservation.'"
            },
            {
              "type": "text",
              "heading": "Closing the gap: the full theorem",
              "body": "Weak duality leaves open whether the bound is *tight*. The full theorem says it always is, and it ties together three conditions — being a max flow, having no augmenting path, and saturating some cut. The equivalence is what makes Ford-Fulkerson correct, so we prove all three implications."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Max-flow min-cut theorem (three-way equivalence)",
              "statement": "Let f be a flow in G. The following are equivalent:\n  **(i)** f is a maximum flow.\n  **(ii)** the residual network G_f contains no augmenting path (no s↝t path).\n  **(iii)** |f| = c(S,T) for some s-t cut (S,T).\nIn particular the maximum flow value equals the minimum cut capacity.",
              "proof": "We show (i)⇒(ii), (ii)⇒(iii), (iii)⇒(i).\n\n**(i)⇒(ii)** (contrapositive). If G_f contains an augmenting path p, then by the augmentation lemma (Lesson 1) f↑f_p is a flow with value |f| + c_f(p) > |f|, so f is not maximum.\n\n**(ii)⇒(iii).** Suppose G_f has no s↝t path. Let S = { v ∈ V : there is a path s ↝ v in G_f } and T = V ∖ S. Then s ∈ S and, since no path reaches t, t ∈ T, so (S,T) is a genuine s-t cut. Consider any pair u ∈ S, v ∈ T:\n  • If (u,v) ∈ E, then c_f(u,v) = 0 (else v would be reachable from s through u, contradicting v ∈ T), so f(u,v) = c(u,v): the edge is **saturated**.\n  • If (v,u) ∈ E, then f(v,u) = 0; otherwise the backward residual edge (u,v) would have c_f(u,v) = f(v,u) > 0 and again v would be reachable, a contradiction.\nTherefore f(S,T) = Σ_{u∈S,v∈T} f(u,v) − Σ_{u∈S,v∈T} f(v,u) = Σ_{u∈S,v∈T} c(u,v) − 0 = c(S,T). By the cut-flow lemma f(S,T) = |f|, so |f| = c(S,T).\n\n**(iii)⇒(i).** Suppose |f| = c(S,T) for some cut. By weak duality every flow f′ satisfies |f′| ≤ c(S,T) = |f|, so no flow exceeds |f| and f is maximum.\n\nThe equivalence is proved. For the value statement: by (i)⇔(iii) a maximum flow f* satisfies |f*| = c(S,T) for some cut, and by weak duality that cut is minimum (no cut is smaller than |f*|, and this one equals it). Hence max-flow = min-cut. ∎"
            },
            {
              "type": "example",
              "heading": "Identifying a minimum cut from a maximum flow",
              "body": "In the canonical network (Lesson 1 diagram) the maximum flow value is 23. Take the cut S = {s, v₁, v₂, v₄}, T = {v₃, t}. The edges directed from S to T are exactly (v₁,v₃) with capacity 12, (v₄,v₃) with capacity 7, and (v₄,t) with capacity 4. (Every other original edge either stays inside S, stays inside T, or runs from T to S, and none of those count toward the cut capacity.) Therefore\n  c(S,T) = 12 + 7 + 4 = 23 = |f*|.\nSince the cut capacity equals the maximum flow value, by the max-flow min-cut theorem (S,T) is a **minimum cut**, and no s-t cut has smaller capacity."
            },
            {
              "type": "example",
              "heading": "The reachable set in G_f gives the min cut",
              "body": "The constructive part of (ii)⇒(iii) is itself an algorithm: once a max flow f is found, run one BFS/DFS from s in the residual network G_f. The set S of reached vertices and its complement T form a **minimum cut**, and every S→T original edge is saturated (carries flow = capacity) while every T→S original edge carries zero flow. This is the standard way to *recover* a min cut after computing a max flow."
            },
            {
              "type": "decision",
              "heading": "Three equivalent certificates of optimality",
              "rows": [
                [
                  "f is a maximum flow",
                  "no augmenting path exists in G_f"
                ],
                [
                  "no augmenting path in G_f",
                  "reachable set S = {v : s↝v in G_f} saturates the cut (S,T)"
                ],
                [
                  "|f| = c(S,T) for some cut",
                  "f is maximum and (S,T) is a minimum cut"
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Restate and prove the easy direction of max-flow min-cut as the gate asks: the value of any s-t flow is at most the capacity of any s-t cut.",
                  "solution": "Let f be a flow and (S,T) an s-t cut. **Step 1 (conservation):** adding the zero terms netout(u)=0 for u∈S∖{s} gives |f| = Σ_{u∈S} netout(u); splitting each inner sum over S and T, the within-S terms cancel, leaving |f| = f(S,T) = Σ_{u∈S,v∈T} f(u,v) − Σ_{u∈S,v∈T} f(v,u). **Step 2 (drop and bound):** the subtracted sum is ≥ 0, so |f| ≤ Σ_{u∈S,v∈T} f(u,v) ≤ Σ_{u∈S,v∈T} c(u,v) = c(S,T), using f(u,v) ≤ c(u,v) edge-by-edge. Hence |f| ≤ c(S,T). ∎",
                  "hint": "Two steps: convert |f| to f(S,T) using conservation, then bound f by c after discarding the nonnegative back-flow term."
                },
                {
                  "prompt": "A cut (S,T) is saturated by f if every S→T edge carries flow equal to its capacity and every T→S edge carries 0. Prove that if some cut is saturated by f, then f is maximum.",
                  "solution": "If (S,T) is saturated then f(S,T) = Σ_{u∈S,v∈T} c(u,v) − 0 = c(S,T). By the cut-flow lemma |f| = f(S,T) = c(S,T). By weak duality every flow f′ has |f′| ≤ c(S,T) = |f|, so f is maximum (and (S,T) is a minimum cut). ∎",
                  "hint": "Saturation makes f(S,T) hit c(S,T); then quote weak duality."
                },
                {
                  "prompt": "Show that the capacity of a cut counts only S→T edges, and explain with a one-line example why including T→S capacities would break weak duality.",
                  "solution": "By definition c(S,T) = Σ_{u∈S,v∈T} c(u,v); T→S capacities are excluded. The cut-flow lemma already subtracts the *flow* on T→S edges (the term −Σ f(v,u)), which can only lower |f|; the corresponding *capacities* are not an upper bound on anything the flow must cross from S to T. Example: a network with a huge backward edge T→S of capacity 1000 but a single forward edge of capacity 1 has max flow 1; counting the 1000 would wrongly inflate the 'bound' and it would no longer upper-bound min-cut meaningfully. ∎",
                  "hint": "Only forward (S→T) capacity bounds flow; backward edges enter via subtracted flow, not added capacity."
                },
                {
                  "prompt": "Prove that if |f| = c(S,T) then every edge from S to T is saturated and every edge from T to S carries zero flow.",
                  "solution": "From the proof of weak duality, |f| = Σ_{S→T} f(u,v) − Σ_{T→S} f(v,u) ≤ Σ_{S→T} f(u,v) ≤ Σ_{S→T} c(u,v) = c(S,T). If |f| = c(S,T), both inequalities are equalities. Equality in the second forces f(u,v) = c(u,v) for every S→T edge (each term meets its cap). Equality in the first forces Σ_{T→S} f(v,u) = 0, and since each term is ≥ 0, every T→S edge has f(v,u) = 0. ∎",
                  "hint": "Equality propagates back through the two inequalities of the weak-duality proof; nonnegative terms summing to 0 are each 0."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a11l2-i1",
              "front": "Capacity c(S,T) of an s-t cut?",
              "back": "The total capacity of edges going FROM S TO T only: Σ_{u∈S,v∈T} c(u,v). Backward (T→S) edges are not counted."
            },
            {
              "id": "a11l2-i2",
              "front": "Cut-flow lemma?",
              "back": "For any flow f and any s-t cut (S,T), the net flow across the cut equals the flow value: f(S,T) = |f|."
            },
            {
              "id": "a11l2-i3",
              "front": "Weak duality (easy direction of MFMC)?",
              "back": "|f| ≤ c(S,T) for every flow and every cut. Proof: |f| = f(S,T) by conservation, then drop the nonnegative back-flow and apply f ≤ c edge-by-edge."
            },
            {
              "id": "a11l2-i4",
              "front": "The max-flow min-cut theorem?",
              "back": "Max s-t flow value = min s-t cut capacity. Equivalently: f is max ⇔ no augmenting path in G_f ⇔ some cut is saturated with |f| = c(S,T)."
            },
            {
              "id": "a11l2-i5",
              "front": "How do you recover a minimum cut from a max flow f?",
              "back": "Let S = {v : s↝v in G_f} (BFS/DFS from s in the residual net) and T = V∖S. (S,T) is a minimum cut; its S→T edges are exactly the saturated ones."
            },
            {
              "id": "a11l2-i6",
              "front": "What does equality |f| = c(S,T) force on edges?",
              "back": "Every S→T edge is saturated (f = c) and every T→S edge carries zero flow."
            }
          ]
        },
        {
          "id": "a11l3",
          "title": "Ford-Fulkerson and Edmonds-Karp",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "From theorem to algorithm",
              "body": "The three-way equivalence of the last lesson hands us an algorithm almost for free: *while there is an augmenting path in G_f, augment along it.* When the loop ends there is no augmenting path, so by the theorem the flow is maximum. This is the **Ford-Fulkerson method**. 'Method,' not 'algorithm,' because it leaves the choice of augmenting path unspecified — and that choice controls everything about its running time. Pinning the choice to a **BFS** shortest path gives **Edmonds-Karp**, whose O(V·E²) bound is independent of the capacities. The gate asks for the exponent c in O(V·E^c); this lesson proves c = 2."
            },
            {
              "type": "code",
              "heading": "The Ford-Fulkerson method",
              "lang": "text",
              "code": "FORD-FULKERSON(G, s, t):\n  for each edge (u,v) in G.E:\n    f(u,v) = 0                      // start from the zero flow\n  while there exists an augmenting path p from s to t in G_f:\n    c_f(p) = min{ c_f(u,v) : (u,v) on p }    // bottleneck\n    for each edge (u,v) on p:\n      if (u,v) in E:  f(u,v) = f(u,v) + c_f(p)   // push forward\n      else:           f(v,u) = f(v,u) - c_f(p)   // cancel along backward edge\n  return f"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Correctness of Ford-Fulkerson (integer capacities) and integrality",
              "statement": "If all capacities are integers, Ford-Fulkerson terminates and returns a **maximum** flow. Moreover the returned flow is **integral**: f(u,v) ∈ ℤ for every edge.",
              "proof": "**Integrality (invariant).** Initially f ≡ 0 is integral, and all residual capacities are integers. If f is integral, every residual capacity c_f(u,v) is an integer, so the bottleneck c_f(p) is a positive integer; augmenting adds/subtracts that integer, keeping f integral. By induction every iterate is integral.\n\n**Termination.** Each augmentation raises |f| by c_f(p) ≥ 1 (a positive integer). The value is bounded above by the capacity of any fixed cut, e.g. c(S,T) with S = {s}, which is finite. A strictly increasing integer sequence bounded above is finite, so the loop runs at most |f*| ≤ c({s}, V∖{s}) times and halts.\n\n**Optimality.** When the loop ends, no augmenting path exists in G_f. By the max-flow min-cut equivalence ((ii)⇒(i)), f is a maximum flow. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Generic Ford-Fulkerson is only pseudo-polynomial.** Its bound O(E·|f*|) depends on the flow *value*, which can be astronomically large (or, with irrational capacities and adversarial path choices, the method may never terminate — and even converge to the wrong value). The classic bad case: two paths of capacity 10⁶ joined by a middle edge of capacity 1; alternately routing through the middle edge forces 2·10⁶ augmentations of 1 unit each. The cure is to choose paths smartly."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 240,
              "caption": "The pathological instance for generic Ford-Fulkerson. If each augmenting path is forced to use the middle edge u→v (capacity 1), the value rises by only 1 per iteration, taking 2,000,000 iterations. Edmonds-Karp (BFS) instead finds the two 2-edge paths immediately and finishes in 2 augmentations — its running time does not depend on the capacity 10⁶.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s",
                  "x": 8,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "u",
                  "label": "u",
                  "x": 40,
                  "y": 20
                },
                {
                  "id": "v",
                  "label": "v",
                  "x": 40,
                  "y": 80
                },
                {
                  "id": "t",
                  "label": "t",
                  "x": 92,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "u",
                  "label": "10⁶"
                },
                {
                  "from": "s",
                  "to": "v",
                  "label": "10⁶"
                },
                {
                  "from": "u",
                  "to": "t",
                  "label": "10⁶"
                },
                {
                  "from": "v",
                  "to": "t",
                  "label": "10⁶"
                },
                {
                  "from": "u",
                  "to": "v",
                  "label": "1",
                  "tone": "ember",
                  "bold": true
                }
              ]
            },
            {
              "type": "text",
              "heading": "Edmonds-Karp: choose the shortest augmenting path",
              "body": "Edmonds-Karp is Ford-Fulkerson with one rule: each iteration, pick the augmenting path with the **fewest edges** — a BFS shortest path in G_f (edges treated as unit length). This single rule makes the running time **O(V·E²)**, independent of capacities. The proof rests on two facts: residual shortest-path distances from s are monotone nondecreasing across iterations, and each edge can be the *bottleneck* only O(V) times."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Residual distances are monotone nondecreasing",
              "statement": "Run Edmonds-Karp. For each vertex v ∈ V ∖ {s,t}, let δ_f(s,v) be the BFS (unit-edge) shortest-path distance from s to v in the residual network G_f. Then across every augmentation, δ_f(s,v) never decreases.",
              "proof": "Suppose for contradiction that some augmentation, transforming f into f′, strictly **decreases** some distance. Among all vertices whose distance dropped, pick v with the smallest new distance δ_{f′}(s,v). Let p: s ↝ u → v be a shortest path to v in G_{f′}, so (u,v) ∈ E_{f′} and δ_{f′}(s,u) = δ_{f′}(s,v) − 1. By minimality of v's new distance, u did *not* have its distance decrease: δ_{f′}(s,u) ≥ δ_f(s,u).\n\n**Claim:** (u,v) ∉ E_f. If it were, then δ_f(s,v) ≤ δ_f(s,u) + 1 ≤ δ_{f′}(s,u) + 1 = δ_{f′}(s,v), contradicting that v's distance decreased. So (u,v) is in E_{f′} but not in E_f.\n\nThe only way an edge appears in the residual network after an augmentation is if the augmenting path pushed flow along its *reverse*. So the BFS augmenting path used by this step contained the edge (v,u). Since Edmonds-Karp augments along a shortest path in G_f, that path is a BFS tree path, giving δ_f(s,v) = δ_f(s,u) − 1. Then\n  δ_f(s,v) = δ_f(s,u) − 1 ≤ δ_{f′}(s,u) − 1 = (δ_{f′}(s,v) − 1) − 1 = δ_{f′}(s,v) − 2 < δ_{f′}(s,v),\nwhich says v's distance did **not** decrease — contradicting our assumption. Hence no distance ever decreases. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Edmonds-Karp runs in O(V·E²)",
              "statement": "On a network with |V| vertices and |E| edges, Edmonds-Karp performs O(V·E) augmentations, and therefore runs in total time O(V·E²).",
              "proof": "Call an edge (u,v) **critical** on an augmenting path p if c_f(u,v) = c_f(p), i.e. it is the bottleneck (one such edge exists each iteration). After augmenting, a critical edge is saturated and **disappears** from the residual network. We bound how many times a fixed edge (u,v) can be critical.\n\nThe first time (u,v) is critical, since the path is a BFS shortest path, δ_f(s,v) = δ_f(s,u) + 1. The edge (u,v) then vanishes and can reappear only when some later augmentation pushes flow on (v,u). At that later moment f′, again along a shortest path, δ_{f′}(s,u) = δ_{f′}(s,v) + 1. Using the monotonicity lemma (δ_{f′}(s,v) ≥ δ_f(s,v)):\n  δ_{f′}(s,u) = δ_{f′}(s,v) + 1 ≥ δ_f(s,v) + 1 = (δ_f(s,u) + 1) + 1 = δ_f(s,u) + 2.\nSo between consecutive times (u,v) is critical, δ(s,u) increases by at least 2. Distances from s lie in [0, |V|−1] (or are ∞ once u is unreachable, after which (u,v) is never critical again). Hence (u,v) can be critical at most (|V|−1)/2 = O(V) times.\n\nThere are O(E) residual edges, each critical O(V) times, so the total number of augmentations is O(V·E). Each augmentation costs a BFS, O(V + E) = O(E) (since V = O(E) in a flow network). Total time: O(V·E) · O(E) = **O(V·E²)**. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The gate's numeric answer.** Edmonds-Karp is O(V·E^c) with **c = 2**: O(V·E·E) — O(VE) augmentations times O(E) per BFS. Crucially this bound is *independent of the capacities*, unlike generic Ford-Fulkerson's O(E·|f*|)."
            },
            {
              "type": "example",
              "heading": "Edmonds-Karp on the canonical network",
              "body": "On the Lesson-1 network, BFS first finds a 3-edge path (e.g. s→v₁→v₃→t, bottleneck 12). The next BFS, with (v₁,v₃) saturated, finds another shortest path (s→v₂→v₄→t, bottleneck 4), then continues — each step a shortest residual path. The total max flow 23 is reached in a handful of augmentations, and at no point does the path choice depend on the magnitude of the capacities, only on residual reachability. Counting the saturating (critical) edges across the run confirms the O(VE) augmentation bound."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State the Edmonds-Karp running time as O(V·E^c) and justify the value of c in one or two sentences.",
                  "solution": "c = 2: Edmonds-Karp runs in O(V·E²). The number of augmentations is O(VE) (each of the O(E) edges is critical at most O(V) times because shortest-path distances from s increase by ≥ 2 between successive criticalities), and each augmentation costs one BFS at O(E). Multiplying gives O(VE)·O(E) = O(VE²). ∎",
                  "hint": "augmentations O(VE) × cost per BFS O(E)."
                },
                {
                  "prompt": "Prove that with integer capacities, generic Ford-Fulkerson runs in O(E·|f*|) time, where |f*| is the maximum-flow value.",
                  "solution": "By the integrality argument, every augmentation increases |f| by a positive integer, so at least 1; thus the number of augmentations is at most |f*|. Each iteration finds an augmenting path (DFS/BFS) in O(E) time and augments along it in O(V) = O(E) time. Total: O(E·|f*|). ∎",
                  "hint": "Each augmentation adds ≥ 1 to the value; the value tops out at |f*|."
                },
                {
                  "prompt": "Explain why generic Ford-Fulkerson's O(E·|f*|) bound is called pseudo-polynomial, and why Edmonds-Karp's bound is genuinely polynomial.",
                  "solution": "|f*| can be as large as the numeric value of the capacities, whose encoding length is logarithmic in their magnitude; O(E·|f*|) is therefore exponential in the input size (number of bits), making it pseudo-polynomial — polynomial in the *values* but not in the *size*. Edmonds-Karp's O(VE²) depends only on the graph's combinatorial size V and E, not on capacity magnitudes, so it is polynomial in the true input length. ∎",
                  "hint": "Compare the bound to the bit-length of the capacities."
                },
                {
                  "prompt": "Show that an edge (u,v) can be a bottleneck (critical) at most (|V|−1)/2 times during Edmonds-Karp, and conclude the O(VE) bound on augmentations.",
                  "solution": "When (u,v) is first critical, δ_f(s,v) = δ_f(s,u)+1 (shortest path). It then vanishes and reappears only after flow is pushed on (v,u), at which time δ(s,u) = δ(s,v)+1; using monotonicity, δ(s,u) has risen by ≥ 2 since the previous criticality. Distances from s lie in {0,…,|V|−1}, so (u,v) can be critical at most ⌊(|V|−1)/2⌋ = O(V) times. With O(E) residual edges and one critical edge per augmentation, the total augmentation count is O(VE). ∎",
                  "hint": "Track δ(s,u) between successive times the edge is critical; it jumps by ≥ 2 each time."
                },
                {
                  "prompt": "Give a brief argument why residual shortest-path distances never decrease under Edmonds-Karp, i.e. δ_{f′}(s,v) ≥ δ_f(s,v).",
                  "solution": "Suppose some distance decreased; pick v with minimal new distance among those that dropped, with predecessor u on a new shortest path so δ_{f′}(s,u) = δ_{f′}(s,v)−1 and (by minimality) u did not drop. Then (u,v) must be new to the residual net (else δ_f(s,v) ≤ δ_f(s,u)+1 ≤ δ_{f′}(s,u)+1 = δ_{f′}(s,v), no drop). A new edge (u,v) means the augmenting path used (v,u), a shortest-path edge, so δ_f(s,v) = δ_f(s,u)−1; chaining gives δ_f(s,v) ≤ δ_{f′}(s,v)−2, contradicting that v dropped. Hence no decrease. ∎",
                  "hint": "Minimal-counterexample on the vertex whose new distance is smallest; force the offending edge to have been created by a reverse push."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a11l3-i1",
              "front": "Ford-Fulkerson method in one line?",
              "back": "Start from zero flow; while an augmenting path exists in G_f, push its bottleneck residual capacity. Terminates at a max flow (no augmenting path)."
            },
            {
              "id": "a11l3-i2",
              "front": "Integrality theorem?",
              "back": "With integer capacities, Ford-Fulkerson returns an integral maximum flow (every f(u,v) ∈ ℤ), because each bottleneck is a positive integer."
            },
            {
              "id": "a11l3-i3",
              "front": "Generic Ford-Fulkerson running time and its flaw?",
              "back": "O(E·|f*|) — pseudo-polynomial: it depends on the flow value, which is exponential in the input bit-length and can blow up with large capacities."
            },
            {
              "id": "a11l3-i4",
              "front": "What is Edmonds-Karp?",
              "back": "Ford-Fulkerson that always augments along a BFS shortest (fewest-edge) path in G_f."
            },
            {
              "id": "a11l3-i5",
              "front": "Edmonds-Karp running time (the exponent c in O(V·E^c))?",
              "back": "O(V·E²), so c = 2: O(VE) augmentations × O(E) per BFS. Independent of capacities."
            },
            {
              "id": "a11l3-i6",
              "front": "Two facts that prove the O(VE) augmentation bound?",
              "back": "(1) Residual distances δ(s,v) are monotone nondecreasing; (2) each edge is critical/bottleneck O(V) times because δ(s,u) rises by ≥ 2 between criticalities."
            }
          ]
        },
        {
          "id": "a11l4",
          "title": "Application: Maximum Bipartite Matching",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "The payoff: solving by reduction",
              "body": "The real value of max-flow is that a large family of combinatorial problems become flow problems by a change of clothing. The cleanest example is **maximum bipartite matching**: assign as many workers to jobs (or applicants to slots, or left vertices to right vertices) as possible, where each can be used at most once. We will *reduce* it to max-flow, prove the reduction exact, and read off the algorithm. The gate's second proof asks precisely for this reduction and the equality-of-values argument, so we prove both fully."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Bipartite graph and matching",
              "statement": "A graph G = (V, E) is **bipartite** if V partitions into L ∪ R with every edge having one endpoint in L and one in R. A **matching** M ⊆ E is a set of edges no two of which share a vertex. A vertex is **matched** if it is an endpoint of some edge of M, else **free**. M is a **maximum matching** if no matching has more edges. The maximum-bipartite-matching problem is to find a matching of maximum cardinality |M|."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The flow reduction G′",
              "statement": "Given bipartite G = (L ∪ R, E), build the **corresponding flow network** G′ = (V′, E′):\n  • V′ = L ∪ R ∪ {s, t} with new source s and sink t.\n  • For each u ∈ L add a directed edge (s, u).\n  • Direct every original edge {u,v} (u∈L, v∈R) as (u, v).\n  • For each v ∈ R add a directed edge (v, t).\n  • Give **every** edge of E′ capacity 1.\nAll capacities being 1 (hence integral) is what forces matchings to fall out of integral flows."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 280,
              "caption": "The reduction G′ for a bipartite graph with L = {ℓ₁,ℓ₂,ℓ₃}, R = {r₁,r₂,r₃}. Every drawn edge has capacity 1. A unit s→ℓ₁→r₂→t of integral flow corresponds to choosing the matching edge {ℓ₁,r₂}; capacity-1 edges out of s and into t force each left/right vertex to be used at most once.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s",
                  "x": 6,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "l1",
                  "label": "ℓ₁",
                  "x": 35,
                  "y": 18
                },
                {
                  "id": "l2",
                  "label": "ℓ₂",
                  "x": 35,
                  "y": 50
                },
                {
                  "id": "l3",
                  "label": "ℓ₃",
                  "x": 35,
                  "y": 82
                },
                {
                  "id": "r1",
                  "label": "r₁",
                  "x": 66,
                  "y": 18
                },
                {
                  "id": "r2",
                  "label": "r₂",
                  "x": 66,
                  "y": 50
                },
                {
                  "id": "r3",
                  "label": "r₃",
                  "x": 66,
                  "y": 82
                },
                {
                  "id": "t",
                  "label": "t",
                  "x": 94,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "l1",
                  "directed": true
                },
                {
                  "from": "s",
                  "to": "l2",
                  "directed": true
                },
                {
                  "from": "s",
                  "to": "l3",
                  "directed": true
                },
                {
                  "from": "l1",
                  "to": "r1",
                  "directed": true
                },
                {
                  "from": "l1",
                  "to": "r2",
                  "directed": true,
                  "tone": "sage",
                  "bold": true
                },
                {
                  "from": "l2",
                  "to": "r2",
                  "directed": true
                },
                {
                  "from": "l2",
                  "to": "r3",
                  "directed": true
                },
                {
                  "from": "l3",
                  "to": "r3",
                  "directed": true
                },
                {
                  "from": "r1",
                  "to": "t",
                  "directed": true
                },
                {
                  "from": "r2",
                  "to": "t",
                  "directed": true,
                  "tone": "sage",
                  "bold": true
                },
                {
                  "from": "r3",
                  "to": "t",
                  "directed": true
                }
              ]
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "A matching gives an integer flow of equal value",
              "statement": "If M is a matching in G, then there is an **integer** flow f in G′ with |f| = |M|.",
              "proof": "Define f to send one unit along the path s → u → v → t for each matched edge {u,v} ∈ M, and 0 on all other edges. Concretely f(s,u) = f(u,v) = f(v,t) = 1 for each {u,v} ∈ M.\n\n**Capacity.** Each value is 0 or 1, within the capacity 1.\n\n**Conservation.** Take u ∈ L. Since M is a matching, u is in at most one edge of M, so at most one unit enters u from s and at most one leaves u into R, and they balance (both 1 if u is matched, both 0 otherwise). Symmetrically each v ∈ R has at most one matched edge, so its inflow from L equals its outflow to t. Conservation holds at every internal vertex.\n\n**Value.** The flow leaves s exactly once per matched edge, on the distinct edges (s,u), one per matched left vertex; these are |M| edges each carrying 1. No edge enters s, so |f| = Σ_v f(s,v) = |M|. The flow is integer-valued by construction. ∎"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "An integer flow gives a matching of equal size",
              "statement": "If f is an integer flow in G′, then the set M = { {u,v} : u∈L, v∈R, f(u,v) = 1 } is a matching in G with |M| = |f|.",
              "proof": "Since capacities are 1 and f is integer, every edge value is 0 or 1. \n\n**M is a matching.** Each u ∈ L receives at most 1 unit from s (capacity of (s,u) is 1), so by conservation it sends at most 1 unit into R; hence at most one edge (u,v) has f(u,v)=1, so u is in at most one edge of M. Symmetrically each v ∈ R sends at most 1 unit to t (capacity 1), so receives at most 1, so is in at most one edge of M. No two edges of M share a vertex: M is a matching.\n\n**|M| = |f|.** By the cut-flow lemma applied to the cut S = {s} ∪ L, T = R ∪ {t}: |f| = f(S,T). The only S→T edges carrying flow are the original edges (u,v) with u∈L, v∈R (edges (s,u) stay inside S; edges (v,t) stay inside T). Backward (T→S) edges carry 0. So |f| = Σ_{u∈L,v∈R} f(u,v) = (number of edges with f(u,v)=1) = |M|. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Max flow value equals maximum matching size",
              "statement": "The value of a maximum flow in G′ equals the size of a maximum matching in G. Consequently, computing a maximum integral flow in G′ (e.g. by Ford-Fulkerson / Edmonds-Karp) and reading off its saturated L→R edges yields a maximum matching.",
              "proof": "Write m* for the maximum matching size and f* for the maximum flow value in G′.\n\n**m* ≤ f*.** Let M be a maximum matching, |M| = m*. By the first lemma there is a flow of value |M| = m*, so the maximum flow value is at least m*: f* ≥ m*.\n\n**f* ≤ m*.** Let f be a maximum **integer** flow with value f*. Such an integer maximum flow exists because all capacities in G′ are integers and, by the integrality theorem (Lesson 3), Ford-Fulkerson returns an integral flow whose value is maximum. By the second lemma, f yields a matching M with |M| = f*, so the maximum matching is at least f*: m* ≥ f*.\n\nCombining, m* = f*. Therefore a maximum integral flow's L→R unit edges form a matching of size f* = m*, i.e. a maximum matching. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Integrality is load-bearing.** A fractional max flow could split a vertex's unit of capacity into halves and would *not* directly read off as a matching. The reduction works because the integrality theorem guarantees a 0/1 maximum flow. Always invoke integrality explicitly when arguing the equality of optima."
            },
            {
              "type": "text",
              "heading": "Running time and a glimpse of König",
              "body": "In G′ we have |V′| = |L|+|R|+2 = O(V) and |E′| = O(V+E) = O(E). Each augmenting path raises |f| by exactly 1 (unit capacities), and |f*| ≤ |L| ≤ V, so generic Ford-Fulkerson does O(V) augmentations at O(E) each: **O(VE)** total — already polynomial without even needing Edmonds-Karp. A min-cut in G′ has a combinatorial reading: **König's theorem** states that in a bipartite graph the maximum matching size equals the minimum **vertex cover** size, which is exactly the max-flow min-cut theorem specialized to G′. The transferable skill is recognizing 'this is a flow problem' — edge-disjoint paths, assignment, project selection, and image segmentation all yield to the same machinery."
            },
            {
              "type": "decision",
              "heading": "Dictionary between the matching problem and its flow",
              "rows": [
                [
                  "matched edge {u,v} ∈ M",
                  "unit of flow on path s→u→v→t in G′"
                ],
                [
                  "vertex used at most once",
                  "capacity-1 edge (s,u) or (v,t)"
                ],
                [
                  "maximum matching size m*",
                  "maximum flow value f* (by integrality)"
                ],
                [
                  "minimum vertex cover (König)",
                  "minimum s-t cut in G′"
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Give the full reduction from maximum bipartite matching to maximum flow and prove that the maximum flow value equals the maximum matching size.",
                  "solution": "**Reduction.** From bipartite G = (L∪R, E) build G′: add s,t; edges (s,u) for u∈L, (u,v) for each original edge u∈L,v∈R, (v,t) for v∈R; all capacities 1. **Forward (m*≤f*).** A matching M gives a flow sending 1 along s→u→v→t per edge {u,v}∈M; capacity holds (values 0/1) and conservation holds (each vertex in ≤1 matched edge), with value |M|; so f* ≥ m*. **Backward (f*≤m*).** Because capacities are integral, an integral maximum flow f exists (integrality theorem); its 0/1 values make M={(u,v): f(u,v)=1} a matching (capacity-1 edges at s and t force ≤1 use per vertex), and via the cut S={s}∪L the value |f| = Σ_{L→R} f(u,v) = |M|; so m* ≥ f*. Hence m* = f*, and the saturated L→R edges of a maximum integral flow form a maximum matching. ∎",
                  "hint": "Two inequalities: matching→flow (build paths) and integral flow→matching (use integrality, then the cut S = {s}∪L)."
                },
                {
                  "prompt": "Explain precisely where integrality of the maximum flow is used in the equality argument, and what could go wrong without it.",
                  "solution": "Integrality is used in the f* ≤ m* direction: to turn a maximum flow into a matching we need every f(u,v) ∈ {0,1}, which holds because all capacities are 1 and Ford-Fulkerson returns an integral flow. Without integrality a maximum flow could be fractional (e.g. half a unit on two competing L→R edges of a vertex), and the set {(u,v): f(u,v)>0} would not be a matching — a vertex could be 'half-used' twice. The flow value would still equal m*, but it wouldn't directly read off as a matching of that size. ∎",
                  "hint": "Fractional flows can split a unit of capacity; matchings cannot."
                },
                {
                  "prompt": "What is the running time of solving maximum bipartite matching via this reduction with plain Ford-Fulkerson? Justify.",
                  "solution": "O(VE). In G′, |V′| = O(V) and |E′| = O(E). Each augmenting path increases the integral flow value by exactly 1 (unit capacities), and the maximum value is at most min(|L|,|R|) ≤ V, so there are O(V) augmentations. Each augmentation finds a path by BFS/DFS in O(E′) = O(E) and augments in O(V) = O(E). Total O(VE). ∎",
                  "hint": "Unit capacities ⇒ O(V) augmentations; each costs one O(E) search."
                },
                {
                  "prompt": "State König's theorem and explain in one or two sentences why it is a corollary of max-flow min-cut applied to G′.",
                  "solution": "König's theorem: in a bipartite graph the maximum matching size equals the minimum vertex cover size. In G′, the maximum flow value equals the maximum matching size (this lesson), and equals the minimum s-t cut capacity (max-flow min-cut). A minimum s-t cut in G′ corresponds exactly to choosing a set of L and R vertices that 'covers' all original edges (a vertex cover) with cost = its size; hence min cut = min vertex cover, giving max matching = min vertex cover. ∎",
                  "hint": "Chain: max matching = max flow = min cut = min vertex cover."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a11l4-i1",
              "front": "How is maximum bipartite matching reduced to max flow?",
              "back": "Add source s and sink t; edges s→L, original L→R, R→t, every capacity 1. A maximum integral flow in this network gives a maximum matching."
            },
            {
              "id": "a11l4-i2",
              "front": "Why does a matching give a flow of equal value?",
              "back": "Send 1 unit along s→u→v→t per matched edge {u,v}; since each vertex is in ≤1 matched edge, capacities and conservation hold and |f| = |M|."
            },
            {
              "id": "a11l4-i3",
              "front": "Why does an integral flow give a matching of equal size?",
              "back": "Capacity-1 edges at s and t force each vertex to carry ≤1 unit, so the L→R edges with f=1 share no vertex; via the cut S={s}∪L, |f| = #such edges = |M|."
            },
            {
              "id": "a11l4-i4",
              "front": "Max flow value vs max matching size?",
              "back": "They are equal (m* = f*): matching→flow gives f*≥m*, and an integral max flow→matching gives m*≥f*."
            },
            {
              "id": "a11l4-i5",
              "front": "Where is integrality essential in the matching reduction?",
              "back": "Turning a max flow into a matching needs 0/1 edge values; the integrality theorem guarantees an integral max flow because all capacities are 1."
            },
            {
              "id": "a11l4-i6",
              "front": "König's theorem (and its flow meaning)?",
              "back": "In a bipartite graph, max matching size = min vertex cover size — exactly max-flow min-cut specialized to the reduction network G′."
            }
          ]
        }
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
          "id": "a12l1",
          "title": "P, NP & Polynomial Reductions",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Why a theory of intractability",
              "body": "By this point you have a toolbox of polynomial-time algorithms — sorting, shortest paths, matching, flow. But for many natural problems every algorithm you can think of is *exponential*: try all subsets, all orderings, all assignments. The theory of **NP-completeness** explains why. It does not (yet) prove these problems require exponential time, but it ties thousands of them together so tightly that a fast algorithm for *one* would give a fast algorithm for *all* — an outcome most researchers believe is impossible.\n\nTo make the theory clean we restrict attention to **decision problems**: problems with a yes/no answer. This is no real loss. An optimization problem like *\"find a smallest vertex cover\"* has a decision twin *\"is there a vertex cover of size ≤ k?\"*; if you can answer the decision version quickly for every k you can binary-search for the optimum and (with a little more work) reconstruct it. Decision problems are exactly the ones we can identify with the *language* L of their yes-instances, which is what makes formal reasoning possible."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Decision problem, instance, language",
              "statement": "A **decision problem** is a function from problem *instances* (finite strings over a fixed alphabet, e.g. an encoding ⟨G, k⟩ of a graph and an integer) to {yes, no}. We identify it with its **language** L = { x : x is a yes-instance }. The **size** |x| of an instance is the length of its encoding. \"Polynomial time\" always means polynomial in |x|."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The class P",
              "statement": "**P** is the class of decision problems L for which there is an algorithm and a polynomial p such that, on every input x, the algorithm halts within p(|x|) steps and accepts iff x ∈ L. Informally: problems we can *solve* in polynomial time."
            },
            {
              "type": "text",
              "heading": "Solve vs. verify",
              "body": "The decisive idea behind NP is to separate **finding** a solution from **checking** one. Consider HAM-CYCLE: *does graph G have a cycle visiting every vertex exactly once?* Finding such a cycle seems to need exponential search. But if a friend *hands you* a candidate cycle, you can verify it in linear time — walk the cycle and confirm it uses each vertex once and consecutive vertices are adjacent. The candidate is called a **certificate** (or witness), and the checker is a **verifier**. NP is the class of problems with short, fast-checkable certificates for their yes-instances."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The class NP (verifier definition)",
              "statement": "A decision problem L is in **NP** if there is a polynomial-time algorithm V (the *verifier*) and a polynomial q such that for every instance x:\n\n  x ∈ L  ⇔  there exists a string c (a *certificate*) with |c| ≤ q(|x|) and V(x, c) = accept.\n\nThat is: yes-instances have a polynomial-size certificate that V verifies in time polynomial in |x|; no-instance has *no* certificate that V will accept."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The gate's first fact, exactly.** A problem is in **NP** iff a proposed solution — a polynomial-size *certificate* — can be **verified in polynomial time**. It is *not* defined as \"solvable in polynomial time\" (that is P), nor as anything about being unsolvable or undecidable."
            },
            {
              "type": "example",
              "heading": "HAM-CYCLE ∈ NP",
              "body": "**Instance:** an undirected graph G = (V, E). **Yes iff** G has a Hamiltonian cycle.\n\n**Certificate:** a permutation ⟨v₁, v₂, …, vₙ⟩ of the vertices — size O(n log n), polynomial.\n\n**Verifier V(G, ⟨v₁,…,vₙ⟩):** check that the vᵢ are exactly the n vertices each used once, and that (vᵢ, vᵢ₊₁) ∈ E for i = 1..n−1 and (vₙ, v₁) ∈ E. This is one pass, O(n + |E|) time.\n\nIf G has a Hamiltonian cycle, listing its vertices in order is a certificate V accepts. If G has none, no permutation describes a cycle, so V rejects every candidate. Hence HAM-CYCLE ∈ NP. Note we made **no claim** that we can *find* the cycle quickly — only verify a given one."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "P ⊆ NP",
              "statement": "Every problem solvable in polynomial time is verifiable in polynomial time: P ⊆ NP.",
              "proof": "Let L ∈ P, decided by a polynomial-time algorithm M. Build a verifier V that *ignores its certificate*: on input (x, c), V runs M(x) and accepts iff M accepts, all within M's polynomial time bound.\n\nIf x ∈ L, then M(x) accepts, so V(x, c) accepts for *every* c — in particular for the empty certificate c = ε (which satisfies |c| ≤ q(|x|) for any q). If x ∉ L, then M(x) rejects, so V(x, c) rejects for all c, and no accepting certificate exists. Thus x ∈ L ⇔ ∃c (|c| ≤ q(|x|) ∧ V(x,c) accepts), and V runs in polynomial time. Hence L ∈ NP. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**P = NP is open.** P ⊆ NP is easy (above). The reverse inclusion NP ⊆ P — that everything verifiable quickly can also be *solved* quickly — is the famous unsolved **P vs NP** question. The whole theory of NP-completeness is built so that we can reason about hardness *without* resolving it."
            },
            {
              "type": "text",
              "heading": "Polynomial-time reductions",
              "body": "To compare the difficulty of two problems we transform one into the other. A **polynomial-time (mapping) reduction** from A to B, written **A ≤_p B**, is a polynomial-time computable function f that maps each instance x of A to an instance f(x) of B so that the *answer is preserved*: x is a yes-instance of A iff f(x) is a yes-instance of B. Intuitively, f packages any question about A as an equivalent question about B, cheaply. The relation A ≤_p B reads \"**B is at least as hard as A**\": a fast algorithm for B yields a fast algorithm for A, so B cannot be strictly easier."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Polynomial-time reduction A ≤_p B",
              "statement": "**A ≤_p B** means there is a function f and a polynomial p such that:\n  1. f is computable in time p(|x|) on every instance x (so also |f(x)| ≤ p(|x|));\n  2. for every instance x of A: x ∈ A ⇔ f(x) ∈ B (answer preservation).\nWe call f a *polynomial-time reduction* from A to B."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Reductions transfer tractability",
              "statement": "If A ≤_p B and B ∈ P, then A ∈ P.",
              "proof": "Because A ≤_p B, there is a reduction f computable in time p(|x|) for a polynomial p, with x ∈ A ⇔ f(x) ∈ B; in particular |f(x)| ≤ p(|x|), since an algorithm running for p(|x|) steps cannot write a longer output.\n\nBecause B ∈ P, there is an algorithm D deciding B in time q(m) for a polynomial q on inputs of size m.\n\nDecide A on input x by the composition: compute y = f(x), then output D(y). **Correctness:** D(y) accepts ⇔ y ∈ B ⇔ f(x) ∈ B ⇔ x ∈ A, using answer preservation. So this algorithm accepts exactly the yes-instances of A. **Running time:** computing y costs p(|x|); since |y| ≤ p(|x|), running D on y costs q(|y|) ≤ q(p(|x|)). The total is p(|x|) + q(p(|x|)), a sum and composition of polynomials, hence a polynomial in |x|. Therefore A is decided in polynomial time: A ∈ P. ∎"
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Direction is everything.** A ≤_p B uses B's easiness to make A easy, so it certifies *B is at least as hard as A* — never the reverse. To argue a *new* problem X is **hard**, you reduce a known-hard problem *to* X (known ≤_p X). Reducing X to something easy proves nothing about X."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Reductions compose (transitivity)",
              "statement": "If A ≤_p B and B ≤_p C, then A ≤_p C.",
              "proof": "Let f reduce A to B in time p₁, and g reduce B to C in time p₂, with |f(x)| ≤ p₁(|x|) and |g(y)| ≤ p₂(|y|). Define h(x) = g(f(x)).\n\n**Answer preservation:** x ∈ A ⇔ f(x) ∈ B (since f reduces A to B) ⇔ g(f(x)) ∈ C (since g reduces B to C). So x ∈ A ⇔ h(x) ∈ C.\n\n**Polynomial time:** computing f(x) takes p₁(|x|), and |f(x)| ≤ p₁(|x|); computing g on that input takes p₂(|f(x)|) ≤ p₂(p₁(|x|)). The total p₁(|x|) + p₂(p₁(|x|)) is polynomial in |x|, and the output size is bounded similarly. Hence h is a polynomial-time reduction and A ≤_p C. ∎"
            },
            {
              "type": "example",
              "heading": "A concrete reduction: INDEPENDENT-SET ≤_p CLIQUE",
              "body": "Let **IND-SET** = {⟨G, k⟩ : G has k pairwise *non-adjacent* vertices} and **CLIQUE** = {⟨G, k⟩ : G has k pairwise *adjacent* vertices}.\n\n**Reduction f:** map ⟨G, k⟩ to ⟨Ḡ, k⟩, where Ḡ is the *complement* graph on the same vertices (edge (u,v) in Ḡ exactly when (u,v) is **not** an edge of G). Building Ḡ takes O(|V|²) time — polynomial.\n\n**Correctness:** a set S is independent in G ⇔ no two of its vertices are adjacent in G ⇔ every two of its vertices *are* adjacent in Ḡ ⇔ S is a clique in Ḡ. So G has an independent set of size k ⇔ Ḡ has a clique of size k, i.e. ⟨G,k⟩ ∈ IND-SET ⇔ f(⟨G,k⟩) = ⟨Ḡ,k⟩ ∈ CLIQUE. This is exactly A ≤_p B with A = IND-SET, B = CLIQUE. (The complement is its own inverse, so CLIQUE ≤_p IND-SET too.)"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "G (left) has independent set {a, c}; in the complement Ḡ (right) the same pair {a, c} becomes an edge — a 2-clique. Complementing swaps 'non-adjacent' for 'adjacent'.",
              "directed": false,
              "nodes": [
                {
                  "id": "a",
                  "label": "a",
                  "x": 12,
                  "y": 25,
                  "tone": "gold"
                },
                {
                  "id": "b",
                  "label": "b",
                  "x": 38,
                  "y": 25
                },
                {
                  "id": "c",
                  "label": "c",
                  "x": 25,
                  "y": 75,
                  "tone": "gold"
                },
                {
                  "id": "A",
                  "label": "a",
                  "x": 70,
                  "y": 25,
                  "tone": "sage"
                },
                {
                  "id": "B",
                  "label": "b",
                  "x": 96,
                  "y": 25
                },
                {
                  "id": "C",
                  "label": "c",
                  "x": 83,
                  "y": 75,
                  "tone": "sage"
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b"
                },
                {
                  "from": "b",
                  "to": "c"
                },
                {
                  "from": "A",
                  "to": "C",
                  "tone": "sage",
                  "bold": true
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Show that SUBSET-SUM = {⟨S, t⟩ : some sub-multiset of the integer set S sums to exactly t} is in NP.",
                  "solution": "Give a certificate and a polynomial verifier. **Certificate:** a subset S′ ⊆ S, described by its list of chosen elements (or an n-bit indicator vector); its size is at most that of the input, hence polynomial. **Verifier V(⟨S,t⟩, S′):** check that S′ ⊆ S and that Σ_{x∈S′} x = t; summing the chosen integers is O(n) additions on numbers no larger than those in the input, polynomial time. If ⟨S,t⟩ is a yes-instance, the witnessing subset is a certificate V accepts; if it is a no-instance, no subset sums to t so V rejects every S′. Therefore SUBSET-SUM ∈ NP. ∎",
                  "hint": "The certificate is the subset itself; the verifier just re-adds it up and compares to t."
                },
                {
                  "prompt": "Prove that ≤_p is reflexive: A ≤_p A for every problem A.",
                  "solution": "Take f to be the identity, f(x) = x. It is computable in linear time (copy the input), so it is polynomial-time, and x ∈ A ⇔ f(x) = x ∈ A trivially preserves the answer. Hence A ≤_p A. ∎",
                  "hint": "What is the cheapest answer-preserving map from instances of A to instances of A?"
                },
                {
                  "prompt": "Suppose A ≤_p B and you are told A ∉ P. What, if anything, can you conclude about B? Justify carefully.",
                  "solution": "Conclude **B ∉ P**. Argue by contraposition of the transfer theorem (A ≤_p B and B ∈ P ⟹ A ∈ P): if B were in P, then A would be in P. Since A ∉ P, B cannot be in P. (Note the *direction*: A ≤_p B says B is at least as hard as A, so A's hardness forces B's. You could *not* conclude anything about A from B's hardness using this reduction.) ∎",
                  "hint": "State the transfer theorem and take its contrapositive."
                },
                {
                  "prompt": "True or false: if A ≤_p B and B ≤_p A, then A and B are the *same* problem. Explain.",
                  "solution": "**False.** A ≤_p B and B ≤_p A make A and B *polynomially equivalent* (each as hard as the other up to polynomial factors), but they need not be identical problems. The complement example shows this: CLIQUE ≤_p IND-SET and IND-SET ≤_p CLIQUE via the complement map, yet CLIQUE and IND-SET are distinct problems on graphs. Polynomial equivalence is an equivalence relation on *difficulty*, not on problem identity. ∎",
                  "hint": "Recall CLIQUE and IND-SET reduce to each other — are they literally the same set of yes-instances?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a12l1-i1",
              "front": "When is a decision problem in NP (verifier definition)?",
              "back": "Iff there is a polynomial-time verifier V and polynomial q so that x is a yes-instance ⇔ there exists a certificate c with |c| ≤ q(|x|) and V(x,c) accepts. Short: yes-instances have a polynomial-size, polynomial-time-checkable certificate."
            },
            {
              "id": "a12l1-i2",
              "front": "Definition of P, and its relation to NP?",
              "back": "P = problems decidable in polynomial time. P ⊆ NP (a poly-time decider is a verifier that ignores its certificate). Whether NP ⊆ P (i.e. P = NP) is open."
            },
            {
              "id": "a12l1-i3",
              "front": "What exactly does A ≤_p B require?",
              "back": "A polynomial-time computable f with x ∈ A ⇔ f(x) ∈ B (answer preservation). It certifies that B is at least as hard as A."
            },
            {
              "id": "a12l1-i4",
              "front": "Transfer theorem: if A ≤_p B and B ∈ P, then?",
              "back": "A ∈ P. Run the poly-time reduction f, then B's poly-time decider on f(x); poly + (poly ∘ poly) is polynomial, and answers are preserved."
            },
            {
              "id": "a12l1-i5",
              "front": "Which direction shows a NEW problem X is hard?",
              "back": "Reduce a known-hard problem TO X (known ≤_p X). Reducing X to an easy problem proves nothing about X."
            },
            {
              "id": "a12l1-i6",
              "front": "Why does optimization reduce to decision?",
              "back": "Binary-search the threshold k using the decision oracle 'is there a solution of value ≤ k?', then reconstruct an optimal solution — all in polynomially many decision calls."
            }
          ]
        },
        {
          "id": "a12l2",
          "title": "NP-Hardness, NP-Completeness & Cook-Levin",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "The hardest problems in NP",
              "body": "Reductions let us *compare* difficulty; now we name the extremes. A problem is **NP-hard** if *every* problem in NP reduces to it — it is at least as hard as everything in NP, whether or not it lies in NP itself. A problem that is NP-hard **and** in NP is **NP-complete**: it is among the *hardest problems within NP*. These problems are the load-bearing wall of the theory: if even one of them turned out to be in P, the whole edifice of NP would collapse into P."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "NP-hard and NP-complete",
              "statement": "A problem B is **NP-hard** if A ≤_p B for *every* A ∈ NP. A problem B is **NP-complete** if (i) B ∈ NP and (ii) B is NP-hard. Write NPC for the class of NP-complete problems."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Collapse theorem: one NPC problem in P forces P = NP",
              "statement": "If some NP-complete problem B is in P, then P = NP.",
              "proof": "We always have P ⊆ NP (proved in the previous section), so it suffices to show NP ⊆ P under the hypothesis. Let B be NP-complete with B ∈ P. Take any A ∈ NP. Because B is NP-hard, A ≤_p B. Because B ∈ P, the transfer theorem (A ≤_p B and B ∈ P ⟹ A ∈ P) gives A ∈ P. As A was an arbitrary member of NP, NP ⊆ P. Combined with P ⊆ NP, we get P = NP. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Equivalently hard, all at once.** The collapse theorem is why NP-complete problems are called 'equivalently hard': a polynomial algorithm for any single one would, by chained reductions, solve *every* problem in NP in polynomial time. Conversely, since each is in NP, if P ≠ NP then *none* of them is in P."
            },
            {
              "type": "text",
              "heading": "The bootstrapping problem — and Cook-Levin's answer",
              "body": "The definition of NP-hard quantifies over *all* of NP — infinitely many problems. Proving that directly for a brand-new problem looks hopeless. The breakthrough, due independently to **Cook (1971)** and **Levin (1973)**, is to do this hard work *once*: exhibit a single explicit NP-complete problem. After that, every further NP-completeness proof can reduce *from* a known NP-complete problem instead of from all of NP."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Cook-Levin Theorem",
              "statement": "**SAT is NP-complete.** Here SAT = {⟨φ⟩ : φ is a satisfiable boolean formula}, i.e. there is an assignment of true/false to its variables making φ evaluate to true.",
              "proof": "*(Proof sketch — the construction is what matters for using the theorem.)*\n\n**SAT ∈ NP.** A certificate is a truth assignment to the variables (size linear in the formula). The verifier substitutes the assignment and evaluates φ in polynomial time, accepting iff φ is true. Satisfiable formulas have an accepted certificate; unsatisfiable ones have none. So SAT ∈ NP.\n\n**SAT is NP-hard.** Let A ∈ NP be arbitrary, verified by a polynomial-time verifier V running in time p(n) on instances of size n. We build, in polynomial time, a boolean formula φ_x from any instance x such that φ_x is satisfiable ⇔ x ∈ A. Because V is a polynomial-time machine, its computation on (x, c) is captured by a tableau of O(p(n)²) cells recording the machine's tape contents, head position, and state at each of its p(n) steps. Introduce boolean variables for the contents of every cell, and write clauses asserting: (1) the start row encodes x followed by the (unknown) certificate c; (2) each step obeys V's transition rule — every cell's next value is a function of its local neighborhood, expressible by a constant-size sub-formula; (3) the final row is an accepting state. The conjunction φ_x is satisfiable exactly when there is a certificate c making V accept (x, c) — i.e. exactly when x ∈ A. The formula has O(p(n)²) clauses and is generated in polynomial time, so A ≤_p SAT. Since A ∈ NP was arbitrary, SAT is NP-hard.\n\nNP-membership plus NP-hardness give: SAT is NP-complete. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The gate's named fact.** By the Cook-Levin theorem, the *first* problem proven NP-complete was **SAT** (boolean satisfiability). It is the seed from which all later NP-completeness proofs grow by reduction."
            },
            {
              "type": "text",
              "heading": "The recipe: proving a NEW problem X is NP-complete",
              "body": "With SAT in hand, NP-completeness proofs become a two-step ritual. To show a target problem X is NP-complete:\n\n**Step 1 — membership.** Show **X ∈ NP**: exhibit a polynomial-size certificate and a polynomial-time verifier.\n\n**Step 2 — hardness.** Choose a **known** NP-complete problem Y and give a polynomial-time reduction **Y ≤_p X** (note the direction: *from* the known-hard problem *to* X). This makes X NP-hard.\n\nStep 2 keeps the quantifier-over-all-of-NP work *implicit*: since every A ∈ NP reduces to Y, and Y ≤_p X, transitivity gives A ≤_p X for all A. The next theorem makes that rigorous."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The gate's recipe, exactly.** To prove a problem X is NP-complete you show X ∈ NP **and** you **reduce a known NP-complete problem TO X**. Reducing X to a problem in P, or showing X ∈ P, or showing X undecidable, are all the *wrong* move — only a reduction *into* X transfers hardness."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Reducing from one NPC problem suffices for NP-hardness",
              "statement": "Let Y be NP-complete and X ∈ NP. If Y ≤_p X, then X is NP-complete.",
              "proof": "We must show X is NP-hard, i.e. A ≤_p X for every A ∈ NP. Fix any A ∈ NP. Since Y is NP-complete it is NP-hard, so A ≤_p Y. By hypothesis Y ≤_p X. By transitivity of polynomial reductions (composition lemma), A ≤_p Y and Y ≤_p X give A ≤_p X. As A ∈ NP was arbitrary, every NP problem reduces to X, so X is NP-hard. Together with the assumption X ∈ NP, X is NP-complete. ∎"
            },
            {
              "type": "decision",
              "heading": "Getting the reduction direction right when proving X is NP-complete",
              "rows": [
                [
                  "Goal",
                  "Show new problem X is NP-complete"
                ],
                [
                  "Step 1 — show X ∈ NP",
                  "Give certificate + poly-time verifier for X"
                ],
                [
                  "Step 2 — show X NP-hard",
                  "Reduce a KNOWN NP-complete Y to X:  Y ≤_p X"
                ],
                [
                  "Correct direction",
                  "known-hard  →  X  (hardness flows INTO X)"
                ],
                [
                  "Wrong direction (proves nothing)",
                  "X  →  easy problem  (X ≤_p P-problem)"
                ],
                [
                  "Map a YES-instance of Y to",
                  "a YES-instance of X (and NO ↦ NO) — both directions of ⇔"
                ]
              ]
            },
            {
              "type": "example",
              "heading": "3-SAT is NP-complete (reducing from SAT)",
              "body": "**3-SAT** restricts SAT to formulas in conjunctive normal form with *exactly three literals per clause*. It is the workhorse starting point for graph reductions.\n\n**3-SAT ∈ NP:** a satisfying assignment is a certificate; substitute and evaluate in polynomial time.\n\n**SAT ≤_p 3-SAT (hardness):** transform an arbitrary CNF formula clause-by-clause into 3-literal clauses, preserving satisfiability, by adding fresh variables. A long clause (ℓ₁ ∨ ℓ₂ ∨ … ∨ ℓₖ), k ≥ 4, becomes a chain (ℓ₁ ∨ ℓ₂ ∨ y₁)(¬y₁ ∨ ℓ₃ ∨ y₂)…(¬y_{k−3} ∨ ℓ_{k−1} ∨ ℓₖ) with new yᵢ. One checks: the original clause is satisfiable under an assignment ⇔ the chain is satisfiable by some extension of that assignment to the yᵢ (the yᵢ propagate the 'satisfied' signal). Short clauses (1 or 2 literals) are padded with duplicate literals or extra dummy variables. The transformation is linear in the formula size, hence polynomial. So SAT ≤_p 3-SAT, and by the previous theorem 3-SAT is NP-complete. ∎"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "The reduction web. SAT is proven NP-complete from scratch by Cook-Levin (gold). Every other problem becomes NP-complete by a chain of reductions FROM an already-NP-complete problem (arrows = ≤_p, pointing toward the new target).",
              "directed": true,
              "height": 60,
              "nodes": [
                {
                  "id": "sat",
                  "label": "SAT",
                  "x": 8,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "3sat",
                  "label": "3-SAT",
                  "x": 32,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "clq",
                  "label": "CLIQUE",
                  "x": 60,
                  "y": 22,
                  "tone": "sage"
                },
                {
                  "id": "is",
                  "label": "IND-SET",
                  "x": 60,
                  "y": 78,
                  "tone": "sage"
                },
                {
                  "id": "vc",
                  "label": "VERTEX-COVER",
                  "x": 90,
                  "y": 50,
                  "tone": "ember"
                }
              ],
              "edges": [
                {
                  "from": "sat",
                  "to": "3sat",
                  "label": "Cook-Levin ⟶ chain",
                  "directed": true
                },
                {
                  "from": "3sat",
                  "to": "clq",
                  "label": "≤_p",
                  "directed": true
                },
                {
                  "from": "3sat",
                  "to": "is",
                  "label": "≤_p",
                  "directed": true
                },
                {
                  "from": "clq",
                  "to": "is",
                  "label": "≤_p (complement)",
                  "directed": true
                },
                {
                  "from": "is",
                  "to": "vc",
                  "label": "≤_p (complement set)",
                  "directed": true,
                  "bold": true
                }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Carefully distinguish NP-hard from NP-complete. Give a (plausible) example of a problem that is NP-hard but believed NOT to be in NP.",
                  "solution": "**NP-hard** means every NP problem reduces to it (at least as hard as all of NP) — no claim that it is itself in NP. **NP-complete** = NP-hard AND in NP. An NP-hard problem may be *strictly harder* than NP, hence outside NP. Example: the *halting problem* is NP-hard (indeed undecidable, so every NP problem trivially reduces to it) but is not in NP — it is not even decidable, let alone polynomial-time verifiable. Another standard example: deciding whether a given assignment is the *unique* satisfying assignment, or TAUTOLOGY/co-NP-style problems, are NP-hard but not known/believed to be in NP. ∎",
                  "hint": "NP-hard drops the requirement of membership in NP. What lies provably outside NP?"
                },
                {
                  "prompt": "Your classmate proposes to prove that CLIQUE is NP-complete by giving a polynomial-time reduction from CLIQUE to 3-SAT (CLIQUE ≤_p 3-SAT). Explain precisely why this does not prove CLIQUE is NP-hard.",
                  "solution": "The reduction goes the *wrong way*. CLIQUE ≤_p 3-SAT says 3-SAT is at least as hard as CLIQUE — it transfers hardness *into* 3-SAT, not into CLIQUE, and only confirms CLIQUE ∈ NP-territory (in fact it is a true statement, but unhelpful for CLIQUE's hardness). To prove CLIQUE is NP-hard you must reduce a known NP-complete problem *to* CLIQUE: 3-SAT ≤_p CLIQUE. Then since 3-SAT is NP-complete and CLIQUE ∈ NP, CLIQUE is NP-complete. ∎",
                  "hint": "Which problem does X ≤_p Y certify as 'at least as hard'?"
                },
                {
                  "prompt": "Prove: if any NP-complete problem is NOT in P, then P ≠ NP and in fact NO NP-complete problem is in P.",
                  "solution": "Suppose NP-complete B ∉ P. If we had P = NP, then since B ∈ NP we'd get B ∈ P, contradiction; hence P ≠ NP. Now suppose for contradiction some NP-complete C ∈ P. By the collapse theorem (an NPC problem in P forces P = NP), we'd get P = NP, again contradicting P ≠ NP. Therefore no NP-complete problem is in P. ∎",
                  "hint": "Use the collapse theorem in both directions: one NPC problem in P ⟺ P = NP."
                },
                {
                  "prompt": "Outline the two ingredients of the Cook-Levin proof and state precisely what they together establish.",
                  "solution": "**(1) SAT ∈ NP:** a satisfying assignment is a polynomial-size certificate verifiable by substitution-and-evaluation in polynomial time. **(2) SAT is NP-hard:** for an arbitrary A ∈ NP with poly-time verifier V running in time p(n), one builds in polynomial time a formula φ_x (over O(p(n)²) variables encoding V's computation tableau) that is satisfiable ⇔ V accepts (x, c) for some certificate c ⇔ x ∈ A; this is A ≤_p SAT for every A ∈ NP. Together: SAT ∈ NP and SAT is NP-hard, so **SAT is NP-complete** — the first problem proven so, and the seed for all reductions. ∎",
                  "hint": "Membership + hardness; the hardness step encodes an arbitrary NP verifier's computation as a formula."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a12l2-i1",
              "front": "NP-hard vs NP-complete?",
              "back": "NP-hard: every problem in NP reduces to it (≥ all of NP), possibly outside NP. NP-complete: NP-hard AND in NP — the hardest problems within NP."
            },
            {
              "id": "a12l2-i2",
              "front": "What does the Cook-Levin theorem establish?",
              "back": "SAT (boolean satisfiability) is NP-complete — the first such problem. It is in NP (assignment = certificate) and NP-hard (encode any NP verifier's poly-time computation as a satisfiable-iff-accepting formula)."
            },
            {
              "id": "a12l2-i3",
              "front": "Two steps to prove X is NP-complete?",
              "back": "(1) Show X ∈ NP (certificate + poly-time verifier). (2) Reduce a KNOWN NP-complete problem Y to X: Y ≤_p X (this makes X NP-hard)."
            },
            {
              "id": "a12l2-i4",
              "front": "Why does reducing from ONE NPC problem suffice for NP-hardness?",
              "back": "If Y is NP-complete and Y ≤_p X, then for every A ∈ NP, A ≤_p Y ≤_p X, so A ≤_p X by transitivity. Thus X is NP-hard."
            },
            {
              "id": "a12l2-i5",
              "front": "Collapse theorem?",
              "back": "If any one NP-complete problem is in P, then P = NP (every NP problem reduces to it, then transfer puts all of NP in P)."
            },
            {
              "id": "a12l2-i6",
              "front": "Common direction mistake in NP-hardness proofs?",
              "back": "Reducing X to an easy/known problem (X ≤_p Y). That transfers hardness into Y, not X. You must reduce the known-hard problem TO X (Y ≤_p X)."
            }
          ]
        },
        {
          "id": "a12l3",
          "title": "A Full NP-Completeness Proof: VERTEX-COVER",
          "estMinutes": 32,
          "content": [
            {
              "type": "text",
              "heading": "From recipe to a complete proof",
              "body": "We now carry out the two-step recipe end-to-end on a single problem, **VERTEX-COVER (VC)**. This is the proof template you will reproduce on the mastery gate, so we develop it slowly and completely: the membership argument, a fully verified reduction from a known NP-complete problem, and the bookkeeping that ties them into an NP-completeness theorem."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "VERTEX-COVER",
              "statement": "A **vertex cover** of an undirected graph G = (V, E) is a set S ⊆ V such that every edge has at least one endpoint in S. The decision problem is\n  VC = { ⟨G, k⟩ : G has a vertex cover S with |S| ≤ k }.\nRelatedly, an **independent set** is a set with no two vertices adjacent, and IND-SET = { ⟨G, k⟩ : G has an independent set of size ≥ k }."
            },
            {
              "type": "text",
              "heading": "Step 1 — VERTEX-COVER ∈ NP",
              "body": "We must produce a polynomial-size certificate and a polynomial-time verifier, then argue the verifier accepts exactly the yes-instances. This is the part of the proof the gate's first VC problem asks for explicitly."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "VERTEX-COVER ∈ NP",
              "statement": "VC is in NP.",
              "proof": "**Certificate.** For an instance ⟨G, k⟩, the certificate is a vertex subset S ⊆ V. It is described by listing its vertices (or an |V|-bit indicator), of size at most |V| ≤ |x| — polynomial in the input.\n\n**Verifier V(⟨G,k⟩, S).** Check two things: (i) |S| ≤ k; (ii) for every edge (u, v) ∈ E, at least one of u, v lies in S. Step (i) is one count. Step (ii) is a single scan over the edge list, testing membership in S (using a boolean array of size |V| for O(1) lookups). Total time O(|V| + |E|) — polynomial. Accept iff both checks pass.\n\n**Correctness.** If ⟨G,k⟩ ∈ VC, let S* be a vertex cover with |S*| ≤ k; then V(⟨G,k⟩, S*) passes both checks and accepts. Conversely, if some S makes V accept, then |S| ≤ k and S touches every edge, so S is a vertex cover of size ≤ k, witnessing ⟨G,k⟩ ∈ VC. Hence ⟨G,k⟩ ∈ VC ⇔ ∃S (|S| ≤ q(|x|) ∧ V accepts), with V polynomial-time. Therefore VC ∈ NP. ∎"
            },
            {
              "type": "text",
              "heading": "Step 2 — VERTEX-COVER is NP-hard",
              "body": "We reduce the known NP-complete problem **CLIQUE** to VC (CLIQUE ≤_p VC). The bridge is a single, exact structural fact connecting cliques, independent sets, and vertex covers in the *complement* graph. We isolate it as a lemma, prove it, and then assemble the reduction."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Cover–Independent-Set complementarity",
              "statement": "For a graph G = (V, E) and S ⊆ V:  S is a vertex cover of G  ⇔  V \\ S is an independent set of G. Consequently G has a vertex cover of size ≤ k ⇔ G has an independent set of size ≥ |V| − k.",
              "proof": "(⇒) Suppose S is a vertex cover. Take any two vertices u, v ∈ V \\ S. If (u, v) were an edge, the cover S would need to contain u or v — but neither is in S. So no edge joins two vertices of V \\ S; that is, V \\ S is independent.\n\n(⇐) Suppose V \\ S is independent. Take any edge (u, v) ∈ E. Since V \\ S has no edges, u and v cannot both lie in V \\ S, so at least one lies in S. Thus S covers every edge — it is a vertex cover.\n\nThe size statement follows by complementation: |V \\ S| = |V| − |S|, so |S| ≤ k ⇔ |V \\ S| ≥ |V| − k. ∎"
            },
            {
              "type": "example",
              "heading": "The reduction CLIQUE ≤_p VC, worked on an instance",
              "body": "Recall CLIQUE ≤_p IND-SET via the complement: ⟨G, k⟩ has a k-clique ⇔ ⟨Ḡ, k⟩ has an independent set of size k (a clique in G = an independent set in Ḡ). Composing with the complementarity lemma gives a reduction **all the way to VC**.\n\n**Reduction f:**  ⟨G, k⟩  ↦  ⟨Ḡ, n − k⟩,  where n = |V| and Ḡ is the complement graph.\n\n**Worked instance.** Let G be a triangle plus an isolated vertex: V = {1,2,3,4}, edges {12,13,23}; ask if G has a clique of size k = 3 (it does — {1,2,3}). Here n = 4, so f outputs ⟨Ḡ, 4 − 3⟩ = ⟨Ḡ, 1⟩. The complement Ḡ has edges exactly where G had none: {14, 24, 34} (a star centered at 4). Does Ḡ have a vertex cover of size ≤ 1? Yes — {4} covers all three star edges. The chain that makes this correct: a 3-clique {1,2,3} in G ⇔ a 3-independent-set {1,2,3} in Ḡ ⇔ (complementarity) a vertex cover Ḡ of size 4 − 3 = 1, namely {4}. Both sides are YES, as required."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "f(⟨G,3⟩) = ⟨Ḡ,1⟩. The 3-clique {1,2,3} in G (left, gold) complements to the independent set {1,2,3} in Ḡ (right), whose complement {4} (rust) is a size-1 vertex cover of Ḡ.",
              "directed": false,
              "nodes": [
                {
                  "id": "g1",
                  "label": "1",
                  "x": 10,
                  "y": 20,
                  "tone": "gold"
                },
                {
                  "id": "g2",
                  "label": "2",
                  "x": 30,
                  "y": 20,
                  "tone": "gold"
                },
                {
                  "id": "g3",
                  "label": "3",
                  "x": 20,
                  "y": 55,
                  "tone": "gold"
                },
                {
                  "id": "g4",
                  "label": "4",
                  "x": 40,
                  "y": 75
                },
                {
                  "id": "h1",
                  "label": "1",
                  "x": 66,
                  "y": 20,
                  "tone": "sage"
                },
                {
                  "id": "h2",
                  "label": "2",
                  "x": 92,
                  "y": 20,
                  "tone": "sage"
                },
                {
                  "id": "h3",
                  "label": "3",
                  "x": 66,
                  "y": 60,
                  "tone": "sage"
                },
                {
                  "id": "h4",
                  "label": "4",
                  "x": 92,
                  "y": 70,
                  "tone": "rust"
                }
              ],
              "edges": [
                {
                  "from": "g1",
                  "to": "g2",
                  "tone": "gold",
                  "bold": true
                },
                {
                  "from": "g1",
                  "to": "g3",
                  "tone": "gold",
                  "bold": true
                },
                {
                  "from": "g2",
                  "to": "g3",
                  "tone": "gold",
                  "bold": true
                },
                {
                  "from": "h1",
                  "to": "h4",
                  "tone": "rust"
                },
                {
                  "from": "h2",
                  "to": "h4",
                  "tone": "rust"
                },
                {
                  "from": "h3",
                  "to": "h4",
                  "tone": "rust"
                }
              ]
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "VERTEX-COVER is NP-complete",
              "statement": "VC is NP-complete.",
              "proof": "By the lemma 'VERTEX-COVER ∈ NP', VC ∈ NP. It remains to show VC is NP-hard via CLIQUE ≤_p VC (CLIQUE is known NP-complete).\n\n**The map.** f(⟨G, k⟩) = ⟨Ḡ, n − k⟩, where n = |V(G)| and Ḡ is the complement of G. Building Ḡ and computing n − k takes O(n²) time, so f is polynomial-time (and its output has polynomial size).\n\n**Answer preservation.** Chain three equivalences:\n  ⟨G, k⟩ ∈ CLIQUE\n  ⇔ G has a clique of size k\n  ⇔ Ḡ has an independent set of size k   (a set is a clique in G iff it is independent in Ḡ, since edges and non-edges swap)\n  ⇔ Ḡ has a vertex cover of size ≤ n − k   (complementarity lemma applied to Ḡ: V \\ S independent of size ≥ k ⇔ S a cover of size ≤ n − k)\n  ⇔ ⟨Ḡ, n − k⟩ ∈ VC\n  ⇔ f(⟨G,k⟩) ∈ VC.\nThus ⟨G,k⟩ ∈ CLIQUE ⇔ f(⟨G,k⟩) ∈ VC, so f is a valid polynomial-time reduction and CLIQUE ≤_p VC.\n\nSince CLIQUE is NP-complete and CLIQUE ≤_p VC with VC ∈ NP, the theorem 'reducing from one NPC problem suffices' makes VC NP-complete. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Pattern to memorize.** Every NP-completeness proof is: *one* NP-membership argument (certificate + verifier) **plus** *one* reduction FROM a known NP-complete problem TO your problem, with a fully verified ⇔. For VC the certificate is a vertex set; the reduction is CLIQUE ≤_p VC via the complement and complementarity. State both directions of every ⇔ — that is where partial credit lives."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "(Gate rehearsal.) Prove that VERTEX-COVER is in NP. Then state the two steps required to prove it is NP-complete.",
                  "solution": "**VC ∈ NP.** An instance is ⟨G, k⟩ with G = (V, E); it is a yes-instance iff some set of at most k vertices includes an endpoint of every edge. Use a candidate vertex set S as the certificate (size ≤ |V|, polynomial). The verifier checks in polynomial time that |S| ≤ k and that every edge (u,v) ∈ E has u ∈ S or v ∈ S — a single O(|V|+|E|) pass over the edges with O(1) membership tests. It accepts iff both hold, i.e. exactly the yes-instances, so VC ∈ NP.\n\n**Two NP-completeness steps.** (1) Show VC ∈ NP (just done). (2) Give a polynomial-time reduction FROM a known NP-complete problem (e.g. CLIQUE, IND-SET, or 3-SAT) TO VC, establishing NP-hardness. Together these give NP-completeness. ∎",
                  "hint": "Certificate = a vertex subset; verifier scans the edges. Then: in NP + a reduction from a known-complete problem."
                },
                {
                  "prompt": "Give the reduction IND-SET ≤_p VC directly (without going through CLIQUE), and prove it correct.",
                  "solution": "**Map:** f(⟨G, k⟩) = ⟨G, n − k⟩ with n = |V| (same graph, complemented threshold). It is computable in O(1) extra time beyond reading the input — polynomial. **Correctness:** ⟨G,k⟩ ∈ IND-SET ⇔ G has an independent set of size ≥ k ⇔ (complementarity lemma) G has a vertex cover of size ≤ n − k ⇔ ⟨G, n−k⟩ ∈ VC ⇔ f(⟨G,k⟩) ∈ VC. So IND-SET ≤_p VC. Since IND-SET is NP-complete and VC ∈ NP, this gives VC NP-complete. ∎",
                  "hint": "Same graph; use the complementarity lemma with threshold n − k. No complement graph needed."
                },
                {
                  "prompt": "In the worked instance (triangle {1,2,3} plus isolated vertex 4), suppose instead we ask whether G has a clique of size k = 2. What does f produce, and verify both sides agree.",
                  "solution": "n = 4, k = 2, so f(⟨G,2⟩) = ⟨Ḡ, 4 − 2⟩ = ⟨Ḡ, 2⟩, where Ḡ is the star with edges {14,24,34}. **Left:** G has a 2-clique (any edge of the triangle, e.g. {1,2}), so ⟨G,2⟩ ∈ CLIQUE. **Right:** does Ḡ have a vertex cover of size ≤ 2? Yes: {4} (size 1 ≤ 2) already covers all star edges. Both sides YES, agreeing. (Equivalently the size-2 independent set {1,2} in Ḡ complements to the cover {3,4}, also size 2.) ∎",
                  "hint": "Plug k = 2 into f, build Ḡ once, then check clique on the left and ≤(n−k) cover on the right."
                },
                {
                  "prompt": "Prove the complementarity size identity directly: G has a minimum vertex cover of size c ⇔ G has a maximum independent set of size n − c.",
                  "solution": "By the complementarity lemma, S is a vertex cover ⇔ V \\ S is independent, and this bijection S ↦ V \\ S between covers and independent sets reverses size (|V\\S| = n − |S|). Hence the smallest cover corresponds to the largest independent set: if c = min |S| over covers, then n − c = max |V\\S| = max independent-set size; and conversely. So minimum-vertex-cover size c and maximum-independent-set size n − c always sum to n. ∎",
                  "hint": "The map S ↦ V\\S is a size-reversing bijection between covers and independent sets; min on one side ↔ max on the other."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a12l3-i1",
              "front": "Certificate and verifier showing VC ∈ NP?",
              "back": "Certificate: a vertex subset S. Verifier: check |S| ≤ k and that every edge has an endpoint in S (O(|V|+|E|) scan). Accepts exactly the yes-instances, so VC ∈ NP."
            },
            {
              "id": "a12l3-i2",
              "front": "Complementarity lemma (cover ↔ independent set)?",
              "back": "S is a vertex cover of G ⇔ V \\ S is an independent set of G. Hence VC of size ≤ k ⇔ independent set of size ≥ n − k."
            },
            {
              "id": "a12l3-i3",
              "front": "The reduction CLIQUE ≤_p VC?",
              "back": "f(⟨G,k⟩) = ⟨Ḡ, n−k⟩. Correct because k-clique in G ⇔ k-independent-set in Ḡ ⇔ vertex cover of Ḡ of size ≤ n−k."
            },
            {
              "id": "a12l3-i4",
              "front": "The two steps that proved VC NP-complete?",
              "back": "(1) VC ∈ NP (vertex-set certificate + edge-scan verifier). (2) CLIQUE ≤_p VC (a reduction from a known NP-complete problem), giving NP-hardness."
            },
            {
              "id": "a12l3-i5",
              "front": "min vertex cover + max independent set = ?",
              "back": "= n (the number of vertices). The map S ↦ V\\S is a size-reversing bijection between covers and independent sets."
            },
            {
              "id": "a12l3-i6",
              "front": "Why state BOTH directions of every ⇔ in a reduction proof?",
              "back": "Answer preservation requires x ∈ A ⇔ f(x) ∈ B. A YES↦YES map alone is not a valid reduction; you must also show NO↦NO (equivalently the reverse implication)."
            }
          ]
        },
        {
          "id": "a12l4",
          "title": "The Landscape & Coping With Intractability",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "A web of equivalently hard problems",
              "body": "Since Cook-Levin (1971), thousands of natural problems across logic, graphs, scheduling, and number theory have been proven NP-complete by chains of reductions — among them 3-SAT, CLIQUE, INDEPENDENT-SET, VERTEX-COVER, HAMILTONIAN-CYCLE, the decision form of TSP, SUBSET-SUM, GRAPH-COLORING, and SET-COVER. By the collapse theorem these are *all polynomially inter-reducible*: a polynomial algorithm for any single one would solve every problem in NP. The practical skill is **recognition** — spotting that a problem you face is (or contains as a special case) a known NP-complete problem, so you can stop looking for an efficient exact algorithm."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Equivalent hardness within NPC",
              "statement": "Any two NP-complete problems X and Y are polynomially inter-reducible: X ≤_p Y and Y ≤_p X.",
              "proof": "Both X and Y are NP-complete, hence in NP and NP-hard. Since Y is NP-hard and X ∈ NP, X ≤_p Y. Symmetrically, since X is NP-hard and Y ∈ NP, Y ≤_p X. Thus the two are inter-reducible — solving either in polynomial time would, via these reductions, solve the other (and indeed all of NP, by the collapse theorem). ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**NP-completeness is a redirection, not a dead end.** A proof that your problem is NP-complete is *useful*: it tells you to stop hunting for a fast, exact, general algorithm (almost certainly impossible unless P = NP) and pivot your effort to one of the coping strategies below. That redirection is the practical payoff of the whole theory."
            },
            {
              "type": "text",
              "heading": "Four ways to cope",
              "body": "When a problem is NP-complete you relax exactly one of the three demands *exact / general / polynomial* that you cannot have all of:\n\n**1. Approximation.** Give up *exactness*: design a polynomial algorithm with a *provable* approximation ratio (e.g. a factor-2 vertex cover). The next unit makes this rigorous.\n\n**2. Heuristics / exact-exponential methods.** Give up worst-case *polynomial* time: branch-and-bound, ILP solvers, SAT solvers, and DPLL routinely crush large instances that arise in practice, even though their worst case is exponential.\n\n**3. Special cases / parameterization.** Give up *generality*: restrict the input. VERTEX-COVER is polynomial on trees and on bipartite graphs (König's theorem), and fixed-parameter tractable in the solution size k (solvable in O(2ᵏ·n) time) — fast whenever k is small.\n\n**4. Randomization / average-case.** Accept a probabilistic guarantee, or solve the instances that actually occur (which may be far from worst-case)."
            },
            {
              "type": "example",
              "heading": "Coping strategy 1, made concrete: 2-approximation for VERTEX-COVER",
              "body": "Even though VC is NP-complete, this greedy algorithm returns a cover at most **twice** the optimum, in polynomial time.\n\n**APPROX-VC(G):** C ← ∅; while E ≠ ∅, pick any remaining edge (u, v), add *both* u and v to C, and delete all edges incident to u or v; return C.\n\n**Why it's a valid cover:** the loop ends only when every edge has been deleted, and an edge is deleted only once one of its endpoints enters C — so C touches every original edge.\n\n**Why ≤ 2·OPT:** let A be the set of edges *picked* in the loop. No two edges in A share an endpoint (once an edge is picked, all edges touching its endpoints are deleted), so A is a *matching*. Any vertex cover — in particular an optimum cover C* — must contain at least one endpoint of each edge of A, and these endpoints are distinct, so |C*| ≥ |A|. But |C| = 2|A| (we add both endpoints of each picked edge). Hence |C| = 2|A| ≤ 2|C*| = 2·OPT. This is a worked illustration of strategy 1: a provable ratio replaces exactness."
            },
            {
              "type": "decision",
              "heading": "Choosing a coping strategy",
              "rows": [
                [
                  "You need a provable quality guarantee, fast",
                  "Approximation algorithm with a ratio (e.g. 2-approx VC)"
                ],
                [
                  "Instances are large but structured / real-world",
                  "Heuristics, branch-and-bound, ILP/SAT solvers"
                ],
                [
                  "Your inputs always have special structure",
                  "Exploit it: trees, bipartite, planar, bounded-parameter"
                ],
                [
                  "The solution size k is small",
                  "Fixed-parameter algorithm, e.g. O(2ᵏ·n)"
                ],
                [
                  "A probabilistic guarantee is acceptable",
                  "Randomized / average-case algorithm"
                ],
                [
                  "You still want THE exact optimum, any size, fast",
                  "Impossible unless P = NP — pick one of the rows above"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Recognize, then redirect.** The most valuable move in practice is the *recognition* step: 'this scheduling/packing/routing problem is just SUBSET-SUM / VERTEX-COVER / TSP in disguise.' Prove the embedding once (a reduction FROM the known-complete problem), and you have license to abandon the search for a fast exact algorithm and invest in approximation, heuristics, or structure."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Name four NP-complete problems and, for each, name the certificate that puts it in NP.",
                  "solution": "Examples: **3-SAT** — a satisfying truth assignment; **CLIQUE** — the set of k mutually adjacent vertices; **VERTEX-COVER** — a vertex subset S of size ≤ k touching every edge; **HAMILTONIAN-CYCLE** — a permutation of the vertices forming the cycle; **SUBSET-SUM** — the chosen sub-multiset summing to t; **TSP-decision** — a tour of length ≤ B. Any four, each with its (polynomial-size, polynomial-time-checkable) certificate. ∎",
                  "hint": "For each problem, ask: 'what would a friend hand me that I could check fast?'"
                },
                {
                  "prompt": "Explain why a single polynomial-time algorithm for ONE NP-complete problem would solve them all in polynomial time.",
                  "solution": "Let B be NP-complete with a polynomial-time algorithm. Take any NP-complete (indeed any NP) problem A. Since B is NP-hard, A ≤_p B; since B ∈ P, the transfer theorem gives A ∈ P. So every NP problem — in particular every other NP-complete problem — would be polynomial-time solvable, and P = NP (collapse theorem). They are all inter-reducible, so one fast algorithm propagates to all via the reductions. ∎",
                  "hint": "Use NP-hardness of B (everything reduces to it) plus the transfer theorem."
                },
                {
                  "prompt": "Prove that the greedy APPROX-VC algorithm runs in polynomial time and returns a vertex cover. (You need not re-prove the factor-2 bound.)",
                  "solution": "**Cover:** each iteration deletes at least one edge (in fact all edges incident to the two chosen endpoints), so after ≤ |E| iterations E is empty. An edge is deleted only when an endpoint of it is added to C, so by termination every edge has an endpoint in C — C is a vertex cover. **Time:** each edge is examined and deleted once; with adjacency lists, deleting all edges incident to u and v across the run is O(|V| + |E|) total. So the algorithm is polynomial. ∎",
                  "hint": "Bound the number of iterations by |E|, and argue every edge gets an endpoint in C before it is deleted."
                },
                {
                  "prompt": "You face a problem and prove it is NP-complete. List three concrete next actions (not 'find a fast exact algorithm') and say what each gives up.",
                  "solution": "(1) **Approximation algorithm** — give up exactness for a provable ratio (e.g. factor-2). (2) **Heuristic / ILP or SAT solver / branch-and-bound** — give up worst-case polynomial time, but solve real instances fast. (3) **Restrict to a special case or parameter** — give up generality (e.g. trees, bipartite graphs, or small solution size k via an O(2ᵏ·n) FPT algorithm). (A fourth: accept a randomized / average-case guarantee.) Each relaxes exactly one of exact / general / polynomial. ∎",
                  "hint": "You cannot keep exact AND general AND polynomial — each strategy drops one."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a12l4-i1",
              "front": "Name four NP-complete problems.",
              "back": "3-SAT, CLIQUE, VERTEX-COVER, INDEPENDENT-SET, HAMILTONIAN-CYCLE, SUBSET-SUM, TSP-decision, GRAPH-COLORING (any four)."
            },
            {
              "id": "a12l4-i2",
              "front": "Why are all NP-complete problems 'equivalently hard'?",
              "back": "Any two are polynomially inter-reducible (each is in NP and NP-hard), so a poly-time algorithm for one solves them all — and all of NP (collapse theorem)."
            },
            {
              "id": "a12l4-i3",
              "front": "Four ways to cope with an NP-complete problem?",
              "back": "(1) Approximation with a provable ratio; (2) heuristics / exact-exponential solvers (branch-and-bound, ILP, SAT); (3) special cases / parameterization (trees, bipartite, FPT in k); (4) randomization / average-case."
            },
            {
              "id": "a12l4-i4",
              "front": "APPROX-VC guarantee and why?",
              "back": "Returns a vertex cover of size ≤ 2·OPT in polynomial time: the picked edges form a matching A, any cover needs ≥ |A| vertices so OPT ≥ |A|, while the output has 2|A| ≤ 2·OPT."
            },
            {
              "id": "a12l4-i5",
              "front": "Practical payoff of proving NP-completeness?",
              "back": "It redirects effort: stop seeking a fast exact general algorithm (impossible unless P=NP) and pivot to approximation, heuristics, special structure, or randomization."
            },
            {
              "id": "a12l4-i6",
              "front": "The trade-off every coping strategy makes?",
              "back": "You cannot have exact AND general AND polynomial simultaneously (unless P=NP); each strategy gives up exactly one of those three."
            }
          ]
        }
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
          "id": "a13l1",
          "title": "Approximation Algorithms & Vertex Cover",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "When optimal is out of reach",
              "body": "Unit 12 established that problems like VERTEX-COVER, SET-COVER, and TSP are **NP-hard**: barring P = NP, no polynomial-time algorithm finds an exact optimum. But intractability of the *optimum* does not force us to abandon polynomial time. We can instead demand a solution that is **provably within a guaranteed factor** of optimal, on *every* input. This is the contract of an approximation algorithm, and the central intellectual move is learning to bound the ratio to OPT **without ever computing OPT**."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Approximation ratio",
              "statement": "Let Π be an optimization problem with non-negative objective, and let OPT(I) be the optimum value on instance I. For an algorithm A returning value A(I), the **approximation ratio** is\n\n  ρ = sup_I  max( A(I)/OPT(I),  OPT(I)/A(I) ).\n\nA is a **ρ-approximation algorithm** (ρ ≥ 1) if it runs in polynomial time and, for every instance I:\n  • **minimization:** A(I) ≤ ρ·OPT(I);\n  • **maximization:** A(I) ≥ (1/ρ)·OPT(I).\n\nThe definition is taken so that ρ ≥ 1 in both cases, with ρ = 1 meaning *exactly optimal*."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Read the guarantee as a promise over all inputs, not an average.** A 2-approximation is never worse than twice optimal — even on its single most adversarial instance. There is no probability and no distributional assumption here; this is a worst-case deterministic bound."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The bracketing principle",
              "statement": "Let Π be a minimization problem. Suppose for every instance I there is a quantity L(I) with (a) L(I) ≤ OPT(I) and (b) A(I) ≤ ρ·L(I). Then A is a ρ-approximation. (Symmetrically for maximization with an upper bound U(I) ≥ OPT(I) and A(I) ≥ U(I)/ρ.)",
              "proof": "Assume (a) and (b). Chain the two inequalities: A(I) ≤ ρ·L(I) ≤ ρ·OPT(I), using L(I) ≤ OPT(I) and ρ > 0 to preserve the direction. This holds for every I, so A(I) ≤ ρ·OPT(I) for all I, which is exactly the minimization guarantee. Because A runs in polynomial time by hypothesis, A is a ρ-approximation. The maximization case is identical with inequalities reversed: A(I) ≥ U(I)/ρ ≥ OPT(I)/ρ. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The whole game is finding L(I).** OPT(I) is unknown and NP-hard to compute, so a usable lower bound L(I) that we *can* compute and reason about is the scarce resource. The matching in vertex cover, the LP relaxation value, and counting arguments are all sources of such bounds."
            },
            {
              "type": "code",
              "heading": "Greedy matching cover",
              "lang": "text",
              "code": "APPROX-VERTEX-COVER(G = (V, E)):\n  C ← ∅\n  E' ← E                       // edges not yet covered\n  M ← ∅                        // the edges we pick (for the analysis)\n  while E' ≠ ∅:\n    pick any edge (u, v) ∈ E'\n    C ← C ∪ {u, v}\n    M ← M ∪ {(u, v)}\n    remove from E' every edge incident to u or to v\n  return C"
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "The picked edges form a matching",
              "statement": "The set M of edges selected by APPROX-VERTEX-COVER is a **matching**: no two edges of M share an endpoint. Consequently |C| = 2|M|.",
              "proof": "Consider any two distinct edges e₁, e₂ ∈ M, with e₁ added before e₂. When e₁ = (u, v) was picked, the algorithm immediately removed from E' every edge incident to u or v. Hence at the moment e₂ is picked it lies in the current E', so e₂ is incident to neither u nor v; thus e₁ and e₂ share no endpoint. As e₁, e₂ were arbitrary, M is a matching.\n\nEach iteration adds the two distinct endpoints of one matching edge to C, and by the matching property these endpoint-pairs are pairwise disjoint, so no vertex is added twice. Therefore |C| = 2|M|. ∎"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "2-approximation for minimum vertex cover",
              "statement": "APPROX-VERTEX-COVER returns a vertex cover C with |C| ≤ 2·OPT, in polynomial time. Hence it is a 2-approximation for minimum VERTEX-COVER.",
              "proof": "**Feasibility.** The loop terminates only when E' = ∅, i.e. when every edge has been removed. An edge is removed exactly when one of its endpoints is added to C, so on termination every edge of G has an endpoint in C; thus C is a valid vertex cover.\n\n**Lower bound on OPT.** Let M be the matching picked (Lemma above) and let C* be any minimum vertex cover, so |C*| = OPT. C* must cover every edge of M, so it contains at least one endpoint of each e ∈ M. Because the edges of M are pairwise vertex-disjoint, these chosen endpoints are *distinct* vertices — one fresh vertex of C* per matching edge. Hence |C*| ≥ |M|, i.e. OPT ≥ |M|. Set L = |M|; this is our bracketing lower bound.\n\n**Combine.** By the Lemma |C| = 2|M| = 2L, and 2L ≤ 2·OPT. Therefore |C| ≤ 2·OPT.\n\n**Running time.** Each iteration removes at least one edge and does O(deg) work to delete incident edges; over the whole run this is O(V + E). The algorithm is polynomial, so it is a 2-approximation. ∎"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "caption": "An instance where the matching M = {(a,b)} (gold) forces both a and b into C, while OPT = {b} alone. Output size 2 vs OPT 1 shows the factor-2 bound is essentially tight here.",
              "nodes": [
                {
                  "id": "a",
                  "label": "a",
                  "x": 20,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "b",
                  "label": "b",
                  "x": 50,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "c",
                  "label": "c",
                  "x": 80,
                  "y": 25
                },
                {
                  "id": "d",
                  "label": "d",
                  "x": 80,
                  "y": 75
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b",
                  "tone": "gold",
                  "bold": true,
                  "label": "picked"
                },
                {
                  "from": "b",
                  "to": "c"
                },
                {
                  "from": "b",
                  "to": "d"
                }
              ]
            },
            {
              "type": "example",
              "heading": "A star: why picking both endpoints matters",
              "body": "Take a star K_{1,k}: one center c joined to leaves v₁,…,v_k. Suppose the algorithm's first picked edge is (c, v₁). It adds **both** c and v₁ to C, then removes all edges incident to c — which is *all* of them. So the loop ends with |M| = 1 and |C| = 2 = {c, v₁}. Here OPT = 1 (just {c}), and indeed OPT ≥ |M| = 1 holds, with output 2 ≤ 2·OPT = 2. The 'wasted' vertex v₁ is exactly the slack the factor of 2 pays for."
            },
            {
              "type": "example",
              "heading": "Why the natural greedy by degree is NOT a 2-approximation",
              "body": "A tempting alternative — 'repeatedly add the highest-degree vertex' — does *not* enjoy a factor-2 guarantee. On carefully built bipartite instances its ratio grows like Θ(log n). The matching-based algorithm wins precisely because it hands us a clean computable lower bound (|M|) on OPT; greedy-by-degree has no comparably simple certificate, which is why its analysis fails. The lesson: an approximation algorithm is only as good as the lower bound you can prove about it."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Direction of the matching inequality is a classic trap.** It is OPT ≥ |M| (a *maximal* matching, found greedily, lower-bounds the cover), NOT OPT ≤ |M|. Reversing it 'proves' the wrong bound. Always re-derive it: each disjoint matching edge forces a distinct vertex into any cover."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Show the factor 2 in the analysis cannot be improved by this algorithm: exhibit a family of graphs on which APPROX-VERTEX-COVER outputs exactly 2·OPT.",
                  "solution": "Take the complete bipartite graph K_{n,n} with parts L = {ℓ₁,…,ℓ_n} and R = {r₁,…,r_n}. A minimum vertex cover is one whole side, so OPT = n (covering every edge requires all of one part; König's theorem confirms OPT = n). Now run the algorithm so it repeatedly picks a perfect matching's edges (ℓ_i, r_i): each pick is vertex-disjoint from the others, so |M| = n and the loop runs n times, adding both endpoints each time. Output |C| = 2n = 2·OPT. Thus the bound 2·OPT is attained, so this algorithm's worst-case ratio is exactly 2. ∎",
                  "hint": "Pick a graph whose minimum cover equals one side, and let the algorithm select a perfect matching."
                },
                {
                  "prompt": "Suppose you are handed a *maximal* matching M of G (one to which no edge can be added) by some oracle. Prove that the set of all endpoints of M is a vertex cover of size 2|M|, and that this is a 2-approximation.",
                  "solution": "Let C be the set of endpoints of M. **Cover:** suppose some edge (x, y) had neither endpoint in C. Then (x, y) shares no endpoint with any edge of M, so M ∪ {(x, y)} is still a matching — contradicting maximality of M. Hence every edge has an endpoint in C, so C is a vertex cover. **Size:** the edges of M are vertex-disjoint (it's a matching), so their 2|M| endpoints are distinct: |C| = 2|M|. **Ratio:** any cover must include ≥1 endpoint of each disjoint edge of M, so OPT ≥ |M|, giving |C| = 2|M| ≤ 2·OPT. ∎",
                  "hint": "Maximality is exactly what forces every edge to touch an endpoint of M."
                },
                {
                  "prompt": "Define the approximation ratio of an algorithm that on every instance returns a vertex cover of size min(2|M|, |V|). Is it still a 2-approximation? Could its ratio ever be strictly better than 2?",
                  "solution": "Returning the smaller of the matching-cover (2|M|) and the trivial all-vertices cover (|V|) never increases the output, so the output is still ≤ 2|M| ≤ 2·OPT; the 2-approximation guarantee is preserved. On some instances the |V| branch wins and gives a strictly better ratio — e.g. a triangle K₃ has OPT = 2, |M| = 1 so 2|M| = 2 = |V|−1, here both give 2 = OPT (ratio 1). More generally taking the min can only help, so the worst-case ratio is still 2 but the *instance-by-instance* ratio is sometimes below 2. ∎",
                  "hint": "Taking a min over two valid covers can only shrink the output; check it cannot break feasibility or the bound."
                },
                {
                  "prompt": "Weighted vertex cover assigns each vertex a weight and minimizes total weight of the cover. Does APPROX-VERTEX-COVER (picking both endpoints of matching edges) still guarantee factor 2? Explain.",
                  "solution": "No — not directly. The unweighted argument compares *counts*: |C| = 2|M| and OPT ≥ |M| give a count ratio of 2. With weights, a matching edge might force a very heavy endpoint into C while the optimum covers that edge with the light endpoint, so 'total weight of endpoints of M' need not be ≤ 2·OPT(weight). One bad edge with one heavy and one light endpoint already breaks it. A factor-2 weighted result requires a different technique (LP rounding or the local-ratio / primal-dual method), which uses the LP optimum as the computable lower bound L in place of |M|. ∎",
                  "hint": "The matching bound counts vertices, not weights — find where the count-to-weight translation fails."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a13l1-i1",
              "front": "Definition of a ρ-approximation (minimization)?",
              "back": "A polynomial-time algorithm whose output A(I) satisfies A(I) ≤ ρ·OPT(I) for every instance I, with ρ ≥ 1."
            },
            {
              "id": "a13l1-i2",
              "front": "Bracketing principle for proving a minimization ρ-approximation?",
              "back": "Find a computable L(I) with L(I) ≤ OPT(I) and A(I) ≤ ρ·L(I); chaining gives A(I) ≤ ρ·OPT(I)."
            },
            {
              "id": "a13l1-i3",
              "front": "Why do the picked edges form a matching in APPROX-VERTEX-COVER?",
              "back": "Picking (u,v) removes all edges incident to u or v, so later picks share no endpoint with it — pairwise vertex-disjoint."
            },
            {
              "id": "a13l1-i4",
              "front": "Lower bound that makes vertex cover a 2-approx, and why?",
              "back": "OPT ≥ |M|: any cover must include a distinct endpoint of each of the |M| vertex-disjoint matching edges."
            },
            {
              "id": "a13l1-i5",
              "front": "Output size of APPROX-VERTEX-COVER in terms of M?",
              "back": "|C| = 2|M| (two distinct endpoints per disjoint matching edge), so |C| = 2|M| ≤ 2·OPT."
            },
            {
              "id": "a13l1-i6",
              "front": "Is the factor 2 tight for this algorithm?",
              "back": "Yes — on K_{n,n} it can output 2n while OPT = n, attaining exactly 2·OPT."
            }
          ]
        },
        {
          "id": "a13l2",
          "title": "More Approximation: Set Cover, Metric TSP, and Schemes",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Beyond constant factors",
              "body": "Vertex cover gave a clean *constant* factor 2. Many problems are harder to approximate: the best efficient guarantee for SET-COVER is a *logarithmic* factor, and that is provably optimal unless P = NP. Other problems (metric TSP) admit constant factors via clever lower bounds, and a privileged few admit guarantees arbitrarily close to optimal — **approximation schemes**. This section develops one representative result of each type, each with a complete proof, so you see the full range of what 'provably near-optimal' can mean."
            },
            {
              "type": "code",
              "heading": "Greedy set cover",
              "lang": "text",
              "code": "GREEDY-SET-COVER(universe X, family F):\n  U ← X            // still-uncovered elements\n  C ← ∅            // chosen sets\n  while U ≠ ∅:\n    pick S ∈ F maximizing |S ∩ U|   // covers the most uncovered\n    C ← C ∪ {S}\n    U ← U \\ S\n  return C"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Harmonic number",
              "statement": "H_k = Σ_{i=1}^{k} 1/i = 1 + 1/2 + 1/3 + ⋯ + 1/k. It satisfies ln k ≤ H_k ≤ ln k + 1, so H_k = Θ(log k). (We reuse this same sum in the quicksort analysis.)"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Greedy set cover is an H_n-approximation",
              "statement": "Let n = |X| and let OPT be the size of a minimum set cover. GREEDY-SET-COVER returns a cover of size at most H_n·OPT ≤ (ln n + 1)·OPT.",
              "proof": "Charge cost to elements. When the algorithm picks a set S that covers s new elements (s = |S ∩ U| at that step), assign each of those s newly-covered elements a cost of 1/s; the total cost assigned equals 1 per chosen set, so Σ_{x∈X} cost(x) = |C|, the algorithm's output size.\n\nFix an optimal cover with sets O₁,…,O_{OPT}. It suffices to bound the total cost charged to elements of a single O_i by H_{|O_i|} ≤ H_n, because every element lies in some O_i and so\n  |C| = Σ_x cost(x) ≤ Σ_{i=1}^{OPT} Σ_{x∈O_i} cost(x) ≤ OPT · H_n.\n(The first ≤ may overcount elements in several O_i, which only helps.)\n\nNow bound Σ_{x∈O_i} cost(x). Order the elements of O_i as x_1, x_2, …, x_m (m = |O_i|) by the time the greedy algorithm covered them, latest first — so x_1 is covered last. Consider the moment just before x_t is covered. At that point at least t elements of O_i are still uncovered (namely x_1,…,x_t), so the still-uncovered part of O_i has ≥ t elements. Since the *whole* set O_i is available to the greedy rule and would cover those ≥ t uncovered elements, the set S the greedy algorithm actually picks covers at least t new elements: |S ∩ U| ≥ t. Hence x_t is charged cost ≤ 1/t. Summing,\n  Σ_{x∈O_i} cost(x) ≤ Σ_{t=1}^{m} 1/t = H_m ≤ H_n.\nCombining with the displayed inequality gives |C| ≤ OPT·H_n ≤ (ln n + 1)·OPT. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Same engine as the bracketing principle.** OPT is again the lower bound we route everything through; the cost-charging is just an accounting trick that turns 'how many sets greedy used' into 'a sum of 1/t terms', and the harmonic sum H_n is where the log factor is born — exactly the sum that reappears in randomized quicksort."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Metric (triangle-inequality) TSP",
              "statement": "Given a complete graph on cities with edge weights w(u,v) ≥ 0 that are **symmetric** (w(u,v) = w(v,u)) and obey the **triangle inequality** w(u,w) ≤ w(u,v) + w(v,w), find a minimum-weight Hamiltonian cycle (tour visiting every city once). General TSP has no constant-factor approximation unless P = NP; the metric restriction is what makes a constant factor possible."
            },
            {
              "type": "code",
              "heading": "MST-doubling tour",
              "lang": "text",
              "code": "APPROX-METRIC-TSP(G, w):\n  T ← minimum spanning tree of G        // e.g. Prim\n  W ← full walk that traverses each edge of T twice\n        (an Euler tour of the doubled tree)\n  H ← W with repeated cities skipped     // 'shortcutting'\n  return H                               // a Hamiltonian cycle"
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "MST-doubling is a 2-approximation for metric TSP",
              "statement": "APPROX-METRIC-TSP returns a Hamiltonian cycle H with w(H) ≤ 2·OPT in polynomial time.",
              "proof": "**Lower bound L = w(T) ≤ OPT.** Let H* be an optimal tour with weight OPT. Deleting any one edge of the cycle H* yields a spanning tree (a Hamiltonian path is a spanning tree), whose weight is ≤ w(H*) since weights are non-negative. A minimum spanning tree T is no heavier than this particular spanning tree, so w(T) ≤ w(H*) = OPT.\n\n**The doubled walk.** Duplicate every edge of T to form a multigraph in which every vertex has even degree; it is connected, so it has an Euler tour W traversing each duplicated edge once. W visits every vertex (T spans G) and has weight w(W) = 2·w(T).\n\n**Shortcutting preserves the bound.** Walk W in order and skip any city already visited, going directly to the next new city. Each skip replaces a sub-walk u → v → … → x by the single edge (u, x). By the triangle inequality (applied repeatedly), the direct edge is no longer than the sub-walk it replaces, so shortcutting does not increase total weight: w(H) ≤ w(W). The result H is a Hamiltonian cycle (each city once, then back to start).\n\n**Combine.** w(H) ≤ w(W) = 2·w(T) ≤ 2·OPT. MST and the linear-time shortcut pass are polynomial, so this is a 2-approximation. ∎"
            },
            {
              "type": "decision",
              "heading": "Three regimes of approximability",
              "rows": [
                [
                  "Constant factor (e.g. vertex cover 2, metric TSP 2)",
                  "A simple combinatorial lower bound (matching, MST) brackets OPT"
                ],
                [
                  "Logarithmic factor (set cover H_n) — and no better is possible unless P=NP",
                  "Greedy + charging argument; lower bound is OPT itself via cost accounting"
                ],
                [
                  "Scheme: ratio (1+ε) for any ε>0 (PTAS / FPTAS)",
                  "Problem structure lets you trade running time for accuracy continuously"
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "PTAS and FPTAS",
              "statement": "A **polynomial-time approximation scheme (PTAS)** is a family {A_ε} where, for each fixed ε > 0, A_ε is a (1+ε)-approximation running in time polynomial in the input size n (the dependence on ε may be arbitrary, e.g. n^{1/ε}). It is a **fully polynomial-time approximation scheme (FPTAS)** if the running time is also polynomial in 1/ε. FPTASs are the gold standard — e.g. for the (weakly NP-hard) KNAPSACK problem."
            },
            {
              "type": "example",
              "heading": "Greedy set cover on a worst-case instance",
              "body": "Universe X = {1,…,2^k − 1}-ish constructions show the log factor is real, but a small concrete run shows the mechanism. Let X = {1,2,3,4,5,6}; F = { A={1,2,3,4}, B={1,2,5}, C={3,4,6} }. OPT = {B, C} (size 2, covering all 6). Greedy first picks A (covers 4, the most), leaving {5,6}; then it must pick B (covers 5) and C (covers 6), output size 3. So greedy = 3 vs OPT = 2, ratio 1.5 — under the bound H_6 ≈ 2.45. The greedy 'cover the most now' choice of A is exactly what derails it from the optimal pair."
            },
            {
              "type": "example",
              "heading": "Metric TSP shortcutting in action",
              "body": "Four cities on a line at coordinates 0,1,2,3 with distance = |difference| (a metric). MST T = edges {0–1, 1–2, 2–3}, w(T) = 3. Doubled walk: 0→1→2→3→2→1→0, weight 6 = 2·w(T). Shortcut (no repeats until the close): 0→1→2→3→0; the closing edge 3→0 has weight 3 = w(3,2)+w(2,1)+w(1,0) (triangle equality on a line), giving w(H) = 1+1+1+3 = 6. The relevant guarantee here is w(H) ≤ 2·OPT. Now OPT = 6 as well (the cycle 0→1→2→3→0 is the cheapest Hamiltonian tour on these four collinear points), so the algorithm is **exactly optimal** on this instance: the achieved ratio is w(H)/OPT = 6/6 = 1, the *farthest* possible from making the factor-2 bound tight. The factor-2 slack (here 2·OPT = 12, fully twice the output) is entirely unused. A genuinely *tight* example — one driving the ratio toward 2 — needs a different metric where shortcutting is forced into long detours rather than retracing a straight line; see the next example."
            },
            {
              "type": "example",
              "heading": "Pushing the ratio toward 2: a near-tight metric",
              "body": "To see the factor-2 slack actually get used, place the cities so that shortcutting must take a long jump instead of retracing a cheap path. Take 2m points evenly spaced on a circle (shortest-path / Euclidean-on-the-circle metric). A minimum spanning tree is a path along all but one arc, of weight ≈ (perimeter)·(2m−1)/(2m), and the doubled-walk-with-shortcut tour can be forced to repeatedly cross the circle by chords rather than walking neighbor-to-neighbor; the resulting tour weight approaches 2·w(T) and the ratio w(H)/OPT → 2 as m grows. The mechanism is exactly the proof's only inequality with slack — w(H) ≤ w(W) = 2·w(T) — being made nearly an equality: every shortcut chord is about as long as the sub-walk it replaces, so almost none of the doubling is recovered. Such families show the analysis of MST-doubling cannot be improved below 2 (the smarter Christofides algorithm is what breaks past 2, to 3/2)."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Approximability is a property of the problem, not effort.** SET-COVER cannot be approximated better than (1−o(1))·ln n unless P = NP, and general (non-metric) TSP admits no constant factor at all unless P = NP. Knowing these limits tells you when to stop chasing a better ratio and accept the logarithmic or metric-restricted result."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "In the greedy set-cover charging proof, where exactly is the inequality |S ∩ U| ≥ t used, and why is it valid?",
                  "solution": "It is used to bound the cost charged to the t-th element x_t of an optimal set O_i (ordered latest-covered first) by 1/t. Validity: just before x_t is covered, the elements x_1,…,x_t of O_i are all still uncovered, so O_i itself contains ≥ t uncovered elements. The greedy rule picks the set S maximizing |S ∩ U|, and since O_i is a candidate covering ≥ t of U, the chosen S covers |S ∩ U| ≥ t new elements. Thus each of those new elements (including x_t) is charged ≤ 1/t. Summing over t gives H_m ≤ H_n. ∎",
                  "hint": "O_i is always an available set; the greedy choice covers at least as much as O_i would."
                },
                {
                  "prompt": "Show the triangle inequality is essential: give a (non-metric) weighting where MST-doubling-with-shortcut produces a tour costing much more than 2·OPT.",
                  "solution": "Without the triangle inequality, the shortcut edge (u, x) replacing a path can be enormous. Take 3 cities with w(1,2)=1, w(2,3)=1, but w(1,3)=M for huge M. MST T = {1–2, 2–3}, w(T)=2. The doubled-walk shortcut closes the tour with the direct edge (3,1) of weight M, giving a tour 1→2→3→1 of weight 1+1+M = M+2. The optimal tour is the same (only one Hamiltonian cycle on 3 nodes), but the *bound* w(H) ≤ 2·w(T) = 4 is violated because shortcutting no longer preserves weight: M+2 is not ≤ w(walk)=2·w(T)=4. The proof step 'direct edge ≤ replaced sub-walk' fails exactly when the triangle inequality fails. ∎",
                  "hint": "Make a shortcut edge arbitrarily heavier than the path it replaces."
                },
                {
                  "prompt": "An FPTAS for KNAPSACK runs in time O(n³/ε). Is this polynomial in the input size? Is it a PTAS? Is it an FPTAS? Justify each.",
                  "solution": "For each fixed ε > 0 the running time O(n³/ε) is polynomial in n, and the guarantee is (1+ε)-approximation, so the family is a **PTAS**. Moreover the running time is also polynomial in 1/ε (linear in 1/ε here), so it qualifies as an **FPTAS** — the stronger property. Every FPTAS is a PTAS but not conversely; an algorithm running in n^{1/ε} would be a PTAS but not an FPTAS, since n^{1/ε} is not polynomial in 1/ε. ∎",
                  "hint": "PTAS: poly in n for fixed ε. FPTAS: also poly in 1/ε."
                },
                {
                  "prompt": "For greedy set cover prove the clean weaker bound: if every element lies in the optimal cover and OPT = k, then after greedy has reduced the uncovered set to fewer than n/e elements, it has used at most k sets. Sketch why this yields the O(log n) bound.",
                  "solution": "At any moment let r be the number of still-uncovered elements. The OPT cover of size k covers all r of them, so by averaging some optimal set covers ≥ r/k of them; that set is a candidate for greedy, so the set greedy picks covers ≥ r/k uncovered elements, leaving ≤ r(1 − 1/k) = r·(1−1/k). After k greedy steps the uncovered count is ≤ n·(1−1/k)^k ≤ n·e^{−1} = n/e (using 1−x ≤ e^{−x}). So every k greedy steps shrink the uncovered set by a factor ≥ e. Starting from n, after k·ln n steps it is < 1, i.e. zero, so greedy uses ≤ k·ln n = OPT·ln n sets, an O(log n)-approximation. ∎",
                  "hint": "Averaging gives a set covering ≥ r/k each step; iterate the (1−1/k) shrink."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a13l2-i1",
              "front": "Approximation ratio of greedy set cover?",
              "back": "H_n ≤ ln n + 1, i.e. Θ(log n)·OPT — and no polynomial algorithm beats (1−o(1))·ln n unless P = NP."
            },
            {
              "id": "a13l2-i2",
              "front": "Charging argument for greedy set cover — what is each element charged?",
              "back": "When a picked set covers s new elements, each gets cost 1/s; total cost = number of sets used = |C|."
            },
            {
              "id": "a13l2-i3",
              "front": "Lower bound used in metric-TSP MST-doubling?",
              "back": "w(MST) ≤ OPT, because deleting an edge from the optimal tour yields a spanning tree of weight ≤ OPT."
            },
            {
              "id": "a13l2-i4",
              "front": "Why does shortcutting not increase the tour weight?",
              "back": "The triangle inequality: replacing a sub-walk by the direct edge can only be ≤ the sub-walk's weight."
            },
            {
              "id": "a13l2-i5",
              "front": "PTAS vs FPTAS?",
              "back": "PTAS: (1+ε)-approx in time poly in n for each fixed ε. FPTAS: additionally poly in 1/ε."
            },
            {
              "id": "a13l2-i6",
              "front": "Why is the triangle inequality essential for the TSP 2-approx?",
              "back": "Without it a shortcut edge can be arbitrarily heavier than the path it replaces, breaking w(H) ≤ w(walk)."
            }
          ]
        },
        {
          "id": "a13l3",
          "title": "Randomized Algorithms: Las Vegas and Monte Carlo",
          "estMinutes": 27,
          "content": [
            {
              "type": "text",
              "heading": "Putting randomness inside the algorithm",
              "body": "A **randomized algorithm** makes choices based on the outcomes of internal coin flips. The crucial point: the randomness lives in the *algorithm*, not in any assumption about the input. We do not assume inputs are random; we make the *algorithm* random so that **no fixed input is reliably bad**. This defeats adversaries who choose the worst input, and it often yields algorithms that are simpler and faster than the best known deterministic ones (primality testing, min-cut, hashing, quicksort)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Las Vegas algorithm",
              "statement": "A **Las Vegas** algorithm is *always correct*: on every input and for every outcome of its coins, the answer it returns is correct. Its **running time is a random variable**; we analyze its *expected* running time. Randomized quicksort is the canonical example — it always sorts, in O(n log n) expected time."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Monte Carlo algorithm",
              "statement": "A **Monte Carlo** algorithm has a *deterministic* (worst-case) running-time bound but may be *wrong*: it returns the correct answer only with some probability ≥ p. For a **decision** problem it is **one-sided** if it errs only on one answer (e.g. never says 'composite' for a prime) and **two-sided** otherwise. Miller–Rabin primality and Karger's min-cut are Monte Carlo."
            },
            {
              "type": "decision",
              "heading": "Las Vegas vs Monte Carlo",
              "rows": [
                [
                  "Correctness",
                  "Las Vegas: always correct | Monte Carlo: correct w.p. ≥ p"
                ],
                [
                  "Running time",
                  "Las Vegas: random (analyze expectation) | Monte Carlo: deterministic bound"
                ],
                [
                  "What you trade",
                  "Certainty in time ↔ certainty in answer"
                ],
                [
                  "Fixing the weak side",
                  "Las Vegas: tail bounds on time | Monte Carlo: repeat to amplify correctness"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**One sentence to remember:** Las Vegas *fixes the answer and gambles on the time*; Monte Carlo *fixes the time and gambles on the answer*. Both gambles are controllable — the first by tail bounds, the second by repetition."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Error amplification for one-sided Monte Carlo",
              "statement": "Suppose a one-sided Monte Carlo algorithm for a decision problem runs in time T and, whenever the true answer is YES, outputs YES with probability ≥ p > 0 (and never outputs YES on a NO instance). Running it k independent times and answering YES iff any run says YES gives a one-sided algorithm with the same NO-correctness, time O(kT), and YES-error probability ≤ (1 − p)^k. Choosing k = ⌈ln(1/δ)/p⌉ drives the error below δ.",
              "proof": "**No false positives are preserved.** On a NO instance every run outputs NO (the base algorithm never says YES on NO), so the combined 'YES iff some run says YES' also says NO. Thus the amplified algorithm is still one-sided with no false YES.\n\n**False-negative probability.** On a YES instance, a single run *fails* (outputs NO) with probability ≤ 1 − p. The k runs use independent coins, so all k fail with probability ≤ (1 − p)^k. The combined algorithm answers NO (an error) exactly when all k runs fail, so its error probability ≤ (1 − p)^k.\n\n**Bound the error below δ.** Using 1 − p ≤ e^{−p}, we get (1 − p)^k ≤ e^{−pk}. Setting k = ⌈ln(1/δ)/p⌉ gives e^{−pk} ≤ e^{−ln(1/δ)} = δ. Running time is k times the base time, i.e. O(kT). ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Independence is doing the work.** The product (1−p)^k is valid *only because the runs use independent coins*. Amplification fails if you reuse randomness across runs. Note k grows like ln(1/δ): exponentially good error for linearly more work."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Markov tail bound for Las Vegas time",
              "statement": "If a Las Vegas algorithm has expected running time E[T] = μ, then for any c > 1, Pr[T ≥ c·μ] ≤ 1/c. Consequently, stopping and restarting whenever the run exceeds 2μ gives an algorithm with the same correctness and O(μ) expected time.",
              "proof": "T ≥ 0, so **Markov's inequality** applies: for any a > 0, Pr[T ≥ a] ≤ E[T]/a. Take a = c·μ: Pr[T ≥ c·μ] ≤ μ/(c·μ) = 1/c.\n\nFor the restart claim, set c = 2: each attempt finishes within 2μ with probability ≥ 1/2. The number N of attempts until one finishes within the 2μ budget is geometric with success probability ≥ 1/2, so E[N] ≤ 2, and each attempt costs ≤ 2μ; total expected time ≤ E[N]·2μ ≤ 4μ = O(μ). Correctness is unaffected because a Las Vegas algorithm only ever outputs correct answers. ∎"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Las Vegas ⇒ Monte Carlo conversion",
              "statement": "Any Las Vegas algorithm with expected time μ can be turned into a Monte Carlo algorithm with deterministic time O(μ/ε) that is correct with probability ≥ 1 − ε, for any ε ∈ (0,1).",
              "proof": "Run the Las Vegas algorithm but cut it off after a time budget B = μ/ε. If it has finished, output its (always-correct) answer; if it is cut off, output an arbitrary default answer. The deterministic running time is B = O(μ/ε). By Markov, Pr[T ≥ B] = Pr[T ≥ (1/ε)μ] ≤ ε, so the probability we are forced to the default (possibly wrong) answer is ≤ ε; otherwise the answer is correct. Hence correctness probability ≥ 1 − ε. ∎"
            },
            {
              "type": "example",
              "heading": "Counting amplification runs",
              "body": "Suppose a Monte Carlo YES/NO test succeeds with probability p = 1/2 per run. To make the error probability ≤ δ = 2^{−20} (about one in a million), the bound (1−p)^k = (1/2)^k ≤ 2^{−20} needs k ≥ 20 runs. Twenty independent runs — linear extra work — buy a millionfold reduction in error. This exponential payoff is why Monte Carlo algorithms are practical despite per-run uncertainty."
            },
            {
              "type": "example",
              "heading": "Why an adversary cannot pin a randomized algorithm",
              "body": "Deterministic quicksort with a fixed pivot rule (say 'first element') has a specific input — already-sorted — that forces Θ(n²) time; an adversary who knows your code feeds you exactly that. Randomized quicksort picks the pivot uniformly at random, so for *any* fixed input the *expected* time is O(n log n): the adversary chooses the input first, but the coins are flipped after, and no single input is reliably bad. The bad cases still exist for particular coin outcomes, but they have vanishing probability."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Do not confuse 'random input' with 'randomized algorithm'.** Average-case analysis assumes the *input* is drawn from a distribution — a claim about your users. Randomized-algorithm analysis assumes the *coins* are random — a claim you control. The expected bound holds on the worst input, not just typical ones."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A Monte Carlo algorithm answers a decision problem correctly with probability 2/3 on every input and may err on either answer (two-sided). Describe how to amplify its correctness to ≥ 1 − δ, and bound the number of runs needed.",
                  "solution": "Run it k times independently and take the **majority** vote (one-sided 'OR' no longer works because either answer can be wrong). Each run is correct independently with probability 2/3 > 1/2, so the expected number of correct runs is (2/3)k > k/2. By a Chernoff bound, the probability the majority is wrong (fewer than k/2 correct) is ≤ e^{−k·D} for a constant D > 0 depending on the gap 2/3 − 1/2 = 1/6; concretely Pr[wrong majority] ≤ e^{−k/18} (a standard Chernoff estimate for this gap). Setting k = ⌈18 ln(1/δ)⌉ gives error ≤ δ. So O(log(1/δ)) runs suffice, using majority rather than OR because the error is two-sided. ∎",
                  "hint": "Two-sided error rules out OR/AND combining; vote, then bound deviation with Chernoff."
                },
                {
                  "prompt": "Prove that a Las Vegas algorithm whose running time has expectation μ finishes within 100μ with probability at least 0.99.",
                  "solution": "The running time T satisfies T ≥ 0 and E[T] = μ, so Markov's inequality gives Pr[T ≥ 100μ] ≤ E[T]/(100μ) = μ/(100μ) = 1/100 = 0.01. Therefore Pr[T < 100μ] = 1 − Pr[T ≥ 100μ] ≥ 1 − 0.01 = 0.99. ∎",
                  "hint": "Apply Markov with a = 100μ and take the complement."
                },
                {
                  "prompt": "Classify each as Las Vegas or Monte Carlo and say what is being randomized: (a) randomized quicksort; (b) Miller–Rabin primality with one round; (c) the cut-off-after-budget version of quicksort from this lesson.",
                  "solution": "(a) **Las Vegas**: always sorts correctly; the *running time* is the random variable (random pivot choices). (b) **Monte Carlo**, one-sided: deterministic time per round, always correct on primes (declares 'prime' truthfully if it never finds a witness) but may wrongly call a composite 'probably prime' with bounded probability; the random *witness choice* is randomized. (c) **Monte Carlo**: by imposing a deterministic time budget B = μ/ε we fixed the running time and accepted a ≤ ε chance of returning the default (possibly wrong) answer — the conversion of this lesson turns the Las Vegas time-randomness into answer-randomness. ∎",
                  "hint": "Ask which is guaranteed (answer or time) and which is the random variable."
                },
                {
                  "prompt": "You have a Monte Carlo algorithm with one-sided error and success probability p = 1/n per run (n = input size), running in time T. How many independent repetitions make the failure probability ≤ 1/n, and what is the total time?",
                  "solution": "Failure after k repetitions is ≤ (1 − p)^k = (1 − 1/n)^k ≤ e^{−k/n}. We want e^{−k/n} ≤ 1/n, i.e. k/n ≥ ln n, i.e. k ≥ n ln n. So k = ⌈n ln n⌉ repetitions suffice, for total time O(k·T) = O(n T log n). The lesson: when per-run success is tiny (1/n), amplification costs a factor ~ n log n — still polynomial, but the small p is expensive, illustrating why algorithms aim for constant per-run success. ∎",
                  "hint": "Solve e^{−k/n} ≤ 1/n for k using (1−1/n) ≤ e^{−1/n}."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a13l3-i1",
              "front": "Las Vegas algorithm — correctness and time?",
              "back": "Always correct; running time is a random variable analyzed in expectation (e.g. randomized quicksort)."
            },
            {
              "id": "a13l3-i2",
              "front": "Monte Carlo algorithm — correctness and time?",
              "back": "Deterministic time bound; correct only with probability ≥ p, error reducible by independent repetition."
            },
            {
              "id": "a13l3-i3",
              "front": "One-sided Monte Carlo error after k independent runs (OR rule)?",
              "back": "≤ (1−p)^k ≤ e^{−pk}; k = ⌈ln(1/δ)/p⌉ drives error below δ. Independence is essential."
            },
            {
              "id": "a13l3-i4",
              "front": "Markov tail bound for Las Vegas time with mean μ?",
              "back": "Pr[T ≥ cμ] ≤ 1/c since T ≥ 0; lets you restart over-long runs and keep O(μ) expected time."
            },
            {
              "id": "a13l3-i5",
              "front": "Where does the randomness live in a randomized algorithm?",
              "back": "In the algorithm's own coin flips — not in any assumption that the input is random (no average-case input model)."
            },
            {
              "id": "a13l3-i6",
              "front": "Las Vegas → Monte Carlo conversion?",
              "back": "Cut off after budget μ/ε; by Markov it is incorrect (forced to default) with probability ≤ ε in time O(μ/ε)."
            }
          ]
        },
        {
          "id": "a13l4",
          "title": "Indicator Variables & Randomized Quicksort",
          "estMinutes": 30,
          "content": [
            {
              "type": "text",
              "heading": "Counting with expectations",
              "body": "Many randomized analyses ask for the *expected count* of something — comparisons, collisions, fixed points. The **indicator random variable** method reduces such a count to a sum of probabilities, even when the underlying events are highly dependent. It is the single most-used technique in randomized algorithm analysis, and it is what finally lets us *prove* the O(n log n) bound for quicksort that earlier units merely asserted."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Indicator random variable",
              "statement": "For an event A, the **indicator** of A is the 0/1 random variable\n  I{A} = 1 if A occurs, 0 otherwise.\nIts defining property is E[I{A}] = Pr[A], since E[I{A}] = 1·Pr[A] + 0·Pr[Ā] = Pr[A]."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Linearity of expectation",
              "statement": "For any random variables X₁,…,X_m on the same probability space (whether or not independent) and constants a₁,…,a_m,\n  E[ Σ_{t=1}^{m} a_t X_t ] = Σ_{t=1}^{m} a_t E[X_t].",
              "proof": "It suffices to prove E[X + Y] = E[X] + E[Y] and E[aX] = aE[X]; the general statement follows by induction on m. For discrete random variables on a finite (or countable) sample space Ω with outcomes ω of probability p(ω),\n  E[X + Y] = Σ_ω (X(ω) + Y(ω)) p(ω) = Σ_ω X(ω)p(ω) + Σ_ω Y(ω)p(ω) = E[X] + E[Y],\nwhere we just split the sum (valid termwise). Similarly E[aX] = Σ_ω aX(ω)p(ω) = a Σ_ω X(ω)p(ω) = aE[X]. Crucially, *no independence was used* — the sum splits regardless of how X and Y depend on each other. By induction, the m-term weighted version holds. ∎"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**This is the superpower.** Linearity holds for *dependent* events, so the recipe is always: (1) write the quantity as a sum of indicators X = Σ I{A_t}; (2) compute each Pr[A_t]; (3) sum. The dependence between the A_t never enters step 3. We will not need independence anywhere in the quicksort proof — and the events there are very dependent."
            },
            {
              "type": "code",
              "heading": "Randomized quicksort",
              "lang": "text",
              "code": "RANDOMIZED-QUICKSORT(A, p, r):\n  if p < r:\n    i ← random integer in [p, r]      // uniform pivot\n    swap A[i] ↔ A[r]\n    q ← PARTITION(A, p, r)             // pivot = A[r], one pass\n    RANDOMIZED-QUICKSORT(A, p, q−1)\n    RANDOMIZED-QUICKSORT(A, q+1, r)\n// PARTITION compares the pivot to each other element exactly once."
            },
            {
              "type": "theorem",
              "kind": "lemma",
              "name": "Comparison probability",
              "statement": "Let z₁ < z₂ < ⋯ < z_n be the input elements in sorted order, and let Z_ij = {z_i, z_{i+1}, …, z_j} for i < j. In RANDOMIZED-QUICKSORT, elements z_i and z_j are compared **at most once**, and\n  Pr[z_i and z_j are compared] = 2/(j − i + 1).",
              "proof": "**At most once.** A comparison in PARTITION always involves the current pivot, and the pivot is excluded from both recursive subarrays — it is never compared again. So any pair is compared at most one time.\n\n**Which pivot decides it.** Consider the set Z_ij, which has j − i + 1 elements. Track the first moment some element of Z_ij is chosen as a pivot (this must eventually happen, as every element becomes a pivot in its subarray). Until that moment, all of Z_ij lies together in one subarray, because any pivot chosen from *outside* Z_ij is either less than z_i or greater than z_j and therefore sends all of Z_ij to the same side of the partition.\n\n• If the first pivot drawn from Z_ij is z_i or z_j, then that pivot is compared to every other element of the current subarray, in particular to its partner — so z_i and z_j *are* compared.\n• If the first such pivot is some z_k with i < k < j, then z_i goes to the low side and z_j to the high side (z_i < z_k < z_j); they are separated into different subarrays and are *never* compared.\n\nSo z_i and z_j are compared **iff** the first pivot chosen from Z_ij is z_i or z_j.\n\n**Probability.** By symmetry, the first element of Z_ij to be chosen as a pivot is equally likely to be any of its j − i + 1 members (each pivot choice along the way is uniform over the current subarray, so conditioned on the first pick landing in Z_ij it is uniform over Z_ij). Two of those j − i + 1 elements — z_i and z_j — are favorable. Hence Pr = 2/(j − i + 1). ∎"
            },
            {
              "type": "example",
              "heading": "The n = 4 endpoints (matches the gate's numeric)",
              "body": "Take n = 4 distinct elements z₁ < z₂ < z₃ < z₄ and ask for the smallest and largest, i.e. i = 1, j = 4. Then Z_{1,4} has j − i + 1 = 4 elements, and z₁, z₄ are compared iff the *first* pivot chosen from {z₁,z₂,z₃,z₄} is z₁ or z₄. That is 2 favorable of 4 equally likely, so Pr = 2/4 = **0.5**. If instead the first such pivot is z₂ or z₃, the extremes split apart and never meet. This is the exact value the mastery gate asks for."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected comparisons of randomized quicksort",
              "statement": "The expected number of comparisons made by RANDOMIZED-QUICKSORT on n distinct elements is\n  E[X] = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} 2/(j − i + 1) < 2n·H_n = O(n log n)  (in fact ≈ 2n ln n).",
              "proof": "Let X_ij = I{z_i and z_j are compared} and let X = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} X_ij be the total number of comparisons (each pair compared at most once, by the Lemma, so summing the pair-indicators counts comparisons exactly).\n\nBy **linearity of expectation** — valid despite the heavy dependence among the X_ij —\n  E[X] = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} E[X_ij] = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} Pr[z_i,z_j compared] = Σ_{i=1}^{n−1} Σ_{j=i+1}^{n} 2/(j − i + 1),\nusing E[X_ij] = Pr[X_ij = 1] for an indicator and the Comparison-Probability Lemma.\n\n**Bounding the double sum.** Fix i and substitute k = j − i + 1; as j ranges over i+1,…,n, k ranges over 2,…,n−i+1. So the inner sum is Σ_{k=2}^{n−i+1} 2/k ≤ Σ_{k=2}^{n} 2/k < 2 Σ_{k=1}^{n} 1/k = 2H_n. Therefore\n  E[X] < Σ_{i=1}^{n−1} 2H_n < 2n·H_n.\nSince H_n ≤ ln n + 1 = O(log n), we get E[X] = O(n log n). (More precisely H_n = ln n + Θ(1), so E[X] ≈ 2n ln n.) ∎"
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "Why the bound is Θ(n log n): with high probability a random pivot splits the subarray into parts no more lopsided than 1:3, so the depth of work is Θ(log n) levels, each doing Θ(n) comparison-work — matching the harmonic-sum result above.",
              "levels": [
                {
                  "n": "n",
                  "each": "≤ n comparisons",
                  "row": "Θ(n)"
                },
                {
                  "n": "≤ 3n/4",
                  "each": "split work",
                  "row": "Θ(n)"
                },
                {
                  "ellipsis": true,
                  "row": "Θ(n)"
                },
                {
                  "n": "1",
                  "each": "base case",
                  "row": "Θ(n)"
                }
              ],
              "total": "Θ(log n) levels × Θ(n) = Θ(n log n)"
            },
            {
              "type": "example",
              "heading": "Computing E[X] exactly for n = 3",
              "body": "With z₁ < z₂ < z₃ the pairs are (1,2), (2,3), (1,3). Probabilities: Pr[1,2 compared] = 2/(2−1+1) = 2/2 = 1; Pr[2,3] = 2/2 = 1; Pr[1,3] = 2/(3−1+1) = 2/3. So E[X] = 1 + 1 + 2/3 = 8/3 ≈ 2.67. Sanity check: adjacent elements (consecutive in sorted order) are *always* compared — there's no element strictly between them to separate them — which is why their probability is exactly 1. Only non-adjacent pairs can dodge a comparison."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Adjacent pairs are always compared.** For j = i+1, the probability is 2/(j−i+1) = 2/2 = 1: there is no element between z_i and z_{i+1} to split them, so one must become the other's pivot eventually. The savings in quicksort come entirely from *far-apart* pairs, whose 2/(j−i+1) is small — the source of the harmonic decay."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**The denominator is j − i + 1, the size of Z_ij, not j − i.** Off-by-one here changes adjacent-pair probability from 1 to 2 (impossible). Re-derive it as '2 favorable / (number of elements in the closed range from z_i to z_j)'."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Compute the exact expected number of comparisons E[X] for randomized quicksort on n = 4 distinct elements.",
                  "solution": "Sum 2/(j−i+1) over all pairs 1 ≤ i < j ≤ 4. By the gap d = j − i: d=1 (pairs (1,2),(2,3),(3,4)): each 2/2 = 1, three of them → 3. d=2 (pairs (1,3),(2,4)): each 2/3, two of them → 4/3. d=3 (pair (1,4)): 2/4 = 1/2, one → 1/2. Total E[X] = 3 + 4/3 + 1/2 = 18/6 + 8/6 + 3/6 = 29/6 ≈ 4.83. Note the (1,4) term is exactly the 0.5 from the worked example. ∎",
                  "hint": "Group pairs by their gap d = j − i; each contributes 2/(d+1), and there are n − d pairs with gap d."
                },
                {
                  "prompt": "Using indicator variables, find the expected number of fixed points of a uniformly random permutation π of {1,…,n} (a fixed point is an index i with π(i) = i).",
                  "solution": "Let X_i = I{π(i) = i} and X = Σ_{i=1}^n X_i be the number of fixed points. For a uniform random permutation, Pr[π(i) = i] = 1/n (element i is equally likely to map anywhere). So E[X_i] = 1/n, and by linearity E[X] = Σ_{i=1}^n 1/n = n·(1/n) = 1. Strikingly, the expected number of fixed points is exactly 1, independent of n — and no independence between the X_i was needed (they are in fact dependent). ∎",
                  "hint": "One indicator per index; each is 1 with probability 1/n; sum by linearity."
                },
                {
                  "prompt": "In the comparison lemma, explain precisely why a pivot chosen from outside Z_ij does not separate z_i from z_j, and why this matters for the proof.",
                  "solution": "A pivot z_k outside Z_ij has either k < i or k > j, so z_k < z_i ≤ z_j or z_i ≤ z_j < z_k. In partitioning, elements are split into those below the pivot and those above. If z_k < z_i, then both z_i and z_j exceed z_k and go to the *high* side together; if z_k > z_j, both go to the *low* side together. Either way z_i and z_j stay in the *same* subarray, untouched as a pair. This matters because it justifies focusing only on the *first pivot drawn from Z_ij*: outside pivots never compare or separate the pair, so the pair's fate is decided exactly when the first inside-pivot is drawn — giving the clean 2/(j−i+1). ∎",
                  "hint": "An outside pivot is below z_i or above z_j; show both endpoints land on the same side."
                },
                {
                  "prompt": "Show that E[X] = Σ_{i<j} 2/(j−i+1) is also bounded below by a constant times n log n, so the expected comparison count is Θ(n log n), not merely O(n log n).",
                  "solution": "Bound the double sum below. Restrict to pairs with gap d = j − i in the range [n/2, n−1]: for such d there are n − d ≥ 1 pairs, and 2/(d+1) ≥ 2/n. More cleanly, fix i ≤ n/2 and let j range over i+1,…,n; the inner sum is Σ_{k=2}^{n−i+1} 2/k ≥ Σ_{k=2}^{n/2} 2/k ≥ 2(H_{n/2} − 1) ≥ 2(ln(n/2) − 1). Summing over the n/2 values i = 1,…,n/2 gives E[X] ≥ (n/2)·2(ln(n/2) − 1) = n(ln(n/2) − 1) = Ω(n log n). Together with the O(n log n) upper bound, E[X] = Θ(n log n). ∎",
                  "hint": "Keep only the i ≤ n/2 outer terms and lower-bound each inner harmonic sum by 2(ln(n/2) − 1)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "a13l4-i1",
              "front": "Indicator random variable and its expectation?",
              "back": "I{A} = 1 if event A occurs else 0; E[I{A}] = Pr[A]."
            },
            {
              "id": "a13l4-i2",
              "front": "Linearity of expectation — and the key caveat?",
              "back": "E[Σ a_t X_t] = Σ a_t E[X_t] for ANY random variables — no independence required; it holds for dependent events."
            },
            {
              "id": "a13l4-i3",
              "front": "Probability z_i and z_j (i<j) are compared in randomized quicksort?",
              "back": "2/(j−i+1): compared iff the first pivot drawn from Z_ij = {z_i,…,z_j} is z_i or z_j."
            },
            {
              "id": "a13l4-i4",
              "front": "For n=4, probability the smallest and largest are compared?",
              "back": "2/(j−i+1) = 2/4 = 0.5."
            },
            {
              "id": "a13l4-i5",
              "front": "Expected comparisons of randomized quicksort via indicators?",
              "back": "E[X] = Σ_{i<j} 2/(j−i+1) < 2n·H_n = O(n log n) (≈ 2n ln n), in fact Θ(n log n)."
            },
            {
              "id": "a13l4-i6",
              "front": "Why are adjacent sorted elements always compared?",
              "back": "For j=i+1 the probability is 2/2 = 1 — no element lies between them to split them into different subarrays."
            }
          ]
        }
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
