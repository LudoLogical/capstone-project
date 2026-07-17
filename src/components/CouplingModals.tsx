"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import type { CouplingModal } from "@/store/useAppStore";
import JargonTerm from "./JargonTerm";
import { Check } from "lucide-react";

/** The "also do the coupled action" checkbox each prompt offers. */
function CoupledCheckbox({
  checked,
  onToggle,
  label,
  hint,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  hint: string;
}) {
  return (
    <div
      onClick={onToggle}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface-alt px-4 py-3.5"
    >
      <div
        className={`mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center rounded-sm border-2 text-xs font-extrabold text-white ${
          checked ? "border-accent bg-accent" : "border-ink-muted"
        }`}
      >
        {checked ? <Check size={14} /> : null}
      </div>
      <div>
        <div className="text-sm leading-tight font-bold">{label}</div>
        <p className="mt-1 text-xs leading-normal text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}

/**
 * The body of one coupling prompt. Rendered with a key of type+grantId so each
 * time a prompt opens it remounts with the checkbox freshly pre-checked - no
 * effect needed to reset it.
 */
function CouplingPrompt({ modal }: { modal: NonNullable<CouplingModal> }) {
  const closeCouplingModal = useAppStore((s) => s.closeCouplingModal);
  const confirmSave = useAppStore((s) => s.confirmSave);
  const confirmUnsave = useAppStore((s) => s.confirmUnsave);
  const confirmDiscover = useAppStore((s) => s.confirmDiscover);
  const confirmUncollab = useAppStore((s) => s.confirmUncollab);
  const addToast = useAppStore((s) => s.addToast);
  const discoverable = useAppStore((s) => !!s.discoverable[modal.grantId]);
  const view = useGrantView(modal.grantId);

  // The coupled action starts pre-checked; the user can opt out before confirming.
  const [coupled, setCoupled] = useState(true);
  const toggleCoupled = () => setCoupled((c) => !c);

  if (!view) return null;
  const saved = isSavedStage(view.stage);
  const grantName = view.grant.name;

  // ── Save: offer to also list as a collaborator ─────────────────
  if (modal.type === "save") {
    return (
      <Modal open onClose={closeCouplingModal} title="Saved to your grants">
        <p className="text-sm leading-normal text-ink-body">
          <span className="font-semibold">{grantName}</span> is now in your
          saved grants.
        </p>
        <p className="mt-3 text-sm leading-normal text-ink-muted">
          Want other organizations applying to this grant to find you as a
          potential{" "}
          <JargonTerm termKey="discoverable">collaborator</JargonTerm>? This
          makes your contact details available to other NSR Clients interested
          in collaborating. You can change this anytime from your profile.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={() => {
              confirmSave(modal.grantId, false);
              addToast("Saved to your grants.");
            }}
            className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 enabled:hover:border-accent"
          >
            Just save it
          </button>
          <button
            onClick={() => {
              confirmSave(modal.grantId, true);
              addToast("Saved and listed as open to collaborate.");
            }}
            className="rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
          >
            Save &amp; list us
          </button>
        </div>
      </Modal>
    );
  }

  // ── Unsave: offer to also stop collaborating ───────────────────
  if (modal.type === "unsave") {
    return (
      <Modal open onClose={closeCouplingModal} title="Remove this saved grant?">
        <p className="text-sm leading-normal text-ink-body">
          <span className="font-semibold">{grantName}</span> will leave your
          saved grants. You can save it again anytime from Explore.
        </p>
        {discoverable && (
          <CoupledCheckbox
            checked={coupled}
            onToggle={toggleCoupled}
            label="Also stop letting others find me as a collaborator"
            hint="You're currently listed as open to collaborate on this grant. Leave this unchecked to stay discoverable even after unsaving."
          />
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={closeCouplingModal}
            className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 enabled:hover:border-accent"
          >
            Keep it saved
          </button>
          <button
            onClick={() => {
              const stop = discoverable ? coupled : false;
              confirmUnsave(modal.grantId, stop);
              addToast(
                stop
                  ? "Unsaved and stopped collaborating."
                  : "Removed from saved grants.",
              );
            }}
            className="rounded-lg bg-warning-ink px-4 py-2.5 text-sm font-semibold text-white transition duration-150 enabled:hover:brightness-105"
          >
            Unsave
          </button>
        </div>
      </Modal>
    );
  }

  // ── Discover: offer to also save ───────────────────────────────
  if (modal.type === "discover") {
    return (
      <Modal
        open
        onClose={closeCouplingModal}
        title="List your org as open to collaborate?"
      >
        <p className="text-sm leading-normal text-ink-body">
          Other organizations working on{" "}
          <span className="font-semibold">{grantName}</span> will be able to
          find you and reach out. You can stop listing anytime from your
          profile.
        </p>
        <p className="mt-3 text-sm leading-normal text-ink-muted">
          Listing yourself as open to collaborate makes your contact details
          available to other NSR Clients who are interested in collaborating on
          this grant.
        </p>
        {!saved && (
          <CoupledCheckbox
            checked={coupled}
            onToggle={toggleCoupled}
            label="Also save this grant to your dashboard"
            hint="Keeps it in your saved grants so you can pick the application back up easily."
          />
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={closeCouplingModal}
            className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 enabled:hover:border-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const alsoSave = saved ? true : coupled;
              confirmDiscover(modal.grantId, alsoSave);
              addToast(
                alsoSave && !saved
                  ? "Listed to collaborate and saved."
                  : "Listed as open to collaborate.",
              );
            }}
            className="rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
          >
            List us
          </button>
        </div>
      </Modal>
    );
  }

  // ── Uncollab: offer to also unsave ─────────────────────────────
  return (
    <Modal open onClose={closeCouplingModal} title="Stop collaborating on this?">
      <p className="text-sm leading-normal text-ink-body">
        You&apos;ll be removed from the list of organizations open to
        collaborating on{" "}
        <span className="font-semibold">{grantName}</span>.
      </p>
      {saved && (
        <CoupledCheckbox
          checked={coupled}
          onToggle={toggleCoupled}
          label="Also remove this grant from my saved grants"
          hint="Leave this unchecked to keep the grant saved on your dashboard."
        />
      )}
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={closeCouplingModal}
          className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 enabled:hover:border-accent"
        >
          Keep collaborating
        </button>
        <button
          onClick={() => {
            const alsoUnsave = saved ? coupled : false;
            confirmUncollab(modal.grantId, alsoUnsave);
            addToast(
              alsoUnsave
                ? "Stopped collaborating and unsaved."
                : "Stopped collaborating.",
            );
          }}
          className="rounded-lg bg-warning-ink px-4 py-2.5 text-sm font-semibold text-white transition duration-150 enabled:hover:brightness-105"
        >
          Stop collaborating
        </button>
      </div>
    </Modal>
  );
}

/**
 * Hosts the save/collaborate coupling prompts. Which one shows is driven by
 * `couplingModal` in the store, so any Save / Unsave / collaborate control on
 * any page can trigger the right prompt and it renders in one place.
 *
 * The coupling is opt-out, not locked: each prompt offers to also do the
 * coupled action via a checkbox, and pre-checks it, but the user can decline
 * so `saved` and `discoverable` may diverge.
 */
export default function CouplingModals() {
  const modal = useAppStore((s) => s.couplingModal);
  if (!modal) return null;
  return <CouplingPrompt key={`${modal.type}:${modal.grantId}`} modal={modal} />;
}
