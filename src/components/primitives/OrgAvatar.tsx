"use client";

import { User } from "lucide-react";

// Fixed steps rather than an arbitrary number, so Tailwind sees whole class
// names at build time and the icon stays proportional to the circle.
const SIZES = {
  sm: { box: "h-9 w-9", icon: 18 },
  md: { box: "h-10 w-10", icon: 20 },
  lg: { box: "h-16 w-16", icon: 30 },
} as const;

export type OrgAvatarSize = keyof typeof SIZES;

/**
 * Stand-in profile picture for an organization. Decorative by design: every
 * placement sits next to the org's name, so the icon is hidden from assistive
 * tech rather than repeating it. `className` takes per-placement extras such as
 * the header's ring.
 */
export default function OrgAvatar({
  size = "md",
  className = "",
}: {
  size?: OrgAvatarSize;
  className?: string;
}) {
  const { box, icon } = SIZES[size];
  return (
    <div
      aria-hidden
      className={`flex flex-none items-center justify-center rounded-full bg-accent text-white ${box} ${className}`}
    >
      <User size={icon} />
    </div>
  );
}
