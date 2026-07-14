"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { INTERESTED_BY_GRANT, ORG_PROFILES } from "@/data/seed";

const COLLAB_CAP = 3;

export default function CollaboratePage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const collabPicks = useAppStore((s) => s.collabPicks[grantId]) ?? [];
  const collabSent = useAppStore((s) => s.collabSent[grantId]);
  const collabSorted = useAppStore((s) => s.collabSorted[grantId]);
  const toggleCollabPick = useAppStore((s) => s.toggleCollabPick);
  const toggleCollabSort = useAppStore((s) => s.toggleCollabSort);
  const sendCollabRequest = useAppStore((s) => s.sendCollabRequest);
  const addToast = useAppStore((s) => s.addToast);

  if (!view) return null;
  const { grant } = view;

  const orgIds = INTERESTED_BY_GRANT[grant.id] ?? [];
  let orgs = orgIds.map((id) => ORG_PROFILES[id]).filter(Boolean);
  if (collabSorted) {
    orgs = [...orgs].sort((a, b) => b.signals.length - a.signals.length);
  }

  const toggleSort = () => {
    toggleCollabSort(grant.id);
    addToast(
      "Sorting by overlap. Your judgment still decides who to reach out to.",
    );
  };

  const togglePick = (initiativeId: string) => {
    if (
      !collabPicks.includes(initiativeId) &&
      collabPicks.length >= COLLAB_CAP
    ) {
      addToast(`You can select up to ${COLLAB_CAP} organizations at a time.`);
      return;
    }
    toggleCollabPick(grant.id, initiativeId, COLLAB_CAP);
  };

  const send = () => {
    sendCollabRequest(grant.id);
  };

  if (collabSent) {
    return (
      <div className="mx-auto max-w-3xl animate-nc-rise px-8 pt-7 pb-20">
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <div className="mb-3 text-3xl">✓</div>
          <h1 className="mb-2.5 font-serif text-xl leading-tight font-medium">
            Sent to New Sun Rising
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-ink-muted">
            Your introduction request is reviewed only where it looks like a fit
            — no automated emails go out.
          </p>
          <div className="mb-5 flex flex-col gap-2">
            {collabPicks.map((id) => (
              <div
                key={id}
                className="flex justify-between rounded-lg border border-border-soft px-3.5 py-2.5 text-sm"
              >
                <span>{ORG_PROFILES[id]?.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-bold text-warning-ink">
                  Pending review
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-nc-rise px-8 pt-7 pb-30">
      <button
        onClick={() => router.push(`/grants/${grant.id}`)}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back
      </button>

      <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
        🤝 Interested in co-applying
      </div>
      <h1 className="mb-2.5 font-serif text-3xl leading-tight font-medium">
        Collaborators for {grant.name}
      </h1>
      <p className="mb-5 text-sm leading-relaxed text-ink-muted">
        These are opted-in New Sun Rising clients discoverable for this grant.
        The list is plain and unranked — you decide.
      </p>

      <button
        onClick={toggleSort}
        className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        ✦ Sort by overlap with us
      </button>

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-9 text-center">
          <p className="text-sm leading-relaxed text-ink-muted">
            No organizations are currently discoverable for this grant.
          </p>
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-3.5">
          {orgs.map((org) => {
            const picked = collabPicks.includes(org.initiativeId);
            return (
              <div
                key={org.initiativeId}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="min-w-56 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="text-base font-bold">{org.name}</div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                        Portal client
                      </span>
                    </div>
                    <div className="mb-2.5 text-sm text-ink-muted">
                      {org.place}
                    </div>
                    {collabSorted ? (
                      <div className="flex flex-wrap gap-2">
                        {org.signals.map((sig) => (
                          <span
                            key={sig.label}
                            className="inline-flex items-center gap-1 rounded-full border border-info-border bg-info-bg px-3 py-1 text-xs font-bold text-info-ink"
                          >
                            ◷ {sig.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {org.focus.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/grants/${grant.id}/collaborate/${org.initiativeId}`,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      See profile
                    </button>
                    <button
                      onClick={() => togglePick(org.initiativeId)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                        picked
                          ? "bg-ink text-white"
                          : "border border-border-strong bg-white"
                      }`}
                    >
                      {picked ? "✓ Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-4 border-t border-border-soft bg-white px-8 py-4 shadow-float">
        <div className="text-sm font-semibold">
          {collabPicks.length} selected
        </div>
        <button
          onClick={send}
          disabled={collabPicks.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send introduction requests →
        </button>
      </div>
    </div>
  );
}
