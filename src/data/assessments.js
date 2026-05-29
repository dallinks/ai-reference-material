// Per-module assessments: a knowledge-check quiz + one hands-on exercise.
// Source of truth — exported to platform-ready Markdown by
// scripts/export-assessments.mjs. NOT imported by the app bundle.
//
// Quiz: each question has options[] and answer = index of the correct option.
// Correct-answer positions are intentionally varied.

export const ASSESSMENTS = {
  m1: {
    quiz: [
      { q: "How does a modern AI model produce its behavior?",
        options: [
          "It follows rules hand-written by engineers",
          "It tunes billions of numeric weights via gradient descent to map inputs to likely outputs",
          "It looks up answers in a database of facts",
          "It reasons symbolically from first principles",
        ], answer: 1,
        why: "Training adjusts weights to minimize error; the 'intelligence' is tuned numbers, not rules or lookup." },
      { q: "An LLM confidently states a false fact. Why is this expected?",
        options: [
          "It was trained only on bad data",
          "Its knowledge is simply out of date",
          "It optimizes for plausible continuations, not verified truth",
          "It is broken and must be restarted",
        ], answer: 2,
        why: "LLMs predict plausible next tokens; a confident wrong answer is the system working as designed." },
      { q: "Which problem is the BEST fit for traditional code rather than AI?",
        options: [
          "Computing tax owed from fixed, published bracket rules",
          "Classifying spam from message text",
          "Summarizing a contract",
          "Answering customer questions in natural language",
        ], answer: 0,
        why: "Clear, fixed, auditable rules make deterministic code cheaper and fully testable." },
      { q: "Generative AI differs from a classifier because it...",
        options: [
          "is always more accurate",
          "never hallucinates",
          "requires no training data",
          "learns the data distribution well enough to produce new samples",
        ], answer: 3,
        why: "Generative models learn P(input) and can sample new content; classifiers only draw boundaries." },
    ],
    exercise: {
      title: "Triage three project ideas",
      scenario: "Your team is handed three candidate use cases: (1) compute monthly payroll from time sheets and fixed pay rates, (2) route inbound support emails to the right department by topic, (3) draft personalized sales outreach for each new lead.",
      task: "For each, decide whether it should be built with traditional code, classic ML, or generative AI — and justify in one sentence.",
      criteria: [
        "Payroll → traditional code (fixed, auditable rules; needs exact, repeatable output)",
        "Email routing → classic ML / classifier (pattern clear from labeled examples)",
        "Personalized outreach → generative AI (open-ended content creation)",
        "Each justification references rules-vs-patterns and the tolerance for non-determinism",
      ],
      solution: "The split tracks the m1 decision table: deterministic rules → code; learnable pattern over labeled data → classic ML; novel content generation → GenAI. Reasoning matters more than the label." },
  },

  m2: {
    quiz: [
      { q: "Why are output tokens priced higher than input tokens?",
        options: [
          "Output text is simply longer",
          "Input is processed in one parallel prefill pass; output is generated serially, one token at a time",
          "Providers price them arbitrarily",
          "Output uses a different, larger model",
        ], answer: 1,
        why: "Prefill is parallel and cheap per token; decode is sequential — one forward pass per output token." },
      { q: "You need the model to answer from your company's latest pricing. Best approach?",
        options: [
          "Retrieve the current pricing into the prompt (RAG)",
          "Fine-tune the model on pricing documents",
          "Raise the temperature",
          "Switch to a bigger model",
        ], answer: 0,
        why: "Fine-tune for form, retrieve for facts; RAG updates instantly and every answer is verifiable." },
      { q: "What does self-attention let each token do?",
        options: [
          "Ignore distant tokens to save compute",
          "Memorize the training set",
          "Attend to every other token, blending their value vectors weighted by query-key relevance",
          "Translate the sequence into another language",
        ], answer: 2,
        why: "Q/K/V attention scores relevance between all tokens and blends their values." },
      { q: "LoRA makes fine-tuning cheap mainly because it...",
        options: [
          "uses a much smaller dataset",
          "skips training entirely",
          "compresses the model's output",
          "trains small low-rank adapter matrices while freezing the base weights",
        ], answer: 3,
        why: "A low-rank delta on frozen weights means millions of trainable params, not billions — and hot-swappable adapters." },
    ],
    exercise: {
      title: "Estimate and cut a RAG bill",
      scenario: "A support bot on Claude Sonnet (~$3 / 1M input, $15 / 1M output) serves 20,000 queries/day. Each query: 2,000-token system prompt + 4,000 tokens of retrieved context + a 100-token question, producing a 400-token answer.",
      task: "Compute the cost per query and the monthly cost, then propose two optimizations with rough savings.",
      criteria: [
        "Input ≈ 6,100 tokens → ~$0.0183; output 400 → ~$0.0060; ~$0.0243/query → ~$486/day → ~$14.6K/month",
        "Optimization 1: prompt-cache the 2,000-token system prefix (big input discount)",
        "Optimization 2: trim retrieved context (e.g., 4,000 → 1,500) and/or route easy queries to a cheaper model",
        "Savings estimated, not just named",
      ],
      solution: "Mirrors the m2l4 worked model: attack input tokens (caching + context trim) and route by complexity — roughly a 50% cut without downgrading hard queries." },
  },

  m3: {
    quiz: [
      { q: "Why does chain-of-thought improve hard-problem accuracy?",
        options: [
          "It silently calls a smarter model",
          "Reasoning tokens give the model serial compute — a scratchpad — before committing to an answer",
          "It raises the temperature",
          "It retrieves supporting documents",
        ], answer: 1,
        why: "A transformer does fixed compute per token; verbalized steps add working space the next step can attend to." },
      { q: "Prompt injection is hard to eliminate because...",
        options: [
          "models are poorly trained",
          "the APIs are insecure",
          "instructions and data travel in the same token channel with no hard boundary",
          "prompts are too short",
        ], answer: 2,
        why: "There is no parameterization like SQL has; injection is mitigated, never fully solved." },
      { q: "For a classification task that must return the same answer every time, set temperature to...",
        options: [
          "0 — and still validate, since it is not perfectly deterministic",
          "1.0",
          "0.7",
          "as high as possible",
        ], answer: 0,
        why: "Low temperature sharpens the distribution toward the single most likely token." },
      { q: "Most reliable way to get valid structured JSON out of a model?",
        options: [
          "Ask politely in the prompt",
          "Raise max_tokens",
          "Add more examples and hope",
          "Use JSON / structured-output mode or tool calling (constrained decoding)",
        ], answer: 3,
        why: "Constrained decoding makes structurally invalid JSON impossible at sampling time." },
    ],
    exercise: {
      title: "Harden a naive prompt",
      scenario: "A support assistant is built by concatenating the user's message directly after the instructions in one string, asking for a free-text answer.",
      task: "Rewrite it to separate system and user roles, delimit the untrusted input, specify an output schema, and add an injection defense. For each change, name what it defends against.",
      criteria: [
        "Instructions in a system message, user text in a user message",
        "Untrusted input fenced in delimiters and labeled as data, not instructions",
        "Explicit output schema (and ideally JSON/structured-output mode)",
        "An instruction to refuse attempts to override the rules, plus a note that output is still validated downstream",
      ],
      solution: "Applies m3l1 (roles, delimiters, format) and m3l3 (injection is mitigated by layers: prompt structure + output validation, not the prompt alone)." },
  },

  m4: {
    quiz: [
      { q: "A RAG answer is wrong. What should you check FIRST?",
        options: [
          "Switch to a bigger LLM",
          "Whether the relevant chunk was actually retrieved — retrieval caps generation",
          "Lower the temperature",
          "Rewrite the system prompt",
        ], answer: 1,
        why: "Most RAG failures are retrieval failures; if the chunk isn't in context, no model can answer from it." },
      { q: "Why combine vector and keyword (hybrid) search?",
        options: [
          "It is cheaper than vector-only",
          "Keyword search is obsolete and only kept for compatibility",
          "Vectors miss exact tokens (IDs, codes) while BM25 catches them — their failure modes are complementary",
          "It avoids needing embeddings",
        ], answer: 2,
        why: "Semantic and lexical search fail differently; fusing them (RRF) covers both, typically +10–30% recall." },
      { q: "A cross-encoder reranker beats the bi-encoder retriever because it...",
        options: [
          "processes the query and document together, so attention runs across both",
          "is always a bigger model",
          "caches results",
          "uses keywords instead of vectors",
        ], answer: 0,
        why: "Joint encoding captures fine-grained relevance; the cost is O(candidates), so you retrieve broadly then rerank." },
      { q: "'Faithfulness' in RAG evaluation measures whether...",
        options: [
          "responses are fast enough",
          "retrieval recall is high",
          "cost per query is low",
          "the answer's claims are actually supported by the retrieved context",
        ], answer: 3,
        why: "Faithfulness is the hallucination detector at the generation stage." },
    ],
    exercise: {
      title: "Diagnose a failing RAG query",
      scenario: "A user asks about the returns window. The logged transcript shows the system retrieved five chunks about shipping (none mention returns), and the model replied with a confident but wrong policy.",
      task: "Identify which pipeline stage failed and propose two concrete fixes.",
      criteria: [
        "Correctly localizes to retrieval (the relevant chunk was not retrieved), not generation",
        "Fix ideas drawn from the right toolbox: better chunking, hybrid search, reranking, or query transformation",
        "Notes the generation issue too (it should have said 'I don't have that') — grounding + 'I don't know' behavior",
      ],
      solution: "Follows the m4l7 triage order: confirm the content exists, check retrieval before generation, then fix recall (hybrid/rerank/query-rewrite) and tighten grounding." },
  },

  m5: {
    quiz: [
      { q: "What distinguishes an 'agent' from a fixed chain?",
        options: [
          "It uses a bigger model",
          "The model itself decides control flow at each step, including when to stop",
          "It has access to more tools",
          "It runs faster",
        ], answer: 1,
        why: "Agency is non-deterministic, model-driven control flow — not just more tools or a bigger model." },
      { q: "When a model 'calls a function', what actually happens?",
        options: [
          "The model executes your code directly",
          "The model writes and compiles new functions",
          "The model emits structured JSON naming a tool and arguments; your harness runs it and returns the result",
          "The model calls the external API over the network itself",
        ], answer: 2,
        why: "The model only generates tokens; the harness parses the tool-call and executes it." },
      { q: "At 95% per-step reliability, a 10-step agent is roughly how reliable end-to-end?",
        options: [
          "~60%",
          "95%",
          "99%",
          "100%",
        ], answer: 0,
        why: "0.95^10 ≈ 0.60 — reliability compounds, so fewer steps plus guardrails matter enormously." },
      { q: "The strongest defense against an injected agent doing harm is...",
        options: [
          "a longer, sterner system prompt",
          "a higher temperature",
          "giving it more tools to choose from",
          "least privilege — it cannot misuse access it does not have",
        ], answer: 3,
        why: "Least privilege is structural; you can't stop the model being tricked, but you can ensure it lacks the access to cause damage." },
    ],
    exercise: {
      title: "Design guardrails for a refund agent",
      scenario: "An agent handles support tickets and has tools to look up orders and issue refunds.",
      task: "Specify the guardrails: the action allow-list, hard limits, confirmation gates, and which checks are deterministic vs LLM-based.",
      criteria: [
        "Allow-list of permitted actions; no open-ended 'run any query' tool (least privilege)",
        "Hard caps: max refund amount, max iterations, timeout, spend cap",
        "Human confirmation (or a separate commit tool) required before a refund is actually issued",
        "Hard limits enforced in deterministic code; soft judgment (tone, off-topic) optionally by an LLM guard",
      ],
      solution: "Applies m5l4: three guardrail layers, deterministic enforcement for anything that matters, HITL on consequential actions; the model is an untrusted engine inside a bounded wrapper." },
  },

  m6: {
    quiz: [
      { q: "Why start with Pattern 1 (Copilot) rather than jumping to autonomous agents?",
        options: [
          "Copilots are inherently more profitable",
          "Each maturity stage builds the data, evaluation capability, and trust the next stage depends on",
          "Autonomous agents do not actually work",
          "Copilots require no data",
        ], answer: 1,
        why: "Skipping the ladder is the #1 failure mode; foundations from earlier stages are prerequisites, not optional." },
      { q: "In process automation, the confidence threshold controls...",
        options: [
          "the model's temperature",
          "the token cost per document",
          "which items auto-process versus route to the human exception queue",
          "how many chunks are retrieved",
        ], answer: 2,
        why: "Calibrate it against measured accuracy-at-confidence and an error budget; straight-through-processing rate is the metric." },
      { q: "For decision support, why prefer SHAP / feature attribution over an LLM-written explanation?",
        options: [
          "It is faithful to what actually drove the prediction; an LLM narration may just rationalize the output",
          "It is cheaper to compute",
          "It is faster to display",
          "Users always prefer numbers",
        ], answer: 0,
        why: "Post-hoc LLM narration can be plausible but unfaithful; ground explanations in the real attributions." },
      { q: "'Buy the commodity, build the differentiator' means...",
        options: [
          "always build everything custom",
          "never rely on vendors",
          "buy every component you can",
          "use off-the-shelf for generic needs and reserve custom build for your competitive moat",
        ], answer: 3,
        why: "Don't rebuild commodities; spend scarce build effort only where it differentiates you." },
    ],
    exercise: {
      title: "Pick the pattern and check feasibility",
      scenario: "Employees waste time hunting through SharePoint, Confluence, and PDFs to answer policy questions.",
      task: "Choose the enterprise pattern, run the four feasibility gates, and name the success metric.",
      criteria: [
        "Pattern: Knowledge Management (RAG over org docs)",
        "Gates applied: data readiness (accessible/clean/governed/fresh), measurability, error-tolerance, risk/access-control",
        "Access control flagged as the make-or-break requirement",
        "A measurable success metric (e.g., time-to-find, ticket deflection, satisfaction)",
      ],
      solution: "Combines m6l1 (pattern selection + gates), m6l4 (access control, freshness, citations), and m6l8 (define the metric and baseline first)." },
  },

  m7: {
    quiz: [
      { q: "When scaling an LLM application, what is usually the real bottleneck?",
        options: [
          "Your application server's CPU",
          "The model provider's tokens-per-minute (TPM) quota",
          "Disk space",
          "DNS resolution",
        ], answer: 1,
        why: "Adding app replicas into a fixed model quota just yields 429s; you scale quota via PTUs or multi-region." },
      { q: "A system returns 200s with great latency but bad answers. The LLMOps lesson is...",
        options: [
          "infrastructure metrics are sufficient",
          "just add more servers",
          "you must monitor quality and behavior, not just infra — 'healthy' is not 'correct'",
          "lower the latency further",
        ], answer: 2,
        why: "LLMOps layers quality observability and drift detection on top of ordinary DevOps monitoring." },
      { q: "In AI CI/CD, the deployable unit you version and roll back is...",
        options: [
          "the (code, prompt, model, index) tuple",
          "just the code",
          "only the prompt",
          "the database",
        ], answer: 0,
        why: "Any of those four changes behavior; a partial rollback ships an untested combination." },
      { q: "Treating model output as untrusted input primarily prevents...",
        options: [
          "high token cost",
          "slow responses",
          "hallucination",
          "downstream injection (SQL / XSS / RCE) from generated content",
        ], answer: 3,
        why: "Insecure output handling: parameterize queries, sandbox code, and escape rendered output." },
    ],
    exercise: {
      title: "Make a prototype production-ready",
      scenario: "A working chatbot prototype calls the model synchronously on every request, with no caching, no limits, and only basic logging.",
      task: "List the changes needed to ship it, grouped by resilience, cost, observability, and security.",
      criteria: [
        "Resilience: retries with backoff, timeouts, a fallback model/deployment, graceful degradation",
        "Cost: prompt caching, max_tokens, per-user spend caps, anomaly alerts",
        "Observability: per-call tracing (prompt, output, tokens, latency, cost) under a correlation ID; quality sampling",
        "Security: input/output validation, treat output as untrusted, secrets out of prompts, rate limiting",
      ],
      solution: "Pulls together m7l1 (resilience, caching), m7l2 (tracing, quality), m7l3 (security), and m7l5 (cost controls)." },
  },

  m8: {
    quiz: [
      { q: "How does a multimodal model 'see' an image?",
        options: [
          "It runs OCR and reads only the text",
          "It splits the image into patches, embeds them as tokens, and attends over them like text",
          "It describes the pixels one at a time",
          "It cannot; it only reads alt text",
        ], answer: 1,
        why: "Vision Transformers patchify the image into tokens projected into the shared embedding space." },
      { q: "For high-volume extraction from a consistent invoice format, the best default is...",
        options: [
          "a frontier vision LLM on every page",
          "manual data entry",
          "OCR / Document Intelligence — cheap, fast, deterministic, and it gives bounding boxes",
          "audio transcription",
        ], answer: 2,
        why: "Reserve the vision LLM for messy or reasoning-heavy cases; combine them in a hybrid pipeline." },
      { q: "The general rule for any exotic modality feeding business logic is...",
        options: [
          "convert it to text as early as possible, then reuse your LLM / RAG / eval stack",
          "keep it in its native format throughout",
          "always use a single model for everything",
          "avoid the modality entirely",
        ], answer: 0,
        why: "Text is what your downstream systems consume; the X→text directions hold most enterprise value." },
      { q: "To understand a 30-minute video cost-effectively you should...",
        options: [
          "feed every frame at full resolution",
          "ignore the audio track",
          "convert it to speech with TTS",
          "sample keyframes, transcribe the audio, and fuse them with timestamps",
        ], answer: 3,
        why: "Raw frames blow up token cost; decompose video into sampled images plus a transcript." },
    ],
    exercise: {
      title: "Choose an approach for four document jobs",
      scenario: "Four incoming workloads: (1) thousands of invoices in one consistent template, (2) a single unusual multi-language contract, (3) scanned handwritten forms, (4) recorded meeting audio.",
      task: "Pick OCR / vision LLM / hybrid / speech-to-text for each and justify by volume, format, and need for provenance.",
      criteria: [
        "Consistent high-volume invoices → OCR / Document Intelligence (cheap, deterministic, bounding boxes)",
        "Unusual one-off contract → vision LLM (flexible, reasoning) — or hybrid",
        "Handwritten forms → OCR with handwriting support, verify low-confidence with a vision LLM",
        "Meeting audio → speech-to-text → LLM; keep the transcript",
      ],
      solution: "Applies the m8l1/m8l3 decision logic: match the tool to volume, format consistency, provenance needs, and reasoning required." },
  },

  m9: {
    quiz: [
      { q: "Why run the three horizons as a dependency chain rather than a flat backlog?",
        options: [
          "It is the traditional way to plan",
          "Horizon 1 funds and de-risks Horizon 2, which in turn enables Horizon 3 — foundations must come first",
          "Horizon 3 work is actually the easiest",
          "The horizons are just time labels with no relationship",
        ], answer: 1,
        why: "Sequencing manages risk; the moonshot-first approach fails because it skips the data/eval/trust foundation." },
      { q: "A project scores high on impact, but you have no labeled data and no way to measure 'correct'. It should...",
        options: [
          "start immediately to capture the impact",
          "skip evaluation to move faster",
          "be gated — fix data and measurability first, or descope",
          "just use a bigger model",
        ], answer: 2,
        why: "Feasibility gates: an unmeasurable project is unshippable, and missing data makes it a data project first." },
      { q: "Which investment compounds across every future AI project?",
        options: [
          "Shared platform: eval harness, observability, a governed RAG layer, and a model-abstraction layer",
          "One feature's carefully tuned prompt",
          "A single vendor contract",
          "A one-time marketing campaign",
        ], answer: 0,
        why: "Platform investments make each subsequent project cheaper and faster — capability, not just features." },
      { q: "The durable hedge against a fast-changing model landscape is...",
        options: [
          "commit to one provider forever",
          "stop shipping until things stabilize",
          "use only open-weight models",
          "stay model-agnostic via an abstraction layer and bet on data, evals, and domain expertise",
        ], answer: 3,
        why: "Reason from the forces, prefer reversible bets, and invest in what gains value as models commoditize." },
      { q: "Under a risk-tiered AI law like the EU AI Act, what determines your obligations?",
        options: [
          "The risk level of the use case — minimal, limited, high, or unacceptable",
          "The size of the model you use",
          "The programming language the system is written in",
          "Which cloud provider hosts it",
        ], answer: 0,
        why: "Obligations scale with use-case risk; classify the tier first because it drives every other control (m9l2)." },
    ],
    exercise: {
      title: "Draft a 12-month AI roadmap",
      scenario: "A mid-size company, new to AI, asks you to sketch its first year.",
      task: "Place three initiatives across the three horizons, name one shared platform investment, and define a go/no-go metric for the first pilot.",
      criteria: [
        "Horizon 1: an off-the-shelf quick win (e.g., a copilot) shipped in months",
        "Horizon 2: a custom RAG or automation on proprietary data",
        "Horizon 3: a researched, longer-horizon agentic or AI-native bet",
        "One platform investment (evals / observability / RAG layer) and a measurable pilot go/no-go threshold",
      ],
      solution: "Applies m9l1: staged horizons as a dependency chain, fund the compounding platform, and gate the first pilot on a pre-defined metric (m6l8)." },
  },
};
