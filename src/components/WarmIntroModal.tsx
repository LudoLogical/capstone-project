"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { OrgProfileContent } from "@/data/seed";
import Icon from "./Icon";

/** The warm-intro note NSR frames - addressed to the partner org, sent by you. */
function defaultIntro(org: OrgProfileContent): string {
  const focus = (org.focus[0] ?? "community").toLowerCase();
  return (
    `Hi ${org.name} team,\n\n` +
    `We're a fellow New Sun Rising member working on related community work, ` +
    `and your ${focus} work caught our eye. We'd love to compare notes and ` +
    `explore whether there's a way to collaborate.\n\n` +
    `Would you be open to a short call in the next couple of weeks?\n\n` +
    `Warmly,\nYour Organization`
  );
}

const EMAIL_SUBJECT = "A hello from a fellow New Sun Rising member";

/**
 * Compose-and-send a warm introduction directly to a fellow NSR member. New Sun
 * Rising only frames the note - the email is addressed to the partner org and
 * handed off to the user's own mail client via mailto. Nothing is sent through
 * NSR. `onSent` lets the host mark the org introduced.
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
  const [body, setBody] = useState(() => defaultIntro(org));
  const [sent, setSent] = useState(false);

  const send = () => {
    const mailto = `mailto:${org.email}?subject=${encodeURIComponent(
      EMAIL_SUBJECT,
    )}&body=${encodeURIComponent(body)}`;
    // mailto opens the client without unloading the app.
    window.location.href = mailto;
    onSent?.(org);
    setSent(true);
  };

  return (
    <Modal open onClose={onClose} bare maxWidth="max-w-2xl">
      {sent ? (
        <div className="px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success-ink">
            <Icon name="check" size={26} />
          </div>
          <div className="text-lg font-bold">Opening in your email client…</div>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
            Your introduction to{" "}
            <span className="font-semibold text-ink">{org.name}</span> is ready
            to send from your own inbox. Nothing is sent through New Sun Rising.
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
              <Icon name="bar-chart" size={18} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-sm font-bold">
                Warm introduction via the New Sun Rising Vibrancy Portal
              </div>
              <div className="mt-0.5 text-xs text-white/80">
                You&apos;re both part of the NSR network. This note is framed by
                NSR - you send it yourself.
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 flex-none rounded-lg p-1.5 text-lg leading-none text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <div className="px-7 py-6">
            <EmailRow label="TO">
              <span className="font-semibold">
                {org.name} &lt;{org.email}&gt;
              </span>
            </EmailRow>
            <EmailRow label="FROM">
              Your Organization (New Sun Rising member)
            </EmailRow>
            <EmailRow label="SUBJECT">{EMAIL_SUBJECT}</EmailRow>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-alt px-4 py-3 text-xs leading-normal text-ink-muted">
              <span aria-hidden className="mt-px flex-none text-accent">
                ⓘ
              </span>
              <span>
                New Sun Rising vouches that you&apos;re both members of its
                network - the same way a trusted introduction does. NSR
                doesn&apos;t write or send this for you.
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

function EmailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-divider py-2.5 text-sm">
      <span className="w-16 flex-none font-mono text-xs tracking-wide text-ink-muted">
        {label}
      </span>
      <span className="min-w-0 text-ink-body">{children}</span>
    </div>
  );
}
