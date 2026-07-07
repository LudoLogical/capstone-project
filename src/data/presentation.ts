import type { GrantKey } from "./grants";
import { GRANTS } from "./grants";

/**
 * Presentation metadata layered on top of the pure domain types.
 *
 * The provided `Grant` and `Initiative` types carry no human-facing display
 * name, short funder label, brand color, or narrative copy — those are UI
 * concerns. Rather than alter the data types, we key this metadata by the
 * domain object's stable `id`.
 */

export type FitTier = "strong" | "possible" | "stretch" | "awarded";

export type GrantDisplay = {
  name: string;
  funderShort: string;
  /** 0–100 AI fit read, or null when the org already holds the award. */
  fitScore: number | null;
  fitTier: FitTier;
  /** Gradient used for hero/detail bands. */
  band: string;
};

export const GRANT_DISPLAY: Record<GrantKey, GrantDisplay> = {
  heinzFreshFood: {
    name: "Fresh Food Access Initiative",
    funderShort: "Heinz",
    fitScore: 92,
    fitTier: "strong",
    band: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  },
  growPittsburgh: {
    name: "Urban Growing Spaces Grant",
    funderShort: "Grow Pittsburgh",
    fitScore: 88,
    fitTier: "strong",
    band: "linear-gradient(135deg,#059669,#10b981)",
  },
  mellonGreenInfra: {
    name: "Green Infrastructure & Watersheds",
    funderShort: "RK Mellon",
    fitScore: 54,
    fitTier: "stretch",
    band: "linear-gradient(135deg,#0e7490,#0891b2)",
  },
  pghFoundationVibrancy: {
    name: "Neighborhood Vibrancy Grant",
    funderShort: "Pittsburgh Foundation",
    fitScore: null,
    fitTier: "awarded",
    band: "linear-gradient(135deg,#b45309,#f59e0b)",
  },
  sproutMicrogrant: {
    name: "Small & Mighty Microgrant",
    funderShort: "Sprout Legacy",
    fitScore: 79,
    fitTier: "strong",
    band: "linear-gradient(135deg,#7c3aed,#a855f7)",
  },
  poiseEquityFood: {
    name: "Racial Equity in Food Systems",
    funderShort: "POISE",
    fitScore: 71,
    fitTier: "possible",
    band: "linear-gradient(135deg,#be123c,#e11d48)",
  },
  hillmanCleanAir: {
    name: "Clean Air Community Monitoring",
    funderShort: "Hillman",
    fitScore: 63,
    fitTier: "possible",
    band: "linear-gradient(135deg,#0284c7,#38bdf8)",
  },
  alleghenyMainStreet: {
    name: "Main Street Revitalization",
    funderShort: "Allegheny County",
    fitScore: 48,
    fitTier: "stretch",
    band: "linear-gradient(135deg,#475569,#64748b)",
  },
};

/** Reverse lookup: grant id → display. */
export const GRANT_DISPLAY_BY_ID: Record<string, GrantDisplay> = Object.fromEntries(
  (Object.keys(GRANTS) as GrantKey[]).map((k) => [GRANTS[k].id, GRANT_DISPLAY[k]]),
);

export type OrgDisplay = {
  name: string;
  initials: string;
  avatar: string;
  serviceAreaLabel: string;
  tagline: string;
  mission: string;
  blurb: string;
  nsrSince: string;
  programs: string[];
  results: string[];
  partners: string[];
  /** Why this org appears connected to the current org, if at all. */
  sharedConnection?: string;
  /** Success-story card copy for the dashboard rail. */
  story?: { headline: string; blurb: string };
};

export const ORG_DISPLAY: Record<string, OrgDisplay> = {
  "org-riverside-greenway": {
    name: "Riverside Greenway Project",
    initials: "RG",
    avatar: "#4f46e5",
    serviceAreaLabel: "Greater Hazelwood & Homewood",
    tagline: "Riverside Greenway Project · Fiscally sponsored by New Sun Rising",
    mission:
      "Turning vacant riverfront land into shared green space and fresh food for Hazelwood residents.",
    blurb:
      "Resident-led greening and a weekly fresh market in Greater Hazelwood, reclaiming vacant lots into growing space.",
    nsrSince: "2023",
    programs: ["Hazelwood Fresh Market", "Vacant-lot reclamation", "Youth grow crew"],
    results: ["3 lots reclaimed", "142 avg. weekly market visits", "312 volunteer hours"],
    partners: ["Grow Pittsburgh", "Greater Pittsburgh Community Food Bank"],
    story: {
      headline: "From vacant lot to a market with a line out the gate",
      blurb: "Three reclaimed lots now feed a weekly market that tripled its attendance in one season.",
    },
  },
  "org-hilltop-urban-farm": {
    name: "Hilltop Urban Farm Collective",
    initials: "HU",
    avatar: "#059669",
    serviceAreaLabel: "Hilltop communities",
    tagline: "Hilltop Urban Farm Collective",
    mission: "Growing food and farmers on Pittsburgh's largest urban farm.",
    blurb:
      "Runs a youth farm-apprenticeship and a produce stand serving the St. Clair and Hilltop neighborhoods.",
    nsrSince: "2021",
    programs: ["Youth farm apprenticeship", "Hilltop produce stand"],
    results: ["18 youth apprentices", "9,000 lbs produce grown"],
    partners: ["Grow Pittsburgh", "Hilltop Alliance"],
    sharedConnection: "You both partner with Grow Pittsburgh",
    story: {
      headline: "Teenagers running a farm business, start to finish",
      blurb: "An apprenticeship that hands youth the whole operation — seed to produce stand.",
    },
  },
  "org-braddock-grows": {
    name: "Braddock Grows",
    initials: "BG",
    avatar: "#be123c",
    serviceAreaLabel: "Braddock & North Braddock",
    tagline: "Braddock Grows",
    mission: "Black-led food sovereignty in the Mon Valley.",
    blurb:
      "Community farm and food-distribution hub building a self-determined food system in Braddock.",
    nsrSince: "2020",
    programs: ["Community farm", "Free produce distribution"],
    results: ["220 households served weekly", "POISE cohort member"],
    partners: ["POISE Foundation", "Rust Belt Riders"],
    sharedConnection: "Both saved the Racial Equity in Food Systems grant",
    story: {
      headline: "A free produce box that 220 families count on",
      blurb: "Weekly distribution grew into the neighborhood's most reliable fresh-food source.",
    },
  },
  "org-northside-common-ground": {
    name: "Northside Common Ground",
    initials: "NC",
    avatar: "#0e7490",
    serviceAreaLabel: "Central Northside",
    tagline: "Northside Common Ground",
    mission: "Neighbors caring for shared green space on the Northside.",
    blurb: "Stewards a network of pocket parks and rain gardens maintained by resident volunteers.",
    nsrSince: "2022",
    programs: ["Pocket-park stewardship", "Rain-garden network"],
    results: ["11 pocket parks", "1,400 volunteer hours/yr"],
    partners: ["Western PA Conservancy"],
  },
  "org-allegheny-cleanair": {
    name: "Allegheny CleanAir Coalition",
    initials: "AC",
    avatar: "#0284c7",
    serviceAreaLabel: "Allegheny County",
    tagline: "Allegheny CleanAir Coalition",
    mission: "Resident-run air monitoring that turns data into action.",
    blurb:
      "Operates a low-cost sensor network and trains residents to read and act on local air-quality data.",
    nsrSince: "2019",
    programs: ["Resident sensor network", "Air-quality data reviews"],
    results: ["40 sensors deployed", "Hillman awardee"],
    partners: ["Hillman Family Foundations", "ACHD"],
    sharedConnection: "Serves your neighborhood's air-quality data",
  },
  "org-manchester-youth-arts": {
    name: "Manchester Youth Arts",
    initials: "MY",
    avatar: "#7c3aed",
    serviceAreaLabel: "Manchester",
    tagline: "Manchester Youth Arts",
    mission: "Free arts programming that keeps Manchester youth creating.",
    blurb: "After-school studio and public-mural program for young people on the Northside.",
    nsrSince: "2021",
    programs: ["After-school studio", "Public murals"],
    results: ["60 youth enrolled", "7 neighborhood murals"],
    partners: ["Sprout Fund Legacy"],
  },
  "org-homewood-harvest": {
    name: "Homewood Harvest",
    initials: "HH",
    avatar: "#d97706",
    serviceAreaLabel: "Homewood",
    tagline: "Homewood Harvest",
    mission: "Black-led fresh-food access rooted in Homewood.",
    blurb: "Corner-store fresh-produce program and a summer farm stand serving Homewood.",
    nsrSince: "2020",
    programs: ["Healthy corner stores", "Summer farm stand"],
    results: ["6 corner stores stocked", "Heinz awardee"],
    partners: ["The Heinz Endowments"],
    sharedConnection: "Both applied for the Fresh Food Access Initiative",
    story: {
      headline: "Fresh produce, now on the corner-store shelf",
      blurb: "Six corner stores now stock affordable produce where there was none.",
    },
  },
};

export function orgDisplay(id: string): OrgDisplay {
  return (
    ORG_DISPLAY[id] ?? {
      name: id,
      initials: "??",
      avatar: "#6b7280",
      serviceAreaLabel: "",
      tagline: id,
      mission: "",
      blurb: "",
      nsrSince: "",
      programs: [],
      results: [],
      partners: [],
    }
  );
}
