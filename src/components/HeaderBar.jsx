import { theme } from "../theme.js";

export function HeaderBar({ backLabel, onBack, accent = theme.accent.orange, right }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: theme.overlay,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme.border}`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: accent,
          cursor: "pointer",
          fontFamily: theme.font.mono,
          fontSize: 12,
          letterSpacing: 1,
          padding: 0,
        }}
      >
        ← {backLabel}
      </button>
      {right}
    </div>
  );
}
