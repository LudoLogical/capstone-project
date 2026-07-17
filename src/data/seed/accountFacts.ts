// "Grant-readiness" content for the Account Profile screen - org facts
// grouped by the questions every funder asks (the Vibrant Communities
// Framework), not by record type. This is page content, not part of the
// shared domain model in `types/`.
import {
  House,
  Target,
  Calendar,
  Wrench,
  Footprints,
  Salad,
  TrendingUp,
  Users,
  Repeat,
  Handshake,
  MapPin,
  Link,
  DollarSign,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type AccountFact = {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  tags: ("Write" | "Report")[];
  updated: string;
};

export type AccountSection = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  pct: number;
  facts: AccountFact[];
};

export const ACCOUNT_ORG_NAME = "Hilltop Wellness Collective";

export const ACCOUNT_SECTIONS: AccountSection[] = [
  {
    id: "about-us",
    pct: 100,
    icon: House,
    title: "About Us",
    subtitle: "Who you are, and how long you've been doing this work",
    facts: [
      {
        id: "fact-mission",
        icon: Target,
        title: "Mission statement",
        body: "Hilltop Wellness Collective builds resident-led health and wellness programming in Pittsburgh's Hilltop neighborhoods.",
        tags: ["Write"],
        updated: "Feb 2026",
      },
      {
        id: "fact-founded",
        icon: Calendar,
        title: "Founded",
        body: "2017, as a fiscally sponsored project of New Sun Rising. Became an independent 501(c)(3) in 2021.",
        tags: ["Write"],
        updated: "Feb 2026",
      },
    ],
  },
  {
    id: "what-we-do",
    pct: 100,
    icon: Wrench,
    title: "What We Do",
    subtitle: "Your programs and how they run",
    facts: [
      {
        id: "fact-walking-groups",
        icon: Footprints,
        title: "Neighborhood walking groups",
        body: "Weekly resident-led walking groups across four Hilltop blocks, paired with blood-pressure screening every other session.",
        tags: ["Write", "Report"],
        updated: "Jan 2026",
      },
      {
        id: "fact-nutrition-workshops",
        icon: Salad,
        title: "Nutrition workshops",
        body: "Monthly cooking demonstrations using produce from Hilltop Harvest Collective's mobile stand.",
        tags: ["Write", "Report"],
        updated: "Jan 2026",
      },
    ],
  },
  {
    id: "our-results",
    pct: 80,
    icon: TrendingUp,
    title: "Our Results",
    subtitle: "What your programs have produced so far",
    facts: [
      {
        id: "fact-residents-reached",
        icon: Users,
        title: "Residents reached",
        body: "1,240 unique residents served across all programs in 2025.",
        tags: ["Report"],
        updated: "Jul 2026",
      },
      {
        id: "fact-retention",
        icon: Repeat,
        title: "Program retention",
        body: "68% of program participants returned for a second season.",
        tags: ["Report"],
        updated: "Jul 2026",
      },
    ],
  },
  {
    id: "who-we-serve",
    pct: 90,
    icon: Handshake,
    title: "Who We Serve & Work With",
    subtitle: "Your service area, partners, and the population you support",
    facts: [
      {
        id: "fact-service-area",
        icon: MapPin,
        title: "Service area",
        body: "Hilltop neighborhoods within the City of Pittsburgh: Mount Oliver, Knoxville, St. Clair, and Bon Air.",
        tags: ["Write"],
        updated: "Feb 2026",
      },
      {
        id: "fact-partners",
        icon: Link,
        title: "Key partners",
        body: "Hilltop Harvest Collective (produce sourcing), Allegheny County Health Department (screening equipment loan).",
        tags: ["Write"],
        updated: "Mar 2026",
      },
    ],
  },
  {
    id: "what-were-asking-for",
    pct: 60,
    icon: DollarSign,
    title: "What We're Asking For",
    subtitle: "Budget, funding gaps, and the case for support",
    facts: [
      {
        id: "fact-budget",
        icon: BarChart3,
        title: "Annual operating budget",
        body: "$420,000, of which roughly 60% is currently grant-funded.",
        tags: ["Write"],
        updated: "Mar 2026",
      },
    ],
  },
];

export const ACCOUNT_READINESS = 86;
export const ACCOUNT_LOWEST_SECTION = "What We're Asking For";
export const ACCOUNT_LOWEST_HINT = "add matching-funds information to round this out";
