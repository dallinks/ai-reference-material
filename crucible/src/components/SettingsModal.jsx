import { useState } from "react";
import { theme } from "../theme.js";
import { Button, Eyebrow } from "./ui.jsx";
import { getSettings, saveSettings, GRADER_MODELS, usingEnvKey } from "../lib/settings.js";

export function SettingsModal({ open, onClose }) {
  const [s, setS] = useState(() => getSettings());
  if (!open) return null;
  const env = usingEnvKey();

  const save = () => {
    saveSettings({ apiKey: s.apiKey, model: s.model });
    onClose();
  };

  const field = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.borderMuted}`,
    background: theme.surface,
    color: theme.textStrong,
    fontSize: 14,
    fontFamily: theme.font.mono,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(6,5,4,0.66)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flip-in"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#141210",
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: theme.radius.xl,
          padding: "26px 28px",
          boxShadow: theme.shadow.card,
          fontFamily: theme.font.serif,
          color: theme.text,
        }}
      >
        <Eyebrow color={theme.accent.gold} style={{ marginBottom: 12 }}>
          Settings · proof grader
        </Eyebrow>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: theme.textFaint, margin: "0 0 22px" }}>
          Graded proofs call Claude with <em>your</em> Anthropic key. It's stored only in this browser and sent only to
          api.anthropic.com — never committed, never anywhere else.
        </p>

        {env && (
          <div
            style={{
              fontSize: 13,
              color: theme.accent.sage,
              background: `${theme.accent.sage}12`,
              border: `1px solid ${theme.accent.sage}33`,
              borderRadius: theme.radius.md,
              padding: "10px 12px",
              marginBottom: 18,
              fontFamily: theme.font.mono,
            }}
          >
            Using key from VITE_ANTHROPIC_API_KEY (.env) — the field below is ignored.
          </div>
        )}

        <label style={{ fontFamily: theme.font.mono, fontSize: 11, letterSpacing: 1.5, color: theme.textFaint, textTransform: "uppercase" }}>
          Anthropic API key
        </label>
        <input
          type="password"
          className="field"
          disabled={env}
          value={s.apiKey}
          onChange={(e) => setS({ ...s, apiKey: e.target.value })}
          placeholder="sk-ant-…"
          autoComplete="off"
          spellCheck={false}
          style={{ ...field, marginTop: 8, marginBottom: 20, opacity: env ? 0.5 : 1 }}
        />

        <label style={{ fontFamily: theme.font.mono, fontSize: 11, letterSpacing: 1.5, color: theme.textFaint, textTransform: "uppercase" }}>
          Grader model
        </label>
        <select
          value={s.model}
          onChange={(e) => setS({ ...s, model: e.target.value })}
          style={{ ...field, marginTop: 8, marginBottom: 8, fontFamily: theme.font.serif }}
        >
          {GRADER_MODELS.map((m) => (
            <option key={m.id} value={m.id} style={{ background: "#141210" }}>
              {m.label}
            </option>
          ))}
        </select>
        <p style={{ fontSize: 12.5, color: theme.textFaintest, margin: "4px 0 24px", lineHeight: 1.5 }}>
          Create a key in the Anthropic Console (console.anthropic.com → API keys).
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button accent={theme.accent.gold} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
