"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";

const ONBOARDING_ROUTE = "/onboarding";

/**
 * Global first-run guard: a user who has not completed (or skipped) onboarding
 * is sent to /onboarding no matter which route they asked for.
 *
 * `onboarded` lives in localStorage, which middleware cannot read, so this has
 * to run on the client. It also cannot decide before the persisted store has
 * rehydrated - until then `onboarded` is still at its initial `false`, and
 * acting on that would bounce an already-onboarded user back into setup on
 * every hard refresh.
 *
 * Children are withheld until the decision is made, so someone who is about to
 * be redirected never sees a frame of the page they asked for.
 */
export default function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const onboarded = useAppStore((s) => s.onboarded);
  const onOnboarding = pathname === ONBOARDING_ROUTE;

  useEffect(() => {
    if (hydrated && !onboarded && !onOnboarding) {
      router.replace(ONBOARDING_ROUTE);
    }
  }, [hydrated, onboarded, onOnboarding, router]);

  if (!hydrated) return null;
  if (!onboarded && !onOnboarding) return null;

  return <>{children}</>;
}
