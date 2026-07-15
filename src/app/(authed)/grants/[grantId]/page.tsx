"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import { GrantLifecycleStage } from "@/types/grantRecord";
import { formatCurrencyFull, formatDate } from "@/utils/format";
import { INTERESTED_BY_GRANT, ORG_PROFILES } from "@/data/seed";
import ShareModal from "@/components/ShareModal";
import BackButton from "@/components/BackButton";

/** Initials for an org avatar chip, e.g. "Hilltop Harvest" → "HH". */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// "How your work lines up" - the fit read, expressed as sourced observations
// rather than a single score (see items 2 & 9). Each line traces back to your
// living profile or the funder's stated priorities.
type AlignmentPoint = { text: string; source: string };

const STRENGTHS: AlignmentPoint[] = [
  {
    text: "You work in the neighborhoods this funder targets.",
    source: "Your living profile · Who We Serve → Service area",
  },
  {
    text: "Your requested range sits comfortably within this grant's award size.",
    source: "Funder · stated award size",
  },
  {
    text: "Your focus areas line up directly with this grant's priorities.",
    source: "Your living profile · issue tags",
  },
];

const GAPS: AlignmentPoint[] = [
  {
    text: "This funder has favored applicants with an existing relationship - consider requesting a warm introduction.",
    source: "Funder · past awardee patterns",
  },
  {
    text: "Your reporting history for a grant of this size is still thin - pair your application with strong baseline data.",
    source: "Your records · reporting history",
  },
];

function formatReportFrequency(months: number): string {
  if (months < 0) return "None required";
  if (months === 0) return "Single report";
  if (months === 12) return "Annually";
  return `Every ${months} months`;
}

function TimelineCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-divider-2 p-3.5">
      <div className="mb-1 text-xs text-ink-muted">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
      <div className="mb-3 text-base font-bold">{title}</div>
      {children}
    </div>
  );
}

function BulletList({
  items,
  ordered = false,
}: {
  items: string[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-body">
          <span
            aria-hidden
            className="flex-none font-bold text-accent-ink-2"
          >
            {ordered ? `${i + 1}.` : "•"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

export default function GrantDetailPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const discoverable = useAppStore((s) => s.discoverable[grantId]);
  const startApplication = useAppStore((s) => s.startApplication);
  const awardedMark = useAppStore((s) => s.awardedGrants[grantId]);
  const setAwarded = useAppStore((s) => s.setAwarded);
  const addToast = useAppStore((s) => s.addToast);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareOrgId, setShareOrgId] = useState<string | null>(null);

  if (!view) {
    return (
      <div className="p-10 animate-nc-rise">
        <p className="leading-relaxed">Grant not found.</p>
      </div>
    );
  }

  const { grant, stage, seedStage } = view;
  const saved = isSavedStage(stage);
  const isAwarded =
    seedStage === GrantLifecycleStage.Awarded ||
    seedStage === GrantLifecycleStage.Reported ||
    !!awardedMark;

  const toggleSave = () => {
    openCouplingModal(saved ? "unsave" : "save", grant.id);
  };
  const toggleCollaborate = () => {
    openCouplingModal(discoverable ? "uncollab" : "discover", grant.id);
  };

  // Grey when off, orange (accent) when on - see items 6 & 8.
  const toggleClass = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 ${
      on
        ? "bg-accent text-white shadow-cta hover:brightness-105"
        : "border border-border-strong bg-white text-ink hover:border-accent"
    }`;

  const collabOrgs = (INTERESTED_BY_GRANT[grant.id] ?? [])
    .map((id) => ORG_PROFILES[id])
    .filter(Boolean);

  return (
    <div className="mx-auto w-full px-8 pt-7 pb-20 animate-nc-rise">
      <BackButton fallback="/search" />

      <div className="mb-5 rounded-2xl border border-border bg-surface p-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 font-serif text-3xl">{grant.name}</div>
            <div className="text-sm text-ink-muted">
              {grant.grantor} ·{" "}
              {grant.targetRegions.map((r) => r.name).join(", ")}
            </div>
          </div>
          <div className="flex flex-none flex-wrap gap-2.5">
            <button onClick={toggleSave} className={toggleClass(saved)}>
              {saved ? "★ Saved for Later" : "☆ Save for Later"}
            </button>
            <button
              onClick={toggleCollaborate}
              className={toggleClass(!!discoverable)}
            >
              {discoverable
                ? "🤝 Open to Collaborate"
                : "🤝 List as Open to Collaborate"}
            </button>
          </div>
        </div>
        <a
          href={grant.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink no-underline transition duration-150 hover:border-accent"
        >
          View grant on website ↗
        </a>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-accent-ink-2">
            {formatCurrencyFull(grant.award.totalAmount)} total
          </span>
          <span className="text-sm text-ink-muted">
            · {formatCurrencyFull(grant.award.annualAmount)}/year avg over{" "}
            {grant.timeline.awardTerm} months
          </span>
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
          <TimelineCell
            label="Applications open"
            value={formatDate(grant.timeline.applicationWindowStart)}
          />
          <TimelineCell
            label="Applications close"
            value={formatDate(grant.timeline.applicationWindowEnd)}
          />
          <TimelineCell
            label="Decision by"
            value={formatDate(grant.timeline.notificationDate)}
          />
          <TimelineCell
            label="Award term"
            value={`${grant.timeline.awardTerm} months`}
          />
          <TimelineCell
            label="First report due"
            value={
              grant.timeline.reportFrequency < 0
                ? "Not required"
                : formatDate(grant.timeline.firstReportDeadline)
            }
          />
          <TimelineCell
            label="Reporting frequency"
            value={formatReportFrequency(grant.timeline.reportFrequency)}
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share link
          </button>
        </div>
      </div>

      {grant.requirements.eligibility.length > 0 && (
        <DetailCard title="Eligibility">
          <BulletList items={grant.requirements.eligibility} />
        </DetailCard>
      )}

      {grant.requirements.application.length > 0 && (
        <DetailCard title="Requirement checklist">
          <p className="mb-3.5 text-xs leading-relaxed text-ink-muted">
            Built from this funder&apos;s past requirements - a starting point
            for where to begin, not the official list. Always check it against{" "}
            {grant.grantor}&apos;s own guidelines.
          </p>
          <BulletList items={grant.requirements.application} ordered />
        </DetailCard>
      )}

      {grant.requirements.awardee.length > 0 && (
        <DetailCard title="If you're awarded, you'll need to">
          <BulletList items={grant.requirements.awardee} />
        </DetailCard>
      )}

      {/* How your work lines up - the fit read, no score (items 2 & 9) */}
      <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
          ✦ AI-ASSISTED
        </div>
        <div className="mt-2.5 text-base font-bold">How your work lines up</div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Traced to your records and this funder&apos;s stated priorities.
          It&apos;s input for your call, not a yes/no.
        </p>

        <div className="mt-4 text-xs font-bold tracking-wider text-success-ink uppercase">
          Working in your favor
        </div>
        <div className="mt-2.5 flex flex-col gap-2.5">
          {STRENGTHS.map((s) => (
            <div
              key={s.text}
              className="rounded-xl border border-success-border-2 bg-success-bg-2 px-4 py-3"
            >
              <div className="text-sm leading-relaxed text-ink-body">
                {s.text}
              </div>
              <div className="mt-1 text-xs text-ink-muted">{s.source}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs font-bold tracking-wider text-warning-ink uppercase">
          Where to strengthen
        </div>
        <div className="mt-2.5 flex flex-col gap-2.5">
          {GAPS.map((g) => (
            <div
              key={g.text}
              className="rounded-xl border border-warning-border-2 bg-warning-bg-2 px-4 py-3"
            >
              <div className="text-sm leading-relaxed text-ink-body">
                {g.text}
              </div>
              <div className="mt-1 text-xs text-ink-muted">{g.source}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizations open to collaborating on this grant (item 2) */}
      <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
        <div className="text-base font-bold">
          Organizations open to collaborating on this
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          New Sun Rising members who opted in for this grant. Every introduction
          is one human reaching out to another - you write it, you send it, you
          decide.
        </p>
        {collabOrgs.length === 0 ? (
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            No organizations are open to collaborating on this grant yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {collabOrgs.slice(0, 4).map((org) => (
              <div
                key={org.initiativeId}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3"
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-radial from-accent-warm to-accent to-70% text-xs font-bold text-white">
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
                <button
                  onClick={() => setShareOrgId(org.initiativeId)}
                  aria-label={`Share ${org.name}`}
                  className="flex-none rounded-lg border border-border-strong bg-white px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
                >
                  ↗ Share
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => router.push(`/grants/${grant.id}/collaborate`)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
        >
          See detail →
        </button>
      </div>

      <div className="flex flex-col flex-wrap gap-3.5">
        {isAwarded ? (
          <div className="rounded-2xl border border-success-border bg-success-bg px-6 py-5">
            <div className="mb-1.5 text-base font-bold text-success-ink">
              🏆 You&apos;ve won this grant
            </div>
            <p className="mb-3.5 text-sm leading-relaxed text-ink-body">
              It now lives under Report for Awarded Grants on your dashboard.
              Turn your records into an outcome report when you&apos;re ready.
            </p>
            <button
              onClick={() => router.push(`/grants/${grant.id}/report`)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105"
            >
              Go to outcome report →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent-tint-border bg-linear-to-br from-accent-tint-soft to-accent-tint px-6 py-5">
            <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
              ✦ AI-ASSISTED
            </div>
            <div className="mb-1.5 text-base font-bold">Ready to apply?</div>
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              We&apos;ll help you gather your context and supporting data first -
              you choose what to share. This adds the grant to Data for Grant
              Applications on your dashboard.
            </p>
            <button
              onClick={() => {
                startApplication(grant.id);
                router.push(`/grants/${grant.id}/collect`);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✦ Start Gathering Data for Application
            </button>
          </div>
        )}
      </div>

      {!isAwarded && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-6 py-5">
          <div className="min-w-56 flex-1">
            <div className="mb-1 text-base font-bold">
              Already won this grant?
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Mark it as awarded to move it into Report for Awarded Grants and
              start your outcome report.
            </p>
          </div>
          <button
            onClick={() => {
              setAwarded(grant.id, true);
              addToast("Marked as awarded. Find it under your reports.");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            🏆 Mark as awarded
          </button>
        </div>
      )}

      {shareOpen && (
        <ShareModal
          name={grant.name}
          link={typeof window !== "undefined" ? window.location.href : grant.link}
          onClose={() => setShareOpen(false)}
        />
      )}

      {shareOrgId &&
        (() => {
          const org = ORG_PROFILES[shareOrgId];
          if (!org) return null;
          const base =
            typeof window !== "undefined" ? window.location.origin : "";
          return (
            <ShareModal
              title="Share this organization"
              name={`${org.name} · Serves ${org.place}`}
              link={`${base}/grants/${grant.id}/collaborate/${org.initiativeId}`}
              onClose={() => setShareOrgId(null)}
            />
          );
        })()}
    </div>
  );
}
