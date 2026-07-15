"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/store/useHydrated";

/**
 * Client-side guard for the (authed) route group.
 *
 * Auth here is mocked exactly as it was in the Vite app: `signedIn` is a plain
 * boolean the landing page flips by calling `signIn()`. There is no credential,
 * no cookie, and deliberately no middleware guard - the flag lives in
 * localStorage, which middleware cannot read.
 *
 * The one thing this cannot do is decide before the store has rehydrated.
 * Until then `signedIn` is still at its initial `false`, so redirecting on it
 * would throw out every signed-in user on a hard refresh.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const signedIn = useAppStore((s) => s.signedIn);

  useEffect(() => {
    if (hydrated && !signedIn) router.replace("/");
  }, [hydrated, signedIn, router]);

  if (!hydrated || !signedIn) return null;

  return <>{children}</>;
}
