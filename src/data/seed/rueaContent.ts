import type { DatumAnalysis } from "@/types/analysis";
import type { AISDatum, AuthoritativeDatum } from "@/types/data";
import type { RueaBar } from "@/components/analysis/StatBars";
import {
  ANALYSIS_CVD_RATE,
  ANALYSIS_PRODUCE_ACCESS,
  ANALYSIS_RESIDENTS_REACHED,
  ANALYSIS_PROGRAM_RETENTION,
  DATUM_CVD_RATE,
  DATUM_PRODUCE_ACCESS,
  DATUM_RESIDENTS_REACHED,
  DATUM_PROGRAM_RETENTION,
} from "./datum";

export type RueaSection = {
  id: string;
  provenanceKey: string;
  analysis: DatumAnalysis;
  bars: RueaBar[];
  evalNote: string;
};

/**
 * Bars for an AuthoritativeDatum: this org's value against the county average
 * and ceiling. Exactly what VisualizationMethod.BarChart describes, so the
 * numbers come off the datum rather than being restated here.
 *
 * The display unit is passed in: `Datum.unit` is prose ("% of adults") where
 * the bars want a symbol.
 */
const authoritativeBars = (
  datum: AuthoritativeDatum,
  unit: string,
): RueaBar[] => [
  { label: "Hilltop (you)", value: datum.value, unit, role: "me" },
  {
    label: "County average",
    value: datum.context.average,
    unit,
    role: "average",
  },
  { label: "County max", value: datum.context.maximum, unit, role: "max" },
];

/**
 * Bars for a quantitative AISDatum: one per survey year, with the most recent
 * marked as this org's own figure.
 */
const sampleBars = (datum: AISDatum, unit: string): RueaBar[] =>
  (datum.samples ?? []).map((sample) => {
    return {
      label: `${sample.year}`,
      value: sample.value,
      unit,
      role: "me",
    };
  });

export const RUEA_SECTIONS: RueaSection[] = [
  {
    id: "ruea-cvd",
    provenanceKey: "cvd",
    analysis: ANALYSIS_CVD_RATE,
    bars: authoritativeBars(DATUM_CVD_RATE, "%"),
    evalNote: "36% below the county average.",
  },
  {
    id: "ruea-produce",
    provenanceKey: "produce",
    analysis: ANALYSIS_PRODUCE_ACCESS,
    bars: authoritativeBars(DATUM_PRODUCE_ACCESS, "%"),
    evalNote:
      "27% above the county average, but still 28 points behind the best-served neighborhoods.",
  },
  {
    id: "ruea-served",
    provenanceKey: "served",
    analysis: ANALYSIS_RESIDENTS_REACHED,
    bars: sampleBars(DATUM_RESIDENTS_REACHED, "residents"),
    evalNote: "27% growth in unique residents served, year over year.",
  },
  {
    id: "ruea-retention",
    provenanceKey: "served",
    analysis: ANALYSIS_PROGRAM_RETENTION,
    bars: sampleBars(DATUM_PROGRAM_RETENTION, "%"),
    evalNote: "14-point improvement in season-over-season retention.",
  },
];
