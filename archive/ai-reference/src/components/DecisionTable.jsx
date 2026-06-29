import { theme } from "../theme.js";

export function DecisionTable({ heading, rows }) {
  return (
    <div style={{ margin: "16px 0 24px" }}>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: theme.textStrong,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: theme.accent.yellow }}>⟐</span> {heading}
      </div>
      <div
        style={{
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: theme.radius.xl,
          overflow: "hidden",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              borderBottom:
                i < rows.length - 1 ? `1px solid ${theme.border}` : "none",
              fontSize: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "10px 14px",
                color: theme.textMuted,
                background: theme.surface,
              }}
            >
              {row[0]}
            </div>
            <div
              style={{
                flex: 1,
                padding: "10px 14px",
                color: theme.textStrong,
                fontWeight: 500,
                background: theme.decisionHighlight,
              }}
            >
              {row[1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
