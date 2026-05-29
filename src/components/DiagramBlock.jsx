import { theme } from "../theme.js";

// A dependency-free visual block. Three variants cover the architectures this
// course teaches:
//   flow  — left-to-right pipeline (Tokenize → Embed → Attention → Output)
//   cycle — like flow, but loops back (agent: Think → Act → Observe → repeat)
//   stack — top-to-bottom layers (the three-layer AI stack)
// Nodes are strings, or { label, detail } for a caption under the box.

function nodeParts(node) {
  return typeof node === "string" ? { label: node, detail: null } : node;
}

function Box({ node, accent }) {
  const { label, detail } = nodeParts(node);
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 96,
        background: theme.surfaceStrong,
        border: `1px solid ${accent}55`,
        borderRadius: theme.radius.lg,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: theme.textStrong,
          fontFamily: theme.font.mono,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
      {detail && (
        <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 4, lineHeight: 1.4 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function Arrow({ vertical, accent, glyph }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        color: accent,
        fontFamily: theme.font.mono,
        fontSize: 16,
        padding: vertical ? "2px 0" : "0 2px",
        textAlign: "center",
        alignSelf: "center",
      }}
    >
      {glyph || (vertical ? "↓" : "→")}
    </div>
  );
}

export function DiagramBlock({ heading, variant = "flow", nodes = [], caption, accent }) {
  const acc = accent || theme.accent.orange;
  const vertical = variant === "stack";

  return (
    <div style={{ margin: "16px 0 24px" }}>
      {heading && (
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
          <span style={{ color: acc }}>◇</span> {heading}
        </div>
      )}
      <div
        style={{
          border: `1px solid ${theme.borderStrong}`,
          borderRadius: theme.radius.xl,
          padding: "18px 16px",
          background: theme.surface,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: vertical ? "column" : "row",
            flexWrap: vertical ? "nowrap" : "wrap",
            alignItems: "stretch",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {nodes.map((node, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: vertical ? "column" : "row",
                alignItems: "stretch",
                flex: vertical ? "0 0 auto" : "1 1 0",
                minWidth: vertical ? "auto" : 96,
              }}
            >
              <Box node={node} accent={acc} />
              {i < nodes.length - 1 && <Arrow vertical={vertical} accent={acc} />}
            </div>
          ))}
        </div>
        {variant === "cycle" && (
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              color: acc,
              fontFamily: theme.font.mono,
              fontSize: 12,
              letterSpacing: 0.5,
            }}
          >
            ↻ repeats until the goal is met or a limit is hit
          </div>
        )}
      </div>
      {caption && (
        <div
          style={{
            fontSize: 13,
            color: theme.textFaint,
            marginTop: 8,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
