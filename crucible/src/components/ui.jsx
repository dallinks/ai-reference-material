import { theme } from "../theme.js";

export function Page({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: theme.text, fontFamily: theme.font.serif }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, color = theme.textFaint, style }) {
  return (
    <div
      style={{
        fontFamily: theme.font.mono,
        fontSize: 11,
        letterSpacing: 2.5,
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Label({ children, color = theme.textFaint, style }) {
  return <Eyebrow color={color} style={{ marginBottom: 16, ...style }}>{children}</Eyebrow>;
}

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: `1px solid ${theme.border}`,
  color: theme.textMuted,
  padding: "5px 13px 5px 10px",
  borderRadius: theme.radius.md,
  cursor: "pointer",
  fontFamily: theme.font.mono,
  fontSize: 11.5,
  letterSpacing: 0.5,
};

export function Header({ title, onBack, right, brand }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(11,10,9,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div
        style={{
          maxWidth: theme.maxWidth.wide,
          margin: "0 auto",
          padding: "13px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {onBack && (
          <button className="btn" onClick={onBack} style={backBtnStyle}>
            <span style={{ fontSize: 15, lineHeight: 1, marginTop: -1 }}>‹</span> Back
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          {brand && <span style={{ color: theme.accent.gold, fontSize: 11 }}>◆</span>}
          <span
            style={{
              fontFamily: theme.font.mono,
              fontSize: 12,
              letterSpacing: brand ? 4 : 2,
              color: brand ? theme.textMuted : theme.textFaint,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ marginLeft: "auto" }}>{right}</div>
      </div>
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", accent = theme.accent.gold, disabled, style, title }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: theme.radius.md,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: theme.font.mono,
    fontSize: 11.5,
    fontWeight: 500,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: disabled ? 0.4 : 1,
    whiteSpace: "nowrap",
    ...style,
  };
  if (variant === "primary") {
    return (
      <button
        title={title}
        className="btn btn-primary"
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: accent, border: `1px solid ${accent}`, color: "#15110A", boxShadow: theme.shadow.soft }}
      >
        {children}
      </button>
    );
  }
  if (variant === "ghost") {
    return (
      <button
        title={title}
        className="btn btn-ghost"
        onClick={onClick}
        disabled={disabled}
        style={{ ...base, background: "none", border: `1px solid ${theme.borderMuted}`, color: theme.textMuted }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      title={title}
      className="btn btn-outline"
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, background: `${accent}10`, border: `1px solid ${accent}59`, color: accent }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = theme.accent.gold, solid }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: theme.font.mono,
        fontSize: 9.5,
        fontWeight: 500,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: solid ? "#15110A" : color,
        background: solid ? color : `${color}16`,
        border: `1px solid ${color}${solid ? "" : "44"}`,
        padding: "3px 9px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Bar({ pct, color = theme.accent.gold, height = 5 }) {
  const w = Math.max(0, Math.min(1, pct || 0)) * 100;
  return (
    <div style={{ height, background: "rgba(245,238,225,0.06)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ width: `${w}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}
