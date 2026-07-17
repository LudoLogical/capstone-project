"use client";

import Modal from "./Modal";
import { useAppStore } from "@/store/useAppStore";
import { Check } from "lucide-react";

export default function PrivacyModal() {
  const signedIn = useAppStore((s) => s.signedIn);
  const privacyAcked = useAppStore((s) => s.privacyAcked);
  const ackPrivacy = useAppStore((s) => s.ackPrivacy);

  return (
    <Modal
      open={signedIn && !privacyAcked}
      onClose={ackPrivacy}
      title="Before you get started"
    >
      <div className="mb-5 flex flex-col gap-3">
        {[
          "Your data is never used to train our AI.",
          "Your data is never shared or sold without your explicit consent.",
          "You choose what the AI reads, one item at a time.",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5">
            <Check size={14} className="mt-0.5 flex-none text-success-ink" />
            <span className="text-sm leading-normal">{line}</span>
          </div>
        ))}
      </div>
      <button
        onClick={ackPrivacy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        Got it - enter the portal
      </button>
    </Modal>
  );
}
