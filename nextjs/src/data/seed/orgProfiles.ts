import { GRANT_HEALTHY_NEIGHBORHOODS, GRANT_FOOD_ACCESS, GRANT_YOUTH_DIGITAL_WELLNESS, GRANT_GREEN_SPACES } from "./grants";
import {
  INITIATIVE_HILLTOP_HARVEST,
  INITIATIVE_RIVERSIDE_YOUTH_STUDIO,
  INITIATIVE_ALLEGHENY_COMMONS,
} from "./initiatives";

// Public-profile copy for prospective collaborators (Org Profile screen).
// Mission/about/founding-year/contact-consent aren't part of the shared
// Initiative type, so this is app-local presentation content keyed by
// initiative id.
export type CollabSignal = { label: string; source: string };

export type OrgProfileContent = {
  initiativeId: string;
  name: string;
  place: string;
  lead: string;
  founded: string;
  size: string;
  mission: string;
  about: string;
  focus: string[];
  contactConsent: boolean;
  contactName?: string;
  contactPhone?: string;
  signals: CollabSignal[];
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
    about:
      "Hilltop Harvest Collective operates three community gardens and a weekly mobile produce stand, focused on closing the fresh-food gap identified in the Vibrancy Index's food access layer.",
    focus: ["Food Security", "Community", "Youth"],
    contactConsent: true,
    contactName: "Renata Alvarez",
    contactPhone: "(412) 555-0148",
    signals: [
      { label: "Shares a funder with you", source: "Both organizations have applied to Hunger-Free PA in the past two years." },
      { label: "Overlapping service area", source: "Both organizations list Hilltop, Pittsburgh, PA as a primary service area." },
      { label: "0.6 miles away", source: "Distance between registered program addresses." },
    ],
  },
  [INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id]: {
    initiativeId: INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id,
    name: "Riverside Youth Studio",
    place: "East Liberty, Pittsburgh, PA",
    lead: "Jordan Kim",
    founded: "2021",
    size: "4 staff, 15 volunteers",
    mission: "Giving Pittsburgh teens hands-on media and coding skills in a low-pressure studio setting.",
    about:
      "Riverside Youth Studio runs after-school and summer coding, video, and podcasting programs for teens ages 12-18, with a focus on digital literacy paired with healthy technology habits.",
    focus: ["Youth", "Technology"],
    contactConsent: false,
    signals: [
      { label: "Shares a funder with you", source: "Both organizations have applied to Grable Foundation in the past two years." },
      { label: "2.1 miles away", source: "Distance between registered program addresses." },
    ],
  },
  [INITIATIVE_ALLEGHENY_COMMONS.id]: {
    initiativeId: INITIATIVE_ALLEGHENY_COMMONS.id,
    name: "Allegheny Commons Alliance",
    place: "Allegheny County, PA",
    lead: "Theo Marsh",
    founded: "2016",
    size: "9 staff, 60+ volunteers",
    mission: "Building and maintaining resilient green space across Allegheny County's most heat-vulnerable neighborhoods.",
    about:
      "Allegheny Commons Alliance designs and stewards pocket parks and rain gardens, with technical landscape-planning expertise that many smaller community groups don't have in-house.",
    focus: ["Environment", "Community"],
    contactConsent: true,
    contactName: "Theo Marsh",
    contactPhone: "(412) 555-0172",
    signals: [
      { label: "Shares a funder with you", source: "Both organizations have applied to Heinz Endowments in the past two years." },
      { label: "Overlapping service area", source: "Both organizations list Allegheny County as a service area." },
      { label: "3.4 miles away", source: "Distance between registered program addresses." },
    ],
  },
};

// Which collaborator initiatives are surfaced as "discoverable" for each
// grant's Collaborate roster.
export const INTERESTED_BY_GRANT: Record<string, string[]> = {
  [GRANT_HEALTHY_NEIGHBORHOODS.id]: [INITIATIVE_HILLTOP_HARVEST.id, INITIATIVE_ALLEGHENY_COMMONS.id],
  [GRANT_FOOD_ACCESS.id]: [INITIATIVE_HILLTOP_HARVEST.id],
  [GRANT_YOUTH_DIGITAL_WELLNESS.id]: [INITIATIVE_RIVERSIDE_YOUTH_STUDIO.id],
  [GRANT_GREEN_SPACES.id]: [INITIATIVE_ALLEGHENY_COMMONS.id, INITIATIVE_HILLTOP_HARVEST.id],
};
