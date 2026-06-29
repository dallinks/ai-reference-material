// The AI grader for free-response answers — proofs (math) and `open` analyses
// (judgment subjects). It hands the student's response, a rubric, and an
// authored reference answer to Claude and forces a structured verdict. The
// grader is told to be strict.
//
// Subject-aware: each course can supply a `grader` persona string (e.g. "a
// theoretical computer scientist grading proofs" vs "a startup operator grading
// go-to-market analyses") so the same engine grades very different domains
// appropriately. Falls back to a strict generic persona.
//
// Browser-direct via the official SDK (dangerouslyAllowBrowser) — appropriate
// for a personal, local-first tool where the user supplies their own key.

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_PERSONA = "You are a meticulous, demanding grader for a rigorous graduate-level course.";

const BASE = `You grade a student's written response against (a) an explicit rubric and (b) a reference answer.

Principles:
- Award credit ONLY for responses that are correct, specific, and rigorously reasoned. A confident but vague, generic, or hand-wavy answer earns little credit.
- Penalize: unsupported assertions, buzzwords without substance, missing the key point, internal contradictions, unjustified leaps, and dodging the actual question.
- A valid approach that differs from the reference is fully acceptable — grade the student's actual reasoning on its own merits, not its similarity to the reference.
- Do not be lenient to be encouraging. Give an honest, calibrated assessment that a demanding expert would stand behind.

For each rubric criterion, decide whether the response satisfies it and give a one-sentence, specific comment that cites the student's actual words (or their absence). Then give an overall score in [0,1] equal to the fraction of the rubric's weight the response earned, and concise feedback (2-4 sentences) naming the single most important thing to fix or strengthen.`;

function buildSystem(persona) {
  return `${persona || DEFAULT_PERSONA}\n\n${BASE}`;
}

const VERDICT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          criterion: { type: "string" },
          met: { type: "boolean" },
          comment: { type: "string" },
        },
        required: ["criterion", "met", "comment"],
      },
    },
    score: { type: "number" },
    feedback: { type: "string" },
  },
  required: ["criteria", "score", "feedback"],
};

function buildUserPrompt(question, answer) {
  const rubric = (question.rubric || []).map((c, i) => `${i + 1}. ${c}`).join("\n");
  return [
    `QUESTION:\n${question.prompt}`,
    `RUBRIC (grade the answer against each criterion; the overall score is the fraction of these earned):\n${rubric}`,
    `REFERENCE ANSWER (for your judgement only — the student may reason a different valid way):\n${question.solution || "(none provided)"}`,
    `STUDENT'S ANSWER:\n${answer && answer.trim() ? answer : "(no answer provided)"}`,
  ].join("\n\n");
}

function humanizeError(e) {
  if (e instanceof Anthropic.AuthenticationError) return "Authentication failed — check your API key in Settings.";
  if (e instanceof Anthropic.PermissionDeniedError) return "Your key doesn't have access to this model. Try another model in Settings.";
  if (e instanceof Anthropic.RateLimitError) return "Rate limited by the API — wait a moment and try again.";
  if (e instanceof Anthropic.APIError) return `Grader API error (${e.status ?? "?"}): ${e.message}`;
  return e?.message || "The grader call failed. Check your connection and key.";
}

// Returns { ok: true, score, criteria, feedback } or { ok: false, error }.
export async function gradeProof({ question, answer, apiKey, model, persona }) {
  if (!apiKey) return { ok: false, error: "No API key set." };

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const msg = await client.messages.create({
      model: model || "claude-opus-4-8",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: VERDICT_SCHEMA } },
      system: buildSystem(persona),
      messages: [{ role: "user", content: buildUserPrompt(question, answer) }],
    });

    if (msg.stop_reason === "refusal") {
      return { ok: false, error: "The grader declined to respond to this submission." };
    }

    const text = (msg.content || []).find((b) => b.type === "text")?.text || "";
    const verdict = JSON.parse(text);
    const score = Math.max(0, Math.min(1, Number(verdict.score) || 0));
    return { ok: true, score, criteria: verdict.criteria || [], feedback: verdict.feedback || "" };
  } catch (e) {
    return { ok: false, error: humanizeError(e) };
  }
}
