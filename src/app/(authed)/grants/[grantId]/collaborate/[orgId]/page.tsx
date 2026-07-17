"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ORG_PROFILES } from "@/data/seed";
import WarmIntroModal from "@/components/WarmIntroModal";
import BackButton from "@/components/BackButton";

export default function OrgProfilePage() {
  const { grantId = "", orgId = "" } = useParams<{
    grantId: string;
    orgId: string;
  }>();
  const profile = ORG_PROFILES[orgId];
  const contactRequested = useAppStore((s) => s.contactRequested[orgId]);
  const requestContact = useAppStore((s) => s.requestContact);
  const addToast = useAppStore((s) => s.addToast);
  const [emailOpen, setEmailOpen] = useState(false);

  if (!profile) {
    return (
      <div className="mx-auto w-full animate-nc-rise px-8 pt-7 pb-20">
        <p className="leading-relaxed">Organization not found.</p>
      </div>
    );
  }

  const requestIntro = () => {
    requestContact(orgId);
    addToast("Requested - pending approval and consent.");
  };

  // "Shares a funder with you" signals were removed product-wide; only the
  // remaining observable signals (overlap, distance) surface here.
  const signals = profile.signals.filter(
    (s) => !s.label.toLowerCase().includes("shares a funder"),
  );

  return (
    <div className="mx-auto w-full animate-nc-rise px-8 pt-7 pb-20">
      <BackButton fallback={`/grants/${grantId}/collaborate`} />
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-accent" />
          <div className="min-w-50 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-serif text-2xl leading-tight font-medium">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                NSR Client
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
              SHARED WITH CONSENT
            </div>
            <div className="text-sm">
              <strong>{profile.contactName}</strong>
            </div>
            <div className="text-sm">{profile.contactPhone}</div>
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-info-border-2 bg-info-bg-2 p-4">
            <div className="mb-2 text-xs font-bold text-info-ink">
              CONTACT KEPT PRIVATE
            </div>
            <p className="mb-3 text-sm leading-normal">
              This organization hasn&apos;t made their contact details public.
              Sharing them takes a few human steps: requests are reviewed,
              consent is obtained, and contact details are shared separately.
            </p>
            {contactRequested ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-bold text-warning-ink">
                ⏳ Requested - pending approval and consent
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

        {signals.length > 0 && (
          <>
            <div className="mb-2.5 text-sm font-bold">
              Why the AI surfaced this organization
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {signals.map((sig) => (
                <span
                  key={sig.label}
                  title={sig.source}
                  className="inline-flex items-center gap-1 rounded-full border border-info-border bg-info-bg px-3 py-1 text-xs font-bold text-info-ink"
                >
                  ◷ {sig.label}{" "}
                  <span className="text-[10px] leading-none">ⓘ</span>
                </span>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-2.5 border-t border-divider-2 pt-5">
          <button
            onClick={() => setEmailOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send a warm introduction
          </button>
        </div>
      </div>

      {emailOpen && (
        <WarmIntroModal org={profile} onClose={() => setEmailOpen(false)} />
      )}
    </div>
  );
}
