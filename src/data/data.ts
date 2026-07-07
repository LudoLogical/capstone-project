import type {
  AuthoritativeDatum,
  NSRServiceDatum,
  InitiativeDatum,
  WebpageSource,
  DocumentSource,
  ChatSource,
} from "../../types/data";
import type { Location as GeoLocation } from "../../types/geo";
import { LOCATIONS } from "./geo";

/**
 * NOTE ON `AuthoritativeDatum.location`:
 * In `types/data.ts` the `location` field is typed as `Location` with no
 * import, so it resolves to the DOM's global `Location` interface rather than
 * the geographic {@link GeoLocation}. We keep the provided types untouched and
 * bridge with this helper, storing a geographic Location where the datum's
 * location is semantically meant to live.
 */
export function asDatumLocation(loc: GeoLocation): AuthoritativeDatum["location"] {
  return loc as unknown as AuthoritativeDatum["location"];
}

export function readDatumLocation(loc: AuthoritativeDatum["location"]): GeoLocation {
  return loc as unknown as GeoLocation;
}

/* ------------------------------------------------------------------ *
 * AUTHORITATIVE DATA — drawn from the Vibrancy Index dataset.
 * Each carries cross-location context (min / average / max) so the UI
 * can render an honest bar chart with a benchmark.
 * ------------------------------------------------------------------ */

export const AUTHORITATIVE: Record<string, AuthoritativeDatum> = {
  freshFoodAccess: {
    content: "Households within a half-mile of a fresh-food outlet in Greater Hazelwood",
    citation: "Vibrancy Index · Food Access layer, 2025 (ACS + local retail audit)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 41,
    unit: "% of households",
    context: { minimum: 18, average: 55, maximum: 91 },
  },
  vacantLots: {
    content: "Vacant and tax-delinquent parcels per 1,000 residents",
    citation: "Vibrancy Index · Land Use layer, 2025 (Allegheny County parcel data)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 34,
    unit: "parcels / 1k residents",
    context: { minimum: 4, average: 21, maximum: 58 },
  },
  treeCanopy: {
    content: "Tree-canopy coverage across the neighborhood footprint",
    citation: "Vibrancy Index · Green Cover layer, 2024 (LiDAR canopy analysis)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 22,
    unit: "% land area",
    context: { minimum: 9, average: 31, maximum: 64 },
  },
  airQuality: {
    content: "Annual average fine-particulate pollution (PM2.5)",
    citation: "Vibrancy Index · Air Quality layer, 2024 (ACHD monitor network)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 12.4,
    unit: "µg/m³",
    context: { minimum: 7.1, average: 10.8, maximum: 15.9 },
  },
  medianIncome: {
    content: "Median household income",
    citation: "Vibrancy Index · Economic layer, 2023 (ACS 5-year)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 31200,
    unit: "USD",
    context: { minimum: 21800, average: 48600, maximum: 118400 },
  },
  youthPopulation: {
    content: "Residents under age 18",
    citation: "Vibrancy Index · Demographics layer, 2023 (ACS 5-year)",
    evaluateMethod: "bar",
    location: asDatumLocation(LOCATIONS.hazelwood),
    value: 27,
    unit: "% of residents",
    context: { minimum: 12, average: 20, maximum: 33 },
  },
};

/* ------------------------------------------------------------------ *
 * NSR SERVICE DATA — pulled from other services NSR operates.
 * BMS = Budget Management System, AIS = Awardee Impact Store,
 * OAT = Organizational Assessment Tool.
 * ------------------------------------------------------------------ */

export const NSR_SERVICE: Record<string, NSRServiceDatum> = {
  averageBudget: {
    content: "Riverside Greenway Project's average annual operating budget",
    citation: "NSR Budget Management System (BMS), fiscal years 2023–2025",
    evaluateMethod: "bar",
    service: "BMS",
  },
  priorAwardImpact: {
    content: "Volunteer hours logged against the 2024 Neighborhood Vibrancy award",
    citation: "NSR Awardee Impact Store (AIS)",
    evaluateMethod: "bar",
    service: "AIS",
  },
  orgReadiness: {
    content: "Grant-readiness assessment score (financial controls + reporting history)",
    citation: "NSR Organizational Assessment Tool (OAT), Q1 2026",
    evaluateMethod: "bar",
    service: "OAT",
  },
};

/* ------------------------------------------------------------------ *
 * INITIATIVE SOURCES — material the org supplied directly to the tool.
 * ------------------------------------------------------------------ */

function makeDoc(
  name: string,
  type: DocumentSource["type"],
  folder: string | null,
  body: string,
): DocumentSource {
  return {
    folder,
    isDeleted: false,
    file: new File([body], name, { type: "text/plain" }),
    name,
    type,
  };
}

export const WEBPAGE_SOURCES: Record<string, WebpageSource> = {
  siteAbout: {
    folder: "Public web",
    isDeleted: false,
    link: "https://riversidegreenway.org/about",
  },
  pressGardenOpening: {
    folder: "Press",
    isDeleted: false,
    link: "https://pittsburghpost.example/2025/06/hazelwood-community-garden",
  },
};

export const DOCUMENT_SOURCES: Record<string, DocumentSource> = {
  signInSheet: makeDoc(
    "Spring 2025 Market Sign-in Sheets.xlsx",
    "xlsx",
    "Attendance",
    "week,attendees\n1,84\n2,96\n3,131\n4,142",
  ),
  budgetNarrative: makeDoc(
    "FY25 Budget Narrative.docx",
    "docx",
    "Financials",
    "Operating budget narrative for fiscal year 2025.",
  ),
  volunteerLog: makeDoc(
    "Volunteer Hours 2024-2025.csv",
    "csv",
    "Attendance",
    "date,hours\n2025-03-01,46\n2025-04-05,62",
  ),
  photoBoard: makeDoc(
    "Community Board Photos.pdf",
    "pdf",
    null,
    "Photographs of the Hazelwood community board and harvest day.",
  ),
};

export const CHAT_SOURCES: Record<string, ChatSource> = {
  reportingChat: {
    folder: null,
    isDeleted: false,
    conversationID: "conv-neighborhood-vibrancy-2025",
    messageIndex: 4,
  },
};

/* ------------------------------------------------------------------ *
 * INITIATIVE DATA — facts derived from the org's own sources.
 * ------------------------------------------------------------------ */

export const INITIATIVE_DATA: Record<string, InitiativeDatum> = {
  marketAttendance: {
    content: "Average weekly attendance at the Hazelwood Fresh Market reached 142 in spring 2025",
    citation: "From your uploaded ‘Spring 2025 Market Sign-in Sheets’",
    evaluateMethod: "bar",
    source: DOCUMENT_SOURCES.signInSheet,
  },
  volunteerHours: {
    content: "312 volunteer hours logged across the 2024–2025 growing season",
    citation: "From your uploaded ‘Volunteer Hours 2024-2025’",
    evaluateMethod: "bar",
    source: DOCUMENT_SOURCES.volunteerLog,
  },
  lotsReclaimed: {
    content: "Three vacant lots reclaimed into raised-bed growing space since 2023",
    citation: "From your organization profile · Programs",
    evaluateMethod: "bar",
    source: WEBPAGE_SOURCES.siteAbout,
  },
};
