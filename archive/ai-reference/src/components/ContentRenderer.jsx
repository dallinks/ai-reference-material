import { theme } from "../theme.js";
import { CodeBlock } from "./CodeBlock.jsx";
import { Checklist } from "./Checklist.jsx";
import { DecisionTable } from "./DecisionTable.jsx";
import { DiagramBlock } from "./DiagramBlock.jsx";

function TextBlock({ heading, body, accent }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textStrong,
          margin: "0 0 12px",
          borderLeft: `3px solid ${accent}`,
          paddingLeft: 14,
          fontFamily: theme.font.serif,
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: theme.textMuted,
          whiteSpace: "pre-line",
        }}
      >
        {body.split(/(\*\*.*?\*\*|\*[^*]+\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} style={{ color: theme.text, fontWeight: 600 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
              <em key={j} style={{ fontStyle: "italic" }}>
                {part.slice(1, -1)}
              </em>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    </div>
  );
}

export function ContentRenderer({ items, accent }) {
  return items.map((item, i) => {
    if (item.type === "code") {
      return (
        <CodeBlock
          key={i}
          code={item.code}
          lang={item.lang}
          heading={item.heading}
        />
      );
    }
    if (item.type === "checklist") {
      return <Checklist key={i} heading={item.heading} items={item.items} />;
    }
    if (item.type === "decision") {
      return <DecisionTable key={i} heading={item.heading} rows={item.rows} />;
    }
    if (item.type === "diagram") {
      return (
        <DiagramBlock
          key={i}
          heading={item.heading}
          variant={item.variant}
          nodes={item.nodes}
          caption={item.caption}
          accent={accent}
        />
      );
    }
    return (
      <TextBlock key={i} heading={item.heading} body={item.body} accent={accent} />
    );
  });
}
