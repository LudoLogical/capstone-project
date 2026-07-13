"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Loads the persisted store out of localStorage, once, after mount.
 *
 * The store is created with `skipHydration: true` so that the server render and
 * the first client render both start from the store's initial state. This
 * component is what actually reads the saved state back in, one commit later,
 * where it lands as an ordinary state update instead of a hydration mismatch.
 */
export default function StoreHydrator() {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return null;
}
