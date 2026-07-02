// Consistency heatmap — a contribution-style grid of study days. Pure
// presentation: all the date math lives in lib/streak.js (heatmapWeeks); this
// just paints levels on the Editorial/Ink sage ramp. Today wears a gold ring.

import { theme } from "../theme.js";
import { heatmapWeeks } from "../lib/streak.js";

const RAMP = [
  "rgba(245,238,225,0.05)", // 0 — blank day
  "rgba(127,181,155,0.22)",
  "rgba(127,181,155,0.42)",
  "rgba(127,181,155,0.66)",
  "rgba(127,181,155,0.95)", // 4 — heavy day
];

const capStyle = {
  fontFamily: theme.font.mono,
  fontSize: 10,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: theme.textFaintest,
};

export function Heatmap({ log, today, weeks = 26, cell = 11, gap = 3 }) {
  const cols = heatmapWeeks(log, today, weeks);
  return (
    <div>
      <div style={{ display: "flex", gap, overflowX: "auto", paddingBottom: 2 }}>
        {cols.map((col, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap }}>
            {col.map((c) => (
              <div
                key={c.date}
                title={c.future ? undefined : `${c.date} · ${c.count} action${c.count === 1 ? "" : "s"}`}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 3,
                  background: RAMP[c.level],
                  visibility: c.future ? "hidden" : "visible",
                  boxShadow: c.isToday ? `0 0 0 1px ${theme.accent.gold}` : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
        <span style={capStyle}>last {weeks} weeks</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={capStyle}>less</span>
          {RAMP.map((bg, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 2, background: bg, display: "inline-block" }} />
          ))}
          <span style={capStyle}>more</span>
        </div>
      </div>
    </div>
  );
}
