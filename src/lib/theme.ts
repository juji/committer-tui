/**
 * Midnight Aurora — a cohesive dark theme for committer-tui.
 *
 * Inspired by modern code editors and terminal aesthetics.
 * Uses a deep midnight base with cyan/purple accents.
 */

export const theme = {
  /** Base background — the darkest layer */
  bg: {
    base: "#0a0a0f",
    surface: "#12121a",
    elevated: "#1a1a26",
    card: "#1e1e2e",
    hover: "#252538",
    border: "#2a2a3e",
    borderLight: "#3a3a52",
  },

  /** Text hierarchy */
  text: {
    primary: "#e2e8f0",
    secondary: "#94a3b8",
    muted: "#64748b",
    dim: "#475569",
  },

  /** Accent colors */
  accent: {
    cyan: "#22d3ee",
    cyanDim: "#0891b2",
    purple: "#a78bfa",
    purpleDim: "#7c3aed",
    blue: "#60a5fa",
    blueDim: "#2563eb",
  },

  /** Semantic colors */
  semantic: {
    success: "#22c55e",
    successBg: "#052e16",
    error: "#ef4444",
    errorBg: "#450a0a",
    warning: "#f59e0b",
    warningBg: "#451a03",
    info: "#38bdf8",
    infoBg: "#0c1929",
  },

  /** Focus / selection */
  focus: {
    border: "#22d3ee",
    bg: "#1a2a3e",
    text: "#e2e8f0",
  },

  /** Scrollbar */
  scrollbar: {
    track: "#1a1a26",
    thumb: "#3a3a52",
    thumbHover: "#4a4a62",
  },

  /** Borders */
  border: {
    subtle: "#1e1e2e",
    default: "#2a2a3e",
    prominent: "#3a3a52",
  },

  /** Overlay / backdrop */
  overlay: "rgba(0, 0, 0, 0.7)",
} as const;

export type Theme = typeof theme;