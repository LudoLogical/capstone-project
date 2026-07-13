import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const signedIn = useAppStore((s) => s.signedIn);
  if (!signedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}
