"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STORIES } from "@/data/seed";
import {
  useAppStore,
  ARCHIVE_FILTERS,
  MOVE_BACK_TARGET,
  STATUS_LABEL,
  type GrantStatus,
} from "@/store/useAppStore";
import {
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
  const { inProgress, awarded, saved, collaborating, archived } =
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
    [...saved, ...collaborating, ...inProgress, ...awarded, ...archived].find(
      (v) => v.grant.id === closedGrantId,
    ) ?? null;
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
  // Greet by first name, or the "Your Name" stand-in until one is given.
  const firstName = personName.split(/\s+/)[0];

  return (
    <div className="animate-nc-rise mx-auto w-full max-w-6xl px-8 pt-8 pb-28">
      <div className="mb-6">
        <h1 className="font-serif text-3xl leading-tight font-bold">
          {showPersonal
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
              title="Grant Applications"
              tone="accent"
              items={inProgress}
              empty="No applications yet. Open a saved grant and start an application."
              renderItem={(v) => (
                <GrantMiniCard
                  key={v.grant.id}
                  view={v}
                  dueLabel={`Apply by ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                  closed={v.isClosed}
                  onClosedClick={() => setClosedGrantId(v.grant.id)}
                  primary={{
                    label: v.writingStarted
                      ? "Continue Application"
                      : "Start Application",
                    to: `/grants/${v.grant.id}/collect`,
                  }}
                  deadline={v.grant.timeline.applicationWindowEnd}
                  menu={[
                    {
                      label: "Mark as submitted",
                      onClick: () => {
                        setGrantStatus(v.grant.id, "submitted");
                        addToast("Marked as submitted. Moved to Archived.");
                      },
                    },
                    {
                      label: "Delete application",
                      danger: true,
                      onClick: () => {
                        setGrantStatus(v.grant.id, "withdrawn");
                        addToast("Application deleted. Moved to Archived.");
                      },
                    },
                  ]}
                />
              )}
            />

            <BoardColumn
              icon={Award}
              title="Awarded Grant Reports"
              tone="success"
              items={awarded}
              empty="No awarded grants yet. Reports appear here once you win funding."
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
                    label: v.reportStarted ? "Continue Report" : "Start Report",
                    to: `/grants/${v.grant.id}/report`,
                  }}
                  menu={[
                    {
                      label: "Mark report completed",
                      onClick: () => {
                        setGrantStatus(v.grant.id, "reported");
                        addToast("Report completed. Moved to Archived.");
                      },
                    },
                    {
                      label: "Move back to Grant Applications",
                      onClick: () => {
                        setGrantStatus(v.grant.id, "applying");
                        addToast("Moved back to Grant Applications.");
                      },
                    },
                    {
                      label: "Delete report",
                      danger: true,
                      onClick: () => {
                        setGrantStatus(v.grant.id, "withdrawn");
                        addToast("Report deleted. Moved to Archived.");
                      },
                    },
                  ]}
                />
              )}
            />

            <BoardColumn
              icon={Star}
              title="Saved Grants"
              tone="neutral"
              items={saved}
              empty="No saved grants yet. Save any grant to keep it here."
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
                    label: "Start Gathering Data for Application",
                    onClick: () => {
                      startApplication(v.grant.id);
                      router.push(`/grants/${v.grant.id}/collect`);
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
              empty="Not listed on any grants yet. Open a grant and list yourself as open to collaborate."
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

            <BoardColumn
              icon={Bookmark}
              title="Archived Grants"
              tone="neutral"
              items={shownArchived}
              empty="Nothing archived yet. Grants land here once they're finished, withdrawn, or out of time."
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
                // A missed deadline or a funder's "no" isn't a decision the user
                // can take back, so those offer no way out of the archive.
                const back = v.status ? MOVE_BACK_TARGET[v.status] : null;
                return (
                  <GrantMiniCard
                    key={v.grant.id}
                    view={v}
                    badge={v.status ? STATUS_LABEL[v.status] : undefined}
                    dueLabel={`Closed ${formatDate(v.grant.timeline.applicationWindowEnd)}`}
                    primary={{
                      label: "Grant Details",
                      to: `/grants/${v.grant.id}`,
                    }}
                    remove={{
                      label: "Delete from board",
                      onClick: () => requestDeleteGrant(v.grant.id),
                    }}
                    secondary={
                      back
                        ? {
                            label: back.label,
                            onClick: () => {
                              setGrantStatus(v.grant.id, back.status);
                              addToast(
                                `${back.label.replace("Move back to", "Moved back to")}.`,
                              );
                            },
                          }
                        : undefined
                    }
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
                ? "Report filed. Moved to Archived."
                : "Report filed. On to the next deadline.",
            );
          }}
          onClose={() => setClosedGrantId(null)}
          onResolve={(status) => {
            setGrantStatus(closedGrant.grant.id, status);
            setClosedGrantId(null);
            addToast(`Moved to ${STATUS_LABEL[status]}.`);
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
