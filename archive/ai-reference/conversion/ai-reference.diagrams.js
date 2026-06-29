// Hand-authored Crucible `graph` diagrams, keyed by the legacy diagram heading.
// Each replaces the legacy diagram block (stack/flow/cycle of {label,detail}
// nodes) with a positioned node-link graph the Crucible renderer draws as SVG
// (see components/Diagram.jsx: nodes need x,y in 0..100, label, optional sub;
// edges reference node ids and may be directed/labeled). Merged into the course
// by scripts/convert-ai-reference.mjs. Any legacy diagram with no entry here
// falls back to a faithful text rendering.

export const DIAGRAMS = {
  // m1l3 — was a 3-layer vertical "stack". Value migrates upward.
  "The Three Layers of the Stack": {
    type: "diagram",
    kind: "graph",
    heading: "The Three Layers of the Stack",
    height: 360,
    nodes: [
      { id: "tool", x: 50, y: 16, r: 30, tone: "gold", label: "Tooling", sub: "evals · vector DBs · your product" },
      { id: "plat", x: 50, y: 50, r: 30, tone: "sage", label: "Platform", sub: "Azure AI · Bedrock · Vertex" },
      { id: "model", x: 50, y: 84, r: 30, tone: "muted", label: "Model", sub: "GPT · Claude · Gemini · Llama" },
    ],
    edges: [
      { from: "model", to: "plat", directed: true, tone: "muted" },
      { from: "plat", to: "tool", directed: true, tone: "muted", label: "value migrates up" },
    ],
    caption:
      "You build in the top two layers — composing and grounding models you rent from the bottom one. Value migrates upward as the model layer commoditizes.",
  },

  // m2l2 — autoregressive generation loop (6 stages around a ring).
  "One Token's Journey Through the Stack": {
    type: "diagram",
    kind: "graph",
    heading: "One Token's Journey Through the Stack",
    height: 400,
    nodes: [
      { id: "tok", x: 50, y: 17, r: 26, tone: "sage", label: "Tokens", sub: "text → IDs" },
      { id: "emb", x: 81, y: 33, r: 26, label: "Embed", sub: "+ position" },
      { id: "blk", x: 81, y: 67, r: 26, label: "Blocks", sub: "attention → FFN" },
      { id: "log", x: 50, y: 83, r: 26, label: "Logits", sub: "score tokens" },
      { id: "soft", x: 19, y: 67, r: 26, label: "Softmax", sub: "→ probabilities" },
      { id: "samp", x: 19, y: 33, r: 26, tone: "gold", label: "Sample", sub: "pick next" },
    ],
    edges: [
      { from: "tok", to: "emb", directed: true },
      { from: "emb", to: "blk", directed: true },
      { from: "blk", to: "log", directed: true },
      { from: "log", to: "soft", directed: true },
      { from: "soft", to: "samp", directed: true },
      { from: "samp", to: "tok", directed: true, tone: "gold", label: "append & repeat" },
    ],
    caption:
      "Autoregressive generation: the sampled token is appended to the input and the whole loop runs again for the next one.",
  },

  // m2l6 — the customization ladder (ascending flow).
  "The Customization Ladder": {
    type: "diagram",
    kind: "graph",
    heading: "The Customization Ladder",
    height: 320,
    nodes: [
      { id: "prompt", x: 8, y: 80, r: 26, tone: "sage", label: "Prompt", sub: "minutes, free" },
      { id: "shots", x: 29, y: 64, r: 26, label: "+ Shots", sub: "few-shot examples" },
      { id: "rag", x: 50, y: 48, r: 26, label: "+ RAG", sub: "for facts" },
      { id: "tune", x: 71, y: 32, r: 26, label: "Tune", sub: "fine-tune for behavior" },
      { id: "distill", x: 92, y: 16, r: 26, tone: "gold", label: "Distill", sub: "→ SLM, cheap at scale" },
    ],
    edges: [
      { from: "prompt", to: "shots", directed: true },
      { from: "shots", to: "rag", directed: true },
      { from: "rag", to: "tune", directed: true },
      { from: "tune", to: "distill", directed: true },
    ],
    caption:
      "Each rung costs more and is harder to reverse. Climb only as far as your eval (m3l4) requires — most problems stop at rung 1 or 2.",
  },

  // m3l4 — the eval-driven loop (5 stages around a ring).
  "The Eval-Driven Loop": {
    type: "diagram",
    kind: "graph",
    heading: "The Eval-Driven Loop",
    height: 400,
    nodes: [
      { id: "obs", x: 50, y: 16, r: 27, tone: "rust", label: "Observe", sub: "a failure" },
      { id: "add", x: 84, y: 40, r: 27, label: "+ Eval", sub: "bug → test" },
      { id: "chg", x: 71, y: 77, r: 27, label: "Change", sub: "one thing" },
      { id: "run", x: 29, y: 77, r: 27, label: "Re-run", sub: "regressions?" },
      { id: "ship", x: 16, y: 40, r: 27, tone: "sage", label: "Ship?", sub: "gate on score" },
    ],
    edges: [
      { from: "obs", to: "add", directed: true },
      { from: "add", to: "chg", directed: true },
      { from: "chg", to: "run", directed: true },
      { from: "run", to: "ship", directed: true },
      { from: "ship", to: "obs", directed: true, tone: "gold", label: "ratchet ↑" },
    ],
    caption:
      "TDD for AI: failures become permanent test cases, so quality only ratchets upward. Changing one variable at a time keeps the signal interpretable.",
  },

  // m4l1 — the retrieval hot path (horizontal flow).
  "The Retrieval Hot Path": {
    type: "diagram",
    kind: "graph",
    heading: "The Retrieval Hot Path",
    height: 260,
    nodes: [
      { id: "q", x: 8, y: 50, r: 27, tone: "sage", label: "Question", sub: "user asks" },
      { id: "emb", x: 29, y: 50, r: 27, label: "Embed", sub: "same model as ingest" },
      { id: "search", x: 50, y: 50, r: 27, label: "Search", sub: "top-K chunks" },
      { id: "asm", x: 71, y: 50, r: 27, label: "Assemble", sub: "inject + instruct" },
      { id: "llm", x: 92, y: 50, r: 27, tone: "gold", label: "LLM", sub: "grounded answer" },
    ],
    edges: [
      { from: "q", to: "emb", directed: true },
      { from: "emb", to: "search", directed: true },
      { from: "search", to: "asm", directed: true },
      { from: "asm", to: "llm", directed: true },
    ],
    caption:
      "What the user feels, on a latency budget. Ingestion (load → chunk → embed → store) runs offline, ahead of time — the same embedding model must be used in both phases.",
  },

  // m5l1 — the agent loop (4 stages around a ring).
  "The Agent Loop": {
    type: "diagram",
    kind: "graph",
    heading: "The Agent Loop",
    height: 380,
    nodes: [
      { id: "model", x: 50, y: 17, r: 28, tone: "gold", label: "Model", sub: "reads full history" },
      { id: "tools", x: 86, y: 50, r: 28, label: "Tools?", sub: "yes → act · no → done" },
      { id: "exec", x: 50, y: 83, r: 28, label: "Execute", sub: "run the tools" },
      { id: "append", x: 14, y: 50, r: 28, label: "Append", sub: "results → history" },
    ],
    edges: [
      { from: "model", to: "tools", directed: true },
      { from: "tools", to: "exec", directed: true },
      { from: "exec", to: "append", directed: true },
      { from: "append", to: "model", directed: true, tone: "gold", label: "re-read & loop" },
    ],
    caption:
      "The loop is your code, not the model. The LLM is stateless — it re-reads the entire scratchpad every turn, which is why context length, retries, and the stop condition are all your responsibility.",
  },

  // m6 (AI UX) — the product feedback loop / data flywheel (5 stages around a ring).
  "The Product Feedback Loop": {
    type: "diagram",
    kind: "graph",
    heading: "The Product Feedback Loop",
    height: 400,
    nodes: [
      { id: "resp", x: 50, y: 16, r: 27, tone: "gold", label: "Respond", sub: "streamed + cited" },
      { id: "act", x: 84, y: 40, r: 27, label: "User acts", sub: "accept / edit / retry" },
      { id: "sig", x: 71, y: 77, r: 27, label: "Signal", sub: "explicit + implicit" },
      { id: "eval", x: 29, y: 77, r: 27, label: "+ Eval set", sub: "failures → tests" },
      { id: "impr", x: 16, y: 40, r: 27, tone: "sage", label: "Improve", sub: "prompt / model / retrieval" },
    ],
    edges: [
      { from: "resp", to: "act", directed: true },
      { from: "act", to: "sig", directed: true },
      { from: "sig", to: "eval", directed: true },
      { from: "eval", to: "impr", directed: true },
      { from: "impr", to: "resp", directed: true, tone: "gold", label: "flywheel" },
    ],
    caption:
      "Well-designed AI UX is also a data flywheel: every interaction is grounded for trust and instrumented for learning, feeding the eval-driven loop from m3l4.",
  },

  // m9l2 — NIST AI RMF: Govern wraps Map/Measure/Manage (hub + cycle).
  "The NIST AI RMF Loop": {
    type: "diagram",
    kind: "graph",
    heading: "The NIST AI RMF Loop",
    height: 380,
    nodes: [
      { id: "gov", x: 50, y: 50, r: 30, tone: "gold", label: "Govern", sub: "policy · roles" },
      { id: "map", x: 50, y: 14, r: 26, tone: "sage", label: "Map", sub: "context & risk" },
      { id: "meas", x: 85, y: 80, r: 26, tone: "sage", label: "Measure", sub: "evals · red-team" },
      { id: "mng", x: 15, y: 80, r: 26, tone: "sage", label: "Manage", sub: "guardrails · monitor" },
    ],
    edges: [
      { from: "map", to: "meas", directed: true, tone: "sage" },
      { from: "meas", to: "mng", directed: true, tone: "sage" },
      { from: "mng", to: "map", directed: true, tone: "sage" },
      { from: "gov", to: "map", directed: true, tone: "gold", dashed: true },
      { from: "gov", to: "meas", directed: true, tone: "gold", dashed: true },
      { from: "gov", to: "mng", directed: true, tone: "gold", dashed: true },
    ],
    caption:
      "Govern wraps the other three. It's a continuous loop, not a one-time audit — the same eval-driven cadence as the rest of the course, applied to risk.",
  },
};
