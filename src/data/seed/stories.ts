// Success-story content shown on the Landing page. This is page copy, not
// part of the shared domain model in `types/`, so it gets its own local
// shape here rather than trying to force it into Initiative/Grant.
export type Story = {
  id: string;
  who: string;
  what: string;
  tag: string;
  org: string;
  grant: string;
  quote: string;
  person: string;
  body: string[];
  // Placeholder "photo" for the story card and detail header: an emoji on a
  // tinted gradient band. Real photography would replace this later.
  emoji: string;
};

export const STORIES: Story[] = [
  {
    id: "s-northview-gardens",
    who: "Northview Gardens",
    what: "turned last season's outcome report into a renewal, winning a second year of funding from the same funder.",
    tag: "Reporting",
    org: "Northview Gardens",
    grant: "Neighborhood Food Access Grant",
    emoji: "🌱",
    quote:
      "The report practically wrote itself from records we already had, and the funder renewed us for another year on the strength of it.",
    person: "Dana Okafor, Program Director",
    body: [
      "Northview Gardens runs a community growing space and weekly produce stand in Northview Heights. For years, their end-of-grant reports were assembled by hand from spreadsheets, sign-in sheets, and whatever the program director could remember from the season.",
      "When their Neighborhood Food Access Grant reporting deadline came up, they used the Vibrant Grants report flow instead. The tool walked them through the same four questions every funder asks (commitment, events run, community served, outcomes) and surfaced supporting data from both their own uploaded records and the Vibrancy Index.",
      "The final report paired their raw counts with county-level context they'd never had time to research. The funder was impressed enough to renew the grant, giving Northview Gardens a second year of funding without a fresh application.",
    ],
  },
  {
    id: "s-beltzhoover-together",
    who: "Beltzhoover Together",
    what: "found a collaborator through the Vibrant Grants and, applying together, won the $40,000 Green Spaces & Climate Resilience Fund.",
    tag: "Collaboration",
    org: "Beltzhoover Together",
    grant: "Green Spaces & Climate Resilience Fund",
    emoji: "🤝",
    quote:
      "We'd never have found each other cold. The collaboration feature gave us a reason to reach out, and together we won a grant neither of us could have landed alone.",
    person: "Marcus Webb, Executive Director",
    body: [
      "Beltzhoover Together had a green-space proposal that was strong on community buy-in but thin on technical planning experience.",
      "Browsing the collaborators for the Green Spaces & Climate Resilience Fund, they found Allegheny Commons Alliance, an organization with overlapping funders and a nearby service area that had the exact landscape-planning experience they lacked. They sent a warm introduction through Vibrant Grants and set up a call.",
      "The two organizations co-applied and were awarded the $40,000 grant three months later. What started as a shared-connection signal turned into a partnership that secured funding for both.",
    ],
  },
  {
    id: "s-east-end-youth-lab",
    who: "East End Youth Lab",
    what: "found the Youth Digital Wellness Grant through Vibrant Grants and won it, funding a whole new after-school cohort.",
    tag: "Finding grants",
    org: "East End Youth Lab",
    grant: "Youth Digital Wellness Grant",
    emoji: "💻",
    quote:
      "I typed in what we actually do, in plain language, and it surfaced a grant we went on to win, one I'd never have found searching manually.",
    person: "Priya Chandrasekaran, Founder",
    body: [
      "East End Youth Lab is a two-person operation teaching coding and media literacy to teens after school. Grant research wasn't anyone's full-time job; it happened in stolen hours between programming.",
      "Using Vibrant Grants's search feature, they described their program in plain language and let the tool rank grants by fit instead of scrolling through a directory sorted by deadline. The Youth Digital Wellness Grant surfaced near the top, its eligibility criteria matching almost exactly.",
      "They applied, using Vibrant Grants to gather supporting evidence, and won. The award funded an entirely new after-school cohort for the following year.",
    ],
  },
];
