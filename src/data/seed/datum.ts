import type {
  AuthoritativeDatum,
  InitiativeDatum,
  DocumentSource,
  NSRServiceDatum,
} from "@/types/data";
import {
  InitiativeSourceKind,
  NSRService,
  VisualizationMethod,
} from "@/types/data";
import type { DatumAnalysis } from "@/types/analysis";
import { REGION_HILLTOP_TRACT } from "./geo";

// The signed-in user (Maya Torres of Hilltop Wellness Collective) uploaded
// every InitiativeSource in this seed.
export const USER_MAYA_ID = "user-maya-torres";

export const SRC_ANNUAL_IMPACT_SURVEY: DocumentSource = {
  kind: InitiativeSourceKind.Document,
  folder: "Impact Surveys",
  creationTime: new Date("2026-06-06T14:12:00Z"),
  creator: USER_MAYA_ID,
  isDeleted: false,
  file: new File(
    [
      "Hilltop Wellness Collective - 2025 Annual Impact Survey (seed placeholder)",
    ],
    "hilltop-wellness-2025-annual-impact-survey.pdf",
    { type: "application/pdf" },
  ),
  name: "2025 Annual Impact Survey",
  type: "pdf",
};

export const SRC_BUDGET_RECORDS: DocumentSource = {
  kind: InitiativeSourceKind.Document,
  folder: "Budget Records",
  creationTime: new Date("2026-06-16T09:35:00Z"),
  creator: USER_MAYA_ID,
  isDeleted: false,
  file: new File(
    ["Hilltop Wellness Collective - FY2025 Budget Summary (seed placeholder)"],
    "hilltop-wellness-fy2025-budget-summary.xlsx",
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  ),
  name: "FY2025 Budget Summary",
  type: "xlsx",
};

// ---- Authoritative (Vibrancy Index) data ----------------------------------

export const DATUM_CVD_RATE: AuthoritativeDatum = {
  id: 1,
  content: "Cardiovascular disease rate among Hilltop adults",
  citation:
    "Allegheny County Health Department, 2025 Community Health Assessment",
  visualizationMethod: VisualizationMethod.BarChart,
  indicator: "chronic disease",
  region: REGION_HILLTOP_TRACT,
  value: 8.4,
  unit: "% of adults",
  context: { minimum: 4.1, average: 13.2, maximum: 21.6 },
  issues: ["Health"],
};

export const DATUM_PRODUCE_ACCESS: AuthoritativeDatum = {
  id: 2,
  content: "Households within a 10-minute walk of fresh produce",
  citation: "Vibrancy Index, Food Access Layer, 2025",
  visualizationMethod: VisualizationMethod.BarChart,
  indicator: "food access",
  region: REGION_HILLTOP_TRACT,
  value: 61,
  unit: "% of households",
  context: { minimum: 22, average: 48, maximum: 89 },
  issues: ["Food Security", "Health"],
};

// ---- NSR-managed data ----------------------------------------------

export const DATUM_OAT_RESOURCES: NSRServiceDatum = {
  id: 5,
  content: "Hilltop Wellness Collective scored 3/4 on Resources.",
  citation: "Hilltop Wellness Collective Organizational Assessment, 2025",
  visualizationMethod: VisualizationMethod.BulletChart,
  service: NSRService.OrganizationalAssessmentTool,
  numerator: 3,
  denominator: 4,
  unit: "points",
};

// ---- Initiative-supplied data ----------------------------------------------

export const DATUM_RESIDENTS_REACHED: InitiativeDatum = {
  id: 6,
  content:
    "1,240 unique residents served by Hilltop Wellness Collective programs in 2025",
  citation: "Hilltop Wellness Collective, 2025 Annual Impact Survey",
  visualizationMethod: VisualizationMethod.None,
  source: SRC_ANNUAL_IMPACT_SURVEY,
};

export const DATUM_PROGRAM_RETENTION: InitiativeDatum = {
  id: 7,
  content: "68% of program participants returned for a second season",
  citation: "Hilltop Wellness Collective, 2025 Annual Impact Survey",
  visualizationMethod: VisualizationMethod.None,
  source: SRC_ANNUAL_IMPACT_SURVEY,
};

// ---- DatumAnalysis wrappers (feed the RUEA cards) --------------------------

export const ANALYSIS_CVD_RATE: DatumAnalysis = {
  datum: DATUM_CVD_RATE,
  relevance:
    "Cardiovascular disease is one of the health outcomes this grant explicitly asks applicants to address.",
  result: {
    understand: [
      "8.4% of adults in Hilltop have a diagnosed cardiovascular condition.",
      "That's well below both the county average (13.2%) and the county's highest rate (21.6%).",
    ],
    apply: [
      "Cite this as early evidence that prevention-focused programming in Hilltop is already working.",
      "Pair it with your walking-group or nutrition-program participation counts to show the mechanism.",
    ],
  },
};

export const ANALYSIS_PRODUCE_ACCESS: DatumAnalysis = {
  datum: DATUM_PRODUCE_ACCESS,
  relevance:
    "Fresh food access is the headline eligibility criterion for the Neighborhood Food Access Grant.",
  result: {
    understand: [
      "61% of Hilltop households are within a 10-minute walk of fresh produce.",
      "That's above the county average (48%), but still well short of the county's best-served neighborhoods (89%).",
    ],
    apply: [
      "Use this to frame the remaining 39% of households as your target population, not the whole neighborhood.",
      "Combine with your distribution-site map to show exactly where the gap is.",
    ],
  },
};

export const ANALYSIS_RESIDENTS_REACHED: DatumAnalysis = {
  datum: DATUM_RESIDENTS_REACHED,
  relevance: null,
  result: {
    understand: ["Your programs reached 1,240 unique residents across 2025."],
    apply: [
      "Use this as your headline reach number in the application narrative.",
      "Break it down by program if the funder asks for service-line detail.",
    ],
  },
};

export const ANALYSIS_PROGRAM_RETENTION: DatumAnalysis = {
  datum: DATUM_PROGRAM_RETENTION,
  relevance: null,
  result: {
    understand: [
      "68% of participants who finished one season came back for a second.",
    ],
    apply: [
      "Retention is a strong signal of program quality - lead with it when a funder asks about outcomes, not just outputs.",
    ],
  },
};
