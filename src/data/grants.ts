import type Grant from "../../types/grant";
import type Initiative from "../../types/initiative";
import { REGIONS } from "./geo";

const d = (iso: string) => new Date(iso);

/**
 * Grant catalog. `collabOpportunitySubscribers` is left empty here and wired
 * up in {@link ./index} once Initiatives exist (the two types are mutually
 * referential).
 */
function makeGrant(
  partial: Omit<Grant, "collabOpportunitySubscribers"> & {
    collabOpportunitySubscribers?: Initiative[];
  },
): Grant {
  return { collabOpportunitySubscribers: [], ...partial };
}

export const GRANTS = {
  heinzFreshFood: makeGrant({
    id: "grant-heinz-fresh-food",
    link: "https://www.heinz.org/grants/fresh-food-access-initiative",
    grantor: "The Heinz Endowments",
    purpose:
      "Expand year-round access to affordable fresh food in Pittsburgh neighborhoods where the nearest full grocer is more than a half-mile away.",
    issues: ["Food Access & Security", "Health & Wellness", "Racial Equity"],
    targetRegions: [REGIONS.hazelwood, REGIONS.homewood, REGIONS.hilltop],
    award: {
      totalAmount: 120000,
      annualAmount: 60000,
      benefits: [
        "Two-year general operating support",
        "Cohort learning sessions with other food-access grantees",
        "Introductions to the Greater Pittsburgh Community Food Bank network",
      ],
    },
    requirements: {
      eligibility: [
        "501(c)(3) organization or a project fiscally sponsored by a recognized sponsor (New Sun Rising qualifies)",
        "Programming located in an identified low-food-access census tract in Allegheny County",
        "Annual operating budget under $500,000",
      ],
      application: [
        "Two-page narrative describing your food-access program and the community it serves",
        "Most recent operating budget and current-year projection",
        "At least one letter of community support",
        "Baseline data on residents currently reached",
      ],
      awardee: [
        "Participate in three cohort convenings per year",
        "Acknowledge The Heinz Endowments in public materials",
        "Maintain fresh-food programming for the full award term",
      ],
      reporting: [
        "Interim progress report at 12 months",
        "Final impact report at the close of the award term",
        "Report households reached and pounds of fresh produce distributed",
      ],
    },
    guidance: {
      application: [
        "Lead with the half-mile access gap in your service area — reviewers weight measurable need heavily.",
        "Tie your budget lines directly to the number of households you expect to reach.",
        "Name the specific tracts you serve rather than the neighborhood at large.",
      ],
      reporting: [
        "Show the trend in weekly attendance, not just a single total.",
        "Pair one participant story with the produce-distributed figure.",
      ],
    },
    timeline: {
      applicationWindowStart: d("2026-06-01T00:00:00Z"),
      applicationWindowEnd: d("2026-08-15T23:59:59Z"),
      notificationDate: d("2026-10-01T00:00:00Z"),
      awardTerm: 24,
      firstReportDeadline: d("2027-10-01T00:00:00Z"),
      reportFrequency: 12,
    },
    isRecommended: true,
  }),

  growPittsburgh: makeGrant({
    id: "grant-grow-pgh-urban-spaces",
    link: "https://www.growpittsburgh.org/community-fund/urban-growing-spaces",
    grantor: "Grow Pittsburgh Community Fund",
    purpose:
      "Turn vacant and underused land into productive community growing spaces led by neighborhood residents.",
    issues: ["Environment & Green Space", "Food Access & Security", "Community Safety"],
    targetRegions: [REGIONS.hazelwood, REGIONS.lawrenceville, REGIONS.braddock],
    award: {
      totalAmount: 25000,
      annualAmount: 25000,
      benefits: [
        "One-year project grant",
        "Soil testing and raised-bed materials at cost",
        "Technical assistance from Grow Pittsburgh field staff",
      ],
    },
    requirements: {
      eligibility: [
        "Community-based organization or fiscally sponsored project",
        "Site control (ownership, lease, or written permission) for the growing space",
        "Project located within Allegheny County",
      ],
      application: [
        "Project description and site plan",
        "Simple line-item budget",
        "Photos or a map of the proposed site",
      ],
      awardee: [
        "Host at least two open community work days",
        "Keep the growing space publicly accessible during the season",
      ],
      reporting: [
        "One end-of-season report with photos",
        "Number of residents engaged and beds established",
      ],
    },
    guidance: {
      application: [
        "Attach your soil-test intent — reviewers like to see you have thought about contamination on vacant land.",
        "Quantify the vacant parcels near your site to establish need.",
      ],
      reporting: [
        "Before/after photos of the lot carry as much weight as the numbers.",
      ],
    },
    timeline: {
      applicationWindowStart: d("2026-05-15T00:00:00Z"),
      applicationWindowEnd: d("2026-07-31T23:59:59Z"),
      notificationDate: d("2026-09-01T00:00:00Z"),
      awardTerm: 12,
      firstReportDeadline: d("2027-09-01T00:00:00Z"),
      reportFrequency: 0,
    },
    isRecommended: true,
  }),

  mellonGreenInfra: makeGrant({
    id: "grant-mellon-green-infra",
    link: "https://rkmf.org/grants/green-infrastructure-watersheds",
    grantor: "Richard King Mellon Foundation",
    purpose:
      "Fund green stormwater infrastructure and riparian restoration that improves watershed health in Western Pennsylvania.",
    issues: ["Environment & Green Space", "Clean Air & Climate"],
    targetRegions: [REGIONS.alleghenyCounty],
    award: {
      totalAmount: 250000,
      annualAmount: 125000,
      benefits: ["Two-year program support", "Access to the foundation's conservation network"],
    },
    requirements: {
      eligibility: [
        "501(c)(3) organization in good standing",
        "Demonstrated capacity to manage capital or green-infrastructure projects",
        "Project with a measurable watershed benefit",
      ],
      application: [
        "Full proposal with engineering or design partner named",
        "Three years of audited financials",
        "Project timeline and permitting plan",
      ],
      awardee: [
        "Provide a professional project-management contact",
        "Submit to a mid-term site visit",
      ],
      reporting: [
        "Semi-annual progress reports",
        "Final report with measured stormwater capture volumes",
      ],
    },
    guidance: {
      application: [
        "This funder expects a design or engineering partner — name yours explicitly.",
        "Frame canopy and permeable-surface gains against a county benchmark.",
      ],
      reporting: ["Quantify gallons of stormwater managed where you can."],
    },
    timeline: {
      applicationWindowStart: d("2026-03-01T00:00:00Z"),
      applicationWindowEnd: d("2026-06-30T23:59:59Z"),
      notificationDate: d("2026-08-15T00:00:00Z"),
      awardTerm: 24,
      firstReportDeadline: d("2027-02-15T00:00:00Z"),
      reportFrequency: 6,
    },
    isRecommended: false,
  }),

  pghFoundationVibrancy: makeGrant({
    id: "grant-pgh-foundation-vibrancy",
    link: "https://pittsburghfoundation.org/neighborhood-vibrancy",
    grantor: "The Pittsburgh Foundation",
    purpose:
      "Support resident-led projects that make a single neighborhood more vibrant — greener, more connected, and more welcoming.",
    issues: ["Environment & Green Space", "Community Safety", "Civic Engagement"],
    targetRegions: [REGIONS.hazelwood, REGIONS.cityOfPittsburgh],
    award: {
      totalAmount: 40000,
      annualAmount: 40000,
      benefits: ["One-year project grant", "Storytelling support from the foundation's comms team"],
    },
    requirements: {
      eligibility: [
        "Fiscally sponsored project or 501(c)(3)",
        "Resident leadership on the project team",
        "Project within the City of Pittsburgh",
      ],
      application: [
        "Project narrative and community-engagement plan",
        "Budget and match sources if any",
      ],
      awardee: [
        "Credit The Pittsburgh Foundation in signage and press",
        "Host one public celebration or open house",
      ],
      reporting: [
        "Single final report due within 30 days of project completion",
        "Report residents engaged, volunteer hours, and lots or spaces improved",
      ],
    },
    guidance: {
      application: [
        "Resident voice matters here — quote the people you serve.",
      ],
      reporting: [
        "Lead the report with the volunteer-hours figure and one strong story.",
        "Connect the green-space improvement back to the vibrancy goal in your award letter.",
      ],
    },
    timeline: {
      applicationWindowStart: d("2025-04-01T00:00:00Z"),
      applicationWindowEnd: d("2025-05-31T23:59:59Z"),
      notificationDate: d("2025-07-01T00:00:00Z"),
      awardTerm: 12,
      firstReportDeadline: d("2026-08-01T00:00:00Z"),
      reportFrequency: -1,
    },
    isRecommended: false,
  }),

  sproutMicrogrant: makeGrant({
    id: "grant-sprout-microgrant",
    link: "https://newsunrising.org/sprout-legacy/small-and-mighty",
    grantor: "Sprout Fund Legacy Program",
    purpose:
      "Fast, flexible microgrants for small community projects that spark connection and creativity on a block.",
    issues: ["Arts & Culture", "Civic Engagement", "Community Safety"],
    targetRegions: [REGIONS.cityOfPittsburgh],
    award: {
      totalAmount: 3000,
      annualAmount: 3000,
      benefits: ["One-time microgrant", "Peer showcase at the annual NSR gathering"],
    },
    requirements: {
      eligibility: [
        "Any community project with a fiscal sponsor",
        "Project completable within six months",
      ],
      application: ["Short online form", "One-paragraph project idea", "Simple budget"],
      awardee: ["Share three photos and a short reflection when done"],
      reporting: ["One lightweight wrap-up form"],
    },
    guidance: {
      application: ["Keep it concrete and joyful — this fund rewards a clear, doable idea."],
      reporting: ["A couple of photos and two sentences is genuinely enough."],
    },
    timeline: {
      applicationWindowStart: d("2026-01-01T00:00:00Z"),
      applicationWindowEnd: d("2026-12-15T23:59:59Z"),
      notificationDate: d("2026-08-01T00:00:00Z"),
      awardTerm: 6,
      firstReportDeadline: d("2027-02-01T00:00:00Z"),
      reportFrequency: 0,
    },
    isRecommended: false,
  }),

  poiseEquityFood: makeGrant({
    id: "grant-poise-equity-food",
    link: "https://poisefoundation.org/racial-equity-food-systems",
    grantor: "POISE Foundation",
    purpose:
      "Invest in Black-led work that builds a more just and self-determined food system in the Pittsburgh region.",
    issues: ["Racial Equity", "Food Access & Security", "Economic Opportunity"],
    targetRegions: [REGIONS.homewood, REGIONS.hazelwood, REGIONS.braddock],
    award: {
      totalAmount: 50000,
      annualAmount: 50000,
      benefits: ["One-year support", "Membership in POISE's Black-led leaders cohort"],
    },
    requirements: {
      eligibility: [
        "Black-led organization or project (majority Black board and leadership)",
        "Fiscally sponsored projects welcome",
        "Food-systems focus",
      ],
      application: [
        "Narrative on leadership and community accountability",
        "Budget and funding history",
      ],
      awardee: ["Participate in the leaders cohort", "Contribute to a shared learning report"],
      reporting: ["Mid-year check-in", "Final narrative and financial report"],
    },
    guidance: {
      application: [
        "Center leadership and governance — this funder invests in who, not only what.",
      ],
      reporting: ["Reflect on community accountability, not just outputs."],
    },
    timeline: {
      applicationWindowStart: d("2026-07-01T00:00:00Z"),
      applicationWindowEnd: d("2026-09-30T23:59:59Z"),
      notificationDate: d("2026-11-15T00:00:00Z"),
      awardTerm: 12,
      firstReportDeadline: d("2027-05-15T00:00:00Z"),
      reportFrequency: 6,
    },
    isRecommended: false,
  }),

  hillmanCleanAir: makeGrant({
    id: "grant-hillman-clean-air",
    link: "https://hillmanfamilyfoundations.org/clean-air-monitoring",
    grantor: "Hillman Family Foundations",
    purpose:
      "Equip residents to monitor local air quality and turn the data into neighborhood-level action.",
    issues: ["Clean Air & Climate", "Health & Wellness", "Civic Engagement"],
    targetRegions: [REGIONS.hazelwood, REGIONS.braddock, REGIONS.hilltop],
    award: {
      totalAmount: 35000,
      annualAmount: 35000,
      benefits: ["One-year grant", "Low-cost sensor kits and calibration support"],
    },
    requirements: {
      eligibility: [
        "Community organization or fiscally sponsored project",
        "Service area near an identified air-quality concern",
      ],
      application: [
        "Monitoring plan and community-engagement approach",
        "Budget including sensor maintenance",
      ],
      awardee: ["Publish readings openly", "Convene at least two community data-review sessions"],
      reporting: ["Quarterly data summaries", "Final report on readings and resident actions"],
    },
    guidance: {
      application: [
        "Connect your local PM2.5 average to the county benchmark to establish urgency.",
      ],
      reporting: ["Show the readings trend and what residents did with it."],
    },
    timeline: {
      applicationWindowStart: d("2026-08-01T00:00:00Z"),
      applicationWindowEnd: d("2026-10-31T23:59:59Z"),
      notificationDate: d("2026-12-15T00:00:00Z"),
      awardTerm: 12,
      firstReportDeadline: d("2027-04-01T00:00:00Z"),
      reportFrequency: 3,
    },
    isRecommended: true,
  }),

  alleghenyMainStreet: makeGrant({
    id: "grant-allegheny-main-street",
    link: "https://alleghenycounty.us/economic-development/main-street-revitalization",
    grantor: "Allegheny County Economic Development",
    purpose:
      "Revitalize neighborhood business districts through façade improvements, greening, and small-business support.",
    issues: ["Small Business & Main Streets", "Economic Opportunity", "Environment & Green Space"],
    targetRegions: [REGIONS.alleghenyCounty],
    award: {
      totalAmount: 75000,
      annualAmount: 75000,
      benefits: ["Reimbursement-based project grant", "County technical assistance"],
    },
    requirements: {
      eligibility: [
        "Organization working in a designated business district",
        "Ability to manage reimbursement-based funding",
      ],
      application: [
        "Scope of work and district map",
        "Budget with match documentation",
        "Letters from participating businesses",
      ],
      awardee: ["Comply with county procurement rules", "Document match spending"],
      reporting: ["Reimbursement requests with receipts", "Final close-out report"],
    },
    guidance: {
      application: [
        "This is reimbursement-based — show you can front costs and track receipts.",
      ],
      reporting: ["Keep receipts organized from day one; the close-out mirrors them."],
    },
    timeline: {
      applicationWindowStart: d("2026-02-01T00:00:00Z"),
      applicationWindowEnd: d("2026-05-15T23:59:59Z"),
      notificationDate: d("2026-07-15T00:00:00Z"),
      awardTerm: 18,
      firstReportDeadline: d("2027-01-15T00:00:00Z"),
      reportFrequency: 6,
    },
    isRecommended: false,
  }),
} satisfies Record<string, Grant>;

export type GrantKey = keyof typeof GRANTS;
