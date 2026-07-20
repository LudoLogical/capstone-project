"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABEL, UNSUCCESSFUL_STATUSES } from "@/store/useAppStore";
import type { GrantView } from "@/store/derived";
import { formatCurrency } from "@/utils/format";
import DaysLeftChip from "@/components/grants/DaysLeftChip";
import { Trash2, MoreVertical, X, Check, Info, Calendar } from "lucide-react";

/** One grant inside a board column: name, funder, due date, actions. */
export default function GrantMiniCard({
  view,
  dueLabel,
  deadline,
  primary,
  secondary,
  tertiary,
  remove,
  menu,
  closed = false,
  onClosedClick,
  badge,
}: {
  view: GrantView;
  dueLabel: string;
  /** The date being counted down to, if this card has one still ahead of it. */
  deadline?: Date;
  /** A completion tag, e.g. "Report Completed" on an archived grant. */
  badge?: string;
  primary?: { label: string; to?: string; onClick?: () => void };
  secondary?: { label: string; to?: string; onClick?: () => void };
  tertiary?: { label: string; to?: string; onClick?: () => void };
  /** A small action in the card's upper right. */
  remove?: { label: string; onClick: () => void };
  /** A kebab (three-dot) menu in the upper right, in place of `remove`. */
  menu?: { label: string; onClick: () => void; danger?: boolean }[];
  /** Past its deadline: the primary action greys out and explains itself. */
  closed?: boolean;
  onClosedClick?: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (to?: string, onClick?: () => void) => () => {
    if (onClick) onClick();
    else if (to) router.push(to);
  };
  const hasCorner = !!remove || !!menu;

  return (
    <div className="relative rounded-xl bg-surface p-4">
      {remove && !menu && (
        <button
          onClick={remove.onClick}
          aria-label={remove.label}
          title={remove.label}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-muted transition duration-150 hover:bg-accent-tint hover:text-accent-ink"
        >
          <Trash2 size={15} />
        </button>
      )}
      {menu && (
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
            aria-expanded={menuOpen}
            title="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-muted transition duration-150 hover:bg-surface-alt hover:text-ink"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              {/* Click-away layer closes the menu. */}
              <button
                aria-hidden
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border-strong bg-white shadow-float">
                {menu.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition duration-150 ${
                      item.danger
                        ? "text-error-ink hover:bg-error-bg"
                        : "text-ink hover:bg-surface-alt"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => router.push(`/grants/${view.grant.id}`)}
        className={`mb-1 line-clamp-2 block text-left font-serif text-base leading-snug font-bold transition duration-150 hover:text-accent ${
          hasCorner ? "pr-8" : ""
        }`}
      >
        {view.grant.name}
      </button>
      <div className="mb-2.5 text-xs text-ink-muted">
        {view.grant.grantor} · {formatCurrency(view.grant.award.totalAmount)}
      </div>

      {badge &&
        (() => {
          // An archived grant that ended without a win reads red: filing it away
          // is not the same as finishing it.
          const unsuccessful =
            !!view.status && UNSUCCESSFUL_STATUSES.includes(view.status);
          return (
            <div
              className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                unsuccessful
                  ? "border-error-border bg-error-bg text-error-ink"
                  : "border-success-border bg-success-bg text-success-ink"
              }`}
            >
              {unsuccessful ? <X size={12} /> : <Check size={12} />}
              {badge}
            </div>
          );
        })()}

      {/* An overdue report is a standing fact, not a question - it stays red
          until the user files it. */}
      {view.status === "report-overdue" && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-error-border bg-error-bg px-2.5 py-1 text-xs font-bold text-error-ink">
          <Info size={12} />
          {STATUS_LABEL["report-overdue"]}
        </div>
      )}

      {/* Past due and unresolved: the grant stays put and asks for a decision
          rather than vanishing into an archive on its own. */}
      {view.needsAttention && onClosedClick && (
        <button
          onClick={onClosedClick}
          className="mb-2 inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-xs font-bold text-warning-ink transition duration-150 hover:brightness-95"
        >
          <Info size={12} />
          Needs attention - what happened?
        </button>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-ink-secondary">
          <Calendar size={13} />
          {dueLabel}
        </span>
        {deadline && <DaysLeftChip date={deadline} />}
      </div>

      <div className="flex flex-col gap-2">
        {primary && (
          // A closed grant can't be worked on: the call to action goes grey and
          // explains itself instead of opening the flow.
          <button
            onClick={closed ? onClosedClick : go(primary.to, primary.onClick)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition duration-150 ${
              closed
                ? "bg-divider-2 text-ink-muted hover:bg-border-strong"
                : "bg-accent-ink text-white shadow-cta enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
            }`}
          >
            {primary.label}
          </button>
        )}
        {secondary && (
          <button
            onClick={go(secondary.to, secondary.onClick)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            {secondary.label}
          </button>
        )}
        {tertiary && (
          <button
            onClick={go(tertiary.to, tertiary.onClick)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            {tertiary.label}
          </button>
        )}
      </div>
    </div>
  );
}
