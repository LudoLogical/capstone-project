"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

/**
 * Back control. It always reads "Back" and always returns to the page the user
 * was actually just on, by deferring to the browser's own history rather than a
 * route we guess at - guessing is what makes a Back button land somewhere the
 * user has never been.
 *
 * `fallback` is only used when there's no in-app history at all (a fresh load or
 * a deep link), where going "back" would otherwise leave the app entirely.
 */
export default function BackButton({
  fallback = "/",
  className,
}: {
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();
  const canGoBack = useAppStore((s) => s.navCount) > 1;

  return (
    <button
      onClick={() => (canGoBack ? router.back() : router.push(fallback))}
      className={
        className ??
        "mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
      }
    >
      ← Back
    </button>
  );
}
