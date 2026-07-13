import type Initiative from "@/types/initiative";
import type { WebpageSource, ChatSource } from "@/types/data";
import { REGION_PITTSBURGH, REGION_ALLEGHENY_COUNTY } from "./geo";
import { SRC_ANNUAL_IMPACT_SURVEY, SRC_BUDGET_RECORDS } from "./datum";

const SRC_WEBSITE: WebpageSource = {
  folder: null,
  isDeleted: false,
  link: "https://hilltopwellness.org",
};

const SRC_CHAT_STUB: ChatSource = {
  folder: null,
  isDeleted: false,
  conversationID: "conv-onboarding-1",
  messageIndex: 0,
};

// Grant-readiness ID of the org that is signed in to the portal in this
// build. All dashboard/account/search screens are scoped to this Initiative.
export const MAIN_INITIATIVE_ID = "init-hilltop-wellness";

export const INITIATIVE_HILLTOP_WELLNESS: Initiative = {
  id: MAIN_INITIATIVE_ID,
  name: "Hilltop Wellness Collective",
  mission:
    "Hilltop Wellness Collective builds resident-led health and wellness programming in Pittsburgh's Hilltop neighborhoods.",
  programs: ["Neighborhood walking groups", "Nutrition workshops"],
  contactEmail: "maya@hilltopwellness.org",
  issues: ["Health", "Community"],
  serviceAreas: [REGION_PITTSBURGH],
  grantRecords: new Map(),
  averageAnnualBudget: 420000,
  sources: [
    SRC_ANNUAL_IMPACT_SURVEY,
    SRC_BUDGET_RECORDS,
    SRC_WEBSITE,
    SRC_CHAT_STUB,
  ],
};

export const INITIATIVE_HILLTOP_HARVEST: Initiative = {
  id: "init-hilltop-harvest",
  name: "Hilltop Harvest Collective",
  mission:
    "Growing and distributing fresh produce within walking distance of every household in the Hilltop neighborhoods.",
  programs: ["Community gardens", "Mobile produce stand"],
  contactEmail: "hello@hilltopharvest.org",
  issues: ["Food Security", "Community"],
  serviceAreas: [REGION_PITTSBURGH],
  grantRecords: new Map(),
  averageAnnualBudget: 180000,
  sources: [],
};

export const INITIATIVE_RIVERSIDE_YOUTH_STUDIO: Initiative = {
  id: "init-riverside-youth-studio",
  name: "Riverside Youth Studio",
  mission:
    "Giving Pittsburgh teens hands-on media and coding skills in a low-pressure studio setting.",
  programs: ["After-school coding", "Video production", "Podcasting"],
  contactEmail: "team@riversideyouthstudio.org",
  issues: ["Youth", "Technology"],
  serviceAreas: [REGION_PITTSBURGH],
  grantRecords: new Map(),
  averageAnnualBudget: 260000,
  sources: [],
};

export const INITIATIVE_ALLEGHENY_COMMONS: Initiative = {
  id: "init-allegheny-commons-alliance",
  name: "Allegheny Commons Alliance",
  mission:
    "Building and maintaining resilient green space across Allegheny County's most heat-vulnerable neighborhoods.",
  programs: ["Pocket parks", "Rain gardens", "Landscape planning"],
  contactEmail: "contact@alleghenycommons.org",
  issues: ["Environment", "Community"],
  serviceAreas: [REGION_ALLEGHENY_COUNTY],
  grantRecords: new Map(),
  averageAnnualBudget: 310000,
  sources: [],
};

export const ALL_INITIATIVES: Initiative[] = [
  INITIATIVE_HILLTOP_WELLNESS,
  INITIATIVE_HILLTOP_HARVEST,
  INITIATIVE_RIVERSIDE_YOUTH_STUDIO,
  INITIATIVE_ALLEGHENY_COMMONS,
];
