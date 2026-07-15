"use client";

import { useRouter } from "next/navigation";
import { useBackTarget } from "@/store/derived";

/**
 * Back control that returns to the page the user actually came from (tracked by
 * NavTracker), labelling itself "Back to [that page]". Falls back to `fallback`
 * when there's no history yet, e.g. on a fresh load or a deep link.
 */
export default function BackButton({
  fallback = "/",
  className,
}: {
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();
  const { href, label } = useBackTarget(fallback);
  return (
    <button
      onClick={() => router.push(href)}
      className={
        className ??
        "mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
      }
    >
      ← Back to {label}
    </button>
  );
}
