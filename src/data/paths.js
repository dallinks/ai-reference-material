// Role-based learning paths + the capstone project. These are curated views
// over the existing lessons (referenced by id) — no lesson content lives here.
// Lesson ids are resolved against allLessonsFlat in PathView.

export const LEARNING_PATHS = [
  {
    id: "exec",
    title: "Executive / Leader",
    audience: "Decision-makers, sponsors",
    desc: "The strategy, ROI, and risk decisions — without the implementation depth. Enough to fund, govern, and sequence AI well.",
    accent: "#FF8A65",
    lessonIds: ["m1l1", "m1l3", "m6l1", "m6l5", "m6l8", "m9l1", "m9l2", "m9l3"],
  },
  {
    id: "pm",
    title: "Product Manager",
    audience: "PMs, designers, leads",
    desc: "Scope, design, and ship AI features. Know enough about how it works — and how it fails — to make good product calls.",
    accent: "#00B4D8",
    lessonIds: ["m1l1", "m1l2", "m3l1", "m3l4", "m4l1", "m5l1", "m6l1", "m6l9", "m6l8", "m9l2"],
  },
  {
    id: "eng",
    title: "Engineer / Builder",
    audience: "The hands-on build path",
    desc: "The critical path from foundations to production. Then go deep in each module — but this is the spine that gets something real shipped.",
    accent: "#00D4AA",
    lessonIds: [
      "m1l1", "m1l2", "m2l1", "m2l2", "m2l4", "m2l6",
      "m3l1", "m3l2", "m3l4", "m4l1", "m4l3", "m4l6",
      "m5l1", "m5l2", "m5l4", "m7l1", "m7l2", "m7l3",
    ],
  },
];

// One culminating project that threads the whole course end-to-end, so the
// learner builds one real thing instead of only reading. Each stage points at
// the lessons that carry it.
export const CAPSTONE = {
  id: "capstone",
  title: "Capstone: Ship a Grounded AI Assistant",
  accent: "#FF6B35",
  scenario:
    "Pick a real problem in your own org or domain — a support assistant, a policy Q&A bot, an internal-docs helper. You'll take it from idea to a shippable, measured, governed system, producing a working prototype, an eval harness, and a one-page case study you can publish.",
  stages: [
    {
      title: "1 · Frame & scope",
      goal: "Choose a problem that's actually an AI problem, and pass the feasibility gates before writing code.",
      lessonIds: ["m1l1", "m6l1", "m9l1"],
    },
    {
      title: "2 · Ground it in data",
      goal: "Build a small RAG pipeline over real documents: chunk, embed, retrieve. Get grounded, cited answers.",
      lessonIds: ["m4l1", "m4l2", "m4l3"],
    },
    {
      title: "3 · Make it act",
      goal: "Add one tool or agent step so it can do something, not just answer — wrapped in least-privilege guardrails.",
      lessonIds: ["m5l1", "m5l2", "m5l4"],
    },
    {
      title: "4 · Measure it",
      goal: "Build a golden eval set and an LLM-as-judge harness. Gate every change on it — no shipping on vibes.",
      lessonIds: ["m3l4", "m4l6"],
    },
    {
      title: "5 · Productionize",
      goal: "Add resilience, observability, cost controls, and security; deploy it somewhere real.",
      lessonIds: ["m7l1", "m7l2", "m7l5", "m7l3"],
    },
    {
      title: "6 · Govern & ship",
      goal: "Write a use-case risk record, design the UX for trust and feedback, quantify ROI, and publish the case study.",
      lessonIds: ["m9l2", "m6l9", "m6l8", "m9l4"],
    },
  ],
  deliverable:
    "A working grounded assistant behind a model-agnostic layer, a versioned eval harness it must pass to ship, and a one-page case study (problem → architecture → hard parts → results) for your portfolio (m9l4).",
};
