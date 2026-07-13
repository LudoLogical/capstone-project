"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ORG_PROFILES } from "@/data/seed";

const COLLAB_CAP = 3;

export default function OrgProfilePage() {
  const { grantId = "", orgId = "" } = useParams<{
    grantId: string;
    orgId: string;
  }>();
  const router = useRouter();
  const profile = ORG_PROFILES[orgId];
  const collabPicks = useAppStore((s) => s.collabPicks[grantId]) ?? [];
  const toggleCollabPick = useAppStore((s) => s.toggleCollabPick);
  const contactRequested = useAppStore((s) => s.contactRequested[orgId]);
  const requestContact = useAppStore((s) => s.requestContact);
  const addToast = useAppStore((s) => s.addToast);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl animate-nc-rise px-8 pt-7 pb-20">
        <p className="leading-relaxed">Organization not found.</p>
      </div>
    );
  }

  const picked = collabPicks.includes(orgId);

  const togglePick = () => {
    if (!picked && collabPicks.length >= COLLAB_CAP) {
      addToast(`You can select up to ${COLLAB_CAP} organizations at a time.`);
      return;
    }
    toggleCollabPick(grantId, orgId, COLLAB_CAP);
  };

  const requestIntro = () => {
    requestContact(orgId);
    addToast("Requested — pending approval and consent.");
  };

  return (
    <div className="mx-auto max-w-3xl animate-nc-rise px-8 pt-7 pb-20">
      <button
        onClick={() => router.push(`/grants/${grantId}/collaborate`)}
        className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Back to collaborators
      </button>
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-radial from-accent-warm to-accent to-70%" />
          <div className="min-w-50 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-serif text-2xl leading-tight font-medium">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                Portal client
              </span>
            </div>
            <div className="text-sm text-ink-muted">{profile.place}</div>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-border bg-surface-alt p-4">
          <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
            Mission
          </div>
          <p className="text-base leading-normal text-ink-body">
            {profile.mission}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">Led by</div>
            <div className="text-sm font-semibold">{profile.lead}</div>
          </div>
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">Founded</div>
            <div className="text-sm font-semibold">{profile.founded}</div>
          </div>
          <div className="rounded-xl border border-divider-2 p-3.5">
            <div className="mb-1 text-xs text-ink-muted">Team</div>
            <div className="text-sm font-semibold">{profile.size}</div>
          </div>
        </div>

        <div className="mb-2 text-sm font-bold">About</div>
        <p className="mb-5 text-sm leading-relaxed text-ink-body">
          {profile.about}
        </p>

        <div className="mb-2.5 text-sm font-bold">Focus areas</div>
        <div className="mb-5 flex flex-wrap gap-2">
          {profile.focus.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="mb-2.5 text-sm font-bold">Contact</div>
        {profile.contactConsent ? (
          <div className="mb-5 rounded-xl border border-success-border-2 bg-success-bg-2 p-4">
            <div className="mb-2.5 text-xs font-bold text-success-ink">
              ✓ SHARED WITH CONSENT
            </div>
            <div className="text-sm">
              <strong>{profile.contactName}</strong>
            </div>
            <div className="text-sm">📞 {profile.contactPhone}</div>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-info-border-2 bg-info-bg-2 p-4">
            <div className="mb-2 text-xs font-bold text-info-ink">
              🔒 CONTACT KEPT PRIVATE
            </div>
            <p className="mb-3 text-sm leading-normal">
              This organization hasn&apos;t made their contact details public.
              Sharing them takes a few human steps: requests are reviewed,
              consent is obtained, and contact details are shared separately.
            </p>
            {contactRequested ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-bold text-warning-ink">
                ⏳ Requested — pending approval and consent
              </div>
            ) : (
              <button
                onClick={requestIntro}
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Request introduction
              </button>
            )}
          </div>
        )}

        <div className="mb-2.5 text-sm font-bold">
          Why the AI surfaced this organization
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {profile.signals.map((sig) => (
            <span
              key={sig.label}
              title={sig.source}
              className="inline-flex items-center gap-1 rounded-full border border-info-border bg-info-bg px-3 py-1 text-xs font-bold text-info-ink"
            >
              ◷ {sig.label} <sup className="text-xs">ⓘ</sup>
            </span>
          ))}
        </div>
        <p className="mb-6 text-xs leading-normal text-ink-muted">
          These are observable signals only — shared funders, overlap, and
          distance. The AI never judges whether you&apos;ll get along;
          that&apos;s what the warm introduction is for.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-divider-2 pt-5">
          <button
            onClick={togglePick}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              picked
                ? "bg-ink text-white"
                : "border border-border-strong bg-white"
            }`}
          >
            {picked ? "✓ Selected" : "Select for introduction"}
          </button>
          <button
            onClick={() => router.push(`/grants/${grantId}/collaborate`)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
}
