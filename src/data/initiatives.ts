import type Initiative from "../../types/initiative";
import type Grant from "../../types/grant";
import type GrantRecord from "../../types/grantRecord";
import { GrantLifecycleStage } from "../../types/grantRecord";
import type {
  BaseGrantAnalysis,
  GrantReportingAnalysis,
} from "../../types/analysis";
import { REGIONS } from "./geo";
import { GRANTS } from "./grants";
import {
  WEBPAGE_SOURCES,
  DOCUMENT_SOURCES,
  CHAT_SOURCES,
} from "./data";
import {
  heinzWritingAnalysis,
  growWritingAnalysis,
  vibrancyReportingAnalysis,
} from "./analyses";

let recordSeq = 0;
function buildRecord(
  grant: Grant,
  stage: GrantLifecycleStage,
  opts: {
    alignmentAnalysis: string;
    writingAnalyses?: BaseGrantAnalysis[];
    reportingAnalyses?: GrantReportingAnalysis[];
  },
): GrantRecord {
  return {
    id: `rec-${++recordSeq}`,
    grant,
    alignmentAnalysis: opts.alignmentAnalysis,
    stage,
    writingAnalyses: opts.writingAnalyses ?? [],
    reportingAnalyses: opts.reportingAnalyses ?? [],
  };
}

function recordsMap(records: GrantRecord[]): Map<string, GrantRecord> {
  return new Map(records.map((r) => [r.grant.id, r]));
}

/* ------------------------------------------------------------------ *
 * CURRENT ORG — Riverside Greenway Project
 * A fiscally-sponsored community project. Its grant records span the
 * full lifecycle: applying, awarded (reporting), saved, and one loss.
 * ------------------------------------------------------------------ */

export const currentOrgRecords: GrantRecord[] = [
  buildRecord(GRANTS.heinzFreshFood, GrantLifecycleStage.Applied, {
    alignmentAnalysis:
      "Strong fit. Your Hazelwood food-access work sits squarely in this funder's target tracts, and your growing market attendance is exactly the traction they fund. Watch the $500k budget ceiling — you clear it easily.",
    writingAnalyses: [heinzWritingAnalysis],
  }),
  buildRecord(GRANTS.growPittsburgh, GrantLifecycleStage.Applied, {
    alignmentAnalysis:
      "Very strong fit. You have site control on three reclaimed lots and a documented vacancy surplus nearby — the two things this fund weighs most.",
    writingAnalyses: [growWritingAnalysis],
  }),
  buildRecord(GRANTS.pghFoundationVibrancy, GrantLifecycleStage.Awarded, {
    alignmentAnalysis:
      "Awarded in 2025. Reporting is due August 1, 2026 — your tracked volunteer hours and lots-reclaimed count already cover most of what they ask.",
    reportingAnalyses: [vibrancyReportingAnalysis],
  }),
  buildRecord(GRANTS.mellonGreenInfra, GrantLifecycleStage.Saved, {
    alignmentAnalysis:
      "Possible fit, but a stretch. This funder expects a named engineering partner and audited financials — worth pursuing only if you can line those up.",
  }),
  buildRecord(GRANTS.sproutMicrogrant, GrantLifecycleStage.Saved, {
    alignmentAnalysis:
      "Easy, fast fit for a small block-level idea — a low-lift way to fund a harvest celebration.",
  }),
  buildRecord(GRANTS.poiseEquityFood, GrantLifecycleStage.Saved, {
    alignmentAnalysis:
      "Mission-aligned on food justice. Confirm the leadership eligibility carefully before investing time in the narrative.",
  }),
  buildRecord(GRANTS.hillmanCleanAir, GrantLifecycleStage.NotSaved, {
    alignmentAnalysis:
      "Adjacent to your work. Your neighborhood's PM2.5 sits above the county average, which would anchor a monitoring proposal if you choose to expand into air quality.",
  }),
  buildRecord(GRANTS.alleghenyMainStreet, GrantLifecycleStage.NotAwarded, {
    alignmentAnalysis:
      "Applied in spring 2026 and were not selected — the reimbursement model was a stretch for your cash position. Kept for reference.",
  }),
];

export const currentOrg: Initiative = {
  id: "org-riverside-greenway",
  contactEmail: "hello@riversidegreenway.org",
  issues: [
    "Food Access & Security",
    "Environment & Green Space",
    "Clean Air & Climate",
    "Community Safety",
  ],
  serviceAreas: [REGIONS.hazelwood, REGIONS.homewood, REGIONS.cityOfPittsburgh],
  grantRecords: recordsMap(currentOrgRecords),
  averageAnnualBudget: 85000,
  sources: [
    WEBPAGE_SOURCES.siteAbout,
    WEBPAGE_SOURCES.pressGardenOpening,
    DOCUMENT_SOURCES.signInSheet,
    DOCUMENT_SOURCES.budgetNarrative,
    DOCUMENT_SOURCES.volunteerLog,
    DOCUMENT_SOURCES.photoBoard,
    CHAT_SOURCES.reportingChat,
  ],
};

/* ------------------------------------------------------------------ *
 * NETWORK ORGS — other NSR members, used as awardees & collaborators.
 * ------------------------------------------------------------------ */

function networkOrg(
  id: string,
  contactEmail: string,
  issues: Initiative["issues"],
  serviceAreas: Initiative["serviceAreas"],
  averageAnnualBudget: number,
  records: GrantRecord[] = [],
): Initiative {
  return {
    id,
    contactEmail,
    issues,
    serviceAreas,
    grantRecords: recordsMap(records),
    averageAnnualBudget,
    sources: [],
  };
}

export const hilltopUrbanFarm = networkOrg(
  "org-hilltop-urban-farm",
  "grow@hilltopurbanfarm.org",
  ["Food Access & Security", "Environment & Green Space", "Youth & Education"],
  [REGIONS.hilltop],
  140000,
  [
    buildRecord(GRANTS.heinzFreshFood, GrantLifecycleStage.Awarded, {
      alignmentAnalysis: "Prior Heinz food-access awardee.",
    }),
  ],
);

export const braddockGrows = networkOrg(
  "org-braddock-grows",
  "team@braddockgrows.org",
  ["Food Access & Security", "Racial Equity", "Economic Opportunity"],
  [REGIONS.braddock],
  95000,
  [
    buildRecord(GRANTS.poiseEquityFood, GrantLifecycleStage.Awarded, {
      alignmentAnalysis: "Black-led food-systems awardee.",
    }),
  ],
);

export const northsideCommonGround = networkOrg(
  "org-northside-common-ground",
  "hello@northsidecommonground.org",
  ["Environment & Green Space", "Community Safety", "Civic Engagement"],
  [REGIONS.northside],
  110000,
);

export const cleanAirCoalition = networkOrg(
  "org-allegheny-cleanair",
  "info@alleghenycleanair.org",
  ["Clean Air & Climate", "Health & Wellness", "Civic Engagement"],
  [REGIONS.alleghenyCounty],
  180000,
  [
    buildRecord(GRANTS.hillmanCleanAir, GrantLifecycleStage.Awarded, {
      alignmentAnalysis: "Runs the resident air-monitoring network.",
    }),
  ],
);

export const manchesterYouthArts = networkOrg(
  "org-manchester-youth-arts",
  "studio@manchesteryoutharts.org",
  ["Arts & Culture", "Youth & Education", "Community Safety"],
  [REGIONS.manchester],
  72000,
);

export const homewoodHarvest = networkOrg(
  "org-homewood-harvest",
  "roots@homewoodharvest.org",
  ["Food Access & Security", "Racial Equity", "Health & Wellness"],
  [REGIONS.homewood],
  88000,
  [
    buildRecord(GRANTS.heinzFreshFood, GrantLifecycleStage.Awarded, {
      alignmentAnalysis: "Prior Heinz food-access awardee in Homewood.",
    }),
  ],
);

export const networkOrgs: Initiative[] = [
  hilltopUrbanFarm,
  braddockGrows,
  northsideCommonGround,
  cleanAirCoalition,
  manchesterYouthArts,
  homewoodHarvest,
];
