// Seed course — small but real, used to exercise the whole loop (lessons ->
// mastery gate -> unlock -> spaced review). Two units; unit 2 is locked until
// you pass unit 1. This is also a worked example of the AUTHORING.md contract.

export const probability = {
  id: "probability",
  title: "Probability, From First Principles",
  subject: "Mathematics",
  difficulty: "Lower-undergraduate",
  description:
    "Build probability the way a mathematician does: from sample spaces and the Kolmogorov axioms up to conditional probability and Bayes' theorem. Short, but the gates are real.",
  sources: ["Demonstration course — generated to validate the platform"],
  units: [
    {
      id: "u1",
      title: "Sample Spaces & the Axioms",
      summary: "What randomness is made of, and the three rules every probability obeys.",
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "u1l1",
          title: "Outcomes, Events, and Sample Spaces",
          estMinutes: 10,
          content: [
            {
              type: "text",
              heading: "The sample space",
              body: "A **random experiment** is any process whose outcome you cannot predict with certainty. The set of *all* possible outcomes is the **sample space**, written Ω (omega). An **event** is any subset of Ω — a collection of outcomes you care about.\n\nThat is the whole foundation: probability is a function that assigns numbers to *subsets* of Ω. Everything else is built on set theory.",
            },
            {
              type: "example",
              heading: "Rolling one die",
              body: "Ω = {1, 2, 3, 4, 5, 6}. The event \"rolled even\" is the subset E = {2, 4, 6}. The event \"rolled at least 5\" is {5, 6}. An outcome is a single element; an event is a set of them.",
            },
            {
              type: "text",
              heading: "Events combine like sets",
              body: "Because events are sets, you combine them with set operations:\n\n• **A or B** (at least one happens) = the union A ∪ B\n• **A and B** (both happen) = the intersection A ∩ B\n• **not A** (A fails) = the complement Aᶜ = Ω \\ A\n\nTwo events are **mutually exclusive** (disjoint) when A ∩ B = ∅ — they cannot happen together.",
            },
          ],
          reviewItems: [
            { id: "u1l1-i1", front: "What is the sample space Ω?", back: "The set of all possible outcomes of a random experiment." },
            { id: "u1l1-i2", front: "What is an event, formally?", back: "Any subset of the sample space Ω." },
            { id: "u1l1-i3", front: "'A or B' and 'A and B' as set operations?", back: "Union (A ∪ B) and intersection (A ∩ B)." },
            { id: "u1l1-i4", front: "What does it mean for two events to be mutually exclusive?", back: "A ∩ B = ∅ — they share no outcomes and cannot both occur." },
          ],
        },
        {
          id: "u1l2",
          title: "The Kolmogorov Axioms",
          estMinutes: 12,
          content: [
            {
              type: "text",
              heading: "Three rules define probability",
              body: "A **probability** P assigns to each event a number, subject to exactly three axioms (Kolmogorov, 1933):\n\n1. **Non-negativity:** P(A) ≥ 0 for every event A.\n2. **Normalization:** P(Ω) = 1 — *something* happens.\n3. **Countable additivity:** if A₁, A₂, … are pairwise disjoint, then P(A₁ ∪ A₂ ∪ …) = P(A₁) + P(A₂) + …\n\nEverything you know about probability is a *theorem* derived from these three lines.",
            },
            {
              type: "example",
              heading: "What follows immediately",
              body: "From the axioms alone you can prove:\n• P(∅) = 0\n• Complement rule: P(Aᶜ) = 1 − P(A)\n• Monotonicity: if A ⊆ B then P(A) ≤ P(B)\n• Inclusion–exclusion: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)\n\nThe last one corrects for the overlap you would otherwise double-count.",
            },
            {
              type: "callout",
              tone: "warn",
              body: "Additivity only adds when events are **disjoint**. P(A ∪ B) = P(A) + P(B) is FALSE in general — it is only true when A ∩ B = ∅. Forgetting this is the single most common beginner error.",
            },
          ],
          reviewItems: [
            { id: "u1l2-i1", front: "State the three Kolmogorov axioms.", back: "Non-negativity P(A)≥0; Normalization P(Ω)=1; Countable additivity over disjoint events." },
            { id: "u1l2-i2", front: "Complement rule: P(Aᶜ) = ?", back: "1 − P(A)." },
            { id: "u1l2-i3", front: "General inclusion–exclusion for two events?", back: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)." },
            { id: "u1l2-i4", front: "When is P(A ∪ B) = P(A) + P(B) valid?", back: "Only when A and B are disjoint (mutually exclusive)." },
          ],
        },
      ],
      masteryCheck: {
        id: "u1-check",
        questions: [
          {
            id: "u1q1",
            type: "numeric",
            prompt: "A fair six-sided die is rolled once. What is P(the result is even)?",
            answer: 0.5,
            tolerance: 0.001,
            explanation: "Even outcomes {2,4,6} are 3 of 6 equally likely outcomes → 3/6 = 0.5.",
          },
          {
            id: "u1q2",
            type: "mcq",
            prompt: "Which statement is NOT one of the Kolmogorov axioms?",
            options: [
              "P(A) ≥ 0 for every event",
              "P(Ω) = 1",
              "P(A ∪ B) = P(A) + P(B) for ALL events A, B",
              "Disjoint events' probabilities add",
            ],
            answer: 2,
            explanation: "Additivity holds only for DISJOINT events; the unconditional version is false.",
          },
          {
            id: "u1q3",
            type: "short",
            prompt: "Write the complement rule: P(Aᶜ) equals what, in terms of P(A)?",
            accept: ["1 - P(A)", "1-P(A)", "1 − P(A)"],
            explanation: "Aᶜ and A are disjoint and cover Ω, so their probabilities sum to 1.",
          },
          {
            id: "u1q4",
            type: "numeric",
            prompt: "P(A) = 0.5, P(B) = 0.4, P(A ∩ B) = 0.2. Compute P(A ∪ B).",
            answer: 0.7,
            tolerance: 0.001,
            explanation: "Inclusion–exclusion: 0.5 + 0.4 − 0.2 = 0.7.",
          },
          {
            id: "u1q5",
            type: "proof",
            prompt: "Prove, using only the Kolmogorov axioms, that P(∅) = 0.",
            points: 2,
            rubric: [
              "Begins from a valid axiom-based fact (e.g. ∅ and Ω are disjoint with ∅ ∪ Ω = Ω, or ∅ = ∅ ∪ ∅ ∪ … as a disjoint union).",
              "Correctly applies (countable/finite) additivity to disjoint events.",
              "Uses normalization P(Ω) = 1 (or the finiteness of probability) to isolate P(∅).",
              "Concludes P(∅) = 0 with no circular reasoning or unjustified steps.",
            ],
            solution:
              "Ω and ∅ are disjoint and Ω ∪ ∅ = Ω. By additivity, P(Ω) = P(Ω ∪ ∅) = P(Ω) + P(∅). Since P(Ω) = 1 is finite, subtracting it from both sides gives P(∅) = 0. (Equivalently, ∅ = ∅ ∪ ∅ ∪ … is a countable disjoint union, so P(∅) = Σ P(∅); a finite sum of a constant equals that constant only if the constant is 0.)",
            explanation:
              "Cleanest route: ∅ is disjoint from Ω with union Ω, so additivity gives P(Ω) = P(Ω) + P(∅); finiteness of P(Ω) forces P(∅) = 0.",
          },
        ],
      },
    },
    {
      id: "u2",
      title: "Conditional Probability & Bayes",
      summary: "How evidence updates belief — and why your intuition about it is usually wrong.",
      prerequisites: ["u1"],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "u2l1",
          title: "Conditioning on Evidence",
          estMinutes: 12,
          content: [
            {
              type: "text",
              heading: "The definition",
              body: "The **conditional probability** of A given B — written P(A | B) — is the probability A holds once you know B happened:\n\nP(A | B) = P(A ∩ B) / P(B),  defined when P(B) > 0.\n\nConditioning *shrinks the world* to B: you renormalize by P(B) so probabilities inside B sum to 1 again.",
            },
            {
              type: "example",
              heading: "Two dice",
              body: "Roll two fair dice. Let B = \"sum is 7\" and A = \"first die is 3\". The outcomes with sum 7 are {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)} — six of them, each equally likely, so P(B) = 6/36. Exactly one of those has first die 3, so P(A ∩ B) = 1/36. Thus P(A | B) = (1/36)/(6/36) = 1/6.",
            },
            {
              type: "text",
              heading: "Independence",
              body: "A and B are **independent** when knowing one tells you nothing about the other: P(A | B) = P(A), equivalently P(A ∩ B) = P(A)·P(B). Independence is an *assumption you must justify*, not a default.",
            },
          ],
          reviewItems: [
            { id: "u2l1-i1", front: "Definition of P(A | B)?", back: "P(A ∩ B) / P(B), defined when P(B) > 0." },
            { id: "u2l1-i2", front: "Intuitively, what does conditioning on B do?", back: "Restricts the sample space to B and renormalizes by P(B)." },
            { id: "u2l1-i3", front: "Two equivalent definitions of independence of A and B?", back: "P(A | B) = P(A), equivalently P(A ∩ B) = P(A)·P(B)." },
          ],
        },
        {
          id: "u2l2",
          title: "Bayes' Theorem & Base Rates",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Reversing the conditional",
              body: "Often you know P(evidence | hypothesis) but want P(hypothesis | evidence). **Bayes' theorem** flips it:\n\nP(H | E) = P(E | H) · P(H) / P(E)\n\nwhere P(E) = P(E | H)·P(H) + P(E | Hᶜ)·P(Hᶜ) by the law of total probability. P(H) is the **prior** (base rate); P(H | E) is the **posterior**.",
            },
            {
              type: "example",
              heading: "The famous medical test",
              body: "A disease affects 1% of people. A test is 99% sensitive (P(+ | sick) = 0.99) and has a 5% false-positive rate (P(+ | healthy) = 0.05). You test positive. P(sick | +)?\n\nP(+) = 0.99·0.01 + 0.05·0.99 = 0.0099 + 0.0495 = 0.0594.\nP(sick | +) = 0.0099 / 0.0594 ≈ 0.167.\n\nDespite a 'good' test, you are only ~17% likely to be sick — because the base rate is tiny.",
            },
            {
              type: "callout",
              tone: "warn",
              body: "**Base-rate neglect:** judging P(H | E) from P(E | H) while ignoring the prior P(H). A rare condition stays unlikely even after positive evidence. This is the error behind most misread test results.",
            },
          ],
          reviewItems: [
            { id: "u2l2-i1", front: "State Bayes' theorem.", back: "P(H | E) = P(E | H)·P(H) / P(E)." },
            { id: "u2l2-i2", front: "What is the 'prior' P(H)?", back: "The base rate — probability of the hypothesis before seeing the evidence." },
            { id: "u2l2-i3", front: "Law of total probability for P(E)?", back: "P(E) = P(E|H)·P(H) + P(E|Hᶜ)·P(Hᶜ)." },
            { id: "u2l2-i4", front: "What is base-rate neglect?", back: "Estimating P(H|E) from P(E|H) while ignoring the prior P(H)." },
          ],
        },
      ],
      masteryCheck: {
        id: "u2-check",
        questions: [
          {
            id: "u2q1",
            type: "short",
            prompt: "Write the definition of conditional probability P(A | B).",
            accept: ["P(A and B)/P(B)", "P(A∩B)/P(B)", "P(AB)/P(B)", "P(A ∩ B) / P(B)"],
            explanation: "P(A | B) = P(A ∩ B) / P(B).",
          },
          {
            id: "u2q2",
            type: "numeric",
            prompt: "Two fair dice are rolled. Given the sum is 7, what is the probability the first die shows 3? (decimal, 3 places)",
            answer: 0.167,
            tolerance: 0.005,
            explanation: "1/6 ≈ 0.167 — one of the six equally likely sum-7 outcomes.",
          },
          {
            id: "u2q3",
            type: "mcq",
            prompt: "A test is highly accurate but the condition is very rare. You test positive. The probability you have the condition is often surprisingly LOW because:",
            options: [
              "The test must be broken",
              "The low base rate (prior) dominates, so false positives outnumber true positives",
              "Sensitivity and specificity are the same thing",
              "Bayes' theorem does not apply to medical tests",
            ],
            answer: 1,
            explanation: "With a tiny prior, the many healthy people generate more false positives than the few sick people generate true positives.",
          },
          {
            id: "u2q4",
            type: "numeric",
            prompt: "Prior P(H) = 0.10. P(E | H) = 0.80, P(E | Hᶜ) = 0.20. Compute the posterior P(H | E). (2 decimals)",
            answer: 0.31,
            tolerance: 0.01,
            explanation: "P(E)=0.8·0.1+0.2·0.9=0.08+0.18=0.26; posterior=0.08/0.26≈0.31.",
          },
        ],
      },
    },
  ],
};
