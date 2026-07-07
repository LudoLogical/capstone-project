import type Grant from "../../types/grant";
import type GrantRecord from "../../types/grantRecord";
import type {
  BaseGrantAnalysis,
  DatumAnalysis,
} from "../../types/analysis";
import type { AuthoritativeDatum } from "../../types/data";
import type { FlowMode } from "../state/store";
import { GRANT_DISPLAY_BY_ID } from "../data";
import { money } from "./format";

export type FlowQuestion = { q: string; prefill: string };

export function questionsFor(grant: Grant, mode: FlowMode): FlowQuestion[] {
  const disp = GRANT_DISPLAY_BY_ID[grant.id];
  if (mode === "report") {
    return grant.requirements.reporting.map((r, i) => ({
      q: r,
      prefill:
        i === 0
          ? "Over the award period we focused on the outcomes below, drawn straight from what we tracked all year."
          : "",
    }));
  }
  const base: FlowQuestion[] = [
    {
      q: `Describe the community you serve and the need ${disp.name} would help address.`,
      prefill:
        "Greater Hazelwood sits in the bottom third of the county for fresh-food access — only 41% of households live within a half-mile of a fresh-food outlet, against a 55% regional average.",
    },
    {
      q: "What will you do with this funding, and who leads the work?",
      prefill:
        "We'll add a second weekly market day and expand our reclaimed-lot growing space, led by resident volunteers with support from our youth grow crew.",
    },
    {
      q: "How will you measure whether it worked?",
      prefill:
        "Weekly market attendance (already up from 84 to 142 this spring), volunteer hours, and lots reclaimed into growing space.",
    },
  ];
  const fromApp = grant.requirements.application
    .slice(0, 2)
    .map((a) => ({ q: `Address this application requirement: ${a}`, prefill: "" }));
  return [...base, ...fromApp];
}

export type VizCard = {
  label: string;
  src: string;
  bars: { name: string; val: string; pct: number }[];
};

function isAuthoritative(d: DatumAnalysis["datum"]): d is AuthoritativeDatum {
  return (d as AuthoritativeDatum).context !== undefined;
}

export function vizCardsFor(analysis: BaseGrantAnalysis | undefined): VizCard[] {
  if (!analysis) return [];
  const out: VizCard[] = [];
  for (const da of analysis.data) {
    const d = da.datum;
    if (!isAuthoritative(d)) continue;
    const max = Math.max(d.value, d.context.maximum);
    const fmt = (n: number) => (d.unit.includes("USD") ? money(n) : `${n}`);
    out.push({
      label: d.content,
      src: d.citation,
      bars: [
        { name: "You / here", val: fmt(d.value), pct: (d.value / max) * 100 },
        { name: "Region avg", val: fmt(d.context.average), pct: (d.context.average / max) * 100 },
        { name: "Best in set", val: fmt(d.context.maximum), pct: 100 },
      ],
    });
  }
  return out;
}

export type FactCard = { tag: string; label: string; value: string; source: string };

export function factsFor(analysis: BaseGrantAnalysis | undefined): FactCard[] {
  if (!analysis) return [];
  const out: FactCard[] = [];
  for (const da of analysis.data) {
    const d = da.datum;
    if (isAuthoritative(d)) continue;
    const tag = "source" in d ? "YOUR DATA" : "NSR SERVICE";
    out.push({
      tag,
      label: d.content.split(" ").slice(0, 5).join(" ") + "…",
      value: d.content,
      source: d.citation,
    });
  }
  return out;
}

/** The org's active writing/reporting analysis for a grant, if any. */
export function analysisFor(record: GrantRecord | undefined, mode: FlowMode) {
  if (!record) return undefined;
  return mode === "report" ? record.reportingAnalyses[0] : record.writingAnalyses[0];
}
