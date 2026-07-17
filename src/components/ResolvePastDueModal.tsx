"use client";

import Modal from "./Modal";
import { formatDate } from "@/utils/format";
import type { GrantStatus } from "@/store/useAppStore";

/**
 * A grant whose outcome only the user knows. The portal can't submit
 * applications or hear back from funders, so rather than guessing (or quietly
 * filing the grant away) it asks - and every answer lands the grant somewhere
 * that explains itself.
 *
 * Two moments need asking: the application window closed while they were still
 * applying, and a submitted application passed the funder's decision date.
 */
export default function ResolvePastDueModal({
  grantName,
  date,
  kind,
  onClose,
  onResolve,
  onReportSubmitted,
  isFinalReport = true,
}: {
  grantName: string;
  /** The date that passed: the application deadline, or the decision date. */
  date: Date;
  kind: "deadline" | "decision" | "report";
  onClose: () => void;
  onResolve: (status: GrantStatus) => void;
  /** Report variant only: records a filed report and advances the schedule. */
  onReportSubmitted?: () => void;
  /** Report variant only: whether this was the last report the grant owes. */
  isFinalReport?: boolean;
}) {
  const decision = kind === "decision";
  const report = kind === "report";
  return (
    <Modal
      open
      onClose={onClose}
      title={
        report
          ? "Did you submit your report?"
          : decision
            ? "Did you hear back?"
            : "What happened with this grant?"
      }
    >
      <p className="text-sm leading-relaxed text-ink-body">
        {report ? (
          <>
            <span className="font-semibold">{grantName}</span> had a report due
            on <span className="font-semibold">{formatDate(date)}</span>. We
            can&apos;t see what you sent the funder, so tell us where it stands.
          </>
        ) : decision ? (
          <>
            <span className="font-semibold">{grantName}</span> was due to
            announce decisions by{" "}
            <span className="font-semibold">{formatDate(date)}</span>. We
            can&apos;t see the funder&apos;s answer, so tell us and we&apos;ll
            move it where it belongs.
          </>
        ) : (
          <>
            The application window for{" "}
            <span className="font-semibold">{grantName}</span> closed on{" "}
            <span className="font-semibold">{formatDate(date)}</span>. We
            can&apos;t see whether you submitted, so tell us and we&apos;ll file
            it correctly.
          </>
        )}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {report ? (
          <>
            <ResolveOption
              label="Yes, we submitted the report"
              hint={
                isFinalReport
                  ? "That was the last report this grant owes - archives it as Report Completed."
                  : "Moves you on to the next report deadline for this grant."
              }
              onClick={() => onReportSubmitted?.()}
            />
            <ResolveOption
              label="Not yet"
              hint="Flags the grant as Report Overdue so it stays in front of you."
              onClick={() => onResolve("report-overdue")}
            />
          </>
        ) : decision ? (
          <>
            <ResolveOption
              label="We were awarded this grant"
              hint="Moves it to Awarded Grant Reports so you can start reporting."
              onClick={() => onResolve("awarded")}
            />
            <ResolveOption
              label="We weren't awarded"
              hint="Archives it as Not Awarded."
              onClick={() => onResolve("not-awarded")}
            />
            <ResolveOption
              label="Still waiting to hear"
              hint="Leaves it in Submitted. We'll ask again next time you're here."
              onClick={onClose}
            />
          </>
        ) : (
          <>
            <ResolveOption
              label="We submitted an application"
              hint="Moves it to Submitted while you wait on a decision."
              onClick={() => onResolve("submitted")}
            />
            <ResolveOption
              label="We applied and were awarded"
              hint="Moves it to Awarded Grant Reports so you can start reporting."
              onClick={() => onResolve("awarded")}
            />
            <ResolveOption
              label="We applied but weren't awarded"
              hint="Archives it as Not Awarded."
              onClick={() => onResolve("not-awarded")}
            />
            <ResolveOption
              label="We never submitted"
              hint="Archives it as Deadline Past."
              onClick={() => onResolve("deadline-past")}
            />
          </>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
        >
          Decide later
        </button>
      </div>
    </Modal>
  );
}

function ResolveOption({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border-strong bg-white px-4 py-3 text-left transition duration-150 hover:border-accent hover:bg-surface-alt"
    >
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="mt-0.5 text-xs text-ink-muted">{hint}</div>
    </button>
  );
}
