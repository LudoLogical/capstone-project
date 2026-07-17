"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";
import { usePersonName } from "@/store/derived";

/** Initials from a person's name, e.g. "Maya Torres" → "MT". */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const signedIn = useAppStore((s) => s.signedIn);
  const onboarded = useAppStore((s) => s.onboarded);
  const signIn = useAppStore((s) => s.signIn);
  const person = usePersonName();

  // Onboarding is the entry point and takes over the full screen; hide the app
  // chrome until it's finished.
  if (hydrated && !onboarded) return null;

  const initials = initialsOf(person);

  // Highlight the nav item matching the current route.
  const navItems = [
    { href: "/", label: "Dashboard", active: pathname === "/" },
    {
      href: "/search",
      label: "Explore",
      active: pathname.startsWith("/search"),
    },
    {
      href: "/account",
      label: "Profile",
      active: pathname.startsWith("/account"),
    },
  ];
  const navClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ${
      active
        ? "bg-accent-tint text-accent-ink"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 flex items-center gap-6 border-b border-border-soft bg-header-bg px-8 py-3.5 backdrop-blur-sm">
      <div
        onClick={() => router.push("/")}
        role="button"
        tabIndex={0}
        title="Back to start"
        className="flex cursor-pointer items-center gap-3"
      >
        <div className="h-8 w-8 rounded-full bg-accent ring-4 ring-glow" />
        <div className="leading-none">
          <div className="text-lg leading-tight font-bold">New Sun Rising</div>
          <div className="text-sm tracking-wide text-ink-muted">
            Vibrancy Portal
          </div>
        </div>
      </div>

      {signedIn && (
        <nav className="ml-2 flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={navClass(item.active)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      {signedIn ? (
        <div className="flex items-center gap-2.5">
          <Link
            href="/account"
            aria-label="Your profile"
            title="Your profile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-accent text-sm font-bold text-white no-underline ring-3 ring-glow"
          >
            {initials}
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
