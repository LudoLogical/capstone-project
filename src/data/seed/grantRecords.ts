import GrantRecord, { GrantLifecycleStage } from "@/types/grantRecord";
import type {
  GrantWritingAnalysis,
  GrantReportingAnalysis,
  GrantReportingConversation,
} from "@/types/analysis";
import {
  GRANT_HEALTHY_NEIGHBORHOODS,
  GRANT_FOOD_ACCESS,
  GRANT_GREEN_SPACES,
  GRANT_YOUTH_DIGITAL_WELLNESS,
} from "./grants";
import { REGION_PITTSBURGH, LOC_HILLTOP } from "./geo";
import {
  ANALYSIS_CVD_RATE,
  ANALYSIS_PRODUCE_ACCESS,
  ANALYSIS_RESIDENTS_REACHED,
} from "./datum";
import { INITIATIVE_HILLTOP_WELLNESS } from "./initiatives";

// ---- In progress: Healthy Neighborhoods Mini-Grant -------------------------
// Saved + actively collecting supporting data (Data Collection Wizard).

const healthyNeighborhoodsWritingAnalysis: GrantWritingAnalysis = {
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_CVD_RATE, ANALYSIS_RESIDENTS_REACHED],
};

export const RECORD_HEALTHY_NEIGHBORHOODS: GrantRecord = {
  id: "gr-healthy-neighborhoods",
  grant: GRANT_HEALTHY_NEIGHBORHOODS,
  alignmentAnalysis:
    "Strong fit: Hilltop Wellness Collective's service area and health-equity focus line up directly with this grant's eligibility and target region.",
  stage: GrantLifecycleStage.Saved,
  writingAnalyses: [healthyNeighborhoodsWritingAnalysis],
  reportingAnalyses: [],
};

// ---- In progress: Youth Digital Wellness Grant ------------------------------
// Saved + a draft underway (a second application in the "Applications" column).

const youthDigitalWellnessWritingAnalysis: GrantWritingAnalysis = {
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_RESIDENTS_REACHED],
};

export const RECORD_YOUTH_DIGITAL_WELLNESS: GrantRecord = {
  id: "gr-youth-digital-wellness",
  grant: GRANT_YOUTH_DIGITAL_WELLNESS,
  alignmentAnalysis:
    "Emerging fit: Hilltop Wellness Collective's youth programming overlaps with this grant's digital-literacy focus - a draft is underway to test the angle.",
  stage: GrantLifecycleStage.Saved,
  writingAnalyses: [youthDigitalWellnessWritingAnalysis],
  reportingAnalyses: [],
};

// ---- Awarded: Neighborhood Food Access Grant --------------------------------
// Awarded and actively working through the Repository Report Flow.

const foodAccessConversations: GrantReportingConversation[] = [
  { id: "conv-commitment", content: undefined },
  { id: "conv-events", content: undefined },
  { id: "conv-community", content: undefined },
  { id: "conv-outcomes", content: undefined },
];

const foodAccessReportingAnalysis: GrantReportingAnalysis = {
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_PRODUCE_ACCESS, ANALYSIS_RESIDENTS_REACHED],
  conversations: foodAccessConversations,
};

export const RECORD_FOOD_ACCESS: GrantRecord = {
  id: "gr-food-access",
  grant: GRANT_FOOD_ACCESS,
  alignmentAnalysis:
    "Awarded for 2026. Hilltop Wellness Collective's fresh-food distribution program matched this grant's food-desert eligibility criteria.",
  stage: GrantLifecycleStage.Awarded,
  writingAnalyses: [],
  reportingAnalyses: [foodAccessReportingAnalysis],
};

// ---- Saved: Green Spaces & Climate Resilience Fund --------------------------
// Saved for later; no data collection started yet.

export const RECORD_GREEN_SPACES: GrantRecord = {
  id: "gr-green-spaces",
  grant: GRANT_GREEN_SPACES,
  alignmentAnalysis:
    "Possible fit: eligible region and issue area, but no site plan on file yet - worth a closer look before applying.",
  stage: GrantLifecycleStage.Saved,
  writingAnalyses: [],
  reportingAnalyses: [],
};

INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_HEALTHY_NEIGHBORHOODS.id,
  RECORD_HEALTHY_NEIGHBORHOODS,
);
INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_YOUTH_DIGITAL_WELLNESS.id,
  RECORD_YOUTH_DIGITAL_WELLNESS,
);
INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_FOOD_ACCESS.id,
  RECORD_FOOD_ACCESS,
);
INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_GREEN_SPACES.id,
  RECORD_GREEN_SPACES,
);
