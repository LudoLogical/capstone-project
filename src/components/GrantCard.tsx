"use client";

import { useRouter } from "next/navigation";
import type Grant from "@/types/grant";
import { formatCurrency, formatDate } from "@/utils/format";
import { useAppStore } from "@/store/useAppStore";
import { GrantLifecycleStage } from "@/types/grantRecord";
import { isSavedStage } from "@/store/derived";

export default function GrantCard({
  grant,
  stage,
}: {
  grant: Grant;
  stage: GrantLifecycleStage;
}) {
  const router = useRouter();
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const saved = isSavedStage(stage);

  const toggleSave = () => {
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
            className="mb-1 cursor-pointer font-serif text-xl"
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
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-sm font-bold text-accent-ink-2">
            {formatCurrency(grant.award.totalAmount)}
          </div>
          <div className="text-xs text-ink-faint">
            Closes {formatDate(grant.timeline.applicationWindowEnd)}
          </div>
          <div className="mt-1 flex gap-2">
            <button
              onClick={toggleSave}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
              aria-pressed={saved}
            >
              {saved ? "★ Saved" : "☆ Save"}
            </button>
            <button
              onClick={() => router.push(`/grants/${grant.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View grant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
