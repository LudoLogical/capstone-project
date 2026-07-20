"use client";

import { useAppStore } from "@/store/useAppStore";
import CouplingPrompt from "@/components/modals/CouplingPrompt";

/**
 * Mounts the open coupling prompt, if any. Keyed by type+grantId so each time a
 * prompt opens it remounts with its checkbox freshly pre-checked - no effect
 * needed to reset it.
 */
export default function CouplingModals() {
  const modal = useAppStore((s) => s.couplingModal);
  if (!modal) return null;
  return <CouplingPrompt key={`${modal.type}:${modal.grantId}`} modal={modal} />;
}
