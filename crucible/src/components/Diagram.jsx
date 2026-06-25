// Diagram block — declarative, zero-dependency figures rendered to hand-built
// SVG in the Editorial/Ink palette. Three kinds, each chosen because it carries
// a *rigorous* artifact that prose can only gesture at:
//
//   recursion — a recursion tree with explicit per-level work accounting
//               (the visual proof of a Master-Theorem bound, not a hand-wave).
//   graph     — positioned node-link: flow networks (f/c), weighted graphs,
//               BSTs, quorum/CAP topologies. Authors give x,y in 0..100.
//   sequence  — message/timeline: the Gilbert-Lynch CAP execution, Lamport
//               happens-before, quorum reads, consensus rounds.
//
// The renderer faithfully transcribes author-provided structure; it never
// computes the math. Correctness lives in the course (which is verified);
// this file only draws it. Validation of shape lives in lib/schema.js.

import { theme } from "../theme.js";

const VBW = 680; // viewBox width ≈ render px, so font sizes read like px

function toneColor(t) {
  switch (t) {
    case "gold": return theme.accent.gold;
    case "sage": return theme.accent.sage;
    case "ember": return theme.accent.ember;
    case "rust": return theme.accent.rust;
    case "blue": return theme.accent.blue;
    case "violet": return theme.accent.violet;
    case "muted": return theme.textFaint;
    default: return theme.textMuted;
  }
}

function Figure({ caption, label, height, children }) {
  return (
    <figure
      style={{
        margin: "0 0 34px",
        padding: "20px 18px 14px",
        background: "rgba(245,238,225,0.022)",
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius.lg,
      }}
    >
      <svg
        viewBox={`0 0 ${VBW} ${height}`}
        width="100%"
        style={{ height: "auto", display: "block", overflow: "visible" }}
        role="img"
        aria-label={caption || label}
      >
        {children}
      </svg>
      {caption && (
        <figcaption
          style={{
            marginTop: 14,
            paddingTop: 11,
            borderTop: `1px solid ${theme.border}`,
            fontFamily: theme.font.mono,
            fontSize: 11.5,
            lineHeight: 1.6,
            color: theme.textFaint,
            letterSpacing: 0.2,
          }}
        >
          <span style={{ color: theme.accent.gold, marginRight: 8, letterSpacing: 1 }}>FIG</span>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function spread(count, left, right) {
  if (count <= 1) return [(left + right) / 2];
  const xs = [];
  for (let i = 0; i < count; i++) xs.push(left + ((right - left) * (i + 0.5)) / count);
  return xs;
}

// ── recursion tree ───────────────────────────────────────────────────────────
function Recursion({ levels, total, caption }) {
  const treeL = 26, treeR = 404, sepX = 438, gutterX = 456;
  const padTop = 30, rowH = 58;
  const H = padTop + (levels.length - 1) * rowH + (total ? 70 : 30);
  const cyOf = (i) => padTop + i * rowH;
  const drawCount = (lv) => (lv.ellipsis ? 0 : lv.draw ?? (typeof lv.n === "number" ? Math.min(lv.n, 8) : 6));
  const xsOf = (lv) => spread(drawCount(lv), treeL, treeR);

  const els = [];

  // edges (under nodes): connect each child to its parent by proportional index
  for (let i = 1; i < levels.length; i++) {
    const cur = levels[i], prev = levels[i - 1];
    if (cur.ellipsis || prev.ellipsis) continue;
    const P = xsOf(prev), C = xsOf(cur);
    const yP = cyOf(i - 1) + 8, yC = cyOf(i) - 8;
    C.forEach((cx, k) => {
      const pi = Math.floor((k * P.length) / C.length);
      els.push(<line key={`e${i}-${k}`} x1={P[pi]} y1={yP} x2={cx} y2={yC} stroke={theme.borderStrong} strokeWidth="1" />);
    });
  }

  // gutter separator
  els.push(
    <line key="sep" x1={sepX} y1={padTop - 16} x2={sepX} y2={cyOf(levels.length - 1) + 16}
      stroke={theme.border} strokeWidth="1" strokeDasharray="3 4" />
  );

  levels.forEach((lv, i) => {
    const cy = cyOf(i);
    if (lv.ellipsis) {
      els.push(<text key={`v${i}`} x={(treeL + treeR) / 2} y={cy + 5} textAnchor="middle" fontFamily={theme.font.mono} fontSize="19" fill={theme.textFaint}>⋮</text>);
    } else {
      const xs = xsOf(lv);
      const c = toneColor(lv.tone || (lv.leaf ? "sage" : "gold"));
      xs.forEach((x, k) => els.push(<circle key={`n${i}-${k}`} cx={x} cy={cy} r="7" fill={`${c}1f`} stroke={c} strokeWidth="1.4" />));
      if (lv.each && xs.length <= 3)
        xs.forEach((x, k) => els.push(<text key={`nl${i}-${k}`} x={x} y={cy - 13} textAnchor="middle" fontFamily={theme.font.mono} fontSize="11" fill={theme.textMuted}>{lv.each}</text>));
      if (lv.leaf && lv.leafLabel)
        els.push(<text key={`ll${i}`} x={treeR + 8} y={cy + 4} textAnchor="start" fontFamily={theme.font.mono} fontSize="10.5" fill={theme.textFaint}>{lv.leafLabel}</text>);
    }
    // gutter: the work accounting that makes the bound rigorous
    const acct = lv.ellipsis ? "⋮" : `${lv.n != null ? lv.n + " × " : ""}${lv.each || ""}`;
    els.push(<text key={`g${i}`} x={gutterX} y={cy + 3} textAnchor="start" fontFamily={theme.font.mono} fontSize="12" fill={theme.textMuted}>{acct}</text>);
    if (lv.row != null)
      els.push(<text key={`gr${i}`} x={VBW - 12} y={cy + 3} textAnchor="end" fontFamily={theme.font.mono} fontSize="12.5" fill={theme.accent.goldSoft}>= {lv.row}</text>);
  });

  if (total) {
    const ly = cyOf(levels.length - 1) + 28;
    els.push(<line key="tl" x1={gutterX} y1={ly} x2={VBW - 12} y2={ly} stroke={theme.borderStrong} strokeWidth="1" />);
    els.push(<text key="tlab" x={gutterX} y={ly + 21} textAnchor="start" fontFamily={theme.font.mono} fontSize="11" fill={theme.textFaint}>total work</text>);
    els.push(<text key="ttot" x={VBW - 12} y={ly + 21} textAnchor="end" fontFamily={theme.font.mono} fontSize="13.5" fill={theme.accent.gold}>Σ = {total}</text>);
  }

  return <Figure caption={caption} label="recursion tree" height={H}>{els}</Figure>;
}

// ── graph (explicit positions) ───────────────────────────────────────────────
function Graph({ nodes, edges = [], directed = false, height = 340, caption }) {
  const byId = {};
  nodes.forEach((n) => { byId[n.id] = n; });
  const PX = 56, PY = 36, R = 19;
  const mapX = (x) => PX + (x / 100) * (VBW - 2 * PX);
  const mapY = (y) => PY + (y / 100) * (height - 2 * PY);

  const els = [];

  edges.forEach((e, i) => {
    const a = byId[e.from], b = byId[e.to];
    if (!a || !b) return;
    const ax = mapX(a.x), ay = mapY(a.y), bx = mapX(b.x), by = mapY(b.y);
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const px = -uy, py = ux; // perpendicular
    const rA = (a.r ?? R) + 2, rB = (b.r ?? R) + 2;
    const Ap = { x: ax + ux * rA, y: ay + uy * rA };
    const Bp = { x: bx - ux * rB, y: by - uy * rB };
    const dir = e.directed ?? directed;
    const end = dir ? { x: Bp.x - ux * 9, y: Bp.y - uy * 9 } : Bp;
    const c = toneColor(e.tone || "muted");
    els.push(<line key={`ed${i}`} x1={Ap.x} y1={Ap.y} x2={end.x} y2={end.y} stroke={c} strokeWidth={e.bold ? 2.2 : 1.5} strokeDasharray={e.dashed ? "5 4" : undefined} />);
    if (dir)
      els.push(<polygon key={`ah${i}`} points={`${Bp.x},${Bp.y} ${end.x + px * 5},${end.y + py * 5} ${end.x - px * 5},${end.y - py * 5}`} fill={c} />);
    if (e.label != null) {
      const mx = (ax + bx) / 2 + px * 12, my = (ay + by) / 2 + py * 12;
      const w = 11 + String(e.label).length * 7;
      els.push(<rect key={`lr${i}`} x={mx - w / 2} y={my - 10} width={w} height="18" rx="4" fill={theme.bg} opacity="0.9" />);
      els.push(<text key={`lt${i}`} x={mx} y={my + 3} textAnchor="middle" fontFamily={theme.font.mono} fontSize="11.5" fill={e.tone ? c : theme.textMuted}>{e.label}</text>);
    }
  });

  nodes.forEach((n, i) => {
    const x = mapX(n.x), y = mapY(n.y), r = n.r ?? R;
    const c = toneColor(n.tone);
    els.push(<circle key={`gc${i}`} cx={x} cy={y} r={r} fill={`${c}1c`} stroke={c} strokeWidth="1.6" />);
    els.push(<text key={`gl${i}`} x={x} y={y + 4.5} textAnchor="middle" fontFamily={theme.font.mono} fontSize="13" fill={theme.textStrong}>{n.label}</text>);
    if (n.sub)
      els.push(<text key={`gs${i}`} x={x} y={y + r + 14} textAnchor="middle" fontFamily={theme.font.mono} fontSize="10.5" fill={theme.textFaint}>{n.sub}</text>);
  });

  return <Figure caption={caption} label="graph" height={height}>{els}</Figure>;
}

// ── sequence (message timeline) ──────────────────────────────────────────────
function Sequence({ actors, messages, caption }) {
  const pad = 30, headY = 14, headH = 32, msgTop = headY + headH + 28, msgH = 46;
  const laneW = (VBW - 2 * pad) / actors.length;
  const laneX = (a) => pad + laneW * (a + 0.5);
  const idx = (name) => actors.indexOf(name);
  const H = msgTop + (messages.length - 1) * msgH + 30;
  const lifeBottom = H - 14;

  const els = [];

  actors.forEach((name, a) => {
    const x = laneX(a);
    els.push(<line key={`lf${a}`} x1={x} y1={headY + headH} x2={x} y2={lifeBottom} stroke={theme.border} strokeWidth="1" strokeDasharray="2 5" />);
    els.push(<rect key={`hd${a}`} x={x - laneW * 0.42} y={headY} width={laneW * 0.84} height={headH} rx="7" fill="rgba(245,238,225,0.045)" stroke={theme.borderStrong} strokeWidth="1" />);
    els.push(<text key={`hl${a}`} x={x} y={headY + headH / 2 + 4.5} textAnchor="middle" fontFamily={theme.font.mono} fontSize="12" fill={theme.textStrong}>{name}</text>);
  });

  messages.forEach((m, i) => {
    const y = msgTop + i * msgH;
    if (m.note) {
      const cx = m.at != null ? laneX(idx(m.at)) : VBW / 2;
      const w = Math.min(420, 26 + String(m.note).length * 6.8);
      els.push(<rect key={`nr${i}`} x={cx - w / 2} y={y - 13} width={w} height="25" rx="5" fill={`${theme.accent.gold}14`} stroke={`${theme.accent.gold}55`} strokeWidth="1" />);
      els.push(<text key={`nt${i}`} x={cx} y={y + 4} textAnchor="middle" fontFamily={theme.font.mono} fontSize="11" fill={theme.accent.goldSoft}>{m.note}</text>);
      return;
    }
    const fa = idx(m.from), ta = idx(m.to);
    const c = toneColor(m.tone || "sage");
    if (fa === ta) {
      const x = laneX(fa);
      els.push(<path key={`sp${i}`} d={`M ${x} ${y - 8} h 28 v 16 h -28`} fill="none" stroke={c} strokeWidth="1.5" strokeDasharray={m.dashed ? "5 4" : undefined} />);
      els.push(<polygon key={`sa${i}`} points={`${x},${y + 8} ${x + 8},${y + 4.5} ${x + 8},${y + 11.5}`} fill={c} />);
      els.push(<text key={`stx${i}`} x={x + 36} y={y + 3} textAnchor="start" fontFamily={theme.font.mono} fontSize="11" fill={theme.textMuted}>{m.label}</text>);
      return;
    }
    const x1 = laneX(fa), x2 = laneX(ta), fwd = x2 > x1, d = fwd ? 1 : -1;
    els.push(<line key={`ml${i}`} x1={x1} y1={y} x2={x2 - d * 7} y2={y} stroke={c} strokeWidth="1.6" strokeDasharray={m.dashed ? "5 4" : undefined} />);
    els.push(<polygon key={`ma${i}`} points={`${x2},${y} ${x2 - d * 8},${y - 4.5} ${x2 - d * 8},${y + 4.5}`} fill={c} />);
    els.push(<text key={`mt${i}`} x={(x1 + x2) / 2} y={y - 8} textAnchor="middle" fontFamily={theme.font.mono} fontSize="11.5" fill={theme.text}>{m.label}</text>);
    if (m.tick != null)
      els.push(<text key={`mk${i}`} x={x1 + d * 7} y={y + 14} textAnchor={fwd ? "start" : "end"} fontFamily={theme.font.mono} fontSize="10" fill={theme.accent.gold}>{m.tick}</text>);
  });

  return <Figure caption={caption} label="sequence" height={H}>{els}</Figure>;
}

export function Diagram({ block }) {
  switch (block.kind) {
    case "recursion": return <Recursion {...block} />;
    case "graph": return <Graph {...block} />;
    case "sequence": return <Sequence {...block} />;
    default: return null;
  }
}
