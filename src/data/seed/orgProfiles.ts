import {
  GRANT_HEALTHY_NEIGHBORHOODS,
  GRANT_FOOD_ACCESS,
  GRANT_YOUTH_DIGITAL_WELLNESS,
  GRANT_GREEN_SPACES,
} from "./grants";
import {
  INITIATIVE_HILLTOP_HARVEST,
  INITIATIVE_RIVERSIDE_YOUTH_STUDIO,
  INITIATIVE_ALLEGHENY_COMMONS,
} from "./initiatives";

// Public-profile copy for prospective collaborators (Org Profile screen).
// Mission/founding-year/team-size aren't part of the shared Initiative type,
// so this is app-local presentation content keyed by initiative id.
export type OrgProfileContent = {
  initiativeId: string;
  name: string;
  place: string;
  lead: string;
  founded: string;
  size: string;
  mission: string;
  focus: string[];
  /** Communities served, drawn from the same LOCATION_OPTIONS the user picks
   *  from in onboarding, so both sides speak one vocabulary. */
  areas: string[];
  /** Public contact inbox, used to address warm-introduction emails. */
  email: string;
};

export const ORG_PROFILES: Record<string, OrgProfileContent> = {
  [INITIATIVE_HILLTOP_HARVEST.id]: {
    initiativeId: INITIATIVE_HILLTOP_HARVEST.id,
    name: "Hilltop Harvest Collective",
    place: "Hilltop, Pittsburgh, PA",
    lead: "Renata Alvarez",
    founded: "2019",
    size: "6 staff, 40+ volunteers",
    mission:
      "Growing and distributing fresh produce within walking distance of every household in the Hilltop neighborhoods.",
    focus: ["Food Security", "Community", "Youth"],
    areas: ["City of Pittsburgh", "Hill District"],
    email: "hello@hilltopharvest.org",
  },
  [INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id]: {
    initiativeId: INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id,
    name: "Riverside Youth Studio",
    place: "East Liberty, Pittsburgh, PA",
    lead: "Jordan Kim",
    founded: "2021",
    size: "4 staff, 15 volunteers",
    mission:
      "Giving Pittsburgh teens hands-on media and coding skills in a low-pressure studio setting.",
    focus: ["Youth", "Technology"],
    areas: ["City of Pittsburgh", "East Liberty"],
    email: "team@riversideyouthstudio.org",
  },
  [INITIATIVE_ALLEGHENY_COMMONS.id]: {
    initiativeId: INITIATIVE_ALLEGHENY_COMMONS.id,
    name: "Allegheny Commons Alliance",
    place: "Allegheny County, PA",
    lead: "Theo Marsh",
    founded: "2016",
    size: "9 staff, 60+ volunteers",
    mission:
      "Building and maintaining resilient green space across Allegheny County's most heat-vulnerable neighborhoods.",
    focus: ["Environment", "Community"],
    areas: ["Allegheny County", "Homestead", "McKeesport"],
    email: "hello@alleghenycommons.org",
  },
};

// Which collaborator initiatives are surfaced as "discoverable" for each
// grant's Collaborate roster.
export const INTERESTED_BY_GRANT: Record<string, string[]> = {
  [GRANT_HEALTHY_NEIGHBORHOODS.id]: [
    INITIATIVE_HILLTOP_HARVEST.id,
    INITIATIVE_ALLEGHENY_COMMONS.id,
  ],
  [GRANT_FOOD_ACCESS.id]: [INITIATIVE_HILLTOP_HARVEST.id],
  [GRANT_YOUTH_DIGITAL_WELLNESS.id]: [INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id],
  [GRANT_GREEN_SPACES.id]: [
    INITIATIVE_ALLEGHENY_COMMONS.id,
    INITIATIVE_HILLTOP_HARVEST.id,
  ],
};
