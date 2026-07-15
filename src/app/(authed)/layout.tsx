import type { ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import NavTracker from "@/components/NavTracker";

/**
 * Route group layout. `(authed)` adds no URL segment; it exists purely to wrap
 * the nine guarded routes in a single RequireAuth, replacing the nine separate
 * <RequireAuth> wrappers that App.tsx used to declare by hand. NavTracker
 * records visited routes so Back controls can return to the previous page.
 */
export default function AuthedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <NavTracker />
      {children}
    </RequireAuth>
  );
}
