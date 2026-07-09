import type { DatumAnalysis } from "@types-domain/analysis";
import {
  ANALYSIS_CVD_RATE,
  ANALYSIS_PRODUCE_ACCESS,
  ANALYSIS_RESIDENTS_REACHED,
  ANALYSIS_PROGRAM_RETENTION,
} from "./datum";

// Comparison-bar content that accompanies a DatumAnalysis in the RUEA
// (Remember / Understand / Evaluate / Apply) cards. `role` drives bar color:
// "me" = this org's value, "average"/"max" = county-level context,
// "other" = any other reference point (e.g. a prior year).
export type RueaBar = { label: string; value: number; unit: string; role: "me" | "average" | "max" | "other" };

export type RueaSection = {
  id: string;
  provenanceKey: string;
  analysis: DatumAnalysis;
  bars: RueaBar[];
  evalNote: string;
};

export const RUEA_SECTIONS: RueaSection[] = [
  {
    id: "ruea-cvd",
    provenanceKey: "cvd",
    analysis: ANALYSIS_CVD_RATE,
    bars: [
      { label: "Hilltop (you)", value: 8.4, unit: "%", role: "me" },
      { label: "County average", value: 13.2, unit: "%", role: "average" },
      { label: "County max", value: 21.6, unit: "%", role: "max" },
    ],
    evalNote: "36% below the county average — a sign prevention work is paying off.",
  },
  {
    id: "ruea-produce",
    provenanceKey: "produce",
    analysis: ANALYSIS_PRODUCE_ACCESS,
    bars: [
      { label: "Hilltop (you)", value: 61, unit: "%", role: "me" },
      { label: "County average", value: 48, unit: "%", role: "average" },
      { label: "County max", value: 89, unit: "%", role: "max" },
    ],
    evalNote: "27% above the county average, but still 28 points behind the best-served neighborhoods.",
  },
  {
    id: "ruea-served",
    provenanceKey: "served",
    analysis: ANALYSIS_RESIDENTS_REACHED,
    bars: [
      { label: "2024", value: 980, unit: "residents", role: "other" },
      { label: "2025 (you)", value: 1240, unit: "residents", role: "me" },
    ],
    evalNote: "27% growth in unique residents served, year over year.",
  },
  {
    id: "ruea-retention",
    provenanceKey: "served",
    analysis: ANALYSIS_PROGRAM_RETENTION,
    bars: [
      { label: "2024", value: 54, unit: "%", role: "other" },
      { label: "2025 (you)", value: 68, unit: "%", role: "me" },
    ],
    evalNote: "14-point improvement in season-over-season retention.",
  },
];
