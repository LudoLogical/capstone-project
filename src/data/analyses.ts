import type {
  DatumAnalysis,
  GrantWritingAnalysis,
  GrantReportingAnalysis,
  GrantReportingConversation,
} from "../../types/analysis";
import { LOCATIONS, REGIONS } from "./geo";
import { AUTHORITATIVE, INITIATIVE_DATA, NSR_SERVICE } from "./data";

/* ---- individual datum analyses ---- */

const freshFoodGap: DatumAnalysis = {
  datum: AUTHORITATIVE.freshFoodAccess,
  relevance:
    "Directly establishes the food-access need at the center of this grant's purpose.",
  result: {
    understand: [
      "Only 41% of Hazelwood households live within a half-mile of fresh food, versus a 55% regional average.",
      "That places your service area in the bottom third of the county for this measure.",
    ],
    apply: [
      "Open the application's need section with this gap figure and its regional benchmark.",
      "Use it to justify the number of households your program aims to reach.",
    ],
  },
};

const marketMomentum: DatumAnalysis = {
  datum: INITIATIVE_DATA.marketAttendance,
  relevance: "Shows the program is already working and growing before any award.",
  result: {
    understand: [
      "Weekly market attendance climbed from 84 to 142 across the spring 2025 season.",
      "This is your own operating data, not an estimate.",
    ],
    apply: [
      "Pair the attendance trend with the access gap to show demand meeting need.",
      "Project forward: a funded second market day could extend this curve.",
    ],
  },
};

const budgetContext: DatumAnalysis = {
  datum: NSR_SERVICE.averageBudget,
  relevance: null,
  result: {
    understand: [
      "Your three-year average operating budget is roughly $85,000.",
      "That keeps you well under this funder's $500,000 eligibility ceiling.",
    ],
    apply: [
      "State the budget plainly to confirm eligibility up front.",
      "Show the award would roughly double your program capacity.",
    ],
  },
};

const volunteerEvidence: DatumAnalysis = {
  datum: INITIATIVE_DATA.volunteerHours,
  relevance: "Quantifies community ownership — a core reporting expectation.",
  result: {
    understand: [
      "312 volunteer hours were logged across the 2024–2025 season.",
      "Volunteer labor is a strong proxy for resident buy-in.",
    ],
    apply: [
      "Report the volunteer-hours total as headline evidence of community leadership.",
      "Attach one volunteer's story to make the number land.",
    ],
  },
};

const lotsEvidence: DatumAnalysis = {
  datum: INITIATIVE_DATA.lotsReclaimed,
  relevance: "Ties the greening outcome back to the neighborhood-vibrancy goal.",
  result: {
    understand: [
      "Three vacant lots have been converted to raised-bed growing space since 2023.",
      "Each conversion removes a blighted parcel and adds productive green space.",
    ],
    apply: [
      "Use lots-reclaimed as the primary output metric for the vibrancy report.",
      "Include before/after photos alongside the count.",
    ],
  },
};

/* ---- writing analysis: Heinz Fresh Food application ---- */

export const heinzWritingAnalysis: GrantWritingAnalysis = {
  locations: [LOCATIONS.hazelwood],
  regions: [REGIONS.hazelwood, REGIONS.homewood],
  data: [freshFoodGap, marketMomentum, budgetContext],
};

/* ---- writing analysis: Grow Pittsburgh urban spaces ---- */

export const growWritingAnalysis: GrantWritingAnalysis = {
  locations: [LOCATIONS.hazelwood, LOCATIONS.lawrenceville],
  regions: [REGIONS.hazelwood, REGIONS.lawrenceville],
  data: [
    {
      datum: AUTHORITATIVE.vacantLots,
      relevance: "Establishes the vacant-land opportunity this grant targets.",
      result: {
        understand: [
          "Hazelwood carries 34 vacant parcels per 1,000 residents, well above the 21 average.",
          "That surplus of idle land is exactly what a growing-space grant converts.",
        ],
        apply: [
          "Cite the vacancy rate to justify site selection.",
          "Note how many parcels sit within a block of your proposed site.",
        ],
      },
    },
    lotsEvidence,
  ],
};

/* ---- reporting analysis: Pittsburgh Foundation Neighborhood Vibrancy ---- */

const reportingConversation: GrantReportingConversation = {
  id: "conv-neighborhood-vibrancy-2025",
  // `content` is typed as ContentListUnion (aliased to `undefined`) in the
  // provided types, so it carries no serialized transcript here.
  content: undefined,
};

export const vibrancyReportingAnalysis: GrantReportingAnalysis = {
  locations: [LOCATIONS.hazelwood],
  regions: [REGIONS.hazelwood, REGIONS.cityOfPittsburgh],
  data: [volunteerEvidence, lotsEvidence],
  conversations: [reportingConversation],
};
