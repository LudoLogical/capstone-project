"use client";

import { useState } from "react";
import type { Datum } from "@/types/data";
import { InitiativeSourceKind } from "@/types/data";
import { DATA_DETAILS, USER_DISPLAY_NAME } from "@/data/seed";
import {
  formatDate,
  formatMeasure,
  formatWebpageLabel,
  sourceKindLabel,
} from "@/utils/format";
import Modal from "@/components/primitives/Modal";
import { Download, ExternalLink, FileText, Link } from "lucide-react";

/**
 * Shown only where a model actually stood between the source and the figure.
 *
 * `BaseDatum.content` is documented as "generated using artificial intelligence
 * if and only if this Datum is an InitiativeDatum; created from a template
 * string otherwise" - so a Vibrancy Index reading or an NSR service figure is
 * the number that was recorded, and warning about AI there would tell the user
 * to doubt something no AI touched.
 */
const AI_NOTE =
  "AI can make mistakes. Always confirm figures against the original source before you use them.";

type CitationField = { label: string; value: string };

/**
 * What we can say about where a data point came from, taken entirely from the
 * data point.
 *
 * `Datum` carries no discriminator, so each variant is recognised by a field
 * only it defines. Which facts exist differs by variant, and nothing is filled
 * in where the type has nothing: an `AuthoritativeDatum` records no collection
 * date, for instance, so its citation simply doesn't claim one.
 */
export function citationFields(datum: Datum): CitationField[] {
  if ("region" in datum) {
    return [
      { label: "Indicator", value: datum.indicator },
      { label: "Geography", value: datum.region.name },
      ...(datum.region.censusTract
        ? [{ label: "Census tract", value: datum.region.censusTract }]
        : []),
      { label: "Value", value: formatMeasure(datum.value, datum.unit) },
    ];
  }

  if ("source" in datum) {
    const { source } = datum;
    return [
      { label: "Source", value: sourceKindLabel(source.kind) },
      ...(source.kind === InitiativeSourceKind.Document
        ? [{ label: "File type", value: source.type.toUpperCase() }]
        : []),
      { label: "Added", value: formatDate(source.creationTime) },
      {
        label: "Added by",
        value: USER_DISPLAY_NAME[source.creator] ?? source.creator,
      },
    ];
  }

  const service = { label: "Source", value: DATA_DETAILS[datum.service].label };

  // A budget or assessment figure is a fraction of a stated maximum, so both
  // halves are quoted - the numerator alone doesn't mean anything.
  if ("numerator" in datum) {
    return [
      service,
      {
        label: "Value",
        value: `${datum.numerator.toLocaleString("en-US")} of ${formatMeasure(
          datum.denominator,
          datum.unit,
        )}`,
      },
    ];
  }

  // A survey answer is quoted from the most recent year it was collected. The
  // earlier years are on the card's own comparison bars; repeating them here
  // would restate the card inside its own citation.
  const latest = (datum.samples ?? []).reduce<
    { value: number; year: number } | undefined
  >((newest, s) => (!newest || s.year > newest.year ? s : newest), undefined);

  return latest
    ? [
        service,
        { label: "Value", value: formatMeasure(latest.value, datum.unit) },
        { label: "Collected", value: `${latest.year}` },
      ]
    : [service];
}

/**
 * The source a citation can actually point at.
 *
 * Only an `InitiativeDatum` has one: a webpage knows its URL and a document is
 * a file. Vibrancy Index and NSR service data carry a written citation and
 * nothing to open, so they get no link rather than an invented one.
 */
export function citationLink(
  datum: Datum,
): { label: string; href?: string } | undefined {
  if (!("source" in datum)) return undefined;
  const { source } = datum;
  if (source.kind === InitiativeSourceKind.Webpage)
    return { label: formatWebpageLabel(source.link), href: source.link };
  // The file itself, with a download affordance only - the same treatment the
  // repository on the account screen gives it, and for the same reason: a
  // source read back out of storage holds a placeholder, not the real bytes.
  if (source.kind === InitiativeSourceKind.Document)
    return { label: source.name };
  // A captured message has nothing to open; its content is the data point.
  return undefined;
}

export default function CiteButton({ datum }: { datum: Datum }) {
  const [open, setOpen] = useState(false);
  const fields = citationFields(datum);
  const link = citationLink(datum);
  // The only datum whose content was read out of a source by a model, and so
  // the only one the AI disclaimer applies to. It is also the only one that can
  // carry a link, which makes it the only case where anything follows the
  // fields.
  const fromInitiativeSource = "source" in datum;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition duration-150 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        View Citation
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={datum.content}>
        <div className="mb-3.5 text-sm text-ink-muted">{datum.citation}</div>
        <div
          className={`flex flex-col gap-2 ${fromInitiativeSource ? "mb-4" : ""}`}
        >
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex justify-between gap-3 border-b border-divider pb-2 text-sm"
            >
              <span className="flex-none text-ink-muted">{f.label}</span>
              <strong className="text-right">{f.value}</strong>
            </div>
          ))}
        </div>
        {link &&
          (link.href ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface-alt px-4 py-3 text-sm font-semibold text-accent no-underline transition duration-150 hover:border-accent"
            >
              <Link size={13} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{link.label}</span>
              <span
                aria-hidden
                className="flex flex-none items-center gap-1 text-ink-muted"
              >
                Open <ExternalLink size={13} />
              </span>
            </a>
          ) : (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-border-strong bg-surface-alt px-4 py-3 text-sm font-semibold text-accent">
              <FileText size={13} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{link.label}</span>
              <span
                aria-hidden
                className="flex flex-none items-center gap-1 text-ink-muted"
              >
                Open <Download size={13} />
              </span>
            </div>
          ))}
        {fromInitiativeSource && (
          <p className="text-xs leading-normal text-ink-muted">{AI_NOTE}</p>
        )}
      </Modal>
    </>
  );
}
