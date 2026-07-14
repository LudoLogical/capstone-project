"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import { formatCurrencyFull, formatDate } from "@/utils/format";
import JargonTerm from "@/components/JargonTerm";

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
          {grant.name}
        </div>
        <div className="mb-4 text-sm text-ink-muted">
          {grant.grantor} · {grant.targetRegions.map((r) => r.name).join(", ")}
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

      {grant.award.benefits.length > 0 && (
        <DetailCard title="What's included beyond the funding">
          <BulletList items={grant.award.benefits} />
        </DetailCard>
      )}

      {grant.requirements.eligibility.length > 0 && (
        <DetailCard title="Who's eligible">
          <BulletList items={grant.requirements.eligibility} />
        </DetailCard>
      )}

      {grant.requirements.application.length > 0 && (
        <DetailCard title="How to apply">
          <BulletList items={grant.requirements.application} ordered />
        </DetailCard>
      )}

      {grant.requirements.awardee.length > 0 && (
        <DetailCard title="If you're awarded, you'll need to">
          <BulletList items={grant.requirements.awardee} />
        </DetailCard>
      )}

      {grant.requirements.reporting.length > 0 && (
        <DetailCard title="Reporting requirements">
          <div className="flex flex-col gap-3.5">
            {grant.requirements.reporting.map((r) => (
              <div key={r.shortName}>
                <div className="text-sm font-bold text-ink">{r.shortName}</div>
                <div className="text-sm leading-relaxed text-ink-body">
                  {r.statement}
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      )}

      <div className="flex flex-col flex-wrap gap-3.5">
        {(grant.guidance.application.length > 0 ||
          grant.guidance.reporting.length > 0) && (
          <div className="rounded-2xl border border-accent-tint-border bg-linear-to-br from-accent-tint-soft to-accent-tint px-6 py-5">
            <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
              ✦ AI-ASSISTED
            </div>
            <div className="mb-3 text-base font-bold">
              How to make your submission stronger
            </div>
            {grant.guidance.application.length > 0 && (
              <div className="mb-3.5">
                <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  For your application
                </div>
                <BulletList items={grant.guidance.application} />
              </div>
            )}
            {grant.guidance.reporting.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  For your reports
                </div>
                <BulletList items={grant.guidance.reporting} />
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-accent-tint-border bg-linear-to-br from-accent-tint-soft to-accent-tint px-6 py-5">
          <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
            ✦ AI-ASSISTED
          </div>
          <div className="mb-1.5 text-base font-bold">
            See how well this fits you
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
