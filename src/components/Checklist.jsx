import { theme } from "../theme.js";

export function Checklist({ heading, items }) {
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
        <span style={{ color: theme.accent.teal }}>☐</span> {heading}
      </div>
      <div
        style={{
          background: theme.checklistBox.bg,
          border: `1px solid ${theme.checklistBox.border}`,
          borderRadius: theme.radius.xl,
          padding: "12px 16px",
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "6px 0",
              fontSize: 14,
              lineHeight: 1.5,
              color: theme.textMuted,
            }}
          >
            <span
              style={{
                color: theme.accent.teal,
                flexShrink: 0,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              ▸
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
