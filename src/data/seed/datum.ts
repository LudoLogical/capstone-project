import type { AuthoritativeDatum, InitiativeDatum, DocumentSource } from "@types-domain/data";
import type { DatumAnalysis } from "@types-domain/analysis";
import { LOC_HILLTOP } from "./geo";

export const SRC_ANNUAL_IMPACT_SURVEY: DocumentSource = {
  folder: "Impact Surveys",
  isDeleted: false,
  file: new File(
    ["Hilltop Wellness Collective — 2025 Annual Impact Survey (seed placeholder)"],
    "hilltop-wellness-2025-annual-impact-survey.pdf",
    { type: "application/pdf" },
  ),
  name: "2025 Annual Impact Survey",
  type: "pdf",
};

export const SRC_BUDGET_RECORDS: DocumentSource = {
  folder: "Budget Records",
  isDeleted: false,
  file: new File(
    ["Hilltop Wellness Collective — FY2025 Budget Summary (seed placeholder)"],
    "hilltop-wellness-fy2025-budget-summary.xlsx",
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ),
  name: "FY2025 Budget Summary",
  type: "xlsx",
};

// ---- Authoritative (Vibrancy Index) data ----------------------------------

export const DATUM_CVD_RATE: AuthoritativeDatum = {
  content: "Cardiovascular disease rate among Hilltop adults",
  citation: "Allegheny County Health Department, 2025 Community Health Assessment",
  evaluateMethod: "bar",
  location: LOC_HILLTOP,
  value: 8.4,
  unit: "% of adults",
  context: { minimum: 4.1, average: 13.2, maximum: 21.6 },
};

export const DATUM_PRODUCE_ACCESS: AuthoritativeDatum = {
  content: "Households within a 10-minute walk of fresh produce",
  citation: "Vibrancy Index, Food Access Layer, 2025",
  evaluateMethod: "bar",
  location: LOC_HILLTOP,
  value: 61,
  unit: "% of households",
  context: { minimum: 22, average: 48, maximum: 89 },
};

export const DATUM_MEDIAN_INCOME: AuthoritativeDatum = {
  content: "Median household income",
  citation: "US Census ACS 5-Year Estimates, 2024",
  evaluateMethod: "bar",
  location: LOC_HILLTOP,
  value: 38200,
  unit: "USD / year",
  context: { minimum: 21400, average: 52100, maximum: 118700 },
};

export const DATUM_PHYSICAL_ACTIVITY: AuthoritativeDatum = {
  content: "Adults meeting the CDC physical activity guideline",
  citation: "Vibrancy Index, Health & Wellness Layer, 2025",
  evaluateMethod: "bar",
  location: LOC_HILLTOP,
  value: 71,
  unit: "% of adults",
  context: { minimum: 39, average: 58, maximum: 82 },
};

// ---- Initiative-supplied data ----------------------------------------------

export const DATUM_RESIDENTS_REACHED: InitiativeDatum = {
  content: "1,240 unique residents served by Hilltop Wellness Collective programs in 2025",
  citation: "Hilltop Wellness Collective, 2025 Annual Impact Survey",
  evaluateMethod: "bar",
  source: SRC_ANNUAL_IMPACT_SURVEY,
};

export const DATUM_PROGRAM_RETENTION: InitiativeDatum = {
  content: "68% of program participants returned for a second season",
  citation: "Hilltop Wellness Collective, 2025 Annual Impact Survey",
  evaluateMethod: "bar",
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

export const ANALYSIS_MEDIAN_INCOME: DatumAnalysis = {
  datum: DATUM_MEDIAN_INCOME,
  relevance: "Several funders ask applicants to establish economic need for the target area.",
  result: {
    understand: [
      "Median household income in Hilltop is $38,200, about 27% below the county average of $52,100.",
    ],
    apply: [
      "Use this figure to justify why a no-cost or low-cost program model matters for this community.",
    ],
  },
};

export const ANALYSIS_PHYSICAL_ACTIVITY: DatumAnalysis = {
  datum: DATUM_PHYSICAL_ACTIVITY,
  relevance: "Directly relevant to any grant asking about health-behavior outcomes.",
  result: {
    understand: [
      "71% of Hilltop adults meet the CDC's physical activity guideline, above the county average of 58%.",
    ],
    apply: [
      "A strong candidate for your 'why here' section — this community is already primed to engage with wellness programming.",
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
    understand: ["68% of participants who finished one season came back for a second."],
    apply: [
      "Retention is a strong signal of program quality — lead with it when a funder asks about outcomes, not just outputs.",
    ],
  },
};
