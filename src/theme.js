// Design tokens. Use these instead of hardcoding hex codes / fonts in components.

export const theme = {
  // Surfaces
  bg: "#0A0A0F",
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.05)",
  surfaceStrong: "rgba(255,255,255,0.04)",
  overlay: "rgba(10,10,15,0.94)",

  // Borders
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.08)",
  borderMuted: "rgba(255,255,255,0.1)",

  // Text
  text: "#E8E6E1",
  textStrong: "#F5F3EF",
  textMuted: "#B8B5AE",
  textDim: "#999",
  textFaint: "#777",
  textFainter: "#666",
  textFaintest: "#555",
  textDimmest: "#444",

  // Accents — module colors + semantic content-type colors
  accent: {
    orange: "#FF6B35", // m1 / code-blocks heading / brand
    teal: "#00D4AA",   // m2 / checklist
    purple: "#7B61FF", // m3 / code tag
    pink: "#FF3366",   // m4 / progress gradient end
    yellow: "#FFB800", // m5 / decision tag
    blue: "#00B4D8",   // m6
    violet: "#E040FB", // m7
    cyan: "#26C6DA",   // m8
    coral: "#FF8A65",  // m9
  },

  // Content-type chip tints (used in lesson cards + search results)
  chip: {
    code: { fg: "#7B61FF", bg: "rgba(123,97,255,0.1)" },
    checklist: { fg: "#00D4AA", bg: "rgba(0,212,170,0.1)" },
    decision: { fg: "#FFB800", bg: "rgba(255,184,0,0.1)" },
    neutral: { fg: "#888", bg: "rgba(255,255,255,0.04)" },
  },

  // Checklist box tint
  checklistBox: {
    bg: "rgba(0,212,170,0.04)",
    border: "rgba(0,212,170,0.12)",
  },

  // Decision row tint (right column)
  decisionHighlight: "rgba(255,180,0,0.03)",

  // Fonts
  font: {
    serif: "'Georgia',serif",
    mono: "'Courier New',monospace",
  },

  // Layout
  maxWidth: { content: 740, home: 900, search: 500, progress: 260 },
  radius: { sm: 3, md: 4, lg: 6, xl: 8, xxl: 10 },
};
