import type { CSSProperties } from "react";

type P = { size?: number; color?: string; style?: CSSProperties; strokeWidth?: number };

function S({
  size = 16,
  color = "currentColor",
  style,
  strokeWidth = 2,
  children,
}: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  );
}

export const Search = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </S>
);
export const ArrowRight = (p: P) => (
  <S {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </S>
);
export const ArrowLeft = (p: P) => (
  <S {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </S>
);
export const Check = (p: P) => (
  <S strokeWidth={2.6} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
);
export const Chart = (p: P) => (
  <S {...p}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 3 3 5-6" />
  </S>
);
export const Users = (p: P) => (
  <S {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </S>
);
export const Bookmark = (p: P) => (
  <S {...p}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </S>
);
export const Share = (p: P) => (
  <S {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
  </S>
);
export const External = (p: P) => (
  <S {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </S>
);
export const Plus = (p: P) => (
  <S strokeWidth={2.6} {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const Doc = (p: P) => (
  <S {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </S>
);
export const Upload = (p: P) => (
  <S {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </S>
);
export const Edit = (p: P) => (
  <S {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </S>
);
export const ChevDown = (p: P) => (
  <S strokeWidth={2.2} {...p}>
    <path d="m6 9 6 6 6-6" />
  </S>
);
export const ChevRight = (p: P) => (
  <S strokeWidth={2.4} {...p}>
    <path d="m9 18 6-6-6-6" />
  </S>
);
export const Bulb = (p: P) => (
  <S {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2.5h6c0-1.3.5-2 1-2.5A6 6 0 0 0 12 3z" />
  </S>
);
export const Alert = (p: P) => (
  <S strokeWidth={2.2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 9v4M12 17h.01" />
  </S>
);
export const Info = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </S>
);
export const Award = (p: P) => (
  <S {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </S>
);
export const Chat = (p: P) => (
  <S {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </S>
);
export const Refresh = (p: P) => (
  <S {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8" />
    <path d="M3 3v5h5" />
  </S>
);
export const Report = (p: P) => (
  <S {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="m9 15 2 2 4-4" />
  </S>
);
export const Link = (p: P) => (
  <S {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </S>
);
export const Sun = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="30" fill="none" stroke="#4f46e5" strokeWidth="6" />
    <circle cx="50" cy="50" r="9" fill="#4f46e5" />
    <circle cx="50" cy="20" r="4.5" fill="#a5b4fc" />
    <circle cx="80" cy="50" r="4.5" fill="#a5b4fc" />
    <circle cx="50" cy="80" r="4.5" fill="#a5b4fc" />
    <circle cx="20" cy="50" r="4.5" fill="#a5b4fc" />
  </svg>
);
