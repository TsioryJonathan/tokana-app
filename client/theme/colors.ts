// Centralized color tokens for cross-platform (RN + Web)
// Keep in sync with CSS variables in app/globals.css
export const COLORS = {
  primary: "#059669", // var(--color-primary)
  bg: "#F8FAFC", // var(--color-bg)
  textMain: "#0F172A", // var(--color-text)
  textMuted: "#64748B", // var(--color-muted)
  textSecondary: "#475569", // slate-600 approx
  textPlaceholder: "#94A3B8", // slate-400
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
} as const;

export type ColorKeys = keyof typeof COLORS;
