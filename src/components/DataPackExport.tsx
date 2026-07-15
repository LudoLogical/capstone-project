"use client";

import { useState } from "react";
import type { RueaSection, RueaBar } from "@/data/seed";
import ShareModal from "./ShareModal";
import RueaCard from "./RueaCard";

export type DataPackItem = {
  title: string;
  detail?: string;
  // Analysis lines (what it means, in context, how to use it) included in the
  // exported document beneath the data point.
  analysis?: string[];
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// RUEA comparison-bar colors, matching the on-screen StatBars.
const BAR_HEX: Record<string, string> = {
  me: "#e8633f",
  average: "#c4a882",
  max: "#7a6548",
  other: "#2f6f8f",
};

function sectionLabelHtml(text: string): string {
  return `<div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b5f56;margin:16px 0 8px;">${esc(
    text,
  )}</div>`;
}

function listHtml(lines: string[]): string {
  return `<ul style="margin:0;padding-left:18px;">${lines
    .map(
      (l) =>
        `<li style="margin-bottom:4px;font-size:13px;line-height:1.5;color:#3d342e;">${esc(
          l,
        )}</li>`,
    )
    .join("")}</ul>`;
}

// The "In context" data visualization: one labeled comparison bar per datum.
function barsHtml(bars: RueaBar[]): string {
  const max = Math.max(...bars.map((b) => b.value), 1);
  return bars
    .map((b) => {
      const width = Math.max(4, (b.value / max) * 100);
      const color = BAR_HEX[b.role] ?? BAR_HEX.other;
      return `<div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
          <span style="color:#6b5f56;">${esc(b.label)}</span>
          <strong style="color:#3d342e;">${esc(String(b.value))} ${esc(b.unit)}</strong>
        </div>
        <div style="height:8px;background:#efe6dc;border-radius:9999px;overflow:hidden;">
          <div style="height:100%;width:${width}%;background:${color};border-radius:9999px;"></div>
        </div>
      </div>`;
    })
    .join("");
}

// A full RUEA analysis card: Remember, In other words, In context (with the
// comparison-bar visualization), and In your application / report.
function cardHtml(section: RueaSection, applyLabel: string): string {
  const a = section.analysis;
  return `<div style="border:1px solid #eee3d8;border-radius:16px;padding:20px 22px;margin-bottom:16px;page-break-inside:avoid;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b5f56;margin-bottom:4px;">Remember</div>
    <div style="font-size:15px;font-weight:700;color:#1a1a1a;">${esc(a.datum.content)}</div>
    ${
      a.datum.citation
        ? `<div style="font-size:11px;color:#6b5f56;margin-top:4px;">Source: ${esc(
            a.datum.citation,
          )}</div>`
        : ""
    }
    ${sectionLabelHtml("In other words")}
    ${listHtml(a.result.understand)}
    ${sectionLabelHtml("In context")}
    ${barsHtml(section.bars)}
    <p style="font-size:13px;font-weight:700;color:#c8482a;margin:10px 0 0;">${esc(
      section.evalNote,
    )}</p>
    ${sectionLabelHtml(applyLabel)}
    ${listHtml(a.result.apply)}
  </div>`;
}

function customCardHtml(text: string): string {
  return `<div style="border:1px solid #eee3d8;border-radius:16px;padding:20px 22px;margin-bottom:16px;page-break-inside:avoid;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b5f56;margin-bottom:4px;">Added by you</div>
    <div style="font-size:15px;font-weight:700;color:#1a1a1a;">${esc(text)}</div>
  </div>`;
}

/**
 * Build a self-contained HTML document of the data analysis: one full RUEA card
 * per data point (Remember / In other words / In context with its comparison-bar
 * visualization / In your application or report), then any attached files.
 */
function buildHtml(
  grantName: string,
  orgName: string,
  sections: RueaSection[],
  customItems: string[],
  uploads: string[],
  applyLabel: string,
): string {
  const cards =
    [
      ...sections.map((s) => cardHtml(s, applyLabel)),
      ...customItems.map(customCardHtml),
    ].join("") ||
    `<p style="color:#6b5f56;">No data points selected.</p>`;
  const files = uploads.map((u) => `<li>${esc(u)}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(
    grantName,
  )} - Data Analysis</title></head><body style="font-family:'Helvetica Neue',Arial,sans-serif; color:#1a1a1a; max-width:760px; margin:0 auto; padding:32px; background:#fff;">
    <h1 style="font-size:24px; margin:0 0 4px;">Data Analysis</h1>
    <p style="color:#6b5f56; margin:0 0 24px;"><strong>${esc(orgName)}</strong> &middot; ${esc(
      grantName,
    )}</p>
    ${cards}
    ${files ? `<h2 style="font-size:15px; border-bottom:1px solid #eee3d8; padding-bottom:6px; margin-top:28px;">Attached files</h2><ul>${files}</ul>` : ""}
    <p style="margin-top:32px; color:#8a7d72; font-size:12px;">Compiled with the New Sun Rising Vibrancy Portal.</p>
  </body></html>`;
}

/**
 * Compile the collected supporting data into a document the user can save
 * locally (as a Word .doc, or print to PDF) or share via the same share popup
 * used elsewhere. The .doc download is HTML with a Word MIME type, which Word
 * and Google Docs open natively without needing a document library.
 */
export default function DataPackExport({
  grantName,
  orgName,
  items,
  uploads,
  shareUrl,
  sections,
  customItems,
  applyLabel,
}: {
  grantName: string;
  orgName: string;
  items: DataPackItem[];
  uploads: string[];
  shareUrl: string;
  // When provided, the on-screen preview shows the same explained boxes as the
  // "Explain my data" step (RUEA cards + your own additions) instead of a plain
  // text list. `items` is still what gets written into the downloaded document.
  sections?: RueaSection[];
  customItems?: string[];
  // Passed through to each RueaCard so the report flow reads "In your report".
  applyLabel?: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const html = buildHtml(
    grantName,
    orgName,
    sections ?? [],
    customItems ?? [],
    uploads,
    applyLabel ?? "In your application",
  );
  const showBoxes =
    (sections?.length ?? 0) > 0 || (customItems?.length ?? 0) > 0;

  const downloadDoc = () => {
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(grantName) || "grant"}-data-analysis.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-bold">Your data pack is ready</div>
      <p className="mb-4 text-sm leading-relaxed text-ink-muted">
        We compiled the {items.length} data point{items.length === 1 ? "" : "s"}
        {uploads.length > 0
          ? ` and ${uploads.length} file${uploads.length === 1 ? "" : "s"}`
          : ""}{" "}
        you gathered, along with their analysis, into one document. Save it
        locally or share it.
      </p>

      {showBoxes ? (
        <div className="mb-5">
          <div className="mb-2 text-sm font-bold">
            {orgName} · {grantName}
          </div>
          <div className="flex flex-col gap-3">
            {(sections ?? []).map((s) => (
              <RueaCard
                key={s.id}
                section={s}
                expanded={!!expanded[s.id]}
                onToggle={() =>
                  setExpanded((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                }
                applyLabel={applyLabel}
              />
            ))}
            {(customItems ?? []).map((text, i) => (
              <div
                key={`custom-${i}`}
                className="rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div className="mb-1 text-xs font-bold tracking-wider text-ink-muted uppercase">
                  Added by you
                </div>
                <div className="text-sm font-bold">{text}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-5 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-alt p-4">
          <div className="mb-2 text-sm font-bold">
            {orgName} · {grantName}
          </div>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5">
            {items.map((it, i) => (
              <li key={i} className="text-sm text-ink-body">
                <span className="font-semibold">{it.title}</span>
                {it.detail ? (
                  <span className="text-ink-muted"> - {it.detail}</span>
                ) : null}
                {it.analysis && it.analysis.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-ink-muted">
                    {it.analysis.map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {items.length === 0 && (
              <li className="text-sm text-ink-muted">
                No data points selected.
              </li>
            )}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={downloadDoc}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-cta transition duration-150 hover:brightness-105"
        >
          ⬇ Download (Word)
        </button>
        <button
          onClick={printPdf}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
        >
          🖨 Save as PDF
        </button>
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition duration-150 hover:border-accent"
        >
          Share link
        </button>
      </div>

      {shareOpen && (
        <ShareModal
          name={`${grantName} - Data Analysis`}
          link={shareUrl}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
