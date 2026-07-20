"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STORIES } from "@/data/seed";
import {
  useAppStore,
  ARCHIVE_FILTERS,
  MOVE_BACK_TARGET,
  STATUS_LABEL,
  UNSUCCESSFUL_STATUSES,
  type GrantStatus,
} from "@/store/useAppStore";
import {
  nextReportDeadline,
  useDashboardGroups,
  useOrgName,
  usePersonName,
  type GrantView,
} from "@/store/derived";
import { formatCurrency, formatDate } from "@/utils/format";
import DaysLeftChip from "@/components/DaysLeftChip";
import {
  Trash2,
  MoreVertical,
  X,
  Check,
  Info,
  Calendar,
  FileText,
  Award,
  Star,
  Users,
  Bookmark,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import ResolvePastDueModal from "@/components/ResolvePastDueModal";
import Modal from "@/components/Modal";
import CheckboxRow from "@/components/CheckboxRow";
import Pagination from "@/components/Pagination";

type Tone = "accent" | "success" | "neutral";

const TONE: Record<Tone, { tile: string }> = {
  accent: { tile: "bg-accent-tint text-accent-ink" },
  success: { tile: "bg-success-bg text-success-ink" },
  neutral: { tile: "bg-surface-alt text-ink-secondary" },
};

/** Small uppercase eyebrow used to label a dashboard section. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-xs font-bold tracking-wider text-ink-muted uppercase">
      {children}
    </div>
  );
}

/** One grant inside a board column: name, funder, due date, actions. */
function GrantMiniCard({
  view,
  dueLabel,
  deadline,
  primary,
  secondary,
  tertiary,
  remove,
  menu,
  closed = false,
  onClosedClick,
  badge,
}: {
  view: GrantView;
  dueLabel: string;
  /** The date being counted down to, if this card has one still ahead of it. */
  deadline?: Date;
  /** A completion tag, e.g. "Report Completed" on an archived grant. */
  badge?: string;
  primary?: { label: string; to?: string; onClick?: () => void };
  secondary?: { label: string; to?: string; onClick?: () => void };
  tertiary?: { label: string; to?: string; onClick?: () => void };
  /** A small action in the card's upper right. */
  remove?: { label: string; onClick: () => void };
  /** A kebab (three-dot) menu in the upper right, in place of `remove`. */
  menu?: { label: string; onClick: () => void; danger?: boolean }[];
  /** Past its deadline: the primary action greys out and explains itself. */
  closed?: boolean;
  onClosedClick?: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (to?: string, onClick?: () => void) => () => {
    if (onClick) onClick();
    else if (to) router.push(to);
  };
  const hasCorner = !!remove || !!menu;

  return (
    <div className="relative rounded-xl bg-surface p-4">
      {remove && !menu && (
        <button
          onClick={remove.onClick}
          aria-label={remove.label}
          title={remove.label}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-muted transition duration-150 hover:bg-accent-tint hover:text-accent-ink"
        >
          <Trash2 size={15} />
        </button>
      )}
      {menu && (
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
            aria-expanded={menuOpen}
            title="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-ink-muted transition duration-150 hover:bg-surface-alt hover:text-ink"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              {/* Click-away layer closes the menu. */}
              <button
                aria-hidden
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border-strong bg-white shadow-float">
                {menu.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition duration-150 ${
                      item.danger
                        ? "text-error-ink hover:bg-error-bg"
                        : "text-ink hover:bg-surface-alt"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => router.push(`/grants/${view.grant.id}`)}
        className={`mb-1 line-clamp-2 block text-left font-serif text-base leading-snug font-bold transition duration-150 hover:text-accent ${
          hasCorner ? "pr-8" : ""
        }`}
      >
        {view.grant.name}
      </button>
      <div className="mb-2.5 text-xs text-ink-muted">
        {view.grant.grantor} · {formatCurrency(view.grant.award.totalAmount)}
      </div>

      {badge &&
        (() => {
          // An archived grant that ended without a win reads red: filing it away
          // is not the same as finishing it.
          const unsuccessful =
            !!view.status && UNSUCCESSFUL_STATUSES.includes(view.status);
          return (
            <div
              className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                unsuccessful
                  ? "border-error-border bg-error-bg text-error-ink"
                  : "border-success-border bg-success-bg text-success-ink"
              }`}
            >
              {unsuccessful ? <X size={12} /> : <Check size={12} />}
              {badge}
            </div>
          );
        })()}

      {/* An overdue report is a standing fact, not a question - it stays red
          until the user files it. */}
      {view.status === "report-overdue" && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-error-border bg-error-bg px-2.5 py-1 text-xs font-bold text-error-ink">
          <Info size={12} />
          {STATUS_LABEL["report-overdue"]}
        </div>
      )}

      {/* Past due and unresolved: the grant stays put and asks for a decision
          rather than vanishing into an archive on its own. */}
      {view.needsAttention && onClosedClick && (
        <button
          onClick={onClosedClick}
          className="mb-2 inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-xs font-bold text-warning-ink transition duration-150 hover:brightness-95"
        >
          <Info size={12} />
          Needs attention - what happened?
        </button>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt px-2.5 py-1 text-xs font-semibold text-ink-secondary">
          <Calendar size={13} />
          {dueLabel}
        </span>
        {deadline && <DaysLeftChip date={deadline} />}
      </div>

      <div className="flex flex-col gap-2">
        {primary && (
          // A closed grant can't be worked on: the call to action goes grey and
          // explains itself instead of opening the flow.
          <button
            onClick={closed ? onClosedClick : go(primary.to, primary.onClick)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition duration-150 ${
              closed
                ? "bg-divider-2 text-ink-muted hover:bg-border-strong"
                : "bg-accent-ink text-white shadow-cta enabled:hover:bg-accent-ink-2 enabled:active:translate-y-px"
            }`}
          >
            {primary.label}
          </button>
        )}
        {secondary && (
          <button
            onClick={go(secondary.to, secondary.onClick)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            {secondary.label}
          </button>
        )}
        {tertiary && (
          <button
            onClick={go(tertiary.to, tertiary.onClick)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-strong bg-white px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent"
          >
            {tertiary.label}
          </button>
        )}
      </div>
    </div>
  );
}

// A board column shows a few grants at a time; the rest are a page click away,
// so one busy column can't push every other column off the screen.
const CARDS_PER_PAGE = 3;

/**
 * A labeled board column: a colored header tile, a count, and its grant cards,
 * paged once there are more than fit comfortably.
 */
function BoardColumn<T>({
  icon: Icon,
  title,
  tone,
  items,
  empty,
  renderItem,
  toolbar,
}: {
  icon: LucideIcon;
  title: string;
  tone: Tone;
  items: T[];
  empty: string;
  renderItem: (item: T) => React.ReactNode;
  /** Controls shown in the header row, e.g. the Archived filters. */
  toolbar?: React.ReactNode;
}) {
  const t = TONE[tone];
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
  // Keep the page in range as grants move off this column.
  const safePage = Math.min(page, pageCount - 1);
  const shown = items.slice(
    safePage * CARDS_PER_PAGE,
    safePage * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  return (
    <section className="flex flex-col rounded-2xl bg-surface-alt-2 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 px-1">
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg ${t.tile}`}
        >
          <Icon size={17} />
        </div>
        <div className="text-sm font-bold">{title}</div>
        <div className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ink-secondary">
          {items.length}
        </div>
        {toolbar && <div className="ml-auto">{toolbar}</div>}
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-xs leading-normal text-ink-muted">
            {empty}
          </div>
        ) : (
          shown.map(renderItem)
        )}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={setPage}
        // A board column sits beside four others, so its pagination stays
        // compact rather than outweighing the cards it pages.
        size="sm"
        label={title}
        className="mt-4"
      />
    </section>
  );
}

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
