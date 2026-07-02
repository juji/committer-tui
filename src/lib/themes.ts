/**
 * Theme registry for committer-tui.
 * Each theme is a complete color palette across all UI surfaces.
 */

export interface Theme {
  bg: {
    base: string;
    surface: string;
    elevated: string;
    card: string;
    hover: string;
    border: string;
    borderLight: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    dim: string;
  };
  accent: {
    cyan: string;
    cyanDim: string;
    purple: string;
    purpleDim: string;
    blue: string;
    blueDim: string;
  };
  semantic: {
    success: string;
    successBg: string;
    error: string;
    errorBg: string;
    warning: string;
    warningBg: string;
    info: string;
    infoBg: string;
  };
  focus: {
    border: string;
    bg: string;
    text: string;
  };
  scrollbar: {
    track: string;
    thumb: string;
    thumbHover: string;
  };
  border: {
    subtle: string;
    default: string;
    prominent: string;
  };
  overlay: string;
}

/*
 * Midnight Aurora
 * Deep midnight base with cyan/purple accents — moody and modern.
 */
const midnightAurora: Theme = {
  bg: { base: "#0a0a0f", surface: "#12121a", elevated: "#1a1a26", card: "#1e1e2e", hover: "#252538", border: "#2a2a3e", borderLight: "#3a3a52" },
  text: { primary: "#e2e8f0", secondary: "#94a3b8", muted: "#64748b", dim: "#475569" },
  accent: { cyan: "#22d3ee", cyanDim: "#0891b2", purple: "#a78bfa", purpleDim: "#7c3aed", blue: "#60a5fa", blueDim: "#2563eb" },
  semantic: { success: "#22c55e", successBg: "#052e16", error: "#ef4444", errorBg: "#450a0a", warning: "#f59e0b", warningBg: "#451a03", info: "#38bdf8", infoBg: "#0c1929" },
  focus: { border: "#22d3ee", bg: "#1a2a3e", text: "#e2e8f0" },
  scrollbar: { track: "#1a1a26", thumb: "#3a3a52", thumbHover: "#4a4a62" },
  border: { subtle: "#1e1e2e", default: "#2a2a3e", prominent: "#3a3a52" },
  overlay: "rgba(0, 0, 0, 0.7)",
};

/*
 * Nordic Frost
 * Inspired by the Nord palette — cool arctic blues, teals, and frosty whites.
 */
const nordicFrost: Theme = {
  bg: { base: "#0e1215", surface: "#1a1f24", elevated: "#242c33", card: "#2e3840", hover: "#38434d", border: "#3d4a54", borderLight: "#4d5c68" },
  text: { primary: "#e5e9f0", secondary: "#a9b8c8", muted: "#7b8b9e", dim: "#5d6f82" },
  accent: { cyan: "#7ac4c4", cyanDim: "#4a9e9e", purple: "#b48ead", purpleDim: "#8f5e8a", blue: "#81a1c1", blueDim: "#5e81ac" },
  semantic: { success: "#a3be8c", successBg: "#1e2a1e", error: "#bf616a", errorBg: "#3a1a1a", warning: "#ebcb8b", warningBg: "#3a3018", info: "#88c0d0", infoBg: "#10242a" },
  focus: { border: "#7ac4c4", bg: "#1a2e36", text: "#e5e9f0" },
  scrollbar: { track: "#1a1f24", thumb: "#3d4a54", thumbHover: "#4d5c68" },
  border: { subtle: "#2e3840", default: "#3d4a54", prominent: "#4d5c68" },
  overlay: "rgba(0, 0, 0, 0.65)",
};

/*
 * Sunset Magma
 * Warm volcanic tones — deep reds, oranges, and amber highlights.
 */
const sunsetMagma: Theme = {
  bg: { base: "#0f0808", surface: "#1c1110", elevated: "#2a1814", card: "#33201a", hover: "#3d2820", border: "#4a3028", borderLight: "#5a3d33" },
  text: { primary: "#f0e2d8", secondary: "#c4a89a", muted: "#9d7a6a", dim: "#7a5c4d" },
  accent: { cyan: "#f59e0b", cyanDim: "#d97706", purple: "#fb923c", purpleDim: "#ea580c", blue: "#f97316", blueDim: "#c2410c" },
  semantic: { success: "#34d399", successBg: "#0a2a1a", error: "#ef4444", errorBg: "#3a0a0a", warning: "#fbbf24", warningBg: "#3a2a00", info: "#60a5fa", infoBg: "#0a1a30" },
  focus: { border: "#fb923c", bg: "#2a1a14", text: "#f0e2d8" },
  scrollbar: { track: "#1c1110", thumb: "#4a3028", thumbHover: "#5a3d33" },
  border: { subtle: "#33201a", default: "#4a3028", prominent: "#5a3d33" },
  overlay: "rgba(0, 0, 0, 0.7)",
};

/*
 * Forest Canopy
 * Deep earthy greens with warm brown accents — natural and grounded.
 */
const forestCanopy: Theme = {
  bg: { base: "#0a0e0a", surface: "#111811", elevated: "#1a241a", card: "#222e22", hover: "#2a3a2a", border: "#334833", borderLight: "#405a40" },
  text: { primary: "#d4e0d4", secondary: "#a0b8a0", muted: "#7a947a", dim: "#5c725c" },
  accent: { cyan: "#6ee7b7", cyanDim: "#34d399", purple: "#a78bfa", purpleDim: "#7c3aed", blue: "#60a5fa", blueDim: "#3b82f6" },
  semantic: { success: "#4ade80", successBg: "#0a2a14", error: "#ef4444", errorBg: "#3a0a0a", warning: "#fbbf24", warningBg: "#3a2a00", info: "#38bdf8", infoBg: "#0a1a28" },
  focus: { border: "#6ee7b7", bg: "#142a1e", text: "#d4e0d4" },
  scrollbar: { track: "#111811", thumb: "#334833", thumbHover: "#405a40" },
  border: { subtle: "#222e22", default: "#334833", prominent: "#405a40" },
  overlay: "rgba(0, 0, 0, 0.65)",
};

/*
 * Monochrome Minimal
 * Clean grayscale palette — focused and distraction-free.
 */
const monochromeMinimal: Theme = {
  bg: { base: "#080808", surface: "#101010", elevated: "#181818", card: "#202020", hover: "#282828", border: "#333333", borderLight: "#404040" },
  text: { primary: "#e0e0e0", secondary: "#a0a0a0", muted: "#707070", dim: "#505050" },
  accent: { cyan: "#d0d0d0", cyanDim: "#909090", purple: "#c0c0c0", purpleDim: "#808080", blue: "#b0b0b0", blueDim: "#707070" },
  semantic: { success: "#a0a0a0", successBg: "#181818", error: "#e0e0e0", errorBg: "#202020", warning: "#c0c0c0", warningBg: "#1a1a1a", info: "#b0b0b0", infoBg: "#141414" },
  focus: { border: "#ffffff", bg: "#1a1a1a", text: "#ffffff" },
  scrollbar: { track: "#101010", thumb: "#333333", thumbHover: "#404040" },
  border: { subtle: "#202020", default: "#333333", prominent: "#404040" },
  overlay: "rgba(0, 0, 0, 0.8)",
};

/*
 * Cyber Wave
 * Neon cyberpunk — electric magenta, cyan, and deep indigo.
 */
const cyberWave: Theme = {
  bg: { base: "#0a0a14", surface: "#12101e", elevated: "#1a1828", card: "#22203a", hover: "#2a284a", border: "#3a307a", borderLight: "#4a40a0" },
  text: { primary: "#e0d8f0", secondary: "#a898d0", muted: "#7a6aaa", dim: "#5a4a8a" },
  accent: { cyan: "#22d3ee", cyanDim: "#0891b2", purple: "#d946ef", purpleDim: "#a21caf", blue: "#818cf8", blueDim: "#4f46e5" },
  semantic: { success: "#4ade80", successBg: "#0a2a14", error: "#f43f5e", errorBg: "#3a0a14", warning: "#fbbf24", warningBg: "#3a2a00", info: "#38bdf8", infoBg: "#0a1a30" },
  focus: { border: "#d946ef", bg: "#2a1050", text: "#e0d8f0" },
  scrollbar: { track: "#12101e", thumb: "#3a307a", thumbHover: "#4a40a0" },
  border: { subtle: "#22203a", default: "#3a307a", prominent: "#4a40a0" },
  overlay: "rgba(0, 0, 0, 0.75)",
};

export const themes: Record<string, Theme> = {
  "midnight-aurora": midnightAurora,
  "nordic-frost": nordicFrost,
  "sunset-magma": sunsetMagma,
  "forest-canopy": forestCanopy,
  "monochrome-minimal": monochromeMinimal,
  "cyber-wave": cyberWave,
};

export const themeNames: string[] = Object.keys(themes);

export function getTheme(name: string): Theme {
  return (name in themes ? themes[name] : themes["midnight-aurora"])!;
}

export const DEFAULT_THEME = "midnight-aurora";