"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ORG_PROFILES } from "@/data/seed";
import WarmIntroModal from "@/components/modals/WarmIntroModal";
import BackButton from "@/components/primitives/BackButton";
import OrgAvatar from "@/components/primitives/OrgAvatar";

export default function OrgProfilePage() {
  const { grantId = "", orgId = "" } = useParams<{
    grantId: string;
    orgId: string;
  }>();
  const profile = ORG_PROFILES[orgId];
  const [emailOpen, setEmailOpen] = useState(false);

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-4xl animate-nc-rise px-8 pt-7 pb-28">
        <p className="leading-relaxed">Organization not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl animate-nc-rise px-8 pt-7 pb-28">
      <BackButton fallback={`/grants/${grantId}/collaborate`} />
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <OrgAvatar size="lg" />
          <div className="min-w-50 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-serif text-xl leading-tight font-bold">
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

        <div className="mb-2.5 text-sm font-bold">Communities served</div>
        <div className="mb-5 flex flex-wrap gap-2">
          {profile.areas.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface-alt px-3 py-1 text-xs font-bold text-ink-secondary"
            >
              {a}
            </span>
          ))}
        </div>

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
