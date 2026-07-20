"use client";

import { useRef, useState } from "react";
import Modal from "@/components/primitives/Modal";

/**
 * Share popup: social tiles plus a copy-link row. The tiles open the
 * platform's own share intent in a new tab; nothing is posted on the user's
 * behalf. `link` is the shareable URL and `name` is shown as the subtitle.
 * `title` lets callers reword the header (e.g. share an org vs a grant).
 */
export default function ShareModal({
  name,
  link,
  title = "Share this grant",
  onClose,
}: {
  name: string;
  link: string;
  title?: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  const tiles: { label: string; glyph: string; bg: string; href: string }[] = [
    {
      label: "Facebook",
      glyph: "f",
      bg: "#1877f2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    },
    {
      label: "X / Twitter",
      glyph: "X",
      bg: "#10151f",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`,
    },
    {
      label: "LinkedIn",
      glyph: "in",
      bg: "#0a66c2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    },
    {
      label: "Email",
      glyph: "@",
      bg: "#4f46e5",
      href: `mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(link)}`,
    },
  ];

  return (
    <Modal open onClose={onClose} title={title}>
      <div className="-mt-2 mb-4 text-sm text-ink-muted">{name}</div>

      <div className="flex flex-wrap gap-3">
        {tiles.map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-20 flex-1 flex-col items-center gap-2 rounded-xl border border-border bg-surface-alt px-2 py-4 no-underline transition duration-150 hover:border-accent"
          >
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-extrabold text-white"
              style={{ background: t.bg }}
            >
              {t.glyph}
            </span>
            <span className="text-xs font-semibold text-ink-secondary">
              {t.label}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-5 mb-2 text-xs font-bold tracking-wider text-ink-muted uppercase">
        Or copy link
      </div>
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1 truncate rounded-lg border border-border-strong bg-surface-alt px-3 py-2.5 text-xs text-ink-muted">
          {link}
        </div>
        <button
          onClick={copy}
          className="flex-none rounded-lg bg-accent px-4 py-2.5 text-xs font-bold whitespace-nowrap text-white transition duration-150 hover:brightness-105"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </Modal>
  );
}
