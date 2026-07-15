"use client";

import { useSyncExternalStore } from "react";
import { useAppStore } from "./useAppStore";

/**
 * True once the persisted slice of the store has been read back out of
 * localStorage.
 *
 * The server snapshot is hard-coded to `false`, and on the client the first
 * render also reads `false` (the store is created with `skipHydration: true`,
 * so nothing has been read yet). Those two agreeing is precisely what avoids a
 * hydration mismatch. <StoreHydrator/> then triggers rehydration one commit
 * later, `onFinishHydration` fires, and this flips to `true` as a normal update.
 *
 * Anything that branches on persisted state - above all `RequireAuth`, which
 * would otherwise see `signedIn: false` and bounce a signed-in user back to the
 * landing page on every refresh - must wait for this before acting.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useAppStore.persist.onFinishHydration(onStoreChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
