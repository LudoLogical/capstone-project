"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGrantView } from "@/store/derived";
import {
  INTERESTED_BY_GRANT,
  ORG_PROFILES,
  type OrgProfileContent,
} from "@/data/seed";
import WarmIntroModal from "@/components/WarmIntroModal";
import ShareModal from "@/components/ShareModal";
import BackButton from "@/components/BackButton";
import { Users, ArrowUpRight } from "lucide-react";

/** Initials for the avatar chip, e.g. "Hilltop Harvest Collective" → "HH". */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CollaboratePage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const [emailOrg, setEmailOrg] = useState<OrgProfileContent | null>(null);
  const [shareOrg, setShareOrg] = useState<OrgProfileContent | null>(null);
  const [sentOrgs, setSentOrgs] = useState<Record<string, boolean>>({});

  if (!view) return null;
  const { grant } = view;

  const orgIds = INTERESTED_BY_GRANT[grant.id] ?? [];
  const orgs = orgIds.map((id) => ORG_PROFILES[id]).filter(Boolean);

  return (
    <div className="mx-auto w-full animate-nc-rise px-8 pt-7 pb-20">
      <BackButton fallback={`/grants/${grant.id}`} />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-tint-2 text-xl">
          <Users size={22} />
        </div>
        <h1 className="font-serif text-3xl leading-tight font-bold">
          Who&apos;s open to collaborating
        </h1>
      </div>
      <p className="mt-3 mb-6 max-w-2xl text-sm leading-relaxed text-ink-muted">
        New Sun Rising members who opted in for{" "}
        <strong className="text-ink">{grant.name}</strong>. Every introduction
        is one human reaching out to another -{" "}
        <strong className="text-ink">
          you write it, you send it, you decide.
        </strong>
      </p>

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-9 text-center">
          <p className="text-sm leading-relaxed text-ink-muted">
            No organizations are currently open to collaborating on this grant.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {orgs.map((org) => {
            const sent = !!sentOrgs[org.initiativeId];
            return (
              <div
                key={org.initiativeId}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {initialsOf(org.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-tight font-bold">
                      {org.name}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted">
                      Serves {org.place}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {org.mission}
                </p>

                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/grants/${grant.id}/collaborate/${org.initiativeId}`,
                      )
                    }
                    className="flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
                  >
                    View profile
                  </button>
                  <button
                    onClick={() => setEmailOrg(org)}
                    className={`flex-none rounded-lg px-3 py-2 text-sm font-semibold transition duration-150 ${
                      sent
                        ? "border border-success-border bg-success-bg text-success-ink"
                        : "bg-accent-ink text-white shadow-cta hover:bg-accent-ink-2 active:translate-y-px"
                    }`}
                  >
                    {sent ? "Introduced" : "Email"}
                  </button>
                  <button
                    onClick={() => setShareOrg(org)}
                    aria-label={`Share ${org.name}`}
                    className="inline-flex flex-none items-center gap-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
                  >
                    <ArrowUpRight size={14} className="shrink-0" /> Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {emailOrg && (
        <WarmIntroModal
          org={emailOrg}
          onClose={() => setEmailOrg(null)}
          onSent={(org) =>
            setSentOrgs((prev) => ({ ...prev, [org.initiativeId]: true }))
          }
        />
      )}

      {shareOrg && (
        <ShareModal
          title="Share this organization"
          name={`${shareOrg.name} · Serves ${shareOrg.place}`}
          link={
            typeof window !== "undefined"
              ? `${window.location.origin}/grants/${grant.id}/collaborate/${shareOrg.initiativeId}`
              : `/grants/${grant.id}/collaborate/${shareOrg.initiativeId}`
          }
          onClose={() => setShareOrg(null)}
        />
      )}
    </div>
  );
}
