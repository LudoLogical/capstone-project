"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";
import { SESSION_USER } from "@/data/seed";

export default function AppHeader() {
  const router = useRouter();
  const hydrated = useHydrated();
  const signedIn = useAppStore((s) => s.signedIn);
  const onboarded = useAppStore((s) => s.onboarded);
  const signIn = useAppStore((s) => s.signIn);

  // Onboarding takes over the full screen; hide the app chrome to match.
  if (hydrated && signedIn && !onboarded) return null;

  return (
    <header className="sticky top-0 z-40 flex items-center gap-6 border-b border-border-soft bg-header-bg px-8 py-3.5 backdrop-blur-sm">
      <div
        onClick={() => router.push("/")}
        role="button"
        tabIndex={0}
        title="Back to start"
        className="flex cursor-pointer items-center gap-3"
      >
        <div className="h-8 w-8 rounded-full bg-radial from-accent-warm to-accent to-70% ring-4 ring-glow" />
        <div className="leading-none">
          <div className="text-sm leading-none font-bold">New Sun Rising</div>
          <div className="text-xs tracking-wide text-ink-muted">
            Vibrancy Portal
          </div>
        </div>
      </div>

      {signedIn && (
        <nav className="ml-2 flex gap-1">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Explore
          </Link>
          <Link
            href="/account"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Profile
          </Link>
        </nav>
      )}

      <div className="flex-1" />

      {signedIn ? (
        <div className="flex items-center gap-2.5">
          <Link
            href="/account"
            aria-label="Your profile"
            title="Your profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-radial from-accent-warm to-accent to-70% text-sm font-bold text-white no-underline ring-3 ring-glow"
          >
            {SESSION_USER.initials}
          </Link>
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="px-2.5 py-2 text-sm font-medium text-ink-muted enabled:hover:text-ink"
        >
          Sign in
        </button>
      )}
    </header>
  );
}
