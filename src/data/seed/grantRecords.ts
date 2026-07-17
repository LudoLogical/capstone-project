import GrantRecord, { GrantLifecycleStage } from "@/types/grantRecord";
import type {
  GrantWritingAnalysis,
  GrantReportingAnalysis,
  GrantReportingConversation,
  GrantReportConversationResponse,
} from "@/types/analysis";
import type { Content } from "@google/genai";
import {
  GRANT_HEALTHY_NEIGHBORHOODS,
  GRANT_FOOD_ACCESS,
  GRANT_GREEN_SPACES,
  GRANT_SENIOR_MOBILITY,
  GRANT_YOUTH_DIGITAL_WELLNESS,
} from "./grants";
import { REGION_PITTSBURGH, LOC_HILLTOP } from "./geo";
import {
  ANALYSIS_CVD_RATE,
  ANALYSIS_PRODUCE_ACCESS,
  ANALYSIS_RESIDENTS_REACHED,
  DATUM_PRODUCE_ACCESS,
  DATUM_RESIDENTS_REACHED,
  DATUM_PROGRAM_RETENTION,
} from "./datum";
import {
  INITIATIVE_HILLTOP_WELLNESS,
  INITIATIVE_HILLTOP_HARVEST,
  INITIATIVE_ALLEGHENY_COMMONS,
} from "./initiatives";

// GrantAnalysis ids are unique across every analysis in this seed, writing and
// reporting alike.
const ANALYSIS_ID_HEALTHY_NEIGHBORHOODS_WRITING = 1;
const ANALYSIS_ID_YOUTH_DIGITAL_WELLNESS_WRITING = 2;
const ANALYSIS_ID_FOOD_ACCESS_REPORTING = 3;

const userTurn = (text: string): Content => ({ role: "user", parts: [{ text }] });

// Every "model" turn carries a GrantReportConversationResponse as JSON, which
// is what the reporting workflow parses back out.
const modelTurn = (response: GrantReportConversationResponse): Content => ({
  role: "model",
  parts: [{ text: JSON.stringify(response) }],
});

// ---- In progress: Healthy Neighborhoods Mini-Grant -------------------------
// Saved + actively collecting supporting data (Data Collection Wizard).

const healthyNeighborhoodsWritingAnalysis: GrantWritingAnalysis = {
  id: ANALYSIS_ID_HEALTHY_NEIGHBORHOODS_WRITING,
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_CVD_RATE, ANALYSIS_RESIDENTS_REACHED],
};

export const RECORD_HEALTHY_NEIGHBORHOODS: GrantRecord = {
  id: "gr-healthy-neighborhoods",
  grant: GRANT_HEALTHY_NEIGHBORHOODS,
  alignmentAnalysis: {
    estimatedFit: 88,
    pros: [
      "Hilltop Wellness Collective's service area sits entirely within Pittsburgh city limits, satisfying the grant's location requirement.",
      "The collective's health-equity focus lines up with the grant's target of neighborhoods carrying the highest rates of chronic disease.",
      "As a 501(c)(3) that has operated since 2017, the collective clears both the entity-type and operating-history criteria.",
    ],
    cons: [
      "The $30,000 annual cap covers only a small share of the collective's $420,000 average annual budget.",
      "The grant expects residents to have helped design the project; the application will need to evidence that, not just program delivery.",
    ],
  },
  stage: GrantLifecycleStage.Saved,
  subscribed: true,
  collabContactRecords: [
    {
      recipientID: INITIATIVE_HILLTOP_HARVEST.id,
      timestamp: new Date("2026-07-09T16:20:00Z"),
    },
    {
      recipientID: INITIATIVE_ALLEGHENY_COMMONS.id,
      timestamp: new Date("2026-07-10T13:05:00Z"),
    },
  ],
  writingAnalyses: [healthyNeighborhoodsWritingAnalysis],
  reportingAnalyses: [],
};

// ---- In progress: Youth Digital Wellness Grant ------------------------------
// Saved + a draft underway (a second application in the "Applications" column).

const youthDigitalWellnessWritingAnalysis: GrantWritingAnalysis = {
  id: ANALYSIS_ID_YOUTH_DIGITAL_WELLNESS_WRITING,
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_RESIDENTS_REACHED],
};

export const RECORD_YOUTH_DIGITAL_WELLNESS: GrantRecord = {
  id: "gr-youth-digital-wellness",
  grant: GRANT_YOUTH_DIGITAL_WELLNESS,
  alignmentAnalysis: {
    estimatedFit: 54,
    pros: [
      "The collective's youth programming overlaps with the grant's focus on digital literacy outside the classroom.",
      "The collective is a Pittsburgh 501(c)(3), which satisfies the grant's entity-type criterion.",
    ],
    cons: [
      "The collective's programs center on health and wellness rather than digital literacy, which is this grant's core purpose.",
      "The grant requires primarily serving youth ages 10-18, while the collective serves residents of every age.",
      "No staff bio relevant to digital literacy instruction is on file yet, and the application asks for one.",
    ],
  },
  stage: GrantLifecycleStage.Saved,
  subscribed: false,
  collabContactRecords: [],
  writingAnalyses: [youthDigitalWellnessWritingAnalysis],
  reportingAnalyses: [],
};

// ---- Awarded: Neighborhood Food Access Grant --------------------------------
// Awarded and actively working through the Repository Report Flow. The
// conversations below track GRANT_FOOD_ACCESS.requirements.reporting in order:
// funded commitments, distribution activity, households reached, outcomes.
// The first two are settled; the last two are still being worked.

const foodAccessConversations: GrantReportingConversation[] = [
  {
    id: 1,
    initialSuggestions: [],
    content: [
      userTurn(
        "We committed to monthly nutrition workshops built around locally sourced produce, plus a weekly produce table at the Knoxville walking-group meetup.",
      ),
      modelTurn({
        message:
          "That names both the activity and where it happens, which is what this requirement asks for. Nothing else needed here.",
        suggestions: [],
        is_sufficient: true,
      }),
    ],
    markedComplete: true,
  },
  {
    id: 2,
    initialSuggestions: [],
    content: [
      userTurn(
        "Across 2025 we held 12 nutrition workshops and ran the produce table at 42 walking-group sessions.",
      ),
      modelTurn({
        message:
          "Both counts match your 2025 Annual Impact Survey, so the activity requirement is covered.",
        suggestions: [],
        is_sufficient: true,
      }),
    ],
    markedComplete: true,
  },
  {
    id: 3,
    initialSuggestions: [DATUM_RESIDENTS_REACHED.id],
    content: [
      userTurn(
        "Should I count everyone who came to a workshop here, or only the households that picked up produce?",
      ),
      modelTurn({
        message:
          "Count the households your distribution actually reached, then name the neighborhoods they live in. Your Annual Impact Survey already has a reach figure you can start from.",
        suggestions: [DATUM_RESIDENTS_REACHED.id],
        is_sufficient: false,
      }),
    ],
    markedComplete: false,
  },
  {
    id: 4,
    initialSuggestions: [DATUM_PRODUCE_ACCESS.id, DATUM_PROGRAM_RETENTION.id],
    content: [
      userTurn("What counts as an outcome for a food access grant?"),
      modelTurn({
        message:
          "A change in access, not just activity. The Vibrancy Index produce-access figure shows where Hilltop stands today, and your retention rate shows participants kept coming back.",
        suggestions: [DATUM_PRODUCE_ACCESS.id, DATUM_PROGRAM_RETENTION.id],
        is_sufficient: false,
      }),
    ],
    markedComplete: false,
  },
];

const foodAccessReportingAnalysis: GrantReportingAnalysis = {
  id: ANALYSIS_ID_FOOD_ACCESS_REPORTING,
  locations: [LOC_HILLTOP],
  regions: [REGION_PITTSBURGH],
  data: [ANALYSIS_PRODUCE_ACCESS, ANALYSIS_RESIDENTS_REACHED],
  conversations: foodAccessConversations,
};

export const RECORD_FOOD_ACCESS: GrantRecord = {
  id: "gr-food-access",
  grant: GRANT_FOOD_ACCESS,
  alignmentAnalysis: {
    estimatedFit: 82,
    pros: [
      "Hilltop Wellness Collective's fresh-food distribution program matched this grant's food-desert eligibility criteria.",
      "39% of households in the collective's tract sit outside a 10-minute walk of fresh produce, establishing the access gap the grant targets.",
      "The collective already works with the regional food bank, which the grant's bulk-purchasing benefit builds on.",
    ],
    cons: [
      "Produce distribution is adjacent to, rather than at the center of, the collective's wellness mission.",
      "The grant requires tracking pounds of produce distributed each month, which the collective does not yet measure.",
    ],
  },
  // Awarded, so the collective is undiscoverable to prospective collaborators
  // regardless of this flag.
  stage: GrantLifecycleStage.Awarded,
  subscribed: false,
  collabContactRecords: [],
  writingAnalyses: [],
  reportingAnalyses: [foodAccessReportingAnalysis],
};

// ---- Saved: Green Spaces & Climate Resilience Fund --------------------------
// Saved for later; no data collection started yet.

export const RECORD_GREEN_SPACES: GrantRecord = {
  id: "gr-green-spaces",
  grant: GRANT_GREEN_SPACES,
  alignmentAnalysis: {
    estimatedFit: 41,
    pros: [
      "The collective works within Allegheny County, one of the grant's target regions.",
      "Community is both a stated issue area for the collective and a focus of this grant.",
    ],
    cons: [
      "The collective neither holds a site nor has written permission to use one, which the grant requires.",
      "Neither a site plan nor a two-year maintenance plan is on file, and the application asks for both.",
      "Green space development sits outside the collective's health and wellness programs.",
    ],
  },
  stage: GrantLifecycleStage.Saved,
  subscribed: true,
  collabContactRecords: [
    {
      recipientID: INITIATIVE_ALLEGHENY_COMMONS.id,
      timestamp: new Date("2026-07-13T11:48:00Z"),
    },
  ],
  writingAnalyses: [],
  reportingAnalyses: [],
};

// ---- Saved: Senior Mobility & Access Grant ---------------------------------
// Saved before the window closed, so it demonstrates the closed-deadline state.

export const RECORD_SENIOR_MOBILITY: GrantRecord = {
  id: "gr-senior-mobility",
  grant: GRANT_SENIOR_MOBILITY,
  alignmentAnalysis: {
    estimatedFit: 76,
    pros: [
      "Health and Community are stated issue areas for both the collective and this grant.",
      "The collective's neighborhood walking groups already address exactly the kind of mobility barrier the grant funds.",
      "The collective is a 501(c)(3) operating in Pittsburgh, which sits inside the grant's Allegheny County target region.",
    ],
    cons: [
      "The collective's programming is open to residents of every age rather than targeted at the adults aged 60 and over the grant requires applicants to serve.",
      "The grant asks for letters of support from two community partners, and none are on file.",
      "The collective does not currently track participants by age, which the grant's quarterly count of older adults served would require.",
    ],
  },
  stage: GrantLifecycleStage.Saved,
  subscribed: false,
  collabContactRecords: [],
  writingAnalyses: [],
  reportingAnalyses: [],
};

INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_HEALTHY_NEIGHBORHOODS.id,
  RECORD_HEALTHY_NEIGHBORHOODS,
);
INITIATIVE_HILLTOP_WELLNESS.grantRecords.set(
  GRANT_SENIOR_MOBILITY.id,
  RECORD_SENIOR_MOBILITY,
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
