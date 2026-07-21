"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGrantView } from "@/store/derived";
import {
  INTERESTED_BY_GRANT,
  ORG_PROFILES,
  type OrgProfileContent,
} from "@/data/seed";
import WarmIntroModal from "@/components/modals/WarmIntroModal";
import BackButton from "@/components/primitives/BackButton";
import OrgAvatar from "@/components/primitives/OrgAvatar";
import { Users } from "lucide-react";

export default function CollaboratePage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const [emailOrg, setEmailOrg] = useState<OrgProfileContent | null>(null);
  const [sentOrgs, setSentOrgs] = useState<Record<string, boolean>>({});

  if (!view) return null;
  const { grant } = view;

  const orgIds = INTERESTED_BY_GRANT[grant.id] ?? [];
  const orgs = orgIds.map((id) => ORG_PROFILES[id]).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl animate-nc-rise px-8 pt-7 pb-16">
      <BackButton fallback={`/grants/${grant.id}`} />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-tint-2 text-xl">
          <Users size={22} />
        </div>
        <h1 className="font-serif text-3xl leading-tight font-bold">
          Who&apos;s open to collaborating
        </h1>
      </div>
      <p className="mt-3 mb-6 w-full max-w-2xl text-sm leading-relaxed text-ink-muted">
        New Sun Rising client organizations who opted in for{" "}
        <strong className="text-ink">{grant.name}</strong>. The Vibrancy Portal
        facilitates warm introductions, but each one is authored and sent by a
        real person, not a robot.
      </p>

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-9 text-center">
          <p className="text-sm leading-relaxed text-ink-muted">
            No organizations are currently open to collaborating on this grant.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {orgs.map((org) => {
            const sent = !!sentOrgs[org.initiativeId];
            return (
              <div
                key={org.initiativeId}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start gap-3">
                  <OrgAvatar size="md" />
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

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEmailOrg(org)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition duration-150 ${
                      sent
                        ? "border-success-border bg-success-bg text-success-ink"
                        : "border-transparent bg-accent-ink text-white shadow-cta hover:bg-accent-ink-2 active:translate-y-px"
                    }`}
                  >
                    {sent ? "Introduced" : "Send warm introduction"}
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/grants/${grant.id}/collaborate/${org.initiativeId}`,
                      )
                    }
                    className="rounded-lg border border-border-strong bg-white px-3 py-2 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
                  >
                    View profile
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
    </div>
  );
}
