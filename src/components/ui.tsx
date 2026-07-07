import type { CSSProperties, ReactNode } from "react";
import { C, mono, eyebrow as eyebrowStyle, chip as chipStyle } from "../theme";
import { ArrowLeft, Sun } from "./icons";

export function Eyebrow({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return <div style={{ ...eyebrowStyle(color), ...style }}>{children}</div>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span style={chipStyle}>{children}</span>;
}

export function Card({
  children,
  style,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.cardBg,
        border: `1px solid ${C.hairline}`,
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(16,21,31,.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Horizontal progress/measure bar. */
export function Bar({
  pct,
  color = C.indigo,
  track = "#eceff3",
  height = 6,
}: {
  pct: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  return (
    <div style={{ height, background: track, borderRadius: height, overflow: "hidden", flex: 1 }}>
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: color,
          borderRadius: height,
          transition: "width .3s",
        }}
      />
    </div>
  );
}

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "#6b7280",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 14,
      }}
    >
      <ArrowLeft size={14} color="currentColor" strokeWidth={2.2} /> {label}
    </button>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <Sun size={30} />
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontWeight: 800, fontSize: compact ? 15 : 16, letterSpacing: "-.01em" }}>
          New Sun Rising
        </div>
        <div style={{ fontSize: 11.5, color: "#6b7280", fontWeight: 500 }}>Vibrancy Portal</div>
      </div>
    </div>
  );
}

export function SparkTag({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 800,
        letterSpacing: ".06em",
        color: C.indigo,
        background: "#fff",
        border: "1px solid #d6ddfb",
        borderRadius: 6,
        padding: "4px 8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export const monoFont = mono;
