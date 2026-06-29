// Local-only settings for the AI proof-grader: your Anthropic API key and the
// model to grade with. Stored in localStorage on THIS machine and sent only to
// api.anthropic.com when a proof is graded. Never committed, never sent anywhere
// else. A VITE_ANTHROPIC_API_KEY env var (a local .env file) takes precedence —
// preferred on shared machines so the key never touches localStorage.

const KEY = "crucible-settings-v1";

export const GRADER_MODELS = [
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 — strongest (default)" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — faster / cheaper" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — fastest / cheapest" },
];

const DEFAULTS = { apiKey: "", model: "claude-opus-4-8" };

function envKey() {
  try {
    return import.meta.env?.VITE_ANTHROPIC_API_KEY || "";
  } catch {
    return "";
  }
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

// Env var wins over the stored key, so a local .env overrides the UI field.
export function getApiKey() {
  return envKey() || getSettings().apiKey || "";
}

export function hasApiKey() {
  return !!getApiKey();
}

export function usingEnvKey() {
  return !!envKey();
}
