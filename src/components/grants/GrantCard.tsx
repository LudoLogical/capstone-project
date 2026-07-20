"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type Grant from "@/types/grant";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAppStore } from "@/store/useAppStore";
import { isPastDeadline } from "@/store/derived";
import { GrantLifecycleStage } from "@/types/grantRecord";
import { INTERESTED_BY_GRANT } from "@/data/seed";
import ClosedGrantModal from "@/components/modals/ClosedGrantModal";
import { Users, Star, ArrowRight } from "lucide-react";

export default function GrantCard({
  grant,
  saved,
}: {
  grant: Grant;
  saved: boolean;
}) {
  const router = useRouter();
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const discoverable = useAppStore((s) => !!s.discoverable[grant.id]);
  const setStage = useAppStore((s) => s.setStage);
  const setDiscoverable = useAppStore((s) => s.setDiscoverable);
  const [closedOpen, setClosedOpen] = useState(false);

  // Count of orgs open to collaboration on this grant: the opted-in NSR
  // members surfaced for it, plus you if you've listed yourself.
  const collabCount =
    (INTERESTED_BY_GRANT[grant.id]?.length ?? 0) + (discoverable ? 1 : 0);

  // A closed grant can't be saved; un-saving one stays available.
  const closed = isPastDeadline(grant);
  const toggleSave = () => {
    if (closed && !saved) return setClosedOpen(true);
    openCouplingModal(saved ? "unsave" : "save", grant.id);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="min-w-60 flex-1">
          <div
            onClick={() => router.push(`/grants/${grant.id}`)}
            role="button"
            tabIndex={0}
            className="mb-1 cursor-pointer font-serif text-xl font-bold"
          >
            {grant.name}
          </div>
          <div className="mb-2.5 text-sm text-ink-muted">
            {grant.grantor} ·{" "}
            {grant.targetRegions.map((r) => r.name).join(", ")}
          </div>
          <p className="mb-3 text-sm leading-normal text-ink-muted">
            {grant.purpose}
          </p>
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            <div>
              <span className="text-ink-muted">Award </span>
              <span className="font-semibold text-ink-secondary">
                {formatCurrency(grant.award.totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-ink-muted">Eligible area </span>
              <span className="font-semibold text-ink-secondary">
                {grant.targetRegions.map((r) => r.name).join(", ")}
              </span>
            </div>
            <div>
              <span className="text-ink-muted">Opens </span>
              <span className="font-semibold text-ink-secondary">
                {formatDate(grant.timeline.applicationWindowStart)}
              </span>
            </div>
            <div>
              <span className="text-ink-muted">
                {closed ? "Closed on " : "Closes "}
              </span>
              <span
                className={`font-semibold ${
                  closed ? "text-warning-ink" : "text-ink-secondary"
                }`}
              >
                {formatDate(grant.timeline.applicationWindowEnd)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {grant.issues.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          {collabCount > 0 && (
            <button
              onClick={() => router.push(`/grants/${grant.id}/collaborate`)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2 transition duration-150 hover:brightness-95"
            >
              <Users size={12} className="shrink-0" />
              {collabCount} open to collaborate
            </button>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-sm font-bold text-accent-ink-2">
            {formatCurrency(grant.award.totalAmount)}
          </div>
          <div className="mt-1 flex gap-2">
            <button
              onClick={toggleSave}
              className={`inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 ${
                closed && !saved
                  ? "bg-divider-2 text-ink-muted hover:bg-border-strong"
                  : "bg-white text-ink hover:border-accent"
              }`}
              aria-pressed={saved}
            >
              <Star size={13} fill={saved ? "currentColor" : "none"} className="shrink-0" />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => router.push(`/grants/${grant.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              View grant details <ArrowRight size={14} className="shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {closedOpen && (
        <ClosedGrantModal
          grantName={grant.name}
          closedOn={grant.timeline.applicationWindowEnd}
          onClose={() => setClosedOpen(false)}
          onRemove={() => {
            setStage(grant.id, GrantLifecycleStage.Unsaved);
            setDiscoverable(grant.id, false);
            setClosedOpen(false);
          }}
        />
      )}
    </div>
  );
}
