"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STORIES } from "@/data/seed";
import {
  useAppStore,
  ARCHIVE_FILTERS,
  STATUS_LABEL,
  type GrantStatus,
} from "@/store/useAppStore";
import {
  isPastDecisionDate,
  nextReportDeadline,
  useDashboardGroups,
  useOrgName,
  usePersonName,
} from "@/store/derived";
import { formatDate } from "@/utils/format";
import {
  FileText,
  Award,
  Star,
  Users,
  Send,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import ResolvePastDueModal from "@/components/modals/ResolvePastDueModal";
import Modal from "@/components/primitives/Modal";
import CheckboxRow from "@/components/primitives/CheckboxRow";
import BoardColumn from "@/components/grants/BoardColumn";
import SectionLabel from "@/app/SectionLabel";
import GrantMiniCard from "@/app/GrantMiniCard";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const openCouplingModal = useAppStore((s) => s.openCouplingModal);
  const onboardOrg = useAppStore((s) => s.onboardOrg);
  const personName = usePersonName();
  const orgName = useOrgName();
  const setGrantStatus = useAppStore((s) => s.setGrantStatus);
  const submitReport = useAppStore((s) => s.submitReport);
  const deleteGrant = useAppStore((s) => s.deleteGrant);
  const startApplication = useAppStore((s) => s.startApplication);
  const reportsSubmitted = useAppStore((s) => s.reportsSubmitted);
  // The closed grant whose "you can't work on this" prompt is open.
  const [closedGrantId, setClosedGrantId] = useState<string | null>(null);
  // Archived-grant permanent delete: confirmation + a 5-minute "don't ask"
  // window (kept in a ref so it survives re-renders without persisting).
  const [pendingDeleteGrant, setPendingDeleteGrant] = useState<string | null>(
    null,
  );
  const [dontAskDelete, setDontAskDelete] = useState(false);
  // While true, deletes skip the confirmation; a timeout clears it after 5 min.
  const suppressDeleteRef = useRef(false);
  const requestDeleteGrant = (grantId: string) => {
    if (suppressDeleteRef.current) {
      deleteGrant(grantId);
      addToast("Deleted from your board.");
    } else {
      setDontAskDelete(false);
      setPendingDeleteGrant(grantId);
    }
  };
  const confirmDeleteGrant = () => {
    if (!pendingDeleteGrant) return;
    if (dontAskDelete) {
      suppressDeleteRef.current = true;
      setTimeout(
        () => {
          suppressDeleteRef.current = false;
        },
        5 * 60 * 1000,
      );
    }
    deleteGrant(pendingDeleteGrant);
    addToast("Deleted from your board.");
    setPendingDeleteGrant(null);
  };
  const { inProgress, submitted, awarded, saved, collaborating, archived } =
    useDashboardGroups();
  // Which archived reason the user is filtering to, or "all".
  const [archiveFilter, setArchiveFilter] = useState<GrantStatus | "all">(
    "all",
  );
  const addToast = useAppStore((s) => s.addToast);
  const setDraftFilters = useAppStore((s) => s.setDraftFilters);
  const applyFilters = useAppStore((s) => s.applyFilters);

  const goSearch = () => {
    setDraftFilters({ query });
    applyFilters();
    router.push("/search");
  };

  const showPersonal = true;
  const shownArchived =
    archiveFilter === "all"
      ? archived
      : archived.filter((v) => v.status === archiveFilter);
  const closedGrant =
    [
      ...saved,
      ...collaborating,
      ...inProgress,
      ...submitted,
      ...awarded,
      ...archived,
    ].find((v) => v.grant.id === closedGrantId) ?? null;
  const resolveKind: "deadline" | "decision" | "report" =
    closedGrant?.status === "awarded" ||
    closedGrant?.status === "report-overdue"
      ? "report"
      : closedGrant?.status === "submitted"
        ? "decision"
        : "deadline";
  const resolveDate =
    (resolveKind === "report"
      ? closedGrant?.reportDue
      : resolveKind === "decision"
        ? closedGrant?.grant.timeline.notificationDate
        : closedGrant?.grant.timeline.applicationWindowEnd) ?? new Date();
  // Filing this report ends the grant only when no further deadline follows it.
  const isFinalReport =
    !!closedGrant &&
    nextReportDeadline(
      closedGrant.grant,
      (reportsSubmitted[closedGrant.grant.id] ?? 0) + 1,
    ) === null;
  // Greet by first name, but only once the user has actually given one --
  // `personName` falls back to a stand-in, and "Welcome, Your." reads as a bug.
  const hasPersonName = onboardOrg.person.trim().length > 0;
  const firstName = personName.split(/\s+/)[0];

  return (
    <div className="animate-nc-rise mx-auto w-full max-w-6xl px-8 pt-8 pb-16">
      <div className="mb-6">
        <h1 className="font-serif text-3xl leading-tight font-bold">
          {showPersonal && hasPersonName
            ? `Welcome to the Vibrancy Portal, ${firstName}.`
            : "Welcome to the Vibrancy Portal."}
        </h1>
        {showPersonal && (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-xl font-bold text-ink">{orgName}</span>
            {onboardOrg.areas.length > 0 && (
              <span className="text-sm text-ink-muted">
                - Serving {onboardOrg.areas.join(", ")}
              </span>
            )}
          </div>
        )}
        <p className="mt-3 w-full max-w-2xl text-sm leading-relaxed text-ink-muted">
          This is your home base for grant work. Discover grants that align with
          your organization, find other NSR client organizations to apply with,
          and leverage data to make your impact stories more powerful than ever.
        </p>
      </div>

      {/* ── Compact search: always visible ───────────────────── */}
      <section className="mb-8 rounded-2xl bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch()}
            aria-label="Search for grants by keyword"
            placeholder="Search grants..."
            className="w-full min-w-72 flex-1 rounded-xl border border-border-strong bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            onClick={goSearch}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-ink px-6 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-cta transition duration-150 enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
          >
            Search
          </button>
        </div>
      </section>

      {/* ── Personal grant board: signed-in only ─────────────── */}
      {showPersonal && (
        <div className="mb-10">
          <SectionLabel>Your Grants</SectionLabel>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BoardColumn
              icon={FileText}
              title="Applying"
              tone="accent"
              items={inProgress}
              empty="You aren't applying to any grants right now. Grants will appear here once you've started collecting data to apply for them."
              renderItem={(v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  dueLabel={`Apply by ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                  closed={v.isClosed}
                  onClosedClick={() => setClosedGrantId(v.grant.id)}
                  primary={{
                    label: `${v.writingStarted ? "Continue" : "Start"} gathering data for application`,
                    to: `/grants/${v.grant.id}/apply`,
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                  deadline={v.grant.timeline.applicationWindowEnd}
                  menu={[
                    {
                      label: "Mark as applied",
                      onClick: () => {
                        setGrantStatus(v.grant.id, "submitted");
                        addToast('Marked as applied. Moved to "Submitted".');
                      },
                    },
                    {
                      label: "Mark as withdrawn",
                      danger: true,
                      onClick: () => {
                        setGrantStatus(v.grant.id, "withdrawn");
                        addToast('Marked as withdrawn. Moved to "Archived".');
                      },
                    },
                  ]}
                />
              )}
            />
            <BoardColumn
              icon={Award}
              title="Awarded"
              tone="success"
              items={awarded}
              empty="You don't have any awarded grants right now. Grants will appear here once you let us know that you've won them."
              renderItem={(v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  dueLabel={
                    v.reportDue
                      ? `Report due ${formatDate(v.reportDue)}`
                      : "All reports filed"
                  }
                  deadline={v.reportDue ?? undefined}
                  onClosedClick={() => setClosedGrantId(v.grant.id)}
                  primary={{
                    label: `${v.reportStarted ? "Continue" : "Start"} gathering data for report(s)`,
                    to: `/grants/${v.grant.id}/report`,
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                  menu={[
                    {
                      label: "Mark as completed",
                      onClick: () => {
                        setGrantStatus(v.grant.id, "reported");
                        addToast('Marked as completed. Moved to "Archived".');
                      },
                    },
                    {
                      label: 'Move back to "Applying"',
                      onClick: () => {
                        setGrantStatus(v.grant.id, "applying");
                        addToast('Moved to "Applying".');
                      },
                    },
                    {
                      label: "Mark as withdrawn",
                      danger: true,
                      onClick: () => {
                        setGrantStatus(v.grant.id, "withdrawn");
                        addToast('Marked as withdrawn. Moved to "Archived".');
                      },
                    },
                  ]}
                />
              )}
            />

            <BoardColumn
              icon={Star}
              title="Saved"
              tone="neutral"
              items={saved}
              empty="You don't have any saved grants right now."
              renderItem={(v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  dueLabel={
                    v.isClosed
                      ? `Closed on ${formatDate(v.grant.timeline.applicationWindowEnd)}`
                      : `Closes ${formatDate(v.grant.timeline.applicationWindowEnd)}`
                  }
                  deadline={v.grant.timeline.applicationWindowEnd}
                  closed={v.isClosed}
                  onClosedClick={() => setClosedGrantId(v.grant.id)}
                  primary={{
                    label: `${v.writingStarted ? "Continue" : "Start"} gathering data for application`,
                    onClick: () => {
                      startApplication(v.grant.id);
                      router.push(`/grants/${v.grant.id}/apply`);
                    },
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                  remove={{
                    label: "Remove from Saved Grants",
                    onClick: () => openCouplingModal("unsave", v.grant.id),
                  }}
                />
              )}
            />

            <BoardColumn
              icon={Users}
              title="Open to Collaborate"
              tone="accent"
              items={collaborating}
              empty="You aren't listed as open to collaborate on any grants right now."
              renderItem={(v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  dueLabel={
                    v.isClosed
                      ? `Closed on ${formatDate(v.grant.timeline.applicationWindowEnd)}`
                      : `Closes ${formatDate(v.grant.timeline.applicationWindowEnd)}`
                  }
                  deadline={v.grant.timeline.applicationWindowEnd}
                  closed={v.isClosed}
                  onClosedClick={() => setClosedGrantId(v.grant.id)}
                  primary={{
                    label: "See organizations open to collaboration",
                    to: `/grants/${v.grant.id}/collaborate`,
                  }}
                  secondary={{
                    label: "Grant Details",
                    to: `/grants/${v.grant.id}`,
                  }}
                  remove={{
                    label: "Remove from Collaborate",
                    onClick: () => openCouplingModal("uncollab", v.grant.id),
                  }}
                />
              )}
            />

            {/* Submitted is a waiting room, not an ending: the application is
                with the funder and the answer is still to come. */}
            <BoardColumn
              icon={Send}
              title="Submitted"
              tone="accent"
              items={submitted}
              empty="You aren't waiting to hear back about any grant applications right now. Grants will appear here once you let us know that you've applied for them."
              renderItem={(v) => {
                const decided = isPastDecisionDate(v.grant);
                return (
                  <GrantMiniCard
                    key={v.grant.id}
                    view={v}
                    dueLabel={
                      decided
                        ? `Decision was due ${formatDate(v.grant.timeline.notificationDate)}`
                        : `Decision by ${formatDate(v.grant.timeline.notificationDate)}`
                    }
                    deadline={
                      decided ? undefined : v.grant.timeline.notificationDate
                    }
                    onClosedClick={() => setClosedGrantId(v.grant.id)}
                    secondary={{
                      label: "Grant Details",
                      to: `/grants/${v.grant.id}`,
                    }}
                    menu={[
                      {
                        label: "Mark as awarded",
                        onClick: () => {
                          setGrantStatus(v.grant.id, "awarded");
                          addToast('Marked as awarded. Moved to "Awarded".');
                        },
                      },
                      {
                        label: "Mark as not awarded",
                        onClick: () => {
                          setGrantStatus(v.grant.id, "not-awarded");
                          addToast(
                            'Marked as not awarded. Moved to "Archived".',
                          );
                        },
                      },
                      {
                        label: 'Move back to "Applying"',
                        onClick: () => {
                          setGrantStatus(v.grant.id, "applying");
                          addToast('Moved to "Applying".');
                        },
                      },
                      {
                        label: "Mark as withdrawn",
                        danger: true,
                        onClick: () => {
                          setGrantStatus(v.grant.id, "withdrawn");
                          addToast('Marked as withdrawn. Moved to "Archived".');
                        },
                      },
                    ]}
                  />
                );
              }}
            />

            <BoardColumn
              icon={Bookmark}
              title="Archived"
              tone="neutral"
              items={shownArchived}
              empty="There's nothing in your archive. Grants will appear here once they're no longer relevant to you."
              toolbar={
                <div className="flex flex-wrap gap-1.5">
                  {ARCHIVE_FILTERS.map((f) => {
                    const active = archiveFilter === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => setArchiveFilter(f.key)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1 text-xs font-bold transition duration-150 ${
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-border-strong bg-white text-ink-secondary hover:border-accent"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              }
              renderItem={(v) => {
                // A finished report ended a grant the user actually held, so
                // reopening it belongs in Awarded; every other archive reason
                // ended an application, which reopens in Applying.
                const wasHeld = v.status === "reported";
                return (
                  <GrantMiniCard
                    key={v.grant.id}
                    view={v}
                    badge={v.status ? STATUS_LABEL[v.status] : undefined}
                    dueLabel={`Closed ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                    secondary={{
                      label: "Grant Details",
                      to: `/grants/${v.grant.id}`,
                    }}
                    menu={[
                      wasHeld
                        ? {
                            label: 'Move back to "Awarded"',
                            onClick: () => {
                              setGrantStatus(v.grant.id, "awarded");
                              addToast('Moved to "Awarded".');
                            },
                          }
                        : {
                            label: 'Move back to "Applying"',
                            onClick: () => {
                              setGrantStatus(v.grant.id, "applying");
                              addToast('Moved to "Applying".');
                            },
                          },
                      {
                        label: "Remove permanently",
                        danger: true,
                        onClick: () => requestDeleteGrant(v.grant.id),
                      },
                    ]}
                  />
                );
              }}
            />
          </div>
        </div>
      )}

      {/* ── Success stories: always visible ──────────────────── */}
      <section>
        <SectionLabel>Success stories from our leaders</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((st) => (
            <button
              key={st.id}
              onClick={() => router.push(`/stories/${st.id}`)}
              className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface-alt p-0 text-left transition duration-150 hover:shadow-soft"
            >
              <div className="flex h-32 flex-none items-center justify-center bg-accent text-5xl">
                <span aria-hidden>{st.emoji}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 inline-flex self-start items-center gap-1 rounded-full bg-accent-tint-2 px-3 py-1 text-xs font-bold text-accent-ink-2">
                  {st.tag}
                </div>
                <p className="mb-3 text-sm leading-normal">
                  <strong>{st.who}</strong> {st.what}
                </p>
                <div className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-accent">
                  Read their story <ArrowRight size={16} className="shrink-0" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {closedGrant && (
        <ResolvePastDueModal
          grantName={closedGrant.grant.name}
          // Three things can be outstanding, and which one decides what we ask:
          // a report that came due, a verdict that was promised, or whether an
          // application went in at all.
          kind={resolveKind}
          date={resolveDate}
          isFinalReport={isFinalReport}
          onReportSubmitted={() => {
            submitReport(closedGrant.grant.id, isFinalReport);
            setClosedGrantId(null);
            addToast(
              isFinalReport
                ? 'Report filed. Moved to "Archived".'
                : "Report filed.",
            );
          }}
          onClose={() => setClosedGrantId(null)}
          onResolve={(status) => {
            setGrantStatus(closedGrant.grant.id, status);
            setClosedGrantId(null);
            addToast(`Moved to "${STATUS_LABEL[status]}\".`);
          }}
        />
      )}

      <Modal
        open={pendingDeleteGrant !== null}
        onClose={() => setPendingDeleteGrant(null)}
        title="Delete this grant for good?"
      >
        <p className="mb-4 text-sm leading-relaxed text-ink-body">
          This permanently removes the grant from your board. It can&apos;t be
          undone.
        </p>
        <div className="mb-4">
          <CheckboxRow
            checked={dontAskDelete}
            onToggle={() => setDontAskDelete((v) => !v)}
            label="Don't ask me again for 5 minutes"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={confirmDeleteGrant}
            className="inline-flex items-center gap-2 rounded-lg bg-error-ink px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition duration-150 hover:brightness-110"
          >
            Yes, delete
          </button>
          <button
            onClick={() => setPendingDeleteGrant(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 hover:border-accent"
          >
            No
          </button>
        </div>
      </Modal>
    </div>
  );
}
