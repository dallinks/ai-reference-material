import { useState } from "react";
import { theme } from "../theme.js";

export function CodeBlock({ code, lang, heading }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: "16px 0 24px" }}>
      {heading && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#A0A",
            marginBottom: 6,
            fontFamily: theme.font.mono,
            letterSpacing: 0.5,
          }}
        >
          {heading}
        </div>
      )}
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: theme.radius.xl,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            borderBottom: `1px solid ${theme.border}`,
            background: theme.surface,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: theme.textFainter,
              fontFamily: theme.font.mono,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {lang}
          </span>
          <button
            onClick={copy}
            style={{
              background: copied
                ? "rgba(0,212,170,0.15)"
                : "rgba(255,255,255,0.06)",
              border: `1px solid ${theme.borderMuted}`,
              color: copied ? theme.accent.teal : theme.textDim,
              padding: "3px 10px",
              borderRadius: theme.radius.md,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: theme.font.mono,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 16,
            fontSize: 13,
            lineHeight: 1.6,
            fontFamily: theme.font.mono,
            color: "#C8C5BE",
            overflowX: "auto",
            whiteSpace: "pre",
            tabSize: 2,
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
}
