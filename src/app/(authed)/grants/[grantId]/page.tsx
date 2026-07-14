"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import { formatCurrencyFull, formatDate } from "@/utils/format";
import JargonTerm from "@/components/JargonTerm";

export default function GrantDetailPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const discoverable = useAppStore((s) => s.discoverable[grantId]);
  const addToast = useAppStore((s) => s.addToast);

  if (!view) {
    return (
      <div className="p-10 animate-nc-rise">
        <p className="leading-relaxed">Grant not found.</p>
      </div>
    );
  }

  const { grant, stage } = view;
  const saved = isSavedStage(stage);

  const toggleSave = () => {
    openCouplingModal(saved ? "unsave" : "save", grant.id);
  };

  const shareGrant = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    addToast("Link copied.");
  };

  return (
    <div className="mx-auto max-w-3xl px-8 pt-7 pb-20 animate-nc-rise">
      <button
        onClick={() => router.push("/search")}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to search
      </button>

      <div className="mb-5 rounded-2xl border border-border bg-surface p-8">
        <div className="mb-2 font-serif text-3xl">
          {grant.purpose.split(".")[0]}
        </div>
        <div className="mb-4 text-sm text-ink-muted">
          {grant.grantor} · {grant.targetRegions.map((r) => r.name).join(", ")}
        </div>
        <div className="mb-4 text-xl font-bold text-accent-ink-2">
          {formatCurrencyFull(grant.award.totalAmount)} total
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {grant.issues.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-body">
          {grant.purpose}
        </p>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">Applications open</div>
            <div className="text-sm font-semibold">
              {formatDate(grant.timeline.applicationWindowStart)}
            </div>
          </div>
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">
              Applications close
            </div>
            <div className="text-sm font-semibold">
              {formatDate(grant.timeline.applicationWindowEnd)}
            </div>
          </div>
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">Decision by</div>
            <div className="text-sm font-semibold">
              {formatDate(grant.timeline.notificationDate)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={toggleSave}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button
            onClick={() => router.push(`/grants/${grant.id}/collaborate`)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            🤝 Find Collaborators for this Grant
          </button>
          <button
            onClick={shareGrant}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share link
          </button>
          <button
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            View grant on website ↗
          </button>
        </div>

        {discoverable && (
          <div className="mt-5 flex items-start gap-2.5 border-t border-divider-2 pt-5">
            <div className="flex h-5 w-5 flex-none items-center justify-center rounded-sm border-2 border-accent bg-accent text-xs font-extrabold text-white">
              ✓
            </div>
            <div className="text-sm leading-normal text-ink-muted">
              Other organizations applying to this grant can find you as a
              potential{" "}
              <JargonTerm termKey="discoverable">collaborator</JargonTerm>.
              Manage this anytime from your{" "}
              <button
                onClick={() => router.push("/account")}
                className="font-semibold text-accent underline"
              >
                profile
              </button>
              , or{" "}
              <button
                onClick={() => openCouplingModal("uncollab", grant.id)}
                className="font-semibold text-accent underline"
              >
                stop collaborating
              </button>
              .
            </div>
          </div>
        )}
        {saved && !discoverable && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-divider-2 pt-5">
            <div className="text-sm leading-normal text-ink-muted">
              Working on this too? Let other organizations applying to this
              grant find you as a{" "}
              <JargonTerm termKey="discoverable">collaborator</JargonTerm>.
            </div>
            <button
              onClick={() => openCouplingModal("discover", grant.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
            >
              🤝 List us as open to collaborate
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-wrap gap-3.5">
        <div className="rounded-2xl border border-accent-tint-border bg-linear-to-br from-accent-tint-soft to-accent-tint px-6 py-5">
          <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
            ✦ AI-ASSISTED
          </div>
          <div className="mb-1.5 text-base font-bold">
            <JargonTerm termKey="fit">See how well this fits you</JargonTerm>
          </div>
          <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
            An estimated fit score based on your profile and past funded
            applications, with clear reasoning you can check.
          </p>
          <button
            onClick={() => router.push(`/grants/${grant.id}/fit`)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            See fit analysis →
          </button>
        </div>
        <div className="rounded-2xl border border-accent-tint-border bg-linear-to-br from-accent-tint-soft to-accent-tint px-6 py-5">
          <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
            ✦ AI-ASSISTED
          </div>
          <div className="mb-1.5 text-base font-bold">
            Start collecting your data
          </div>
          <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
            Turn what you already have into grant-ready, cited evidence.
          </p>
          <button
            onClick={() => router.push(`/grants/${grant.id}/collect`)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✦ Start collecting supporting data
          </button>
        </div>
      </div>
    </div>
  );
}
