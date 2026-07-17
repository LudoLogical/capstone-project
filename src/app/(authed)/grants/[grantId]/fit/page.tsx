"use client";

import { useParams, useRouter } from "next/navigation";
import { useGrantView } from "@/store/derived";
import { ACCOUNT_ORG_NAME } from "@/data/seed";
import CiteButton from "@/components/CiteButton";
import JargonTerm from "@/components/JargonTerm";
import BackButton from "@/components/BackButton";
import Icon from "@/components/Icon";

const PROS = [
  "You work in the exact neighborhoods this funder targets.",
  "Your requested range sits comfortably within the award size.",
  "Your issue tags line up directly with this grant's focus areas.",
];

const CONS = [
  "This funder has historically favored applicants with an existing relationship - consider requesting a warm introduction.",
  "Your reporting history for a grant of this size is still thin - pair your application with strong baseline data.",
];

export default function FitAnalysisPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);

  if (!view) return null;
  const { grant } = view;

  return (
    <div className="mx-auto w-full px-8 pt-7 pb-20 animate-nc-rise">
      <BackButton fallback={`/grants/${grant.id}`} />

      <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
        <Icon name="bar-chart" size={12} />
          AI-ASSISTED
      </div>
      <h1 className="mb-3.5 font-serif text-3xl leading-tight font-bold">
        How {grant.name} fits {ACCOUNT_ORG_NAME}
      </h1>

      <div className="mb-5 rounded-xl border border-info-border-2 bg-info-bg-2 p-4 text-sm leading-normal text-ink-body">
        This estimate is based on 18 past funded applications with a similar
        profile. <CiteButton provenanceKey="fit" label="See sources" />
        <div className="mt-2 text-ink-muted">
          AI can make mistakes. This is not a judgment about whether you&apos;ll
          be awarded the grant.
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-2.5 text-sm font-bold">
          <JargonTerm termKey="fit">Estimated fit</JargonTerm>
        </div>
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-success-border bg-success-bg px-3 py-1 text-xs font-bold text-success-ink">
            Strong alignment
          </span>
        </div>
        <p className="text-sm leading-normal text-ink-muted">
          Your service area, focus, and requested funding range all line up
          closely with what this funder has historically supported.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3.5">
        <div className="rounded-xl border border-success-border-2 bg-success-bg-2 p-4">
          <div className="mb-2.5 text-sm font-bold text-success-ink">
            Why it&apos;s a good fit
          </div>
          <ul className="flex list-disc flex-col gap-2 pl-4">
            {PROS.map((p) => (
              <li key={p} className="text-sm leading-normal">
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-warning-border-2 bg-warning-bg-2 p-4">
          <div className="mb-2.5 text-sm font-bold text-warning-ink">
            ! Worth considering
          </div>
          <ul className="flex list-disc flex-col gap-2 pl-4">
            {CONS.map((c) => (
              <li key={c} className="text-sm leading-normal">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => router.push(`/grants/${grant.id}/collect`)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-5 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start collecting supporting data
        </button>
        <button
          onClick={() => router.push(`/grants/${grant.id}/collaborate`)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-white px-5 py-3 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Find a partner
        </button>
      </div>
    </div>
  );
}
