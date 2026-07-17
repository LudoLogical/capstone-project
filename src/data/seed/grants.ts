import type Grant from "@/types/grant";
import {
  REGION_ALLEGHENY_COUNTY,
  REGION_PITTSBURGH,
  REGION_WESTMORELAND_COUNTY,
} from "./geo";

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
    firstReportDeadline: new Date("2027-04-15T00:00:00Z"),
    reportFrequency: 6,
  },
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
        shortName: "Funded commitments",
        statement:
          "State in your annual impact report the program activities you committed to delivering with this award.",
        question: "What did you commit to doing with this grant?",
      },
      {
        shortName: "Distribution activity",
        statement:
          "List in your annual impact report the distribution events and activities you ran during the award term.",
        question: "What events or activities did you run?",
      },
      {
        shortName: "Households reached",
        statement:
          "Report in your annual impact report the number of households your distribution reached and the neighborhoods in which they live.",
        question: "Who did this work reach?",
      },
      {
        shortName: "Access outcomes",
        statement:
          "Report in your annual impact report the change in fresh food access that resulted from the funded work.",
        question: "What changed as a result of this work?",
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
    firstReportDeadline: new Date("2027-12-01T00:00:00Z"),
    reportFrequency: 12,
  },
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
    firstReportDeadline: new Date("2027-01-15T00:00:00Z"),
    reportFrequency: -1,
  },
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
    firstReportDeadline: new Date("2027-05-01T00:00:00Z"),
    reportFrequency: 6,
  },
  isRecommended: false,
};

export const ALL_GRANTS: Grant[] = [
  GRANT_HEALTHY_NEIGHBORHOODS,
  GRANT_FOOD_ACCESS,
  GRANT_YOUTH_DIGITAL_WELLNESS,
  GRANT_GREEN_SPACES,
];
