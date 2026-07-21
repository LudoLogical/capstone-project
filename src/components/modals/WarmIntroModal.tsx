"use client";

import { useState } from "react";
import Modal from "@/components/primitives/Modal";
import EmailRow from "@/components/modals/EmailRow";
import { useOrgName } from "@/store/derived";
import { useAppStore } from "@/store/useAppStore";
import type { OrgProfileContent } from "@/data/seed";
import { Check, BarChart3, X, Info } from "lucide-react";

/**
 * The warm-intro note NSR frames - addressed to the partner org, sent by you.
 * `senderName` signs the note: the user's own org name, or the stand-in from
 * `useOrgName` until they've set one.
 */
function defaultIntro(org: OrgProfileContent, senderName: string): string {
  const focus = (org.focus[0] ?? "community").toLowerCase();
  return (
    `Hi ${org.name},\n\n` +
    `We're a fellow New Sun Rising client organization working on related community work, ` +
    `and your ${focus} work caught our eye. We'd love to compare notes and ` +
    `explore whether there's a way to collaborate.\n\n` +
    `Would you be open to a short call in the next couple of weeks?\n\n` +
    `Warmly,\n${senderName}`
  );
}

const EMAIL_SUBJECT = "Hello from a fellow New Sun Rising client organization";

/**
 * Compose-and-send a warm introduction to a fellow NSR client organization.
 * NSR frames the note and sends it on the user's behalf; replies are handed
 * back to the sending organization's own address via the "reply to" header.
 * `onSent` lets the host mark the org introduced.
 *
 * Delivery is not wired up yet -- see `send` below.
 */
export default function WarmIntroModal({
  org,
  onClose,
  onSent,
}: {
  org: OrgProfileContent;
  onClose: () => void;
  onSent?: (org: OrgProfileContent) => void;
}) {
  const senderOrgName = useOrgName();
  // No stand-in for the address: an invented one would look like a real inbox.
  const senderOrgEmail = useAppStore((s) => s.onboardOrg.email.trim());
  const [body, setBody] = useState(() => defaultIntro(org, senderOrgName));
  const [sent, setSent] = useState(false);

  const send = () => {
    // TODO: hand `body` to the server, which sends the email on the user's
    // behalf. Until that exists the draft is intentionally dropped -- the
    // confirmation below describes the intended behavior, not what happens now.
    onSent?.(org);
    setSent(true);
  };

  return (
    <Modal open onClose={onClose} bare maxWidth="max-w-2xl">
      {sent ? (
        <div className="px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success-ink">
            <Check size={26} />
          </div>
          <div className="text-lg font-bold">Introduction sent</div>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Your introduction to{" "}
            <span className="font-semibold text-ink">{org.name}</span> is on its
            way. If they reply, their message goes straight to your inbox.
          </p>
          <button
            onClick={onClose}
            className="mt-5 rounded-lg bg-accent-ink px-5 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-3 rounded-t-2xl bg-accent-ink px-7 py-5 text-white">
            <span aria-hidden className="mt-0.5 text-xl">
              <BarChart3 size={18} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-sm font-bold">
                Warm introduction via Vibrant Grants
              </div>
              <div className="mt-0.5 text-xs text-white/80">
                NSR only facilitates the delivery of this email. If {org.name}{" "}
                replies, their message will get sent straight to your email
                inbox.
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 flex-none rounded-lg p-1.5 text-lg leading-none text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-7 py-6">
            <EmailRow label="TO">
              <span className="font-semibold">
                {org.name} &lt;{org.email}&gt;
              </span>
            </EmailRow>
            <EmailRow label="FROM">
              <span className="font-semibold">
                {senderOrgName}
                {senderOrgEmail && <> &lt;{senderOrgEmail}&gt;</>}
              </span>
            </EmailRow>
            <EmailRow label="SUBJECT">{EMAIL_SUBJECT}</EmailRow>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-alt px-4 py-3 text-xs leading-normal text-ink-muted">
              <Info size={14} className="mt-px shrink-0 text-accent" />
              <span>
                New Sun Rising vouches that you&apos;re both in its network, the
                same way a trusted introduction does. You&apos;re in control of
                the rest of the content.
              </span>
            </div>

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Introduction message"
              className="mt-4 min-h-64 w-full resize-y rounded-xl border border-border-strong bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none focus:border-accent"
            />

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={onClose}
                className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
              >
                Cancel
              </button>
              <button
                onClick={send}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-5 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:bg-accent-ink-2 active:translate-y-px"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
