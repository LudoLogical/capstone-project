"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView, isSavedStage } from "@/store/derived";
import { GrantLifecycleStage } from "@/types/grantRecord";
import {
  formatCurrencyFull,
  formatDate,
  formatReportFrequency,
} from "@/utils/format";
import { INTERESTED_BY_GRANT, ORG_PROFILES } from "@/data/seed";
import BackButton from "@/components/primitives/BackButton";
import OrgAvatar from "@/components/primitives/OrgAvatar";
import ClosedGrantModal from "@/components/modals/ClosedGrantModal";
import DetailCard from "@/components/primitives/DetailCard";
import BulletList from "@/components/primitives/BulletList";
import TimelineCell from "@/app/grants/[grantId]/TimelineCell";
import {
  Star,
  BarChart3,
  ExternalLink,
  ArrowRight,
  Copy,
  TriangleAlert,
} from "lucide-react";

export default function GrantDetailPage() {
  const { grantId = "" } = useParams<{ grantId: string }>();
  const router = useRouter();
  const view = useGrantView(grantId);
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const discoverable = useAppStore((s) => s.discoverable[grantId]);
  const startApplication = useAppStore((s) => s.startApplication);
  const setGrantStatus = useAppStore((s) => s.setGrantStatus);
  const clearGrantStatus = useAppStore((s) => s.clearGrantStatus);
  const addToast = useAppStore((s) => s.addToast);
  const [closedOpen, setClosedOpen] = useState(false);
  const setStage = useAppStore((s) => s.setStage);
  const setDiscoverable = useAppStore((s) => s.setDiscoverable);

  if (!view) {
    return (
      <div className="p-10 animate-nc-rise">
        <p className="leading-relaxed">Grant not found.</p>
      </div>
    );
  }

  const { grant, stage } = view;
  const saved = isSavedStage(stage);
  const isAwarded = view.status === "awarded";

  // A closed grant can't be picked up: saving and listing to collaborate are
  // blocked outright. Un-saving / un-listing stays available so the user can
  // still clear it off their board.
  const closed = view.isClosed;
  const toggleSave = () => {
    if (closed && !saved) return setClosedOpen(true);
    openCouplingModal(saved ? "unsave" : "save", grant.id);
  };
  const toggleCollaborate = () => {
    if (closed && !discoverable) return setClosedOpen(true);
    openCouplingModal(discoverable ? "uncollab" : "discover", grant.id);
  };

  // Grey when off, orange (accent) when on. A closed grant never gets the
  // orange treatment - there's nothing to opt into.
  const toggleClass = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 ${
      on
        ? "bg-accent-ink text-white shadow-cta hover:bg-accent-ink-2 active:translate-y-px"
        : closed
          ? "border border-border-strong bg-divider-2 text-ink-muted hover:bg-border-strong"
          : "border border-border-strong bg-white text-ink hover:border-accent"
    }`;

  // Copies the funder's own URL - the same destination as "View grant on
  // website", not this page.
  const copyLink = () => {
    navigator.clipboard
      ?.writeText(grant.link)
      .then(() => addToast("Link copied."))
      .catch(() => addToast("Couldn't copy the link."));
  };

  const collabOrgs = (INTERESTED_BY_GRANT[grant.id] ?? [])
    .map((id) => ORG_PROFILES[id])
    .filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-3xl px-8 pt-7 pb-16 animate-nc-rise">
      <BackButton fallback="/search" />

      <div className="mb-5 rounded-2xl border border-border bg-surface p-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 font-serif text-3xl font-bold">
              {grant.name}
            </div>
            <p className="text-sm text-ink-muted">
              {grant.grantor} ·{" "}
              {grant.targetRegions.map((r) => r.name).join(", ")}
            </p>
          </div>
          <div className="flex flex-none flex-wrap gap-2.5">
            <button onClick={toggleSave} className={toggleClass(saved)}>
              <Star
                size={14}
                fill={saved ? "currentColor" : "none"}
                className="shrink-0"
              />
              {saved ? "Saved for Later" : "Save for Later"}
            </button>
            <button
              onClick={toggleCollaborate}
              className={toggleClass(!!discoverable)}
            >
              {discoverable
                ? "Open to Collaborate"
                : "List as Open to Collaborate"}
            </button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2.5">
          <a
            href={grant.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink no-underline transition duration-150 hover:border-accent"
          >
            View grant on website{" "}
            <ExternalLink size={15} className="shrink-0" />
          </a>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            <Copy size={15} className="shrink-0" /> Copy link
          </button>
        </div>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-accent-ink-2">
            {formatCurrencyFull(grant.award.totalAmount)} total
          </span>
          <span className="text-sm text-ink-muted">
            · {formatCurrencyFull(grant.award.annualAmount)}/year avg. over{" "}
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

        <div className="flex items-start gap-2.5 rounded-xl border border-warning-border bg-warning-bg px-4 py-3.5">
          <TriangleAlert
            size={16}
            className="mt-0.5 flex-none text-warning-ink"
          />
          <div className="text-sm leading-relaxed text-warning-ink">
            <strong>
              Confirm these details on{" "}
              <a
                href={grant.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-warning-ink underline underline-offset-2"
              >
                {grant.grantor}&apos;s website
              </a>{" "}
              before you apply.
              <br />
            </strong>
            The info on this page was gathered using AI, which can make
            mistakes.
            <br />
            Also, some details might have changed since this grant entered our
            database.
          </div>
        </div>
      </div>

      {grant.requirements.eligibility.length > 0 && (
        <DetailCard title="Eligibility">
          <p className="mb-3.5 text-xs leading-relaxed text-ink-muted">
            Pulled from the official listing using AI; verify before applying.
          </p>
          <BulletList items={grant.requirements.eligibility} />
        </DetailCard>
      )}

      {grant.requirements.application.length > 0 && (
        <DetailCard title="Application Requirements">
          <p className="mb-3.5 text-xs leading-relaxed text-ink-muted">
            Pulled from the official listing using AI; verify before applying.
          </p>
          <BulletList items={grant.requirements.application} ordered />
        </DetailCard>
      )}

      {grant.requirements.awardee.length > 0 && (
        <DetailCard title="Awardee Responsibilities">
          <p className="mb-3.5 text-xs leading-relaxed text-ink-muted">
            Pulled from the official listing using AI; verify before applying.
          </p>
          <BulletList items={grant.requirements.awardee} />
        </DetailCard>
      )}

      {/* How your work lines up - the fit read, no score (items 2 & 9) */}
      <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
          <BarChart3 size={12} />
          AI-ASSISTED
        </div>
        <div className="mt-2.5 text-base font-bold">How your work lines up</div>
        {view.alignmentAnalysis ? (
          <>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              This analysis is based on your records and the information we have
              about this grant. It can help you decide whether to move forward,
              but take its advice with a grain of salt.
            </p>
            <div className="mt-4 text-xs font-bold tracking-wider text-success-ink uppercase">
              Working in your favor
            </div>
            <div className="mt-2.5">
              <BulletList items={view.alignmentAnalysis.pros} />
            </div>

            <div className="mt-4 text-xs font-bold tracking-wider text-warning-ink uppercase">
              Where to strengthen
            </div>
            <div className="mt-2.5">
              <BulletList items={view.alignmentAnalysis.cons} />
            </div>
          </>
        ) : (
          // No analysis has been generated for this grant yet. The button is
          // intentionally inert: the deployment integration wires it to the
          // generation call and creates the GrantRecord behind it.
          <div className="mt-1.5">
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              Mulling over whether to move forward with this grant? Click below
              to get an AI-generated analysis of what&apos;s working in your
              favor and areas you might want to strengthen based on your records
              and the information we have about this grant. None of your info
              will ever be used to train or improve the AI.
            </p>
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
            >
              <BarChart3 size={14} className="shrink-0" />
              Generate with AI
            </button>
          </div>
        )}
      </div>

      {/* Organizations open to collaborating on this grant (item 2) */}
      {collabOrgs.length > 0 && (
        <div className="mb-3.5 rounded-2xl border border-border bg-surface p-6">
          <div className="text-base font-bold">
            Organizations open to collaborating on this grant
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            New Sun Rising members who opted in for this grant. Every
            introduction is one human reaching out to another - you write it,
            you send it, you decide.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {collabOrgs.slice(0, 4).map((org) => (
              <div
                key={org.initiativeId}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3"
              >
                <OrgAvatar size="sm" />
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() =>
                      router.push(
                        `/grants/${grant.id}/collaborate/${org.initiativeId}`,
                      )
                    }
                    className="block text-left text-sm leading-tight font-bold transition duration-150 hover:text-accent"
                  >
                    {org.name}
                  </button>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    Serves {org.place}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push(`/grants/${grant.id}/collaborate`)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            See details <ArrowRight size={16} className="shrink-0" />
          </button>
        </div>
      )}

      <div className="flex flex-col flex-wrap gap-3.5">
        {isAwarded ? (
          <div className="rounded-2xl border border-accent-tint-border bg-accent-tint-soft px-6 py-5">
            <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
              <BarChart3 size={12} />
              AI-ASSISTED
            </div>
            <div className="mb-1.5 text-base font-bold">
              You&apos;ve won this grant!
            </div>
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              You can find it in the &quot;awarded&quot; section of your
              dashboard. When you&apos;re ready, we can help you gather
              supporting data and weave it into your outcome report(s).
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => router.push(`/grants/${grant.id}/report`)}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
              >
                {view.reportStarted ? "Continue" : "Start"} gathering data for
                report(s) <ArrowRight size={16} className="shrink-0" />
              </button>
              {view.status === "awarded" && (
                <button
                  onClick={() => {
                    clearGrantStatus(grant.id);
                    addToast("Reverted - no longer marked as awarded.");
                  }}
                  className="text-sm font-semibold text-ink-muted underline underline-offset-2 transition duration-150 hover:text-ink"
                >
                  Mark this grant as not awarded
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent-tint-border bg-accent-tint-soft px-6 py-5">
            <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-xs font-bold text-accent-ink">
              <BarChart3 size={12} />
              AI-ASSISTED
            </div>
            <div className="mb-1.5 text-base font-bold">Ready to apply?</div>
            <p className="mb-3.5 text-sm leading-relaxed text-ink-muted">
              We&apos;ll help you gather supporting data and weave it into your
              application. We&apos;ll also move this grant to the applications
              section in your dashboard.
            </p>
            <button
              onClick={() => {
                startApplication(grant.id);
                router.push(`/grants/${grant.id}/apply`);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              {view.writingStarted ? "Continue" : "Start"} gathering data for
              application
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
              Let us know to start gathering data for your outcome report(s)
              instead.
            </p>
          </div>
          <button
            onClick={() => {
              setGrantStatus(grant.id, "awarded");
              addToast("Marked as awarded. Find it under your reports.");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            Mark as awarded
          </button>
        </div>
      )}

      {closedOpen && (
        <ClosedGrantModal
          grantName={grant.name}
          closedOn={grant.timeline.applicationWindowEnd}
          onClose={() => setClosedOpen(false)}
          onRemove={() => {
            setStage(grant.id, GrantLifecycleStage.Unsaved);
            setDiscoverable(grant.id, false);
            setClosedOpen(false);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
