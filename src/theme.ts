import type { CSSProperties } from "react";

/** Design tokens lifted directly from the Vibrancy Portal prototype. */
export const C = {
  indigo: "#4f46e5",
  indigoSoft: "#eef2ff",
  indigoBorder: "#e0e7ff",
  indigo700: "#3730a3",
  ink: "#10151f",
  body: "#444c59",
  sub: "#5b6472",
  muted: "#8a93a3",
  faint: "#9aa3b2",
  hairline: "#e6e9ee",
  hairline2: "#eef0f3",
  hairline3: "#f0f2f5",
  bg: "#f4f5f7",
  cardBg: "#fff",
  softBg: "#f7f8fa",
  purple: "#7c3aed",
  green: "#059669",
  greenSoft: "#ecfdf5",
  amber: "#b45309",
  amberSoft: "#fffbeb",
  amberBorder: "#fde9c8",
  red: "#e0603f",
  cyan: "#0e7490",
  cyanSoft: "#ecfeff",
} as const;

export const mono = "'JetBrains Mono', ui-monospace, monospace";

/** Uppercase monospace eyebrow label. */
export function eyebrow(color: string = C.muted): CSSProperties {
  return {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color,
  };
}

export const card: CSSProperties = {
  background: C.cardBg,
  border: `1px solid ${C.hairline}`,
  borderRadius: 16,
  boxShadow: "0 1px 2px rgba(16,21,31,.04)",
};

export const softInset: CSSProperties = {
  border: `1px solid ${C.hairline2}`,
  borderRadius: 12,
  background: "#fbfcfd",
};

export const btn = {
  primary: {
    background: C.indigo,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  } as CSSProperties,
  dark: {
    background: C.ink,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  } as CSSProperties,
  outline: {
    background: "#fff",
    color: C.body,
    border: "1px solid #e2e6ec",
    borderRadius: 10,
    padding: "10px 15px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  } as CSSProperties,
  soft: {
    background: C.indigoSoft,
    color: C.indigo,
    border: `1px solid ${C.indigoBorder}`,
    borderRadius: 10,
    padding: "9px 15px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  } as CSSProperties,
  ghost: {
    background: "none",
    border: "none",
    color: C.sub,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,
};

export const chip: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: C.sub,
  background: "#f1f3f6",
  borderRadius: 20,
  padding: "3px 11px",
};

import type { FitTier } from "./data/presentation";

export function fitBadgeStyle(tier: FitTier): CSSProperties {
  const map: Record<FitTier, { bg: string; fg: string; bd: string }> = {
    strong: { bg: "#ecfdf5", fg: "#047857", bd: "#a7f3d0" },
    possible: { bg: "#eff6ff", fg: "#1d4ed8", bd: "#bfdbfe" },
    stretch: { bg: "#fff7ed", fg: "#b45309", bd: "#fed7aa" },
    awarded: { bg: "#faf5ff", fg: "#7c3aed", bd: "#e9d5ff" },
  };
  const m = map[tier];
  return {
    fontSize: 11,
    fontWeight: 700,
    color: m.fg,
    background: m.bg,
    border: `1px solid ${m.bd}`,
    borderRadius: 20,
    padding: "4px 11px",
    whiteSpace: "nowrap",
  };
}

export function fitLabel(tier: FitTier, score: number | null): string {
  switch (tier) {
    case "strong":
      return `✦ Strong fit · ${score}`;
    case "possible":
      return `✦ Possible fit · ${score}`;
    case "stretch":
      return `✦ Long shot · ${score}`;
    case "awarded":
      return "Awarded";
  }
}

/** Horizontal progress/measure bar fill. */
export function barFill(pct: number, color = C.indigo): CSSProperties {
  return {
    height: "100%",
    width: `${Math.max(0, Math.min(100, pct))}%`,
    background: color,
    borderRadius: 6,
    transition: "width .3s",
  };
}

export function avatarStyle(bg: string, size = 40): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: 11,
    background: bg,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: size < 36 ? 12 : 14,
    flexShrink: 0,
  };
}
