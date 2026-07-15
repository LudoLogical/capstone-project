"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

/**
 * Records each route the user visits into the store so Back controls can return
 * to the actual previous page (and label themselves with it). Renders nothing.
 */
export default function NavTracker() {
  const pathname = usePathname();
  const recordNav = useAppStore((s) => s.recordNav);
  useEffect(() => {
    recordNav(pathname);
  }, [pathname, recordNav]);
  return null;
}
