"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import OrgAvatar from "@/components/primitives/OrgAvatar";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const onboarded = useAppStore((s) => s.onboarded);

  // Onboarding takes over the full screen and carries its own brand mark, so
  // the app chrome stays out of the way: on the onboarding route itself, and on
  // any route an unonboarded user is about to be redirected away from.
  if (pathname === "/onboarding") return null;
  if (!hydrated || !onboarded) return null;

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
  // Hover fills a soft peach tint and shifts the label to accent ink, so the
  // pointer target is never signalled by color alone. The current tab keeps the
  // fuller tint, which stays distinct from the hover wash.
  const navClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ${
      active
        ? "bg-accent-tint text-accent-ink"
        : "text-ink-muted hover:bg-accent-tint-soft hover:text-accent-ink"
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

      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        <Link
          href="/account"
          aria-label="Your profile"
          title="Your profile"
          className="inline-flex no-underline"
        >
          <OrgAvatar
            size="sm"
            className="border border-border-strong ring-3 ring-glow"
          />
        </Link>
      </div>
    </header>
  );
}
