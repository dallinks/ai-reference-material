// Design tokens — "Editorial / Ink": a warm ink-black canvas, paper-white text,
// brass-gold as the mastery accent, and a small refined accent set. Newsreader
// (display serif) + IBM Plex Mono (labels). Component code reads these tokens;
// global polish (vignette, scrollbars, hovers, motion) lives in styles.css.

export const theme = {
  bg: "#0B0A09",

  surface: "rgba(245,238,225,0.022)",
  surfaceHover: "rgba(245,238,225,0.05)",
  surfaceStrong: "rgba(245,238,225,0.04)",

  border: "rgba(231,210,165,0.10)",
  borderStrong: "rgba(231,210,165,0.18)",
  borderMuted: "rgba(231,210,165,0.14)",

  // Warm paper-white text ramp
  text: "#DBD3C5",
  textStrong: "#F4EEE1",
  textMuted: "#A69E8E",
  textDim: "#928A78",
  textFaint: "#7C7466",
  textFainter: "#645D52",
  textFaintest: "#4E4840",
  textDimmest: "#3A352E",

  accent: {
    gold: "#D8A94A", // brand + mastery
    goldSoft: "#E8C478",
    sage: "#7FB59B", // open / correct / in-progress
    ember: "#CC6B3E", // reviews due
    rust: "#C45A4E", // wrong
    // legacy aliases so older references resolve to the new palette
    orange: "#CC6B3E",
    teal: "#7FB59B",
    yellow: "#D8A94A",
    purple: "#9385C9",
    pink: "#C45A4E",
    blue: "#6E8CA8",
    violet: "#9385C9",
  },

  status: {
    locked: "#6B6457",
    lockedBg: "rgba(245,238,225,0.014)",
    open: "#7FB59B",
    openBg: "rgba(127,181,155,0.08)",
    passed: "#D8A94A",
    passedBg: "rgba(216,169,74,0.09)",
    due: "#CC6B3E",
    dueBg: "rgba(204,107,62,0.10)",
  },

  quiz: {
    correct: { fg: "#90C1A8", bg: "rgba(127,181,155,0.14)", border: "rgba(127,181,155,0.5)" },
    wrong: { fg: "#D7867A", bg: "rgba(196,90,78,0.14)", border: "rgba(196,90,78,0.5)" },
  },

  shadow: {
    soft: "0 1px 2px rgba(0,0,0,0.45)",
    card: "0 1px 2px rgba(0,0,0,0.5), 0 16px 44px -18px rgba(0,0,0,0.6)",
    gold: "0 0 0 1px rgba(216,169,74,0.22), 0 18px 50px -16px rgba(216,169,74,0.16)",
  },

  font: {
    serif: "'Newsreader', Georgia, 'Times New Roman', serif",
    mono: "'IBM Plex Mono', ui-monospace, 'Courier New', monospace",
  },

  maxWidth: { content: 720, wide: 980 },
  radius: { sm: 4, md: 7, lg: 11, xl: 14, xxl: 18 },
};
