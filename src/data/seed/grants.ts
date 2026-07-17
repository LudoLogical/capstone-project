import type Grant from "@/types/grant";
import {
  REGION_ALLEGHENY_COUNTY,
  REGION_PITTSBURGH,
  REGION_WESTMORELAND_COUNTY,
} from "./geo";

// Grant.collabOpportunitySubscribers is marked @deprecated / "under review" on
// the type itself (see types/grant.ts) - left empty here rather than wiring
// up a circular Grant <-> Initiative reference for a field that isn't
// currently exercised by any UI.
const NO_COLLAB_SUBSCRIBERS: Grant["collabOpportunitySubscribers"] = [];

export const GRANT_HEALTHY_NEIGHBORHOODS: Grant = {
  id: "g-healthy-neighborhoods",
  name: "Healthy Neighborhoods Mini-Grant",
  link: "https://pittsburghpa.gov/grants/healthy-neighborhoods-mini-grant",
  grantor: "Pittsburgh City Council",
  purpose:
    "Funds small, resident-led projects that improve health outcomes in Pittsburgh neighborhoods with the highest rates of chronic disease.",
  issues: ["Health", "Community"],
  targetRegions: [REGION_PITTSBURGH],
  award: {
    totalAmount: 60000,
    annualAmount: 30000,
    benefits: [
      "Technical assistance from the City Health Department",
      "Access to a peer cohort of past awardees",
    ],
  },
  requirements: {
    eligibility: [
      "Applicant must be a 501(c)(3) nonprofit or a project fiscally sponsored by a registered nonprofit",
      "Proposed work must take place within Pittsburgh city limits",
      "Applicant must have operated for at least one full year",
    ],
    application: [
      "Complete the online application form",
      "Submit a project budget not to exceed $30,000 per year",
      "Provide two letters of community support",
    ],
    awardee: [
      "Attend the quarterly grantee convening",
      "Display City of Pittsburgh acknowledgment on program materials",
    ],
    reporting: [
      {
        shortName: "Mid-year update",
        statement: "Submit a mid-year progress update.",
        question: "Have you submitted a mid-year progress update?",
      },
      {
        shortName: "Final impact report",
        statement:
          "Submit a final impact report within 60 days of award term end.",
        question:
          "Have you submitted a final impact report within 60 days of the award term end?",
      },
    ],
  },
  guidance: {
    application: [
      "Lead with the specific neighborhood health disparity your project addresses and cite a data source",
      "Show how residents helped design the project, not just receive it",
    ],
    reporting: [
      "Pair any output counts (events held, people served) with at least one outcome measure",
      "Include a short participant quote alongside your data",
    ],
  },
  timeline: {
    applicationWindowStart: new Date("2026-08-01T00:00:00Z"),
    applicationWindowEnd: new Date("2026-09-30T23:59:59Z"),
    notificationDate: new Date("2026-10-15T00:00:00Z"),
    awardTerm: 24,
    awardEndDate: new Date("2028-12-31T23:59:59Z"),
    firstReportDeadline: new Date("2027-04-15T00:00:00Z"),
    reportFrequency: 6,
  },
  collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
  isRecommended: true,
};

export const GRANT_FOOD_ACCESS: Grant = {
  id: "g-food-access",
  name: "Neighborhood Food Access Grant",
  link: "https://hungerfreepa.org/grants/neighborhood-food-access",
  grantor: "Hunger-Free PA",
  purpose:
    "Supports community organizations working to close the gap between where people live and where they can buy fresh, affordable food.",
  issues: ["Food Security", "Health"],
  targetRegions: [REGION_ALLEGHENY_COUNTY],
  award: {
    totalAmount: 35000,
    annualAmount: 35000,
    benefits: ["Bulk-purchasing partnership with regional food bank"],
  },
  requirements: {
    eligibility: [
      "Applicant must serve a census tract designated as a food desert by the USDA",
      "Applicant must be a 501(c)(3) nonprofit or fiscally sponsored community project",
    ],
    application: [
      "Complete the online application form",
      "Submit a one-year program budget",
      "Describe existing partnerships with local food producers or distributors",
    ],
    awardee: [
      "Track pounds of produce distributed monthly",
      "Participate in the annual grantee site visit",
    ],
    reporting: [
      {
        shortName: "Annual impact report",
        statement:
          "Submit one annual impact report at the end of the award term.",
        question:
          "Have you submitted one annual impact report at the end of the award term?",
      },
    ],
  },
  guidance: {
    application: [
      "Quantify the food access gap in your service area using a named data source",
      "Explain your distribution model end-to-end, from sourcing to the resident's table",
    ],
    reporting: [
      "Report both reach (households served) and frequency (visits per household)",
      "Note any supply chain or seasonal challenges and how you adapted",
    ],
  },
  timeline: {
    applicationWindowStart: new Date("2026-09-01T00:00:00Z"),
    applicationWindowEnd: new Date("2026-10-31T23:59:59Z"),
    notificationDate: new Date("2026-12-01T00:00:00Z"),
    awardTerm: 12,
    awardEndDate: new Date("2027-11-30T23:59:59Z"),
    firstReportDeadline: new Date("2027-12-01T00:00:00Z"),
    reportFrequency: 12,
  },
  collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
  isRecommended: true,
};

export const GRANT_YOUTH_DIGITAL_WELLNESS: Grant = {
  id: "g-youth-digital-wellness",
  name: "Youth Digital Wellness Grant",
  link: "https://grable.org/grants/youth-digital-wellness",
  grantor: "Grable Foundation",
  purpose:
    "Supports programs that build young people's digital literacy and healthy relationships with technology outside the classroom.",
  issues: ["Youth", "Technology"],
  targetRegions: [REGION_PITTSBURGH],
  award: {
    totalAmount: 25000,
    annualAmount: 25000,
    benefits: ["Free seats at Grable's annual youth-tech convening"],
  },
  requirements: {
    eligibility: [
      "Applicant must primarily serve youth ages 10-18",
      "Applicant must be a 501(c)(3) nonprofit or fiscally sponsored project",
    ],
    application: [
      "Complete the online application form",
      "Submit a curriculum outline or program plan",
      "Include one staff bio relevant to digital literacy instruction",
    ],
    awardee: ["Submit youth participation counts each quarter"],
    reporting: [
      {
        shortName: "Final report",
        statement: "Submit a final report within 45 days of award term end.",
        question:
          "Have you submitted a final report within 45 days of the award term end?",
      },
    ],
  },
  guidance: {
    application: [
      "Describe how the program balances digital skill-building with screen-time wellness",
      "Name the specific age group and how activities are developmentally appropriate",
    ],
    reporting: [
      "Include a pre/post skills or confidence measure if you collected one",
      "Highlight any youth leadership within the program",
    ],
  },
  timeline: {
    applicationWindowStart: new Date("2026-09-15T00:00:00Z"),
    applicationWindowEnd: new Date("2026-11-01T23:59:59Z"),
    notificationDate: new Date("2026-12-01T00:00:00Z"),
    awardTerm: 12,
    awardEndDate: new Date("2027-12-31T23:59:59Z"),
    firstReportDeadline: new Date("2027-01-15T00:00:00Z"),
    reportFrequency: -1,
  },
  collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
  isRecommended: false,
};

export const GRANT_GREEN_SPACES: Grant = {
  id: "g-green-spaces",
  name: "Green Spaces & Climate Resilience Fund",
  link: "https://heinz.org/grants/green-spaces-climate-resilience",
  grantor: "Heinz Endowments",
  purpose:
    "Funds community-led projects that expand green space access and build neighborhood resilience to extreme heat and flooding.",
  issues: ["Environment", "Community"],
  targetRegions: [REGION_ALLEGHENY_COUNTY, REGION_WESTMORELAND_COUNTY],
  award: {
    totalAmount: 40000,
    annualAmount: 20000,
    benefits: [
      "Site design consultation from a landscape architecture partner",
      "Native plant stock donated by regional nursery partners",
    ],
  },
  requirements: {
    eligibility: [
      "Applicant must hold or have written permission to use the proposed site",
      "Applicant must be a 501(c)(3) nonprofit or fiscally sponsored community project",
    ],
    application: [
      "Complete the online application form",
      "Submit a site plan or sketch of the proposed green space",
      "Submit a two-year maintenance plan",
    ],
    awardee: [
      "Host at least one public planting or stewardship event per year",
      "Submit quarterly site photos",
    ],
    reporting: [
      {
        shortName: "Mid-year update",
        statement: "Submit a mid-year update.",
        question: "Have you submitted a mid-year update?",
      },
      {
        shortName: "Final impact report",
        statement:
          "Submit a final impact report within 60 days of award term end.",
        question:
          "Have you submitted a final impact report within 60 days of the award term end?",
      },
    ],
  },
  guidance: {
    application: [
      "Show how the site addresses a specific climate risk (heat, flooding, air quality) with data",
      "Describe the long-term stewardship plan beyond the funded period",
    ],
    reporting: [
      "Include before/after site photos alongside any environmental measures",
      "Note volunteer hours contributed as an in-kind outcome",
    ],
  },
  timeline: {
    applicationWindowStart: new Date("2026-07-01T00:00:00Z"),
    applicationWindowEnd: new Date("2026-08-31T23:59:59Z"),
    notificationDate: new Date("2026-10-01T00:00:00Z"),
    awardTerm: 24,
    awardEndDate: new Date("2028-10-31T23:59:59Z"),
    firstReportDeadline: new Date("2027-05-01T00:00:00Z"),
    reportFrequency: 6,
  },
  collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
  isRecommended: false,
};

// A grant whose application window has already closed, so the closed-deadline
// handling has something real to act on.
export const GRANT_SENIOR_MOBILITY: Grant = {
  id: "g-senior-mobility",
  name: "Senior Mobility & Access Grant",
  link: "https://alleghenycounty.us/grants/senior-mobility-access",
  grantor: "Grable Foundation",
  purpose:
    "Funds neighborhood projects that help older adults move around safely and independently, from walkability fixes to volunteer ride programs.",
  issues: ["Health", "Community"],
  targetRegions: [REGION_ALLEGHENY_COUNTY],
  award: {
    totalAmount: 35000,
    annualAmount: 35000,
    benefits: [
      "Mobility audit support from a county planning partner",
      "Introductions to regional senior-services providers",
    ],
  },
  requirements: {
    eligibility: [
      "Applicant must serve adults aged 60 and over in Allegheny County",
      "Applicant must be a 501(c)(3) nonprofit or fiscally sponsored community project",
    ],
    application: [
      "Complete the online application form",
      "Submit a description of the mobility barrier you're addressing",
      "Submit letters of support from two community partners",
    ],
    awardee: [
      "Track the number of older adults served each quarter",
      "Submit a final narrative report",
    ],
    reporting: [
      {
        shortName: "Final report",
        statement: "Submit a final report within 30 days of award term end.",
        question:
          "Have you submitted a final report within 30 days of the award term end?",
      },
    ],
  },
  guidance: {
    application: [
      "Name the specific barrier (a broken sidewalk, a transit gap) rather than describing mobility in general",
      "Show how older adults themselves shaped the proposal",
    ],
    reporting: [
      "Report unique riders or participants, not total trips",
      "Include at least one participant story",
    ],
  },
  timeline: {
    applicationWindowStart: new Date("2026-02-01T00:00:00Z"),
    applicationWindowEnd: new Date("2026-07-15T23:59:59Z"),
    notificationDate: new Date("2026-09-01T00:00:00Z"),
    awardTerm: 12,
    awardEndDate: new Date("2027-09-30T23:59:59Z"),
    firstReportDeadline: new Date("2027-09-30T00:00:00Z"),
    reportFrequency: 12,
  },
  collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
  isRecommended: false,
};

/**
 * Builds a catalog grant from the handful of fields that actually differ between
 * them. The requirements and guidance below are the shape every funder in this
 * catalog asks for; the four hand-written grants above carry their own bespoke
 * copy because the flows quote them directly.
 */
function makeGrant(g: {
  id: string;
  name: string;
  grantor: Grant["grantor"];
  purpose: string;
  issues: Grant["issues"];
  regions?: Grant["targetRegions"];
  totalAmount: number;
  /** Application window close, ISO. Everything else is derived from it. */
  closes: string;
  opens?: string;
  /** Decision date, ISO. Defaults to ~6 weeks after close. */
  decidesOn?: string;
  awardTerm?: number;
  awardEnds?: string;
  firstReportDue?: string;
  reportFrequency?: number;
  isRecommended?: boolean;
}): Grant {
  const closes = new Date(g.closes);
  const plusMonths = (d: Date, m: number) => {
    const n = new Date(d);
    n.setMonth(n.getMonth() + m);
    return n;
  };
  const decidesOn = g.decidesOn
    ? new Date(g.decidesOn)
    : plusMonths(closes, 2);
  const awardTerm = g.awardTerm ?? 12;
  const awardEnds = g.awardEnds
    ? new Date(g.awardEnds)
    : plusMonths(decidesOn, awardTerm);
  return {
    id: g.id,
    name: g.name,
    link: `https://example.org/grants/${g.id}`,
    grantor: g.grantor,
    purpose: g.purpose,
    issues: g.issues,
    targetRegions: g.regions ?? [REGION_ALLEGHENY_COUNTY],
    award: {
      totalAmount: g.totalAmount,
      annualAmount: Math.round(g.totalAmount / Math.max(1, awardTerm / 12)),
      benefits: ["Access to the funder's grantee network"],
    },
    requirements: {
      eligibility: [
        "Applicant must be a 501(c)(3) nonprofit or fiscally sponsored community project",
        "Proposed work must take place in the funder's target region",
      ],
      application: [
        "Complete the online application form",
        "Submit a program budget",
        "Provide at least one letter of community support",
      ],
      awardee: ["Track participation for the funded programming"],
      reporting: [
        {
          shortName: "Final report",
          statement: "Submit a final report at the end of the award term.",
          question:
            "Have you submitted a final report at the end of the award term?",
        },
      ],
    },
    guidance: {
      application: [
        "Name the specific need you're addressing and cite a data source",
        "Show how the community shaped the work, not just received it",
      ],
      reporting: [
        "Pair output counts with at least one outcome measure",
        "Include a participant story alongside the numbers",
      ],
    },
    timeline: {
      applicationWindowStart: new Date(g.opens ?? plusMonths(closes, -2)),
      applicationWindowEnd: closes,
      notificationDate: decidesOn,
      awardTerm,
      awardEndDate: awardEnds,
      firstReportDeadline: g.firstReportDue
        ? new Date(g.firstReportDue)
        : plusMonths(awardEnds, 1),
      reportFrequency: g.reportFrequency ?? 12,
    },
    collabOpportunitySubscribers: NO_COLLAB_SUBSCRIBERS,
    isRecommended: g.isRecommended ?? false,
  };
}

/**
 * The open catalog behind Explore. Deadlines are spread across the coming year
 * so the countdown chips have every urgency band to show.
 */
export const CATALOG_GRANTS: Grant[] = [
  makeGrant({
    id: "g-clean-air",
    name: "Allegheny County Clean Air Innovation Grant",
    grantor: "Allegheny County Health Department",
    purpose:
      "Supports community-led air quality monitoring and pollution-reduction projects in neighborhoods with documented air-quality concerns.",
    issues: ["Environment", "Health"],
    totalAmount: 50000,
    closes: "2026-07-21T23:59:59Z",
    isRecommended: true,
  }),
  makeGrant({
    id: "g-vibrancy-fund",
    name: "Pittsburgh Community Vibrancy Fund",
    grantor: "New Sun Rising",
    purpose:
      "Supports community-grounded work that strengthens neighborhood vibrancy, from food access to youth programming to environmental stewardship.",
    issues: ["Community"],
    regions: [REGION_ALLEGHENY_COUNTY, REGION_WESTMORELAND_COUNTY],
    totalAmount: 60000,
    closes: "2026-07-27T23:59:59Z",
    isRecommended: true,
  }),
  makeGrant({
    id: "g-arts-culture",
    name: "POISE Community Arts & Culture Fund",
    grantor: "POISE Foundation",
    purpose:
      "Supports community arts, culture, and storytelling projects led by and for Black and historically underinvested communities.",
    issues: ["Community"],
    totalAmount: 30000,
    closes: "2026-08-05T23:59:59Z",
  }),
  makeGrant({
    id: "g-youth-dev",
    name: "Hillman Youth Development Grant",
    grantor: "Richard King Mellon Foundation",
    purpose:
      "Multi-year support for youth development organizations with demonstrated outcomes.",
    issues: ["Youth"],
    totalAmount: 75000,
    closes: "2026-08-12T23:59:59Z",
    awardTerm: 24,
    reportFrequency: 6,
  }),
  makeGrant({
    id: "g-mental-health",
    name: "Community Mental Health Access Fund",
    grantor: "Staunton Farm Foundation",
    purpose:
      "Funds programs that lower the barriers between neighbors and mental health support.",
    issues: ["Health"],
    totalAmount: 40000,
    closes: "2026-08-28T23:59:59Z",
  }),
  makeGrant({
    id: "g-digital-equity",
    name: "Digital Equity & Broadband Access Grant",
    grantor: "PNC Foundation",
    purpose:
      "Closes the connectivity gap through device access, training, and neighborhood wifi projects.",
    issues: ["Technology", "Community"],
    totalAmount: 45000,
    closes: "2026-09-10T23:59:59Z",
  }),
  makeGrant({
    id: "g-food-rescue",
    name: "Regional Food Rescue Partnership Grant",
    grantor: "Hunger-Free PA",
    purpose:
      "Supports organizations recovering surplus food and moving it to neighbors who need it.",
    issues: ["Food Security"],
    totalAmount: 28000,
    closes: "2026-09-18T23:59:59Z",
  }),
  makeGrant({
    id: "g-housing-stability",
    name: "Housing Stability Innovation Fund",
    grantor: "Allegheny County DHS",
    purpose:
      "Funds work that keeps families housed, from eviction prevention to tenant organizing.",
    issues: ["Community"],
    totalAmount: 65000,
    closes: "2026-09-25T23:59:59Z",
  }),
  makeGrant({
    id: "g-early-literacy",
    name: "Early Literacy Partnership Grant",
    grantor: "Grable Foundation",
    purpose:
      "Supports out-of-school literacy programming for children from birth to age eight.",
    issues: ["Youth"],
    totalAmount: 35000,
    closes: "2026-10-08T23:59:59Z",
  }),
  makeGrant({
    id: "g-riverfront",
    name: "Riverfront Restoration & Green Jobs Fund",
    grantor: "Heinz Endowments",
    purpose:
      "Restores riverfront land while training residents for green-economy careers.",
    issues: ["Environment"],
    totalAmount: 80000,
    closes: "2026-10-20T23:59:59Z",
    awardTerm: 24,
    reportFrequency: 6,
  }),
  makeGrant({
    id: "g-immigrant-services",
    name: "Immigrant & Refugee Family Services Grant",
    grantor: "The Pittsburgh Foundation",
    purpose:
      "Funds language access, navigation, and cultural connection for immigrant families.",
    issues: ["Community"],
    totalAmount: 42000,
    closes: "2026-11-05T23:59:59Z",
  }),
  makeGrant({
    id: "g-senior-nutrition",
    name: "Senior Nutrition & Congregate Meals Grant",
    grantor: "Allegheny County DHS",
    purpose:
      "Supports meal programs that keep older adults nourished and connected.",
    issues: ["Food Security", "Health"],
    totalAmount: 30000,
    closes: "2026-11-18T23:59:59Z",
  }),
  makeGrant({
    id: "g-workforce",
    name: "Neighborhood Workforce Pathways Fund",
    grantor: "Richard King Mellon Foundation",
    purpose:
      "Backs training-to-placement pipelines rooted in a specific neighborhood.",
    issues: ["Community"],
    totalAmount: 90000,
    closes: "2026-12-01T23:59:59Z",
    awardTerm: 24,
  }),
  makeGrant({
    id: "g-maker-stem",
    name: "Youth Maker & STEM Access Grant",
    grantor: "Grable Foundation",
    purpose:
      "Opens doors to making, technology, and STEM careers for young people.",
    issues: ["Youth", "Technology"],
    totalAmount: 32000,
    closes: "2026-12-15T23:59:59Z",
  }),
  makeGrant({
    id: "g-urban-farm",
    name: "Urban Agriculture Growth Grant",
    grantor: "Hunger-Free PA",
    purpose:
      "Funds community gardens, urban farms, and the infrastructure that keeps them producing.",
    issues: ["Food Security", "Environment"],
    totalAmount: 26000,
    closes: "2027-01-15T23:59:59Z",
  }),
  makeGrant({
    id: "g-safe-passage",
    name: "Safe Passage & Neighborhood Walkability Grant",
    grantor: "Pittsburgh City Council",
    purpose:
      "Improves the routes neighbors walk every day, from lighting to crossings to street trees.",
    issues: ["Community", "Health"],
    regions: [REGION_PITTSBURGH],
    totalAmount: 38000,
    closes: "2027-02-01T23:59:59Z",
  }),
];

/**
 * Grants seeded into a specific lifecycle state so every edge case on the board
 * has something real behind it. Their statuses are set in the store's default
 * `grantStatus`; the dates here are what put them in each state.
 */
export const GRANT_ARTS_MICROGRANT = makeGrant({
  id: "g-arts-microgrant",
  name: "Community Arts Microgrant",
  grantor: "POISE Foundation",
  purpose: "Small grants for neighborhood arts programming led by residents.",
  issues: ["Community"],
  totalAmount: 8000,
  closes: "2025-05-30T23:59:59Z",
});

export const GRANT_SAFETY_INNOVATION = makeGrant({
  id: "g-safety-innovation",
  name: "Neighborhood Safety Innovation Fund",
  grantor: "Heinz Endowments",
  purpose:
    "Funds resident-designed approaches to neighborhood safety that don't rely on policing.",
  issues: ["Community"],
  totalAmount: 45000,
  closes: "2025-04-15T23:59:59Z",
});

export const GRANT_SUMMER_YOUTH = makeGrant({
  id: "g-summer-youth",
  name: "Summer Youth Programming Grant",
  grantor: "Grable Foundation",
  purpose:
    "Supports summer programming that keeps young people engaged and connected.",
  issues: ["Youth"],
  totalAmount: 25000,
  closes: "2025-03-01T23:59:59Z",
});

/** Withdrawn: the user pulled this application before the window closed. */
export const GRANT_CIVIC_TECH = makeGrant({
  id: "g-civic-tech",
  name: "Civic Tech Prototyping Fund",
  grantor: "PNC Foundation",
  purpose:
    "Seeds small technology prototypes built with, not for, the neighborhoods they serve.",
  issues: ["Technology", "Community"],
  totalAmount: 15000,
  closes: "2025-09-30T23:59:59Z",
});

/** Submitted, and the funder's decision date has already passed. */
export const GRANT_PARKS_ACCESS = makeGrant({
  id: "g-parks-access",
  name: "Parks & Recreation Access Grant",
  grantor: "The Pittsburgh Foundation",
  purpose:
    "Expands access to parks and recreation for neighborhoods with the least green space.",
  issues: ["Environment", "Community"],
  totalAmount: 33000,
  closes: "2026-05-01T23:59:59Z",
  decidesOn: "2026-06-30T23:59:59Z",
});

/** Awarded, with a final report already overdue. */
export const GRANT_WELLNESS_PILOT = makeGrant({
  id: "g-wellness-pilot",
  name: "Community Wellness Pilot Grant",
  grantor: "Staunton Farm Foundation",
  purpose:
    "One-year pilots that bring wellness programming into everyday neighborhood spaces.",
  issues: ["Health"],
  totalAmount: 20000,
  closes: "2025-01-31T23:59:59Z",
  decidesOn: "2025-03-01T00:00:00Z",
  awardEnds: "2026-03-01T23:59:59Z",
  firstReportDue: "2026-06-15T23:59:59Z",
  reportFrequency: 0,
});

/** Awarded, multi-report: one report done, the next one due soon. */
export const GRANT_NEIGHBORHOOD_HEALTH = makeGrant({
  id: "g-neighborhood-health",
  name: "Neighborhood Health Partners Grant",
  grantor: "Allegheny County Health Department",
  purpose:
    "Two-year support for organizations embedding health services in trusted community settings.",
  issues: ["Health", "Community"],
  totalAmount: 70000,
  closes: "2025-06-30T23:59:59Z",
  decidesOn: "2025-08-15T00:00:00Z",
  awardTerm: 24,
  awardEnds: "2027-08-15T23:59:59Z",
  firstReportDue: "2026-02-15T23:59:59Z",
  reportFrequency: 6,
});

export const ALL_GRANTS: Grant[] = [
  GRANT_HEALTHY_NEIGHBORHOODS,
  GRANT_FOOD_ACCESS,
  GRANT_YOUTH_DIGITAL_WELLNESS,
  GRANT_GREEN_SPACES,
  GRANT_SENIOR_MOBILITY,
  GRANT_PARKS_ACCESS,
  GRANT_WELLNESS_PILOT,
  GRANT_NEIGHBORHOOD_HEALTH,
  GRANT_ARTS_MICROGRANT,
  GRANT_SAFETY_INNOVATION,
  GRANT_SUMMER_YOUTH,
  GRANT_CIVIC_TECH,
  ...CATALOG_GRANTS,
];
