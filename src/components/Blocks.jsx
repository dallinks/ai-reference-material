import { theme } from "../theme.js";
import { Diagram } from "./Diagram.jsx";

function rich(body) {
  return String(body)
    .split(/(\*\*.*?\*\*|\*[^*]+\*)/g)
    .map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={j} style={{ color: theme.textStrong, fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
        return (
          <em key={j} style={{ fontStyle: "italic", color: theme.text }}>
            {part.slice(1, -1)}
          </em>
        );
      return <span key={j}>{part}</span>;
    });
}

const bodyStyle = { fontSize: 17, lineHeight: 1.8, color: "#CCC3B3", whiteSpace: "pre-line" };

function Text({ heading, body }) {
  return (
    <div style={{ marginBottom: 34 }}>
      {heading && (
        <h2
          style={{
            fontSize: 21,
            fontWeight: 500,
            color: theme.textStrong,
            letterSpacing: "-0.01em",
            margin: "0 0 13px",
            borderLeft: `2px solid ${theme.accent.gold}88`,
            paddingLeft: 16,
          }}
        >
          {heading}
        </h2>
      )}
      <div style={bodyStyle}>{rich(body)}</div>
    </div>
  );
}

function Example({ heading, body }) {
  const c = theme.accent.sage;
  return (
    <div
      style={{
        marginBottom: 34,
        background: `${c}0c`,
        border: `1px solid ${c}30`,
        borderRadius: theme.radius.lg,
        padding: "18px 20px",
      }}
    >
      <div style={{ fontFamily: theme.font.mono, fontSize: 10, letterSpacing: 2, color: c, marginBottom: 10 }}>
        EXAMPLE{heading ? ` · ${heading}` : ""}
      </div>
      <div style={{ ...bodyStyle, fontSize: 16, lineHeight: 1.75 }}>{rich(body)}</div>
    </div>
  );
}

function Callout({ tone = "info", body }) {
  const c = tone === "warn" ? theme.accent.gold : tone === "danger" ? theme.accent.rust : theme.accent.sage;
  return (
    <div
      style={{
        marginBottom: 34,
        background: `${c}10`,
        borderLeft: `2px solid ${c}`,
        padding: "15px 18px",
        fontSize: 16,
        lineHeight: 1.75,
        color: "#CCC3B3",
        whiteSpace: "pre-line",
      }}
    >
      {rich(body)}
    </div>
  );
}

function Code({ heading, code, lang }) {
  return (
    <div style={{ marginBottom: 34 }}>
      {heading && (
        <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.textFaint, marginBottom: 8, letterSpacing: 0.5 }}>
          {heading}
          {lang ? `  ·  ${lang}` : ""}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          background: "rgba(255,250,240,0.025)",
          border: `1px solid ${theme.border}`,
          borderRadius: theme.radius.lg,
          padding: 18,
          overflowX: "auto",
          fontFamily: theme.font.mono,
          fontSize: 13,
          lineHeight: 1.65,
          color: theme.text,
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function Decision({ heading, rows }) {
  return (
    <div style={{ marginBottom: 34 }}>
      {heading && <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.textFaint, marginBottom: 11, letterSpacing: 0.5 }}>{heading}</div>}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: theme.radius.lg, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "flex", borderTop: i ? `1px solid ${theme.border}` : "none" }}>
            <div style={{ flex: 1, padding: "11px 15px", fontSize: 15, color: theme.textMuted, borderRight: `1px solid ${theme.border}` }}>
              {rich(r[0])}
            </div>
            <div style={{ flex: 1, padding: "11px 15px", fontSize: 15, color: theme.text, background: `${theme.accent.gold}07` }}>
              {rich(r[1])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckList({ heading, items }) {
  const c = theme.accent.sage;
  return (
    <div style={{ marginBottom: 34 }}>
      {heading && <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: c, marginBottom: 11, letterSpacing: 0.5 }}>{heading}</div>}
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: "flex", gap: 11, marginBottom: 9, fontSize: 16, lineHeight: 1.65, color: "#CCC3B3" }}>
            <span style={{ color: c, marginTop: 2 }}>◇</span>
            <span>{rich(it)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Theorem-family block: a labelled statement with an inline proof — the bread
// and butter of a rigorous text. `definition` has no ∎ and reads upright; the
// rest are italic statements followed by a proof.
function Theorem({ kind = "theorem", name, statement, proof }) {
  const isDef = kind === "definition";
  const c = isDef ? theme.accent.sage : theme.accent.gold;
  return (
    <div
      style={{
        marginBottom: 34,
        border: `1px solid ${c}2e`,
        borderLeft: `2.5px solid ${c}`,
        borderRadius: theme.radius.lg,
        padding: "17px 20px",
        background: `${c}09`,
      }}
    >
      <div style={{ fontFamily: theme.font.mono, fontSize: 10.5, letterSpacing: 2, color: c, marginBottom: 11, textTransform: "uppercase" }}>
        {kind}
        {name ? ` · ${name}` : ""}
      </div>
      <div style={{ ...bodyStyle, fontSize: 16.5, lineHeight: 1.7, color: theme.textStrong, fontStyle: isDef ? "normal" : "italic" }}>{rich(statement)}</div>
      {proof && (
        <div style={{ marginTop: 15, paddingTop: 13, borderTop: `1px solid ${c}22` }}>
          <span style={{ fontFamily: theme.font.mono, fontSize: 10.5, color: theme.textFaint, letterSpacing: 1.5 }}>PROOF</span>
          <div style={{ ...bodyStyle, fontSize: 15.5, lineHeight: 1.75, marginTop: 7 }}>{rich(proof)}</div>
        </div>
      )}
    </div>
  );
}

const revealBody = {
  margin: "8px 0 2px",
  padding: "11px 15px",
  background: "rgba(255,250,240,0.022)",
  borderLeft: `2px solid ${theme.accent.sage}44`,
  borderRadius: theme.radius.sm,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#C6BDAD",
  whiteSpace: "pre-line",
};

// Exercises block: a textbook-style problem set. Each problem can carry a hint
// and a worked solution, revealed on click (native <details>, no JS state) so
// the reader attempts it first.
function Exercises({ heading = "Exercises", items }) {
  const c = theme.accent.gold;
  return (
    <div style={{ marginBottom: 34, border: `1px solid ${theme.border}`, borderRadius: theme.radius.lg, padding: "18px 20px 20px", background: theme.surface }}>
      <div style={{ fontFamily: theme.font.mono, fontSize: 11, letterSpacing: 2, color: c, marginBottom: 4, textTransform: "uppercase" }}>{heading}</div>
      <ol style={{ margin: 0, padding: "0 0 0 22px", display: "grid", gap: 18 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 16, lineHeight: 1.7, color: "#CCC3B3", paddingLeft: 4 }}>
            <div>{rich(it.prompt)}</div>
            {it.hint && (
              <details className="reveal" style={{ marginTop: 7 }}>
                <summary>Hint</summary>
                <div style={revealBody}>{rich(it.hint)}</div>
              </details>
            )}
            {it.solution && (
              <details className="reveal" style={{ marginTop: 5 }}>
                <summary>Solution</summary>
                <div style={revealBody}>{rich(it.solution)}</div>
              </details>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Blocks({ items }) {
  return items.map((b, i) => {
    if (b.type === "example") return <Example key={i} {...b} />;
    if (b.type === "callout") return <Callout key={i} {...b} />;
    if (b.type === "code") return <Code key={i} {...b} />;
    if (b.type === "decision") return <Decision key={i} {...b} />;
    if (b.type === "checklist") return <CheckList key={i} {...b} />;
    if (b.type === "diagram") return <Diagram key={i} block={b} />;
    if (b.type === "theorem") return <Theorem key={i} {...b} />;
    if (b.type === "exercises") return <Exercises key={i} {...b} />;
    return <Text key={i} {...b} />;
  });
}
